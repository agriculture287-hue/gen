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
  ArrowLeft,
  SlidersHorizontal,
  Sparkles,
  Radio,
  FileText,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  Plus
} from 'lucide-react';
import { GenMusicLogo } from '../components/GenMusicLogo';

// Track type definition
export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  source: 'archive' | 'youtube';
  streamUrl?: string;
  lowBitrateUrl?: string;
  youtubeId?: string;
  artwork?: string;
  duration?: number; // in seconds
  year?: string;
  archiveIdentifier?: string;
}

// Synced Lyric Line
interface LyricLine {
  time: number; // in seconds
  text: string;
}

// Default curated open-source / Creative Commons tracks for initial library
const CURATED_TRACKS: Track[] = [
  {
    id: 'curated-1',
    title: 'Clair de Lune',
    artist: 'Claude Debussy',
    album: 'Piano Classics',
    source: 'archive',
    streamUrl: 'https://archive.org/download/DebussyClairDeLune/01Debussy_ClairDeLune.mp3',
    artwork: 'https://archive.org/services/img/DebussyClairDeLune',
    duration: 304,
    year: '1905',
    archiveIdentifier: 'DebussyClairDeLune'
  },
  {
    id: 'curated-2',
    title: 'Gymnopédie No. 1',
    artist: 'Erik Satie',
    album: 'Classical Quietude',
    source: 'archive',
    streamUrl: 'https://archive.org/download/gymnopedie_no1/gymnopedie_no1.mp3',
    artwork: 'https://archive.org/services/img/gymnopedie_no1',
    duration: 215,
    year: '1888',
    archiveIdentifier: 'gymnopedie_no1'
  },
  {
    id: 'curated-3',
    title: 'Nocturne in E-flat Major, Op. 9, No. 2',
    artist: 'Frédéric Chopin',
    album: 'Chopin Nocturnes',
    source: 'archive',
    streamUrl: 'https://archive.org/download/ChopinNocturneOp.9No.2/ChopinNocturneOp.9No.2.mp3',
    artwork: 'https://archive.org/services/img/ChopinNocturneOp.9No.2',
    duration: 272,
    year: '1832',
    archiveIdentifier: 'ChopinNocturneOp.9No.2'
  },
  {
    id: 'curated-4',
    title: 'Moonlight Sonata (Adagio sostenuto)',
    artist: 'Ludwig van Beethoven',
    album: 'Sonata No. 14 in C-sharp Minor',
    source: 'archive',
    streamUrl: 'https://archive.org/download/LudwigVanBeethovenMoonlightSonata/01LudwigVanBeethoven-MoonlightSonata.mp3',
    artwork: 'https://archive.org/services/img/LudwigVanBeethovenMoonlightSonata',
    duration: 360,
    year: '1801',
    archiveIdentifier: 'LudwigVanBeethovenMoonlightSonata'
  },
  {
    id: 'curated-5',
    title: 'The Four Seasons: Spring (Allegro)',
    artist: 'Antonio Vivaldi',
    album: 'Le quattro stagioni',
    source: 'archive',
    streamUrl: 'https://archive.org/download/VivaldiTheFourSeasonsSpring/01-Spring-Allegro.mp3',
    artwork: 'https://archive.org/services/img/VivaldiTheFourSeasonsSpring',
    duration: 202,
    year: '1725',
    archiveIdentifier: 'VivaldiTheFourSeasonsSpring'
  },
  {
    id: 'curated-6',
    title: 'Air on the G String',
    artist: 'Johann Sebastian Bach',
    album: 'Orchestral Suite No. 3',
    source: 'archive',
    streamUrl: 'https://archive.org/download/BachAirOnTheGString/BachAirOnTheGString.mp3',
    artwork: 'https://archive.org/services/img/BachAirOnTheGString',
    duration: 260,
    year: '1731',
    archiveIdentifier: 'BachAirOnTheGString'
  }
];

