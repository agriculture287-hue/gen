import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Heart, 
  ListMusic, 
  Mic2, 
  Maximize2, 
  Repeat, 
  Repeat1, 
  Shuffle,
  Music2,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useMusicPlayer } from '../../context/MusicPlayerContext';
import { triggerSponsorHyperlink } from '../../utils/downloadHelper';

function formatSeconds(sec: number): string {
  if (!sec || isNaN(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const MiniPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    isBuffering,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    shuffle,
    isLiked,
    toggleLike,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    playNext,
    playPrev,
    toggleShuffle,
    toggleRepeat,
    setIsFullPlayerOpen,
    setIsQueueOpen,
    setIsLyricsOpen,
    setIsAdBlockModalOpen,
    adBlockState,
    isLyricsOpen,
    isQueueOpen,
  } = useMusicPlayer();

  const [isHoveringSeek, setIsHoveringSeek] = useState(false);
  const [hoverSeekPercent, setHoverSeekPercent] = useState(0);

  if (!currentTrack) {
    return null;
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const liked = isLiked(currentTrack.id);

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const targetSeconds = (val / 100) * (duration || 1);
    seek(targetSeconds);
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#090b14]/95 backdrop-blur-2xl border-t border-cyan-500/20 shadow-[0_-8px_30px_rgba(0,0,0,0.8)] transition-all duration-300"
      role="region"
      aria-label="Audio Player"
    >
      {/* Top Interactive Progress Bar */}
      <div 
        className="relative w-full h-1.5 bg-slate-800/80 cursor-pointer group"
        onMouseEnter={() => setIsHoveringSeek(true)}
        onMouseLeave={() => setIsHoveringSeek(false)}
      >
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 transition-all duration-100"
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
        />
        
        {/* Glow indicator on thumb */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_#00f0ff] opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${progressPercent}% - 6px)` }}
        />

        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={progressPercent || 0}
          onChange={handleSeekChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Seek track position"
        />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Track Metadata & Artwork */}
        <div className="flex items-center gap-3 min-w-0 max-w-[30%] sm:max-w-[280px]">
          <div 
            onClick={() => setIsFullPlayerOpen(true)}
            className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0 cursor-pointer group shadow-md border border-white/10"
          >
            {currentTrack.thumbnail ? (
              <img
                src={currentTrack.thumbnail}
                alt={currentTrack.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-cyan-950/40 text-cyan-400">
                <Music2 className="w-5 h-5" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Maximize2 className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h4 
              onClick={() => setIsFullPlayerOpen(true)}
              className="text-xs sm:text-sm font-semibold text-white truncate cursor-pointer hover:text-cyan-300 transition-colors"
              title={currentTrack.title}
            >
              {currentTrack.title}
            </h4>
            <div className="flex items-center gap-1.5 truncate">
              <p className="text-[11px] text-slate-400 truncate hover:text-slate-300">
                {currentTrack.artist}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  triggerSponsorHyperlink();
                }}
                className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition flex-shrink-0 cursor-pointer"
                title="Sponsor Offer • OMG10"
              >
                Ad
              </button>
            </div>
          </div>

          <button
            onClick={() => toggleLike(currentTrack)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer flex-shrink-0 ${
              liked ? 'text-pink-500 hover:text-pink-400' : 'text-slate-400 hover:text-white'
            }`}
            aria-label={liked ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-pink-500' : ''}`} />
          </button>
        </div>

        {/* Center: Controls & Timer */}
        <div className="flex flex-col items-center flex-1 max-w-xl">
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Shuffle */}
            <button
              onClick={toggleShuffle}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer hidden sm:block ${
                shuffle ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-400 hover:text-white'
              }`}
              title="Shuffle"
              aria-label="Toggle Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            {/* Previous */}
            <button
              onClick={playPrev}
              className="p-1.5 sm:p-2 text-slate-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Previous Track"
            >
              <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] cursor-pointer"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isBuffering ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              ) : (
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={playNext}
              className="p-1.5 sm:p-2 text-slate-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Next Track"
            >
              <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Repeat */}
            <button
              onClick={toggleRepeat}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer hidden sm:block ${
                repeatMode !== 'off' ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-400 hover:text-white'
              }`}
              title={`Repeat: ${repeatMode}`}
              aria-label="Toggle Repeat"
            >
              {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
            </button>

          </div>

          {/* Time display */}
          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono text-slate-400 mt-1">
            <span>{formatSeconds(currentTime)}</span>
            <span>/</span>
            <span>{formatSeconds(duration || currentTrack.durationSeconds || 0)}</span>
          </div>
        </div>

        {/* Right Action Icons: Volume, Lyrics, Queue, Expand */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          
          {/* Synced Lyrics Toggle */}
          <button
            onClick={() => setIsLyricsOpen(!isLyricsOpen)}
            className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              isLyricsOpen
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Real-time Synced Lyrics"
            aria-label="Toggle Lyrics"
          >
            <Mic2 className="w-4 h-4" />
            <span className="text-[11px] font-medium hidden md:inline">Lyrics</span>
          </button>

          {/* Queue Drawer Toggle */}
          <button
            onClick={() => setIsQueueOpen(!isQueueOpen)}
            className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              isQueueOpen
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Play Queue"
            aria-label="Toggle Queue"
          >
            <ListMusic className="w-4 h-4" />
            <span className="text-[11px] font-medium hidden md:inline">Queue</span>
          </button>

          {/* Volume Control */}
          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-800">
            <button
              onClick={toggleMute}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Toggle Mute"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-pink-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseInt(e.target.value, 10))}
              className="w-20 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              aria-label="Volume level"
            />
          </div>

          {/* Echo AdBlock Shield status button */}
          <button
            onClick={() => setIsAdBlockModalOpen(true)}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              adBlockState.enabled ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-500 hover:text-white'
            }`}
            title="Echo AdBlock & SponsorBlock Protected"
            aria-label="AdBlock Settings"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>

          {/* Full Player Expand */}
          <button
            onClick={() => setIsFullPlayerOpen(true)}
            className="p-2 text-slate-400 hover:text-cyan-300 hover:bg-white/5 rounded-xl transition-all cursor-pointer"
            title="Expand Full Player"
            aria-label="Expand Full Player"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

        </div>

      </div>
    </div>
  );
};
