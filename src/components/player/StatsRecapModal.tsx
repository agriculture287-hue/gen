import React from 'react';
import { X, BarChart3, Clock, Music2, Flame, Award, Trash2 } from 'lucide-react';
import { useMusicPlayer } from '../../context/MusicPlayerContext';

export const StatsRecapModal: React.FC = () => {
  const {
    isStatsOpen,
    setIsStatsOpen,
    listeningStats,
    clearHistory
  } = useMusicPlayer();

  if (!isStatsOpen) return null;

  const totalMinutes = Math.floor(listeningStats.totalSecondsPlayed / 60);
  const totalHours = (listeningStats.totalSecondsPlayed / 3600).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-[#0d1226] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] space-y-6 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-black font-bold shadow-md shadow-amber-500/20">
              <BarChart3 className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Listening Summary</h3>
              <p className="text-xs text-slate-400">Echo Music Real-time Audio Analytics & Recap</p>
            </div>
          </div>
          <button
            onClick={() => setIsStatsOpen(false)}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/20">
            <Clock className="w-5 h-5 text-cyan-400 mb-2" />
            <span className="text-2xl font-black text-white">{totalMinutes}m</span>
            <p className="text-[11px] text-slate-400 mt-0.5">Stream Time ({totalHours}h)</p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20">
            <Music2 className="w-5 h-5 text-purple-400 mb-2" />
            <span className="text-2xl font-black text-white">{listeningStats.totalTracksPlayed}</span>
            <p className="text-[11px] text-slate-400 mt-0.5">Tracks Played</p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/20 col-span-2 sm:col-span-1">
            <Flame className="w-5 h-5 text-amber-400 mb-2" />
            <span className="text-2xl font-black text-white">
              {listeningStats.topArtists[0]?.artist ? listeningStats.topArtists[0].artist.split(' ')[0] : 'N/A'}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">Top Artist</p>
          </div>
        </div>

        {/* Top Artists Breakdown */}
        {listeningStats.topArtists.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              Most Played Artists
            </h4>
            <div className="space-y-1.5">
              {listeningStats.topArtists.slice(0, 5).map((item, idx) => (
                <div key={item.artist} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-4 text-slate-500 font-mono font-bold">{idx + 1}</span>
                    <span className="font-bold text-white">{item.artist}</span>
                  </div>
                  <span className="text-slate-400 font-mono">{item.count} plays</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audio Engine Stats */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Audio Codec:</span>
            <span className="text-cyan-400 font-mono font-bold">AAC-LC 320kbps Lossless</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">DSP Engine:</span>
            <span className="text-purple-400 font-mono font-bold">Axion Equalizer 2.4</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Lyrics Provider:</span>
            <span className="text-emerald-400 font-mono font-bold">LRCLIB Sync Engine</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => {
              if (confirm('Clear playback history and stats?')) {
                clearHistory();
              }
            }}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear History
          </button>
          <button
            onClick={() => setIsStatsOpen(false)}
            className="px-5 py-2 rounded-xl bg-cyan-400 text-black font-bold text-xs transition hover:bg-cyan-300 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
