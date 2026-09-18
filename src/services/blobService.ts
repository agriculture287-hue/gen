import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { put as vercelPut, get as vercelGet, list as vercelList, del as vercelDel, head as vercelHead } from '@vercel/blob';
import type { PutBlobResult, ListBlobResult, HeadBlobResult } from '@vercel/blob';

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export type BlobStorageProvider = 'vercel' | 'local' | 'hybrid';
export type BlobAccessMode = 'public' | 'private';

export interface BlobItem {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: string;
  contentType: string;
  downloadUrl: string;
  provider: 'vercel' | 'local';
  sha256?: string;
  access?: BlobAccessMode;
}

export interface BlobPutOptions {
  access?: BlobAccessMode;
  contentType?: string;
  addRandomSuffix?: boolean;
  platform?: 'android' | 'windows' | 'macos' | 'linux' | 'generic';
  customPath?: string;
  allowOverwrite?: boolean;
}

export interface BlobPutResult {
  success: boolean;
  blob?: BlobItem;
  publicUrl?: string;
  sha256?: string;
  provider?: 'vercel' | 'local';
  savedLocally?: boolean;
  error?: string;
  message?: string;
}

export interface BlobListOptions {
  prefix?: string;
  limit?: number;
  cursor?: string;
  provider?: 'all' | 'vercel' | 'local';
}

export interface BlobListResult {
  success: boolean;
  blobs: BlobItem[];
  hasMore: boolean;
  cursor?: string;
  totalCount?: number;
  error?: string;
}

export interface BlobStatusInfo {
  configured: boolean;
  activeProvider: BlobStorageProvider;
  vercelConfigured: boolean;
  storeId?: string;
  localBlobsCount: number;
  message: string;
  tokenMasked?: string;
}

export interface UploadInstallerOptions {
  filename: string;
  buffer: Buffer;
  platform?: 'android' | 'windows' | 'macos' | 'linux' | 'generic';
  version?: string;
  access?: BlobAccessMode;
  customPath?: string;
}

// ==========================================
// 2. MIME & PATH UTILITIES
// ==========================================

export function getMimeType(pathname: string): string {
  const lower = pathname.toLowerCase();
  if (lower.endsWith('.apk')) return 'application/vnd.android.package-archive';
  if (lower.endsWith('.exe')) return 'application/x-msdownload';
  if (lower.endsWith('.msi')) return 'application/x-msi';
  if (lower.endsWith('.dmg')) return 'application/x-apple-diskimage';
  if (lower.endsWith('.appimage')) return 'application/x-executable';
  if (lower.endsWith('.pkg')) return 'application/octet-stream';
  if (lower.endsWith('.zip')) return 'application/zip';
  if (lower.endsWith('.tar.gz') || lower.endsWith('.tgz')) return 'application/gzip';
  if (lower.endsWith('.json')) return 'application/json';
  if (lower.endsWith('.txt') || lower.endsWith('.log')) return 'text/plain; charset=utf-8';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.svg')) return 'image/svg+xml';
  if (lower.endsWith('.mp3')) return 'audio/mpeg';
  if (lower.endsWith('.flac')) return 'audio/flac';
  if (lower.endsWith('.wav')) return 'audio/wav';
  return 'application/octet-stream';
}

export function sanitizeBlobPath(rawPath: string, defaultFolder: string = 'blobs'): string {
  const cleaned = rawPath
    .replace(/\\/g, '/')
    .replace(/\.\./g, '')
    .replace(/^\/+/, '')
    .trim();

  return cleaned.length > 0 ? cleaned : `${defaultFolder}/blob-${Date.now()}`;
}

export function computeSha256(buffer: Buffer | string): string {
  const buf = typeof buffer === 'string' ? Buffer.from(buffer, 'utf8') : buffer;
  return crypto.createHash('sha256').update(buf).digest('hex');
}

// ==========================================
// 3. LOCAL DISK BLOB STORAGE PROVIDER
// ==========================================

export class LocalDiskBlobProvider {
  private baseDir: string;
  private catalogPath: string;
  private catalog: Record<string, BlobItem> = {};

  constructor(baseDir?: string) {
    this.baseDir = baseDir || path.join(process.cwd(), 'public', 'storage', 'blobs');
    this.catalogPath = path.join(process.cwd(), 'public', 'storage', 'blobs-manifest.json');
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(this.baseDir)) {
        fs.mkdirSync(this.baseDir, { recursive: true });
      }
      const catalogDir = path.dirname(this.catalogPath);
      if (!fs.existsSync(catalogDir)) {
        fs.mkdirSync(catalogDir, { recursive: true });
      }

      if (fs.existsSync(this.catalogPath)) {
        try {
          const raw = fs.readFileSync(this.catalogPath, 'utf8');
          this.catalog = JSON.parse(raw);
        } catch {
          this.catalog = {};
        }
      }

