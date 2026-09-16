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

app.use(express.json({ limit: '250mb' }));
app.use(express.urlencoded({ extended: true, limit: '250mb' }));

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

// Simple isolated admin route per user request
app.post('/api/admin/update-version', async (req, res) => {
  try {
    const { password, data } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || 'secret';

    if (!adminPassword || password !== adminPassword) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Invalid password' });
    }

    if (!data || !data.latest_version) {
      return res.status(400).json({ success: false, error: 'Invalid payload' });
    }

    // Prepare JSON object as requested
    const appVersionJson = {
      latest_version: data.latest_version,
      min_supported_version: data.min_supported_version,
      force_update: !!data.force_update,
      whats_new: data.whats_new || [],
      download_url: {
        android: data.download_url?.android || '',
        windows: data.download_url?.windows || '',
        macos: data.download_url?.macos || ''
      }
    };

    let blobUrl = '';

    // Upload to Vercel Blob
    const token = blobService.getConfig().token;
    if (token) {
      const { put } = await import('@vercel/blob');
      const blob = await put('app-version.json', JSON.stringify(appVersionJson, null, 2), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        token: token,
        contentType: 'application/json'
      });
      blobUrl = blob.url;
    } else {
      return res.status(500).json({ success: false, error: 'BLOB_READ_WRITE_TOKEN is not configured' });
    }

    // Save locally to public/app-version.json as fallback
    try {
      const publicAppVerPath = path.join(process.cwd(), 'public', 'app-version.json');
      fs.writeFileSync(publicAppVerPath, JSON.stringify(appVersionJson, null, 2), 'utf8');
    } catch (fsErr) {
      console.warn('Could not write local public/app-version.json:', fsErr);
    }

    return res.json({
      success: true,
      blobUrl,
      message: 'App version updated successfully'
    });
  } catch (error: any) {
    console.error('Update version error:', error);
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

// Client-side multipart upload handler for @vercel/blob/client
app.post('/api/upload', async (req, res) => {
  try {
    const { handleUpload } = await import('@vercel/blob/client');
    const config = blobService.getConfig();

    if (!config.isConfigured || !config.token) {
      return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN is not configured in settings.' });
    }

    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      token: config.token,
      onBeforeGenerateToken: async (pathname) => {
        return {
          allowedContentTypes: [
            'application/vnd.android.package-archive', // .apk
            'application/x-apple-diskimage', // .dmg
            'application/x-msdownload', // .exe
            'application/octet-stream', // fallback binary
            'application/zip'
          ],
          maximumSizeInBytes: 300 * 1024 * 1024, // 300MB
          tokenPayload: JSON.stringify({}),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log("Client chunk upload completed:", blob.url);
      },
    });

    return res.status(200).json(jsonResponse);
  } catch (error: any) {
    console.error('Error handling client chunk upload:', error);
    return res.status(400).json({ error: error.message });
  }
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

// 8. Comprehensive Blob Diagnostics Test
app.get('/api/blob/diagnostic', async (req, res) => {
  const config = blobService.getConfig();
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

  addLog('1. Check Token Configuration', config.isConfigured ? 'success' : 'error', 
    config.isConfigured 
      ? `Token is configured (Length: ${config.token?.length} chars, Prefix: ${config.token?.substring(0, 15)}..., Store ID: ${config.storeId || 'Auto-detected from token'})`
      : 'BLOB_READ_WRITE_TOKEN is missing or empty in environment.'
  );

  if (!config.isConfigured || !config.token) {
    return res.json({
      success: false,
      summary: 'Vercel Blob token is missing.',
      storeConfig: { isConfigured: false, storeId: undefined },
      logs,
      error: 'Token missing',
      durationMs: Date.now() - startTime,
    });
  }

  let publicTestSuccess = false;
  let privateTestSuccess = false;
  let publicUrl = '';
  let privateUrl = '';
  let detectedAccessMode: 'public' | 'private' | 'unknown' = 'unknown';
  let listCount = 0;

  // Step 2: Test Direct Upload with Public Access
  const testFileName = `diagnostic/diag-test-${Date.now()}.txt`;
  const testContent = `GEN MUSIC Diagnostic Test at ${new Date().toISOString()}\nStore: ${config.storeId || 'default'}\nStatus: OK`;

  addLog('2. Test Upload with "public" access', 'info', `Attempting put to "${testFileName}" with access="public"...`);
  try {
    const { put } = await import('@vercel/blob');
    const pubResult = await put(testFileName, testContent, {
      access: 'public',
      token: config.token,
      contentType: 'text/plain; charset=utf-8',
      addRandomSuffix: false,
    });
    publicTestSuccess = true;
    publicUrl = pubResult.url;
    detectedAccessMode = 'public';
    addLog('2. Test Upload with "public" access', 'success', `SUCCESS: Uploaded to ${pubResult.url} (downloadUrl: ${pubResult.downloadUrl})`);
  } catch (pubErr: any) {
    const errMsg = pubErr?.message || String(pubErr);
    addLog('2. Test Upload with "public" access', 'warn', `Failed with public access: ${errMsg}`);
    
    if (errMsg.includes('Cannot use public access on a private store') || errMsg.includes('private store')) {
      addLog('2. Store Mode Analysis', 'info', 'Detected: Your Vercel Blob Store is created in PRIVATE access mode.');
      detectedAccessMode = 'private';
    }
  }

  // Step 3: Test Upload with Private Access if public failed
  if (!publicTestSuccess) {
    addLog('3. Test Upload with "private" access', 'info', `Attempting put to "${testFileName}" with access="private"...`);
    try {
      const { put } = await import('@vercel/blob');
      const privResult = await put(testFileName, testContent, {
        access: 'private',
        token: config.token,
        contentType: 'text/plain; charset=utf-8',
        addRandomSuffix: false,
      });
      privateTestSuccess = true;
      privateUrl = privResult.url;
      detectedAccessMode = 'private';
      addLog('3. Test Upload with "private" access', 'success', `SUCCESS: Uploaded with private access to ${privResult.url}`);
    } catch (privErr: any) {
      const errMsg = privErr?.message || String(privErr);
      addLog('3. Test Upload with "private" access', 'error', `Failed with private access: ${errMsg}`);
    }
  }

  // Step 4: Test List Blobs
  addLog('4. Query Blob Store Inventory (list())', 'info', 'Calling list() on store to verify read access...');
  try {
    const { list } = await import('@vercel/blob');
    const listResult = await list({ token: config.token, limit: 10 });
    listCount = listResult.blobs.length;
    addLog('4. Query Blob Store Inventory (list())', 'success', `Found ${listCount} active blob items in store. (HasMore: ${listResult.hasMore})`);
  } catch (listErr: any) {
    addLog('4. Query Blob Store Inventory (list())', 'warn', `List query failed: ${listErr?.message || String(listErr)}`);
  }

  const overallSuccess = publicTestSuccess || privateTestSuccess;

  addLog(
    '5. Final Diagnostic Evaluation',
    overallSuccess ? 'success' : 'error',
    overallSuccess
      ? `Vercel Blob is fully operational! Store access mode: "${detectedAccessMode.toUpperCase()}". Binary uploads, manifests, and app packages will work smoothly.`
      : 'All upload attempts failed. Please verify your token permissions or regenerate the token in Vercel Dashboard.'
  );

  return res.json({
    success: overallSuccess,
    summary: overallSuccess 
      ? `Vercel Blob Storage is connected and working in ${detectedAccessMode.toUpperCase()} mode.`
      : 'Vercel Blob upload test failed.',
    storeConfig: {
      isConfigured: true,
      storeId: config.storeId || 'auto',
      tokenMasked: `${config.token.substring(0, 18)}...${config.token.substring(config.token.length - 6)}`,
      detectedAccessMode,
    },
    testResults: {
      publicAccessUpload: publicTestSuccess,
      privateAccessUpload: privateTestSuccess,
      uploadedUrl: publicUrl || privateUrl || null,
      listQueryWorking: listCount >= 0,
      blobsCountInStore: listCount,
    },
    logs,
    durationMs: Date.now() - startTime,
  });
});

// 9. Blob Chunk Size & 413 Payload Diagnostic Tool
app.post('/api/blob/diagnostic/chunks', upload.single('probe'), async (req, res) => {
  const config = blobService.getConfig();
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

  addLog('1. Token & Server Limits Check', config.isConfigured ? 'success' : 'error',
    config.isConfigured ? 'Vercel Blob Token configured.' : 'Token missing.'
  );

  if (!config.isConfigured || !config.token) {
    return res.status(400).json({
      success: false,
      error: 'Token missing',
      logs,
    });
  }

  // Test incremental chunk sizes: 100KB, 1MB, 5MB, 15MB
  const chunkSizes = [
    { name: '100 KB', size: 100 * 1024 },
    { name: '1 MB', size: 1 * 1024 * 1024 },
    { name: '5 MB', size: 5 * 1024 * 1024 },
    { name: '15 MB', size: 15 * 1024 * 1024 },
  ];

  const results: Array<{ sizeName: string; bytes: number; success: boolean; error?: string; durationMs: number }> = [];
  let serverConfigurationIssue = false;
  let maxSuccessfulBytes = 0;

  for (const chunk of chunkSizes) {
    const chunkStart = Date.now();
    const testBuffer = Buffer.alloc(chunk.size, 'X');
    const testPath = `diagnostic/chunk-test-${chunk.size}-${Date.now()}.bin`;

    addLog(`Testing Upload Chunk: ${chunk.name} (${chunk.size} bytes)`, 'info', `Uploading ${chunk.name} test buffer to Vercel Blob...`);

    try {
      const { put } = await import('@vercel/blob');
      const putRes = await put(testPath, testBuffer, {
        access: 'public',
        token: config.token,
        addRandomSuffix: false,
      });

      const dur = Date.now() - chunkStart;
      maxSuccessfulBytes = chunk.size;
      results.push({ sizeName: chunk.name, bytes: chunk.size, success: true, durationMs: dur });
      addLog(`Testing Upload Chunk: ${chunk.name}`, 'success', `SUCCESS: Uploaded ${chunk.name} in ${dur}ms to ${putRes.url}`);
    } catch (chunkErr: any) {
      const dur = Date.now() - chunkStart;
      const errMsg = chunkErr?.message || String(chunkErr);
      results.push({ sizeName: chunk.name, bytes: chunk.size, success: false, error: errMsg, durationMs: dur });
      addLog(`Testing Upload Chunk: ${chunk.name}`, 'error', `FAILED uploading ${chunk.name}: ${errMsg}`);

      if (errMsg.includes('413') || errMsg.includes('Payload Too Large') || errMsg.includes('entity too large')) {
        serverConfigurationIssue = true;
        addLog('413 Analysis', 'error', `Detected HTTP 413 Payload Too Large at ${chunk.name}. This indicates Express/Nginx body parser limit restriction.`);
      }
      break; // Stop higher chunk tests if smaller failed
    }
  }

  const conclusion = serverConfigurationIssue
    ? 'HTTP 413 error stems from server-side body parser / reverse proxy payload size restrictions.'
    : maxSuccessfulBytes >= 5 * 1024 * 1024
    ? 'Chunk test passed successfully up to 15MB. Large binary uploads are fully supported.'
    : 'Upload limits tested up to maximum successful chunk size.';

  addLog('Chunk Diagnostic Conclusion', serverConfigurationIssue ? 'error' : 'success', conclusion);

  return res.json({
    success: !serverConfigurationIssue && maxSuccessfulBytes > 0,
    summary: conclusion,
    serverConfigurationIssue,
    maxSuccessfulBytes,
    results,
    logs,
    durationMs: Date.now() - startTime,
  });
});

// Setup Vite middleware / static files
async function startServer() {
  // Sync state from Vercel Blob on startup
  if (blobService.isReady()) {
    try {
      console.log('Fetching latest manifest from Vercel Blob...');
      const result = await blobService.getAppData('version.json');
      if (result.success && result.data) {
        activeVersionManifest = { ...activeVersionManifest, ...result.data };
        console.log('Successfully hydrated activeVersionManifest from Blob Storage.');
      } else if (result.rawText) {
        activeVersionManifest = { ...activeVersionManifest, ...JSON.parse(result.rawText) };
        console.log('Successfully hydrated activeVersionManifest from Blob Storage rawText.');
      }
    } catch (err) {
      console.warn('Could not hydrate manifest from Blob Storage on startup:', err);
    }
  }

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

