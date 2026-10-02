import React, { useState } from 'react';
import { 
  Play, 
  Heart, 
  Search, 
  Download, 
  ChevronLeft,
  ChevronRight,
  Sliders,
  Compass,
  Check
} from 'lucide-react';
import { APP_SCREENSHOTS } from '../data/landingData';
import { GenMusicLogo } from './GenMusicLogo';

export const ScreenshotsSection: React.FC = () => {
  const [selectedScreenIndex, setSelectedScreenIndex] = useState(0);
  const currentScreen = APP_SCREENSHOTS[selectedScreenIndex];

  const handlePrev = () => {
    setSelectedScreenIndex((prev) => (prev === 0 ? APP_SCREENSHOTS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedScreenIndex((prev) => (prev === APP_SCREENSHOTS.length - 1 ? 0 : prev + 1));
  };

  return (
    <section 
      id="screenshots" 
      aria-label="App Screenshots Section"
      className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10"
    >
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
          See GEN MUSIC in Action
        </h2>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          Engineered for high-refresh AMOLED and car displays with responsive touch controls and fluid playback.
        </p>

        {/* Carousel Screen Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-4">
          {APP_SCREENSHOTS.map((screen, idx) => (
            <button
              key={screen.id}
              onClick={() => setSelectedScreenIndex(idx)}
              id={`screenshot-tab-${screen.id}`}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                selectedScreenIndex === idx
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {screen.category}
            </button>
          ))}
        </div>
      </div>

      {/* Carousel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center max-w-5xl mx-auto">
        
        {/* Left Column: Screen Info & Carousel Controls */}
        <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
          <div className="space-y-3">
            <span className="text-xs font-mono text-slate-500">
              Screen {selectedScreenIndex + 1} of {APP_SCREENSHOTS.length}
            </span>

            <h3 className="text-2xl sm:text-3xl font-bold text-white font-heading">
              {currentScreen.title}
            </h3>

            <p className="text-sm text-slate-400 leading-relaxed">
              {currentScreen.subtitle}
            </p>
          </div>

          <div className="space-y-2 pt-2">
            {[
              '120Hz fluid hardware acceleration',
              'Deep OLED true dark mode',
              'Zero intrusive audio advertisements',
              'One-tap offline MP3 export',
            ].map((bullet, i) => (
              <div key={i} className="flex items-center gap-2 justify-center lg:justify-start text-xs text-slate-300">
                <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>{bullet}</span>
              </div>
            ))}
          </div>

          {/* Carousel Next/Prev Controls */}
          <div className="flex items-center justify-center lg:justify-start gap-3 pt-2">
            <button
              onClick={handlePrev}
              aria-label="Previous screenshot"
              className="p-2.5 rounded-xl surface-card text-slate-400 hover:text-white transition cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1.5 px-2">
              {APP_SCREENSHOTS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedScreenIndex(i)}
                  aria-label={`Go to screenshot ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    selectedScreenIndex === i ? 'w-6 bg-sky-400' : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              aria-label="Next screenshot"
              className="p-2.5 rounded-xl surface-card text-slate-400 hover:text-white transition cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Column: Realistic Phone Mockup Frame */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="relative w-full max-w-[320px] sm:max-w-[340px] rounded-[44px] p-3.5 bg-[#0e121c] border-4 border-slate-800 shadow-2xl shadow-black/90">
            
            {/* Phone buttons simulation */}
            <div className="absolute -left-[6px] top-24 w-[3px] h-10 bg-slate-700 rounded-l" />
            <div className="absolute -left-[6px] top-38 w-[3px] h-10 bg-slate-700 rounded-l" />
            <div className="absolute -right-[6px] top-28 w-[3px] h-14 bg-slate-700 rounded-r" />

            {/* Inner Screen */}
            <div className="w-full bg-[#07090e] rounded-[34px] overflow-hidden border border-white/10 p-4 pt-2.5 relative flex flex-col justify-between min-h-[560px]">
              
              {/* Dynamic Notch */}
              <div className="w-20 h-4 bg-slate-900 rounded-full mx-auto mb-3 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              </div>

              {/* In-App Header */}
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/5">
                <div className="flex items-center gap-1.5">
                  <GenMusicLogo size="xs" glow={false} />
                  <span className="text-xs font-bold text-white font-heading">
                    GEN MUSIC
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Player</span>
              </div>

              {/* SCREEN 1: NOW PLAYING */}
              {currentScreen.mockupContent === 'player' && (
                <div className="space-y-3.5 flex-1 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="text-sky-400 font-semibold text-[10px]">
                      Dolby 3D Audio
                    </span>
                    <span className="font-mono text-slate-300 text-[10px]">320kbps MP3</span>
                    <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                  </div>

                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 to-sky-950 border border-white/10 flex items-center justify-center p-4">
                    <div className="text-center space-y-1">
                      <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center mx-auto">
                        <Play className="w-6 h-6 ml-0.5" />
                      </div>
                      <span className="text-[10px] font-mono text-sky-300 font-bold block pt-1">
                        Lossless Engine
                      </span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-white truncate">
                      Midnight Resonance
                    </h4>
                    <p className="text-xs text-slate-400">
                      GEN Spatial Symphony · Electronic
                    </p>
                  </div>

                  {/* Scrubber */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div className="w-3/5 h-full bg-sky-400" />
                    </div>
                    <div className="flex justify-between text-[9px] font-mono text-slate-500">
                      <span>2:14</span>
                      <span>3:42</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-6 py-1">
                    <span className="text-xs text-slate-400">⏮</span>
                    <div className="w-10 h-10 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center shadow-sm">
                      <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
                    </div>
                    <span className="text-xs text-slate-400">⏭</span>
                  </div>
                </div>
              )}

              {/* SCREEN 2: UNIFIED SEARCH */}
              {currentScreen.mockupContent === 'search' && (
                <div className="space-y-3 flex-1">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-white/10 flex items-center gap-2 text-xs text-slate-300">
                    <Search className="w-3.5 h-3.5 text-sky-400" />
                    <span>The Weeknd - Blinding Lights</span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="px-2 py-0.5 rounded-md bg-sky-950 border border-sky-500/30 text-sky-300 font-medium">
                      All Tracks (14)
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-400">
                      High Quality 320k
                    </span>
                  </div>

                  <div className="space-y-2">
                    {[
                      { title: 'Blinding Lights (Original)', time: '3:20' },
                      { title: 'Blinding Lights (Live Acoustic)', time: '3:45' },
                      { title: 'Blinding Lights (Spatial 3D)', time: '4:12' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-white/5">
                        <div className="text-xs font-medium text-white truncate max-w-[170px]">{item.title}</div>
                        <span className="text-[10px] font-mono text-sky-400">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SCREEN 3: EQUALIZER */}
              {currentScreen.mockupContent === 'equalizer' && (
                <div className="space-y-3 flex-1 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">5-Band Precision EQ</span>
                    <span className="text-[10px] text-sky-400">Dolby Active</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
                    <div className="flex justify-between items-end h-24 px-1">
                      {[
                        { freq: '60Hz', h: '65%', gain: '+4dB' },
                        { freq: '230Hz', h: '40%', gain: '+1dB' },
                        { freq: '910Hz', h: '80%', gain: '+6dB' },
                        { freq: '3kHz', h: '50%', gain: '+2dB' },
                        { freq: '14kHz', h: '85%', gain: '+7dB' },
                      ].map((band, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                          <span className="text-[8px] font-mono text-sky-400">{band.gain}</span>
                          <div className="w-2.5 h-16 bg-slate-800 rounded-full flex flex-col justify-end p-0.5">
                            <div className="w-full bg-sky-400 rounded-full" style={{ height: band.h }} />
                          </div>
                          <span className="text-[8px] text-slate-500 font-mono">{band.freq}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-300 font-medium">
                      Bass Boost
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-white/5 text-slate-400">
                      Studio Stage
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN 4: OFFLINE DOWNLOADS & MP3 */}
              {currentScreen.mockupContent === 'downloads' && (
                <div className="space-y-3 flex-1">
                  <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                    <span className="text-xs font-bold text-white">Offline Vault</span>
                    <span className="text-[10px] text-slate-500">142 Tracks · 2.4 GB</span>
                  </div>

                  <div className="space-y-2">
                    {[
                      { title: 'Neon Horizon', artist: 'Lorn', size: '9.4 MB' },
                      { title: 'Quantum Resonance', artist: 'Max Cooper', size: '12.8 MB' },
                      { title: 'Tokyo Rain & Coffee', artist: 'Kupla', size: '6.8 MB' },
                    ].map((song, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-white/5">
                        <div>
                          <div className="text-xs font-medium text-white">{song.title}</div>
                          <div className="text-[9px] text-slate-500">{song.artist} · {song.size}</div>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 font-mono">
                          Saved
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SCREEN 5: MOODS & CHANNELS */}
              {currentScreen.mockupContent === 'moods' && (
                <div className="space-y-3 flex-1">
                  <div className="flex items-center justify-between pb-1 border-b border-white/5">
                    <span className="text-xs font-bold text-white">Vibe Channels</span>
                    <span className="text-[10px] text-slate-500">6 Presets</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { name: 'Deep Focus', tracks: '240 songs' },
                      { name: 'Chill Out', tracks: '180 songs' },
                      { name: 'Workout Run', tracks: '320 songs' },
                      { name: 'Night Drive', tracks: '150 songs' },
                    ].map((m, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-slate-900/80 border border-white/5 space-y-0.5">
                        <div className="font-semibold text-white">{m.name}</div>
                        <div className="text-[9px] text-slate-500">{m.tracks}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
