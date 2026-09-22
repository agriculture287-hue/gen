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
import { DOWNLOAD_LINKS } from './data/downloadLinks';
import { AppPlatformRelease } from './types';

export const App: React.FC = () => {
  const [activeNav, setActiveNav] = useState('home');
  const [currentPath, setCurrentPath] = useState(window.location.pathname.toLowerCase());
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
      const path = window.location.pathname.toLowerCase();
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



  if (currentPath === '/download' || currentPath === '/downloads') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white relative">
        <DownloadsPage />
        <Footer 
          onOpenLegalModal={handleOpenLegalModal}
          onDownloadClick={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080e] text-slate-100 flex flex-col font-sans selection:bg-cyan-400 selection:text-black relative overflow-x-hidden">
      
      {/* Background ambient futuristic glow orbs */}
      <div className="fixed top-20 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-10 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-20 left-10 w-96 h-96 bg-pink-600/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* 1. Top Announcement Bar */}
      <TopBanner 
        onDownloadClick={scrollToDownload} 
        announcementText="GEN MUSIC Official Release is Available Now — Download for Android, Android Car, Mac & Windows."
      />

      {/* 2. Navigation with Brand, Multi-platform links & Telegram */}
      <Navbar 
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        onDownloadClick={scrollToDownload}
      />

      {/* Main Content Sections */}
      <main className="flex-grow pb-28">
        
        {/* 3. Hero Section */}
        <HeroSection 
          platforms={platforms}
          onSelectPlatformDownload={() => {
            scrollToDownload();
          }}
          onViewFeatures={scrollToFeatures}
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

      </main>

      {/* Main App Footer */}
      <Footer 
        onOpenLegalModal={handleOpenLegalModal}
        onDownloadClick={scrollToDownload}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div 
          id="app-toast-alert"
          className="fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl bg-[#0d1020]/95 border border-cyan-500/40 text-white text-xs sm:text-sm font-mono shadow-[0_0_25px_rgba(0,240,255,0.2)] backdrop-blur-xl animate-in slide-in-from-bottom-5 fade-in duration-300 flex items-center gap-3"
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

export default App;
