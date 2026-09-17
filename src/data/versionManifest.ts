import { VersionManifest, SupportedPlatform, UpdateCacheItem, UpdateCheckResult } from '../types/update';

export const CURRENT_CLIENT_APP_VERSION = '1.0.0'; // Installed base version for testing & live client

export const DEFAULT_VERSION_MANIFEST: VersionManifest = {
  android: {
    latestVersion: '1.0.1',
    minimumVersion: '1.0.0',
    downloadUrl: 'https://genmugic.vercel.app/download/genmusic.apk',
    fileSize: '24.8 MB',
    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    releaseDate: '2026-09-15',
    mirrorUrl: 'https://t.me/genmusic_apk',
  },
  windows: {
    latestVersion: '1.0.1',
    minimumVersion: '1.0.0',
    downloadUrl: 'https://genmugic.vercel.app/download/genmusic-setup.exe',
    fileSize: '56.2 MB',
    sha256: 'a12bc44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b899',
    releaseDate: '2026-09-15',
    mirrorUrl: 'https://t.me/genmusic_apk',
  },
  macos: {
    latestVersion: '1.0.1',
    minimumVersion: '1.0.0',
    downloadUrl: 'https://genmugic.vercel.app/download/genmusic.dmg',
    fileSize: '68.4 MB',
    sha256: 'c88df44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b112',
    releaseDate: '2026-09-15',
    mirrorUrl: 'https://t.me/genmusic_official',
  },
  releaseNotes: [
    'Improved streaming engine with adaptive buffer management',
    'Better audio quality with lossless Hi-Fi & 3D Spatial Dolby preset',
    'Playback bug fixes on background audio resume',
    'UI enhancements with updated player bar and dark theme contrast',
  ],
  publishedAt: '2026-09-15T00:00:00Z',
};

const MANIFEST_LOCAL_STORAGE_KEY = 'genmusic_version_manifest_v1';
const UPDATE_CACHE_KEY = 'genmusic_update_cache_v1';
const DISMISSED_VERSION_KEY = 'genmusic_dismissed_version_v1';

export const CACHE_EXPIRY_MS = 6 * 60 * 60 * 1000; // 6 Hours as requested

/**
 * Clean & compare semantic versions (e.g. 1.0.1 vs 1.0.0, handles v prefixes)
 * Returns:
 *  1 if v1 > v2
 * -1 if v1 < v2
 *  0 if v1 === v2
 */
export function compareSemver(v1: string, v2: string): number {
  const clean1 = (v1 || '').replace(/^[vV]/, '').trim();
  const clean2 = (v2 || '').replace(/^[vV]/, '').trim();

  const parts1 = clean1.split(/[-+.]/).map((p) => {
    const num = parseInt(p, 10);
    return isNaN(num) ? 0 : num;
  });
  const parts2 = clean2.split(/[-+.]/).map((p) => {
    const num = parseInt(p, 10);
    return isNaN(num) ? 0 : num;
  });

  const maxLen = Math.max(parts1.length, parts2.length, 3);
  for (let i = 0; i < maxLen; i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
}

/**
 * Automatically detect client operating system platform
 */
export function detectCurrentPlatform(): SupportedPlatform {
  if (typeof window === 'undefined') return 'web';

  // 1. Check Electron runtime
  if ((window as any).electronAPI || (window as any).isElectron || (window as any).process?.type === 'renderer') {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('mac') || ua.includes('darwin')) return 'macos';
    if (ua.includes('win')) return 'windows';
    return 'windows';
  }

  // 2. Check Capacitor Android
  if ((window as any).Capacitor?.getPlatform() === 'android' || (window as any).isCapacitorAndroid) {
    return 'android';
  }

  // 3. User Agent heuristics
  const ua = navigator.userAgent.toLowerCase();
  const platform = (navigator as any).userAgentData?.platform?.toLowerCase() || (navigator.platform || '').toLowerCase();

  if (ua.includes('android') || platform.includes('android')) {
    return 'android';
  }

  if (ua.includes('win') || platform.includes('win')) {
    return 'windows';
  }

  if (ua.includes('mac') || platform.includes('mac') || ua.includes('darwin')) {
    return 'macos';
  }

  if (ua.includes('linux') || platform.includes('linux')) {
    return 'android'; // Fallback mobile / desktop
  }

  return 'web';
}

