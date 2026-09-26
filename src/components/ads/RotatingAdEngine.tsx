import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, RefreshCw, Star, ShieldCheck, Tag, Zap, Gift, Headphones } from 'lucide-react';

export interface AdCreative {
  id: string;
  sponsorName: string;
  badge: string;
  title: string;
  description: string;
  highlight: string;
  emoji: string;
  ctaText: string;
  bgGradient: string;
  borderColor: string;
  textColor: string;
}

export const ROTATING_AD_CREATIVES: AdCreative[] = [
  {
    id: 'ad-monetag-inpage-push',
    sponsorName: 'Monetag In-Page Push',
    badge: 'Monetag Official Ad',
    title: 'Monetag Premium Listener Rewards & Partner Perks',
    description: 'Verified Monetag In-Page Push & Native ad unit delivering high-eCPM listener rewards, discount vouchers, and exclusive sponsor deals.',
    highlight: '★ Monetag Verified',
    emoji: '💎',
    ctaText: 'Monetag Active',
    bgGradient: 'from-purple-600/20 via-indigo-600/20 to-cyan-500/15',
    borderColor: 'border-purple-500/40 hover:border-purple-400/80',
    textColor: 'text-purple-300'
  },
  {
    id: 'ad-monetag-vignette',
    sponsorName: 'Monetag Multi-Tag Network',
    badge: 'Monetag Partner',
    title: 'Unlock High-Bitrate Spatial Audio Gear & App Perks',
    description: 'Monetag Auto-Monetization engine delivering targeted audio accessories and high-speed streaming VPN deals.',
    highlight: '★ Monetag Sponsored',
    emoji: '⚡',
    ctaText: 'Explore Partner',
    bgGradient: 'from-indigo-600/20 via-blue-600/20 to-slate-900',
    borderColor: 'border-indigo-500/40 hover:border-indigo-400/80',
    textColor: 'text-indigo-300'
  },
  {
    id: 'ad-omg10-perks',
    sponsorName: 'OMG10 Network (Monetag)',
    badge: 'Exclusive Sponsor',
    title: 'Unlock Premium Streaming Perks & Free Gifts',
    description: 'Claim exclusive listener bonuses, digital vouchers, and special discount codes from our verified network partner.',
    highlight: '★ 100% Free Claim',
    emoji: '🎁',
    ctaText: 'View Partner Deal',
    bgGradient: 'from-amber-500/15 via-purple-500/15 to-cyan-500/15',
    borderColor: 'border-amber-500/30 hover:border-amber-400/60',
    textColor: 'text-amber-300'
  },
  {
    id: 'ad-hifi-audio',
    sponsorName: 'Acoustic SoundLab (Monetag)',
    badge: 'Audio Partner',
    title: 'Upgrade to Studio Lossless ANC Headphones — 40% Off',
    description: 'Experience Gen Music 320kbps Dolby spatial audio with professional audiophile-grade wireless monitors.',
    highlight: '★ Save $80 Today',
    emoji: '🎧',
    ctaText: 'Explore Gear',
    bgGradient: 'from-cyan-500/15 via-blue-500/15 to-indigo-500/15',
    borderColor: 'border-cyan-500/30 hover:border-cyan-400/60',
    textColor: 'text-cyan-300'
  },
  {
    id: 'ad-stream-speed',
    sponsorName: 'HyperNet VPN (Monetag)',
    badge: 'Fast Connect',
    title: 'Ultra-Fast Global Music Streaming & 0-Lag Buffering',
    description: 'Bypass ISP audio throttling and access geo-restricted song catalogs worldwide with ultra-low latency.',
    highlight: '★ 30-Day Risk Free',
    emoji: '⚡',
    ctaText: 'Get Super Speed',
    bgGradient: 'from-emerald-500/15 via-teal-500/15 to-slate-900',
    borderColor: 'border-emerald-500/30 hover:border-emerald-400/60',
    textColor: 'text-emerald-300'
  }
];

