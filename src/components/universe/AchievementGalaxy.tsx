import React, { useState } from 'react';
import { useUniverse } from '../../context/UniverseContext';
import { EmptyState } from './EmptyState';
import { Award, ExternalLink, Calendar, FileCheck, Eye, X, Download, ShieldCheck } from 'lucide-react';
import { Achievement } from '../../types/database';
import { useResolvedMediaUrl } from '../../services/storage';
import { sortAchievementsNewestFirst } from '../../utils/dateSorting';

interface AchievementCardProps {
  item: Achievement;
  onOpenModal: (achievement: Achievement, resolvedUrl: string) => void;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ item, onOpenModal }) => {
  const certFileRaw = item.certificate_file_url || item.image_url || '';
  const resolvedCertFile = useResolvedMediaUrl(certFileRaw);

  const hasFile = Boolean(certFileRaw);
  const hasUrl = Boolean(item.certificate_url);
  const isImageFile = hasFile && !certFileRaw.toLowerCase().endsWith('.pdf') && !resolvedCertFile.toLowerCase().endsWith('.pdf');

  const handleViewFile = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!resolvedCertFile) return;

    if (isImageFile) {
      onOpenModal(item, resolvedCertFile);
    } else {
      window.open(resolvedCertFile, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="group relative p-6 rounded-2xl bg-space-900/60 border border-slate-800 hover:border-amber-400/50 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow-cyan flex flex-col justify-between overflow-hidden">
      {/* Subtle Ambient Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 pointer-events-none transition-all" />

      <div>
        {/* Header info */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="w-9 h-9 rounded-xl bg-amber-950/50 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:rotate-12 transition-transform">
            <Award className="w-5 h-5" />
          </div>
          {item.date && (
            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
              <Calendar className="w-3 h-3 text-amber-400" />
              <span>{item.date}</span>
            </div>
          )}
        </div>

        {/* Title & Organization */}
        <h4 className="text-base font-bold font-display text-white mb-1 group-hover:text-amber-300 transition-colors">
          {item.title}
        </h4>
        <p className="text-xs font-mono text-cyan-300 mb-3">
          {item.organization}
        </p>

        {/* Description */}
        <p className="text-xs text-slate-300 leading-relaxed font-sans mb-4">
          {item.description}
        </p>

        {/* Optional Certificate Image Thumbnail Preview */}
        {hasFile && isImageFile && resolvedCertFile && (
          <div 
            onClick={handleViewFile}
            className="mb-4 relative w-full h-32 rounded-xl overflow-hidden bg-space-950 border border-amber-500/30 group/thumb cursor-pointer"
          >
            <img 
              src={resolvedCertFile} 
              alt={item.title} 
              className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-500" 
              loading="lazy"
            />
            <div className="absolute inset-0 bg-space-950/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs font-mono text-amber-300">
              <Eye className="w-4 h-4" />
              <span>Preview Certificate</span>
            </div>
          </div>
        )}
      </div>

      {/* Certificate / Verification Actions */}
      {(hasFile || hasUrl || item.external_url) && (
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-3">
          {/* Case 1: Uploaded Certificate File Present */}
          {hasFile && (
            <button
              type="button"
              onClick={handleViewFile}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300 hover:text-amber-200 hover:underline cursor-pointer"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>View Certificate</span>
            </button>
          )}

          {/* Case 2: URL Present (when file also exists, label clearly as URL; when only URL exists, acts as primary View Certificate) */}
          {hasUrl && (
            <a
              href={item.certificate_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 text-xs font-mono ${
                hasFile 
                  ? 'text-cyan-300 hover:underline' 
                  : 'text-amber-300 hover:underline font-bold'
              }`}
            >
              {!hasFile && <FileCheck className="w-3.5 h-3.5" />}
              <span>{hasFile ? 'Certificate URL' : 'View Certificate'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          {/* Case 3: External Verification Link */}
          {item.external_url && (
            <a
              href={item.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-cyan-300 hover:underline ml-auto"
            >
              <span>Verification</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export const AchievementGalaxy: React.FC = () => {
  const { achievements } = useUniverse();
  const [activeModalItem, setActiveModalItem] = useState<{ achievement: Achievement; url: string } | null>(null);

  const sortedAchievements = React.useMemo(() => {
    return sortAchievementsNewestFirst(achievements);
  }, [achievements]);

  if (achievements.length === 0) {
    return (
      <EmptyState
        title="Discovery artifacts awaiting telemetry record."
        message="No achievements or honors registered yet. Verified accolades and certifications will materialize here once added via Mission Control."
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedAchievements.map((item) => (
          <AchievementCard
            key={item.id}
            item={item}
            onOpenModal={(achievement, url) => setActiveModalItem({ achievement, url })}
          />
        ))}
      </div>

      {/* Futuristic Certificate Detail Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/85 backdrop-blur-xl animate-fadeIn">
          <div className="relative w-full max-w-3xl rounded-3xl bg-space-900 border border-amber-500/40 p-6 sm:p-8 text-slate-100 shadow-2xl overflow-hidden">
            {/* Ambient Nebula Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setActiveModalItem(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-space-850 hover:bg-space-800 transition-colors z-10"
              aria-label="Close certificate preview"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="space-y-1 mb-5 pr-8">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[10px] font-mono uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3" />
                <span>VERIFIED CERTIFICATE DOSSIER</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
                {activeModalItem.achievement.title}
              </h3>
              <p className="text-xs font-mono text-cyan-300">
                {activeModalItem.achievement.organization} {activeModalItem.achievement.date ? `• ${activeModalItem.achievement.date}` : ''}
              </p>
            </div>

            {/* Certificate Display Area */}
            <div className="relative rounded-2xl bg-space-950 border border-slate-800 overflow-hidden flex items-center justify-center max-h-[60vh]">
              <img
                src={activeModalItem.url}
                alt={activeModalItem.achievement.title}
                className="w-full h-full max-h-[60vh] object-contain"
              />
            </div>

            {/* Modal Footer */}
            <div className="pt-5 mt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs font-mono text-slate-400">
                {activeModalItem.achievement.description && (
                  <span className="line-clamp-1 max-w-md">{activeModalItem.achievement.description}</span>
                )}
              </div>

              <div className="flex items-center gap-3 ml-auto">
                <a
                  href={activeModalItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-space-850 hover:bg-space-800 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 font-mono text-xs transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full Size</span>
                </a>

                <button
                  type="button"
                  onClick={() => setActiveModalItem(null)}
                  className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 font-mono text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
