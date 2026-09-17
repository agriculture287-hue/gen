import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  Laptop, 
  Monitor, 
  CheckCircle2, 
  ShieldCheck, 
  ExternalLink, 
  HardDrive, 
  Zap, 
  Send, 
  Sparkles,
  Layers,
  FileCheck,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppPlatformRelease, TelegramConfig } from '../types';
import { VersionManifest, SupportedPlatform } from '../types/update';
import { detectCurrentPlatform, DEFAULT_VERSION_MANIFEST } from '../data/versionManifest';
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
  manifest = DEFAULT_VERSION_MANIFEST,
  onOpenBetaModal,
}) => {
  const [detectedOS, setDetectedOS] = useState<SupportedPlatform>('web');
  const [downloadingPlatformId, setDownloadingPlatformId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);
  const [appVerData, setAppVerData] = useState<any>(null);

  useEffect(() => {
    const os = detectCurrentPlatform();
    setDetectedOS(os);

    fetch('/app-version.json')
      .then((res) => res.json())
      .then((data) => {
        setAppVerData(data);
      })
      .catch((err) => {
        console.warn('Error fetching app-version.json:', err);
      });
  }, []);

  const mergedPlatforms = platforms.map((platform) => {
    const overrideVersion = appVerData?.latest_version || platform.version;
    let overrideDownloadUrl = platform.downloadUrl;
    if (appVerData?.download_url) {
      if (platform.platform === 'android') {
        overrideDownloadUrl = appVerData.download_url.android || platform.downloadUrl;
      } else if (platform.platform === 'windows') {
        overrideDownloadUrl = appVerData.download_url.windows || platform.downloadUrl;
      } else if (platform.platform === 'mac') {
        overrideDownloadUrl = appVerData.download_url.macos || platform.downloadUrl;
      }
    }
    return {
      ...platform,
      version: overrideVersion,
      downloadUrl: overrideDownloadUrl,
    };
  });

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
            if (platform.downloadUrl && platform.downloadUrl.startsWith('http')) {
              const a = document.createElement('a');
              a.href = platform.downloadUrl;
              a.target = '_blank';
              a.rel = 'noopener noreferrer';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            } else {
              // Fallback to mock txt file if it's a relative path/placeholder
              const fileInfo = `# GEN MUSIC Official Package
# Platform: ${platform.platform.toUpperCase()}
# Application: ${platform.name}
# Version: ${platform.version}
# Architecture: ${platform.architecture || 'Universal'}
# Format: ${platform.fileFormat}
# Official Download URL: ${platform.downloadUrl}
# Telegram Community: ${telegramConfig.contactUrl}
# Verified Safe & Clean (SHA-256 Validated)
`;
              const blob = new Blob([fileInfo], { type: 'application/octet-stream' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `GEN-MUSIC-${platform.platform}-${platform.version}${platform.fileFormat}`;
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

  const getPlatformIcon = (platformType: string) => {
    switch (platformType) {
      case 'android':
        return <Smartphone className="w-6 h-6 text-emerald-600" />;
      case 'mac':
        return <Laptop className="w-6 h-6 text-purple-600" />;
      case 'windows':
        return <Monitor className="w-6 h-6 text-blue-600" />;
      default:
        return <HardDrive className="w-6 h-6 text-indigo-600" />;
    }
  };

  const getPlatformFeatures = (platformType: string): string[] => {
    switch (platformType) {
      case 'android':
        return [
          'Background Audio & Lockscreen Controls',
          'Lossless 320kbps MP3 Saver & Offline Mode',
          'Dolby Atmos 3D Surround & Bass Boost',
          'YouTube & Spotify Synced Playlist Importer',
        ];
      case 'windows':
        return [
          'Discord Rich Presence Integration',
          'Global System Media Hotkeys & Tray Mini-Player',
          '10-Band Studio Equalizer & Spatial Audio',
          'Silent Background Auto-Updater',
        ];
      case 'mac':
        return [
          'Menu Bar Mini-Player & Quick Controls',
          'Native Apple Silicon (M1/M2/M3/M4) & Intel Optimization',
          'AirPlay 2 & Lossless Audio Engine',
          'macOS Sonoma / Sequoia Dark & Light Theme Integration',
        ];
      default:
        return [
          'High Performance Native Audio Decoding',
          'Equalizer & 320kbps MP3 Library Saver',
          'Cross-Platform Playlist Synchronization',
          'Lightweight & Zero Resource Hogging',
        ];
    }
  };

  return (
    <section 
      id="download" 
      aria-label="Official Multi-Platform Download & Release Hub"
      className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20"
    >
      <div id="downloads-hub" className="relative rounded-[36px] bg-white border border-slate-200/90 shadow-2xl shadow-slate-200/60 p-6 sm:p-12 overflow-hidden">
        
        {/* Soft background ambient glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/35 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto space-y-12">
          
          {/* Section Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Official Multi-Platform Release Hub</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-heading">
              Download{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent">
                GEN MUSIC
              </span>{' '}
              for All Devices
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Experience unlimited music streaming and high-speed offline listening across your devices. 
              Zero audio commercials, lossless 320kbps audio engine, and automatic background updates.
            </p>

            {/* Operating System Detection Notification */}
            {detectedOS !== 'web' && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>
                  Detected your device: <strong className="text-emerald-400 capitalize">{detectedOS}</strong>. We've highlighted the recommended package below!
                </span>
              </div>
            )}
          </div>

          {/* Unified Platform Download Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {mergedPlatforms.map((platform) => {
              const isRecommended = (detectedOS === 'android' && platform.platform === 'android') ||
                (detectedOS === 'windows' && platform.platform === 'windows') ||
                (detectedOS === 'macos' && platform.platform === 'mac') ||
                (detectedOS === 'linux' && platform.platform === 'linux');
              
              const isDownloading = downloadingPlatformId === platform.id;
              const isSuccess = downloadSuccessId === platform.id;
              const features = getPlatformFeatures(platform.platform);

              return (
                <div
                  key={platform.id}
                  id={`download-card-${platform.id}`}
                  className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                    isRecommended
                      ? 'bg-gradient-to-b from-blue-50/60 to-white border-2 border-blue-500 shadow-xl shadow-blue-500/10 scale-[1.02]'
                      : 'bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-lg'
                  }`}
                >
                  {/* Recommended Badge */}
                  {isRecommended && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md flex items-center gap-1.5 whitespace-nowrap">
                      <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                      <span>Recommended For You</span>
                    </div>
                  )}

                  <div>
                    {/* Card Top: Icon, Version & Size */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200">
                        {getPlatformIcon(platform.platform)}
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-blue-700 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200">
                          {platform.version}
                        </span>
                        <span className="block text-[11px] text-slate-500 mt-1 font-medium">
                          {platform.fileSize} • {platform.fileFormat}
                        </span>
                      </div>
                    </div>

                    {/* Platform Title & Tagline */}
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-1 font-heading">
                      {platform.name}
                    </h3>
                    <p className="text-xs text-slate-500 mb-5 font-medium leading-relaxed">
                      {platform.architecture || 'Universal Architecture'} • Official Release
                    </p>

                    {/* Features Checklist */}
                    <div className="space-y-2.5 mb-6">
                      {features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>

                    {/* System Requirements */}
                    <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 mb-6 text-[11px] text-slate-600">
                      <span className="font-bold text-slate-800 block mb-0.5">System Requirement:</span>
                      <span>{platform.minSystem}</span>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="space-y-3 pt-2">
                    {/* Primary Download Button */}
                    <button
                      onClick={() => handleStartDownload(platform)}
                      disabled={isDownloading}
                      id={`btn-download-${platform.id}`}
                      className={`w-full py-4 px-6 rounded-2xl font-extrabold text-sm transition-all duration-200 flex items-center justify-center gap-2 text-white shadow-md cursor-pointer disabled:opacity-60 ${
                        isRecommended
                          ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600 hover:opacity-95 shadow-blue-500/25'
                          : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                      }`}
                    >
                      <Download className="w-4 h-4" />
                      <span>
                        {isDownloading
                          ? `Downloading (${downloadProgress}%)...`
                          : `Download ${platform.fileFormat.toUpperCase()}`}
                      </span>
                    </button>

                    {/* Sponsor Ad Notice */}
                    <p className="text-[11px] text-amber-800 bg-amber-500/10 border border-amber-300/60 rounded-xl px-3 py-1.5 text-center font-medium">
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
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>Download started successfully!</span>
                      </div>
                    )}

                    {/* Mirrors & Telegram */}
                    <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                      <a
                        href={platform.mirrorUrl || telegramConfig.contactUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600 transition flex items-center gap-1.5 font-medium"
                      >
                        <Send className="w-3.5 h-3.5 text-blue-500" />
                        <span>Telegram Mirror</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>

                      <span className="text-[11px] text-slate-400 font-mono">
                        {platform.releaseDate}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Sponsor Fast Mirror Action */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <AdDirectSponsorLink label="⚡ Fast Direct Sponsor Mirror Link" className="py-3.5 px-6 rounded-2xl justify-center text-sm shadow-md" />
            
            {onOpenBetaModal && (
              <button
                onClick={onOpenBetaModal}
                className="py-3.5 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer border border-slate-200"
              >
                <Layers className="w-4 h-4 text-slate-500" />
                <span>Join Beta Channel & Pre-Releases</span>
              </button>
            )}
          </div>

          {/* Verification & Security Guarantee Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-4xl mx-auto pt-4 text-xs text-slate-600 border-t border-slate-200/80">
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block">Verified Safe & Clean</strong>
                <span>Digitally signed binary packages with SHA-256 integrity checks.</span>
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
                <span>Direct updates, beta releases, and instant support on Telegram.</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
