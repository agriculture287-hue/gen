import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { DOWNLOAD_LINKS } from './src/data/downloadLinks.ts';
import { 
  searchYouTubeMusic, 
  getHomeFeed, 
  getUpNextQueue, 
  getLyrics, 
  getStreamInfo,
  getMoodsAndGenres,
  getChartsFeed,
  getArtistDetails,
  getAlbumDetails,
  recognizeSong,
  importPlaylist,
  CURATED_CATALOG
} from './server/innertubeService.ts';
import {
  COUNTRY_CATALOG,
  POPULAR_COUNTRIES,
  getCountryCatalog
} from './server/countryMusicCatalog.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper to strip "v" prefix from version strings if needed
const cleanVersion = DOWNLOAD_LINKS.version.replace(/^v/, '');

// --- IP & Geo Detection Helpers ---
function getClientIp(req: express.Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string') {
    return realIp.trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

const COUNTRY_NAMES: Record<string, { name: string; flag: string }> = {
  IN: { name: 'India', flag: '🇮🇳' },
  US: { name: 'United States', flag: '🇺🇸' },
  GB: { name: 'United Kingdom', flag: '🇬🇧' },
  BR: { name: 'Brazil', flag: '🇧🇷' },
  MX: { name: 'Mexico', flag: '🇲🇽' },
  NG: { name: 'Nigeria', flag: '🇳🇬' },
  JP: { name: 'Japan', flag: '🇯🇵' },
  KR: { name: 'South Korea', flag: '🇰🇷' },
  DE: { name: 'Germany', flag: '🇩🇪' },
  FR: { name: 'France', flag: '🇫🇷' },
  PH: { name: 'Philippines', flag: '🇵🇭' },
  ID: { name: 'Indonesia', flag: '🇮🇩' },
  CA: { name: 'Canada', flag: '🇨🇦' },
  AU: { name: 'Australia', flag: '🇦🇺' },
  ES: { name: 'Spain', flag: '🇪🇸' },
  IT: { name: 'Italy', flag: '🇮🇹' },
  RU: { name: 'Russia', flag: '🇷🇺' },
  PK: { name: 'Pakistan', flag: '🇵🇰' },
  BD: { name: 'Bangladesh', flag: '🇧🇩' },
  EG: { name: 'Egypt', flag: '🇪🇬' },
  SA: { name: 'Saudi Arabia', flag: '🇸🇦' },
  AE: { name: 'United Arab Emirates', flag: '🇦🇪' },
  ZA: { name: 'South Africa', flag: '🇿🇦' },
  AR: { name: 'Argentina', flag: '🇦🇷' },
  CO: { name: 'Colombia', flag: '🇨🇴' },
  TR: { name: 'Turkey', flag: '🇹🇷' },
  VN: { name: 'Vietnam', flag: '🇻🇳' },
  TH: { name: 'Thailand', flag: '🇹🇭' },
  MY: { name: 'Malaysia', flag: '🇲🇾' },
  SG: { name: 'Singapore', flag: '🇸🇬' },
  NL: { name: 'Netherlands', flag: '🇳🇱' },
  SE: { name: 'Sweden', flag: '🇸🇪' },
};

async function detectCountryFromReq(req: express.Request): Promise<{ ip: string; countryCode: string; countryName: string; flag: string }> {
  const cfCountry = req.headers['cf-ipcountry'] as string | undefined;
  const gcpCountry = req.headers['x-appengine-country'] as string | undefined;
  const xCountry = req.headers['x-country-code'] as string | undefined;
  const directCode = (cfCountry || gcpCountry || xCountry || '').toUpperCase();

  const ip = getClientIp(req);

  if (directCode && directCode !== 'XX' && directCode.length === 2) {
    const info = COUNTRY_NAMES[directCode] || { name: directCode, flag: '🌐' };
    return {
      ip,
      countryCode: directCode,
      countryName: info.name,
      flag: info.flag
    };
  }

  // Check if IP is public
  const isPrivate = /^(127\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.|::1|fc00:|fe80:)/.test(ip);
  if (!isPrivate && ip) {
    try {
      const res = await fetch(`https://api.country.is/${ip}`, { signal: AbortSignal.timeout(1800) });
      if (res.ok) {
        const data: any = await res.json();
        const code = (data.country || '').toUpperCase();
        if (code && code.length === 2) {
          const info = COUNTRY_NAMES[code] || { name: code, flag: '🌐' };
          return {
            ip,
            countryCode: code,
            countryName: info.name,
            flag: info.flag
          };
        }
      }
    } catch {
      // Fallback silently
    }
  }

  return {
    ip: ip || '127.0.0.1',
    countryCode: 'US',
    countryName: 'United States',
    flag: '🇺🇸'
  };
}

// --- Gen Music Innertube & Audio REST API (Echo Music GPL-3.0 Fork) ---

// 0. Live IP & Country Geolocation
app.get('/api/geo', async (req, res) => {
  try {
    const geo = await detectCountryFromReq(req);
    res.json({
      success: true,
      ...geo
    });
  } catch (err: any) {
    res.json({
      success: true,
      ip: '127.0.0.1',
      countryCode: 'US',
      countryName: 'United States',
      flag: '🇺🇸'
    });
  }
});

// 0.1 Country-Specific Music & Charts API (IP-based or by country parameter)
app.get('/api/country-music', async (req, res) => {
  try {
    let countryCode = typeof req.query.country === 'string' ? req.query.country.toUpperCase() : '';
    let detectedGeo: { ip: string; countryCode: string; countryName: string; flag: string };

    if (!countryCode || countryCode === 'AUTO') {
      detectedGeo = await detectCountryFromReq(req);
      countryCode = detectedGeo.countryCode;
    } else {
      const ip = getClientIp(req);
      const info = COUNTRY_NAMES[countryCode] || { name: countryCode, flag: '🌐' };
      detectedGeo = {
        ip,
        countryCode,
        countryName: info.name,
        flag: info.flag
      };
    }

    const catalog = getCountryCatalog(countryCode);
    const countryName = COUNTRY_NAMES[countryCode]?.name || catalog.countryName;
    const flag = COUNTRY_NAMES[countryCode]?.flag || catalog.flag;

    res.json({
      success: true,
      countryCode,
      countryName,
      flag,
      ip: detectedGeo.ip,
      genre: catalog.genre,
      description: catalog.description,
      tracks: catalog.tracks,
      availableCountries: POPULAR_COUNTRIES
    });
  } catch (err: any) {
    console.error('API /api/country-music error:', err);
    const fallback = getCountryCatalog('US');
    res.json({
      success: true,
      countryCode: 'US',
      countryName: 'United States',
      flag: '🇺🇸',
      genre: fallback.genre,
      description: fallback.description,
      tracks: fallback.tracks,
      availableCountries: POPULAR_COUNTRIES
    });
  }
});

// 1. Search YouTube Music
app.get('/api/search', async (req, res) => {
  try {
    const query = typeof req.query.q === 'string' ? req.query.q : '';
    const filter = typeof req.query.filter === 'string' ? req.query.filter : undefined;
    const results = await searchYouTubeMusic(query, filter);
    res.json({
      success: true,
      query,
      count: results.length,
      results
    });
  } catch (err: any) {
    console.error('API /api/search error:', err);
    res.status(500).json({ success: false, error: err.message, results: CURATED_CATALOG });
  }
});

// 2. Curated Home Feed (Trending, Charts, Quick Picks, New Releases)
app.get('/api/home', async (_req, res) => {
  try {
    const sections = await getHomeFeed();
    res.json({
      success: true,
      sections
    });
  } catch (err: any) {
    console.error('API /api/home error:', err);
    res.status(500).json({ success: false, error: err.message, sections: [] });
  }
});

// 3. Up Next Queue & Radio Recommendations
app.get('/api/queue/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const title = typeof req.query.title === 'string' ? req.query.title : undefined;
    const artist = typeof req.query.artist === 'string' ? req.query.artist : undefined;
    const tracks = await getUpNextQueue(id, title, artist);
    res.json({
      success: true,
      videoId: id,
      count: tracks.length,
      tracks
    });
  } catch (err: any) {
    console.error('API /api/queue error:', err);
    res.status(500).json({ success: false, error: err.message, tracks: CURATED_CATALOG });
  }
});

