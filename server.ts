import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import multer from 'multer';
import { blobService } from './src/services/blobService';

dotenv.config();

const app = express();
const PORT = 3000;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 250 * 1024 * 1024 }, // 250MB for app binaries (APK, EXE, DMG)
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper to check token configuration
function isBlobConfigured(): boolean {
  return blobService.isReady();
}

// In-memory active version manifest fallback
let activeVersionManifest = {
  android: {
    latestVersion: '1.0.1',
    minimumVersion: '1.0.0',
    downloadUrl: 'https://genmugic.vercel.app/download/genmusic.apk',
    fileSize: '24.8 MB',
    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    releaseDate: '2026-09-15',
    mirrorUrl: 'https://t.me/genmusic_apk',
    blobUrl: '',
  },
  windows: {
    latestVersion: '1.0.1',
    minimumVersion: '1.0.0',
    downloadUrl: 'https://genmugic.vercel.app/download/genmusic-setup.exe',
    fileSize: '56.2 MB',
    sha256: 'a12bc44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b899',
    releaseDate: '2026-09-15',
    mirrorUrl: 'https://t.me/genmusic_apk',
    blobUrl: '',
  },
  macos: {
    latestVersion: '1.0.1',
    minimumVersion: '1.0.0',
    downloadUrl: 'https://genmugic.vercel.app/download/genmusic.dmg',
    fileSize: '68.4 MB',
    sha256: 'c88df44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b112',
    releaseDate: '2026-09-15',
    mirrorUrl: 'https://t.me/genmusic_official',
    blobUrl: '',
  },
  releaseNotes: [
    'Improved streaming engine with adaptive buffer management',
    'Better audio quality with lossless Hi-Fi & 3D Spatial Dolby preset',
    'Playback bug fixes on background audio resume',
    'UI enhancements with updated player bar and dark theme contrast',
  ],
};

// ==========================================
// 1. VERSION ENDPOINT (/version.json & /app-version.json)
// https://genmugic.vercel.app/app-version.json
// ==========================================
app.get('/version.json', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300');
  res.setHeader('Content-Type', 'application/json');
  return res.json(activeVersionManifest);
});

app.get('/app-version.json', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300');
  res.setHeader('Content-Type', 'application/json');
  
  const appVersionPath = path.join(process.cwd(), 'public', 'app-version.json');
  if (fs.existsSync(appVersionPath)) {
    return res.sendFile(appVersionPath);
  }
  return res.json({
    latest_version: activeVersionManifest.android.latestVersion,
    min_supported_version: activeVersionManifest.android.minimumVersion,
    force_update: false,
    whats_new: activeVersionManifest.releaseNotes,
    download_url: {
      android: activeVersionManifest.android.blobUrl || activeVersionManifest.android.downloadUrl,
      windows: activeVersionManifest.windows.blobUrl || activeVersionManifest.windows.downloadUrl,
      macos: activeVersionManifest.macos.blobUrl || activeVersionManifest.macos.downloadUrl,
    },
  });
});

