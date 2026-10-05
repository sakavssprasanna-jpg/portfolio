import React, { useState, useRef } from 'react';
import { useUniverse } from '../../context/UniverseContext';
import { dbService } from '../../services/db';
import { storageService } from '../../services/storage';
import { Achievement } from '../../types/database';
import { Plus, Edit, Trash2, X, Save, Award, Calendar, Upload, FileCheck, ExternalLink, AlertTriangle, RefreshCw, Eye } from 'lucide-react';
import { sortAchievementsNewestFirst } from '../../utils/dateSorting';

export const AchievementControl: React.FC = () => {
  const { achievements, refreshData } = useUniverse();
  const certFileInputRef = useRef<HTMLInputElement>(null);
  const [editingItem, setEditingItem] = useState<Partial<Achievement> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingCert, setIsUploadingCert] = useState(false);
  const [certUploadError, setCertUploadError] = useState<string | null>(null);

  const sortedAchievements = React.useMemo(() => {
    return sortAchievementsNewestFirst(achievements);
  }, [achievements]);

  const handleOpenNew = () => {
    setCertUploadError(null);
    setEditingItem({
      id: `ach_${Date.now()}`,
      title: '',
      organization: '',
      date: new Date().getFullYear().toString(),
      description: '',
      certificate_url: '',
      certificate_file_url: '',
      external_url: '',
      image_url: '',
      display_order: achievements.length + 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (a: Achievement) => {
    setCertUploadError(null);
    setEditingItem({ ...a });
    setIsModalOpen(true);
  };

  const handleCertFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setCertUploadError(null);

    const validation = storageService.validateFile(file, 'certificates');
    if (!validation.valid) {
      setCertUploadError(validation.error || 'Invalid file type or size.');
      return;
    }

    setIsUploadingCert(true);
    try {
      const result = await storageService.uploadMedia(file, 'certificates');
      setEditingItem(prev => ({
        ...prev,
        certificate_file_url: result.url,
        image_url: result.type === 'image' ? result.url : (prev?.image_url || '')
      }));
    } catch (err: any) {
      console.error('Failed to upload certificate file:', err);
      setCertUploadError(err?.message || 'Failed to upload certificate. Please try again.');
    } finally {
      setIsUploadingCert(false);
      if (certFileInputRef.current) certFileInputRef.current.value = '';
    }
  };

  const handleRemoveCertFile = () => {
    setEditingItem(prev => ({
      ...prev,
      certificate_file_url: '',
      image_url: ''
    }));
    setCertUploadError(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this achievement artifact?')) {
      try {
        await dbService.deleteAchievement(id);
        await refreshData();
      } catch (err: any) {
        console.error('Failed to delete achievement', err);
        alert(`Error deleting achievement: ${err?.message || 'Unknown error'}`);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.title) return;

    setIsSaving(true);
    try {
      await dbService.saveAchievement(editingItem as Achievement);
      await refreshData();
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err: any) {
      console.error('Failed to save achievement', err);
      alert(`Error saving achievement: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
            Achievement Galaxy Discovery Telemetry
          </h2>
          <p className="text-xs font-mono text-cyan-400">
            {achievements.length} Honors & Accolades Registered
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow-glow-cyan flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Achievement
        </button>
      </div>

      {achievements.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-space-900/50 border border-slate-800 text-slate-400 font-mono text-xs">
          No achievements recorded yet. Add honors, awards, or certified discoveries.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedAchievements.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-space-900/70 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    <span>{item.organization || 'ACHIEVEMENT'}</span>
                  </span>
                  <span className="text-xs font-mono text-slate-400">{item.date}</span>
                </div>
                <h4 className="text-base font-bold font-display text-white mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {item.certificate_file_url && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                      <FileCheck className="w-3 h-3" /> File
                    </span>
                  )}
                  {item.certificate_url && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> URL
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg bg-space-850 hover:bg-space-800 text-cyan-400"
                    title="Edit achievement"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg bg-space-850 hover:bg-red-950/60 text-red-400"
                    title="Delete achievement"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/85 backdrop-blur-xl">
          <div className="relative w-full max-w-lg rounded-3xl bg-space-900 border border-cyan-500/30 p-6 sm:p-8 text-slate-100">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold font-display text-white mb-6">
              {editingItem.id ? 'Edit Achievement Artifact' : 'Add Achievement Artifact'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-300 mb-1">ACHIEVEMENT TITLE *</label>
                <input
                  type="text"
                  required
                  value={editingItem.title || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  placeholder="e.g. 1st Place - AI Agent Hackathon"
                  className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1">ISSUING ENTITY / ORG</label>
                  <input
                    type="text"
                    value={editingItem.organization || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, organization: e.target.value })}
                    placeholder="e.g. Google Cloud / IEEE"
                    className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">DATE / YEAR</label>
                  <input
                    type="text"
                    value={editingItem.date || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, date: e.target.value })}
                    placeholder="e.g. 2025"
                    className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">DESCRIPTION</label>
                <textarea
                  rows={3}
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                />
              </div>

              {/* CERTIFICATE ACCESS & MEDIA COORDINATES */}
              <div className="p-4 rounded-2xl bg-space-950/80 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4" /> CERTIFICATE CREDENTIALS & MEDIA
                  </span>
                  {isUploadingCert && (
                    <span className="text-[11px] font-mono text-cyan-300 flex items-center gap-1.5 animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Uploading certificate...
                    </span>
                  )}
                </div>

                {/* OPTION 1: CERTIFICATE URL */}
                <div>
                  <label className="block text-slate-300 mb-1 font-mono text-[11px]">CERTIFICATE URL</label>
                  <input
                    type="url"
                    value={editingItem.certificate_url || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, certificate_url: e.target.value })}
                    placeholder="https://coursera.org/verify/... or https://..."
                    className="w-full px-3 py-2 rounded-xl bg-space-900 border border-slate-700 text-white focus:border-cyan-400 font-mono text-xs"
                  />
                </div>

                {/* DIVIDER */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-800" />
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase px-2 py-0.5 rounded bg-space-900 border border-slate-800">
                    OR
                  </span>
                  <div className="flex-1 h-px bg-slate-800" />
                </div>

                {/* OPTION 2: UPLOAD CERTIFICATE */}
                <div className="space-y-3">
                  <label className="block text-slate-300 font-mono text-[11px]">UPLOAD CERTIFICATE</label>

                  <input
                    type="file"
                    ref={certFileInputRef}
                    onChange={handleCertFileUpload}
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    className="hidden"
                  />

                  {editingItem.certificate_file_url ? (
                    <div className="p-3.5 rounded-xl bg-space-900 border border-cyan-500/40 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-400/40 flex items-center justify-center text-cyan-400 flex-shrink-0">
                            <FileCheck className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <span className="block text-xs font-mono font-bold text-white truncate">
                              Certificate File Attached
                            </span>
                            <span className="block text-[10px] font-mono text-cyan-300 truncate">
                              {editingItem.certificate_file_url.startsWith('idb://') ? 'Local Persistent Storage' : 'Supabase Cloud Media'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => certFileInputRef.current?.click()}
                            disabled={isUploadingCert}
                            className="px-2.5 py-1.5 rounded-lg bg-space-850 hover:bg-space-800 text-cyan-300 font-mono text-[11px] border border-cyan-500/30 transition-colors cursor-pointer"
                          >
                            Replace
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveCertFile}
                            disabled={isUploadingCert}
                            className="p-1.5 rounded-lg bg-space-850 hover:bg-red-950 text-red-400 border border-slate-700 transition-colors cursor-pointer"
                            title="Remove uploaded certificate"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => certFileInputRef.current?.click()}
                      disabled={isUploadingCert}
                      className="w-full py-3 rounded-xl bg-space-900 hover:bg-space-850 border border-dashed border-cyan-500/50 hover:border-cyan-400 text-cyan-300 font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Upload className="w-4 h-4" />
                      <span>[ 📄 UPLOAD CERTIFICATE ]</span>
                    </button>
                  )}

                  <p className="text-[10px] text-slate-400 font-sans">
                    Upload PDF or image (PNG, JPG, WebP) up to 10MB. You can provide a URL, an uploaded file, or both.
                  </p>

                  {certUploadError && (
                    <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-mono flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{certUploadError}</span>
                    </div>
                  )}
                </div>

                {/* EXTERNAL VERIFICATION LINK (OPTIONAL) */}
                <div className="pt-2 border-t border-slate-800/80">
                  <label className="block text-slate-300 mb-1 font-mono text-[11px]">EXTERNAL VERIFICATION LINK (OPTIONAL)</label>
                  <input
                    type="url"
                    value={editingItem.external_url || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, external_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-space-900 border border-slate-700 text-white focus:border-cyan-400 font-mono text-xs"
                  />
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
                  disabled={isSaving}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold uppercase transition-all shadow-glow-cyan flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Achievement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
