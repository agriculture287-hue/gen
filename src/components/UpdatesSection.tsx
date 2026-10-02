import React from 'react';
import { Calendar, ArrowRight, Check } from 'lucide-react';
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

  const getReleaseLabel = (idx: number) => {
    if (idx === 0) return 'Latest Release';
    if (idx === 1) return 'Previous Release';
    return 'Earlier Release';
  };

  return (
    <section 
      id="updates" 
      aria-label="Updates and Announcements"
      className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10"
    >
      <div className="space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
            Release Notes & Changelog
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Continuous acoustic improvements, engine optimizations, and platform releases.
          </p>
        </div>

        {/* Vertical Timeline */}
        <div className="max-w-3xl mx-auto relative pl-6 sm:pl-8 border-l border-white/10 space-y-8">
          {displayUpdates.map((update, idx) => (
            <div
              key={`update-card-${idx}`}
              id={`update-card-${idx}`}
              className="relative group"
            >
              {/* Timeline marker */}
              <div 
                className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full border-2 ${
                  idx === 0 
                    ? 'bg-sky-500 border-slate-950 ring-4 ring-sky-500/20' 
                    : 'bg-slate-700 border-slate-950'
                }`} 
              />

              <div className="surface-card p-6 space-y-4">
                {/* Header with release label and date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-white font-heading">
                      {getReleaseLabel(idx)}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      idx === 0
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {update.tag}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{update.releaseDate}</span>
                  </div>
                </div>

                {/* Highlights */}
                <ul className="space-y-2">
                  {update.highlights.map((point, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                      <Check className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                {idx === 0 && (
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-mono">Current stable build</span>
                    <button
                      onClick={onDownloadClick}
                      className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Download Latest Release</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
