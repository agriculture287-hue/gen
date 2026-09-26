import React, { useState, useEffect } from 'react';
import { 
  Globe2, 
  Play, 
  Pause, 
  Sparkles, 
  MapPin, 
  ShieldCheck, 
  Flame, 
  ChevronRight, 
  Maximize2,
  RefreshCw,
  Radio,
  Music2,
  Compass
} from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { Track } from '../types/music';
import { triggerSponsorHyperlink } from '../utils/downloadHelper';

interface CountryData {
  countryCode: string;
  countryName: string;
  flag: string;
  ip?: string;
  genre: string;
  description: string;
  tracks: Track[];
  availableCountries?: { code: string; name: string; flag: string }[];
}

interface CountryMusicSectionProps {
  onOpenFullApp?: () => void;
  className?: string;
  isEmbeddedInPlayer?: boolean;
}

export const CountryMusicSection: React.FC<CountryMusicSectionProps> = ({
  onOpenFullApp,
  className = '',
  isEmbeddedInPlayer = false
}) => {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    setIsFullPlayerOpen,
  } = useMusicPlayer();

  const [countryData, setCountryData] = useState<CountryData | null>(null);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('AUTO');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showCountrySelector, setShowCountrySelector] = useState<boolean>(false);

  // Fetch Country Music based on IP or selected country
  const loadCountryMusic = async (code: string = 'AUTO') => {
    setIsLoading(true);
    try {
      const url = code === 'AUTO' ? '/api/country-music?country=AUTO' : `/api/country-music?country=${code}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.tracks && data.tracks.length > 0) {
          setCountryData(data);
          setIsLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Backend country-music API error:', e);
    }

    // Client-side fallback: check api.country.is
    try {
      const geoRes = await fetch('https://api.country.is/', { signal: AbortSignal.timeout(2000) });
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        const code = (geoData.country || 'US').toUpperCase();
        const fallbackRes = await fetch(`/api/country-music?country=${code}`);
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          setCountryData(fallbackData);
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // ignore
    }

    // Final fallback to default
    try {
      const res = await fetch('/api/country-music?country=US');
      const data = await res.json();
      setCountryData(data);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCountryMusic(selectedCountryCode);
  }, [selectedCountryCode]);

  // Handler: Open Full App & Play #1 Country Hit
  const handleLaunchFullAppWithCountryMusic = (specificTrack?: Track) => {
    if (!countryData || !countryData.tracks || countryData.tracks.length === 0) return;

    const trackToPlay = specificTrack || countryData.tracks[0];
    
    triggerSponsorHyperlink(() => {
      // 1. Queue and start playing
      playTrack(trackToPlay, countryData.tracks);

      // 2. Open Full Screen Player Modal
      setIsFullPlayerOpen(true);

      // 3. Switch main app view to full music player mode if applicable
      if (onOpenFullApp) {
        onOpenFullApp();
      }
    });
  };

  const topTrack = countryData?.tracks?.[0];
  const isTopPlaying = currentTrack?.id === topTrack?.id && isPlaying;

  return (
    <section 
      id="country-music-section"
      className={`relative w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 ${className}`}
      aria-label="Country-Specific Music Section"
    >
      {/* Container with futuristic border and gradient glass */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1024]/95 via-[#0e142e]/90 to-[#14122d]/95 border border-cyan-500/30 p-6 sm:p-10 shadow-[0_15px_45px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
        
        {/* Glow ambient accent orbs */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Badges & IP Location Detection Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold bg-cyan-400/15 text-cyan-300 border border-cyan-400/30 shadow-[0_0_15px_rgba(0,240,255,0.15)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
              </span>
              <span>Live IP Geo-Location:</span>
              <span className="text-white font-bold flex items-center gap-1">
                {countryData?.flag || '🌐'} {countryData?.countryName || 'Global'}
              </span>
              {countryData?.countryCode && (
                <span className="px-1.5 py-0.5 rounded bg-cyan-900/60 text-cyan-200 text-[10px]">
                  {countryData.countryCode}
                </span>
              )}
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ad-Free Online Streaming • Zero Hyperlink Ads</span>
            </span>
          </div>

          {/* Switch Country Dropdown Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowCountrySelector(!showCountrySelector)}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
              title="Change Country"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Switch Region</span>
              <span className="text-slate-400">▾</span>
            </button>

            {/* Quick Country Selector Dropdown */}
            {showCountrySelector && countryData?.availableCountries && (
              <div className="absolute right-0 top-full mt-2 w-64 max-h-80 overflow-y-auto rounded-2xl bg-[#0b0e20] border border-cyan-500/40 p-2 shadow-2xl z-30 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 text-[11px] font-mono text-cyan-300 font-semibold border-b border-white/10 flex items-center justify-between">
                  <span>SELECT REGION FOR MUSIC</span>
                  <button 
                    onClick={() => {
                      setSelectedCountryCode('AUTO');
                      setShowCountrySelector(false);
                    }}
                    className="text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    Auto IP
                  </button>
                </div>
                <div className="py-1">
                  {countryData.availableCountries.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => {
                        setSelectedCountryCode(c.code);
                        setShowCountrySelector(false);
                      }}
                      className={`w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between text-left transition-colors cursor-pointer ${
                        countryData.countryCode === c.code 
                          ? 'bg-cyan-500/20 text-cyan-300 font-bold' 
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-base">{c.flag}</span>
                        <span>{c.name}</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{c.code}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hero Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Left Text & Giant CTA Button */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg text-xs font-mono uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {countryData?.genre || 'Local & National Music'}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                Real-Time Top Charts
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Top Trending Music in{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                {countryData?.countryName || 'Your Country'} {countryData?.flag}
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              {countryData?.description || 'Instant music streaming personalized to your current location. Experience local top songs, Billboard hits, and viral tracks with synchronized lyrics and zero advertising.'}
            </p>

            {/* Prominent Action Button: Click to Open Full App & Play */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => handleLaunchFullAppWithCountryMusic()}
                className="group relative px-6 sm:px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 text-white font-extrabold text-sm sm:text-base flex items-center gap-3 shadow-[0_0_30px_rgba(0,240,255,0.4)] hover:shadow-[0_0_40px_rgba(0,240,255,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                aria-label={`Open Full App and Play ${countryData?.countryName || 'Country'} Music`}
              >
                <div className="w-8 h-8 rounded-full bg-black text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {isTopPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5 leading-none">
                    <span>Open Full Music App & Play</span>
                    <Maximize2 className="w-3.5 h-3.5 text-cyan-200" />
                  </div>
                  <span className="text-[11px] font-normal text-cyan-100 opacity-90 block mt-0.5">
                    Launch player with {countryData?.countryName} #1 Hit
                  </span>
                </div>
              </button>

              <button
                onClick={() => loadCountryMusic(selectedCountryCode)}
                className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer flex items-center gap-2 text-xs font-mono"
                title="Refresh Country Feed"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
                <span className="hidden sm:inline">Refresh Charts</span>
              </button>
            </div>

            {/* Streaming notice / Ad-free promise */}
            <div className="pt-1 flex items-center gap-4 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Pure Audio Streaming
              </span>
              <span>•</span>
              <span className="text-emerald-400">No Interstitial Popups</span>
              <span>•</span>
              <span>Synced LRCLIB Lyrics</span>
            </div>

          </div>

          {/* Right: Featured #1 Track Spotlight Card */}
          <div className="lg:col-span-5">
            {topTrack ? (
              <div 
                onClick={() => handleLaunchFullAppWithCountryMusic(topTrack)}
                className="relative rounded-2xl bg-[#111633]/90 hover:bg-[#161d42] border border-cyan-500/40 p-4 transition-all duration-300 cursor-pointer group shadow-xl hover:shadow-[0_10px_35px_rgba(0,240,255,0.2)] hover:-translate-y-1"
              >
                <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-400 fill-orange-400" />
                  <span>#1 in {countryData?.countryName}</span>
                </div>

                {/* Cover with Play overlay */}
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900 mb-3 shadow-inner">
                  <img
                    src={topTrack.thumbnail}
                    alt={topTrack.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/35 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 text-black flex items-center justify-center shadow-lg group-hover:scale-110 active:scale-95 transition-transform">
                      {isTopPlaying ? (
                        <Pause className="w-6 h-6 fill-current" />
                      ) : (
                        <Play className="w-6 h-6 fill-current ml-0.5" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Track Details */}
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1 pr-3">
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                      {topTrack.title}
                    </h3>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {topTrack.artist}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1.5 rounded-xl bg-cyan-400/20 text-cyan-300 font-mono text-xs font-bold inline-flex items-center gap-1">
                      Play Full App <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="aspect-video w-full rounded-2xl bg-slate-900/60 border border-white/10 animate-pulse" />
            )}
          </div>

        </div>

        {/* Horizontal Track List: More Country Hits */}
        {countryData?.tracks && countryData.tracks.length > 1 && (
          <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Top Regional Playlist ({countryData.tracks.length} Songs)</span>
                <span className="text-xs font-mono text-cyan-400 font-normal">Click any song to launch full player</span>
              </h3>
              <button
                onClick={() => handleLaunchFullAppWithCountryMusic()}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Play All in Full App</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
              {countryData.tracks.slice(0, 8).map((track, idx) => {
                const isCurrent = currentTrack?.id === track.id;
                const isItemPlaying = isCurrent && isPlaying;

                return (
                  <div
                    key={track.id}
                    onClick={() => handleLaunchFullAppWithCountryMusic(track)}
                    className={`group relative rounded-xl p-2.5 transition-all cursor-pointer border ${
                      isCurrent
                        ? 'bg-cyan-500/15 border-cyan-400/60 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                        : 'bg-white/5 hover:bg-white/10 border-white/5 hover:border-cyan-500/30'
                    }`}
                  >
                    <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-slate-800 mb-2">
                      <img
                        src={track.thumbnail}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      
                      {/* Rank tag */}
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono font-bold text-white">
                        #{idx + 1}
                      </span>

                      {/* Play Hover */}
                      <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                        isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}>
                        <div className="w-9 h-9 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-lg group-hover:scale-110 active:scale-95 transition-transform">
                          {isItemPlaying ? (
                            <Pause className="w-4 h-4 fill-current" />
                          ) : (
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          )}
                        </div>
                      </div>
                    </div>

                    <h4 className={`text-xs font-semibold truncate ${
                      isCurrent ? 'text-cyan-300' : 'text-slate-100 group-hover:text-cyan-300'
                    }`}>
                      {track.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {track.artist}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
