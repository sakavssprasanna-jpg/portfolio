import React from 'react';
import { Project } from '../../types/database';
import { ExternalLink, Sparkles, Orbit, Layers, PlayCircle, FileText } from 'lucide-react';
import { GithubIcon } from '../common/BrandIcons';
import { useResolvedMediaUrl } from '../../services/storage';

const ProjectCardThumbnail: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const resolved = useResolvedMediaUrl(src);
  if (!resolved) return null;
  return (
    <div className="w-full h-36 -mx-6 -mt-6 mb-4 overflow-hidden border-b border-slate-800 bg-space-950">
      <img
        src={resolved}
        alt={alt}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
    </div>
  );
};

interface ProjectCardProps {
  project: Project;
  worldName?: string;
  onClick: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, worldName, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer rounded-2xl bg-space-900/60 border border-slate-700/60 hover:border-cyan-400/50 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow-cyan flex flex-col justify-between overflow-hidden"
    >
      {project.thumbnail_url && (
        <ProjectCardThumbnail src={project.thumbnail_url} alt={project.title} />
      )}
      {/* Top Status & Sector */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-500/30">
          <Orbit className="w-3 h-3 text-cyan-400 animate-spin-slow" />
          <span>{worldName || 'AI SECTOR'}</span>
        </div>

        {project.is_featured && (
          <span className="flex items-center gap-1 text-[10px] font-mono text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-500/30">
            <Sparkles className="w-2.5 h-2.5" /> FEATURED
          </span>
        )}
      </div>

      {/* Main Info */}
      <div className="space-y-2 mb-4">
        <h4 className="text-lg font-bold font-display text-white group-hover:text-cyan-300 transition-colors">
          {project.title}
        </h4>
        <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed font-sans">
          {project.short_description || project.full_description || 'View mission telemetry and architectural case study.'}
        </p>
      </div>

      {/* Tech Stack Chips */}
      {project.tech_stack && project.tech_stack.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          {project.tech_stack.slice(0, 4).map((tech, idx) => (
            <span
              key={idx}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-space-800 text-slate-300 border border-slate-700"
            >
              {tech}
            </span>
          ))}
          {project.tech_stack.length > 4 && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-space-850 text-slate-400">
              +{project.tech_stack.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Bottom Footer Actions */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
        <span className="text-[11px] text-cyan-400 group-hover:underline flex items-center gap-1">
          Open Case Study →
        </span>

        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {Boolean(project.github_url?.trim()) && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub Repository"
              className="p-1.5 rounded-lg hover:bg-space-800 text-slate-400 hover:text-white transition-colors"
            >
              <GithubIcon className="w-3.5 h-3.5" />
            </a>
          )}
          {Boolean(project.live_url?.trim()) && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              title="Live Deployment"
              className="p-1.5 rounded-lg hover:bg-space-800 text-slate-400 hover:text-cyan-300 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {Boolean(project.demo_video_url?.trim()) && (
            <a
              href={project.demo_video_url}
              target="_blank"
              rel="noopener noreferrer"
              title="Demo Video"
              className="p-1.5 rounded-lg hover:bg-space-800 text-slate-400 hover:text-purple-300 transition-colors"
            >
              <PlayCircle className="w-3.5 h-3.5" />
            </a>
          )}
          {Boolean(project.documentation_url?.trim()) && (
            <a
              href={project.documentation_url}
              target="_blank"
              rel="noopener noreferrer"
              title="Documentation / Paper"
              className="p-1.5 rounded-lg hover:bg-space-800 text-slate-400 hover:text-emerald-300 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
