import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import { isSupabaseConfigured } from '../../lib/supabase';
import { useUniverse } from '../../context/UniverseContext';
import { SystemStats } from '../../types/database';
import { AIRobot } from '../robot/AIRobot';
import { 
  Layers, 
  Briefcase, 
  Cpu, 
  Award, 
  FileText, 
  Sparkles, 
  Database, 
  ShieldCheck, 
  ArrowRight,
  Upload,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  PlusCircle,
  Activity
} from 'lucide-react';
import { AdminTab } from './MissionControlLayout';

interface DashboardOverviewProps {
  onNavigateTab: (tab: AdminTab) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigateTab }) => {
  const { approvedResume } = useUniverse();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const s = await dbService.getSystemStats();
        setStats(s);
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const statCards = [
    { label: 'Published Worlds', value: stats?.publishedWorlds ?? 0, icon: Layers, color: '#00f0ff', tab: 'worlds' as AdminTab },
    { label: 'Project Missions', value: stats?.publishedProjects ?? 0, icon: Briefcase, color: '#3b82f6', tab: 'projects' as AdminTab },
    { label: 'Registered Skills', value: stats?.skillsCount ?? 0, icon: Cpu, color: '#8b5cf6', tab: 'skills' as AdminTab },
    { label: 'Achievements', value: stats?.achievementsCount ?? 0, icon: Award, color: '#f59e0b', tab: 'achievements' as AdminTab },
    { label: 'Resume Versions', value: stats?.resumeVersionsCount ?? 0, icon: FileText, color: '#10b981', tab: 'resumes' as AdminTab },
  ];

  // Contextual robot message based on real system state
  const getContextualRobotStatus = () => {
    if (!approvedResume) {
      return {
        message: 'Telemetry notice: Public universe awaiting approved resume.',
        state: 'alert' as const
      };
    }
    if ((stats?.publishedProjects ?? 0) === 0) {
      return {
        message: 'Mission Control online. Ready for project missions.',
        state: 'idle' as const
      };
    }
    return {
      message: 'All spacecraft telemetry systems operational.',
      state: 'success' as const
    };
  };

  const robotTelemetry = getContextualRobotStatus();

  return (
    <div className="space-y-8">
      {/* ============================================================== */}
      {/* 1. TOP PROMINENT PANEL: RESUME INTELLIGENCE (REQUIREMENT 9)    */}
      {/* ============================================================== */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-space-900 via-space-850 to-space-900 border-2 border-cyan-400/30 shadow-2xl relative overflow-hidden">
        {/* Holographic accent glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 cosmic-grid opacity-25 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-mono tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>RESUME INTELLIGENCE SYSTEM</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
              Keep your universe synchronized with your latest resume.
            </h2>

            {/* Resume status details */}
            {approvedResume ? (
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-300 pt-1">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-space-950/80 border border-slate-700">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-white font-medium">{approvedResume.version_name || approvedResume.file_name}</span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Updated: {new Date(approvedResume.upload_date).toLocaleDateString()}</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px]">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>PUBLICLY APPROVED</span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs font-mono flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>No approved resume yet.</span>
              </div>
            )}
          </div>

          {/* Action button */}
          <div className="flex-shrink-0 w-full sm:w-auto">
            <button
              onClick={() => onNavigateTab('intelligence')}
              className="btn-control-universe w-full sm:w-auto px-7 py-4 rounded-2xl text-slate-950 font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>{approvedResume ? '📄 UPLOAD NEW RESUME' : 'UPLOAD RESUME'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. SPACECRAFT COMMAND CENTER STATUS WITH ROBOT ASSISTANT (REQ 15/16) */}
      {/* ============================================================== */}
      <div className="p-6 rounded-3xl bg-space-900/80 border border-slate-800 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <AIRobot
            variant="nova"
            size="sm"
            state={robotTelemetry.state}
            interactive={true}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-glow-cyan" />
              <h3 className="text-sm font-bold font-display text-white uppercase tracking-wider">
                VEERA MISSION CONTROL • SPACECRAFT TELEMETRY
              </h3>
            </div>
            <p className="text-xs font-mono text-cyan-300 mt-1">
              {robotTelemetry.message}
            </p>
          </div>
        </div>

        {/* Database Backend indicator */}
        <div className="p-3.5 px-4 rounded-2xl bg-space-950 border border-slate-800 flex items-center gap-3 text-xs font-mono">
          <Database className="w-4 h-4 text-cyan-400" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Architecture Node</div>
            <div className="text-white font-medium">
              {isSupabaseConfigured() ? 'Supabase Cloud RLS' : 'Local Persistent Vault'}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. REAL-TIME DATABASE TELEMETRY METRICS GRID (NO FAKE NUMBERS) */}
      {/* ============================================================== */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-3.5 h-3.5" />
            <span>Database Metrics Overview</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Live Telemetry</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                onClick={() => onNavigateTab(stat.tab)}
                className="p-5 rounded-2xl bg-space-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <div 
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold font-display text-white">
                    {loading ? '...' : stat.value}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-1">
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. MISSION COMMANDER CONTROLS SHORTCUTS                        */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Telemetry */}
        <div 
          onClick={() => onNavigateTab('projects')}
          className="p-6 rounded-3xl bg-space-900/70 border border-slate-800 hover:border-blue-500/40 transition-all cursor-pointer group space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950 border border-blue-500/40 text-blue-300 text-xs font-mono">
            <PlusCircle className="w-3.5 h-3.5" />
            <span>PROJECT PLANETS & MISSIONS</span>
          </div>
          <h4 className="text-lg font-bold font-display text-white group-hover:text-blue-300 transition-colors">
            Deploy New Mission or Case Study
          </h4>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            Register machine learning models, architecture diagrams, GitHub links, and case studies into designated AI Worlds.
          </p>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-blue-400 font-bold">
            <span>Open Project Console</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* AI Worlds Telemetry */}
        <div 
          onClick={() => onNavigateTab('worlds')}
          className="p-6 rounded-3xl bg-space-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer group space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
            <Layers className="w-3.5 h-3.5" />
            <span>AI WORLDS CONFIGURATION</span>
          </div>
          <h4 className="text-lg font-bold font-display text-white group-hover:text-cyan-300 transition-colors">
            Configure Sector Orbits & Visuals
          </h4>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            Manage ML Galaxy, Agentic AI, Generative AI Nebula, RAG Realm, and customize visual properties and ordering.
          </p>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 font-bold">
            <span>Open Worlds Console</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};
