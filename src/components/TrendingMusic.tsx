import React, { useRef } from 'react';
import { 
  Play, 
  Heart, 
  Headphones, 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Share2, 
  Sparkles 
} from 'lucide-react';
import { Track } from '../types';

interface TrendingMusicProps {
  tracks: Track[];
  onPlayTrack: (track: Track) => void;
  onToggleLike: (trackId: string) => void;
  currentTrackId?: string;
  isPlaying: boolean;
}

export const TrendingMusic: React.FC<TrendingMusicProps> = ({
  tracks,
  onPlayTrack,
  onToggleLike,
  currentTrackId,
  isPlaying,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="trending" 
      aria-label="Trending Music"
      className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-1.5 text-pink-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Flame className="w-4 h-4 text-pink-500" />
            <span>Real-time Global Charts</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
            Trending <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Music</span>
          </h2>
          <p className="text-neutral-400 text-sm mt-1">
            Top viral tracks across YouTube and Spotify charts updated every 60 minutes.
          </p>
        </div>

        {/* Scroll navigation chevrons */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            id="trending-scroll-left"
            aria-label="Scroll left"
            className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-neutral-300 hover:text-white hover:border-cyan-500/40 hover:bg-white/[0.08] transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            id="trending-scroll-right"
            aria-label="Scroll right"
            className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-neutral-300 hover:text-white hover:border-cyan-500/40 hover:bg-white/[0.08] transition cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Reel */}
      <div
        ref={scrollContainerRef}
        className="flex gap-5 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth snap-x snap-mandatory"
        tabIndex={0}
        aria-label="Trending tracks horizontal reel"
      >
        {tracks.map((track) => {
          const isCurrent = currentTrackId === track.id;
          const isPlayingThis = isCurrent && isPlaying;

          return (
            <div
              key={track.id}
              id={`trending-card-${track.id}`}
              className="flex-shrink-0 w-64 sm:w-72 snap-start group"
            >
              <div className="relative rounded-2xl glass-card p-4 border border-white/[0.08] transition-all duration-300 hover:border-cyan-400/40 hover:shadow-[0_10px_30px_rgba(0,240,255,0.15)] flex flex-col justify-between h-full">
                
                {/* Album Art Container */}
                <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-black/40">
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                  {/* Source Badge Top Left */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md backdrop-blur-md ${
                      track.source === 'spotify'
                        ? 'bg-emerald-500/80 text-white'
                        : 'bg-red-600/80 text-white'
                    }`}>
                      {track.source}
                    </span>

                    {track.dolbyReady && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-black/70 text-cyan-300 border border-cyan-500/40 backdrop-blur-md flex items-center gap-0.5">
                        <Headphones className="w-2.5 h-2.5" /> 3D
                      </span>
                    )}
                  </div>

                  {/* Like Button Top Right */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLike(track.id);
                    }}
                    id={`like-track-${track.id}`}
                    aria-label={track.liked ? 'Unlike track' : 'Like track'}
                    className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition ${
                      track.liked 
                        ? 'bg-pink-500/80 text-white' 
                        : 'bg-black/50 text-white hover:bg-pink-500/50'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${track.liked ? 'fill-current' : ''}`} />
                  </button>

                  {/* Play Button Overlay Center */}
                  <button
                    onClick={() => onPlayTrack(track)}
                    id={`play-trending-${track.id}`}
                    aria-label={isPlayingThis ? 'Pause track' : 'Play track'}
                    className={`absolute bottom-3 right-3 w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 text-black flex items-center justify-center shadow-lg shadow-cyan-500/40 transition-all duration-300 cursor-pointer ${
                      isPlayingThis 
                        ? 'scale-100 ring-4 ring-cyan-400/40 opacity-100' 
                        : 'opacity-90 group-hover:scale-105 group-hover:opacity-100'
                    }`}
                  >
                    {isPlayingThis ? (
                      <div className="flex gap-1 items-center justify-center">
                        <span className="w-1 h-3.5 bg-black rounded-full animate-bounce" />
                        <span className="w-1 h-3.5 bg-black rounded-full animate-bounce delay-75" />
                      </div>
                    ) : (
                      <Play className="w-5 h-5 fill-black ml-0.5" />
                    )}
                  </button>
                </div>

                {/* Track Details */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-cyan-400">
                      {track.genre}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-400">
                      {track.plays} plays
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white truncate group-hover:text-cyan-300 transition">
                    {track.title}
                  </h3>

                  <p className="text-xs text-neutral-400 truncate">
                    {track.artist}
                  </p>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-neutral-400 border-t border-white/[0.06] mt-2">
                    <span>{track.album}</span>
                    <span className="font-mono">{track.duration}</span>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
