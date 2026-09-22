import React, { useState, useEffect } from 'react';
import { TopBanner } from './components/TopBanner';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { WhyChooseSection } from './components/WhyChooseSection';
import { PremiumFeaturesSection } from './components/PremiumFeaturesSection';
import { ScreenshotsSection } from './components/ScreenshotsSection';
import { DownloadAppSection } from './components/DownloadAppSection';
import { UpdatesSection } from './components/UpdatesSection';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';
import { DownloadsPage } from './components/DownloadsPage';
import { SharePage } from './components/SharePage';
import { AndroidCarAppsSection } from './components/AndroidCarAppsSection';
import { MusicVisualizer3D } from './components/MusicVisualizer3D';
import { 
  AdNativeContainer,
  AdBanner300x250,
  AdBanner320x50,
  AdBanner468x60,
  AdBanner160x300,
  AdBanner160x600,
  AdSideSkyscrapers,
  AdResponsiveLeaderboard,
  AdShowcaseSection,
  AdMultiplyMatrix10x
} from './components/AdBanners';
import { DOWNLOAD_LINKS } from './data/downloadLinks';
import { AppPlatformRelease } from './types';

export const App: React.FC = () => {
  const [activeNav, setActiveNav] = useState('home');
  
  // Helper to normalize paths but preserve case for share routes (case-sensitive YouTube video IDs)
  const getNormalizedPath = (rawPath: string) => {
    if (rawPath.startsWith('/share/')) {
      return rawPath;
    }
    return rawPath.toLowerCase();
  };

  const [currentPath, setCurrentPath] = useState(getNormalizedPath(window.location.pathname));
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Statically mapped platforms based on downloadLinks.ts
  const platforms: AppPlatformRelease[] = [
    {
      id: 'app-android',
      name: 'GEN MUSIC for Android',
      platform: 'android',
      version: DOWNLOAD_LINKS.version,
      fileFormat: '.apk',
      fileSize: DOWNLOAD_LINKS.android.fileSize,
      releaseDate: DOWNLOAD_LINKS.releaseDate,
      minSystem: DOWNLOAD_LINKS.android.minSystem,
      downloadUrl: DOWNLOAD_LINKS.android.downloadUrl,
      mirrorUrl: DOWNLOAD_LINKS.android.downloadUrl,
      architecture: DOWNLOAD_LINKS.android.architecture,
      badge: 'Direct APK',
      changelog: [
        'Dolby Audio 3D spatial surround sound engine',
        'Batch offline MP3 downloader up to 320kbps',
        'Unified free music catalog with unlimited streaming',
        'Zero audio advertising interruptions'
      ],
      isFeatured: true,
    },
    {
      id: 'app-mac',
      name: 'GEN MUSIC for macOS',
      platform: 'mac',
      version: DOWNLOAD_LINKS.version,
      fileFormat: '.dmg',
      fileSize: DOWNLOAD_LINKS.macos.fileSize,
      releaseDate: DOWNLOAD_LINKS.releaseDate,
      minSystem: DOWNLOAD_LINKS.macos.minSystem,
      downloadUrl: DOWNLOAD_LINKS.macos.downloadUrl,
      mirrorUrl: DOWNLOAD_LINKS.macos.downloadUrl,
      architecture: DOWNLOAD_LINKS.macos.architecture,
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
      version: DOWNLOAD_LINKS.version,
      fileFormat: '.exe',
      fileSize: DOWNLOAD_LINKS.windows.fileSize,
      releaseDate: DOWNLOAD_LINKS.releaseDate,
      minSystem: DOWNLOAD_LINKS.windows.minSystem,
      downloadUrl: DOWNLOAD_LINKS.windows.downloadUrl,
      mirrorUrl: DOWNLOAD_LINKS.windows.downloadUrl,
      architecture: DOWNLOAD_LINKS.windows.architecture,
      badge: 'Windows Installer',
      changelog: [
        'Direct hardware audio acceleration (WASAPI exclusive mode)',
        'Tray minimize and background audio service',
        'Offline MP3 batch download manager',
        'Custom local music folder scanning and tag editor'
      ],
      isFeatured: true,
    }
  ];

  useEffect(() => {
    const checkRoute = () => {
      const rawPath = window.location.pathname;
      const path = rawPath.startsWith('/share/') ? rawPath : rawPath.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/download' || path === '/downloads' || hash === '#/download' || hash === '#download') {
        setCurrentPath('/download');
      } else {
        setCurrentPath(path);
      }
    };

    checkRoute();
    window.addEventListener('popstate', checkRoute);
    window.addEventListener('hashchange', checkRoute);

    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('hashchange', checkRoute);
    };
  }, []);

  // Ensure any popup/popunder ad scripts are completely removed
  useEffect(() => {
    const existing = document.querySelectorAll('script[data-ad-type="popunder"]');
    existing.forEach(el => el.remove());
  }, []);

  const handleOpenLegalModal = (type: 'privacy' | 'terms' | 'support' | 'contact') => {
    showToast(`Opening ${type.toUpperCase()} policy document...`);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current));
    }, 4000);
  };

  const scrollToDownload = () => {
    const el = document.getElementById('download');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToFeatures = () => {
    const el = document.getElementById('features');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };



  // Check if explicit download portal requested
  if (currentPath === '/download' || currentPath === '/downloads') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-slate-100 flex flex-col font-sans selection:bg-[#00E676] selection:text-black relative">
        <DownloadsPage />
        <Footer 
          onOpenLegalModal={handleOpenLegalModal}
          onDownloadClick={() => {}}
        />
      </div>
    );
  }

  // Determine share ID from path (/share/:id), search param (?id=... or ?videoId=...), or default to 'B8uJqlSiJQ4'
  let shareId = 'B8uJqlSiJQ4';
  let shareType: 'song' | 'album' | 'playlist' | 'artist' = 'song';

  if (currentPath.startsWith('/share/')) {
    const rawSharePart = currentPath.slice('/share/'.length).split('?')[0]?.split('#')[0] || '';
    const segments = rawSharePart.split('/').filter(Boolean);
    if (segments.length >= 2 && ['song', 'album', 'playlist', 'artist'].includes(segments[0].toLowerCase())) {
      shareType = segments[0].toLowerCase() as any;
      shareId = segments[1];
    } else if (segments.length >= 1) {
      shareId = segments[0];
    }
  } else if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const queryId = urlParams.get('id') || urlParams.get('videoId');
    if (queryId) {
      shareId = queryId;
    }
  }

  // Render the GEN Music Share Page
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-100 flex flex-col font-sans selection:bg-[#00E676] selection:text-black relative">
      <SharePage 
        videoId={shareId}
        type={shareType}
        onNavigateDownload={() => {
          window.history.pushState({}, '', '/download');
          setCurrentPath('/download');
        }}
        onNavigateHome={() => {
          window.history.pushState({}, '', '/share/B8uJqlSiJQ4');
          setCurrentPath('/share/B8uJqlSiJQ4');
        }} 
      />
    </div>
  );
};

export default App;
