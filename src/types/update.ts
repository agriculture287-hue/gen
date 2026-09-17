export type SupportedPlatform = 'android' | 'windows' | 'macos' | 'web' | 'linux';

export interface PlatformVersionInfo {
  latestVersion: string;
  minimumVersion: string;
  downloadUrl: string;
  fileSize?: string;
  sha256?: string;
  releaseDate?: string;
  mirrorUrl?: string;
}

export interface VersionManifest {
  android: PlatformVersionInfo;
  windows: PlatformVersionInfo;
  macos: PlatformVersionInfo;
  releaseNotes: string[];
  publishedAt?: string;
  changelogUrl?: string;
}

export type UpdateCheckStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'mandatory_required'
  | 'up_to_date'
  | 'downloading'
  | 'downloaded'
  | 'offline'
  | 'error';

export interface UpdateCheckResult {
  status: UpdateCheckStatus;
  hasUpdate: boolean;
  isMandatory: boolean;
  platform: SupportedPlatform;
  currentVersion: string;
  latestVersion: string;
  minimumVersion: string;
  downloadUrl: string;
  releaseNotes: string[];
  fileSize?: string;
  sha256?: string;
  mirrorUrl?: string;
  cached?: boolean;
  lastCheckedTimestamp?: number;
  error?: string;
}

export interface UpdateCacheItem {
  manifest: VersionManifest;
  cachedAt: number;
}

export interface InAppUpdateAlert {
  id: string;
  version: string;
  title?: string;
  releaseNotes: string[];
  platform?: SupportedPlatform | 'all' | string;
  downloadUrl?: string;
  downloadUrls?: {
    android?: string;
    windows?: string;
    macos?: string;
    linux?: string;
  };
  fileSize?: string;
  isMandatory?: boolean;
  minSupportedVersion?: string;
  triggeredAt: number;
}
