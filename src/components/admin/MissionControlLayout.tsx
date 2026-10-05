import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUniverse } from '../../context/UniverseContext';
import { 
  LayoutDashboard, 
  Sparkles, 
  FileText, 
  Layers, 
  Briefcase, 
  Award, 
  Cpu, 
  User, 
  Image, 
  Settings, 
  LogOut, 
  Eye, 
  ShieldCheck,
  Menu,
  X,
  Database
} from 'lucide-react';
import { AIRobot } from '../robot/AIRobot';

export type AdminTab = 
  | 'dashboard'
  | 'intelligence'
  | 'resumes'
  | 'projects'
  | 'worlds'
  | 'skills'
  | 'journey'
  | 'achievements'
  | 'profile'
  | 'media'
  | 'settings';

interface MissionControlLayoutProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onExitToUniverse: () => void;
  children: React.ReactNode;
}

export const MissionControlLayout: React.FC<MissionControlLayoutProps> = ({
  activeTab,
  onSelectTab,
  onExitToUniverse,
  children
}) => {
  const { user, logout } = useAuth();
  const { profile } = useUniverse();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'intelligence', label: 'Resume Intelligence', icon: Sparkles, badge: 'AI' },
    { id: 'resumes', label: 'Resume Control', icon: FileText, badge: null },
    { id: 'projects', label: 'Project Control', icon: Briefcase, badge: null },
    { id: 'worlds', label: 'World Control', icon: Layers, badge: null },
    { id: 'skills', label: 'Skill Control', icon: Cpu, badge: null },
    { id: 'journey', label: 'Journey Control', icon: Briefcase, badge: null },
    { id: 'achievements', label: 'Achievement Control', icon: Award, badge: null },
    { id: 'profile', label: 'Profile Control', icon: User, badge: null },
    { id: 'media', label: 'Media Library', icon: Image, badge: null },
    { id: 'settings', label: 'Settings & Cloud', icon: Settings, badge: null },
  ];

  const handleSelect = (tab: AdminTab) => {
    onSelectTab(tab);
    setMobileNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-space-950 text-slate-100 flex flex-col md:flex-row font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-space-900 border-b border-cyan-500/20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-white block">VEERA MISSION CONTROL</span>
            <span className="text-[10px] font-mono text-cyan-400 block">COMMANDER DASHBOARD</span>
          </div>
        </div>
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-2 rounded-lg bg-space-850 text-slate-300"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside 
        className={`fixed md:sticky top-0 z-40 h-screen w-72 bg-space-900/90 border-r border-cyan-500/20 backdrop-blur-xl flex flex-col justify-between transition-transform duration-300 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 flex flex-col h-full overflow-hidden">
          {/* Brand */}
          <div className="hidden md:flex items-center gap-3 pb-6 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-glow-cyan">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold font-display text-white">
                MISSION CONTROL
              </h1>
              <span className="text-[10px] font-mono text-cyan-400 tracking-wider">
                {profile?.full_name?.split(' ')[0] || 'VEERA'} AI ARCHITECTURE
              </span>
            </div>
          </div>

          {/* Nav List */}
          <nav className="flex-1 py-4 space-y-1 overflow-y-auto pr-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id as AdminTab)}
                  className={`w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between text-xs font-mono tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-400/40 shadow-glow-cyan'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-space-850'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* AI Telemetry Companion Card */}
          <div className="py-2.5 px-3 rounded-2xl bg-space-950/80 border border-slate-800/90 my-2 flex items-center gap-3">
            <AIRobot
              variant="pixel"
              state="idle"
              size="xs"
              interactive={true}
            />
            <div className="min-w-0">
              <div className="text-[10px] font-mono text-cyan-300 font-bold uppercase truncate">
                Companion PIXEL
              </div>
              <div className="text-[9px] font-mono text-slate-400 truncate">
                Telemetry active • Sync online
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <button
              onClick={onExitToUniverse}
              className="w-full px-3.5 py-2.5 rounded-xl bg-space-850 hover:bg-space-800 text-cyan-400 text-xs font-mono tracking-wider transition-all flex items-center justify-center gap-2 border border-cyan-500/20 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Observe Public Universe</span>
            </button>

            <button
              onClick={() => logout()}
              className="w-full px-3.5 py-2 rounded-xl bg-red-950/30 hover:bg-red-950/60 text-red-400 text-xs font-mono tracking-wider transition-all flex items-center justify-center gap-2 border border-red-500/20 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Telemetry (Logout)</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 min-h-screen p-4 sm:p-8 lg:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
};
