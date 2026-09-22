import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { DOWNLOAD_LINKS } from './src/data/downloadLinks.ts';
import { fetchShareMetadata, isValidContentId, revalidate as cacheDuration, buildAndroidIntentUri } from './src/lib/shareCore.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Keep an in-memory buffer of recent analytics events (max 100)
const analyticsBuffer: Array<{
  timestamp: string;
  eventType: string;
  id?: string;
  videoId?: string;
  platform: string;
  userAgent: string;
  referrer: string;
}> = [];

// Song helper metadata fetcher
async function fetchSongMetadata(videoId: string) {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oembedUrl);
    if (response.ok) {
      const data = await response.json();
      let title = data.title || 'Unknown Track';
      let artist = data.author_name || 'GEN Music Artist';

      if (title.includes(' - ')) {
        const parts = title.split(' - ');
        artist = parts[0].trim();
        title = parts.slice(1).join(' - ').trim();
      } else if (title.includes(' – ')) {
        const parts = title.split(' – ');
        artist = parts[0].trim();
        title = parts.slice(1).join(' – ').trim();
      }

      const cleanSuffixes = (str: string) => {
        return str
          .replace(/\s*[([].*?official.*?[\])]/gi, '')
          .replace(/\s*[([].*?music video.*?[\])]/gi, '')
          .replace(/\s*[([].*?video.*?[\])]/gi, '')
          .replace(/\s*[([].*?audio.*?[\])]/gi, '')
          .replace(/\s*[([].*?lyrics.*?[\])]/gi, '')
          .replace(/\s*[([].*?hd.*?[\])]/gi, '')
          .replace(/\s*[([].*?4k.*?[\])]/gi, '')
          .trim();
      };

      title = cleanSuffixes(title);
      artist = cleanSuffixes(artist);

      return {
        id: videoId,
        title: title,
        artist: artist,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        duration: '3:45',
        description: `Experience ${title} by ${artist} in immersive 3D spatial Dolby audio, only on GEN Music.`,
        sourceUrl: `https://music.youtube.com/watch?v=${videoId}`
      };
    }
  } catch (error) {
    console.warn('YouTube oEmbed fetch failed, using fallback:', error);
  }

  // Graceful case-insensitive fallback titles based on ID for common preview IDs
  let title = 'Never Gonna Give You Up';
  let artist = 'Rick Astley';
  if (videoId === 'dQw4w9WgXcQ') {
    title = 'Never Gonna Give You Up';
    artist = 'Rick Astley';
  }

  return {
    id: videoId,
    title: title,
    artist: artist,
    thumbnail: `https://img.youtube.com/vi/${videoId}/0.jpg`,
    duration: '3:32',
    description: `A legendary song shared via GEN Music. Listen to ${title} in immersive spatial surround sound.`,
    sourceUrl: `https://music.youtube.com/watch?v=${videoId}`
  };
}

// API endpoint to fetch song details (Legacy endpoint)
app.get('/api/song/:videoId', async (req, res) => {
  const { videoId } = req.params;
  if (!videoId || videoId.length < 5) {
    return res.status(400).json({ error: 'Invalid videoId' });
  }
  const song = await fetchSongMetadata(videoId);
  return res.json(song);
});

// Serverless function specification: /api/meta (YouTube oEmbed & i.ytimg.com without API keys)
app.get('/api/meta', async (req, res) => {
  const videoId = (req.query.v || req.query.id || '').toString().trim();
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=43200');

  const fallback = {
    title: 'Shared Song',
    author: 'GenMusic',
    thumbnailHQ: videoId
      ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
      : 'https://genmusics.vercel.app/logo.png'
  };

  if (!videoId || !/^[a-zA-Z0-9_-]{6,15}$/.test(videoId)) {
    return res.json(fallback);
  }

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}&format=json`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(oembedUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'GenMusic-LinkBot/1.0 (+https://genmusics.vercel.app)' }
    });
    clearTimeout(timeout);
    if (!response.ok) {
      return res.json(fallback);
    }
    const data: any = await response.json();
    return res.json({
      title: data.title || fallback.title,
      author: data.author_name || fallback.author,
      thumbnailHQ: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    });
  } catch {
    return res.json(fallback);
  }
});

// Vercel Serverless Function Specification: /api/share/:id
app.get(['/api/share/:id', '/api/share/song/:id', '/api/share/:type/:id'], (req, res) => {
  const id = req.params.id || req.params.type || '';
  const cleanId = encodeURIComponent(id);
  const deepLink = `genmusic://play?v=${cleanId}`;

  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200');
  return res.json({
    success: true,
    id: cleanId,
    deepLink,
    message: 'This content was shared using GenMusic. Open the app to start listening.'
  });
});

