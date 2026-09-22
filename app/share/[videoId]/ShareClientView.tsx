'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Download, ExternalLink, ShieldCheck, Sparkles, Music2, AlertCircle, ArrowLeft } from 'lucide-react';
import type { ShareMetadata } from '../../../../src/lib/shareCore';
import { buildAndroidIntentUri } from '../../../../src/lib/shareCore';

interface ShareClientViewProps {
  initialData: ShareMetadata | null;
  videoId: string;
}

export default function ShareClientView({ initialData, videoId }: ShareClientViewProps) {
  const [data] = useState<ShareMetadata | null>(initialData);
  const [showInstallOptions, setShowInstallOptions] = useState(false);
  const [copied, setCopied] = useState(false);
  const deepLinkAttemptedRef = useRef(false);

  // Send lightweight analytics beacon
  const trackAnalytics = (eventType: string) => {
    try {
      const payload = {
        eventType,
        videoId,
        timestamp: new Date().toISOString(),
        referrer: typeof document !== 'undefined' ? document.referrer : 'direct'
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
      // Analytics non-blocking
    }
  };

  const handleOpenApp = () => {
    if (!data) return;
    trackAnalytics('app_launch_attempt');

    const deepLink = data.deepLink;
    const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);
    const intentUrl = buildAndroidIntentUri(data.videoId, data.type || 'song');

    const launchUrl = isAndroid ? intentUrl : deepLink;
    window.location.href = launchUrl;

    setTimeout(() => {
      setShowInstallOptions(true);
    }, 1200);
  };

  const handleDownloadClick = () => {
    trackAnalytics('download_click');
    window.location.href = 'https://genmusics.vercel.app/download';
  };

  // Automated 1-second Deep Link launch with fallback to install options
  useEffect(() => {
    if (!data || deepLinkAttemptedRef.current) return;
    deepLinkAttemptedRef.current = true;

    trackAnalytics('page_view');
    trackAnalytics('share_open');

    const timer = setTimeout(() => {
      handleOpenApp();
    }, 1000);

    return () => clearTimeout(timer);
  }, [data]);

  // Error view if metadata is unavailable
  if (!data || !data.success) {
    return (
      <div className="min-h-screen bg-[#030408] text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-radial from-cyan-950/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-md w-full text-center bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl rounded-3xl p-8 shadow-2xl">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-6 shadow-inner">
            <Music2 className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Content Not Available</h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            This track could not be loaded or may have been removed. You can return home to explore millions of songs with Dolby 3D audio.
          </p>

          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-semibold text-sm hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-cyan-500/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to GEN Music Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030408] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-cyan-500 selection:text-black">
      {/* Blurred thumbnail background */}
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-25 filter blur-3xl scale-110 transform-gpu pointer-events-none"
        style={{ backgroundImage: `url(${data.thumbnail})` }}
      />
      
      {/* Ambient dark gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#030408]/80 via-[#030408]/90 to-[#030408] pointer-events-none" />

      {/* Main Glassmorphism Card */}
      <div className="relative z-10 max-w-md w-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.85)] flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500">
        
        {/* Brand Header */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-black font-black text-xs shadow-md shadow-cyan-500/20">
            G
          </div>
          <span className="font-extrabold tracking-wider text-base text-white">GEN MUSIC</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-medium border border-cyan-500/30">
            Dolby 3D
          </span>
        </div>

        {/* Thumbnail with playback badge */}
        <div className="relative w-full aspect-square max-w-[280px] sm:max-w-[300px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 mb-6 group">
          <img 
            src={data.thumbnail} 
            alt={data.title} 
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
          
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-xs font-mono text-cyan-300 border border-white/10">
            {data.duration}
          </div>
        </div>

        {/* Title & Artist */}
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug line-clamp-2 mb-1.5 px-2">
          {data.title}
        </h1>
        <p className="text-sm sm:text-base font-medium text-cyan-400/90 mb-3">
          {data.artist}
        </p>

        {/* Tagline branding */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Play smarter. Listen better.</span>
        </div>

        {/* Primary Action Buttons */}
        <div className="w-full space-y-3">
          {/* Button 1: Open in GEN Music */}
          <button
            onClick={handleOpenApp}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 text-black font-bold text-sm hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-cyan-500/25 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            Open in GEN Music
          </button>

          {/* Button 2: Download GEN Music (Prominent when user remains on page) */}
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
          {data.sourceUrl && (
            <a
              href={data.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              <span>Open Original Source</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Install Suggestion Prompt if user stayed on page */}
        {showInstallOptions && (
          <div className="mt-5 p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-left w-full animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 leading-relaxed">
                <span className="font-semibold text-white">App not opening?</span> Install GEN Music on Android, Mac, or Windows to experience offline downloads & 3D Spatial Audio.
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Footer minimal info */}
      <footer className="relative z-10 mt-6 text-center text-xs text-slate-500">
        <p>© 2026 GEN Music. Completely Serverless & Edge Optimized.</p>
      </footer>
    </div>
  );
}
