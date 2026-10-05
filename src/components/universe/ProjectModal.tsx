import React from 'react';
import { Project, World } from '../../types/database';
import { 
  X, 
  ExternalLink, 
  PlayCircle, 
  Cpu, 
  AlertTriangle, 
  CheckCircle2, 
  Lightbulb, 
  Layers, 
  UserCheck, 
  Sparkles,
  Calendar,
  Compass,
  FileText
} from 'lucide-react';
import { GithubIcon } from '../common/BrandIcons';
import { AIRobot } from '../robot/AIRobot';
import { useResolvedMediaUrl } from '../../services/storage';

const ProjectModalImage: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => {
  const resolved = useResolvedMediaUrl(src);
  if (!resolved) return null;
  return <img src={resolved} alt={alt} className={className} loading="lazy" />;
};

interface ProjectModalProps {
  project: Project | null;
  world?: World;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, world, onClose }) => {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-space-950/85 backdrop-blur-xl overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl my-auto rounded-3xl bg-space-900/95 border border-cyan-500/30 shadow-2xl p-6 sm:p-10 text-slate-100 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-project-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="sticky sm:absolute top-2 right-2 sm:top-6 sm:right-6 z-20 p-2 rounded-xl bg-space-850 hover:bg-space-800 text-slate-400 hover:text-white border border-slate-700/80 transition-colors"
          aria-label="Close project modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Sector Header */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-400/40 text-cyan-300 text-xs font-mono">
            <Compass className="w-3.5 h-3.5" />
            <span>{world?.name || 'MISSION SECTOR'}</span>
          </div>
          {project.project_date && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-space-800 border border-slate-700 text-slate-400 text-xs font-mono">
              <Calendar className="w-3.5 h-3.5" />
              <span>{project.project_date}</span>
            </div>
          )}
          <div className="px-2.5 py-1 rounded-full bg-blue-950/50 border border-blue-500/30 text-blue-300 text-xs font-mono uppercase">
            STATUS: {project.status.replace('_', ' ')}
          </div>
        </div>

        {/* Project Title & Inspecting Robot */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 id="modal-project-title" className="text-2xl sm:text-4xl font-extrabold font-display text-white">
            {project.title}
          </h2>
          <div className="flex-shrink-0">
            <AIRobot
              variant="rover"
              state="scanning"
              size="xs"
              message={`Inspecting mission: ${project.title}`}
              showHologram={true}
              hologramText="SCANNING"
            />
          </div>
        </div>

        {/* Action Links Bar */}
        {(Boolean(project.live_url?.trim()) || Boolean(project.github_url?.trim()) || Boolean(project.demo_video_url?.trim()) || Boolean(project.documentation_url?.trim())) && (
          <div className="flex flex-wrap gap-3 mb-8">
            {Boolean(project.live_url?.trim()) && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow-glow-cyan flex items-center gap-2 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" /> Live Deployment
              </a>
            )}
            {Boolean(project.github_url?.trim()) && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-space-850 hover:bg-space-800 text-slate-200 border border-slate-700 hover:border-cyan-400/50 text-xs font-mono tracking-wider transition-all flex items-center gap-2 cursor-pointer"
              >
                <GithubIcon className="w-4 h-4 text-cyan-400" /> GitHub Repository
              </a>
            )}
            {Boolean(project.demo_video_url?.trim()) && (
              <a
                href={project.demo_video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-purple-950/50 hover:bg-purple-900/50 text-purple-200 border border-purple-500/30 text-xs font-mono tracking-wider transition-all flex items-center gap-2 cursor-pointer"
              >
                <PlayCircle className="w-4 h-4 text-purple-400" /> Demo Video
              </a>
            )}
            {Boolean(project.documentation_url?.trim()) && (
              <a
                href={project.documentation_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/50 text-emerald-200 border border-emerald-500/30 text-xs font-mono tracking-wider transition-all flex items-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-emerald-400" /> Documentation / Paper
              </a>
            )}
          </div>
        )}

        {/* Visual Storytelling Sections */}
        <div className="space-y-8 text-sm sm:text-base leading-relaxed">
          {/* Mission Overview */}
          <section className="space-y-2">
            <h3 className="text-xs font-mono text-cyan-300 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> MISSION OVERVIEW
            </h3>
            <p className="text-slate-200 font-sans">
              {project.full_description || project.short_description}
            </p>
          </section>

          {/* Problem & Solution Grid */}
          {(project.problem || project.solution) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.problem && (
                <div className="p-5 rounded-2xl bg-red-950/20 border border-red-500/20 space-y-2">
                  <div className="text-xs font-mono text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> THE CHALLENGE / PROBLEM
                  </div>
                  <p className="text-slate-300 text-xs sm:text-sm">
                    {project.problem}
                  </p>
                </div>
              )}
              {project.solution && (
                <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                  <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> THE ARCHITECTED SOLUTION
                  </div>
                  <p className="text-slate-300 text-xs sm:text-sm">
                    {project.solution}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* AI/ML Approach */}
          {(project.ai_ml_approach || project.models_methods || project.dataset_info) && (
            <section className="p-5 rounded-2xl bg-space-850/70 border border-cyan-500/20 space-y-3">
              <h3 className="text-xs font-mono text-cyan-300 uppercase tracking-widest flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" /> AI / ML ARCHITECTURAL METHODOLOGY
              </h3>
              {project.ai_ml_approach && (
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  {project.ai_ml_approach}
                </p>
              )}
              {(project.models_methods || project.dataset_info) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                  {project.models_methods && (
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-0.5">Models & Methods</span>
                      <span className="text-xs text-slate-300">{project.models_methods}</span>
                    </div>
                  )}
                  {project.dataset_info && (
                    <div>
                      <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider block mb-0.5">Dataset & Benchmarks</span>
                      <span className="text-xs text-slate-300">{project.dataset_info}</span>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Architecture Diagram & Description */}
          {(project.architecture_diagram || project.architecture_description) && (
            <section className="space-y-3">
              <h3 className="text-xs font-mono text-cyan-300 uppercase tracking-widest flex items-center gap-2">
                <Layers className="w-4 h-4" /> SYSTEM ARCHITECTURE & DATA FLOW
              </h3>
              {project.architecture_diagram && (
                project.architecture_diagram.startsWith('http') || project.architecture_diagram.startsWith('idb://') || project.architecture_diagram.startsWith('data:') ? (
                  <div className="rounded-2xl overflow-hidden border border-slate-700 bg-space-950 p-2">
                    <ProjectModalImage
                      src={project.architecture_diagram}
                      alt={`${project.title} Architecture`}
                      className="w-full h-auto object-contain rounded-xl max-h-96 mx-auto"
                    />
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-space-950 border border-slate-800 font-mono text-xs text-cyan-200 overflow-x-auto whitespace-pre">
                    {project.architecture_diagram}
                  </div>
                )
              )}
              {project.architecture_description && (
                <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                  {project.architecture_description}
                </p>
              )}
            </section>
          )}

          {/* Tech Stack */}
          {project.tech_stack && project.tech_stack.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest">
                TECH STACK & FRAMEWORKS
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.tech_stack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-space-800 border border-slate-700 text-cyan-300 text-xs font-mono"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Features */}
          {project.features && project.features.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-xs font-mono text-cyan-300 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> CORE CAPABILITIES & HIGHLIGHTS
              </h3>
              <ul className="space-y-2">
                {project.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* User Contribution */}
          {project.my_contribution && (
            <section className="p-5 rounded-2xl bg-space-850/60 border border-slate-700 space-y-2">
              <h3 className="text-xs font-mono text-blue-300 uppercase tracking-widest flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-400" /> MY CONTRIBUTION
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm">
                {project.my_contribution}
              </p>
            </section>
          )}

          {/* Challenges & Solutions & Learnings */}
          {(project.challenges || project.solutions_developed || project.learnings) && (
            <div className="space-y-4 pt-2 border-t border-slate-800">
              {project.challenges && (
                <div>
                  <h4 className="text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
                    CHALLENGES ENCOUNTERED
                  </h4>
                  <p className="text-slate-300 text-xs sm:text-sm">{project.challenges}</p>
                </div>
              )}
              {project.solutions_developed && (
                <div>
                  <h4 className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
                    SOLUTIONS IMPLEMENTED
                  </h4>
                  <p className="text-slate-300 text-xs sm:text-sm">{project.solutions_developed}</p>
                </div>
              )}
              {project.learnings && (
                <div>
                  <h4 className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" /> KEY INSIGHTS & LEARNINGS
                  </h4>
                  <p className="text-slate-300 text-xs sm:text-sm">{project.learnings}</p>
                </div>
              )}
            </div>
          )}

          {/* Screenshots Gallery if available */}
          {project.screenshots && project.screenshots.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest">
                TELEMETRY SCREENSHOTS
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.screenshots.map((shot, idx) => (
                  <div key={idx} className="rounded-xl overflow-hidden border border-slate-700 bg-space-950">
                    <ProjectModalImage
                      src={shot}
                      alt={`${project.title} screenshot ${idx + 1}`}
                      className="w-full h-auto object-cover max-h-60"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
