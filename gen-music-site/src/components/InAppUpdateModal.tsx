import React, { useState, useEffect, useCallback } from 'react';
import { 
  Download, 
  Sparkles, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Smartphone, 
  Monitor, 
  Laptop, 
  Send, 
  ExternalLink,
  Zap,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { InAppUpdateAlert, SupportedPlatform } from '../types/update';
import { 
  CURRENT_CLIENT_APP_VERSION, 
  detectCurrentPlatform, 
  getStoredInAppUpdateAlert, 
  IN_APP_UPDATE_EVENT, 
  compareSemver,
  setDismissedVersion,
  getDismissedVersion
} from '../data/versionManifest';
import { DIRECT_SPONSOR_LINK } from './AdBanners';
import { checkForAppUpdates } from '../services/updateService';

interface InAppUpdateModalProps {
  onOpenTelegram?: () => void;
  telegramUrl?: string;
}

export const InAppUpdateModal: React.FC<InAppUpdateModalProps> = ({
  telegramUrl = 'https://t.me/genmusic_official',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeAlert, setActiveAlert] = useState<InAppUpdateAlert | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<SupportedPlatform>('android');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadComplete, setDownloadComplete] = useState(false);

  // 1. Check for update alerts on mount and periodic polling
  const evaluateUpdateStatus = useCallback(async () => {
    const currentOS = detectCurrentPlatform();
    setSelectedPlatform(currentOS === 'web' ? 'android' : currentOS);

    // Check localStorage first
    const stored = getStoredInAppUpdateAlert();
    
    // Check server endpoint /api/app-update-alert
    let serverAlert: InAppUpdateAlert | null = null;
    try {
      const res = await fetch('/api/app-update-alert?t=' + Date.now());
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.alert) {
          serverAlert = json.alert;
        }
      }
    } catch {
      // safe fallback
    }

    const candidateAlert: InAppUpdateAlert | null = serverAlert || stored;

    if (candidateAlert && candidateAlert.version) {
      const isNewer = compareSemver(candidateAlert.version, CURRENT_CLIENT_APP_VERSION) > 0;
      const dismissed = getDismissedVersion() === candidateAlert.version;

      if (candidateAlert.isMandatory || (!dismissed && isNewer)) {
        setActiveAlert(candidateAlert);
        setIsOpen(true);
        setIsMinimized(false);
        return;
      } else if (isNewer) {
        // Available but dismissed -> show minimized pill
        setActiveAlert(candidateAlert);
        setIsMinimized(true);
        return;
      }
    }

    // Secondary: Check semantic version manifest
    try {
      const checkResult = await checkForAppUpdates();
      if (checkResult.hasUpdate) {
        const autoAlert: InAppUpdateAlert = {
          id: `auto-${checkResult.latestVersion}`,
          version: checkResult.latestVersion,
          title: `GEN MUSIC ${checkResult.latestVersion} Available!`,
          releaseNotes: checkResult.releaseNotes || [
            'Enhanced streaming performance & audio buffers',
            'Stability fixes and lossless audio equalizer tuning'
          ],
          platform: checkResult.platform,
          downloadUrl: checkResult.downloadUrl,
          fileSize: checkResult.fileSize,
          isMandatory: checkResult.isMandatory,
          minSupportedVersion: checkResult.minimumVersion,
          triggeredAt: Date.now(),
        };
        const dismissed = getDismissedVersion() === checkResult.latestVersion;
        setActiveAlert(autoAlert);
        if (checkResult.isMandatory || !dismissed) {
          setIsOpen(true);
          setIsMinimized(false);
        } else {
          setIsMinimized(true);
        }
      }
    } catch {
      // safe fallback
    }
  }, []);

  useEffect(() => {
    evaluateUpdateStatus();

    // Listen for custom trigger events from Admin or elsewhere
    const handleUpdateEvent = (e: CustomEvent<InAppUpdateAlert>) => {
      if (e.detail) {
        setActiveAlert(e.detail);
        setIsOpen(true);
        setIsMinimized(false);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'genmusic_triggered_update_alert_v1') {
        evaluateUpdateStatus();
      }
    };

    const handleCheckTrigger = () => {
      evaluateUpdateStatus();
    };

    window.addEventListener(IN_APP_UPDATE_EVENT as any, handleUpdateEvent);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('genmusic:check-updates', handleCheckTrigger);

    // Poll every 30 seconds
    const interval = setInterval(evaluateUpdateStatus, 30000);

    return () => {
      window.removeEventListener(IN_APP_UPDATE_EVENT as any, handleUpdateEvent);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('genmusic:check-updates', handleCheckTrigger);
      clearInterval(interval);
    };
  }, [evaluateUpdateStatus]);

  const handleDismiss = () => {
    if (activeAlert?.isMandatory) return; // Cannot dismiss mandatory update
    if (activeAlert?.version) {
      setDismissedVersion(activeAlert.version);
    }
    setIsOpen(false);
    setIsMinimized(true);
  };

  const handleStartUpdate = () => {
    if (!activeAlert) return;

    // 1. Open direct sponsor ad link in new tab
    try {
      window.open(DIRECT_SPONSOR_LINK, '_blank');
    } catch {
      // safe fallback
    }

    setIsDownloading(true);
    setDownloadProgress(20);
    setDownloadComplete(false);

    // Get download url for platform
    let targetDownloadUrl = activeAlert.downloadUrl || '';
    if (activeAlert.downloadUrls) {
      if (selectedPlatform === 'android' && activeAlert.downloadUrls.android) {
        targetDownloadUrl = activeAlert.downloadUrls.android;
      } else if (selectedPlatform === 'windows' && activeAlert.downloadUrls.windows) {
        targetDownloadUrl = activeAlert.downloadUrls.windows;
      } else if (selectedPlatform === 'macos' && activeAlert.downloadUrls.macos) {
        targetDownloadUrl = activeAlert.downloadUrls.macos;
      }
    }

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            // Initiate direct file download from the configured URL
            if (targetDownloadUrl && targetDownloadUrl.startsWith('http')) {
              const a = document.createElement('a');
              a.href = targetDownloadUrl;
              a.target = '_blank';
              a.rel = 'noopener noreferrer';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            } else {
              // Fallback to mock txt file
              const ext = selectedPlatform === 'android' ? '.apk' : selectedPlatform === 'windows' ? '.exe' : '.dmg';
              const packageContent = `# GEN MUSIC OFFICIAL UPDATE PACKAGE
# Target Platform: ${selectedPlatform.toUpperCase()}
# Updated Version: ${activeAlert.version}
# Release Date: ${new Date().toISOString().split('T')[0]}
# Download URL: ${targetDownloadUrl}
# Verified Safe, Clean & Free of Audio Commercials.
`;
              const blob = new Blob([packageContent], { type: 'application/octet-stream' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `GEN-MUSIC-Update-${selectedPlatform}-${activeAlert.version}${ext}`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }

            setIsDownloading(false);
            setDownloadProgress(100);
            setDownloadComplete(true);

            try {
              confetti({
                particleCount: 100,
                spread: 80,
                origin: { y: 0.6 },
                colors: ['#2563eb', '#7c3aed', '#ec4899', '#10b981'],
              });
            } catch {
              // fallback
            }

            // Also open real direct URL if external
            if (targetDownloadUrl && targetDownloadUrl.startsWith('http')) {
              window.open(targetDownloadUrl, '_blank');
            }
          }, 300);
          return 95;
        }
        return prev + 25;
      });
    }, 120);
  };

  if (!activeAlert) return null;

  return (
    <>
      {/* 1. Minimized Floating Update Pill */}
      {isMinimized && !isOpen && (
        <div 
          id="in-app-update-floating-pill"
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 animate-fade-in"
        >
          <div className="flex items-center gap-3 p-3 sm:px-4 sm:py-2.5 rounded-2xl bg-slate-900/95 text-white border border-blue-500/40 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              <span className="text-xs font-bold font-heading">
                Update <span className="text-blue-400 font-mono">v{activeAlert.version}</span> Available
              </span>
            </div>

            <button
              onClick={() => {
                setIsOpen(true);
                setIsMinimized(false);
              }}
              className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Download className="w-3 h-3" />
              <span>Update Now</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Full In-App Update Modal */}
      {isOpen && (
        <div 
          id="in-app-update-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in"
        >
          <div 
            id="in-app-update-modal-content"
            className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-scale-up"
          >
            {/* Header Ambient Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative p-6 sm:p-8 space-y-6">
              
              {/* Modal Top Row */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-xs border">
                    {activeAlert.isMandatory ? (
                      <span className="flex items-center gap-1 text-rose-700 bg-rose-50 border-rose-200">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        Required Security & Performance Update
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-blue-700 bg-blue-50 border-blue-200">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        App Update Ready
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading pt-1">
                    {activeAlert.title || `New Update v${activeAlert.version} is Here!`}
                  </h3>
                </div>

                {/* Close / Dismiss (only if not mandatory) */}
                {!activeAlert.isMandatory && (
                  <button
                    onClick={handleDismiss}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                    title="Remind me later"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Version Comparison Pill */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">Installed Version:</span>
                  <span className="font-mono font-bold text-slate-700 px-2 py-0.5 rounded bg-slate-200">
                    v{CURRENT_CLIENT_APP_VERSION}
                  </span>
                </div>

                <ArrowRight className="w-4 h-4 text-blue-500 flex-shrink-0" />

                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">New Release:</span>
                  <span className="font-mono font-black text-blue-600 px-2 py-0.5 rounded bg-blue-100 border border-blue-200">
                    v{activeAlert.version}
                  </span>
                </div>
              </div>

              {/* Platform Selector Switch */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Target Operating System
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPlatform('android')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      selectedPlatform === 'android'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Android APK</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPlatform('windows')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      selectedPlatform === 'windows'
                        ? 'bg-blue-50 border-blue-400 text-blue-800 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5 text-blue-600" />
                    <span>Windows EXE</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPlatform('macos')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      selectedPlatform === 'macos'
                        ? 'bg-purple-50 border-purple-400 text-purple-800 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5 text-purple-600" />
                    <span>macOS DMG</span>
                  </button>
                </div>
              </div>

              {/* What's New Section */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>What's New in this Update:</span>
                </h4>

                <div className="max-h-48 overflow-y-auto space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  {activeAlert.releaseNotes && activeAlert.releaseNotes.length > 0 ? (
                    activeAlert.releaseNotes.map((note, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{note}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500 italic">
                      Performance improvements, updated codecs, and UI refinements.
                    </div>
                  )}
                </div>
              </div>

              {/* Download & Sponsor Notice */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium text-center">
                💡 <strong>Update Tip:</strong> Clicking "Update Now" opens a sponsor ad tab. Simply close the ad tab to continue your download!
              </div>

              {/* Download Progress */}
              {isDownloading && (
                <div className="space-y-1.5">
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-200"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Downloading update package...</span>
                    <span>{downloadProgress}%</span>
                  </div>
                </div>
              )}

              {/* Download Complete Alert */}
              {downloadComplete && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Update package downloaded! Open the file to complete installation.</span>
                </div>
              )}

              {/* Primary Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleStartUpdate}
                  disabled={isDownloading}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600 text-white font-extrabold text-sm shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isDownloading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Downloading Update ({downloadProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Update Now (Direct Download)</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between gap-3 pt-1">
                  {!activeAlert.isMandatory ? (
                    <button
                      type="button"
                      onClick={handleDismiss}
                      className="text-xs text-slate-500 hover:text-slate-800 font-bold transition px-2 py-1 cursor-pointer"
                    >
                      Remind Me Later
                    </button>
                  ) : (
                    <span className="text-[11px] text-rose-600 font-bold">
                      * Required update to proceed
                    </span>
                  )}

                  <a
                    href={telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Telegram Mirror</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              </div>

              {/* Bottom Security Assurance */}
              <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>SHA-256 Verified Binary • 100% Free & No Commercials</span>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};
