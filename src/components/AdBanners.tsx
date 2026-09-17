import React, { useEffect, useState, useRef } from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';

export const DIRECT_SPONSOR_LINK = 'https://www.profitableratecpmnetwork.com/gj794uv9fq?key=e2dc905fa5332522e2704d3f9c63a8fe';

/**
 * Custom hook to trigger auto-refresh every 60 seconds (1 minute)
 */
function useAutoRefreshKey(intervalMs: number = 60000) {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return refreshKey;
}

/**
 * Leaderboard Ad Unit (728x90) - Auto-refreshes every 1 min
 * key: 4110737d8166f053b733fff6f7e13d06
 */
export const AdLeaderboard728x90: React.FC<{ className?: string }> = ({ className = '' }) => {
  const refreshKey = useAutoRefreshKey(60000);

  const iframeHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; }
        </style>
        <script>
          window.onerror = function() { return true; };
        </script>
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
      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1.5 select-none flex items-center gap-1">
        <span>Advertisement</span>
        <span className="text-[9px] text-slate-400 font-normal opacity-75">(Auto-refreshes 1m)</span>
      </span>
      <div className="w-full max-w-[728px] h-[90px] bg-slate-100/60 rounded-xl overflow-hidden flex items-center justify-center shadow-xs border border-slate-200/80">
        <iframe
          key={refreshKey}
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
 * Compact Banner Ad Unit (468x60) - Auto-refreshes every 1 min
 * key: 37b0c7570a229c52933ce00a9e5ef8b9
 */
export const AdBanner468x60: React.FC<{ className?: string }> = ({ className = '' }) => {
  const refreshKey = useAutoRefreshKey(60000);

  const iframeHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; }
        </style>
        <script>
          window.onerror = function() { return true; };
        </script>
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
          key={refreshKey}
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
 * Native Ad Container Unit - Auto-refreshes every 1 min
 * ID: container-3617a4c3f56c896f818969f4fb731195
 * Script: https://pl31365314.profitableratecpmnetwork.com/3617a4c3f56c896f818969f4fb731195/invoke.js
 */
export const AdNativeContainer: React.FC<{ className?: string }> = ({ className = '' }) => {
  const refreshKey = useAutoRefreshKey(60000);

  const iframeHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; }
        </style>
        <script>
          window.onerror = function() { return true; };
        </script>
      </head>
      <body>
        <div id="container-3617a4c3f56c896f818969f4fb731195"></div>
        <script async="async" data-cfasync="false" src="https://pl31365314.profitableratecpmnetwork.com/3617a4c3f56c896f818969f4fb731195/invoke.js"></script>
      </body>
    </html>
  `;

  return (
    <div className={`w-full flex flex-col items-center justify-center my-6 overflow-hidden ${className}`}>
      <div className="w-full max-w-4xl px-4 flex justify-center">
        <iframe
          key={refreshKey}
          title="Sponsored Native Container"
          srcDoc={iframeHtml}
          className="w-full min-h-[90px]"
          scrolling="no"
          style={{ border: 'none', overflow: 'hidden' }}
        />
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

/**
 * Mobile Banner Ad Unit (320x50) - Auto-refreshes every 1 min
 * key: aa73750d369623688925d762a277e45f
 */
export const AdBanner320x50: React.FC<{ className?: string }> = ({ className = '' }) => {
  const refreshKey = useAutoRefreshKey(60000);

  const iframeHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; }
        </style>
        <script>
          window.onerror = function() { return true; };
        </script>
      </head>
      <body>
        <script type="text/javascript">
          atOptions = {
            'key' : 'aa73750d369623688925d762a277e45f',
            'format' : 'iframe',
            'height' : 50,
            'width' : 320,
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://www.highrevenueformat.com/aa73750d369623688925d762a277e45f/invoke.js"></script>
      </body>
    </html>
  `;

  return (
    <div className={`w-full flex flex-col items-center justify-center my-4 overflow-hidden ${className}`}>
      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1 select-none">
        Sponsored
      </span>
      <div className="w-[320px] h-[50px] bg-slate-100/60 rounded-xl overflow-hidden flex items-center justify-center shadow-xs border border-slate-200/80">
        <iframe
          key={refreshKey}
          title="Sponsored Ad 320x50"
          srcDoc={iframeHtml}
          width="320"
          height="50"
          scrolling="no"
          style={{ border: 'none', overflow: 'hidden' }}
        />
      </div>
    </div>
  );
};

