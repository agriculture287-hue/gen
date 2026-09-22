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
  videoId: string;
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

// Vercel Serverless Function Specification: /api/share/:videoId
app.get(['/api/share/:videoId', '/api/share/song/:videoId'], async (req, res) => {
  const { videoId } = req.params;
  if (!videoId || !isValidContentId(videoId)) {
    return res.status(400).json({ success: false, error: 'Invalid videoId provided', videoId });
  }

  const metadata = await fetchShareMetadata(videoId, 'song');
  if (!metadata) {
    return res.status(404).json({ success: false, error: 'Content Not Available', videoId });
  }

  res.setHeader('Cache-Control', `public, max-age=${cacheDuration}, s-maxage=${cacheDuration}, stale-while-revalidate=43200`);
  return res.json({
    success: true,
    videoId: metadata.videoId,
    title: metadata.title,
    artist: metadata.artist,
    thumbnail: metadata.thumbnail,
    duration: metadata.duration,
    description: metadata.description,
    sourceUrl: metadata.sourceUrl,
    deepLink: metadata.deepLink
  });
});

// Future compatible API endpoint: /api/share/:type/:id
app.get('/api/share/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  const validType = (['song', 'album', 'playlist', 'artist'].includes(type) ? type : 'song') as any;
  if (!id || !isValidContentId(id)) {
    return res.status(400).json({ success: false, error: 'Invalid content ID provided', id });
  }

  const metadata = await fetchShareMetadata(id, validType);
  if (!metadata) {
    return res.status(404).json({ success: false, error: 'Content Not Available', type, id });
  }

  res.setHeader('Cache-Control', `public, max-age=${cacheDuration}, s-maxage=${cacheDuration}, stale-while-revalidate=43200`);
  return res.json({
    success: true,
    videoId: metadata.videoId,
    type: metadata.type,
    title: metadata.title,
    artist: metadata.artist,
    thumbnail: metadata.thumbnail,
    duration: metadata.duration,
    description: metadata.description,
    sourceUrl: metadata.sourceUrl,
    deepLink: metadata.deepLink
  });
});

