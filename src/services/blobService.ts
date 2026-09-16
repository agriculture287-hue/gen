import { put, get, list, del, head, PutBlobResult, ListBlobResult, HeadBlobResult } from '@vercel/blob';
import crypto from 'crypto';

export interface BlobConfig {
  token: string | undefined;
  storeId: string | undefined;
  isConfigured: boolean;
}

export type SupportedAppPlatform = 'android' | 'windows' | 'macos';

export interface UploadInstallerOptions {
  filename: string;
  buffer: Buffer;
  platform?: SupportedAppPlatform | 'generic';
  version?: string;
  access?: 'public' | 'private';
  customPath?: string;
}

export interface UploadInstallerResult {
  success: boolean;
  blob?: PutBlobResult;
  sha256?: string;
  sizeBytes?: number;
  publicUrl?: string;
  platform?: string;
  error?: string;
}

export interface AppDataBlobResult<T = any> {
  success: boolean;
  data?: T;
  rawText?: string;
  url?: string;
  error?: string;
}

/**
 * Helper Service for Vercel Blob Storage
 * Handles configuration, secure uploads, retrieval of app installers and backend data.
 */
class VercelBlobService {
  /**
   * Retrieve Blob configuration from environment variables
   */
  public getConfig(): BlobConfig {
    const token = process.env.BLOB_READ_WRITE_TOKEN?.trim() || undefined;
    const storeId = process.env.BLOB_STORE_ID?.trim() || undefined;
    return {
      token,
      storeId,
      isConfigured: Boolean(token && token.length > 0),
    };
  }

  /**
   * Verify if BLOB_READ_WRITE_TOKEN is present
   */
  public isReady(): boolean {
    return this.getConfig().isConfigured;
  }

  /**
   * Determine exact MIME type for application installers and assets
   */
  public getMimeType(pathname: string): string {
    const lower = pathname.toLowerCase();
    if (lower.endsWith('.apk')) return 'application/vnd.android.package-archive';
    if (lower.endsWith('.exe')) return 'application/x-msdownload';
    if (lower.endsWith('.msi')) return 'application/x-msi';
    if (lower.endsWith('.dmg')) return 'application/x-apple-diskimage';
    if (lower.endsWith('.pkg')) return 'application/octet-stream';
    if (lower.endsWith('.zip')) return 'application/zip';
    if (lower.endsWith('.json')) return 'application/json';
    if (lower.endsWith('.txt')) return 'text/plain; charset=utf-8';
    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
    if (lower.endsWith('.svg')) return 'image/svg+xml';
    return 'application/octet-stream';
  }

