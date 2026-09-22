'use client';

import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Play, 
  ExternalLink, 
  AlertCircle, 
  Share2,
  Sparkles,
  RotateCcw,
  Check
} from 'lucide-react';
import { AdBanner320x50 } from '../../../src/components/AdBanners';

interface SongMetadata {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: string;
  description: string;
  sourceUrl: string;
}

interface ShareClientPageProps {
  videoId: string;
}

export default function ShareClientPage({ videoId }: ShareClientPageProps) {
  const [song, setSong] = useState<SongMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appStatus, setAppStatus] = useState<'detecting' | 'installed' | 'not_installed'>('detecting');
  const [attemptedAutoLaunch, setAttemptedAutoLaunch] = useState(false);

  const trackEvent = async (eventType: string) => {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType,
          videoId,
          platform: 'web'
        }),
      });
    } catch (e) {
      // Non-blocking
    }
  };

  useEffect(() => {
    const fetchMetadata = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/song/${videoId}`);
        if (!res.ok) throw new Error('Failed to load song metadata');
        const data = await res.json();
        setSong(data);
        trackEvent('page_view');
      } catch (err: any) {
        setError(err.message || 'Content Not Available');
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      fetchMetadata();
    }
  }, [videoId]);

  const triggerDeepLink = () => {
    if (!song) return;
    trackEvent('app_open_attempt');
    
    const isAndroid = typeof window !== 'undefined' && /android/i.test(navigator.userAgent);
    const deepLinkUrl = isAndroid
      ? `intent://play?videoId=${song.id}#Intent;scheme=in.gen.agrigence;package=in.gen.agrigence;end`
      : `in.gen.agrigence://play?videoId=${song.id}`;
    
    const handleBlur = () => {
      setAppStatus('installed');
      trackEvent('app_open_success');
      window.removeEventListener('blur', handleBlur);
    };
    
    window.addEventListener('blur', handleBlur);
    window.location.href = deepLinkUrl;

    const timeout = setTimeout(() => {
      window.removeEventListener('blur', handleBlur);
      setAppStatus(prev => prev === 'installed' ? 'installed' : 'not_installed');
    }, 1500);
  };

  useEffect(() => {
    if (song && !attemptedAutoLaunch) {
      setAttemptedAutoLaunch(true);
      const autoLaunchTimeout = setTimeout(() => {
        triggerDeepLink();
      }, 1000);
      return () => clearTimeout(autoLaunchTimeout);
    }
  }, [song, attemptedAutoLaunch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06070c] text-slate-100 flex flex-col justify-center items-center px-4 font-sans">
        <div className="w-12 h-12 rounded-full border-t-2 border-cyan-400 animate-spin" />
        <span className="mt-4 text-xs font-bold text-slate-400 tracking-wider">LOADING SHARE PREVIEW...</span>
      </div>
    );
  }

  if (error || !song) {
    return (
      <div className="min-h-screen bg-[#06070c] text-slate-100 flex flex-col justify-center items-center px-4 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4 animate-bounce" />
        <h1 className="text-xl font-bold">Content Not Available</h1>
        <p className="text-xs text-slate-400 max-w-xs mt-1">Please verify the share link or try again later.</p>
        <button onClick={() => window.location.href = '/'} className="mt-6 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold">
          Back Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030408] text-slate-100 flex flex-col justify-between px-4 py-8 font-sans relative overflow-x-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center scale-110 pointer-events-none filter blur-[80px] opacity-[0.22] -z-20"
        style={{ backgroundImage: `url(${song.thumbnail})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#030408]/90 via-[#04060c]/95 to-[#020306]/98 -z-10" />

      <header className="w-full max-w-lg mx-auto flex flex-col items-center gap-2 mb-8 text-center">
        <span className="font-extrabold text-base tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
          GEN MUSIC
        </span>
        <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 bg-cyan-500/5 px-2.5 py-0.5 rounded-full border border-cyan-500/10">
          Shared from GEN Music
        </span>
      </header>

      <main className="w-full max-w-lg mx-auto flex flex-col gap-6">
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col items-center">
          <div className="relative w-full aspect-square max-w-[270px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 mb-5">
            <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover" />
            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-300">
              {song.duration}
            </div>
          </div>

          <div className="w-full text-center space-y-2">
            <h1 className="text-xl font-black text-slate-100 tracking-tight">{song.title}</h1>
            <p className="text-sm font-bold text-cyan-400/90">{song.artist}</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">{song.description}</p>
          </div>

          <div className="w-full h-[1px] bg-white/5 my-5" />

          <div className="w-full mb-4 flex items-center justify-center">
            {appStatus === 'detecting' && (
              <div className="flex items-center gap-2 text-xs text-cyan-400 bg-cyan-500/5 border border-cyan-500/10 px-4 py-1.5 rounded-full">
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
              <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/5 border border-amber-500/10 px-4 py-1.5 rounded-full font-semibold">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>GEN Music app not active</span>
              </div>
            )}
          </div>

          <div className="w-full flex flex-col gap-3">
            <button
              onClick={triggerDeepLink}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-extrabold text-sm shadow-xl flex items-center justify-center gap-2.5 cursor-pointer hover:opacity-95"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Open in GEN Music</span>
            </button>

            <div className="grid grid-cols-2 gap-3 w-full">
              <button
                onClick={() => window.location.href = '/download'}
                className="py-3 px-4 rounded-xl bg-white/[0.04] border border-white/10 text-slate-200 font-bold text-xs flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Get App</span>
              </button>

              <button
                onClick={() => window.open(song.sourceUrl, '_blank')}
                className="py-3 px-4 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300 font-bold text-xs flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>YouTube Music</span>
              </button>
            </div>
          </div>
        </div>

        {appStatus === 'not_installed' && (
          <div className="w-full bg-[#0b0e1b] border border-cyan-500/20 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-100 text-sm">Get GEN Music</h2>
                <p className="text-[10px] text-cyan-400/80 uppercase font-bold tracking-wider">Immersive Spatial Audio</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5 text-xs text-slate-300">
              <div>• Offline Playback</div>
              <div>• Lyrics Support</div>
              <div>• Playlist Sync</div>
              <div>• High Quality Audio</div>
              <div>• Smart Recommendations</div>
              <div>• Fast Search</div>
            </div>

            <button
              onClick={() => window.location.href = '/download'}
              className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm"
            >
              Download Now
            </button>
          </div>
        )}

        <div className="w-full flex flex-col items-center gap-3 bg-white/[0.01] border border-white/[0.03] rounded-2xl p-4 text-center text-slate-500">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 justify-center">
            <Share2 className="w-3.5 h-3.5 text-cyan-500" />
            <span>Shared via GEN Music Hub</span>
          </div>
          <div className="text-[10px] bg-white/[0.03] px-2.5 py-1 rounded-md font-mono text-slate-400 border border-white/5">
            Song ID: {videoId}
          </div>
        </div>

        {/* Single Premium Banner Ad Unit (No Hyperlink/Direct Ads as requested) */}
        <div className="w-full flex justify-center py-2">
          <AdBanner320x50 className="opacity-95 hover:opacity-100 transition-opacity" />
        </div>
      </main>

      <footer className="w-full max-w-lg mx-auto text-center mt-12 pt-4 border-t border-white/[0.04]">
        <button onClick={() => window.location.href = '/'} className="text-xs font-bold text-slate-400 hover:text-cyan-400 flex items-center justify-center gap-1.5 mx-auto">
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Back to Landing Page</span>
        </button>
      </footer>
    </div>
  );
}