// Update version manifest via API
app.post('/api/admin/update-version-manifest', async (req, res) => {
  try {
    const updated = req.body;
    if (!updated || !updated.android || !updated.windows || !updated.macos) {
      return res.status(400).json({ success: false, error: 'Invalid manifest payload' });
    }

    activeVersionManifest = { ...activeVersionManifest, ...updated };

    // Update local public files if present
    try {
      const publicAppVerPath = path.join(process.cwd(), 'public', 'app-version.json');
      const formattedAppVersion = {
        latest_version: activeVersionManifest.android.latestVersion,
        min_supported_version: activeVersionManifest.android.minimumVersion,
        force_update: false,
        whats_new: activeVersionManifest.releaseNotes,
        download_url: {
          android: activeVersionManifest.android.blobUrl || activeVersionManifest.android.downloadUrl,
          windows: activeVersionManifest.windows.blobUrl || activeVersionManifest.windows.downloadUrl,
          macos: activeVersionManifest.macos.blobUrl || activeVersionManifest.macos.downloadUrl,
        },
      };
      fs.writeFileSync(publicAppVerPath, JSON.stringify(formattedAppVersion, null, 2), 'utf8');
    } catch (fsErr) {
      console.warn('Could not write local public/app-version.json:', fsErr);
    }

    // Optionally sync to Vercel Blob if token available
    if (blobService.isReady()) {
      try {
        await blobService.uploadAppData('app-version.json', activeVersionManifest);
        await blobService.uploadAppData('version.json', activeVersionManifest);
      } catch (blobErr) {
        console.warn('Failed saving version.json to Vercel blob:', blobErr);
      }
    }

    return res.json({
      success: true,
      manifest: activeVersionManifest,
      message: 'Version manifest updated successfully across endpoints.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error?.message });
  }
});

// ==========================================
// 2. DOWNLOAD ROUTES (REDIRECTS TO BLOB STORAGE WHEN AVAILABLE)
// /download/genmusic.apk
// /download/genmusic-setup.exe
// /download/genmusic.dmg
// ==========================================
app.get('/download/genmusic.apk', (req, res) => {
  if (activeVersionManifest.android.blobUrl) {
    return res.redirect(302, activeVersionManifest.android.blobUrl);
  }
  const target = 'https://github.com/genmusic/releases/releases/download/v2.5.0/GEN_MUSIC_v2.5.0.apk';
  return res.redirect(302, target);
});

app.get('/download/genmusic-setup.exe', (req, res) => {
  if (activeVersionManifest.windows.blobUrl) {
    return res.redirect(302, activeVersionManifest.windows.blobUrl);
  }
  const target = 'https://github.com/genmusic/releases/releases/download/v2.5.0/GEN_MUSIC_Setup_v2.5.0.exe';
  return res.redirect(302, target);
});

app.get('/download/genmusic.dmg', (req, res) => {
  if (activeVersionManifest.macos.blobUrl) {
    return res.redirect(302, activeVersionManifest.macos.blobUrl);
  }
  const target = 'https://github.com/genmusic/releases/releases/download/v2.5.0/GEN_MUSIC_v2.5.0_Universal.dmg';
  return res.redirect(302, target);
});

app.get('/download/:file', (req, res) => {
  const file = req.params.file.toLowerCase();
  if (file.includes('apk') || file.includes('android')) {
    return res.redirect(302, '/download/genmusic.apk');
  }
  if (file.includes('exe') || file.includes('win') || file.includes('setup')) {
    return res.redirect(302, '/download/genmusic-setup.exe');
  }
  if (file.includes('dmg') || file.includes('mac') || file.includes('darwin')) {
    return res.redirect(302, '/download/genmusic.dmg');
  }
  return res.redirect(302, '/#downloads');
});

// ==========================================
// 3. BLOB STORAGE API ENDPOINTS
// ==========================================

// 1. Blob Status Check
app.get('/api/blob/status', (req, res) => {
  const config = blobService.getConfig();
  res.json({
    configured: config.isConfigured,
    storeId: config.storeId ? `${config.storeId.substring(0, 6)}...` : undefined,
    message: config.isConfigured 
      ? 'Vercel Blob token is configured and ready.' 
      : 'BLOB_READ_WRITE_TOKEN is not configured. Please set this environment variable in settings.',
  });
});

// 2. Binary / App File Upload to Blob Storage (APKs, EXEs, DMGs, Images, JSON)
app.post('/api/blob/upload-file', upload.single('file'), async (req, res) => {
  try {
    if (!blobService.isReady()) {
      return res.status(400).json({
        success: false,
        error: 'BLOB_READ_WRITE_TOKEN is not configured. Please configure your Vercel Blob token.',
      });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file provided in form-data' });
    }

    const customPath = req.body.pathname;
    const access = req.body.access === 'private' ? 'private' : 'public';
    const platform = req.body.platform; // 'android' | 'windows' | 'macos'

    const result = await blobService.uploadAppInstaller({
      filename: req.file.originalname,
      buffer: req.file.buffer,
      platform: platform || 'generic',
      access,
      customPath,
    });

    if (!result.success || !result.blob) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to upload binary file to Blob storage',
      });
    }

    const blob = result.blob;

    // If this is an app release binary, update the active manifest and public/app-version.json automatically!
    if (platform === 'android' || (customPath && customPath.endsWith('.apk')) || req.file.originalname.endsWith('.apk')) {
      activeVersionManifest.android.blobUrl = blob.url;
      if (result.sha256) activeVersionManifest.android.sha256 = result.sha256;
    } else if (platform === 'windows' || (customPath && customPath.endsWith('.exe')) || req.file.originalname.endsWith('.exe')) {
      activeVersionManifest.windows.blobUrl = blob.url;
      if (result.sha256) activeVersionManifest.windows.sha256 = result.sha256;
    } else if (platform === 'macos' || (customPath && customPath.endsWith('.dmg')) || req.file.originalname.endsWith('.dmg')) {
      activeVersionManifest.macos.blobUrl = blob.url;
      if (result.sha256) activeVersionManifest.macos.sha256 = result.sha256;
    }

    // Also update public/app-version.json file with new URL
    try {
      const publicAppVerPath = path.join(process.cwd(), 'public', 'app-version.json');
      if (fs.existsSync(publicAppVerPath)) {
        const current = JSON.parse(fs.readFileSync(publicAppVerPath, 'utf8'));
        if (platform === 'android' || req.file.originalname.endsWith('.apk')) current.download_url.android = blob.url;
        if (platform === 'windows' || req.file.originalname.endsWith('.exe')) current.download_url.windows = blob.url;
        if (platform === 'macos' || req.file.originalname.endsWith('.dmg')) current.download_url.macos = blob.url;
        fs.writeFileSync(publicAppVerPath, JSON.stringify(current, null, 2), 'utf8');
      }
    } catch (fsErr) {
      console.warn('Failed updating public/app-version.json with new blob URL:', fsErr);
    }

    return res.json({
      success: true,
      blob,
      sha256: result.sha256,
      message: `File ${req.file.originalname} (${(req.file.size / (1024 * 1024)).toFixed(2)} MB) successfully uploaded to Blob Storage!`,
      publicUrl: blob.url,
    });
  } catch (error: any) {
    console.error('Error uploading file to blob:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to upload binary file to Blob storage',
    });
  }
});

