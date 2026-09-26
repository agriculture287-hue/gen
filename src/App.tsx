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
import { AndroidCarAppsSection } from './components/AndroidCarAppsSection';
import { MusicVisualizer3D } from './components/MusicVisualizer3D';
import { DownloadNoticeBanner } from './components/DownloadNoticeBanner';
import { DOWNLOAD_LINKS } from './data/downloadLinks';
import { AppPlatformRelease } from './types';
import { MusicPlayerProvider } from './context/MusicPlayerContext';
import { MiniPlayer } from './components/player/MiniPlayer';
import { FullPlayerModal } from './components/player/FullPlayerModal';
import { SyncedLyricsView } from './components/player/SyncedLyricsView';
import { QueueDrawer } from './components/player/QueueDrawer';
import { MusicDiscoveryView } from './components/player/MusicDiscoveryView';
import { CountryMusicSection } from './components/CountryMusicSection';
import { EchoMusicAcrossSection } from './components/EchoMusicAcrossSection';
import { ErrorBoundary } from './components/ErrorBoundary';

export const AppContent: React.FC = () => {
  const [activeNav, setActiveNav] = useState('home');
  const [currentMode, setCurrentMode] = useState<'player' | 'hub'>('hub');
  const [currentPath, setCurrentPath] = useState(window.location.pathname.toLowerCase());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [externalSearchQuery, setExternalSearchQuery] = useState<string | undefined>(undefined);

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

  const navigateTo = (targetPath: string, mode: 'player' | 'hub') => {
    try {
      if (window.location.pathname.toLowerCase() !== targetPath) {
        window.history.pushState({}, '', targetPath);
      }
    } catch {}
    setCurrentPath(targetPath);
    setCurrentMode(mode);
    if (mode === 'player') {
      setActiveNav('player');
      document.title = 'GEN MUSIC — Free Online Music Streaming & Synced Lyrics';
    } else if (targetPath === '/download' || targetPath === '/downloads') {
      setActiveNav('download');
      document.title = 'GEN MUSIC — Download for Android, Mac & Windows';
    } else {
      setActiveNav('home');
      document.title = 'GEN MUSIC 2.4 — Free Music Streaming & Hi-Fi Audio App';
    }
  };

  useEffect(() => {
    const checkRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      
      if (path === '/download' || path === '/downloads' || hash === '#/download' || hash === '#download') {
        setCurrentPath('/download');
        setCurrentMode('hub');
        setActiveNav('download');
        document.title = 'GEN MUSIC — Download for Android, Mac & Windows';
      } else if (path === '/online' || path === '/player' || path === '/stream' || path === '/streaming' || hash === '#online' || hash === '#/online' || hash === '#player' || hash === '#/player') {
        setCurrentPath('/online');
        setCurrentMode('player');
        setActiveNav('player');
        document.title = 'GEN MUSIC — Free Online Music Streaming & Synced Lyrics';
      } else if (hash === '#echo-music-across' || hash === '#echo-music') {
        setCurrentPath(path);
        setCurrentMode('hub');
        setActiveNav('echo-music-across');
        setTimeout(() => {
          const el = document.getElementById('echo-music-across');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else if (hash === '#country-music') {
        setCurrentPath(path);
        setCurrentMode('hub');
        setActiveNav('country-music');
        setTimeout(() => {
          const el = document.getElementById('country-music-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        setCurrentPath(path);
        if (currentMode === 'player' && path !== '/online') {
          setCurrentMode('hub');
        }
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
    setCurrentMode('hub');
    setActiveNav('download');
    setTimeout(() => {
      const el = document.getElementById('download');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const scrollToFeatures = () => {
    setCurrentMode('hub');
    setActiveNav('features');
    setTimeout(() => {
      const el = document.getElementById('features');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  return (
    <div className="min-h-screen bg-[#07080e] text-slate-100 flex flex-col font-sans selection:bg-cyan-400 selection:text-black relative overflow-x-hidden">
      
      {/* Background ambient futuristic glow orbs */}
      <div className="fixed top-20 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-10 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-20 left-10 w-96 h-96 bg-pink-600/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* 1. Top Announcement Bar (Hidden in app player mode) */}
      {currentMode !== 'player' && currentPath !== '/online' && (
        <TopBanner 
          onDownloadClick={scrollToDownload} 
          announcementText="GEN MUSIC 2.4 (GPL-3.0) — Unlimited Free Streaming, Synced Lyrics & Offline Apps for Android, Mac & Windows."
        />
      )}

      {/* 2. Navigation with Brand, Multi-platform links & Telegram */}
      <Navbar 
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        onDownloadClick={scrollToDownload}
        currentMode={currentMode}
        onSwitchMode={(mode) => {
          if (mode === 'player') {
            navigateTo('/online', 'player');
          } else {
            navigateTo('/', 'hub');
          }
        }}
      />

      {/* Main Content Sections */}
      <main className="flex-grow">
        
        {/* Toggle between Online Music Discovery Player and Downloads Hub */}
        {currentMode === 'player' && currentPath !== '/download' && currentPath !== '/downloads' ? (
          <div>
            <MusicDiscoveryView 
              initialSearchQuery={externalSearchQuery}
              onClearInitialQuery={() => setExternalSearchQuery(undefined)}
            />
          </div>
        ) : (
          <div>
            {currentPath === '/download' || currentPath === '/downloads' ? (
              <DownloadsPage />
            ) : (
              <>
                {/* 3. Hero Section with Redirection Button with Hyperlink to /online */}
                <HeroSection 
                  platforms={platforms}
                  onSelectPlatformDownload={() => scrollToDownload()}
                  onViewFeatures={scrollToFeatures}
                  onLaunchOnlinePlayer={() => {
                    navigateTo('/online', 'player');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />

                {/* 4. Unified Multi-Platform Download & Release Hub */}
                <DownloadAppSection 
                  platforms={platforms}
                />

                {/* 5. Why Choose GEN MUSIC Section */}
                <WhyChooseSection 
                  onDownloadClick={scrollToDownload}
                />

                {/* 6. Android Auto & Car Apps Section */}
                <AndroidCarAppsSection 
                  onDownloadClick={scrollToDownload}
                />

                {/* 7. Dynamic 3D Spatial Music Visualizer Engine */}
                <MusicVisualizer3D />

                {/* 8. Complete Features Section */}
                <PremiumFeaturesSection 
                  onDownloadClick={scrollToDownload}
                />

                {/* 9. App Interface Screenshots */}
                <ScreenshotsSection />

                {/* 10. Updates & Announcements */}
                <UpdatesSection 
                  onDownloadClick={scrollToDownload}
                />

                {/* 11. Frequently Asked Questions */}
                <FAQSection />
              </>
            )}
          </div>
        )}

      </main>

      {/* Main App Footer (Hidden in app player mode) */}
      {currentMode !== 'player' && currentPath !== '/online' && (
        <Footer 
          onOpenLegalModal={handleOpenLegalModal}
          onDownloadClick={scrollToDownload}
        />
      )}

      {/* Advisory Notice Banner for Download Sponsor & 5-Min Cooldown Direct Download (Hidden in streaming mode) */}
      <DownloadNoticeBanner isStreamingMode={currentMode === 'player'} />

      {/* Persistent Mini Player (Always docked at bottom across all pages) */}
      <MiniPlayer />

      {/* Full Screen Player Modal */}
      <FullPlayerModal />

      {/* Synced Lyrics Modal / Drawer */}
      <SyncedLyricsView />

      {/* Play Queue Drawer */}
      <QueueDrawer />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div 
          id="app-toast-alert"
          className="fixed bottom-24 right-6 z-50 px-5 py-3.5 rounded-2xl bg-[#0d1020]/95 border border-cyan-500/40 text-white text-xs sm:text-sm font-mono shadow-[0_0_25px_rgba(0,240,255,0.2)] backdrop-blur-xl animate-in slide-in-from-bottom-5 fade-in duration-300 flex items-center gap-3"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>{toastMessage}</span>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-cyan-300 ml-2 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <MusicPlayerProvider>
        <AppContent />
      </MusicPlayerProvider>
    </ErrorBoundary>
  );
};

export default App;

