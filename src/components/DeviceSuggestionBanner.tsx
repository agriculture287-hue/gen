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
    if (isAndroid) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (isWindows) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (isMac) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div 
      id="device-suggestion-banner"
      className="w-full max-w-2xl bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-4.5 border border-slate-200/90 shadow-lg shadow-slate-200/50 transition-all hover:border-slate-300 animate-fadeIn"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Left Info */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 shrink-0">
            {getPlatformIcon()}
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>Detected Device:</span>
                <strong className="text-slate-900 font-extrabold">{deviceInfo.platformName}</strong>
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${getBadgeColors()}`}>
                ★ Recommended
              </span>
            </div>

            <p className="text-xs text-slate-600">
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
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {deviceInfo.recommendedFileFormat}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onViewAllPlatforms}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View All Downloads</span>
            </button>
          )}

          <button
            type="button"
            onClick={onViewAllPlatforms}
            className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 font-bold text-xs transition cursor-pointer"
            title="Choose different operating system"
          >
            All Platforms
          </button>
        </div>

      </div>
    </div>
  );
};
