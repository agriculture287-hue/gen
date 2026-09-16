import { AppPlatformRelease, TelegramChannel, TelegramConfig, UpdateItem } from '../types';
import { ANNOUNCEMENT_UPDATES } from './landingData';

export const ADMIN_CREDENTIALS = {
  id: 'varansi@genmusic.com',
  password: 'Ankit@123321',
};

export const DEFAULT_PLATFORMS: AppPlatformRelease[] = [
  {
    id: 'app-android',
    name: 'GEN MUSIC for Android',
    platform: 'android',
    version: 'v2.5.0',
    fileFormat: '.apk',
    fileSize: '24.8 MB',
    releaseDate: 'September 2026',
    minSystem: 'Android 8.0 or later (Oreo to 15)',
    downloadUrl: 'https://github.com/genmusic/releases/releases/download/v2.5.0/GEN_MUSIC_v2.5.0.apk',
    mirrorUrl: 'https://t.me/genmusic_apk',
    architecture: 'ARM64-v8a & Universal',
    badge: 'Direct APK',
    changelog: [
      'Dolby Audio 3D spatial surround sound engine',
      'Batch offline MP3 downloader up to 320kbps',
      'Unified YouTube Music and Spotify catalogs',
      'Zero audio advertising interruptions'
    ],
    isFeatured: true,
  },
  {
    id: 'app-mac',
    name: 'GEN MUSIC for macOS',
    platform: 'mac',
    version: 'v2.5.0',
    fileFormat: '.dmg',
    fileSize: '68.4 MB',
    releaseDate: 'September 2026',
    minSystem: 'macOS 12.0 Monterey or later (Apple Silicon M1/M2/M3/M4 & Intel)',
    downloadUrl: 'https://github.com/genmusic/releases/releases/download/v2.5.0/GEN_MUSIC_v2.5.0_Universal.dmg',
    mirrorUrl: 'https://t.me/genmusic_official',
    architecture: 'Universal (Apple Silicon + Intel)',
    badge: 'macOS DMG',
    changelog: [
      'Native Apple Silicon high efficiency decoding',
      'Menu bar mini player and keyboard media keys',
      'Lossless Hi-Fi streaming virtualizer',
      'System-wide lyrics overlay widget'
    ],
    isFeatured: true,
  },
  {
    id: 'app-windows',
    name: 'GEN MUSIC for Windows',
    platform: 'windows',
    version: 'v2.5.0',
    fileFormat: '.exe',
    fileSize: '56.2 MB',
    releaseDate: 'September 2026',
    minSystem: 'Windows 10 / 11 (64-bit)',
    downloadUrl: 'https://github.com/genmusic/releases/releases/download/v2.5.0/GEN_MUSIC_Setup_v2.5.0.exe',
    mirrorUrl: 'https://t.me/genmusic_apk',
    architecture: 'Windows x64 / ARM64',
    badge: 'Windows Setup',
    changelog: [
      'Discord Rich Presence status sync',
      'Background playback with taskbar controls',
      'Custom 10-band equalizer and bass boost',
      'Local folder library import & offline caching'
    ],
    isFeatured: true,
  },
];

export const DEFAULT_TELEGRAM_CONFIG: TelegramConfig = {
  contactUsername: '@genmusic_admin',
  contactUrl: 'https://t.me/genmusic_admin',
  supportHours: 'Admin Direct Support • Available 24/7',
  announcementText: 'Contact admin directly on Telegram for fast APK assistance, feedback, or business queries.',
};

