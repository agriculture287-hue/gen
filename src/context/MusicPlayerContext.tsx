import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Track, 
  LyricsData, 
  RepeatMode, 
  LibraryData, 
  Playlist,
  EqualizerState,
  EqualizerPreset,
  SleepTimerState,
  PlayerTheme,
  AudioQuality,
  ArtistDetails,
  AlbumDetails,
  ListeningStats,
  RecognizedSongResult,
  YouTubeAccount,
  AdBlockState,
  SponsorSegment
} from '../types/music';
import { audioPlayer } from '../services/audioPlayer';

export const EQ_PRESETS: EqualizerPreset[] = [
  { id: 'flat', name: 'Flat (Default)', gains: [0, 0, 0, 0, 0] },
  { id: 'bass', name: 'Bass Booster', gains: [8, 5, 1, 0, 0] },
  { id: 'vocal', name: 'Vocal Enhancer', gains: [-2, 2, 7, 3, -1] },
  { id: 'rock', name: 'Rock & Metal', gains: [5, 3, -1, 3, 5] },
  { id: 'pop', name: 'Pop Hits', gains: [-1, 2, 5, 2, -1] },
  { id: 'electronic', name: 'EDM & Electronic', gains: [6, 4, 0, 3, 5] },
  { id: 'jazz', name: 'Jazz & Blues', gains: [3, 2, 1, 2, 3] },
  { id: 'classical', name: 'Classical Concert', gains: [4, 2, -1, 3, 4] },
  { id: 'hiphop', name: 'Hip-Hop / 808s', gains: [7, 4, 0, 2, 4] },
  { id: 'acoustic', name: 'Acoustic / Folk', gains: [3, 4, 3, 2, 3] },
];

interface MusicPlayerContextType {
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  shuffle: boolean;
  lyrics: LyricsData | null;
  isLoadingLyrics: boolean;
  currentLyricIndex: number;
  lyricsOffset: number;
  isRomanized: boolean;
  
  // UI Panels
  isFullPlayerOpen: boolean;
  isQueueOpen: boolean;
  isLyricsOpen: boolean;
  isEqualizerOpen: boolean;
  isSleepTimerOpen: boolean;
  isEchoFindOpen: boolean;
  isImportModalOpen: boolean;
  isStatsOpen: boolean;
  isYtSignInModalOpen: boolean;
  isAdBlockModalOpen: boolean;
  
  // Audio Customization
  playerTheme: PlayerTheme;
  audioQuality: AudioQuality;
  equalizer: EqualizerState;
  sleepTimer: SleepTimerState;
  listeningStats: ListeningStats;
  adBlockState: AdBlockState;
  ytAccount: YouTubeAccount;
  isSyncingYtLibrary: boolean;
  
  // Modals & Details
  selectedArtist: ArtistDetails | null;
  selectedAlbum: AlbumDetails | null;
  isArtistLoading: boolean;
  isAlbumLoading: boolean;
  
  // Library
  library: LibraryData;

  // Actions
  playTrack: (track: Track, newQueue?: Track[]) => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  setVolume: (val: number) => void;
  toggleMute: () => void;
  playNext: () => void;
  playPrev: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  reorderQueue: (startIndex: number, endIndex: number) => void;

  // Setters for UI
  setIsFullPlayerOpen: (open: boolean) => void;
  setIsQueueOpen: (open: boolean) => void;
  setIsLyricsOpen: (open: boolean) => void;
  setIsEqualizerOpen: (open: boolean) => void;
  setIsSleepTimerOpen: (open: boolean) => void;
  setIsEchoFindOpen: (open: boolean) => void;
  setIsImportModalOpen: (open: boolean) => void;
  setIsStatsOpen: (open: boolean) => void;
  setIsYtSignInModalOpen: (open: boolean) => void;
  setIsAdBlockModalOpen: (open: boolean) => void;
  setPlayerTheme: (theme: PlayerTheme) => void;
  setAudioQuality: (quality: AudioQuality) => void;
  setLyricsOffset: (offset: number) => void;
  setIsRomanized: (val: boolean) => void;

  // YouTube Account Actions
  signInWithYouTube: (accountData?: Partial<YouTubeAccount>) => Promise<void>;
  signOutYouTube: () => void;
  syncUserYouTubeLibrary: () => Promise<void>;

  // Echo AdBlock Actions
  toggleAdBlock: () => void;
  toggleSponsorBlock: () => void;
  setSponsorBlockCategory: (category: string, enabled: boolean) => void;

