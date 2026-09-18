import type {
  BlobItem,
  BlobPutResult,
  BlobStatusResponse,
  BlobListResult,
  BlobDiagnosticResult,
  BlobAccessMode,
} from '../types/blob';

export type {
  BlobItem,
  BlobPutResult,
  BlobStatusResponse,
  BlobListResult,
  BlobDiagnosticResult,
  BlobAccessMode,
};

export interface BlobPutResponse {
  success: boolean;
  blob?: BlobItem;
  publicUrl?: string;
  sha256?: string;
  error?: string;
  message?: string;
  savedLocally?: boolean;
}

export interface AdminBlobPayload {
  platforms?: any[];
  telegramConfig?: any;
  channels?: any[];
  updates?: any[];
  adSettings?: any;
  manifest?: any;
  siteSettings?: any;
  lastUpdated?: string;
  updatedBy?: string;
}

/**
 * Safely parse JSON from Response without throwing "Unexpected token <" on HTML fallbacks
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
 * Check Blob Storage Engine Status (Local vs Vercel Hybrid)
 */
export async function checkBlobStatus(): Promise<BlobStatusResponse> {
  try {
    const res = await fetch('/api/blob/status');
    const data = await safeJson<BlobStatusResponse>(res, {
      configured: true,
      activeProvider: 'local',
      vercelConfigured: false,
      localBlobsCount: 0,
      message: 'Local storage active',
    });
    return data;
  } catch (e: any) {
    return {
      configured: true,
      activeProvider: 'local',
      vercelConfigured: false,
      localBlobsCount: 0,
      message: e?.message || 'Local storage operational',
    };
  }
}

/**
 * Store an object, string, or JSON payload in Blob Storage
 * Syntax matches Vercel Blob:
 * await putBlob('articles/blob.txt', 'Hello World!', { access: 'private' })
 */
export async function putBlob(
  pathname: string,
  content: string | object,
  options?: {
    access?: BlobAccessMode;
    addRandomSuffix?: boolean;
    contentType?: string;
    platform?: 'android' | 'windows' | 'macos' | 'linux' | 'generic';
  }
): Promise<BlobPutResponse> {
  try {
    const res = await fetch('/api/blob/put', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pathname,
        content,
        access: options?.access || 'public',
        addRandomSuffix: options?.addRandomSuffix ?? false,
        contentType: options?.contentType,
        platform: options?.platform,
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
 * Executes the user's specific test snippet:
 * put('articles/blob.txt', 'Hello World!', { access: 'private' })
 */
export async function testArticleBlobPut(
  text: string = 'Hello World!',
  pathname: string = 'articles/blob.txt',
  access: BlobAccessMode = 'private'
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
 * Upload binary file (APK, EXE, DMG, ZIP, Images) with real-time percentage progress
 */
export async function uploadAppFileToBlob(
  file: File,
  pathname?: string,
  platform?: 'android' | 'windows' | 'macos' | 'linux' | 'generic',
  access: BlobAccessMode = 'public',
  onProgress?: (percent: number) => void
): Promise<{
  success: boolean;
  blob?: BlobItem;
  error?: string;
  message?: string;
  publicUrl?: string;
  sha256?: string;
  savedLocally?: boolean;
}> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);
    if (pathname) formData.append('pathname', pathname);
    if (platform) formData.append('platform', platform);
    formData.append('access', access);

    xhr.open('POST', '/api/blob/upload-file', true);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded * 100) / event.total);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      try {
        if (xhr.status >= 200 && xhr.status < 300) {
          const json = JSON.parse(xhr.responseText);
          resolve(json);
        } else {
          try {
            const errJson = JSON.parse(xhr.responseText);
            resolve({
              success: false,
              error: errJson.error || `Upload failed with status ${xhr.status}`,
            });
          } catch {
            resolve({
              success: false,
              error: `Upload failed with status ${xhr.status}`,
            });
          }
        }
      } catch (err: any) {
        resolve({
          success: false,
          error: err?.message || 'Failed parsing upload response',
        });
      }
    };

    xhr.onerror = () => {
      resolve({
        success: false,
        error: 'Network connection failed during upload',
      });
    };

    xhr.send(formData);
  });
}

/**
 * List all stored items from Blob Storage (Local + Vercel)
 */
