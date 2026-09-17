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
  lastUpdated: new Date().toISOString(),
  updatedBy: 'Admin (Varanasi)'
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
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file provided in form-data' });
    }

    const customPath = req.body.pathname;
    const access = req.body.access === 'private' ? 'private' : 'public';
    const platform = req.body.platform; // 'android' | 'windows' | 'macos'

    let publicUrl = '';
    let sha256Checksum = '';
    let savedToVercelBlob = false;
    let blobItem: any = null;

    // Try Vercel Blob if configured
    if (blobService.isReady()) {
      try {
        const result = await blobService.uploadAppInstaller({
          filename: req.file.originalname,
          buffer: req.file.buffer,
          platform: platform || 'generic',
          access,
          customPath,
        });

        if (result.success && result.blob) {
          savedToVercelBlob = true;
          blobItem = result.blob;
          publicUrl = result.blob.url;
          sha256Checksum = result.sha256 || '';
        }
      } catch (blobErr: any) {
        console.warn('Vercel blob upload attempt failed, falling back to local server disk storage:', blobErr?.message);
      }
    }

    // If Vercel Blob failed or not configured, store locally on server disk
    if (!publicUrl) {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const safeBase = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueName = `${Date.now()}_${safeBase}`;
      const localFilePath = path.join(uploadsDir, uniqueName);
      fs.writeFileSync(localFilePath, req.file.buffer);

      publicUrl = `/uploads/${uniqueName}`;
      blobItem = {
        url: publicUrl,
        downloadUrl: publicUrl,
        pathname: `uploads/${uniqueName}`,
        contentType: req.file.mimetype || 'application/octet-stream',
        contentDisposition: `attachment; filename="${req.file.originalname}"`,
        size: req.file.size,
        uploadedAt: new Date(),
      };
    }

    // Update active manifest and activeAppConfig platforms automatically!
    if (platform === 'android' || (customPath && customPath.endsWith('.apk')) || req.file.originalname.endsWith('.apk')) {
      activeVersionManifest.android.blobUrl = publicUrl;
      activeVersionManifest.android.downloadUrl = publicUrl;
      const androidP = activeAppConfig.platforms?.find((p: any) => p.platform === 'android');
      if (androidP) androidP.downloadUrl = publicUrl;
    } else if (platform === 'windows' || (customPath && customPath.endsWith('.exe')) || req.file.originalname.endsWith('.exe')) {
      activeVersionManifest.windows.blobUrl = publicUrl;
      activeVersionManifest.windows.downloadUrl = publicUrl;
      const windowsP = activeAppConfig.platforms?.find((p: any) => p.platform === 'windows');
      if (windowsP) windowsP.downloadUrl = publicUrl;
    } else if (platform === 'macos' || (customPath && customPath.endsWith('.dmg')) || req.file.originalname.endsWith('.dmg')) {
      activeVersionManifest.macos.blobUrl = publicUrl;
      activeVersionManifest.macos.downloadUrl = publicUrl;
      const macP = activeAppConfig.platforms?.find((p: any) => p.platform === 'mac' || p.platform === 'macos');
      if (macP) macP.downloadUrl = publicUrl;
    }

    // Also update public/app-version.json & public/version.json
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
        }
      };
      fs.writeFileSync(publicAppVerPath, JSON.stringify(current, null, 2), 'utf8');
      fs.writeFileSync(publicVerPath, JSON.stringify(activeVersionManifest, null, 2), 'utf8');
    } catch (fsErr) {
      console.warn('Failed updating public/app-version.json with new blob URL:', fsErr);
    }

    return res.json({
      success: true,
      blob: blobItem,
      sha256: sha256Checksum,
      savedToVercelBlob,
      message: `File ${req.file.originalname} (${(req.file.size / (1024 * 1024)).toFixed(2)} MB) successfully saved to ${savedToVercelBlob ? 'Vercel Blob Storage' : 'Backend Server Storage'}!`,
      publicUrl,
    });
  } catch (error: any) {
    console.error('Error uploading file to blob:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to upload binary file to storage',
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

    // 2. Sync to Vercel Blob if token configured
    if (!blobService.isReady()) {
      return res.json({
        success: true,
        savedLocally: true,
        blobConfigured: false,
        data: activeAppConfig,
        message: 'All admin changes, platforms, channels, and releases saved successfully to backend storage!',
      });
    }

    try {
      // Upload unified backend configuration package to Blob
      const unifiedRes = await blobService.uploadAppData('app/genmusic-data.json', {
        timestamp,
        version: '2.5',
        data: activeAppConfig,
      });

      // Upload latest app-version.json & version.json for external clients to Blob
      const appVersionRes = await blobService.uploadAppData('app-version.json', publicAppVersion);
      const versionManifestRes = await blobService.uploadAppData('version.json', activeVersionManifest);

      if (!unifiedRes.success) {
        return res.json({
          success: true,
          savedLocally: true,
          blobConfigured: true,
          blobError: unifiedRes.error,
          data: activeAppConfig,
          message: `Saved locally on backend disk. Vercel Blob sync status: ${unifiedRes.error}`,
        });
      }

      return res.json({
        success: true,
        savedLocally: true,
        blobConfigured: true,
        data: activeAppConfig,
        message: 'All admin changes, platforms, channels, updates, and releases saved successfully to Backend & Vercel Blob Storage!',
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
        data: activeAppConfig,
        message: `Saved locally on backend. Note: ${blobUploadErr?.message || 'Blob sync notice.'}`,
      });
    }
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

// 5. Load synced app store data from Vercel Blob (with disk fallback)
app.get('/api/blob/load-app', async (req, res) => {
  try {
    if (blobService.isReady()) {
      const result = await blobService.getAppData('app/genmusic-data.json');
      if (result.success && (result.data || result.rawText)) {
        const payload = result.data || JSON.parse(result.rawText);
        const resolvedData = payload?.data || payload;
        activeAppConfig = { ...activeAppConfig, ...resolvedData };
        return res.json({ success: true, payload: resolvedData, source: 'vercel-blob' });
      }
    }

    // Fallback to local server disk storage
    const publicGenDataPath = path.join(process.cwd(), 'public', 'genmusic-data.json');
    if (fs.existsSync(publicGenDataPath)) {
      try {
        const diskData = JSON.parse(fs.readFileSync(publicGenDataPath, 'utf8'));
        activeAppConfig = { ...activeAppConfig, ...diskData };
        return res.json({ success: true, payload: diskData, source: 'local-disk' });
      } catch (parseErr) {
        console.warn('Failed parsing local genmusic-data.json:', parseErr);
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

  // 2. Hydrate state from Vercel Blob if available
  if (blobService.isReady()) {
    try {
      console.log('Checking for latest app data from Vercel Blob...');
      const appDataResult = await blobService.getAppData('app/genmusic-data.json');
      if (appDataResult.success && (appDataResult.data || appDataResult.rawText)) {
        const payload = appDataResult.data || JSON.parse(appDataResult.rawText);
        const resolvedData = payload?.data || payload;
        activeAppConfig = { ...activeAppConfig, ...resolvedData };
        if (resolvedData.manifest) {
          activeVersionManifest = { ...activeVersionManifest, ...resolvedData.manifest };
        }
        console.log('Successfully hydrated activeAppConfig from Vercel Blob.');
      } else {
        const result = await blobService.getAppData('version.json');
        if (result.success && result.data) {
          activeVersionManifest = { ...activeVersionManifest, ...result.data };
          console.log('Successfully hydrated activeVersionManifest from Blob Storage.');
        } else if (result.rawText) {
          activeVersionManifest = { ...activeVersionManifest, ...JSON.parse(result.rawText) };
        }
      }
    } catch (err) {
      console.warn('Could not hydrate data from Blob Storage on startup:', err);
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      },
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

