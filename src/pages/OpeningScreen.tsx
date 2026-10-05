import React, { useState } from 'react';
import { Lock, ArrowRight, ShieldCheck, Cpu, Orbit, Sparkles } from 'lucide-react';
import { useUniverse } from '../context/UniverseContext';
import { useResolvedMediaUrl } from '../services/storage';
import { AIRobot } from '../components/robot/AIRobot';

interface OpeningScreenProps {
  onEnterUniverse: () => void;
  onOpenLogin: () => void;
}

export const OpeningScreen: React.FC<OpeningScreenProps> = ({ onEnterUniverse, onOpenLogin }) => {
  const { profile, reducedMotion } = useUniverse();
  const resolvedAvatar = useResolvedMediaUrl(profile?.avatar_url);
  const [hoveredButton, setHoveredButton] = useState<'universe' | 'login' | null>(null);

  const fullName = profile?.full_name || 'VEERA SATYA SAI PRASANNA';
  const headline = profile?.headline || 'AI/ML • GenAI • Intelligent Systems';
  const displayAvatar = resolvedAvatar || profile?.avatar_url;

  // Dynamic message for the cute robot assistant
  const getRobotMessage = () => {
    if (hoveredButton === 'universe') return 'Preparing spatial trajectory...';
    if (hoveredButton === 'login') return 'Commander biometric terminal active';
    return 'Greetings! AI Universe coordinates locked.';
  };

  const getRobotState = () => {
    if (hoveredButton === 'universe') return 'scanning';
    if (hoveredButton === 'login') return 'processing';
    return 'idle';
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center px-4 overflow-hidden z-10 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Central Ambient Aura Glow */}
      <div 
        className="absolute w-[500px] h-[500px] md:w-[750px] md:h-[750px] rounded-full pointer-events-none transition-all duration-700"
        style={{
          background: hoveredButton === 'universe'
            ? 'radial-gradient(circle, rgba(0, 240, 255, 0.18) 0%, rgba(59, 130, 246, 0.1) 40%, transparent 70%)'
            : hoveredButton === 'login'
            ? 'radial-gradient(circle, rgba(139, 92, 246, 0.16) 0%, rgba(59, 130, 246, 0.08) 45%, transparent 70%)'
            : 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, rgba(139, 92, 246, 0.06) 50%, transparent 70%)',
          filter: 'blur(50px)',
          transform: hoveredButton ? 'scale(1.08)' : 'scale(1)',
        }}
      />

      {/* Orbital Telemetry Rings */}
      <div 
        className={`absolute w-[380px] h-[380px] md:w-[620px] md:h-[620px] rounded-full border border-cyan-500/15 pointer-events-none ${
          reducedMotion ? '' : 'animate-orbit-slow'
        }`}
      >
        <div className="absolute -top-1.5 left-1/2 w-3.5 h-3.5 -translate-x-1/2 rounded-full bg-cyan-400 shadow-glow-cyan" />
        <div className="absolute -bottom-1.5 left-1/2 w-2.5 h-2.5 -translate-x-1/2 rounded-full bg-blue-500 shadow-glow-blue" />
        <div className="absolute top-1/2 -left-1.5 w-2 h-2 -translate-y-1/2 rounded-full bg-violet-400 opacity-60" />
      </div>

      {/* Floating Cute Robot Companion (NOVA) */}
      <div className="relative z-20 mb-3 flex items-center justify-center">
        <AIRobot
          variant="nova"
          size="md"
          state={getRobotState()}
          message={getRobotMessage()}
          interactive={true}
        />
      </div>

      {/* Main Holographic Spacecraft Console Container */}
      <div className="relative max-w-3xl w-full text-center space-y-8 py-10 px-6 sm:px-12 rounded-3xl holo-panel border border-cyan-500/25 shadow-2xl backdrop-blur-2xl">
        {/* Holographic Tactical Reticles in Corners */}
        <div className="absolute top-3 left-3 text-[10px] font-mono text-cyan-400/40 select-none">┌ SEC:01 ┐</div>
        <div className="absolute top-3 right-3 text-[10px] font-mono text-cyan-400/40 select-none">┌ SYS:RDY ┐</div>
        <div className="absolute bottom-3 left-3 text-[10px] font-mono text-cyan-400/40 select-none">└ 40.7°N ┘</div>
        <div className="absolute bottom-3 right-3 text-[10px] font-mono text-cyan-400/40 select-none">└ ORB:SYNC ┘</div>

        {/* Neural Coordinates Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-space-950/80 border border-cyan-400/30 text-cyan-300 text-xs font-mono tracking-widest uppercase shadow-sm">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-glow-cyan" />
          <span>Neural Coordinates Active • Intelligent Systems Online</span>
        </div>

        {/* Profile Picture (Only if exists - with subtle glow, glass frame, and soft orbital ring) */}
        {profile?.avatar_url && (
          <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center my-1">
            {/* Soft orbital ring */}
            <div className={`absolute -inset-2.5 rounded-full border border-cyan-400/30 ${reducedMotion ? '' : 'animate-spin-slow'} pointer-events-none`}>
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-glow-cyan" />
            </div>
            {/* Glass frame with subtle glow */}
            <div className="relative w-full h-full rounded-full p-1 bg-gradient-to-tr from-cyan-400/60 via-blue-500/40 to-purple-600/40 shadow-glow-cyan">
              <div className="w-full h-full rounded-full overflow-hidden bg-space-950 border border-cyan-400/40 backdrop-blur-md">
                <img
                  src={displayAvatar}
                  alt={fullName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        )}

        {/* Identity Title with Intentional Typography Hierarchy */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold font-hero-name tracking-tight text-gradient-cyan">
            {fullName}
          </h1>
          <p className="text-sm sm:text-lg md:text-xl font-medium tracking-wide text-cyan-200/90 font-mono">
            {headline}
          </p>
        </div>

        {/* Cinematic Subtitle */}
        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto font-body-content leading-relaxed">
          Traverse an interactive multidimensional ecosystem of machine learning architectures, autonomous agentic swarms, neural knowledge graphs, and production engineering.
        </p>

        {/* Physical Futuristic Control Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          {/* Option 1: ENTER THE UNIVERSE (Spacecraft Launch Feel) */}
          <button
            onClick={onEnterUniverse}
            onMouseEnter={() => setHoveredButton('universe')}
            onMouseLeave={() => setHoveredButton(null)}
            className="btn-control-universe group w-full sm:w-auto px-9 py-4 rounded-2xl text-slate-950 font-extrabold text-sm sm:text-base tracking-wider uppercase flex items-center justify-center gap-3 cursor-pointer overflow-hidden focus:outline-none focus:ring-2 focus:ring-cyan-300"
          >
            <span className="relative z-10 flex items-center gap-2 font-display">
              <span className="text-lg">🚀</span> ENTER THE UNIVERSE
            </span>
            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5 relative z-10" />
          </button>

          {/* Option 2: MY LOGIN (Secure Owner Gateway) */}
          <button
            onClick={onOpenLogin}
            onMouseEnter={() => setHoveredButton('login')}
            onMouseLeave={() => setHoveredButton(null)}
            className="btn-control-gateway group w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm sm:text-base tracking-wider transition-all flex items-center justify-center gap-2.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <Lock className="w-4 h-4 text-cyan-400 transition-transform duration-300 group-hover:scale-110" />
            <span className="font-display">🔐 MY LOGIN</span>
          </button>
        </div>

        {/* Telemetry Status Bar */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <Orbit className="w-3.5 h-3.5 text-cyan-400" />
            <span>8 AI World Sectors</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>Agentic AI & Neural Graph</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cryptographic Telemetry</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-xs text-slate-500 font-mono tracking-wider">
        © {new Date().getFullYear()} {fullName} • All Telemetry Systems Operational
      </footer>
    </div>
  );
};
