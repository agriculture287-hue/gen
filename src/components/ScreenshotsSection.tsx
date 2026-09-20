import React, { useState } from 'react';
import { 
  Smartphone, 
  Play, 
  Heart, 
  Sliders, 
  Headphones, 
  Search, 
  Sparkles, 
  Download, 
  FileAudio,
  Radio,
  Flame, 
  Check,
  Disc3,
  ListMusic,
  ArrowRight
} from 'lucide-react';
import { APP_SCREENSHOTS } from '../data/landingData';
import { GenMusicLogo } from './GenMusicLogo';

export const ScreenshotsSection: React.FC = () => {
  const [selectedScreenIndex, setSelectedScreenIndex] = useState(0);
  const currentScreen = APP_SCREENSHOTS[selectedScreenIndex];

  return (
    <section 
      id="screenshots" 
      aria-label="App Screenshots Section"
      className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden relative text-white"
    >
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider">
          <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
          <span>CYBER INTERFACE PREVIEW</span>
        </div>

        {/* EXACT SECTION TITLE */}
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-heading">
          See GEN MUSIC{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent">
            in Action
          </span>
        </h2>

        <p className="text-base sm:text-lg text-slate-400">
          Engineered for high-refresh AMOLED and car displays. Tactile haptics, low latency, and fluid vector rendering.
        </p>

        {/* Interactive Screen Selector Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
          {APP_SCREENSHOTS.map((screen, idx) => (
            <button
              key={screen.id}
              onClick={() => setSelectedScreenIndex(idx)}
              id={`screenshot-tab-${screen.id}`}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                selectedScreenIndex === idx
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                  : 'bg-white/[0.03] text-slate-400 hover:bg-white/[0.08] border-white/10'
              }`}
            >
              <span>{screen.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Showcase Grid: Left Info & Right Modern Phone Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center max-w-5xl mx-auto">
        
        {/* Left Feature Description Card */}
        <div className="lg:col-span-5 space-y-5 text-center lg:text-left">
          <div className="inline-block px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
            VIEWPORT 0{selectedScreenIndex + 1} // 0{APP_SCREENSHOTS.length}
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
            {currentScreen.title}
          </h3>

          <p className="text-base text-slate-400 leading-relaxed">
            {currentScreen.subtitle}
          </p>

          <div className="space-y-2.5 pt-2">
            {[
              'Hardware accelerated 120Hz smooth scrolling',
              'Deep OLED true dark mode with custom neon hues',
              'Zero banner or intrusive popup advertisements',
              'Tactile one-handed quick touch controls & gestures',
            ].map((bullet, i) => (
              <div key={i} className="flex items-center gap-2.5 justify-center lg:justify-start text-xs sm:text-sm text-slate-300">
                <div className="w-4 h-4 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center text-[10px] font-bold">
                  ✓
                </div>
                <span>{bullet}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-center lg:justify-start gap-2">
            {APP_SCREENSHOTS.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedScreenIndex(i)}
                aria-label={`Go to screenshot ${i + 1}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  selectedScreenIndex === i ? 'w-8 bg-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.6)]' : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right Phone Mockup Device */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="relative w-full max-w-[340px] sm:max-w-[370px] rounded-[52px] p-4 bg-gradient-to-b from-[#1e1e34] via-[#111120] to-[#080812] border-4 border-[#2b2b42] shadow-[0_30px_90px_rgba(0,0,0,0.85),0_0_60px_rgba(0,240,255,0.2)] ring-1 ring-white/20">
            
            {/* Phone buttons */}
            <div className="absolute -left-[7px] top-28 w-[4px] h-12 bg-neutral-600 rounded-l" />
            <div className="absolute -left-[7px] top-44 w-[4px] h-12 bg-neutral-600 rounded-l" />
            <div className="absolute -right-[7px] top-32 w-[4px] h-16 bg-neutral-600 rounded-r" />

            {/* Inner Screen Content */}
            <div className="w-full bg-[#050505] rounded-[40px] overflow-hidden border border-white/10 p-5 pt-3 relative flex flex-col justify-between min-h-[640px] shadow-inner">
              
              {/* Dynamic Island Header */}
              <div className="flex justify-center mb-2">
                <div className="w-28 h-4.5 bg-black rounded-full border border-white/15 flex items-center justify-between px-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80 animate-ping" />
                  <span className="w-2 h-2 rounded-full bg-neutral-800" />
                </div>
              </div>

              {/* In-App Top Status & Brand Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-white/[0.08]">
                <div className="flex items-center gap-1.5">
                  <GenMusicLogo size="xs" glow={false} />
                  <span className="text-xs font-black text-white tracking-wider font-heading">
                    GEN <span className="text-cyan-400">MUSIC</span>
                  </span>
                </div>
                <span className="text-[10px] text-neutral-400 font-mono">APK v2.5.0</span>
              </div>

              {/* SCREEN 1: NOW PLAYING */}
              {currentScreen.mockupContent === 'player' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span className="text-cyan-400 font-bold uppercase tracking-wider text-[10px]">
                      Dolby Atmos 3D
                    </span>
                    <span className="font-mono text-white text-[11px]">320 kbps MP3</span>
                    <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
                  </div>

                  <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl border border-white/15">
                    <img
                      src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"
                      alt="Album in phone"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-emerald-500/90 text-white text-[10px] font-bold">
                      Free Music Synced
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white truncate">
                      Midnight Cyber City
                    </h4>
                    <p className="text-xs text-neutral-400">
                      Kavinsky & Dynatron • Synthwave
                    </p>
                  </div>

                  {/* Seekbar */}
                  <div className="space-y-1">
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className="w-3/5 h-full bg-gradient-to-r from-cyan-400 to-purple-500" />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                      <span>2:14</span>
                      <span>3:42</span>
                    </div>
                  </div>

                  {/* Playback Controls */}
                  <div className="flex items-center justify-between px-4 pt-1">
                    <button className="text-neutral-400 text-xs">⏮</button>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 text-black flex items-center justify-center shadow-lg shadow-cyan-500/40">
                      <Play className="w-5 h-5 fill-black ml-0.5" />
                    </div>
                    <button className="text-neutral-400 text-xs">⏭</button>
                  </div>

                  {/* Synchronized Lyrics Snippet */}
                  <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-center">
                    <p className="text-[11px] text-cyan-300 font-semibold italic">
                      "Electric neon waves lighting up the highway tonight..."
                    </p>
                  </div>
                </div>
              )}

              {/* SCREEN 2: UNIFIED SEARCH */}
              {currentScreen.mockupContent === 'search' && (
                <div className="space-y-3.5 animate-in fade-in duration-300">
                  <div className="p-3 rounded-xl bg-white/[0.06] border border-white/10 flex items-center gap-2 text-xs text-neutral-300">
                    <Search className="w-4 h-4 text-cyan-400" />
                    <span>The Weeknd - Blinding Lights</span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                      Free Tracks (14)
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                      High Quality (8)
                    </span>
                  </div>

                  <div className="space-y-2">
                    {[
                      { title: 'Blinding Lights (Official Audio)', source: 'Free Music', time: '3:20', tag: 'Original' },
                      { title: 'Blinding Lights (Live Acoustic)', source: 'Free Music', time: '3:45', tag: 'Live Session' },
                      { title: 'Blinding Lights (Synthwave Spatial)', source: 'Free Music', time: '4:12', tag: 'Hi-Fi 320k' },
                      { title: 'Blinding Lights (Instrumental)', source: 'Free Music', time: '3:20', tag: 'Karaoke' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <div>
                          <div className="text-xs font-bold text-white truncate w-40">{item.title}</div>
                          <div className="text-[10px] text-neutral-400">{item.source} • {item.tag}</div>
                        </div>
                        <span className="text-[10px] font-mono text-cyan-400 font-bold">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SCREEN 3: EQUALIZER */}
              {currentScreen.mockupContent === 'equalizer' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">5-Band Studio EQ</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Dolby Atmos Active
                    </span>
                  </div>

                  {/* Graphic EQ Slider bars */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                    <div className="flex justify-between items-end h-28 px-1">
                      {[
                        { freq: '60Hz', h: '70%', gain: '+5dB' },
                        { freq: '230Hz', h: '45%', gain: '+1dB' },
                        { freq: '910Hz', h: '85%', gain: '+7dB' },
                        { freq: '3kHz', h: '55%', gain: '+2dB' },
                        { freq: '14kHz', h: '90%', gain: '+9dB' },
                      ].map((band, i) => (
                        <div key={i} className="flex flex-col items-center gap-1.5">
                          <span className="text-[9px] font-mono text-cyan-400">{band.gain}</span>
                          <div className="w-3 h-20 bg-white/10 rounded-full flex flex-col justify-end p-0.5">
                            <div 
                              className="w-full bg-gradient-to-t from-cyan-400 to-purple-500 rounded-full"
                              style={{ height: band.h }}
                            />
                          </div>
                          <span className="text-[9px] text-neutral-400 font-mono">{band.freq}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preset Buttons */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 font-bold text-cyan-300">
                      ⚡ Bass Boost Pro
                    </div>
                    <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/40 font-bold text-purple-300">
                      🎧 Binaural 3D Stage
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN 4: OFFLINE DOWNLOADS & MP3 */}
              {currentScreen.mockupContent === 'downloads' && (
                <div className="space-y-3.5 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-xs font-bold text-white">Offline Vault</span>
                    <span className="text-[10px] text-neutral-400">142 Tracks • 2.4 GB</span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-semibold text-emerald-300">MP3 Exporter Ready</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-white">320kbps</span>
                  </div>

                  <div className="space-y-2">
                    {[
                      { title: 'Neon Horizon', artist: 'Lorn', size: '9.4 MB', exported: true },
                      { title: 'Quantum Resonance', artist: 'Max Cooper', size: '12.8 MB', exported: true },
                      { title: 'Tokyo Rain & Coffee', artist: 'Kupla', size: '6.8 MB', exported: false },
                    ].map((song, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <div>
                          <div className="text-xs font-bold text-white">{song.title}</div>
                          <div className="text-[10px] text-neutral-400">{song.artist} • {song.size}</div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-cyan-300 font-mono">
                          {song.exported ? 'Exported' : 'Cached'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SCREEN 5: MOODS */}
              {currentScreen.mockupContent === 'moods' && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">
                    Music For Every Mood
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'Chill', color: 'from-blue-600/40 to-cyan-800/40', count: '14k tracks' },
                      { name: 'Focus', color: 'from-purple-600/40 to-violet-900/40', count: '21k tracks' },
                      { name: 'Energize', color: 'from-cyan-500/40 to-teal-800/40', count: '32k tracks' },
                      { name: 'Workout', color: 'from-red-600/40 to-orange-800/40', count: '28k tracks' },
                    ].map((mood, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-2xl bg-gradient-to-br ${mood.color} border border-white/15 flex flex-col justify-between h-20`}
                      >
                        <span className="text-xs font-black text-white">{mood.name}</span>
                        <span className="text-[9px] text-neutral-300 font-mono">{mood.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom App Navigation inside phone mockup */}
              <div className="pt-3 border-t border-white/10 flex justify-around text-[10px] text-neutral-400">
                <span className={currentScreen.mockupContent === 'player' ? 'text-cyan-400 font-bold' : ''}>Player</span>
                <span className={currentScreen.mockupContent === 'search' ? 'text-cyan-400 font-bold' : ''}>Search</span>
                <span className={currentScreen.mockupContent === 'equalizer' ? 'text-cyan-400 font-bold' : ''}>EQ</span>
                <span className={currentScreen.mockupContent === 'downloads' ? 'text-cyan-400 font-bold' : ''}>Downloads</span>
              </div>

              {/* Bottom Home Indicator Bar */}
              <div className="flex justify-center pt-2">
                <div className="w-32 h-1 bg-white/30 rounded-full" />
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
