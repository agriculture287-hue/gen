export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  badge?: string;
  neonColor: 'cyan' | 'purple' | 'pink' | 'blue';
}

export interface WhyChooseItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  accent: 'cyan' | 'purple' | 'pink' | 'blue';
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface UpdateItem {
  id?: string;
  version: string;
  releaseDate: string;
  tag: string;
  highlights: string[];
}

export interface AppScreenshot {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  accent: string;
  mockupContent: 'player' | 'search' | 'equalizer' | 'downloads' | 'moods';
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: string;
  durationSec?: number;
  coverUrl: string;
  source?: 'free_music' | 'freemusic' | 'streaming' | string;
  audioUrl?: string;
  isDolby?: boolean;
  dolbyReady?: boolean;
  liked?: boolean;
  plays?: string;
  likes?: string;
  genre?: string;
  mood?: string;
  bpm?: number;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  trackCount: number;
  likes?: string;
  followers?: string;
  author?: string;
  curator?: string;
  gradient?: string;
  accentColor?: string;
  tags?: string[];
}

export interface MoodCategory {
  id: string;
  name: string;
  tagline?: string;
  icon?: string;
  iconName?: string;
  color?: string;
  accent?: string;
  gradient?: string;
  trackCount: string;
}

export type PlatformType = 'android' | 'mac' | 'windows' | 'linux' | 'ios' | 'web' | 'other';

export interface AppPlatformRelease {
  id: string;
  name: string;
  platform: PlatformType;
  version: string;
  fileFormat: string;
  fileSize: string;
  releaseDate: string;
  minSystem: string;
  downloadUrl: string;
  mirrorUrl?: string;
  architecture?: string;
  badge?: string;
  changelog?: string[];
  isFeatured?: boolean;
}

export interface TelegramConfig {
  contactUsername: string;
  contactUrl: string;
  supportHours: string;
  announcementText?: string;
}

export interface AdSettings {
  directSponsorLink: string;
  adsterraScriptHost: string;
  key728x90: string;
  key468x60: string;
  key320x50: string;
  key300x250: string;
  key160x300: string;
  key160x600: string;
  nativeScriptUrl: string;
  nativeContainerId: string;
  popunderScriptUrl1: string;
  popunderScriptUrl2: string;
  enableAds: boolean;
}

export interface TelegramChannel {
  id: string;
  title: string;
  description: string;
  link: string;
  badge: string;
  memberCount: string;
  isPrimary?: boolean;
}
