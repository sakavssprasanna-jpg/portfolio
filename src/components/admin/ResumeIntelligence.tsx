import React, { useState } from 'react';
import { extractTextFromPDF } from '../../lib/pdfParser';
import { extractResumeDataWithDiagnostics } from '../../lib/aiExtractor';
import { generateResumeChangeReport, mergeProjectWithPreservation, mergeCustomSectionWithPreservation } from '../../lib/duplicateDetector';
import { dbService } from '../../services/db';
import { useUniverse } from '../../context/UniverseContext';
import { 
  ResumeChangeReport, 
  ProposedChangeItem, 
  ChangeResolution,
  ResumeItemGroup,
  ItemChangeStatus,
  ExtractionDiagnostics 
} from '../../types/resume';
import { Project, ResumeVersion, Skill, JourneyEntry, Achievement, ResumeCustomSection } from '../../types/database';
import confetti from 'canvas-confetti';
import { 
  Upload, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  ArrowRight, 
  Edit3, 
  Check, 
  RefreshCw,
  Layers,
  Database,
  Info,
  Columns,
  Eye,
  X,
  Save,
  Tag,
  Calendar,
  ExternalLink,
  Shield,
  Clock,
  Terminal
} from 'lucide-react';
import { AIRobot, RobotState } from '../robot/AIRobot';

