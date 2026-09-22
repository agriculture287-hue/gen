import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Play, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle,
  Share2,
  Music,
  ArrowRight,
  Shield,
  Zap,
  RotateCcw,
  Sparkles,
  Layers,
  Search,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GenMusicLogo } from './GenMusicLogo';
import { AdBanner320x50 } from './AdBanners';

interface SongMetadata {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: string;
  description: string;
  sourceUrl: string;
}

interface SharePageProps {
  videoId: string;
  onNavigateHome: () => void;
}

export const SharePage: React.FC<SharePageProps> = ({ videoId, onNavigateHome }) => {
  const [song, setSong] = useState<SongMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // App detection states: 'detecting' | 'installed' | 'not_installed'
  const [appStatus, setAppStatus] = useState<'detecting' | 'installed' | 'not_installed'>('detecting');
  const [attemptedAutoLaunch, setAttemptedAutoLaunch] = useState(false);
  const [openAttemptCount, setOpenAttemptCount] = useState(0);

  // Send analytics event helper
  const trackEvent = async (eventType: string) => {
    try {
      // Determine device platform
      let platform = 'unknown';
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType,
          videoId,
          platform
        }),
      });
    } catch (err) {
      console.warn('Analytics tracking failed:', err);
    }
  };

  // Fetch song metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/song/${videoId}`);
        if (!res.ok) {
          throw new Error('Failed to load song metadata');
        }
        const data = await res.json();
        setSong(data);
        
        // Track page view event once metadata is loaded
        trackEvent('page_view');
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Content Not Available');
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      fetchMetadata();
    }
  }, [videoId]);

  // Handle deep link / app detection flow
  const triggerDeepLink = () => {
    if (!song) return;
    
    setOpenAttemptCount(prev => prev + 1);
    trackEvent('app_open_attempt');
    
    const isAndroid = typeof window !== 'undefined' && /android/i.test(navigator.userAgent);
    const deepLinkUrl = isAndroid
      ? `intent://play?videoId=${song.id}#Intent;scheme=in.gen.agrigence;package=in.gen.agrigence;end`
      : `in.gen.agrigence://play?videoId=${song.id}`;
    
    // Set up a blur event listener to detect successful app launch
    const handleBlur = () => {
      setAppStatus('installed');
      trackEvent('app_open_success');
      window.removeEventListener('blur', handleBlur);
    };
    
    window.addEventListener('blur', handleBlur);
    
    // Attempt to open the custom URL scheme
    window.location.href = deepLinkUrl;

    // Timeout fallback: if focus isn't lost within 1.5 seconds, assume not installed
    const timeout = setTimeout(() => {
      window.removeEventListener('blur', handleBlur);
      // Only set to not_installed if we haven't successfully detected the installation via blur
      setAppStatus(prev => prev === 'installed' ? 'installed' : 'not_installed');
    }, 1500);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('blur', handleBlur);
    };
  };

  // Auto launch flow on mount after metadata loads
  useEffect(() => {
    if (song && !attemptedAutoLaunch) {
      setAttemptedAutoLaunch(true);
      
      // Wait 1 second before attempting auto launch as requested
      const autoLaunchTimeout = setTimeout(() => {
        triggerDeepLink();
      }, 1000);

      return () => clearTimeout(autoLaunchTimeout);
    }
  }, [song, attemptedAutoLaunch]);

  const handleDownloadClick = () => {
    trackEvent('download_click');
    // Navigate to download section
    window.location.pathname = '/download';
  };

  const handleSourceClick = () => {
    trackEvent('source_click');
    if (song?.sourceUrl) {
      window.open(song.sourceUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06070c] text-slate-100 flex flex-col justify-between items-center px-4 py-8 font-sans relative overflow-hidden">
        {/* Animated glowing backdrops */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Header Skeleton */}
        <header className="w-full max-w-lg flex flex-col items-center gap-2 mb-12 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/60 animate-pulse border border-slate-700/50" />
          <div className="w-24 h-4 bg-slate-800/60 animate-pulse rounded-md" />
          <div className="w-32 h-3 bg-slate-800/40 animate-pulse rounded-md" />
        </header>

        {/* Main Player Skeleton */}
        <main className="w-full max-w-lg bg-white/[0.02] border border-white/5 rounded-3xl p-6 relative z-10 flex flex-col items-center gap-6 shadow-2xl backdrop-blur-xl">
          {/* Cover Art Skeleton */}
          <div className="w-full aspect-square max-w-[280px] rounded-2xl bg-slate-800/60 animate-pulse border border-slate-700/50" />
          
          {/* Metadata Skeleton */}
          <div className="w-full flex flex-col items-center gap-2.5">
            <div className="w-3/4 h-6 bg-slate-800/60 animate-pulse rounded-lg" />
            <div className="w-1/2 h-4 bg-slate-800/50 animate-pulse rounded-md" />
            <div className="w-16 h-3 bg-slate-800/40 animate-pulse rounded-md" />
          </div>

          <div className="w-full h-[1px] bg-white/5" />

          {/* Buttons Skeleton */}
          <div className="w-full flex flex-col gap-3">
            <div className="w-full h-12 bg-slate-800/60 animate-pulse rounded-2xl" />
            <div className="w-full h-12 bg-slate-800/40 animate-pulse rounded-2xl" />
          </div>
        </main>

        {/* Footer Skeleton */}
        <footer className="mt-16 w-full max-w-lg text-center relative z-10">
          <div className="w-36 h-3 bg-slate-800/30 animate-pulse rounded-md mx-auto" />
        </footer>
      </div>
    );
  }

  if (error || !song) {
    return (
      <div className="min-h-screen bg-[#06070c] text-slate-100 flex flex-col justify-between items-center px-4 py-8 font-sans relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-500/5 rounded-full blur-[140px] pointer-events-none" />
        
        {/* Header */}
        <header className="w-full max-w-lg flex flex-col items-center gap-2.5 relative z-10">
          <GenMusicLogo size="sm" glow={true} />
          <span className="font-extrabold text-base tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            GEN MUSIC
          </span>
        </header>

        {/* Error Card */}
        <main className="w-full max-w-md bg-white/[0.02] border border-red-500/10 rounded-3xl p-8 relative z-10 flex flex-col items-center text-center gap-6 shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <AlertCircle className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-slate-200">Content Not Available</h1>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              We couldn't fetch the song details. This might be due to an invalid link, a private video, or network constraints.
            </p>
          </div>

          <button
            onClick={onNavigateHome}
            className="px-6 py-3 rounded-xl bg-slate-800/80 border border-white/10 hover:border-cyan-500/30 hover:bg-slate-800 text-slate-200 text-sm font-semibold transition flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Back Home</span>
          </button>
        </main>

        {/* Footer */}
        <footer className="w-full max-w-lg text-center text-xs text-slate-500 relative z-10">
          Shared via GEN Music Hub
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030408] text-slate-100 flex flex-col justify-between px-4 py-8 font-sans relative overflow-x-hidden select-none">
      
      {/* Blurred Album Artwork Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center scale-110 pointer-events-none filter blur-[80px] opacity-[0.22] -z-20 transform duration-700 transition-all"
        style={{ backgroundImage: `url(${song.thumbnail})` }}
      />
      {/* Dark premium overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030408]/90 via-[#04060c]/95 to-[#020306]/98 -z-10 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Top Header */}
      <header className="w-full max-w-lg mx-auto flex flex-col items-center gap-2 relative z-10 mb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-1.5"
        >
          <GenMusicLogo size="sm" glow={true} className="mb-0.5" />
          <span className="font-extrabold text-base tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
            GEN MUSIC
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400/80 bg-cyan-500/5 px-2.5 py-0.5 rounded-full border border-cyan-500/10">
            Shared from GEN Music
          </span>
        </motion.div>
      </header>

      {/* Main Music Player Layout */}
      <main className="w-full max-w-lg mx-auto flex flex-col gap-6 relative z-10">
        
        {/* Hero Section Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl flex flex-col items-center relative overflow-hidden"
        >
          {/* Dynamic gloss flare */}
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-white/2 rounded-full blur-3xl pointer-events-none" />

          {/* Interactive Cover Art */}
          <div className="relative w-full aspect-square max-w-[270px] rounded-2xl overflow-hidden group shadow-2xl border border-white/10 mb-5">
            <img 
              src={song.thumbnail} 
              alt={song.title} 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transform duration-500 group-hover:scale-105"
            />
            {/* Ambient neon shadow on cover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 pointer-events-none" />
            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-300">
              {song.duration}
            </div>
          </div>

          {/* Song Metadata Details */}
          <div className="w-full text-center space-y-2 px-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight leading-snug line-clamp-2">
              {song.title}
            </h1>
            <p className="text-sm sm:text-base font-bold text-cyan-400/90 tracking-wide line-clamp-1">
              {song.artist}
            </p>
            {song.description && (
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto line-clamp-2">
                {song.description}
              </p>
            )}
          </div>

          <div className="w-full h-[1px] bg-white/5 my-5" />

          {/* Status Indicator */}
          <div className="w-full mb-4 flex items-center justify-center">
            {appStatus === 'detecting' && (
              <div className="flex items-center gap-2 text-xs text-cyan-400 bg-cyan-500/5 border border-cyan-500/10 px-4 py-1.5 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span>Checking GEN Music App...</span>
              </div>
            )}
            {appStatus === 'installed' && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-4 py-1.5 rounded-full font-semibold">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>✓ GEN Music detected</span>
              </div>
            )}
            {appStatus === 'not_installed' && (
              <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/5 border border-amber-500/10 px-4 py-1.5 rounded-full font-semibold animate-pulse">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>GEN Music app not active</span>
              </div>
            )}
          </div>

          {/* Action Buttons Stack */}
          <div className="w-full flex flex-col gap-3">
            {/* Primary Action Button: Open App */}
            <button
              onClick={triggerDeepLink}
              id="share-primary-open-btn"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-cyan-500/20 hover:opacity-95 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2.5 cursor-pointer active:scale-98"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Open in GEN Music</span>
            </button>

            <div className="grid grid-cols-2 gap-3 w-full">
              {/* Secondary Action: Download App */}
              <button
                onClick={handleDownloadClick}
                id="share-secondary-download-btn"
                className="py-3 px-4 rounded-xl bg-white/[0.04] border border-white/10 hover:border-cyan-500/40 text-slate-200 hover:bg-white/[0.08] font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>Get App</span>
              </button>

              {/* Tertiary Action: Open Original Youtube Link */}
              <button
                onClick={handleSourceClick}
                id="share-tertiary-source-btn"
                className="py-3 px-4 rounded-xl bg-white/[0.04] border border-white/10 hover:border-red-500/20 text-slate-300 hover:bg-white/[0.08] font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <ExternalLink className="w-4 h-4" />
                <span>YouTube Music</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Dynamic App Install Prompt Card (If app is not active or user chooses to view) */}
        <AnimatePresence>
          {appStatus === 'not_installed' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="w-full bg-gradient-to-b from-[#0b0e1b] to-[#080a13] border border-cyan-500/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
            >
              {/* Background ambient light */}
              <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-100 text-sm sm:text-base">Get GEN Music</h2>
                  <p className="text-[11px] text-cyan-400/80 font-semibold tracking-wider uppercase">Unleash Studio Audio quality</p>
                </div>
              </div>

              {/* Feature Grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-xs text-slate-300">Offline Playback</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-xs text-slate-300">Lyrics Support</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-xs text-slate-300">Playlist Sync</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-xs text-slate-300">Dolby Spatial Audio</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-xs text-slate-300">Smart Playlists</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-xs text-slate-300">Zero Subscriptions</span>
                </div>
              </div>

              {/* Install CTA */}
              <button
                onClick={handleDownloadClick}
                className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer active:scale-98 transition duration-200"
              >
                <span>Download Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Share Information Footer Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full flex flex-col items-center gap-3 bg-white/[0.01] border border-white/[0.03] rounded-2xl p-4 text-center text-slate-500"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Share2 className="w-3.5 h-3.5 text-cyan-500" />
            <span>Shared via GEN Music Hub</span>
          </div>
          <div className="text-[10px] bg-white/[0.03] px-2.5 py-1 rounded-md font-mono text-slate-400 select-all border border-white/5">
            Song ID: {song.id}
          </div>
        </motion.div>

        {/* Single Premium Banner Ad Unit (No Hyperlink/Direct Ads as requested) */}
        <div className="w-full flex justify-center py-2 relative z-10">
          <AdBanner320x50 className="opacity-95 hover:opacity-100 transition-opacity" />
        </div>

      </main>

      {/* Global Brand Footer */}
      <footer className="w-full max-w-lg mx-auto text-center mt-12 pt-4 border-t border-white/[0.04] relative z-10">
        <button
          onClick={onNavigateHome}
          className="text-xs font-bold text-slate-400 hover:text-cyan-400 transition flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Back to Landing Page</span>
        </button>
      </footer>

    </div>
  );
};
