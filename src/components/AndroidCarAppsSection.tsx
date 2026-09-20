import React, { useState } from 'react';
import { 
  Car, 
  Smartphone, 
  Mic, 
  Disc, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  Gauge, 
  Radio, 
  Compass, 
  ListMusic, 
  WifiOff, 
  Check 
} from 'lucide-react';

interface AndroidCarAppsSectionProps {
  onDownloadClick: () => void;
}

export const AndroidCarAppsSection: React.FC<AndroidCarAppsSectionProps> = ({
  onDownloadClick,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState({
    title: "Summer Drive Euphoria",
    artist: "GEN MUSIC Virtual Synthesizer",
    duration: "3:42",
    progress: 35
  });

  const carFeatures = [
    {
      icon: <Car className="w-6 h-6 text-cyan-400" />,
      title: "Android Auto Certified",
      desc: "Native responsive layout for standard and panoramic widescreen displays. Safe-driving HUD boots instantly upon USB/wireless handshake."
    },
    {
      icon: <Mic className="w-6 h-6 text-emerald-400" />,
      title: "AI Voice Telemetry & Control",
      desc: "Complete hands-free acoustic indexing. Trigger voice queries to search, queue, and filter losslessly without taking your eyes off the road."
    },
    {
      icon: <WifiOff className="w-6 h-6 text-amber-400" />,
      title: "Zero-Latency Offline Cache",
      desc: "Pre-download FLAC & 320kbps MP3 libraries to direct vehicle SSD storage for uninterrupted audio across dead zones."
    },
    {
      icon: <Gauge className="w-6 h-6 text-purple-400" />,
      title: "CAN-Bus Hardware Hook",
      desc: "Direct integration with steering wheel media controls, rotary jog dials, and digital cluster heads-up telemetry."
    }
  ];

  return (
    <section 
      id="car-apps" 
      className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10 bg-[#070912] text-white"
    >
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider">
          <Car className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>VEHICLE TELEMATICS & HUD</span>
        </div>
        
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-heading">
          Android Auto &{" "}
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Smart Car Cockpit
          </span>
        </h2>
        
        <p className="text-lg text-slate-400">
          High-contrast minimal spatial interface engineered for zero-distraction in-cabin acoustics and steering wheel control.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Interactive Simulation Player for Android Auto */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-cyan-500/25 bg-[#090c18] p-6 sm:p-8 shadow-[0_0_40px_rgba(0,240,255,0.08)] text-slate-100 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
            
            {/* Simulated Android Auto Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f0ff]" />
                <span className="text-xs font-mono font-bold tracking-widest uppercase text-cyan-400">CAR HUD PROTOCOL // ACTIVE</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>5G ULTRA</span>
                <span>12:45 PM</span>
              </div>
            </div>

            {/* Simulated Dashboard UI */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Media Art (Left/Top) */}
              <div className="md:col-span-5 flex flex-col items-center justify-center">
                <div className="relative group w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-[#050711] border border-white/15 flex items-center justify-center overflow-hidden shadow-2xl">
                  <div className={`absolute inset-0 bg-gradient-to-tr from-cyan-900/30 to-purple-900/20 transition-transform duration-1000 ${isPlaying ? 'rotate-180' : ''}`} />
                  <Disc className={`w-16 h-16 sm:w-20 sm:h-20 text-cyan-400 relative z-10 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
                  <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded text-[10px] text-center font-mono text-cyan-300 border border-white/10">
                    DOLBY 3D TRUE-HD
                  </div>
                </div>
              </div>

              {/* Player Controls (Right/Bottom) */}
              <div className="md:col-span-7 space-y-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white truncate font-heading">{currentTrack.title}</h3>
                  <p className="text-sm font-mono text-cyan-400/80 truncate mt-1">{currentTrack.artist}</p>
                </div>

                {/* Simulated Progress bar */}
                <div className="space-y-2">
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-300 shadow-[0_0_8px_#00f0ff]" 
                      style={{ width: `${currentTrack.progress}%` }} 
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 font-mono">
                    <span>1:18</span>
                    <span className="text-cyan-400">HI-RES 96kHz</span>
                    <span>{currentTrack.duration}</span>
                  </div>
                </div>

                {/* Big Safe Touch Controls */}
                <div className="flex items-center justify-center md:justify-start gap-8">
                  <button 
                    onClick={() => setCurrentTrack(prev => ({ ...prev, progress: Math.max(0, prev.progress - 10) }))}
                    className="p-3.5 rounded-full bg-white/[0.05] border border-white/10 hover:bg-white/[0.1] hover:text-white transition active:scale-95 cursor-pointer"
                    aria-label="Previous Track"
                  >
                    <SkipBack className="w-6 h-6 text-slate-300" />
                  </button>

                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black transition active:scale-95 shadow-[0_0_25px_#00f0ff] cursor-pointer"
                    aria-label={isPlaying ? "Pause Music" : "Play Music"}
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 fill-black text-black" />
                    ) : (
                      <Play className="w-8 h-8 fill-black text-black translate-x-0.5" />
                    )}
                  </button>

                  <button 
                    onClick={() => setCurrentTrack(prev => ({ ...prev, progress: Math.min(100, prev.progress + 10) }))}
                    className="p-3.5 rounded-full bg-white/[0.05] border border-white/10 hover:bg-white/[0.1] hover:text-white transition active:scale-95 cursor-pointer"
                    aria-label="Next Track"
                  >
                    <SkipForward className="w-6 h-6 text-slate-300" />
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Notice Footer */}
            <div className="mt-8 border-t border-white/10 pt-4 flex flex-wrap gap-4 justify-between items-center text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-mono">
                <Check className="w-4 h-4 text-emerald-400" />
                Zero config required. Plug into head unit or connect wireless.
              </span>
              <button 
                onClick={onDownloadClick}
                className="text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer font-bold font-mono"
              >
                Download APK for Car Setup →
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Key Driver Benefits */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white font-heading">
              Minimal HUD Dashboard Architecture
            </h3>
            <p className="text-slate-400">
              Eliminate cable clutter and screen glare. Native hardware hooks integrate directly with your dashboard display for seamless high-fidelity highway audio.
            </p>
          </div>

          <div className="space-y-4">
            {carFeatures.map((feat, idx) => (
              <div 
                key={idx} 
                className="flex gap-4 p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-cyan-500/40 hover:bg-white/[0.04] transition-all"
              >
                <div className="p-3 h-fit rounded-xl bg-white/[0.04] border border-white/10">
                  {feat.icon}
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">{feat.title}</h4>
                  <p className="text-sm text-slate-400 mt-1">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button 
              onClick={onDownloadClick}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold hover:opacity-95 shadow-lg shadow-cyan-500/20 transition active:scale-[0.98] cursor-pointer"
            >
              Get Android Car APK
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
