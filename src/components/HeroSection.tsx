import React, { useEffect, useRef } from 'react';
import { 
  Download, 
  Sparkles, 
  ArrowDown, 
  CheckCircle2, 
  Headphones, 
  Smartphone, 
  Laptop, 
  Monitor, 
  Radio, 
  PlaySquare, 
  Layers, 
  Sliders, 
  Volume2, 
  ShieldCheck, 
  Disc3,
  Send,
  ExternalLink
} from 'lucide-react';
import { AppPlatformRelease } from '../types';
import { GenMusicLogo } from './GenMusicLogo';
import { DIRECT_SPONSOR_LINK } from './AdBanners';

interface HeroSectionProps {
  platforms: AppPlatformRelease[];
  onSelectPlatformDownload: (platformId?: string) => void;
  onViewFeatures: () => void;
  telegramUrl: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  platforms,
  onSelectPlatformDownload,
  onViewFeatures,
  telegramUrl,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Smooth audio frequency waves on light canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const waveConfigs = [
        { color: 'rgba(37, 99, 235, 0.12)', speed: 0.02, frequency: 0.007, amplitude: 35, yOffset: height * 0.72 },
        { color: 'rgba(124, 58, 237, 0.1)', speed: 0.015, frequency: 0.005, amplitude: 45, yOffset: height * 0.76 },
        { color: 'rgba(219, 39, 119, 0.08)', speed: 0.025, frequency: 0.009, amplitude: 28, yOffset: height * 0.68 },
      ];

