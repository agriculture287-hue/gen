import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Play, 
  ExternalLink, 
  AlertCircle, 
  Music, 
  ShieldCheck, 
  Sparkles, 
  ArrowLeft,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GenMusicLogo } from './GenMusicLogo';
import { buildAndroidIntentUri } from '../lib/shareCore';

interface SongMetadata {
  videoId: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: string;
  description: string;
  sourceUrl: string;
  deepLink?: string;
  type?: 'song' | 'album' | 'playlist' | 'artist';
}

interface SharePageProps {
  videoId: string;
  type?: 'song' | 'album' | 'playlist' | 'artist';
  onNavigateHome: () => void;
}

export const SharePage: React.FC<SharePageProps> = ({ videoId, type = 'song', onNavigateHome }) => {
  const [song, setSong] = useState<SongMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // App detection states
  const [showInstallOptions, setShowInstallOptions] = useState(false);
  const [attemptedAutoLaunch, setAttemptedAutoLaunch] = useState(false);

  // Send analytics event helper
  const trackEvent = async (eventType: string) => {
    try {
      let platform = 'web';
      if (typeof window !== 'undefined') {
        const ua = window.navigator.userAgent.toLowerCase();
        if (/android/.test(ua)) platform = 'android';
        else if (/iphone|ipad|ipod/.test(ua)) platform = 'ios';
        else if (/win/.test(ua)) platform = 'windows';
        else if (/mac/.test(ua)) platform = 'macos';
        else if (/linux/.test(ua)) platform = 'linux';
      }

      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          videoId,
          platform
        }),
      });
    } catch {
      // Non-blocking analytics
    }
  };

  // Fetch song metadata dynamically from serverless API
  useEffect(() => {
    const fetchMetadata = async () => {
      setLoading(true);
      setError(null);
      try {
        const endpoint = type === 'song' ? `/api/share/${videoId}` : `/api/share/${type}/${videoId}`;
        const res = await fetch(endpoint);
        if (!res.ok) {
          // Fallback check on legacy song endpoint
          const fallbackRes = await fetch(`/api/song/${videoId}`);
          if (!fallbackRes.ok) {
            throw new Error('Content Not Available');
          }
          const fallbackData = await fallbackRes.json();
          setSong({
            videoId: fallbackData.id || videoId,
            title: fallbackData.title,
            artist: fallbackData.artist,
            thumbnail: fallbackData.thumbnail,
            duration: fallbackData.duration || '3:45',
            description: fallbackData.description || `Listen to ${fallbackData.title} on GEN Music.`,
            sourceUrl: fallbackData.sourceUrl || `https://music.youtube.com/watch?v=${videoId}`,
            deepLink: `genmusic://play?videoId=${videoId}`
          });
        } else {
          const data = await res.json();
          setSong(data);
        }
        
        trackEvent('page_view');
        trackEvent('share_open');
      } catch (err: any) {
        console.warn('Metadata fetch failed:', err);
        setError('Content Not Available');
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      fetchMetadata();
    }
  }, [videoId, type]);

  // Handle deep link app launch
  const handleOpenInApp = () => {
    if (!song) return;
    trackEvent('app_launch_attempt');

    const deepLink = song.deepLink || `genmusic://play?videoId=${song.videoId}`;
    const isAndroid = typeof window !== 'undefined' && /android/i.test(navigator.userAgent);
    const intentUrl = buildAndroidIntentUri(song.videoId, song.type || 'song');

    const launchTarget = isAndroid ? intentUrl : deepLink;
    window.location.href = launchTarget;

    // If user remains on page after 1.2s, display install / download options
    setTimeout(() => {
      setShowInstallOptions(true);
    }, 1200);
  };

  // 1-second auto launch on initial mount
  useEffect(() => {
    if (song && !attemptedAutoLaunch) {
      setAttemptedAutoLaunch(true);
      const timer = setTimeout(() => {
        handleOpenInApp();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [song, attemptedAutoLaunch]);

  const handleDownloadClick = () => {
    trackEvent('download_click');
    window.location.href = 'https://genmusics.vercel.app/download';
  };

  const handleSourceClick = () => {
    trackEvent('source_click');
    if (song?.sourceUrl) {
      window.open(song.sourceUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#030408] text-slate-100 flex flex-col justify-center items-center px-4 py-8 font-sans relative overflow-hidden">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 animate-pulse">
          <Music className="w-7 h-7" />
        </div>
        <p className="text-sm text-slate-400 font-medium tracking-wide">Loading track details...</p>
      </div>
    );
  }

  // Error Page (Unavailable content)
  if (error || !song) {
    return (
      <div className="min-h-screen bg-[#030408] text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-radial from-cyan-950/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-md w-full text-center bg-white/[0.04] border border-white/[0.08] backdrop-blur-2xl rounded-3xl p-8 shadow-2xl">
          <div className="flex justify-center mb-6">
            <GenMusicLogo size="lg" />
          </div>

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mb-4 shadow-inner">
            <AlertCircle className="w-7 h-7" />
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Content Not Available</h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            This track could not be loaded or may have been removed. Return home to discover and stream unlimited music with Dolby Spatial Audio.
          </p>

          <button
            onClick={onNavigateHome}
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold text-sm hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030408] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-cyan-500 selection:text-black">
      {/* Thumbnail-based blur background */}
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-25 filter blur-3xl scale-110 transform-gpu pointer-events-none transition-all duration-1000"
        style={{ backgroundImage: `url(${song.thumbnail})` }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-[#030408]/80 via-[#030408]/90 to-[#030408] pointer-events-none" />

      {/* Main Glassmorphism Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 max-w-md w-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.85)] flex flex-col items-center text-center"
      >
        {/* Branding */}
        <div className="flex items-center gap-2.5 mb-6">
          <GenMusicLogo size="sm" />
          <div className="text-left">
            <div className="font-extrabold tracking-wider text-base text-white">GEN Music</div>
            <div className="text-[10px] text-cyan-400 font-medium tracking-wide">Play smarter. Listen better.</div>
          </div>
        </div>

        {/* Thumbnail */}
        <div className="relative w-full aspect-square max-w-[280px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 mb-6 group">
          <img 
            src={song.thumbnail} 
            alt={song.title} 
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
          
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-xs font-mono text-cyan-300 border border-white/10">
            {song.duration}
          </div>
        </div>

        {/* Song Details */}
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug line-clamp-2 mb-1.5 px-2">
          {song.title}
        </h1>
        <p className="text-sm sm:text-base font-semibold text-cyan-400/95 mb-2">
          {song.artist}
        </p>

        {song.description && (
          <p className="text-xs text-slate-400 line-clamp-2 max-w-xs mb-6">
            {song.description}
          </p>
        )}

        {/* Primary Buttons */}
        <div className="w-full space-y-3">
          {/* Button 1: Open in GEN Music */}
          <button
            onClick={handleOpenInApp}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 text-black font-extrabold text-sm hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-cyan-500/25 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            Open in GEN Music
          </button>

          {/* Button 2: Download GEN Music */}
          <button
            onClick={handleDownloadClick}
            className={`w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
              showInstallOptions
                ? 'bg-white/15 hover:bg-white/20 text-white border border-cyan-400/40 shadow-lg shadow-cyan-500/10'
                : 'bg-white/[0.06] hover:bg-white/10 text-slate-200 border border-white/10'
            }`}
          >
            <Download className="w-4 h-4 text-cyan-400" />
            Download GEN Music
          </button>

          {/* Button 3: Open Original Source */}
          {song.sourceUrl && (
            <button
              onClick={handleSourceClick}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <span>Open Original Source</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dynamic App Install Prompt if user remained on page */}
        <AnimatePresence>
          {showInstallOptions && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-5 p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-left w-full overflow-hidden"
            >
              <div className="flex items-start gap-2.5 mb-3">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <span className="font-semibold text-white">App not installed yet?</span> Download the GEN Music App for Android, macOS, or Windows to experience Dolby 3D audio and offline downloads.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 border-t border-white/5 pt-2">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-cyan-400" />
                  <span>Offline 320kbps</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-cyan-400" />
                  <span>3D Spatial Sound</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>

      {/* Footer */}
      <footer className="relative z-10 mt-6 text-center text-xs text-slate-500">
        <p>© 2026 GEN Music. Play smarter. Listen better.</p>
      </footer>
    </div>
  );
};
