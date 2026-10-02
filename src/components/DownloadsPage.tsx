import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  Laptop, 
  CheckCircle2, 
  Car,
  ArrowDownToLine,
  Check,
  ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { detectUserDevice, DeviceInfo } from '../utils/deviceDetector';
import { DOWNLOAD_LINKS } from '../data/downloadLinks';
import { handleDownloadWithSponsor } from '../utils/downloadHelper';
import { AdBanner } from './AdBanner';

export const DownloadsPage: React.FC = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    platform: 'android',
    recommendedFileFormat: '.apk',
    platformName: 'Android',
    isMobile: true,
    rawOS: 'Android',
  });
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);

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

  const handleDownload = (e: React.MouseEvent, downloadUrl: string, filename: string, id: string) => {
    e.preventDefault();
    if (!downloadUrl) return;

    setDownloadingId(id);
    setDownloadSuccessId(id);
    triggerCelebration();

    // Centralized download handler with sponsor link
    handleDownloadWithSponsor(downloadUrl, filename);

    setTimeout(() => {
      setDownloadingId(null);
    }, 2500);

    setTimeout(() => {
      setDownloadSuccessId(null);
    }, 6000);
  };

  const platformsList = [
    {
      id: 'android',
      name: 'Android APK',
      version: DOWNLOAD_LINKS.version,
      fileFormat: '.apk',
      downloadUrl: DOWNLOAD_LINKS.android.downloadUrl,
      filename: 'GEN-Music.apk',
      fileSize: DOWNLOAD_LINKS.android.fileSize,
      sysReq: DOWNLOAD_LINKS.android.minSystem,
      arch: DOWNLOAD_LINKS.android.architecture,
      buttonText: 'Download Android APK',
      icon: <Smartphone className="w-6 h-6 text-sky-400" />,
      features: [
        'Dolby 3D binaural spatial engine',
        'Offline MP3 downloads up to 320kbps',
        'Background lockscreen playback',
        'Zero audio ad interruptions',
      ],
      isRecommended: deviceInfo.platform === 'android',
    },
    {
      id: 'android-car',
      name: 'Android Auto & Car OS',
      version: DOWNLOAD_LINKS.version,
      fileFormat: '.apk',
      downloadUrl: DOWNLOAD_LINKS.androidCar.downloadUrl,
      filename: 'GEN-Music-Car.apk',
      fileSize: DOWNLOAD_LINKS.androidCar.fileSize,
      sysReq: DOWNLOAD_LINKS.androidCar.minSystem,
      arch: DOWNLOAD_LINKS.androidCar.architecture,
      buttonText: 'Download Android Car APK',
      icon: <Car className="w-6 h-6 text-sky-400" />,
      features: [
        'Widescreen dashboard layout',
        'Hands-free voice telemetry',
        'Zero-latency offline buffer',
        'Steering wheel control mapping',
      ],
      isRecommended: false,
    },
    {
      id: 'windows',
      name: 'Windows Desktop',
      version: DOWNLOAD_LINKS.version,
      fileFormat: '.exe',
      downloadUrl: DOWNLOAD_LINKS.windows.downloadUrl,
      filename: 'Gen-Music.exe',
      fileSize: DOWNLOAD_LINKS.windows.fileSize,
      sysReq: DOWNLOAD_LINKS.windows.minSystem,
      arch: DOWNLOAD_LINKS.windows.architecture,
      buttonText: 'Download Windows EXE',
      icon: <Monitor className="w-6 h-6 text-sky-400" />,
      features: [
        'WASAPI hardware audio acceleration',
        '10-band equalizer with bass boost',
        'Global media hotkeys & tray mode',
        'Automatic silent updates',
      ],
      isRecommended: deviceInfo.platform === 'windows',
    },
    {
      id: 'macos',
      name: 'macOS Desktop',
      version: DOWNLOAD_LINKS.version,
      fileFormat: '.dmg',
      downloadUrl: DOWNLOAD_LINKS.macos.downloadUrl,
      filename: 'Gen-Music.dmg',
      fileSize: DOWNLOAD_LINKS.macos.fileSize,
      sysReq: DOWNLOAD_LINKS.macos.minSystem,
      arch: DOWNLOAD_LINKS.macos.architecture,
      buttonText: 'Download macOS DMG',
      icon: <Laptop className="w-6 h-6 text-sky-400" />,
      features: [
        'Apple Silicon M-Series optimization',
        'Menu bar mini-player with shortcuts',
        'AirPlay 2 lossless stream routing',
        'Universal binary for Intel & M-chips',
      ],
      isRecommended: deviceInfo.platform === 'macos',
    },
  ];

  return (
    <section id="downloads-hub-section" className="py-12 sm:py-20 bg-[#0b0e14] text-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Navigation back to landing */}
        <div>
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to overview</span>
          </a>
        </div>

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-heading">
            Download GEN MUSIC
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Free, unlimited music streaming and offline audio player for all your devices. Zero audio ads, lossless 320kbps audio engine, and automatic background updates.
          </p>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-mono pt-1">
            <span>Detected OS: <strong className="text-white capitalize">{deviceInfo.platformName}</strong></span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Recommended: <strong className="text-sky-400">{deviceInfo.recommendedFileFormat}</strong></span>
          </div>
        </div>

        {/* Active Leaderboard Ad Banner */}
        <div className="w-full">
          <AdBanner format="leaderboard" />
        </div>

        {/* Platform Download Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
          {platformsList.map((p) => {
            const isDownloading = downloadingId === p.id;
            const isSuccess = downloadSuccessId === p.id;

            return (
              <div
                key={p.id}
                id={`download-card-${p.id}`}
                className={`surface-card p-6 flex flex-col justify-between relative ${
                  p.isRecommended
                    ? 'border-sky-500/60 ring-1 ring-sky-500/30'
                    : 'border-white/10'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center shrink-0">
                      {p.icon}
                    </div>

                    <div className="text-right text-xs font-mono text-slate-400">
                      <span className="block text-white font-semibold">{p.fileSize}</span>
                      <span className="text-[10px] text-slate-500">Official</span>
                    </div>
                  </div>

                  <div className="space-y-1 mb-4">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white font-heading">
                        {p.name}
                      </h2>
                      {p.isRecommended && (
                        <span className="text-[10px] font-semibold text-sky-400 bg-sky-950/60 border border-sky-500/30 px-2 py-0.5 rounded-full">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                      {p.fileFormat} · {p.arch}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/60 border border-white/5 mb-5 text-xs text-slate-400 font-mono space-y-1">
                    <div className="text-slate-500 uppercase text-[10px] tracking-wider font-semibold">Requirement</div>
                    <div className="text-slate-300 leading-snug">{p.sysReq}</div>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {p.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <Check className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-2">
                  <a
                    href={p.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={p.filename}
                    onClick={(e) => handleDownload(e, p.downloadUrl, p.filename, p.id)}
                    id={`btn-download-${p.id}`}
                    className="w-full py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer transform active:scale-98"
                  >
                    {isDownloading ? (
                      <ArrowDownToLine className="w-4 h-4 animate-bounce" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span>{isDownloading ? 'Downloading...' : p.buttonText}</span>
                  </a>

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
