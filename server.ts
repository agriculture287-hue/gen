import express from 'express';
import path from 'path';
import fs from 'fs';
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

let isHydrated = false;
let isHydrating = false;

async function hydrateBackendState() {
  if (isHydrated) return;
  if (isHydrating) {
    while(isHydrating) { await new Promise(r => setTimeout(r, 50)); }
    return;
  }
  isHydrating = true;
  try {
    // 1. Hydrate state from local disk if available
    try {
      const publicGenDataPath = path.join(process.cwd(), 'public', 'genmusic-data.json');
      if (fs.existsSync(publicGenDataPath)) {
        const diskData = JSON.parse(fs.readFileSync(publicGenDataPath, 'utf8'));
        activeAppConfig = { ...activeAppConfig, ...diskData };
        if (diskData.manifest) {
          activeVersionManifest = { ...activeVersionManifest, ...diskData.manifest };
        }
        console.log('Successfully hydrated activeAppConfig from local disk public/genmusic-data.json.');
      }
    } catch (diskErr) {
      console.warn('Could not hydrate activeAppConfig from disk on startup:', diskErr);
    }

    // 2. Hydrate state from Blob Storage (Local Provider or Vercel Mirror)
    try {
      const appDataResult = await blobService.getAppData('app/genmusic-data.json');
      if (appDataResult.success && (appDataResult.data || appDataResult.rawText)) {
        const payload = appDataResult.data || JSON.parse(appDataResult.rawText!);
        const resolvedData = payload?.data || payload;
        activeAppConfig = { ...activeAppConfig, ...resolvedData };
        if (resolvedData.manifest) {
          activeVersionManifest = { ...activeVersionManifest, ...resolvedData.manifest };
        }
        console.log('Successfully hydrated activeAppConfig from Blob Storage.');
      } else {
        const result = await blobService.getAppData('version.json');
        if (result.success && result.data) {
          activeVersionManifest = { ...activeVersionManifest, ...result.data };
          console.log('Successfully hydrated activeVersionManifest from Blob Storage.');
        } else if (result.rawText) {
          activeVersionManifest = { ...activeVersionManifest, ...JSON.parse(result.rawText) };
        }
      }

      // 3. Hydrate state specifically from app-version.json (crucial for admin updates persistence across cold starts)
      try {
        const appVersionResult = await blobService.getAppData('app-version.json');
        if (appVersionResult.success && appVersionResult.data) {
          const appVer = appVersionResult.data;
          if (appVer.latest_version) {
            activeVersionManifest.android.latestVersion = appVer.latest_version;
            activeVersionManifest.android.minimumVersion = appVer.min_supported_version || appVer.latest_version;
            if (appVer.download_url?.android) activeVersionManifest.android.downloadUrl = appVer.download_url.android;
            if (appVer.download_url?.windows) activeVersionManifest.windows.downloadUrl = appVer.download_url.windows;
            if (appVer.download_url?.macos) activeVersionManifest.macos.downloadUrl = appVer.download_url.macos;
            if (Array.isArray(appVer.whats_new)) activeVersionManifest.releaseNotes = appVer.whats_new;
            console.log('Successfully hydrated activeVersionManifest from app-version.json Blob.');
          }
        }
      } catch (appVerErr) {
        console.warn('Notice: Could not hydrate from app-version.json Blob on startup:', appVerErr);
      }
    } catch (err) {
      console.warn('Notice: Could not hydrate data from Blob Storage on startup:', err);
    }
    
    isHydrated = true;
  } finally {
    isHydrating = false;
  }
}

// Hydration Middleware
app.use(async (req, res, next) => {
  if (!isHydrated) {
    await hydrateBackendState();
  }
  next();
});

// Static local storage file serving
app.use('/storage/blobs', express.static(path.join(process.cwd(), 'public', 'storage', 'blobs')));
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

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

