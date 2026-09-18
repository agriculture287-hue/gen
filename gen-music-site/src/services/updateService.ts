import { VersionManifest, UpdateCheckResult, SupportedPlatform } from '../types/update';
import {
  CURRENT_CLIENT_APP_VERSION,
  DEFAULT_VERSION_MANIFEST,
  compareSemver,
  detectCurrentPlatform,
  getCachedUpdateCheck,
  setCachedUpdateCheck,
  getLocalVersionManifest,
  saveLocalVersionManifest,
} from '../data/versionManifest';

export const VERSION_ENDPOINT = '/version.json';

/**
 * Fetch latest VersionManifest from the server or cache
 */
export async function fetchVersionManifest(forceRefresh: boolean = false): Promise<{ manifest: VersionManifest; fromCache: boolean }> {
  // Check 6-hour cache first unless forced
  if (!forceRefresh) {
    const cached = getCachedUpdateCheck();
    if (cached) {
      return { manifest: cached.manifest, fromCache: true };
    }
  }

  // If offline, return local stored manifest
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { manifest: getLocalVersionManifest(), fromCache: true };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${VERSION_ENDPOINT}?t=${Date.now()}`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data: VersionManifest = await response.json();
      if (data && data.android && data.windows && data.macos) {
        setCachedUpdateCheck(data);
        saveLocalVersionManifest(data);
        return { manifest: data, fromCache: false };
      }
    }
  } catch (error) {
    console.warn('Network error fetching /version.json, falling back to local store', error);
  }

  // Graceful offline fallback
  const local = getLocalVersionManifest();
  return { manifest: local, fromCache: true };
}

/**
 * Main Update Checking Engine
 * Evaluates current version vs latest and minimum version for platform
 */
export async function checkForAppUpdates(options?: {
  currentVersion?: string;
  targetPlatform?: SupportedPlatform;
  forceRefresh?: boolean;
}): Promise<UpdateCheckResult> {
  const currentVersion = options?.currentVersion || CURRENT_CLIENT_APP_VERSION;
  const platform = options?.targetPlatform || detectCurrentPlatform();
  const forceRefresh = options?.forceRefresh ?? false;

  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

  try {
    const { manifest, fromCache } = await fetchVersionManifest(forceRefresh);

    // Map platform to manifest entry
    let platformInfo = manifest.android;
    if (platform === 'windows') {
      platformInfo = manifest.windows;
    } else if (platform === 'macos') {
      platformInfo = manifest.macos;
    } else if (platform === 'android') {
      platformInfo = manifest.android;
    } else {
      // Default to android for mobile web or windows for desktop web
      platformInfo = manifest.android;
    }

    const { latestVersion, minimumVersion, downloadUrl, fileSize, sha256, mirrorUrl } = platformInfo;

    const hasNewVersion = compareSemver(latestVersion, currentVersion) > 0;
    const isBelowMinimum = compareSemver(minimumVersion, currentVersion) > 0;

    let status: UpdateCheckResult['status'] = 'up_to_date';
    if (isBelowMinimum) {
      status = 'mandatory_required';
    } else if (hasNewVersion) {
      status = 'available';
    }

    return {
      status,
      hasUpdate: hasNewVersion,
      isMandatory: isBelowMinimum,
      platform,
      currentVersion,
      latestVersion,
      minimumVersion,
      downloadUrl,
      releaseNotes: manifest.releaseNotes || DEFAULT_VERSION_MANIFEST.releaseNotes,
      fileSize,
      sha256,
      mirrorUrl,
      cached: fromCache,
      lastCheckedTimestamp: Date.now(),
    };
  } catch (err: any) {
    console.warn('Update check failed:', err);
    return {
      status: isOffline ? 'offline' : 'error',
      hasUpdate: false,
      isMandatory: false,
      platform,
      currentVersion,
      latestVersion: currentVersion,
      minimumVersion: '1.0.0',
      downloadUrl: '#download',
      releaseNotes: [],
      error: err?.message || 'Failed checking for updates',
      lastCheckedTimestamp: Date.now(),
    };
  }
}

/**
 * Trigger download based on platform runtime (Electron vs Capacitor vs Web)
 */
export async function executePlatformDownload(url: string, platform: SupportedPlatform): Promise<void> {
  // If Electron is active
  if ((window as any).electronAPI?.downloadUpdate) {
    try {
      await (window as any).electronAPI.downloadUpdate();
      return;
    } catch (e) {
      console.warn('Electron download invocation fallback:', e);
    }
  }

  // If Capacitor is active
  if ((window as any).Capacitor?.isNativePlatform()) {
    try {
      const { Browser } = await import('@capacitor/browser').catch(() => ({ Browser: null }));
      if (Browser) {
        await Browser.open({ url });
        return;
      }
    } catch {
      // fallback to window.location
    }
  }

  // Standard web download
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', '');
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
