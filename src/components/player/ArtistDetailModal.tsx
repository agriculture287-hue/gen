import React from 'react';
import { X, Play, Radio, Music, Disc, Users, Heart } from 'lucide-react';
import { useMusicPlayer } from '../../context/MusicPlayerContext';
import { Track } from '../../types/music';

export const ArtistDetailModal: React.FC = () => {
  const {
    selectedArtist,
    closeArtist,
    isArtistLoading,
    playTrack,
    openAlbum,
    toggleLike,
    isLiked
  } = useMusicPlayer();

  if (!selectedArtist && !isArtistLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-[#0b0f20] border border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.9)] max-h-[90vh] flex flex-col"
      >
        {isArtistLoading ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono text-slate-400">Loading Artist Profile & Discography...</p>
          </div>
        ) : selectedArtist ? (
          <>
            {/* Header Hero */}
            <div className="relative h-56 sm:h-64 w-full bg-slate-900 overflow-hidden flex-shrink-0">
              <img
                src={selectedArtist.headerImage || selectedArtist.avatar}
                alt={selectedArtist.name}
                className="w-full h-full object-cover opacity-60 filter blur-sm scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f20] via-[#0b0f20]/60 to-transparent" />

              <button
                onClick={closeArtist}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedArtist.avatar}
                    alt={selectedArtist.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-white/20 shadow-xl"
                  />
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 uppercase">
                      Verified Artist
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                      {selectedArtist.name}
                    </h2>
                    <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      {selectedArtist.subscribers || 'Millions of Listeners'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (selectedArtist.topTracks[0]) {
                      playTrack(selectedArtist.topTracks[0], selectedArtist.topTracks);
                    }
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-400/30 transition cursor-pointer flex-shrink-0"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Play All
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Top Tracks */}
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Music className="w-4 h-4 text-cyan-400" />
                  Popular Tracks
                </h3>
                <div className="space-y-1.5">
                  {selectedArtist.topTracks.map((track, i) => (
                    <div
                      key={track.id}
                      onClick={() => playTrack(track, selectedArtist.topTracks)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-5 text-xs font-mono text-slate-500 text-center font-bold">
                          {i + 1}
                        </span>
                        <img
                          src={track.thumbnail}
                          alt={track.title}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">
                            {track.title}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {track.album || selectedArtist.name}
                          </p>
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
              </div>

              {/* Albums Grid */}
              {selectedArtist.albums.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Disc className="w-4 h-4 text-purple-400" />
                    Albums & Releases
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {selectedArtist.albums.map((album) => (
                      <div
                        key={album.id}
                        onClick={() => openAlbum(album.title, selectedArtist.name)}
                        className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition cursor-pointer group flex flex-col"
                      >
                        <img
                          src={album.thumbnail || selectedArtist.avatar}
                          alt={album.title}
                          className="w-full aspect-square rounded-xl object-cover mb-2"
                        />
                        <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">
                          {album.title}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400">{album.year}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