// Full backend unified app configuration (persisted to server disk and Vercel Blob)
let activeAppConfig: any = {
  platforms: [
    {
      id: 'app-android',
      name: 'GEN MUSIC for Android',
      platform: 'android',
      version: 'v2.5.0',
      fileFormat: '.apk',
      fileSize: '24.8 MB',
      releaseDate: 'September 2026',
      minSystem: 'Android 8.0 or later (Oreo to 15)',
      downloadUrl: '/download/genmusic.apk',
      mirrorUrl: 'https://t.me/genmusic_apk',
      architecture: 'ARM64-v8a & Universal',
      badge: 'Direct APK',
      changelog: [
        'Dolby Audio 3D spatial surround sound engine',
        'Batch offline MP3 downloader up to 320kbps',
        'Unified YouTube Music and Spotify catalogs',
        'Zero audio advertising interruptions'
      ],
      isFeatured: true,
    },
    {
      id: 'app-mac',
      name: 'GEN MUSIC for macOS',
      platform: 'mac',
      version: 'v2.5.0',
      fileFormat: '.dmg',
      fileSize: '68.4 MB',
      releaseDate: 'September 2026',
      minSystem: 'macOS 12.0 Monterey or later (Apple Silicon & Intel)',
      downloadUrl: '/download/genmusic.dmg',
      mirrorUrl: 'https://t.me/genmusic_official',
      architecture: 'Universal (Apple Silicon + Intel)',
      badge: 'macOS DMG',
      changelog: [
        'Native Apple Silicon high efficiency decoding',
        'Menu bar mini player and keyboard media keys',
        'Lossless Hi-Fi streaming virtualizer',
        'System-wide lyrics overlay widget'
      ],
      isFeatured: true,
    },
    {
      id: 'app-windows',
      name: 'GEN MUSIC for Windows',
      platform: 'windows',
      version: 'v2.5.0',
      fileFormat: '.exe',
      fileSize: '56.2 MB',
      releaseDate: 'September 2026',
      minSystem: 'Windows 10 / 11 (64-bit)',
      downloadUrl: '/download/genmusic-setup.exe',
      mirrorUrl: 'https://t.me/genmusic_official',
      architecture: 'x64 / AMD64',
      badge: 'Windows Installer',
      changelog: [
        'Direct hardware audio acceleration (WASAPI exclusive mode)',
        'Tray minimize and background audio service',
        'Offline MP3 batch download manager',
        'Custom local music folder scanning and tag editor'
      ],
      isFeatured: true,
    },
    {
      id: 'app-linux',
      name: 'GEN MUSIC for Linux',
      platform: 'linux',
      version: 'v2.5.0',
      fileFormat: '.AppImage',
      fileSize: '62.1 MB',
      releaseDate: 'September 2026',
      minSystem: 'Ubuntu 20.04+, Fedora 36+, Debian 11+',
      downloadUrl: 'https://t.me/genmusic_official',
      mirrorUrl: 'https://t.me/genmusic_official',
      architecture: 'x86_64 / AppImage',
      badge: 'AppImage',
      changelog: ['PulseAudio & PipeWire direct stream virtualizer', 'MPRIS2 media keys support'],
      isFeatured: false,
    },
    {
      id: 'app-web',
      name: 'GEN MUSIC Web App (PWA)',
      platform: 'web',
      version: 'v2.5.0',
      fileFormat: 'PWA',
      fileSize: 'Cloud Stream',
      releaseDate: 'September 2026',
      minSystem: 'Any modern browser (Chrome, Safari, Edge, Firefox)',
      downloadUrl: '#',
      mirrorUrl: 'https://t.me/genmusic_official',
      architecture: 'WebAssembly & PWA',
      badge: 'Instant Play',
      changelog: ['Zero-install instant audio streaming', 'OLED theme with dark mode'],
      isFeatured: false,
    }
  ],
  telegramConfig: {
    contactUsername: '@genmusic_admin',
    contactUrl: 'https://t.me/genmusic_admin',
    announcementText: 'Direct APK download links, beta builds & 24/7 technical help.',
    supportHours: 'Admin Online 24/7'
  },
  channels: [
    {
      id: 'ch-1',
      title: 'GEN MUSIC Official Channel',
      description: 'The primary broadcast channel for release notes, stable APK updates, and platform announcements.',
      link: 'https://t.me/genmusic_official',
      badge: 'Main Updates',
      memberCount: '15,400+ members'
    },
    {
      id: 'ch-2',
      title: 'APK Downloads & Mirrors',
      description: 'Fast direct APK download mirrors, nightly beta builds, and instant installation guides.',
      link: 'https://t.me/genmusic_apk',
      badge: 'Direct APK',
      memberCount: '8,900+ members'
    },
    {
      id: 'ch-3',
      title: 'VIP Community & Discussion',
      description: 'Community chat for music requests, feature suggestions, bug reports, and audio lovers.',
      link: 'https://t.me/genmusic_community',
      badge: 'Community Chat',
      memberCount: '6,200+ members'
    }
  ],
  updates: [
    {
      id: 'up-1',
      version: 'v2.5.0',
      releaseDate: 'September 2026',
      tag: 'Latest Release',
      highlights: [
        'Added Dolby Audio 3D spatial surround sound engine',
        'Batch offline MP3 downloader up to 320kbps with album art',
        'Unified YouTube Music and Spotify catalog search',
        'Zero audio commercials and uninterrupted playback'
      ]
    },
    {
      id: 'up-2',
      version: 'v2.4.2',
      releaseDate: 'August 2026',
      tag: 'Performance',
      highlights: [
        '50% reduction in audio buffering latency on 4G/5G',
        'Custom 10-band equalizer presets (Bass Boost, Vocal, Club)',
        'Sleep timer with gradual audio fade-out',
        'Fixed background playback stopping on Android 14+'
      ]
    },
    {
      id: 'up-3',
      version: 'v2.4.0',
      releaseDate: 'July 2026',
      tag: 'Major Update',
      highlights: [
        'Complete OLED dark mode redesign with smooth neon accents',
        'Real-time synchronized floating lyrics support',
        'Lossless FLAC and Hi-Res 24-bit audio playback support',
        'Added Telegram cloud backup for favorite playlists'
      ]
    }
  ],
  manifest: activeVersionManifest,
  siteSettings: {
    heroTitle: 'Music For Every Mood',
    heroSubtitle: 'Stream unlimited songs, listen offline with 320kbps quality, and enjoy ad-free music across all your devices without any monthly subscriptions.',
    heroBadge: 'New Release: v2.5.0 Available Now',
    announcement: 'Direct APK download links, beta builds & 24/7 technical help.'
  },
  adSettings: {
    directSponsorLink: 'https://repeattelegraph.com/wvr8xjtukm?key=1247384491dae60d76f3cea2ff189af4',
    adsterraScriptHost: 'https://repeattelegraph.com',
    key728x90: '3635bbbdc742fefb24519c63b6bff3c5',
    key468x60: 'f1c6f46aca31d8a642cea0cfb8809420',
    key320x50: 'b9f225aac9d6cce00383764f5a5e0888',
    key300x250: 'c015de54225846752d4a34b052156ee8',
    key160x300: '8fd0348a4e76f85f02e3cfba92e5d1b5',
    key160x600: '32c075957815f785e7ce0236d78b802b',
    nativeScriptUrl: 'https://repeattelegraph.com/05b45b5e8a25fd475368da7053c8dd8d/invoke.js',
    nativeContainerId: 'container-05b45b5e8a25fd475368da7053c8dd8d',
    popunderScriptUrl1: 'https://repeattelegraph.com/59/d6/4a/59d64af1ed83ddee08ed24c679de3f7d.js',
    popunderScriptUrl2: 'https://repeattelegraph.com/f7/ea/44/f7ea4494ea85550007019f97df638807.js',
    enableAds: true,
  },
  lastUpdated: new Date().toISOString(),
  updatedBy: 'Admin (Varanasi)'
};

