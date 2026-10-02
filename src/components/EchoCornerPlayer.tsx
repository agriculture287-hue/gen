import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  ListMusic, 
  Maximize2, 
  Minimize2, 
  Search, 
  Youtube, 
  Music, 
  Disc, 
  Trash2, 
  ExternalLink, 
  AlertCircle, 
  Check, 
  Sparkles,
  Radio,
  FileText,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Compass,
  Headphones
} from 'lucide-react';
import { GenMusicLogo } from './GenMusicLogo';

export interface EchoTrack {
  id: string;
  title: string;
  artist: string;
  album?: string;
  source: 'archive' | 'youtube';
  streamUrl?: string;
  lowBitrateUrl?: string;
  youtubeId?: string;
  artwork?: string;
  duration?: number;
  genre?: string;
}

interface LyricLine {
  time: number;
  text: string;
}

const DEFAULT_CORNER_TRACKS: EchoTrack[] = [
  {
    id: 'echo-1',
    title: 'Clair de Lune',
    artist: 'Claude Debussy',
    album: 'Piano Classics',
    source: 'archive',
    streamUrl: 'https://archive.org/download/DebussyClairDeLune/01Debussy_ClairDeLune.mp3',
    artwork: 'https://archive.org/services/img/DebussyClairDeLune',
    duration: 304,
    genre: 'Classical'
  },
  {
    id: 'echo-2',
    title: 'Gymnopédie No. 1',
    artist: 'Erik Satie',
    album: 'Classical Quietude',
    source: 'archive',
    streamUrl: 'https://archive.org/download/gymnopedie_no1/gymnopedie_no1.mp3',
    artwork: 'https://archive.org/services/img/gymnopedie_no1',
    duration: 215,
    genre: 'Ambient'
  },
  {
    id: 'echo-3',
    title: 'Nocturne in E-flat Major, Op. 9',
    artist: 'Frédéric Chopin',
    album: 'Chopin Nocturnes',
    source: 'archive',
    streamUrl: 'https://archive.org/download/ChopinNocturneOp.9No.2/ChopinNocturneOp.9No.2.mp3',
    artwork: 'https://archive.org/services/img/ChopinNocturneOp.9No.2',
    duration: 272,
    genre: 'Piano'
  },
  {
    id: 'echo-4',
    title: 'Moonlight Sonata',
    artist: 'Ludwig van Beethoven',
    album: 'Sonata No. 14',
    source: 'archive',
    streamUrl: 'https://archive.org/download/LudwigVanBeethovenMoonlightSonata/01LudwigVanBeethoven-MoonlightSonata.mp3',
    artwork: 'https://archive.org/services/img/LudwigVanBeethovenMoonlightSonata',
    duration: 360,
    genre: 'Classical'
  }
];

