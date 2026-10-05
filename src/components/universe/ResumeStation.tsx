import React, { useState, useEffect } from 'react';
import { useUniverse } from '../../context/UniverseContext';
import { dbService } from '../../services/db';
import { ResumeCustomSection } from '../../types/database';
import { EmptyState } from './EmptyState';
import { Download, FileText, CheckCircle2, Calendar, ShieldCheck, Eye, Layers } from 'lucide-react';
import { AIRobot } from '../robot/AIRobot';

export const ResumeStation: React.FC = () => {
  const { approvedResume } = useUniverse();
  const [customSections, setCustomSections] = useState<ResumeCustomSection[]>([]);

  useEffect(() => {
    let isMounted = true;
    if (approvedResume?.id) {
      dbService.getCustomSections(approvedResume.id).then(sections => {
        if (isMounted) {
          setCustomSections(sections.filter(s => s.visible !== false));
        }
      }).catch(err => {
        console.error('Failed to load custom sections for ResumeStation', err);
      });
    } else {
      setCustomSections([]);
    }
    return () => {
      isMounted = false;
    };
  }, [approvedResume?.id, approvedResume?.custom_sections]);

  if (!approvedResume) {
    return (
      <div className="space-y-6">
        <EmptyState
          title="Resume Station awaiting telemetry broadcast."
          message="No verified resume version has been designated for public release yet. The owner can upload and approve versions through Mission Control."
        />
        <div className="flex justify-center">
          <AIRobot
            variant="nova"
            state="idle"
            size="sm"
            message="Dossier transmission channel in standby mode."
            showHologram={true}
            hologramText="STANDBY"
          />
        </div>
      </div>
    );
  }

  const handleDownload = () => {
    if (approvedResume.file_url) {
      window.open(approvedResume.file_url, '_blank');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="p-8 rounded-3xl bg-space-900/80 border border-cyan-500/30 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-glow-cyan flex-shrink-0">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-[10px] font-mono text-emerald-400 mb-2">
                <CheckCircle2 className="w-3 h-3" />
                <span>OFFICIALLY APPROVED TELEMETRY</span>
              </div>
              <h3 className="text-xl font-bold font-display text-white">
                {approvedResume.version_name || 'Official Technical Resume'}
              </h3>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  Released: {new Date(approvedResume.upload_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Robot Companion + Download Action */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <AIRobot
              variant="nova"
              state="success"
              size="xs"
              message="Verified technical dossier ready for review or download."
              showHologram={true}
              hologramText="VERIFIED"
            />

            {approvedResume.file_url && (
              <button
                onClick={handleDownload}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow-glow-cyan flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download Resume
              </button>
            )}
          </div>
        </div>

        {/* Embedded Resume View if available as URL */}
        {approvedResume.file_url && approvedResume.file_url.endsWith('.pdf') && (
          <div className="mt-8 rounded-2xl overflow-hidden border border-slate-800 bg-space-950 h-96">
            <iframe
              src={`${approvedResume.file_url}#toolbar=0`}
              title="Resume Preview"
              className="w-full h-full border-none"
            />
          </div>
        )}
      </div>

      {/* Dynamic / Custom Resume Sections */}
      {customSections.length > 0 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-space-900/80 border border-cyan-500/25 backdrop-blur-xl shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold font-display text-white tracking-wide">
                  Extended Career Sectors & Telemetry
                </h4>
                <p className="text-[11px] font-mono text-slate-400">
                  Specialized domains verified from official dossier
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
              {customSections.length} {customSections.length === 1 ? 'SECTOR' : 'SECTORS'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customSections.map((sec) => (
              <div
                key={sec.id}
                className="p-5 rounded-2xl bg-space-950/70 border border-slate-800 hover:border-cyan-500/40 transition-all backdrop-blur-md space-y-3 group shadow-md"
              >
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-bold font-display text-white tracking-wide flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 group-hover:shadow-[0_0_8px_#22d3ee] transition-all" />
                    {sec.title}
                  </h5>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-space-900 text-cyan-400 border border-slate-800 uppercase">
                    {sec.slug}
                  </span>
                </div>

                {Array.isArray(sec.content) ? (
                  <ul className="space-y-1.5 text-xs font-mono text-slate-300">
                    {sec.content.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold leading-relaxed">•</span>
                        <span className="leading-relaxed">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : typeof sec.content === 'object' && sec.content !== null ? (
                  <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">{JSON.stringify(sec.content, null, 2)}</pre>
                ) : (
                  <p className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {String(sec.content || '')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
