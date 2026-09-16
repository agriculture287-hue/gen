import React, { useEffect, useRef } from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';

export const DIRECT_SPONSOR_LINK = 'https://www.profitableratecpmnetwork.com/gj794uv9fq?key=e2dc905fa5332522e2704d3f9c63a8fe';

/**
 * Leaderboard Ad Unit (728x90)
 * key: 4110737d8166f053b733fff6f7e13d06
 */
export const AdLeaderboard728x90: React.FC<{ className?: string }> = ({ className = '' }) => {
  const iframeHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; }
        </style>
      </head>
      <body>
        <script type="text/javascript">
          atOptions = {
            'key' : '4110737d8166f053b733fff6f7e13d06',
            'format' : 'iframe',
            'height' : 90,
            'width' : 728,
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://www.highrevenueformat.com/4110737d8166f053b733fff6f7e13d06/invoke.js"></script>
      </body>
    </html>
  `;

  return (
    <div className={`w-full flex flex-col items-center justify-center my-6 overflow-hidden ${className}`}>
      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1.5 select-none">
        Advertisement
      </span>
      <div className="w-full max-w-[728px] h-[90px] bg-slate-100/60 rounded-xl overflow-hidden flex items-center justify-center shadow-xs border border-slate-200/80">
        <iframe
          title="Sponsored Ad 728x90"
          srcDoc={iframeHtml}
          width="728"
          height="90"
          scrolling="no"
          style={{ border: 'none', overflow: 'hidden' }}
        />
      </div>
    </div>
  );
};

/**
 * Compact Banner Ad Unit (468x60)
 * key: 37b0c7570a229c52933ce00a9e5ef8b9
 */
export const AdBanner468x60: React.FC<{ className?: string }> = ({ className = '' }) => {
  const iframeHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; }
        </style>
      </head>
      <body>
        <script type="text/javascript">
          atOptions = {
            'key' : '37b0c7570a229c52933ce00a9e5ef8b9',
            'format' : 'iframe',
            'height' : 60,
            'width' : 468,
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://www.highrevenueformat.com/37b0c7570a229c52933ce00a9e5ef8b9/invoke.js"></script>
      </body>
    </html>
  `;

  return (
    <div className={`w-full flex flex-col items-center justify-center my-4 overflow-hidden ${className}`}>
      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1 select-none">
        Sponsored
      </span>
      <div className="w-full max-w-[468px] h-[60px] bg-slate-100/60 rounded-xl overflow-hidden flex items-center justify-center shadow-xs border border-slate-200/80">
        <iframe
          title="Sponsored Ad 468x60"
          srcDoc={iframeHtml}
          width="468"
          height="60"
          scrolling="no"
          style={{ border: 'none', overflow: 'hidden' }}
        />
      </div>
    </div>
  );
};

/**
 * Native Ad Container Unit
 * ID: container-3617a4c3f56c896f818969f4fb731195
 * Script: https://pl31365314.profitableratecpmnetwork.com/3617a4c3f56c896f818969f4fb731195/invoke.js
 */
export const AdNativeContainer: React.FC<{ className?: string }> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Dynamically mount script if not already initialized
    const scriptId = 'script-ad-native-3617a4c3f56c896f818969f4fb731195';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = 'https://pl31365314.profitableratecpmnetwork.com/3617a4c3f56c896f818969f4fb731195/invoke.js';
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className={`w-full flex flex-col items-center justify-center my-6 ${className}`}>
      <div className="w-full max-w-4xl px-4">
        <div id="container-3617a4c3f56c896f818969f4fb731195" ref={containerRef} className="w-full min-h-[50px]" />
      </div>
    </div>
  );
};

/**
 * Direct Sponsored Partner Link Badge
 */
export const AdDirectSponsorLink: React.FC<{ label?: string; className?: string }> = ({
  label = 'Sponsored Fast Mirror',
  className = '',
}) => {
  return (
    <a
      href={DIRECT_SPONSOR_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-300 text-amber-900 hover:from-amber-500/20 hover:to-orange-500/20 text-xs font-bold transition shadow-xs cursor-pointer ${className}`}
    >
      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
      <span>{label}</span>
      <ExternalLink className="w-3 h-3 text-amber-700 ml-0.5" />
    </a>
  );
};
