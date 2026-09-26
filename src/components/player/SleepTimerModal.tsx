import React, { useState } from 'react';
import { X, Moon, Clock, Check, Ban } from 'lucide-react';
import { useMusicPlayer } from '../../context/MusicPlayerContext';

export const SleepTimerModal: React.FC = () => {
  const {
    isSleepTimerOpen,
    setIsSleepTimerOpen,
    sleepTimer,
    startSleepTimer,
    cancelSleepTimer
  } = useMusicPlayer();

  const [customMinutes, setCustomMinutes] = useState<string>('20');

  if (!isSleepTimerOpen) return null;

  const presets = [15, 30, 45, 60];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#0d1226] border border-indigo-500/30 rounded-3xl p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.8)] space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Moon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Sleep Timer</h3>
              <p className="text-xs text-slate-400">Auto-pause playback when you fall asleep</p>
            </div>
          </div>
          <button
            onClick={() => setIsSleepTimerOpen(false)}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status */}
        {sleepTimer.active ? (
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-indigo-400 animate-spin" />
              <div>
                <span className="text-xs font-bold text-indigo-300">Sleep Timer Active</span>
                <p className="text-xs text-slate-300 font-mono">
                  {sleepTimer.mode === 'end_of_track' ? 'Stops after current song' : `Stops in ~${sleepTimer.minutesRemaining} min`}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                cancelSleepTimer();
                setIsSleepTimerOpen(false);
              }}
              className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold border border-red-500/40 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Ban className="w-3.5 h-3.5" /> Cancel
            </button>
          </div>
        ) : null}

        {/* Preset selections */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Quick Timer
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {presets.map((min) => (
              <button
                key={min}
                onClick={() => {
                  startSleepTimer(min);
                  setIsSleepTimerOpen(false);
                }}
                className="p-3 rounded-2xl bg-slate-800/80 hover:bg-indigo-600/30 border border-white/5 hover:border-indigo-400/40 text-left transition flex items-center justify-between group cursor-pointer"
              >
                <span className="text-sm font-bold text-white group-hover:text-indigo-300">
                  {min} Minutes
                </span>
                <Clock className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              startSleepTimer('end_of_track');
              setIsSleepTimerOpen(false);
            }}
            className="w-full p-3.5 rounded-2xl bg-slate-800/80 hover:bg-purple-600/30 border border-white/5 hover:border-purple-400/40 text-left transition flex items-center justify-between group cursor-pointer"
          >
            <span className="text-sm font-bold text-white group-hover:text-purple-300">
              End of Current Track
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">1 Track</span>
          </button>
        </div>

        {/* Custom minute input */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-3">
          <input
            type="number"
            min="1"
            max="300"
            value={customMinutes}
            onChange={(e) => setCustomMinutes(e.target.value)}
            className="w-24 px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-indigo-400"
          />
          <span className="text-xs text-slate-400 font-medium">Minutes</span>
          <button
            onClick={() => {
              const val = parseInt(customMinutes, 10);
              if (val > 0) {
                startSleepTimer(val);
                setIsSleepTimerOpen(false);
              }
            }}
            className="ml-auto px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold transition shadow-md shadow-indigo-500/20 cursor-pointer"
          >
            Set Timer
          </button>
        </div>
      </div>
    </div>
  );
};