// 4. Synchronized & Plain Lyrics (LRCLIB + YTM)
app.get('/api/lyrics/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const title = typeof req.query.title === 'string' ? req.query.title : undefined;
    const artist = typeof req.query.artist === 'string' ? req.query.artist : undefined;
    const duration = req.query.duration ? parseFloat(req.query.duration as string) : undefined;
    const lyrics = await getLyrics(id, title, artist, duration);
    res.json({
      success: true,
      ...lyrics
    });
  } catch (err: any) {
    console.error('API /api/lyrics error:', err);
    res.status(500).json({
      success: false,
      id: req.params.id,
      title: req.query.title || 'Unknown',
      artist: req.query.artist || 'Unknown',
      synced: false,
      lines: [],
      plainText: 'Lyrics unavailable.',
      provider: 'None'
    });
  }
});

// 5. Stream Information & Direct Audio Resolution
app.get('/api/stream/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const streamInfo = getStreamInfo(id);
    res.json({
      success: true,
      ...streamInfo
    });
  } catch (err: any) {
    console.error('API /api/stream error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Moods & Genres Catalog (24 categories from Echo Music)
app.get('/api/moods-genres', async (_req, res) => {
  try {
    const categories = await getMoodsAndGenres();
    res.json({
      success: true,
      categories
    });
  } catch (err: any) {
    console.error('API /api/moods-genres error:', err);
    res.status(500).json({ success: false, error: err.message, categories: [] });
  }
});

// 7. Global Charts (Top 50, Viral Hits, Trending)
app.get('/api/charts', async (_req, res) => {
  try {
    const charts = await getChartsFeed();
    res.json({
      success: true,
      ...charts
    });
  } catch (err: any) {
    console.error('API /api/charts error:', err);
    res.status(500).json({ success: false, error: err.message, top50: CURATED_CATALOG });
  }
});

// 8. Artist Profile & Discography
app.get('/api/artist', async (req, res) => {
  try {
    const name = typeof req.query.name === 'string' ? req.query.name : 'Ed Sheeran';
    const artist = await getArtistDetails(name);
    res.json({
      success: true,
      ...artist
    });
  } catch (err: any) {
    console.error('API /api/artist error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Album Details & Tracklist
app.get('/api/album', async (req, res) => {
  try {
    const title = typeof req.query.title === 'string' ? req.query.title : '';
    const artist = typeof req.query.artist === 'string' ? req.query.artist : '';
    const album = await getAlbumDetails(title, artist);
    res.json({
      success: true,
      ...album
    });
  } catch (err: any) {
    console.error('API /api/album error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. Echo Find - Audio Recognition (ShazamKit / Vibra Engine)
app.post('/api/recognize', async (req, res) => {
  try {
    const { query } = req.body || {};
    const result = await recognizeSong(query);
    res.json({
      success: true,
      ...result
    });
  } catch (err: any) {
    console.error('API /api/recognize error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 11. Spotify, YouTube & M3U Playlist Importer
app.post('/api/import-playlist', async (req, res) => {
  try {
    const { urlOrData } = req.body || {};
    if (!urlOrData) {
      return res.status(400).json({ success: false, error: 'URL or playlist data required' });
    }
    const playlist = await importPlaylist(urlOrData);
    res.json({
      success: true,
      playlist
    });
  } catch (err: any) {
    console.error('API /api/import-playlist error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 12. GPL-3.0 Licensing & Upstream Echo Music Credits
app.get('/api/credits', (_req, res) => {
  res.json({
    name: 'Gen Music',
    license: 'GPL-3.0',
    upstream: {
      name: 'Echo Music',
      url: 'https://github.com/EchoMusicApp/Echo-Music',
      license: 'GPL-3.0',
      description: 'Beautiful, feature-rich Android client for YouTube Music'
    },
    credits: [
      { name: 'Echo Music', role: 'Original Upstream Architecture & Innertube logic', url: 'https://github.com/EchoMusicApp/Echo-Music' },
      { name: 'Metrolist', role: 'Inspiration & UI paradigms', url: 'https://github.com/MetrolistApp/Metrolist' },
      { name: 'SimpMusic', role: 'Innertube research & streaming mechanisms', url: 'https://github.com/brahmkshatriya/SimpMusic' },
      { name: 'LRCLIB', role: 'Synchronized & plain-text lyrics API', url: 'https://lrclib.net' },
      { name: 'Better Lyrics', role: 'Lyrics synchronization references' }
    ]
  });
});


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

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
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
      // Do not serve index.html for missing API endpoints or specific asset extensions
      if (req.path.startsWith('/api/') || req.path.startsWith('/assets/') || (req.path.includes('.') && !req.path.endsWith('.html'))) {
        return res.status(404).send('Resource not found');
      }
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(500).send('Application build in progress. Please refresh in a moment.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer();

export default app;
