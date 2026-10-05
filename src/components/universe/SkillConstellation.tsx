import React, { useState } from 'react';
import { useUniverse } from '../../context/UniverseContext';
import { EmptyState } from './EmptyState';
import { Sparkles, Network, Cpu } from 'lucide-react';
import { AIRobot } from '../robot/AIRobot';

export const SkillConstellation: React.FC = () => {
  const { skills } = useUniverse();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [hoveredSkillId, setHoveredSkillId] = useState<string | null>(null);

  if (skills.length === 0) {
    return (
      <EmptyState
        title="Skill constellation awaiting telemetry synchronization."
        message="No skills have been registered yet. Once verified competencies are linked via Mission Control or Resume Intelligence, connected constellations will activate."
      />
    );
  }

  // Get unique categories
  const categories = ['ALL', ...Array.from(new Set(skills.map(s => s.category)))];

  const filteredSkills = selectedCategory === 'ALL'
    ? skills
    : skills.filter(s => s.category === selectedCategory);

  const hoveredSkill = skills.find(s => s.id === hoveredSkillId);

  return (
    <div className="space-y-8">
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-glow-cyan'
                : 'bg-space-900/60 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Constellation Grid of Nodes */}
      <div className="relative p-6 sm:p-10 rounded-3xl bg-space-900/40 border border-cyan-500/20 backdrop-blur-md">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 cosmic-grid opacity-50 rounded-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredSkills.map((skill) => {
            const isHovered = hoveredSkillId === skill.id;
            const isRelated = hoveredSkill?.related_skills?.includes(skill.name);

            return (
              <div
                key={skill.id}
                onMouseEnter={() => setHoveredSkillId(skill.id)}
                onMouseLeave={() => setHoveredSkillId(null)}
                className={`relative p-4 rounded-2xl transition-all duration-300 flex flex-col justify-between border cursor-pointer ${
                  isHovered
                    ? 'bg-space-850 border-cyan-400 shadow-glow-cyan scale-105 z-20'
                    : isRelated
                    ? 'bg-space-900 border-blue-400 shadow-glow-blue scale-102 z-10'
                    : 'bg-space-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Node Top Indicator */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isHovered ? 'bg-cyan-400 animate-ping' : 'bg-cyan-500'
                      }`}
                    />
                    <span className="text-[10px] font-mono text-slate-400 truncate max-w-[100px]">
                      {skill.category}
                    </span>
                  </div>

                  {/* Proficiency only displayed if user explicitly provided it! Never invented */}
                  {skill.proficiency !== undefined && skill.proficiency !== null && (
                    <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/40">
                      {skill.proficiency}%
                    </span>
                  )}
                </div>

                {/* Skill Name */}
                <h4 className="text-sm font-bold font-display text-white mb-1">
                  {skill.name}
                </h4>

                {skill.description && (
                  <p className="text-[11px] text-slate-300 font-sans line-clamp-2 mb-2 leading-relaxed">
                    {skill.description}
                  </p>
                )}

                {/* Related links/chips */}
                {skill.related_skills && skill.related_skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-auto pt-2 border-t border-slate-800/80">
                    {skill.related_skills.slice(0, 2).map((rel, rIdx) => (
                      <span
                        key={rIdx}
                        className="text-[9px] font-mono px-1 rounded bg-space-850 text-slate-400 border border-slate-700"
                      >
                        {rel}
                      </span>
                    ))}
                    {skill.related_skills.length > 2 && (
                      <span className="text-[9px] font-mono text-slate-500">
                        +{skill.related_skills.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Constellation Summary telemetry with PIXEL Robot */}
        <div className="mt-8 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-cyan-400" />
              <span>Active Nodes: {filteredSkills.length}</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              <span>Hover a node to trace semantic dependencies</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <AIRobot
              variant="pixel"
              state={hoveredSkill ? 'scanning' : 'idle'}
              size="xs"
              message={
                hoveredSkill
                  ? `Tracing node: ${hoveredSkill.name}`
                  : `Constellation online (${filteredSkills.length} nodes)`
              }
              showHologram={Boolean(hoveredSkill)}
              hologramText={hoveredSkill?.category || 'ACTIVE'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