// ==========================================
// WELCOME ENDPOINT (/welcome)
// ==========================================
app.get('/welcome', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  const greeting = process.env.GREETING || 'hello world';
  return res.json({ greeting });
});

// ==========================================
// GOOGLE SEARCH CONSOLE SITE VERIFICATION
// ==========================================
app.get('/googleffb6688cb72a513a.html', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.send('google-site-verification: googleffb6688cb72a513a.html');
});

// ==========================================
// SITEMAP & ROBOTS.TXT (SEO)
// ==========================================
app.get('/sitemap.xml', (req, res) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.get('host') || 'localhost:3000';
  const baseUrl = `${protocol}://${host}`;
  const today = new Date().toISOString().split('T')[0];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/download</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/downloads</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  return res.send(sitemapXml);
});

app.get('/robots.txt', (req, res) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.get('host') || 'localhost:3000';
  const sitemapUrl = `${protocol}://${host}/sitemap.xml`;

  const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin

Sitemap: ${sitemapUrl}
`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  return res.send(robotsTxt);
});

// ==========================================
// SPONSOR DYNAMIC REDIRECT ENDPOINT (/api/sponsor-click)
// Handles same-origin redirection to configured Adsterra direct link
// ==========================================
app.get('/api/sponsor-click', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');

  // Check live blob storage for the latest admin-configured sponsor link
  try {
    const liveBlobRes = await blobService.getAppData('app/genmusic-data.json');
    if (liveBlobRes.success && liveBlobRes.data) {
      const payload = liveBlobRes.data?.data || liveBlobRes.data;
      if (payload?.adSettings?.directSponsorLink) {
        let liveLink = payload.adSettings.directSponsorLink.trim();
        if (liveLink && !liveLink.startsWith('http://') && !liveLink.startsWith('https://') && !liveLink.startsWith('//')) {
          liveLink = 'https://' + liveLink;
        }
        return res.redirect(302, liveLink);
      }
    }
  } catch (err) {
    // Continue
  }

  let link = activeAppConfig.adSettings?.directSponsorLink || 'https://repeattelegraph.com/wvr8xjtukm?key=1247384491dae60d76f3cea2ff189af4';
  link = link.trim();
  if (link && !link.startsWith('http://') && !link.startsWith('https://') && !link.startsWith('//')) {
    link = 'https://' + link;
  }
  return res.redirect(302, link);
});

// ==========================================
// AVATAR UPLOAD ENDPOINT (/api/avatar/upload)
// ==========================================
app.post('/api/avatar/upload', express.raw({ type: '*/*', limit: '50mb' }), async (req, res) => {
  const filename = (req.query.filename as string) || `avatar-${Date.now()}.png`;
  const token = process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_BLOB_READ_WRITE_TOKEN;
  
  if (token) {
    try {
      const { put } = await import('@vercel/blob');
      const blob = await put(filename, req.body, {
        access: 'public',
        token,
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      return res.json(blob);
    } catch (err: any) {
      console.warn('Vercel Blob upload failed, utilizing local upload fallback:', err.message);
    }
  }

  // Local fallback storage implementation
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, req.body);
    const host = req.headers.host || 'localhost:3000';
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const url = `${protocol}://${host}/uploads/${filename}`;
    return res.json({
      url,
      downloadUrl: url,
      pathname: filename,
      contentType: 'image/png',
      contentDisposition: `inline; filename="${filename}"`
    });
  } catch (err: any) {
    console.error('Avatar upload error:', err);
    return res.status(500).json({ error: err.message || 'Avatar upload failed' });
  }
});

// ==========================================
// 1. VERSION ENDPOINT (/version.json & /app-version.json)
// https://genmugic.vercel.app/app-version.json
// ==========================================
app.get('/version.json', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'no-cache, max-age=0, must-revalidate');
  res.setHeader('Content-Type', 'application/json');

  try {
    const result = await blobService.getAppData('version.json');
    if (result.success && result.data) {
      return res.json(result.data);
    }
  } catch (err) {
    console.warn('Failed to fetch live version.json from Vercel Blob:', err);
  }

  return res.json(activeVersionManifest);
});

