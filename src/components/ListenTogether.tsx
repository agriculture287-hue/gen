import React, { useState } from 'react';
import { 
  Users, 
  Radio, 
  Share2, 
  Sparkles, 
  MessageSquare, 
  Heart, 
  Flame, 
  Check, 
  Volume2,
  Headphones,
  Plus
} from 'lucide-react';
import { Track } from '../types';

interface ListenTogetherProps {
  currentTrack: Track;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const ListenTogether: React.FC<ListenTogetherProps> = ({
  currentTrack,
  isPlaying,
  onTogglePlay,
}) => {
  const [copied, setCopied] = useState(false);
  const [reactions, setReactions] = useState<{ id: number; emoji: string; x: number }[]>([]);
  const [activeMembers, setActiveMembers] = useState(4);

  const mockUsers = [
    { name: 'Elena R.', role: 'DJ Host', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80', active: true },
    { name: 'Marcus K.', role: 'Listener', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80', active: true },
    { name: 'Aria S.', role: 'Listener', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80', active: true },
    { name: 'David L.', role: 'Listener', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80', active: true },
  ];

  const handleShareRoom = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendReaction = (emoji: string) => {
    const newReaction = {
      id: Date.now(),
      emoji,
      x: 30 + Math.random() * 40,
    };
    setReactions((prev) => [...prev, newReaction]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 2000);
  };

  return (
    <section 
      id="listen-together" 
      aria-label="Listen Together Social Hub"
      className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      <div className="relative rounded-3xl glass-panel p-8 sm:p-10 border border-white/15 overflow-hidden shadow-2xl">
        
        {/* Neon Glow backdrop */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Text / Info */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 animate-pulse text-pink-400" />
              <span>Social Sync Engine</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-heading">
              Listen <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">Together</span>
            </h2>

            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-xl">
              Host private sound rooms or join public party sessions with zero latency. 
              Sync playback millisecond-perfect across continents while chatting and dropping live reactions in Dolby 3D audio.
            </p>

            {/* Live Room Stats / Avatars */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="flex -space-x-3 overflow-hidden">
                {mockUsers.map((user, i) => (
                  <img
                    key={i}
                    src={user.avatar}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-[#050505] object-cover"
                  />
                ))}
              </div>

              <div className="text-xs text-neutral-300">
                <span className="text-white font-bold block">{activeMembers} friends listening together</span>
                <span className="text-emerald-400 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Synced via WebRTC High-Fidelity
                </span>
              </div>
            </div>

            {/* Room Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <button
                onClick={handleShareRoom}
                id="share-room-invite-btn"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-xs sm:text-sm hover:opacity-95 shadow-lg shadow-purple-500/25 transition flex items-center gap-2 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? 'Room Link Copied!' : 'Invite Friends to Room'}</span>
              </button>

              <button
                onClick={() => setActiveMembers(prev => prev + 1)}
                id="create-private-room-btn"
                className="px-5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 hover:bg-white/[0.1] text-white font-medium text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>Create New Room</span>
              </button>
            </div>
          </div>

          {/* Right Live Room Preview Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-black/60 border border-white/15 p-6 backdrop-blur-xl shadow-2xl space-y-4">
              
              {/* Floating Live Reactions Container */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {reactions.map((r) => (
                  <span
                    key={r.id}
                    className="absolute text-2xl animate-in fade-in slide-out-to-top-20 duration-1000"
                    style={{ left: `${r.x}%`, bottom: '40px' }}
                  >
                    {r.emoji}
                  </span>
                ))}
              </div>

              {/* Room Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Room: Cyber Chill #404
                  </span>
                </div>
                <span className="text-[11px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                  Bitrate: 320kbps
                </span>
              </div>

              {/* Current Synced Track */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider block">
                    Now Playing in Room
                  </span>
                  <h4 className="text-sm font-bold text-white truncate">
                    {currentTrack.title}
                  </h4>
                  <p className="text-xs text-neutral-400 truncate">
                    {currentTrack.artist}
                  </p>
                </div>
                <button
                  onClick={onTogglePlay}
                  className="p-2.5 rounded-full bg-cyan-400 text-black font-bold hover:scale-105 transition"
                  aria-label="Toggle synced room audio"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Live Chat Reaction Bar */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] text-neutral-400 block">
                  Tap to drop soundstage reactions:
                </span>
                <div className="flex items-center justify-between gap-2">
                  {['🔥', '❤️', '⚡', '🎧', '🚀', '✨'].map((emoji, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendReaction(emoji)}
                      className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.15] border border-white/[0.08] hover:border-pink-500/40 text-lg transition transform active:scale-125 cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
