import React, { useState } from 'react';
import { Download, Smartphone, Laptop, CheckCircle2, X, Sparkles, Plus, Share2, Info } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showDesktopGuide, setShowDesktopGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || isInstalled) {
    return null;
  }

  return (
    <>
      <div className="w-full p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-blue-900/40 via-cyan-950/40 to-slate-900 border border-cyan-500/30 backdrop-blur-xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-300">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-black font-black text-xl shadow-md shadow-cyan-400/20 flex-shrink-0">
            <Smartphone className="w-6 h-6 text-black" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 uppercase tracking-wider">
                Browser PWA App
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Run On Localhost / Web</span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-white truncate mt-0.5">
              Install GEN MUSIC Web App for Instant 1-Click Access
            </h4>
            <p className="text-xs text-slate-300">
              Enjoy fullscreen ad-free audio streaming, offline cache, and lockscreen media keys directly in your browser.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {isInstallable ? (
            <button
              onClick={install}
              className="px-5 py-2.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-cyan-400/30 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Install Web App</span>
            </button>
          ) : isIOS ? (
            <button
              onClick={() => setShowIOSGuide(true)}
              className="px-4 py-2.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Install on iPhone</span>
            </button>
          ) : (
            <button
              onClick={() => setShowDesktopGuide(true)}
              className="px-4 py-2.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Install App</span>
            </button>
          )}

          <button
            onClick={() => setDismissed(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
            title="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Safari Guided Install Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-[#0d1226] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-cyan-400" />
                Install on iOS Safari
              </h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-2xl bg-white/5 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-cyan-400 text-black font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  1
                </span>
                <p>Tap the <strong>Share</strong> button (box with upward arrow) at the bottom toolbar of Safari.</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-cyan-400 text-black font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  2
                </span>
                <p>Scroll down and select <strong>"Add to Home Screen"</strong>.</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-cyan-400 text-black font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  3
                </span>
                <p>Tap <strong>"Add"</strong> in top right to launch GEN MUSIC in standalone app mode!</p>
              </div>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-cyan-400 text-black font-bold text-xs transition hover:bg-cyan-300 cursor-pointer"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Desktop Chrome/Edge Guided Install Modal */}
      {showDesktopGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-[#0d1226] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Laptop className="w-5 h-5 text-cyan-400" />
                Browser App Install
              </h3>
              <button
                onClick={() => setShowDesktopGuide(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-2xl bg-white/5 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-cyan-400 text-black font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  1
                </span>
                <p>Look for the <strong>Install App icon (⊕ or computer icon)</strong> in your browser address bar (top right).</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-cyan-400 text-black font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  2
                </span>
                <p>Click <strong>"Install GEN MUSIC"</strong> to launch as a standalone desktop desktop window.</p>
              </div>
            </div>
            <button
              onClick={() => setShowDesktopGuide(false)}
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