      // Sync existing files on disk into catalog (including public/uploads)
      this.rescanDisk();
    } catch (err) {
      console.warn('[LocalDiskBlobProvider] Init notice:', err);
    }
  }

  private saveCatalog() {
    try {
      fs.writeFileSync(this.catalogPath, JSON.stringify(this.catalog, null, 2), 'utf8');
    } catch (err) {
      console.warn('[LocalDiskBlobProvider] Failed writing catalog:', err);
    }
  }

  public rescanDisk() {
    try {
      if (!fs.existsSync(this.baseDir)) return;

      const scanDirectory = (dir: string, subPath: string = '') => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relativePath = subPath ? `${subPath}/${entry.name}` : entry.name;

          if (entry.isDirectory()) {
            scanDirectory(fullPath, relativePath);
          } else if (entry.isFile() && !entry.name.startsWith('.')) {
            const stats = fs.statSync(fullPath);
            if (!this.catalog[relativePath]) {
              const url = `/storage/blobs/${relativePath}`;
              this.catalog[relativePath] = {
                url,
                downloadUrl: url,
                pathname: relativePath,
                size: stats.size,
                uploadedAt: stats.mtime.toISOString(),
                contentType: getMimeType(relativePath),
                provider: 'local',
                access: 'public',
              };
            }
          }
        }
      };

      scanDirectory(this.baseDir);
      this.saveCatalog();
    } catch (err) {
      console.warn('[LocalDiskBlobProvider] Rescan error:', err);
    }
  }

  public getCount(): number {
    return Object.keys(this.catalog).length;
  }

  public async put(
    pathname: string,
    content: Buffer | string,
    options: BlobPutOptions = {}
  ): Promise<BlobPutResult> {
    try {
      const cleanPath = sanitizeBlobPath(pathname);
      const buffer = typeof content === 'string' ? Buffer.from(content, 'utf8') : content;
      const sha256 = computeSha256(buffer);
      const contentType = options.contentType || getMimeType(cleanPath);
      const targetFile = path.join(this.baseDir, cleanPath);

      const targetDir = path.dirname(targetFile);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      fs.writeFileSync(targetFile, buffer);

      // Also ensure root public and dist directories receive critical config files
      if (cleanPath === 'app-version.json' || cleanPath === 'version.json' || cleanPath.endsWith('genmusic-data.json')) {
        try {
          const rootPublicPath = path.join(process.cwd(), 'public', path.basename(cleanPath));
          fs.writeFileSync(rootPublicPath, buffer);
          const rootDistPath = path.join(process.cwd(), 'dist', path.basename(cleanPath));
          if (fs.existsSync(path.join(process.cwd(), 'dist'))) {
            fs.writeFileSync(rootDistPath, buffer);
          }
        } catch {
          // Non-blocking
        }
      }

      const url = `/storage/blobs/${cleanPath}`;
      const blobItem: BlobItem = {
        url,
        downloadUrl: url,
        pathname: cleanPath,
        size: buffer.length,
        uploadedAt: new Date().toISOString(),
        contentType,
        provider: 'local',
        sha256,
        access: options.access || 'public',
      };

      this.catalog[cleanPath] = blobItem;
      this.saveCatalog();

      return {
        success: true,
        blob: blobItem,
        publicUrl: url,
        sha256,
        provider: 'local',
        savedLocally: true,
        message: `Saved to local blob storage at ${cleanPath}`,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Failed saving blob to local disk',
        provider: 'local',
      };
    }
  }

  public async get(pathname: string): Promise<{ success: boolean; buffer?: Buffer; text?: string; blob?: BlobItem; error?: string }> {
    try {
      const cleanPath = sanitizeBlobPath(pathname);
      let targetFile = path.join(this.baseDir, cleanPath);

      if (!fs.existsSync(targetFile)) {
        // Fallback to public root
        const publicFallback = path.join(process.cwd(), 'public', cleanPath);
        if (fs.existsSync(publicFallback)) {
          targetFile = publicFallback;
        } else {
          // Fallback to public/basename
          const baseNameFallback = path.join(process.cwd(), 'public', path.basename(cleanPath));
          if (fs.existsSync(baseNameFallback)) {
            targetFile = baseNameFallback;
          } else {
            return { success: false, error: `Blob not found at ${cleanPath}` };
          }
        }
      }

      const buffer = fs.readFileSync(targetFile);
      const blob = this.catalog[cleanPath];
      return {
        success: true,
        buffer,
        text: buffer.toString('utf8'),
        blob,
      };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed reading blob from disk' };
    }
  }

  public async list(options: BlobListOptions = {}): Promise<BlobListResult> {
    this.rescanDisk();
    let items = Object.values(this.catalog);

    if (options.prefix) {
      const cleanPrefix = options.prefix.toLowerCase();
      items = items.filter(b => b.pathname.toLowerCase().startsWith(cleanPrefix));
    }

    // Sort newest first
    items.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    const limit = options.limit || 100;
    const paged = items.slice(0, limit);

    return {
      success: true,
      blobs: paged,
      hasMore: items.length > limit,
      totalCount: items.length,
    };
  }

  public async head(pathname: string): Promise<{ success: boolean; blob?: BlobItem; error?: string }> {
    const cleanPath = sanitizeBlobPath(pathname);
    const blob = this.catalog[cleanPath];
    if (blob) {
      return { success: true, blob };
    }
    const targetFile = path.join(this.baseDir, cleanPath);
    if (fs.existsSync(targetFile)) {
      const stats = fs.statSync(targetFile);
      const url = `/storage/blobs/${cleanPath}`;
      return {
        success: true,
        blob: {
          url,
          downloadUrl: url,
          pathname: cleanPath,
          size: stats.size,
          uploadedAt: stats.mtime.toISOString(),
          contentType: getMimeType(cleanPath),
          provider: 'local',
        },
      };
    }
    return { success: false, error: 'File not found' };
  }

  public async del(pathnameOrUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
      let cleanPath = pathnameOrUrl;
      if (cleanPath.startsWith('/storage/blobs/')) {
        cleanPath = cleanPath.replace('/storage/blobs/', '');
      } else if (cleanPath.startsWith('storage/blobs/')) {
        cleanPath = cleanPath.replace('storage/blobs/', '');
      }
      cleanPath = sanitizeBlobPath(cleanPath);

      const targetFile = path.join(this.baseDir, cleanPath);
      if (fs.existsSync(targetFile)) {
        fs.unlinkSync(targetFile);
      }

      delete this.catalog[cleanPath];
      this.saveCatalog();

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed deleting local blob' };
    }
  }
}

