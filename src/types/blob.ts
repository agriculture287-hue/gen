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

export interface BlobStatusResponse {
  configured: boolean;
  activeProvider: BlobStorageProvider;
  vercelConfigured: boolean;
  storeId?: string;
  localBlobsCount: number;
  message: string;
  tokenMasked?: string;
}

export interface BlobDiagnosticLog {
  timestamp: string;
  step: string;
  status: 'info' | 'success' | 'warn' | 'error';
  detail: string;
}

export interface BlobDiagnosticResult {
  success: boolean;
  summary: string;
  activeProvider: BlobStorageProvider;
  storeConfig: {
    isConfigured: boolean;
    storeId?: string;
    tokenMasked?: string;
    detectedAccessMode?: 'public' | 'private' | 'unknown';
  };
  testResults: {
    localDiskReady: boolean;
    publicAccessUpload: boolean;
    privateAccessUpload: boolean;
    uploadedUrl: string | null;
    listQueryWorking: boolean;
    blobsCountInStore: number;
  };
  logs: BlobDiagnosticLog[];
  durationMs: number;
  error?: string;
}
