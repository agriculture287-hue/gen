import React, { useEffect, useRef, useState } from 'react';
import { X, Mic2, FileText, Check, Copy, ExternalLink, Sparkles, FastForward, Rewind, RotateCcw, Globe } from 'lucide-react';
import { useMusicPlayer } from '../../context/MusicPlayerContext';
import { triggerSponsorHyperlink } from '../../utils/downloadHelper';

export const SyncedLyricsView: React.FC = () => {
  const {
    currentTrack,
    lyrics,
    isLoadingLyrics,
    currentLyricIndex,
    currentTime,
    seek,
    isLyricsOpen,
    setIsLyricsOpen,
    lyricsOffset,
    setLyricsOffset,
    isRomanized,
    setIsRomanized
  } = useMusicPlayer();

  const [viewMode, setViewMode] = useState<'synced' | 'plain'>('synced');
  const [copied, setCopied] = useState(false);
  const activeLineRef = useRef<HTMLParagraphElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active line smoothly
  useEffect(() => {
    if (viewMode === 'synced' && activeLineRef.current && scrollContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentLyricIndex, viewMode]);

  if (!isLyricsOpen || !currentTrack) return null;

  const handleCopy = () => {
    if (lyrics?.plainText) {
      navigator.clipboard.writeText(lyrics.plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#07080e]/95 backdrop-blur-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200"
      role="dialog"
      aria-label="Synchronized Lyrics"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Mic2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-white truncate flex items-center gap-2">
              {currentTrack.title}
              {lyrics?.synced && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  LRCLIB Synced
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400 truncate">{currentTrack.artist}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Offset Adjuster */}
          {lyrics?.synced && (
            <div className="hidden sm:flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-xl border border-white/5 text-[11px] font-mono">
              <span className="text-slate-400 mr-1">Sync:</span>
              <button
                onClick={() => setLyricsOffset(lyricsOffset - 0.5)}
                className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300"
                title="Delay lyrics 0.5s"
              >
                -0.5s
              </button>
              <span className="text-cyan-400 font-bold px-1">
                {lyricsOffset > 0 ? `+${lyricsOffset.toFixed(1)}s` : `${lyricsOffset.toFixed(1)}s`}
              </span>
              <button
                onClick={() => setLyricsOffset(lyricsOffset + 0.5)}
                className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300"
                title="Speed up lyrics 0.5s"
              >
                +0.5s
              </button>
              {lyricsOffset !== 0 && (
                <button
                  onClick={() => setLyricsOffset(0)}
                  className="p-1 hover:text-white text-slate-400 ml-1"
                  title="Reset offset"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {lyrics?.lines && lyrics.lines.length > 0 && (
            <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-white/5 text-xs">
              <button
                onClick={() => setViewMode('synced')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  viewMode === 'synced'
                    ? 'bg-cyan-500 text-black shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Karaoke
              </button>
              <button
                onClick={() => setViewMode('plain')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  viewMode === 'plain'
                    ? 'bg-cyan-500 text-black shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Text
              </button>
            </div>
          )}

          <button
            onClick={handleCopy}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            title="Copy plain lyrics"
            aria-label="Copy lyrics"
          >
            {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setIsLyricsOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer ml-2"
            aria-label="Close lyrics"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Lyrics Container */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-6 py-12 max-w-4xl mx-auto w-full text-center scroll-smooth selection:bg-cyan-500 selection:text-black"
      >
        {isLoadingLyrics ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-mono text-cyan-300">Synchronizing lyrics via LRCLIB...</p>
          </div>
        ) : !lyrics || (!lyrics.lines.length && !lyrics.plainText) ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
            <Mic2 className="w-12 h-12 text-slate-600" />
            <p className="text-base font-medium">No synchronized lyrics found for this track.</p>
            <p className="text-xs text-slate-500">Enjoy the music streaming on Gen Music!</p>
          </div>
        ) : viewMode === 'synced' && lyrics.lines.length > 0 ? (
          <div className="space-y-6 max-w-2xl mx-auto py-10">
            {lyrics.lines.map((line, idx) => {
              const isActive = idx === currentLyricIndex;
              const isPast = idx < currentLyricIndex;

              return (
                <p
                  key={`${line.time}-${idx}`}
                  ref={isActive ? activeLineRef : null}
                  onClick={() => seek(line.time)}
                  className={`text-xl sm:text-2xl md:text-3xl font-bold transition-all duration-300 cursor-pointer select-none leading-relaxed ${
                    isActive
                      ? 'text-cyan-300 scale-105 drop-shadow-[0_0_20px_rgba(0,240,255,0.7)]'
                      : isPast
                      ? 'text-slate-500 hover:text-slate-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={`Jump to ${Math.floor(line.time / 60)}:${Math.floor(line.time % 60).toString().padStart(2, '0')}`}
                >
                  {line.text}
                </p>
              );
            })}
          </div>
        ) : (
          <div className="max-w-xl mx-auto text-left whitespace-pre-line text-slate-300 text-base sm:text-lg leading-relaxed font-sans py-6">
            {lyrics.plainText}
          </div>
        )}
      </div>

      {/* Sponsor Banner */}
      <div 
        onClick={() => triggerSponsorHyperlink()}
        className="py-2.5 px-4 bg-amber-500/10 border-t border-amber-500/20 text-center text-xs text-amber-300 flex items-center justify-center gap-2 cursor-pointer hover:bg-amber-500/20 transition"
      >
        <span className="font-bold uppercase text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 border border-amber-400/30">Sponsored</span>
        <span>OMG10 Partner Deals: Special Rewards for Music Listeners</span>
        <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
      </div>

      {/* Footer attribution */}
      <div className="py-3 px-6 border-t border-white/5 text-center text-xs font-mono text-slate-400 flex items-center justify-center gap-4">
        <span>Powered by <strong className="text-cyan-400">LRCLIB</strong> & Echo Music innertube</span>
      </div>
    </div>
  );
};