// API endpoint to post analytics
app.post('/api/analytics', (req, res) => {
  const { eventType, videoId, platform } = req.body;
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const referrer = req.headers['referer'] || 'Direct';
  const timestamp = new Date().toISOString();

  console.log(`[Analytics] [${timestamp}] Event: ${eventType}, Video: ${videoId}, Platform: ${platform}, Referrer: ${referrer}`);

  analyticsBuffer.push({
    timestamp,
    eventType,
    videoId,
    platform,
    userAgent,
    referrer
  });

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

async function handleShareRequest(req: any, res: any, id: string, type: 'song' | 'album' | 'playlist' | 'artist' = 'song') {
  if (!id || id.length < 3) {
    return res.redirect('/');
  }

  const song = await fetchShareMetadata(id, type);

  // If content is not available, render the branding-compliant Error Page
  if (!song) {
    const errorHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Content Not Available • GEN Music</title>
  <meta name="description" content="This content is not available on GEN Music.">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
</head>
<body class="bg-[#030408] text-slate-100 min-h-screen flex items-center justify-center p-6">
  <div class="max-w-md w-full text-center bg-white/[0.04] border border-white/[0.08] backdrop-blur-2xl rounded-3xl p-8 shadow-2xl">
    <div class="flex items-center justify-center gap-2.5 mb-6">
      <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-black font-black text-sm">G</div>
      <span class="font-extrabold tracking-wider text-lg text-white">GEN Music</span>
    </div>
    <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mb-4">
      <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
    </div>
    <h1 class="text-2xl font-bold text-white tracking-tight mb-2">Content Not Available</h1>
    <p class="text-slate-400 text-sm leading-relaxed mb-8">This track could not be loaded or may have been removed. Return home to discover and stream unlimited music with Dolby Spatial Audio.</p>
    <a href="/" class="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold text-sm hover:brightness-110 active:scale-98 transition shadow-lg shadow-cyan-500/20">
      Home
    </a>
  </div>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html');
    return res.status(404).send(errorHtml);
  }

  // Fast, self-contained dynamic player page (optimized for Vercel Serverless Function & instant preview)
  try {
    const title = `${song.title} • GEN Music`;
    const description = `Listen to ${song.title} on GEN Music.`;
    const androidIntentUri = buildAndroidIntentUri(song.videoId, type);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${title}</title>
  <meta name="description" content="${description}">
  
  <!-- OpenGraph / Facebook -->
  <meta property="og:type" content="music.song">
  <meta property="og:site_name" content="GEN Music">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${song.thumbnail}">
  <meta property="og:url" content="https://genmusics.vercel.app/share/${song.videoId}">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${song.thumbnail}">

  <!-- Tailored Typography & Tailwind -->
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
  </style>
</head>
<body class="bg-[#030408] text-slate-100 min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-cyan-500 selection:text-black relative overflow-x-hidden">
  
  <!-- Thumbnail-based Blur Background -->
  <div class="fixed inset-0 bg-cover bg-center opacity-25 filter blur-3xl scale-110 transform-gpu pointer-events-none" style="background-image: url('${song.thumbnail}')"></div>
  <div class="fixed inset-0 bg-gradient-to-b from-[#030408]/80 via-[#030408]/90 to-[#030408] pointer-events-none"></div>

  <!-- Main Glassmorphism Card -->
  <div class="relative z-10 max-w-md w-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.85)] flex flex-col items-center text-center">
    
    <!-- Branding Header -->
    <div class="flex items-center gap-2.5 mb-6">
      <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-black font-black text-xs shadow-md shadow-cyan-500/20">
        G
      </div>
      <div class="text-left">
        <div class="font-extrabold tracking-wider text-base text-white">GEN Music</div>
        <div class="text-[10px] text-cyan-400 font-medium tracking-wide">Play smarter. Listen better.</div>
      </div>
    </div>

    <!-- Thumbnail with Duration -->
    <div class="relative w-full aspect-square max-w-[280px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 mb-6 group">
      <img src="${song.thumbnail}" alt="${song.title}" class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" referrerpolicy="no-referrer">
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80"></div>
      <div class="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-xs font-mono text-cyan-300 border border-white/10">
        ${song.duration}
      </div>
    </div>

    <!-- Song Details -->
    <h1 class="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug line-clamp-2 mb-1.5 px-2">
      ${song.title}
    </h1>
    <p class="text-sm sm:text-base font-semibold text-cyan-400/95 mb-2">
      ${song.artist}
    </p>
    <p class="text-xs text-slate-400 line-clamp-2 max-w-xs mb-6">
      ${song.description}
    </p>

    <!-- Buttons -->
    <div class="w-full space-y-3">
      <!-- 1: Open in GEN Music -->
      <button onclick="launchApp()" id="btn-open-app" class="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 text-black font-extrabold text-sm hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-cyan-500/25 cursor-pointer">
        <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        Open in GEN Music
      </button>

      <!-- 2: Download GEN Music -->
      <a href="https://genmusics.vercel.app/download" id="btn-download-app" class="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-semibold text-sm bg-white/[0.06] hover:bg-white/10 text-slate-200 border border-white/10 transition-all">
        <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
        Download GEN Music
      </a>

      <!-- 3: Open Original Source -->
      ${song.sourceUrl ? `
      <a href="${song.sourceUrl}" target="_blank" rel="noopener noreferrer" class="w-full flex items-center justify-center gap-2 py-2 px-4 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors">
        <span>Open Original Source</span>
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
      </a>` : ''}
    </div>

    <!-- Fallback install box if user remains on page -->
    <div id="install-options-banner" class="hidden mt-5 p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-left w-full transition-all">
      <div class="flex items-start gap-2.5 mb-2">
        <svg class="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
        <div class="text-xs text-slate-300 leading-relaxed">
          <span class="font-semibold text-white">App not installed yet?</span> Download GEN Music for Android, macOS, or Windows for Dolby 3D audio and offline downloads.
        </div>
      </div>
      <div class="flex gap-4 text-[11px] text-cyan-400 pt-1 border-t border-white/5 font-medium">
        <span>✓ Free Unlimited</span>
        <span>✓ 320kbps MP3</span>
        <span>✓ Zero Ads</span>
      </div>
    </div>

  </div>

  <footer class="relative z-10 mt-6 text-center text-xs text-slate-500">
    <p>© 2026 GEN Music. Play smarter. Listen better.</p>
  </footer>

  <script>
    const isAndroid = /android/i.test(navigator.userAgent);
    const deepLinkUrl = '${song.deepLink}';
    const androidIntentUrl = '${androidIntentUri}';
    const launchTarget = isAndroid ? androidIntentUrl : deepLinkUrl;

    function trackEvent(eventType) {
      try {
        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: eventType,
            videoId: '${song.videoId}',
            platform: isAndroid ? 'Android' : 'Web'
          })
        }).catch(() => {});
      } catch(e) {}
    }

    function launchApp() {
      trackEvent('app_launch_attempt');
      window.location.href = launchTarget;

      setTimeout(() => {
        showInstallOptions();
      }, 1200);
    }

    function showInstallOptions() {
      const banner = document.getElementById('install-options-banner');
      if (banner) {
        banner.classList.remove('hidden');
      }
      const downloadBtn = document.getElementById('btn-download-app');
      if (downloadBtn) {
        downloadBtn.classList.remove('bg-white/[0.06]');
        downloadBtn.classList.add('bg-white/15', 'border-cyan-400/40', 'shadow-lg', 'shadow-cyan-500/10');
      }
    }

    trackEvent('page_view');
    trackEvent('share_open');

    // On page load: Wait 1 second, then attempt deep link
    setTimeout(() => {
      launchApp();
    }, 1000);
  </script>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', `public, max-age=${cacheDuration}, s-maxage=${cacheDuration}, stale-while-revalidate=43200`);
    return res.send(html);
  } catch (fallbackErr) {
    console.error('Completely failed to generate share page:', fallbackErr);
    return res.redirect('/');
  }
}

