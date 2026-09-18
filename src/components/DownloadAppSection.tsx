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
  ArrowDownToLine
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppPlatformRelease, TelegramConfig } from '../types';
import { VersionManifest } from '../types/update';
import { DEFAULT_VERSION_MANIFEST } from '../data/versionManifest';
import { AdDirectSponsorLink } from './AdBanners';
import { detectUserDevice, DeviceInfo } from '../utils/deviceDetector';

interface DownloadAppSectionProps {
  platforms: AppPlatformRelease[];
  telegramConfig: TelegramConfig;
  manifest?: VersionManifest;
  isAdminLoggedIn?: boolean;
  onOpenAdmin?: () => void;
  onOpenBetaModal?: () => void;
}

export const DownloadAppSection: React.FC<DownloadAppSectionProps> = ({
  platforms: initialPlatforms,
  telegramConfig,
  manifest = DEFAULT_VERSION_MANIFEST,
  onOpenBetaModal,
}) => {
  const [downloadingPlatformId, setDownloadingPlatformId] = useState<string | null>(null);
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);
  const [appVerData, setAppVerData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'android' | 'windows' | 'macos'>('all');
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

  const fetchVersionData = () => {
    fetch('/app-version.json?t=' + Date.now())
      .then((res) => res.json())
      .then((data) => {
        setAppVerData(data);
      })
      .catch((err) => {
        console.warn('Notice: Could not load app-version.json:', err);
      });
  };

  useEffect(() => {
    fetchVersionData();

    // Listen for live updates broadcast by admin panel
    const handleStorageChange = () => fetchVersionData();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('genmusic-version-updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('genmusic-version-updated', handleStorageChange);
    };
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

  // Build the 3 standard release platforms with live admin download URLs
  const androidPlatform = initialPlatforms.find((p) => p.platform === 'android');
  const windowsPlatform = initialPlatforms.find((p) => p.platform === 'windows');
  const macPlatform = initialPlatforms.find((p) => p.platform === 'mac' || p.platform === 'macos');

  const liveVersion = appVerData?.latest_version || manifest.android.latestVersion || 'v2.5.0';

  const downloadCards = [
    {
      id: 'android',
      platform: 'android',
      name: 'GEN MUSIC for Android',
      shortName: 'Android',
      tagline: 'Direct APK Package for Phones, Tablets & Android TV',
      fileFormat: '.apk',
      version: liveVersion,
      fileSize: manifest.android.fileSize || androidPlatform?.fileSize || '24.8 MB',
      downloadUrl: appVerData?.download_url?.android || androidPlatform?.downloadUrl || manifest.android.downloadUrl || '/download/genmusic.apk',
      filename: `GEN-Music-${liveVersion}.apk`,
      minSystem: 'Android 8.0 Oreo or later (Android 8 - 15+)',
      architecture: 'ARM64-v8a & Universal (All Devices)',
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
      mirrorUrl: 'https://t.me/genmusic_apk',
    },
    {
      id: 'windows',
      platform: 'windows',
      name: 'GEN MUSIC for Windows',
      shortName: 'Windows',
      tagline: 'Standard 64-bit Installer with Auto-Update Support',
      fileFormat: '.exe',
      version: liveVersion,
      fileSize: manifest.windows.fileSize || windowsPlatform?.fileSize || '56.2 MB',
      downloadUrl: appVerData?.download_url?.windows || windowsPlatform?.downloadUrl || manifest.windows.downloadUrl || '/download/genmusic-setup.exe',
      filename: `GEN-Music-Setup-${liveVersion}.exe`,
      minSystem: 'Windows 10 / Windows 11 (64-bit)',
      architecture: 'x64 & ARM64 Architecture',
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
      mirrorUrl: 'https://t.me/genmusic_apk',
    },
    {
      id: 'macos',
      platform: 'macos',
      name: 'GEN MUSIC for macOS',
      shortName: 'macOS',
      tagline: 'Universal DMG for Apple Silicon (M1/M2/M3/M4) & Intel Macs',
      fileFormat: '.dmg',
      version: liveVersion,
      fileSize: manifest.macos.fileSize || macPlatform?.fileSize || '68.4 MB',
      downloadUrl: appVerData?.download_url?.macos || macPlatform?.downloadUrl || manifest.macos.downloadUrl || '/download/genmusic.dmg',
      filename: `GEN-Music-${liveVersion}.dmg`,
      minSystem: 'macOS 12.0 Monterey or later (Sonoma & Sequoia Ready)',
      architecture: 'Universal (Apple Silicon + Intel x86_64)',
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
      mirrorUrl: 'https://t.me/genmusic_official',
    },
  ];

  const handleDownloadClick = (e: React.MouseEvent, card: typeof downloadCards[0]) => {
    const targetUrl = card.downloadUrl;
    if (!targetUrl) {
      e.preventDefault();
      return;
    }

    setDownloadingPlatformId(card.id);
    setDownloadSuccessId(card.id);
    triggerCelebration();

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
      <div id="downloads-hub" className="relative rounded-[36px] bg-white border border-slate-200/90 shadow-2xl shadow-slate-200/60 p-6 sm:p-12 overflow-hidden">
        
        {/* Soft background ambient glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-100/35 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto space-y-10">
          
          {/* Section Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Official Download Center</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-heading">
              Download{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent">
                GEN MUSIC
              </span>
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Choose your platform below. Every download button connects directly to the latest official release package. 
              Zero audio commercials, lossless 320kbps audio engine, and automatic updates.
            </p>

            {/* Platform Filter Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                All Platforms (3)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('android')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'android'
                    ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/40'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android (.apk)</span>
                {deviceInfo.platform === 'android' && (
                  <span className="ml-1 text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-700 text-white font-black uppercase">Your Device</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('windows')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'windows'
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/40'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Windows (.exe)</span>
                {deviceInfo.platform === 'windows' && (
                  <span className="ml-1 text-[9px] px-1.5 py-0.2 rounded-full bg-blue-700 text-white font-black uppercase">Your Device</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('macos')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'macos'
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/40'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>macOS (.dmg)</span>
                {deviceInfo.platform === 'macos' && (
                  <span className="ml-1 text-[9px] px-1.5 py-0.2 rounded-full bg-indigo-700 text-white font-black uppercase">Your Device</span>
                )}
              </button>
            </div>
          </div>

          {/* Three Platform Download Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
                  className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 bg-gradient-to-b ${card.bgGradient} border-2 ${
                    isDeviceMatch ? 'border-emerald-500 ring-4 ring-emerald-500/20 shadow-2xl scale-[1.02]' : `${card.borderColor} shadow-xl hover:shadow-2xl`
                  } hover:-translate-y-1`}
                >
                  {/* Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                        <Flame className="w-3 h-3 text-amber-300 fill-amber-300" />
                        <span>{card.badge}</span>
                      </span>

                      {isDeviceMatch && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs animate-pulse">
                          <Sparkles className="w-3 h-3 text-amber-200" />
                          <span>Suggested For You</span>
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-mono font-extrabold text-slate-800 px-2.5 py-1 rounded-lg bg-white/90 border border-slate-200 shadow-xs">
                      {card.version}
                    </span>
                  </div>

                  {/* Card Main Info */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3.5">
                      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                        {card.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight font-heading">
                          {card.name}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          {card.fileSize} • {card.fileFormat} format
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {card.tagline}
                    </p>

                    {/* Features Checklist */}
                    <div className="space-y-2 bg-white/90 p-3.5 rounded-2xl border border-slate-200/80">
                      {card.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-700 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>

                    {/* System Requirement */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 text-[11px] text-slate-600">
                      <span className="font-bold text-slate-800 block mb-0.5">Requirement:</span>
                      <span>{card.minSystem}</span>
                    </div>
                  </div>

                  {/* Action Area: Download Button */}
                  <div className="space-y-3 pt-6 mt-4 border-t border-slate-200/60">
                    <a
                      href={card.downloadUrl}
                      target={card.downloadUrl.startsWith('http') ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                      download={card.downloadUrl.startsWith('http') ? undefined : card.filename}
                      id={`btn-download-${card.id}`}
                      onClick={(e) => handleDownloadClick(e, card)}
                      className={`w-full py-4 px-4 rounded-2xl font-extrabold text-sm transition-all duration-200 flex items-center justify-center gap-2.5 text-white shadow-lg cursor-pointer bg-gradient-to-r ${card.accentColor} hover:opacity-95 active:scale-[0.98]`}
                    >
                      {isDownloading ? (
                        <ArrowDownToLine className="w-4 h-4 animate-bounce" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      <span>
                        {isDownloading
                          ? `Starting Download...`
                          : `Download ${card.shortName} (${card.fileFormat})`}
                      </span>
                    </a>

                    {/* Success Notice */}
                    {isSuccess && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2 font-medium animate-fadeIn">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>Download started! Check your downloads folder.</span>
                      </div>
                    )}

                    {/* Live Configured Link Info */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-1">
                      <span className="truncate max-w-[200px]" title={card.downloadUrl}>
                        {card.downloadUrl.startsWith('http') ? 'External link' : 'Local mirror'}
                      </span>
                      <a
                        href={card.mirrorUrl || telegramConfig.contactUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-sans font-semibold"
                      >
                        <Send className="w-3 h-3 text-blue-500" />
                        <span>Telegram Mirror</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Optional Fast Sponsor Mirror Action */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <AdDirectSponsorLink label="⚡ Fast Direct Sponsor Mirror Link" className="py-3.5 px-6 rounded-2xl justify-center text-sm shadow-md" />
            
            {onOpenBetaModal && (
              <button
                type="button"
                onClick={onOpenBetaModal}
                className="py-3.5 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer border border-slate-200"
              >
                <Layers className="w-4 h-4 text-slate-500" />
                <span>Join Beta Channel</span>
              </button>
            )}
          </div>

          {/* Verification & Security Guarantee Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-4xl mx-auto pt-4 text-xs text-slate-600 border-t border-slate-200/80">
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block">Digitally Verified & Clean</strong>
                <span>Direct package installation with SHA-256 integrity checksums.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
              <Zap className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block">100% Free Forever</strong>
                <span>Zero audio commercials, unlimited song skips, and lossless playback.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
              <Send className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block">Official Community</strong>
                <span>Direct APK releases, beta updates, and support on Telegram.</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