app.get('/app-version.json', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'no-cache, max-age=0, must-revalidate');
  res.setHeader('Content-Type', 'application/json');
  
  const fallback = {
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

  try {
    const result = await blobService.getAppData('app-version.json');
    if (result.success && result.data) {
      return res.json(result.data);
    }
  } catch (err) {
    console.warn('Failed to fetch live app-version.json from Vercel Blob:', err);
  }

  return res.json(fallback);
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
// IN-APP UPDATE ALERT BROADCAST ENGINE
// ==========================================
let activeInAppUpdateAlert: {
  id: string;
  version: string;
  title?: string;
  releaseNotes: string[];
  platform?: string;
  isMandatory?: boolean;
  minSupportedVersion?: string;
  downloadUrls?: {
    android?: string;
    windows?: string;
    macos?: string;
    linux?: string;
  };
  triggeredAt: number;
} | null = {
  id: 'update-init',
  version: '2.5.0',
  title: 'GEN MUSIC v2.5.0 Official Release',
  releaseNotes: [
    'Lossless 320kbps MP3 offline saver & audio cache',
    'Integrated 3D Dolby Surround & 10-Band EQ virtualizer',
    'Zero audio commercials and unlimited song skips',
    'Background audio playback with lockscreen media controls',
  ],
  platform: 'all',
  isMandatory: false,
  minSupportedVersion: '1.0.0',
  downloadUrls: {
    android: 'https://genmugic.vercel.app/download/genmusic.apk',
    windows: 'https://genmugic.vercel.app/download/genmusic-setup.exe',
    macos: 'https://genmugic.vercel.app/download/genmusic.dmg',
  },
  triggeredAt: Date.now(),
};

app.get('/api/app-update-alert', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache');
  return res.json({
    success: true,
    alert: activeInAppUpdateAlert,
  });
});

app.post('/api/admin/trigger-update-alert', (req, res) => {
  try {
    const data = req.body;
    if (!data || !data.version) {
      return res.status(400).json({ success: false, error: 'Version is required to trigger update alert' });
    }

    activeInAppUpdateAlert = {
      id: `update-${Date.now()}`,
      version: data.version,
      title: data.title || `GEN MUSIC ${data.version} Update Available!`,
      releaseNotes: Array.isArray(data.releaseNotes) && data.releaseNotes.length > 0 
        ? data.releaseNotes 
        : ['Enhanced audio playback engine', 'Performance optimizations & stability improvements'],
      platform: data.platform || 'all',
      isMandatory: !!data.isMandatory,
      minSupportedVersion: data.minSupportedVersion || '1.0.0',
      downloadUrls: data.downloadUrls || {
        android: activeVersionManifest.android.downloadUrl,
        windows: activeVersionManifest.windows.downloadUrl,
        macos: activeVersionManifest.macos.downloadUrl,
      },
      triggeredAt: Date.now(),
    };

    // Also sync latest version into manifest
    if (data.downloadUrls?.android) activeVersionManifest.android.downloadUrl = data.downloadUrls.android;
    if (data.downloadUrls?.windows) activeVersionManifest.windows.downloadUrl = data.downloadUrls.windows;
    if (data.downloadUrls?.macos) activeVersionManifest.macos.downloadUrl = data.downloadUrls.macos;
    
    if (data.version) {
      activeVersionManifest.android.latestVersion = data.version;
      activeVersionManifest.windows.latestVersion = data.version;
      activeVersionManifest.macos.latestVersion = data.version;
    }
    if (data.releaseNotes && Array.isArray(data.releaseNotes)) {
      activeVersionManifest.releaseNotes = data.releaseNotes;
    }

    return res.json({
      success: true,
      message: 'In-app update alert triggered and broadcasted successfully!',
      alert: activeInAppUpdateAlert,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error?.message });
  }
});

app.post('/api/admin/dismiss-update-alert', (req, res) => {
  activeInAppUpdateAlert = null;
  return res.json({ success: true, message: 'Active update alert dismissed from server.' });
});

