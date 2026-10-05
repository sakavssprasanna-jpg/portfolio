import React, { useState, useEffect } from 'react';
import { 
  Orbit, 
  Menu, 
  X, 
  Sparkles, 
  Briefcase, 
  Award, 
  FileText, 
  Mail, 
  User, 
  Layers, 
  LogOut, 
  ShieldCheck,
  ZapOff,
  Zap
} from 'lucide-react';
import { useUniverse } from '../../context/UniverseContext';
import { useAuth } from '../../context/AuthContext';

interface FloatingNavigationProps {
  onGoToMissionControl?: () => void;
  onGoToLanding: () => void;
  onOpenLogin: () => void;
}

export const FloatingNavigation: React.FC<FloatingNavigationProps> = ({
  onGoToMissionControl,
  onGoToLanding,
  onOpenLogin
}) => {
  const { reducedMotion, setReducedMotion, profile } = useUniverse();
  const { isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const navLinks = [
    { id: 'home', label: 'HOME', icon: Orbit },
    { id: 'about', label: 'ABOUT', icon: User },
    { id: 'worlds', label: 'WORLDS', icon: Layers },
    { id: 'projects', label: 'PROJECTS', icon: Sparkles },
    { id: 'skills', label: 'SKILLS', icon: Sparkles },
    { id: 'journey', label: 'JOURNEY', icon: Briefcase },
    { id: 'achievements', label: 'ACHIEVEMENTS', icon: Award },
    { id: 'resume', label: 'RESUME', icon: FileText },
    { id: 'contact', label: 'CONTACT', icon: Mail },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);

      // Simple intersection check
      const sections = navLinks.map(l => document.getElementById(l.id));
      const scrollPos = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = sections[i];
        if (sec && sec.offsetTop <= scrollPos) {
          setActiveSection(navLinks[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    }
  };

  return (
    <>
      {/* Top Floating Glassmorphism Bar */}
      <header 
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 px-4 sm:px-8 py-3 flex items-center justify-between ${
          isScrolled 
            ? 'bg-space-950/80 backdrop-blur-xl border-b border-cyan-500/20 py-2.5 shadow-2xl' 
            : 'bg-transparent pt-5'
        }`}
      >
        {/* Brand / Logo */}
        <button
          onClick={onGoToLanding}
          className="flex items-center gap-2.5 group cursor-pointer text-left focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-space-900 border border-cyan-400/40 flex items-center justify-center text-cyan-400 group-hover:shadow-glow-cyan transition-all">
            <Orbit className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
          </div>
          <div>
            <span className="block text-xs font-mono tracking-widest text-cyan-300 font-bold uppercase">
              {profile?.full_name?.split(' ')[0] || 'VEERA'}
            </span>
            <span className="block text-[10px] font-mono text-slate-400 tracking-wider">
              AI UNIVERSE
            </span>
          </div>
        </button>

        {/* Desktop Floating Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 px-3 py-1.5 rounded-full bg-space-900/70 border border-cyan-500/20 backdrop-blur-md shadow-holo">
          {navLinks.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium tracking-wider transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-glow-cyan'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Action Icons: Motion Toggle & Owner Gateway */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Reduced Motion Toggle Button */}
          <button
            onClick={() => setReducedMotion(!reducedMotion)}
            title={reducedMotion ? 'Enable Full Motion' : 'Reduce Motion'}
            className="p-2 rounded-xl bg-space-900/60 border border-slate-700/60 hover:border-cyan-400/40 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
            aria-label="Toggle motion reduction"
          >
            {reducedMotion ? <ZapOff className="w-4 h-4 text-amber-400" /> : <Zap className="w-4 h-4" />}
          </button>

          {/* If authenticated owner: Mission Control Button */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onGoToMissionControl}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow-glow-cyan flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mission Control</span>
              </button>
              <button
                onClick={() => logout()}
                title="Exit Commander Session"
                className="p-2 rounded-xl bg-space-900/60 border border-red-500/30 text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-3 py-1.5 rounded-xl bg-space-900/60 hover:bg-space-850 border border-slate-700/60 hover:border-cyan-400/40 text-xs font-mono text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>🔐</span>
              <span className="hidden sm:inline">LOGIN</span>
            </button>
          )}

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-space-900/60 border border-slate-700/60 text-slate-300 hover:text-cyan-400 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-space-950/95 backdrop-blur-2xl flex flex-col p-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Orbit className="w-6 h-6 text-cyan-400" />
              <span className="font-display font-bold text-white text-base">
                {profile?.full_name || 'VEERA'}
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-xl bg-space-900 text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 py-6 flex flex-col gap-2 overflow-y-auto">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full py-3 px-4 rounded-xl flex items-center gap-3 text-left font-mono text-sm tracking-wider transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                      : 'text-slate-300 hover:bg-space-900'
                  }`}
                >
                  <Icon className="w-4 h-4 text-cyan-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onGoToLanding();
              }}
              className="w-full py-3 rounded-xl bg-space-900 text-slate-300 font-mono text-xs text-center border border-slate-800"
            >
              ← Return to Entry Screen
            </button>
            {!isAuthenticated && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogin();
                }}
                className="w-full py-3 rounded-xl bg-space-900 text-cyan-300 font-mono text-xs text-center border border-cyan-500/30 flex items-center justify-center gap-2"
              >
                <span>🔐</span> Commander Login
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
