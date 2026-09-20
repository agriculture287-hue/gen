import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Disc3, Volume2, Sparkles, Radio, Activity, Compass, Zap } from 'lucide-react';

interface HolographicAudio3DProps {
  onPlayToggle?: (isPlaying: boolean) => void;
}

export const HolographicAudio3D: React.FC<HolographicAudio3DProps> = ({ onPlayToggle }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [tilt, setTilt] = useState({ x: 10, y: -12 });
  const [activeFrequency, setActiveFrequency] = useState(432);
  const [activeBpm, setActiveBpm] = useState(128);

  // Subtle interactive mouse tilt tracking in 3D perspective
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate tilt angles: -20deg to +20deg
    const xPct = (x / rect.width - 0.5) * 2;
    const yPct = (y / rect.height - 0.5) * 2;
    
    setTilt({
      x: -yPct * 18,
      y: xPct * 22
    });
  };

  const handleMouseLeave = () => {
    // Return to default resting 3D angle smoothly
    setTilt({ x: 8, y: -10 });
  };

  const togglePlayback = () => {
    const next = !isPlaying;
    setIsPlaying(next);
    if (onPlayToggle) onPlayToggle(next);
  };

  // Simulated frequency modulation
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveFrequency(Math.floor(428 + Math.random() * 8));
    }, 1500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[420px] sm:max-w-[460px] h-[480px] sm:h-[520px] flex items-center justify-center perspective-1400 select-none group"
    >
      {/* 3D Transform Outer Container */}
      <div 
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        className="relative w-full h-full preserve-3d flex items-center justify-center"
      >
        {/* Layer 0: Background Holographic Glow Orb */}
        <div 
          style={{ transform: 'translateZ(-60px)' }}
          className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-cyan-500/20 via-purple-600/25 to-pink-500/20 blur-3xl pointer-events-none animate-pulse-glow" 
        />

        {/* Layer 1: 3D Holographic Outer Ring 1 (Tilted Axis 1) */}
        <div 
          style={{ 
            transform: 'translateZ(-20px) rotateX(65deg) rotateY(15deg)',
            animationPlayState: isPlaying ? 'running' : 'paused'
          }}
          className="absolute w-[360px] h-[360px] sm:w-[420px] sm:h-[420px] rounded-full border border-cyan-500/25 border-dashed animate-holo-3d pointer-events-none"
        >
          {/* Orbiting Satellite Particle */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_12px_#00f0ff]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_#a855f7]" />
        </div>

        {/* Layer 2: 3D Holographic Outer Ring 2 (Counter-Rotating Tilted Axis) */}
        <div 
          style={{ 
            transform: 'translateZ(10px) rotateY(60deg) rotateX(-20deg)',
            animationPlayState: isPlaying ? 'running' : 'paused'
          }}
          className="absolute w-[320px] h-[320px] sm:w-[370px] sm:h-[370px] rounded-full border border-purple-500/20 border-dotted animate-holo-reverse-3d pointer-events-none"
        >
          <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-pink-400 shadow-[0_0_10px_#ec4899]" />
        </div>

        {/* Layer 3: Central Floating Hologram Device Card */}
        <div 
          style={{ transform: 'translateZ(30px)' }}
          className="relative w-[300px] sm:w-[330px] rounded-[36px] bg-[#0c0f1d]/85 backdrop-blur-2xl border border-white/10 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(6,182,212,0.15)] flex flex-col justify-between preserve-3d"
        >
          {/* Subtle Top Cyber Accent Bar */}
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f0ff]" />
              <span className="font-mono text-[10px] tracking-widest text-cyan-400 font-bold uppercase">
                SPATIAL 3D AUDIO // LIVE
              </span>
            </div>
            <div className="flex items-center gap-1 font-mono text-[9px] text-slate-400">
              <Radio className="w-3 h-3 text-purple-400" />
              <span>{activeFrequency}Hz</span>
            </div>
          </div>

          {/* Holographic 3D Spinning Vinyl Center Core */}
          <div 
            style={{ transform: 'translateZ(25px)' }}
            className="my-5 relative flex items-center justify-center preserve-3d"
          >
            {/* Outer Circular Equalizer Wave Nodes */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className={`w-52 h-52 sm:w-56 sm:h-56 rounded-full border border-cyan-500/20 flex items-center justify-center transition-transform duration-700 ${isPlaying ? 'scale-105' : 'scale-100'}`}>
                {/* Radial audio ticks */}
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                  <div 
                    key={deg}
                    style={{ transform: `rotate(${deg}deg) translateY(-108px)` }}
                    className={`absolute w-0.5 rounded-full transition-all duration-300 ${
                      isPlaying 
                        ? (deg % 60 === 0 ? 'h-3 bg-cyan-400 shadow-[0_0_8px_#00f0ff]' : 'h-1.5 bg-purple-500/60')
                        : 'h-1 bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* 3D Realistic Vinyl Record */}
            <div 
              style={{
                animationDuration: '7s',
                animationPlayState: isPlaying ? 'running' : 'paused'
              }}
              className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-full bg-gradient-to-tr from-[#05060a] via-[#151928] to-[#070911] border border-white/15 p-2 shadow-2xl flex items-center justify-center animate-spin cursor-pointer group/vinyl"
              onClick={togglePlayback}
              title={isPlaying ? "Click to Pause" : "Click to Play"}
            >
              {/* Vinyl Grooves concentric rings */}
              <div className="absolute inset-2.5 rounded-full border border-white/[0.07]" />
              <div className="absolute inset-5 rounded-full border border-white/[0.05]" />
              <div className="absolute inset-8 rounded-full border border-white/[0.08]" />
              <div className="absolute inset-11 rounded-full border border-white/[0.04]" />

              {/* Holographic Iridescent Reflection Sheen */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-cyan-500/10 to-purple-500/10 pointer-events-none opacity-80" />

              {/* Inner Center Label / Album Artwork */}
              <div className="relative w-20 h-20 rounded-full overflow-hidden border border-white/20 shadow-inner flex items-center justify-center bg-black/60 backdrop-blur-md">
                <img 
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80" 
                  alt="Track Cover"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-75 group-hover/vinyl:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
                
                {/* Center Spindle Hole */}
                <div className="relative z-10 w-4 h-4 rounded-full bg-[#05070e] border border-cyan-400/80 shadow-[0_0_8px_#00f0ff]" />
              </div>
            </div>

            {/* Quick Hover Action Badge */}
            <button
              onClick={togglePlayback}
              aria-label={isPlaying ? "Pause track" : "Play track"}
              className="absolute z-20 w-11 h-11 rounded-full bg-cyan-500/90 hover:bg-cyan-400 text-black shadow-[0_0_20px_#00f0ff] flex items-center justify-center transition transform hover:scale-110 active:scale-95 cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-black" />
              ) : (
                <Play className="w-5 h-5 fill-black translate-x-0.5" />
              )}
            </button>
          </div>

          {/* Track Info & Waveform */}
          <div 
            style={{ transform: 'translateZ(20px)' }}
            className="space-y-3 pt-1"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white tracking-wide truncate">
                  Cyber Euphoria [Lossless]
                </h4>
                <p className="text-[11px] font-mono text-cyan-400/80">
                  GEN MUSIC Spatial Synthesizer
                </p>
              </div>
              <div className="flex gap-0.5 items-end h-5 px-2 py-1 rounded bg-black/40 border border-white/5">
                <span className={`w-1 bg-cyan-400 rounded-full ${isPlaying ? 'animate-eq-1' : 'h-1'}`} />
                <span className={`w-1 bg-purple-400 rounded-full ${isPlaying ? 'animate-eq-2' : 'h-1.5'}`} />
                <span className={`w-1 bg-pink-400 rounded-full ${isPlaying ? 'animate-eq-3' : 'h-1'}`} />
                <span className={`w-1 bg-blue-400 rounded-full ${isPlaying ? 'animate-eq-4' : 'h-2'}`} />
              </div>
            </div>

            {/* Minimalist Progress Scrubber */}
            <div className="space-y-1">
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="w-3/5 h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 shadow-[0_0_10px_#00f0ff]" />
              </div>
              <div className="flex justify-between font-mono text-[9px] text-slate-400">
                <span>02:14</span>
                <span className="text-cyan-400">DOLBY 3D TRUE-HD</span>
                <span>04:38</span>
              </div>
            </div>
          </div>
        </div>

        {/* Layer 4: Floating Holographic Glass Badge (Top Right Depth) */}
        <div 
          style={{ transform: 'translateZ(60px) translate3d(110px, -130px, 0)' }}
          className="hidden sm:flex absolute items-center gap-2 px-3 py-1.5 rounded-2xl bg-cyan-950/80 backdrop-blur-xl border border-cyan-400/40 shadow-[0_0_20px_rgba(0,240,255,0.2)] text-[10px] font-mono text-cyan-300 font-bold"
        >
          <Zap className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span>ZERO BUFFERING // 320K</span>
        </div>

        {/* Layer 5: Floating Holographic Glass Badge (Bottom Left Depth) */}
        <div 
          style={{ transform: 'translateZ(50px) translate3d(-100px, 140px, 0)' }}
          className="hidden sm:flex absolute items-center gap-2 px-3 py-1.5 rounded-2xl bg-purple-950/80 backdrop-blur-xl border border-purple-400/40 shadow-[0_0_20px_rgba(168,85,247,0.2)] text-[10px] font-mono text-purple-300 font-bold"
        >
          <Activity className="w-3 h-3 text-purple-400" />
          <span>NEURAL EQ ACTIVE</span>
        </div>

      </div>
    </div>
  );
};
