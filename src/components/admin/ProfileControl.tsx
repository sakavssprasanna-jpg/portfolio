import React, { useState, useRef } from 'react';
import { useUniverse } from '../../context/UniverseContext';
import { dbService } from '../../services/db';
import { storageService, useResolvedMediaUrl } from '../../services/storage';
import { Save, CheckCircle2, User, Mail, MapPin, Globe, Camera, Upload, Trash2, AlertTriangle, RefreshCw } from 'lucide-react';
import { GithubIcon, LinkedinIcon, TwitterIcon, LeetCodeIcon, HackerRankIcon } from '../common/BrandIcons';

export const ProfileControl: React.FC = () => {
  const { profile, refreshData } = useUniverse();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || 'VEERA SATYA SAI PRASANNA',
    headline: profile?.headline || 'AI/ML • GenAI • Intelligent Systems',
    bio: profile?.bio || '',
    email: profile?.email || '',
    location: profile?.location || '',
    avatar_url: profile?.avatar_url || '',
    github_url: profile?.github_url || '',
    linkedin_url: profile?.linkedin_url || '',
    twitter_url: profile?.twitter_url || '',
    website_url: profile?.website_url || '',
    leetcode_url: profile?.leetcode_url || '',
    hackerrank_url: profile?.hackerrank_url || ''
  });

  React.useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        full_name: profile.full_name || prev.full_name,
        headline: profile.headline || prev.headline,
        bio: profile.bio ?? prev.bio,
        email: profile.email ?? prev.email,
        location: profile.location ?? prev.location,
        avatar_url: profile.avatar_url ?? prev.avatar_url,
        github_url: profile.github_url ?? prev.github_url,
        linkedin_url: profile.linkedin_url ?? prev.linkedin_url,
        twitter_url: profile.twitter_url ?? prev.twitter_url,
        website_url: profile.website_url ?? prev.website_url,
        leetcode_url: profile.leetcode_url ?? prev.leetcode_url,
        hackerrank_url: profile.hackerrank_url ?? prev.hackerrank_url
      }));
    }
  }, [profile]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  const resolvedAvatarUrl = useResolvedMediaUrl(formData.avatar_url);
  const displayPhotoUrl = localPreviewUrl || resolvedAvatarUrl || formData.avatar_url;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const selectedFile = e.target.files[0];
    setPhotoUploadError(null);

    const validation = storageService.validateFile(selectedFile, 'profile');
    if (!validation.valid) {
      setPhotoUploadError(validation.error || 'Invalid file format or size.');
      return;
    }

    // Instant local preview
    const preview = URL.createObjectURL(selectedFile);
    setLocalPreviewUrl(preview);
    setIsUploadingPhoto(true);

    try {
      const result = await storageService.uploadMedia(selectedFile, 'profile');
      setFormData(prev => ({ ...prev, avatar_url: result.url }));
    } catch (err: any) {
      console.error('Failed to upload profile photo:', err);
      setPhotoUploadError(err?.message || 'Failed to upload profile photo. Please try again.');
      setLocalPreviewUrl(null);
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = () => {
    setLocalPreviewUrl(null);
    setFormData(prev => ({ ...prev, avatar_url: '' }));
    setPhotoUploadError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await dbService.updateProfile(formData);
      await refreshData();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile', err);
      alert('Error updating profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
          Profile & Transmission Coordinates
        </h2>
        <p className="text-xs font-mono text-cyan-400">
          Configure identity parameters, core technical bio, and social telemetry links.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Profile coordinates successfully synchronized to database and public universe!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-space-900/70 border border-slate-800 space-y-6 text-xs font-mono">
        {/* Core Identity */}
        <div className="space-y-5">
          <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
            <User className="w-4 h-4" /> Core Identity
          </h3>

          {/* PROFILE PHOTO SECTION */}
          <div className="p-5 rounded-2xl bg-space-950/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <Camera className="w-4 h-4" /> PROFILE PHOTO
              </label>
              {isUploadingPhoto && (
                <span className="text-[11px] font-mono text-cyan-300 flex items-center gap-1.5 animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading & optimizing...
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Photo Preview with soft orbital ring & subtle glow */}
              <div className="relative flex-shrink-0">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-cyan-400/60 via-blue-500/40 to-purple-600/40 shadow-glow-cyan">
                  <div className="w-full h-full rounded-full bg-space-950 border border-cyan-400/30 overflow-hidden flex items-center justify-center">
                    {displayPhotoUrl ? (
                      <img
                        src={displayPhotoUrl}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-600">
                        <User className="w-10 h-10" />
                        <span className="text-[9px] font-mono text-slate-500 mt-1">NO PHOTO</span>
                      </div>
                    )}
                  </div>
                </div>
                {/* Soft orbital ring */}
                <div className="absolute -inset-2 rounded-full border border-cyan-500/25 pointer-events-none" />
              </div>

              {/* Upload & Action Controls */}
              <div className="space-y-2.5 flex-1 text-center sm:text-left">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-2.5 justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="px-4 py-2 rounded-xl bg-space-850 hover:bg-space-800 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{formData.avatar_url ? 'Replace Profile Photo' : 'Upload Profile Photo'}</span>
                  </button>

                  {formData.avatar_url && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      disabled={isUploadingPhoto}
                      className="px-3.5 py-2 rounded-xl bg-space-850 hover:bg-red-950/60 border border-slate-700 hover:border-red-500/50 text-red-400 font-mono text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Photo</span>
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 font-sans">
                  Supported formats: JPEG, PNG, WebP, SVG (Max 5MB). Photo is automatically optimized and stored securely.
                </p>

                {localPreviewUrl && (
                  <p className="text-[11px] font-mono text-amber-300/90">
                    • Preview mode: Click "Save Profile Coordinates" below to commit changes to the universe.
                  </p>
                )}

                {photoUploadError && (
                  <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-mono flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{photoUploadError}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-1">FULL NAME *</label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400 font-sans"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">PROFESSIONAL HEADLINE *</label>
              <input
                type="text"
                required
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400 font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1">TECHNICAL BIO / THESIS</label>
            <textarea
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400 font-sans leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-1">AVATAR / HEADSHOT IMAGE URL</label>
              <input
                type="text"
                value={formData.avatar_url}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">LOCATION / BASE</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Hyderabad, India / Remote"
                className="w-full px-3 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Transmission & Social Links */}
        <div className="pt-6 border-t border-slate-800 space-y-4">
          <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
            <Mail className="w-4 h-4" /> Direct Communication & Social Links
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-1">OFFICIAL EMAIL</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="veeraprasanna@example.com"
                className="w-full px-3 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">GITHUB PROFILE URL</label>
              <input
                type="text"
                value={formData.github_url}
                onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                placeholder="https://github.com/..."
                className="w-full px-3 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">LINKEDIN PROFILE URL</label>
              <input
                type="text"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-3 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">X / TWITTER URL</label>
              <input
                type="text"
                value={formData.twitter_url}
                onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                placeholder="https://x.com/..."
                className="w-full px-3 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">LEETCODE PROFILE URL</label>
              <input
                type="text"
                value={formData.leetcode_url}
                onChange={(e) => setFormData({ ...formData, leetcode_url: e.target.value })}
                placeholder="https://leetcode.com/u/..."
                className="w-full px-3 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">HACKERRANK PROFILE URL</label>
              <input
                type="text"
                value={formData.hackerrank_url}
                onChange={(e) => setFormData({ ...formData, hackerrank_url: e.target.value })}
                placeholder="https://www.hackerrank.com/profile/..."
                className="w-full px-3 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-emerald-400"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-bold uppercase transition-all shadow-glow-cyan flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save Profile Coordinates
          </button>
        </div>
      </form>
    </div>
  );
};
