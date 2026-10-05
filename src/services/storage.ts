import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { authService } from './authService';
import { dbService } from './db';
import { MediaAsset } from '../types/database';

export interface UploadMediaResult {
  url: string;
  name: string;
  size: number;
  type: 'image' | 'document';
  category: 'profile' | 'certificates' | 'projects' | 'resumes' | 'general';
}

const IDB_NAME = 'veera_portfolio_storage';
const IDB_STORE = 'media_store';
const IDB_VERSION = 1;

// In-memory cache for resolved object URLs to prevent redundant IndexedDB reads
const objectUrlCache = new Map<string, string>();

// Initialize IndexedDB database for resilient local/offline media storage
function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this environment.'));
    }
    const request = window.indexedDB.open(IDB_NAME, IDB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveToIDB(record: { id: string; name: string; mimeType: string; blob: Blob; createdAt: string }): Promise<void> {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function getFromIDB(id: string): Promise<{ id: string; name: string; mimeType: string; blob: Blob } | null> {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const store = tx.objectStore(IDB_STORE);
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function deleteFromIDB(id: string): Promise<void> {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Optimizes raster images down to specified dimensions and WebP/JPEG format using Canvas.
 */
async function optimizeImage(file: File, maxWidth: number, maxHeight: number): Promise<{ blob: Blob; mimeType: string }> {
  if (file.type === 'image/svg+xml' || file.type === 'application/pdf') {
    return { blob: file, mimeType: file.type };
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ blob, mimeType: 'image/webp' });
            } else {
              resolve({ blob: file, mimeType: file.type });
            }
          },
          'image/webp',
          0.85
        );
      } else {
        resolve({ blob: file, mimeType: file.type });
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ blob: file, mimeType: file.type });
    };
    img.src = objectUrl;
  });
}

