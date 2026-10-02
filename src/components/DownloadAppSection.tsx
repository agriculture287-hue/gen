import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  Laptop, 
  Car,
  CheckCircle2, 
  ArrowDownToLine,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppPlatformRelease } from '../types';
import { detectUserDevice, DeviceInfo } from '../utils/deviceDetector';
import { DOWNLOAD_LINKS } from '../data/downloadLinks';
import { handleDownloadWithSponsor } from '../utils/downloadHelper';
import { AdBanner } from './AdBanner';

interface DownloadAppSectionProps {
  platforms: AppPlatformRelease[];
}

export const DownloadAppSection: React.FC<DownloadAppSectionProps> = () => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);
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
        particleCount: 60,
        spread: 55,
        origin: { y: 0.65 },
        colors: ['#38bdf8', '#0284c7', '#f59e0b', '#10b981'],
      });
    } catch {
      // safe fallback
    }
  };

  const downloadPlatforms = [
    {
      id: 'android',
      platform: 'android',
      name: 'Android',
      version: DOWNLOAD_LINKS.version,
      fileFormat: '.apk',
      fileSize: DOWNLOAD_LINKS.android.fileSize,
      downloadUrl: DOWNLOAD_LINKS.android.downloadUrl,
      filename: 'GEN-Music.apk',
      architecture: DOWNLOAD_LINKS.android.architecture,
      minSystem: DOWNLOAD_LINKS.android.minSystem,
      buttonText: 'Download Android APK',
      icon: <Smartphone className="w-6 h-6 text-sky-400" />,
      features: [
        'Dolby 3D binaural spatial engine',
        'Offline MP3 downloads up to 320kbps',
        'Background lockscreen playback',
        'Zero audio ad interruptions',
      ],
      isDetected: deviceInfo.platform === 'android',
    },
    {
      id: 'android-car',
      platform: 'android-car',
      name: 'Android Auto & Car OS',
      version: DOWNLOAD_LINKS.version,
      fileFormat: '.apk',
      fileSize: DOWNLOAD_LINKS.androidCar.fileSize,
      downloadUrl: DOWNLOAD_LINKS.androidCar.downloadUrl,
      filename: 'GEN-Music-Car.apk',
      architecture: DOWNLOAD_LINKS.androidCar.architecture,
      minSystem: DOWNLOAD_LINKS.androidCar.minSystem,
      buttonText: 'Download Android Car APK',
      icon: <Car className="w-6 h-6 text-sky-400" />,
      features: [
        'Widescreen dashboard layout',
        'Hands-free voice telemetry',
        'Zero-latency offline buffer',
        'Steering wheel control mapping',
      ],
      isDetected: false,
    },
    {
      id: 'windows',
      platform: 'windows',
      name: 'Windows Desktop',
      version: DOWNLOAD_LINKS.version,
      fileFormat: '.exe',
      fileSize: DOWNLOAD_LINKS.windows.fileSize,
      downloadUrl: DOWNLOAD_LINKS.windows.downloadUrl,
      filename: 'Gen-Music.exe',
      architecture: DOWNLOAD_LINKS.windows.architecture,
      minSystem: DOWNLOAD_LINKS.windows.minSystem,
      buttonText: 'Download Windows EXE',
      icon: <Monitor className="w-6 h-6 text-sky-400" />,
      features: [
        'WASAPI hardware audio acceleration',
        '10-band equalizer with bass boost',
        'Global media hotkeys & tray mode',
        'Automatic silent updates',
      ],
      isDetected: deviceInfo.platform === 'windows',
    },
    {
      id: 'macos',
      platform: 'macos',
      name: 'macOS Desktop',
      version: DOWNLOAD_LINKS.version,
      fileFormat: '.dmg',
      fileSize: DOWNLOAD_LINKS.macos.fileSize,
      downloadUrl: DOWNLOAD_LINKS.macos.downloadUrl,
      filename: 'Gen-Music.dmg',
      architecture: DOWNLOAD_LINKS.macos.architecture,
      minSystem: DOWNLOAD_LINKS.macos.minSystem,
      buttonText: 'Download macOS DMG',
      icon: <Laptop className="w-6 h-6 text-sky-400" />,
      features: [
        'Apple Silicon M-Series optimization',
        'Menu bar mini-player with shortcuts',
        'AirPlay 2 lossless stream routing',
        'Universal binary for Intel & M-chips',
      ],
      isDetected: deviceInfo.platform === 'macos',
    },
  ];

  const handleDownload = (e: React.MouseEvent, item: typeof downloadPlatforms[0]) => {
    e.preventDefault();
    if (!item.downloadUrl) return;

    setDownloadingId(item.id);
    setDownloadSuccessId(item.id);
    triggerCelebration();

    // Centralized download handler with sponsor link
    handleDownloadWithSponsor(item.downloadUrl, item.filename);

    setTimeout(() => {
      setDownloadingId(null);
    }, 2500);

    setTimeout(() => {
      setDownloadSuccessId(null);
    }, 6000);
  };

  return (
    <section 
      id="download" 
      aria-label="Official Multi-Platform App Download & Release Hub"
      className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-16"
    >
      <div className="space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
            Official Client Deployments
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Select your operating system for verified, direct package downloads.
          </p>
        </div>

        {/* Reserved space leaderboard ad banner */}
        <div className="w-full">
          <AdBanner format="leaderboard" />
        </div>

        {/* Equal-sized Platform Download Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
          {downloadPlatforms.map((item) => {
            const isDownloading = downloadingId === item.id;
            const isSuccess = downloadSuccessId === item.id;

            return (
              <div
                key={item.id}
                id={`download-card-${item.id}`}
                className={`surface-card p-6 flex flex-col justify-between relative ${
                  item.isDetected 
                    ? 'border-sky-500/60 ring-1 ring-sky-500/30' 
                    : 'border-white/10'
                }`}
              >
                <div>
                  {/* Top Bar with Icon & Specs */}
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>

                    <div className="text-right text-xs font-mono text-slate-400">
                      <span className="block text-white font-semibold">{item.fileSize}</span>
                      <span className="text-[10px] text-slate-500">Official</span>
                    </div>
                  </div>

                  {/* Title & Format */}
                  <div className="space-y-1 mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white font-heading">
                        {item.name}
                      </h3>
                      {item.isDetected && (
                        <span className="text-[10px] font-semibold text-sky-400 bg-sky-950/60 border border-sky-500/30 px-2 py-0.5 rounded-full">
                          Your OS
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                      {item.fileFormat} · {item.architecture}
                    </p>
                  </div>

                  {/* Specs Box */}
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-white/5 mb-5 text-xs text-slate-400 font-mono space-y-1">
                    <div className="text-slate-500 uppercase text-[10px] tracking-wider font-semibold">Requirement</div>
                    <div className="text-slate-300 leading-snug">{item.minSystem}</div>
                  </div>

                  {/* Feature Bullets */}
                  <ul className="space-y-2 mb-6">
                    {item.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <Check className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom CTA Button */}
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <a
                    href={item.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={item.filename}
                    onClick={(e) => handleDownload(e, item)}
                    id={`btn-download-${item.id}`}
                    className="w-full py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer transform active:scale-98"
                  >
                    {isDownloading ? (
                      <ArrowDownToLine className="w-4 h-4 animate-bounce" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span>{isDownloading ? 'Downloading...' : item.buttonText}</span>
                  </a>

                  {/* Download confirmation notice */}
                  {isSuccess && (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Download initiated</span>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
