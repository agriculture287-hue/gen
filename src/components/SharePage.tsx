import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Download,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GenMusicLogo } from './GenMusicLogo';
import { buildAndroidIntent, buildCustomSchemeUri } from '../lib/deepLink';
import { triggerSamePageDownload } from '../utils/downloadHelper';

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
  const [isOpening, setIsOpening] = useState(false);
  const appOpenedRef = useRef(false);

  const cleanId = encodeURIComponent(videoId || '');
  const apkUrl = 'https://github.com/agriculture287-hue/gen/releases/download/apk/GEN-Music-v2.0.4.apk';

  const androidIntentUrl = buildAndroidIntent(cleanId);
  const iosSchemeUrl = buildCustomSchemeUri(cleanId);

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

    setIsOpening(true);

    if (isAndroid) {
      window.location.href = androidIntentUrl;
    } else if (isIOS) {
      window.location.href = iosSchemeUrl;
    } else {
      setShowInstallOptions(true);
    }

    setTimeout(() => {
      setIsOpening(false);
    }, 2000);
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
      if (document.visibilityState === 'hidden' || document.hidden) {
        appOpenedRef.current = true;
      }
    };

    const handlePageHide = () => {
      appOpenedRef.current = true;
    };

    const handleWindowBlur = () => {
      appOpenedRef.current = true;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('blur', handleWindowBlur);

    // Initial redirect attempt on mobile
    if (isAndroid) {
      window.location.href = androidIntentUrl;
    } else if (isIOS) {
      window.location.href = iosSchemeUrl;
    }

    // After 1.4s, if app did not open and document is visible, show fallback card
    const timer = setTimeout(() => {
      if (!appOpenedRef.current && !document.hidden && document.visibilityState === 'visible') {
        setShowInstallOptions(true);
      }
    }, 1400);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('blur', handleWindowBlur);
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
              <span>{isOpening ? 'Opening GenMusic...' : 'Open in GenMusic'}</span>
            </button>
          </div>

          {/* Fallback Section */}
          <AnimatePresence>
            {showInstallOptions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full mt-6 pt-6 border-t border-white/10 text-center overflow-hidden"
              >
                <h3 className="text-sm font-bold text-white mb-1.5">Get the GenMusic App</h3>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  GenMusic is distributed as a direct APK download for high-fidelity audio and offline listening.
                </p>

                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => triggerSamePageDownload(apkUrl, 'GEN-Music.apk')}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-[#7c3aed]/20 hover:bg-[#7c3aed]/30 border border-[#7c3aed] text-[#c4b5fd] text-sm font-bold shadow-lg shadow-[#7c3aed]/15 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download APK (Direct)</span>
                  </button>

                  <button
                    onClick={launchApp}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-slate-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Already have the app? Open it</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
                  * Sideloading requires allowing "Install unknown apps" for your browser when prompted on Android 8+.
                </p>
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
