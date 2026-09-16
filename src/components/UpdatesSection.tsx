import React from 'react';
import { Sparkles, Calendar, Tag, CheckCircle, Bell, ArrowRight, ShieldCheck } from 'lucide-react';
import { ANNOUNCEMENT_UPDATES } from '../data/landingData';
import { UpdateItem } from '../types';

interface UpdatesSectionProps {
  onDownloadClick: () => void;
  updates?: UpdateItem[];
}

export const UpdatesSection: React.FC<UpdatesSectionProps> = ({ 
  onDownloadClick,
  updates = ANNOUNCEMENT_UPDATES
}) => {
  const displayUpdates = updates && updates.length > 0 ? updates : ANNOUNCEMENT_UPDATES;
  return (
    <section 
      id="updates" 
      aria-label="Updates and Announcements"
      className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative"
    >
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
          <Bell className="w-3.5 h-3.5" />
          <span>Release Log</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-heading">
          Updates &{' '}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent">
            Announcements
          </span>
        </h2>

        <p className="text-base sm:text-lg text-slate-600">
          Regular builds, audio engine improvements, and community-driven features.
        </p>
      </div>

      {/* Updates Timeline Cards */}
      <div className="space-y-6 max-w-4xl mx-auto">
        {displayUpdates.map((update, idx) => (
          <div
            key={`${update.version}-${idx}`}
            id={`update-card-${update.version.replace(/\s+/g, '-')}`}
            className={`rounded-3xl p-6 sm:p-8 bg-white border transition-all duration-200 ${
              idx === 0
                ? 'border-blue-300 shadow-md'
                : 'border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-slate-900 font-mono">
                  {update.version}
                </span>

                <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${
                  idx === 0 
                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {update.tag}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Released {update.releaseDate}</span>
              </div>
            </div>

            {/* Highlights bullet list */}
            <div className="pt-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                What's New in this Build
              </h4>
              <ul className="space-y-2">
                {update.highlights.map((point, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-3 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {idx === 0 && (
              <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Google Play Protect SHA-256 Verified Clean</span>
                </div>

                <button
                  onClick={onDownloadClick}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs tracking-wide hover:opacity-95 shadow-sm transition cursor-pointer flex items-center justify-center gap-2"
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
