import React from 'react';
import { useUniverse } from '../../context/UniverseContext';
import { ProjectCard } from './ProjectCard';
import { EmptyState } from './EmptyState';
import { 
  Brain, 
  Bot, 
  Sparkles, 
  Database, 
  Eye, 
  MessageSquare, 
  Cpu, 
  Rocket, 
  Layers, 
  Compass
} from 'lucide-react';
import { AIRobot } from '../robot/AIRobot';

const ICON_MAP: Record<string, React.ElementType> = {
  Brain,
  Bot,
  Sparkles,
  Database,
  Eye,
  MessageSquare,
  Cpu,
  Rocket,
  Layers,
  Compass
};

export const WorldsGallery: React.FC = () => {
  const { 
    worlds, 
    projects, 
    activeWorldId, 
    setActiveWorldId, 
    setSelectedProject 
  } = useUniverse();

  const enabledWorlds = worlds.filter(w => w.is_enabled);
  const activeWorld = enabledWorlds.find(w => w.id === activeWorldId) || enabledWorlds[0];

  // Filter projects by active world
  const activeWorldProjects = activeWorld 
    ? projects.filter(p => p.world_id === activeWorld.id) 
    : [];

  return (
    <div className="space-y-12">
      {/* Worlds Orbital Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {enabledWorlds.map((world) => {
          const isActive = activeWorld?.id === world.id;
          const IconComp = ICON_MAP[world.icon] || Compass;
          const worldProjectCount = projects.filter(p => p.world_id === world.id).length;

          return (
            <button
              key={world.id}
              onClick={() => setActiveWorldId(world.id)}
              className={`group relative p-3 sm:p-4 rounded-2xl text-left transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden border ${
                isActive
                  ? 'bg-space-850/90 border-cyan-400 shadow-glow-cyan -translate-y-1'
                  : 'bg-space-900/50 border-slate-800/80 hover:border-slate-600 hover:bg-space-850/50'
              }`}
            >
              {/* Top Sector Indicator */}
              <div className="flex items-center justify-between w-full mb-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: `${world.color}15`,
                    color: world.color,
                    border: `1px solid ${world.color}35`
                  }}
                >
                  <IconComp className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {worldProjectCount}
                </span>
              </div>

              {/* Title */}
              <div>
                <h4 className="text-xs font-bold font-display text-white group-hover:text-cyan-300 transition-colors leading-tight">
                  {world.name}
                </h4>
              </div>

              {/* Active Indicator Bar */}
              {isActive && (
                <div 
                  className="absolute bottom-0 left-0 right-0 h-1"
                  style={{ backgroundColor: world.color }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Active World Banner */}
      {activeWorld && (
        <div 
          className="p-6 sm:p-8 rounded-3xl bg-space-900/70 border backdrop-blur-xl relative overflow-hidden"
          style={{ borderColor: `${activeWorld.color}40` }}
        >
          {/* Subtle Ambient Nebula Background */}
          <div 
            className="absolute -right-20 -top-20 w-80 h-80 rounded-full pointer-events-none opacity-20 blur-3xl"
            style={{ backgroundColor: activeWorld.color }}
          />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono"
                   style={{ backgroundColor: `${activeWorld.color}20`, color: activeWorld.color }}>
                <span>SECTOR ORBIT ACTIVATED</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
                {activeWorld.name}
              </h3>
              {activeWorld.tagline && (
                <p className="text-sm sm:text-base font-medium text-cyan-200/90 font-mono">
                  {activeWorld.tagline}
                </p>
              )}
              {activeWorld.description && (
                <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                  {activeWorld.description}
                </p>
              )}
            </div>

            <div className="flex-shrink-0 flex items-center justify-center p-3 rounded-2xl bg-space-950/50 border border-slate-800/80 backdrop-blur-md">
              <AIRobot
                variant="rover"
                state="floating"
                size="sm"
                message={`Surveying sector: ${activeWorld.name}`}
                showHologram={true}
                hologramText={activeWorld.name.split(' ')[0]}
              />
            </div>
          </div>
        </div>
      )}

      {/* Projects / Missions Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <h4 className="text-sm font-mono tracking-wider text-slate-300 uppercase">
              Sector Missions & Architectural Deployments
            </h4>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {activeWorldProjects.length} {activeWorldProjects.length === 1 ? 'Mission' : 'Missions'}
          </span>
        </div>

        {activeWorldProjects.length === 0 ? (
          <EmptyState
            title={`No missions published yet in ${activeWorld?.name || 'this sector'}.`}
            message="Telemetry coordinates are established. Once real AI/ML architectures and repositories are linked via Mission Control, project planets will illuminate this sector."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeWorldProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                worldName={activeWorld?.name}
                onClick={() => setSelectedProject(project)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