export const storageService = {
  /**
   * Validates file format and size based on asset category.
   */
  validateFile(file: File, category: 'profile' | 'certificates' | 'projects' | 'resumes' | 'general'): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'No file provided.' };
    }

    if (category === 'profile') {
      const allowedProfileTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
      if (!allowedProfileTypes.includes(file.type)) {
        return { valid: false, error: 'Profile photo must be an image (JPEG, PNG, WebP, or SVG).' };
      }
      if (file.size > 5 * 1024 * 1024) {
        return { valid: false, error: 'Profile photo exceeds 5MB size limit.' };
      }
    } else if (category === 'certificates') {
      const allowedCertTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedCertTypes.includes(file.type)) {
        return { valid: false, error: 'Certificate must be a PDF document or image (JPEG, PNG, WebP).' };
      }
      if (file.size > 10 * 1024 * 1024) {
        return { valid: false, error: 'Certificate file exceeds 10MB size limit.' };
      }
    } else if (category === 'resumes') {
      const allowedDocTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      if (!allowedDocTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|txt)$/i)) {
        return { valid: false, error: 'Resume must be a PDF document (.pdf, .doc, .docx).' };
      }
      if (file.size > 15 * 1024 * 1024) {
        return { valid: false, error: 'Resume file exceeds 15MB size limit.' };
      }
    } else {
      if (file.size > 15 * 1024 * 1024) {
        return { valid: false, error: 'File exceeds 15MB size limit.' };
      }
    }

    return { valid: true };
  },

  /**
   * Securely uploads a media file.
   * Requires authenticated session (owner).
   * Saves to Supabase Storage if configured; otherwise persists to IndexedDB.
   * Registers asset in the centralized Media Library.
   */
  async uploadMedia(
    file: File,
    category: 'profile' | 'certificates' | 'projects' | 'resumes' | 'general'
  ): Promise<UploadMediaResult> {
    // 1. Strict Authentication Check
    const session = await authService.getSession();
    if (!session.isAuthenticated) {
      throw new Error('Unauthorized: Only authenticated owner can upload media assets.');
    }

    // 2. Validate file
    const validation = this.validateFile(file, category);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid file.');
    }

    // 3. Optimize image where appropriate
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';
    const maxWidth = category === 'profile' ? 800 : 1600;
    const maxHeight = category === 'profile' ? 800 : 1600;

    const { blob, mimeType } = await optimizeImage(file, maxWidth, maxHeight);

    const fileExt = isPdf ? 'pdf' : (mimeType === 'image/webp' ? 'webp' : (file.name.split('.').pop() || 'png'));
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const assetId = `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const storagePath = `${category}/${assetId}.${fileExt}`;

    let resultingUrl = '';

    // 4. Supabase Storage Attempt
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error: uploadError } = await supabase.storage
          .from('portfolio-media')
          .upload(storagePath, blob, {
            contentType: mimeType,
            upsert: true,
            cacheControl: '3600'
          });

        if (!uploadError) {
          const { data: publicData } = supabase.storage
            .from('portfolio-media')
            .getPublicUrl(storagePath);

          if (publicData?.publicUrl) {
            resultingUrl = publicData.publicUrl;
          }
        } else {
          console.warn('Supabase storage upload failed, falling back to local media store:', uploadError);
        }
      } catch (err) {
        console.warn('Supabase storage exception, using local store:', err);
      }
    }

    // 5. Fallback to Local IndexedDB Storage
    if (!resultingUrl) {
      await saveToIDB({
        id: assetId,
        name: safeName,
        mimeType,
        blob,
        createdAt: new Date().toISOString()
      });

      const objectUrl = URL.createObjectURL(blob);
      objectUrlCache.set(assetId, objectUrl);
      objectUrlCache.set(`idb://${assetId}`, objectUrl);

      // Store clean storage reference/path in database
      resultingUrl = `idb://${assetId}`;
    }

    // 6. Register Media Asset in Centralized Media Library
    const mediaAsset: MediaAsset = {
      id: assetId,
      name: safeName,
      type: isPdf ? 'document' : 'image',
      category,
      url: resultingUrl,
      size: blob.size,
      created_at: new Date().toISOString()
    };

    try {
      await dbService.addMediaAsset(mediaAsset);
    } catch (err) {
      console.warn('Failed to register media asset in catalog', err);
    }

    return {
      url: resultingUrl,
      name: safeName,
      size: blob.size,
      type: isPdf ? 'document' : 'image',
      category
    };
  },

  /**
   * Resolves any stored URL/reference (e.g. `idb://...` or standard http/https) into a displayable browser URL.
   */
  async resolveMediaUrl(url: string | undefined | null): Promise<string> {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }

    if (url.startsWith('idb://')) {
      const assetId = url.replace('idb://', '');
      if (objectUrlCache.has(assetId)) {
        return objectUrlCache.get(assetId)!;
      }
      try {
        const item = await getFromIDB(assetId);
        if (item?.blob) {
          const objUrl = URL.createObjectURL(item.blob);
          objectUrlCache.set(assetId, objUrl);
          return objUrl;
        }
      } catch (err) {
        console.warn('Failed to resolve IDB media asset:', err);
      }
    }

    return url;
  },

  /**
   * Synchronously inspects in-memory cache for immediate render.
   */
  getCachedMediaUrl(url: string | undefined | null): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }
    if (url.startsWith('idb://')) {
      const assetId = url.replace('idb://', '');
      return objectUrlCache.get(assetId) || url;
    }
    return url;
  },

  /**
   * Deletes a media asset from storage.
   * Requires authenticated session.
   */
  async deleteMedia(url: string): Promise<void> {
    const session = await authService.getSession();
    if (!session.isAuthenticated) {
      throw new Error('Unauthorized: Only authenticated owner can delete media assets.');
    }

    if (!url) return;

    if (url.startsWith('idb://')) {
      const assetId = url.replace('idb://', '');
      const cached = objectUrlCache.get(assetId);
      if (cached) {
        URL.revokeObjectURL(cached);
        objectUrlCache.delete(assetId);
      }
      await deleteFromIDB(assetId);
    } else if (isSupabaseConfigured() && supabase && url.includes('portfolio-media')) {
      try {
        const parts = url.split('portfolio-media/');
        if (parts[1]) {
          await supabase.storage.from('portfolio-media').remove([parts[1]]);
        }
      } catch (err) {
        console.warn('Supabase storage delete failed:', err);
      }
    }
  }
};

import { useState, useEffect } from 'react';

/**
 * React hook that resolves any media reference (http, https, blob, or idb://)
 * into a live, displayable URL with zero boilerplate.
 */
export function useResolvedMediaUrl(rawUrl: string | undefined | null): string {
  const [resolved, setResolved] = useState<string>(() => storageService.getCachedMediaUrl(rawUrl));

  useEffect(() => {
    let isMounted = true;
    if (!rawUrl) {
      setResolved('');
      return;
    }

    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://') || rawUrl.startsWith('data:') || rawUrl.startsWith('blob:')) {
      setResolved(rawUrl);
      return;
    }

    storageService.resolveMediaUrl(rawUrl).then((url) => {
      if (isMounted) setResolved(url);
    });

    return () => {
      isMounted = false;
    };
  }, [rawUrl]);

  return resolved;
}

