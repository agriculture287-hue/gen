import React, { useState } from 'react';
import { 
  Zap, 
  Layers, 
  Code2, 
  DollarSign, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  Maximize2, 
  MousePointerClick, 
  BellRing, 
  LayoutTemplate, 
  Eye, 
  Sliders, 
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Info
} from 'lucide-react';

export interface MonetagPlacementGuideProps {
  onSimulateVignette?: () => void;
  onSimulateInPagePush?: () => void;
  onSimulateStickyBanner?: () => void;
  onSimulatePopunder?: () => void;
  onToggleAdZoneHighlights?: (enabled: boolean) => void;
  highlightsEnabled?: boolean;
}

export const MonetagPlacementGuide: React.FC<MonetagPlacementGuideProps> = ({
  onSimulateVignette,
  onSimulateInPagePush,
  onSimulateStickyBanner,
  onSimulatePopunder,
  onToggleAdZoneHighlights,
  highlightsEnabled = false,
}) => {
  const [activeTab, setActiveTab] = useState<'blueprint' | 'formats' | 'generator' | 'calculator'>('blueprint');
  const [selectedZone, setSelectedZone] = useState<string>('vignette');
  const [publisherZoneId, setPublisherZoneId] = useState<string>('8593021');
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // Calculator states
  const [dailyTraffic, setDailyTraffic] = useState<number>(25000);
  const [geoTier, setGeoTier] = useState<'tier1' | 'tier2' | 'tier3'>('tier1');
  const [enableVignette, setEnableVignette] = useState<boolean>(true);
  const [enablePopunder, setEnablePopunder] = useState<boolean>(true);
  const [enableInPagePush, setEnableInPagePush] = useState<boolean>(true);
  const [enableBanners, setEnableBanners] = useState<boolean>(true);

  // eCPM rates per 1000 impressions by format and geo tier
  const ecpmTable = {
    tier1: { vignette: 18.5, popunder: 12.0, ipp: 6.5, banner: 2.2 },
    tier2: { vignette: 8.2, popunder: 5.5, ipp: 3.2, banner: 1.1 },
    tier3: { vignette: 3.5, popunder: 2.1, ipp: 1.4, banner: 0.6 },
  };

  const currentRates = ecpmTable[geoTier];
  const calculatedDailyRevenue = (
    (enableVignette ? (dailyTraffic * 0.45 / 1000) * currentRates.vignette : 0) +
    (enablePopunder ? (dailyTraffic * 0.80 / 1000) * currentRates.popunder : 0) +
    (enableInPagePush ? (dailyTraffic * 0.90 / 1000) * currentRates.ipp : 0) +
    (enableBanners ? (dailyTraffic * 1.50 / 1000) * currentRates.banner : 0)
  );

  const copyToClipboard = (text: string, formatId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(formatId);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const adFormatsData = [
    {
      id: 'vignette',
      name: 'Vignette / Interstitial Banner',
      ecpm: '$8.00 - $35.00+',
      placement: 'Full-screen overlay on page transitions, download button clicks, or video/audio playback triggers.',
      description: 'The highest converting ad unit on Monetag. Appears smoothly over the screen when users navigate or initiate high-intent actions with a built-in skip button.',
      bestFor: 'Music downloads, APK downloads, video streaming, page changes.',
      badge: '★ Highest eCPM',
      icon: Maximize2,
      color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
      action: onSimulateVignette,
      actionText: 'Simulate Vignette Ad',
      codeSnippet: `<!-- Monetag Vignette / Interstitial Script -->
<script src="https://alwingulla.com/8593021/script.js" async data-zone="${publisherZoneId}" data-sdk="vignette"></script>
<script>
  function triggerMonetagVignette() {
    if (window.show_8593021) {
      window.show_8593021().then(() => {
        console.log('Vignette Ad displayed successfully');
      });
    }
  }
</script>`,
    },
    {
      id: 'popunder',
      name: 'On-Click (Popunder)',
      ecpm: '$5.00 - $22.00+',
      placement: 'Global document click listener (`document.body`). Triggers on first/second user interaction anywhere on the page.',
      description: 'Opens advertiser landing page in a new background browser tab or window under the current page without interrupting the user’s primary session.',
      bestFor: 'High-traffic media sites, streaming portals, download hubs.',
      badge: '★ Max Revenue',
      icon: MousePointerClick,
      color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
      action: onSimulatePopunder,
      actionText: 'Simulate Popunder Click',
      codeSnippet: `<!-- Monetag Popunder / On-Click Script -->
<script type="text/javascript">
  (function(s,u,z,p){
    s.src=u;s.setAttribute('data-zone',z);p.appendChild(s);
  })(document.createElement('script'),'https://alwingulla.com/8593021/pop.js',${publisherZoneId},document.body);
</script>`,
    },
    {
      id: 'ipp',
      name: 'In-Page Push (IPP)',
      ecpm: '$2.50 - $12.00+',
      placement: 'Bottom-right or bottom-left corner of desktop browser, or top-right floating on mobile viewports.',
      description: 'Native-looking floating notification banner that slides up on page load. Requires NO browser subscription prompt and has 100% device compatibility.',
      bestFor: 'All web pages, news feeds, blogs, music players.',
      badge: '★ High Viewability',
      icon: BellRing,
      color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
      action: onSimulateInPagePush,
      actionText: 'Simulate In-Page Push',
      codeSnippet: `<!-- Monetag In-Page Push (IPP) Script -->
<script src="https://alwingulla.com/8593021/ipp.js" async data-zone="${publisherZoneId}"></script>`,
    },
    {
      id: 'multitag',
      name: 'MultiTag (AI Auto-Optimization)',
      ecpm: '$10.00 - $30.00+',
      placement: 'Placed inside `<head>` tag of `index.html` or top of page body.',
      description: 'Monetag’s smart AI script that automatically combines and selects the best performing ad formats (Push, Vignette, Popunder, IPP) tailored to each user’s OS, device, and geo location.',
      bestFor: 'Publishers wanting maximum eCPM with zero manual ad format configuration.',
      badge: '★ Recommended',
      icon: Sparkles,
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      action: onSimulateVignette,
      actionText: 'Test MultiTag Suite',
      codeSnippet: `<!-- Monetag MultiTag (All-In-One AI Script) -->
<script src="https://alwingulla.com/multitag/script.js" data-zone="${publisherZoneId}" async></script>`,
    },
    {
      id: 'banner',
      name: 'Sticky Leaderboard & Medium Rectangle (300x250, 728x90, 320x50)',
      ecpm: '$1.00 - $5.00+',
      placement: 'Header top banner, sidebar widgets, content feed breaks, or fixed sticky bottom anchor.',
      description: 'Traditional display banner ads optimized for high viewability and smooth user experience without layout shifts.',
      bestFor: 'Sidebars, header banners, fixed footer sticky anchors.',
      badge: '★ Steady Fill Rate',
      icon: LayoutTemplate,
      color: 'text-pink-400 border-pink-500/30 bg-pink-500/10',
      action: onSimulateStickyBanner,
      actionText: 'Simulate Sticky Banner',
      codeSnippet: `<!-- Monetag 300x250 / Leaderboard Banner Container -->
<div id="monetag-banner-zone-${publisherZoneId}"></div>
<script type="text/javascript">
  (function(d,z,s){
    s.src='https://alwingulla.com/banner.js';
    s.setAttribute('data-zone',z);
    d.getElementById('monetag-banner-zone-'+z).appendChild(s);
  })(document,${publisherZoneId},document.createElement('script'));
</script>`,
    },
    {
      id: 'directlink',
      name: 'Smart Direct Link / App Wall',
      ecpm: '$12.00 - $40.00+',
      placement: 'Wrapped on action buttons ("Download File", "Listen in HD", "Unlock Mirror Link").',
      description: 'Monetized direct link URL that routes user traffic through optimized ad offers before redirecting them to the final target resource.',
      bestFor: 'Download buttons, affiliate links, premium content unlocks.',
      badge: '★ High Engagement',
      icon: ExternalLink,
      color: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
      action: () => window.open('https://monetag.com', '_blank'),
      actionText: 'Open Direct Link Demo',
      codeSnippet: `<!-- Monetag Smart Direct Link CTA Example -->
<a 
  href="https://alwingulla.com/directlink?zone=${publisherZoneId}&target=https://your-app-download.com/file.apk" 
  target="_blank" 
  rel="noopener noreferrer"
  class="download-btn"
>
  📥 Download App (Monetag Smart Direct Link)
</a>`,
    }
  ];

  return (
    <div className="w-full bg-[#0a0d18] text-white rounded-3xl border border-white/10 overflow-hidden shadow-2xl my-8 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Banner Header */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border-b border-white/10 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" /> Monetag Publisher Placement Guide
              </span>
              <span className="text-xs font-mono text-slate-400">
                Official Placement Architecture & Simulator
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Where Are Monetag Ads Placed?
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Explore exact placement locations for every Monetag ad format, simulate real ad units live on screen, generate custom JS integration tags, and estimate revenue.
            </p>
          </div>

          {/* Action Button: Highlight Ad Zones on Live Site */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => onToggleAdZoneHighlights && onToggleAdZoneHighlights(!highlightsEnabled)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer border shadow-lg ${
                highlightsEnabled
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-amber-500/20 animate-pulse'
                  : 'bg-white/10 hover:bg-white/15 text-white border-white/20'
              }`}
            >
              <Eye className="w-4 h-4 text-cyan-300" />
              <span>{highlightsEnabled ? 'Hide Live Ad Zone Overlay' : '📍 Highlight Ad Zones on Page'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 border-t border-white/10 pt-4 scrollbar-none">
          <button
            onClick={() => setActiveTab('blueprint')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'blueprint'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Interactive Visual Wireframe</span>
          </button>

          <button
            onClick={() => setActiveTab('formats')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'formats'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <Maximize2 className="w-4 h-4" />
            <span>Ad Formats & Live Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('generator')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'generator'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Monetag Script Tag Generator</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>eCPM & Revenue Calculator</span>
          </button>
        </div>
      </div>

      {/* TAB 1: VISUAL BLUEPRINT WIREFRAME */}
      {activeTab === 'blueprint' && (
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                Standard Web & Mobile Ad Placement Map
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Click any Monetag ad zone badge on the webpage mockup below to inspect details, code, and trigger live preview.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>Recommended: MultiTag script handles zones 1, 2, 3, & 4 automatically.</span>
            </div>
          </div>

          {/* Wireframe Mockup */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visual Page Wireframe Container */}
            <div className="lg:col-span-2 bg-[#05070e] border border-white/15 rounded-2xl p-4 sm:p-6 relative overflow-hidden space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  <span className="text-xs font-mono text-slate-400 ml-2">https://your-website.com</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Monetag Placement Canvas
                </span>
              </div>

              {/* Zone 1: MultiTag / Head Tag Script */}
              <div 
                onClick={() => setSelectedZone('multitag')}
                className={`p-2.5 rounded-xl border text-xs font-mono cursor-pointer transition flex items-center justify-between ${
                  selectedZone === 'multitag'
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 ring-2 ring-emerald-500/50'
                    : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>&lt;head&gt; Zone 1: MultiTag Auto-Script</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/30 text-emerald-200">
                  Global Auto-Format
                </span>
              </div>

              {/* Zone 2: Header / Leaderboard Ad */}
              <div 
                onClick={() => setSelectedZone('banner')}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                  selectedZone === 'banner'
                    ? 'bg-pink-500/20 border-pink-400 text-pink-200 ring-2 ring-pink-500/50'
                    : 'bg-pink-950/30 border-pink-500/40 text-pink-300 hover:bg-pink-900/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <LayoutTemplate className="w-4 h-4 text-pink-400" />
                  <span className="font-bold">Zone 2: Header Banner (728x90 / 320x50)</span>
                </div>
                <span className="text-[10px] font-mono text-pink-300">Top Viewport Banner</span>
              </div>

              {/* Content Main Body Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Main Content Area */}
                <div className="md:col-span-2 space-y-3">
                  <div className="h-16 rounded-xl bg-white/5 border border-white/10 p-3 flex flex-col justify-center">
                    <div className="h-3 w-3/4 bg-slate-700 rounded mb-2"></div>
                    <div className="h-2 w-1/2 bg-slate-800 rounded"></div>
                  </div>

                  {/* Zone 3: Vignette Interstitial Trigger CTA */}
                  <div 
                    onClick={() => setSelectedZone('vignette')}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition space-y-1.5 ${
                      selectedZone === 'vignette'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-500/50'
                        : 'bg-amber-950/30 border-amber-500/40 text-amber-300 hover:bg-amber-900/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1.5">
                        <Maximize2 className="w-4 h-4 text-amber-400" /> Zone 3: Vignette Ad Trigger (On Download / Play Click)
                      </span>
                      <span className="text-[10px] bg-amber-500/30 px-2 py-0.5 rounded font-bold">Top eCPM ($18+)</span>
                    </div>
                    <p className="text-[11px] text-amber-200/80">
                      Fires full-screen modal ad when user clicks primary CTA buttons.
                    </p>
                  </div>

                  {/* Content Area */}
                  <div className="h-20 rounded-xl bg-white/5 border border-white/10 p-3 flex flex-col justify-center gap-2">
                    <div className="h-2 w-full bg-slate-700 rounded"></div>
                    <div className="h-2 w-5/6 bg-slate-800 rounded"></div>
                    <div className="h-2 w-2/3 bg-slate-800 rounded"></div>
                  </div>

                  {/* Zone 4: Direct Link CTA */}
                  <div 
                    onClick={() => setSelectedZone('directlink')}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                      selectedZone === 'directlink'
                        ? 'bg-blue-500/20 border-blue-400 text-blue-200 ring-2 ring-blue-500/50'
                        : 'bg-blue-950/30 border-blue-500/40 text-blue-300 hover:bg-blue-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-blue-400" />
                      <span className="font-bold">Zone 4: Smart Direct Link CTA Button</span>
                    </div>
                    <span className="text-[10px] font-mono text-blue-300">Monetized Outbound Link</span>
                  </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-3">
                  {/* Zone 5: In-Feed 300x250 Banner */}
                  <div 
                    onClick={() => setSelectedZone('banner')}
                    className={`h-36 rounded-xl border p-3 flex flex-col items-center justify-center text-center cursor-pointer transition ${
                      selectedZone === 'banner'
                        ? 'bg-pink-500/20 border-pink-400 text-pink-200 ring-2 ring-pink-500/50'
                        : 'bg-pink-950/30 border-pink-500/40 text-pink-300 hover:bg-pink-900/40'
                    }`}
                  >
                    <LayoutTemplate className="w-6 h-6 text-pink-400 mb-1" />
                    <span className="text-xs font-bold">Zone 5: Medium Rectangle</span>
                    <span className="text-[10px] font-mono opacity-80 mt-1">300 x 250 Banner</span>
                  </div>

                  {/* Sidebar Widget Box */}
                  <div className="h-24 rounded-xl bg-white/5 border border-white/10 p-2.5">
                    <div className="h-2 w-1/2 bg-slate-700 rounded mb-2"></div>
                    <div className="h-2 w-3/4 bg-slate-800 rounded"></div>
                  </div>
                </div>
              </div>

              {/* Zone 6: On-Click Popunder Global Listener */}
              <div 
                onClick={() => setSelectedZone('popunder')}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                  selectedZone === 'popunder'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 ring-2 ring-cyan-500/50'
                    : 'bg-cyan-950/30 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MousePointerClick className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold">Zone 6: On-Click Popunder Listener (`document.body`)</span>
                </div>
                <span className="text-[10px] font-mono">Fires on User Click</span>
              </div>

              {/* Zone 7: In-Page Push Floating Bottom Corner */}
              <div className="flex justify-end pt-2">
                <div 
                  onClick={() => setSelectedZone('ipp')}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center gap-2 shadow-lg ${
                    selectedZone === 'ipp'
                      ? 'bg-purple-500/30 border-purple-400 text-purple-200 ring-2 ring-purple-500/50'
                      : 'bg-purple-950/40 border-purple-500/50 text-purple-300 hover:bg-purple-900/50'
                  }`}
                >
                  <BellRing className="w-4 h-4 text-purple-400 animate-bounce" />
                  <div>
                    <div className="font-bold text-[11px]">Zone 7: In-Page Push (IPP)</div>
                    <div className="text-[9px] text-purple-200/80">Floating Bottom Notification</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Zone Inspector Sidebar Detail Card */}
            <div className="bg-[#0e1222] border border-white/10 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
              {(() => {
                const zone = adFormatsData.find(f => f.id === selectedZone) || adFormatsData[0];
                const IconComponent = zone.icon;
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${zone.color}`}>
                        {zone.badge}
                      </span>
                      <span className="text-xs font-mono text-cyan-300 font-bold">
                        eCPM: {zone.ecpm}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-cyan-400">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">{zone.name}</h4>
                        <p className="text-xs text-slate-400 font-mono">Zone Format ID: {zone.id.toUpperCase()}</p>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Exact Placement Location</h5>
                      <p className="text-xs text-slate-200 bg-white/5 p-3 rounded-xl border border-white/10 leading-relaxed">
                        {zone.placement}
                      </p>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Description & Behavior</h5>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {zone.description}
                      </p>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Best Use Cases</h5>
                      <p className="text-xs text-cyan-300 font-medium">
                        {zone.bestFor}
                      </p>
                    </div>

                    {zone.action && (
                      <button
                        onClick={zone.action}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition cursor-pointer"
                      >
                        <Zap className="w-4 h-4" />
                        <span>{zone.actionText}</span>
                      </button>
                    )}
                  </div>
                );
              })()}

              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-[11px] text-cyan-200 leading-relaxed">
                <span className="font-bold text-cyan-300">💡 Publisher Tip:</span> Combining <strong>Vignette + Popunder + In-Page Push</strong> via Monetag MultiTag yields the maximum revenue per 1,000 visitors.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AD FORMATS & LIVE SIMULATOR */}
      {activeTab === 'formats' && (
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Maximize2 className="w-5 h-5 text-cyan-400" />
                Live Monetag Ad Format Test Bench
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Test each Monetag ad unit directly in your browser session to see how visitors will experience it.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adFormatsData.map((format) => {
              const FormatIcon = format.icon;
              return (
                <div key={format.id} className="bg-[#0e1222] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-cyan-500/40 transition">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${format.color}`}>
                        {format.badge}
                      </span>
                      <span className="text-xs font-mono font-bold text-cyan-300">
                        {format.ecpm}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-cyan-300 shrink-0">
                        <FormatIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{format.name}</h4>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{format.placement}</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {format.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/10 space-y-2">
                    {format.action ? (
                      <button
                        onClick={format.action}
                        className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-cyan-500/20 hover:text-cyan-300 border border-white/10 hover:border-cyan-400/40 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{format.actionText}</span>
                      </button>
                    ) : (
                      <div className="text-center text-[11px] text-slate-400 py-2">
                        Script runs automatically in document head
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: MONETAG SCRIPT TAG GENERATOR */}
      {activeTab === 'generator' && (
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-cyan-400" />
                Monetag Integration Code Generator
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate clean, production-ready script tags for your website or web application.
              </p>
            </div>
          </div>

          {/* Zone ID Input Control */}
          <div className="bg-[#0e1222] border border-white/10 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                Enter Your Monetag Publisher Zone ID
              </label>
              <p className="text-xs text-slate-400">
                You can find your numeric Zone ID in your official Monetag Dashboard (e.g. 8593021).
              </p>
            </div>
            <div>
              <input
                type="text"
                value={publisherZoneId}
                onChange={(e) => setPublisherZoneId(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 8593021"
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>
          </div>

          {/* Code Snippets List */}
          <div className="space-y-6">
            {adFormatsData.map((format) => (
              <div key={format.id} className="bg-[#0e1222] border border-white/10 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                    <h4 className="text-sm font-bold text-white">{format.name} Tag</h4>
                  </div>
                  <button
                    onClick={() => copyToClipboard(format.codeSnippet, format.id)}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedFormat === format.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied Tag!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy HTML Script Snippet</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-4 rounded-xl bg-black/60 border border-white/10 text-xs text-cyan-300 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {format.codeSnippet}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ECPM & REVENUE CALCULATOR */}
      {activeTab === 'calculator' && (
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Monetag Revenue & eCPM Estimator
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Estimate your potential earnings based on traffic volume, visitor geographic tier, and active ad placements.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Controls */}
            <div className="lg:col-span-2 bg-[#0e1222] border border-white/10 rounded-2xl p-6 space-y-6">
              {/* Daily Pageviews Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-200">
                  <span>Daily Pageviews / Visitors</span>
                  <span className="text-cyan-300 font-mono text-sm">{dailyTraffic.toLocaleString()} / day</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="500000"
                  step="1000"
                  value={dailyTraffic}
                  onChange={(e) => setDailyTraffic(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>1,000 / day</span>
                  <span>100,000 / day</span>
                  <span>500,000 / day</span>
                </div>
              </div>

              {/* Geo Tier Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-200 block">Select Audience Tier Geography</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setGeoTier('tier1')}
                    className={`p-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      geoTier === 'tier1'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div>Tier 1</div>
                    <div className="text-[10px] opacity-80 font-normal">US, UK, CA, AU, DE</div>
                  </button>

                  <button
                    onClick={() => setGeoTier('tier2')}
                    className={`p-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      geoTier === 'tier2'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div>Tier 2</div>
                    <div className="text-[10px] opacity-80 font-normal">FR, IT, ES, BR, MX</div>
                  </button>

                  <button
                    onClick={() => setGeoTier('tier3')}
                    className={`p-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      geoTier === 'tier3'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div>Tier 3</div>
                    <div className="text-[10px] opacity-80 font-normal">IN, ID, NG, Global</div>
                  </button>
                </div>
              </div>

              {/* Active Ad Formats Checkboxes */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-200 block">Active Monetag Ad Formats</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableVignette}
                      onChange={(e) => setEnableVignette(e.target.checked)}
                      className="accent-cyan-400 w-4 h-4"
                    />
                    <span>Vignette / Interstitial</span>
                  </label>

                  <label className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enablePopunder}
                      onChange={(e) => setEnablePopunder(e.target.checked)}
                      className="accent-cyan-400 w-4 h-4"
                    />
                    <span>On-Click Popunder</span>
                  </label>

                  <label className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableInPagePush}
                      onChange={(e) => setEnableInPagePush(e.target.checked)}
                      className="accent-cyan-400 w-4 h-4"
                    />
                    <span>In-Page Push (IPP)</span>
                  </label>

                  <label className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableBanners}
                      onChange={(e) => setEnableBanners(e.target.checked)}
                      className="accent-cyan-400 w-4 h-4"
                    />
                    <span>Display Banners</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Revenue Output Box */}
            <div className="bg-gradient-to-br from-cyan-950/60 via-slate-900 to-indigo-950/60 border border-cyan-500/30 rounded-2xl p-6 flex flex-col justify-between space-y-6">
              <div>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 tracking-wider">
                  Estimated Revenue
                </span>
                
                <div className="mt-4">
                  <span className="text-xs text-slate-400 font-mono">Estimated Daily Earnings:</span>
                  <div className="text-3xl sm:text-4xl font-black text-cyan-300 font-mono mt-1">
                    ${calculatedDailyRevenue.toFixed(2)}
                  </div>
                </div>

                <div className="mt-4">
                  <span className="text-xs text-slate-400 font-mono">Estimated Monthly Earnings (30 Days):</span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono mt-1">
                    ${(calculatedDailyRevenue * 30).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-[11px] text-slate-300 space-y-1.5">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  Monetag Payout Guarantees
                </div>
                <p>• Minimum Payout: $5 USD</p>
                <p>• Payout Methods: PayPal, WebMoney, Wire Transfer, Skrill, Crypto</p>
                <p>• Weekly Auto-Payouts available for active publishers</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