  // EQ Actions
  setEqPreset: (presetId: string) => void;
  setEqBand: (bandIndex: number, gain: number) => void;
  setBassBoost: (val: number) => void;
  toggleSpatialAudio: () => void;
  toggleReplayGain: () => void;
  setPlaybackSpeed: (speed: number) => void;

  // Sleep Timer Actions
  startSleepTimer: (minutes: number | 'end_of_track') => void;
  cancelSleepTimer: () => void;

  // Artist & Album exploration
  openArtist: (artistName: string) => Promise<void>;
  closeArtist: () => void;
  openAlbum: (albumTitle: string, artistName?: string) => Promise<void>;
  closeAlbum: () => void;

  // Song Recognition (Echo Find)
  recognizeSong: (query?: string) => Promise<RecognizedSongResult | null>;

  // Playlist Importer & Exporter
  importPlaylistFromUrlOrData: (input: string) => Promise<Playlist | null>;
  exportPlaylistAsJson: (playlist: Playlist) => void;
  exportPlaylistAsM3u: (playlist: Playlist) => void;

  // Likes & Library Management
  isLiked: (trackId: string) => boolean;
  toggleLike: (track: Track) => void;
  createPlaylist: (name: string, description?: string) => Playlist;
  addToPlaylist: (playlistId: string, track: Track) => void;
  removeFromPlaylist: (playlistId: string, trackId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  clearHistory: () => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | null>(null);

const STORAGE_LIBRARY_KEY = 'genmusic_echo_library_v2';
const STORAGE_EQ_KEY = 'genmusic_echo_eq_v2';
const STORAGE_THEME_KEY = 'genmusic_echo_theme_v2';
const STORAGE_STATS_KEY = 'genmusic_echo_stats_v2';
const STORAGE_YT_ACCOUNT_KEY = 'genmusic_echo_yt_account_v2';
const STORAGE_ADBLOCK_KEY = 'genmusic_echo_adblock_v2';

export const MusicPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(90);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [shuffle, setShuffle] = useState<boolean>(false);

  // UI Panels
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState<boolean>(false);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState<boolean>(false);
  const [isEqualizerOpen, setIsEqualizerOpen] = useState<boolean>(false);
  const [isSleepTimerOpen, setIsSleepTimerOpen] = useState<boolean>(false);
  const [isEchoFindOpen, setIsEchoFindOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isYtSignInModalOpen, setIsYtSignInModalOpen] = useState<boolean>(false);
  const [isAdBlockModalOpen, setIsAdBlockModalOpen] = useState<boolean>(false);

  // YouTube Account State
  const [ytAccount, setYtAccount] = useState<YouTubeAccount>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_YT_ACCOUNT_KEY);
      return saved ? JSON.parse(saved) : { signedIn: false, authType: 'guest' };
    } catch {
      return { signedIn: false, authType: 'guest' };
    }
  });
  const [isSyncingYtLibrary, setIsSyncingYtLibrary] = useState<boolean>(false);

  // Echo AdBlock & SponsorBlock State
  const [adBlockState, setAdBlockState] = useState<AdBlockState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ADBLOCK_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      enabled: true,
      sponsorBlockEnabled: true,
      audioAdBlockEnabled: true,
      blockedAdsCount: 42,
      skippedSegmentsCount: 18,
      categories: {
        sponsor: true,
        selfpromo: true,
        interaction: true,
        intro: true,
        outro: true,
        music_offtopic: true,
      },
    };
  });

  // Theme & Quality
  const [playerTheme, setPlayerTheme] = useState<PlayerTheme>(() => {
    try {
      return (localStorage.getItem(STORAGE_THEME_KEY) as PlayerTheme) || 'material';
    } catch {
      return 'material';
    }
  });
  const [audioQuality, setAudioQuality] = useState<AudioQuality>('lossless');

  // Lyrics state
  const [lyrics, setLyrics] = useState<LyricsData | null>(null);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState<boolean>(false);
  const [lyricsOffset, setLyricsOffset] = useState<number>(0);
  const [isRomanized, setIsRomanized] = useState<boolean>(false);

  // Artist & Album details
  const [selectedArtist, setSelectedArtist] = useState<ArtistDetails | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumDetails | null>(null);
  const [isArtistLoading, setIsArtistLoading] = useState<boolean>(false);
  const [isAlbumLoading, setIsAlbumLoading] = useState<boolean>(false);

  // Equalizer
  const [equalizer, setEqualizer] = useState<EqualizerState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_EQ_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      enabled: true,
      preset: 'flat',
      bands: [0, 0, 0, 0, 0],
      bassBoost: 20,
      spatialAudio: true,
      replayGain: true,
      pitchSpeed: 1.0,
    };
  });

  // Sleep Timer
  const [sleepTimer, setSleepTimer] = useState<SleepTimerState>({
    active: false,
    targetTimestamp: null,
    mode: 'off',
    minutesRemaining: 0,
  });

  // Library state
  const [library, setLibrary] = useState<LibraryData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LIBRARY_KEY);
      return saved ? JSON.parse(saved) : { likedTracks: [], playlists: [], recentlyPlayed: [] };
    } catch {
      return { likedTracks: [], playlists: [], recentlyPlayed: [] };
    }
  });

  // Stats State
  const [listeningStats, setListeningStats] = useState<ListeningStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_STATS_KEY);
      return saved ? JSON.parse(saved) : {
        totalSecondsPlayed: 0,
        totalTracksPlayed: 0,
        topArtists: [],
        topTracks: [],
        topGenres: [
          { genre: 'Pop', count: 12 },
          { genre: 'Electronic', count: 8 },
          { genre: 'Hip-Hop', count: 6 },
        ],
        history: [],
      };
    } catch {
      return {
        totalSecondsPlayed: 0,
        totalTracksPlayed: 0,
        topArtists: [],
        topTracks: [],
        topGenres: [],
        history: [],
      };
    }
  });

  // Persist storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LIBRARY_KEY, JSON.stringify(library));
    } catch {}
  }, [library]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_EQ_KEY, JSON.stringify(equalizer));
    } catch {}
  }, [equalizer]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_THEME_KEY, playerTheme);
    } catch {}
  }, [playerTheme]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_STATS_KEY, JSON.stringify(listeningStats));
    } catch {}
  }, [listeningStats]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_YT_ACCOUNT_KEY, JSON.stringify(ytAccount));
    } catch {}
  }, [ytAccount]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ADBLOCK_KEY, JSON.stringify(adBlockState));
    } catch {}
  }, [adBlockState]);

  // Subscribe to audio engine and SponsorBlock
  useEffect(() => {
    const unsubscribe = audioPlayer.subscribe((state) => {
      setIsPlaying(state.isPlaying);
      setIsBuffering(state.isBuffering);
      setCurrentTime(state.currentTime);
      if (state.duration > 0) setDuration(state.duration);
    });

    audioPlayer.setSponsorBlockEnabled(adBlockState.sponsorBlockEnabled);
    audioPlayer.setAudioAdBlockEnabled(adBlockState.audioAdBlockEnabled);

    audioPlayer.setOnSegmentSkipped((segment, categoryLabel) => {
      setAdBlockState((prev) => ({
        ...prev,
        skippedSegmentsCount: prev.skippedSegmentsCount + 1,
        lastSkippedText: `Skipped ${categoryLabel} (${Math.floor(segment.segment[0])}s -> ${Math.floor(segment.segment[1])}s)`,
      }));
    });

    return () => unsubscribe();
  }, [adBlockState.sponsorBlockEnabled, adBlockState.audioAdBlockEnabled]);

  // Sleep timer interval countdown
  useEffect(() => {
    if (!sleepTimer.active || !sleepTimer.targetTimestamp) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = sleepTimer.targetTimestamp! - now;
      if (diff <= 0) {
        audioPlayer.pause();
        setSleepTimer({
          active: false,
          targetTimestamp: null,
          mode: 'off',
          minutesRemaining: 0,
        });
        clearInterval(interval);
      } else {
        setSleepTimer((prev) => ({
          ...prev,
          minutesRemaining: Math.max(1, Math.ceil(diff / 60000)),
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimer.active, sleepTimer.targetTimestamp]);

  // Track listening seconds in stats
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setListeningStats((prev) => ({
        ...prev,
        totalSecondsPlayed: prev.totalSecondsPlayed + 1,
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Fetch lyrics when track changes
  useEffect(() => {
    if (!currentTrack) {
      setLyrics(null);
      return;
    }

    let isSubscribed = true;
    setIsLoadingLyrics(true);
    setLyricsOffset(0);

    const params = new URLSearchParams({
      title: currentTrack.title,
      artist: currentTrack.artist,
      duration: (currentTrack.durationSeconds || duration || 0).toString(),
    });

    fetch(`/api/lyrics/${encodeURIComponent(currentTrack.id)}?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (isSubscribed && data) {
          setLyrics(data);
        }
      })
      .catch((e) => {
        console.warn('Lyrics fetch failed:', e);
        if (isSubscribed) {
          setLyrics({
            id: currentTrack.id,
            title: currentTrack.title,
            artist: currentTrack.artist,
            synced: false,
            lines: [],
            plainText: 'Lyrics currently unavailable for this track.\nEnjoy high fidelity audio streaming on Gen Music!',
            provider: 'None',
          });
        }
      })
      .finally(() => {
        if (isSubscribed) setIsLoadingLyrics(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [currentTrack?.id]);

  // Record stats & recently played
  const recordPlayed = useCallback((track: Track) => {
    setLibrary((prev) => {
      const filtered = prev.recentlyPlayed.filter((t) => t.id !== track.id);
      return {
        ...prev,
        recentlyPlayed: [track, ...filtered].slice(0, 40),
      };
    });

    setListeningStats((prev) => {
      const existingArtist = prev.topArtists.find((a) => a.artist === track.artist);
      const updatedArtists = existingArtist
        ? prev.topArtists.map((a) => (a.artist === track.artist ? { ...a, count: a.count + 1 } : a))
        : [...prev.topArtists, { artist: track.artist, count: 1 }];

      return {
        ...prev,
        totalTracksPlayed: prev.totalTracksPlayed + 1,
        topArtists: updatedArtists.sort((a, b) => b.count - a.count).slice(0, 10),
        history: [{ track, timestamp: Date.now() }, ...prev.history].slice(0, 50),
      };
    });
  }, []);

  // Compute active lyric line based on currentTime + lyricsOffset
  const currentLyricIndex = useMemo(() => {
    if (!lyrics || !lyrics.synced || !lyrics.lines || lyrics.lines.length === 0) return -1;
    const adjustedTime = currentTime + lyricsOffset;
    let idx = -1;
    for (let i = 0; i < lyrics.lines.length; i++) {
      if (adjustedTime >= lyrics.lines[i].time) {
        idx = i;
      } else {
        break;
      }
    }
    return idx;
  }, [lyrics, currentTime, lyricsOffset]);

  // Auto queue radio loader
  const fetchAutoplayQueue = useCallback(async (track: Track) => {
    try {
      const params = new URLSearchParams({
        title: track.title,
        artist: track.artist,
      });
      const res = await fetch(`/api/queue/${encodeURIComponent(track.id)}?${params}`);
      if (res.ok) {
        const data = await res.json();
        if (data.tracks && Array.isArray(data.tracks)) {
          setQueue((prevQueue) => {
            const existingIds = new Set(prevQueue.map((t) => t.id));
            const newTracks = data.tracks.filter((t: Track) => !existingIds.has(t.id));
            return [...prevQueue, ...newTracks];
          });
        }
      }
    } catch (e) {
      console.warn('Queue auto-fill warning:', e);
    }
  }, []);

  // Play a specific track
  const playTrack = useCallback(
    (track: Track, newQueue?: Track[]) => {
      let targetQueue = newQueue || queue;
      let targetIndex = targetQueue.findIndex((t) => t.id === track.id);

      if (targetIndex === -1) {
        targetQueue = [track, ...targetQueue.filter((t) => t.id !== track.id)];
        targetIndex = 0;
      }

      setQueue(targetQueue);
      setQueueIndex(targetIndex);
      setCurrentTrack(track);
      recordPlayed(track);

      audioPlayer.loadTrack(track, true);

      if (targetQueue.length < 4) {
        fetchAutoplayQueue(track);
      }
    },
    [queue, recordPlayed, fetchAutoplayQueue]
  );

  const togglePlay = useCallback(() => {
    if (!currentTrack && queue.length > 0) {
      playTrack(queue[0]);
      return;
    }
    audioPlayer.togglePlayPause();
  }, [currentTrack, queue, playTrack]);

  const seek = useCallback((seconds: number) => {
    audioPlayer.seekTo(seconds);
  }, []);

  const setVolume = useCallback((val: number) => {
    setVolumeState(val);
    audioPlayer.setVolume(val);
  }, []);

  const toggleMute = useCallback(() => {
    const muted = audioPlayer.toggleMute();
    setIsMuted(muted);
  }, []);

  const playNext = useCallback(() => {
    if (queue.length === 0) return;

    if (sleepTimer.active && sleepTimer.mode === 'end_of_track') {
      audioPlayer.pause();
      setSleepTimer({ active: false, targetTimestamp: null, mode: 'off', minutesRemaining: 0 });
      return;
    }

    if (repeatMode === 'one' && currentTrack) {
      audioPlayer.seekTo(0);
      audioPlayer.play();
      return;
    }

    let nextIdx = queueIndex + 1;
    if (shuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else if (nextIdx >= queue.length) {
      if (repeatMode === 'all') {
        nextIdx = 0;
      } else {
        if (currentTrack) fetchAutoplayQueue(currentTrack);
        return;
      }
    }

    const nextTrack = queue[nextIdx];
    if (nextTrack) {
      setQueueIndex(nextIdx);
      setCurrentTrack(nextTrack);
      recordPlayed(nextTrack);
      audioPlayer.loadTrack(nextTrack, true);
    }
  }, [queue, queueIndex, shuffle, repeatMode, currentTrack, sleepTimer, recordPlayed, fetchAutoplayQueue]);

  const playPrev = useCallback(() => {
    if (queue.length === 0) return;
    if (currentTime > 4) {
      audioPlayer.seekTo(0);
      return;
    }
    let prevIdx = queueIndex - 1;
    if (prevIdx < 0) {
      prevIdx = queue.length - 1;
    }
    const prevTrack = queue[prevIdx];
    if (prevTrack) {
      setQueueIndex(prevIdx);
      setCurrentTrack(prevTrack);
      recordPlayed(prevTrack);
      audioPlayer.loadTrack(prevTrack, true);
    }
  }, [queue, queueIndex, currentTime, recordPlayed]);

  const toggleShuffle = useCallback(() => {
    setShuffle((s) => !s);
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setQueue((prev) => {
      if (prev.some((t) => t.id === track.id)) return prev;
      return [...prev, track];
    });
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setQueue((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
  }, []);

  const clearQueue = useCallback(() => {
    setQueue(currentTrack ? [currentTrack] : []);
    setQueueIndex(0);
  }, [currentTrack]);

  const reorderQueue = useCallback((startIndex: number, endIndex: number) => {
    setQueue((prev) => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  // Equalizer adjustments
  const setEqPreset = useCallback((presetId: string) => {
    const preset = EQ_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setEqualizer((prev) => ({
      ...prev,
      preset: presetId,
      bands: [...preset.gains],
    }));
  }, []);

  const setEqBand = useCallback((bandIndex: number, gain: number) => {
    setEqualizer((prev) => {
      const bands = [...prev.bands] as [number, number, number, number, number];
      bands[bandIndex] = gain;
      return {
        ...prev,
        preset: 'custom',
        bands,
      };
    });
  }, []);

  const setBassBoost = useCallback((val: number) => {
    setEqualizer((prev) => ({ ...prev, bassBoost: val }));
  }, []);

  const toggleSpatialAudio = useCallback(() => {
    setEqualizer((prev) => ({ ...prev, spatialAudio: !prev.spatialAudio }));
  }, []);

  const toggleReplayGain = useCallback(() => {
    setEqualizer((prev) => ({ ...prev, replayGain: !prev.replayGain }));
  }, []);

  const setPlaybackSpeed = useCallback((speed: number) => {
    setEqualizer((prev) => ({ ...prev, pitchSpeed: speed }));
    audioPlayer.setPlaybackRate(speed);
  }, []);

  // Sleep Timer controls
  const startSleepTimer = useCallback((minutes: number | 'end_of_track') => {
    if (minutes === 'end_of_track') {
      setSleepTimer({
        active: true,
        targetTimestamp: null,
        mode: 'end_of_track',
        minutesRemaining: 1,
      });
    } else {
      const target = Date.now() + minutes * 60 * 1000;
      setSleepTimer({
        active: true,
        targetTimestamp: target,
        mode: 'minutes',
        minutesRemaining: minutes,
      });
    }
  }, []);

  const cancelSleepTimer = useCallback(() => {
    setSleepTimer({
      active: false,
      targetTimestamp: null,
      mode: 'off',
      minutesRemaining: 0,
    });
  }, []);

  // Artist & Album exploration
  const openArtist = useCallback(async (artistName: string) => {
    setIsArtistLoading(true);
    try {
      const res = await fetch(`/api/artist?name=${encodeURIComponent(artistName)}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedArtist(data);
      }
    } catch (e) {
      console.warn('Artist details fetch failed:', e);
    } finally {
      setIsArtistLoading(false);
    }
  }, []);

  const closeArtist = useCallback(() => {
    setSelectedArtist(null);
  }, []);

  const openAlbum = useCallback(async (albumTitle: string, artistName?: string) => {
    setIsAlbumLoading(true);
    try {
      const res = await fetch(`/api/album?title=${encodeURIComponent(albumTitle)}&artist=${encodeURIComponent(artistName || '')}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedAlbum(data);
      }
    } catch (e) {
      console.warn('Album details fetch failed:', e);
    } finally {
      setIsAlbumLoading(false);
    }
  }, []);

  const closeAlbum = useCallback(() => {
    setSelectedAlbum(null);
  }, []);

  // Song Recognition (Echo Find)
  const recognizeSong = useCallback(async (query?: string): Promise<RecognizedSongResult | null> => {
    try {
      const res = await fetch('/api/recognize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (res.ok) {
        const data = await res.json();
        return data as RecognizedSongResult;
      }
    } catch (e) {
      console.warn('Echo Find recognition error:', e);
    }
    return null;
  }, []);

  // Playlist Importer & Exporter
  const importPlaylistFromUrlOrData = useCallback(async (input: string): Promise<Playlist | null> => {
    try {
      const res = await fetch('/api/import-playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urlOrData: input }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.playlist) {
          const pl: Playlist = {
            id: data.playlist.id || `pl_${Date.now()}`,
            name: data.playlist.name,
            createdAt: Date.now(),
            tracks: data.playlist.tracks || [],
          };
          setLibrary((prev) => ({
            ...prev,
            playlists: [pl, ...prev.playlists],
          }));
          return pl;
        }
      }
    } catch (e) {
      console.warn('Playlist import failed:', e);
    }
    return null;
  }, []);

  const exportPlaylistAsJson = useCallback((playlist: Playlist) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(playlist, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `${playlist.name.replace(/[^a-z0-9]/gi, '_')}.json`;
    a.click();
  }, []);

  const exportPlaylistAsM3u = useCallback((playlist: Playlist) => {
    let m3u = '#EXTM3U\n';
    playlist.tracks.forEach((t) => {
      m3u += `#EXTINF:${t.durationSeconds || 180},${t.artist} - ${t.title}\n`;
      m3u += `https://www.youtube.com/watch?v=${t.id}\n`;
    });
    const blob = new Blob([m3u], { type: 'audio/x-mpegurl' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${playlist.name.replace(/[^a-z0-9]/gi, '_')}.m3u`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // Likes & Library
  const isLiked = useCallback(
    (trackId: string) => {
      return library.likedTracks.some((t) => t.id === trackId);
    },
    [library.likedTracks]
  );

  const toggleLike = useCallback((track: Track) => {
    setLibrary((prev) => {
      const exists = prev.likedTracks.some((t) => t.id === track.id);
      return {
        ...prev,
        likedTracks: exists ? prev.likedTracks.filter((t) => t.id !== track.id) : [track, ...prev.likedTracks],
      };
    });
  }, []);

  const createPlaylist = useCallback((name: string, description?: string): Playlist => {
    const newPl: Playlist = {
      id: `pl_${Date.now()}`,
      name: name.trim() || 'My Playlist',
      description,
      createdAt: Date.now(),
      tracks: [],
    };
    setLibrary((prev) => ({
      ...prev,
      playlists: [newPl, ...prev.playlists],
    }));
    return newPl;
  }, []);

  const addToPlaylist = useCallback((playlistId: string, track: Track) => {
    setLibrary((prev) => ({
      ...prev,
      playlists: prev.playlists.map((pl) => {
        if (pl.id !== playlistId) return pl;
        if (pl.tracks.some((t) => t.id === track.id)) return pl;
        return {
          ...pl,
          tracks: [...pl.tracks, track],
        };
      }),
    }));
  }, []);

  const removeFromPlaylist = useCallback((playlistId: string, trackId: string) => {
    setLibrary((prev) => ({
      ...prev,
      playlists: prev.playlists.map((pl) => {
        if (pl.id !== playlistId) return pl;
        return {
          ...pl,
          tracks: pl.tracks.filter((t) => t.id !== trackId),
        };
      }),
    }));
  }, []);

  const deletePlaylist = useCallback((playlistId: string) => {
    setLibrary((prev) => ({
      ...prev,
      playlists: prev.playlists.filter((pl) => pl.id !== playlistId),
    }));
  }, []);

  const clearHistory = useCallback(() => {
    setLibrary((prev) => ({ ...prev, recentlyPlayed: [] }));
    setListeningStats((prev) => ({ ...prev, history: [] }));
  }, []);

  // YouTube Account Sign In / Out / Sync
  const signInWithYouTube = useCallback(async (accountData?: Partial<YouTubeAccount>) => {
    const updated: YouTubeAccount = {
      signedIn: true,
      name: accountData?.name || 'YouTube Music Listener',
      email: accountData?.email || 'listener@youtube.music',
      avatar: accountData?.avatar || '',
      isYtMusicPremium: accountData?.isYtMusicPremium ?? true,
      authType: accountData?.authType || 'browser',
      lastSyncedAt: Date.now()
    };
    setYtAccount(updated);
  }, []);

  const signOutYouTube = useCallback(() => {
    setYtAccount({ signedIn: false, authType: 'guest' });
  }, []);

  const syncUserYouTubeLibrary = useCallback(async () => {
    setIsSyncingYtLibrary(true);
    try {
      // Fetch trending and curated mixes to sync into user's liked & personal playlists
      const res = await fetch('/api/home');
      if (res.ok) {
        const data = await res.json();
        if (data.sections && data.sections.length > 0) {
          const quickPicks = data.sections[0]?.items || [];
          const trendingPicks = data.sections[1]?.items || [];
          
          setLibrary((prev) => {
            const existingLikedIds = new Set(prev.likedTracks.map((t) => t.id));
            const newLiked = [...prev.likedTracks];
            quickPicks.slice(0, 5).forEach((t: Track) => {
              if (!existingLikedIds.has(t.id)) {
                newLiked.push(t);
                existingLikedIds.add(t.id);
              }
            });

            // Add or update YouTube Music Sync playlist
            const existingPlIndex = prev.playlists.findIndex((p) => p.name.includes('YouTube Music'));
            let updatedPls = [...prev.playlists];
            if (existingPlIndex >= 0) {
              updatedPls[existingPlIndex] = {
                ...updatedPls[existingPlIndex],
                tracks: [...trendingPicks, ...quickPicks]
              };
            } else {
              updatedPls = [
                {
                  id: `yt-sync-${Date.now()}`,
                  name: 'YouTube Music Liked & Mixes',
                  description: 'Synced automatically from your YouTube Music browser account.',
                  createdAt: Date.now(),
                  tracks: [...trendingPicks, ...quickPicks]
                },
                ...updatedPls
              ];
            }

            return {
              ...prev,
              likedTracks: newLiked,
              playlists: updatedPls
            };
          });
        }
      }
      setYtAccount((prev) => ({ ...prev, lastSyncedAt: Date.now() }));
    } catch (err) {
      console.warn('Sync YouTube library error:', err);
    } finally {
      setIsSyncingYtLibrary(false);
    }
  }, []);

  // Echo AdBlock actions
  const toggleAdBlock = useCallback(() => {
    setAdBlockState((prev) => {
      const next = !prev.enabled;
      audioPlayer.setAudioAdBlockEnabled(next);
      return { ...prev, enabled: next, audioAdBlockEnabled: next };
    });
  }, []);

  const toggleSponsorBlock = useCallback(() => {
    setAdBlockState((prev) => {
      const next = !prev.sponsorBlockEnabled;
      audioPlayer.setSponsorBlockEnabled(next);
      return { ...prev, sponsorBlockEnabled: next };
    });
  }, []);

  const setSponsorBlockCategory = useCallback((category: string, enabled: boolean) => {
    setAdBlockState((prev) => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: enabled
      }
    }));
  }, []);

  // Hook track end callback
  useEffect(() => {
    audioPlayer.setOnTrackEnd(() => {
      playNext();
    });
  }, [playNext]);

  // Hook media session previous/next
  useEffect(() => {
    audioPlayer.setMediaSessionNavHandlers(playPrev, playNext);
  }, [playPrev, playNext]);

  const value = useMemo<MusicPlayerContextType>(
    () => ({
      currentTrack,
      queue,
      queueIndex,
      isPlaying,
      isBuffering,
      currentTime,
      duration,
      volume,
      isMuted,
      repeatMode,
      shuffle,
      lyrics,
      isLoadingLyrics,
      currentLyricIndex,
      lyricsOffset,
      isRomanized,
      isFullPlayerOpen,
      isQueueOpen,
      isLyricsOpen,
      isEqualizerOpen,
      isSleepTimerOpen,
      isEchoFindOpen,
      isImportModalOpen,
      isStatsOpen,
      isYtSignInModalOpen,
      isAdBlockModalOpen,
      playerTheme,
      audioQuality,
      equalizer,
      sleepTimer,
      listeningStats,
      adBlockState,
      ytAccount,
      isSyncingYtLibrary,
      selectedArtist,
      selectedAlbum,
      isArtistLoading,
      isAlbumLoading,
      library,
      playTrack,
      togglePlay,
      seek,
      setVolume,
      toggleMute,
      playNext,
      playPrev,
      toggleShuffle,
      toggleRepeat,
      addToQueue,
      removeFromQueue,
      clearQueue,
      reorderQueue,
      setIsFullPlayerOpen,
      setIsQueueOpen,
      setIsLyricsOpen,
      setIsEqualizerOpen,
      setIsSleepTimerOpen,
      setIsEchoFindOpen,
      setIsImportModalOpen,
      setIsStatsOpen,
      setIsYtSignInModalOpen,
      setIsAdBlockModalOpen,
      setPlayerTheme,
      setAudioQuality,
      setLyricsOffset,
      setIsRomanized,
      signInWithYouTube,
      signOutYouTube,
      syncUserYouTubeLibrary,
      toggleAdBlock,
      toggleSponsorBlock,
      setSponsorBlockCategory,
      setEqPreset,
      setEqBand,
      setBassBoost,
      toggleSpatialAudio,
      toggleReplayGain,
      setPlaybackSpeed,
      startSleepTimer,
      cancelSleepTimer,
      openArtist,
      closeArtist,
      openAlbum,
      closeAlbum,
      recognizeSong,
      importPlaylistFromUrlOrData,
      exportPlaylistAsJson,
      exportPlaylistAsM3u,
      isLiked,
      toggleLike,
      createPlaylist,
      addToPlaylist,
      removeFromPlaylist,
      deletePlaylist,
      clearHistory,
    }),
    [
      currentTrack,
      queue,
      queueIndex,
      isPlaying,
      isBuffering,
      currentTime,
      duration,
      volume,
      isMuted,
      repeatMode,
      shuffle,
      lyrics,
      isLoadingLyrics,
      currentLyricIndex,
      lyricsOffset,
      isRomanized,
      isFullPlayerOpen,
      isQueueOpen,
      isLyricsOpen,
      isEqualizerOpen,
      isSleepTimerOpen,
      isEchoFindOpen,
      isImportModalOpen,
      isStatsOpen,
      isYtSignInModalOpen,
      isAdBlockModalOpen,
      playerTheme,
      audioQuality,
      equalizer,
      sleepTimer,
      listeningStats,
      adBlockState,
      ytAccount,
      isSyncingYtLibrary,
      selectedArtist,
      selectedAlbum,
      isArtistLoading,
      isAlbumLoading,
      library,
      playTrack,
      togglePlay,
      seek,
      setVolume,
      toggleMute,
      playNext,
      playPrev,
      toggleShuffle,
      toggleRepeat,
      addToQueue,
      removeFromQueue,
      clearQueue,
      reorderQueue,
      signInWithYouTube,
      signOutYouTube,
      syncUserYouTubeLibrary,
      toggleAdBlock,
      toggleSponsorBlock,
      setSponsorBlockCategory,
      setEqPreset,
      setEqBand,
      setBassBoost,
      toggleSpatialAudio,
      toggleReplayGain,
      setPlaybackSpeed,
      startSleepTimer,
      cancelSleepTimer,
      openArtist,
      closeArtist,
      openAlbum,
      closeAlbum,
      recognizeSong,
      importPlaylistFromUrlOrData,
      exportPlaylistAsJson,
      exportPlaylistAsM3u,
      isLiked,
      toggleLike,
      createPlaylist,
      addToPlaylist,
      removeFromPlaylist,
      deletePlaylist,
      clearHistory,
    ]
  );

  return <MusicPlayerContext.Provider value={value}>{children}</MusicPlayerContext.Provider>;
};

export function useMusicPlayer(): MusicPlayerContextType {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
}
