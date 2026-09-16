import React, { useState } from 'react';
import { Search, X, Play, Music, Sparkles, Filter } from 'lucide-react';
import { TRENDING_TRACKS } from '../data/musicData';
import { Track } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayTrack: (track: Track) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onPlayTrack,
}) => {
  const [query, setQuery] = useState('');
  const [filterSource, setFilterSource] = useState<'all' | 'spotify' | 'youtube'>('all');

  if (!isOpen) return null;

  const filtered = TRENDING_TRACKS.filter((t) => {
    const matchesQuery = t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.artist.toLowerCase().includes(query.toLowerCase()) ||
      t.genre.toLowerCase().includes(query.toLowerCase()) ||
      t.mood.toLowerCase().includes(query.toLowerCase());
    const matchesSource = filterSource === 'all' || t.source === filterSource;
    return matchesQuery && matchesSource;
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl rounded-3xl glass-panel p-6 border border-white/20 shadow-2xl relative space-y-4 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 pb-3 border-b border-white/10">
          <Search className="w-5 h-5 text-cyan-400 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search songs, artists, genres, YouTube tracks, Spotify playlists..."
            className="w-full bg-transparent text-white placeholder-neutral-500 text-base sm:text-lg focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400 mr-1">Source:</span>
            {(['all', 'spotify', 'youtube'] as const).map((src) => (
              <button
                key={src}
                onClick={() => setFilterSource(src)}
                className={`px-3 py-1 rounded-lg uppercase font-bold transition cursor-pointer ${
                  filterSource === src
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-white/5 text-neutral-400 hover:text-white'
                }`}
              >
                {src}
              </button>
            ))}
          </div>

          <span className="text-neutral-400 font-mono">
            {filtered.length} results found
          </span>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto space-y-2 flex-1 pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 text-sm space-y-2">
              <p>No tracks found matching "{query}".</p>
              <p className="text-xs text-neutral-500">Try searching for "Synthwave", "Lo-Fi", "Focus", or "Spotify".</p>
            </div>
          ) : (
            filtered.map((track) => (
              <div
                key={track.id}
                onClick={() => {
                  onPlayTrack(track);
                  onClose();
                }}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-cyan-500/30 transition cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h5 className="text-sm font-bold text-white group-hover:text-cyan-300 transition truncate">
                      {track.title}
                    </h5>
                    <p className="text-xs text-neutral-400 truncate">
                      {track.artist} • <span className="text-neutral-400">{track.genre}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    track.source === 'spotify' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                  }`}>
                    {track.source}
                  </span>
                  <div className="p-2 rounded-full bg-cyan-400 text-black opacity-80 group-hover:opacity-100 group-hover:scale-105 transition">
                    <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