// 3. Put Text / JSON Blob Endpoint
app.post('/api/blob/put', async (req, res) => {
  try {
    if (!blobService.isReady()) {
      return res.status(400).json({
        success: false,
        error: 'BLOB_READ_WRITE_TOKEN is not configured in environment variables.',
      });
    }

    const { pathname, content, access = 'public', contentType } = req.body;

    if (!pathname) {
      return res.status(400).json({ success: false, error: 'Pathname is required' });
    }

    const result = await blobService.uploadAppData(pathname, content, {
      access: access === 'private' ? 'private' : 'public',
      contentType,
    });

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    return res.json({
      success: true,
      blob: result.blob,
    });
  } catch (error: any) {
    console.error('Error in /api/blob/put:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to put blob to Vercel Blob store',
    });
  }
});

// 4. Sync All Backend Data (App Manifests, Channels, Releases) to Blob Storage
app.post(['/api/blob/sync-all-backend-data', '/api/blob/sync-app'], async (req, res) => {
  try {
    const backendPayload = req.body || {};
    const timestamp = new Date().toISOString();

    // Update in-memory manifest if provided in payload
    if (backendPayload.manifest) {
      activeVersionManifest = {
        ...activeVersionManifest,
        ...backendPayload.manifest,
      };
    } else if (backendPayload.platforms && Array.isArray(backendPayload.platforms)) {
      // If platforms array passed, extract latest download URLs into manifest
      const androidPlatform = backendPayload.platforms.find((p: any) => p.platform === 'android');
      const windowsPlatform = backendPayload.platforms.find((p: any) => p.platform === 'windows');
      const macPlatform = backendPayload.platforms.find((p: any) => p.platform === 'mac' || p.platform === 'macos');

      if (androidPlatform?.downloadUrl) activeVersionManifest.android.downloadUrl = androidPlatform.downloadUrl;
      if (windowsPlatform?.downloadUrl) activeVersionManifest.windows.downloadUrl = windowsPlatform.downloadUrl;
      if (macPlatform?.downloadUrl) activeVersionManifest.macos.downloadUrl = macPlatform.downloadUrl;
    }

    // Format public/app-version.json
    const publicAppVersion = {
      latest_version: backendPayload?.manifest?.android?.latestVersion || activeVersionManifest.android.latestVersion,
      min_supported_version: backendPayload?.manifest?.android?.minimumVersion || activeVersionManifest.android.minimumVersion,
      force_update: false,
      whats_new: backendPayload?.manifest?.releaseNotes || activeVersionManifest.releaseNotes,
      download_url: {
        android: activeVersionManifest.android.blobUrl || activeVersionManifest.android.downloadUrl,
        windows: activeVersionManifest.windows.blobUrl || activeVersionManifest.windows.downloadUrl,
        macos: activeVersionManifest.macos.blobUrl || activeVersionManifest.macos.downloadUrl,
      },
    };

    // Update local public static files
    try {
      const publicAppVerPath = path.join(process.cwd(), 'public', 'app-version.json');
      fs.writeFileSync(publicAppVerPath, JSON.stringify(publicAppVersion, null, 2), 'utf8');
      const publicVerPath = path.join(process.cwd(), 'public', 'version.json');
      fs.writeFileSync(publicVerPath, JSON.stringify(activeVersionManifest, null, 2), 'utf8');
    } catch (fsErr) {
      console.warn('Could not write local public version files:', fsErr);
    }

    if (!blobService.isReady()) {
      return res.json({
        success: true,
        savedLocally: true,
        blobConfigured: false,
        message: 'Admin data saved locally. Provide a valid BLOB_READ_WRITE_TOKEN in Settings to enable Vercel Blob cloud persistence.',
      });
    }

    try {
      // 1. Upload unified backend configuration package to Blob
      const unifiedRes = await blobService.uploadAppData('app/genmusic-data.json', {
        timestamp,
        version: '1.0',
        data: backendPayload,
      });

      // 2. Upload latest app-version.json & version.json for external clients to Blob
      const appVersionRes = await blobService.uploadAppData('app-version.json', publicAppVersion);
      const versionManifestRes = await blobService.uploadAppData('version.json', activeVersionManifest);

      if (!unifiedRes.success) {
        return res.json({
          success: true,
          savedLocally: true,
          blobConfigured: true,
          blobError: unifiedRes.error,
          message: `Saved locally. Blob notice: ${unifiedRes.error}`,
        });
      }

      return res.json({
        success: true,
        blobConfigured: true,
        message: 'All admin changes, platforms, channels, updates, and release manifests saved to Vercel Blob Storage!',
        blobs: {
          backendData: unifiedRes.blob?.url,
          appVersion: appVersionRes.blob?.url,
          versionManifest: versionManifestRes.blob?.url,
        },
      });
    } catch (blobUploadErr: any) {
      return res.json({
        success: true,
        savedLocally: true,
        blobConfigured: true,
        blobError: blobUploadErr?.message,
        message: `Saved locally in browser and server. Note: ${blobUploadErr?.message || 'Blob sync failed.'}`,
      });
    }
  } catch (error: any) {
    return res.status(200).json({
      success: false,
      error: error?.message || 'Failed to sync backend data to Blob Storage',
    });
  }
});