/**
 * Get active Version Manifest from localStorage or default
 */
export function getLocalVersionManifest(): VersionManifest {
  try {
    const stored = localStorage.getItem(MANIFEST_LOCAL_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...DEFAULT_VERSION_MANIFEST,
        ...parsed,
        android: {
          ...DEFAULT_VERSION_MANIFEST.android,
          ...(parsed?.android || {}),
        },
        windows: {
          ...DEFAULT_VERSION_MANIFEST.windows,
          ...(parsed?.windows || {}),
        },
        macos: {
          ...DEFAULT_VERSION_MANIFEST.macos,
          ...(parsed?.macos || {}),
        },
        releaseNotes: Array.isArray(parsed?.releaseNotes) ? parsed.releaseNotes : DEFAULT_VERSION_MANIFEST.releaseNotes,
      };
    }
  } catch (e) {
    console.warn('Failed reading manifest from localStorage', e);
  }
  return DEFAULT_VERSION_MANIFEST;
}

/**
 * Save Version Manifest to localStorage
 */
export function saveLocalVersionManifest(manifest: VersionManifest): void {
  try {
    localStorage.setItem(MANIFEST_LOCAL_STORAGE_KEY, JSON.stringify(manifest));
  } catch (e) {
    console.warn('Failed saving manifest to localStorage', e);
  }
}

/**
 * Get Cached Update Check result if still valid within 6 hours
 */
export function getCachedUpdateCheck(): UpdateCacheItem | null {
  try {
    const raw = localStorage.getItem(UPDATE_CACHE_KEY);
    if (!raw) return null;
    const item: UpdateCacheItem = JSON.parse(raw);
    const now = Date.now();
    if (now - item.cachedAt < CACHE_EXPIRY_MS) {
      return item;
    }
  } catch (e) {
    console.warn('Error reading update cache', e);
  }
  return null;
}

/**
 * Save Update Check result to 6-hour cache
 */
export function setCachedUpdateCheck(manifest: VersionManifest): void {
  try {
    const cacheItem: UpdateCacheItem = {
      manifest,
      cachedAt: Date.now(),
    };
    localStorage.setItem(UPDATE_CACHE_KEY, JSON.stringify(cacheItem));
  } catch (e) {
    console.warn('Error saving update cache', e);
  }
}

/**
 * Record dismissed optional update version
 */
export function setDismissedVersion(version: string): void {
  try {
    localStorage.setItem(DISMISSED_VERSION_KEY, version);
  } catch (e) {
    console.warn('Error saving dismissed version', e);
  }
}

export function getDismissedVersion(): string | null {
  try {
    return localStorage.getItem(DISMISSED_VERSION_KEY);
  } catch {
    return null;
  }
}

export const TRIGGERED_UPDATE_ALERT_KEY = 'genmusic_triggered_update_alert_v1';
export const IN_APP_UPDATE_EVENT = 'genmusic:in-app-update-alert';

/**
 * Trigger an in-app update alert locally across tabs and windows
 */
export function triggerLocalInAppUpdateAlert(alert: any): void {
  try {
    localStorage.setItem(TRIGGERED_UPDATE_ALERT_KEY, JSON.stringify(alert));
    // Dispatch local custom event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(IN_APP_UPDATE_EVENT, { detail: alert }));
    }
  } catch (e) {
    console.warn('Error saving triggered update alert', e);
  }
}

/**
 * Retrieve current active triggered update alert
 */
export function getStoredInAppUpdateAlert(): any | null {
  try {
    const raw = localStorage.getItem(TRIGGERED_UPDATE_ALERT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Clear or dismiss active in-app update alert
 */
export function clearStoredInAppUpdateAlert(): void {
  try {
    localStorage.removeItem(TRIGGERED_UPDATE_ALERT_KEY);
  } catch {
    // safe fallback
  }
}

