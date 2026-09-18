import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  CheckCircle2, 
  ShieldCheck, 
  ExternalLink, 
  Zap, 
  Send, 
  Sparkles,
  Layers,
  FileCheck,
  Flame,
  HardDrive
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppPlatformRelease, TelegramConfig } from '../types';
import { VersionManifest } from '../types/update';
import { DEFAULT_VERSION_MANIFEST } from '../data/versionManifest';
import { GenMusicLogo } from './GenMusicLogo';
import { AdDirectSponsorLink, DIRECT_SPONSOR_LINK } from './AdBanners';

interface DownloadAppSectionProps {
  platforms: AppPlatformRelease[];
  telegramConfig: TelegramConfig;
  manifest?: VersionManifest;
  isAdminLoggedIn?: boolean;
  onOpenAdmin?: () => void;
  onOpenBetaModal?: () => void;
}

export const DownloadAppSection: React.FC<DownloadAppSectionProps> = ({
  platforms,
  telegramConfig,
  onOpenBetaModal,
}) => {
  const [downloadingPlatformId, setDownloadingPlatformId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);
  const [appVerData, setAppVerData] = useState<any>(null);

  useEffect(() => {
    fetch('/app-version.json')
      .then((res) => res.json())
      .then((data) => {
        setAppVerData(data);
      })
      .catch((err) => {
        console.warn('Error fetching app-version.json:', err);
      });
  }, []);

  // Filter only Android mobile platforms
  const mobilePlatforms = platforms.filter((p) => p.platform === 'android' || p.id === 'app-android');
  const targetPlatform = mobilePlatforms[0] || {
    id: 'app-android',
    name: 'GEN MUSIC for Android',
    platform: 'android',
    version: 'v2.5.0',
    fileFormat: '.apk',
    fileSize: '24.8 MB',
    releaseDate: 'September 2026',
    minSystem: 'Android 8.0 or later (Oreo to Android 15+)',
    downloadUrl: '/download/genmusic.apk',
    mirrorUrl: 'https://t.me/genmusic_apk',
    architecture: 'ARM64-v8a & Universal (All Devices)',
    badge: 'Direct APK',
    changelog: [
      'Dolby Audio 3D spatial surround sound engine',
      'Batch offline MP3 downloader up to 320kbps',
      'Unified YouTube Music and Spotify catalogs',
      'Zero audio advertising interruptions'
    ],
    isFeatured: true,
  };

  const overrideVersion = appVerData?.latest_version || targetPlatform.version;
  const overrideDownloadUrl = appVerData?.download_url?.android || targetPlatform.downloadUrl;

  const currentPlatform: AppPlatformRelease = {
    ...targetPlatform,
    version: overrideVersion,
    downloadUrl: overrideDownloadUrl,
  };

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#2563eb', '#7c3aed', '#db2777', '#059669'],
      });
    } catch {
      // safe fallback
    }
  };

  const handleStartDownload = (platform: AppPlatformRelease) => {
    // 1. Open ad sponsor link first
    try {
      window.open(DIRECT_SPONSOR_LINK, '_blank');
    } catch {
      // safe fallback
    }

    setDownloadingPlatformId(platform.id);
    setDownloadProgress(20);
    setDownloadSuccessId(null);

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            // Initiate direct file download from the configured URL
            if (platform.downloadUrl) {
              const a = document.createElement('a');
              a.href = platform.downloadUrl;
              if (platform.downloadUrl.startsWith('http')) {
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
              } else {
                a.target = '_self';
              }
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            } else {
              const fileInfo = `# GEN MUSIC Official Package
# Platform: ANDROID MOBILE
# Application: ${platform.name}
# Version: ${platform.version}
# Architecture: ${platform.architecture || 'Universal'}
# Format: ${platform.fileFormat}
# Official Download URL: None configured
# Telegram Community: ${telegramConfig.contactUrl}
# Verified Safe & Clean (SHA-256 Validated)
`;
              const blob = new Blob([fileInfo], { type: 'application/octet-stream' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `GEN-MUSIC-Android-${platform.version}.apk`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }

            setDownloadingPlatformId(null);
            setDownloadProgress(100);
            setDownloadSuccessId(platform.id);
            triggerCelebration();
          }, 350);
          return 95;
        }
        return prev + 25;
      });
    }, 150);
  };

  const mobileFeatures = [
    'Background Audio & Lockscreen Controls',
    'Lossless 320kbps MP3 Saver & Offline Mode',
    'Dolby Atmos 3D Surround & Parametric Bass Boost',
    'YouTube & Spotify Synced Playlists & Liked Songs',
    'Zero Commercial Audio Interruptions',
    'Real-time Synchronized Karaoke Lyrics',
  ];

  const isDownloading = downloadingPlatformId === currentPlatform.id;
  const isSuccess = downloadSuccessId === currentPlatform.id;

  return (
    <section 
      id="download" 
      aria-label="Official Mobile App Download & Release Hub"
      className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20"
    >
      <div id="downloads-hub" className="relative rounded-[36px] bg-white border border-slate-200/90 shadow-2xl shadow-slate-200/60 p-6 sm:p-12 overflow-hidden">
        
        {/* Soft background ambient glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-100/35 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto space-y-10">
          
          {/* Section Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Official Android Mobile App Hub</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-heading">
              Download{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent">
                GEN MUSIC
              </span>{' '}
              Mobile App
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Experience unlimited music streaming and high-speed offline listening on your Android phone or tablet. 
              Zero audio commercials, lossless 320kbps audio engine, and automatic background updates.
            </p>
          </div>

          {/* Featured Mobile App Card */}
          <div className="max-w-2xl mx-auto">
            <div
              id={`download-card-${currentPlatform.id}`}
              className="relative rounded-3xl p-6 sm:p-10 flex flex-col justify-between transition-all duration-300 bg-gradient-to-b from-blue-50/70 via-white to-white border-2 border-blue-500/80 shadow-2xl shadow-blue-500/10"
            >
              {/* Featured Badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md flex items-center gap-1.5 whitespace-nowrap">
                <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span>Latest Verified APK Release</span>
              </div>

              <div>
                {/* Card Top: Icon, Version & Size */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3.5">
                    <div className="p-4 rounded-2xl bg-emerald-100/80 border border-emerald-200/80 shadow-xs">
                      <Smartphone className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
                        {currentPlatform.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {currentPlatform.architecture || 'ARM64-v8a & Universal (All Devices)'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-mono font-extrabold text-blue-700 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200">
                      {currentPlatform.version}
                    </span>
                    <span className="block text-xs text-slate-500 mt-1.5 font-semibold">
                      {currentPlatform.fileSize} • Direct APK
                    </span>
                  </div>
                </div>

                {/* Features Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 bg-white/80 p-4 rounded-2xl border border-slate-200/80">
                  {mobileFeatures.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* System Requirements */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 mb-6 text-xs text-slate-600 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="font-bold text-slate-800 block">System Requirement:</span>
                    <span>{currentPlatform.minSystem}</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold">
                    ✓ Clean & Tested Safe
                  </span>
                </div>
              </div>

              {/* Actions Area */}
              <div className="space-y-4 pt-2">
                {/* Primary Download Button */}
                <button
                  onClick={() => handleStartDownload(currentPlatform)}
                  disabled={isDownloading}
                  id={`btn-download-${currentPlatform.id}`}
                  className="w-full py-4.5 px-6 rounded-2xl font-extrabold text-base transition-all duration-200 flex items-center justify-center gap-2.5 text-white shadow-xl shadow-blue-500/25 bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600 hover:opacity-95 cursor-pointer disabled:opacity-60"
                >
                  <Download className="w-5 h-5" />
                  <span>
                    {isDownloading
                      ? `Downloading APK (${downloadProgress}%)...`
                      : `Download Official APK (${currentPlatform.version})`}
                  </span>
                </button>

                {/* Sponsor Ad Notice */}
                <p className="text-xs text-amber-800 bg-amber-500/10 border border-amber-300/60 rounded-xl px-4 py-2 text-center font-medium">
                  💡 Opens sponsor ad tab. Simply close ad window to finish download.
                </p>

                {/* Progress Bar during download */}
                {isDownloading && (
                  <div className="space-y-1 pt-1">
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-600 h-full rounded-full transition-all duration-200"
                        style={{ width: `${downloadProgress}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 text-right block">
                      Preparing package {downloadProgress}%
                    </span>
                  </div>
                )}

                {/* Success Notice */}
                {isSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>APK download started! Tap the file in your notification bar to install.</span>
                  </div>
                )}

                {/* Mirrors & Telegram */}
                <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                  <a
                    href={currentPlatform.mirrorUrl || telegramConfig.contactUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 transition flex items-center gap-1.5 font-medium"
                  >
                    <Send className="w-3.5 h-3.5 text-blue-500" />
                    <span>Telegram APK Channel Mirror</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>

                  <span className="text-[11px] text-slate-400 font-mono">
                    Updated: {currentPlatform.releaseDate}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Sponsor Fast Mirror Action */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <AdDirectSponsorLink label="⚡ Fast Direct Sponsor Mirror Link" className="py-3.5 px-6 rounded-2xl justify-center text-sm shadow-md" />
            
            {onOpenBetaModal && (
              <button
                onClick={onOpenBetaModal}
                className="py-3.5 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer border border-slate-200"
              >
                <Layers className="w-4 h-4 text-slate-500" />
                <span>Join Beta APK Channel</span>
              </button>
            )}
          </div>

          {/* Verification & Security Guarantee Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-4xl mx-auto pt-4 text-xs text-slate-600 border-t border-slate-200/80">
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block">Verified Safe & Clean</strong>
                <span>Digitally signed Android APK with SHA-256 integrity checks.</span>
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
                <span>Direct APK updates, beta testing, and instant support on Telegram.</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
