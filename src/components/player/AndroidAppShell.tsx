import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Search, 
  Library, 
  Radio, 
  Download, 
  Wifi, 
  Battery, 
  Signal, 
  Settings, 
  Bell, 
  User, 
  Sparkles, 
  SlidersHorizontal, 
  Mic, 
  Play, 
  Pause, 
  Heart, 
  Maximize2, 
  Smartphone, 
  Monitor, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Clock,
  Music2,
  Disc,
  Compass
} from 'lucide-react';
import { useMusicPlayer } from '../../context/MusicPlayerContext';
import { Track } from '../../types/music';

interface AndroidAppShellProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onOpenSearch?: () => void;
  onOpenEqualizer?: () => void;
  onOpenEchoFind?: () => void;
}

export const AndroidAppShell: React.FC<AndroidAppShellProps> = ({
  children,
  activeTab,
  setActiveTab,
  onOpenSearch,
  onOpenEqualizer,
  onOpenEchoFind
}) => {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    isLiked,
    toggleLike,
    setIsFullPlayerOpen,
    ytAccount,
    setIsYtSignInModalOpen,
    setIsEqualizerOpen,
    setIsSleepTimerOpen,
    setIsAdBlockModalOpen,
    adBlockState
  } = useMusicPlayer();

  // Time for Android status bar
  const [timeString, setTimeString] = useState<string>('');
  const [batteryLevel, setBatteryLevel] = useState<number>(95);
  const [isMobileFrameMode, setIsMobileFrameMode] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Greeting based on hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="w-full min-h-screen bg-[#070913] text-slate-100 flex flex-col relative select-none font-sans">
      
      {/* Top Android App Mode Bar Toggle (Shown on large screens) */}
      <div className="hidden lg:flex items-center justify-between px-6 py-2 bg-[#0d1124] border-b border-cyan-500/20 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono font-bold text-cyan-300">GEN MUSIC Android 14 Edition</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">Material You Adaptive Interface</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileFrameMode(!isMobileFrameMode)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              isMobileFrameMode
                ? 'bg-cyan-400 text-black border-cyan-300 shadow-md font-bold'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
            }`}
          >
            {isMobileFrameMode ? <Smartphone className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
            <span>{isMobileFrameMode ? 'Android Phone View' : 'Fullscreen View'}</span>
          </button>
        </div>
      </div>

      {/* Main Layout Container (Optionally wrapped in phone frame if toggled) */}
      <div className={`w-full flex-grow flex flex-col mx-auto transition-all ${
        isMobileFrameMode 
          ? 'max-w-md my-4 rounded-[40px] border-[10px] border-slate-800/90 shadow-[0_0_50px_rgba(0,240,255,0.15)] overflow-hidden bg-[#070913]' 
          : 'max-w-7xl'
      }`}>

        {/* 1. Android System Status Bar */}
        <div className="w-full px-5 pt-3 pb-1 flex items-center justify-between text-xs font-medium text-slate-300 z-30 bg-[#070913]">
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-slate-200">
            <span>{timeString || '12:00'}</span>
          </div>

          {/* Android Punch hole camera simulator when in frame mode */}
          {isMobileFrameMode && (
            <div className="w-4 h-4 rounded-full bg-black border border-slate-800 shadow-inner" />
          )}

          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5 text-slate-200" />
            <div className="flex items-center gap-1 font-mono text-[10px]">
              <span>{batteryLevel}%</span>
              <Battery className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* 2. Android Material 3 App Header */}
        <header className="w-full px-4 sm:px-6 py-3 flex items-center justify-between gap-3 bg-[#070913]/90 backdrop-blur-xl sticky top-0 z-20 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div 
              onClick={() => setIsYtSignInModalOpen(true)}
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-600 p-0.5 cursor-pointer hover:scale-105 transition shadow-md shadow-cyan-500/20"
              title="YouTube Account"
            >
              <div className="w-full h-full rounded-full bg-[#0d1226] flex items-center justify-center text-cyan-300 font-bold text-xs">
                {ytAccount.signedIn ? (ytAccount.name?.charAt(0) || 'Y') : <User className="w-4 h-4" />}
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 font-mono">
                {getGreeting()}
              </p>
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-1.5">
                <span>GEN MUSIC</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-cyan-400/20 text-cyan-300 font-mono border border-cyan-400/30">
                  v3.8
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Header Direct Search Button */}
            <button
              onClick={() => {
                if (onOpenSearch) {
                  onOpenSearch();
                } else {
                  setActiveTab('search');
                }
              }}
              className="p-2.5 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-cyan-500/10"
              title="Search Songs, Artists & Playlists"
            >
              <Search className="w-4 h-4 text-cyan-300" />
              <span className="hidden sm:inline text-xs font-extrabold text-cyan-200">Search</span>
            </button>

            {/* Echo Find Mic Button */}
            <button
              onClick={onOpenEchoFind}
              className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-cyan-300 border border-white/10 transition cursor-pointer"
              title="Identify Song"
            >
              <Mic className="w-4 h-4 text-cyan-400" />
            </button>

            {/* Equalizer Button */}
            <button
              onClick={setIsEqualizerOpen}
              className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition cursor-pointer"
              title="Equalizer"
            >
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
            </button>

            {/* Background Play Active Badge */}
            <div 
              className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center gap-1.5 cursor-help"
              title="Background Audio Playback Enabled: Music plays continuously when phone is locked or app is minimized"
            >
              <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="hidden xl:inline text-[11px] font-bold text-cyan-200">Background Play ON</span>
            </div>

            {/* AdBlock Shield Badge */}
            <button
              onClick={() => setIsAdBlockModalOpen(true)}
              className={`p-2.5 rounded-2xl border transition cursor-pointer ${
                adBlockState.enabled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-white/5 text-slate-400 border-white/10'
              }`}
              title="AdBlock Shield"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </header>

        {/* 3. Android Material 3 Quick Filter Chips */}
        <div className="w-full px-4 sm:px-6 py-2.5 bg-[#070913] border-b border-white/5 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'home', label: 'Home Feed', icon: Home },
            { id: 'search', label: 'Explore', icon: Search },
            { id: 'charts', label: 'Top Charts', icon: Sparkles },
            { id: 'moods', label: 'Moods & Genres', icon: Compass },
            { id: 'country', label: 'Country Hits', icon: Radio },
            { id: 'library', label: 'Your Library', icon: Library },
          ].map((chip) => {
            const IconComponent = chip.icon;
            const isActive = activeTab === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setActiveTab(chip.id)}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-md shadow-cyan-400/20 scale-102'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                }`}
              >
                <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-slate-400'}`} />
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>

        {/* 4. Main Scrollable Content */}
        <main className="flex-grow overflow-y-auto pb-32">
          {children}
        </main>

        {/* 5 & 6. Permanently Fixed Bottom Mini Player & Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
          <div className="max-w-7xl mx-auto pointer-events-auto flex flex-col">
            {/* Android Floating Mini Player Widget */}
            {currentTrack && (
              <div className="px-3 pb-2 animate-in slide-in-from-bottom-3 duration-300">
                <div 
                  onClick={() => setIsFullPlayerOpen(true)}
                  className="w-full p-2.5 rounded-3xl bg-gradient-to-r from-[#0e162d]/98 via-[#0b1022]/98 to-[#131b38]/98 border border-cyan-400/50 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex items-center justify-between gap-3 cursor-pointer group hover:border-cyan-400 transition"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative w-11 h-11 rounded-2xl overflow-hidden shadow-lg border border-white/10 flex-shrink-0">
                      <img 
                        src={currentTrack.thumbnail} 
                        alt={currentTrack.title}
                        className={`w-full h-full object-cover ${isPlaying ? 'scale-105' : ''} transition-transform duration-500`}
                      />
                      {isPlaying && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <div className="flex items-end gap-0.5 h-3">
                            <span className="w-0.5 bg-cyan-400 h-full animate-pulse" />
                            <span className="w-0.5 bg-cyan-400 h-2/3 animate-pulse delay-75" />
                            <span className="w-0.5 bg-cyan-400 h-full animate-pulse delay-150" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition">
                        {currentTrack.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5 font-medium">
                        {currentTrack.artist}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => toggleLike(currentTrack)}
                      className="p-2 rounded-full text-slate-400 hover:text-rose-500 transition cursor-pointer"
                      title="Like Song"
                    >
                      <Heart className={`w-4 h-4 ${isLiked(currentTrack.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>

                    <button
                      onClick={togglePlay}
                      className="w-9 h-9 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black flex items-center justify-center transition shadow-md shadow-cyan-400/30 cursor-pointer"
                      title={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Android Material 3 Bottom Navigation Bar */}
            <nav className="w-full bg-[#080b18]/98 border-t border-cyan-500/20 backdrop-blur-3xl px-2 py-2 flex items-center justify-around shadow-2xl">
              {[
                { id: 'home', label: 'Home', icon: Home },
                { id: 'search', label: 'Search', icon: Search },
                { id: 'charts', label: 'Charts', icon: Sparkles },
                { id: 'country', label: 'Radio', icon: Radio },
                { id: 'library', label: 'Library', icon: Library },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex flex-col items-center justify-center py-1 px-3 min-w-[56px] transition-all cursor-pointer group"
                  >
                    <div className={`px-4 py-1.5 rounded-full transition-all flex items-center justify-center ${
                      isActive 
                        ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-md shadow-cyan-400/30 font-bold scale-105' 
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`}>
                      <Icon className={`w-5 h-5 ${isActive ? 'text-black scale-110' : ''}`} />
                    </div>
                    <span className={`text-[10px] font-extrabold mt-1 ${isActive ? 'text-cyan-300' : 'text-slate-400'}`}>
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Android System Gesture Handle Bar */}
            <div className="w-full bg-[#080b18] pb-1.5 flex justify-center items-center">
              <div className="w-32 h-1 rounded-full bg-slate-700/80" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
