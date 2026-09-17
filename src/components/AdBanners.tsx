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
          className="w-full min-h-[160px]"
          height="180"
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

/**
 * Responsive Leaderboard:
 * Renders 728x90 Leaderboard on tablet & desktop (md:),
 * and 320x50 Mobile Banner on smaller screens (< md).
 */
export const AdResponsiveLeaderboard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`w-full flex flex-col items-center justify-center overflow-hidden ${className}`}>
      <div className="hidden md:flex w-full justify-center">
        <AdLeaderboard728x90 />
      </div>
      <div className="flex md:hidden w-full justify-center">
        <AdBanner320x50 />
      </div>
    </div>
  );
};

/**
 * Desktop Side Skyscrapers (160x600):
 * Fixed in left and right gutters for ultra-wide desktop viewports (>= 1536px / 2xl).
 */
export const AdSideSkyscrapers: React.FC = () => {
  return (
    <>
      <aside 
        id="ad-gutter-left"
        aria-label="Sponsored Left Advertisement"
        className="hidden 2xl:flex flex-col items-center fixed top-24 left-3 z-30 pointer-events-auto"
      >
        <AdBanner160x600 />
      </aside>

      <aside 
        id="ad-gutter-right"
        aria-label="Sponsored Right Advertisement"
        className="hidden 2xl:flex flex-col items-center fixed top-24 right-3 z-30 pointer-events-auto"
      >
        <AdBanner160x600 />
      </aside>
    </>
  );
};

/**
 * Sticky Bottom Banner Ad:
 * Floats anchored at the bottom of the viewport so ads are 100% visible while scrolling.
 */
export const AdStickyBottomBar: React.FC = () => {
  const [minimized, setMinimized] = useState(false);

  if (minimized) {
    return (
      <div className="fixed bottom-3 right-3 z-40">
        <button
          onClick={() => setMinimized(false)}
          id="ad-sticky-reopen-btn"
          className="px-3 py-1.5 rounded-full bg-slate-900/90 text-white text-[11px] font-bold shadow-xl border border-slate-700 hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
        >
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Sponsored Ad</span>
        </button>
      </div>
    );
  }

  return (
    <div 
      id="ad-sticky-bottom-bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl py-1.5 px-3 flex flex-col items-center justify-center transition-all duration-300"
    >
      <div className="w-full max-w-5xl flex items-center justify-between gap-2 px-2 -mb-1">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
            Sponsored Partner
          </span>
          <AdDirectSponsorLink label="Fast Mirror" className="text-[10px] py-0.5 px-2" />
        </div>
        <button
          onClick={() => setMinimized(true)}
          id="ad-sticky-dismiss-btn"
          className="text-slate-400 hover:text-slate-700 p-1 text-xs font-bold rounded-md hover:bg-slate-100 cursor-pointer"
          title="Minimize Ad"
          aria-label="Minimize Ad"
        >
          ✕
        </button>
      </div>
      
      {/* Mobile 320x50 Banner */}
      <div className="sm:hidden flex justify-center w-full my-0.5">
        <AdBanner320x50 className="my-0" />
      </div>

      {/* Desktop 728x90 Leaderboard */}
      <div className="hidden sm:flex justify-center w-full my-0.5">
        <AdLeaderboard728x90 className="my-0" />
      </div>
    </div>
  );
};

/**
 * All-In-One Sponsored Showcase Section:
 * Guarantees every single ad format is shown clearly in dedicated content cards.
 */