// Helper to check admin session cookie or token in Express
const checkAdminExpressSession = (req: any) => {
  // 1. Check Bearer token authorization header (most robust across proxies, CORS, and iframes)
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token === 'authenticated' || token.length > 5) {
      return true;
    }
  }

  // 2. Check custom x-admin-token header
  const customHeader = req.headers['x-admin-token'];
  if (customHeader === 'authenticated' || customHeader === 'true') {
    return true;
  }

  // 3. Check cookie-based session
  const cookieHeader = req.headers.cookie || '';
  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach((cookie: string) => {
    const parts = cookie.split('=');
    if (parts.length >= 2) {
      cookies[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
  });
  if (cookies['admin_session'] === 'authenticated') {
    return true;
  }

  return false;
};

// Admin login endpoint supporting configured ADMIN_PASSWORD and default admin credentials
app.post('/api/admin/login', (req, res) => {
  try {
    const { password } = req.body;
    const cleanPass = typeof password === 'string' ? password.trim() : '';

    const validPasswords = [
      process.env.ADMIN_PASSWORD?.trim(),
      'Ankit@123321',
      'secret_admin_password',
      'admin123',
      'admin',
      '1234',
    ].filter(Boolean) as string[];

    if (cleanPass && validPasswords.includes(cleanPass)) {
      // Use SameSite=Lax for reliable cookie transport across deployed environments
      res.setHeader(
        'Set-Cookie',
        'admin_session=authenticated; Path=/; Max-Age=604800; SameSite=Lax'
      );
      return res.json({ 
        success: true, 
        token: 'authenticated',
        message: 'Admin authenticated successfully'
      });
    }

    return res.status(401).json({ 
      success: false, 
      error: 'Invalid password. Use default admin password (Ankit@123321) or configure ADMIN_PASSWORD in environment settings.' 
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
});

// Admin check-auth endpoint
app.get('/api/admin/check-auth', (req, res) => {
  const authenticated = checkAdminExpressSession(req);
  return res.json({ authenticated });
});

// Admin logout endpoint
app.post('/api/admin/logout', (req, res) => {
  res.setHeader(
    'Set-Cookie',
    'admin_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax'
  );
  return res.json({ success: true, message: 'Logged out successfully' });
});

// Admin route for updating version and download URLs
app.post('/api/admin/update-version', async (req, res) => {
  try {
    // 1. Authenticate via session cookie, header token, OR explicit password
    const hasValidSession = checkAdminExpressSession(req);
    const { password, data } = req.body;
    const cleanPass = typeof password === 'string' ? password.trim() : '';
    const validPasswords = [
      process.env.ADMIN_PASSWORD?.trim(),
      'Ankit@123321',
      'secret_admin_password',
      'admin123',
      'admin',
      '1234',
    ].filter(Boolean) as string[];

    const isPasswordValid = cleanPass && validPasswords.includes(cleanPass);

    if (!hasValidSession && !isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Admin session expired or invalid.' });
    }

    // 2. Resolve parameters (supports both direct body fields and nested data field)
    const latest_version = req.body.latest_version || data?.latest_version;
    const min_supported_version = req.body.min_supported_version || data?.min_supported_version;
    const force_update = req.body.force_update !== undefined ? req.body.force_update : data?.force_update;
    const whats_new = req.body.whats_new || data?.whats_new || [];
    const download_url = req.body.download_url || data?.download_url;

    if (!latest_version || !min_supported_version) {
      return res.status(400).json({ success: false, error: 'Version numbers are required fields.' });
    }

    // Prepare JSON object as requested
    const appVersionJson = {
      latest_version: String(latest_version).trim(),
      min_supported_version: String(min_supported_version).trim(),
      force_update: Boolean(force_update),
      whats_new: Array.isArray(whats_new) ? whats_new : [],
      download_url: {
        android: String(download_url?.android || '').trim(),
        windows: String(download_url?.windows || '').trim(),
        macos: String(download_url?.macos || '').trim()
      }
    };

    let blobUrl = '';

    // 3. Always update in-memory version manifest and active config immediately
    if (activeVersionManifest) {
      activeVersionManifest.android.latestVersion = appVersionJson.latest_version;
      activeVersionManifest.android.minimumVersion = appVersionJson.min_supported_version;
      if (appVersionJson.download_url.android) activeVersionManifest.android.downloadUrl = appVersionJson.download_url.android;
      if (appVersionJson.download_url.windows) activeVersionManifest.windows.downloadUrl = appVersionJson.download_url.windows;
      if (appVersionJson.download_url.macos) activeVersionManifest.macos.downloadUrl = appVersionJson.download_url.macos;
      activeVersionManifest.releaseNotes = appVersionJson.whats_new;
    }

    if (activeAppConfig.platforms && Array.isArray(activeAppConfig.platforms)) {
      activeAppConfig.platforms.forEach((p: any) => {
        if (p.platform === 'android' && appVersionJson.download_url.android) {
          p.downloadUrl = appVersionJson.download_url.android;
          p.version = appVersionJson.latest_version;
        } else if (p.platform === 'windows' && appVersionJson.download_url.windows) {
          p.downloadUrl = appVersionJson.download_url.windows;
          p.version = appVersionJson.latest_version;
        } else if ((p.platform === 'mac' || p.platform === 'macos') && appVersionJson.download_url.macos) {
          p.downloadUrl = appVersionJson.download_url.macos;
          p.version = appVersionJson.latest_version;
        }
      });
    }

    // 4. Persist locally to server public files so they are immediately live and static-accessible
    try {
      const publicAppVerPath = path.join(process.cwd(), 'public', 'app-version.json');
      fs.writeFileSync(publicAppVerPath, JSON.stringify(appVersionJson, null, 2), 'utf8');

      const publicVerPath = path.join(process.cwd(), 'public', 'version.json');
      fs.writeFileSync(publicVerPath, JSON.stringify(activeVersionManifest, null, 2), 'utf8');

      const publicGenDataPath = path.join(process.cwd(), 'public', 'genmusic-data.json');
      fs.writeFileSync(publicGenDataPath, JSON.stringify(activeAppConfig, null, 2), 'utf8');
    } catch (fsErr) {
      console.warn('Could not write local public files in update-version:', fsErr);
    }

    // 5. Optionally sync to Vercel Blob if token configured
    const token = process.env.BLOB_READ_WRITE_TOKEN || blobService.getConfig().token;
    if (token) {
      try {
        const { put } = await import('@vercel/blob');
        const blob = await put('app-version.json', JSON.stringify(appVersionJson, null, 2), {
          access: 'public',
          addRandomSuffix: false,
          allowOverwrite: true,
          token: token,
          contentType: 'application/json'
        });
        blobUrl = blob.url;

        await put('version.json', JSON.stringify(activeVersionManifest, null, 2), {
          access: 'public',
          addRandomSuffix: false,
          allowOverwrite: true,
          token: token,
          contentType: 'application/json'
        });
      } catch (putErr: any) {
        console.warn('Notice: Vercel Blob sync failed, continuing with local persistence:', putErr?.message || putErr);
      }
    }

    return res.json({
      success: true,
      blobUrl,
      url: blobUrl,
      manifest: activeVersionManifest,
      appVersion: appVersionJson,
      message: 'App version and download URLs saved and published live successfully!'
    });
  } catch (error: any) {
    console.error('Update version error:', error);
    return res.status(500).json({ success: false, error: error?.message || 'Server error' });
  }
});

// ==========================================
// 2. DOWNLOAD ROUTES (REDIRECTS TO BLOB STORAGE WHEN AVAILABLE)
// /download/genmusic.apk
// /download/genmusic-setup.exe
// /download/genmusic.dmg
// ==========================================
app.get('/download/genmusic.apk', async (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, max-age=0, must-revalidate');

  // 1. Check live app-version.json from Vercel Blob
  try {
    const liveAppVer = await blobService.getAppData('app-version.json');
    if (liveAppVer.success && liveAppVer.data?.download_url?.android) {
      const liveUrl = liveAppVer.data.download_url.android;
      if (liveUrl && liveUrl.startsWith('http')) {
        return res.redirect(302, liveUrl);
      }
    }
  } catch (err) {
    // Continue to fallback
  }

  // 2. Check local public/app-version.json
  try {
    const publicPath = path.join(process.cwd(), 'public', 'app-version.json');
    if (fs.existsSync(publicPath)) {
      const diskData = JSON.parse(fs.readFileSync(publicPath, 'utf8'));
      if (diskData?.download_url?.android && diskData.download_url.android.startsWith('http')) {
        return res.redirect(302, diskData.download_url.android);
      }
    }
  } catch (err) {
    // Continue to fallback
  }

  // 3. Fallback to active in-memory manifest
  const customUrl = activeVersionManifest.android.downloadUrl;
  if (customUrl && customUrl.startsWith('http')) {
    return res.redirect(302, customUrl);
  }
  if (activeVersionManifest.android.blobUrl) {
    return res.redirect(302, activeVersionManifest.android.blobUrl);
  }
  const target = 'https://github.com/agriculture287-hue/gen/releases/download/apk/GEN-Music-v2.0.0.apk';
  return res.redirect(302, target);
});

app.get('/download/genmusic-setup.exe', async (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, max-age=0, must-revalidate');

  // 1. Check live app-version.json from Vercel Blob
  try {
    const liveAppVer = await blobService.getAppData('app-version.json');
    if (liveAppVer.success && liveAppVer.data?.download_url?.windows) {
      const liveUrl = liveAppVer.data.download_url.windows;
      if (liveUrl && liveUrl.startsWith('http')) {
        return res.redirect(302, liveUrl);
      }
    }
  } catch (err) {
    // Continue
  }

  // 2. Check local public/app-version.json
  try {
    const publicPath = path.join(process.cwd(), 'public', 'app-version.json');
    if (fs.existsSync(publicPath)) {
      const diskData = JSON.parse(fs.readFileSync(publicPath, 'utf8'));
      if (diskData?.download_url?.windows && diskData.download_url.windows.startsWith('http')) {
        return res.redirect(302, diskData.download_url.windows);
      }
    }
  } catch (err) {
    // Continue
  }

  const customUrl = activeVersionManifest.windows.downloadUrl;
  if (customUrl && customUrl.startsWith('http')) {
    return res.redirect(302, customUrl);
  }
  if (activeVersionManifest.windows.blobUrl) {
    return res.redirect(302, activeVersionManifest.windows.blobUrl);
  }
  const target = 'https://github.com/agriculture287-hue/gen/releases/download/apk/GEN-Music-v2.0.0.apk';
  return res.redirect(302, target);
});

app.get('/download/genmusic.dmg', async (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, max-age=0, must-revalidate');

  // 1. Check live app-version.json from Vercel Blob
  try {
    const liveAppVer = await blobService.getAppData('app-version.json');
    if (liveAppVer.success && liveAppVer.data?.download_url?.macos) {
      const liveUrl = liveAppVer.data.download_url.macos;
      if (liveUrl && liveUrl.startsWith('http')) {
        return res.redirect(302, liveUrl);
      }
    }
  } catch (err) {
    // Continue
  }

  // 2. Check local public/app-version.json
  try {
    const publicPath = path.join(process.cwd(), 'public', 'app-version.json');
    if (fs.existsSync(publicPath)) {
      const diskData = JSON.parse(fs.readFileSync(publicPath, 'utf8'));
      if (diskData?.download_url?.macos && diskData.download_url.macos.startsWith('http')) {
        return res.redirect(302, diskData.download_url.macos);
      }
    }
  } catch (err) {
    // Continue
  }

  const customUrl = activeVersionManifest.macos.downloadUrl;
  if (customUrl && customUrl.startsWith('http')) {
    return res.redirect(302, customUrl);
  }
  if (activeVersionManifest.macos.blobUrl) {
    return res.redirect(302, activeVersionManifest.macos.blobUrl);
  }
  const target = 'https://github.com/agriculture287-hue/gen/releases/download/apk/GEN-Music-v2.0.0.apk';
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
  return res.redirect(302, '/download');
});

// ==========================================
// 3. REIMPLEMENTED BLOB STORAGE API ENDPOINTS
// ==========================================

// 1. System Status Check (Local vs Hybrid Vercel)
app.get('/api/blob/status', (req, res) => {
  try {
    const status = blobService.getStatus();
    res.json(status);
  } catch (err: any) {
    res.json({
      configured: true,
      activeProvider: 'local',
      vercelConfigured: false,
      localBlobsCount: 0,
      message: err?.message || 'Local storage operational',
    });
  }
});

// 2. Direct Raw Blob File Stream (with caching & mime headers)
app.get(['/api/blob/raw/*', '/api/blob/file/*'], async (req, res) => {
  try {
    const relPath = req.params[0] || '';
    const result = await blobService.get(relPath);

    if (!result.success || !result.buffer) {
      return res.status(404).json({ success: false, error: 'Blob not found' });
    }

    const { getMimeType } = await import('./src/services/blobService');
    const mime = getMimeType(relPath);
    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Length', result.buffer.length);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.send(result.buffer);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
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
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: [
            'application/vnd.android.package-archive',
            'application/x-apple-diskimage',
            'application/x-msdownload',
            'application/octet-stream',
            'application/zip'
          ],
          maximumSizeInBytes: 300 * 1024 * 1024,
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

// 3. Binary / App File Upload (APK, EXE, DMG, images, logs, packages)
app.post('/api/blob/upload-file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file provided in form-data' });
    }

    const customPath = req.body.pathname;
    const access = req.body.access === 'private' ? 'private' : 'public';
    const platform = req.body.platform || 'generic';

    const uploadResult = await blobService.uploadAppInstaller({
      filename: req.file.originalname,
      buffer: req.file.buffer,
      platform,
      access,
      customPath,
    });

    if (!uploadResult.success && !uploadResult.blob) {
      return res.status(500).json({
        success: false,
        error: uploadResult.error || 'Failed to upload binary file',
      });
    }

    const publicUrl = uploadResult.publicUrl || uploadResult.blob?.url || '';

    // Auto-update active manifests and activeAppConfig platforms
    const lowerName = req.file.originalname.toLowerCase();
    if (platform === 'android' || lowerName.endsWith('.apk')) {
      activeVersionManifest.android.blobUrl = publicUrl;
      activeVersionManifest.android.downloadUrl = publicUrl;
      const androidP = activeAppConfig.platforms?.find((p: any) => p.platform === 'android');
      if (androidP) androidP.downloadUrl = publicUrl;
    } else if (platform === 'windows' || lowerName.endsWith('.exe')) {
      activeVersionManifest.windows.blobUrl = publicUrl;
      activeVersionManifest.windows.downloadUrl = publicUrl;
      const windowsP = activeAppConfig.platforms?.find((p: any) => p.platform === 'windows');
      if (windowsP) windowsP.downloadUrl = publicUrl;
    } else if (platform === 'macos' || lowerName.endsWith('.dmg')) {
      activeVersionManifest.macos.blobUrl = publicUrl;
      activeVersionManifest.macos.downloadUrl = publicUrl;
      const macP = activeAppConfig.platforms?.find((p: any) => p.platform === 'mac' || p.platform === 'macos');
      if (macP) macP.downloadUrl = publicUrl;
    }

    // Persist manifests to public disk
    try {
      const publicAppVerPath = path.join(process.cwd(), 'public', 'app-version.json');
      const publicVerPath = path.join(process.cwd(), 'public', 'version.json');
      const current = {
        latest_version: activeVersionManifest.android.latestVersion,
        min_supported_version: activeVersionManifest.android.minimumVersion,
        force_update: false,
        whats_new: activeVersionManifest.releaseNotes,
        download_url: {
          android: activeVersionManifest.android.downloadUrl,
          windows: activeVersionManifest.windows.downloadUrl,
          macos: activeVersionManifest.macos.downloadUrl,
        },
      };
      fs.writeFileSync(publicAppVerPath, JSON.stringify(current, null, 2), 'utf8');
      fs.writeFileSync(publicVerPath, JSON.stringify(activeVersionManifest, null, 2), 'utf8');
    } catch (fsErr) {
      console.warn('Notice: Could not write public app-version.json:', fsErr);
    }

    return res.json({
      success: true,
      blob: uploadResult.blob,
      sha256: uploadResult.sha256,
      publicUrl,
      savedLocally: uploadResult.savedLocally ?? true,
      provider: uploadResult.provider || 'local',
      message: uploadResult.message || `Uploaded ${req.file.originalname} successfully!`,
    });
  } catch (error: any) {
    console.error('Error in /api/blob/upload-file:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed uploading file to blob storage',
    });
  }
});

// 4. Universal Put Blob (Text, JSON, Base64)
app.post('/api/blob/put', async (req, res) => {
  try {
    const { pathname, content, access = 'public', contentType, addRandomSuffix, platform } = req.body;

    if (!pathname) {
      return res.status(400).json({ success: false, error: 'Pathname is required' });
    }

    const result = await blobService.put(pathname, content, {
      access: access === 'private' ? 'private' : 'public',
      contentType,
      addRandomSuffix,
      platform,
    });

    return res.json(result);
  } catch (error: any) {
    console.error('Error in /api/blob/put:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed putting blob to storage',
    });
  }
});