  /**
   * Calculate SHA-256 integrity hash of binary buffer
   */
  public calculateSha256(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Sanitize and format blob storage destination path
   */
  public sanitizePath(rawPath: string, defaultFolder: string = 'downloads'): string {
    const cleaned = rawPath
      .replace(/\\/g, '/')
      .replace(/\.\./g, '')
      .replace(/^\/+/, '')
      .trim();

    return cleaned.length > 0 ? cleaned : `${defaultFolder}/file-${Date.now()}`;
  }

  /**
   * Helper to format friendly error messages from Vercel Blob exceptions
   */
  private formatError(err: any, action: string): string {
    const msg = err?.message || String(err || '');
    if (msg.includes('Access denied') || msg.includes('BlobAccessError') || msg.includes('valid token') || msg.includes('403') || msg.includes('401')) {
      return `Vercel Blob access denied: Please verify that BLOB_READ_WRITE_TOKEN in Settings is a valid, active Read/Write token from your Vercel Dashboard.`;
    }
    if (msg.includes('not found') || msg.includes('404')) {
      return `Blob resource not found (${action}).`;
    }
    return err?.message || `Failed to ${action} in Vercel Blob.`;
  }

  /**
   * Securely upload an application installer (.apk, .exe, .dmg) to Vercel Blob
   */
  public async uploadAppInstaller(options: UploadInstallerOptions): Promise<UploadInstallerResult> {
    const { token } = this.getConfig();
    if (!token) {
      return {
        success: false,
        error: 'BLOB_READ_WRITE_TOKEN is missing. Please configure your Vercel Blob token in environment variables.',
      };
    }

    try {
      const { filename, buffer, platform = 'generic', access = 'public', customPath } = options;
      const sha256 = this.calculateSha256(buffer);
      const sizeBytes = buffer.length;

      // Construct clean blob pathname
      let targetPath: string;
      if (customPath && customPath.trim().length > 0) {
        targetPath = this.sanitizePath(customPath);
      } else {
        const platformPrefix = platform !== 'generic' ? `installers/${platform}` : 'downloads';
        targetPath = `${platformPrefix}/${filename}`;
      }

      const contentType = this.getMimeType(targetPath);

      // Execute upload via @vercel/blob
      const blob = await put(targetPath, buffer, {
        access,
        token,
        contentType,
        addRandomSuffix: false,
      });

      return {
        success: true,
        blob,
        sha256,
        sizeBytes,
        publicUrl: blob.url,
        platform,
      };
    } catch (err: any) {
      const formatted = this.formatError(err, 'upload installer');
      return {
        success: false,
        error: formatted,
      };
    }
  }

  /**
   * Store structured JSON or text application data in Vercel Blob
   */
  public async uploadAppData(
    pathname: string,
    data: any,
    options: { access?: 'public' | 'private'; contentType?: string } = {}
  ): Promise<{ success: boolean; blob?: PutBlobResult; error?: string }> {
    const { token } = this.getConfig();
    if (!token) {
      return {
        success: false,
        error: 'BLOB_READ_WRITE_TOKEN is not configured.',
      };
    }

    try {
      const cleanPath = this.sanitizePath(pathname, 'app');
      const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      const contentType = options.contentType || (cleanPath.endsWith('.json') ? 'application/json' : 'text/plain');

      const blob = await put(cleanPath, content, {
        access: options.access || 'public',
        token,
        contentType,
        addRandomSuffix: false,
      });

      return {
        success: true,
        blob,
      };
    } catch (err: any) {
      const formatted = this.formatError(err, 'save app data');
      return {
        success: false,
        error: formatted,
      };
    }
  }

  /**
   * Retrieve and parse application data from Vercel Blob
   */
  public async getAppData<T = any>(
    pathnameOrUrl: string,
    options: { access?: 'public' | 'private' } = {}
  ): Promise<AppDataBlobResult<T>> {
    const { token } = this.getConfig();
    if (!token) {
      return {
        success: false,
        error: 'BLOB_READ_WRITE_TOKEN is not configured.',
      };
    }

    try {
      const response = await get(pathnameOrUrl, {
        access: options.access || 'public',
        token,
      });

      if (!response) {
        return { success: false, error: 'Blob not found' };
      }

      let rawText = '';
      if (typeof (response as any).text === 'function') {
        rawText = await (response as any).text();
      } else if ((response as any).stream) {
        const stream = (response as any).stream as NodeJS.ReadableStream;
        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
          chunks.push(Buffer.from(chunk));
        }
        rawText = Buffer.concat(chunks).toString('utf8');
      }

      let parsedData: T | undefined = undefined;
      try {
        parsedData = JSON.parse(rawText);
      } catch {
        // Leave parsedData undefined if not JSON
      }

      return {
        success: true,
        data: parsedData,
        rawText,
      };
    } catch (err: any) {
      const formatted = this.formatError(err, 'fetch app data');
      return {
        success: false,
        error: formatted,
      };
    }
  }

  /**
   * List all stored files or application installers in Blob storage
   */
  public async listFiles(options: { prefix?: string; limit?: number } = {}): Promise<{
    success: boolean;
    blobs: ListBlobResult['blobs'];
    hasMore?: boolean;
    cursor?: string;
    error?: string;
    isAccessDenied?: boolean;
  }> {
    const { token } = this.getConfig();
    if (!token) {
      return { success: false, blobs: [], error: 'BLOB_READ_WRITE_TOKEN not configured.' };
    }

    try {
      const result = await list({
        token,
        prefix: options.prefix,
        limit: options.limit || 100,
      });

      return {
        success: true,
        blobs: result.blobs,
        hasMore: result.hasMore,
        cursor: result.cursor,
      };
    } catch (err: any) {
      const formatted = this.formatError(err, 'list files');
      const isAccessDenied = String(err?.message || '').includes('Access denied') || String(err?.message || '').includes('BlobAccessError');
      return {
        success: false,
        blobs: [],
        error: formatted,
        isAccessDenied,
      };
    }
  }

  /**
   * Get metadata and head information of a blob
   */
  public async getFileMetadata(urlOrPath: string): Promise<{ success: boolean; metadata?: HeadBlobResult; error?: string }> {
    const { token } = this.getConfig();
    if (!token) {
      return { success: false, error: 'BLOB_READ_WRITE_TOKEN not configured.' };
    }

    try {
      const metadata = await head(urlOrPath, { token });
      return { success: true, metadata };
    } catch (err: any) {
      const formatted = this.formatError(err, 'fetch file metadata');
      return { success: false, error: formatted };
    }
  }

  /**
   * Delete a blob file from storage
   */
  public async deleteFile(urlOrUrls: string | string[]): Promise<{ success: boolean; error?: string }> {
    const { token } = this.getConfig();
    if (!token) {
      return { success: false, error: 'BLOB_READ_WRITE_TOKEN not configured.' };
    }

    try {
      await del(urlOrUrls, { token });
      return { success: true };
    } catch (err: any) {
      const formatted = this.formatError(err, 'delete file');
      return { success: false, error: formatted };
    }
  }
}

export const blobService = new VercelBlobService();