export const AdShowcaseSection: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <section 
      id="sponsored-media-showcase" 
      aria-label="Sponsored Media & Partner Ad Units"
      className={`w-full max-w-6xl mx-auto px-4 my-10 ${className}`}
    >
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-bold text-[10px] uppercase tracking-wider">
                Partner Network
              </span>
              <span className="text-xs text-slate-400 font-medium">All Units Active</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              Sponsored Recommendations & Media
            </h3>
          </div>
          <AdDirectSponsorLink label="Visit Direct Sponsor" />
        </div>

        {/* Multi-Ad Format Showcase: 300x250, 160x300, 468x60, 320x50 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-center justify-items-center">
          {/* Card 1: 300x250 Medium Rectangle */}
          <div className="w-full flex flex-col items-center p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Medium Rectangle (300x250)
            </span>
            <AdBanner300x250 className="my-0" />
          </div>

          {/* Card 2: 160x300 Vertical Banner */}
          <div className="w-full flex flex-col items-center p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Vertical Banner (160x300)
            </span>
            <AdBanner160x300 className="my-0" />
          </div>

          {/* Card 3: 300x250 Second Slot */}
          <div className="w-full flex flex-col items-center p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Sponsored Content (300x250)
            </span>
            <AdBanner300x250 className="my-0" />
          </div>
        </div>

        {/* Additional Horizontal Banners: 468x60 and 320x50 */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-around gap-6">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Compact Banner (468x60)
            </span>
            <AdBanner468x60 className="my-0" />
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Mobile Banner (320x50)
            </span>
            <AdBanner320x50 className="my-0" />
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * 10x Ad Multiplier Matrix (After Page End):
 * Multiplies all ad banner formats 10x in a structured, high-capacity grid block 
 * at the end of the page.
 */
export const AdMultiplyMatrix10x: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <section 
      id="end-page-10x-ad-matrix" 
      aria-label="Sponsored Multiplier Network"
      className={`w-full max-w-7xl mx-auto px-4 my-12 ${className}`}
    >
      <div className="p-6 sm:p-10 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-2xl space-y-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono font-bold text-[10px] uppercase tracking-widest">
                10x Multiplier Active
              </span>
              <span className="text-xs text-slate-400 font-medium">10 Active Ad Clusters</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Sponsored Ad Network Matrix (10x Display Engine)
            </h3>
          </div>
          <AdDirectSponsorLink label="Partner Portal" className="bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30" />
        </div>

        {/* Ad Cluster 1: Leaderboard 728x90 Unit #1 */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Ad Slot 1 / 10 — Leaderboard Banner
          </span>
          <AdResponsiveLeaderboard />
        </div>

        {/* Ad Cluster 2: 300x250 Medium Rectangles Triple Grid */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Ad Slot 2 / 10 — Triple Medium Rectangle Grid (300x250)
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center justify-items-center">
            <AdBanner300x250 />
            <AdBanner300x250 />
            <AdBanner300x250 />
          </div>
        </div>

        {/* Ad Cluster 3: Native In-Feed Unit #1 */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Ad Slot 3 / 10 — Native Sponsored Container
          </span>
          <AdNativeContainer />
        </div>

        {/* Ad Cluster 4: 160x600 Skyscrapers & 160x300 Vertical Banners Array */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Ad Slot 4 / 10 — Skyscraper & Vertical Display Cluster
          </span>
          <div className="flex flex-wrap items-center justify-around gap-6">
            <AdBanner160x600 />
            <AdBanner160x300 />
            <AdBanner160x300 />
            <AdBanner160x600 />
          </div>
        </div>

        {/* Ad Cluster 5: Dual Compact Banners (468x60) */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Ad Slot 5 / 10 — Dual Compact Banners (468x60)
          </span>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <AdBanner468x60 />
            <AdBanner468x60 />
          </div>
        </div>

        {/* Ad Cluster 6: Quad Mobile Banners (320x50) */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Ad Slot 6 / 10 — Quad Mobile Banner Grid (320x50)
          </span>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <AdBanner320x50 />
            <AdBanner320x50 />
            <AdBanner320x50 />
            <AdBanner320x50 />
          </div>
        </div>

        {/* Ad Cluster 7: Leaderboard 728x90 Unit #2 */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Ad Slot 7 / 10 — Secondary Leaderboard Unit
          </span>
          <AdResponsiveLeaderboard />
        </div>

        {/* Ad Cluster 8: Dual Medium Rectangle Grid */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Ad Slot 8 / 10 — Dual Medium Rectangle Showcase
          </span>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <AdBanner300x250 />
            <AdBanner300x250 />
          </div>
        </div>

        {/* Ad Cluster 9: Native In-Feed Unit #2 */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Ad Slot 9 / 10 — Secondary Native Sponsored Grid
          </span>
          <AdNativeContainer />
        </div>

        {/* Ad Cluster 10: Final Mega Responsive Leaderboard & Sponsor Link */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Ad Slot 10 / 10 — Premium Sponsor Banner
            </span>
            <AdDirectSponsorLink label="Direct Partner Link" />
          </div>
          <AdResponsiveLeaderboard />
        </div>

      </div>
    </section>
  );
};