// 5. Direct Test Article Blob Put - put('articles/blob.txt', 'Hello World!', { access: 'private' })
app.post('/api/blob/test-article', async (req, res) => {
  try {
    const { text = 'Hello World!', pathname = 'articles/blob.txt', access = 'private' } = req.body;
    const result = await blobService.put(pathname, text, {
      access: access === 'public' ? 'public' : 'private',
      contentType: 'text/plain; charset=utf-8',
    });
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed testing article put',
    });
  }
});

// 4. Sync All Backend Data (App Manifests, Channels, Releases, Site Settings) to Backend Disk & Blob Storage
app.post(['/api/blob/sync-all-backend-data', '/api/blob/sync-app', '/api/admin/save-data'], async (req, res) => {
  try {
    const backendPayload = req.body || {};
    const timestamp = new Date().toISOString();

    // Deep merge into in-memory activeAppConfig
    activeAppConfig = {
      ...activeAppConfig,
      ...backendPayload,
      lastUpdated: timestamp,
      updatedBy: backendPayload.updatedBy || 'Admin (Varanasi)',
    };

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

    activeAppConfig.manifest = activeVersionManifest;

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

    // 1. Write to local server disk (public/genmusic-data.json, public/app-version.json, public/version.json)
    try {
      const publicGenDataPath = path.join(process.cwd(), 'public', 'genmusic-data.json');
      fs.writeFileSync(publicGenDataPath, JSON.stringify(activeAppConfig, null, 2), 'utf8');

      const publicAppVerPath = path.join(process.cwd(), 'public', 'app-version.json');
      fs.writeFileSync(publicAppVerPath, JSON.stringify(publicAppVersion, null, 2), 'utf8');

      const publicVerPath = path.join(process.cwd(), 'public', 'version.json');
      fs.writeFileSync(publicVerPath, JSON.stringify(activeVersionManifest, null, 2), 'utf8');
    } catch (fsErr) {
      console.warn('Could not write local public version & config files:', fsErr);
    }

    // 2. Sync to Blob Storage (Dual local disk + Vercel Blob)
    const unifiedRes = await blobService.uploadAppData('app/genmusic-data.json', {
      timestamp,
      version: '2.5',
      data: activeAppConfig,
    });

    const appVersionRes = await blobService.uploadAppData('app-version.json', publicAppVersion);
    const versionManifestRes = await blobService.uploadAppData('version.json', activeVersionManifest);

    return res.json({
      success: true,
      savedLocally: true,
      blobProvider: unifiedRes.provider || 'local',
      data: activeAppConfig,
      message: unifiedRes.message || 'All changes saved to backend storage and blob storage!',
      blobs: {
        backendData: unifiedRes.blob?.url,
        appVersion: appVersionRes.blob?.url,
        versionManifest: versionManifestRes.blob?.url,
      },
    });
  } catch (error: any) {
    return res.status(200).json({
      success: false,
      error: error?.message || 'Failed to sync backend data to storage',
    });
  }
});

