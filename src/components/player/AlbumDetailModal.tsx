import React from 'react';
import { X, Play, Music, Disc, Heart, Clock } from 'lucide-react';
import { useMusicPlayer } from '../../context/MusicPlayerContext';

export const AlbumDetailModal: React.FC = () => {
  const {
    selectedAlbum,
    closeAlbum,
    isAlbumLoading,
    playTrack,
    toggleLike,
    isLiked
  } = useMusicPlayer();

  if (!selectedAlbum && !isAlbumLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#0b0f20] border border-purple-500/30 rounded-3xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.9)] max-h-[90vh] flex flex-col"
      >
        {isAlbumLoading ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-10 h-10 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono text-slate-400">Loading Album Tracklist...</p>
          </div>
        ) : selectedAlbum ? (
          <>
            {/* Header info */}
            <div className="p-6 bg-gradient-to-b from-purple-950/50 to-transparent border-b border-white/5 flex flex-col sm:flex-row items-center gap-5">
              <button
                onClick={closeAlbum}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <img
                src={selectedAlbum.thumbnail}
                alt={selectedAlbum.title}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover shadow-2xl border border-white/10 flex-shrink-0"
              />

              <div className="flex-1 text-center sm:text-left min-w-0">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                  Album • {selectedAlbum.year || '2024'}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white truncate mt-1">
                  {selectedAlbum.title}
                </h2>
                <p className="text-sm font-semibold text-slate-300 truncate">{selectedAlbum.artist}</p>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  {selectedAlbum.tracks.length} Tracks
                </p>

                <div className="mt-3 flex items-center justify-center sm:justify-start gap-2">
                  <button
                    onClick={() => {
                      if (selectedAlbum.tracks[0]) {
                        playTrack(selectedAlbum.tracks[0], selectedAlbum.tracks);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Play Album
                  </button>
                </div>
              </div>
            </div>

            {/* Tracklist */}
            <div className="p-6 space-y-1.5 overflow-y-auto flex-1">
              {selectedAlbum.tracks.map((track, i) => (
                <div
                  key={track.id}
                  onClick={() => playTrack(track, selectedAlbum.tracks)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 text-xs font-mono text-slate-500 text-center font-bold">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white group-hover:text-purple-300 truncate">
                        {track.title}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{track.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400">{track.durationText}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(track);
                      }}
                      className="text-slate-400 hover:text-rose-400 transition"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked(track.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
