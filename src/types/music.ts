export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  durationSeconds?: number;
  durationText?: string;
  thumbnail: string;
  type?: 'song' | 'video' | 'album' | 'artist' | 'playlist';
  isTopResult?: boolean;
  year?: string;
  genre?: string;
  bitrate?: string;
}

export interface LyricLine {
  time: number; // in seconds, e.g. 12.34
  text: string;
  romanizedText?: string;
  translation?: string;
}

export interface LyricsData {
  id: string;
  title: string;
  artist: string;
  synced: boolean;
  lines: LyricLine[];
  plainText: string;
  provider: string;
  offsetSeconds?: number;
}

export type RepeatMode = 'off' | 'all' | 'one';
export type PlayerTheme = 'material' | 'apple' | 'canvas' | 'minimal';
export type AudioQuality = 'lossless' | 'high' | 'standard' | 'saver';

export interface EqualizerPreset {
  id: string;
  name: string;
  gains: [number, number, number, number, number]; // 60Hz, 230Hz, 910Hz, 3.6kHz, 14kHz in dB (-12 to +12)
}

export interface EqualizerState {
  enabled: boolean;
  preset: string;
  bands: [number, number, number, number, number];
  bassBoost: number; // 0 to 100
  spatialAudio: boolean;
  replayGain: boolean;
  pitchSpeed: number; // 0.5 to 2.0
}

export interface SleepTimerState {
  active: boolean;
  targetTimestamp: number | null;
  mode: 'minutes' | 'end_of_track' | 'off';
  minutesRemaining: number;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  cover?: string;
  createdAt: number;
  tracks: Track[];
}

export interface ArtistDetails {
  name: string;
  subscribers?: string;
  headerImage?: string;
  avatar?: string;
  bio?: string;
  topTracks: Track[];
  albums: { id: string; title: string; year: string; thumbnail: string }[];
  singles: Track[];
}

export interface AlbumDetails {
  id: string;
  title: string;
  artist: string;
  year?: string;
  thumbnail: string;
  trackCount: number;
  tracks: Track[];
}

export interface MoodGenreCategory {
  id: string;
  title: string;
  emoji: string;
  color: string;
  gradient: string;
  description: string;
  searchQuery: string;
  tracks?: Track[];
}

export interface ListeningStats {
  totalSecondsPlayed: number;
  totalTracksPlayed: number;
  topArtists: { artist: string; count: number }[];
  topTracks: { track: Track; count: number }[];
  topGenres: { genre: string; count: number }[];
  history: { track: Track; timestamp: number }[];
}

export interface RecognizedSongResult {
  track: Track;
  confidence: number;
  matchedPart?: string;
  album?: string;
  releaseDate?: string;
}

export interface LibraryData {
  likedTracks: Track[];
  playlists: Playlist[];
  recentlyPlayed: Track[];
  customTracks?: Track[];
}

export interface YouTubeAccount {
  signedIn: boolean;
  name?: string;
  email?: string;
  avatar?: string;
  channelId?: string;
  isYtMusicPremium?: boolean;
  authType: 'google' | 'browser' | 'session' | 'guest';
  lastSyncedAt?: number;
}

export interface SponsorSegment {
  category: 'sponsor' | 'selfpromo' | 'interaction' | 'intro' | 'outro' | 'music_offtopic' | 'preview';
  segment: [number, number]; // [startSec, endSec]
  UUID: string;
}

export interface AdBlockState {
  enabled: boolean;
  sponsorBlockEnabled: boolean;
  audioAdBlockEnabled: boolean;
  blockedAdsCount: number;
  skippedSegmentsCount: number;
  categories: {
    sponsor: boolean;
    selfpromo: boolean;
    interaction: boolean;
    intro: boolean;
    outro: boolean;
    music_offtopic: boolean;
  };
  lastSkippedText?: string;
}
