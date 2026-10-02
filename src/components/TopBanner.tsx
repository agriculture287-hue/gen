import React, { useState } from 'react';
import { ArrowRight, X } from 'lucide-react';

interface TopBannerProps {
  onDownloadClick: () => void;
  announcementText?: string;
}

export const TopBanner: React.FC<TopBannerProps> = ({ onDownloadClick, announcementText }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <aside 
      aria-label="Announcement"
      id="top-announcement-banner"
      className="relative z-50 w-full bg-[#121622] border-b border-white/10 px-4 py-2.5 text-xs sm:text-sm text-slate-300"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 justify-center text-center flex-wrap">
          <span className="font-semibold text-slate-400">
            {announcementText || "GEN MUSIC Official Release Available Now — Android, Android Car, Mac & Windows."}
          </span>

          <span aria-hidden="true" className="text-slate-600 hidden sm:inline">·</span>

          <button
            onClick={onDownloadClick}
            id="banner-cta-button"
            className="inline-flex items-center gap-1 font-semibold text-sky-400 hover:text-sky-300 underline underline-offset-4 transition cursor-pointer text-xs sm:text-sm"
          >
            <span>Download now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          id="banner-close-btn"
          aria-label="Dismiss banner"
          className="text-slate-400 hover:text-slate-200 transition p-1 rounded-lg hover:bg-white/5 flex-shrink-0 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
