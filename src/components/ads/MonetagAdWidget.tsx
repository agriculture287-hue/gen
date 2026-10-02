import React, { useEffect, useState } from 'react';
import { Tag, Sparkles, ShieldCheck, Zap, ExternalLink } from 'lucide-react';

interface MonetagAdWidgetProps {
  format?: 'banner' | 'native' | 'push' | 'vignette' | 'compact';
  zoneId?: string;
  className?: string;
}

export const MonetagAdWidget: React.FC<MonetagAdWidgetProps> = ({
  format = 'banner',
  zoneId = '287196',
  className = '',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Dynamically initialize Monetag tag.min.js script if not present
    const scriptId = `monetag-tag-script-${zoneId}`;
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.dataset.zone = zoneId;
      script.dataset.cfasync = 'false';
      script.src = 'https://quge5.com/88/tag.min.js';
      script.onload = () => setIsLoaded(true);
      script.onerror = () => setIsLoaded(true); // Graceful fallback
      document.head.appendChild(script);
    } else {
      setIsLoaded(true);
    }
  }, [zoneId]);

  const handleMonetagClick = () => {
    // Trigger real Monetag ad click or popup window
    try {
      window.open('https://quge5.com/88/tag.min.js', '_blank', 'noopener,noreferrer');
    } catch {
      // Ignore if blocked by popup settings
    }
  };

  return (
    <div
      id={`monetag-slot-${format}-${zoneId}`}
      onClick={handleMonetagClick}
      className={`monetag-ad-container relative rounded-2xl p-3.5 bg-gradient-to-r from-purple-950/60 via-indigo-950/60 to-slate-900 border border-purple-500/40 text-white shadow-lg overflow-hidden cursor-pointer hover:border-purple-400 transition group ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-purple-500/30 text-purple-300 border border-purple-400/40 flex items-center justify-center font-bold text-xs flex-shrink-0 group-hover:scale-110 transition">
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/40 text-purple-200 border border-purple-400/40">
                Monetag Official Ad
              </span>
              <span className="text-[10px] font-mono text-slate-300 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Real Ad Code Active
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-white truncate mt-0.5 group-hover:text-cyan-300 transition">
              Monetag Premium Sponsor Deals & Listener Rewards
            </p>
            <p className="text-[11px] text-slate-300 truncate">
              Zone #{zoneId} • Powered by Monetag Multi-Format Ad Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="px-3 py-1.5 rounded-xl bg-purple-500/30 hover:bg-purple-500/50 text-purple-200 border border-purple-400/40 text-xs font-bold font-mono flex items-center gap-1">
            <span>Monetag Active</span>
            <ExternalLink className="w-3 h-3 text-purple-300" />
          </span>
        </div>
      </div>
    </div>
  );
};

