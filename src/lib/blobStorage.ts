/**
 * Vercel Blob Client integration for GEN MUSIC
 * Uses server-side API proxy to keep BLOB_READ_WRITE_TOKEN secure.
 */

export interface BlobItem {
  url: string;
  pathname: string;
  size?: number;
  uploadedAt?: string;
  downloadUrl?: string;
  contentType?: string;
}

export interface BlobPutResponse {
  success: boolean;
  blob?: BlobItem;
  error?: string;
  message?: string;
}

export interface BlobStatusResponse {
  configured: boolean;
  message: string;
}

/**
 * Helper to safely extract JSON from Response without throwing "Unexpected token <" on HTML fallbacks
 */
async function safeJson<T = any>(res: Response, fallback: T): Promise<T> {
  try {
    const text = await res.text();
    if (!text || text.trim().startsWith('<')) {
      return fallback;
    }
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

/**
 * Check if Vercel Blob backend has BLOB_READ_WRITE_TOKEN configured
 */
export async function checkBlobStatus(): Promise<BlobStatusResponse> {
  try {
    const res = await fetch('/api/blob/status');
    const data = await safeJson<BlobStatusResponse>(res, { configured: false, message: 'Unable to parse server response' });
    return data;
  } catch (e: any) {
    return { configured: false, message: e?.message || 'Network error' };
  }
}

/**
 * Store an object or text file in Vercel Blob using put
 * Matches: await put('articles/blob.txt', 'Hello World!', { access: 'private' })
 */
export async function putBlob(
  pathname: string,
  content: string | object,
  options?: {
    access?: 'private' | 'public';
    addRandomSuffix?: boolean;
    contentType?: string;
  }
): Promise<BlobPutResponse> {
  try {
    const res = await fetch('/api/blob/put', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pathname,
        content,
        access: options?.access || 'private',
        addRandomSuffix: options?.addRandomSuffix ?? false,
        contentType: options?.contentType,
      }),
    });

    const data = await safeJson<BlobPutResponse>(res, {
      success: false,
      error: 'Invalid response from server',
    });
    return data;
  } catch (e: any) {
    return {
      success: false,
      error: e?.message || 'Failed connecting to server',
    };
  }
}

/**
 * Executes the user's specific snippet:
 * put('articles/blob.txt', 'Hello World!', { access: 'private' })
 */
export async function testArticleBlobPut(
  text: string = 'Hello World!',
  pathname: string = 'articles/blob.txt',
  access: 'private' | 'public' = 'private'
): Promise<BlobPutResponse> {
  try {
    const res = await fetch('/api/blob/test-article', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, pathname, access }),
    });

    return await safeJson<BlobPutResponse>(res, {
      success: false,
      error: 'Invalid response from server',
    });
  } catch (e: any) {
    return {
      success: false,
      error: e?.message || 'Failed testing article blob',
    };
  }
}

/**
 * Synchronize full application data (releases, telegram channels, updates) to Vercel Blob
 */
export async function syncAppDataToBlob(appData: any): Promise<BlobPutResponse> {
  try {
    const res = await fetch('/api/blob/sync-app', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appData),
    });

    return await safeJson<BlobPutResponse>(res, {
      success: false,
      error: 'Invalid response from server',
    });
  } catch (e: any) {
    return {
      success: false,
      error: e?.message || 'Failed syncing to Vercel Blob',
    };
  }
}

/**
 * Load synchronized app data from Vercel Blob
 */
export async function loadAppDataFromBlob(): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch('/api/blob/load-app');
    const result = await safeJson<{ success: boolean; payload?: any; error?: string }>(res, {
      success: false,
      error: 'Invalid response from server',
    });
    if (!result.success) {
      return { success: false, error: result.error || 'Data not found in Vercel Blob' };
    }
    return { success: true, data: result.payload?.data || result.payload };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Network error' };
  }
}

/**
 * Upload binary file (APK, EXE, DMG, ZIP, JSON) to Blob Storage
 */
export async function uploadAppFileToBlob(
  file: File,
  pathname?: string,
  platform?: 'android' | 'windows' | 'macos',
  access: 'public' | 'private' = 'public'
): Promise<{ success: boolean; blob?: BlobItem; error?: string; message?: string; publicUrl?: string; sha256?: string }> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (pathname) formData.append('pathname', pathname);
    if (platform) formData.append('platform', platform);
    formData.append('access', access);

    const res = await fetch('/api/blob/upload-file', {
      method: 'POST',
      body: formData,
    });

    return await safeJson(res, {
      success: false,
      error: 'Failed uploading file to Blob storage',
    });
  } catch (e: any) {
    return {
      success: false,
      error: e?.message || 'Failed uploading file to Blob storage',
    };
  }
}

/**
 * Synchronize all backend datasets, manifests, channels, and releases to Blob storage
 */
export async function syncAllBackendDataToBlob(backendPayload: any): Promise<{
  success: boolean;
  message?: string;
  blobs?: { backendData: string; appVersion: string; versionManifest: string };
  error?: string;
}> {
  try {
    const res = await fetch('/api/blob/sync-all-backend-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backendPayload),
    });

    return await safeJson(res, {
      success: false,
      error: 'Failed to sync backend data to Blob storage',
    });
  } catch (e: any) {
    return {
      success: false,
      error: e?.message || 'Failed to sync backend data to Blob storage',
    };
  }
}

/**
 * Full Admin Configuration Payload Interface
 */
export interface AdminBlobPayload {
  platforms?: any[];
  telegramConfig?: any;
  channels?: any[];
  updates?: any[];
  manifest?: any;
  lastUpdated?: string;
  updatedBy?: string;
}

let syncTimeout: any = null;

/**
 * Automatically persist all admin modifications to Vercel Blob storage.
 * Debounced to avoid rapid redundant API requests.
 */
export async function autoSaveAdminDataToBlob(payload: AdminBlobPayload, delayMs: number = 300): Promise<Promise<{
  success: boolean;
  message?: string;
  error?: string;
}>> {
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }

  return new Promise((resolve) => {
    syncTimeout = setTimeout(async () => {
      try {
        const fullPayload = {
          ...payload,
          lastUpdated: new Date().toISOString(),
          updatedBy: 'Admin (Varanasi)',
        };
        const result = await syncAllBackendDataToBlob(fullPayload);
        resolve(result);
      } catch (err: any) {
        resolve({
          success: false,
          error: err?.message || 'Auto-save to Blob failed',
        });
      }
    }, delayMs);
  });
}

export async function listBlobs(prefix?: string): Promise<{ success: boolean; blobs: BlobItem[]; error?: string }> {
  try {
    const query = prefix ? `?prefix=${encodeURIComponent(prefix)}` : '';
    const res = await fetch(`/api/blob/list${query}`);
    const data = await safeJson<{ success?: boolean; blobs?: BlobItem[]; error?: string }>(res, {
      success: false,
      blobs: [],
      error: 'Failed to list blobs',
    });
    return {
      success: data.success ?? false,
      blobs: data.blobs || [],
      error: data.error,
    };
  } catch (e: any) {
    return { success: false, blobs: [], error: e?.message };
  }
}

