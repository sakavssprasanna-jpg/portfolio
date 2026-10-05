import React from 'react';
import { Telescope, Radio, ShieldAlert } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: 'telescope' | 'radio' | 'shield';
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No missions published yet.',
  message = 'Telemetry data will synchronize once real missions and research milestones are registered through Mission Control.',
  icon = 'telescope',
  actionLabel,
  onAction
}) => {
  const IconComponent = icon === 'radio' ? Radio : icon === 'shield' ? ShieldAlert : Telescope;

  return (
    <div className="w-full py-16 px-6 flex flex-col items-center justify-center text-center rounded-2xl bg-space-900/40 border border-dashed border-cyan-500/20 backdrop-blur-sm">
      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-full bg-cyan-950/60 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-glow-cyan">
          <IconComponent className="w-8 h-8 opacity-90 animate-pulse" />
        </div>
        <div className="absolute -inset-2 rounded-full border border-cyan-500/10 pointer-events-none animate-ping" />
      </div>

      <h3 className="text-lg font-bold font-display text-white mb-2 tracking-wide">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-slate-400 max-w-md font-sans leading-relaxed">
        {message}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-6 px-4 py-2 rounded-xl bg-space-850 hover:bg-space-800 border border-cyan-500/30 text-cyan-300 text-xs font-mono tracking-wider transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
