import React, { useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { GenMusicLogo } from './GenMusicLogo';

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
      className="relative z-50 w-full bg-[#0a0d18]/95 border-b border-white/10 px-4 py-2 text-xs md:text-sm text-slate-200 shadow-sm backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 justify-center text-center flex-wrap">
          <GenMusicLogo size="xs" glow={true} className="hidden sm:inline-flex" />
          
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 font-mono font-bold text-[10px] uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
            v2.5 Release Live
          </span>

          <p className="text-slate-300 font-medium text-xs sm:text-sm">
            {announcementText ? (
              <strong className="text-white font-bold">{announcementText}</strong>
            ) : (
              <>
                <strong className="text-white font-bold">GEN MUSIC Spatial Audio Available</strong>
                <span className="hidden sm:inline text-slate-400"> — Android APK, Android Car, macOS & Windows.</span>
              </>
            )}
          </p>

          <button
            onClick={onDownloadClick}
            id="banner-cta-button"
            className="inline-flex items-center gap-1 font-bold text-cyan-400 hover:text-cyan-300 underline underline-offset-4 transition ml-1 cursor-pointer text-xs sm:text-sm"
          >
            <span>Get App</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          id="banner-close-btn"
          aria-label="Dismiss banner"
          className="text-slate-400 hover:text-white transition p-1 rounded-md hover:bg-white/10 flex-shrink-0 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
