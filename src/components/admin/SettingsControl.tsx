import React, { useState } from 'react';
import { isSupabaseConfigured } from '../../lib/supabase';
import { dbService } from '../../services/db';
import { useUniverse } from '../../context/UniverseContext';
import { 
  Database, 
  Key, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Save, 
  Terminal,
  ShieldCheck
} from 'lucide-react';

export const SettingsControl: React.FC = () => {
  const { refreshData } = useUniverse();
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('veera_gemini_api_key') || '');
  const [keySaved, setKeySaved] = useState(false);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('veera_gemini_api_key', apiKey.trim());
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2500);
  };

  const handleSyncToSupabase = async () => {
    if (!confirm('This will safely synchronize all your local offline portfolio data (profile, worlds, projects, skills, journey, achievements, and resumes) into your connected Supabase Cloud database. Existing data will NOT be deleted. Proceed?')) {
      return;
    }
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await dbService.syncLocalToSupabase();
      if (res.success) {
        await refreshData();
        setSyncResult(`Successfully synchronized ${res.count} items to Supabase Cloud!`);
        setTimeout(() => setSyncResult(null), 5000);
      } else {
        alert(res.error || 'Failed to sync to Supabase.');
      }
    } catch (err: any) {
      console.error('Sync failed', err);
      alert('Failed to sync to Supabase: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportBackup = async () => {
    try {
      const [profile, worlds, projects, skills, journey, achievements, resumes, customSections, media] = await Promise.all([
        dbService.getProfile(),
        dbService.getWorlds(),
        dbService.getProjects(),
        dbService.getSkills(),
        dbService.getJourney(),
        dbService.getAchievements(),
        dbService.getAllResumes(),
        dbService.getCustomSections(),
        dbService.getMediaAssets()
      ]);

      const backupData = {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        portfolioOwner: 'VEERA SATYA SAI PRASANNA',
        data: {
          profile,
          worlds,
          projects,
          skills,
          journey,
          achievements,
          resumes,
          custom_sections: customSections,
          media
        }
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `veera_ai_universe_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setBackupStatus('Backup exported successfully.');
      setTimeout(() => setBackupStatus(null), 3000);
    } catch (err) {
      console.error('Export failed', err);
      alert('Failed to export backup.');
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('Importing will synchronize the database with this backup file. Continue?')) {
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (!parsed.data) {
        alert('Invalid backup structure.');
        return;
      }

      if (parsed.data.profile) await dbService.updateProfile(parsed.data.profile);
      if (parsed.data.worlds) {
        for (const w of parsed.data.worlds) await dbService.saveWorld(w);
      }
      if (parsed.data.projects) {
        for (const p of parsed.data.projects) await dbService.saveProject(p);
      }
      if (parsed.data.skills) {
        for (const s of parsed.data.skills) await dbService.saveSkill(s);
      }
      if (parsed.data.journey) {
        for (const j of parsed.data.journey) await dbService.saveJourneyEntry(j);
      }
      if (parsed.data.achievements) {
        for (const a of parsed.data.achievements) await dbService.saveAchievement(a);
      }
      if (parsed.data.resumes) {
        for (const r of parsed.data.resumes) await dbService.saveResumeVersion(r);
      }
      if (parsed.data.custom_sections) {
        for (const cs of parsed.data.custom_sections) await dbService.saveCustomSection(cs);
      }

      await refreshData();
      alert('Backup restored successfully!');
    } catch (err) {
      console.error('Import error', err);
      alert('Failed to parse and import backup file.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
          Settings & Infrastructure Telemetry
        </h2>
        <p className="text-xs font-mono text-cyan-400">
          Manage Supabase production connection, AI extraction keys, and JSON telemetry backups.
        </p>
      </div>

      {/* Supabase Status Card */}
      <div className="p-6 rounded-2xl bg-space-900/80 border border-slate-800 space-y-4">
        <h3 className="text-sm font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
          <Database className="w-4 h-4" /> 1. Supabase PostgreSQL & RLS Status
        </h3>

        <div className="p-4 rounded-xl bg-space-950 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`w-3 h-3 rounded-full ${
                isSupabaseConfigured() ? 'bg-emerald-400 shadow-glow-cyan' : 'bg-cyan-400'
              } animate-pulse`}
            />
            <div>
              <div className="text-xs font-mono text-white font-medium">
                {isSupabaseConfigured() ? 'Supabase Live Connected' : 'Local Persistent Storage Mode Active'}
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                {isSupabaseConfigured()
                  ? 'All writes route to Supabase with PostgreSQL Row Level Security.'
                  : 'Zero downtime fallback mode is active. Data is stored in secure local storage.'}
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-space-850 text-cyan-300 border border-slate-700">
            {isSupabaseConfigured() ? 'Cloud Synchronized' : 'Offline Vault'}
          </span>
        </div>

        <div className="text-xs text-slate-300 font-sans space-y-2 pt-2">
          <p>
            To connect to your live Supabase database instance:
          </p>
          <ol className="list-decimal pl-5 space-y-1 font-mono text-[11px] text-slate-400">
            <li>Open <code className="text-cyan-300">.env</code> in the project directory.</li>
            <li>Add your project credentials: <code className="text-cyan-300">VITE_SUPABASE_URL</code> and <code className="text-cyan-300">VITE_SUPABASE_ANON_KEY</code>.</li>
            <li>Run the SQL script from <code className="text-cyan-300">supabase/schema.sql</code> in the Supabase SQL Editor.</li>
          </ol>
        </div>

        {isSupabaseConfigured() && (
          <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              onClick={handleSyncToSupabase}
              disabled={isSyncing}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-2 transition-all cursor-pointer shadow-glow-cyan disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {isSyncing ? 'Syncing to Supabase Cloud...' : '🚀 Push Local Vault Data to Supabase Cloud'}
            </button>
            <span className="text-[11px] font-mono text-slate-400">
              Safely uploads all local offline projects, skills, journey, worlds, and profile data to Supabase without deleting anything.
            </span>
          </div>
        )}

        {syncResult && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{syncResult}</span>
          </div>
        )}
      </div>

      {/* Gemini AI API Key for Resume Intelligence */}
      <div className="p-6 rounded-2xl bg-space-900/80 border border-slate-800 space-y-4">
        <h3 className="text-sm font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
          <Key className="w-4 h-4" /> 2. Gemini AI Key (For Resume Intelligence)
        </h3>

        <form onSubmit={handleSaveApiKey} className="space-y-3 text-xs font-mono">
          <p className="text-slate-300 font-sans">
            Provide a Google Gemini API Key to enable structured AI resume parsing. If omitted, the built-in deterministic zero-hallucination NLP engine is utilized automatically.
          </p>

          <div className="flex gap-3">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-white focus:border-cyan-400"
            />
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold uppercase transition-all shadow-glow-cyan cursor-pointer"
            >
              Save Key
            </button>
          </div>

          {keySaved && (
            <div className="text-emerald-400 text-xs flex items-center gap-1.5 pt-1">
              <CheckCircle2 className="w-4 h-4" /> API Key saved successfully!
            </div>
          )}
        </form>
      </div>

      {/* JSON Backup & Telemetry Migration */}
      <div className="p-6 rounded-2xl bg-space-900/80 border border-slate-800 space-y-4">
        <h3 className="text-sm font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
          <Download className="w-4 h-4" /> 3. Data Telemetry Backup & Restore
        </h3>

        <p className="text-xs text-slate-300 font-sans">
          Download a complete portable JSON snapshot of your entire portfolio (profile, worlds, projects, skills, journey, achievements) or restore from an existing archive.
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button
            onClick={handleExportBackup}
            className="px-5 py-2.5 rounded-xl bg-space-850 hover:bg-space-800 text-cyan-300 border border-cyan-500/30 text-xs font-mono flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export Telemetry JSON
          </button>

          <label className="px-5 py-2.5 rounded-xl bg-space-850 hover:bg-space-800 text-slate-300 border border-slate-700 text-xs font-mono flex items-center gap-2 transition-all cursor-pointer">
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Restore From JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>

        {backupStatus && (
          <div className="text-xs font-mono text-emerald-400 pt-1">
            {backupStatus}
          </div>
        )}
      </div>
    </div>
  );
};
