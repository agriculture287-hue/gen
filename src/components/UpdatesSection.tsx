import React from 'react';
import { Sparkles, Calendar, Tag, CheckCircle, Bell, ArrowRight, ShieldCheck, Link, Plus } from 'lucide-react';
import { ANNOUNCEMENT_UPDATES } from '../data/landingData';
import { UpdateItem } from '../types';

interface UpdatesSectionProps {
  onDownloadClick: () => void;
  updates?: UpdateItem[];
}

export const UpdatesSection: React.FC<UpdatesSectionProps> = ({ 
  onDownloadClick,
  updates = ANNOUNCEMENT_UPDATES,
}) => {
  const displayUpdates = updates && updates.length > 0 ? updates : ANNOUNCEMENT_UPDATES;
  return (
    <section 
      id="updates" 
      aria-label="Updates and Announcements"
      className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative text-white"
    >
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
        <div className="flex items-center justify-center gap-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider">
            <Bell className="w-3.5 h-3.5 text-cyan-400" />
            <span>FIRMWARE & CHANGELOG</span>
          </div>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-heading">
          Updates &{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent">
            Announcements
          </span>
        </h2>

        <p className="text-base sm:text-lg text-slate-400">
          Regular OTA updates, audio DSP refinements, and community requests.
        </p>
      </div>

      {/* Updates Timeline Cards */}
      <div className="space-y-6 max-w-4xl mx-auto">
        {displayUpdates.map((update, idx) => (
          <div
            key={`${update.version}-${idx}`}
            id={`update-card-${update.version.replace(/\s+/g, '-')}`}
            className={`rounded-3xl p-6 sm:p-8 bg-[#0c0f1e]/90 border transition-all duration-200 backdrop-blur-xl ${
              idx === 0
                ? 'border-cyan-500/40 shadow-[0_0_35px_rgba(0,240,255,0.12)] ring-1 ring-cyan-500/20'
                : 'border-white/10 shadow-xl'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-white font-mono">
                  {update.version}
                </span>

                <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border uppercase tracking-wider ${
                  idx === 0 
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' 
                    : 'bg-white/[0.04] text-slate-400 border-white/10'
                }`}>
                  {update.tag}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>Deployed {update.releaseDate}</span>
              </div>
            </div>

            {/* Highlights bullet list */}
            <div className="pt-5 space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Patch Notes & Improvements
              </h4>
              <ul className="space-y-2">
                {update.highlights.map((point, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-3 text-sm text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {idx === 0 && (
              <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Verified Clean • Zero Telemetry Trackers</span>
                </div>

                <button
                  onClick={onDownloadClick}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs tracking-wide hover:opacity-95 shadow-lg shadow-cyan-500/20 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Download this Release</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
