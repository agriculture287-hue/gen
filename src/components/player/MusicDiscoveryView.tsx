import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Play, 
  Pause, 
  Heart, 
  Plus, 
  Clock, 
  Music, 
  Sparkles, 
  Flame, 
  Radio, 
  Disc, 
  Layers, 
  FolderPlus, 
  Check, 
  ExternalLink,
  ShieldCheck,
  Info,
  Mic2,
  Trash2,
  Globe2,
  Sliders,
  Moon,
  BarChart3,
  FileUp,
  FileDown,
  Palette,
  TrendingUp,
  ListMusic,
  User,
  Music2,
  Share2,
  Youtube,
  Compass,
  Headphones,
  SlidersHorizontal,
  Volume2,
  Activity,
  Zap,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { useMusicPlayer } from '../../context/MusicPlayerContext';
import { Track, MoodGenreCategory, Playlist } from '../../types/music';
import { CountryMusicSection } from '../CountryMusicSection';
import { triggerSponsorHyperlink } from '../../utils/downloadHelper';
import { EqualizerModal } from './EqualizerModal';
import { SleepTimerModal } from './SleepTimerModal';
import { EchoFindModal } from './EchoFindModal';
import { PlaylistImportModal } from './PlaylistImportModal';
import { ArtistDetailModal } from './ArtistDetailModal';
import { AlbumDetailModal } from './AlbumDetailModal';
import { StatsRecapModal } from './StatsRecapModal';
import { YouTubeSignInModal } from './YouTubeSignInModal';
import { EchoAdBlockModal } from './EchoAdBlockModal';
import { PWAInstallBanner } from './PWAInstallBanner';
import { RotatingLeaderboardAd, RotatingFeedAd, RotatingCompactAd } from '../ads/RotatingAdEngine';
import { useEchoMusicSync } from '../../hooks/useEchoMusicSync';

interface Section {
  id: string;
  title: string;
  subtitle?: string;
  items: Track[];
}

interface MusicDiscoveryViewProps {
  initialSearchQuery?: string;
  onClearInitialQuery?: () => void;
}

