import { AppPlatformRelease, TelegramChannel, TelegramConfig, UpdateItem, AdSettings } from '../types';
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
    downloadUrl: '/download/genmusic.apk',
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
    minSystem: 'macOS 12.0 Monterey or later (Apple Silicon & Intel)',
    downloadUrl: '/download/genmusic.dmg',
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
    downloadUrl: '/download/genmusic-setup.exe',
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

export const DEFAULT_AD_SETTINGS: AdSettings = {
  directSponsorLink: 'https://repeattelegraph.com/gj794uv9fq?key=e2dc905fa5332522e2704d3f9c63a8fe',
  adsterraScriptHost: 'https://repeattelegraph.com',
  key728x90: '4110737d8166f053b733fff6f7e13d06',
  key468x60: '37b0c7570a229c52933ce00a9e5ef8b9',
  key320x50: 'aa73750d369623688925d762a277e45f',
  key300x250: '36019750f2238adf794264fc6b435242',
  key160x300: 'ac7ea038a8b23ddb95125cadfe3d8acd',
  key160x600: '9a699eb9dc590e52d49a7e067d74b972',
  nativeScriptUrl: 'https://repeattelegraph.com/3617a4c3f56c896f818969f4fb731195/invoke.js',
  nativeContainerId: 'container-3617a4c3f56c896f818969f4fb731195',
  popunderScriptUrl1: 'https://repeattelegraph.com/8e/1e/65/8e1e656fe155c51d1af77fec25f21e56.js',
  popunderScriptUrl2: 'https://repeattelegraph.com/03/60/66/0360668b9306bf8e68edf1eefb2756d5.js',
  enableAds: true,
};

export const DEFAULT_CHANNELS: TelegramChannel[] = [
  {
    id: 'ch-1',
    title: 'GEN MUSIC Official Channel',
    description: 'Official announcements, upcoming features roadmap, server status, and main project news.',
    link: 'https://t.me/genmusic_official',
    badge: 'Official News',
    memberCount: 'Official Updates',
    isPrimary: true,
  },
  {
    id: 'ch-2',
    title: 'GEN MUSIC APK & Releases Channel',
    description: 'Direct APK files, macOS DMG packages, and Windows EXE installers with fast mirrors.',
    link: 'https://t.me/genmusic_apk',
    badge: 'Direct Downloads',
    memberCount: 'Release Channel',
    isPrimary: true,
  },
  {
    id: 'ch-3',
    title: 'GEN MUSIC Beta Testers Club',
    description: 'Early preview builds, experimental spatial sound patches, and direct developer feedback.',
    link: 'https://t.me/genmusic_beta',
    badge: 'Beta Testing',
    memberCount: 'Beta Testers',
    isPrimary: false,
  },
  {
    id: 'ch-4',
    title: 'GEN MUSIC Community & Songs Discussion',
    description: 'Share custom playlists, talk about trending tracks, request songs, and chat with members.',
    link: 'https://t.me/genmusic_community',
    badge: 'Discussion Group',
    memberCount: 'Community Forum',
    isPrimary: false,
  },
];

const STORAGE_KEYS = {
  PLATFORMS: 'genmusic_platforms_v1',
  TELEGRAM_CONFIG: 'genmusic_telegram_v1',
  CHANNELS: 'genmusic_channels_v1',
  UPDATES: 'genmusic_updates_v1',
  ADMIN_SESSION: 'genmusic_admin_auth_v1',
  AD_SETTINGS: 'genmusic_ad_settings_v1',
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

// Ad Settings Storage
export function getStoredAdSettings(): AdSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AD_SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.directSponsorLink) {
        // Upgrade migration: If using old networks/domains, overwrite with new repeattelegraph.com units
        if (!parsed.directSponsorLink.includes('repeattelegraph.com')) {
          localStorage.setItem(STORAGE_KEYS.AD_SETTINGS, JSON.stringify(DEFAULT_AD_SETTINGS));
          return DEFAULT_AD_SETTINGS;
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed reading ad settings from storage', e);
  }
  return DEFAULT_AD_SETTINGS;
}

export function saveStoredAdSettings(cfg: AdSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AD_SETTINGS, JSON.stringify(cfg));
  } catch (e) {
    console.error('Failed writing ad settings to storage', e);
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
  
  // Support primary Varanasi admin, standard admin, or email
  const validIds = [ADMIN_CREDENTIALS.id.toLowerCase(), 'varanasi', 'admin', 'varanasi_admin'];
  const validPasswords = [ADMIN_CREDENTIALS.password, '1234', 'admin123', 'admin'];

  return validIds.includes(cleanId) && validPasswords.includes(cleanPass);
}

export function resetAppToDefaults(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.PLATFORMS);
    localStorage.removeItem(STORAGE_KEYS.TELEGRAM_CONFIG);
    localStorage.removeItem(STORAGE_KEYS.CHANNELS);
    localStorage.removeItem(STORAGE_KEYS.UPDATES);
    localStorage.removeItem(STORAGE_KEYS.AD_SETTINGS);
  } catch (e) {
    console.error('Failed resetting to defaults', e);
  }
}

// Aliases
export const getStoredReleases = getStoredPlatforms;
export const saveStoredReleases = saveStoredPlatforms;
export const isStoredAdminLoggedIn = getAdminSession;
export const setStoredAdminLoggedIn = setAdminSession;

