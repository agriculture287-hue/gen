import React, { useState, useEffect } from 'react';
import { 
  ExternalLink, 
  Download, 
  CheckCircle2, 
  Clock, 
  X, 
  Sparkles 
} from 'lucide-react';
import { 
  getSponsorCooldownStatus as checkCooldown, 
  executeRealDownload,
  triggerActiveAd
} from '../utils/downloadHelper';

interface SponsorNoticeData {
  targetUrl: string;
  filename: string;
  isDeepLink?: boolean;
}

export const DownloadNoticeBanner: React.FC = () => {
  const [noticeData, setNoticeData] = useState<SponsorNoticeData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [downloadSuccessNotice, setDownloadSuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    const updateCooldown = () => {
      const status = checkCooldown();
      if (status.isActive) {
        setRemainingSeconds(status.remainingSeconds);
      } else {
        setRemainingSeconds(0);
        if (!noticeData) {
          setIsVisible(false);
        }
      }
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);

    const handleSponsorOpened = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setNoticeData(detail);
      setIsVisible(true);
      setDownloadSuccessNotice(null);
      updateCooldown();
    };

    const handleRealDownloadStarted = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setDownloadSuccessNotice(
        `Direct download initiated: ${detail.filename || 'Application'}`
      );
      setTimeout(() => {
        setDownloadSuccessNotice(null);
      }, 5000);
      updateCooldown();
    };

    window.addEventListener('genmusic-sponsor-opened', handleSponsorOpened);
    window.addEventListener('genmusic-real-download-started', handleRealDownloadStarted);
    window.addEventListener('genmusic-cooldown-change', updateCooldown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('genmusic-sponsor-opened', handleSponsorOpened);
      window.removeEventListener('genmusic-real-download-started', handleRealDownloadStarted);
      window.removeEventListener('genmusic-cooldown-change', updateCooldown);
    };
  }, [noticeData]);

  if (!isVisible && remainingSeconds === 0 && !downloadSuccessNotice) {
    return null;
  }

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleManualDirectDownload = () => {
    const url = noticeData?.targetUrl || 'https://github.com/agriculture287-hue/gen/releases/download/apk/GEN-Music.apk';
    const filename = noticeData?.filename || 'GEN-Music.apk';
    executeRealDownload(url, filename, noticeData?.isDeepLink);
    setDownloadSuccessNotice(`Direct download started: ${filename}`);
  };

  return (
    <aside 
      aria-label="Download Status and Direct Download Access"
      className="fixed bottom-14 sm:bottom-6 right-4 sm:right-6 z-40 max-w-sm w-full animate-in fade-in slide-in-from-bottom-5 duration-200"
    >
      <div className="surface-card p-4 sm:p-5 shadow-2xl bg-[#0f131d] border border-white/10">
        
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-white text-sm font-heading flex items-center gap-2">
              <span>Download & Sponsor Active</span>
              {remainingSeconds > 0 && (
                <span className="text-[10px] font-mono text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded-full border border-sky-500/20">
                  {formatTime(remainingSeconds)}
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Direct download mirror active
            </p>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/5 transition cursor-pointer"
            aria-label="Dismiss download notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Body */}
        <div className="mt-3 text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-white/5">
          {downloadSuccessNotice ? (
            <p className="text-emerald-400 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{downloadSuccessNotice}</span>
            </p>
          ) : (
            <p className="text-slate-300">
              Sponsor page opened in a separate tab. Click below if your installer didn't begin downloading automatically.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="mt-3.5 flex items-center gap-2">
          <button
            onClick={handleManualDirectDownload}
            className="flex-1 py-2 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Now</span>
          </button>

          <button
            onClick={() => triggerActiveAd()}
            className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/10 flex items-center gap-1 transition cursor-pointer"
            title="Visit Sponsor Offer"
          >
            <span>Sponsor</span>
            <ExternalLink className="w-3 h-3 text-sky-400" />
          </button>

          <button
            onClick={() => setIsVisible(false)}
            className="py-2 px-2.5 rounded-lg text-slate-400 hover:text-white text-xs hover:bg-white/5 transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </aside>
  );
};
