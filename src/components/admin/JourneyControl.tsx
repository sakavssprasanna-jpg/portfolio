import React, { useState, useRef } from 'react';
import { useUniverse } from '../../context/UniverseContext';
import { dbService } from '../../services/db';
import { storageService } from '../../services/storage';
import { JourneyEntry, JourneyCategory } from '../../types/database';
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Save, 
  Briefcase, 
  Calendar, 
  ArrowUp, 
  ArrowDown, 
  Upload, 
  Image as ImageIcon,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { sortJourneyPresentNewestFirst } from '../../utils/dateSorting';

export const JourneyControl: React.FC = () => {
  const { journey, refreshData } = useUniverse();
  const [editingEntry, setEditingEntry] = useState<Partial<JourneyEntry> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const sortedJourney = React.useMemo(() => {
    return sortJourneyPresentNewestFirst(journey);
  }, [journey]);

  const handleOpenNew = () => {
    setUploadError(null);
    setEditingEntry({
      id: `journey_${Date.now()}`,
      title: '',
      organization: '',
      date_range: '',
      description: '',
      category: 'experience',
      image_url: '',
      external_url: '',
      display_order: journey.length + 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (entry: JourneyEntry) => {
    setUploadError(null);
    setEditingEntry({ ...entry });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this journey waypoint?')) {
      await dbService.deleteJourneyEntry(id);
      await refreshData();
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= journey.length) return;

    const reordered = [...journey];
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;

    await dbService.reorderJourney(reordered.map(j => j.id));
    await refreshData();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setUploadError(null);

    const validation = storageService.validateFile(file, 'general');
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file.');
      return;
    }

    setIsUploadingImage(true);
    try {
      const result = await storageService.uploadMedia(file, 'general');
      setEditingEntry(prev => ({
        ...prev,
        image_url: result.url
      }));
    } catch (err: any) {
      console.error('Failed to upload journey image', err);
      setUploadError(err?.message || 'Failed to upload image.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry || !editingEntry.title || !editingEntry.organization) return;

    setIsSaving(true);
    try {
      await dbService.saveJourneyEntry(editingEntry as JourneyEntry);
      await refreshData();
      setIsModalOpen(false);
      setEditingEntry(null);
    } catch (err) {
      console.error('Failed to save journey entry', err);
      alert('Error saving journey entry.');
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
            Orbital Journey Timeline Telemetry
          </h2>
          <p className="text-xs font-mono text-cyan-400">
            {journey.length} Trajectory Milestones
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow-glow-cyan flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Journey Waypoint
        </button>
      </div>

      {journey.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-space-900/50 border border-slate-800 text-slate-400 font-mono text-xs">
          No journey milestones registered. Add your career roles, education, or research tenures.
        </div>
      ) : (
        <div className="space-y-3">
          {sortedJourney.map((item, index) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-space-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start sm:items-center gap-3">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.organization}
                    className="w-10 h-10 rounded-xl object-cover bg-space-950 border border-slate-700 flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-space-850 border border-slate-800 text-cyan-400 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5" />
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 uppercase">
                      {item.category}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {item.date_range}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold font-display text-white mt-1">
                    {item.title} — <span className="text-cyan-400 font-normal">{item.organization}</span>
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{item.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  disabled={index === 0}
                  onClick={() => handleMove(index, 'up')}
                  className="p-1.5 rounded-lg bg-space-850 hover:bg-space-800 disabled:opacity-30 text-slate-400"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  disabled={index === journey.length - 1}
                  onClick={() => handleMove(index, 'down')}
                  className="p-1.5 rounded-lg bg-space-850 hover:bg-space-800 disabled:opacity-30 text-slate-400"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 rounded-lg bg-space-850 hover:bg-space-800 text-cyan-400"
                  title="Edit Waypoint"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg bg-space-850 hover:bg-red-950/60 text-red-400"
                  title="Delete Waypoint"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/85 backdrop-blur-xl">
          <div className="relative w-full max-w-lg rounded-3xl bg-space-900 border border-cyan-500/30 p-6 sm:p-8 text-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold font-display text-white mb-6">
              {editingEntry.id ? 'Edit Journey Waypoint' : 'Add Journey Waypoint'}
            </h3>

            {uploadError && (
              <div className="p-3 mb-4 rounded-xl bg-red-950/70 border border-red-500/40 text-red-300 text-xs font-mono">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1">TITLE / ROLE *</label>
                  <input
                    type="text"
                    required
                    value={editingEntry.title || ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, title: e.target.value })}
                    placeholder="e.g. AI/ML Research Engineer"
                    className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">ORGANIZATION *</label>
                  <input
                    type="text"
                    required
                    value={editingEntry.organization || ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, organization: e.target.value })}
                    placeholder="e.g. OpenAI / Lab / Univ"
                    className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1">DATE RANGE</label>
                  <input
                    type="text"
                    value={editingEntry.date_range || ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, date_range: e.target.value })}
                    placeholder="e.g. 2024 - Present"
                    className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">CATEGORY</label>
                  <select
                    value={editingEntry.category || 'experience'}
                    onChange={(e) => setEditingEntry({ ...editingEntry, category: e.target.value as JourneyCategory })}
                    className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                  >
                    <option value="experience">Experience</option>
                    <option value="education">Education</option>
                    <option value="research">Research</option>
                    <option value="milestone">Milestone</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">DESCRIPTION</label>
                <textarea
                  rows={3}
                  value={editingEntry.description || ''}
                  onChange={(e) => setEditingEntry({ ...editingEntry, description: e.target.value })}
                  placeholder="Responsibilities, models trained, engineering breakthroughs..."
                  className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                />
              </div>

              {/* Logo / Image URL or Upload */}
              <div className="p-3.5 rounded-xl bg-space-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-300 font-mono text-[11px]">ORGANIZATION LOGO / IMAGE (OPTIONAL)</label>
                  {isUploadingImage && (
                    <span className="text-[10px] text-cyan-300 flex items-center gap-1 animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Uploading...
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <input
                    type="text"
                    value={editingEntry.image_url || ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, image_url: e.target.value })}
                    placeholder="https://... logo url"
                    className="w-full px-3 py-2 rounded-xl bg-space-900 border border-slate-700 text-white focus:border-cyan-400"
                  />

                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="w-full py-2 px-3 rounded-xl bg-space-850 hover:bg-space-800 border border-cyan-500/30 text-cyan-300 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" /> [ 🖼️ Upload Logo ]
                    </button>
                  </div>
                </div>

                {editingEntry.image_url && (
                  <div className="flex items-center gap-2 pt-1">
                    <img src={editingEntry.image_url} alt="Logo preview" className="w-7 h-7 rounded-lg object-contain bg-space-900" />
                    <span className="text-[10px] text-slate-400 truncate flex-1">{editingEntry.image_url}</span>
                    <button
                      type="button"
                      onClick={() => setEditingEntry({ ...editingEntry, image_url: '' })}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-300 mb-1">EXTERNAL VERIFICATION URL (OPTIONAL)</label>
                <input
                  type="url"
                  value={editingEntry.external_url || ''}
                  onChange={(e) => setEditingEntry({ ...editingEntry, external_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                />
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
                  <Save className="w-4 h-4" /> Save Waypoint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
