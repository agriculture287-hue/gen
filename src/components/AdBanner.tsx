import React, { useState, useEffect } from 'react';
import { ExternalLink, X } from 'lucide-react';
import { triggerActiveAd } from '../utils/downloadHelper';

interface AdCreative {
  id: string;
  title: string;
  description: string;
  ctaText: string;
  tag: string;
}

const AD_CREATIVES: AdCreative[] = [
  {
    id: 'ad-1',
    title: 'High-Speed Audio Cloud Proxy',
    description: 'Bypass ISP throttling and stream Lossless FLAC & 320kbps audio worldwide at zero latency.',
    ctaText: 'Claim Free Access',
    tag: 'Network Acceleration',
  },
  {
    id: 'ad-2',
    title: 'Studio Hi-Fi Audio DAC Enhancer',
    description: 'Enhance your Android & Windows listening experience with 32-bit hardware DSP presets.',
    ctaText: 'Check Compatibility',
    tag: 'Hardware Audio',
  },
  {
    id: 'ad-3',
    title: 'Low-Latency Audio Driver Optimizer',
    description: 'Optimize audio buffers, reduce playback lag, and unlock background playback priorities.',
    ctaText: 'Activate Now',
    tag: 'Performance Tool',
  },
  {
    id: 'ad-4',
    title: 'Encrypted Cloud Storage for MP3 Library',
    description: 'Safeguard your downloaded MP3 music library with 500GB encrypted cloud sync.',
    ctaText: 'Unlock Cloud Sync',
    tag: 'Cloud Vault',
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

  // 60-second auto-rotation with countdown timer
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

  // 1. Leaderboard Format (Reserved space 728x90 desktop / 320x50 mobile, no layout jumps)
  if (format === 'leaderboard') {
    return (
      <div 
        role="complementary"
        aria-label="Sponsored Partner Offer"
        className={`w-full max-w-5xl mx-auto px-4 my-6 ${className}`}
      >
        <div 
          onClick={handleAdClick}
          className="group relative cursor-pointer surface-card p-3 sm:p-4 min-h-[72px] sm:min-h-[88px] flex items-center justify-between gap-4 overflow-hidden"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-400/20 text-sky-400 flex items-center justify-center shrink-0">
              <ExternalLink className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mb-0.5">
                <span className="text-slate-400 uppercase tracking-wider font-semibold">Sponsored</span>
                <span aria-hidden="true">·</span>
                <span>Refreshes in {refreshSeconds}s</span>
              </div>
              <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-sky-300 transition-colors truncate">
                {creative.title}
              </h4>
              <p className="text-[11px] text-slate-400 truncate hidden md:block">
                {creative.description}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors whitespace-nowrap">
              <span>{creative.ctaText}</span>
              <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Mid-Content Native Card (Polished, clean, between feature sections)
  if (format === 'native') {
    return (
      <div 
        role="complementary"
        aria-label="Sponsored Partner Offer"
        onClick={handleAdClick}
        className={`group relative cursor-pointer surface-card p-6 sm:p-8 min-h-[140px] transition-colors ${className}`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span className="text-slate-400 uppercase tracking-wider font-semibold">Sponsored</span>
              <span aria-hidden="true">·</span>
              <span>Partner Offer ({refreshSeconds}s)</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-sky-300 transition-colors font-heading">
              {creative.title}
            </h3>

            <p className="text-sm text-slate-400 leading-relaxed">
              {creative.description}
            </p>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            <button
              onClick={handleAdClick}
              className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>{creative.ctaText}</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Floating Sticky Bottom Bar (Persistent, slim, under 15% mobile viewport cap)
  if (format === 'floating') {
    return (
      <div 
        role="complementary"
        aria-label="Sponsored Floating Bar"
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c101a]/95 border-t border-white/10 backdrop-blur-md px-4 py-2 shadow-lg"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          
          <div 
            onClick={handleAdClick}
            className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer group"
          >
            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-slate-400 shrink-0">
              Sponsored
            </span>
            <p className="text-xs text-slate-200 font-medium truncate group-hover:text-sky-300 transition-colors">
              <strong className="text-white mr-1.5">{creative.title}:</strong>
              <span className="text-slate-400 hidden sm:inline">{creative.description}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleAdClick}
              className="px-3 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Claim Offer</span>
              <ExternalLink className="w-3 h-3" />
            </button>

            <button
              onClick={() => setIsDismissed(true)}
              className="text-slate-400 hover:text-white p-1 rounded transition cursor-pointer"
              aria-label="Dismiss offer bar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    );
  }

  // 4. Default Rectangle Format
  return (
    <div 
      role="complementary"
      aria-label="Sponsored Partner Offer"
      onClick={handleAdClick}
      className={`group relative cursor-pointer surface-card p-5 min-h-[220px] flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mb-3">
          <span className="text-slate-400 uppercase tracking-wider font-semibold">Sponsored</span>
          <span>{refreshSeconds}s</span>
        </div>

        <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors mb-2 font-heading">
          {creative.title}
        </h3>

        <p className="text-xs text-slate-400 leading-relaxed">
          {creative.description}
        </p>
      </div>

      <div className="pt-4 border-t border-white/5">
        <div className="w-full py-2.5 px-3 rounded-lg bg-sky-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5">
          <span>{creative.ctaText}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};

export default AdBanner;