      waveConfigs.forEach((wave) => {
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(0, wave.yOffset);

        for (let x = 0; x < width; x += 3) {
          const y = wave.yOffset + Math.sin(x * wave.frequency + phase * wave.speed * 40) * wave.amplitude;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fillStyle = wave.color;
        ctx.fill();
      });

      phase += 0.03;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const androidApp = platforms.find((p) => p.platform === 'android') || platforms[0];
  const macApp = platforms.find((p) => p.platform === 'mac') || platforms[1];
  const winApp = platforms.find((p) => p.platform === 'windows') || platforms[2];

  const handlePlatformDownloadClick = (platformId?: string) => {
    try {
      window.open(DIRECT_SPONSOR_LINK, '_blank');
    } catch {
      // safe fallback
    }
    setTimeout(() => {
      onSelectPlatformDownload(platformId);
    }, 250);
  };

  return (
    <section 
      id="home"
      aria-label="Hero Section" 
      className="relative min-h-[90vh] flex flex-col justify-center items-center overflow-hidden pt-8 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50/50 via-slate-50 to-slate-50"
    >
      {/* Interactive Flowing Canvas Waves */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none opacity-90" 
      />

      {/* Subtle background glow bubbles */}
      <div className="absolute top-10 left-1/4 w-80 h-80 bg-blue-200/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-20 right-1/4 w-80 h-80 bg-purple-200/35 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Title, Subtitle, Multi-Platform Download Buttons */}
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 z-10">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-blue-200 shadow-sm text-xs font-semibold text-slate-700">
            <GenMusicLogo size="xs" glow={false} />
            <span className="text-blue-700 font-bold">Android, macOS & Windows</span>
            <span className="text-slate-400">•</span>
            <span className="text-emerald-700 font-bold">Latest {androidApp?.version || 'v2.5.0'}</span>
          </div>

          {/* EXACT TITLE */}
          <h1 className="text-4xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.08] font-heading">
            Free Unlimited{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent">
              Music Experience
            </span>
          </h1>

          {/* EXACT SUBTITLE */}
          <p className="text-lg sm:text-2xl text-slate-600 font-normal max-w-2xl leading-relaxed">
            Enjoy YouTube and Spotify music in one app with offline downloads, EQ controls, Dolby support and more.
          </p>

          {/* Quick Platform Download Cards Grid */}
          <div className="w-full max-w-2xl pt-2 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 text-left">
              Select Your Platform to Download:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
              {/* 1. Android APK */}
              <button
                onClick={() => handlePlatformDownloadClick(androidApp?.id)}
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between space-y-2 group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                    {androidApp?.version || 'v2.5.0'}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition">
                    Android APK
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    {androidApp?.fileSize || '24.8 MB'} • Free
                  </span>
                </div>
                <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 pt-1">
                  <Download className="w-3.5 h-3.5" />
                  <span>Download APK</span>
                </div>
              </button>

              {/* 2. Mac macOS DMG */}
              <button
                onClick={() => handlePlatformDownloadClick(macApp?.id)}
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between space-y-2 group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-200">
                    {macApp?.version || 'v2.5.0'}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm group-hover:text-purple-700 transition">
                    macOS App
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    {macApp?.fileSize || '68.4 MB'} • DMG
                  </span>
                </div>
                <div className="text-xs font-bold text-purple-600 flex items-center gap-1 pt-1">
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Mac</span>
                </div>
              </button>

              {/* 3. Windows EXE */}
              <button
                onClick={() => handlePlatformDownloadClick(winApp?.id)}
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between space-y-2 group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                    {winApp?.version || 'v2.5.0'}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition">
                    Windows App
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    {winApp?.fileSize || '56.2 MB'} • EXE
                  </span>
                </div>
                <div className="text-xs font-bold text-blue-600 flex items-center gap-1 pt-1">
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Win</span>
                </div>
              </button>
            </div>
          </div>

          {/* Secondary Actions & Telegram */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1">
            <button
              onClick={onViewFeatures}
              className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Explore Features</span>
              <ArrowDown className="w-4 h-4 text-slate-400" />
            </button>

            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4 text-blue-600" />
              <span>Join Official Telegram Channel</span>
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            </a>
          </div>

          {/* 6 Hero Bullet Features */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2.5 pt-4 text-xs font-medium text-slate-600 w-full max-w-xl">
            {[
              'Unlimited Streaming',
              'Free Forever',
              'Offline Downloads',
              'High Quality 320kbps',
              'MP3 Export',
              'Dolby Audio Support',
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="truncate">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Clean App Preview Mockup */}
        <div className="lg:col-span-5 flex justify-center items-center z-10">
          <div className="relative w-full max-w-[340px] sm:max-w-[370px]">
            
            {/* Soft backdrop glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-300/40 via-purple-300/40 to-pink-300/30 rounded-[50px] blur-2xl pointer-events-none" />

            {/* Device Frame */}
            <div className="relative rounded-[48px] p-3.5 bg-slate-900 shadow-2xl border-4 border-slate-700/80">
              <div className="w-full bg-[#0d1117] rounded-[36px] overflow-hidden p-5 pt-3 relative flex flex-col justify-between text-white shadow-inner min-h-[500px]">
                
                {/* Mockup Notch */}
                <div className="flex justify-center mb-3">
                  <div className="w-24 h-4 bg-black rounded-full border border-white/15 flex items-center justify-between px-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    <span className="w-2 h-2 rounded-full bg-neutral-800" />
                  </div>
                </div>

                {/* App Status Header inside Mockup */}
                <div className="flex items-center justify-between text-xs pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <GenMusicLogo size="xs" glow={false} />
                    <span className="text-[11px] font-black text-white tracking-wider font-heading">
                      GEN <span className="text-blue-400">MUSIC</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold text-[9px] border border-blue-500/30">
                      Dolby Atmos
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[9px] border border-emerald-500/30">
                      320kbps
                    </span>
                  </div>
                </div>

                {/* Now Playing Album Art Showcase */}
                <div className="relative my-4 aspect-square rounded-2xl overflow-hidden shadow-xl border border-white/10 group">
                  <img
                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"
                    alt="Album Cover Mockup"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] text-white font-mono border border-white/20">
                    Lossless Hi-Fi
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-blue-300 font-semibold">YouTube & Spotify</div>
                      <div className="text-sm font-bold text-white truncate">Neon Midnight Waves</div>
                    </div>
                    <div className="flex gap-0.5 items-end h-4">
                      <span className="w-1 bg-cyan-400 rounded-full animate-eq-1" />
                      <span className="w-1 bg-purple-400 rounded-full animate-eq-2" />
                      <span className="w-1 bg-pink-400 rounded-full animate-eq-3" />
                      <span className="w-1 bg-blue-400 rounded-full animate-eq-4" />
                    </div>
                  </div>
                </div>

                {/* In-app Controls */}
                <div className="space-y-3 pt-1">
                  {/* Seekbar */}
                  <div className="space-y-1">
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className="w-2/3 h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-pink-500" />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                      <span>2:38</span>
                      <span>4:12</span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      ✓ Offline Stored
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      MP3 320kbps
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
