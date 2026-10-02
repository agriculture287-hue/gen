import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Laptop, Sparkles, X, Share2, CheckCircle2, ArrowRight, Zap } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface OnlineInstallPromptProps {
  currentPath?: string;
  isStreamingMode?: boolean;
}

export const OnlineInstallPrompt: React.FC<OnlineInstallPromptProps> = ({
  currentPath = '/online',
  isStreamingMode = true,
}) => {
  const { isInstallable, isInstalled, isStandalone, isIOS, install } = usePWAInstall();
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showDesktopModal, setShowDesktopModal] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // If running in standalone mode (already installed), do not show prompt
    if (isStandalone || isInstalled) {
      setShowPrompt(false);
      return;
    }

    // Check localStorage if user dismissed recently (e.g. within 2 hours)
    const lastDismissed = localStorage.getItem('genmusic_online_pwa_dismissed');
    if (lastDismissed) {
      const dismissedTime = parseInt(lastDismissed, 10);
      if (Date.now() - dismissedTime < 2 * 60 * 60 * 1000) {
        setIsMinimized(true);
        setShowPrompt(true);
        return;
      }
    }

    // Gentle 1.5 second dwell timer when user enters /online to ask them to install
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, [isStandalone, isInstalled, currentPath]);

  const handleDismiss = () => {
    setIsMinimized(true);
    localStorage.setItem('genmusic_online_pwa_dismissed', Date.now().toString());
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstalledSuccess(true);
        setTimeout(() => setShowPrompt(false), 3000);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      setShowDesktopModal(true);
    }
  };

  if (isStandalone || isInstalled) {
    return null;
  }

  if (!showPrompt) {
    return null;
  }

  return (
    <>
      {/* 1. Minimized Floating Install Pill (when minimized or floating in /online) */}
      {isMinimized ? (
        <div className="fixed bottom-24 left-6 z-40 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <button
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#090d1e]/95 border border-cyan-400/40 text-cyan-300 text-xs font-bold shadow-xl shadow-cyan-500/10 hover:bg-cyan-500/20 hover:scale-105 transition cursor-pointer backdrop-blur-xl group"
            title="Install GEN MUSIC Web App"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <Download className="w-3.5 h-3.5 text-cyan-400 group-hover:animate-bounce" />
            <span>Install /online App</span>
          </button>
        </div>
      ) : (
        /* 2. Full Floating Bottom-Left / Center Ask to Install Card */
        <div className="fixed bottom-24 sm:bottom-28 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-40 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="rounded-3xl bg-gradient-to-br from-[#0c1228]/98 via-[#090e1f]/95 to-[#131b38]/98 border border-cyan-400/40 p-4 sm:p-5 shadow-2xl shadow-cyan-950/60 backdrop-blur-2xl text-white relative overflow-hidden">
            
            {/* Background Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-cyan-400/20 flex-shrink-0">
                  <Smartphone className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 uppercase tracking-wider">
                      Browser App Install
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      /online Streaming
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-0.5">
                    Install GEN MUSIC Web App
                  </h4>
                </div>
              </div>

              <button
                onClick={handleDismiss}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer flex-shrink-0"
                title="Minimize install prompt"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mt-2.5 leading-relaxed relative z-10">
              Install this browser player directly on your home screen or desktop for fullscreen 320kbps audio, offline cache, and lockscreen controls.
            </p>

            {/* Action Buttons */}
            <div className="mt-3.5 flex items-center gap-2 pt-2 border-t border-white/10 relative z-10">
              {installedSuccess ? (
                <div className="w-full py-2 px-3 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Installed successfully! Launching app...</span>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleInstallClick}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Download className="w-4 h-4" />
                    <span>
                      {isIOS ? 'Install on iPhone / iPad' : 'Install Browser App'}
                    </span>
                  </button>

                  <button
                    onClick={handleDismiss}
                    className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 text-xs font-medium transition cursor-pointer"
                  >
                    Later
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* iOS Safari Step-by-Step Install Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-[#0d1226] border border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-cyan-400" />
                Install on iOS Safari
              </h3>
              <button
                onClick={() => setShowIOSModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-2xl bg-white/5 flex items-start gap-3 border border-white/5">
                <span className="w-6 h-6 rounded-full bg-cyan-400 text-black font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  1
                </span>
                <p>Tap the <strong>Share</strong> button (box with arrow <Share2 className="w-3.5 h-3.5 inline mx-1 text-cyan-300" />) in the Safari toolbar.</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 flex items-start gap-3 border border-white/5">
                <span className="w-6 h-6 rounded-full bg-cyan-400 text-black font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  2
                </span>
                <p>Scroll down the share menu and select <strong>"Add to Home Screen"</strong>.</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 flex items-start gap-3 border border-white/5">
                <span className="w-6 h-6 rounded-full bg-cyan-400 text-black font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  3
                </span>
                <p>Tap <strong>"Add"</strong> in the top-right corner to launch GEN MUSIC in full standalone mode!</p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-cyan-400 text-black font-bold text-xs transition hover:bg-cyan-300 cursor-pointer"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Desktop Chrome / Edge Install Helper Modal */}
      {showDesktopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-[#0d1226] border border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Laptop className="w-5 h-5 text-cyan-400" />
                Browser App Install
              </h3>
              <button
                onClick={() => setShowDesktopModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-2xl bg-white/5 flex items-start gap-3 border border-white/5">
                <span className="w-6 h-6 rounded-full bg-cyan-400 text-black font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  1
                </span>
                <p>Look for the <strong>Install App icon (⊕ or computer icon)</strong> in your browser address bar (top right).</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 flex items-start gap-3 border border-white/5">
                <span className="w-6 h-6 rounded-full bg-cyan-400 text-black font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  2
                </span>
                <p>Click <strong>"Install GEN MUSIC"</strong> to launch as a standalone desktop window with no browser tabs.</p>
              </div>
            </div>

            <button
              onClick={() => setShowDesktopModal(false)}
              className="w-full py-2.5 rounded-xl bg-cyan-400 text-black font-bold text-xs transition hover:bg-cyan-300 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
