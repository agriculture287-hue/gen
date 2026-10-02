import React, { useState, useEffect } from 'react';
import { ExternalLink, Sparkles, Megaphone, ShieldCheck, Zap, ArrowRight, RefreshCw, X } from 'lucide-react';
import { OMG10_SPONSOR_URL, triggerActiveAd } from '../utils/downloadHelper';

interface AdCreative {
  id: string;
  badge: string;
  title: string;
  description: string;
  ctaText: string;
  accentGradient: string;
  tag: string;
}

const AD_CREATIVES: AdCreative[] = [
  {
    id: 'ad-1',
    badge: 'SPONSORED',
    title: 'High-Speed Global Audio Cloud VPN',
    description: 'Bypass ISP throttling and stream Lossless FLAC & 320kbps audio worldwide at zero latency.',
    ctaText: 'Claim Free Access',
    accentGradient: 'from-cyan-500 via-blue-600 to-indigo-600',
    tag: 'Ultra-Fast Proxy',
  },
  {
    id: 'ad-2',
    badge: 'PARTNER OFFER',
    title: 'Hi-Fi Studio Audio DAC & Hardware Virtualizer',
    description: 'Enhance your Android & Windows listening experience with 32-bit hardware DSP presets.',
    ctaText: 'Check Compatibility',
    accentGradient: 'from-purple-500 via-pink-600 to-rose-600',
    tag: 'Hardware Boost',
  },
  {
    id: 'ad-3',
    badge: 'EXCLUSIVE',
    title: 'Zero-Lag Gaming & Music Booster',
    description: 'Optimize audio drivers, reduce buffer latency, and unlock background playback priorities.',
    ctaText: 'Activate Now',
    accentGradient: 'from-amber-400 via-orange-500 to-red-600',
    tag: 'Performance Pro',
  },
  {
    id: 'ad-4',
    badge: 'RECOMMENDED',
    title: 'Unlimited Cloud Backup for MP3 & Media',
    description: 'Safeguard your downloaded MP3 music library with 500GB encrypted cloud sync.',
    ctaText: 'Unlock Cloud Storage',
    accentGradient: 'from-emerald-400 via-teal-500 to-cyan-600',
    tag: 'Cloud Sync',
  },
];