export const MusicDiscoveryView: React.FC<MusicDiscoveryViewProps> = ({
  initialSearchQuery,
  onClearInitialQuery,
}) => {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    isLiked,
    toggleLike,
    library,
    createPlaylist,
    addToPlaylist,
    removeFromPlaylist,
    deletePlaylist,
    exportPlaylistAsJson,
    exportPlaylistAsM3u,
    setIsLyricsOpen,
    setIsEqualizerOpen,
    setIsSleepTimerOpen,
    setIsEchoFindOpen,
    setIsImportModalOpen,
    setIsStatsOpen,
    setIsYtSignInModalOpen,
    setIsAdBlockModalOpen,
    playerTheme,
    setPlayerTheme,
    openArtist,
    openAlbum,
    sleepTimer,
    ytAccount,
    adBlockState
  } = useMusicPlayer();

  const echoSync = useEchoMusicSync(true);

  const [activeTab, setActiveTab] = useState<'home' | 'moods' | 'charts' | 'country' | 'search' | 'library' | 'about'>('home');
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoadingHome, setIsLoadingHome] = useState(true);

  // Vibe filter for Discover tab
  const [vibeFilter, setVibeFilter] = useState<string>('all');

  // Moods & Genres state
  const [moods, setMoods] = useState<MoodGenreCategory[]>([]);
  const [selectedMood, setSelectedMood] = useState<MoodGenreCategory | null>(null);
  const [moodTracks, setMoodTracks] = useState<Track[]>([]);
  const [isLoadingMoodTracks, setIsLoadingMoodTracks] = useState(false);

  // Charts state
  const [charts, setCharts] = useState<{ top50: Track[]; viral: Track[]; trending: Track[] }>({
    top50: [],
    viral: [],
    trending: []
  });
  const [isLoadingCharts, setIsLoadingCharts] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState<'all' | 'songs' | 'artists'>('all');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Playlist creation state
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  // 2-Minute Ad Cycle State Tracker for Continuous Ad Delivery on /online
  const [adCycleCount, setAdCycleCount] = useState<number>(0);
  const [adSecondsRemaining, setAdSecondsRemaining] = useState<number>(120); // 2 minutes = 120s
  const [isAdCycling, setIsAdCycling] = useState<boolean>(false);
  const [lastAdRefreshTime, setLastAdRefreshTime] = useState<number>(Date.now());

  // useEffect Hook: Automatically cycles and refreshes ad placements every 2 minutes using state tracker
  useEffect(() => {
    const AD_CYCLE_INTERVAL_SECONDS = 120; // 2 minutes (120 seconds)

    const cycleInterval = setInterval(() => {
      setAdSecondsRemaining((prevRemaining) => {
        if (prevRemaining <= 1) {
          // Trigger ad refresh cycle and update tracking state
          setIsAdCycling(true);
          setAdCycleCount((prevCount) => prevCount + 1);
          setLastAdRefreshTime(Date.now());

          // Reset transition state after smooth rotation animation
          setTimeout(() => {
            setIsAdCycling(false);
          }, 350);

          return AD_CYCLE_INTERVAL_SECONDS;
        }
        return prevRemaining - 1;
      });
    }, 1000);

    return () => clearInterval(cycleInterval);
  }, []);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setActiveTab('search');
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Effect for initial search query
  useEffect(() => {
    if (initialSearchQuery && initialSearchQuery.trim()) {
      setSearchQuery(initialSearchQuery.trim());
      setActiveTab('search');
      if (onClearInitialQuery) onClearInitialQuery();
    }
  }, [initialSearchQuery]);

  // Fetch Home Feed
  useEffect(() => {
    let isMounted = true;
    setIsLoadingHome(true);

    fetch('/api/home')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.sections) {
          setSections(data.sections);
        }
      })
      .catch((err) => {
        console.warn('Failed to load home feed:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingHome(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Moods & Genres catalog
  useEffect(() => {
    fetch('/api/moods-genres')
      .then((r) => r.json())
      .then((data) => {
        if (data.categories) setMoods(data.categories);
      })
      .catch((e) => console.warn('Moods load error:', e));
  }, []);

  // Fetch Charts when tab is activated
  useEffect(() => {
    if (activeTab === 'charts' && charts.top50.length === 0) {
      setIsLoadingCharts(true);
      fetch('/api/charts')
        .then((r) => r.json())
        .then((data) => {
          setCharts({
            top50: data.top50 || [],
            viral: data.viral || [],
            trending: data.trending || []
          });
        })
        .catch((e) => console.warn('Charts error:', e))
        .finally(() => setIsLoadingCharts(false));
    }
  }, [activeTab]);

  // Load tracks when a mood is selected
  const handleSelectMood = async (mood: MoodGenreCategory) => {
    setSelectedMood(mood);
    setIsLoadingMoodTracks(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(mood.searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setMoodTracks(data.results || []);
      }
    } catch (e) {
      console.warn('Mood tracks error:', e);
    } finally {
      setIsLoadingMoodTracks(false);
    }
  };

  // Search Debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const params = new URLSearchParams({
          q: searchQuery.trim(),
          filter: searchFilter !== 'all' ? searchFilter : ''
        });
        const res = await fetch(`/api/search?${params}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
        }
      } catch (err) {
        console.warn('Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, searchFilter]);

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      const pl = createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setShowCreateModal(false);
      setSelectedPlaylistId(pl.id);
    }
  };

  // Extract featured hero track from first section
  const heroTrack = sections[0]?.items?.[0] || null;

  return (
    <div className="w-full min-h-screen bg-[#070913] text-slate-100 flex flex-col lg:flex-row relative">
      
      {/* Dynamic Ambient Background Glow */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-30 transition-all duration-1000 z-0"
        style={{
          background: currentTrack
            ? `radial-gradient(circle at 50% 20%, rgba(6, 182, 212, 0.15), transparent 70%), radial-gradient(circle at 80% 60%, rgba(99, 102, 241, 0.12), transparent 60%)`
            : `radial-gradient(circle at 30% 20%, rgba(14, 165, 233, 0.12), transparent 70%)`
        }}
      />

      {/* ========================================================= */}
      {/* 1. DESKTOP ECHOAPP SIDEBAR NAVIGATION RAIL (lg:w-64)      */}
      {/* ========================================================= */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 bg-[#0a0d1d]/90 border-r border-white/10 backdrop-blur-2xl p-5 sticky top-0 h-screen z-30 justify-between">
        <div className="space-y-6">
          {/* EchoApp Brand Header */}
          <div className="flex items-center gap-3 px-2">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-500 flex items-center justify-center text-black font-black text-sm shadow-lg shadow-cyan-500/20">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                ECHO <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">MUSIC</span>
              </h1>
              <p className="text-[10px] font-mono text-cyan-400 font-semibold tracking-wider uppercase">
                Innertube Audio
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-sm font-medium">
            {[
              { id: 'home', label: 'Discover', icon: Compass },
              { id: 'moods', label: 'Moods & Genres', icon: Sparkles },
              { id: 'charts', label: 'Top Charts', icon: TrendingUp },
              { id: 'country', label: 'Country Hits', icon: Globe2 },
              { id: 'search', label: 'Search', icon: Search, shortcut: '/' },
              { id: 'library', label: 'Your Library', icon: Layers, badge: library.likedTracks.length > 0 ? library.likedTracks.length : undefined },
              { id: 'about', label: 'GPL-3.0 Info', icon: Info },
            ].map(({ id, label, icon: Icon, shortcut, badge }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => {
                    setActiveTab(id as any);
                    if (id === 'search') {
                      setTimeout(() => searchInputRef.current?.focus(), 80);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/10 text-cyan-300 font-bold border border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.12)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{label}</span>
                  </div>
                  {shortcut && (
                    <kbd className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] font-mono text-slate-500 border border-white/10">
                      {shortcut}
                    </kbd>
                  )}
                  {badge !== undefined && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Playlist Pins */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between px-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
              <span>Playlists</span>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="hover:text-cyan-300 transition cursor-pointer p-0.5"
                title="Create New Playlist"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1 text-xs">
              <button
                onClick={() => {
                  setActiveTab('library');
                  setSelectedPlaylistId('liked');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition cursor-pointer text-left truncate"
              >
                <div className="w-5 h-5 rounded-md bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-3 h-3 fill-current" />
                </div>
                <span className="truncate font-medium">Liked Songs</span>
              </button>

              {library.playlists.slice(0, 3).map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => {
                    setActiveTab('library');
                    setSelectedPlaylistId(pl.id);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer text-left truncate"
                >
                  <Disc className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span className="truncate">{pl.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar Sponsor Ad Slot */}
          <div className="pt-3 border-t border-white/10">
            <RotatingCompactAd offset={3} cycleCount={adCycleCount} />
          </div>
        </div>

        {/* Sidebar Footer Cards: YouTube Account & Echo AdBlock Status */}
        <div className="space-y-2 pt-4 border-t border-white/10">
          {/* Echo AdBlock Status Widget */}
          <div 
            onClick={() => setIsAdBlockModalOpen(true)}
            className="p-2.5 rounded-2xl bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-500/20 transition cursor-pointer flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">Echo AdBlock</p>
                <p className="text-[10px] text-emerald-300 font-mono">100% Commercial-Free</p>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* YouTube Account Widget */}
          <div 
            onClick={() => setIsYtSignInModalOpen(true)}
            className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-xl bg-red-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Youtube className="w-4 h-4 fill-current" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {ytAccount.signedIn ? (ytAccount.name || 'YouTube User') : 'Sign In YouTube'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {ytAccount.signedIn ? 'Library Synced' : '1-Click Connect'}
                </p>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN APP CONTENT AREA WITH TOPBAR & VIEWS              */}
      {/* ========================================================= */}
      <main className="flex-1 flex flex-col min-w-0 pb-32 z-10">
        
        {/* Top Header Toolbar */}
        <header className="sticky top-0 z-30 w-full backdrop-blur-2xl bg-[#070913]/90 border-b border-white/10 px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          
          {/* Mobile Brand Title */}
          <div className="lg:hidden flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center text-black font-black text-xs">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-black text-white">ECHO MUSIC</span>
          </div>

          {/* Top Search Bar */}
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== 'search') setActiveTab('search');
              }}
              onFocus={() => {
                if (activeTab !== 'search') setActiveTab('search');
              }}
              placeholder="Search songs, artists, playlists (Press /)"
              className="w-full pl-9.5 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 text-xs sm:text-sm transition-all"
            />
          </div>

          {/* Header Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {/* Echo Find Song Identifier */}
            <button
              onClick={() => setIsEchoFindOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Identify songs playing nearby"
            >
              <Mic2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Echo Find</span>
            </button>

            {/* Axion Equalizer */}
            <button
              onClick={() => setIsEqualizerOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Axion 5-Band Equalizer & Dolby Audio"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Equalizer</span>
            </button>

            {/* Sleep Timer */}
            <button
              onClick={() => setIsSleepTimerOpen(true)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                sleepTimer.active
                  ? 'bg-indigo-500/20 border-indigo-400/40 text-indigo-300 animate-pulse'
                  : 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/10'
              }`}
              title="Sleep Timer"
            >
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">{sleepTimer.active ? `${sleepTimer.minutesRemaining}m` : 'Sleep'}</span>
            </button>

            {/* Stats Recap */}
            <button
              onClick={() => setIsStatsOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Listening Stats"
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
            </button>

            {/* Theme UI Switcher */}
            <button
              onClick={() => {
                const themes: ('material' | 'apple' | 'canvas' | 'minimal')[] = ['material', 'apple', 'canvas', 'minimal'];
                const next = themes[(themes.indexOf(playerTheme) + 1) % themes.length];
                setPlayerTheme(next);
              }}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer capitalize"
              title="Switch Player UI Design Theme"
            >
              <Palette className="w-3.5 h-3.5 text-pink-400" />
              <span className="hidden lg:inline">{playerTheme}</span>
            </button>

            {/* Echo AdBlock Shield Pill */}
            <button
              onClick={() => setIsAdBlockModalOpen(true)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                adBlockState.enabled
                  ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400 border-white/10'
              }`}
              title="AdBlock Settings"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">AdBlock</span>
            </button>

            {/* Automated GitHub Code Sync Pill */}
            <button
              onClick={() => echoSync.triggerSync()}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer ${
                echoSync.isSyncing
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 animate-pulse'
                  : echoSync.isSynced
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-white/5 text-slate-300 border-white/10'
              }`}
              title="Automated GitHub Code Sync - EchoMusicApp/Echo-Music"
            >
              <Zap className={`w-3.5 h-3.5 ${echoSync.isSyncing ? 'animate-spin text-cyan-400' : 'text-emerald-400'}`} />
              <span className="hidden xl:inline">
                {echoSync.isSyncing ? 'Syncing GitHub...' : 'Code Synced'}
              </span>
            </button>

            {/* YouTube Sign In Button */}
            <button
              onClick={() => setIsYtSignInModalOpen(true)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                ytAccount.signedIn
                  ? 'bg-red-600/20 text-red-200 border-red-500/40'
                  : 'bg-red-600 hover:bg-red-500 text-white border-transparent'
              }`}
              title="YouTube Music Account"
            >
              <Youtube className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">
                {ytAccount.signedIn ? (ytAccount.name?.split(' ')[0] || 'Connected') : 'Sign In'}
              </span>
            </button>
          </div>
        </header>

        {/* View Content Wrapper */}
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
          
          {/* PWA Localhost/Web Install Banner */}
          <PWAInstallBanner />

          {/* 2-Minute Rotating Top Leaderboard Ad */}
          <RotatingLeaderboardAd cycleCount={adCycleCount} />

          {/* ========================================================= */}
          {/* TAB 1: DISCOVER (ECHO MUSIC HOME FEED & QUICK PICKS)     */}
          {/* ========================================================= */}
          {activeTab === 'home' && (
            <div className="space-y-10 animate-in fade-in duration-300">
              
              {/* EchoApp Hero Spotlight Player Card */}
              {heroTrack && (
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0d1b2a] via-[#1b263b] to-[#0d1322] border border-cyan-500/30 p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 group">
                  <div className="relative z-10 space-y-3 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 text-[11px] font-mono border border-cyan-400/30 flex items-center gap-1.5 font-bold">
                        <Sparkles className="w-3 h-3" />
                        Echo Spotlight Mix
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Lossless Dolby 3D</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                      {heroTrack.title}
                    </h2>
                    
                    <p 
                      onClick={() => openArtist(heroTrack.artist)}
                      className="text-sm font-semibold text-cyan-300 hover:underline cursor-pointer"
                    >
                      {heroTrack.artist}
                    </p>

                    <p className="text-xs text-slate-400 max-w-md">
                      Stream high-fidelity spatial audio directly with live synchronized lyrics and zero audio advertising.
                    </p>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => playTrack(heroTrack, sections[0]?.items || [heroTrack])}
                        className="px-6 py-3 rounded-2xl bg-cyan-400 text-black font-extrabold text-xs sm:text-sm flex items-center gap-2 hover:bg-cyan-300 hover:scale-105 active:scale-95 transition-all shadow-[0_0_25px_rgba(0,240,255,0.4)] cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Play Spotlight Track</span>
                      </button>

                      <button
                        onClick={() => toggleLike(heroTrack)}
                        className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-rose-400 border border-white/10 transition cursor-pointer"
                        title="Save to Liked Songs"
                      >
                        <Heart className={`w-4 h-4 ${isLiked(heroTrack.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Artwork & Animated Sound Waves */}
                  <div className="relative z-10 flex items-center gap-6 flex-shrink-0">
                    <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group-hover:scale-105 transition-transform duration-500">
                      <img
                        src={heroTrack.thumbnail}
                        alt={heroTrack.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/70 backdrop-blur-md text-white text-[10px] font-mono">
                        {heroTrack.durationText || '3:30'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Vibe Quick Filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {[
                  { id: 'all', label: 'All Vibes', emoji: '🎵' },
                  { id: 'chill', label: 'Chill & Relax', emoji: '☕' },
                  { id: 'focus', label: 'Deep Focus', emoji: '🧠' },
                  { id: 'workout', label: 'Workout Energy', emoji: '⚡' },
                  { id: 'party', label: 'Party Hits', emoji: '🎉' },
                  { id: 'latenight', label: 'Late Night', emoji: '🌙' },
                  { id: 'acoustic', label: 'Acoustic', emoji: '🎸' },
                  { id: 'gaming', label: 'Gaming Beats', emoji: '🎮' },
                ].map((vibe) => (
                  <button
                    key={vibe.id}
                    onClick={() => {
                      setVibeFilter(vibe.id);
                      if (vibe.id !== 'all') {
                        setSearchQuery(vibe.label);
                        setActiveTab('search');
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      vibeFilter === vibe.id
                        ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 text-black font-bold shadow-md'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                    }`}
                  >
                    <span>{vibe.emoji}</span>
                    <span>{vibe.label}</span>
                  </button>
                ))}
              </div>

              {/* Dynamic Discovery Sections Feed */}
              {isLoadingHome ? (
                <div className="space-y-8">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="space-y-4 animate-pulse">
                      <div className="h-6 w-48 bg-slate-800 rounded-lg" />
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div key={i} className="aspect-square bg-slate-800/60 rounded-2xl" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                sections.map((section, idx) => (
                  <React.Fragment key={section.id}>
                    {/* Insert Sponsored Rotating Feed Card every 2 sections */}
                    {idx === 1 && (
                      <div className="my-4">
                        <RotatingFeedAd offset={1} cycleCount={adCycleCount} />
                      </div>
                    )}
                    {idx === 3 && (
                      <div className="my-4">
                        <RotatingFeedAd offset={3} cycleCount={adCycleCount} />
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-extrabold text-white tracking-tight">{section.title}</h3>
                          {section.subtitle && (
                            <p className="text-xs text-slate-400 mt-0.5">{section.subtitle}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {section.items.map((track) => {
                          const isCurrent = currentTrack?.id === track.id;
                          const liked = isLiked(track.id);

                          return (
                            <div
                              key={track.id}
                              onClick={() => playTrack(track, section.items)}
                              className="group relative bg-[#0e1224]/80 hover:bg-[#141b38] border border-white/5 hover:border-cyan-500/40 rounded-2xl p-3 transition-all duration-300 cursor-pointer flex flex-col hover:-translate-y-1 shadow-md hover:shadow-[0_10px_25px_rgba(0,0,0,0.5)]"
                            >
                              {/* Artwork */}
                              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-800 mb-3 shadow-inner">
                                <img
                                  src={track.thumbnail}
                                  alt={track.title}
                                  loading="lazy"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />

                                {/* Play overlay */}
                                <div className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center transition-opacity ${
                                  isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                }`}>
                                  <div className="w-10 h-10 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-lg shadow-cyan-400/40 transform group-hover:scale-110 transition-transform">
                                    {isCurrent && isPlaying ? (
                                      <Pause className="w-5 h-5 fill-current" />
                                    ) : (
                                      <Play className="w-5 h-5 fill-current ml-0.5" />
                                    )}
                                  </div>
                                </div>

                                {/* Now playing indicator */}
                                {isCurrent && (
                                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-cyan-500/90 text-black text-[10px] font-mono font-bold flex items-center gap-1 shadow">
                                    <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                                    PLAYING
                                  </div>
                                )}
                              </div>

                              {/* Info */}
                              <div className="flex-1 flex flex-col justify-between min-w-0">
                                <div>
                                  <h4 className="text-sm font-semibold text-white truncate group-hover:text-cyan-300 transition-colors" title={track.title}>
                                    {track.title}
                                  </h4>
                                  <p 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openArtist(track.artist);
                                    }}
                                    className="text-xs text-slate-400 truncate hover:text-cyan-300 hover:underline cursor-pointer mt-0.5" 
                                    title={track.artist}
                                  >
                                    {track.artist}
                                  </p>
                                </div>

                                {/* Footer meta */}
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[11px] text-slate-400">
                                  <span className="font-mono">{track.durationText || '3:30'}</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleLike(track);
                                    }}
                                    className="hover:text-rose-400 transition-colors p-1"
                                  >
                                    <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-rose-500 text-rose-500' : ''}`} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </React.Fragment>
                ))
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: MOODS & GENRES                                     */}
          {/* ========================================================= */}
          {activeTab === 'moods' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <RotatingFeedAd offset={2} cycleCount={adCycleCount} />

              <div>
                <h3 className="text-2xl font-black text-white">Moods & Genres</h3>
                <p className="text-xs text-slate-400 mt-1">Explore 24 curated musical moods, atmospheres, and genres from Echo Music</p>
              </div>

              {/* 24 Moods Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {moods.map((mood) => {
                  const isSelected = selectedMood?.id === mood.id;
                  return (
                    <div
                      key={mood.id}
                      onClick={() => handleSelectMood(mood)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[110px] relative overflow-hidden group shadow-md hover:-translate-y-1 ${
                        isSelected
                          ? 'border-cyan-400 bg-gradient-to-br from-cyan-950 to-slate-900 ring-2 ring-cyan-400/50'
                          : 'border-white/5 hover:border-white/20 bg-gradient-to-br from-slate-900 to-[#0a0e1c]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl group-hover:scale-125 transition-transform">{mood.emoji}</span>
                        <span className="text-[10px] font-mono text-cyan-400 font-bold">PLAY</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
                          {mood.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{mood.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Mood Tracklist */}
              {selectedMood && (
                <div className="p-6 rounded-3xl bg-slate-900/80 border border-cyan-500/30 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{selectedMood.emoji}</span>
                      <div>
                        <h4 className="text-lg font-bold text-white">{selectedMood.title} Playlist</h4>
                        <p className="text-xs text-slate-400">{selectedMood.description}</p>
                      </div>
                    </div>
                    {moodTracks.length > 0 && (
                      <button
                        onClick={() => playTrack(moodTracks[0], moodTracks)}
                        className="px-4 py-2 rounded-xl bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 hover:bg-cyan-300 transition cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Play All
                      </button>
                    )}
                  </div>

                  {isLoadingMoodTracks ? (
                    <div className="text-center py-12 text-slate-400 text-xs font-mono">
                      Loading tracks for {selectedMood.title}...
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {moodTracks.map((track) => (
                        <div
                          key={track.id}
                          onClick={() => playTrack(track, moodTracks)}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-500/30 transition cursor-pointer group"
                        >
                          <img
                            src={track.thumbnail}
                            alt={track.title}
                            className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">
                              {track.title}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">{track.artist}</p>
                          </div>
                          <Play className="w-4 h-4 text-cyan-400 opacity-0 group-hover:opacity-100 transition flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <RotatingCompactAd offset={0} cycleCount={adCycleCount} />
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: TOP CHARTS                                         */}
          {/* ========================================================= */}
          {activeTab === 'charts' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <RotatingFeedAd offset={3} cycleCount={adCycleCount} />

              <div>
                <h3 className="text-2xl font-black text-white">Global Music Charts</h3>
                <p className="text-xs text-slate-400 mt-1">Global Top 50, Viral Hits, and Trending Videos updated daily</p>
              </div>

              {isLoadingCharts ? (
                <div className="p-16 text-center text-slate-400 text-xs font-mono">
                  Fetching global charts data...
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Top 50 */}
                  <div className="p-5 rounded-3xl bg-slate-900/70 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🏆</span>
                        <h4 className="text-sm font-bold text-white">Top 50 Global</h4>
                      </div>
                      {charts.top50.length > 0 && (
                        <button
                          onClick={() => playTrack(charts.top50[0], charts.top50)}
                          className="text-xs font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer"
                        >
                          Play All
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      {charts.top50.slice(0, 10).map((t, idx) => (
                        <div
                          key={t.id}
                          onClick={() => playTrack(t, charts.top50)}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition cursor-pointer group"
                        >
                          <span className={`w-5 text-xs font-mono font-bold text-center ${
                            idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-600' : 'text-slate-500'
                          }`}>
                            {idx + 1}
                          </span>
                          <img src={t.thumbnail} alt={t.title} className="w-9 h-9 rounded-lg object-cover" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">
                              {t.title}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">{t.artist}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Viral Hits */}
                  <div className="p-5 rounded-3xl bg-slate-900/70 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🔥</span>
                        <h4 className="text-sm font-bold text-white">Viral Trending</h4>
                      </div>
                      {charts.viral.length > 0 && (
                        <button
                          onClick={() => playTrack(charts.viral[0], charts.viral)}
                          className="text-xs font-bold text-pink-400 hover:text-pink-300 cursor-pointer"
                        >
                          Play All
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      {charts.viral.slice(0, 10).map((t, idx) => (
                        <div
                          key={t.id}
                          onClick={() => playTrack(t, charts.viral)}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition cursor-pointer group"
                        >
                          <span className="w-5 text-xs font-mono text-pink-400 font-bold text-center">
                            {idx + 1}
                          </span>
                          <img src={t.thumbnail} alt={t.title} className="w-9 h-9 rounded-lg object-cover" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-white group-hover:text-pink-300 truncate">
                              {t.title}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">{t.artist}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trending Videos */}
                  <div className="p-5 rounded-3xl bg-slate-900/70 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🎬</span>
                        <h4 className="text-sm font-bold text-white">Music Videos</h4>
                      </div>
                      {charts.trending.length > 0 && (
                        <button
                          onClick={() => playTrack(charts.trending[0], charts.trending)}
                          className="text-xs font-bold text-amber-400 hover:text-amber-300 cursor-pointer"
                        >
                          Play All
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      {charts.trending.slice(0, 10).map((t, idx) => (
                        <div
                          key={t.id}
                          onClick={() => playTrack(t, charts.trending)}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition cursor-pointer group"
                        >
                          <span className="w-5 text-xs font-mono text-amber-400 font-bold text-center">
                            {idx + 1}
                          </span>
                          <img src={t.thumbnail} alt={t.title} className="w-9 h-9 rounded-lg object-cover" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-white group-hover:text-amber-300 truncate">
                              {t.title}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">{t.artist}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <RotatingCompactAd offset={1} cycleCount={adCycleCount} />
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: COUNTRY HITS                                       */}
          {/* ========================================================= */}
          {activeTab === 'country' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <RotatingFeedAd offset={4} cycleCount={adCycleCount} />
              <CountryMusicSection 
                onOpenFullApp={() => {
                  setActiveTab('home');
                }}
              />
              <RotatingCompactAd offset={0} cycleCount={adCycleCount} />
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: SEARCH                                             */}
          {/* ========================================================= */}
          {activeTab === 'search' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Filter Chips */}
              <div className="flex items-center justify-center gap-2">
                {(['all', 'songs', 'artists'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSearchFilter(filter)}
                    className={`px-4 py-1.5 rounded-xl text-xs capitalize transition-all cursor-pointer ${
                      searchFilter === filter
                        ? 'bg-cyan-400 text-black font-bold'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Promoted Rotating Sponsor Ad in Search Tab */}
              <div className="max-w-4xl mx-auto">
                <RotatingCompactAd offset={2} cycleCount={adCycleCount} />
              </div>

              {/* Results List */}
              {!isSearching && searchResults.length > 0 && (
                <div className="space-y-4 max-w-4xl mx-auto">
                  <div className="space-y-2">
                    {searchResults.map((track) => {
                      const isCurrent = currentTrack?.id === track.id;
                      const liked = isLiked(track.id);
                      return (
                        <div
                          key={track.id}
                          onClick={() => playTrack(track, searchResults)}
                          className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer group ${
                            isCurrent
                              ? 'bg-cyan-500/10 border-cyan-400/40'
                              : 'bg-white/5 hover:bg-white/10 border-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0">
                              <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover" />
                              {isCurrent && isPlaying && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className={`text-sm font-semibold truncate ${isCurrent ? 'text-cyan-300' : 'text-white'}`}>
                                {track.title}
                              </h4>
                              <p 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openArtist(track.artist);
                                }}
                                className="text-xs text-slate-400 truncate hover:text-cyan-300 hover:underline cursor-pointer"
                              >
                                {track.artist}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 ml-4">
                            <span className="text-xs font-mono text-slate-400">{track.durationText}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLike(track);
                              }}
                              className="p-2 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                            >
                              <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500 text-rose-500' : ''}`} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <RotatingFeedAd offset={1} cycleCount={adCycleCount} />
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 6: LIBRARY                                            */}
          {/* ========================================================= */}
          {activeTab === 'library' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <RotatingFeedAd offset={0} cycleCount={adCycleCount} />

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black text-white">Your Music Library</h3>
                  <p className="text-xs text-slate-400 mt-1">Manage custom playlists, favorites, and recent songs</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <FileUp className="w-4 h-4 text-emerald-400" />
                    Import Playlists
                  </button>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    New Playlist
                  </button>
                </div>
              </div>

              {/* Library Cards: Liked Tracks, History & Playlists */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {/* Liked songs card */}
                <div
                  onClick={() => setSelectedPlaylistId('liked')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between aspect-square ${
                    selectedPlaylistId === 'liked' || !selectedPlaylistId
                      ? 'bg-gradient-to-br from-rose-900/60 to-purple-900/40 border-rose-500/50 shadow-lg'
                      : 'bg-white/5 hover:bg-white/10 border-white/5'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center text-white shadow-md">
                    <Heart className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Liked Songs</h4>
                    <p className="text-xs text-slate-300">{library.likedTracks.length} tracks</p>
                  </div>
                </div>

                {/* History card */}
                <div
                  onClick={() => setSelectedPlaylistId('history')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between aspect-square ${
                    selectedPlaylistId === 'history'
                      ? 'bg-gradient-to-br from-cyan-900/60 to-blue-900/40 border-cyan-500/50 shadow-lg'
                      : 'bg-white/5 hover:bg-white/10 border-white/5'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center text-black shadow-md">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Recently Played</h4>
                    <p className="text-xs text-slate-300">{library.recentlyPlayed.length} tracks</p>
                  </div>
                </div>

                {/* Custom playlists */}
                {library.playlists.map((pl) => (
                  <div
                    key={pl.id}
                    onClick={() => setSelectedPlaylistId(pl.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between aspect-square ${
                      selectedPlaylistId === pl.id
                        ? 'bg-gradient-to-br from-purple-900/60 to-indigo-900/40 border-purple-500/50 shadow-lg'
                        : 'bg-white/5 hover:bg-white/10 border-white/5'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center text-white shadow-md">
                      <Disc className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white truncate">{pl.name}</h4>
                      <p className="text-xs text-slate-300">{pl.tracks.length} tracks</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Playlist Tracklist */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-white">
                    {selectedPlaylistId === 'history'
                      ? 'Recently Played Tracks'
                      : selectedPlaylistId === 'liked' || !selectedPlaylistId
                      ? 'Liked Songs'
                      : library.playlists.find((p) => p.id === selectedPlaylistId)?.name || 'Playlist'}
                  </h4>

                  {/* Export Buttons for custom playlists */}
                  {selectedPlaylistId && selectedPlaylistId !== 'liked' && selectedPlaylistId !== 'history' && (
                    <div className="flex items-center gap-2">
                      {(() => {
                        const pl = library.playlists.find((p) => p.id === selectedPlaylistId);
                        if (!pl) return null;
                        return (
                          <>
                            <button
                              onClick={() => exportPlaylistAsJson(pl)}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs hover:text-white flex items-center gap-1 transition cursor-pointer"
                              title="Export as JSON"
                            >
                              <FileDown className="w-3.5 h-3.5" /> JSON
                            </button>
                            <button
                              onClick={() => exportPlaylistAsM3u(pl)}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs hover:text-white flex items-center gap-1 transition cursor-pointer"
                              title="Export as M3U"
                            >
                              <FileDown className="w-3.5 h-3.5" /> M3U
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete playlist "${pl.name}"?`)) {
                                  deletePlaylist(pl.id);
                                  setSelectedPlaylistId('liked');
                                }
                              }}
                              className="p-1.5 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition cursor-pointer"
                              title="Delete Playlist"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Rotating Partner Sponsor Ad in Library Tab */}
                <div className="my-4">
                  <RotatingFeedAd offset={4} cycleCount={adCycleCount} />
                </div>

                {/* Render tracks */}
                {(() => {
                  let list: Track[] = [];
                  if (selectedPlaylistId === 'history') {
                    list = library.recentlyPlayed;
                  } else if (selectedPlaylistId === 'liked' || !selectedPlaylistId) {
                    list = library.likedTracks;
                  } else {
                    const found = library.playlists.find((p) => p.id === selectedPlaylistId);
                    list = found ? found.tracks : [];
                  }

                  if (list.length === 0) {
                    return (
                      <div className="text-center py-16 text-slate-400 bg-white/5 rounded-3xl border border-white/5">
                        <Music className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                        <p className="text-sm">No tracks in this playlist yet.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      {list.map((track) => (
                        <div
                          key={track.id}
                          onClick={() => playTrack(track, list)}
                          className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <img src={track.thumbnail} alt={track.title} className="w-10 h-10 rounded-xl object-cover" />
                            <div className="min-w-0 flex-1">
                              <h5 className="text-sm font-semibold text-white truncate group-hover:text-cyan-300">
                                {track.title}
                              </h5>
                              <p 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openArtist(track.artist);
                                }}
                                className="text-xs text-slate-400 truncate hover:text-cyan-300 hover:underline cursor-pointer"
                              >
                                {track.artist}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-slate-400">{track.durationText}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLike(track);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                            >
                              <Heart className={`w-3.5 h-3.5 ${isLiked(track.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 7: ABOUT & GPL-3.0                                    */}
          {/* ========================================================= */}
          {activeTab === 'about' && (
            <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-300">
              <RotatingFeedAd offset={0} cycleCount={adCycleCount} />

              <div className="p-8 rounded-3xl bg-slate-900/80 border border-white/10 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center text-black font-black text-2xl shadow-xl">
                    EM
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">Echo Music Engine (GPL-3.0)</h3>
                    <p className="text-xs text-slate-400 font-mono">Licensed under GNU General Public License v3.0</p>
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-slate-300 space-y-3 leading-relaxed">
                  <p>
                    Gen Music Web Streaming Engine is built on top of the open-source <strong className="text-cyan-400">Echo Music</strong> audio architecture.
                  </p>
                  <p>
                    It is 100% free and open-source software, providing lossless playback, real-time synchronized LRC lyrics via LRCLIB, Axion 5-band audio equalizing DSP, and YouTube Music public API indexing.
                  </p>
                </div>

                <div className="border-t border-white/10 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-slate-400">Upstream Project:</span>
                    <p className="font-mono text-cyan-400 font-bold">Echo Music Open Architecture</p>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-slate-400">License:</span>
                    <p className="font-mono text-emerald-400 font-bold">GNU GPL-3.0 Copyleft</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ========================================================= */}
      {/* 3. MOBILE GLASS BOTTOM NAVIGATION DOCK (lg:hidden)        */}
      {/* ========================================================= */}
      <div className="lg:hidden fixed bottom-18 left-0 right-0 z-30 px-4 pointer-events-none flex flex-col items-center gap-2">
        <div className="w-full max-w-md pointer-events-auto">
          <RotatingCompactAd offset={3} cycleCount={adCycleCount} />
        </div>
        <div className="max-w-md w-full bg-[#0a0e20]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-1.5 flex items-center justify-around shadow-2xl pointer-events-auto">
          {[
            { id: 'home', label: 'Discover', icon: Compass },
            { id: 'moods', label: 'Moods', icon: Sparkles },
            { id: 'charts', label: 'Charts', icon: TrendingUp },
            { id: 'search', label: 'Search', icon: Search },
            { id: 'library', label: 'Library', icon: Layers },
          ].map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id as any);
                  if (id === 'search') {
                    setTimeout(() => searchInputRef.current?.focus(), 80);
                  }
                }}
                className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition cursor-pointer ${
                  isActive ? 'text-cyan-400 font-bold bg-cyan-500/10' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px]">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleCreatePlaylist}
            className="w-full max-w-md bg-[#0e1224] border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl"
          >
            <h4 className="text-lg font-bold text-white">Create New Playlist</h4>
            <input
              type="text"
              placeholder="Playlist name..."
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-cyan-400 text-black font-bold text-xs hover:bg-cyan-300 cursor-pointer"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mount All Echo Music Feature Modals */}
      <EqualizerModal />
      <SleepTimerModal />
      <EchoFindModal />
      <PlaylistImportModal />
      <ArtistDetailModal />
      <AlbumDetailModal />
      <StatsRecapModal />
      <YouTubeSignInModal />
      <EchoAdBlockModal />

    </div>
  );
};