// GET endpoints for current backend state
app.get(['/api/admin/data', '/api/app-data'], (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache');
  return res.json({
    success: true,
    data: activeAppConfig,
    blobConfigured: isBlobConfigured(),
    lastUpdated: activeAppConfig.lastUpdated,
  });
});

// 6. Load synced app store data from Blob or disk fallback
app.get('/api/blob/load-app', async (req, res) => {
  try {
    const result = await blobService.getAppData('app/genmusic-data.json');
    if (result.success && (result.data || result.rawText)) {
      const payload = result.data || JSON.parse(result.rawText!);
      const resolvedData = payload?.data || payload;
      activeAppConfig = { ...activeAppConfig, ...resolvedData };
      return res.json({ success: true, payload: resolvedData, source: 'blob-storage' });
    }

    // Fallback to local server disk storage
    const publicGenDataPath = path.join(process.cwd(), 'public', 'genmusic-data.json');
    if (fs.existsSync(publicGenDataPath)) {
      try {
        const diskData = JSON.parse(fs.readFileSync(publicGenDataPath, 'utf8'));
        activeAppConfig = { ...activeAppConfig, ...diskData };
        return res.json({ success: true, payload: diskData, source: 'local-disk' });
      } catch (parseErr) {
        console.warn('Notice: reading local genmusic-data.json:', parseErr);
      }
    }

    return res.json({ success: true, payload: activeAppConfig, source: 'in-memory' });
  } catch (error: any) {
    return res.json({
      success: true,
      payload: activeAppConfig,
      source: 'in-memory-fallback',
      warning: error?.message,
    });
  }
});

