import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { put, list, get, del } from '@vercel/blob';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Helper to check token configuration
function isBlobConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN && process.env.BLOB_READ_WRITE_TOKEN.trim().length > 0;
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
  },
  windows: {
    latestVersion: '1.0.1',
    minimumVersion: '1.0.0',
    downloadUrl: 'https://genmugic.vercel.app/download/genmusic-setup.exe',
    fileSize: '56.2 MB',
    sha256: 'a12bc44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b899',
    releaseDate: '2026-09-15',
    mirrorUrl: 'https://t.me/genmusic_apk',
  },
  macos: {
    latestVersion: '1.0.1',
    minimumVersion: '1.0.0',
    downloadUrl: 'https://genmugic.vercel.app/download/genmusic.dmg',
    fileSize: '68.4 MB',
    sha256: 'c88df44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b112',
    releaseDate: '2026-09-15',
    mirrorUrl: 'https://t.me/genmusic_official',
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
  return res.sendFile(appVersionPath);
});

// Update version manifest via API
app.post('/api/admin/update-version-manifest', async (req, res) => {
  try {
    const updated = req.body;
    if (!updated || !updated.android || !updated.windows || !updated.macos) {
      return res.status(400).json({ success: false, error: 'Invalid manifest payload' });
    }

    activeVersionManifest = { ...activeVersionManifest, ...updated };

    // Optionally sync to Vercel Blob if token available
    if (isBlobConfigured()) {
      try {
        await put('version.json', JSON.stringify(activeVersionManifest, null, 2), {
          access: 'public',
          addRandomSuffix: false,
          contentType: 'application/json',
        });
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
// 2. DOWNLOAD ROUTES
// /download/genmusic.apk
// /download/genmusic-setup.exe
// /download/genmusic.dmg
// ==========================================
app.get('/download/genmusic.apk', (req, res) => {
  // If target release binary exists on CDN/GitHub or Vercel Blob, redirect there
  const target = 'https://github.com/genmusic/releases/releases/download/v2.5.0/GEN_MUSIC_v2.5.0.apk';
  return res.redirect(302, target);
});

app.get('/download/genmusic-setup.exe', (req, res) => {
  const target = 'https://github.com/genmusic/releases/releases/download/v2.5.0/GEN_MUSIC_Setup_v2.5.0.exe';
  return res.redirect(302, target);
});

app.get('/download/genmusic.dmg', (req, res) => {
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
  return res.redirect(302, '/#download');
});

// 1. Blob Status Check
app.get('/api/blob/status', (req, res) => {
  const configured = isBlobConfigured();
  res.json({
    configured,
    message: configured 
      ? 'Vercel Blob token is configured and ready.' 
      : 'BLOB_READ_WRITE_TOKEN is not configured. Please set this environment variable in settings.',
  });
});

// 2. Put Blob Endpoint (supports app data, articles, files)
// Example usage: put('articles/blob.txt', 'Hello World!', { access: 'private' })
app.post('/api/blob/put', async (req, res) => {
  try {
    if (!isBlobConfigured()) {
      return res.status(400).json({
        success: false,
        error: 'BLOB_READ_WRITE_TOKEN is not configured in environment variables. Add BLOB_READ_WRITE_TOKEN to your environment.',
      });
    }

    const { pathname, content, access = 'private', addRandomSuffix = false, contentType } = req.body;

    if (!pathname) {
      return res.status(400).json({ success: false, error: 'Pathname is required' });
    }

    const bodyContent = typeof content === 'object' ? JSON.stringify(content, null, 2) : String(content ?? '');
    const determinedContentType = contentType || (pathname.endsWith('.json') ? 'application/json' : 'text/plain');

    const blob = await put(pathname, bodyContent, {
      access: access === 'public' ? 'public' : 'private',
      addRandomSuffix: Boolean(addRandomSuffix),
      contentType: determinedContentType,
    });

    return res.json({
      success: true,
      blob,
    });
  } catch (error: any) {
    console.error('Error in /api/blob/put:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to put blob to Vercel Blob store',
    });
  }
});

// 3. Exact user snippet endpoint: test article put
app.post('/api/blob/test-article', async (req, res) => {
  try {
    if (!isBlobConfigured()) {
      return res.status(400).json({
        success: false,
        error: 'BLOB_READ_WRITE_TOKEN is not configured in environment variables.',
      });
    }

    const text = req.body.text || 'Hello World!';
    const pathname = req.body.pathname || 'articles/blob.txt';
    const access = req.body.access === 'public' ? 'public' : 'private';

    // Direct invocation as requested
    const blob = await put(pathname, text, { access });

    return res.json({
      success: true,
      blob,
      message: `Successfully stored ${pathname} using @vercel/blob with ${access} access!`,
    });
  } catch (error: any) {
    console.error('Error testing article blob put:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to put article blob',
    });
  }
});

// 4. Sync full app store data into Vercel Blob
app.post('/api/blob/sync-app', async (req, res) => {
  try {
    if (!isBlobConfigured()) {
      return res.status(400).json({
        success: false,
        error: 'BLOB_READ_WRITE_TOKEN is not configured in environment variables.',
      });
    }

    const appData = req.body;
    if (!appData) {
      return res.status(400).json({ success: false, error: 'No app data provided' });
    }

    const payload = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: appData,
    };

    const blob = await put('app/genmusic-data.json', JSON.stringify(payload, null, 2), {
      access: 'private',
      addRandomSuffix: false,
      contentType: 'application/json',
    });

    return res.json({
      success: true,
      blob,
      message: 'App configuration synchronized to Vercel Blob (app/genmusic-data.json)',
    });
  } catch (error: any) {
    console.error('Error syncing app to blob:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to sync app data to Vercel Blob',
    });
  }
});

// 5. Load synced app store data from Vercel Blob
app.get('/api/blob/load-app', async (req, res) => {
  try {
    if (!isBlobConfigured()) {
      return res.status(400).json({
        success: false,
        error: 'BLOB_READ_WRITE_TOKEN is not configured.',
      });
    }

    // Retrieve via @vercel/blob get
    const response = await get('app/genmusic-data.json', { access: 'private' });
    if (!response) {
      return res.status(404).json({ success: false, error: 'App data not found in Vercel Blob' });
    }

    // In @vercel/blob, response might have stream or can be read as text
    if (response && typeof (response as any).text === 'function') {
      const rawText = await (response as any).text();
      const parsed = JSON.parse(rawText);
      return res.json({ success: true, payload: parsed });
    }

    return res.json({ success: true, response });
  } catch (error: any) {
    console.error('Error loading app data from blob:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to load app data from Vercel Blob',
    });
  }
});

// 6. List blobs in store
app.get('/api/blob/list', async (req, res) => {
  try {
    if (!isBlobConfigured()) {
      return res.status(400).json({
        success: false,
        error: 'BLOB_READ_WRITE_TOKEN is not configured.',
        blobs: [],
      });
    }

    const prefix = typeof req.query.prefix === 'string' ? req.query.prefix : undefined;
    const result = await list({ prefix });

    return res.json({
      success: true,
      blobs: result.blobs,
      hasMore: result.hasMore,
      cursor: result.cursor,
    });
  } catch (error: any) {
    console.error('Error listing blobs:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to list blobs',
      blobs: [],
    });
  }
});

// 7. Delete blob
app.delete('/api/blob/delete', async (req, res) => {
  try {
    if (!isBlobConfigured()) {
      return res.status(400).json({ success: false, error: 'BLOB_READ_WRITE_TOKEN is not configured.' });
    }

    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: 'Blob URL is required' });
    }

    await del(url);
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
