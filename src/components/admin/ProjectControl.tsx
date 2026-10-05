import React, { useState, useRef } from 'react';
import { useUniverse } from '../../context/UniverseContext';
import { dbService } from '../../services/db';
import { storageService } from '../../services/storage';
import { Project, ProjectStatus } from '../../types/database';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  ExternalLink, 
  X, 
  Save, 
  Upload, 
  Image as ImageIcon, 
  Sparkles,
  Layers,
  Cpu,
  Database,
  Calendar,
  AlertCircle,
  CheckCircle2,
  FileText,
  Compass,
  PlayCircle,
  Eye,
  RefreshCw
} from 'lucide-react';
import { GithubIcon } from '../common/BrandIcons';

export const ProjectControl: React.FC = () => {
  const { projects, worlds, refreshData } = useUniverse();
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'aiml' | 'media' | 'links'>('basic');
  
  // Field-specific string inputs for array editing
  const [techStackInput, setTechStackInput] = useState('');
  const [featuresInput, setFeaturesInput] = useState('');
  const [newScreenshotUrl, setNewScreenshotUrl] = useState('');

  // Loading and feedback states
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [isUploadingArch, setIsUploadingArch] = useState(false);
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Hidden file inputs
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const archInputRef = useRef<HTMLInputElement>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  const handleOpenNew = () => {
    setUploadError(null);
    setStatusMessage(null);
    setEditingProject({
      id: `proj_${Date.now()}`,
      title: '',
      slug: '',
      world_id: worlds[0]?.id || '',
      short_description: '',
      full_description: '',
      problem: '',
      solution: '',
      ai_ml_approach: '',
      models_methods: '',
      dataset_info: '',
      architecture_diagram: '',
      architecture_description: '',
      thumbnail_url: '',
      tech_stack: [],
      features: [],
      my_contribution: '',
      challenges: '',
      solutions_developed: '',
      learnings: '',
      github_url: '',
      live_url: '',
      demo_video_url: '',
      documentation_url: '',
      screenshots: [],
      project_date: new Date().toISOString().slice(0, 7),
      status: 'completed',
      is_featured: false,
      display_order: projects.length + 1
    });
    setTechStackInput('');
    setFeaturesInput('');
    setNewScreenshotUrl('');
    setActiveTab('basic');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project: Project) => {
    setUploadError(null);
    setStatusMessage(null);
    setEditingProject({ ...project });
    setTechStackInput((project.tech_stack || []).join(', '));
    setFeaturesInput((project.features || []).join('\n'));
    setNewScreenshotUrl('');
    setActiveTab('basic');
    setIsModalOpen(true);
  };

  // DUPLICATE / CLONE PROJECT ACTION
  const handleDuplicate = async (project: Project) => {
    const duplicatedTitle = `${project.title} (Copy)`;
    const newId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newSlug = `${project.slug || project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-copy`;

    const cloned: Project = {
      ...project,
      id: newId,
      title: duplicatedTitle,
      slug: newSlug,
      display_order: projects.length + 1,
      is_featured: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      await dbService.saveProject(cloned);
      await refreshData();
      setStatusMessage({ text: `Project cloned successfully as "${duplicatedTitle}".`, type: 'success' });
      // Open cloned project in editor immediately
      handleOpenEdit(cloned);
    } catch (err: any) {
      console.error('Failed to clone project', err);
      alert(`Error duplicating project mission: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to decommission this project mission?')) {
      try {
        await dbService.deleteProject(id);
        await refreshData();
        setStatusMessage({ text: 'Project deleted successfully.', type: 'success' });
      } catch (err: any) {
        console.error('Failed to delete project', err);
        alert(`Error deleting project: ${err?.message || 'Unknown error'}`);
      }
    }
  };

  // Thumbnail upload
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setUploadError(null);

    const validation = storageService.validateFile(file, 'projects');
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file format.');
      return;
    }

    setIsUploadingThumbnail(true);
    try {
      const result = await storageService.uploadMedia(file, 'projects');
      setEditingProject(prev => ({
        ...prev,
        thumbnail_url: result.url
      }));
    } catch (err: any) {
      console.error('Failed to upload thumbnail', err);
      setUploadError(err?.message || 'Failed to upload project thumbnail.');
    } finally {
      setIsUploadingThumbnail(false);
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
    }
  };

  // Architecture Diagram upload
  const handleArchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setUploadError(null);

    const validation = storageService.validateFile(file, 'projects');
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file format.');
      return;
    }

    setIsUploadingArch(true);
    try {
      const result = await storageService.uploadMedia(file, 'projects');
      setEditingProject(prev => ({
        ...prev,
        architecture_diagram: result.url
      }));
    } catch (err: any) {
      console.error('Failed to upload architecture diagram', err);
      setUploadError(err?.message || 'Failed to upload architecture diagram.');
    } finally {
      setIsUploadingArch(false);
      if (archInputRef.current) archInputRef.current.value = '';
    }
  };

  // Screenshot upload
  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setUploadError(null);

    const validation = storageService.validateFile(file, 'projects');
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file format.');
      return;
    }

    setIsUploadingScreenshot(true);
    try {
      const result = await storageService.uploadMedia(file, 'projects');
      setEditingProject(prev => ({
        ...prev,
        screenshots: [...(prev?.screenshots || []), result.url]
      }));
    } catch (err: any) {
      console.error('Failed to upload screenshot', err);
      setUploadError(err?.message || 'Failed to upload screenshot.');
    } finally {
      setIsUploadingScreenshot(false);
      if (screenshotInputRef.current) screenshotInputRef.current.value = '';
    }
  };

  const handleAddScreenshotUrl = () => {
    if (!newScreenshotUrl.trim()) return;
    setEditingProject(prev => ({
      ...prev,
      screenshots: [...(prev?.screenshots || []), newScreenshotUrl.trim()]
    }));
    setNewScreenshotUrl('');
  };

  const handleRemoveScreenshot = (index: number) => {
    setEditingProject(prev => ({
      ...prev,
      screenshots: (prev?.screenshots || []).filter((_, idx) => idx !== index)
    }));
  };

  // SAVE: Partial saving allowed; only title is strictly required
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !editingProject.title?.trim()) {
      alert('Project Title is required.');
      return;
    }

    // URL Validator: Validates ONLY when user actually enters a value!
    const isValidUrlInput = (url?: string): boolean => {
      if (!url || !url.trim()) return true; // Empty is valid
      try {
        const trimmed = url.trim();
        if (trimmed.includes(' ')) return false;
        const candidate = trimmed.includes('://') ? trimmed : `https://${trimmed}`;
        const parsed = new URL(candidate);
        const host = parsed.hostname;
        if (!host || host.includes('..') || host.endsWith('-') || host.startsWith('-')) return false;
        return host === 'localhost' || host.includes('.');
      } catch {
        return false;
      }
    };

    const normalizeUrl = (url?: string): string => {
      if (!url) return '';
      const trimmed = url.trim();
      if (!trimmed) return '';
      if (/^https?:\/\//i.test(trimmed)) return trimmed;
      return `https://${trimmed}`;
    };

    if (editingProject.github_url?.trim() && !isValidUrlInput(editingProject.github_url)) {
      alert('Please enter a valid GitHub Repository URL (or leave blank).');
      return;
    }
    if (editingProject.live_url?.trim() && !isValidUrlInput(editingProject.live_url)) {
      alert('Please enter a valid Live Demo / Deployment URL (or leave blank).');
      return;
    }
    if (editingProject.demo_video_url?.trim() && !isValidUrlInput(editingProject.demo_video_url)) {
      alert('Please enter a valid Demo Video URL (or leave blank).');
      return;
    }
    if (editingProject.documentation_url?.trim() && !isValidUrlInput(editingProject.documentation_url)) {
      alert('Please enter a valid Documentation / Paper URL (or leave blank).');
      return;
    }

    setIsSaving(true);
    try {
      const slug = editingProject.slug?.trim() || editingProject.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const techStack = techStackInput.split(',').map(s => s.trim()).filter(Boolean);
      const features = featuresInput.split('\n').map(s => s.trim()).filter(Boolean);

      const finalProject: Project = {
        id: editingProject.id || `proj_${Date.now()}`,
        world_id: editingProject.world_id || worlds[0]?.id || '',
        title: editingProject.title.trim(),
        slug,
        short_description: editingProject.short_description || '',
        full_description: editingProject.full_description || '',
        problem: editingProject.problem || '',
        solution: editingProject.solution || '',
        ai_ml_approach: editingProject.ai_ml_approach || '',
        models_methods: editingProject.models_methods || '',
        dataset_info: editingProject.dataset_info || '',
        architecture_diagram: editingProject.architecture_diagram || '',
        architecture_description: editingProject.architecture_description || '',
        thumbnail_url: editingProject.thumbnail_url || '',
        tech_stack: techStack,
        features,
        my_contribution: editingProject.my_contribution || '',
        challenges: editingProject.challenges || '',
        solutions_developed: editingProject.solutions_developed || '',
        learnings: editingProject.learnings || '',
        github_url: normalizeUrl(editingProject.github_url),
        live_url: normalizeUrl(editingProject.live_url),
        demo_video_url: normalizeUrl(editingProject.demo_video_url),
        documentation_url: normalizeUrl(editingProject.documentation_url),
        screenshots: editingProject.screenshots || [],
        project_date: editingProject.project_date || new Date().toISOString().slice(0, 7),
        status: (editingProject.status as ProjectStatus) || 'completed',
        is_featured: !!editingProject.is_featured,
        display_order: editingProject.display_order || projects.length + 1
      };

      await dbService.saveProject(finalProject);
      await refreshData();
      setIsModalOpen(false);
      setEditingProject(null);
      setStatusMessage({ text: `Project "${finalProject.title}" saved successfully.`, type: 'success' });
    } catch (err: any) {
      console.error('Failed to save project', err);
      alert(`Error saving project mission: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Add Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
            Project Missions & Planetary Case Studies
          </h2>
          <p className="text-xs font-mono text-cyan-400">
            {projects.length} Total Registered Missions ({projects.filter(p => p.is_featured).length} Featured)
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow-glow-cyan flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Project Mission
        </button>
      </div>

      {statusMessage && (
        <div className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300' 
            : 'bg-red-950/70 border-red-500/40 text-red-300'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Projects List / Empty State */}
      {projects.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-space-900/50 border border-slate-800 text-slate-400 font-mono space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <p className="text-sm text-slate-300">No projects found in this sector.</p>
          <p className="text-xs text-slate-500">Deploy your first project mission manually or sync from your resume.</p>
          <button
            onClick={handleOpenNew}
            className="px-5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold uppercase transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> [ ➕ ADD NEW PROJECT ]
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj) => {
            const world = worlds.find(w => w.id === proj.world_id);
            return (
              <div
                key={proj.id}
                className="p-5 rounded-2xl bg-space-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 uppercase">
                      {world?.name || 'UNASSIGNED SECTOR'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-space-850 text-slate-400 border border-slate-700 uppercase">
                        {proj.status.replace('_', ' ')}
                      </span>
                      {proj.is_featured && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30">
                          FEATURED
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base font-bold font-display text-white mb-1">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-2 mb-3">
                    {proj.short_description || proj.full_description || 'No description provided.'}
                  </p>

                  {/* Tech stack pills */}
                  {proj.tech_stack && proj.tech_stack.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {proj.tech_stack.slice(0, 3).map((t, idx) => (
                        <span key={idx} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-space-850 text-cyan-300 border border-slate-800">
                          {t}
                        </span>
                      ))}
                      {proj.tech_stack.length > 3 && (
                        <span className="text-[10px] font-mono text-slate-500 self-center">
                          +{proj.tech_stack.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {proj.github_url && <span title="GitHub Repository"><GithubIcon className="w-3.5 h-3.5 text-slate-400" /></span>}
                    {proj.live_url && <span title="Live Deployment"><ExternalLink className="w-3.5 h-3.5 text-cyan-400" /></span>}
                    {proj.demo_video_url && <span title="Demo Video"><PlayCircle className="w-3.5 h-3.5 text-purple-400" /></span>}
                    {proj.documentation_url && <span title="Documentation / Paper"><FileText className="w-3.5 h-3.5 text-emerald-400" /></span>}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Duplicate button */}
                    <button
                      onClick={() => handleDuplicate(proj)}
                      className="p-1.5 rounded-lg bg-space-850 hover:bg-space-800 text-slate-300 hover:text-cyan-300 transition-colors"
                      title="Clone / Duplicate Case Study"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {/* Edit button */}
                    <button
                      onClick={() => handleOpenEdit(proj)}
                      className="p-1.5 rounded-lg bg-space-850 hover:bg-space-800 text-cyan-400 transition-colors"
                      title="Edit Mission"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(proj.id)}
                      className="p-1.5 rounded-lg bg-space-850 hover:bg-red-950/50 text-red-400 transition-colors"
                      title="Decommission Mission"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Comprehensive Add/Edit Modal */}
      {isModalOpen && editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-space-950/85 backdrop-blur-xl overflow-y-auto">
          <div className="relative w-full max-w-4xl my-auto rounded-3xl bg-space-900 border border-cyan-500/30 shadow-2xl p-6 sm:p-8 text-slate-100 max-h-[92vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold font-display text-white mb-2">
              {editingProject.id?.includes('copy') || editingProject.title?.includes('(Copy)')
                ? 'Clone & Configure Mission' 
                : editingProject.title ? `Edit: ${editingProject.title}` : 'Deploy New Mission Case Study'}
            </h3>
            <p className="text-xs font-mono text-cyan-400 mb-6">
              Only Project Title is required. Partial saving is fully supported so you can build drafts incrementally.
            </p>

            {/* Section Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-6 overflow-x-auto text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'basic' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white bg-space-850'
                }`}
              >
                1. Basic & Scope
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('aiml')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'aiml' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white bg-space-850'
                }`}
              >
                2. AI/ML & Problem/Solution
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('media')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'media' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white bg-space-850'
                }`}
              >
                3. Media & Architecture
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('links')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'links' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white bg-space-850'
                }`}
              >
                4. Links & Learnings
              </button>
            </div>

            {uploadError && (
              <div className="p-3 mb-4 rounded-xl bg-red-950/70 border border-red-500/40 text-red-300 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6 text-xs font-mono">
              {/* TAB 1: BASIC INFORMATION & CLASSIFICATION */}
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 mb-1">PROJECT NAME / TITLE *</label>
                      <input
                        type="text"
                        required
                        value={editingProject.title || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                        placeholder="e.g. Distributed Neural Agent Swarm"
                        className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1">AI WORLD / CATEGORY</label>
                      <select
                        value={editingProject.world_id || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, world_id: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                      >
                        {worlds.map(w => (
                          <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-300 mb-1">PROJECT STATUS</label>
                      <select
                        value={editingProject.status || 'completed'}
                        onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value as ProjectStatus })}
                        className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                      >
                        <option value="completed">Completed</option>
                        <option value="in_development">In Development</option>
                        <option value="research">Research / Experimental</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1">PROJECT DATE</label>
                      <input
                        type="text"
                        value={editingProject.project_date || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, project_date: e.target.value })}
                        placeholder="e.g. 2025 - Present or Jan 2026"
                        className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                      />
                    </div>

                    <div className="flex items-center pt-6">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={editingProject.is_featured || false}
                          onChange={(e) => setEditingProject({ ...editingProject, is_featured: e.target.checked })}
                          className="w-4 h-4 rounded bg-space-950 border-slate-700 text-cyan-500"
                        />
                        <span>Featured Project Toggle</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">SHORT DESCRIPTION (FOR CARDS)</label>
                    <input
                      type="text"
                      value={editingProject.short_description || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, short_description: e.target.value })}
                      placeholder="Concise 1-2 sentence executive summary..."
                      className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">FULL DESCRIPTION (CASE STUDY OVERVIEW)</label>
                    <textarea
                      rows={4}
                      value={editingProject.full_description || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, full_description: e.target.value })}
                      placeholder="Comprehensive overview of mission architecture, background, and scope..."
                      className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">TECHNOLOGIES / TECH STACK (COMMA-SEPARATED)</label>
                    <input
                      type="text"
                      value={techStackInput}
                      onChange={(e) => setTechStackInput(e.target.value)}
                      placeholder="PyTorch, LangGraph, FastAPI, ChromaDB, CUDA, Next.js"
                      className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                    />
                    {techStackInput && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {techStackInput.split(',').map(s => s.trim()).filter(Boolean).map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[10px]">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: AI/ML INFORMATION, PROBLEM & SOLUTION, FEATURES */}
              {activeTab === 'aiml' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 mb-1">PROBLEM STATEMENT</label>
                      <textarea
                        rows={3}
                        value={editingProject.problem || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, problem: e.target.value })}
                        placeholder="What bottleneck, challenge, or algorithmic constraint did you solve?"
                        className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1">SOLUTION ARCHITECTURE</label>
                      <textarea
                        rows={3}
                        value={editingProject.solution || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, solution: e.target.value })}
                        placeholder="How the system addresses the challenge technically..."
                        className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">AI / ML APPROACH & METHODOLOGY</label>
                    <textarea
                      rows={3}
                      value={editingProject.ai_ml_approach || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, ai_ml_approach: e.target.value })}
                      placeholder="Explain the neural pipelines, loss functions, embedding strategies, or multi-agent loops..."
                      className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 mb-1">MODELS / METHODS</label>
                      <input
                        type="text"
                        value={editingProject.models_methods || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, models_methods: e.target.value })}
                        placeholder="e.g. Llama-3-70B, DINOv2, LoRA fine-tuning, BM25 + Cross-Encoder"
                        className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1">DATASET / BENCHMARKS INFORMATION</label>
                      <input
                        type="text"
                        value={editingProject.dataset_info || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, dataset_info: e.target.value })}
                        placeholder="e.g. 50k domain synthetic tokens, ImageNet-1k, proprietary telemetry"
                        className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">KEY FEATURES (ONE PER LINE)</label>
                    <textarea
                      rows={4}
                      value={featuresInput}
                      onChange={(e) => setFeaturesInput(e.target.value)}
                      placeholder="Sub-15ms vector retrieval latency&#10;Autonomous tool calling loop with state verification&#10;Zero-shot transfer across 8 modalities"
                      className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: MEDIA & ARCHITECTURE */}
              {activeTab === 'media' && (
                <div className="space-y-6">
                  {/* PROJECT THUMBNAIL */}
                  <div className="p-4 rounded-2xl bg-space-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-cyan-400" /> PROJECT THUMBNAIL
                      </span>
                      {isUploadingThumbnail && (
                        <span className="text-cyan-300 flex items-center gap-1 animate-pulse">
                          <RefreshCw className="w-3 h-3 animate-spin" /> Uploading...
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <div>
                        <label className="block text-slate-400 mb-1">IMAGE URL</label>
                        <input
                          type="text"
                          value={editingProject.thumbnail_url || ''}
                          onChange={(e) => setEditingProject({ ...editingProject, thumbnail_url: e.target.value })}
                          placeholder="https://... or upload below"
                          className="w-full px-3 py-2 rounded-xl bg-space-900 border border-slate-700 text-white focus:border-cyan-400"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">OR DIRECT FILE UPLOAD</label>
                        <input
                          type="file"
                          ref={thumbnailInputRef}
                          onChange={handleThumbnailUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => thumbnailInputRef.current?.click()}
                          disabled={isUploadingThumbnail}
                          className="w-full py-2 px-3 rounded-xl bg-space-850 hover:bg-space-800 border border-cyan-500/30 text-cyan-300 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Upload className="w-4 h-4" /> [ 🖼️ Upload Thumbnail ]
                        </button>
                      </div>
                    </div>

                    {editingProject.thumbnail_url && (
                      <div className="flex items-center gap-3 p-2 rounded-xl bg-space-900 border border-slate-800">
                        <img
                          src={editingProject.thumbnail_url}
                          alt="Thumbnail preview"
                          className="w-16 h-12 object-cover rounded-lg"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="block text-[10px] text-slate-400 truncate">
                            {editingProject.thumbnail_url}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingProject({ ...editingProject, thumbnail_url: '' })}
                          className="p-1 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* ARCHITECTURE DIAGRAM */}
                  <div className="p-4 rounded-2xl bg-space-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-purple-400" /> SYSTEM ARCHITECTURE DIAGRAM
                      </span>
                      {isUploadingArch && (
                        <span className="text-purple-300 flex items-center gap-1 animate-pulse">
                          <RefreshCw className="w-3 h-3 animate-spin" /> Uploading...
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <div>
                        <label className="block text-slate-400 mb-1">IMAGE URL OR ASCII / MERMAID</label>
                        <input
                          type="text"
                          value={editingProject.architecture_diagram || ''}
                          onChange={(e) => setEditingProject({ ...editingProject, architecture_diagram: e.target.value })}
                          placeholder="https://... or diagram text"
                          className="w-full px-3 py-2 rounded-xl bg-space-900 border border-slate-700 text-white focus:border-cyan-400"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">OR UPLOAD DIAGRAM IMAGE</label>
                        <input
                          type="file"
                          ref={archInputRef}
                          onChange={handleArchUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => archInputRef.current?.click()}
                          disabled={isUploadingArch}
                          className="w-full py-2 px-3 rounded-xl bg-space-850 hover:bg-space-800 border border-purple-500/30 text-purple-300 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Upload className="w-4 h-4" /> [ 📐 Upload Architecture Diagram ]
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">ARCHITECTURE DESCRIPTION</label>
                      <textarea
                        rows={2}
                        value={editingProject.architecture_description || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, architecture_description: e.target.value })}
                        placeholder="Explain system components, data ingress, model serving, and feedback loops..."
                        className="w-full px-3 py-2 rounded-xl bg-space-900 border border-slate-700 text-white focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  {/* PROJECT SCREENSHOTS */}
                  <div className="p-4 rounded-2xl bg-space-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-emerald-400" /> PROJECT SCREENSHOTS (MULTIPLE)
                      </span>
                      {isUploadingScreenshot && (
                        <span className="text-emerald-300 flex items-center gap-1 animate-pulse">
                          <RefreshCw className="w-3 h-3 animate-spin" /> Uploading screenshot...
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                      <div className="sm:col-span-7">
                        <label className="block text-slate-400 mb-1">ADD SCREENSHOT BY URL</label>
                        <input
                          type="text"
                          value={newScreenshotUrl}
                          onChange={(e) => setNewScreenshotUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full px-3 py-2 rounded-xl bg-space-900 border border-slate-700 text-white focus:border-cyan-400"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <button
                          type="button"
                          onClick={handleAddScreenshotUrl}
                          className="w-full py-2 rounded-xl bg-space-850 hover:bg-space-800 text-cyan-300 border border-cyan-500/30 font-bold"
                        >
                          Add URL
                        </button>
                      </div>
                      <div className="sm:col-span-3">
                        <input
                          type="file"
                          ref={screenshotInputRef}
                          onChange={handleScreenshotUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => screenshotInputRef.current?.click()}
                          disabled={isUploadingScreenshot}
                          className="w-full py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 flex items-center justify-center gap-1 font-bold"
                        >
                          <Upload className="w-3.5 h-3.5" /> Upload File
                        </button>
                      </div>
                    </div>

                    {/* Screenshots Gallery List */}
                    {editingProject.screenshots && editingProject.screenshots.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                        {editingProject.screenshots.map((shot, idx) => (
                          <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-800 group">
                            <img src={shot} alt={`Screenshot ${idx + 1}`} className="w-full h-20 object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveScreenshot(idx)}
                              className="absolute top-1 right-1 p-1 rounded-md bg-red-950/80 text-red-300 hover:text-white opacity-90 group-hover:opacity-100 transition-opacity"
                              title="Remove screenshot"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: LINKS, CONTRIBUTION & LEARNINGS */}
              {activeTab === 'links' && (
                <div className="space-y-6">
                  {/* PROJECT LINKS (OPTIONAL) */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-space-950 border border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2">
                        <Compass className="w-4 h-4 text-cyan-400" />
                        <h4 className="font-bold text-slate-200 uppercase tracking-wider text-xs font-mono">
                          Project Links (Optional)
                        </h4>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        None of these fields are required • Leave empty if not applicable or not deployed yet
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* 1. GitHub Repository URL */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-slate-300 text-xs font-mono flex items-center gap-1.5 font-bold">
                            <GithubIcon className="w-3.5 h-3.5 text-slate-400" />
                            GITHUB REPOSITORY URL
                          </label>
                          <span className="text-[10px] font-mono text-slate-400">Optional</span>
                        </div>
                        <input
                          type="text"
                          value={editingProject.github_url || ''}
                          onChange={(e) => setEditingProject({ ...editingProject, github_url: e.target.value })}
                          placeholder="https://github.com/username/project (or leave empty)"
                          className="w-full px-3 py-2 rounded-xl bg-space-900 border border-slate-700 text-white focus:border-cyan-400 text-xs font-mono"
                        />
                      </div>

                      {/* 2. Live Demo / Deployment URL */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-slate-300 text-xs font-mono flex items-center gap-1.5 font-bold">
                            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                            LIVE DEMO / DEPLOYMENT URL
                          </label>
                          <span className="text-[10px] font-mono text-slate-400">Optional</span>
                        </div>
                        <input
                          type="text"
                          value={editingProject.live_url || ''}
                          onChange={(e) => setEditingProject({ ...editingProject, live_url: e.target.value })}
                          placeholder="https://... (or leave empty if not deployed yet)"
                          className="w-full px-3 py-2 rounded-xl bg-space-900 border border-slate-700 text-white focus:border-cyan-400 text-xs font-mono"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                          Optional: Projects in research or development may not be deployed yet.
                        </p>
                      </div>

                      {/* 3. Demo Video URL */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-slate-300 text-xs font-mono flex items-center gap-1.5 font-bold">
                            <PlayCircle className="w-3.5 h-3.5 text-purple-400" />
                            DEMO VIDEO URL
                          </label>
                          <span className="text-[10px] font-mono text-slate-400">Optional</span>
                        </div>
                        <input
                          type="text"
                          value={editingProject.demo_video_url || ''}
                          onChange={(e) => setEditingProject({ ...editingProject, demo_video_url: e.target.value })}
                          placeholder="https://youtube.com/watch?... or loom (or leave empty)"
                          className="w-full px-3 py-2 rounded-xl bg-space-900 border border-slate-700 text-white focus:border-cyan-400 text-xs font-mono"
                        />
                      </div>

                      {/* 4. Documentation / Paper URL */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-slate-300 text-xs font-mono flex items-center gap-1.5 font-bold">
                            <FileText className="w-3.5 h-3.5 text-emerald-400" />
                            DOCUMENTATION / PAPER URL
                          </label>
                          <span className="text-[10px] font-mono text-slate-400">Optional</span>
                        </div>
                        <input
                          type="text"
                          value={editingProject.documentation_url || ''}
                          onChange={(e) => setEditingProject({ ...editingProject, documentation_url: e.target.value })}
                          placeholder="https://arxiv.org/abs/... or docs link (or leave empty)"
                          className="w-full px-3 py-2 rounded-xl bg-space-900 border border-slate-700 text-white focus:border-cyan-400 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">MY CONTRIBUTION / LEADERSHIP ROLE</label>
                    <textarea
                      rows={2}
                      value={editingProject.my_contribution || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, my_contribution: e.target.value })}
                      placeholder="Individual contributions, architectural designs, algorithms implemented..."
                      className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-300 mb-1">CHALLENGES</label>
                      <textarea
                        rows={3}
                        value={editingProject.challenges || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, challenges: e.target.value })}
                        placeholder="GPU memory bounds, latency constraints, domain drift..."
                        className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1">SOLUTIONS DEVELOPED</label>
                      <textarea
                        rows={3}
                        value={editingProject.solutions_developed || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, solutions_developed: e.target.value })}
                        placeholder="FlashAttention-2 integration, caching layer, quantization..."
                        className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1">KEY LEARNINGS</label>
                      <textarea
                        rows={3}
                        value={editingProject.learnings || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, learnings: e.target.value })}
                        placeholder="Engineering takeaways, system design insights..."
                        className="w-full px-3 py-2 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* MODAL BOTTOM ACTION BUTTONS */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-800">
                <div className="text-[11px] text-slate-400">
                  {editingProject.id?.includes('copy') ? 'Cloned Draft' : 'Direct Database Sync'}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-space-850 text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold uppercase transition-all shadow-glow-cyan flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> {isSaving ? 'Saving Mission...' : 'Save Mission'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
