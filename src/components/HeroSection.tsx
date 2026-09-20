import React, { useEffect, useRef, useState } from 'react';
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
  ExternalLink,
  Apple,
  Car,
  ArrowDownToLine
} from 'lucide-react';
import { AppPlatformRelease } from '../types';
import { GenMusicLogo } from './GenMusicLogo';
import { detectUserDevice, DeviceInfo } from '../utils/deviceDetector';
import { DeviceSuggestionBanner } from './DeviceSuggestionBanner';
import { HolographicAudio3D } from './HolographicAudio3D';
import { triggerSamePageDownload, triggerDownloadCelebration } from '../utils/downloadHelper';

interface HeroSectionProps {
  platforms: AppPlatformRelease[];
  onSelectPlatformDownload: (platformId?: string) => void;
  onViewFeatures: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  platforms,
  onSelectPlatformDownload,
  onViewFeatures,
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
        { color: 'rgba(0, 240, 255, 0.12)', speed: 0.02, frequency: 0.007, amplitude: 35, yOffset: height * 0.72 },
        { color: 'rgba(147, 51, 234, 0.10)', speed: 0.015, frequency: 0.005, amplitude: 45, yOffset: height * 0.76 },
        { color: 'rgba(236, 72, 153, 0.08)', speed: 0.025, frequency: 0.009, amplitude: 28, yOffset: height * 0.68 },
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

  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    platform: 'android',
    recommendedFileFormat: '.apk',
    platformName: 'Android',
    isMobile: true,
    rawOS: 'Android',
  });
  const [isHeroDownloading, setIsHeroDownloading] = useState(false);
  const [heroSuccessMsg, setHeroSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setDeviceInfo(detectUserDevice());
  }, []);

  const androidApp = platforms.find((p) => p.platform === 'android') || platforms[0];
  const macApp = platforms.find((p) => p.platform === 'mac') || platforms[1];
  const winApp = platforms.find((p) => p.platform === 'windows') || platforms[2];

  // Resolve specific suggested app based on detected device
  const suggestedApp = 
    deviceInfo.platform === 'windows' ? winApp :
    deviceInfo.platform === 'macos' ? macApp :
    androidApp;

  const handlePlatformDownloadClick = (platformId?: string) => {
    let target = suggestedApp?.downloadUrl;
    let filename = 'GEN-Music.apk';

    if (platformId === 'android' && androidApp?.downloadUrl) {
      target = androidApp.downloadUrl;
      filename = 'GEN-Music.apk';
    } else if (platformId === 'windows' && winApp?.downloadUrl) {
      target = winApp.downloadUrl;
      filename = 'Gen-Music.exe';
    } else if ((platformId === 'mac' || platformId === 'macos') && macApp?.downloadUrl) {
      target = macApp.downloadUrl;
      filename = 'Gen-Music.dmg';
    } else if (suggestedApp?.downloadUrl) {
      target = suggestedApp.downloadUrl;
      filename = suggestedApp.platform === 'windows' ? 'Gen-Music.exe' :
                 (suggestedApp.platform === 'mac' || suggestedApp.platform === 'macos') ? 'Gen-Music.dmg' :
                 'GEN-Music.apk';
    }

    if (target && target !== '#') {
      setIsHeroDownloading(true);
      setHeroSuccessMsg(`Download initiated: ${filename} is downloading...`);
      triggerDownloadCelebration();
      
      // Start download directly on the SAME page - never throws to new window/page
      triggerSamePageDownload(target, filename);

      setTimeout(() => {
        setIsHeroDownloading(false);
      }, 2500);

      setTimeout(() => {
        setHeroSuccessMsg(null);
      }, 7000);
    }
  };

  return (
    <section 
      id="home"
      aria-label="Hero Section" 
      className="relative min-h-[92vh] flex flex-col justify-center items-center overflow-hidden pt-8 pb-16 px-4 sm:px-6 lg:px-8 bg-[#07080e] text-slate-100 bg-cyber-grid bg-mesh-glow"
    >
      {/* Interactive Flowing Canvas Waves */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none opacity-80" 
      />

      {/* Subtle background neon glow bubbles */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Title, Subtitle, Multi-Platform Download Buttons */}
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 z-10">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-cyan-500/30 text-xs font-semibold text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.15)]">
            <GenMusicLogo size="xs" glow={true} />
            <span className="font-mono tracking-wider text-[11px] uppercase">
              GEN MUSIC // 3D SPATIAL & HI-RES AUDIO ENGINE
            </span>
          </div>

          {/* EXACT TITLE */}
          <h1 className="text-4xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight text-white leading-[1.08] font-heading">
            Free Unlimited{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">
              Music Experience
            </span>
          </h1>

          {/* EXACT SUBTITLE */}
          <p className="text-lg sm:text-2xl text-slate-400 font-normal max-w-2xl leading-relaxed">
            Enjoy unlimited free music in one app with offline downloads, EQ controls, Dolby support and more with GEN MUSIC.
          </p>

          {/* Device Identification & Specific Suggestion Banner */}
          <DeviceSuggestionBanner 
            deviceInfo={deviceInfo}
            downloadUrl={suggestedApp?.downloadUrl}
            fileSize={suggestedApp?.fileSize || '24.8 MB'}
            onDownload={() => handlePlatformDownloadClick(deviceInfo.platform === 'ios' ? 'android' : deviceInfo.platform)}
            onViewAllPlatforms={() => onSelectPlatformDownload()}
          />

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-3.5 w-full pt-1">
            <button
              onClick={() => handlePlatformDownloadClick(deviceInfo.platform === 'ios' ? 'android' : deviceInfo.platform)}
              id="hero-primary-download-btn"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-cyan-500/25 hover:shadow-2xl hover:shadow-cyan-500/40 hover:opacity-95 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2.5 cursor-pointer active:scale-98"
            >
              {isHeroDownloading ? (
                <ArrowDownToLine className="w-5 h-5 animate-bounce text-cyan-200" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              <span>
                {isHeroDownloading
                  ? 'Starting Download...'
                  : deviceInfo.platform === 'android' ? 'Download Android APK' :
                    deviceInfo.platform === 'windows' ? 'Download Windows EXE' :
                    deviceInfo.platform === 'macos' ? 'Download macOS DMG' :
                    'Download Free App'}
              </span>
            </button>

            <button
              onClick={onViewFeatures}
              id="hero-explore-features-btn"
              className="w-full sm:w-auto px-5 py-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-cyan-500/40 text-slate-200 hover:bg-white/[0.08] font-bold text-sm shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Features</span>
            </button>
          </div>

          {/* In-page download confirmation notice */}
          {heroSuccessMsg && (
            <div 
              id="hero-download-feedback"
              className="w-full max-w-lg p-3 rounded-xl bg-cyan-500/10 border border-cyan-400/40 text-cyan-300 text-xs font-medium flex items-center gap-2.5 animate-fadeIn"
            >
              <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>{heroSuccessMsg}</span>
            </div>
          )}

          {/* Supported Platforms Indicators */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 text-xs text-slate-400 pt-1">
            <span className="font-bold text-slate-300">Available on:</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.04] text-slate-300 font-semibold border border-white/10 shadow-xs">
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" /> Android APK
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.04] text-slate-300 font-semibold border border-white/10 shadow-xs">
              <Car className="w-3.5 h-3.5 text-emerald-400" /> Android Car
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.04] text-slate-300 font-semibold border border-white/10 shadow-xs">
              <Monitor className="w-3.5 h-3.5 text-blue-400" /> Windows EXE
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.04] text-slate-300 font-semibold border border-white/10 shadow-xs">
              <Laptop className="w-3.5 h-3.5 text-purple-400" /> macOS DMG
            </span>
            <span className="text-slate-500 font-mono">• 100% Free Forever</span>
          </div>

          {/* 6 Hero Bullet Features */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2.5 pt-4 text-xs font-medium text-slate-400 w-full max-w-xl">
            {[
              'Unlimited Streaming',
              'Free Forever',
              'Offline Downloads',
              'High Quality 320kbps',
              'MP3 Export',
              'Dolby Audio Support',
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span className="truncate">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Interactive 3D Holographic Music Core Animation */}
        <div className="lg:col-span-5 flex justify-center items-center z-10">
          <HolographicAudio3D />
        </div>

      </div>
    </section>
  );
};
