import React, { useEffect, useState } from 'react';
import { Tag, Sparkles, ShieldCheck, Zap } from 'lucide-react';

interface MonetagAdWidgetProps {
  format?: 'banner' | 'native' | 'push' | 'vignette' | 'compact';
  zoneId?: string;
  className?: string;
}

export const MonetagAdWidget: React.FC<MonetagAdWidgetProps> = ({
  format = 'banner',
  zoneId = 'monetag-8839210',
  className = '',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Dynamically initialize Monetag async ad script if not already present
    const scriptId = `monetag-script-${zoneId}`;
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.dataset.zone = zoneId;
      script.src = 'https://alwingulla.com/88/39/21/8839210.js';
      script.onload = () => setIsLoaded(true);
      script.onerror = () => setIsLoaded(true); // Graceful fallback
      document.head.appendChild(script);
    } else {
      setIsLoaded(true);
    }
  }, [zoneId]);

  return (
    <div
      id={`monetag-slot-${format}-${zoneId}`}
      className={`monetag-ad-container relative rounded-2xl p-3.5 bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 border border-purple-500/30 text-white shadow-lg overflow-hidden ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold text-xs flex-shrink-0">
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/30 text-purple-200 border border-purple-400/30">
                Monetag Verified Ad
              </span>
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Safe Network
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-white truncate mt-0.5">
              Monetag Premium Sponsor Deals & Listener Rewards
            </p>
            <p className="text-[11px] text-slate-300 truncate">
              Powered by Monetag Multi-Format Native & In-Page Push Network
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-extrabold font-mono">
            ★ Monetag Active
          </span>
        </div>
      </div>
    </div>
  );
};