export const ListenPage: React.FC = () => {
  // Queue & Player State
  const [queue, setQueue] = useState<Track[]>(() => {
    try {
      const saved = localStorage.getItem('genmusic_queue');
      return saved ? JSON.parse(saved) : CURATED_TRACKS;
    } catch {
      return CURATED_TRACKS;
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

  // UI Panels
  const [isFullPlayer, setIsFullPlayer] = useState<boolean>(false);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [isLyricsTab, setIsLyricsTab] = useState<boolean>(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [searchAlbums, setSearchAlbums] = useState<{ id: string; title: string; creator: string; count: number; artwork?: string }[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [activeSearchTab, setActiveSearchTab] = useState<'tracks' | 'albums'>('tracks');

  // YouTube Link Input
  const [youtubeInput, setYoutubeInput] = useState<string>('');
  const [youtubeError, setYoutubeError] = useState<string | null>(null);

  // Lyrics State
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [plainLyrics, setPlainLyrics] = useState<string | null>(null);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState<boolean>(false);
  const [lyricsError, setLyricsError] = useState<string | null>(null);

  // Audio HTML Element Ref
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);

  const currentTrack: Track | undefined = queue[currentIndex];

  // Save state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('genmusic_queue', JSON.stringify(queue));
    } catch (e) {
      console.warn('LocalStorage queue save error:', e);
    }
  }, [queue]);

  useEffect(() => {
    try {
      localStorage.setItem('genmusic_track_index', String(currentIndex));
    } catch (e) {
      console.warn('LocalStorage index save error:', e);
    }
  }, [currentIndex]);

  useEffect(() => {
    try {
      localStorage.setItem('genmusic_volume', String(volume));
    } catch (e) {
      console.warn('LocalStorage volume save error:', e);
    }
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Audio Element Setup
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }

      // Crossfade logic: fade down during last 3 seconds
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
        audio.play().catch((err) => {
          console.warn('Audio autoplay prevented:', err);
          setIsPlaying(false);
        });
      }
    };

    const handleEnded = () => {
      handleNextTrack();
    };

    const handleError = () => {
      console.warn('HTML5 Audio load error on stream:', currentTrack?.streamUrl);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [currentTrack, isPlaying, isCrossfade, volume, isMuted]);

  // Media Session API Integration for system notification and lock-screen controls
  useEffect(() => {
    if (!currentTrack) return;

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album || 'GEN MUSIC Open Library',
        artwork: currentTrack.artwork
          ? [
              { src: currentTrack.artwork, sizes: '96x96', type: 'image/jpeg' },
              { src: currentTrack.artwork, sizes: '256x256', type: 'image/jpeg' },
              { src: currentTrack.artwork, sizes: '512x512', type: 'image/jpeg' },
            ]
          : [{ src: '/logo.png', sizes: '512x512', type: 'image/png' }],
      });

      navigator.mediaSession.setActionHandler('play', () => handleTogglePlay());
      navigator.mediaSession.setActionHandler('pause', () => handleTogglePlay());
      navigator.mediaSession.setActionHandler('previoustrack', () => handlePreviousTrack());
      navigator.mediaSession.setActionHandler('nexttrack', () => handleNextTrack());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          handleSeek(details.seekTime);
        }
      });
    }
  }, [currentTrack]);

  // Load Synced Lyrics via LRCLIB API
  useEffect(() => {
    if (!currentTrack) {
      setLyrics([]);
      setPlainLyrics(null);
      return;
    }

    let isMounted = true;
    setIsLoadingLyrics(true);
    setLyricsError(null);
    setLyrics([]);
    setPlainLyrics(null);

    const fetchLyrics = async () => {
      try {
        // Query LRCLIB free public API
        const url = `https://lrclib.net/api/get?track_name=${encodeURIComponent(
          currentTrack.title
        )}&artist_name=${encodeURIComponent(currentTrack.artist)}`;

        const res = await fetch(url);
        if (!res.ok) {
          // Fallback search
          const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(
            `${currentTrack.title} ${currentTrack.artist}`
          )}`;
          const searchRes = await fetch(searchUrl);
          if (searchRes.ok) {
            const searchData = await searchRes.json();
            if (Array.isArray(searchData) && searchData.length > 0) {
              parseAndSetLyrics(searchData[0]);
              return;
            }
          }
          throw new Error('Lyrics not found');
        }

        const data = await res.json();
        if (isMounted) {
          parseAndSetLyrics(data);
        }
      } catch (err) {
        if (isMounted) {
          setLyricsError('No synced lyrics available for this track');
        }
      } finally {
        if (isMounted) {
          setIsLoadingLyrics(false);
        }
      }
    };

    const parseAndSetLyrics = (data: any) => {
      if (data.syncedLyrics) {
        const lines: LyricLine[] = [];
        const rawLines = data.syncedLyrics.split('\n');

        rawLines.forEach((line: string) => {
          const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
          if (match) {
            const minutes = parseInt(match[1], 10);
            const seconds = parseInt(match[2], 10);
            const ms = parseInt(match[3].padEnd(3, '0').slice(0, 3), 10);
            const timeInSec = minutes * 60 + seconds + ms / 1000;
            const text = match[4].trim();
            if (text) {
              lines.push({ time: timeInSec, text });
            }
          }
        });

        lines.sort((a, b) => a.time - b.time);
        setLyrics(lines);
      } else if (data.plainLyrics) {
        setPlainLyrics(data.plainLyrics);
      } else {
        setLyricsError('Instrumental track or lyrics not published.');
      }
    };

    fetchLyrics();

    return () => {
      isMounted = false;
    };
  }, [currentTrack?.title, currentTrack?.artist]);

  // Compute Active Lyric Index
  const activeLyricIndex = useMemo(() => {
    if (!lyrics.length) return -1;
    let idx = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (currentTime >= lyrics[i].time) {
        idx = i;
      } else {
        break;
      }
    }
    return idx;
  }, [currentTime, lyrics]);

  // Auto-scroll lyrics container to active line
  useEffect(() => {
    if (activeLyricIndex >= 0 && lyricsContainerRef.current) {
      const activeEl = lyricsContainerRef.current.children[activeLyricIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeLyricIndex]);

  // Playback Controls
  const handleTogglePlay = () => {
    if (!currentTrack) return;

    if (currentTrack.source === 'archive') {
      const audio = audioRef.current;
      if (!audio) return;

      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play().then(() => {
          setIsPlaying(true);
        }).catch((err) => {
          console.warn('Audio play error:', err);
          setIsPlaying(false);
        });
      }
    } else {
      // YouTube Embed source
      setIsPlaying(!isPlaying);
    }
  };

  const handleNextTrack = () => {
    if (queue.length === 0) return;

    if (repeatMode === 'one') {
      if (audioRef.current && currentTrack?.source === 'archive') {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
        setIsPlaying(true);
      }
      return;
    }

    if (isShuffle) {
      const nextIdx = Math.floor(Math.random() * queue.length);
      setCurrentIndex(nextIdx);
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

    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(queue.length - 1);
    }
    setIsPlaying(true);
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    if (audioRef.current && currentTrack?.source === 'archive') {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleSelectTrack = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(true);
  };

  const handleAddToQueue = (track: Track) => {
    setQueue((prev) => [...prev, track]);
  };

  const handlePlayNow = (track: Track) => {
    setQueue((prev) => {
      const newQueue = [...prev, track];
      setCurrentIndex(newQueue.length - 1);
      return newQueue;
    });
    setIsPlaying(true);
  };

  const handleRemoveFromQueue = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (queue.length <= 1) return;
    setQueue((prev) => prev.filter((_, i) => i !== index));
    if (index === currentIndex) {
      handleNextTrack();
    } else if (index < currentIndex) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleMoveQueueItem = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= queue.length) return;
    setQueue((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIdx, 1);
      updated.splice(toIdx, 0, moved);
      return updated;
    });
    if (currentIndex === fromIdx) {
      setCurrentIndex(toIdx);
    } else if (currentIndex > fromIdx && currentIndex <= toIdx) {
      setCurrentIndex(currentIndex - 1);
    } else if (currentIndex < fromIdx && currentIndex >= toIdx) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Search Internet Archive API
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);
    setSearchAlbums([]);

    try {
      // Query Internet Archive API for open audio items
      const queryParam = encodeURIComponent(searchQuery.trim());
      const url = `https://archive.org/advancedsearch.php?q=mediatype:audio+AND+(${queryParam})&fl[]=identifier,title,creator,description,year,downloads&sort[]=downloads+desc&rows=25&page=1&output=json`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Internet Archive service unreachable. Check internet connection.');
      }

      const data = await response.json();
      const docs = data.response?.docs || [];

      if (docs.length === 0) {
        setSearchError(`No free music found for "${searchQuery}". Try searching for classic artists (Debussy, Bach, Chopin), genres (Lofi, Jazz, Synth), or open archives.`);
        setIsSearching(false);
        return;
      }

      const tracks: Track[] = docs.map((doc: any, i: number) => {
        const id = doc.identifier;
        const title = doc.title || id;
        const creator = doc.creator || 'Internet Archive Audio';
        const year = doc.year ? String(doc.year) : undefined;

        // Internet archive standard audio endpoint
        const streamUrl = `https://archive.org/download/${id}/${encodeURIComponent(id)}.mp3`;
        const artwork = `https://archive.org/services/img/${id}`;

        return {
          id: `ia-${id}-${i}`,
          title: typeof title === 'string' ? title : String(title),
          artist: typeof creator === 'string' ? creator : String(creator),
          album: 'Internet Archive Open Collection',
          source: 'archive' as const,
          streamUrl,
          artwork,
          year,
          archiveIdentifier: id
        };
      });

      // Group albums / collections
      const albums = docs.slice(0, 8).map((doc: any) => ({
        id: doc.identifier,
        title: doc.title || doc.identifier,
        creator: doc.creator || 'Open Library',
        count: Math.floor(Math.random() * 8) + 4,
        artwork: `https://archive.org/services/img/${doc.identifier}`
      }));

      setSearchResults(tracks);
      setSearchAlbums(albums);
    } catch (err: any) {
      setSearchError(err.message || 'Failed to search audio archives. Please retry.');
    } finally {
      setIsSearching(false);
    }
  };

  // YouTube Link Parser & Queue Loader
  const handleAddYouTubeLink = (e: React.FormEvent) => {
    e.preventDefault();
    setYoutubeError(null);

    const input = youtubeInput.trim();
    if (!input) return;

    // Extract video ID from standard YouTube URL patterns
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = input.match(regExp);

    if (match && match[2].length === 11) {
      const videoId = match[2];
      const newTrack: Track = {
        id: `yt-${videoId}-${Date.now()}`,
        title: `YouTube Audio Track`,
        artist: 'Official YouTube Embed',
        source: 'youtube',
        youtubeId: videoId,
        artwork: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      };

      setQueue((prev) => [...prev, newTrack]);
      setYoutubeInput('');
      setCurrentIndex(queue.length);
      setIsPlaying(true);
    } else {
      setYoutubeError('Please enter a valid YouTube video link (e.g., https://www.youtube.com/watch?v=...)');
    }
  };

  // Format Seconds to MM:SS
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const activeAudioStreamUrl = isDataSaver && currentTrack?.lowBitrateUrl 
    ? currentTrack.lowBitrateUrl 
    : currentTrack?.streamUrl;

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 flex flex-col font-sans pb-32">
      
      {/* Hidden HTML5 Audio Player */}
      {currentTrack?.source === 'archive' && (
        <audio
          ref={audioRef}
          src={activeAudioStreamUrl}
          preload="metadata"
        />
      )}

      {/* Header Bar */}
      <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-[#0b0e14]/90 border-b border-white/10 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Home</span>
          </a>

          <div className="flex items-center gap-2.5">
            <GenMusicLogo size="xs" glow={false} />
            <span className="text-base font-bold text-white font-heading">
              GEN MUSIC <span className="text-sky-400 font-mono text-xs ml-1">Web Player</span>
            </span>
          </div>
        </div>

        {/* Action Controls & Settings */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDataSaver(!isDataSaver)}
            title="Toggle Data Saver (Low Bitrate Priority)"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer border flex items-center gap-1.5 ${
              isDataSaver
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Data Saver:</span>
            <span>{isDataSaver ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setIsCrossfade(!isCrossfade)}
            title="Toggle Smooth Track Crossfade"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer border flex items-center gap-1.5 ${
              isCrossfade
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Crossfade</span>
          </button>

          <button
            onClick={() => setIsQueueOpen(!isQueueOpen)}
            className={`p-2 rounded-lg transition cursor-pointer border ${
              isQueueOpen ? 'bg-sky-500 text-slate-950 border-sky-400' : 'bg-slate-900 border-white/10 text-slate-300 hover:text-white'
            }`}
            title="Open Queue"
          >
            <ListMusic className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full">
        
        {/* Top Search & YouTube Import Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
          
          {/* Internet Archive Music Search */}
          <div className="lg:col-span-7 surface-card p-6 space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                <Music className="w-5 h-5 text-sky-400" />
                <span>Search Free Audio & Music Archives</span>
              </h2>
              <p className="text-xs text-slate-400">
                Stream open and Creative Commons music from Internet Archive without accounts or restrictions.
              </p>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search artists, tracks, or collections (e.g. Debussy, Chopin, Lofi, Synth)..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm transition cursor-pointer disabled:opacity-50 whitespace-nowrap"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </form>

            {/* Quick search tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-slate-400">
              <span className="text-slate-500">Popular:</span>
              {['Chopin', 'Debussy', 'Beethoven', 'Synthesizer', 'Jazz Piano', 'Ambient'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setSearchQuery(tag);
                    setTimeout(() => {
                      const queryParam = encodeURIComponent(tag);
                      fetch(`https://archive.org/advancedsearch.php?q=mediatype:audio+AND+(${queryParam})&fl[]=identifier,title,creator,description,year,downloads&sort[]=downloads+desc&rows=25&page=1&output=json`)
                        .then(r => r.json())
                        .then(d => {
                          const docs = d.response?.docs || [];
                          const tracks = docs.map((doc: any, i: number) => ({
                            id: `ia-${doc.identifier}-${i}`,
                            title: doc.title || doc.identifier,
                            artist: doc.creator || 'Internet Archive',
                            album: 'Internet Archive Open Collection',
                            source: 'archive' as const,
                            streamUrl: `https://archive.org/download/${doc.identifier}/${encodeURIComponent(doc.identifier)}.mp3`,
                            artwork: `https://archive.org/services/img/${doc.identifier}`,
                            archiveIdentifier: doc.identifier
                          }));
                          setSearchResults(tracks);
                        });
                    }, 50);
                  }}
                  className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer text-[11px]"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* YouTube Official Link Streamer */}
          <div className="lg:col-span-5 surface-card p-6 space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                <Youtube className="w-5 h-5 text-rose-500" />
                <span>Play from YouTube</span>
              </h2>
              <p className="text-xs text-slate-400">
                Paste any YouTube video link to stream it in your player queue via the official embed.
              </p>
            </div>

            <form onSubmit={handleAddYouTubeLink} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={youtubeInput}
                  onChange={(e) => setYoutubeInput(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="flex-1 px-3 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer whitespace-nowrap"
                >
                  Add to queue
                </button>
              </div>
              {youtubeError && (
                <p className="text-[11px] text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{youtubeError}</span>
                </p>
              )}
            </form>
          </div>

        </div>

        {/* Search Results Area */}
        {searchError && (
          <div className="surface-card p-6 mb-10 border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
            <div className="space-y-1">
              <p className="font-semibold">{searchError}</p>
              <p className="text-slate-400 text-xs">
                Try searching for open music keywords like "Debussy", "Beethoven", "Satie", "Free Music", or "Lofi".
              </p>
            </div>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="space-y-6 mb-12">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-xl font-bold text-white font-heading">Search Results</h3>
                <p className="text-xs text-slate-400">{searchResults.length} tracks found from Internet Archive</p>
              </div>

              {/* Tabs for Tracks vs Albums */}
              <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-white/10">
                <button
                  onClick={() => setActiveSearchTab('tracks')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                    activeSearchTab === 'tracks' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Tracks ({searchResults.length})
                </button>
                <button
                  onClick={() => setActiveSearchTab('albums')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                    activeSearchTab === 'albums' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Collections ({searchAlbums.length})
                </button>
              </div>
            </div>

            {activeSearchTab === 'tracks' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {searchResults.map((track) => (
                  <div
                    key={track.id}
                    className="surface-card p-3.5 flex items-center justify-between gap-3 hover:border-sky-500/40 transition group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-slate-900 border border-white/10 overflow-hidden shrink-0 relative flex items-center justify-center">
                        {track.artwork ? (
                          <img
                            src={track.artwork}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Music className="w-5 h-5 text-sky-400" />
                        )}
                        <button
                          onClick={() => handlePlayNow(track)}
                          className="absolute inset-0 bg-sky-500/80 text-slate-950 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                          title="Play now"
                        >
                          <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                        </button>
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-sky-300 transition">
                          {track.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate">
                          {track.artist}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleAddToQueue(track)}
                        className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium border border-white/5 transition flex items-center gap-1 cursor-pointer"
                        title="Add to queue"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Queue</span>
                      </button>

                      <button
                        onClick={() => handlePlayNow(track)}
                        className="p-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 transition cursor-pointer"
                        title="Play now"
                      >
                        <Play className="w-3.5 h-3.5 fill-slate-950" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {searchAlbums.map((album) => (
                  <div
                    key={album.id}
                    className="surface-card p-4 space-y-3 hover:border-sky-500/40 transition group cursor-pointer"
                    onClick={() => {
                      // Load tracks from album into queue
                      const sampleTrack: Track = {
                        id: `album-trk-${album.id}`,
                        title: album.title,
                        artist: album.creator,
                        album: album.title,
                        source: 'archive',
                        streamUrl: `https://archive.org/download/${album.id}/${encodeURIComponent(album.id)}.mp3`,
                        artwork: album.artwork
                      };
                      handlePlayNow(sampleTrack);
                    }}
                  >
                    <div className="aspect-square rounded-xl bg-slate-900 border border-white/10 overflow-hidden flex items-center justify-center relative">
                      {album.artwork ? (
                        <img src={album.artwork} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      ) : (
                        <Disc className="w-10 h-10 text-slate-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate font-heading group-hover:text-sky-300">
                        {album.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate">
                        {album.creator}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Featured Open-Source Curated Library Showcase */}
        <div className="space-y-4 mb-16">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white font-heading">Featured Open Music Collection</h3>
              <p className="text-xs text-slate-400">Classical and public domain master recordings</p>
            </div>
            <span className="text-xs font-mono text-slate-500">6 Curated Tracks</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CURATED_TRACKS.map((track, i) => (
              <div
                key={track.id}
                className="surface-card p-4 flex items-center justify-between gap-3 hover:border-sky-500/40 transition group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center relative">
                    {track.artwork ? (
                      <img src={track.artwork} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Music className="w-5 h-5 text-sky-400" />
                    )}
                    <button
                      onClick={() => handlePlayNow(track)}
                      className="absolute inset-0 bg-sky-500/80 text-slate-950 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    >
                      <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                    </button>
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-sky-300 transition">
                      {track.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate">
                      {track.artist} · {track.year}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleAddToQueue(track)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
                    title="Add to queue"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePlayNow(track)}
                    className="p-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 transition cursor-pointer"
                    title="Play track"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Docked Mini Player at Bottom of Viewport */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0e121b]/95 border-t border-white/10 backdrop-blur-xl px-4 py-3 shadow-2xl">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            
            {/* Track Info (Left) */}
            <div 
              onClick={() => setIsFullPlayer(true)}
              className="flex items-center gap-3.5 min-w-0 flex-1 sm:flex-initial cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 overflow-hidden shrink-0 relative flex items-center justify-center">
                {currentTrack.artwork ? (
                  <img src={currentTrack.artwork} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Music className="w-6 h-6 text-sky-400" />
                )}
                {isPlaying && (
                  <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-sky-300 transition">
                    {currentTrack.title}
                  </h4>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5 shrink-0 hidden sm:inline">
                    {currentTrack.source === 'youtube' ? 'YouTube' : 'Open Archive'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  {currentTrack.artist}
                </p>
              </div>
            </div>

            {/* Playback Controls & Progress (Center) */}
            <div className="flex flex-col items-center gap-1.5 flex-1 max-w-xl">
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsShuffle(!isShuffle)}
                  className={`p-1.5 rounded-lg transition cursor-pointer hidden sm:block ${
                    isShuffle ? 'text-sky-400' : 'text-slate-500 hover:text-white'
                  }`}
                  title={isShuffle ? 'Disable Shuffle' : 'Enable Shuffle'}
                >
                  <Shuffle className="w-4 h-4" />
                </button>

                <button
                  onClick={handlePreviousTrack}
                  className="p-1.5 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Previous track"
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                <button
                  onClick={handleTogglePlay}
                  className="p-3 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 transition transform active:scale-95 shadow-sm cursor-pointer"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-slate-950" />
                  ) : (
                    <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                  )}
                </button>

                <button
                  onClick={handleNextTrack}
                  className="p-1.5 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Next track"
                >
                  <SkipForward className="w-5 h-5" />
                </button>

                <button
                  onClick={() => {
                    if (repeatMode === 'off') setRepeatMode('all');
                    else if (repeatMode === 'all') setRepeatMode('one');
                    else setRepeatMode('off');
                  }}
                  className={`p-1.5 rounded-lg transition cursor-pointer hidden sm:block ${
                    repeatMode !== 'off' ? 'text-sky-400' : 'text-slate-500 hover:text-white'
                  }`}
                  title={`Repeat mode: ${repeatMode}`}
                >
                  {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
                </button>
              </div>

              {/* Progress Seekbar */}
              {currentTrack.source === 'archive' && (
                <div className="w-full flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                  <span>{formatTime(currentTime)}</span>
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={(e) => handleSeek(Number(e.target.value))}
                    className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                  <span>{formatTime(duration)}</span>
                </div>
              )}
            </div>

            {/* Volume & Fullscreen Trigger (Right) */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
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
                  className="w-20 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
              </div>

              <button
                onClick={() => setIsQueueOpen(!isQueueOpen)}
                className={`p-2 rounded-lg transition cursor-pointer ${
                  isQueueOpen ? 'text-sky-400 bg-white/5' : 'text-slate-400 hover:text-white'
                }`}
                title="Toggle queue"
              >
                <ListMusic className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsFullPlayer(true)}
                className="p-2 text-slate-400 hover:text-white transition cursor-pointer"
                title="Expand Full Player"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Queue Drawer / Sidebar */}
      {isQueueOpen && (
        <aside className="fixed bottom-20 right-4 sm:right-6 w-full max-w-sm z-50 surface-card p-5 shadow-2xl bg-[#0f131d] border border-white/10 space-y-4 max-h-[70vh] flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div>
              <h3 className="text-sm font-bold text-white font-heading">Play Queue</h3>
              <p className="text-[11px] text-slate-400">{queue.length} tracks</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQueue([currentTrack || CURATED_TRACKS[0]])}
                className="text-[11px] text-rose-400 hover:text-rose-300 transition cursor-pointer"
                title="Clear queue"
              >
                Clear
              </button>
              <button
                onClick={() => setIsQueueOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer p-1"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {queue.map((track, idx) => {
              const isCurrent = idx === currentIndex;
              return (
                <div
                  key={`${track.id}-${idx}`}
                  onClick={() => handleSelectTrack(idx)}
                  className={`p-2.5 rounded-xl flex items-center justify-between gap-2.5 transition cursor-pointer group ${
                    isCurrent
                      ? 'bg-sky-500/15 border border-sky-500/30 text-sky-300'
                      : 'hover:bg-white/5 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[10px] font-mono text-slate-500 w-4 text-center">
                      {isCurrent ? '▶' : idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate group-hover:text-white">
                        {track.title}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {track.artist}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                    {/* Move up / down controls */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveQueueItem(idx, idx - 1);
                      }}
                      disabled={idx === 0}
                      className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-20 cursor-pointer"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveQueueItem(idx, idx + 1);
                      }}
                      disabled={idx === queue.length - 1}
                      className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-20 cursor-pointer"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleRemoveFromQueue(e, idx)}
                      className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                      title="Remove from queue"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      )}

      {/* Full-Screen Modal Player with Synced Lyrics */}
      {isFullPlayer && currentTrack && (
        <div className="fixed inset-0 z-50 bg-[#0b0e14]/98 backdrop-blur-2xl flex flex-col justify-between p-6 sm:p-10 animate-in fade-in duration-200">
          
          {/* Top Bar */}
          <div className="max-w-5xl mx-auto w-full flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono tracking-wider font-bold text-slate-400">
                Now Playing
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-xs text-sky-400 font-mono">
                {currentTrack.source === 'youtube' ? 'YouTube IFrame' : '320kbps Open Audio'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLyricsTab(!isLyricsTab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border flex items-center gap-1.5 ${
                  isLyricsTab ? 'bg-sky-500 text-slate-950 border-sky-400' : 'bg-slate-900 border-white/10 text-slate-300 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Lyrics</span>
              </button>

              <button
                onClick={() => setIsFullPlayer(false)}
                className="p-2 rounded-lg surface-card text-slate-400 hover:text-white transition cursor-pointer"
                title="Minimize player"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Center Stage: Album Art or YouTube Embed or Synced Lyrics */}
          <div className="max-w-4xl mx-auto w-full my-auto py-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
            {/* Artwork / YouTube Player Frame */}
            <div className="flex flex-col items-center">
              {currentTrack.source === 'youtube' && currentTrack.youtubeId ? (
                <div className="w-full aspect-video rounded-2xl overflow-hidden surface-card shadow-2xl">
                  <iframe
                    src={`https://www.youtube.com/embed/${currentTrack.youtubeId}?autoplay=1&enablejsapi=1`}
                    title="YouTube Video Player"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="w-full max-w-[340px] aspect-square rounded-3xl overflow-hidden surface-card p-4 shadow-2xl relative flex items-center justify-center">
                  {currentTrack.artwork ? (
                    <img src={currentTrack.artwork} alt="" className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    <Music className="w-20 h-20 text-sky-400" />
                  )}
                  {isPlaying && (
                    <div className="absolute top-6 right-6 px-2.5 py-1 rounded-full bg-slate-950/80 border border-white/10 text-[10px] font-mono text-sky-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                      <span>Streaming</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Track Info & Synced Lyrics */}
            <div className="space-y-6 flex flex-col justify-between h-[360px]">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white font-heading tracking-tight">
                  {currentTrack.title}
                </h2>
                <p className="text-sm sm:text-base text-slate-400 mt-1">
                  {currentTrack.artist} {currentTrack.album ? `— ${currentTrack.album}` : ''}
                </p>
              </div>

              {/* Lyrics Display Panel */}
              <div className="flex-1 surface-card p-4 overflow-hidden relative rounded-2xl flex flex-col justify-center">
                {isLoadingLyrics ? (
                  <div className="text-center text-xs text-slate-400 py-6">
                    Searching LRCLIB synced lyrics database...
                  </div>
                ) : lyrics.length > 0 ? (
                  <div 
                    ref={lyricsContainerRef}
                    className="h-full overflow-y-auto space-y-3 pr-2 scroll-smooth"
                  >
                    {lyrics.map((line, lIdx) => {
                      const isActive = lIdx === activeLyricIndex;
                      return (
                        <p
                          key={lIdx}
                          onClick={() => handleSeek(line.time)}
                          className={`text-sm sm:text-base transition-all duration-200 cursor-pointer font-medium leading-relaxed ${
                            isActive
                              ? 'text-sky-400 font-bold text-lg sm:text-xl scale-[1.02] origin-left'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {line.text}
                        </p>
                      );
                    })}
                  </div>
                ) : plainLyrics ? (
                  <div className="h-full overflow-y-auto text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed pr-2">
                    {plainLyrics}
                  </div>
                ) : (
                  <div className="text-center text-xs text-slate-500 py-6">
                    {lyricsError || 'No lyrics available for this recording.'}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Bottom Full Controls */}
          <div className="max-w-2xl mx-auto w-full space-y-4">
            {/* Scrubber */}
            {currentTrack.source === 'archive' && (
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

            {/* Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsShuffle(!isShuffle)}
                className={`p-2 rounded-lg transition cursor-pointer ${
                  isShuffle ? 'text-sky-400' : 'text-slate-500 hover:text-white'
                }`}
                title="Shuffle"
              >
                <Shuffle className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-6">
                <button
                  onClick={handlePreviousTrack}
                  className="p-2 text-slate-300 hover:text-white transition cursor-pointer"
                >
                  <SkipBack className="w-7 h-7" />
                </button>

                <button
                  onClick={handleTogglePlay}
                  className="p-4 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 transition transform active:scale-95 shadow-md cursor-pointer"
                >
                  {isPlaying ? (
                    <Pause className="w-7 h-7 fill-slate-950" />
                  ) : (
                    <Play className="w-7 h-7 fill-slate-950 ml-0.5" />
                  )}
                </button>

                <button
                  onClick={handleNextTrack}
                  className="p-2 text-slate-300 hover:text-white transition cursor-pointer"
                >
                  <SkipForward className="w-7 h-7" />
                </button>
              </div>

              <button
                onClick={() => {
                  if (repeatMode === 'off') setRepeatMode('all');
                  else if (repeatMode === 'all') setRepeatMode('one');
                  else setRepeatMode('off');
                }}
                className={`p-2 rounded-lg transition cursor-pointer ${
                  repeatMode !== 'off' ? 'text-sky-400' : 'text-slate-500 hover:text-white'
                }`}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default ListenPage;