export const DEFAULT_CHANNELS: TelegramChannel[] = [
  {
    id: 'ch-1',
    title: 'GEN MUSIC Official Channel',
    description: 'Official announcements, upcoming features roadmap, server status, and main project news.',
    link: 'https://t.me/genmusic_official',
    badge: 'Official News',
    memberCount: '48,500+ members',
    isPrimary: true,
  },
  {
    id: 'ch-2',
    title: 'GEN MUSIC APK & Releases Channel',
    description: 'Direct APK files, macOS DMG packages, and Windows EXE installers with fast mirrors.',
    link: 'https://t.me/genmusic_apk',
    badge: 'Direct Downloads',
    memberCount: '34,200+ members',
    isPrimary: true,
  },
  {
    id: 'ch-3',
    title: 'GEN MUSIC Beta Testers Club',
    description: 'Early preview builds, experimental spatial sound patches, and direct developer feedback.',
    link: 'https://t.me/genmusic_beta',
    badge: 'Beta Testing',
    memberCount: '12,800+ members',
    isPrimary: false,
  },
  {
    id: 'ch-4',
    title: 'GEN MUSIC Community & Songs Discussion',
    description: 'Share custom playlists, talk about trending tracks, request songs, and chat with members.',
    link: 'https://t.me/genmusic_community',
    badge: 'Discussion Group',
    memberCount: '21,900+ members',
    isPrimary: false,
  },
];

const STORAGE_KEYS = {
  PLATFORMS: 'genmusic_platforms_v1',
  TELEGRAM_CONFIG: 'genmusic_telegram_v1',
  CHANNELS: 'genmusic_channels_v1',
  UPDATES: 'genmusic_updates_v1',
  ADMIN_SESSION: 'genmusic_admin_auth_v1',
};

// Platforms Storage
export function getStoredPlatforms(): AppPlatformRelease[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLATFORMS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed reading platforms from storage', e);
  }
  return DEFAULT_PLATFORMS;
}

export function saveStoredPlatforms(platforms: AppPlatformRelease[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PLATFORMS, JSON.stringify(platforms));
  } catch (e) {
    console.error('Failed writing platforms to storage', e);
  }
}

// Telegram Config Storage
export function getStoredTelegramConfig(): TelegramConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TELEGRAM_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.contactUrl) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed reading telegram config from storage', e);
  }
  return DEFAULT_TELEGRAM_CONFIG;
}

export function saveStoredTelegramConfig(cfg: TelegramConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TELEGRAM_CONFIG, JSON.stringify(cfg));
  } catch (e) {
    console.error('Failed writing telegram config to storage', e);
  }
}

// Channels Storage
export function getStoredChannels(): TelegramChannel[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHANNELS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed reading channels from storage', e);
  }
  return DEFAULT_CHANNELS;
}

export function saveStoredChannels(channels: TelegramChannel[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
  } catch (e) {
    console.error('Failed writing channels to storage', e);
  }
}

// Updates / What's New Storage
export function getStoredUpdates(): UpdateItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.UPDATES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed reading updates from storage', e);
  }
  return ANNOUNCEMENT_UPDATES;
}

export function saveStoredUpdates(updates: UpdateItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.UPDATES, JSON.stringify(updates));
  } catch (e) {
    console.error('Failed writing updates to storage', e);
  }
}

// Admin Auth Session
export function getAdminSession(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === 'true';
  } catch {
    return false;
  }
}

export function setAdminSession(active: boolean): void {
  try {
    if (active) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    }
  } catch (e) {
    console.error('Failed setting admin session', e);
  }
}

export function verifyAdminCredentials(id: string, pass: string): boolean {
  const cleanId = id.trim().toLowerCase();
  const cleanPass = pass.trim();
  return cleanId === ADMIN_CREDENTIALS.id.toLowerCase() && cleanPass === ADMIN_CREDENTIALS.password;
}

export function resetAppToDefaults(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.PLATFORMS);
    localStorage.removeItem(STORAGE_KEYS.TELEGRAM_CONFIG);
    localStorage.removeItem(STORAGE_KEYS.CHANNELS);
    localStorage.removeItem(STORAGE_KEYS.UPDATES);
  } catch (e) {
    console.error('Failed resetting to defaults', e);
  }
}

// Aliases
export const getStoredReleases = getStoredPlatforms;
export const saveStoredReleases = saveStoredPlatforms;
export const isStoredAdminLoggedIn = getAdminSession;
export const setStoredAdminLoggedIn = setAdminSession;