// ==========================================
// 4. VERCEL BLOB STORAGE PROVIDER
// ==========================================

export class VercelBlobProvider {
  private persistentTokenPath = path.join(process.cwd(), '.data', 'blob_token.json');

  public setToken(token: string, storeId?: string): boolean {
    try {
      const dataDir = path.dirname(this.persistentTokenPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(
        this.persistentTokenPath,
        JSON.stringify({ token: token.trim(), storeId: storeId?.trim() || '' }, null, 2),
        'utf8'
      );
      process.env.BLOB_READ_WRITE_TOKEN = token.trim();
      if (storeId) process.env.BLOB_STORE_ID = storeId.trim();
      return true;
    } catch (err) {
      console.warn('[VercelBlobProvider] Failed to save persistent token:', err);
      return false;
    }
  }

  public async testConnection(customToken?: string): Promise<{
    success: boolean;
    message: string;
    storeId?: string;
    blobsCount?: number;
    error?: string;
  }> {
    const token = (customToken || this.getTokenConfig().token || '').trim();
    if (!token) {
      return { success: false, message: 'Token is missing or empty.', error: 'Token is missing or empty.' };
    }
    if (!token.startsWith('vercel_blob_rw_')) {
      return {
        success: false,
        message: 'Token must begin with "vercel_blob_rw_"',
        error: 'Token must begin with "vercel_blob_rw_"',
      };
    }

    try {
      const res = await vercelList({ token, limit: 1 });
      const storeIdMatch = token.match(/store_[a-zA-Z0-9_-]+/);
      return {
        success: true,
        message: 'Successfully connected to Vercel Blob store!',
        storeId: storeIdMatch ? storeIdMatch[0] : undefined,
        blobsCount: res.blobs ? res.blobs.length : 0,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Failed connecting to Vercel Blob API',
        error: err?.message || 'Failed connecting to Vercel Blob API',
      };
    }
  }

  public getTokenConfig(): { token?: string; storeId?: string; isConfigured: boolean; maskedToken?: string } {
    const rawToken = (
      process.env.BLOB_READ_WRITE_TOKEN ||
      process.env.VERCEL_BLOB_READ_WRITE_TOKEN ||
      process.env.BLOB_TOKEN ||
      process.env.VERCEL_BLOB_TOKEN ||
      process.env.GENMUSIC_BLOB_TOKEN ||
      process.env.Gen_READ_WRITE_TOKEN ||
      process.env.GEN_READ_WRITE_TOKEN ||
      process.env.BLOB_READWRITE_TOKEN ||
      process.env.STORAGE_TOKEN ||
      ''
    ).trim();

    let token: string | undefined = undefined;
    if (rawToken && rawToken.length > 10 && !rawToken.includes('MY_BLOB_') && !rawToken.includes('MY_READ_')) {
      const match = rawToken.match(/vercel_blob_rw_[a-zA-Z0-9_-]+/);
      if (match) {
        token = match[0];
      } else {
        token = rawToken.replace(/^["']|["']$/g, '').trim();
      }
    }

    // Also check saved persistent token if not found in environment
    if (!token) {
      try {
        if (fs.existsSync(this.persistentTokenPath)) {
          const fileData = JSON.parse(fs.readFileSync(this.persistentTokenPath, 'utf8'));
          if (fileData?.token && typeof fileData.token === 'string' && fileData.token.startsWith('vercel_blob_rw_')) {
            token = fileData.token.trim();
          }
        }
      } catch {
        // Continue
      }
    }

    const rawStoreId = (
      process.env.BLOB_STORE_ID ||
      process.env.VERCEL_BLOB_STORE_ID ||
      process.env.Gen_STORE_ID ||
      process.env.GEN_STORE_ID ||
      ''
    ).trim();

    let storeId: string | undefined = undefined;
    if (rawStoreId && !rawStoreId.includes('MY_')) {
      const match = rawStoreId.match(/store_[a-zA-Z0-9_-]+/);
      if (match) storeId = match[0];
      else storeId = rawStoreId.replace(/^["']|["']$/g, '').trim();
    } else if (rawToken) {
      const match = rawToken.match(/store_[a-zA-Z0-9_-]+/);
      if (match) storeId = match[0];
    }

    if (!storeId && token) {
      const match = token.match(/store_[a-zA-Z0-9_-]+/);
      if (match) storeId = match[0];
    }

    if (token && token.startsWith('store_')) {
      if (!storeId) storeId = token;
      token = undefined;
    }

    const isConfigured = Boolean(token && token.length > 15 && token.startsWith('vercel_blob_rw_'));
    const maskedToken = token
      ? `${token.substring(0, 18)}...${token.substring(token.length - 6)}`
      : undefined;

    return { token, storeId, isConfigured, maskedToken };
  }

  public isReady(): boolean {
    return this.getTokenConfig().isConfigured;
  }

  public async put(
    pathname: string,
    content: Buffer | string,
    options: BlobPutOptions = {}
  ): Promise<{ success: boolean; blob?: PutBlobResult; error?: string }> {
    const { token } = this.getTokenConfig();
    if (!token) {
      return { success: false, error: 'BLOB_READ_WRITE_TOKEN is not configured.' };
    }

    const cleanPath = sanitizeBlobPath(pathname);
    const contentType = options.contentType || getMimeType(cleanPath);

    try {
      let result: PutBlobResult;
      try {
        result = await vercelPut(cleanPath, content, {
          token,
          access: options.access || 'public',
          contentType,
          addRandomSuffix: options.addRandomSuffix ?? false,
          allowOverwrite: options.allowOverwrite ?? true,
        });
      } catch (firstErr: any) {
        const errMsg = String(firstErr?.message || '');
        if (errMsg.includes('Cannot use public access on a private store') || errMsg.includes('private store')) {
          // Fallback to private access automatically
          result = await vercelPut(cleanPath, content, {
            token,
            access: 'private',
            contentType,
            addRandomSuffix: options.addRandomSuffix ?? false,
            allowOverwrite: options.allowOverwrite ?? true,
          });
        } else {
          throw firstErr;
        }
      }

      return { success: true, blob: result };
    } catch (err: any) {
      const msg = err?.message || String(err);
      return { success: false, error: msg };
    }
  }

  public async get(pathnameOrUrl: string, options: { access?: BlobAccessMode } = {}): Promise<{ success: boolean; text?: string; data?: any; error?: string }> {
    const { token } = this.getTokenConfig();
    if (!token) return { success: false, error: 'BLOB_READ_WRITE_TOKEN is not configured.' };

    try {
      const res = await vercelGet(pathnameOrUrl, { token, access: options.access || 'public' });
      if (!res) return { success: false, error: 'Blob not found in Vercel store' };

      let text = '';
      if (res && (res as any).stream) {
        const chunks: any[] = [];
        for await (const chunk of (res as any).stream) {
          chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
        }
        text = Buffer.concat(chunks).toString('utf8');
      } else if (typeof (res as any).text === 'function') {
        text = await (res as any).text();
      }

      let data: any = undefined;
      try {
        if (text) {
          data = JSON.parse(text);
        }
      } catch {
        // Not JSON
      }

      return { success: true, text, data };
    } catch (err: any) {
      // Direct HTTP fetch fallback for public blobs
      if (pathnameOrUrl.startsWith('http://') || pathnameOrUrl.startsWith('https://')) {
        try {
          const fetchRes = await fetch(pathnameOrUrl, {
            headers: { 'Cache-Control': 'no-cache' },
          });
          if (fetchRes.ok) {
            const text = await fetchRes.text();
            let data: any = undefined;
            try {
              data = JSON.parse(text);
            } catch {
              // Not JSON
            }
            return { success: true, text, data };
          }
        } catch {
          // Fall through
        }
      }
      return { success: false, error: err?.message || 'Failed fetching blob from Vercel' };
    }
  }

  public async list(options: BlobListOptions = {}): Promise<{ success: boolean; blobs: BlobItem[]; hasMore: boolean; cursor?: string; error?: string }> {
    const { token } = this.getTokenConfig();
    if (!token) return { success: false, blobs: [], hasMore: false, error: 'BLOB_READ_WRITE_TOKEN is not configured.' };

    try {
      const res = await vercelList({
        token,
        prefix: options.prefix,
        limit: options.limit || 100,
        cursor: options.cursor,
      });

      const blobs: BlobItem[] = res.blobs.map((b) => ({
        url: b.url,
        downloadUrl: b.downloadUrl,
        pathname: b.pathname,
        size: b.size,
        uploadedAt: b.uploadedAt.toISOString ? b.uploadedAt.toISOString() : String(b.uploadedAt),
        contentType: getMimeType(b.pathname),
        provider: 'vercel',
        access: 'public',
      }));

      return {
        success: true,
        blobs,
        hasMore: res.hasMore,
        cursor: res.cursor,
      };
    } catch (err: any) {
      return { success: false, blobs: [], hasMore: false, error: err?.message || 'Failed listing Vercel blobs' };
    }
  }

  public async head(urlOrPath: string): Promise<{ success: boolean; metadata?: HeadBlobResult; error?: string }> {
    const { token } = this.getTokenConfig();
    if (!token) return { success: false, error: 'BLOB_READ_WRITE_TOKEN is not configured.' };

    try {
      const metadata = await vercelHead(urlOrPath, { token });
      return { success: true, metadata };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed fetching head info' };
    }
  }

  public async del(urlOrUrls: string | string[]): Promise<{ success: boolean; error?: string }> {
    const { token } = this.getTokenConfig();
    if (!token) return { success: false, error: 'BLOB_READ_WRITE_TOKEN is not configured.' };

    try {
      await vercelDel(urlOrUrls, { token });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed deleting from Vercel' };
    }
  }
}

// ==========================================
// 5. UNIFIED REIMPLEMENTED BLOB STORAGE ENGINE
// ==========================================

export class UnifiedBlobStorageEngine {
  public local: LocalDiskBlobProvider;
  public vercel: VercelBlobProvider;
  private knownUrlsPath = path.join(process.cwd(), '.data', 'blob_urls.json');
  private knownBlobUrls: Map<string, string> = new Map();

  constructor() {
    this.local = new LocalDiskBlobProvider();
    this.vercel = new VercelBlobProvider();
    this.initKnownUrls();
  }

  private initKnownUrls() {
    try {
      if (fs.existsSync(this.knownUrlsPath)) {
        const data = JSON.parse(fs.readFileSync(this.knownUrlsPath, 'utf8'));
        if (data && typeof data === 'object') {
          for (const [k, v] of Object.entries(data)) {
            if (typeof v === 'string') {
              this.knownBlobUrls.set(k, v);
            }
          }
        }
      }
    } catch (err) {
      console.warn('[UnifiedBlobStorageEngine] Could not load known URLs:', err);
    }
  }

  private saveKnownUrls() {
    try {
      const dataDir = path.dirname(this.knownUrlsPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(
        this.knownUrlsPath,
        JSON.stringify(Object.fromEntries(this.knownBlobUrls), null, 2),
        'utf8'
      );
    } catch (err) {
      console.warn('[UnifiedBlobStorageEngine] Could not save known URLs:', err);
    }
  }

  public async setVercelToken(token: string, storeId?: string): Promise<{
    success: boolean;
    message: string;
    status: BlobStatusInfo;
    error?: string;
  }> {
    const test = await this.vercel.testConnection(token);
    if (!test.success) {
      return {
        success: false,
        message: test.error || 'Token verification failed',
        status: this.getStatus(),
        error: test.error,
      };
    }

    this.vercel.setToken(token, storeId);
    return {
      success: true,
      message: 'Token verified and connected to Vercel Blob successfully!',
      status: this.getStatus(),
    };
  }

  public async testVercelConnection(customToken?: string) {
    return await this.vercel.testConnection(customToken);
  }

  public getKnownUrl(pathname: string): string | undefined {
    return this.knownBlobUrls.get(pathname);
  }

  /**
   * Get unified system status
   */
  public getStatus(): BlobStatusInfo & { knownBlobUrls?: Record<string, string> } {
    const vercelConfig = this.vercel.getTokenConfig();
    const localCount = this.local.getCount();

    let activeProvider: BlobStorageProvider = 'local';
    let message = 'Local persistent blob storage operational.';

    if (vercelConfig.isConfigured) {
      activeProvider = 'hybrid';
      message = 'Hybrid storage active: Local disk mirror + Vercel Blob Global CDN.';
    }

    return {
      configured: true,
      activeProvider,
      vercelConfigured: vercelConfig.isConfigured,
      storeId: vercelConfig.storeId,
      tokenMasked: vercelConfig.maskedToken,
      localBlobsCount: localCount,
      message,
      knownBlobUrls: Object.fromEntries(this.knownBlobUrls),
    };
  }

  public isReady(): boolean {
    return true; // Local storage is always ready!
  }

  /**
   * Universal put method:
   * Writes to local disk (infallible) and Vercel Blob (if configured).
   */
  public async put(
    pathname: string,
    content: Buffer | string,
    options: BlobPutOptions = {}
  ): Promise<BlobPutResult> {
    const cleanPath = sanitizeBlobPath(pathname);
    const buffer = typeof content === 'string' ? Buffer.from(content, 'utf8') : content;
    const sha256 = computeSha256(buffer);
    const contentType = options.contentType || getMimeType(cleanPath);

    // 1. Always write to Local Disk Provider
    const localResult = await this.local.put(cleanPath, buffer, {
      ...options,
      contentType,
    });

    // 2. If Vercel Blob is configured, attempt upload to Vercel
    if (this.vercel.isReady()) {
      try {
        const vercelRes = await this.vercel.put(cleanPath, buffer, {
          ...options,
          contentType,
        });

        if (vercelRes.success && vercelRes.blob) {
          const vercelBlob: BlobItem = {
            url: vercelRes.blob.url,
            downloadUrl: vercelRes.blob.downloadUrl,
            pathname: vercelRes.blob.pathname,
            size: buffer.length,
            uploadedAt: new Date().toISOString(),
            contentType,
            provider: 'vercel',
            sha256,
            access: options.access || 'public',
          };

          // Cache known live URL for instant lookup
          this.knownBlobUrls.set(cleanPath, vercelRes.blob.url);
          this.saveKnownUrls();

          return {
            success: true,
            blob: vercelBlob,
            publicUrl: vercelRes.blob.url,
            sha256,
            provider: 'vercel',
            savedLocally: true,
            message: `Uploaded to Vercel Blob CDN and cached locally on disk.`,
          };
        } else {
          // Vercel failed (e.g. auth error or quota) -> Return local result with warning
          return {
            success: true,
            blob: localResult.blob,
            publicUrl: localResult.publicUrl,
            sha256,
            provider: 'local',
            savedLocally: true,
            error: vercelRes.error,
            message: `Saved to local backend disk. (Vercel sync note: ${vercelRes.error})`,
          };
        }
      } catch (vercelErr: any) {
        return {
          success: true,
          blob: localResult.blob,
          publicUrl: localResult.publicUrl,
          sha256,
          provider: 'local',
          savedLocally: true,
          error: vercelErr?.message,
          message: `Saved to local disk. Vercel error: ${vercelErr?.message}`,
        };
      }
    }

    // Vercel not configured -> purely local
    return {
      ...localResult,
      message: `Saved to backend storage (${cleanPath})`,
    };
  }

  /**
   * Universal get: checks local first, then Vercel if needed
   */
  public async get(pathnameOrUrl: string): Promise<{ success: boolean; data?: any; text?: string; buffer?: Buffer; error?: string }> {
    let resolvedUrl = pathnameOrUrl;

    // If it's a pathname and Vercel is ready, resolve it to a Vercel Blob URL first
    if (!pathnameOrUrl.startsWith('http://') && !pathnameOrUrl.startsWith('https://')) {
      if (this.vercel.isReady()) {
        const cachedUrl = this.knownBlobUrls.get(pathnameOrUrl) || this.knownBlobUrls.get(sanitizeBlobPath(pathnameOrUrl));
        if (cachedUrl) {
          resolvedUrl = cachedUrl;
        } else {
          try {
            const listRes = await this.vercel.list({ prefix: pathnameOrUrl });
            if (listRes.success && listRes.blobs && listRes.blobs.length > 0) {
              const matchedBlob = listRes.blobs.find(
                b => b.pathname === pathnameOrUrl || b.pathname.endsWith('/' + pathnameOrUrl)
              ) || listRes.blobs[0];
              if (matchedBlob) {
                resolvedUrl = matchedBlob.url;
                this.knownBlobUrls.set(pathnameOrUrl, matchedBlob.url);
                this.saveKnownUrls();
              }
            }
          } catch (err) {
            console.warn('[UnifiedBlobStorageEngine.get] Failed resolving pathname via Vercel list:', err);
          }
        }
      }
    }

    // If it's a Vercel URL
    if (resolvedUrl.startsWith('http://') || resolvedUrl.startsWith('https://')) {
      if (this.vercel.isReady()) {
        const vRes = await this.vercel.get(resolvedUrl);
        if (vRes.success) return vRes;
      }
    }

    // Try local
    return await this.local.get(pathnameOrUrl);
  }

  /**
   * Universal list: merges Vercel & Local inventory cleanly
   */
  public async list(options: BlobListOptions = {}): Promise<BlobListResult> {
    const localRes = await this.local.list(options);
    const allBlobs: BlobItem[] = [...localRes.blobs];

    if (this.vercel.isReady() && options.provider !== 'local') {
      const vercelRes = await this.vercel.list(options);
      if (vercelRes.success && vercelRes.blobs.length > 0) {
        // Add Vercel blobs, avoid duplicating if same pathname
        for (const vBlob of vercelRes.blobs) {
          const exists = allBlobs.some(b => b.pathname === vBlob.pathname);
          if (!exists) {
            allBlobs.push(vBlob);
          }
        }
      }
    }

    // Sort by upload time desc
    allBlobs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    const limit = options.limit || 100;
    return {
      success: true,
      blobs: allBlobs.slice(0, limit),
      hasMore: allBlobs.length > limit,
      totalCount: allBlobs.length,
    };
  }

  /**
   * Universal head
   */
  public async head(pathnameOrUrl: string): Promise<{ success: boolean; blob?: BlobItem; error?: string }> {
    const localHead = await this.local.head(pathnameOrUrl);
    if (localHead.success) return localHead;

    if (this.vercel.isReady()) {
      const vHead = await this.vercel.head(pathnameOrUrl);
      if (vHead.success && vHead.metadata) {
        return {
          success: true,
          blob: {
            url: vHead.metadata.url,
            downloadUrl: vHead.metadata.downloadUrl,
            pathname: vHead.metadata.pathname,
            size: vHead.metadata.size,
            uploadedAt: vHead.metadata.uploadedAt.toISOString ? vHead.metadata.uploadedAt.toISOString() : String(vHead.metadata.uploadedAt),
            contentType: vHead.metadata.contentType || getMimeType(vHead.metadata.pathname),
            provider: 'vercel',
          },
        };
      }
    }

    return { success: false, error: 'Blob not found' };
  }

  /**
   * Universal del
   */
  public async del(pathnameOrUrl: string): Promise<{ success: boolean; error?: string }> {
    const localDel = await this.local.del(pathnameOrUrl);

    if (this.vercel.isReady()) {
      try {
        await this.vercel.del(pathnameOrUrl);
      } catch {
        // Silent catch for secondary
      }
    }

    return localDel;
  }

  /**
   * Dedicated helper for Application Installers (APK, EXE, DMG)
   */
  public async uploadAppInstaller(options: UploadInstallerOptions): Promise<{
    success: boolean;
    blob?: BlobItem;
    publicUrl?: string;
    sha256?: string;
    sizeBytes?: number;
    platform?: string;
    savedLocally?: boolean;
    provider?: 'vercel' | 'local';
    error?: string;
    message?: string;
  }> {
    const { filename, buffer, platform = 'generic', customPath, access = 'public' } = options;
    const sha256 = computeSha256(buffer);

    let targetPath: string;
    if (customPath && customPath.trim().length > 0) {
      targetPath = sanitizeBlobPath(customPath);
    } else {
      const prefix = platform !== 'generic' ? `installers/${platform}` : 'downloads';
      targetPath = `${prefix}/${filename}`;
    }

    const putResult = await this.put(targetPath, buffer, {
      access,
      platform,
      contentType: getMimeType(targetPath),
    });

    if (!putResult.success && !putResult.blob) {
      return {
        success: false,
        error: putResult.error || 'Failed uploading installer to blob storage',
      };
    }

    return {
      success: true,
      blob: putResult.blob,
      publicUrl: putResult.publicUrl || putResult.blob?.url,
      sha256,
      sizeBytes: buffer.length,
      platform,
      savedLocally: putResult.savedLocally ?? true,
      provider: putResult.provider,
      message: putResult.message,
    };
  }

  /**
   * Store structured JSON or text application data
   */
  public async uploadAppData(
    pathname: string,
    data: any,
    options: BlobPutOptions = {}
  ): Promise<BlobPutResult> {
    const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    const cleanPath = sanitizeBlobPath(pathname, 'app');
    return await this.put(cleanPath, content, {
      ...options,
      contentType: options.contentType || (cleanPath.endsWith('.json') ? 'application/json' : 'text/plain'),
    });
  }

  /**
   * Retrieve parsed application data
   */
  public async getAppData<T = any>(pathnameOrUrl: string): Promise<{ success: boolean; data?: T; rawText?: string; error?: string }> {
    const res = await this.get(pathnameOrUrl);
    if (!res.success) return { success: false, error: res.error };

    let parsed: T | undefined = res.data;
    if (!parsed && res.text) {
      try {
        parsed = JSON.parse(res.text);
      } catch {
        // Not JSON
      }
    }

    return {
      success: true,
      data: parsed,
      rawText: res.text,
    };
  }

  /**
   * Diagnostic Test Suite
   */
  public async runDiagnostic(): Promise<{
    success: boolean;
    summary: string;
    activeProvider: BlobStorageProvider;
    storeConfig: any;
    testResults: any;
    logs: Array<{ timestamp: string; step: string; status: 'info' | 'success' | 'warn' | 'error'; detail: string }>;
    durationMs: number;
  }> {
    const startTime = Date.now();
    const logs: Array<{ timestamp: string; step: string; status: 'info' | 'success' | 'warn' | 'error'; detail: string }> = [];

    const addLog = (step: string, status: 'info' | 'success' | 'warn' | 'error', detail: string) => {
      logs.push({
        timestamp: new Date().toISOString(),
        step,
        status,
        detail,
      });
    };

    // Step 1: Local Disk Check
    addLog('1. Local Storage Engine', 'info', 'Verifying local disk storage directory & catalog...');
    let localDiskReady = false;
    try {
      const testLocalPath = `diagnostic/local-ping-${Date.now()}.txt`;
      const testContent = `GEN MUSIC Local Storage Ping at ${new Date().toISOString()}`;
      const localPut = await this.local.put(testLocalPath, testContent);
      if (localPut.success) {
        localDiskReady = true;
        addLog('1. Local Storage Engine', 'success', `Local storage ready! Catalog has ${this.local.getCount()} stored items.`);
      } else {
        addLog('1. Local Storage Engine', 'error', `Local storage write error: ${localPut.error}`);
      }
    } catch (e: any) {
      addLog('1. Local Storage Engine', 'error', `Local storage exception: ${e?.message}`);
    }

    // Step 2: Vercel Token Config
    const vercelConfig = this.vercel.getTokenConfig();
    addLog('2. Vercel Blob Configuration', vercelConfig.isConfigured ? 'success' : 'warn',
      vercelConfig.isConfigured
        ? `Token detected (${vercelConfig.maskedToken}), Store ID: ${vercelConfig.storeId || 'auto-resolved'}`
        : 'BLOB_READ_WRITE_TOKEN is missing or unauthorized in Settings.'
    );

    let publicTestSuccess = false;
    let privateTestSuccess = false;
    let uploadedUrl: string | null = null;
    let detectedAccessMode: 'public' | 'private' | 'unknown' = 'unknown';

    if (vercelConfig.isConfigured) {
      const testFileName = `diagnostic/diag-test-${Date.now()}.txt`;
      const testContent = `GEN MUSIC Diagnostic Test at ${new Date().toISOString()}`;

      // Test Public
      addLog('3. Vercel Public Put Test', 'info', `Attempting put to "${testFileName}" with access="public"...`);
      const pubRes = await this.vercel.put(testFileName, testContent, { access: 'public' });
      if (pubRes.success && pubRes.blob) {
        publicTestSuccess = true;
        uploadedUrl = pubRes.blob.url;
        detectedAccessMode = 'public';
        addLog('3. Vercel Public Put Test', 'success', `Public put succeeded: ${pubRes.blob.url}`);
      } else {
        addLog('3. Vercel Public Put Test', 'warn', `Public put response: ${pubRes.error}`);
        // Test Private
        addLog('4. Vercel Private Put Test', 'info', `Attempting put with access="private"...`);
        const privRes = await this.vercel.put(testFileName, testContent, { access: 'private' });
        if (privRes.success && privRes.blob) {
          privateTestSuccess = true;
          uploadedUrl = privRes.blob.url;
          detectedAccessMode = 'private';
          addLog('4. Vercel Private Put Test', 'success', `Private put succeeded: ${privRes.blob.url}`);
        } else {
          addLog('4. Vercel Private Put Test', 'error', `Private put failed: ${privRes.error}`);
        }
      }
    }

    // Step 5: Query Unified Inventory
    addLog('5. Query Storage Inventory', 'info', 'Listing storage items...');
    const listRes = await this.list({ limit: 10 });
    addLog('5. Query Storage Inventory', 'success', `Inventory query returned ${listRes.blobs.length} items.`);

    const overallSuccess = localDiskReady;
    const isVercelLive = publicTestSuccess || privateTestSuccess;

    const summary = isVercelLive
      ? `Hybrid Storage Operational: Vercel CDN connected (${detectedAccessMode.toUpperCase()}) + Local Disk Mirroring.`
      : `Local Storage Operational: All files persist securely on backend disk (${this.local.getCount()} blobs registered).`;

    return {
      success: overallSuccess,
      summary,
      activeProvider: isVercelLive ? 'hybrid' : 'local',
      storeConfig: {
        isConfigured: vercelConfig.isConfigured,
        storeId: vercelConfig.storeId,
        tokenMasked: vercelConfig.maskedToken,
        detectedAccessMode,
      },
      testResults: {
        localDiskReady,
        publicAccessUpload: publicTestSuccess,
        privateAccessUpload: privateTestSuccess,
        uploadedUrl,
        listQueryWorking: listRes.success,
        blobsCountInStore: listRes.blobs.length,
      },
      logs,
      durationMs: Date.now() - startTime,
    };
  }

  // Backwards compatibility method
  public getConfig() {
    const vc = this.vercel.getTokenConfig();
    return {
      token: vc.token,
      storeId: vc.storeId,
      isConfigured: vc.isConfigured,
    };
  }

  // Backwards compatibility methods
  public async listFiles(options: BlobListOptions = {}) {
    return await this.list(options);
  }

  public async getFileMetadata(urlOrPath: string) {
    return await this.head(urlOrPath);
  }

  public async deleteFile(urlOrUrls: string | string[]) {
    const target = Array.isArray(urlOrUrls) ? urlOrUrls[0] : urlOrUrls;
    return await this.del(target);
  }
}

// Export singleton instance
export const blobService = new UnifiedBlobStorageEngine();
export default blobService;
