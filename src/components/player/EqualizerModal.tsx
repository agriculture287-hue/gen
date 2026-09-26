import React from 'react';
import { X, Sliders, Volume2, Sparkles, Zap, Waves, Disc } from 'lucide-react';
import { useMusicPlayer, EQ_PRESETS } from '../../context/MusicPlayerContext';

export const EqualizerModal: React.FC = () => {
  const {
    isEqualizerOpen,
    setIsEqualizerOpen,
    equalizer,
    setEqPreset,
    setEqBand,
    setBassBoost,
    toggleSpatialAudio,
    toggleReplayGain,
    setPlaybackSpeed,
    audioQuality,
    setAudioQuality
  } = useMusicPlayer();

  if (!isEqualizerOpen) return null;

  const bandLabels = ['60 Hz', '230 Hz', '910 Hz', '3.6 kHz', '14 kHz'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#0d1226] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] max-h-[90vh] overflow-y-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-black font-bold shadow-md shadow-cyan-500/20">
              <Sliders className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Axion Audio Equalizer
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30 uppercase">
                  Hi-Fi DSP
                </span>
              </h3>
              <p className="text-xs text-slate-400">Echo Music 5-Band Studio Grade Parametric Tuning</p>
            </div>
          </div>
          <button
            onClick={() => setIsEqualizerOpen(false)}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets Bar */}
        <div>
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
            Sound Profiles & Presets
          </label>
          <div className="flex flex-wrap gap-2">
            {EQ_PRESETS.map((preset) => {
              const active = equalizer.preset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => setEqPreset(preset.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-cyan-400 text-black font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)] scale-105'
                      : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-white/5'
                  }`}
                >
                  {preset.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5-Band Sliders */}
        <div className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/5 space-y-4">
          <div className="flex justify-between text-xs text-slate-400 font-mono">
            <span>+12 dB</span>
            <span className="text-cyan-400 font-bold">5-Band Studio Filter</span>
            <span>-12 dB</span>
          </div>

          <div className="grid grid-cols-5 gap-3 sm:gap-6 py-2">
            {equalizer.bands.map((gain, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-300">
                  {gain > 0 ? `+${gain}` : gain} dB
                </span>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="1"
                  value={gain}
                  onChange={(e) => setEqBand(index, parseInt(e.target.value, 10))}
                  className="w-full h-32 accent-cyan-400 [writing-mode:vertical-lr] [direction:rtl] cursor-pointer"
                />
                <span className="text-[11px] font-mono text-slate-400 text-center">
                  {bandLabels[index]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Extra DSP Controls: Bass Boost & Spatial Audio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Bass Boost */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                Bass Boost Subwoofer
              </span>
              <span className="text-xs font-mono text-amber-400 font-bold">
                {equalizer.bassBoost}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={equalizer.bassBoost}
              onChange={(e) => setBassBoost(parseInt(e.target.value, 10))}
              className="w-full accent-amber-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Spatial Audio 3D */}
          <div 
            onClick={toggleSpatialAudio}
            className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
              equalizer.spatialAudio
                ? 'bg-purple-950/40 border-purple-500/40 text-purple-300'
                : 'bg-slate-900/80 border-white/5 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Waves className="w-5 h-5 text-purple-400" />
              <div>
                <h4 className="text-xs font-bold text-white">Spatial Dolby 3D</h4>
                <p className="text-[11px] text-slate-400">Binaural Headphone Surround</p>
              </div>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              equalizer.spatialAudio ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-slate-800 text-slate-500'
            }`}>
              {equalizer.spatialAudio ? 'ACTIVE' : 'OFF'}
            </span>
          </div>
        </div>

        {/* Playback Speed & ReplayGain */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Playback Speed */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Disc className="w-4 h-4 text-cyan-400" />
                Playback Speed
              </span>
              <span className="text-xs font-mono text-cyan-400 font-bold">
                {equalizer.pitchSpeed}x
              </span>
            </div>
            <div className="flex gap-1.5 justify-between">
              {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setPlaybackSpeed(rate)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition ${
                    equalizer.pitchSpeed === rate
                      ? 'bg-cyan-400 text-black font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          {/* ReplayGain / Loudness Normalizer */}
          <div 
            onClick={toggleReplayGain}
            className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
              equalizer.replayGain
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900/80 border-white/5 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-5 h-5 text-emerald-400" />
              <div>
                <h4 className="text-xs font-bold text-white">ReplayGain Normalizer</h4>
                <p className="text-[11px] text-slate-400">-14 LUFS Auto Volume</p>
              </div>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              equalizer.replayGain ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-500'
            }`}>
              {equalizer.replayGain ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        {/* Audio Quality Bitrate Selector */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-white">Audio Stream Quality</h4>
            <p className="text-[11px] text-slate-400">Echo Music Lossless Web Audio Codec</p>
          </div>
          <div className="flex gap-1.5">
            {(['lossless', 'high', 'standard', 'saver'] as const).map((q) => (
              <button
                key={q}
                onClick={() => setAudioQuality(q)}
                className={`px-3 py-1.5 rounded-xl text-xs capitalize transition ${
                  audioQuality === q
                    ? 'bg-cyan-400 text-black font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {q === 'lossless' ? 'Lossless (320k)' : q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
