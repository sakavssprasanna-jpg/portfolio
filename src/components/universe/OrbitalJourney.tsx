import React from 'react';
import { useUniverse } from '../../context/UniverseContext';
import { EmptyState } from './EmptyState';
import { Briefcase, GraduationCap, Milestone, Telescope, ExternalLink, Calendar } from 'lucide-react';
import { sortJourneyPresentNewestFirst } from '../../utils/dateSorting';

export const OrbitalJourney: React.FC = () => {
  const { journey } = useUniverse();

  const sortedJourney = React.useMemo(() => {
    return sortJourneyPresentNewestFirst(journey);
  }, [journey]);

  if (journey.length === 0) {
    return (
      <EmptyState
        title="Orbital timeline awaiting flight trajectory."
        message="No journey waypoints recorded yet. Professional milestones, roles, and research tenures will appear here once registered via Mission Control."
      />
    );
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'education':
        return GraduationCap;
      case 'milestone':
        return Milestone;
      case 'research':
        return Telescope;
      default:
        return Briefcase;
    }
  };

  return (
    <div className="relative max-w-4xl mx-auto py-8">
      {/* Central Glowing Orbital Axis */}
      <div className="absolute top-0 bottom-0 left-4 sm:left-1/2 w-0.5 -translate-x-1/2 bg-gradient-to-b from-cyan-500/20 via-cyan-400 to-blue-600/20 shadow-glow-cyan pointer-events-none" />

      <div className="space-y-12">
        {sortedJourney.map((entry, idx) => {
          const isEven = idx % 2 === 0;
          const IconComp = getCategoryIcon(entry.category);

          return (
            <div
              key={entry.id}
              className={`relative flex flex-col sm:flex-row items-start ${
                isEven ? 'sm:flex-row-reverse' : ''
              } gap-6 group`}
            >
              {/* Orbital Timeline Waypoint Node */}
              <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-space-950 border-2 border-cyan-400 shadow-glow-cyan flex items-center justify-center z-10 group-hover:scale-125 transition-transform duration-300">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-300" />
              </div>

              {/* Waypoint Content Card */}
              <div className="ml-12 sm:ml-0 sm:w-1/2 sm:px-8 w-full">
                <div className="p-6 rounded-2xl bg-space-900/70 border border-slate-800 group-hover:border-cyan-500/40 backdrop-blur-md transition-all duration-300 group-hover:shadow-glow-cyan">
                  {/* Category & Date */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 uppercase">
                      <IconComp className="w-3 h-3" />
                      <span>{entry.category}</span>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-mono text-slate-400">
                      <Calendar className="w-3 h-3 text-cyan-400" />
                      <span>{entry.date_range}</span>
                    </div>
                  </div>

                  {/* Title & Organization with optional logo */}
                  <div className="flex items-start gap-3 mb-3">
                    {entry.image_url && (
                      <img
                        src={entry.image_url}
                        alt={entry.organization}
                        className="w-10 h-10 rounded-xl object-contain bg-space-950 border border-slate-700 p-1 flex-shrink-0"
                      />
                    )}
                    <div>
                      <h4 className="text-base sm:text-lg font-bold font-display text-white mb-0.5">
                        {entry.title}
                      </h4>
                      <p className="text-xs font-mono text-cyan-400/90">
                        {entry.organization}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans mb-4">
                    {entry.description}
                  </p>

                  {/* External Link if exists */}
                  {entry.external_url && (
                    <a
                      href={entry.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 hover:underline"
                    >
                      <span>Verification Telemetry</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
