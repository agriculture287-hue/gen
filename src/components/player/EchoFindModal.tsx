import React, { useState, useEffect } from 'react';
import { X, Mic, Radio, Play, Heart, Sparkles, CheckCircle2, Music2, RefreshCw } from 'lucide-react';
import { useMusicPlayer } from '../../context/MusicPlayerContext';
import { RecognizedSongResult } from '../../types/music';

export const EchoFindModal: React.FC = () => {
  const {
    isEchoFindOpen,
    setIsEchoFindOpen,
    recognizeSong,
    playTrack,
    toggleLike,
    isLiked
  } = useMusicPlayer();

  const [isListening, setIsListening] = useState<boolean>(false);
  const [result, setResult] = useState<RecognizedSongResult | null>(null);
  const [manualQuery, setManualQuery] = useState<string>('');
  const [statusText, setStatusText] = useState<string>('Tap microphone to identify nearby playing music');

  useEffect(() => {
    if (isEchoFindOpen) {
      setResult(null);
      setIsListening(false);
      setStatusText('Tap microphone to identify music around you with Echo Find');
    }
  }, [isEchoFindOpen]);

  if (!isEchoFindOpen) return null;

  const handleStartListening = async () => {
    setIsListening(true);
    setResult(null);
    setStatusText('Listening for audio acoustic fingerprint...');

    // Simulate acoustic sampling delay
    setTimeout(async () => {
      setStatusText('Matching against Echo Music database...');
      const match = await recognizeSong(manualQuery || undefined);
      setIsListening(false);
      if (match) {
        setResult(match);
        setStatusText('Song Identified!');
      } else {
        setStatusText('No match found. Please try humming or playing closer to the mic.');
      }
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#0d1326] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.8)] text-center space-y-6 overflow-hidden"
      >
        {/* Background glow circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-9 h-9 rounded-xl bg-cyan-400 text-black flex items-center justify-center font-black">
              <Radio className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                Echo Find
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                  Audio AI
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Acoustic Audio Recognizer & Music Identifier</p>
            </div>
          </div>
          <button
            onClick={() => setIsEchoFindOpen(false)}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Animated Listening Radar or Result */}
        {!result ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-6">
            <div className="relative flex items-center justify-center">
              {/* Pulsing radar ripples */}
              {isListening && (
                <>
                  <div className="absolute w-44 h-44 rounded-full bg-cyan-400/20 animate-ping opacity-75" />
                  <div className="absolute w-56 h-56 rounded-full border border-cyan-400/30 animate-pulse" />
                </>
              )}

              <button
                onClick={handleStartListening}
                disabled={isListening}
                className={`w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl cursor-pointer ${
                  isListening
                    ? 'bg-gradient-to-tr from-cyan-400 to-blue-600 scale-110 shadow-cyan-500/50'
                    : 'bg-gradient-to-tr from-cyan-500 to-indigo-600 hover:scale-105 shadow-cyan-500/30 hover:shadow-cyan-400/50'
                }`}
              >
                <Mic className={`w-12 h-12 text-black ${isListening ? 'animate-bounce' : ''}`} />
                <span className="text-[11px] font-bold text-black uppercase tracking-wider mt-1">
                  {isListening ? 'Listening...' : 'Tap To Find'}
                </span>
              </button>
            </div>

            <div className="space-y-1 max-w-sm mx-auto">
              <p className="text-sm font-semibold text-cyan-300">{statusText}</p>
              <p className="text-xs text-slate-400">
                Hold your device near the speaker or search by lyrics & song snippet
              </p>
            </div>

            {/* Quick snippet text matcher input */}
            <div className="w-full flex items-center gap-2 p-1.5 rounded-2xl bg-black/40 border border-white/10">
              <input
                type="text"
                placeholder="Or type lyrics snippet / song snippet..."
                value={manualQuery}
                onChange={(e) => setManualQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleStartListening();
                }}
                className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                onClick={handleStartListening}
                className="px-3 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-bold transition cursor-pointer"
              >
                Match
              </button>
            </div>
          </div>
        ) : (
          /* Match result card */
          <div className="space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-bold font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Match Identified ({Math.round(result.confidence * 100)}% Confidence)</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 flex items-center gap-4 text-left shadow-lg">
              <img
                src={result.track.thumbnail}
                alt={result.track.title}
                className="w-20 h-20 rounded-xl object-cover shadow-md flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-mono text-cyan-400 uppercase">Echo Find Match</span>
                <h4 className="text-base font-bold text-white truncate">{result.track.title}</h4>
                <p className="text-xs text-slate-300 truncate">{result.track.artist}</p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  Album: {result.album || result.track.album || 'Single'}
                </p>
              </div>
              <button
                onClick={() => toggleLike(result.track)}
                className={`p-2.5 rounded-xl border transition ${
                  isLiked(result.track.id)
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                    : 'bg-slate-800 border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked(result.track.id) ? 'fill-current' : ''}`} />
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  playTrack(result.track);
                  setIsEchoFindOpen(false);
                }}
                className="flex-1 py-3 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-400/30 transition cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                Play Song Now
              </button>
              <button
                onClick={() => {
                  setResult(null);
                  handleStartListening();
                }}
                className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Find Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
