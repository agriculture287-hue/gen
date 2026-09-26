import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Play, 
  Pause, 
  Heart, 
  Plus, 
  Clock, 
  Music, 
  Sparkles, 
  Flame, 
  Radio, 
  Disc, 
  Layers, 
  FolderPlus, 
  Check, 
  ExternalLink,
  ShieldCheck,
  Info,
  Mic2,
  Trash2,
  Globe2
} from 'lucide-react';
import { useMusicPlayer } from '../../context/MusicPlayerContext';
import { Track } from '../../types/music';
import { CountryMusicSection } from '../CountryMusicSection';
import { 
  triggerSponsorHyperlink, 
  getSponsorCooldownStatus, 
  OMG10_SPONSOR_URL 
} from '../../utils/downloadHelper';

interface Section {
  id: string;
  title: string;
  subtitle?: string;
  items: Track[];
}

interface MusicDiscoveryViewProps {
  initialSearchQuery?: string;
  onClearInitialQuery?: () => void;
}

export const MusicDiscoveryView: React.FC<MusicDiscoveryViewProps> = ({
  initialSearchQuery,
  onClearInitialQuery,
}) => {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    isLiked,
    toggleLike,
    library,
    createPlaylist,
    addToPlaylist,
    removeFromPlaylist,
    setIsLyricsOpen,
  } = useMusicPlayer();

  // Play track with sponsor hyperlink handler
  const handlePlayTrack = (track: Track, newQueue?: Track[]) => {
    const cooldown = getSponsorCooldownStatus();
    if (!cooldown.isActive) {
      triggerSponsorHyperlink(() => {
        playTrack(track, newQueue);
      });
    } else {
      playTrack(track, newQueue);
    }
  };

  const [activeTab, setActiveTab] = useState<'home' | 'country' | 'search' | 'library' | 'about'>('home');
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoadingHome, setIsLoadingHome] = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState<'all' | 'songs' | 'artists'>('all');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Effect for initial search query from external entry points
  useEffect(() => {
    if (initialSearchQuery && initialSearchQuery.trim()) {
      setSearchQuery(initialSearchQuery.trim());
      setActiveTab('search');
      if (onClearInitialQuery) onClearInitialQuery();
    }
  }, [initialSearchQuery]);

  // Playlist creation state
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  // Fetch Home Feed
  useEffect(() => {
    let isMounted = true;
    setIsLoadingHome(true);

    fetch('/api/home')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.sections) {
          setSections(data.sections);
        }
      })
      .catch((err) => {
        console.warn('Failed to load home feed:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingHome(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Search Debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearching(true);
      fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&filter=${searchFilter}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.results) {
            setSearchResults(data.results);
          }
        })
        .catch((err) => console.warn('Search query error:', err))
        .finally(() => setIsSearching(false));
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, searchFilter]);

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName);
      setNewPlaylistName('');
      setShowCreateModal(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-36">
      
      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'home'
                ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 text-black shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Discover</span>
          </button>

          <button
            onClick={() => setActiveTab('country')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'country'
                ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 text-black shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe2 className="w-4 h-4" />
            <span>Country Hits</span>
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'search'
                ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 text-black shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'library'
                ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 text-black shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>My Library</span>
            {library.likedTracks.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-pink-500" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'about'
                ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 text-black shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>GPL-3.0 License & Credits</span>
          </button>
        </div>

        {/* Sponsor Partner status */}
        <div 
          onClick={() => triggerSponsorHyperlink()}
          className="hidden md:flex items-center gap-3 text-xs font-mono text-slate-300 cursor-pointer group"
          title="Click to visit verified sponsor offers"
        >
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 group-hover:bg-amber-500/20 transition">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Sponsored by OMG10 • Tap for Exclusive Deals
            <ExternalLink className="w-3 h-3 text-amber-400" />
          </span>
        </div>
      </div>

      {/* Universal In-App Sponsor Ad Banner */}
      <div 
        onClick={() => triggerSponsorHyperlink()}
        className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-cyan-500/15 border border-amber-500/30 hover:border-amber-400/60 transition-all cursor-pointer shadow-lg group relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-black font-extrabold shadow-md shadow-amber-500/20 flex-shrink-0 group-hover:scale-105 transition">
            <Sparkles className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                Featured Sponsor Ad
              </span>
              <span className="text-[11px] text-slate-400 font-mono">OMG10 Exclusive Partner</span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition">
              Claim Exclusive Partner Offers, Perks & Rewards
            </h4>
            <p className="text-xs text-slate-300">
              Support free music streaming! Tap here to visit our verified partner sponsor OMG10.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-xs shadow-md group-hover:from-amber-400 group-hover:to-orange-400 transition flex-shrink-0">
          <span>Claim Offer</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* --- TAB 1: HOME / DISCOVER --- */}
      {activeTab === 'home' && (
        <div className="space-y-10 animate-in fade-in duration-300">
          
          {/* Featured Hero Banner */}
          <div className="relative rounded-3xl overflow-hidden p-6 sm:p-10 border border-cyan-500/30 bg-gradient-to-r from-[#0b1026] via-[#101535] to-[#1a1236] shadow-2xl">
            <div className="relative z-10 max-w-2xl">
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 inline-flex items-center gap-1.5 mb-4">
                <Sparkles className="w-3.5 h-3.5" /> Echo Music Web Port • Free Unlimited Streaming
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
                Stream Free Music Without Interruption.
              </h2>
              <p className="text-sm sm:text-base text-slate-300 mb-6 leading-relaxed">
                Enjoy ad-free music playback, synchronized karaoke lyrics via LRCLIB, Dolby 3D spatial simulation, and persistent background playback on desktop and mobile.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    const first = sections[0]?.items?.[0];
                    if (first) handlePlayTrack(first, sections[0].items);
                  }}
                  className="px-6 py-3 rounded-2xl bg-cyan-400 text-black font-bold text-sm flex items-center gap-2 hover:bg-cyan-300 hover:scale-105 active:scale-95 transition-all shadow-[0_0_25px_rgba(0,240,255,0.4)] cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Listening Now</span>
                </button>
                <button
                  onClick={() => setActiveTab('search')}
                  className="px-5 py-3 rounded-2xl bg-white/10 text-white font-medium text-sm flex items-center gap-2 hover:bg-white/15 transition-all cursor-pointer border border-white/10"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Any Song or Artist</span>
                </button>
              </div>
            </div>
          </div>

          {/* Geo Country Music Spotlight */}
          <CountryMusicSection isEmbeddedInPlayer={true} className="!px-0 !py-2" />

          {/* Section Carousels */}
          {isLoadingHome ? (
            <div className="space-y-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="space-y-4">
                  <div className="h-6 w-48 bg-slate-800/80 rounded animate-pulse" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="aspect-square bg-slate-800/50 rounded-2xl animate-pulse" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            sections.map((section, idx) => (
              <React.Fragment key={section.id}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white tracking-tight">{section.title}</h3>
                      {section.subtitle && (
                        <p className="text-xs text-slate-400 mt-0.5">{section.subtitle}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {section.items.map((track) => {
                      const isCurrent = currentTrack?.id === track.id;
                      const liked = isLiked(track.id);

                      return (
                        <div
                          key={track.id}
                          onClick={() => handlePlayTrack(track, section.items)}
                          className="group relative bg-[#0e1224]/80 hover:bg-[#141b38] border border-white/5 hover:border-cyan-500/40 rounded-2xl p-3 transition-all duration-300 cursor-pointer flex flex-col hover:-translate-y-1 shadow-md hover:shadow-[0_10px_25px_rgba(0,0,0,0.5)]"
                        >
                        {/* Artwork */}
                        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-800 mb-3 shadow-inner">
                          <img
                            src={track.thumbnail || '/logo.png'}
                            alt={track.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />

                          {/* Hover Play Button Overlay */}
                          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                            isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}>
                            <div className="w-12 h-12 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-lg group-hover:scale-110 active:scale-95 transition-transform">
                              {isCurrent && isPlaying ? (
                                <Pause className="w-5 h-5 fill-current" />
                              ) : (
                                <Play className="w-5 h-5 fill-current ml-0.5" />
                              )}
                            </div>
                          </div>

                          {/* Like Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLike(track);
                            }}
                            className={`absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-md transition-all ${
                              liked ? 'text-pink-500 opacity-100' : 'text-white opacity-0 group-hover:opacity-100'
                            }`}
                            aria-label={liked ? 'Unlike' : 'Like'}
                          >
                            <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-pink-500' : ''}`} />
                          </button>
                        </div>

                        {/* Title & Artist */}
                        <h4 className={`text-xs sm:text-sm font-semibold truncate ${
                          isCurrent ? 'text-cyan-300' : 'text-slate-100'
                        }`}>
                          {track.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {track.artist}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* In-Feed Sponsor Spotlight Card between discovery sections */}
              {idx === 0 && (
                <div 
                  onClick={() => triggerSponsorHyperlink()}
                  className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#170e2b] via-[#101432] to-[#0c1f2e] border border-purple-500/30 hover:border-purple-400/60 transition cursor-pointer shadow-xl relative overflow-hidden group"
                >
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 via-pink-500 to-amber-400 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-purple-500/30 flex-shrink-0 group-hover:scale-105 transition">
                        🎁
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                            Sponsored Partner
                          </span>
                          <span className="text-xs text-amber-400 font-semibold">★ Special Listener Highlight</span>
                        </div>
                        <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition">
                          Exclusive OMG10 Digital Rewards & Sponsored Bonuses
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                          Supporting free music streaming without audio interruptions. Tap here to view verified partner promotions and exclusive special perks.
                        </p>
                      </div>
                    </div>
                    <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold text-xs shadow-lg shadow-purple-500/30 transition flex items-center gap-2 flex-shrink-0">
                      <span>View Partner Deals</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))
          )}
        </div>
      )}

      {/* --- TAB 1.5: COUNTRY HITS --- */}
      {activeTab === 'country' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <CountryMusicSection isEmbeddedInPlayer={true} className="!px-0 !py-0" />
        </div>
      )}

      {/* --- TAB 2: SEARCH --- */}
      {activeTab === 'search' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Search Input Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search songs, artists, albums, or lyrics..."
              className="w-full pl-12 pr-12 py-3.5 bg-slate-900/90 border border-cyan-500/30 rounded-2xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 shadow-xl"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-mono"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex items-center justify-center gap-2">
            {(['all', 'songs', 'artists'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSearchFilter(filter)}
                className={`px-3 py-1 rounded-xl text-xs capitalize transition-all cursor-pointer ${
                  searchFilter === filter
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                    : 'bg-white/5 text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Search Loading */}
          {isSearching && (
            <div className="flex items-center justify-center py-12 gap-3 text-cyan-400">
              <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-mono">Searching YouTube Music catalog...</span>
            </div>
          )}

          {/* Promoted Sponsor Ad Card in Search Tab */}
          <div 
            onClick={() => triggerSponsorHyperlink()}
            className="max-w-4xl mx-auto p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-slate-900 border border-amber-500/30 hover:border-amber-400/60 transition cursor-pointer flex items-center justify-between gap-3 text-left shadow-md group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 text-black font-extrabold text-xs flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-105 transition">
                AD
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">
                    Sponsored Search Match
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">OMG10 Verified Partner</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-white group-hover:text-amber-300 transition">
                  Unlock Exclusive Deals, Rewards & Music Perks from OMG10
                </p>
                <p className="text-[11px] text-slate-300">
                  Tap here to visit sponsor deals and claim exclusive gifts today.
                </p>
              </div>
            </div>
            <span className="text-xs text-amber-400 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 group-hover:bg-amber-500/25 transition flex-shrink-0">
              Claim <ExternalLink className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Results List */}
          {!isSearching && searchResults.length > 0 && (
            <div className="space-y-2 max-w-4xl mx-auto">
              {searchResults.map((track) => {
                const isCurrent = currentTrack?.id === track.id;
                const liked = isLiked(track.id);

                return (
                  <div
                    key={track.id}
                    onClick={() => handlePlayTrack(track, searchResults)}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer group ${
                      isCurrent
                        ? 'bg-cyan-500/10 border-cyan-400/40'
                        : 'bg-slate-900/60 hover:bg-slate-800/80 border-white/5 hover:border-cyan-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0">
                        <img
                          src={track.thumbnail || '/logo.png'}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center ${
                          isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}>
                          {isCurrent && isPlaying ? (
                            <Pause className="w-4 h-4 text-cyan-400 fill-current" />
                          ) : (
                            <Play className="w-4 h-4 text-cyan-400 fill-current ml-0.5" />
                          )}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className={`text-sm font-semibold truncate ${
                          isCurrent ? 'text-cyan-300' : 'text-slate-100'
                        }`}>
                          {track.title}
                        </h4>
                        <p className="text-xs text-slate-400 truncate">{track.artist}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pl-3">
                      {track.durationText && (
                        <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                          {track.durationText}
                        </span>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(track);
                        }}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${
                          liked ? 'text-pink-500' : 'text-slate-400 hover:text-white'
                        }`}
                        aria-label={liked ? 'Unlike' : 'Like'}
                      >
                        <Heart className={`w-4 h-4 ${liked ? 'fill-pink-500' : ''}`} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!isSearching && searchQuery && searchResults.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-base font-semibold">No results found for "{searchQuery}"</p>
              <p className="text-xs text-slate-500 mt-1">Try searching by artist name or song title.</p>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 3: MY LIBRARY --- */}
      {activeTab === 'library' && (
        <div className="space-y-8 animate-in fade-in duration-300 max-w-5xl mx-auto">
          
          {/* Library Sub-sections: Liked Songs, Playlists, History */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Liked Songs Tile */}
            <div 
              onClick={() => setSelectedPlaylistId('liked')}
              className={`p-6 rounded-3xl border transition-all cursor-pointer bg-gradient-to-br from-pink-950/40 to-purple-950/40 ${
                selectedPlaylistId === 'liked' ? 'border-pink-500' : 'border-pink-500/20 hover:border-pink-500/40'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center mb-4 border border-pink-500/30">
                <Heart className="w-6 h-6 fill-pink-500" />
              </div>
              <h3 className="text-lg font-bold text-white">Liked Songs</h3>
              <p className="text-xs text-slate-400 mt-1">{library.likedTracks.length} tracks favorited</p>
            </div>

            {/* Recently Played Tile */}
            <div 
              onClick={() => setSelectedPlaylistId('history')}
              className={`p-6 rounded-3xl border transition-all cursor-pointer bg-gradient-to-br from-cyan-950/40 to-blue-950/40 ${
                selectedPlaylistId === 'history' ? 'border-cyan-400' : 'border-cyan-500/20 hover:border-cyan-500/40'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4 border border-cyan-500/30">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Recently Played</h3>
              <p className="text-xs text-slate-400 mt-1">{library.recentlyPlayed.length} tracks listened</p>
            </div>

            {/* Custom Playlists Tile */}
            <div 
              onClick={() => setShowCreateModal(true)}
              className="p-6 rounded-3xl border border-dashed border-white/20 hover:border-cyan-400/60 bg-white/5 transition-all cursor-pointer flex flex-col justify-center items-center text-center group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 group-hover:bg-cyan-500/20 group-hover:text-cyan-400 text-slate-400 flex items-center justify-center mb-2 transition-colors">
                <FolderPlus className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-white">Create New Playlist</h4>
              <p className="text-xs text-slate-400 mt-0.5">Organize your offline music mixes</p>
            </div>
          </div>

          {/* Active List Display */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                {selectedPlaylistId === 'history' ? 'Listening History' : 'Favorited Songs'}
              </h3>
              {(selectedPlaylistId === 'history' ? library.recentlyPlayed : library.likedTracks).length > 0 && (
                <button
                  onClick={() => {
                    const list = selectedPlaylistId === 'history' ? library.recentlyPlayed : library.likedTracks;
                    if (list[0]) handlePlayTrack(list[0], list);
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-400 text-black text-xs font-bold flex items-center gap-1.5 hover:bg-cyan-300 transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play All</span>
                </button>
              )}
            </div>

            {/* Sponsor Ad Banner in Library Tab */}
            <div 
              onClick={() => triggerSponsorHyperlink()}
              className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-cyan-500/10 border border-amber-500/30 hover:border-amber-400/60 transition cursor-pointer flex items-center justify-between gap-3 text-xs shadow-md group"
            >
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold text-[10px] uppercase border border-amber-400/30">
                  Featured Sponsor
                </span>
                <span className="text-slate-200 font-medium group-hover:text-amber-300 transition">
                  Enjoying Free Streaming? Check Out Exclusive Offers from OMG10
                </span>
              </div>
              <span className="text-amber-400 font-bold flex items-center gap-1 flex-shrink-0">
                Explore <ExternalLink className="w-3.5 h-3.5" />
              </span>
            </div>

            {((selectedPlaylistId === 'history' ? library.recentlyPlayed : library.likedTracks).length === 0) ? (
              <div className="text-center py-16 text-slate-400 bg-white/5 rounded-3xl border border-white/5">
                <Music className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm">No songs in this list yet.</p>
                <p className="text-xs text-slate-500 mt-1">Search or discover songs to add them to your collection!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {(selectedPlaylistId === 'history' ? library.recentlyPlayed : library.likedTracks).map((track) => (
                  <div
                    key={track.id}
                    onClick={() => handlePlayTrack(track, selectedPlaylistId === 'history' ? library.recentlyPlayed : library.likedTracks)}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <img
                        src={track.thumbnail || '/logo.png'}
                        alt={track.title}
                        className="w-12 h-12 rounded-xl object-cover bg-slate-800"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-slate-100 truncate group-hover:text-cyan-300">
                          {track.title}
                        </h4>
                        <p className="text-xs text-slate-400 truncate">{track.artist}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {track.durationText && (
                        <span className="text-xs font-mono text-slate-400">
                          {track.durationText}
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(track);
                        }}
                        className="p-2 text-pink-500 hover:text-pink-400"
                      >
                        <Heart className="w-4 h-4 fill-pink-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal for Playlist Creation */}
          {showCreateModal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#0b0e1e] border border-cyan-500/40 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-2">Create Playlist</h3>
                <p className="text-xs text-slate-400 mb-4">Give your playlist a name to start adding tracks.</p>
                <form onSubmit={handleCreatePlaylist} className="space-y-4">
                  <input
                    type="text"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="e.g., Midnight Chill, Workout Energy"
                    className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-400"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-400 text-black hover:bg-cyan-300"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* --- TAB 4: GPL-3.0 & CREDITS --- */}
      {activeTab === 'about' && (
        <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto">
          
          <div className="p-8 rounded-3xl bg-[#0d1124] border border-cyan-500/30 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">GNU General Public License v3.0 (GPL-3.0)</h3>
                <p className="text-xs font-mono text-cyan-300">Open-Source Transparency & Attribution Notice</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              <strong>Gen Music</strong> is free and open-source software licensed under the <strong>GNU General Public License v3.0 (GPL-3.0)</strong>. 
              This web platform is forked from and inspired by the open-source <strong>Echo Music</strong> Android application.
            </p>

            {/* Upstream Repositories */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">Core Upstream & Open-Source Projects</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href="https://github.com/EchoMusicApp/Echo-Music"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400 transition-all flex items-center justify-between group"
                >
                  <div>
                    <h5 className="text-sm font-semibold text-white group-hover:text-cyan-300 flex items-center gap-1.5">
                      Echo Music (Android) <ExternalLink className="w-3.5 h-3.5" />
                    </h5>
                    <p className="text-xs text-slate-400 mt-0.5">Primary upstream architecture & Innertube logic</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">GPL-3.0</span>
                </a>

                <a
                  href="https://lrclib.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400 transition-all flex items-center justify-between group"
                >
                  <div>
                    <h5 className="text-sm font-semibold text-white group-hover:text-cyan-300 flex items-center gap-1.5">
                      LRCLIB Lyrics Database <ExternalLink className="w-3.5 h-3.5" />
                    </h5>
                    <p className="text-xs text-slate-400 mt-0.5">Time-coded synchronized lyrics API service</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">Open API</span>
                </a>

                <a
                  href="https://github.com/MetrolistApp/Metrolist"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400 transition-all flex items-center justify-between group"
                >
                  <div>
                    <h5 className="text-sm font-semibold text-white group-hover:text-cyan-300 flex items-center gap-1.5">
                      Metrolist <ExternalLink className="w-3.5 h-3.5" />
                    </h5>
                    <p className="text-xs text-slate-400 mt-0.5">Playback engine & music queue paradigms</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">GPL-3.0</span>
                </a>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-semibold text-white">Better Lyrics & InnerTube Community</h5>
                    <p className="text-xs text-slate-400 mt-0.5">Reverse-engineering specs & audio format handling</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">Community</span>
                </div>
              </div>
            </div>

            {/* License details */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 font-mono text-xs text-slate-400 space-y-2">
              <p className="text-slate-300 font-semibold">GPL-3.0 Compliance Verification:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Complete modified source code is published under GPL-3.0.</li>
                <li>Original unmodified <code className="text-cyan-300">LICENSE</code> file is included in root directory.</li>
                <li>Comprehensive <code className="text-cyan-300">CREDITS.md</code> acknowledges upstream authors and dependencies.</li>
                <li>No login, authentication, or paywall is enforced. Access is free and public.</li>
              </ul>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
