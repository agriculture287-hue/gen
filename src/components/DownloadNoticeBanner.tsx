import React, { useState, useEffect } from 'react';
import { 
  ExternalLink, 
  Download, 
  CheckCircle2, 
  Clock, 
  X, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';
import { 
  DOWNLOAD_LINKS 
} from '../data/downloadLinks';
import { 
  getSponsorCooldownStatus as checkCooldown, 
  handleDownloadWithSponsor, 
  executeRealDownload 
} from '../utils/downloadHelper';

interface SponsorNoticeData {
  targetUrl: string;
  filename: string;
  isDeepLink?: boolean;
}

interface DownloadNoticeBannerProps {
  isStreamingMode?: boolean;
}

export const DownloadNoticeBanner: React.FC<DownloadNoticeBannerProps> = ({ isStreamingMode = false }) => {
  const [noticeData, setNoticeData] = useState<SponsorNoticeData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [downloadSuccessNotice, setDownloadSuccessNotice] = useState<string | null>(null);

  // Poll / listen for cooldown state
  useEffect(() => {
    // Suppress immediately if streaming mode is active
    if (isStreamingMode) {
      setIsVisible(false);
      return;
    }

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
      if (isStreamingMode) return;
      const detail = (e as CustomEvent).detail;
      setNoticeData(detail);
      setIsVisible(true);
      setDownloadSuccessNotice(null);
      updateCooldown();
    };

    const handleRealDownloadStarted = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setDownloadSuccessNotice(
        `Direct download initiated: ${detail.filename || 'Application'} is downloading now!`
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
  }, [noticeData, isStreamingMode]);

  // Completely hidden during music online streaming or when no notice
  if (isStreamingMode || (!isVisible && remainingSeconds === 0 && !downloadSuccessNotice)) {
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
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 max-w-md w-full animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
    >
      <div className="relative overflow-hidden rounded-2xl bg-[#090d1a]/95 border border-cyan-500/40 p-4 sm:p-5 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(0,240,255,0.2)] backdrop-blur-xl">
        {/* Glow ambient background */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header Row */}
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-400/30 text-cyan-300">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            </span>
            <div>
              <h3 className="font-extrabold text-white text-sm tracking-tight flex items-center gap-2">
                <span>Direct Download Unlocked</span>
                {remainingSeconds > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-[10px] font-mono text-cyan-300 font-bold">
                    <Clock className="w-2.5 h-2.5" />
                    {formatTime(remainingSeconds)}
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Active for 5 minutes • Zero advertisement redirects
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition cursor-pointer"
            aria-label="Dismiss download advisory notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Advisory Message Body */}
        <div className="mt-3 text-xs text-slate-300 leading-relaxed space-y-2 relative z-10 bg-white/[0.03] p-3 rounded-xl border border-white/5">
          {downloadSuccessNotice ? (
            <p className="text-emerald-300 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{downloadSuccessNotice}</span>
            </p>
          ) : (
            <>
              <p className="text-cyan-200/90 font-medium">
                👉 <strong>Advisory:</strong> Sponsor page opened in a new tab. Please return to this page and click <strong>Download</strong> again to start your real download!
              </p>
              <p className="text-[11px] text-slate-400">
                Direct downloads are now unlocked for <strong>5 minutes</strong>. Any download button on this page will now deliver your package directly.
              </p>
            </>
          )}
        </div>

        {/* Action Button Row */}
        <div className="mt-3.5 flex items-center gap-2.5 relative z-10">
          <button
            onClick={handleManualDirectDownload}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Click to Download App Now</span>
          </button>
          
          <button
            onClick={() => setIsVisible(false)}
            className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </aside>
  );
};