// Server-side SEO dynamic tag injection for share paths
app.get(['/share/:videoId', '/share/song/:videoId'], (req, res) => {
  return handleShareRequest(req, res, req.params.videoId, 'song');
});

// Future-compatible share paths: /share/:type/:id
app.get('/share/:type/:id', (req, res) => {
  const { type, id } = req.params;
  const validType = (['song', 'album', 'playlist', 'artist'].includes(type) ? type : 'song') as any;
  return handleShareRequest(req, res, id, validType);
});

// Root API handler with fallback routing in case Vercel rewrites to /api
app.get(['/api', '/api/health'], (req, res) => {
  const origPath = (req.query.origPath as string) || '';
  if (origPath.startsWith('/share/')) {
    const rawShare = origPath.slice('/share/'.length).split('?')[0];
    const parts = rawShare.split('/').filter(Boolean);
    if (parts.length >= 2 && ['song', 'album', 'playlist', 'artist'].includes(parts[0])) {
      return handleShareRequest(req, res, parts[1], parts[0] as any);
    } else if (parts.length >= 1) {
      return handleShareRequest(req, res, parts[0], 'song');
    }
  }
  if (origPath.startsWith('/api/share/')) {
    const rawShare = origPath.slice('/api/share/'.length).split('?')[0];
    const parts = rawShare.split('/').filter(Boolean);
    const videoId = parts[parts.length - 1];
    if (videoId) {
      return res.redirect(`/api/share/${videoId}`);
    }
  }
  const videoId = (req.query.videoId as string) || (req.query.shareVideoId as string);
  if (videoId) {
    return handleShareRequest(req, res, videoId, 'song');
  }
  return res.json({ status: 'ok', service: 'GEN Music API', time: new Date().toISOString() });
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