// API endpoint to post analytics
app.post('/api/analytics', (req, res) => {
  const { eventType, id, videoId, platform } = req.body || {};
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const referrer = req.headers['referer'] || 'Direct';
  const timestamp = new Date().toISOString();

  const item = {
    timestamp,
    eventType: eventType || 'event',
    id: id || videoId || '',
    platform: platform || 'Web',
    userAgent,
    referrer
  };

  analyticsBuffer.push(item);

  if (analyticsBuffer.length > 100) {
    analyticsBuffer.shift();
  }

  return res.json({ success: true });
});

// Simple endpoint to fetch recent in-memory logs
app.get('/api/analytics-report', (req, res) => {
  return res.json({
    total_cached_events: analyticsBuffer.length,
    recent_events: [...analyticsBuffer].reverse()
  });
});

async function handleShareRequest(req: any, res: any, rawId: string) {
  const cleanId = encodeURIComponent(rawId || '');
  const appScheme = process.env.GENMUSIC_APP_SCHEME || 'genmusic';
  const packageName = process.env.GENMUSIC_PACKAGE_NAME || 'in.gen.agrigence';
  const apkUrl = process.env.GENMUSIC_APK_URL || 'https://github.com/agriculture287-hue/gen/releases/download/apk/GEN-Music-v2.0.4.apk';

  const fallback = {
    title: 'Shared Song',
    author: 'GenMusic',
    thumbnailHQ: cleanId
      ? `https://i.ytimg.com/vi/${cleanId}/hqdefault.jpg`
      : 'https://genmusics.vercel.app/logo.png'
  };

  let meta = { ...fallback };

  if (cleanId && /^[a-zA-Z0-9_-]{6,15}$/.test(cleanId)) {
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${cleanId}&format=json`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      const oembedRes = await fetch(oembedUrl, {
        signal: controller.signal,
        headers: { 'User-Agent': 'GenMusic-LinkBot/1.0 (+https://genmusics.vercel.app)' }
      });
      clearTimeout(timeout);
      if (oembedRes.ok) {
        const data: any = await oembedRes.json();
        meta = {
          title: data.title || fallback.title,
          author: data.author_name || fallback.author,
          thumbnailHQ: `https://i.ytimg.com/vi/${cleanId}/hqdefault.jpg`
        };
      }
    } catch {
      // Keep fallback
    }
  }

  // Pure Android intent without browser_fallback_url because GenMusic is a sideloaded APK, not on Play Store
  const deepLinkUrl = `${appScheme}://play?v=${cleanId}`;
  const androidIntentUrl = `intent://play?v=${cleanId}#Intent;scheme=${appScheme};package=${packageName};end`;
  const pageTitle = `${meta.title} • GenMusic`;
  const pageDescription = `Listen to ${meta.title} by ${meta.author} on GenMusic.`;
  const shareUrl = `https://genmusics.vercel.app/share/${cleanId}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${pageTitle}</title>
  <meta name="description" content="${pageDescription}">
  <meta name="theme-color" content="#0a0a0c">
  
  <!-- OpenGraph / Facebook -->
  <meta property="og:type" content="music.song">
  <meta property="og:site_name" content="GenMusic">
  <meta property="og:title" content="${pageTitle}">
  <meta property="og:description" content="${pageDescription}">
  <meta property="og:image" content="${meta.thumbnailHQ}">
  <meta property="og:url" content="${shareUrl}">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${pageTitle}">
  <meta name="twitter:description" content="${pageDescription}">
  <meta name="twitter:image" content="${meta.thumbnailHQ}">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #0a0a0c;
      color: #f3f4f6;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      padding: 24px 16px;
      position: relative;
      overflow-x: hidden;
    }
    .ambient-glow {
      position: absolute;
      top: 15%;
      left: 50%;
      transform: translateX(-50%);
      width: 320px;
      height: 320px;
      border-radius: 50%;
      background-color: rgba(124, 58, 237, 0.15);
      filter: blur(110px);
      pointer-events: none;
      z-index: 0;
    }
    header {
      display: flex;
      align-items: center;
      gap: 12px;
      z-index: 1;
      margin-top: 8px;
    }
    .logo-badge {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(124, 58, 237, 0.35);
      color: #ffffff;
      font-weight: 900;
      font-size: 18px;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.5px;
    }
    .brand-tagline {
      font-size: 12px;
      font-weight: 500;
      color: #a78bfa;
    }
    main {
      width: 100%;
      max-width: 440px;
      z-index: 1;
      margin: auto 0;
      padding: 20px 0;
    }
    .card {
      background-color: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 24px;
      padding: 24px;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7);
      text-align: center;
    }
    .thumbnail-wrapper {
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 9;
      border-radius: 16px;
      overflow: hidden;
      background-color: #181924;
      border: 1px solid rgba(255, 255, 255, 0.1);
      margin-bottom: 18px;
    }
    .thumbnail {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .thumbnail-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(10, 10, 12, 0.8) 0%, transparent 60%);
    }
    .song-title {
      font-size: 19px;
      font-weight: 700;
      line-height: 1.35;
      color: #ffffff;
      margin-bottom: 6px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .song-author {
      font-size: 14px;
      font-weight: 600;
      color: #a78bfa;
      margin-bottom: 20px;
    }
    .btn-primary {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 14px 20px;
      border-radius: 14px;
      background-color: #7c3aed;
      color: #ffffff;
      font-size: 15px;
      font-weight: 700;
      border: none;
      cursor: pointer;
      box-shadow: 0 8px 20px rgba(124, 58, 237, 0.35);
      transition: all 0.2s ease;
      text-decoration: none;
    }
    .btn-primary:hover {
      background-color: #8b5cf6;
      transform: translateY(-1px);
    }
    .store-section {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: none;
    }
    .store-section.visible {
      display: block;
    }
    .store-subtitle {
      font-size: 12px;
      color: #9ca3af;
      line-height: 1.5;
      margin-bottom: 14px;
    }
    .apk-button {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 14px 20px;
      border-radius: 14px;
      background-color: rgba(124, 58, 237, 0.18);
      border: 1.5px solid #7c3aed;
      color: #c4b5fd;
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      box-shadow: 0 4px 15px rgba(124, 58, 237, 0.2);
      transition: all 0.2s ease;
    }
    .apk-button:hover {
      background-color: rgba(124, 58, 237, 0.28);
      transform: translateY(-1px);
    }
    .retry-button {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px 16px;
      border-radius: 12px;
      background-color: transparent;
      border: none;
      color: #9ca3af;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: color 0.2s ease;
    }
    .retry-button:hover {
      color: #ffffff;
    }
    footer {
      font-size: 12px;
      color: #6b7280;
      text-align: center;
      margin-top: 16px;
      z-index: 1;
    }
  </style>
</head>
<body>
  <div class="ambient-glow"></div>

  <!-- Header Branding -->
  <header>
    <div class="logo-badge">G</div>
    <div>
      <h1 class="brand-title">GenMusic</h1>
      <p class="brand-tagline">Play smarter. Listen better.</p>
    </div>
  </header>

  <!-- Main Card -->
  <main>
    <div class="card">
      <div class="thumbnail-wrapper">
        <img src="${meta.thumbnailHQ}" alt="${meta.title}" class="thumbnail" loading="eager" />
        <div class="thumbnail-overlay"></div>
      </div>

      <h2 class="song-title">${meta.title}</h2>
      <p class="song-author">${meta.author}</p>

      <button onclick="openApp()" id="btn-open-app" class="btn-primary" type="button">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        <span>Open in GenMusic</span>
      </button>

      <!-- Fallback Section -->
      <div id="store-fallback" class="store-section">
        <p class="store-subtitle">
          GenMusic is distributed as a direct APK download for high-fidelity audio and offline listening.
        </p>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <a href="${apkUrl}" download="GenMusic.apk" class="apk-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Download APK (Direct)</span>
          </a>

          <button onclick="openApp()" type="button" class="retry-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            <span>Already have the app? Open it</span>
          </button>
        </div>
        <p style="font-size: 11px; color: #6b7280; margin-top: 12px; line-height: 1.4; text-align: center;">
          * Note: Sideloading requires allowing "Install unknown apps" for your browser when prompted on Android 8+.
        </p>
      </div>
    </div>
  </main>

  <footer>
    <p>© 2026 GenMusic. Free unlimited music & spatial audio.</p>
  </footer>

  <script>
    const ua = navigator.userAgent || '';
    const isAndroid = /android/i.test(ua);
    const isIOS = /iphone|ipad|ipod/i.test(ua);
    const isMobile = isAndroid || isIOS;

    const androidIntentUrl = '${androidIntentUrl}';
    const iosSchemeUrl = '${deepLinkUrl}';

    let appOpened = false;

    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden' || document.hidden) {
        appOpened = true;
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', function() { appOpened = true; });
    window.addEventListener('blur', function() { appOpened = true; });

    function showFallback() {
      const el = document.getElementById('store-fallback');
      if (el) el.classList.add('visible');
    }

    function openApp() {
      if (isAndroid) {
        window.location.href = androidIntentUrl;
      } else if (isIOS) {
        window.location.href = iosSchemeUrl;
      } else {
        showFallback();
      }
    }

    if (!isMobile) {
      // Desktop: skip straight to fallback
      showFallback();
    } else {
      // Mobile: attempt app launch on mount
      openApp();

      // Check after 1.5s if app opened via visibilitychange
      setTimeout(function() {
        if (!appOpened && document.visibilityState !== 'hidden') {
          showFallback();
        }
      }, 1500);
    }
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200');
  return res.send(html);
}

// Server-side dynamic share paths: /share/:id
app.get(['/share/:id', '/share/song/:id', '/share/:type/:id'], (req, res) => {
  const id = req.params.id || req.params.type || '';
  return handleShareRequest(req, res, id);
});

// Root API handler with fallback routing in case Vercel rewrites to /api
app.get(['/api', '/api/health'], (req, res) => {
  const origPath = (req.query.origPath as string) || '';
  if (origPath.startsWith('/share/')) {
    const rawShare = origPath.slice('/share/'.length).split('?')[0];
    const parts = rawShare.split('/').filter(Boolean);
    const id = parts[parts.length - 1] || '';
    if (id) {
      return handleShareRequest(req, res, id);
    }
  }
  if (origPath.startsWith('/api/share/')) {
    const rawShare = origPath.slice('/api/share/'.length).split('?')[0];
    const parts = rawShare.split('/').filter(Boolean);
    const id = parts[parts.length - 1] || '';
    return res.redirect(`/api/share/${encodeURIComponent(id)}`);
  }
  const id = (req.query.id as string) || (req.query.videoId as string) || (req.query.shareVideoId as string);
  if (id) {
    return handleShareRequest(req, res, id);
  }
  return res.json({ status: 'ok', service: 'GEN Music Share API', time: new Date().toISOString() });
});

// Helper to strip "v" prefix from version strings if needed
const cleanVersion = DOWNLOAD_LINKS.version.replace(/^v/, '');

// Dynamically serve app-version.json based on downloadLinks.ts
app.get('/app-version.json', (req, res) => {
  res.json({
    latest_version: cleanVersion,
    min_supported_version: '2.0.0',
    force_update: false,
    whats_new: [
      'Dolby Audio 3D spatial surround sound engine support',
      'Batch offline audio downloader',
      'Unified free music catalog integration'
    ],
    download_url: {
      android: DOWNLOAD_LINKS.android.downloadUrl,
      windows: DOWNLOAD_LINKS.windows.downloadUrl,
      macos: DOWNLOAD_LINKS.macos.downloadUrl
    }
  });
});

// Dynamically serve legacy version.json
app.get('/version.json', (req, res) => {
  res.json({
    android: {
      latestVersion: cleanVersion,
      minimumVersion: '2.0.0',
      downloadUrl: DOWNLOAD_LINKS.android.downloadUrl,
      fileSize: DOWNLOAD_LINKS.android.fileSize,
      releaseDate: DOWNLOAD_LINKS.releaseDate
    },
    windows: {
      latestVersion: cleanVersion,
      minimumVersion: '2.0.0',
      downloadUrl: DOWNLOAD_LINKS.windows.downloadUrl,
      fileSize: DOWNLOAD_LINKS.windows.fileSize,
      releaseDate: DOWNLOAD_LINKS.releaseDate
    },
    macos: {
      latestVersion: cleanVersion,
      minimumVersion: '2.0.0',
      downloadUrl: DOWNLOAD_LINKS.macos.downloadUrl,
      fileSize: DOWNLOAD_LINKS.macos.fileSize,
      releaseDate: DOWNLOAD_LINKS.releaseDate
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: cleanVersion });
});

// Sponsor dynamic redirect endpoint
// Redirects to homepage
app.all('/api/sponsor-click', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  return res.redirect(302, '/');
});

// Direct binary download endpoints with attachment headers to start downloads on same page
app.get(['/download/android', '/download/apk', '/download/GEN-Music.apk', '/download/genmusic.apk'], (req, res) => {
  res.setHeader('Content-Disposition', 'attachment; filename="GEN-Music.apk"');
  return res.redirect(302, DOWNLOAD_LINKS.android.downloadUrl);
});

app.get(['/download/android-car', '/download/car', '/download/GEN-Music-Car.apk', '/download/genmusic-car.apk'], (req, res) => {
  res.setHeader('Content-Disposition', 'attachment; filename="GEN-Music-Car.apk"');
  return res.redirect(302, DOWNLOAD_LINKS.androidCar.downloadUrl);
});

app.get(['/download/windows', '/download/win', '/download/Gen-Music.exe', '/download/genmusic.exe', '/download/genmusic-setup.exe'], (req, res) => {
  res.setHeader('Content-Disposition', 'attachment; filename="Gen-Music.exe"');
  return res.redirect(302, DOWNLOAD_LINKS.windows.downloadUrl);
});

app.get(['/download/macos', '/download/mac', '/download/Gen-Music.dmg', '/download/genmusic.dmg'], (req, res) => {
  res.setHeader('Content-Disposition', 'attachment; filename="Gen-Music.dmg"');
  return res.redirect(302, DOWNLOAD_LINKS.macos.downloadUrl);
});

// Explicit service worker routes for ad/monetization validation
const serviceWorkerContent = `self.options = {
    "domain": "3nbf4.com",
    "zoneId": 11835176
}
self.lary = ""
importScripts('https://3nbf4.com/act/files/service-worker.min.js?r=sw')`;

app.get(['/sw.js', '/service-worker.js'], (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.send(serviceWorkerContent);
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Development mode with Vite middleware (dynamically loaded only in dev)
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode serving static assets if dist directory exists
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Global Express error handling middleware to avoid any 500 lambda crashes
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Express runtime error:', err);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal Server Error', message: err?.message || String(err) });
  }
});

// Only boot the local server listener when running outside of Vercel
if (!process.env.VERCEL) {
  startServer();
}

export default app;
