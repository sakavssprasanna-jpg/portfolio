import React, { useState } from 'react';
import { useUniverse } from '../context/UniverseContext';
import { CosmicCanvas } from '../components/universe/CosmicCanvas';
import { FloatingNavigation } from '../components/universe/FloatingNavigation';
import { WorldsGallery } from '../components/universe/WorldsGallery';
import { SkillConstellation } from '../components/universe/SkillConstellation';
import { OrbitalJourney } from '../components/universe/OrbitalJourney';
import { AchievementGalaxy } from '../components/universe/AchievementGalaxy';
import { ResumeStation } from '../components/universe/ResumeStation';
import { AboutSection } from '../components/universe/AboutSection';
import { ContactSection } from '../components/universe/ContactSection';
import { ProjectModal } from '../components/universe/ProjectModal';
import { LoginModal } from '../components/auth/LoginModal';
import { useResolvedMediaUrl } from '../services/storage';
import { Orbit, Sparkles, Compass, ShieldCheck, ChevronDown } from 'lucide-react';

interface UniversePageProps {
  onGoToMissionControl: () => void;
  onGoToLanding: () => void;
}

export const UniversePage: React.FC<UniversePageProps> = ({
  onGoToMissionControl,
  onGoToLanding,
}) => {
  const { 
    profile, 
    worlds, 
    selectedProject, 
    setSelectedProject, 
    reducedMotion 
  } = useUniverse();

  const resolvedAvatar = useResolvedMediaUrl(profile?.avatar_url);
  const displayAvatar = resolvedAvatar || profile?.avatar_url;

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const selectedProjectWorld = worlds.find(w => w.id === selectedProject?.world_id);

  return (
    <div className="relative min-h-screen bg-space-950 text-slate-100 overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Dynamic Cosmic Three/Canvas Layer */}
      <CosmicCanvas />

      {/* Floating Glassmorphic Header */}
      <FloatingNavigation
        onGoToMissionControl={onGoToMissionControl}
        onGoToLanding={onGoToLanding}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      {/* Main Universe Content Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 space-y-32">
        {/* HERO / UNIVERSE ORIENTATION */}
        <section id="home" className="min-h-[75vh] flex flex-col items-center justify-center text-center space-y-6 pt-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-400/30 text-cyan-300 text-xs font-mono tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            AI/ML Multidimensional Sector Online
          </div>

          {/* Futuristic Profile Photo (Only if exists - with subtle glow, glass frame, and soft orbital ring) */}
          {profile?.avatar_url && (
            <div className="relative my-2 w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
              {/* Soft orbital ring */}
              <div className={`absolute -inset-2.5 rounded-full border border-cyan-400/30 ${reducedMotion ? '' : 'animate-spin-slow'} pointer-events-none`}>
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-glow-cyan" />
              </div>
              {/* Glass frame with subtle glow */}
              <div className="relative w-full h-full rounded-full p-1 bg-gradient-to-tr from-cyan-400/60 via-blue-500/40 to-purple-600/40 shadow-glow-cyan">
                <div className="w-full h-full rounded-full overflow-hidden bg-space-950 border border-cyan-400/40 backdrop-blur-md">
                  <img
                    src={displayAvatar}
                    alt={profile.full_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          )}

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-display max-w-4xl text-gradient-cyan">
            {profile?.full_name || 'VEERA SATYA SAI PRASANNA'}
          </h1>

          <p className="text-lg sm:text-2xl font-mono text-cyan-200/90 font-medium max-w-2xl">
            {profile?.headline || 'AI/ML • GenAI • Intelligent Systems'}
          </p>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-sans">
            Explore neural architectures, agentic intelligence swarms, retrieval-augmented knowledge bases, and production machine learning engineering.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#worlds"
              className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-glow-cyan flex items-center gap-2 cursor-pointer"
            >
              <Compass className="w-4 h-4" /> Explore AI Worlds
            </a>
            <a
              href="#resume"
              className="px-6 py-3.5 rounded-xl bg-space-900/80 hover:bg-space-850 text-slate-200 border border-slate-700 hover:border-cyan-400 text-xs sm:text-sm font-mono tracking-wider transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>📄</span> Resume Station
            </a>
          </div>

          {/* Scroll Down Indicator */}
          <div className="pt-12 text-slate-500 animate-bounce">
            <a href="#about" aria-label="Scroll to about section">
              <ChevronDown className="w-6 h-6 mx-auto text-cyan-400/60" />
            </a>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="scroll-mt-24 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Professional Identity
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
              About The Engineer
            </h2>
          </div>
          <AboutSection />
        </section>

        {/* AI WORLDS & PROJECT PLANETS */}
        <section id="worlds" className="scroll-mt-24 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Sector Telemetry
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
              AI Worlds & Project Planets
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-sans">
              Navigate specialized sectors across the AI landscape to inspect architectural missions and models.
            </p>
          </div>
          <div id="projects" className="scroll-mt-24">
            <WorldsGallery />
          </div>
        </section>

        {/* SKILLS CONSTELLATION */}
        <section id="skills" className="scroll-mt-24 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Neural Topology
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
              Skill Constellation
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-sans">
              Connected technical competencies, algorithmic frameworks, and engineering tools mapped as an interactive node graph.
            </p>
          </div>
          <SkillConstellation />
        </section>

        {/* MY JOURNEY ORBITAL TIMELINE */}
        <section id="journey" className="scroll-mt-24 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Trajectory Timeline
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
              My Journey
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-sans">
              Cosmic orbital timeline of milestones, engineering tenures, and academic foundations.
            </p>
          </div>
          <OrbitalJourney />
        </section>

        {/* ACHIEVEMENT GALAXY */}
        <section id="achievements" className="scroll-mt-24 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Discovery Artifacts
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
              Achievement Galaxy
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-sans">
              Recognitions, certified telemetry, and competitive research discoveries.
            </p>
          </div>
          <AchievementGalaxy />
        </section>

        {/* RESUME STATION */}
        <section id="resume" className="scroll-mt-24 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Verified Credentials
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
              Resume Station
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-sans">
              Access the officially approved technical dossier and verified curriculum vitae.
            </p>
          </div>
          <ResumeStation />
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="scroll-mt-24 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Subspace Communications
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
              Transmit Uplink
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-sans">
              Open a direct transmission with Veera Satya Sai Prasanna for technical roles or collaborative engineering.
            </p>
          </div>
          <ContactSection />
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-space-950/80 backdrop-blur-md py-8 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <Orbit className="w-4 h-4 text-cyan-400" />
            <span>{profile?.full_name || 'VEERA SATYA SAI PRASANNA'} • AI UNIVERSE</span>
          </div>
          <div>
            Production Environment • Public Read-Only Mode Active
          </div>
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
          >
            🔐 Owner Portal
          </button>
        </div>
      </footer>

      {/* Cinematic Case Study Modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          world={selectedProjectWorld}
          onClose={() => setSelectedProject(null)}
        />
      )}

      {/* Secure Owner Authentication Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => {
          setIsLoginModalOpen(false);
          onGoToMissionControl();
        }}
      />
    </div>
  );
};
