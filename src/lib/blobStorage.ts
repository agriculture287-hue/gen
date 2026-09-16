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
 * Check if Vercel Blob backend has BLOB_READ_WRITE_TOKEN configured
 */
export async function checkBlobStatus(): Promise<BlobStatusResponse> {
  try {
    const res = await fetch('/api/blob/status');
    if (!res.ok) {
      return { configured: false, message: 'Server returned error' };
    }
    return await res.json();
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

    const data = await res.json();
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

    return await res.json();
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

    return await res.json();
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
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || 'Data not found in Vercel Blob' };
    }
    const result = await res.json();
    return { success: true, data: result.payload?.data || result.payload };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Network error' };
  }
}

/**
 * List files stored in Vercel Blob
 */
export async function listBlobs(prefix?: string): Promise<{ success: boolean; blobs: BlobItem[]; error?: string }> {
  try {
    const query = prefix ? `?prefix=${encodeURIComponent(prefix)}` : '';
    const res = await fetch(`/api/blob/list${query}`);
    const data = await res.json();
    return {
      success: data.success ?? false,
      blobs: data.blobs || [],
      error: data.error,
    };
  } catch (e: any) {
    return { success: false, blobs: [], error: e?.message };
  }
}
