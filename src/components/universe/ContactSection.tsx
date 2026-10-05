import React, { useState } from 'react';
import { useUniverse } from '../../context/UniverseContext';
import { Mail, Send, CheckCircle2, MessageSquare, Terminal } from 'lucide-react';
import { GithubIcon, LinkedinIcon, LeetCodeIcon, HackerRankIcon } from '../common/BrandIcons';
import { AIRobot } from '../robot/AIRobot';

export const ContactSection: React.FC = () => {
  const { profile } = useUniverse();
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [sentSuccess, setSentSuccess] = useState(false);

  const email = profile?.email;
  const github = profile?.github_url;
  const linkedin = profile?.linkedin_url;
  const leetcode = profile?.leetcode_url;
  const hackerrank = profile?.hackerrank_url;

  const handleCopyEmail = () => {
    if (email) {
      navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    
    // Create mailto link for direct transmission
    const subject = encodeURIComponent(`[AI Universe Telemetry] Transmission from ${formData.name}`);
    const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`);
    window.location.href = `mailto:${email || 'veera@example.com'}?subject=${subject}&body=${body}`;
    setSentSuccess(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 sm:p-12 rounded-3xl bg-space-900/70 border border-cyan-500/20 backdrop-blur-xl relative overflow-hidden">
      {/* Decorative Grid */}
      <div className="absolute inset-0 cosmic-grid opacity-30 pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left Column: Direct Links & Telemetry Info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/30 text-cyan-300 text-xs font-mono">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>DIRECT SUBSPHERE TRANSMISSION</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-white mt-2">
                  Connect With The Architect
                </h3>
              </div>

              <div className="flex-shrink-0">
                <AIRobot
                  variant="rover"
                  state={sentSuccess ? 'success' : 'idle'}
                  size="xs"
                  message={
                    sentSuccess
                      ? 'Signal dispatched to deep-space relays!'
                      : 'Subspace beacon online. Direct link to architect.'
                  }
                  showHologram={true}
                  hologramText={sentSuccess ? 'DISPATCHED' : 'BEACON ACTIVE'}
                />
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              For research collaborations, engineering opportunities, or intelligent system design consultations, establish a secure communication uplink.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {email ? (
              <div className="p-4 rounded-2xl bg-space-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-950 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Direct Email</div>
                    <div className="text-xs font-mono text-white font-medium">{email}</div>
                  </div>
                </div>
                <button
                  onClick={handleCopyEmail}
                  className="px-3 py-1.5 rounded-lg bg-space-900 hover:bg-space-850 text-cyan-300 text-xs font-mono border border-cyan-500/30 transition-all cursor-pointer"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-space-950 border border-slate-800 text-xs font-mono text-slate-400">
                Direct email coordinates will be broadcasted once configured in Mission Control.
              </div>
            )}

            {/* Social channels if available */}
            <div className="flex flex-col gap-2">
              {github && (
                <a
                  href={github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl bg-space-950 border border-slate-800 hover:border-cyan-400/40 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-3 transition-all"
                >
                  <GithubIcon className="w-4 h-4 text-cyan-400" />
                  <span>Explore GitHub Systems</span>
                </a>
              )}
              {linkedin && (
                <a
                  href={linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl bg-space-950 border border-slate-800 hover:border-blue-400/40 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-3 transition-all"
                >
                  <LinkedinIcon className="w-4 h-4 text-blue-400" />
                  <span>Connect on LinkedIn</span>
                </a>
              )}
              {leetcode && (
                <a
                  href={leetcode}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl bg-space-950 border border-slate-800 hover:border-amber-400/40 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-3 transition-all"
                >
                  <LeetCodeIcon className="w-4 h-4 text-amber-400" />
                  <span>Solve on LeetCode</span>
                </a>
              )}
              {hackerrank && (
                <a
                  href={hackerrank}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl bg-space-950 border border-slate-800 hover:border-emerald-400/40 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-3 transition-all"
                >
                  <HackerRankIcon className="w-4 h-4 text-emerald-400" />
                  <span>Rankings on HackerRank</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Transmission Form */}
        <div className="p-6 rounded-2xl bg-space-950 border border-slate-800/80">
          <h4 className="text-sm font-mono text-cyan-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Transmit Signal
          </h4>

          {sentSuccess ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h5 className="text-base font-bold text-white font-display">Transmission Dispatched</h5>
              <p className="text-xs text-slate-300 max-w-xs mx-auto font-mono">
                Your email client was initiated. You will receive telemetry confirmation upon transmission receipt.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                  Sender Identity
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dr. Alex Mercer / Lead Recruiter"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-space-900 border border-slate-800 focus:border-cyan-400 text-xs text-white placeholder:text-slate-600 font-mono transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                  Return Frequency (Email)
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@institution.org"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-space-900 border border-slate-800 focus:border-cyan-400 text-xs text-white placeholder:text-slate-600 font-mono transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                  Transmission Content
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe the opportunity, research proposition, or architectural inquiry..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-space-900 border border-slate-800 focus:border-cyan-400 text-xs text-white placeholder:text-slate-600 font-mono transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow-glow-cyan flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" /> Dispatch Transmission
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