// Hook to manage 2-minute (120s) rotation
export function useRotatingAdIndex(initialOffset = 0, externalCycleCount?: number) {
  const [currentIndex, setCurrentIndex] = useState(initialOffset % ROTATING_AD_CREATIVES.length);
  const [secondsRemaining, setSecondsRemaining] = useState(120);
  const [isRotating, setIsRotating] = useState(false);

  // Sync with external 2-minute cycle state tracker
  useEffect(() => {
    if (externalCycleCount !== undefined && externalCycleCount > 0) {
      setIsRotating(true);
      const timer = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % ROTATING_AD_CREATIVES.length);
        setSecondsRemaining(120);
        setIsRotating(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [externalCycleCount]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Trigger smooth rotation animation
          setIsRotating(true);
          setTimeout(() => {
            setCurrentIndex((idx) => (idx + 1) % ROTATING_AD_CREATIVES.length);
            setIsRotating(false);
          }, 300);
          return 120; // reset to 2 minutes (120s)
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatRemaining = () => {
    const mins = Math.floor(secondsRemaining / 60);
    const secs = secondsRemaining % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return {
    currentAd: ROTATING_AD_CREATIVES[currentIndex],
    secondsRemaining,
    formattedTime: formatRemaining(),
    isRotating,
    refreshNow: () => {
      setIsRotating(true);
      setTimeout(() => {
        setCurrentIndex((idx) => (idx + 1) % ROTATING_AD_CREATIVES.length);
        setSecondsRemaining(120);
        setIsRotating(false);
      }, 200);
    }
  };
}

// 1. Top Leaderboard Banner Ad (Rotates every 2 min)
export const RotatingLeaderboardAd: React.FC<{ cycleCount?: number }> = ({ cycleCount }) => {
  const { currentAd, formattedTime, isRotating, refreshNow } = useRotatingAdIndex(0, cycleCount);

  return (
    <div 
      className={`w-full p-4 sm:p-5 rounded-3xl bg-gradient-to-r ${currentAd.bgGradient} border ${currentAd.borderColor} shadow-xl transition-all duration-500 relative overflow-hidden group select-none ${
        isRotating ? 'opacity-40 scale-[0.99]' : 'opacity-100 scale-100'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left Ad Info */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
            {currentAd.emoji}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-white/10 text-white uppercase tracking-wider border border-white/10">
                {currentAd.badge}
              </span>
              <span className={`text-[11px] font-mono font-semibold ${currentAd.textColor}`}>
                {currentAd.sponsorName}
              </span>
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                Refreshes in {formattedTime}
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition truncate mt-0.5">
              {currentAd.title}
            </h4>
            <p className="text-xs text-slate-300 line-clamp-1">
              {currentAd.description}
            </p>
          </div>
        </div>

        {/* Right CTA & Refresh Badge */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <span className="px-3 py-1.5 rounded-xl bg-white/10 text-white text-xs font-bold border border-white/10 shadow-sm flex items-center gap-1.5">
            {currentAd.highlight}
          </span>
          <button
            onClick={refreshNow}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition cursor-pointer"
            title="Rotate to next sponsor ad"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. In-Feed Sponsored Spotlight Card (Rotates every 2 min)
export const RotatingFeedAd: React.FC<{ offset?: number; cycleCount?: number }> = ({ offset = 1, cycleCount }) => {
  const { currentAd, formattedTime, isRotating, refreshNow } = useRotatingAdIndex(offset, cycleCount);

  return (
    <div 
      className={`p-5 sm:p-6 rounded-3xl bg-gradient-to-r ${currentAd.bgGradient} border ${currentAd.borderColor} shadow-xl transition-all duration-500 relative overflow-hidden group select-none ${
        isRotating ? 'opacity-40 scale-[0.99]' : 'opacity-100 scale-100'
      }`}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl shadow-lg flex-shrink-0 group-hover:scale-105 transition-transform">
            {currentAd.emoji}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-white/10 text-white uppercase tracking-wider border border-white/10">
                {currentAd.badge}
              </span>
              <span className={`text-xs font-semibold ${currentAd.textColor}`}>
                {currentAd.sponsorName}
              </span>
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                Ad rotates in {formattedTime}
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition">
              {currentAd.title}
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              {currentAd.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-xs font-bold text-white flex items-center gap-2 shadow-md">
            <span>{currentAd.ctaText}</span>
            <span className="text-cyan-300">{currentAd.highlight}</span>
          </div>
          <button
            onClick={refreshNow}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition cursor-pointer"
            title="Next partner ad"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// 3. Compact Search & Sidebar Ad (Rotates every 2 min)
export const RotatingCompactAd: React.FC<{ offset?: number; cycleCount?: number }> = ({ offset = 2, cycleCount }) => {
  const { currentAd, formattedTime, isRotating, refreshNow } = useRotatingAdIndex(offset, cycleCount);

  return (
    <div 
      className={`p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r ${currentAd.bgGradient} border ${currentAd.borderColor} transition-all duration-500 flex items-center justify-between gap-3 text-left shadow-md group select-none ${
        isRotating ? 'opacity-40 scale-[0.99]' : 'opacity-100 scale-100'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-xl flex-shrink-0">
          {currentAd.emoji}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-300">
              {currentAd.badge}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Auto-refreshes in {formattedTime}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-white group-hover:text-cyan-300 transition truncate">
            {currentAd.title}
          </p>
          <p className="text-[11px] text-slate-300 truncate">
            {currentAd.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-xs text-cyan-300 font-bold px-2.5 py-1 rounded-lg bg-white/10 border border-white/10">
          {currentAd.highlight}
        </span>
        <button
          onClick={refreshNow}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition cursor-pointer"
          title="Refresh ad"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
