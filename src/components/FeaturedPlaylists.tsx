import React from 'react';
import { 
  Play, 
  ListMusic, 
  Users, 
  Sparkles, 
  Disc, 
  Share2, 
  ArrowUpRight 
} from 'lucide-react';
import { FEATURED_PLAYLISTS } from '../data/musicData';
import { Playlist } from '../types';

interface FeaturedPlaylistsProps {
  onPlayPlaylist: (playlist: Playlist) => void;
}

export const FeaturedPlaylists: React.FC<FeaturedPlaylistsProps> = ({ onPlayPlaylist }) => {
  return (
    <section 
      id="playlists" 
      aria-label="Featured Playlists"
      className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ListMusic className="w-4 h-4" />
            <span>Curated Collections</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
            Featured <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Playlists</span>
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base mt-1">
            Handcrafted sets blending lossless Spotify gems and underground YouTube audio exclusives.
          </p>
        </div>

        <span className="text-xs font-semibold text-neutral-400 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 self-start sm:self-auto">
          Updated Today • 320kbps Dolby
        </span>
      </div>

      {/* Playlists Grid (Colorful Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {FEATURED_PLAYLISTS.map((pl) => (
          <div
            key={pl.id}
            id={`playlist-card-${pl.id}`}
            className="group relative rounded-3xl glass-card p-6 border border-white/[0.08] overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-2xl"
          >
            {/* Dynamic Card Ambient Glow */}
            <div 
              className={`absolute inset-0 bg-gradient-to-br ${pl.gradient} opacity-20 group-hover:opacity-40 transition-opacity duration-500`}
            />

            <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              
              {/* Artwork / Square Thumbnail */}
              <div className="relative w-44 h-44 sm:w-40 sm:h-40 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 group-hover:shadow-[0_0_25px_rgba(0,240,255,0.3)] transition">
                <img
                  src={pl.coverUrl}
                  alt={pl.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Direct Play Floating Button */}
                <button
                  onClick={() => onPlayPlaylist(pl)}
                  id={`play-playlist-${pl.id}`}
                  aria-label={`Play playlist ${pl.title}`}
                  className="absolute bottom-2.5 right-2.5 w-11 h-11 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-lg shadow-cyan-400/40 hover:scale-110 active:scale-95 transition cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-black ml-0.5" />
                </button>
              </div>

              {/* Playlist Metadata & Details */}
              <div className="flex-1 flex flex-col justify-between space-y-3 text-center sm:text-left">
                <div>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                    <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wide">
                      {pl.curator}
                    </span>
                    <span className="text-neutral-500">•</span>
                    <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
                      <Users className="w-3 h-3 text-neutral-400" />
                      {pl.followers} listeners
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition font-heading">
                    {pl.title}
                  </h3>

                  <p className="text-xs text-neutral-300 mt-1 line-clamp-2 leading-relaxed">
                    {pl.description}
                  </p>
                </div>

                {/* Tags & Song Count */}
                <div className="pt-2 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {pl.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/[0.06] text-neutral-300 border border-white/[0.05]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <span className="text-xs font-mono font-semibold text-white">
                    {pl.trackCount} Tracks
                  </span>
                </div>

              </div>

            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