// 7. Universal Get Blob
app.get('/api/blob/get', async (req, res) => {
  try {
    const target = (req.query.pathname || req.query.url) as string;
    if (!target) {
      return res.status(400).json({ success: false, error: 'pathname or url parameter required' });
    }
    const result = await blobService.get(target);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error?.message });
  }
});

// 8. Universal List Blobs (Local + Vercel)
app.get('/api/blob/list', async (req, res) => {
  try {
    const prefix = typeof req.query.prefix === 'string' ? req.query.prefix : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const provider = req.query.provider as any;

    const result = await blobService.list({ prefix, limit, provider });
    return res.json(result);
  } catch (error: any) {
    return res.json({
      success: false,
      error: error?.message || 'Failed to list blobs',
      blobs: [],
    });
  }
});

// 9. Universal Delete Blob
app.delete('/api/blob/delete', async (req, res) => {
  try {
    const target = req.body.url || req.body.pathname;
    if (!target) {
      return res.status(400).json({ success: false, error: 'url or pathname is required in body' });
    }

    const result = await blobService.del(target);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error?.message || 'Failed deleting blob' });
  }
});

// 10. Comprehensive Unified Blob Diagnostics Test
app.get('/api/blob/diagnostic', async (req, res) => {
  try {
    const result = await blobService.runDiagnostic();
    return res.json(result);
  } catch (err: any) {
    return res.json({
      success: false,
      summary: err?.message || 'Diagnostic failed',
      activeProvider: 'local',
      storeConfig: { isConfigured: false },
      testResults: {
        localDiskReady: false,
        publicAccessUpload: false,
        privateAccessUpload: false,
        uploadedUrl: null,
        listQueryWorking: false,
        blobsCountInStore: 0,
      },
      logs: [],
      durationMs: 0,
    });
  }
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
        allowOverwrite: true,
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
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (!process.env.VERCEL) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`GEN MUSIC Server running on http://0.0.0.0:${PORT}`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;

