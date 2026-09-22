import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Download, 
  Check, 
  Sparkles,
  ArrowRight,
  Copy,
  ExternalLink,
  ChevronDown,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GenMusicLogo } from './GenMusicLogo';

interface SharePageProps {
  videoId?: string;
  type?: string;
  onNavigateHome?: () => void;
  onNavigateDownload?: () => void;
}

export const SharePage: React.FC<SharePageProps> = ({ 
  videoId = 'B8uJqlSiJQ4', 
  onNavigateDownload 
}) => {
  const [currentId, setCurrentId] = useState(videoId || 'B8uJqlSiJQ4');
  const [showInstallOptions, setShowInstallOptions] = useState(false);
  const [copied, setCopied] = useState(false);
  const attemptedLaunch = useRef(false);

  // Sync state if prop changes
  useEffect(() => {
    if (videoId) {
      setCurrentId(videoId);
    }
  }, [videoId]);

  // Clean deep link parameters
  const cleanId = encodeURIComponent(currentId || 'B8uJqlSiJQ4');
  const shareUrl = `https://genmusics.vercel.app/share/${cleanId}`;
  const deepLinkUrl = `genmusic://play?id=${cleanId}`;
  const androidIntentUrl = `intent://play?id=${cleanId}#Intent;scheme=genmusic;package=in.gen.agrigence;end`;

  // Analytics event tracker
  const trackEvent = (eventType: string) => {
    try {
      const payload = {
        eventType,
        id: currentId,
        timestamp: new Date().toISOString()
      };
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics', JSON.stringify(payload));
      } else {
        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true
        }).catch(() => {});
      }
    } catch {
      // Non-blocking
    }
  };

  const launchApp = () => {
    trackEvent('app_launch_attempts');
    const isAndroid = typeof window !== 'undefined' && /android/i.test(navigator.userAgent);
    const targetUrl = isAndroid ? androidIntentUrl : deepLinkUrl;

    window.location.href = targetUrl;

    // If user remains on page after 1.5s, reveal install card
    setTimeout(() => {
      setShowInstallOptions(true);
    }, 1500);
  };

  const handleDownloadClick = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    trackEvent('download_clicks');
    if (onNavigateDownload) {
      onNavigateDownload();
    } else {
      window.open('https://genmusics.vercel.app/download', '_blank');
    }
  };

  const copyShareLink = () => {
    try {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // On page load: 1. Wait 1 second, 2. Attempt auto-launch, 3. Show install if not opened
  useEffect(() => {
    trackEvent('share_page_opens');

    if (!attemptedLaunch.current) {
      attemptedLaunch.current = true;
      const timer = setTimeout(() => {
        launchApp();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const features = [
    'Play Music',
    'Offline Playback',
    'Lyrics Support',
    'Playlist Sync',
    'Smart Recommendations',
    'Fast Streaming'
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-100 flex flex-col justify-between items-center px-4 py-6 font-sans relative overflow-x-hidden selection:bg-[#00E676] selection:text-black">
      {/* Ambient background lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#00E676]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-[#1DB954]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top simulated URL bar banner */}
      <div className="w-full max-w-md z-20 mb-4">
        <div className="flex items-center justify-between px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <Globe className="w-3.5 h-3.5 text-[#00E676] shrink-0" />
            <span className="font-mono truncate">https://genmusics.vercel.app/share/<strong className="text-white">{cleanId}</strong></span>
          </div>
          <button 
            onClick={copyShareLink}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 transition-all cursor-pointer shrink-0 ml-2"
            title="Copy share link"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-[#00E676]" />
                <span className="text-[#00E676] font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-400" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Header Branding */}
      <header className="w-full max-w-md flex flex-col items-center gap-2 z-10">
        <div className="flex items-center gap-3">
          <GenMusicLogo size="md" />
          <div className="text-left">
            <h1 className="font-extrabold tracking-wider text-xl text-white">GEN Music</h1>
            <p className="text-xs text-[#00E676] font-medium tracking-wide">Your music is waiting.</p>
          </div>
        </div>
      </header>

      {/* Main Glassmorphism Card */}
      <main className="w-full max-w-md my-auto py-6 z-10 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.8)] text-center flex flex-col items-center"
        >
          {/* Animated Equalizer Graphic */}
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00E676]/20 to-[#1DB954]/10 border border-[#00E676]/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,230,118,0.2)]">
            <div className="flex items-end justify-center gap-1 h-8">
              <span className="w-1.5 bg-[#00E676] rounded-full animate-[bounce_0.8s_infinite_ease-in-out_100ms] h-4" />
              <span className="w-1.5 bg-[#00E676] rounded-full animate-[bounce_0.8s_infinite_ease-in-out_300ms] h-8" />
              <span className="w-1.5 bg-[#00E676] rounded-full animate-[bounce_0.8s_infinite_ease-in-out_150ms] h-6" />
              <span className="w-1.5 bg-[#00E676] rounded-full animate-[bounce_0.8s_infinite_ease-in-out_400ms] h-7" />
              <span className="w-1.5 bg-[#00E676] rounded-full animate-[bounce_0.8s_infinite_ease-in-out_200ms] h-3" />
            </div>
          </div>

          {/* Main Message */}
          <h2 className="text-2xl font-black text-white tracking-tight mb-2">
            Open in GEN Music
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed mb-6 max-w-xs">
            This content was shared using GEN Music. Open the app to start listening.
          </p>

          {/* Action Buttons */}
          <div className="w-full space-y-3">
            {/* Primary: Open GEN Music */}
            <button
              onClick={launchApp}
              id="btn-open-gen-music"
              className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#00E676] to-[#1DB954] text-black font-extrabold text-sm hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-[#00E676]/25 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Open GEN Music</span>
            </button>

            {/* Secondary: Download GEN Music */}
            <a
              href="https://genmusics.vercel.app/download"
              onClick={handleDownloadClick}
              id="btn-download-gen-music"
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-white/[0.05] hover:bg-white/10 text-slate-200 border border-white/10 font-semibold text-sm transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#00E676]" />
              <span>Download GEN Music</span>
            </a>
          </div>

          {/* Prompt toggle if install card not yet open */}
          {!showInstallOptions && (
            <button
              onClick={() => setShowInstallOptions(true)}
              className="mt-4 flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <span>App not opening? View install options</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#00E676]" />
            </button>
          )}

          {/* Install Card */}
          <AnimatePresence>
            {showInstallOptions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full mt-6 pt-6 border-t border-white/10 text-left overflow-hidden"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-[#00E676]" />
                  <h3 className="text-base font-bold text-white">Get GEN Music</h3>
                </div>

                <div className="grid grid-cols-2 gap-2.5 mb-5">
                  {features.map((feat) => (
                    <div key={feat} className="flex items-center gap-2 text-xs text-slate-300">
                      <div className="w-4 h-4 rounded-full bg-[#00E676]/15 flex items-center justify-center text-[#00E676] shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <a
                  href="https://genmusics.vercel.app/download"
                  onClick={handleDownloadClick}
                  className="w-full py-3.5 px-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-[#00E676]/30 text-[#00E676] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
                >
                  <span>Download Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md text-center text-xs text-slate-600 z-10">
        <p>© 2026 GEN Music. Play smarter. Listen better.</p>
      </footer>
    </div>
  );
};
