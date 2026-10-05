import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import { storageService, useResolvedMediaUrl } from '../../services/storage';
import { useUniverse } from '../../context/UniverseContext';
import { ResumeVersion, ResumeCustomSection } from '../../types/database';
import { 
  FileText, 
  CheckCircle2, 
  Trash2, 
  Download, 
  Upload, 
  Calendar, 
  ExternalLink, 
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit3,
  Layers,
  Check,
  X,
  Shield,
  Sparkles
} from 'lucide-react';

const ResumeRow: React.FC<{
  resume: ResumeVersion;
  onSetActive: (r: ResumeVersion) => void;
  onDelete: (id: string) => void;
}> = ({ resume, onSetActive, onDelete }) => {
  const resolvedUrl = useResolvedMediaUrl(resume.file_url);

  return (
    <div
      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        resume.is_current_approved
          ? 'bg-emerald-950/20 border-emerald-500/40 shadow-glow-cyan'
          : 'bg-space-900/70 border-slate-800'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            resume.is_current_approved
              ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-400'
              : 'bg-space-850 text-slate-400'
          }`}
        >
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold font-display text-white">{resume.version_name}</h4>
            {resume.is_current_approved && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> OFFICIAL PUBLIC
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-slate-400 mt-0.5">
            <span className="truncate max-w-[200px]">{resume.file_name}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-cyan-400" />
              {new Date(resume.upload_date).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center">
        {!resume.is_current_approved && (
          <button
            onClick={() => onSetActive(resume)}
            className="px-3 py-1.5 rounded-lg bg-space-850 hover:bg-emerald-950/60 text-emerald-300 text-xs font-mono border border-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Designate Official</span>
          </button>
        )}
        {resolvedUrl && (
          <a
            href={resolvedUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={resume.file_name}
            className="p-1.5 rounded-lg bg-space-850 hover:bg-space-800 text-cyan-400 transition-colors"
            title="Preview / Download Dossier"
          >
            <Download className="w-3.5 h-3.5" />
          </a>
        )}
        <button
          onClick={() => onDelete(resume.id)}
          className="p-1.5 rounded-lg bg-space-850 hover:bg-red-950/60 text-red-400 transition-colors cursor-pointer"
          title="Delete Version"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export const ResumeControl: React.FC = () => {
  const { refreshData } = useUniverse();
  const [resumes, setResumes] = useState<ResumeVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [newVersionLabel, setNewVersionLabel] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Custom sections state
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [customSections, setCustomSections] = useState<ResumeCustomSection[]>([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [editingSection, setEditingSection] = useState<ResumeCustomSection | null>(null);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);

  // Section form state
  const [sectionForm, setSectionForm] = useState({
    title: '',
    slug: '',
    contentStr: '',
    display_order: 1,
    visible: true
  });

  const loadResumes = async () => {
    try {
      const list = await dbService.getAllResumes();
      setResumes(list);
    } catch (err) {
      console.error('Failed to load resumes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  useEffect(() => {
    if (resumes.length > 0) {
      if (!selectedResumeId || !resumes.some(r => r.id === selectedResumeId)) {
        const official = resumes.find(r => r.is_current_approved) || resumes[0];
        setSelectedResumeId(official.id);
      }
    }
  }, [resumes, selectedResumeId]);

  const loadCustomSections = async (rId: string) => {
    if (!rId) return;
    setLoadingSections(true);
    try {
      const list = await dbService.getCustomSections(rId);
      setCustomSections(list);
    } catch (err) {
      console.error('Failed to load custom sections', err);
    } finally {
      setLoadingSections(false);
    }
  };

  useEffect(() => {
    if (selectedResumeId) {
      loadCustomSections(selectedResumeId);
    } else {
      setCustomSections([]);
    }
  }, [selectedResumeId]);

  const handleSetActive = async (resume: ResumeVersion) => {
    await dbService.saveResumeVersion({
      ...resume,
      is_current_approved: true
    });
    await loadResumes();
    await refreshData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this resume version telemetry record?')) {
      await dbService.deleteResume(id);
      await loadResumes();
      await refreshData();
    }
  };

  const handleMoveSection = async (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= customSections.length) return;
    const reordered = [...customSections];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIdx, 0, moved);
    const orderedIds = reordered.map(s => s.id);
    setCustomSections(reordered);
    await dbService.reorderCustomSections(orderedIds, selectedResumeId);
    await refreshData();
  };

  const handleToggleVisibility = async (sec: ResumeCustomSection) => {
    const updated: ResumeCustomSection = { ...sec, visible: !sec.visible };
    await dbService.saveCustomSection(updated);
    await loadCustomSections(selectedResumeId);
    await refreshData();
  };

  const handleDeleteSection = async (secId: string) => {
    if (confirm('Delete this custom resume section?')) {
      await dbService.deleteCustomSection(secId);
      await loadCustomSections(selectedResumeId);
      await refreshData();
    }
  };

  const handleOpenNewSectionModal = () => {
    setEditingSection(null);
    setSectionForm({
      title: '',
      slug: '',
      contentStr: '',
      display_order: customSections.length + 1,
      visible: true
    });
    setIsSectionModalOpen(true);
  };

  const handleOpenEditSectionModal = (sec: ResumeCustomSection) => {
    setEditingSection(sec);
    setSectionForm({
      title: sec.title,
      slug: sec.slug,
      contentStr: Array.isArray(sec.content) 
        ? sec.content.join('\n') 
        : typeof sec.content === 'object' && sec.content !== null 
          ? JSON.stringify(sec.content, null, 2) 
          : String(sec.content || ''),
      display_order: sec.display_order,
      visible: sec.visible
    });
    setIsSectionModalOpen(true);
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionForm.title.trim()) return;

    const lines = sectionForm.contentStr.split('\n').map(l => l.trim()).filter(Boolean);
    const content = lines.length > 1 ? lines : (lines[0] || '');
    const slug = sectionForm.slug.trim() || sectionForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const sectionToSave: ResumeCustomSection = {
      id: editingSection?.id || `sec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      resume_id: selectedResumeId,
      title: sectionForm.title.trim(),
      slug,
      content,
      display_order: Number(sectionForm.display_order) || (customSections.length + 1),
      visible: sectionForm.visible,
      source: editingSection?.source || 'manual',
      created_at: editingSection?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await dbService.saveCustomSection(sectionToSave);
    await loadCustomSections(selectedResumeId);
    await refreshData();
    setIsSectionModalOpen(false);
  };

  const handleManualUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setUploadError(null);

    const validation = storageService.validateFile(selectedFile, 'resumes');
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file type or size.');
      return;
    }

    setIsUploading(true);
    try {
      // Securely upload using persistent storageService (Supabase bucket or local IndexedDB mirror)
      const uploadResult = await storageService.uploadMedia(selectedFile, 'resumes');
      const isFirst = resumes.length === 0;

      const newVersion: ResumeVersion = {
        id: `resume_${Date.now()}`,
        file_name: selectedFile.name,
        file_url: uploadResult.url,
        version_name: newVersionLabel.trim() || `Dossier ${new Date().toLocaleDateString()}`,
        upload_date: new Date().toISOString(),
        is_current_approved: isFirst
      };

      await dbService.saveResumeVersion(newVersion);
      await loadResumes();
      await refreshData();
      setSelectedFile(null);
      setNewVersionLabel('');
    } catch (err: any) {
      console.error('Failed to upload resume version', err);
      setUploadError(err?.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
          Resume Station Version Control
        </h2>
        <p className="text-xs font-mono text-cyan-400">
          Store, archive, and designate the officially approved public resume dossier.
        </p>
      </div>

      {uploadError && (
        <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-red-300 text-xs font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Upload New Version Card */}
      <div className="p-6 rounded-2xl bg-space-900/70 border border-slate-800 space-y-4">
        <h3 className="text-sm font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
          <Upload className="w-4 h-4" /> Register New Resume Version
        </h3>

        <form onSubmit={handleManualUpload} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end text-xs font-mono">
          <div className="sm:col-span-5">
            <label className="block text-slate-300 mb-1">VERSION NAME / LABEL</label>
            <input
              type="text"
              value={newVersionLabel}
              onChange={(e) => setNewVersionLabel(e.target.value)}
              placeholder="e.g. Veera_Prasanna_AI_ML_Dossier_2026.pdf"
              className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-slate-300 mb-1">RESUME FILE (.PDF)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              required
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30 file:cursor-pointer cursor-pointer"
            />
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-bold uppercase transition-all shadow-glow-cyan flex items-center justify-center gap-2 cursor-pointer"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" /> Save Version
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Resumes List */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest">
          Stored Resume Versions ({resumes.length})
        </h3>

        {resumes.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-space-900/50 border border-slate-800 text-slate-400 font-mono text-xs">
            No resume versions registered yet. Upload a version above or ingest via Resume Intelligence.
          </div>
        ) : (
          <div className="space-y-3">
            {resumes.map((r) => (
              <ResumeRow
                key={r.id}
                resume={r}
                onSetActive={handleSetActive}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* DYNAMIC / CUSTOM RESUME SECTIONS MANAGEMENT */}
      {/* ==================================================== */}
      <div className="p-6 sm:p-8 rounded-3xl bg-space-900/80 border border-cyan-500/30 backdrop-blur-xl space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 text-[10px] font-mono border border-cyan-500/40">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>DYNAMIC DOSSIER SECTORS</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-display text-white mt-1.5">
              Custom Resume Sections
            </h3>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              Manage custom sections (Languages, Publications, Coursework, Volunteer, Research, etc.) for each dossier version.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenNewSectionModal}
              disabled={!selectedResumeId && resumes.length === 0}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-slate-950 font-bold text-xs font-mono uppercase transition-all shadow-glow-cyan flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Section</span>
            </button>
          </div>
        </div>

        {/* Target Resume Version Selector */}
        {resumes.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 rounded-2xl bg-space-950 border border-slate-800 text-xs font-mono">
            <span className="text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              Target Resume Dossier:
            </span>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-xl bg-space-900 border border-slate-700 text-white font-mono focus:border-cyan-400 cursor-pointer"
            >
              {resumes.map(r => (
                <option key={r.id} value={r.id}>
                  {r.version_name} ({r.file_name}) {r.is_current_approved ? '★ [OFFICIAL PUBLIC]' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Custom Sections List */}
        {loadingSections ? (
          <div className="p-8 text-center text-xs font-mono text-cyan-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" /> Loading custom sections...
          </div>
        ) : customSections.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-space-950/60 border border-dashed border-slate-800 text-slate-400 font-mono text-xs space-y-2">
            <Layers className="w-8 h-8 text-slate-600 mx-auto" />
            <p>No custom sections registered for this resume dossier version.</p>
            <p className="text-[11px] text-slate-500">
              Click &quot;Add Custom Section&quot; above to create Languages, Publications, Volunteer Experience, or ingest an extended resume dossier via Resume Intelligence.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {customSections.map((sec, idx) => (
              <div
                key={sec.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  sec.visible
                    ? 'bg-space-950/90 border-slate-800 hover:border-cyan-500/40'
                    : 'bg-space-950/40 border-slate-900 opacity-60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Reorder & Title */}
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="flex flex-col gap-1 items-center justify-center">
                      <button
                        onClick={() => handleMoveSection(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded hover:bg-space-850 text-slate-400 hover:text-cyan-300 disabled:opacity-20 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveSection(idx, 'down')}
                        disabled={idx === customSections.length - 1}
                        className="p-1 rounded hover:bg-space-850 text-slate-400 hover:text-cyan-300 disabled:opacity-20 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono text-slate-500">#{sec.display_order}</span>
                        <h4 className="text-sm font-bold font-display text-white">{sec.title}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-space-850 text-cyan-400 border border-slate-700">
                          {sec.slug}
                        </span>
                        {sec.source && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                            {sec.source}
                          </span>
                        )}
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                          sec.visible
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-900 text-slate-500 border-slate-800'
                        }`}>
                          {sec.visible ? 'VISIBLE' : 'HIDDEN'}
                        </span>
                      </div>

                      {/* Content summary */}
                      <div className="mt-2 text-xs font-mono text-slate-300">
                        {Array.isArray(sec.content) ? (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {sec.content.map((item, cIdx) => (
                              <span
                                key={cIdx}
                                className="px-2 py-0.5 rounded-md bg-space-900 border border-slate-800 text-slate-300 text-[11px]"
                              >
                                • {item}
                              </span>
                            ))}
                          </div>
                        ) : typeof sec.content === 'object' && sec.content !== null ? (
                          <pre className="text-slate-400 text-[11px] whitespace-pre-wrap">{JSON.stringify(sec.content, null, 2)}</pre>
                        ) : (
                          <p className="line-clamp-2 text-slate-400">{String(sec.content || '')}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleToggleVisibility(sec)}
                      className={`p-2 rounded-xl border text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 ${
                        sec.visible
                          ? 'bg-space-850 hover:bg-space-800 text-slate-300 border-slate-700'
                          : 'bg-space-900 text-slate-500 border-slate-800'
                      }`}
                      title={sec.visible ? 'Hide from public station' : 'Make visible on public station'}
                    >
                      {sec.visible ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleOpenEditSectionModal(sec)}
                      className="p-2 rounded-xl bg-space-850 hover:bg-space-800 text-cyan-300 border border-slate-700 transition-colors cursor-pointer"
                      title="Edit Section"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteSection(sec.id)}
                      className="p-2 rounded-xl bg-space-850 hover:bg-red-950/60 text-red-400 border border-slate-700 transition-colors cursor-pointer"
                      title="Delete Section"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* ADD / EDIT CUSTOM SECTION MODAL */}
      {/* ==================================================== */}
      {isSectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-space-900 border border-cyan-500/40 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <h3 className="text-xl font-bold font-display text-white">
                  {editingSection ? 'Edit Custom Section' : 'Add Custom Section'}
                </h3>
              </div>
              <button
                onClick={() => setIsSectionModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white bg-space-850 hover:bg-space-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSection} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-slate-300 mb-1.5 uppercase font-bold">
                  Section Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Languages, Publications, Volunteer Experience, Research"
                  value={sectionForm.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    const autoSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    setSectionForm(prev => ({
                      ...prev,
                      title,
                      slug: prev.slug === '' || prev.slug === autoSlug.slice(0, -1) ? autoSlug : prev.slug
                    }));
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1.5 uppercase">
                    Identifier Slug
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. languages"
                    value={sectionForm.slug}
                    onChange={(e) => setSectionForm(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1.5 uppercase">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={sectionForm.display_order}
                    onChange={(e) => setSectionForm(prev => ({ ...prev, display_order: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 uppercase font-bold">
                  Section Content (One line per bullet point or entry) *
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder={`English (Fluent)\nTelugu (Native)\nHindi (Working Proficiency)`}
                  value={sectionForm.contentStr}
                  onChange={(e) => setSectionForm(prev => ({ ...prev, contentStr: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-space-950 border border-slate-800">
                <input
                  type="checkbox"
                  id="sectionVisible"
                  checked={sectionForm.visible}
                  onChange={(e) => setSectionForm(prev => ({ ...prev, visible: e.target.checked }))}
                  className="w-4 h-4 rounded bg-space-900 border-slate-700 text-cyan-500 focus:ring-cyan-400 cursor-pointer"
                />
                <label htmlFor="sectionVisible" className="text-slate-300 text-xs cursor-pointer select-none">
                  Make section visible on public Resume Station
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSectionModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-space-850 hover:bg-space-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 flex items-center gap-1.5 cursor-pointer shadow-glow-cyan"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingSection ? 'Update Section' : 'Save Section'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
