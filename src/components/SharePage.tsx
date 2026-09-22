import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GenMusicLogo } from './GenMusicLogo';

interface SharePageProps {
  videoId: string;
  type?: string;
  onNavigateHome?: () => void;
}

interface SongMeta {
  title: string;
  author: string;
  thumbnailHQ: string;
}

export const SharePage: React.FC<SharePageProps> = ({ videoId }) => {
  const [showInstallOptions, setShowInstallOptions] = useState(false);
  const [meta, setMeta] = useState<SongMeta>({
    title: 'Shared Song',
    author: 'GenMusic',
    thumbnailHQ: videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : 'https://genmusics.vercel.app/logo.png'
  });
  const appOpenedRef = useRef(false);

  const cleanId = encodeURIComponent(videoId || '');
  const appScheme = 'genmusic';
  const packageName = 'in.gen.agrigence';
  const playStoreUrl = 'https://play.google.com/store/apps/details?id=in.gen.agrigence';
  const appStoreUrl = 'https://apps.apple.com/app/genmusic/id123456789';

  const androidIntentUrl = `intent://play?v=${cleanId}#Intent;scheme=${appScheme};package=${packageName};S.browser_fallback_url=${encodeURIComponent(playStoreUrl)};end`;
  const iosSchemeUrl = `${appScheme}://play?v=${cleanId}`;

  // Fetch oEmbed metadata via serverless /api/meta
  useEffect(() => {
    if (!videoId) return;
    fetch(`/api/meta?id=${cleanId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.title) {
          setMeta({
            title: data.title,
            author: data.author || 'GenMusic',
            thumbnailHQ: data.thumbnailHQ || `https://i.ytimg.com/vi/${cleanId}/hqdefault.jpg`
          });
        }
      })
      .catch(() => {});
  }, [videoId, cleanId]);

  const launchApp = () => {
    if (typeof window === 'undefined') return;
    const ua = navigator.userAgent || '';
    const isAndroid = /android/i.test(ua);
    const isIOS = /iphone|ipad|ipod/i.test(ua);

    if (isAndroid) {
      window.location.href = androidIntentUrl;
    } else if (isIOS) {
      window.location.href = iosSchemeUrl;
    } else {
      setShowInstallOptions(true);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ua = navigator.userAgent || '';
    const isAndroid = /android/i.test(ua);
    const isIOS = /iphone|ipad|ipod/i.test(ua);
    const isMobile = isAndroid || isIOS;

    if (!isMobile) {
      setShowInstallOptions(true);
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        appOpenedRef.current = true;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', () => { appOpenedRef.current = true; });

    // Initial redirect attempt on mobile
    if (isAndroid) {
      window.location.href = androidIntentUrl;
    } else if (isIOS) {
      window.location.href = iosSchemeUrl;
    }

    // After 1.5s, if app did not open, show fallback card
    const timer = setTimeout(() => {
      if (!appOpenedRef.current && document.visibilityState !== 'hidden') {
        setShowInstallOptions(true);
      }
    }, 1500);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [androidIntentUrl, iosSchemeUrl]);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-100 flex flex-col justify-between items-center px-4 py-8 font-sans relative overflow-hidden selection:bg-[#7c3aed] selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#7c3aed]/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Branding */}
      <header className="w-full max-w-md flex flex-col items-center gap-2 pt-2 z-10">
        <div className="flex items-center gap-3">
          <GenMusicLogo size="md" />
          <div className="text-left">
            <h1 className="font-extrabold tracking-tight text-xl text-white">GenMusic</h1>
            <p className="text-xs text-[#a78bfa] font-medium tracking-wide">Play smarter. Listen better.</p>
          </div>
        </div>
      </header>

      {/* Main Card */}
      <main className="w-full max-w-md my-auto py-6 z-10 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.8)] text-center flex flex-col items-center"
        >
          {/* Song Thumbnail */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#181924] border border-white/10 mb-5 shadow-lg">
            <img 
              src={meta.thumbnailHQ} 
              alt={meta.title}
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c]/80 via-transparent to-transparent" />
          </div>

          {/* Song Details */}
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight line-clamp-2 mb-1.5">
            {meta.title}
          </h2>
          <p className="text-sm font-semibold text-[#a78bfa] mb-6">
            {meta.author}
          </p>

          {/* Action Buttons */}
          <div className="w-full space-y-3">
            {/* Primary Button */}
            <button
              onClick={launchApp}
              id="btn-open-gen-music"
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-[#7c3aed] hover:bg-[#8b5cf6] text-white font-bold text-sm active:scale-[0.98] transition-all shadow-lg shadow-[#7c3aed]/30 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Open in GenMusic</span>
            </button>
          </div>

          {/* Store Download Options */}
          <AnimatePresence>
            {showInstallOptions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full mt-6 pt-6 border-t border-white/10 text-left overflow-hidden"
              >
                <p className="text-xs text-slate-400 mb-4 text-center leading-relaxed">
                  Don't have the app yet? Download GenMusic for high-fidelity playback and offline songs.
                </p>

                <div className="flex gap-2.5">
                  <a
                    href={playStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-white/[0.06] hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold transition-all"
                  >
                    <svg className="w-4 h-4 text-[#a78bfa]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3.609 1.814L13.793 12 3.61 22.186c-.352-.338-.61-.83-.61-1.46V3.273c0-.63.258-1.121.61-1.46zm11.3 11.3l2.257-2.257-11.45-6.52 9.193 8.777zm0 1.772l-9.193 8.777 11.45-6.52-2.257-2.257zm1.121-1.121l3.585-2.042c1.026-.585 1.026-1.545 0-2.13l-3.585-2.042-2.008 2.008 2.008 2.006z"/>
                    </svg>
                    <span>Google Play</span>
                  </a>

                  <a
                    href={appStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-white/[0.06] hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold transition-all"
                  >
                    <svg className="w-4 h-4 text-[#a78bfa]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.76 1.04-1.82.93-2.88-.9.04-2 .6-2.65 1.36-.58.67-.99 1.74-.88 2.78.99.08 1.98-.5 2.6-1.26z"/>
                    </svg>
                    <span>App Store</span>
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md text-center text-xs text-slate-600 z-10">
        <p>© 2026 GenMusic. Free unlimited music & spatial audio.</p>
      </footer>
    </div>
  );
};