export const ResumeIntelligence: React.FC = () => {
  const { 
    profile, 
    worlds, 
    projects, 
    skills, 
    journey, 
    achievements, 
    approvedResume,
    refreshData 
  } = useUniverse();

  const [file, setFile] = useState<File | null>(null);
  const [versionName, setVersionName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processStatus, setProcessStatus] = useState<string>('');
  const [report, setReport] = useState<ResumeChangeReport | null>(null);
  const [syncComplete, setSyncComplete] = useState<boolean>(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<ExtractionDiagnostics | null>(null);
  const [showDebugPanel, setShowDebugPanel] = useState<boolean>(true);
  
  // Filtering states for Change Report
  const [activeGroupFilter, setActiveGroupFilter] = useState<string>('ALL');
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('ALL');
  
  // Item detail / diff toggles
  const [expandedDiffs, setExpandedDiffs] = useState<Record<string, boolean>>({});
  
  // Inline editing modal state
  const [editingItem, setEditingItem] = useState<ProposedChangeItem | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});

  // Derive robot state and speech
  const getRobotTelemetry = (): { state: RobotState; message: string } => {
    if (isProcessing) {
      return { 
        state: 'processing', 
        message: 'Analyzing your latest mission profile with zero hallucination...' 
      };
    }
    if (extractionError) {
      return {
        state: 'alert',
        message: `Extraction notice: ${extractionError} Please review diagnostics or retry.`
      };
    }
    if (syncComplete) {
      return { 
        state: 'success', 
        message: 'Universe synchronized! Manual architectures and links preserved.' 
      };
    }
    if (report) {
      const dups = report.duplicateItemsCount;
      if (dups > 0) {
        return { 
          state: 'alert', 
          message: `${report.items.length} items parsed. ${dups} potential overlaps detected for your review.` 
        };
      }
      return { 
        state: 'success', 
        message: `Extraction complete: ${report.newItemsCount} new items ready for universe sync!` 
      };
    }
    if (file) {
      return { 
        state: 'scanning', 
        message: `Dossier selected: "${file.name}". Ready to extract mission telemetry.` 
      };
    }
    return { 
      state: 'idle', 
      message: 'Awaiting new mission dossier. Upload your PDF or TXT resume to begin.' 
    };
  };

  const robotTelemetry = getRobotTelemetry();

  // File selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setExtractionError(null);
      if (!versionName) {
        setVersionName(`Resume v${new Date().toISOString().slice(0, 10)}`);
      }
    }
  };

  // Run AI Resume Extraction & Generate Change Report
  const handleStartExtraction = async () => {
    if (!file) return;

    setIsProcessing(true);
    setSyncComplete(false);
    setExtractionError(null);
    setReport(null);

    try {
      setProcessStatus('Reading raw binary stream and reconstructing text lines...');
      const rawText = await extractTextFromPDF(file);

      if (!rawText || rawText.trim().length === 0) {
        throw new Error('Could not extract readable text from this PDF. Please upload a text-based PDF.');
      }

      setProcessStatus('Extracting telemetry with Deterministic AI Engine (Zero-Hallucination Mode)...');
      const extractionResult = await extractResumeDataWithDiagnostics(rawText);
      setDiagnostics(extractionResult.diagnostics);

      setProcessStatus('Running multi-category duplicate detector & manual data preservation audit...');
      const existingCustomSections = await dbService.getCustomSections();
      const changeReport = generateResumeChangeReport(
        extractionResult.data,
        {
          profile: profile || {
            id: 'veera-core-profile',
            full_name: 'VEERA SATYA SAI PRASANNA',
            headline: 'AI/ML • GenAI • Intelligent Systems',
            bio: '',
            email: '',
            location: '',
            avatar_url: '',
            github_url: '',
            linkedin_url: '',
            twitter_url: '',
            website_url: ''
          },
          worlds,
          projects,
          skills,
          journey,
          achievements,
          customSections: existingCustomSections
        },
        versionName || `Resume v${new Date().toISOString().slice(0, 10)}`
      );

      setReport(changeReport);
      // Expand diffs for items that are UPDATED or POSSIBLE DUPLICATE by default
      const initialExp: Record<string, boolean> = {};
      changeReport.items.forEach(i => {
        if (i.status === 'UPDATED' || i.status === 'POSSIBLE DUPLICATE') {
          initialExp[i.id] = true;
        }
      });
      setExpandedDiffs(initialExp);
    } catch (err: any) {
      console.error('Extraction error:', err);
      const userMessage = err?.message || 'Unable to extract information from this resume.';
      setExtractionError(userMessage);
      setDiagnostics(prev => prev || {
        pdfUploaded: Boolean(file),
        pdfTextExtracted: false,
        charactersExtracted: 0,
        aiConfigured: Boolean(import.meta.env.VITE_GEMINI_API_KEY),
        aiRequestStatus: 'failed',
        aiErrorMessage: userMessage,
        structuredResponseValid: false,
        itemsExtractedCount: 0
      });
    } finally {
      setIsProcessing(false);
      setProcessStatus('');
    }
  };

  // Toggle approval for an individual change item
  const handleToggleApproval = (itemId: string) => {
    if (!report) return;
    setReport({
      ...report,
      items: report.items.map(item =>
        item.id === itemId ? { ...item, isApproved: !item.isApproved } : item
      )
    });
  };

  // Set resolution strategy for duplicate items
  const handleSetResolution = (itemId: string, resolution: ChangeResolution) => {
    if (!report) return;
    setReport({
      ...report,
      items: report.items.map(item =>
        item.id === itemId ? { ...item, resolution } : item
      )
    });
  };

  // Bulk approval actions
  const handleApproveAll = () => {
    if (!report) return;
    setReport({
      ...report,
      items: report.items.map(item => ({ ...item, isApproved: true }))
    });
  };

  const handleApproveNewAndUpdatedOnly = () => {
    if (!report) return;
    setReport({
      ...report,
      items: report.items.map(item => ({
        ...item,
        isApproved: item.status === 'NEW' || item.status === 'UPDATED'
      }))
    });
  };

  const handleDeselectAll = () => {
    if (!report) return;
    setReport({
      ...report,
      items: report.items.map(item => ({ ...item, isApproved: false }))
    });
  };

  // Toggle diff view for an item
  const toggleDiff = (itemId: string) => {
    setExpandedDiffs(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  // Open inline edit modal
  const handleOpenEditModal = (item: ProposedChangeItem) => {
    setEditingItem(item);
    setEditFormData(JSON.parse(JSON.stringify(item.userEditedData || item.incomingData)));
  };

  // Save changes from inline edit modal
  const handleSaveEdit = () => {
    if (!editingItem || !report) return;
    
    setReport({
      ...report,
      items: report.items.map(item => {
        if (item.id === editingItem.id) {
          return {
            ...item,
            userEditedData: editFormData,
            incomingData: editFormData,
            title: editFormData.title || editFormData.full_name || editFormData.name || item.title
          };
        }
        return item;
      })
    });
    setEditingItem(null);
  };

  // Save and synchronize approved changes to database
  const handleCommitToDatabase = async () => {
    if (!report) return;

    setIsProcessing(true);
    setProcessStatus('Applying approved changes to database with strict manual data preservation...');

    try {
      const approvedItems = report.items.filter(item => item.isApproved);
      const newResumeId = `resume_${Date.now()}`;

      for (const item of approvedItems) {
        if (item.resolution === 'KEEP_EXISTING' && item.isDuplicate) {
          continue;
        }

        const effectiveData = item.userEditedData || item.incomingData;

        switch (item.entityType) {
          case 'profile':
            await dbService.updateProfile(effectiveData);
            break;

          case 'link':
            await dbService.updateProfile(effectiveData);
            break;

          case 'project': {
            if (item.isDuplicate && item.existingData && item.resolution === 'MERGE') {
              // MERGE: Preserve manual architecture diagrams, live URLs, and learnings
              const merged = mergeProjectWithPreservation(item.existingData as Project, effectiveData);
              await dbService.saveProject(merged);
            } else {
              // INSERT OR REPLACE
              await dbService.saveProject({
                id: item.existingData?.id || `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                ...effectiveData
              } as Project);
            }
            break;
          }

          case 'skill':
            await dbService.saveSkill(effectiveData as Skill);
            break;

          case 'journey':
            await dbService.saveJourneyEntry(effectiveData as JourneyEntry);
            break;

          case 'achievement':
          case 'certification':
            await dbService.saveAchievement(effectiveData as Achievement);
            break;

          case 'custom_section': {
            const sectionToSave: ResumeCustomSection = {
              ...effectiveData,
              resume_id: newResumeId
            };
            if (item.isDuplicate && item.existingData && item.resolution === 'MERGE') {
              const merged = mergeCustomSectionWithPreservation(item.existingData as ResumeCustomSection, sectionToSave);
              await dbService.saveCustomSection(merged);
            } else {
              await dbService.saveCustomSection(sectionToSave);
            }
            break;
          }
        }
      }

      // Record Resume Version
      if (file) {
        const savedCustomSections = await dbService.getCustomSections(newResumeId);
        const newResumeVersion: ResumeVersion = {
          id: newResumeId,
          file_name: file.name,
          file_url: URL.createObjectURL(file),
          version_name: report.resumeVersionName,
          upload_date: new Date().toISOString(),
          is_current_approved: true,
          custom_sections: savedCustomSections
        };
        await dbService.saveResumeVersion(newResumeVersion);
      }

      await refreshData();

      setSyncComplete(true);
      setReport(null);
      setFile(null);

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error('Failed to commit changes:', err);
      alert('Commit to database failed.');
    } finally {
      setIsProcessing(false);
      setProcessStatus('');
    }
  };

  // Helper for status badge styling
  const renderStatusBadge = (status: ItemChangeStatus) => {
    switch (status) {
      case 'NEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 shadow-sm shadow-emerald-950">
            [ NEW ]
          </span>
        );
      case 'UPDATED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-950">
            [ UPDATED ]
          </span>
        );
      case 'POSSIBLE DUPLICATE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-950/80 text-amber-300 border border-amber-500/50 shadow-sm shadow-amber-950">
            <AlertTriangle className="w-2.5 h-2.5" />
            [ POSSIBLE DUPLICATE ]
          </span>
        );
      case 'UNCHANGED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-900/80 text-slate-400 border border-slate-700/60">
            [ UNCHANGED ]
          </span>
        );
    }
  };

  // Filter items
  const filteredItems = (report?.items || []).filter(item => {
    if (activeGroupFilter !== 'ALL' && item.group !== activeGroupFilter) return false;
    if (activeStatusFilter !== 'ALL' && item.status !== activeStatusFilter) return false;
    return true;
  });

  // Calculate distinct available groups for tabs
  const availableGroups = report
    ? Array.from(new Set(report.items.map(i => i.group))) as ResumeItemGroup[]
    : [];

  return (
    <div className="space-y-8">
      {/* ==================================================== */}
      {/* 1. HEADER TELEMETRY PANEL WITH COMPANION ROBOT */}
      {/* ==================================================== */}
      <div className="p-6 sm:p-8 rounded-3xl bg-space-900/90 border border-cyan-500/30 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 text-xs font-mono border border-cyan-500/40">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>AUTONOMOUS RESUME INTELLIGENCE</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-wide">
              Resume Ingestion & Synchronization Engine
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
              Maintain an exact, verified reflection of your career dossier. Ingest PDF or TXT resumes with zero hallucination, inspect side-by-side database diffs across 9 telemetry sectors, and ensure manual project architectures are strictly preserved.
            </p>
          </div>

          {/* Interactive AI Robot Companion */}
          <div className="flex-shrink-0 flex items-center justify-center p-3 rounded-2xl bg-space-950/60 border border-cyan-500/20">
            <AIRobot
              variant="nova"
              state={robotTelemetry.state}
              size="md"
              message={robotTelemetry.message}
              showHologram={true}
              hologramText={isProcessing ? 'SCANNING' : (report ? 'REPORT READY' : 'STANDBY')}
            />
          </div>
        </div>
      </div>

      {/* Sync Complete Banner */}
      {syncComplete && (
        <div className="p-6 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 flex items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-900/60 border border-emerald-400/40 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold font-display text-white">
                Universe Telemetry Synchronized Successfully
              </h4>
              <p className="text-xs text-emerald-300/90 font-mono mt-0.5">
                Approved resume items and versions have committed to the live database. Manual architectures and URLs were fully preserved.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSyncComplete(false)}
            className="px-4 py-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-xs font-mono text-white transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ==================================================== */}
      {/* EXTRACTION RUNNING BANNER */}
      {/* ==================================================== */}
      {isProcessing && (
        <div className="p-8 rounded-3xl bg-gradient-to-r from-space-950 via-space-900 to-cyan-950/40 border border-cyan-500/40 backdrop-blur-2xl relative overflow-hidden shadow-2xl animate-pulse">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-cyan-950 border border-cyan-400/50 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
              </div>
              <div className="absolute -inset-1 rounded-2xl border border-cyan-500/40 animate-ping pointer-events-none" />
            </div>

            <div className="space-y-1.5 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
                <Shield className="w-3 h-3 text-cyan-400" />
                <span>ZERO-HALLUCINATION VERIFICATION</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-display text-white">
                Analyzing your latest mission profile...
              </h3>
              <p className="text-xs font-mono text-cyan-300/90">
                {processStatus || 'Parsing telemetry stream and cross-referencing universe database...'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* EXTRACTION ERROR PANEL (SECTION 2 & 13) */}
      {/* ==================================================== */}
      {extractionError && (
        <div className="p-6 sm:p-8 rounded-3xl bg-red-950/70 border border-red-500/50 text-red-200 space-y-4 shadow-2xl animate-shake">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-900/60 border border-red-400/40 flex items-center justify-center flex-shrink-0 text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-900/40 text-red-300 text-[10px] font-mono border border-red-500/30">
                <span>EXTRACTION FAULT DETECTED</span>
              </div>
              <h3 className="text-lg font-bold font-display text-white uppercase tracking-wider">
                RESUME EXTRACTION FAILED
              </h3>
              <p className="text-xs text-red-200 font-sans">
                Unable to extract information from this resume.
              </p>
              <div className="text-xs font-mono text-red-300 bg-red-950/90 p-3 rounded-xl border border-red-500/30 mt-2">
                <span className="text-red-400 font-bold">Failure Reason: </span>
                <span>{extractionError}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-red-900/50">
            <button
              onClick={handleStartExtraction}
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-mono text-xs font-bold uppercase transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-red-950"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>[ TRY EXTRACTION AGAIN ]</span>
            </button>
            <button
              onClick={() => {
                setExtractionError(null);
                setFile(null);
              }}
              className="px-4 py-2.5 rounded-xl bg-space-850 hover:bg-space-800 text-slate-300 font-mono text-xs transition-colors cursor-pointer"
            >
              Select Different File
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* EXTRACTION DEBUG / DIAGNOSTICS PANEL (SECTION 12) */}
      {/* ==================================================== */}
      {diagnostics && (
        <div className="p-6 rounded-3xl bg-space-900/80 border border-cyan-500/25 backdrop-blur-xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-cyan-300 font-mono font-bold text-xs uppercase tracking-wider">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Extraction Pipeline Diagnostics & Telemetry</span>
            </div>
            <button
              type="button"
              onClick={() => setShowDebugPanel(!showDebugPanel)}
              className="text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              {showDebugPanel ? 'Collapse Diagnostics [-]' : 'Expand Diagnostics [+]'}
            </button>
          </div>

          {showDebugPanel && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3 rounded-xl bg-space-950 border border-slate-800 font-mono">
                  <div className="text-[10px] text-slate-400 uppercase">PDF Uploaded</div>
                  <div className="text-xs font-bold text-emerald-400 mt-1">✓ Yes</div>
                </div>

                <div className="p-3 rounded-xl bg-space-950 border border-slate-800 font-mono">
                  <div className="text-[10px] text-slate-400 uppercase">Text Extracted</div>
                  <div className={`text-xs font-bold mt-1 ${diagnostics.pdfTextExtracted ? 'text-emerald-400' : 'text-red-400'}`}>
                    {diagnostics.pdfTextExtracted ? '✓ Success' : '✕ Empty'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-space-950 border border-slate-800 font-mono">
                  <div className="text-[10px] text-slate-400 uppercase">Characters</div>
                  <div className="text-xs font-bold text-cyan-300 mt-1">
                    {diagnostics.charactersExtracted.toLocaleString()} chars
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-space-950 border border-slate-800 font-mono">
                  <div className="text-[10px] text-slate-400 uppercase">AI Configuration</div>
                  <div className={`text-xs font-bold mt-1 ${diagnostics.aiConfigured ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {diagnostics.aiConfigured ? 'Configured' : 'Missing (Local Mode)'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-space-950 border border-slate-800 font-mono">
                  <div className="text-[10px] text-slate-400 uppercase">AI Request</div>
                  <div className="text-xs font-bold text-cyan-300 mt-1 capitalize">
                    {diagnostics.aiRequestStatus}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-space-950 border border-slate-800 font-mono">
                  <div className="text-[10px] text-slate-400 uppercase">Items Extracted</div>
                  <div className="text-xs font-bold text-white mt-1">
                    {diagnostics.itemsExtractedCount} items
                  </div>
                </div>
              </div>

              {diagnostics.aiErrorMessage && (
                <div className="p-3 rounded-xl bg-space-950 border border-slate-800 text-[11px] font-mono text-slate-400">
                  <span className="text-cyan-400 font-bold">Telemetry Note: </span>
                  {diagnostics.aiErrorMessage}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* STEP 1: UPLOAD DOCUMENT CARD */}
      {/* ==================================================== */}
      {!report && !isProcessing && (
        <div className="p-8 rounded-3xl bg-space-900/70 border border-slate-800 backdrop-blur-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-sm font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
              <Upload className="w-4 h-4" /> 1. Upload Resume Document (PDF / TXT)
            </h3>
            <span className="text-[11px] font-mono text-slate-500">
              Supported: .pdf, .txt • Max 10MB
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase">
                Resume Version Label
              </label>
              <input
                type="text"
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                placeholder="e.g. Technical Dossier v2.4 (2026)"
                className="w-full px-4 py-3 rounded-xl bg-space-950 border border-slate-800 focus:border-cyan-400 text-xs text-white placeholder:text-slate-600 font-mono transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase">
                Select File
              </label>
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileChange}
                className="w-full text-xs font-mono text-slate-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-mono file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30 file:cursor-pointer cursor-pointer"
              />
            </div>
          </div>

          {file && (
            <div className="p-5 rounded-2xl bg-space-950 border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <div className="text-xs font-mono text-white font-bold">{file.name}</div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {(file.size / 1024).toFixed(1)} KB • Ready for AI extraction
                  </div>
                </div>
              </div>

              <button
                onClick={handleStartExtraction}
                disabled={isProcessing}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow-glow-cyan flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Extract & Generate Change Report</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* STEP 2: CHANGE REPORT AUDIT & SIDE-BY-SIDE REVIEW */}
      {/* ==================================================== */}
      {report && (
        <div className="space-y-6">
          {/* Top Summary & Bulk Actions */}
          <div className="p-6 sm:p-8 rounded-3xl bg-space-900 border border-cyan-500/30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xl">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-400/40 text-[10px] font-mono text-cyan-300">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>RESUME CHANGE REPORT AUDIT</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
                {report.resumeVersionName}
              </h3>
              
              {/* Telemetry counter tags */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono pt-1">
                <span className="px-3 py-1 rounded-lg bg-space-950 border border-slate-800 text-slate-300">
                  Total Items: <strong className="text-white">{report.totalChanges}</strong>
                </span>
                <span className="px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                  New: <strong>{report.newItemsCount}</strong>
                </span>
                <span className="px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                  Updated: <strong>{report.updatedItemsCount}</strong>
                </span>
                <span className="px-3 py-1 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-300">
                  Duplicates: <strong>{report.duplicateItemsCount}</strong>
                </span>
                <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
                  Unchanged: <strong>{report.unchangedItemsCount}</strong>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <button
                onClick={handleApproveAll}
                className="px-3.5 py-2 rounded-xl bg-space-850 hover:bg-space-800 border border-slate-700 text-xs font-mono text-slate-200 transition-colors cursor-pointer"
              >
                Approve All ({report.items.length})
              </button>
              <button
                onClick={handleApproveNewAndUpdatedOnly}
                className="px-3.5 py-2 rounded-xl bg-space-850 hover:bg-space-800 border border-slate-700 text-xs font-mono text-cyan-300 transition-colors cursor-pointer"
              >
                Approve New/Updated
              </button>
              <button
                onClick={handleDeselectAll}
                className="px-3.5 py-2 rounded-xl bg-space-850 hover:bg-space-800 border border-slate-700 text-xs font-mono text-slate-400 transition-colors cursor-pointer"
              >
                Clear
              </button>
              <button
                onClick={handleCommitToDatabase}
                disabled={isProcessing || report.items.filter(i => i.isApproved).length === 0}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow-glow-cyan flex items-center gap-2 cursor-pointer ml-auto sm:ml-0"
              >
                <Check className="w-4 h-4" />
                <span>Sync Universe ({report.items.filter(i => i.isApproved).length})</span>
              </button>
            </div>
          </div>

          {/* Group Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
            <button
              onClick={() => setActiveGroupFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                activeGroupFilter === 'ALL'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400'
                  : 'bg-space-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              ALL SECTORS ({report.items.length})
            </button>
            {availableGroups.map((grp) => {
              const count = report.items.filter(i => i.group === grp).length;
              return (
                <button
                  key={grp}
                  onClick={() => setActiveGroupFilter(grp)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                    activeGroupFilter === grp
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400'
                      : 'bg-space-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {grp} ({count})
                </button>
              );
            })}
          </div>

          {/* Status Filter Sub-bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px] uppercase">Status Filter:</span>
              {(['ALL', 'NEW', 'UPDATED', 'POSSIBLE DUPLICATE', 'UNCHANGED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setActiveStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                    activeStatusFilter === st
                      ? 'bg-slate-700 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="text-[11px] text-slate-400">
              Showing {filteredItems.length} of {report.items.length} items
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-4">
            {filteredItems.map((item) => {
              const isDiffOpen = expandedDiffs[item.id] ?? false;
              const hasExisting = Boolean(item.existingData);

              return (
                <div
                  key={item.id}
                  className={`p-6 rounded-2xl border transition-all ${
                    item.isApproved
                      ? 'bg-space-900/85 border-slate-700 shadow-md'
                      : 'bg-space-950/60 border-slate-800/80 opacity-70'
                  }`}
                >
                  {/* Top Bar of Card */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={item.isApproved}
                        onChange={() => handleToggleApproval(item.id)}
                        className="w-4 h-4 rounded bg-space-950 border-slate-700 text-cyan-500 focus:ring-cyan-400 cursor-pointer"
                      />
                      
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-space-800 text-cyan-300 border border-slate-700">
                        {item.group}
                      </span>

                      {renderStatusBadge(item.status)}

                      <h4 className="text-base font-bold font-display text-white">
                        {item.title}
                      </h4>
                    </div>

                    {/* Action buttons on card header */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="px-2.5 py-1 rounded-lg bg-space-850 hover:bg-space-800 border border-slate-700 text-xs font-mono text-cyan-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Edit extracted telemetry before approval"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>

                      {hasExisting && (
                        <button
                          onClick={() => toggleDiff(item.id)}
                          className={`px-2.5 py-1 rounded-lg border text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer ${
                            isDiffOpen
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                              : 'bg-space-850 hover:bg-space-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          <Columns className="w-3 h-3" />
                          <span>{isDiffOpen ? 'Hide Diff' : 'Compare DB'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Conflict Resolution Strategy Controls */}
                  {item.isDuplicate && (
                    <div className="my-4 p-4 rounded-xl bg-space-950 border border-amber-500/30 space-y-2.5">
                      <div className="flex items-center gap-2 text-[11px] font-mono text-amber-300 uppercase tracking-wider font-bold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Select Conflict Resolution Strategy:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(['MERGE', 'REPLACE', 'KEEP_EXISTING', 'REVIEW_MANUALLY'] as ChangeResolution[]).map((res) => (
                          <button
                            key={res}
                            type="button"
                            onClick={() => handleSetResolution(item.id, res)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                              item.resolution === res
                                ? 'bg-amber-500/25 text-amber-300 border border-amber-400 font-bold'
                                : 'bg-space-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                            }`}
                          >
                            {res.replace('_', ' ')}
                          </button>
                        ))}
                      </div>

                      {item.resolution === 'MERGE' && (
                        <p className="text-[11px] font-mono text-emerald-400 pt-1 flex items-center gap-1.5">
                          <Shield className="w-3 h-3 flex-shrink-0" />
                          <span>Rule 14 Active: Existing GitHub URL, live deployments, architecture diagrams, and custom writeups will be strictly preserved!</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Side-by-Side Comparison View (CURRENT DATABASE vs NEW RESUME) */}
                  {isDiffOpen && hasExisting ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      {/* Left: Current Database */}
                      <div className="p-4 rounded-xl bg-space-950/90 border border-slate-800 font-mono text-xs">
                        <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800 pb-2 mb-2">
                          <span className="flex items-center gap-1.5">
                            <Database className="w-3 h-3 text-slate-500" />
                            CURRENT DATABASE
                          </span>
                          <span className="text-slate-500">Live Telemetry</span>
                        </div>
                        <pre className="whitespace-pre-wrap overflow-x-auto text-slate-300 text-[11px] max-h-60">
                          {JSON.stringify(item.existingData, null, 2)}
                        </pre>
                      </div>

                      {/* Right: New Resume / Edited */}
                      <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 font-mono text-xs">
                        <div className="flex items-center justify-between text-cyan-300 text-[10px] uppercase font-bold border-b border-cyan-500/20 pb-2 mb-2">
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                            NEW RESUME {item.userEditedData ? '(EDITED)' : ''}
                          </span>
                          <span className="text-cyan-400">Incoming</span>
                        </div>
                        <pre className="whitespace-pre-wrap overflow-x-auto text-cyan-200 text-[11px] max-h-60">
                          {JSON.stringify(item.userEditedData || item.incomingData, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    /* Compact preview */
                    <div className="p-3.5 rounded-xl bg-space-950/80 border border-slate-800/80 font-mono text-xs text-slate-300">
                      <pre className="whitespace-pre-wrap overflow-x-auto text-[11px] max-h-48">
                        {JSON.stringify(item.userEditedData || item.incomingData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Commit Action Bar */}
          <div className="p-6 rounded-2xl bg-space-900 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => setReport(null)}
              className="text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Cancel & Upload Different File
            </button>

            <button
              onClick={handleCommitToDatabase}
              disabled={isProcessing || report.items.filter(i => i.isApproved).length === 0}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow-glow-cyan flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Approve & Synchronize Universe ({report.items.filter(i => i.isApproved).length} Approved)</span>
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* INLINE EDITING MODAL */}
      {/* ==================================================== */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-space-900 border border-cyan-500/40 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono uppercase bg-space-800 text-cyan-300 border border-slate-700">
                  {editingItem.group}
                </span>
                <h3 className="text-xl font-bold font-display text-white mt-1">
                  Edit Extracted Telemetry
                </h3>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white bg-space-850 hover:bg-space-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Editable Fields depending on group */}
            <div className="space-y-4">
              {/* Title / Name */}
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Title / Name
                </label>
                <input
                  type="text"
                  value={editFormData.title || editFormData.full_name || editFormData.name || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditFormData((prev: any) => ({
                      ...prev,
                      title: prev.title !== undefined ? val : prev.title,
                      full_name: prev.full_name !== undefined ? val : prev.full_name,
                      name: prev.name !== undefined ? val : prev.name
                    }));
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-xs font-mono text-white focus:border-cyan-400"
                />
              </div>

              {/* Organization / Institution / Category */}
              {(editFormData.organization !== undefined || editFormData.category !== undefined) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {editFormData.organization !== undefined && (
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">
                        Organization / Institution
                      </label>
                      <input
                        type="text"
                        value={editFormData.organization || ''}
                        onChange={(e) => setEditFormData((prev: any) => ({ ...prev, organization: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-xs font-mono text-white focus:border-cyan-400"
                      />
                    </div>
                  )}

                  {editFormData.category !== undefined && (
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        value={editFormData.category || ''}
                        onChange={(e) => setEditFormData((prev: any) => ({ ...prev, category: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-xs font-mono text-white focus:border-cyan-400"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Date Range */}
              {editFormData.date_range !== undefined && (
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Date Range / Period
                  </label>
                  <input
                    type="text"
                    value={editFormData.date_range || ''}
                    onChange={(e) => setEditFormData((prev: any) => ({ ...prev, date_range: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-xs font-mono text-white focus:border-cyan-400"
                  />
                </div>
              )}

              {/* Short Description */}
              {editFormData.short_description !== undefined && (
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Short Description
                  </label>
                  <input
                    type="text"
                    value={editFormData.short_description || ''}
                    onChange={(e) => setEditFormData((prev: any) => ({ ...prev, short_description: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-xs font-mono text-white focus:border-cyan-400"
                  />
                </div>
              )}

              {/* Full Description / Bio */}
              {(editFormData.full_description !== undefined || editFormData.description !== undefined || editFormData.bio !== undefined) && (
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Full Description / Notes
                  </label>
                  <textarea
                    rows={4}
                    value={editFormData.full_description || editFormData.description || editFormData.bio || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditFormData((prev: any) => ({
                        ...prev,
                        full_description: prev.full_description !== undefined ? val : prev.full_description,
                        description: prev.description !== undefined ? val : prev.description,
                        bio: prev.bio !== undefined ? val : prev.bio
                      }));
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-xs font-mono text-white focus:border-cyan-400"
                  />
                </div>
              )}

              {/* Custom Section Content */}
              {editFormData.content !== undefined && (
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Section Content (one line per bullet point / entry)
                  </label>
                  <textarea
                    rows={6}
                    value={Array.isArray(editFormData.content) ? editFormData.content.join('\n') : (editFormData.content || '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (Array.isArray(editFormData.content)) {
                        setEditFormData((prev: any) => ({
                          ...prev,
                          content: val.split('\n').filter(Boolean)
                        }));
                      } else {
                        setEditFormData((prev: any) => ({
                          ...prev,
                          content: val
                        }));
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-xs font-mono text-white focus:border-cyan-400"
                    placeholder="Enter section bullet items..."
                  />
                </div>
              )}

              {/* Tech Stack Array (comma separated) */}
              {Array.isArray(editFormData.tech_stack) && (
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Tech Stack (comma separated)
                  </label>
                  <input
                    type="text"
                    value={editFormData.tech_stack.join(', ')}
                    onChange={(e) => {
                      const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                      setEditFormData((prev: any) => ({ ...prev, tech_stack: arr }));
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-xs font-mono text-white focus:border-cyan-400"
                  />
                </div>
              )}

              {/* URLs (GitHub, Live URL) */}
              {(editFormData.github_url !== undefined || editFormData.live_url !== undefined) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {editFormData.github_url !== undefined && (
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">
                        GitHub URL
                      </label>
                      <input
                        type="text"
                        value={editFormData.github_url || ''}
                        onChange={(e) => setEditFormData((prev: any) => ({ ...prev, github_url: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-xs font-mono text-white focus:border-cyan-400"
                      />
                    </div>
                  )}

                  {editFormData.live_url !== undefined && (
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">
                        Live Deployment URL
                      </label>
                      <input
                        type="text"
                        value={editFormData.live_url || ''}
                        onChange={(e) => setEditFormData((prev: any) => ({ ...prev, live_url: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-xs font-mono text-white focus:border-cyan-400"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white bg-space-850 hover:bg-space-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-6 py-2 rounded-xl text-xs font-mono font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 flex items-center gap-1.5 cursor-pointer shadow-glow-cyan"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Telemetry</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
