import React, { useState, useEffect, useRef } from 'react';
import { dbService } from '../../services/db';
import { storageService, useResolvedMediaUrl } from '../../services/storage';
import { MediaAsset } from '../../types/database';
import { 
  Image as ImageIcon, 
  Video, 
  FileText, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink, 
  X, 
  Upload, 
  RefreshCw, 
  Layers,
  AlertTriangle 
} from 'lucide-react';

type MediaCategoryFilter = 'all' | 'profile' | 'projects' | 'certificates' | 'resumes' | 'general';

const MediaAssetCard: React.FC<{
  asset: MediaAsset;
  copiedId: string | null;
  onCopy: (id: string, url: string) => void;
  onDelete: (id: string, url: string) => void;
}> = ({ asset, copiedId, onCopy, onDelete }) => {
  const displayUrl = useResolvedMediaUrl(asset.url);

  return (
    <div className="p-4 rounded-2xl bg-space-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-space-850 text-cyan-300 border border-slate-700 uppercase">
            {asset.category}
          </span>
          <span className="text-[10px] font-mono text-slate-400 uppercase">
            {asset.type}
          </span>
        </div>

        {asset.type === 'image' && (
          <div className="w-full h-32 rounded-xl bg-space-950 overflow-hidden mb-3 border border-slate-800 flex items-center justify-center">
            {displayUrl ? (
              <img
                src={displayUrl}
                alt={asset.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <ImageIcon className="w-8 h-8 text-slate-600" />
            )}
          </div>
        )}

        {asset.type === 'document' && (
          <div className="w-full h-32 rounded-xl bg-space-950/60 overflow-hidden mb-3 border border-slate-800 flex flex-col items-center justify-center text-cyan-400 gap-2">
            <FileText className="w-8 h-8" />
            <span className="text-[10px] font-mono text-slate-400">PDF / Document</span>
          </div>
        )}

        <h4 className="text-sm font-bold font-display text-white line-clamp-1">
          {asset.name}
        </h4>
        <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
          {asset.url}
        </p>
      </div>

      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between mt-3">
        <button
          onClick={() => onCopy(asset.id, displayUrl || asset.url)}
          className="px-2.5 py-1 rounded-lg bg-space-850 hover:bg-space-800 text-xs font-mono text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          {copiedId === asset.id ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy URL</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-1.5">
          {displayUrl && (
            <a
              href={displayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-space-850 text-slate-400 hover:text-white"
              title="Open asset"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <button
            onClick={() => onDelete(asset.id, asset.url)}
            className="p-1.5 rounded-lg bg-space-850 hover:bg-red-950/60 text-red-400 cursor-pointer"
            title="Delete asset"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const MediaLibrary: React.FC = () => {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<MediaCategoryFilter>('all');
  
  // Direct file upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadCategory, setUploadCategory] = useState<'profile' | 'projects' | 'certificates' | 'resumes' | 'general'>('projects');
  const directFileInputRef = useRef<HTMLInputElement>(null);

  const [newAsset, setNewAsset] = useState({
    name: '',
    url: '',
    type: 'image' as 'image' | 'video' | 'document' | 'diagram',
    category: 'projects' as 'profile' | 'projects' | 'certificates' | 'resumes' | 'general'
  });

  const loadMedia = async () => {
    try {
      const list = await dbService.getMediaAssets();
      setAssets(list);
    } catch (err) {
      console.error('Failed to load media', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string, url: string) => {
    if (confirm('Delete this media asset telemetry record?')) {
      try {
        await storageService.deleteMedia(url);
      } catch (err) {
        console.warn('Storage delete exception (continuing with database record):', err);
      }
      await dbService.deleteMediaAsset(id);
      await loadMedia();
    }
  };

  const handleDirectFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setUploadError(null);

    const validation = storageService.validateFile(file, uploadCategory);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file format.');
      return;
    }

    setIsUploading(true);
    try {
      await storageService.uploadMedia(file, uploadCategory);
      await loadMedia();
    } catch (err: any) {
      console.error('Failed to upload file to media library', err);
      setUploadError(err?.message || 'Failed to upload media file.');
    } finally {
      setIsUploading(false);
      if (directFileInputRef.current) directFileInputRef.current.value = '';
    }
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.url) return;

    const asset: MediaAsset = {
      id: `media_${Date.now()}`,
      name: newAsset.name,
      url: newAsset.url,
      type: newAsset.type,
      category: newAsset.category,
      size: 0,
      created_at: new Date().toISOString()
    };

    await dbService.addMediaAsset(asset);
    await loadMedia();
    setIsModalOpen(false);
    setNewAsset({
      name: '',
      url: '',
      type: 'image',
      category: 'projects'
    });
  };

  const filteredAssets = activeCategory === 'all'
    ? assets
    : assets.filter(a => a.category === activeCategory);

  const categories: { key: MediaCategoryFilter; label: string }[] = [
    { key: 'all', label: 'All Media' },
    { key: 'projects', label: 'Projects' },
    { key: 'certificates', label: 'Certificates' },
    { key: 'profile', label: 'Profile' },
    { key: 'resumes', label: 'Resumes' },
    { key: 'general', label: 'General' },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
            Centralized Media Library
          </h2>
          <p className="text-xs font-mono text-cyan-400">
            Store and manage architecture diagrams, screenshots, certificates, and demo assets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Direct File Upload Action */}
          <input
            type="file"
            ref={directFileInputRef}
            onChange={handleDirectFileUpload}
            accept="image/*,.pdf,.doc,.docx"
            className="hidden"
          />
          <button
            onClick={() => directFileInputRef.current?.click()}
            disabled={isUploading}
            className="px-3.5 py-2.5 rounded-xl bg-space-850 hover:bg-space-800 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer"
          >
            {isUploading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
            ) : (
              <Upload className="w-4 h-4 text-cyan-400" />
            )}
            <span>[ 📤 Upload File ]</span>
          </button>

          {/* Register by URL */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow-glow-cyan flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Register URL
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-red-300 text-xs font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3 overflow-x-auto text-xs font-mono">
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeCategory === cat.key 
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' 
                : 'text-slate-400 hover:text-white bg-space-900/60'
            }`}
          >
            {cat.label} ({cat.key === 'all' ? assets.length : assets.filter(a => a.category === cat.key).length})
          </button>
        ))}
      </div>

      {/* Media Assets Grid */}
      {filteredAssets.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-space-900/50 border border-slate-800 text-slate-400 font-mono text-xs">
          No media assets registered in this category. Upload a file above or register a URL.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredAssets.map((asset) => (
            <MediaAssetCard
              key={asset.id}
              asset={asset}
              copiedId={copiedId}
              onCopy={handleCopyUrl}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Register URL Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/85 backdrop-blur-xl">
          <div className="relative w-full max-w-md rounded-3xl bg-space-900 border border-cyan-500/30 p-6 sm:p-8 text-slate-100">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold font-display text-white mb-6">
              Register External Media URL
            </h3>

            <form onSubmit={handleAddAsset} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-300 mb-1">ASSET NAME / LABEL *</label>
                <input
                  type="text"
                  required
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  placeholder="e.g. System Flow Architecture Diagram"
                  className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">MEDIA URL *</label>
                <input
                  type="url"
                  required
                  value={newAsset.url}
                  onChange={(e) => setNewAsset({ ...newAsset, url: e.target.value })}
                  placeholder="https://... or raw diagram link"
                  className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1">TYPE</label>
                  <select
                    value={newAsset.type}
                    onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                  >
                    <option value="image">Image</option>
                    <option value="diagram">Diagram</option>
                    <option value="document">Document</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">CATEGORY</label>
                  <select
                    value={newAsset.category}
                    onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                  >
                    <option value="projects">Projects</option>
                    <option value="certificates">Certificates</option>
                    <option value="profile">Profile</option>
                    <option value="resumes">Resumes</option>
                    <option value="general">General</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-space-850 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold uppercase transition-all shadow-glow-cyan cursor-pointer"
                >
                  Register Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