export const EchoCornerPlayer: React.FC = () => {
  // Expansion State: 'collapsed' (floating corner pill) | 'panel' (drawer/window) | 'full' (overlay)
  const [playerMode, setPlayerMode] = useState<'collapsed' | 'panel' | 'full'>('collapsed');
  const [activeTab, setActiveTab] = useState<'player' | 'search' | 'queue' | 'lyrics' | 'brain'>('player');

  // Queue & Track State
  const [queue, setQueue] = useState<EchoTrack[]>(() => {
    try {
      const saved = localStorage.getItem('genmusic_queue');
      return saved ? JSON.parse(saved) : DEFAULT_CORNER_TRACKS;
    } catch {
      return DEFAULT_CORNER_TRACKS;
    }
  });

  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('genmusic_track_index');
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('genmusic_volume');
      return saved !== null ? Number(saved) : 0.85;
    } catch {
      return 0.85;
    }
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('all');
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isCrossfade, setIsCrossfade] = useState<boolean>(true);
  const [isDataSaver, setIsDataSaver] = useState<boolean>(false);

  // Sleep Timer (in minutes, 0 = off)
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number>(0);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number>(0);

  // Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<EchoTrack[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  // YouTube Link Input
  const [youtubeInput, setYoutubeInput] = useState<string>('');
  const [youtubeError, setYoutubeError] = useState<string | null>(null);

  // Lyrics State
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [plainLyrics, setPlainLyrics] = useState<string | null>(null);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);

  const currentTrack: EchoTrack | undefined = queue[currentIndex] || queue[0];

  // Save state
  useEffect(() => {
    try {
      localStorage.setItem('genmusic_queue', JSON.stringify(queue));
      localStorage.setItem('genmusic_track_index', String(currentIndex));
      localStorage.setItem('genmusic_volume', String(volume));
    } catch {
      // storage quota or incognito
    }
  }, [queue, currentIndex, volume]);

  // Audio volume sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Sleep Timer countdown
  useEffect(() => {
    if (sleepTimerRemaining <= 0) return;
    const interval = setInterval(() => {
      setSleepTimerRemaining((prev) => {
        if (prev <= 1) {
          if (audioRef.current) {
            audioRef.current.pause();
          }
          setIsPlaying(false);
          setSleepTimerMinutes(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [sleepTimerRemaining]);

  const handleSetSleepTimer = (mins: number) => {
    setSleepTimerMinutes(mins);
    setSleepTimerRemaining(mins * 60);
  };

  // Audio element events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }

      // Crossfade logic
      if (isCrossfade && audio.duration && audio.currentTime > audio.duration - 3.5 && !isMuted) {
        const remaining = audio.duration - audio.currentTime;
        const fadeRatio = Math.max(0, remaining / 3.5);
        audio.volume = volume * fadeRatio;
      }
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
      if (isPlaying) {
        audio.play().catch(() => setIsPlaying(false));
      }
    };

    const handleEnded = () => {
      handleNextTrack();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack, isPlaying, isCrossfade, volume, isMuted]);

  // Media Session API
  useEffect(() => {
    if (!currentTrack) return;
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album || 'Echo Music Engine',
        artwork: currentTrack.artwork
          ? [{ src: currentTrack.artwork, sizes: '512x512', type: 'image/jpeg' }]
          : [{ src: '/logo.png', sizes: '512x512', type: 'image/png' }],
      });

      navigator.mediaSession.setActionHandler('play', () => handleTogglePlay());
      navigator.mediaSession.setActionHandler('pause', () => handleTogglePlay());
      navigator.mediaSession.setActionHandler('previoustrack', () => handlePreviousTrack());
      navigator.mediaSession.setActionHandler('nexttrack', () => handleNextTrack());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) handleSeek(details.seekTime);
      });
    }
  }, [currentTrack]);

  // Keyboard Shortcuts (Space = Play/Pause, N = Next, P = Prev, M = Mute)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'KeyN') {
        handleNextTrack();
      } else if (e.code === 'KeyP') {
        handlePreviousTrack();
      } else if (e.code === 'KeyM') {
        setIsMuted((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentIndex, queue]);

  // LRCLIB Synced Lyrics
  useEffect(() => {
    if (!currentTrack) return;
    let isMounted = true;
    setIsLoadingLyrics(true);
    setLyrics([]);
    setPlainLyrics(null);

    const fetchLyrics = async () => {
      try {
        const url = `https://lrclib.net/api/get?track_name=${encodeURIComponent(
          currentTrack.title
        )}&artist_name=${encodeURIComponent(currentTrack.artist)}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) parseLyrics(data);
        } else {
          // Fallback search
          const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(
            `${currentTrack.title} ${currentTrack.artist}`
          )}`;
          const sRes = await fetch(searchUrl);
          if (sRes.ok) {
            const list = await sRes.json();
            if (Array.isArray(list) && list.length > 0 && isMounted) {
              parseLyrics(list[0]);
            }
          }
        }
      } catch {
        // Fallback gracefully
      } finally {
        if (isMounted) setIsLoadingLyrics(false);
      }
    };

    const parseLyrics = (data: any) => {
      if (data.syncedLyrics) {
        const lines: LyricLine[] = [];
        data.syncedLyrics.split('\n').forEach((l: string) => {
          const match = l.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
          if (match) {
            const time = parseInt(match[1], 10) * 60 + parseInt(match[2], 10) + parseInt(match[3].slice(0, 3), 10) / 1000;
            const text = match[4].trim();
            if (text) lines.push({ time, text });
          }
        });
        lines.sort((a, b) => a.time - b.time);
        setLyrics(lines);
      } else if (data.plainLyrics) {
        setPlainLyrics(data.plainLyrics);
      }
    };

    fetchLyrics();
    return () => { isMounted = false; };
  }, [currentTrack?.title, currentTrack?.artist]);

  // Active Lyric Index
  const activeLyricIndex = useMemo(() => {
    if (!lyrics.length) return -1;
    let idx = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (currentTime >= lyrics[i].time) idx = i;
      else break;
    }
    return idx;
  }, [currentTime, lyrics]);

  // Auto-scroll lyrics
  useEffect(() => {
    if (activeLyricIndex >= 0 && lyricsContainerRef.current) {
      const activeEl = lyricsContainerRef.current.children[activeLyricIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeLyricIndex]);

  // Controls
  const handleTogglePlay = () => {
    if (!currentTrack) return;
    if (currentTrack.source === 'archive') {
      const audio = audioRef.current;
      if (!audio) return;
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleNextTrack = () => {
    if (!queue.length) return;
    if (repeatMode === 'one') {
      if (audioRef.current && currentTrack?.source === 'archive') {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
        setIsPlaying(true);
      }
      return;
    }
    if (isShuffle) {
      setCurrentIndex(Math.floor(Math.random() * queue.length));
    } else {
      if (currentIndex < queue.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else if (repeatMode === 'all') {
        setCurrentIndex(0);
      } else {
        setIsPlaying(false);
      }
    }
    setIsPlaying(true);
  };

  const handlePreviousTrack = () => {
    if (currentTime > 3 && audioRef.current) {
      audioRef.current.currentTime = 0;
      return;
    }
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : queue.length - 1));
    setIsPlaying(true);
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    if (audioRef.current && currentTrack?.source === 'archive') {
      audioRef.current.currentTime = newTime;
    }
  };

  const handlePlayTrack = (track: EchoTrack) => {
    setQueue((prev) => {
      const existingIdx = prev.findIndex((t) => t.id === track.id);
      if (existingIdx !== -1) {
        setCurrentIndex(existingIdx);
        return prev;
      }
      const updated = [...prev, track];
      setCurrentIndex(updated.length - 1);
      return updated;
    });
    setIsPlaying(true);
  };

  // Search Archive API
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError(null);

    try {
      const q = encodeURIComponent(searchQuery.trim());
      const res = await fetch(`https://archive.org/advancedsearch.php?q=mediatype:audio+AND+(${q})&fl[]=identifier,title,creator,year&sort[]=downloads+desc&rows=20&page=1&output=json`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      const docs = data.response?.docs || [];

      if (!docs.length) {
        setSearchError('No tracks found. Try searching for Bach, Chopin, Lofi, or Ambient.');
        setIsSearching(false);
        return;
      }

      const tracks: EchoTrack[] = docs.map((doc: any, i: number) => ({
        id: `echo-search-${doc.identifier}-${i}`,
        title: doc.title || doc.identifier,
        artist: doc.creator || 'Internet Archive',
        album: 'Open Audio Collection',
        source: 'archive',
        streamUrl: `https://archive.org/download/${doc.identifier}/${encodeURIComponent(doc.identifier)}.mp3`,
        artwork: `https://archive.org/services/img/${doc.identifier}`
      }));

      setSearchResults(tracks);
    } catch {
      setSearchError('Could not reach search endpoint. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // YouTube Import
  const handleAddYouTube = (e: React.FormEvent) => {
    e.preventDefault();
    setYoutubeError(null);
    const reg = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = youtubeInput.trim().match(reg);
    if (match && match[2].length === 11) {
      const vid = match[2];
      const newTrk: EchoTrack = {
        id: `echo-yt-${vid}-${Date.now()}`,
        title: 'YouTube Stream Track',
        artist: 'Official YouTube Embed',
        source: 'youtube',
        youtubeId: vid,
        artwork: `https://img.youtube.com/vi/${vid}/hqdefault.jpg`,
      };
      setQueue((prev) => [...prev, newTrk]);
      setCurrentIndex(queue.length);
      setIsPlaying(true);
      setYoutubeInput('');
    } else {
      setYoutubeError('Please enter a valid YouTube video URL');
    }
  };

  // Echo Brain Recommendation Presets
  const echoBrainMoods = [
    { name: 'Deep Focus', query: 'Chopin Nocturne', desc: 'Gentle classical piano for concentration' },
    { name: 'Lo-Fi Chill', query: 'Debussy piano', desc: 'Warm acoustic relaxation' },
    { name: 'Night Drive', query: 'Synthwave electronic', desc: 'Harmonic spatial energy' },
    { name: 'Acoustic Calm', query: 'Satie gymnopedie', desc: 'Minimalist ambient quietude' },
  ];

  const handleEchoBrainInject = async (mood: typeof echoBrainMoods[0]) => {
    setSearchQuery(mood.query);
    setActiveTab('search');
    try {
      const q = encodeURIComponent(mood.query);
      const res = await fetch(`https://archive.org/advancedsearch.php?q=mediatype:audio+AND+(${q})&fl[]=identifier,title,creator&sort[]=downloads+desc&rows=6&page=1&output=json`);
      const data = await res.json();
      const docs = data.response?.docs || [];
      if (docs.length > 0) {
        const injected: EchoTrack[] = docs.map((doc: any, i: number) => ({
          id: `brain-${doc.identifier}-${i}`,
          title: doc.title || doc.identifier,
          artist: doc.creator || 'Echo Brain Selection',
          source: 'archive' as const,
          streamUrl: `https://archive.org/download/${doc.identifier}/${encodeURIComponent(doc.identifier)}.mp3`,
          artwork: `https://archive.org/services/img/${doc.identifier}`
        }));
        setQueue((prev) => [...prev, ...injected]);
      }
    } catch {
      // fallback
    }
  };

  const formatTime = (s: number) => {
    if (isNaN(s) || s < 0) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <>
      {/* Hidden audio element for archive files */}
      {currentTrack?.source === 'archive' && (
        <audio
          ref={audioRef}
          src={isDataSaver && currentTrack.lowBitrateUrl ? currentTrack.lowBitrateUrl : currentTrack.streamUrl}
          preload="metadata"
        />
      )}

      {/* 1. COLLAPSED FLOATING CORNER WIDGET (Bottom Right) */}
      {playerMode === 'collapsed' && (
        <div 
          id="echo-corner-player-dock"
          role="region"
          aria-label="Echo Music Corner Player"
          className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-300"
        >
          <div className="surface-card bg-[#0b0e14]/95 border border-white/10 shadow-2xl p-2.5 sm:p-3 flex items-center gap-3 backdrop-blur-xl rounded-2xl group hover:border-sky-500/40 transition">
            
            {/* Rotating Vinyl Disc / Thumbnail */}
            <div 
              onClick={() => setPlayerMode('panel')}
              className="relative w-10 h-10 rounded-xl bg-slate-900 border border-white/10 overflow-hidden cursor-pointer shrink-0 flex items-center justify-center group-hover:scale-105 transition"
              title="Click to expand player"
            >
              {currentTrack?.artwork ? (
                <img 
                  src={currentTrack.artwork} 
                  alt="" 
                  className={`w-full h-full object-cover ${isPlaying ? 'animate-spin' : ''}`}
                  style={{ animationDuration: '8s' }}
                />
              ) : (
                <Music className="w-5 h-5 text-sky-400" />
              )}
              {isPlaying && (
                <span className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-sky-400" />
              )}
            </div>

            {/* Track Info */}
            <div 
              onClick={() => setPlayerMode('panel')}
              className="min-w-0 max-w-[140px] sm:max-w-[180px] cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-sky-400 font-semibold uppercase tracking-wider">
                  Echo Player
                </span>
                {sleepTimerRemaining > 0 && (
                  <span className="text-[9px] font-mono text-amber-400">
                    ⏱ {Math.ceil(sleepTimerRemaining / 60)}m
                  </span>
                )}
              </div>
              <h4 className="text-xs font-bold text-white truncate group-hover:text-sky-300 transition">
                {currentTrack?.title || 'No track selected'}
              </h4>
              <p className="text-[10px] text-slate-400 truncate">
                {currentTrack?.artist || 'Echo Music'}
              </p>
            </div>

            {/* Quick Controls */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleTogglePlay}
                className="p-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 transition cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-slate-950" /> : <Play className="w-3.5 h-3.5 fill-slate-950 ml-0.5" />}
              </button>

              <button
                onClick={handleNextTrack}
                className="p-1.5 text-slate-400 hover:text-white transition cursor-pointer"
                title="Next"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setPlayerMode('panel')}
                className="p-1.5 text-slate-400 hover:text-white transition cursor-pointer"
                title="Expand online player"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 2. EXPANDED CORNER DRAWER WINDOW */}
      {playerMode === 'panel' && (
        <div 
          id="echo-corner-player-window"
          role="dialog"
          aria-label="Echo Music Player Panel"
          className="fixed bottom-14 sm:bottom-6 right-3 sm:right-6 z-50 w-[95vw] sm:w-[420px] max-h-[82vh] surface-card bg-[#0b0e14]/98 border border-white/10 shadow-2xl rounded-2xl flex flex-col overflow-hidden backdrop-blur-2xl animate-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header */}
          <div className="p-3.5 border-b border-white/5 flex items-center justify-between gap-2 bg-slate-950/60">
            <div className="flex items-center gap-2">
              <GenMusicLogo size="xs" glow={false} />
              <div>
                <h3 className="text-xs font-bold text-white font-heading">
                  Echo Music Online Player
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">
                  {currentTrack?.source === 'youtube' ? 'YouTube Embed' : 'Internet Archive Stream'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPlayerMode('full')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
                title="Full screen view"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setPlayerMode('collapsed')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
                title="Minimize to corner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/40 border-b border-white/5 text-[11px] font-semibold text-slate-400">
            <button
              onClick={() => setActiveTab('player')}
              className={`px-2 py-1 rounded-md transition cursor-pointer ${
                activeTab === 'player' ? 'text-sky-400 bg-white/5 font-bold' : 'hover:text-white'
              }`}
            >
              Player
            </button>
            <button
              onClick={() => setActiveTab('lyrics')}
              className={`px-2 py-1 rounded-md transition cursor-pointer ${
                activeTab === 'lyrics' ? 'text-sky-400 bg-white/5 font-bold' : 'hover:text-white'
              }`}
            >
              Lyrics
            </button>
            <button
              onClick={() => setActiveTab('queue')}
              className={`px-2 py-1 rounded-md transition cursor-pointer ${
                activeTab === 'queue' ? 'text-sky-400 bg-white/5 font-bold' : 'hover:text-white'
              }`}
            >
              Queue ({queue.length})
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`px-2 py-1 rounded-md transition cursor-pointer ${
                activeTab === 'search' ? 'text-sky-400 bg-white/5 font-bold' : 'hover:text-white'
              }`}
            >
              Search
            </button>
            <button
              onClick={() => setActiveTab('brain')}
              className={`px-2 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                activeTab === 'brain' ? 'text-sky-400 bg-white/5 font-bold' : 'hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3 text-sky-400" />
              <span>Brain</span>
            </button>
          </div>

          {/* Tab 1: NOW PLAYING VIEW */}
          {activeTab === 'player' && (
            <div className="p-4 space-y-4 overflow-y-auto">
              {/* Media Container: Artwork or YouTube Iframe */}
              {currentTrack?.source === 'youtube' && currentTrack.youtubeId ? (
                <div className="w-full aspect-video rounded-xl overflow-hidden bg-black border border-white/10 shadow-lg">
                  <iframe
                    src={`https://www.youtube.com/embed/${currentTrack.youtubeId}?autoplay=1&enablejsapi=1`}
                    title="YouTube Video Player"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="relative aspect-video sm:aspect-square max-h-[190px] w-full rounded-2xl overflow-hidden bg-slate-900 border border-white/10 flex items-center justify-center shadow-lg mx-auto">
                  {currentTrack?.artwork ? (
                    <img src={currentTrack.artwork} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Disc className="w-16 h-16 text-slate-700 animate-spin" style={{ animationDuration: '10s' }} />
                  )}
                  {isPlaying && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-slate-950/80 border border-white/10 text-[9px] font-mono text-sky-400">
                      Live Stream
                    </div>
                  )}
                </div>
              )}

              {/* Title & Artist */}
              <div className="space-y-0.5 text-center">
                <h4 className="text-sm font-bold text-white font-heading truncate">
                  {currentTrack?.title}
                </h4>
                <p className="text-xs text-slate-400 truncate">
                  {currentTrack?.artist}
                </p>
              </div>

              {/* Progress Seekbar */}
              {currentTrack?.source === 'archive' && (
                <div className="space-y-1">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={(e) => handleSeek(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              )}

              {/* Center Playback Controls */}
              <div className="flex items-center justify-between px-2">
                <button
                  onClick={() => setIsShuffle(!isShuffle)}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    isShuffle ? 'text-sky-400' : 'text-slate-500 hover:text-white'
                  }`}
                  title="Shuffle"
                >
                  <Shuffle className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePreviousTrack}
                    className="p-1.5 text-slate-300 hover:text-white transition cursor-pointer"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>

                  <button
                    onClick={handleTogglePlay}
                    className="p-3 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 transition transform active:scale-95 shadow-md cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-slate-950" /> : <Play className="w-5 h-5 fill-slate-950 ml-0.5" />}
                  </button>

                  <button
                    onClick={handleNextTrack}
                    className="p-1.5 text-slate-300 hover:text-white transition cursor-pointer"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    if (repeatMode === 'off') setRepeatMode('all');
                    else if (repeatMode === 'all') setRepeatMode('one');
                    else setRepeatMode('off');
                  }}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    repeatMode !== 'off' ? 'text-sky-400' : 'text-slate-500 hover:text-white'
                  }`}
                  title={`Repeat: ${repeatMode}`}
                >
                  {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
                </button>
              </div>

              {/* Volume Slider & Sleep Timer */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/5 text-xs text-slate-400">
                <div className="flex items-center gap-2 flex-1">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setIsMuted(false);
                      setVolume(Number(e.target.value));
                    }}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                </div>

                {/* Sleep Timer Selector */}
                <div className="flex items-center gap-1 font-mono text-[10px] shrink-0">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <select
                    value={sleepTimerMinutes}
                    onChange={(e) => handleSetSleepTimer(Number(e.target.value))}
                    className="bg-slate-900 border border-white/10 text-slate-300 rounded px-1.5 py-0.5 text-[10px] cursor-pointer"
                  >
                    <option value={0}>Timer Off</option>
                    <option value={15}>15 mins</option>
                    <option value={30}>30 mins</option>
                    <option value={45}>45 mins</option>
                    <option value={60}>60 mins</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: SYNCED LYRICS VIEW */}
          {activeTab === 'lyrics' && (
            <div className="p-4 flex-1 overflow-y-auto max-h-[350px]">
              {isLoadingLyrics ? (
                <div className="text-center text-xs text-slate-400 py-10">
                  Fetching synced lyrics from LRCLIB...
                </div>
              ) : lyrics.length > 0 ? (
                <div ref={lyricsContainerRef} className="space-y-3 scroll-smooth">
                  {lyrics.map((line, idx) => {
                    const isActive = idx === activeLyricIndex;
                    return (
                      <p
                        key={idx}
                        onClick={() => handleSeek(line.time)}
                        className={`text-xs sm:text-sm cursor-pointer transition-all ${
                          isActive
                            ? 'text-sky-400 font-bold text-sm sm:text-base scale-[1.02] origin-left'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {line.text}
                      </p>
                    );
                  })}
                </div>
              ) : plainLyrics ? (
                <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                  {plainLyrics}
                </div>
              ) : (
                <div className="text-center text-xs text-slate-500 py-10">
                  No synced lyrics available for this audio file.
                </div>
              )}
            </div>
          )}

          {/* Tab 3: QUEUE DRAWER VIEW */}
          {activeTab === 'queue' && (
            <div className="p-3 space-y-2 flex-1 overflow-y-auto max-h-[350px]">
              <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-white/5">
                <span>Play Queue ({queue.length} tracks)</span>
                <button
                  onClick={() => setQueue([currentTrack || DEFAULT_CORNER_TRACKS[0]])}
                  className="text-rose-400 hover:text-rose-300 cursor-pointer"
                >
                  Clear all
                </button>
              </div>

              <div className="space-y-1">
                {queue.map((track, i) => {
                  const isCur = i === currentIndex;
                  return (
                    <div
                      key={`${track.id}-${i}`}
                      onClick={() => {
                        setCurrentIndex(i);
                        setIsPlaying(true);
                      }}
                      className={`p-2 rounded-lg flex items-center justify-between gap-2 text-xs transition cursor-pointer ${
                        isCur ? 'bg-sky-500/20 text-sky-300 font-bold' : 'hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-mono text-slate-500 w-3">{i + 1}</span>
                        <div className="truncate">
                          <div className="truncate">{track.title}</div>
                          <div className="text-[10px] text-slate-500 truncate">{track.artist}</div>
                        </div>
                      </div>

                      {queue.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setQueue(queue.filter((_, idx) => idx !== i));
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 4: SEARCH & YOUTUBE STREAMING VIEW */}
          {activeTab === 'search' && (
            <div className="p-4 space-y-4 flex-1 overflow-y-auto max-h-[380px]">
              {/* Archive Search Input */}
              <form onSubmit={handleSearch} className="space-y-2">
                <label className="text-[11px] text-slate-400 font-semibold block">
                  Search Free Creative Commons Music
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search artist or title..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs cursor-pointer disabled:opacity-50"
                  >
                    {isSearching ? '...' : 'Search'}
                  </button>
                </div>
              </form>

              {/* YouTube Link Parser */}
              <form onSubmit={handleAddYouTube} className="space-y-2 pt-2 border-t border-white/5">
                <label className="text-[11px] text-slate-400 font-semibold block flex items-center gap-1.5">
                  <Youtube className="w-3.5 h-3.5 text-rose-500" />
                  <span>Stream from YouTube Embed</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={youtubeInput}
                    onChange={(e) => setYoutubeInput(e.target.value)}
                    placeholder="Paste YouTube link..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                {youtubeError && (
                  <p className="text-[10px] text-rose-400">{youtubeError}</p>
                )}
              </form>

              {/* Search Results */}
              {searchError && (
                <p className="text-xs text-rose-400">{searchError}</p>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] text-slate-500 font-mono">Found {searchResults.length} open tracks</span>
                  {searchResults.map((trk) => (
                    <div
                      key={trk.id}
                      className="p-2 rounded-lg surface-card flex items-center justify-between gap-2 hover:border-sky-500/40 transition text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-white truncate">{trk.title}</div>
                        <div className="text-[10px] text-slate-400 truncate">{trk.artist}</div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setQueue((prev) => [...prev, trk])}
                          className="p-1 rounded text-slate-400 hover:text-white"
                          title="Add to queue"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handlePlayTrack(trk)}
                          className="p-1.5 rounded-md bg-sky-500 text-slate-950"
                          title="Play"
                        >
                          <Play className="w-3 h-3 fill-slate-950" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 5: ECHO BRAIN SMART RECOMMENDATIONS */}
          {activeTab === 'brain' && (
            <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[350px]">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white font-heading flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>Echo Brain Mood Engine</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Select a mood to automatically discover and inject open tracks into your listening queue.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 pt-1">
                {echoBrainMoods.map((m) => (
                  <button
                    key={m.name}
                    onClick={() => handleEchoBrainInject(m)}
                    className="p-2.5 rounded-xl surface-card text-left hover:border-sky-500/50 transition cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-sky-300">{m.name}</span>
                      <Plus className="w-3 h-3 text-sky-400" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{m.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Footer Bar */}
          <div className="p-2.5 bg-slate-950/80 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span className="flex items-center gap-1">
              <Headphones className="w-3 h-3 text-sky-400" />
              <span>Bit-perfect 320kbps</span>
            </span>

            <a
              href="/listen"
              className="text-sky-400 hover:text-sky-300 font-semibold"
            >
              Open Full Web Player →
            </a>
          </div>

        </div>
      )}

      {/* 3. FULL SCREEN MODAL VIEW */}
      {playerMode === 'full' && (
        <div 
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#0b0e14]/98 backdrop-blur-3xl flex flex-col justify-between p-6 sm:p-10 animate-in fade-in duration-200"
        >
          {/* Top Bar */}
          <div className="max-w-4xl mx-auto w-full flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <GenMusicLogo size="xs" glow={false} />
              <span className="text-xs uppercase font-mono tracking-wider font-bold text-white">
                Echo Music Player
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPlayerMode('panel')}
                className="px-3 py-1.5 rounded-lg surface-card text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Dock to Corner
              </button>
              <button
                onClick={() => setPlayerMode('collapsed')}
                className="p-2 rounded-lg surface-card text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Stage */}
          <div className="max-w-3xl mx-auto w-full my-auto py-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Artwork / YouTube */}
            <div className="flex justify-center">
              {currentTrack?.source === 'youtube' && currentTrack.youtubeId ? (
                <div className="w-full aspect-video rounded-2xl overflow-hidden surface-card shadow-2xl">
                  <iframe
                    src={`https://www.youtube.com/embed/${currentTrack.youtubeId}?autoplay=1`}
                    title="YouTube Video"
                    className="w-full h-full border-0"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden surface-card p-4 shadow-2xl flex items-center justify-center relative">
                  {currentTrack?.artwork ? (
                    <img src={currentTrack.artwork} alt="" className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    <Disc className="w-24 h-24 text-slate-700" />
                  )}
                </div>
              )}
            </div>

            {/* Info & Synced Lyrics */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-white font-heading">{currentTrack?.title}</h2>
                <p className="text-sm text-slate-400">{currentTrack?.artist}</p>
              </div>

              {/* Lyrics Box */}
              <div className="h-48 surface-card p-4 overflow-y-auto rounded-2xl space-y-2">
                {lyrics.length > 0 ? (
                  lyrics.map((l, i) => (
                    <p
                      key={i}
                      onClick={() => handleSeek(l.time)}
                      className={`text-xs sm:text-sm cursor-pointer transition ${
                        i === activeLyricIndex ? 'text-sky-400 font-bold text-base scale-[1.02] origin-left' : 'text-slate-500'
                      }`}
                    >
                      {l.text}
                    </p>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-10">No lyrics available</p>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="max-w-2xl mx-auto w-full space-y-3">
            {currentTrack?.source === 'archive' && (
              <div className="space-y-1">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => handleSeek(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
                <div className="flex justify-between text-xs text-slate-500 font-mono">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-6">
              <button onClick={handlePreviousTrack} className="text-slate-300 hover:text-white cursor-pointer">
                <SkipBack className="w-6 h-6" />
              </button>
              <button onClick={handleTogglePlay} className="p-4 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 cursor-pointer">
                {isPlaying ? <Pause className="w-6 h-6 fill-slate-950" /> : <Play className="w-6 h-6 fill-slate-950 ml-0.5" />}
              </button>
              <button onClick={handleNextTrack} className="text-slate-300 hover:text-white cursor-pointer">
                <SkipForward className="w-6 h-6" />
              </button>
            </div>
          </div>

        </div>
      )}
    </>
  );
};

export default EchoCornerPlayer;
