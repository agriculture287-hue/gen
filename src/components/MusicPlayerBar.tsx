import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Heart, 
  Volume2, 
  VolumeX, 
  Headphones, 
  Sliders, 
  Download, 
  Maximize2, 
  Minimize2, 
  Repeat, 
  Shuffle,
  FileAudio,
  Sparkles,
  Timer
} from 'lucide-react';
import { Track } from '../types';

interface MusicPlayerBarProps {
  track: Track;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleLike: (trackId: string) => void;
  dolbyEnabled: boolean;
  onToggleDolby: (enabled: boolean) => void;
  onOpenEQ: () => void;
  volume: number;
  onChangeVolume: (vol: number) => void;
  sleepTimerMinutes: number | null;
  onExportMP3: (track: Track) => void;
}

export const MusicPlayerBar: React.FC<MusicPlayerBarProps> = ({
  track,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrev,
  onToggleLike,
  dolbyEnabled,
  onToggleDolby,
  onOpenEQ,
  volume,
  onChangeVolume,
  sleepTimerMinutes,
  onExportMP3,
}) => {
  const [progressSec, setProgressSec] = useState(24);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Advance progress simulation while playing
  useEffect(() => {
    let timer: number;
    if (isPlaying) {
      timer = window.setInterval(() => {
        setProgressSec((prev) => {
          if (prev >= track.durationSec) {
            onNext();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, track, onNext]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProgressSec(parseInt(e.target.value));
  };

  const handleMuteToggle = () => {
    if (isMuted) {
      onChangeVolume(prevVolume || 0.8);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      onChangeVolume(0);
      setIsMuted(true);
    }
  };

  return (
    <div 
      id="bottom-music-player-bar" 
      aria-label="Floating Player Bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#07070f]/90 backdrop-blur-2xl border-t border-white/10 px-4 py-3 shadow-[0_-10px_35px_rgba(0,0,0,0.8)] transition-all"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* 1. Track Info (Left) */}
        <div className="flex items-center gap-3 w-full sm:w-1/4 min-w-0">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-md flex-shrink-0 group">
            <img
              src={track.coverUrl}
              alt={track.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-white truncate">
                {track.title}
              </h4>
              <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                track.source === 'spotify' 
                  ? 'bg-emerald-500/20 text-emerald-300' 
                  : 'bg-red-500/20 text-red-300'
              }`}>
                {track.source}
              </span>
            </div>
            <p className="text-xs text-neutral-400 truncate">
              {track.artist}
            </p>
          </div>

          {/* Like Heart */}
          <button
            onClick={() => onToggleLike(track.id)}
            id="player-like-btn"
            aria-label={track.liked ? 'Liked' : 'Like'}
            className={`p-2 rounded-full transition flex-shrink-0 ${
              track.liked ? 'text-pink-500 hover:text-pink-400' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${track.liked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* 2. Playback Controls & Timeline (Center) */}
        <div className="flex flex-col items-center w-full sm:w-2/4 max-w-xl space-y-1">
          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsShuffle(!isShuffle)}
              className={`text-xs p-1.5 transition ${isShuffle ? 'text-cyan-400' : 'text-neutral-500 hover:text-neutral-300'}`}
              title="Shuffle"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onPrev}
              id="player-prev-btn"
              aria-label="Previous Track"
              className="text-neutral-300 hover:text-white transition cursor-pointer p-1"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Play/Pause Main Button */}
            <button
              onClick={onTogglePlay}
              id="player-play-pause-btn"
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 text-black flex items-center justify-center shadow-lg shadow-cyan-400/30 hover:scale-105 active:scale-95 transition cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-black" />
              ) : (
                <Play className="w-4 h-4 fill-black ml-0.5" />
              )}
            </button>

            <button
              onClick={onNext}
              id="player-next-btn"
              aria-label="Next Track"
              className="text-neutral-300 hover:text-white transition cursor-pointer p-1"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsRepeat(!isRepeat)}
              className={`text-xs p-1.5 transition ${isRepeat ? 'text-cyan-400' : 'text-neutral-500 hover:text-neutral-300'}`}
              title="Repeat"
            >
              <Repeat className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Time Scrubber */}
          <div className="flex items-center gap-2.5 w-full text-[11px] font-mono text-neutral-400">
            <span className="w-8 text-right">{formatTime(progressSec)}</span>
            
            <input
              type="range"
              min="0"
              max={track.durationSec}
              value={progressSec}
              onChange={handleSeek}
              id="player-progress-slider"
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:h-2 transition-all"
            />

            <span className="w-8">{track.duration}</span>
          </div>
        </div>

        {/* 3. Audio Tools: Dolby, EQ, Export MP3, Volume (Right) */}
        <div className="flex items-center justify-end gap-2.5 w-full sm:w-1/4 flex-shrink-0">
          
          {/* Dolby Audio 3D Toggle */}
          <button
            onClick={() => onToggleDolby(!dolbyEnabled)}
            id="player-dolby-toggle-btn"
            title="Toggle Dolby Audio Virtualizer"
            className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
              dolbyEnabled
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                : 'bg-white/5 text-neutral-500 border border-white/10 hover:text-neutral-300'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span className="text-[10px]">Dolby 3D</span>
          </button>

          {/* EQ Modal trigger */}
          <button
            onClick={onOpenEQ}
            id="player-open-eq-btn"
            title="Open 5-Band Studio Equalizer"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-purple-300 transition cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Export MP3 */}
          <button
            onClick={() => onExportMP3(track)}
            id="player-export-mp3-btn"
            title="Export 320kbps MP3 File"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-cyan-300 transition cursor-pointer"
          >
            <FileAudio className="w-4 h-4" />
          </button>

          {/* Volume Control */}
          <div className="hidden lg:flex items-center gap-1.5">
            <button
              onClick={handleMuteToggle}
              className="text-neutral-400 hover:text-white p-1"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={volume}
              onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
              id="player-volume-slider"
              className="w-16 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Sleep Timer Indicator */}
          {sleepTimerMinutes && (
            <div className="flex items-center gap-1 text-[10px] font-mono text-pink-400 px-1.5 py-0.5 rounded bg-pink-500/10 border border-pink-500/20">
              <Timer className="w-3 h-3" />
              <span>{sleepTimerMinutes}m</span>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
