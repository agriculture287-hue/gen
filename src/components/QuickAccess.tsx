import React, { useState } from 'react';
import { 
  Heart, 
  History, 
  DownloadCloud, 
  ListMusic, 
  Play, 
  Music, 
  Trash2, 
  Check, 
  ExternalLink,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Track } from '../types';

interface QuickAccessProps {
  likedTracks: Track[];
  historyTracks: Track[];
  downloadedTracks: Track[];
  onPlayTrack: (track: Track) => void;
  currentTrackId?: string;
  isPlaying: boolean;
}

type TabType = 'liked' | 'history' | 'downloads' | 'playlists';

export const QuickAccess: React.FC<QuickAccessProps> = ({
  likedTracks,
  historyTracks,
  downloadedTracks,
  onPlayTrack,
  currentTrackId,
  isPlaying,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('liked');

  const cards = [
    {
      id: 'liked' as TabType,
      title: 'Liked Music',
      count: `${likedTracks.length} tracks`,
      desc: 'Favorites saved across YouTube and Spotify',
      icon: Heart,
      color: 'from-pink-500/20 to-rose-600/10',
      iconColor: 'text-pink-400',
      borderColor: 'border-pink-500/30',
      activeGlow: 'shadow-[0_0_25px_rgba(236,72,153,0.3)]',
    },
    {
      id: 'history' as TabType,
      title: 'History',
      count: `${historyTracks.length} recently played`,
      desc: 'Quickly resume previous sessions and mixes',
      icon: History,
      color: 'from-purple-500/20 to-indigo-600/10',
      iconColor: 'text-purple-400',
      borderColor: 'border-purple-500/30',
      activeGlow: 'shadow-[0_0_25px_rgba(168,85,247,0.3)]',
    },
    {
      id: 'downloads' as TabType,
      title: 'Downloads',
      count: `${downloadedTracks.length} cached offline`,
      desc: 'Stored on device with Dolby 320kbps fidelity',
      icon: DownloadCloud,
      color: 'from-cyan-500/20 to-blue-600/10',
      iconColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/30',
      activeGlow: 'shadow-[0_0_25px_rgba(0,240,255,0.3)]',
    },
    {
      id: 'playlists' as TabType,
      title: 'Your Playlists',
      count: '8 custom collections',
      desc: 'Synchronized cross-platform audio lists',
      icon: ListMusic,
      color: 'from-blue-500/20 to-cyan-600/10',
      iconColor: 'text-blue-400',
      borderColor: 'border-blue-500/30',
      activeGlow: 'shadow-[0_0_25px_rgba(59,130,246,0.3)]',
    },
  ];

  // Pick list based on active tab
  const getActiveList = (): Track[] => {
    switch (activeTab) {
      case 'liked': return likedTracks;
      case 'history': return historyTracks;
      case 'downloads': return downloadedTracks;
      default: return likedTracks;
    }
  };

  const currentList = getActiveList();

  return (
    <section 
      id="downloads" 
      aria-label="Quick Access Library"
      className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Personal Vault
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
          Quick <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">Access</span>
        </h2>
        <p className="text-neutral-400 text-sm mt-1">
          Instant jump points to your personalized library, offline vault, and playback timeline.
        </p>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c) => {
          const Icon = c.icon;
          const isActive = activeTab === c.id;

          return (
            <div
              key={c.id}
              id={`quick-access-${c.id}`}
              onClick={() => setActiveTab(c.id)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 relative overflow-hidden backdrop-blur-xl ${
                isActive
                  ? `bg-white/[0.08] ${c.borderColor} ${c.activeGlow} scale-[1.02]`
                  : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05] hover:border-white/20'
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${c.color} opacity-40 pointer-events-none`} />

              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl bg-black/40 border border-white/10 ${c.iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-semibold text-neutral-300 px-2 py-0.5 rounded-full bg-black/40 border border-white/10">
                    {c.count}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight font-heading">
                    {c.title}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed line-clamp-2">
                    {c.desc}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-medium text-neutral-400">
                  <span className={isActive ? 'text-cyan-400 font-semibold' : ''}>
                    {isActive ? 'Currently viewing' : 'Click to view'}
                  </span>
                  <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'translate-x-1 text-cyan-400' : ''}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Embedded Drawer / Active List Preview */}
      <div className="mt-8 p-6 rounded-2xl glass-panel border border-white/10 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <h4 className="text-base font-bold text-white">
              {cards.find(c => c.id === activeTab)?.title} Items
            </h4>
            <span className="text-xs text-neutral-400 font-mono">
              ({currentList.length} tracks available)
            </span>
          </div>

          <div className="text-xs text-cyan-400 font-medium hidden sm:flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> High Quality Cached
          </div>
        </div>

        {currentList.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 text-sm">
            No tracks in this category yet. Tap the heart or download button on any song!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentList.map((track) => {
              const isCurrent = currentTrackId === track.id;

              return (
                <div
                  key={track.id}
                  id={`quick-item-${track.id}`}
                  onClick={() => onPlayTrack(track)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition border ${
                    isCurrent && isPlaying
                      ? 'bg-cyan-500/15 border-cyan-500/40 shadow-sm'
                      : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.06] hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                        <Play className="w-4 h-4 text-white fill-white" />
                      </div>
                    </div>

                    <div className="min-w-0">
                      <h5 className={`text-sm font-semibold truncate ${isCurrent ? 'text-cyan-300' : 'text-white'}`}>
                        {track.title}
                      </h5>
                      <p className="text-xs text-neutral-400 truncate">
                        {track.artist} • <span className="font-mono">{track.duration}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      track.source === 'spotify' 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      {track.source}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayTrack(track);
                      }}
                      className="p-2 rounded-full bg-white/10 hover:bg-cyan-400 hover:text-black text-white transition"
                    >
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