export async function listBlobs(prefix?: string): Promise<{
  success: boolean;
  blobs: BlobItem[];
  totalCount?: number;
  error?: string;
}> {
  try {
    const query = prefix ? `?prefix=${encodeURIComponent(prefix)}` : '';
    const res = await fetch(`/api/blob/list${query}`);
    const data = await safeJson<{ success?: boolean; blobs?: BlobItem[]; totalCount?: number; error?: string }>(res, {
      success: false,
      blobs: [],
      error: 'Failed to list blobs',
    });

    return {
      success: data.success ?? false,
      blobs: data.blobs || [],
      totalCount: data.totalCount,
      error: data.error,
    };
  } catch (e: any) {
    return { success: false, blobs: [], error: e?.message };
  }
}

/**
 * Delete a blob from storage
 */
export async function deleteBlob(urlOrPathname: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/blob/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: urlOrPathname, pathname: urlOrPathname }),
    });

    return await safeJson(res, { success: false, error: 'Delete request failed' });
  } catch (e: any) {
    return { success: false, error: e?.message || 'Network error deleting blob' };
  }
}

/**
 * Run comprehensive Blob Diagnostic Suite
 */
export async function runBlobDiagnostic(): Promise<BlobDiagnosticResult> {
  try {
    const res = await fetch('/api/blob/diagnostic');
    return await safeJson(res, {
      success: false,
      summary: 'Diagnostic request failed',
      activeProvider: 'local',
      storeConfig: { isConfigured: false },
      testResults: {
        localDiskReady: false,
        publicAccessUpload: false,
        privateAccessUpload: false,
        uploadedUrl: null,
        listQueryWorking: false,
        blobsCountInStore: 0,
      },
      logs: [],
      durationMs: 0,
    });
  } catch (e: any) {
    return {
      success: false,
      summary: e?.message || 'Network error running diagnostic',
      activeProvider: 'local',
      storeConfig: { isConfigured: false },
      testResults: {
        localDiskReady: false,
        publicAccessUpload: false,
        privateAccessUpload: false,
        uploadedUrl: null,
        listQueryWorking: false,
        blobsCountInStore: 0,
      },
      logs: [],
      durationMs: 0,
    };
  }
}

/**
 * Synchronize full application datasets to Blob storage
 */
export async function syncAllBackendDataToBlob(backendPayload: any): Promise<{
  success: boolean;
  message?: string;
  blobs?: { backendData: string; appVersion: string; versionManifest: string };
  error?: string;
  savedLocally?: boolean;
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
 * Load synchronized app data from storage
 */
export async function loadAppDataFromBlob(): Promise<{ success: boolean; data?: any; error?: string; source?: string }> {
  try {
    const res = await fetch('/api/blob/load-app');
    const result = await safeJson<{ success: boolean; payload?: any; error?: string; source?: string }>(res, {
      success: false,
      error: 'Invalid response from server',
    });
    if (result.success && result.payload) {
      return { success: true, data: result.payload?.data || result.payload, source: result.source || 'blob-storage' };
    }

    // Fallback 1: Direct backend /api/app-data
    try {
      const fallbackRes = await fetch('/api/app-data');
      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        if (fallbackData?.success && fallbackData?.data) {
          return { success: true, data: fallbackData.data, source: 'backend-api' };
        }
      }
    } catch {
      // Continue to next fallback
    }

    // Fallback 2: Static /genmusic-data.json
    try {
      const staticRes = await fetch('/genmusic-data.json');
      if (staticRes.ok) {
        const staticData = await staticRes.json();
        if (staticData) {
          return { success: true, data: staticData, source: 'static-file' };
        }
      }
    } catch {
      // Fail safely
    }

    return { success: false, error: result.error || 'Data not found in storage' };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Network error' };
  }
}

export async function syncAppDataToBlob(appData: any): Promise<BlobPutResponse> {
  return await syncAllBackendDataToBlob(appData);
}

let syncTimeout: any = null;

/**
 * Debounced auto-save for admin modifications
 */
export async function autoSaveAdminDataToBlob(
  payload: AdminBlobPayload,
  delayMs: number = 300
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }

  return new Promise((resolve) => {
    syncTimeout = setTimeout(async () => {
      try {
        const fullPayload = {
          ...payload,
          lastUpdated: new Date().toISOString(),
          updatedBy: payload.updatedBy || 'Admin Panel',
        };
        const result = await syncAllBackendDataToBlob(fullPayload);
        resolve(result);
      } catch (err: any) {
        resolve({
          success: false,
          error: err?.message || 'Auto-save failed',
        });
      }
    }, delayMs);
  });
}
