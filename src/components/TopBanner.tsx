import React, { useState } from 'react';
import { ArrowRight, X, Send } from 'lucide-react';
import { GenMusicLogo } from './GenMusicLogo';

interface TopBannerProps {
  onDownloadClick: () => void;
  telegramLink: string;
}

export const TopBanner: React.FC<TopBannerProps> = ({ onDownloadClick, telegramLink }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <aside 
      aria-label="Announcement"
      id="top-announcement-banner"
      className="relative z-50 w-full bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-b border-slate-200/80 px-4 py-2 text-xs md:text-sm text-slate-800 shadow-xs"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 justify-center text-center flex-wrap">
          <GenMusicLogo size="xs" glow={false} className="hidden sm:inline-flex" />
          
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wider shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
            Beta Release
          </span>

          <p className="text-slate-700 font-medium text-xs sm:text-sm">
            <strong className="text-slate-900 font-bold">GEN MUSIC Beta is Available Now</strong>
            <span className="hidden sm:inline text-slate-600"> — Download for Android, Mac & Windows or join Telegram.</span>
          </p>

          <button
            onClick={onDownloadClick}
            id="banner-cta-button"
            className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-800 underline transition ml-1 cursor-pointer text-xs sm:text-sm"
          >
            <span>Download Apps</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <a
            href={telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold text-xs transition ml-2"
          >
            <Send className="w-3 h-3" />
            <span>Telegram Channel</span>
          </a>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          id="banner-close-btn"
          aria-label="Dismiss banner"
          className="text-slate-400 hover:text-slate-700 transition p-1 rounded-md hover:bg-slate-200/60 flex-shrink-0 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
