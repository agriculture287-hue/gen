import React from 'react';
import { 
  X, 
  ShieldCheck, 
  Zap, 
  FastForward, 
  VolumeX, 
  Check, 
  Radio, 
  Sparkles, 
  Layers, 
  Info,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { useMusicPlayer } from '../../context/MusicPlayerContext';

export const EchoAdBlockModal: React.FC = () => {
  const { 
    isAdBlockModalOpen, 
    setIsAdBlockModalOpen,
    adBlockState,
    toggleAdBlock,
    toggleSponsorBlock,
    setSponsorBlockCategory
  } = useMusicPlayer();

  if (!isAdBlockModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-[#0a1020] border border-emerald-500/30 rounded-3xl p-6 shadow-2xl shadow-emerald-500/10 max-h-[90vh] overflow-y-auto space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-black flex items-center justify-center shadow-lg shadow-emerald-500/20 font-black">
              <ShieldCheck className="w-6 h-6 text-black" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Echo AdBlock & SponsorBlock
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  GPL-3.0
                </span>
              </h3>
              <p className="text-xs text-slate-400">Zero audio ads • Automatic intro & sponsor skipping</p>
            </div>
          </div>
          <button
            onClick={() => setIsAdBlockModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Dashboard Counters */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Audio Ads Blocked</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <p className="text-2xl font-black text-emerald-400 mt-2">
              {adBlockState.blockedAdsCount > 0 ? adBlockState.blockedAdsCount : '100%'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Zero commercial audio</p>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-500/30">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Sponsor Segments</span>
              <FastForward className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-black text-cyan-400 mt-2">
              {adBlockState.skippedSegmentsCount}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Skipped smoothly</p>
          </div>
        </div>

        {/* Master Toggles */}
        <div className="space-y-3">
          {/* Audio AdBlock Master */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                <VolumeX className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Stream Audio AdBlock</h4>
                <p className="text-xs text-slate-400">Filters YouTube prerolls and midroll commercials</p>
              </div>
            </div>
            <button
              onClick={toggleAdBlock}
              className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
                adBlockState.enabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5.5 h-5.5 rounded-full bg-white transition-transform ${
                  adBlockState.enabled ? 'translate-x-5.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* SponsorBlock Master */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                <FastForward className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">SponsorBlock Auto-Skip</h4>
                <p className="text-xs text-slate-400">Crowdsourced database skips non-music parts in songs</p>
              </div>
            </div>
            <button
              onClick={toggleSponsorBlock}
              className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
                adBlockState.sponsorBlockEnabled ? 'bg-cyan-400' : 'bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5.5 h-5.5 rounded-full bg-black transition-transform ${
                  adBlockState.sponsorBlockEnabled ? 'translate-x-5.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* SponsorBlock Detailed Category Filters */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            SponsorBlock Category Rules
          </h4>

          <div className="space-y-2">
            {[
              { key: 'sponsor', label: 'Paid Sponsor Messages', desc: 'Promoted sponsors and products' },
              { key: 'music_offtopic', label: 'Non-Music Video Dialogue', desc: 'Skips acting, dialogue, and sketches in music videos' },
              { key: 'intro', label: 'Intro & Silence Animations', desc: 'Skips long silent artist intros' },
              { key: 'outro', label: 'Outro Credits & Cards', desc: 'Skips end screen credits' },
              { key: 'selfpromo', label: 'Self-Promotion & Merch', desc: 'Creator merch, tour links & secondary channels' },
              { key: 'interaction', label: 'Interaction Prompts', desc: 'Like, subscribe, and follow reminders' },
            ].map(({ key, label, desc }) => {
              const isActive = (adBlockState.categories as any)[key] ?? true;
              return (
                <div 
                  key={key}
                  onClick={() => setSponsorBlockCategory(key, !isActive)}
                  className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 flex items-center justify-between gap-3 cursor-pointer transition"
                >
                  <div>
                    <h5 className="text-xs font-bold text-white">{label}</h5>
                    <p className="text-[11px] text-slate-400">{desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold border ${
                    isActive ? 'bg-cyan-500 border-cyan-400 text-black' : 'bg-white/5 border-white/10 text-transparent'
                  }`}>
                    {isActive && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Last Skipped Notice if any */}
        {adBlockState.lastSkippedText && (
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono text-center flex items-center justify-center gap-2">
            <Zap className="w-3.5 h-3.5" />
            <span>{adBlockState.lastSkippedText}</span>
          </div>
        )}

        <div className="text-center pt-2">
          <p className="text-[11px] text-slate-500">
            Powered by Echo Music Engine & SponsorBlock Open API.
          </p>
        </div>
      </div>
    </div>
  );
};
