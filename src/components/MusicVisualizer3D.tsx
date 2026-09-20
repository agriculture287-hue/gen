import React, { useEffect, useRef, useState } from 'react';
import { 
  Sparkles, 
  Volume2, 
  Play, 
  Pause, 
  Radio, 
  Maximize2, 
  RotateCw, 
  Eye, 
  Sliders, 
  Music,
  Tv
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
  const [theme, setTheme] = useState<'neon' | 'sunset' | 'matrix' | 'cyan'>('neon');
  const [isRotating, setIsRotating] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Audio Synth state (Simulated or Real Audio Context)
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(true);

  // 3D particles system
  const particlesRef = useRef<Point3D[]>([]);
  const rotationRef = useRef({ x: 0.3, y: 0.5, z: 0 });
  const mouseRef = useRef({ x: 0, y: 0 });

  // Tone generator for direct interactive engagement
  const playInteractiveTone = (freq: number, type: 'sine' | 'triangle' | 'sawtooth' = 'sine') => {
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

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      // Fast attack, slow decay (synthesized pluck)
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.warn("AudioPluck failed:", e);
    }
  };

  // Setup 3D Particles
  const initParticles = (mode: 'sphere' | 'wave' | 'tunnel', colorTheme: string) => {
    const points: Point3D[] = [];
    const count = mode === 'sphere' ? 300 : mode === 'tunnel' ? 400 : 250;

    const getColor = (i: number) => {
      if (colorTheme === 'neon') {
        return i % 3 === 0 ? 'rgb(124, 58, 237)' : i % 3 === 1 ? 'rgb(236, 72, 153)' : 'rgb(59, 130, 246)'; // Purple, pink, blue
      } else if (colorTheme === 'sunset') {
        return i % 2 === 0 ? 'rgb(249, 115, 22)' : 'rgb(239, 68, 68)'; // Orange, red
      } else if (colorTheme === 'matrix') {
        return i % 4 === 0 ? 'rgb(34, 197, 94)' : 'rgb(16, 185, 129)'; // Green, emerald
      } else {
        return i % 2 === 0 ? 'rgb(6, 182, 212)' : 'rgb(14, 165, 233)'; // Cyan, light blue
      }
    };

    if (mode === 'sphere') {
      // Golden ratio spiral projection for perfect 3D sphere distribution
      const phi = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < count; i++) {
        const y = 1 - (i / (count - 1)) * 2; // y goes from 1 to -1
        const radius = Math.sqrt(1 - y * y); // radius at y
        const theta = phi * i; // golden angle increment

        const x = Math.cos(theta) * radius;
        const z = Math.sin(theta) * radius;

        points.push({
          x: x * 150,
          y: y * 150,
          z: z * 150,
          baseX: x * 150,
          baseY: y * 150,
          baseZ: z * 150,
          color: getColor(i)
        });
      }
    } else if (mode === 'tunnel') {
      // 3D Cylinder / Tunnel
      for (let i = 0; i < count; i++) {
        const angle = (i % 20) * (Math.PI * 2 / 20);
        const zStep = Math.floor(i / 20);
        const r = 120 + Math.sin(zStep * 0.5) * 15;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        const z = -250 + zStep * 25;

        points.push({
          x,
          y,
          z,
          baseX: x,
          baseY: y,
          baseZ: z,
          color: getColor(i)
        });
      }
    } else {
      // 3D Double Helix / Wave grids
      for (let i = 0; i < count; i++) {
        const x = -200 + (i / count) * 400;
        const angle = (i * 0.15);
        const y = Math.sin(angle) * 80;
        const z = Math.cos(angle) * 80;

        points.push({
          x,
          y,
          z,
          baseX: x,
          baseY: y,
          baseZ: z,
          color: getColor(i)
        });
      }
    }

    particlesRef.current = points;
  };

  // Re-init particles on mode/theme changes
  useEffect(() => {
    initParticles(visualMode, theme);
  }, [visualMode, theme]);

  // Main 3D render loop
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

    let frame = 0;
    const renderLoop = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep dark space background grid
      ctx.fillStyle = 'rgba(5, 5, 5, 0.4)';
      ctx.fillRect(0, 0, width, height);

      // Procedural sound wave reactions
      frame++;
      const beatInterval = Math.round(3600 / bpm);
      const isBeat = isPlaying && (frame % beatInterval < 6);
      
      // Speed of visualizer
      const t = frame * 0.015;
      
      // Auto-rotation handling
      if (isRotating && isPlaying) {
        rotationRef.current.y += 0.004;
        rotationRef.current.x += 0.001;
      }

      // Add direct user dragging rotation momentum
      rotationRef.current.y += (mouseRef.current.x - rotationRef.current.y) * 0.05;
      rotationRef.current.x += (mouseRef.current.y - rotationRef.current.x) * 0.05;

      const cosX = Math.cos(rotationRef.current.x);
      const sinX = Math.sin(rotationRef.current.x);
      const cosY = Math.cos(rotationRef.current.y);
      const sinY = Math.sin(rotationRef.current.y);
      const cosZ = Math.cos(rotationRef.current.z);
      const sinZ = Math.sin(rotationRef.current.z);

      // Draw beautiful dynamic neon lines in the center of visualizer
      if (visualMode === 'sphere') {
        ctx.strokeStyle = theme === 'neon' ? 'rgba(139, 92, 246, 0.05)' : theme === 'sunset' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 100 + (isBeat ? 20 : 0), 0, Math.PI * 2);
        ctx.stroke();
      }

      // Projection Camera Variables
      const fov = 350; // Camera perspective field of view
      const cx = width / 2;
      const cy = height / 2;

      // Pulse multiplier representing active music volume
      const pulseMultiplier = isPlaying 
        ? 1.0 + (Math.sin(t * 8) * 0.06) + (isBeat ? (sensitivity / 250) : 0)
        : 1.0;

      // Transform and Project 3D particles to 2D canvas coordinates
      const renderedPoints = particlesRef.current.map((pt) => {
        // Apply interactive audio reaction offset to bases
        let oscOffset = 0;
        if (isPlaying) {
          if (visualMode === 'sphere') {
            const dist = Math.sqrt(pt.baseX * pt.baseX + pt.baseY * pt.baseY + pt.baseZ * pt.baseZ);
            oscOffset = Math.sin(dist * 0.04 - t * 10) * (sensitivity * 0.15);
          } else if (visualMode === 'tunnel') {
            oscOffset = Math.sin(pt.baseZ * 0.05 + t * 8) * (sensitivity * 0.2);
          } else {
            oscOffset = Math.sin(pt.baseX * 0.025 + t * 12) * (sensitivity * 0.35);
          }
        }

        // Apply scale & pulse
        const sx = pt.baseX * pulseMultiplier + (visualMode === 'sphere' ? (pt.baseX / 150) * oscOffset : 0);
        const sy = pt.baseY * pulseMultiplier + (visualMode === 'sphere' ? (pt.baseY / 150) * oscOffset : (visualMode === 'wave' ? oscOffset : 0));
        const sz = pt.baseZ * pulseMultiplier + (visualMode === 'tunnel' ? oscOffset : 0);

        // Rotation around Y axis
        let x1 = sx * cosY - sz * sinY;
        let z1 = sx * sinY + sz * cosY;

        // Rotation around X axis
        let y2 = sy * cosX - z1 * sinX;
        let z2 = sy * sinX + z1 * cosX;

        // Rotation around Z axis
        let x3 = x1 * cosZ - y2 * sinZ;
        let y3 = x1 * sinZ + y2 * cosZ;

        // Add depth (push the object in front of the camera)
        const depth = z2 + 300; 

        // 3D Projection formula (skip rendering if behind camera)
        if (depth <= 50) return null;

        const scale = fov / depth;
        const projX = cx + x3 * scale;
        const projY = cy + y3 * scale;

        return {
          x: projX,
          y: projY,
          size: Math.max(0.5, scale * (1.8 + (isBeat ? 1.0 : 0))),
          color: pt.color,
          depth
        };
      }).filter((p): p is NonNullable<typeof p> => p !== null);

      // Sort points back-to-front (depth-buffer painting) to prevent perspective overlap glitches
      renderedPoints.sort((a, b) => b.depth - a.depth);

      // Render actual 3D points
      renderedPoints.forEach((p) => {
        // Fade out color depending on depth
        const opacity = Math.min(1.0, Math.max(0.15, (380 - p.depth) / 300));
        ctx.fillStyle = p.color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Subtle bloom effect on pulse beats
        if (isBeat && p.size > 2.5) {
          ctx.fillStyle = p.color.replace('rgb', 'rgba').replace(')', `, ${opacity * 0.25})`);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw thin constellation nexus lines between nearby points in sphere mode
      if (visualMode === 'sphere' && renderedPoints.length > 0) {
        ctx.lineWidth = 0.5;
        for (let i = 0; i < renderedPoints.length; i += 8) {
          for (let j = i + 1; j < Math.min(i + 4, renderedPoints.length); j++) {
            const p1 = renderedPoints[i];
            const p2 = renderedPoints[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 45) {
              const op = (1 - (dist / 45)) * 0.15;
              ctx.strokeStyle = p1.color.replace('rgb', 'rgba').replace(')', `, ${op})`);
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, bpm, sensitivity, visualMode, theme, isRotating]);

  // Handle interactive canvas click sound synth plucked plucks!
  const handleCanvasInteraction = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert click location into musical frequencies
    const freqFactor = (clickX / rect.width);
    const pitches = [130.81, 146.83, 164.81, 196.00, 220.00, 261.63, 293.66, 329.63, 392.00, 440.00];
    const pitchIndex = Math.floor(freqFactor * pitches.length);
    const chosenFreq = pitches[Math.max(0, Math.min(pitches.length - 1, pitchIndex))];

    // Trigger synthetic audio pluck
    playInteractiveTone(chosenFreq, theme === 'matrix' ? 'sawtooth' : theme === 'sunset' ? 'triangle' : 'sine');

    // Create a temporary expansion pulse on the 3D particles around the cursor
    mouseRef.current.y = (clickY / rect.height - 0.5) * Math.PI;
    mouseRef.current.x = (clickX / rect.width - 0.5) * Math.PI * 2;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHovered) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    // Slow drift rotation target matching user's cursor tilt
    mouseRef.current.x = x * Math.PI;
    mouseRef.current.y = y * Math.PI;
  };

  return (
    <section 
      id="3d-visualizer" 
      className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10 bg-[#070912] relative overflow-hidden"
    >
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* Left Side: Dynamic Canvas Frame */}
        <div className="lg:col-span-7 space-y-4">
          <div 
            ref={containerRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
              setIsHovered(false);
              mouseRef.current = { x: 0, y: 0 };
            }}
            onMouseMove={handleMouseMove}
            className="w-full h-[400px] sm:h-[480px] rounded-3xl bg-[#04050b] border border-cyan-500/30 p-1 shadow-[0_0_50px_rgba(0,240,255,0.12)] relative overflow-hidden group select-none"
          >
            {/* Status Info Headers */}
            <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-cyan-500/30 text-[11px] font-bold text-cyan-300">
                <Radio className={`w-3.5 h-3.5 text-cyan-400 ${isPlaying ? 'animate-pulse' : ''}`} />
                <span className="font-mono tracking-widest">3D AUDIO MATRIX // ACTIVE</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-bold text-slate-300 font-mono">
                BPM: {bpm}
              </div>
            </div>

            <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
              <button
                onClick={() => setIsRotating(!isRotating)}
                className={`p-2 rounded-xl border border-white/10 hover:text-white transition active:scale-95 cursor-pointer text-xs flex items-center gap-1 bg-black/70 backdrop-blur-md ${isRotating ? 'text-cyan-400 border-cyan-500/40 shadow-[0_0_12px_rgba(0,240,255,0.2)]' : 'text-slate-400'}`}
                title="Toggle Auto Rotation"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRotating && isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
                <span className="hidden sm:inline font-mono">Rotate 3D</span>
              </button>
              <button
                onClick={() => {
                  setIsAudioMuted(!isAudioMuted);
                  if (isAudioMuted) {
                    playInteractiveTone(440, 'sine');
                  }
                }}
                className={`p-2 rounded-xl border border-white/10 hover:text-white transition active:scale-95 cursor-pointer text-xs flex items-center gap-1 bg-black/70 backdrop-blur-md ${!isAudioMuted ? 'text-emerald-400 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]' : 'text-slate-400'}`}
                title="Toggle Interactive Sound Synthesis"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-mono">{isAudioMuted ? 'Audio Pluck: Off' : 'Audio Pluck: On'}</span>
              </button>
            </div>

            {/* Instruction tooltip in corner */}
            <div className="absolute bottom-6 left-6 z-20 pointer-events-none text-[10px] text-cyan-400/80 font-mono uppercase bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-cyan-500/20">
              ⚡ Click & Drag canvas in 3D space to synthesize harmonic notes
            </div>

            {/* Simulated 3D Axis Compass Overlay */}
            <div className="absolute bottom-6 right-6 z-20 flex gap-2 pointer-events-none opacity-60">
              <div className="text-[10px] font-mono text-cyan-400 uppercase flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded border border-white/5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                X: {rotationRef.current.x.toFixed(1)}°
              </div>
              <div className="text-[10px] font-mono text-purple-400 uppercase flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded border border-white/5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-400" />
                Y: {rotationRef.current.y.toFixed(1)}°
              </div>
            </div>

            {/* HTML5 Canvas Element */}
            <canvas 
              ref={canvasRef} 
              onClick={handleCanvasInteraction}
              className="w-full h-full block cursor-crosshair relative z-10"
            />
          </div>
        </div>

        {/* Right Side: Description and Customization Panels */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>SPATIAL AUDIO RAYMARCHING</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight font-heading">
              Minimal <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">3D Spatial</span> Soundwave Engine
            </h2>
            
            <p className="text-slate-400 leading-relaxed text-sm">
              Experience music rendered into real-time particle trajectories. Our GPU-accelerated canvas engine projects audio frequency harmonics onto 3D coordinate manifolds. Drag to orbit, click to generate acoustic plucks.
            </p>
          </div>

          {/* Interactive Parameters Controls */}
          <div className="p-6 rounded-2xl border border-white/10 bg-[#0d101e]/80 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-white/5 pb-3">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-xs uppercase tracking-wider text-slate-300">Spatial Calibration Matrix</span>
            </div>

            {/* Shape Selectors */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Geometry Mesh</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'sphere', label: '3D Sphere' },
                  { id: 'wave', label: '3D Helix' },
                  { id: 'tunnel', label: '3D Tunnel' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setVisualMode(mode.id as any)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      visualMode === mode.id
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                        : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.08] text-slate-400'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Themes Selection */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Spectral Wavelength</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'neon', label: 'Neon Cyber', color: 'bg-indigo-400' },
                  { id: 'sunset', label: 'Amber Sun', color: 'bg-amber-400' },
                  { id: 'matrix', label: 'Laser Green', color: 'bg-emerald-400' },
                  { id: 'cyan', label: 'Holo Cyan', color: 'bg-cyan-400' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setTheme(item.id as any)}
                    className={`py-2 px-1 rounded-xl text-[10px] font-bold transition cursor-pointer border flex flex-col items-center gap-1.5 ${
                      theme === item.id
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                        : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.08] text-slate-400'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${item.color} shadow-xs`} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* BPM & Sensitivity Ranges */}
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono font-bold text-slate-400">
                  <span className="uppercase tracking-wider">HARMONIC TEMPO (BPM)</span>
                  <span className="text-cyan-400">{bpm} BPM</span>
                </div>
                <input 
                  type="range" 
                  min="60" 
                  max="180" 
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400" 
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono font-bold text-slate-400">
                  <span className="uppercase tracking-wider">ACOUSTIC AMPLITUDE GAIN</span>
                  <span className="text-cyan-400">{sensitivity}%</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="150" 
                  value={sensitivity}
                  onChange={(e) => setSensitivity(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400" 
                />
              </div>
            </div>

            {/* Run / Pause Simulation Toggle Button */}
            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex-1 py-3.5 rounded-xl font-bold transition cursor-pointer flex items-center justify-center gap-2 border text-xs active:scale-[0.98] ${
                  isPlaying 
                    ? 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border-rose-500/30' 
                    : 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-rose-400 text-rose-400" />
                    <span>Halt 3D Engine</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-cyan-300 text-cyan-300" />
                    <span>Engage 3D Simulation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
