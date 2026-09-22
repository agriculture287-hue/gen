import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { DOWNLOAD_LINKS } from './src/data/downloadLinks.ts';

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

// API endpoint to fetch song details
app.get('/api/song/:videoId', async (req, res) => {
  const { videoId } = req.params;
  if (!videoId || videoId.length < 5) {
    return res.status(400).json({ error: 'Invalid videoId' });
  }
  const song = await fetchSongMetadata(videoId);
  return res.json(song);
});

// API endpoint to post analytics
app.post('/api/analytics', (req, res) => {
  const { eventType, videoId, platform } = req.body;
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const referrer = req.headers['referer'] || 'Direct';
  const timestamp = new Date().toISOString();

  console.log(`[Analytics] [${timestamp}] Event: ${eventType}, Video: ${videoId}, Platform: ${platform}, Referrer: ${referrer}`);

  // Store in-memory
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

// Server-side SEO dynamic tag injection for share paths
app.get('/share/:videoId', async (req, res) => {
  const { videoId } = req.params;
  if (!videoId || videoId.length < 3) {
    return res.redirect('/');
  }

  let song: any = null;
  try {
    song = await fetchSongMetadata(videoId);
  } catch (err) {
    console.error('Failed to fetch song details:', err);
    return res.redirect('/');
  }

  try {
    let htmlPath = '';
    if (process.env.NODE_ENV !== 'production') {
      htmlPath = path.join(process.cwd(), 'index.html');
    } else {
      htmlPath = path.join(process.cwd(), 'dist', 'index.html');
    }

    if (fs.existsSync(htmlPath)) {
      let html = fs.readFileSync(htmlPath, 'utf8');

      // Inject dynamic titles and description tags
      html = html
        .replace(/<title>.*?<\/title>/gi, `<title>${song.title} • GEN MUSIC</title>`)
        .replace(
          /<meta name="description" content=".*?"/gi, 
          `<meta name="description" content="Listen to ${song.title} on GEN MUSIC. Experience immersive 3D spatial Dolby audio with offline downloads."`
        )
        // OG tags
        .replace(
          /<meta property="og:title" content=".*?"/gi, 
          `<meta property="og:title" content="${song.title} - ${song.artist}"`
        )
        .replace(
          /<meta property="og:description" content=".*?"/gi, 
          `<meta property="og:description" content="Listen to ${song.title} on GEN MUSIC. Experience immersive spatial 3D surround sound."`
        )
        .replace(
          /content="\/logo\.png"/gi,
          `content="${song.thumbnail}"`
        )
        .replace(
          /<meta property="og:image" content=".*?"/gi, 
          `<meta property="og:image" content="${song.thumbnail}"`
        )
        // Twitter tags
        .replace(
          /<meta name="twitter:title" content=".*?"/gi, 
          `<meta name="twitter:title" content="${song.title} - ${song.artist}"`
        )
        .replace(
          /<meta name="twitter:description" content=".*?"/gi, 
          `<meta name="twitter:description" content="Listen to ${song.title} on GEN MUSIC. Experience immersive spatial 3D surround sound."`
        )
        .replace(
          /<meta name="twitter:image" content=".*?"/gi, 
          `<meta name="twitter:image" content="${song.thumbnail}"`
        );

      res.setHeader('Content-Type', 'text/html');
      return res.send(html);
    }
  } catch (err) {
    console.error('Server-side SEO file injection failed, using dynamic UI layout:', err);
  }

  // File is missing or injection failed (extremely common in serverless Vercel environments).
  // Generate and serve a gorgeous, zero-dependency, brand-matching dynamic player page.
  try {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${song.title} • GEN MUSIC</title>
  <meta name="description" content="${song.description}">
  
  <!-- OpenGraph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="GEN MUSIC">
  <meta property="og:title" content="${song.title} - ${song.artist}">
  <meta property="og:description" content="Listen to ${song.title} on GEN MUSIC. Experience immersive 3D spatial Dolby audio with offline downloads.">
  <meta property="og:image" content="${song.thumbnail}">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${song.title} - ${song.artist}">
  <meta name="twitter:description" content="Listen to ${song.title} on GEN MUSIC. Experience immersive 3D spatial Dolby audio with offline downloads.">
  <meta name="twitter:image" content="${song.thumbnail}">

  <!-- Tailored Typography & Tailwind -->
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    h1, h2 { font-family: 'Outfit', sans-serif; }
  </style>
</head>
<body class="bg-[#030408] text-slate-100 min-h-screen flex flex-col justify-between selection:bg-cyan-400 selection:text-black relative overflow-x-hidden">
  
  <!-- Content -->
  <div class="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
    <!-- Blurry Ambient Cover Canvas -->
    <div class="absolute inset-0 z-0 bg-cover bg-center scale-110 opacity-20 blur-[80px]" style="background-image: url('${song.thumbnail}')"></div>
    
    <!-- Player Wrapper -->
    <div class="w-full max-w-md bg-white/[0.03] backdrop-blur-2xl border border-white/[0.06] rounded-2xl p-6 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.5)] relative z-10 flex flex-col items-center text-center">
      
      <!-- Brand Logo -->
      <div class="mb-6 flex items-center gap-2">
        <span class="text-xs tracking-[0.2em] font-extrabold uppercase bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">GEN MUSIC</span>
      </div>

      <!-- Rounded cover -->
      <div class="w-60 h-60 md:w-64 md:h-64 rounded-xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.4)] border border-white/[0.1] mb-6 relative group">
        <img src="${song.thumbnail}" class="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-500" alt="Cover Art">
      </div>

      <!-- Metadata Titles -->
      <h1 class="text-xl md:text-2xl font-bold tracking-tight text-white mb-2 line-clamp-1">${song.title}</h1>
      <p class="text-slate-400 font-medium text-sm md:text-base mb-6 line-clamp-1">${song.artist}</p>

      <!-- Primary Action -->
      <button onclick="triggerApp()" class="w-full py-3.5 px-6 rounded-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 transition-all duration-300 transform active:scale-95 shadow-[0_0_20px_rgba(34,211,238,0.2)] mb-4">
        Open in GEN Music
      </button>

      <!-- Direct Fallback Actions -->
      <div class="flex flex-col gap-2 mt-2 w-full">
        <a href="/download/android" class="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-wider py-2">
          Download Installer APK
        </a>
      </div>
    </div>
  </div>

  <footer class="text-center py-6 text-xs text-slate-600 relative z-10 font-medium">
    © ${new Date().getFullYear()} GEN MUSIC. Powered by in.gen.agrigence.
  </footer>

  <script>
    const isAndroid = /android/i.test(navigator.userAgent);
    const deepLinkUrl = isAndroid
      ? 'intent://play?videoId=${song.id}#Intent;scheme=in.gen.agrigence;package=in.gen.agrigence;end'
      : 'in.gen.agrigence://play?videoId=${song.id}';

    function triggerApp() {
      // Direct deep link triggering
      window.location.href = deepLinkUrl;
      
      // Track event locally
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'app_open_attempt',
          videoId: '${song.id}',
          platform: isAndroid ? 'Android' : 'Desktop'
        })
      }).catch(() => {});
    }

    // Auto launch 1 second after page load
    setTimeout(() => {
      triggerApp();
    }, 1000);
  </script>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  } catch (fallbackErr) {
    console.error('Completely failed to generate fallback page:', fallbackErr);
    return res.redirect('/');
  }
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
    // Development mode with Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode serving static assets
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
}

startServer();

export default app;
