import React from 'react';
import { 
  Sparkles, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  Smartphone, 
  Monitor, 
  Laptop, 
  X, 
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  HardDrive,
  FileCode2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { UpdateCheckResult, SupportedPlatform } from '../types/update';
import { GenMusicLogo } from './GenMusicLogo';

interface UpdateModalProps {
  isOpen: boolean;
  updateInfo: UpdateCheckResult | null;
  isDownloading: boolean;
  downloadProgress: number;
  onDownload: () => void;
  onDismiss: () => void;
  onInstallAndRestart: () => void;
  detectedPlatform: SupportedPlatform;
  installedVersion: string;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen,
  updateInfo,
  isDownloading,
  downloadProgress,
  onDownload,
  onDismiss,
  onInstallAndRestart,
  detectedPlatform,
  installedVersion,
}) => {
  if (!isOpen || !updateInfo || !updateInfo.hasUpdate) return null;

  const isMandatory = updateInfo.isMandatory;
  const platform = updateInfo.platform || detectedPlatform;

  const getPlatformIcon = () => {
    switch (platform) {
      case 'android':
        return <Smartphone className="w-5 h-5 text-emerald-500" />;
      case 'windows':
        return <Monitor className="w-5 h-5 text-blue-500" />;
      case 'macos':
        return <Laptop className="w-5 h-5 text-indigo-500" />;
      default:
        return <Download className="w-5 h-5 text-blue-500" />;
    }
  };

  const getPlatformLabel = () => {
    switch (platform) {
      case 'android':
        return 'Android APK';
      case 'windows':
        return 'Windows (64-bit EXE)';
      case 'macos':
        return 'macOS (Universal DMG)';
      default:
        return 'Desktop & Mobile';
    }
  };

  return (
    <div 
      id="genmusic-update-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div 
        id="genmusic-update-dialog-card"
        className={`relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border ${
          isMandatory ? 'border-amber-400/80 ring-4 ring-amber-400/10' : 'border-slate-200'
        } overflow-hidden transition-all text-slate-900`}
      >
        {/* Top Header Glow Bar */}
        <div className={`h-2.5 w-full ${
          isMandatory 
            ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500' 
            : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500'
        }`} />

        {/* Dismiss Button (ONLY FOR OPTIONAL UPDATES) */}
        {!isMandatory && (
          <button
            id="btn-update-dismiss-x"
            onClick={onDismiss}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Dismiss Update"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="p-6 sm:p-8">
          
          {/* Header Badge & Title */}
          <div className="flex items-start gap-4 mb-5">
            <div className="flex-shrink-0">
              <GenMusicLogo size="md" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {isMandatory ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    <Lock className="w-3.5 h-3.5" />
                    Mandatory Security Update
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                    <Sparkles className="w-3.5 h-3.5" />
                    New Version Available
                  </span>
                )}

                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  {getPlatformIcon()}
                  {getPlatformLabel()}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                {isMandatory ? 'Action Required: Update Gen Music' : 'Update Available for Gen Music'}
              </h2>
            </div>
          </div>

          {/* Version Comparison Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-5">
            <div className="grid grid-cols-2 gap-3 text-center sm:text-left">
              <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Installed Version</span>
                <span className="text-sm sm:text-base font-bold text-slate-700 font-mono">v{installedVersion}</span>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 p-3 rounded-xl border border-blue-200/80 shadow-xs">
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block mb-0.5">Latest Release</span>
                <span className="text-sm sm:text-base font-black text-blue-700 font-mono">v{updateInfo.latestVersion}</span>
              </div>
            </div>

            {isMandatory && (
              <div className="mt-3 flex items-start gap-2 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl p-3 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Your installed version (<strong className="font-mono">v{installedVersion}</strong>) is below the minimum required version (<strong className="font-mono">v{updateInfo.minimumVersion}</strong>). Please update immediately to continue streaming and downloading music.
                </p>
              </div>
            )}
          </div>

          {/* Release Notes */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>What's New in v{updateInfo.latestVersion}</span>
              {updateInfo.fileSize && (
                <span className="font-normal text-slate-400 lowercase">{updateInfo.fileSize}</span>
              )}
            </h3>

            <div className="max-h-44 overflow-y-auto pr-1 space-y-2 rounded-xl bg-slate-50/70 p-3.5 border border-slate-200/60">
              {updateInfo.releaseNotes && updateInfo.releaseNotes.length > 0 ? (
                updateInfo.releaseNotes.map((note, index) => (
                  <div key={index} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">Bug fixes, Dolby sound virtualizer updates, and performance improvements.</p>
              )}
            </div>
          </div>

          {/* Download Progress Bar (when downloading) */}
          {isDownloading && (
            <div className="mb-6 bg-slate-900 text-white rounded-2xl p-4 shadow-lg animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  Downloading Installer Package...
                </span>
                <span className="font-mono font-bold text-cyan-400">{downloadProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Downloading latest release installer directly from CDN.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            {downloadProgress === 100 ? (
              <button
                id="btn-install-and-restart"
                onClick={onInstallAndRestart}
                className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Install & Restart App</span>
              </button>
            ) : (
              <button
                id="btn-update-now"
                onClick={onDownload}
                disabled={isDownloading}
                className={`w-full py-3.5 px-6 rounded-2xl ${
                  isMandatory 
                    ? 'bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white shadow-lg shadow-amber-600/20' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20'
                } font-bold text-sm transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60`}
              >
                <Download className="w-4 h-4" />
                <span>{isDownloading ? 'Downloading Update...' : 'Update Now'}</span>
              </button>
            )}

            {!isMandatory && (
              <button
                id="btn-update-later"
                onClick={onDismiss}
                disabled={isDownloading}
                className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition cursor-pointer whitespace-nowrap"
              >
                Later
              </button>
            )}
          </div>

          {/* Secondary Direct Mirror Links & Checksum */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Verified & Signed Package
            </span>

            {updateInfo.mirrorUrl && (
              <a
                href={updateInfo.mirrorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-semibold hover:underline flex items-center gap-1"
              >
                <span>Telegram Mirror</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
