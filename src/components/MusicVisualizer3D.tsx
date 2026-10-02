import React, { useEffect, useRef, useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCw, 
  Sliders, 
  Volume2,
  VolumeX
} from 'lucide-react';

interface Point3D {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  color: string;
}

export const MusicVisualizer3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [bpm, setBpm] = useState(124);
  const [sensitivity, setSensitivity] = useState(75);
  const [visualMode, setVisualMode] = useState<'sphere' | 'wave' | 'tunnel'>('sphere');
  const [theme, setTheme] = useState<'cyan' | 'amber' | 'emerald' | 'violet'>('cyan');
  const [isAudioMuted, setIsAudioMuted] = useState(true);

  // Audio Context for optional interactive audio tone
  const audioContextRef = useRef<AudioContext | null>(null);

  // 3D particles system
  const particlesRef = useRef<Point3D[]>([]);
  const rotationRef = useRef({ x: 0.3, y: 0.5, z: 0 });
  const mouseRef = useRef({ x: 0, y: 0 });

  const playInteractiveTone = (freq: number) => {
    if (isAudioMuted) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // safe fallback
    }
  };

  const initParticles = (mode: 'sphere' | 'wave' | 'tunnel', colorTheme: string) => {
    const points: Point3D[] = [];
    const count = mode === 'sphere' ? 240 : mode === 'tunnel' ? 320 : 200;

    const getColor = (i: number) => {
      if (colorTheme === 'amber') {
        return i % 2 === 0 ? 'rgb(245, 158, 11)' : 'rgb(217, 119, 6)';
      } else if (colorTheme === 'emerald') {
        return i % 2 === 0 ? 'rgb(16, 185, 129)' : 'rgb(5, 150, 105)';
      } else if (colorTheme === 'violet') {
        return i % 2 === 0 ? 'rgb(139, 92, 246)' : 'rgb(168, 85, 247)';
      } else {
        return i % 2 === 0 ? 'rgb(56, 189, 248)' : 'rgb(2, 132, 199)';
      }
    };

    if (mode === 'sphere') {
      const phi = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < count; i++) {
        const y = 1 - (i / (count - 1)) * 2;
        const radius = Math.sqrt(1 - y * y);
        const theta = phi * i;
        const x = Math.cos(theta) * radius;
        const z = Math.sin(theta) * radius;

        points.push({
          x: x * 140,
          y: y * 140,
          z: z * 140,
          baseX: x * 140,
          baseY: y * 140,
          baseZ: z * 140,
          color: getColor(i),
        });
      }
    } else if (mode === 'tunnel') {
      for (let i = 0; i < count; i++) {
        const angle = (i % 20) * ((Math.PI * 2) / 20);
        const zStep = Math.floor(i / 20);
        const r = 110 + Math.sin(zStep * 0.5) * 15;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        const z = -220 + zStep * 28;

        points.push({
          x,
          y,
          z,
          baseX: x,
          baseY: y,
          baseZ: z,
          color: getColor(i),
        });
      }
    } else {
      for (let i = 0; i < count; i++) {
        const x = -180 + (i / count) * 360;
        const angle = i * 0.18;
        const y = Math.sin(angle) * 70;
        const z = Math.cos(angle) * 70;

        points.push({
          x,
          y,
          z,
          baseX: x,
          baseY: y,
          baseZ: z,
          color: getColor(i),
        });
      }
    }

    particlesRef.current = points;
  };

  useEffect(() => {
    initParticles(visualMode, theme);
  }, [visualMode, theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    let time = 0;

    const render = () => {
      ctx.fillStyle = 'rgba(11, 14, 20, 0.45)';
      ctx.fillRect(0, 0, width, height);

      const fov = 300;
      const cx = width / 2;
      const cy = height / 2;

      if (isPlaying) {
        time += 0.02 * (bpm / 120);
        rotationRef.current.y += 0.008;
        rotationRef.current.x += 0.003;
      }

      const rx = rotationRef.current.x + mouseRef.current.y * 0.5;
      const ry = rotationRef.current.y + mouseRef.current.x * 0.5;

      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);

      const beatPulse = isPlaying ? Math.sin(time * 4) * (sensitivity / 100) * 15 : 0;

      particlesRef.current.forEach((p) => {
        let x = p.baseX + (p.baseX !== 0 ? Math.sign(p.baseX) * beatPulse : 0);
        let y = p.baseY + (p.baseY !== 0 ? Math.sign(p.baseY) * beatPulse : 0);
        let z = p.baseZ;

        // Rotation around Y
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;

        // Rotation around X
        const y2 = y * cosX - z1 * sinX;
        const z2 = z1 * cosX + y * sinX;

        // 3D to 2D projection
        const scale = fov / (fov + z2 + 250);
        const px = cx + x1 * scale;
        const py = cy + y2 * scale;
        const pSize = Math.max(1.2, scale * 3.2);

        if (z2 + 250 > 10) {
          ctx.beginPath();
          ctx.arc(px, py, pSize, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.min(1, Math.max(0.2, (z2 + 200) / 400));
          ctx.fill();
        }
      });

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, bpm, sensitivity]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current = {
      x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      y: ((e.clientY - rect.top) / rect.height) * 2 - 1,
    };
  };

  const handleCanvasClick = () => {
    playInteractiveTone(440 + Math.random() * 220);
  };

  return (
    <section 
      id="visualizer" 
      aria-label="3D Audio Visualizer"
      className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Column: Interactive 3D Canvas */}
        <div className="lg:col-span-7">
          <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="surface-card overflow-hidden h-[340px] sm:h-[440px] relative rounded-2xl flex items-center justify-center cursor-grab active:cursor-grabbing"
          >
            <canvas 
              ref={canvasRef} 
              onClick={handleCanvasClick}
              className="w-full h-full block" 
            />

            {/* Subtle Overlay Controls */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs text-slate-400 font-mono pointer-events-none">
              <span className="bg-slate-950/70 px-2.5 py-1 rounded-md border border-white/5 backdrop-blur-md">
                Interactive Canvas · Drag to Orbit
              </span>

              <div className="pointer-events-auto flex items-center gap-1.5">
                <button
                  onClick={() => setIsAudioMuted(!isAudioMuted)}
                  className="p-1.5 rounded-md bg-slate-950/70 hover:bg-slate-900 border border-white/10 text-slate-300 hover:text-white transition cursor-pointer"
                  title={isAudioMuted ? "Unmute test tone" : "Mute test tone"}
                >
                  {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-sky-400" />}
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1.5 rounded-md bg-slate-950/70 hover:bg-slate-900 border border-white/10 text-slate-300 hover:text-white transition cursor-pointer"
                  title={isPlaying ? "Pause visualizer" : "Play visualizer"}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-sky-400" />}
                </button>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 text-[11px] text-slate-500 font-mono pointer-events-none">
              Click canvas to generate acoustic impulse
            </div>
          </div>
        </div>

        {/* Right Column: Information & Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
              Spatial Audio Particle Engine
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Experience soundwaves projected onto real-time 3D coordinate manifolds. Drag to rotate and explore harmonic spatial dispersion.
            </p>
          </div>

          {/* Configuration Card */}
          <div className="surface-card p-6 space-y-5">
            <div className="flex items-center gap-2 text-white font-semibold text-sm border-b border-white/5 pb-3">
              <Sliders className="w-4 h-4 text-sky-400" />
              <span>Visualizer Parameters</span>
            </div>

            {/* Geometry Mode */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Mesh Geometry</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'sphere', label: 'Sphere' },
                  { id: 'wave', label: 'Helix' },
                  { id: 'tunnel', label: 'Tunnel' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setVisualMode(mode.id as any)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                      visualMode === mode.id
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                        : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Palette */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Color Spectrum</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'cyan', label: 'Sky' },
                  { id: 'amber', label: 'Amber' },
                  { id: 'emerald', label: 'Emerald' },
                  { id: 'violet', label: 'Violet' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setTheme(item.id as any)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium transition cursor-pointer border text-center ${
                      theme === item.id
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                        : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Frequency Tempo</span>
                  <span className="font-mono text-sky-400">{bpm} BPM</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="180"
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Amplitude Sensitivity</span>
                  <span className="font-mono text-sky-400">{sensitivity}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="150"
                  value={sensitivity}
                  onChange={(e) => setSensitivity(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