// 5. Load synced app store data from Vercel Blob
app.get('/api/blob/load-app', async (req, res) => {
  try {
    if (!blobService.isReady()) {
      return res.json({
        success: false,
        error: 'BLOB_READ_WRITE_TOKEN is not configured.',
      });
    }

    const result = await blobService.getAppData('app/genmusic-data.json');
    if (!result.success || (!result.data && !result.rawText)) {
      return res.json({ success: false, error: result.error || 'App data not found in Vercel Blob' });
    }

    return res.json({ success: true, payload: result.data || result.rawText });
  } catch (error: any) {
    return res.json({
      success: false,
      error: error?.message || 'Failed to load app data from Vercel Blob',
    });
  }
});

// 6. List blobs in store
app.get('/api/blob/list', async (req, res) => {
  try {
    if (!blobService.isReady()) {
      return res.json({
        success: false,
        error: 'BLOB_READ_WRITE_TOKEN is not configured.',
        blobs: [],
      });
    }

    const prefix = typeof req.query.prefix === 'string' ? req.query.prefix : undefined;
    const result = await blobService.listFiles({ prefix });

    return res.json({
      success: result.success,
      blobs: result.blobs || [],
      hasMore: result.hasMore,
      cursor: result.cursor,
      error: result.error,
    });
  } catch (error: any) {
    return res.json({
      success: false,
      error: error?.message || 'Failed to list blobs',
      blobs: [],
    });
  }
});

// 7. Delete blob
app.delete('/api/blob/delete', async (req, res) => {
  try {
    if (!blobService.isReady()) {
      return res.status(400).json({ success: false, error: 'BLOB_READ_WRITE_TOKEN is not configured.' });
    }

    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: 'Blob URL is required' });
    }

    const result = await blobService.deleteFile(url);
    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }
    return res.json({ success: true, message: 'Blob deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting blob:', error);
    return res.status(500).json({ success: false, error: error?.message || 'Failed to delete blob' });
  }
});

// Setup Vite middleware / static files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GEN MUSIC Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

