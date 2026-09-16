import React, { useState } from 'react';
import { 
  X, 
  Sliders, 
  Headphones, 
  Volume2, 
  Sparkles, 
  Timer, 
  Check, 
  RotateCcw,
  Zap
} from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface EqualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  dolbyEnabled: boolean;
  onToggleDolby: (enabled: boolean) => void;
  sleepTimerMinutes: number | null;
  onSetSleepTimer: (minutes: number | null) => void;
}

export const EqualizerModal: React.FC<EqualizerModalProps> = ({
  isOpen,
  onClose,
  dolbyEnabled,
  onToggleDolby,
  sleepTimerMinutes,
  onSetSleepTimer,
}) => {
  const [bandGains, setBandGains] = useState<number[]>([3, 1, 0, 2, 4]); // 60, 230, 910, 3k, 14k
  const [activePreset, setActivePreset] = useState<string>('Dolby Spatial');

  if (!isOpen) return null;

  const presets = [
    { name: 'Flat', bands: [0, 0, 0, 0, 0] },
    { name: 'Bass Boost', bands: [8, 5, 1, 0, 1] },
    { name: 'Dolby Spatial', bands: [4, 2, 0, 3, 5] },
    { name: 'Vocal Clarity', bands: [-2, 1, 5, 4, 1] },
    { name: 'Electronic', bands: [6, 3, -1, 3, 6] },
    { name: 'Acoustic', bands: [3, 2, 1, 3, 4] },
  ];

  const handleBandChange = (index: number, val: number) => {
    const updated = [...bandGains];
    updated[index] = val;
    setBandGains(updated);
    audioEngine.setEqBand(index, val);
    setActivePreset('Custom');
  };

  const applyPreset = (p: typeof presets[0]) => {
    setActivePreset(p.name);
    setBandGains(p.bands);
    p.bands.forEach((gain, idx) => {
      audioEngine.setEqBand(idx, gain);
    });
  };

  const resetEQ = () => {
    applyPreset(presets[0]);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl rounded-3xl glass-panel p-6 sm:p-8 border border-white/20 shadow-2xl relative space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 text-white">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-heading">
                GEN Studio Equalizer & Dolby 3D
              </h3>
              <p className="text-xs text-neutral-400">
                Hardware-accelerated 5-band biquad filters and binaural spatializer.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            id="close-eq-modal-btn"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dolby Audio Spatial Master Switch */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-purple-950/40 to-black border border-cyan-500/30">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${dolbyEnabled ? 'bg-cyan-400 text-black shadow-[0_0_20px_rgba(0,240,255,0.6)]' : 'bg-white/10 text-neutral-400'}`}>
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Dolby Audio Virtualizer</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Binaural 3D
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Simulates 7.1.4 multi-speaker soundstage over standard stereo earphones.
              </p>
            </div>
          </div>

          <button
            onClick={() => onToggleDolby(!dolbyEnabled)}
            id="toggle-dolby-switch"
            className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer ${
              dolbyEnabled ? 'bg-cyan-400' : 'bg-white/15'
            }`}
          >
            <div className={`w-6 h-6 rounded-full bg-black transition-transform ${
              dolbyEnabled ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Presets Row */}
        <div>
          <span className="text-xs font-bold text-neutral-300 block mb-2">
            Soundstage Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p.name}
                onClick={() => applyPreset(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  activePreset === p.name
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-md'
                    : 'bg-white/[0.04] border border-white/10 text-neutral-300 hover:bg-white/[0.08]'
                }`}
              >
                {p.name}
              </button>
            ))}
            <button
              onClick={resetEQ}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.02] border border-white/10 text-neutral-400 hover:text-white transition flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>

        {/* 5-Band Vertical Slider Stage */}
        <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
          <div className="flex justify-between items-end h-44 px-2 sm:px-6">
            {[
              { label: 'Sub-Bass', freq: '60 Hz' },
              { label: 'Bass', freq: '230 Hz' },
              { label: 'Midrange', freq: '910 Hz' },
              { label: 'Treble', freq: '3 kHz' },
              { label: 'Air Brilliance', freq: '14 kHz' },
            ].map((band, idx) => {
              const currentGain = bandGains[idx] || 0;

              return (
                <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] font-mono font-bold text-cyan-300">
                    {currentGain > 0 ? `+${currentGain}` : currentGain}dB
                  </span>

                  {/* Vertical Slider */}
                  <div className="relative h-28 flex items-center justify-center">
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      step="1"
                      value={currentGain}
                      onChange={(e) => handleBandChange(idx, parseInt(e.target.value))}
                      className="w-24 h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 -rotate-90 origin-center"
                    />
                  </div>

                  <div className="text-center mt-1">
                    <span className="text-xs font-bold text-white block">{band.freq}</span>
                    <span className="text-[9px] text-neutral-400">{band.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sleep Timer Section */}
        <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-neutral-300 self-start sm:self-auto">
            <Timer className="w-4 h-4 text-pink-400" />
            <span>Sleep Timer:</span>
            <span className="font-mono text-cyan-300 font-bold">
              {sleepTimerMinutes ? `${sleepTimerMinutes} mins active` : 'Disabled'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            {[15, 30, 45, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => onSetSleepTimer(sleepTimerMinutes === mins ? null : mins)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  sleepTimerMinutes === mins
                    ? 'bg-pink-500 text-white font-bold'
                    : 'bg-white/5 text-neutral-400 hover:text-white'
                }`}
              >
                {mins}m
              </button>
            ))}
            {sleepTimerMinutes && (
              <button
                onClick={() => onSetSleepTimer(null)}
                className="px-2 py-1 rounded-lg text-xs text-red-400 hover:bg-red-500/10"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
