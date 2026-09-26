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
}

export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface LyricsData {
  id: string;
  title: string;
  artist: string;
  synced: boolean;
  lines: LyricLine[];
  plainText: string;
  provider: string;
}

export type RepeatMode = 'off' | 'all' | 'one';

export interface Playlist {
  id: string;
  name: string;
  createdAt: number;
  tracks: Track[];
}

export interface LibraryData {
  likedTracks: Track[];
  playlists: Playlist[];
  recentlyPlayed: Track[];
}
