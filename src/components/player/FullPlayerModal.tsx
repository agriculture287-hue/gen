import React, { useState } from 'react';
import { 
  ChevronDown, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Heart, 
  ListMusic, 
  Mic2, 
  Repeat, 
  Repeat1, 
  Shuffle, 
  Disc3, 
  Sliders, 
  Share2,
  Sparkles,
  ExternalLink,
  Moon,
  Palette,
  Layers,
  Radio,
  Clock,
  ShieldCheck,
  Youtube
} from 'lucide-react';
import { useMusicPlayer } from '../../context/MusicPlayerContext';
import { triggerSponsorHyperlink } from '../../utils/downloadHelper';

function formatSeconds(sec: number): string {
  if (!sec || isNaN(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const FullPlayerModal: React.FC = () => {
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
    isFullPlayerOpen,
    setIsFullPlayerOpen,
    setIsLyricsOpen,
    setIsQueueOpen,
    setIsEqualizerOpen,
    setIsSleepTimerOpen,
    setIsAdBlockModalOpen,
    setIsYtSignInModalOpen,
    adBlockState,
    ytAccount,
    playerTheme,
    setPlayerTheme,
    openArtist,
    openAlbum,
    sleepTimer,
    lyrics,
    currentLyricIndex,
  } = useMusicPlayer();

  const [activeTab, setActiveTab] = useState<'cover' | 'lyrics'>('cover');

  if (!isFullPlayerOpen || !currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const liked = isLiked(currentTrack.id);

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const target = (val / 100) * (duration || 1);
    seek(target);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#07080e] flex flex-col text-slate-100 overflow-y-auto animate-in slide-in-from-bottom duration-300 select-none"
      role="dialog"
      aria-label="Full Player"
    >
      {/* Background ambient lighting based on theme */}
      <div 
        className="fixed inset-0 pointer-events-none -z-10 transition-all duration-1000 overflow-hidden"
      >
        {playerTheme === 'apple' ? (
          /* Apple Music style blurred fluid background canvas */
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/40 via-cyan-900/30 to-pink-900/40 backdrop-blur-3xl opacity-70">
            <img 
              src={currentTrack.thumbnail} 
              alt="ambient" 
              className="w-full h-full object-cover filter blur-3xl opacity-50 scale-150 transform animate-pulse" 
            />
          </div>
        ) : (
          /* Material You style ambient glow */
          <div 
            className="w-full h-full opacity-35 blur-3xl scale-125 transition-all duration-1000"
            style={{
              backgroundImage: `radial-gradient(circle at center, rgba(0, 240, 255, 0.45) 0%, rgba(138, 43, 226, 0.25) 50%, transparent 80%)`,
            }}
          />
        )}
      </div>

      {/* Top Header */}
      <div className="max-w-4xl mx-auto w-full px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => setIsFullPlayerOpen(false)}
          className="p-2 text-slate-400 hover:text-white rounded-2xl hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Minimize player"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        {/* Mode switcher: Cover / Synced Lyrics */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('cover')}
            className={`px-4 py-1.5 rounded-xl font-medium transition-all ${
              activeTab === 'cover'
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Track View
          </button>
          <button
            onClick={() => setActiveTab('lyrics')}
            className={`px-4 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'lyrics'
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mic2 className="w-3.5 h-3.5" />
            <span>Lyrics</span>
          </button>
        </div>

        {/* Controls: AdBlock, YouTube, Equalizer, Sleep Timer & Queue */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsAdBlockModalOpen(true)}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              adBlockState.enabled ? 'text-emerald-400 bg-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Echo AdBlock & SponsorBlock"
          >
            <ShieldCheck className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsYtSignInModalOpen(true)}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              ytAccount.signedIn ? 'text-red-400 bg-red-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="YouTube Account Sign In"
          >
            <Youtube className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsEqualizerOpen(true)}
            className="p-2 text-slate-400 hover:text-cyan-300 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            title="Axion 5-Band Equalizer"
          >
            <Sliders className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsSleepTimerOpen(true)}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              sleepTimer.active ? 'text-indigo-400 bg-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Sleep Timer"
          >
            <Moon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsQueueOpen(true)}
            className="p-2 text-slate-400 hover:text-white rounded-2xl hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Open queue"
          >
            <ListMusic className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full px-6 py-4">
        {activeTab === 'cover' ? (
          <div className="flex flex-col items-center w-full">
            {/* Holographic Album Art or Vinyl Canvas */}
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 my-4 group">
              <div 
                className={`absolute inset-0 rounded-3xl bg-gradient-to-tr from-cyan-500/30 to-purple-600/30 blur-2xl transition-all duration-700 pointer-events-none ${
                  isPlaying ? 'opacity-80 scale-105' : 'opacity-30'
                }`}
              />
              
              {playerTheme === 'canvas' ? (
                /* Vinyl Disc mode */
                <div className={`w-full h-full rounded-full border-4 border-slate-800 bg-black shadow-2xl p-6 flex items-center justify-center relative overflow-hidden ${
                  isPlaying ? 'animate-[spin_12s_linear_infinite]' : ''
                }`}>
                  <img
                    src={currentTrack.thumbnail}
                    alt={currentTrack.title}
                    className="w-32 h-32 rounded-full object-cover border-4 border-black"
                  />
                  <div className="w-6 h-6 rounded-full bg-slate-900 border-2 border-slate-700 absolute" />
                </div>
              ) : (
                /* Standard Hi-Res Art */
                <img
                  src={currentTrack.thumbnail}
                  alt={currentTrack.title}
                  className="relative w-full h-full object-cover rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10"
                />
              )}
            </div>

            {/* Quick mini lyrics line preview */}
            {lyrics && lyrics.lines && lyrics.lines.length > 0 && currentLyricIndex >= 0 && (
              <p 
                onClick={() => setActiveTab('lyrics')}
                className="text-xs sm:text-sm font-semibold text-cyan-300 text-center truncate max-w-md py-1.5 px-4 rounded-full bg-cyan-500/10 border border-cyan-500/20 my-2 cursor-pointer hover:bg-cyan-500/20 transition animate-in fade-in"
              >
                "{lyrics.lines[currentLyricIndex]?.text}"
              </p>
            )}
          </div>
        ) : (
          /* Synced Lyrics in-player view */
          <div className="w-full h-80 sm:h-96 flex flex-col justify-center items-center overflow-y-auto space-y-4 px-4 text-center my-4 font-sans">
            {lyrics && lyrics.synced && lyrics.lines && lyrics.lines.length > 0 ? (
              lyrics.lines.map((line, idx) => {
                const isActive = currentLyricIndex === idx;
                return (
                  <p
                    key={idx}
                    onClick={() => seek(line.time)}
                    className={`transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'text-lg sm:text-2xl font-black text-cyan-300 scale-105 drop-shadow-[0_0_12px_rgba(0,240,255,0.6)]'
                        : 'text-sm sm:text-base font-semibold text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {line.text}
                  </p>
                );
              })
            ) : (
              <div className="text-center text-slate-400 space-y-2">
                <Mic2 className="w-10 h-10 mx-auto text-slate-600" />
                <p className="text-sm">
                  {lyrics?.plainText || 'Loading live lyrics...'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Track Title and Artist (Click opens artist modal) */}
        <div className="w-full flex items-center justify-between mt-4">
          <div className="min-w-0 flex-1 pr-4">
            <h3 className="text-xl sm:text-2xl font-bold text-white truncate" title={currentTrack.title}>
              {currentTrack.title}
            </h3>
            <p 
              onClick={() => openArtist(currentTrack.artist)}
              className="text-sm sm:text-base text-slate-400 truncate mt-0.5 hover:text-cyan-300 hover:underline cursor-pointer"
            >
              {currentTrack.artist}
            </p>
          </div>
          <button
            onClick={() => toggleLike(currentTrack)}
            className={`p-2.5 rounded-2xl transition-all cursor-pointer ${
              liked
                ? 'text-pink-500 bg-pink-500/10 border border-pink-500/30'
                : 'text-slate-400 hover:text-white bg-white/5'
            }`}
            aria-label={liked ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-6 h-6 ${liked ? 'fill-pink-500' : ''}`} />
          </button>
        </div>

        {/* Scrub Slider */}
        <div className="w-full mt-6">
          <div className="relative w-full h-2 bg-slate-800 rounded-full cursor-pointer group">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={progressPercent || 0}
              onChange={handleSeekChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <div className="flex justify-between items-center text-xs font-mono text-slate-400 mt-2">
            <span>{formatSeconds(currentTime)}</span>
            <span>{formatSeconds(duration || currentTrack.durationSeconds || 0)}</span>
          </div>
        </div>

        {/* Big Media Controls */}
        <div className="w-full flex items-center justify-between mt-6 px-4">
          <button
            onClick={toggleShuffle}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              shuffle ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-400 hover:text-white'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button
            onClick={playPrev}
            className="p-3 text-slate-200 hover:text-white transition-colors cursor-pointer"
            aria-label="Previous track"
          >
            <SkipBack className="w-7 h-7" />
          </button>

          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(0,240,255,0.5)] cursor-pointer"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isBuffering ? (
              <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current ml-1" />
            )}
          </button>

          <button
            onClick={playNext}
            className="p-3 text-slate-200 hover:text-white transition-colors cursor-pointer"
            aria-label="Next track"
          >
            <SkipForward className="w-7 h-7" />
          </button>

          <button
            onClick={toggleRepeat}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              repeatMode !== 'off' ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-400 hover:text-white'
            }`}
            title={`Repeat mode: ${repeatMode}`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
          </button>
        </div>

        {/* Volume Bar */}
        <div className="w-full flex items-center justify-center gap-3 mt-8 max-w-xs">
          <button
            onClick={toggleMute}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-5 h-5 text-pink-400" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseInt(e.target.value, 10))}
            className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Sponsor Ad Banner inside Player */}
        <div 
          onClick={() => triggerSponsorHyperlink()}
          className="w-full max-w-lg mt-6 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-cyan-500/15 border border-amber-500/30 hover:border-amber-400/60 transition cursor-pointer flex items-center justify-between gap-3 text-xs shadow-lg group"
        >
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold text-[10px] uppercase border border-amber-400/30">
              Sponsored Offer
            </span>
            <span className="text-slate-200 font-semibold group-hover:text-amber-300 transition">
              OMG10 Exclusive Deals & Listener Rewards
            </span>
          </div>
          <span className="text-amber-400 font-bold flex items-center gap-1 flex-shrink-0">
            Claim <ExternalLink className="w-3.5 h-3.5" />
          </span>
        </div>

      </div>

      {/* Attribution footer */}
      <div className="py-4 text-center text-xs font-mono text-slate-400 border-t border-white/5">
        Gen Music • GPL-3.0 Fork of Echo Music
      </div>
    </div>
  );
};
