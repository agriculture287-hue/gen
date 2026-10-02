import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Sparkles, Bell, Shield, ArrowRight, Zap } from 'lucide-react';

interface MonetagAdOverlaySimulatorProps {
  showVignette: boolean;
  onCloseVignette: () => void;
  showInPagePush: boolean;
  onCloseInPagePush: () => void;
  showStickyBanner: boolean;
  onCloseStickyBanner: () => void;
  popunderToastMessage: string | null;
  onClearPopunderToast: () => void;
}

export const MonetagAdOverlaySimulator: React.FC<MonetagAdOverlaySimulatorProps> = ({
  showVignette,
  onCloseVignette,
  showInPagePush,
  onCloseInPagePush,
  showStickyBanner,
  onCloseStickyBanner,
  popunderToastMessage,
  onClearPopunderToast,
}) => {
  // Vignette countdown skip timer
  const [skipSeconds, setSkipSeconds] = useState<number>(3);
  const [canSkip, setCanSkip] = useState<boolean>(false);

  useEffect(() => {
    if (showVignette) {
      setSkipSeconds(3);
      setCanSkip(false);
      const timer = setInterval(() => {
        setSkipSeconds((prev) => {
          if (prev <= 1) {
            setCanSkip(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showVignette]);

  return (
    <>
      {/* 1. MONETAG VIGNETTE / INTERSTITIAL FULL-SCREEN OVERLAY SIMULATOR */}
      {showVignette && (
        <div className="fixed inset-0 z-[10000] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-between p-4 sm:p-8 animate-fadeIn">
          {/* Top Header Bar with Skip Button */}
          <div className="w-full max-w-4xl flex items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Monetag Vignette Ad
              </span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                Simulated Zone #8593021
              </span>
            </div>

            <div>
              {canSkip ? (
                <button
                  onClick={onCloseVignette}
                  className="px-4 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs flex items-center gap-2 hover:bg-cyan-300 transition cursor-pointer shadow-lg animate-pulse"
                >
                  <span>Skip Ad & Continue</span>
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <div className="px-4 py-2 rounded-xl bg-white/10 text-slate-300 font-mono text-xs border border-white/10">
                  Skip in {skipSeconds}s...
                </div>
              )}
            </div>
          </div>

          {/* Vignette Ad Creative Body */}
          <div className="w-full max-w-lg my-auto bg-gradient-to-br from-indigo-900/40 via-slate-900 to-purple-900/40 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <span className="text-[10px] font-mono text-slate-500 uppercase">Sponsored</span>
            </div>

            <div className="w-20 h-20 mx-auto rounded-3xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-4xl shadow-xl">
              ⚡
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                ★ Exclusive Advertiser Deal
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Ultra-Fast 320kbps Music & Game Accelerator
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Stream unlimited audio without buffering and bypass ISP bandwidth limits with 1-click cloud optimization.
              </p>
            </div>

            <div className="pt-2">
              <a
                href="https://monetag.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={onCloseVignette}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl hover:scale-105 transition transform cursor-pointer"
              >
                <span>Visit Sponsor Offer</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="text-center text-[11px] text-slate-500 font-mono">
            This is a live interactive preview of Monetag’s Vignette / Interstitial ad format.
          </div>
        </div>
      )}

      {/* 2. MONETAG IN-PAGE PUSH (IPP) FLOATING CORNER NOTIFICATION SIMULATOR */}
      {showInPagePush && (
        <div className="fixed bottom-6 right-6 z-[9999] max-w-sm w-full bg-slate-900/95 border border-purple-500/50 rounded-2xl p-4 shadow-2xl backdrop-blur-md text-white animate-bounce-short">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-xl shrink-0">
                🔔
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    In-Page Push
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Monetag IPP</span>
                </div>
                <h4 className="text-xs font-bold text-white mt-0.5">
                  New High-Speed Audio Engine Update Available
                </h4>
              </div>
            </div>

            <button
              onClick={onCloseInPagePush}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-slate-300 mt-2 leading-tight">
            Boost song stream speeds and enable 3D spatial surround sound instantly.
          </p>

          <div className="mt-3 flex items-center gap-2">
            <a
              href="https://monetag.com"
              target="_blank"
              rel="noopener noreferrer"
              onClick={onCloseInPagePush}
              className="px-3 py-1.5 rounded-lg bg-purple-500 text-white font-bold text-xs flex items-center gap-1 hover:bg-purple-400 transition cursor-pointer"
            >
              <span>View Special Offer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onCloseInPagePush}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* 3. MONETAG STICKY BOTTOM LEADERBOARD ANCHOR BANNER SIMULATOR */}
      {showStickyBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-[9990] bg-[#070914]/95 border-t border-pink-500/40 p-2 sm:p-3 backdrop-blur-lg shadow-2xl flex items-center justify-between gap-4 max-w-5xl mx-auto rounded-t-2xl">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-pink-500/20 border border-pink-400/30 flex items-center justify-center text-lg shrink-0">
              🏷️
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  Monetag Sticky Banner (728x90)
                </span>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">Zone #8593021</span>
              </div>
              <p className="text-xs font-bold text-white truncate mt-0.5">
                Pro Sound Equalizer & Studio Lossless DAC — Save 40% Today
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="https://monetag.com"
              target="_blank"
              rel="noopener noreferrer"
              onClick={onCloseStickyBanner}
              className="px-3 py-1.5 rounded-lg bg-pink-500 text-white font-bold text-xs hover:bg-pink-400 transition cursor-pointer"
            >
              Claim Coupon
            </a>
            <button
              onClick={onCloseStickyBanner}
              className="p-1.5 rounded-lg bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 4. MONETAG ON-CLICK / POPUNDER TOAST NOTIFICATION */}
      {popunderToastMessage && (
        <div className="fixed top-20 right-6 z-[9999] max-w-sm bg-cyan-950/90 border border-cyan-400/50 rounded-xl p-3 shadow-2xl backdrop-blur-md text-white flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-xs text-cyan-200 font-mono">{popunderToastMessage}</span>
          </div>
          <button
            onClick={onClearPopunderToast}
            className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </>
  );
};
