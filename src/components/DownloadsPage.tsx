import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  Laptop, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  ExternalLink, 
  FileCode2, 
  Send,
  Zap,
  Car,
  ArrowDownToLine
} from 'lucide-react';
import { detectUserDevice, DeviceInfo } from '../utils/deviceDetector';
import { DOWNLOAD_LINKS } from '../data/downloadLinks';
import { triggerSamePageDownload, triggerDownloadCelebration, openFirstTimeSponsorLink } from '../utils/downloadHelper';

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

  const handleDownload = (_e: React.MouseEvent, downloadUrl: string, filename: string, id: string) => {
    if (!downloadUrl) return;

    setDownloadingId(id);
    setDownloadSuccessId(id);
    triggerDownloadCelebration();
    
    // Open first-time sponsor link in new tab across with the GitHub app download link
    openFirstTimeSponsorLink();

    setTimeout(() => {
      setDownloadingId(null);
    }, 2500);
  };

  const platformsList = [
    {
      id: 'android',
      name: 'Android App',
      tagline: 'Direct APK Package for Phones & Tablets',
      fileFormat: '.apk',
      downloadUrl: DOWNLOAD_LINKS.android.downloadUrl,
      fileSize: DOWNLOAD_LINKS.android.fileSize,
      sysReq: DOWNLOAD_LINKS.android.minSystem,
      arch: DOWNLOAD_LINKS.android.architecture,
      icon: <Smartphone className="w-8 h-8 text-emerald-600" />,
      features: ['Background Audio Playback', 'Lossless 320kbps MP3 Saver', 'Dolby Surround Sound', 'Unlimited Free Music Sync'],
      isRecommended: deviceInfo.platform === 'android',
    },
    {
      id: 'windows',
      name: 'Windows Desktop',
      tagline: 'Standard 64-bit Installer with Auto-Updates',
      fileFormat: '.exe',
      downloadUrl: DOWNLOAD_LINKS.windows.downloadUrl,
      fileSize: DOWNLOAD_LINKS.windows.fileSize,
      sysReq: DOWNLOAD_LINKS.windows.minSystem,
      arch: DOWNLOAD_LINKS.windows.architecture,
      icon: <Monitor className="w-8 h-8 text-blue-600" />,
      features: ['Discord Rich Presence', 'System Media Key Hotkeys', '10-Band EQ & Bass Virtualizer', 'Silent Auto-Updates'],
      isRecommended: deviceInfo.platform === 'windows',
    },
    {
      id: 'macos',
      name: 'macOS Desktop',
      tagline: 'Universal DMG for Apple Silicon & Intel Macs',
      fileFormat: '.dmg',
      downloadUrl: DOWNLOAD_LINKS.macos.downloadUrl,
      fileSize: DOWNLOAD_LINKS.macos.fileSize,
      sysReq: DOWNLOAD_LINKS.macos.minSystem,
      arch: DOWNLOAD_LINKS.macos.architecture,
      icon: <Laptop className="w-8 h-8 text-indigo-600" />,
      features: ['Menu Bar Mini Player', 'Native Apple Silicon Decoding', 'AirPlay & Spatial Audio', 'Auto-Updater Integration'],
      isRecommended: deviceInfo.platform === 'macos',
    },
    {
      id: 'android-car',
      name: 'Android Auto / Car OS',
      tagline: 'Compatible APK for Android Smart Dashboards',
      fileFormat: '.apk',
      downloadUrl: DOWNLOAD_LINKS.androidCar.downloadUrl,
      fileSize: DOWNLOAD_LINKS.androidCar.fileSize,
      sysReq: 'Android Auto Core / Android Automotive OS 8.0+',
      arch: 'ARM64 & ARMv7 Universal',
      icon: <Car className="w-8 h-8 text-cyan-400" />,
      features: ['Large Touch Interface', 'Hands-Free Voice Search', 'Continuous Offline Buffer', 'Steering Controls Compatibility'],
      isRecommended: false,
    },
  ];

  return (
    <section id="downloads-hub-section" className="py-16 sm:py-24 bg-slate-900 text-slate-100 relative overflow-hidden">
      {/* Background Decorative Neon Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-900/60 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Official Release Hub
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Download <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400">GEN MUSIC</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Free, unlimited music streaming and offline audio player for all your devices. Zero audio ads, lossless 320kbps audio engine, and automatic background updates.
          </p>

          <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-800/90 border border-slate-700 text-xs font-semibold text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              Detected Device: <strong className="text-white capitalize">{deviceInfo.platformName}</strong>. 
              We've automatically suggested and highlighted the {deviceInfo.recommendedFileFormat} package below.
            </span>
          </div>
        </div>

        {/* Platform Download Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {platformsList.map((p) => (
            <div
              key={p.id}
              id={`download-card-${p.id}`}
              className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                p.isRecommended
                  ? 'bg-gradient-to-b from-slate-800 to-slate-800/90 border-2 border-blue-500 shadow-2xl shadow-blue-500/10 scale-102 sm:scale-103'
                  : 'bg-slate-800/60 border border-slate-700/80 hover:border-slate-600 hover:bg-slate-800'
              }`}
            >
              {p.isRecommended && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md">
                  ★ Recommended For You
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="p-3.5 rounded-2xl bg-slate-700/60 border border-slate-600/50">
                    {p.icon}
                  </div>
                  <div className="text-right">
                    <span className="block text-xs font-bold text-slate-300">{p.fileSize}</span>
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-1">
                  {p.name}
                </h2>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  {p.tagline}
                </p>

                <div className="space-y-2.5 mb-6">
                  {p.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-900/70 rounded-xl p-3 border border-slate-700/50 mb-6 text-[11px] text-slate-400">
                  <span className="font-bold text-slate-300 block mb-0.5">System Requirement:</span>
                  <span>{p.sysReq}</span>
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href={p.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={p.id === 'android' ? 'GEN-Music.apk' : p.id === 'car' ? 'GEN-Music-Car.apk' : p.id === 'windows' ? 'Gen-Music.exe' : 'Gen-Music.dmg'}
                  onClick={(e) => handleDownload(e, p.downloadUrl, p.id === 'android' ? 'GEN-Music.apk' : p.id === 'car' ? 'GEN-Music-Car.apk' : p.id === 'windows' ? 'Gen-Music.exe' : 'Gen-Music.dmg', p.id)}
                  id={`btn-download-${p.id}`}
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 text-white shadow-lg cursor-pointer ${
                    p.isRecommended
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-600/30'
                      : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
                  }`}
                >
                  {downloadingId === p.id ? (
                    <ArrowDownToLine className="w-4 h-4 animate-bounce" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>
                    {downloadingId === p.id ? 'Downloading...' : `Download ${p.fileFormat.toUpperCase()}`}
                  </span>
                </a>

                {downloadSuccessId === p.id && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-2 font-medium animate-fadeIn">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>Download started! Check your browser downloads.</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
