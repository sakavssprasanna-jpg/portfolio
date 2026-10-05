import React from 'react';
import { useUniverse } from '../../context/UniverseContext';
import { useResolvedMediaUrl } from '../../services/storage';
import { User, MapPin, Mail, Terminal, Sparkles, Cpu } from 'lucide-react';
import { GithubIcon, LinkedinIcon, LeetCodeIcon, HackerRankIcon } from '../common/BrandIcons';

export const AboutSection: React.FC = () => {
  const { profile } = useUniverse();
  const resolvedAvatar = useResolvedMediaUrl(profile?.avatar_url);

  if (!profile) return null;

  const displayAvatar = resolvedAvatar || profile.avatar_url;

  return (
    <div className="max-w-5xl mx-auto p-8 sm:p-12 rounded-3xl bg-space-900/60 border border-cyan-500/20 backdrop-blur-xl relative overflow-hidden">
      {/* Decorative Grid and Ambient Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 cosmic-grid opacity-30 pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left Column: Avatar / Identity Sphere */}
        <div className="md:col-span-4 flex flex-col items-center text-center">
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center">
            {/* Soft Orbital Ring */}
            <div className="absolute -inset-2.5 rounded-full border border-cyan-400/25 animate-spin-slow pointer-events-none">
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-glow-cyan" />
            </div>
            {/* Glass Frame with Subtle Glow */}
            <div className="relative w-full h-full rounded-full p-1 bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 shadow-glow-cyan">
              <div className="w-full h-full rounded-full bg-space-950 flex items-center justify-center overflow-hidden border-2 border-space-900">
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt={profile.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-cyan-400">
                    <Terminal className="w-14 h-14 mb-2 animate-pulse" />
                    <span className="text-[11px] font-mono text-cyan-300">NEURAL CORE</span>
                  </div>
                )}
              </div>
              <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-emerald-400 border-2 border-space-950 shadow-glow-cyan" title="Operational Telemetry" />
            </div>
          </div>

          <h3 className="mt-4 text-xl font-bold font-display text-white">
            {profile.full_name}
          </h3>
          <p className="text-xs font-mono text-cyan-300">
            {profile.headline}
          </p>

          {profile.location && (
            <div className="mt-2 flex items-center gap-1.5 text-xs font-mono text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>{profile.location}</span>
            </div>
          )}
        </div>

        {/* Right Column: Bio & Engineering Thesis */}
        <div className="md:col-span-8 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/30 text-cyan-300 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ENGINEER BRIEF & MISSION PROFILE</span>
            </div>
            <h4 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
              Pioneering Intelligent Systems & Applied Machine Learning
            </h4>
          </div>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-sans">
            {profile.bio || 
              'Specializing in AI/ML, Machine Learning, Generative AI, RAG, Agentic AI, Computer Vision, NLP, and Software Engineering. Architecting resilient neural algorithms, stateful agentic workflows, and high-performance production systems.'}
          </p>

          {/* Core Telemetry Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-space-950/80 border border-slate-800">
              <div className="text-[10px] font-mono text-cyan-400 uppercase">Focus Area</div>
              <div className="text-xs font-bold text-slate-200 mt-1">AI / ML & GenAI</div>
            </div>
            <div className="p-3.5 rounded-xl bg-space-950/80 border border-slate-800">
              <div className="text-[10px] font-mono text-blue-400 uppercase">Architecture</div>
              <div className="text-xs font-bold text-slate-200 mt-1">Agentic & RAG</div>
            </div>
            <div className="p-3.5 rounded-xl bg-space-950/80 border border-slate-800">
              <div className="text-[10px] font-mono text-purple-400 uppercase">Engineering</div>
              <div className="text-xs font-bold text-slate-200 mt-1">Distributed Systems</div>
            </div>
          </div>

          {/* Social Links */}
          <div className="pt-2 flex flex-wrap gap-3">
            {profile.github_url && (
              <a
                href={profile.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-space-950 hover:bg-space-850 border border-slate-700 hover:border-cyan-400 text-xs font-mono text-slate-200 flex items-center gap-2 transition-all"
              >
                <GithubIcon className="w-4 h-4 text-cyan-400" />
                <span>GitHub Telemetry</span>
              </a>
            )}
            {profile.linkedin_url && (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-space-950 hover:bg-space-850 border border-slate-700 hover:border-blue-400 text-xs font-mono text-slate-200 flex items-center gap-2 transition-all"
              >
                <LinkedinIcon className="w-4 h-4 text-blue-400" />
                <span>LinkedIn Network</span>
              </a>
            )}
            {profile.leetcode_url && (
              <a
                href={profile.leetcode_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-space-950 hover:bg-space-850 border border-slate-700 hover:border-amber-400 text-xs font-mono text-slate-200 flex items-center gap-2 transition-all"
              >
                <LeetCodeIcon className="w-4 h-4 text-amber-400" />
                <span>LeetCode Arena</span>
              </a>
            )}
            {profile.hackerrank_url && (
              <a
                href={profile.hackerrank_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-space-950 hover:bg-space-850 border border-slate-700 hover:border-emerald-400 text-xs font-mono text-slate-200 flex items-center gap-2 transition-all"
              >
                <HackerRankIcon className="w-4 h-4 text-emerald-400" />
                <span>HackerRank Grid</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
