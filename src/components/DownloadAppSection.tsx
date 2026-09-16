import React, { useState } from 'react';
import { 
  Download, 
  Smartphone, 
  Laptop, 
  Monitor, 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle, 
  ExternalLink, 
  HardDrive, 
  Calendar, 
  Layers, 
  Zap, 
  Send, 
  Edit3,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppPlatformRelease, TelegramConfig } from '../types';
import { GenMusicLogo } from './GenMusicLogo';
import { AdDirectSponsorLink } from './AdBanners';

interface DownloadAppSectionProps {
  platforms: AppPlatformRelease[];
  telegramConfig: TelegramConfig;
  isAdminLoggedIn?: boolean;
  onOpenAdmin?: () => void;
  onOpenBetaModal: () => void;
}

export const DownloadAppSection: React.FC<DownloadAppSectionProps> = ({
  platforms,
  telegramConfig,
  onOpenBetaModal,
}) => {
  const [selectedPlatformId, setSelectedPlatformId] = useState<string>(
    platforms[0]?.id || 'app-android'
  );
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Active selected platform
  const currentPlatform = platforms.find((p) => p.id === selectedPlatformId) || platforms[0];

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

  const handleStartDownload = () => {
    if (!currentPlatform) return;
    setDownloading(true);
    setDownloadProgress(15);
    setDownloadSuccess(false);

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            // Initiate file download
            const fileInfo = `# GEN MUSIC ${currentPlatform.name}
# Platform: ${currentPlatform.platform}
# Version: ${currentPlatform.version}
# Architecture: ${currentPlatform.architecture || 'Universal'}
# Format: ${currentPlatform.fileFormat}
# Official Download URL: ${currentPlatform.downloadUrl}
# Telegram Community: ${telegramConfig.contactUrl}
`;
            const blob = new Blob([fileInfo], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `GEN-MUSIC-${currentPlatform.platform}-${currentPlatform.version}${currentPlatform.fileFormat}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setDownloading(false);
            setDownloadProgress(100);
            setDownloadSuccess(true);
            triggerCelebration();

            // Also open actual link if valid external link
            if (currentPlatform.downloadUrl.startsWith('http')) {
              window.open(currentPlatform.downloadUrl, '_blank');
            }
          }, 400);
          return 95;
        }
        return prev + 25;
      });
    }, 180);
  };

  const getPlatformIcon = (platformType: string) => {
    switch (platformType) {
      case 'android':
        return <Smartphone className="w-5 h-5" />;
      case 'mac':
        return <Laptop className="w-5 h-5" />;
      case 'windows':
        return <Monitor className="w-5 h-5" />;
      default:
        return <HardDrive className="w-5 h-5" />;
    }
  };

  return (
    <section 
      id="download" 
      aria-label="Download GEN MUSIC Apps"
      className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      {/* Container with modern clean light styling */}
      <div className="relative rounded-[36px] bg-white border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-12 overflow-hidden">
        
        {/* Soft atmospheric gradient glow on white */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-8 text-center">
          
          {/* Official App Logo */}
          <div className="flex flex-col items-center justify-center">
            <GenMusicLogo size="xl" glow={true} alt="GEN MUSIC Official Logo" />
          </div>

          {/* Section Header */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>Multi-Platform Available Now</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-heading">
              Download{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent">
                GEN MUSIC
              </span>
            </h2>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
              Get the official app for <strong>Android</strong>, <strong>macOS</strong>, and <strong>Windows</strong>. Enjoy free offline music, studio equalizer, and Dolby 3D sound.
            </p>
          </div>

          {/* Platform Switcher Buttons: Android, Mac, Windows, + Added */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-1.5 bg-slate-100 rounded-2xl max-w-xl mx-auto border border-slate-200">
            {platforms.map((platform) => {
              const isSelected = selectedPlatformId === platform.id;
              return (
                <button
                  key={platform.id}
                  onClick={() => {
                    setSelectedPlatformId(platform.id);
                    setDownloadSuccess(false);
                  }}
                  className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-white text-blue-700 shadow-md border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <span className={isSelected ? 'text-blue-600' : 'text-slate-400'}>
                    {getPlatformIcon(platform.platform)}
                  </span>
                  <span className="capitalize">{platform.platform}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                    isSelected ? 'bg-blue-50 text-blue-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {platform.version}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Platform Information Card */}
          {currentPlatform && (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-50/80 border border-slate-200/80 text-left space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-blue-600 flex items-center justify-center shadow-sm">
                    {getPlatformIcon(currentPlatform.platform)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                        {currentPlatform.name}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-100 text-blue-700 border border-blue-200">
                        {currentPlatform.version}
                      </span>
                      {currentPlatform.badge && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                          {currentPlatform.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      {currentPlatform.minSystem}
                    </p>
                  </div>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Version
                  </span>
                  <span className="font-bold text-slate-900 text-sm sm:text-base font-mono">
                    {currentPlatform.version}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    File Size
                  </span>
                  <span className="font-bold text-slate-900 text-sm sm:text-base font-mono">
                    {currentPlatform.fileSize}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Architecture
                  </span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm truncate block">
                    {currentPlatform.architecture || 'Universal'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Release
                  </span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm block">
                    {currentPlatform.releaseDate}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Main Download + Mirror Telegram */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <button
                  onClick={handleStartDownload}
                  disabled={downloading}
                  className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600 text-white font-extrabold text-base shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:opacity-95 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <Download className="w-5 h-5" />
                  <span>
                    {downloading
                      ? `Downloading (${downloadProgress}%)...`
                      : `Download ${currentPlatform.name} (${currentPlatform.version})`}
                  </span>
                </button>

                <a
                  href={currentPlatform.mirrorUrl || telegramConfig.contactUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto py-4 px-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 font-bold text-sm shadow-sm hover:shadow transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-blue-600" />
                  <span>Telegram Mirror Link</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>

                <AdDirectSponsorLink label="Fast Direct Sponsor Mirror" className="py-4 px-6 rounded-2xl justify-center text-sm" />
              </div>

              {/* Progress Bar during simulated/active download */}
              {downloading && (
                <div className="space-y-1.5">
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-200"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 text-right block">
                    Preparing package {downloadProgress}%
                  </span>
                </div>
              )}

              {/* Success Notification */}
              {downloadSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>
                      Download started! Check your downloads folder for <strong>GEN-MUSIC-{currentPlatform.version}{currentPlatform.fileFormat}</strong>.
                    </span>
                  </div>
                  <a
                    href={telegramConfig.contactUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-emerald-700 underline flex-shrink-0"
                  >
                    Need Help? Telegram
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Simple Install & Safety Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-3xl mx-auto pt-2 text-xs text-slate-600">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>Virus-free clean build with signed binary packages.</span>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <Zap className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>100% Free Forever with zero audio commercials.</span>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <Send className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
              <span>Direct Telegram channel updates and instant mirrors.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
