import React from 'react';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  Laptop, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink,
  Apple
} from 'lucide-react';
import { DeviceInfo } from '../utils/deviceDetector';

interface DeviceSuggestionBannerProps {
  deviceInfo: DeviceInfo;
  downloadUrl?: string;
  fileSize?: string;
  onDownload: () => void;
  onViewAllPlatforms: () => void;
}

export const DeviceSuggestionBanner: React.FC<DeviceSuggestionBannerProps> = ({
  deviceInfo,
  downloadUrl,
  fileSize = '24.8 MB',
  onDownload,
  onViewAllPlatforms,
}) => {
  const isAndroid = deviceInfo.platform === 'android';
  const isWindows = deviceInfo.platform === 'windows';
  const isMac = deviceInfo.platform === 'macos';
  const isIOS = deviceInfo.platform === 'ios';

  const getPlatformIcon = () => {
    if (isAndroid) return <Smartphone className="w-5 h-5 text-emerald-600" />;
    if (isWindows) return <Monitor className="w-5 h-5 text-blue-600" />;
    if (isMac) return <Laptop className="w-5 h-5 text-indigo-600" />;
    if (isIOS) return <Apple className="w-5 h-5 text-slate-700" />;
    return <Smartphone className="w-5 h-5 text-blue-600" />;
  };

  const getBadgeColors = () => {
    if (isAndroid) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    if (isWindows) return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    if (isMac) return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <div 
      id="device-suggestion-banner"
      className="w-full max-w-2xl bg-[#0e1220]/80 backdrop-blur-xl rounded-2xl p-4 sm:p-4.5 border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all hover:border-cyan-500/40 animate-fadeIn"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Left Info */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 shrink-0">
            {getPlatformIcon()}
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <span>Detected Device:</span>
                <strong className="text-white font-extrabold">{deviceInfo.platformName}</strong>
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${getBadgeColors()}`}>
                ★ Recommended
              </span>
            </div>

            <p className="text-xs text-slate-400 font-mono text-left">
              {isAndroid && `Direct Android APK Package (${fileSize || '24.8 MB'}) • Universal build`}
              {isWindows && `Windows 64-bit Installer (.exe) (${fileSize || '56.2 MB'}) • Windows 10/11`}
              {isMac && `macOS Universal Disk Image (.dmg) (${fileSize || '68.4 MB'}) • Apple Silicon & Intel`}
              {isIOS && `Web Player active. Android APK & Desktop versions available.`}
              {!isAndroid && !isWindows && !isMac && !isIOS && `Direct high-speed package available.`}
            </p>
          </div>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-2.5 shrink-0 self-stretch sm:self-auto">
          {!isIOS && downloadUrl ? (
            <button
              type="button"
              id="btn-device-direct-download"
              onClick={onDownload}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs shadow-md shadow-cyan-500/20 hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {deviceInfo.recommendedFileFormat}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onViewAllPlatforms}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer border border-white/10"
            >
              <span>View All Downloads</span>
            </button>
          )}

          <button
            type="button"
            onClick={onViewAllPlatforms}
            className="px-3 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white font-bold text-xs transition cursor-pointer border border-white/10"
            title="Choose different operating system"
          >
            All Platforms
          </button>
        </div>

      </div>
    </div>
  );
};
