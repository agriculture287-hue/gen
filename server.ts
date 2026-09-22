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

// Vercel Serverless Function Specification: /api/share/:id (Zero external fetching, instant response)
app.get(['/api/share/:id', '/api/share/song/:id', '/api/share/:type/:id'], (req, res) => {
  const id = req.params.id || req.params.type || '';
  const cleanId = encodeURIComponent(id);
  const deepLink = `genmusic://play?id=${cleanId}`;

  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200');
  return res.json({
    success: true,
    id: cleanId,
    deepLink,
    message: 'This content was shared using GEN Music. Open the app to start listening.'
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

function handleShareRequest(req: any, res: any, rawId: string) {
  const cleanId = encodeURIComponent(rawId || '');
  const deepLinkUrl = `genmusic://play?id=${cleanId}`;
  const androidIntentUrl = `intent://play?id=${cleanId}#Intent;scheme=genmusic;package=in.gen.agrigence;end`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Open in GEN Music</title>
  <meta name="description" content="This content was shared using GEN Music.">
  
  <!-- OpenGraph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="GEN Music">
  <meta property="og:title" content="Open in GEN Music">
  <meta property="og:description" content="This content was shared using GEN Music. Open the app to start listening.">
  <meta property="og:image" content="https://genmusics.vercel.app/logo.png">
  <meta property="og:url" content="https://genmusics.vercel.app/share/${cleanId}">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="Open in GEN Music">
  <meta name="twitter:description" content="This content was shared using GEN Music.">
  <meta name="twitter:image" content="https://genmusics.vercel.app/logo.png">

  <!-- Theme Color -->
  <meta name="theme-color" content="#0A0A0A">

  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #0A0A0A; }
    @keyframes barBounce1 { 0%, 100% { height: 16px; } 50% { height: 32px; } }
    @keyframes barBounce2 { 0%, 100% { height: 28px; } 50% { height: 10px; } }
    @keyframes barBounce3 { 0%, 100% { height: 12px; } 50% { height: 26px; } }
    @keyframes barBounce4 { 0%, 100% { height: 24px; } 50% { height: 14px; } }
    @keyframes barBounce5 { 0%, 100% { height: 18px; } 50% { height: 30px; } }
    .bar-1 { animation: barBounce1 0.8s ease-in-out infinite; }
    .bar-2 { animation: barBounce2 0.7s ease-in-out infinite 0.1s; }
    .bar-3 { animation: barBounce3 0.9s ease-in-out infinite 0.2s; }
    .bar-4 { animation: barBounce4 0.6s ease-in-out infinite 0.15s; }
    .bar-5 { animation: barBounce5 0.75s ease-in-out infinite 0.05s; }
  </style>
</head>
<body class="bg-[#0A0A0A] text-slate-100 min-h-screen flex flex-col justify-between items-center px-4 py-8 selection:bg-[#00E676] selection:text-black relative overflow-x-hidden">
  
  <!-- Subtle Ambient Glows -->
  <div class="fixed top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#00E676]/10 rounded-full blur-[140px] pointer-events-none"></div>
  <div class="fixed bottom-10 right-1/4 w-72 h-72 bg-[#1DB954]/10 rounded-full blur-[120px] pointer-events-none"></div>

  <!-- Header Branding -->
  <header class="w-full max-w-md flex flex-col items-center gap-2 pt-2 z-10">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E676] to-[#1DB954] flex items-center justify-center text-black font-black text-sm shadow-lg shadow-[#00E676]/20">
        G
      </div>
      <div class="text-left">
        <h1 class="font-extrabold tracking-wider text-xl text-white">GEN Music</h1>
        <p class="text-xs text-[#00E676] font-medium tracking-wide">Your music is waiting.</p>
      </div>
    </div>
  </header>

  <!-- Main Card -->
  <main class="w-full max-w-md my-auto py-6 z-10 flex flex-col items-center">
    <div class="w-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.8)] text-center flex flex-col items-center">
      
      <!-- Animated Equalizer Graphic -->
      <div class="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00E676]/20 to-[#1DB954]/10 border border-[#00E676]/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,230,118,0.2)]">
        <div class="flex items-end justify-center gap-1 h-8">
          <span class="w-1.5 bg-[#00E676] rounded-full bar-1"></span>
          <span class="w-1.5 bg-[#00E676] rounded-full bar-2"></span>
          <span class="w-1.5 bg-[#00E676] rounded-full bar-3"></span>
          <span class="w-1.5 bg-[#00E676] rounded-full bar-4"></span>
          <span class="w-1.5 bg-[#00E676] rounded-full bar-5"></span>
        </div>
      </div>

      <!-- Main Message -->
      <h2 class="text-2xl font-black text-white tracking-tight mb-2">
        Open in GEN Music
      </h2>
      <p class="text-sm text-slate-300 leading-relaxed mb-6 max-w-xs">
        This content was shared using GEN Music. Open the app to start listening.
      </p>

      <!-- Action Buttons -->
      <div class="w-full space-y-3">
        <!-- Primary Button -->
        <button onclick="launchApp()" id="btn-open-gen-music" class="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#00E676] to-[#1DB954] text-black font-extrabold text-sm hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-[#00E676]/25 cursor-pointer">
          <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          <span>Open GEN Music</span>
        </button>

        <!-- Secondary Button -->
        <a href="https://genmusics.vercel.app/download" onclick="trackEvent('download_clicks')" id="btn-download-gen-music" class="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-white/[0.05] hover:bg-white/10 text-slate-200 border border-white/10 font-semibold text-sm transition-all">
          <svg class="w-4 h-4 text-[#00E676]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          <span>Download GEN Music</span>
        </a>
      </div>

      <!-- Install Card (revealed if app does not open) -->
      <div id="install-card" class="hidden w-full mt-6 pt-6 border-t border-white/10 text-left transition-all duration-300">
        <div class="flex items-center gap-2 mb-3">
          <svg class="w-4 h-4 text-[#00E676]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
          <h3 class="text-base font-bold text-white">Get GEN Music</h3>
        </div>

        <div class="grid grid-cols-2 gap-2.5 mb-5">
          <div class="flex items-center gap-2 text-xs text-slate-300">
            <div class="w-4 h-4 rounded-full bg-[#00E676]/15 flex items-center justify-center text-[#00E676] shrink-0">✓</div>
            <span>Play Music</span>
          </div>
          <div class="flex items-center gap-2 text-xs text-slate-300">
            <div class="w-4 h-4 rounded-full bg-[#00E676]/15 flex items-center justify-center text-[#00E676] shrink-0">✓</div>
            <span>Offline Playback</span>
          </div>
          <div class="flex items-center gap-2 text-xs text-slate-300">
            <div class="w-4 h-4 rounded-full bg-[#00E676]/15 flex items-center justify-center text-[#00E676] shrink-0">✓</div>
            <span>Lyrics Support</span>
          </div>
          <div class="flex items-center gap-2 text-xs text-slate-300">
            <div class="w-4 h-4 rounded-full bg-[#00E676]/15 flex items-center justify-center text-[#00E676] shrink-0">✓</div>
            <span>Playlist Sync</span>
          </div>
          <div class="flex items-center gap-2 text-xs text-slate-300">
            <div class="w-4 h-4 rounded-full bg-[#00E676]/15 flex items-center justify-center text-[#00E676] shrink-0">✓</div>
            <span>Smart Recommendations</span>
          </div>
          <div class="flex items-center gap-2 text-xs text-slate-300">
            <div class="w-4 h-4 rounded-full bg-[#00E676]/15 flex items-center justify-center text-[#00E676] shrink-0">✓</div>
            <span>Fast Streaming</span>
          </div>
        </div>

        <a href="https://genmusics.vercel.app/download" onclick="trackEvent('download_clicks')" class="w-full py-3 px-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-[#00E676]/30 text-[#00E676] font-bold text-xs flex items-center justify-center gap-2 transition-all">
          <span>Download Now</span>
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </a>
      </div>

    </div>
  </main>

  <!-- Footer -->
  <footer class="w-full max-w-md text-center text-xs text-slate-600 z-10">
    <p>© 2026 GEN Music. Play smarter. Listen better.</p>
  </footer>

  <script>
    const isAndroid = /android/i.test(navigator.userAgent);
    const deepLinkUrl = '${deepLinkUrl}';
    const androidIntentUrl = '${androidIntentUrl}';
    const targetUrl = isAndroid ? androidIntentUrl : deepLinkUrl;

    function trackEvent(eventType) {
      try {
        const payload = JSON.stringify({
          eventType: eventType,
          id: '${cleanId}',
          timestamp: new Date().toISOString()
        });
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/analytics', payload);
        } else {
          fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true
          }).catch(() => {});
        }
      } catch(e) {}
    }

    function showInstallOptions() {
      const card = document.getElementById('install-card');
      if (card) {
        card.classList.remove('hidden');
      }
    }

    function launchApp() {
      trackEvent('app_launch_attempts');
      window.location.href = targetUrl;

      // If user remains on page after 1.5s, reveal install card
      setTimeout(() => {
        showInstallOptions();
      }, 1500);
    }

    // 1. Track share page open
    trackEvent('share_page_opens');

    // 2. On page load: Wait 1 second, then attempt deep link
    setTimeout(() => {
      launchApp();
    }, 1000);
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