/**
 * Medium Rectangle Ad Unit (300x250) - Auto-refreshes every 1 min
 * key: 36019750f2238adf794264fc6b435242
 */
export const AdBanner300x250: React.FC<{ className?: string }> = ({ className = '' }) => {
  const refreshKey = useAutoRefreshKey(60000);

  const iframeHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; }
        </style>
        <script>
          window.onerror = function() { return true; };
        </script>
      </head>
      <body>
        <script type="text/javascript">
          atOptions = {
            'key' : '36019750f2238adf794264fc6b435242',
            'format' : 'iframe',
            'height' : 250,
            'width' : 300,
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://www.highrevenueformat.com/36019750f2238adf794264fc6b435242/invoke.js"></script>
      </body>
    </html>
  `;

  return (
    <div className={`w-full flex flex-col items-center justify-center my-4 overflow-hidden ${className}`}>
      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1 select-none">
        Sponsored Content
      </span>
      <div className="w-[300px] h-[250px] bg-slate-100/60 rounded-xl overflow-hidden flex items-center justify-center shadow-xs border border-slate-200/80">
        <iframe
          key={refreshKey}
          title="Sponsored Ad 300x250"
          srcDoc={iframeHtml}
          width="300"
          height="250"
          scrolling="no"
          style={{ border: 'none', overflow: 'hidden' }}
        />
      </div>
    </div>
  );
};

/**
 * Vertical Banner Ad Unit (160x300) - Auto-refreshes every 1 min
 * key: ac7ea038a8b23ddb95125cadfe3d8acd
 */
export const AdBanner160x300: React.FC<{ className?: string }> = ({ className = '' }) => {
  const refreshKey = useAutoRefreshKey(60000);

  const iframeHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; }
        </style>
        <script>
          window.onerror = function() { return true; };
        </script>
      </head>
      <body>
        <script type="text/javascript">
          atOptions = {
            'key' : 'ac7ea038a8b23ddb95125cadfe3d8acd',
            'format' : 'iframe',
            'height' : 300,
            'width' : 160,
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://www.highrevenueformat.com/ac7ea038a8b23ddb95125cadfe3d8acd/invoke.js"></script>
      </body>
    </html>
  `;

  return (
    <div className={`flex flex-col items-center justify-center my-4 overflow-hidden ${className}`}>
      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1 select-none">
        Sponsored
      </span>
      <div className="w-[160px] h-[300px] bg-slate-100/60 rounded-xl overflow-hidden flex items-center justify-center shadow-xs border border-slate-200/80">
        <iframe
          key={refreshKey}
          title="Sponsored Ad 160x300"
          srcDoc={iframeHtml}
          width="160"
          height="300"
          scrolling="no"
          style={{ border: 'none', overflow: 'hidden' }}
        />
      </div>
    </div>
  );
};

/**
 * Skyscraper Ad Unit (160x600) - Auto-refreshes every 1 min
 * key: 9a699eb9dc590e52d49a7e067d74b972
 */
export const AdBanner160x600: React.FC<{ className?: string }> = ({ className = '' }) => {
  const refreshKey = useAutoRefreshKey(60000);

  const iframeHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; }
        </style>
        <script>
          window.onerror = function() { return true; };
        </script>
      </head>
      <body>
        <script type="text/javascript">
          atOptions = {
            'key' : '9a699eb9dc590e52d49a7e067d74b972',
            'format' : 'iframe',
            'height' : 600,
            'width' : 160,
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://www.highrevenueformat.com/9a699eb9dc590e52d49a7e067d74b972/invoke.js"></script>
      </body>
    </html>
  `;

  return (
    <div className={`flex flex-col items-center justify-center my-4 overflow-hidden ${className}`}>
      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1 select-none">
        Partner
      </span>
      <div className="w-[160px] h-[600px] bg-slate-100/60 rounded-xl overflow-hidden flex items-center justify-center shadow-xs border border-slate-200/80">
        <iframe
          key={refreshKey}
          title="Sponsored Skyscraper Ad 160x600"
          srcDoc={iframeHtml}
          width="160"
          height="600"
          scrolling="no"
          style={{ border: 'none', overflow: 'hidden' }}
        />
      </div>
    </div>
  );
};