interface AdBannerProps {
  format?: 'leaderboard' | 'rectangle' | 'native' | 'floating';
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  format = 'leaderboard',
  className = '',
}) => {
  const [creativeIndex, setCreativeIndex] = useState(0);
  const [refreshSeconds, setRefreshSeconds] = useState(60);
  const [isDismissed, setIsDismissed] = useState(false);

  // Auto-refresh creative every 60 seconds as documented in project specs
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshSeconds((prev) => {
        if (prev <= 1) {
          setCreativeIndex((current) => (current + 1) % AD_CREATIVES.length);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAdClick = (e: React.MouseEvent) => {
    e.preventDefault();
    triggerActiveAd();
  };

  const creative = AD_CREATIVES[creativeIndex];

  if (isDismissed) return null;

  // 1. Leaderboard Format (728x90 Desktop / 320x50 Mobile)
  if (format === 'leaderboard') {
    return (
      <div 
        role="complementary"
        aria-label="Active Sponsored Advertisement"
        className={`w-full max-w-5xl mx-auto my-4 px-2 sm:px-4 ${className}`}
      >
        <div 
          onClick={handleAdClick}
          className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-r from-[#0c1024]/95 via-[#111736]/90 to-[#0c1024]/95 border border-cyan-500/30 hover:border-cyan-400/60 p-3 sm:p-4 shadow-[0_0_25px_rgba(0,240,255,0.08)] hover:shadow-[0_0_35px_rgba(0,240,255,0.2)] transition-all duration-300"
        >
          {/* Neon Glow Accent */}
          <div className="absolute top-0 right-0 w-64 h-full bg-cyan-500/10 blur-2xl group-hover:bg-cyan-500/20 transition-all pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6">
            
            {/* Left Ad Info */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-xs group-hover:scale-105 transition-transform">
                <Megaphone className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>

              <div className="text-left min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-[9px] font-mono font-bold tracking-wider uppercase">
                    {creative.badge}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                    • Auto-refreshes in {refreshSeconds}s
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-200 transition-colors truncate max-w-md">
                  {creative.title}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-1 hidden md:block">
                  {creative.description}
                </p>
              </div>
            </div>

            {/* Right Action Button */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-black shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
                <span>{creative.ctaText}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </span>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // 2. Rectangle Format (300x250)
  if (format === 'rectangle') {
    return (
      <div 
        role="complementary"
        aria-label="Active Sponsored Advertisement"
        onClick={handleAdClick}
        className={`group relative cursor-pointer w-full max-w-[340px] mx-auto rounded-3xl bg-[#0d1124]/95 border border-cyan-500/30 hover:border-cyan-400 p-5 shadow-xl hover:shadow-cyan-500/20 transition-all overflow-hidden flex flex-col justify-between ${className}`}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div>
          {/* Top header */}
          <div className="flex items-center justify-between mb-4">
            <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[10px] font-mono font-bold tracking-wider">
              {creative.badge}
            </span>
            <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
              <RefreshCw className="w-2.5 h-2.5 animate-spin text-cyan-400" />
              {refreshSeconds}s
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 mb-3 w-fit text-cyan-400">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>

          <h3 className="text-base font-extrabold text-white group-hover:text-cyan-200 transition-colors mb-2 leading-snug">
            {creative.title}
          </h3>

          <p className="text-xs text-slate-400 leading-relaxed">
            {creative.description}
          </p>
        </div>

        <div className="mt-5 pt-4 border-t border-white/10">
          <div className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-xs flex items-center justify-center gap-2 group-hover:scale-[1.02] transition-transform shadow-lg shadow-cyan-500/20">
            <span>{creative.ctaText}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    );
  }

  // 3. Floating Sticky Bottom Ad Banner
  if (format === 'floating') {
    return (
      <div 
        role="complementary"
        aria-label="Active Sticky Sponsor Banner"
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#070a16]/95 border-t border-cyan-500/40 backdrop-blur-xl px-4 py-2.5 shadow-[0_-5px_25px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom duration-300"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          
          <div 
            onClick={handleAdClick}
            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer group"
          >
            <span className="hidden sm:flex px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[10px] font-mono font-bold shrink-0">
              SPONSORED
            </span>
            <p className="text-xs text-slate-200 font-semibold truncate group-hover:text-cyan-300 transition-colors">
              <span className="text-cyan-400 font-bold mr-1.5">{creative.title}:</span>
              {creative.description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleAdClick}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 cursor-pointer active:scale-95 transition-all"
            >
              <span>{creative.ctaText}</span>
              <ExternalLink className="w-3 h-3" />
            </button>

            <button
              onClick={() => setIsDismissed(true)}
              className="text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-white/5 transition cursor-pointer"
              aria-label="Close ad bar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    );
  }

  // 4. Native In-Content Format
  return (
    <div 
      role="complementary"
      aria-label="Active Sponsored Card"
      onClick={handleAdClick}
      className={`group relative cursor-pointer rounded-3xl bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-purple-950/40 border border-cyan-500/40 hover:border-cyan-300 p-6 sm:p-8 backdrop-blur-xl transition-all shadow-[0_0_30px_rgba(0,240,255,0.1)] hover:shadow-[0_0_45px_rgba(0,240,255,0.25)] ${className}`}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 text-[10px] font-mono font-bold tracking-wider uppercase">
              {creative.badge}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Verified Partner Link • Active
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-cyan-200 transition-colors">
            {creative.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {creative.description}
          </p>
        </div>

        <div className="shrink-0 w-full md:w-auto">
          <button
            onClick={handleAdClick}
            className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 group-hover:scale-105 transition-all cursor-pointer"
          >
            <span>{creative.ctaText}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdBanner;
