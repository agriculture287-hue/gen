import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Track, LyricsData, RepeatMode, LibraryData, Playlist } from '../types/music';
import { audioPlayer } from '../services/audioPlayer';

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
  isFullPlayerOpen: boolean;
  isQueueOpen: boolean;
  isLyricsOpen: boolean;
  library: LibraryData;
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
  setIsFullPlayerOpen: (open: boolean) => void;
  setIsQueueOpen: (open: boolean) => void;
  setIsLyricsOpen: (open: boolean) => void;
  isLiked: (trackId: string) => boolean;
  toggleLike: (track: Track) => void;
  createPlaylist: (name: string) => void;
  addToPlaylist: (playlistId: string, track: Track) => void;
  removeFromPlaylist: (playlistId: string, trackId: string) => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | null>(null);

const STORAGE_LIBRARY_KEY = 'genmusic_library_v1';
const STORAGE_QUEUE_KEY = 'genmusic_last_queue_v1';

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

  // UI Drawer states
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState<boolean>(false);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState<boolean>(false);

  // Lyrics state
  const [lyrics, setLyrics] = useState<LyricsData | null>(null);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState<boolean>(false);

  // Library state
  const [library, setLibrary] = useState<LibraryData>(() => {
    if (typeof window === 'undefined') return { likedTracks: [], playlists: [], recentlyPlayed: [] };
    try {
      const saved = localStorage.getItem(STORAGE_LIBRARY_KEY);
      return saved ? JSON.parse(saved) : { likedTracks: [], playlists: [], recentlyPlayed: [] };
    } catch {
      return { likedTracks: [], playlists: [], recentlyPlayed: [] };
    }
  });

  // Save library changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LIBRARY_KEY, JSON.stringify(library));
    } catch {}
  }, [library]);

  // Subscribe to audio engine
  useEffect(() => {
    const unsubscribe = audioPlayer.subscribe((state) => {
      setIsPlaying(state.isPlaying);
      setIsBuffering(state.isBuffering);
      setCurrentTime(state.currentTime);
      if (state.duration > 0) setDuration(state.duration);
    });
    return () => unsubscribe();
  }, []);

  // Fetch lyrics when track changes
  useEffect(() => {
    if (!currentTrack) {
      setLyrics(null);
      return;
    }

    let isSubscribed = true;
    setIsLoadingLyrics(true);

    const params = new URLSearchParams({
      title: currentTrack.title,
      artist: currentTrack.artist,
      duration: (currentTrack.durationSeconds || duration || 0).toString()
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
            plainText: 'Lyrics currently unavailable for this track.',
            provider: 'None'
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

  // Record Recently Played
  const recordRecentlyPlayed = useCallback((track: Track) => {
    setLibrary((prev) => {
      const filtered = prev.recentlyPlayed.filter((t) => t.id !== track.id);
      return {
        ...prev,
        recentlyPlayed: [track, ...filtered].slice(0, 30)
      };
    });
  }, []);

  // Compute active lyric line based on currentTime
  const currentLyricIndex = useMemo(() => {
    if (!lyrics || !lyrics.synced || !lyrics.lines.length) return -1;
    // Find highest index where line.time <= currentTime
    for (let i = lyrics.lines.length - 1; i >= 0; i--) {
      if (currentTime >= lyrics.lines[i].time - 0.25) {
        return i;
      }
    }
    return 0;
  }, [lyrics, currentTime]);

  // Fetch auto-recommendations queue when queue has fewer than 2 items ahead
  const replenishQueue = useCallback(async (track: Track) => {
    try {
      const res = await fetch(`/api/queue/${track.id}?artist=${encodeURIComponent(track.artist)}&title=${encodeURIComponent(track.title)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.tracks && data.tracks.length > 0) {
          setQueue((prev) => {
            const existingIds = new Set(prev.map((t) => t.id));
            const newItems = data.tracks.filter((t: Track) => !existingIds.has(t.id));
            return [...prev, ...newItems];
          });
        }
      }
    } catch (err) {
      console.warn('Auto queue replenish error:', err);
    }
  }, []);

  // Play a specific track
  const playTrack = useCallback((track: Track, newQueue?: Track[]) => {
    let nextQueue = newQueue ? [...newQueue] : queue;
    let nextIndex = nextQueue.findIndex((t) => t.id === track.id);

    if (nextIndex === -1) {
      nextQueue = [track, ...nextQueue];
      nextIndex = 0;
    }

    setQueue(nextQueue);
    setQueueIndex(nextIndex);
    setCurrentTrack(track);
    audioPlayer.loadTrack(track, true);
    recordRecentlyPlayed(track);

    if (nextQueue.length - nextIndex < 3) {
      replenishQueue(track);
    }
  }, [queue, recordRecentlyPlayed, replenishQueue]);

  // Next Track
  const playNext = useCallback(() => {
    if (!queue.length) return;

    if (repeatMode === 'one' && currentTrack) {
      audioPlayer.seekTo(0);
      audioPlayer.play();
      return;
    }

    let nextIndex = queueIndex + 1;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else if (nextIndex >= queue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        return; // reached end
      }
    }

    const nextTrack = queue[nextIndex];
    if (nextTrack) {
      setQueueIndex(nextIndex);
      setCurrentTrack(nextTrack);
      audioPlayer.loadTrack(nextTrack, true);
      recordRecentlyPlayed(nextTrack);

      if (queue.length - nextIndex < 3) {
        replenishQueue(nextTrack);
      }
    }
  }, [queue, queueIndex, repeatMode, shuffle, currentTrack, recordRecentlyPlayed, replenishQueue]);

  // Previous Track
  const playPrev = useCallback(() => {
    if (currentTime > 4) {
      audioPlayer.seekTo(0);
      return;
    }

    if (!queue.length) return;
    let prevIndex = queueIndex - 1;
    if (prevIndex < 0) {
      prevIndex = queue.length - 1;
    }

    const prevTrack = queue[prevIndex];
    if (prevTrack) {
      setQueueIndex(prevIndex);
      setCurrentTrack(prevTrack);
      audioPlayer.loadTrack(prevTrack, true);
      recordRecentlyPlayed(prevTrack);
    }
  }, [queue, queueIndex, currentTime, recordRecentlyPlayed]);

  // Register track-end callback on player
  useEffect(() => {
    audioPlayer.setOnTrackEnd(() => {
      playNext();
    });
  }, [playNext]);

  // Update MediaSession prev/next buttons
  useEffect(() => {
    audioPlayer.setMediaSessionNavHandlers(playPrev, playNext);
  }, [playPrev, playNext]);

  const togglePlay = () => audioPlayer.togglePlayPause();
  const seek = (seconds: number) => audioPlayer.seekTo(seconds);

  const setVolume = (val: number) => {
    setVolumeState(val);
    audioPlayer.setVolume(val);
  };

  const toggleMute = () => {
    const muted = audioPlayer.toggleMute();
    setIsMuted(muted);
  };

  const toggleShuffle = () => setShuffle((s) => !s);

  const toggleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const addToQueue = (track: Track) => {
    setQueue((prev) => {
      if (prev.some((t) => t.id === track.id)) return prev;
      return [...prev, track];
    });
  };

  const removeFromQueue = (index: number) => {
    setQueue((prev) => prev.filter((_, idx) => idx !== index));
    if (index < queueIndex) {
      setQueueIndex((i) => i - 1);
    }
  };

  const clearQueue = () => {
    if (currentTrack) {
      setQueue([currentTrack]);
      setQueueIndex(0);
    } else {
      setQueue([]);
      setQueueIndex(-1);
    }
  };

  const isLiked = (trackId: string) => {
    return library.likedTracks.some((t) => t.id === trackId);
  };

  const toggleLike = (track: Track) => {
    setLibrary((prev) => {
      const exists = prev.likedTracks.some((t) => t.id === track.id);
      const likedTracks = exists
        ? prev.likedTracks.filter((t) => t.id !== track.id)
        : [track, ...prev.likedTracks];
      return { ...prev, likedTracks };
    });
  };

  const createPlaylist = (name: string) => {
    if (!name.trim()) return;
    const newPlaylist: Playlist = {
      id: `pl-${Date.now()}`,
      name: name.trim(),
      createdAt: Date.now(),
      tracks: []
    };
    setLibrary((prev) => ({
      ...prev,
      playlists: [newPlaylist, ...prev.playlists]
    }));
  };

  const addToPlaylist = (playlistId: string, track: Track) => {
    setLibrary((prev) => ({
      ...prev,
      playlists: prev.playlists.map((pl) => {
        if (pl.id !== playlistId) return pl;
        if (pl.tracks.some((t) => t.id === track.id)) return pl;
        return { ...pl, tracks: [...pl.tracks, track] };
      })
    }));
  };

  const removeFromPlaylist = (playlistId: string, trackId: string) => {
    setLibrary((prev) => ({
      ...prev,
      playlists: prev.playlists.map((pl) => {
        if (pl.id !== playlistId) return pl;
        return { ...pl, tracks: pl.tracks.filter((t) => t.id !== trackId) };
      })
    }));
  };

  return (
    <MusicPlayerContext.Provider
      value={{
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
        isFullPlayerOpen,
        isQueueOpen,
        isLyricsOpen,
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
        setIsFullPlayerOpen,
        setIsQueueOpen,
        setIsLyricsOpen,
        isLiked,
        toggleLike,
        createPlaylist,
        addToPlaylist,
        removeFromPlaylist,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};
