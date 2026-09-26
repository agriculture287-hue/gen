import React from 'react';
import { X, Play, Trash2, Music, Sparkles } from 'lucide-react';
import { useMusicPlayer } from '../../context/MusicPlayerContext';

export const QueueDrawer: React.FC = () => {
  const {
    queue,
    queueIndex,
    currentTrack,
    isPlaying,
    playTrack,
    removeFromQueue,
    clearQueue,
    isQueueOpen,
    setIsQueueOpen,
  } = useMusicPlayer();

  if (!isQueueOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200"
      onClick={() => setIsQueueOpen(false)}
      role="dialog"
      aria-label="Play Queue"
    >
      <div 
        className="w-full max-w-md bg-[#090b14] border-l border-cyan-500/20 h-full flex flex-col p-6 shadow-2xl animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Playing Queue
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                {queue.length} tracks
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Upcoming tracks and radio queue</p>
          </div>
          <div className="flex items-center gap-2">
            {queue.length > 1 && (
              <button
                onClick={clearQueue}
                className="p-1.5 text-slate-400 hover:text-pink-400 rounded-lg hover:bg-white/5 transition-colors cursor-pointer text-xs flex items-center gap-1 font-mono"
                title="Clear queue"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear</span>
              </button>
            )}
            <button
              onClick={() => setIsQueueOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Currently Playing Card */}
        {currentTrack && (
          <div className="my-4 p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center gap-3">
            <img
              src={currentTrack.thumbnail || '/logo.png'}
              alt={currentTrack.title}
              className="w-12 h-12 rounded-xl object-cover border border-cyan-500/40"
            />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 flex items-center gap-1 font-bold">
                <Sparkles className="w-3 h-3 animate-spin" /> Now Playing
              </span>
              <h4 className="text-sm font-semibold text-white truncate">{currentTrack.title}</h4>
              <p className="text-xs text-slate-400 truncate">{currentTrack.artist}</p>
            </div>
            {isPlaying && (
              <div className="flex items-end gap-1 h-4 pr-2">
                <span className="w-1 bg-cyan-400 h-3 animate-pulse" />
                <span className="w-1 bg-indigo-400 h-4 animate-pulse delay-75" />
                <span className="w-1 bg-pink-400 h-2 animate-pulse delay-150" />
              </div>
            )}
          </div>
        )}

        {/* Up Next List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          <div className="text-xs font-mono uppercase text-slate-400 tracking-wider py-1">
            Up Next ({Math.max(0, queue.length - (queueIndex + 1))})
          </div>

          {queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500 gap-2">
              <Music className="w-8 h-8" />
              <p className="text-sm">Queue is empty</p>
            </div>
          ) : (
            queue.map((track, idx) => {
              const isCurrent = idx === queueIndex;
              return (
                <div
                  key={`${track.id}-${idx}`}
                  className={`group flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-white/10 border border-cyan-400/40'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                  onClick={() => playTrack(track, queue)}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-xs font-mono text-slate-500 w-4 text-center">
                      {idx + 1}
                    </span>
                    <img
                      src={track.thumbnail || '/logo.png'}
                      alt={track.title}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-800"
                    />
                    <div className="min-w-0 flex-1">
                      <h5 className={`text-xs font-semibold truncate ${isCurrent ? 'text-cyan-300' : 'text-slate-200'}`}>
                        {track.title}
                      </h5>
                      <p className="text-[11px] text-slate-400 truncate">{track.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-2">
                    {track.durationText && (
                      <span className="text-[11px] font-mono text-slate-500 group-hover:hidden">
                        {track.durationText}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromQueue(idx);
                      }}
                      className="p-1 text-slate-500 hover:text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove from queue"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-white/10 text-center">
          <p className="text-[11px] font-mono text-slate-400">
            Autoplay is enabled. Similar tracks are automatically queued.
          </p>
        </div>
      </div>
    </div>
  );
};
