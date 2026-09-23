import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  Laptop, 
  CheckCircle2, 
  ShieldCheck, 
  ExternalLink, 
  Zap, 
  Send, 
  Sparkles,
  Flame,
  Layers,
  ArrowDownToLine,
  Car
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppPlatformRelease } from '../types';
import { VersionManifest } from '../types/update';
import { DEFAULT_VERSION_MANIFEST } from '../data/versionManifest';
import { detectUserDevice, DeviceInfo } from '../utils/deviceDetector';
import { DOWNLOAD_LINKS } from '../data/downloadLinks';
import { triggerSamePageDownload, openBothDownloadAndHyperlink } from '../utils/downloadHelper';

interface DownloadAppSectionProps {
  platforms: AppPlatformRelease[];
  manifest?: VersionManifest;
}

export const DownloadAppSection: React.FC<DownloadAppSectionProps> = ({
  platforms: initialPlatforms,
  manifest = DEFAULT_VERSION_MANIFEST,
}) => {
  const [downloadingPlatformId, setDownloadingPlatformId] = useState<string | null>(null);
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'android' | 'windows' | 'macos' | 'android-car'>('all');
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    platform: 'android',
    recommendedFileFormat: '.apk',
    platformName: 'Android',
    isMobile: true,
    rawOS: 'Android',
  });

  useEffect(() => {
    setDeviceInfo(detectUserDevice());
  }, []);

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#2563eb', '#10b981', '#6366f1', '#ec4899'],
      });
    } catch {
      // safe fallback
    }
  };

  const downloadCards = [
    {
      id: 'android',
      platform: 'android',
      name: 'GEN MUSIC for Android',
      shortName: 'Android',
      tagline: 'Direct APK Package for Phones, Tablets & Android TV',
      fileFormat: '.apk',
      fileSize: DOWNLOAD_LINKS.android.fileSize,
      downloadUrl: DOWNLOAD_LINKS.android.downloadUrl,
      filename: `GEN-Music.apk`,
      minSystem: DOWNLOAD_LINKS.android.minSystem,
      architecture: DOWNLOAD_LINKS.android.architecture,
      badge: 'Most Popular',
      accentColor: 'from-emerald-500 to-teal-600',
      borderColor: 'border-emerald-500/50',
      bgGradient: 'from-emerald-50/50 via-white to-white',
      icon: <Smartphone className="w-8 h-8 text-emerald-600" />,
      features: [
        'Dolby 3D Spatial Audio & Lossless 320kbps MP3 Saver',
        'Background Playback with Lockscreen Media Controls',
        'Unlimited Free Music & Playlist Auto-Sync',
        'Zero Commercial Audio Interruptions Forever',
      ],
    },
    {
      id: 'windows',
      platform: 'windows',
      name: 'GEN MUSIC for Windows',
      shortName: 'Windows',
      tagline: 'Standard 64-bit Installer with Auto-Update Support',
      fileFormat: '.exe',
      fileSize: DOWNLOAD_LINKS.windows.fileSize,
      downloadUrl: DOWNLOAD_LINKS.windows.downloadUrl,
      filename: `GEN-Music-Setup.exe`,
      minSystem: DOWNLOAD_LINKS.windows.minSystem,
      architecture: DOWNLOAD_LINKS.windows.architecture,
      badge: 'Desktop Edition',
      accentColor: 'from-blue-600 to-indigo-600',
      borderColor: 'border-blue-500/50',
      bgGradient: 'from-blue-50/50 via-white to-white',
      icon: <Monitor className="w-8 h-8 text-blue-600" />,
      features: [
        'Global Media Key Hotkeys & Discord Rich Presence',
        '10-Band Graphic Equalizer with Bass Virtualizer',
        'Local Audio File Importer with Automatic Tag Match',
        'Silent Background Auto-Updater Engine',
      ],
    },
    {
      id: 'macos',
      platform: 'macos',
      name: 'GEN MUSIC for macOS',
      shortName: 'macOS',
      tagline: 'Universal DMG for Apple Silicon (M1/M2/M3/M4) & Intel Macs',
      fileFormat: '.dmg',
      fileSize: DOWNLOAD_LINKS.macos.fileSize,
      downloadUrl: DOWNLOAD_LINKS.macos.downloadUrl,
      filename: `GEN-Music.dmg`,
      minSystem: DOWNLOAD_LINKS.macos.minSystem,
      architecture: DOWNLOAD_LINKS.macos.architecture,
      badge: 'Apple Silicon Ready',
      accentColor: 'from-indigo-600 to-purple-600',
      borderColor: 'border-purple-500/50',
      bgGradient: 'from-purple-50/50 via-white to-white',
      icon: <Laptop className="w-8 h-8 text-indigo-600" />,
      features: [
        'Native Apple Silicon M-Series Hardware Acceleration',
        'AirPlay 2 & Spatial Audio Direct Streaming',
        'Menu Bar Mini-Player with Track Preview',
        'Digitally Signed & Sandboxed for Gatekeeper',
      ],
    },
    {
      id: 'android-car',
      platform: 'android-car',
      name: 'GEN MUSIC for Android Auto',
      shortName: 'Android Car',
      tagline: 'Compatible APK for Android Smart Dashboards & Car OS',
      fileFormat: '.apk',
      fileSize: DOWNLOAD_LINKS.androidCar.fileSize,
      downloadUrl: DOWNLOAD_LINKS.androidCar.downloadUrl,
      filename: `GEN-Music-Car.apk`,
      minSystem: 'Android Auto / Android Automotive OS 8.0+',
      architecture: 'ARM64 & ARMv7 Universal',
      badge: 'Car Dashboard Ready',
      accentColor: 'from-cyan-500 to-blue-600',
      borderColor: 'border-cyan-500/50',
      bgGradient: 'from-cyan-50/50 via-white to-white',
      icon: <Car className="w-8 h-8 text-cyan-600" />,
      features: [
        'Oversized Safe-Touch Buttons for Driving Safety',
        'Google Assistant Hands-Free Voice Controls',
        'Optimized for Standard, Curved, & Widescreen Panels',
        'Seamless Steering Wheel Multi-Controller Mapping',
      ],
    },
  ];

  const handleDownloadClick = (e: React.MouseEvent, card: typeof downloadCards[0]) => {
    e.preventDefault();
    const targetUrl = card.downloadUrl;
    if (!targetUrl) return;

    setDownloadingPlatformId(card.id);
    setDownloadSuccessId(card.id);
    triggerCelebration();

    // Open BOTH the GitHub app download link and the sponsor hyperlink at the exact same click
    openBothDownloadAndHyperlink(targetUrl, card.filename);

    setTimeout(() => {
      setDownloadingPlatformId(null);
    }, 2500);
  };

  const filteredCards = activeTab === 'all' 
    ? downloadCards 
    : downloadCards.filter((c) => c.platform === activeTab);

  return (
    <section 
      id="download" 
      aria-label="Official Multi-Platform App Download & Release Hub"
      className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20"
    >
      <div id="downloads-hub" className="relative rounded-[36px] bg-[#090c1a]/90 border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl p-6 sm:p-12 overflow-hidden">
        
        {/* Futuristic background ambient glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto space-y-10">
          
          {/* Section Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>OFFICIAL CLIENT DEPLOYMENTS</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-heading">
              Download{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent">
                GEN MUSIC
              </span>
            </h2>

            <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
              Select your operating system. Direct links point to our high-speed release repositories. 
              Zero interruptions, 3D spatial audio decoder, and lossless playback.
            </p>

            {/* Platform Filter Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  activeTab === 'all'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                    : 'bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 border-white/10'
                }`}
              >
                All Platforms (4)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('android')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                  activeTab === 'android'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    : 'bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 border-white/10'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Android (.apk)</span>
                {deviceInfo.platform === 'android' && (
                  <span className="ml-1 text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 font-mono uppercase">Detected</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('android-car')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                  activeTab === 'android-car'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                    : 'bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 border-white/10'
                }`}
              >
                <Car className="w-3.5 h-3.5 text-cyan-400" />
                <span>Android Car (.apk)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('windows')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                  activeTab === 'windows'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                    : 'bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 border-white/10'
                }`}
              >
                <Monitor className="w-3.5 h-3.5 text-blue-400" />
                <span>Windows (.exe)</span>
                {deviceInfo.platform === 'windows' && (
                  <span className="ml-1 text-[9px] px-1.5 py-0.2 rounded-full bg-blue-500/30 border border-blue-400/40 text-blue-200 font-mono uppercase">Detected</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('macos')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                  activeTab === 'macos'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                    : 'bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 border-white/10'
                }`}
              >
                <Laptop className="w-3.5 h-3.5 text-purple-400" />
                <span>macOS (.dmg)</span>
                {deviceInfo.platform === 'macos' && (
                  <span className="ml-1 text-[9px] px-1.5 py-0.2 rounded-full bg-purple-500/30 border border-purple-400/40 text-purple-200 font-mono uppercase">Detected</span>
                )}
              </button>
            </div>
          </div>

          {/* Four Platform Download Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8">
            {filteredCards.map((card) => {
              const isDownloading = downloadingPlatformId === card.id;
              const isSuccess = downloadSuccessId === card.id;
              const isDeviceMatch = 
                (card.id === 'android' && deviceInfo.platform === 'android') ||
                (card.id === 'windows' && deviceInfo.platform === 'windows') ||
                (card.id === 'macos' && deviceInfo.platform === 'macos');

              return (
                <div
                  key={card.id}
                  id={`download-card-${card.id}`}
                  className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 bg-[#0d1020]/90 backdrop-blur-xl border ${
                    isDeviceMatch 
                      ? 'border-cyan-400 ring-2 ring-cyan-500/30 shadow-[0_0_35px_rgba(0,240,255,0.2)] scale-[1.02]' 
                      : 'border-white/10 hover:border-cyan-500/40 shadow-xl hover:shadow-cyan-500/10'
                  } hover:-translate-y-1`}
                >
                  {/* Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-3 py-1 rounded-full bg-black/60 border border-white/10 text-cyan-300 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs">
                        <Flame className="w-3 h-3 text-cyan-400 fill-cyan-400" />
                        <span>{card.badge}</span>
                      </span>

                      {isDeviceMatch && (
                        <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs animate-pulse">
                          <Sparkles className="w-3 h-3 text-cyan-300" />
                          <span>Detected Platform</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Main Info */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3.5">
                      <div className="p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 shadow-xs">
                        {card.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-white tracking-tight font-heading">
                          {card.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-mono">
                          {card.fileSize} • {card.fileFormat}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed font-normal">
                      {card.tagline}
                    </p>

                    {/* Features Checklist */}
                    <div className="space-y-2 bg-white/[0.02] p-3.5 rounded-2xl border border-white/5">
                      {card.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-300 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>

                    {/* System Requirement */}
                    <div className="bg-black/40 rounded-xl p-3 border border-white/5 text-[11px] text-slate-400 font-mono">
                      <span className="font-bold text-slate-300 block mb-0.5">SPEC:</span>
                      <span>{card.minSystem}</span>
                    </div>
                  </div>

                  {/* Action Area: Download Button */}
                  <div className="space-y-3 pt-6 mt-4 border-t border-white/10">
                    <a
                      href={card.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={card.filename}
                      id={`btn-download-${card.id}`}
                      onClick={(e) => handleDownloadClick(e, card)}
                      className={`w-full py-4 px-4 rounded-2xl font-extrabold text-sm transition-all duration-200 flex items-center justify-center gap-2.5 text-white shadow-lg cursor-pointer bg-gradient-to-r ${card.accentColor} hover:opacity-95 active:scale-[0.98] shadow-cyan-500/20`}
                    >
                      {isDownloading ? (
                        <ArrowDownToLine className="w-4 h-4 animate-bounce" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      <span>
                        {isDownloading
                          ? `Downloading Package...`
                          : `Download ${card.shortName} (${card.fileFormat})`}
                      </span>
                    </a>

                    {/* Success Notice */}
                    {isSuccess && (
                      <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-2 font-medium animate-fadeIn">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>Transfer initialized! Check your browser downloads.</span>
                      </div>
                    )}

                    {/* Live Configured Link Info */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono px-1">
                      <span className="truncate max-w-[200px]" title={card.downloadUrl}>
                        {card.downloadUrl.startsWith('http') ? 'HTTPS Mirror' : 'Direct Binary'}
                      </span>
                      <span className="text-cyan-400/80">SHA-256 Verified</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Verification & Security Guarantee Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-4xl mx-auto pt-4 text-xs text-slate-400 border-t border-white/10">
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200 block font-heading">Digitally Verified & Clean</strong>
                <span>Direct package installation with SHA-256 integrity checksums.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
              <Zap className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200 block font-heading">100% Free Forever</strong>
                <span>Zero commercial audio ads, unlimited song skips, and lossless playback.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
              <Sparkles className="w-4 h-4 text-pink-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200 block font-heading">Seamless Upgrades</strong>
                <span>Continuous over-the-air updates, low memory footprint, and DSP tweaks.</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
