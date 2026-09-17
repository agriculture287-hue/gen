import React, { useState, useEffect } from 'react';
import { TopBanner } from './components/TopBanner';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { WhyChooseSection } from './components/WhyChooseSection';
import { PremiumFeaturesSection } from './components/PremiumFeaturesSection';
import { ScreenshotsSection } from './components/ScreenshotsSection';
import { TelegramChannelsSection } from './components/TelegramChannelsSection';
import { DownloadAppSection } from './components/DownloadAppSection';
import { DownloadsPage } from './components/DownloadsPage';
import { UpdatesSection } from './components/UpdatesSection';
import { FAQSection } from './components/FAQSection';
import { BetaModal } from './components/BetaModal';
import { AdminModal } from './components/AdminModal';
import { 
  AdLeaderboard728x90, 
  AdBanner468x60, 
  AdNativeContainer 
} from './components/AdBanners';
import { getLocalVersionManifest, saveLocalVersionManifest, DEFAULT_VERSION_MANIFEST } from './data/versionManifest';
import { 
  getStoredReleases, 
  getStoredTelegramConfig, 
  getStoredChannels, 
  getStoredUpdates,
  saveStoredUpdates,
  isStoredAdminLoggedIn, 
  setStoredAdminLoggedIn,
  saveStoredReleases,
  saveStoredTelegramConfig,
  saveStoredChannels,
  resetAppToDefaults
} from './data/adminStore';
import { AppPlatformRelease, TelegramChannel, TelegramConfig, UpdateItem } from './types';
import { loadAppDataFromBlob, autoSaveAdminDataToBlob } from './lib/blobStorage';
import { AdminPage } from './pages/AdminPage';

export const App: React.FC = () => {
  const [activeNav, setActiveNav] = useState('home');
  const [currentPath, setCurrentPath] = useState(window.location.pathname.toLowerCase());
  const [betaModalOpen, setBetaModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Admin dynamic state persisted in localStorage
  const [platforms, setPlatforms] = useState<AppPlatformRelease[]>([]);
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>({
    contactUsername: '@genmusic_admin',
    contactUrl: 'https://t.me/genmusic_admin',
    announcementText: 'Direct APK download links, beta builds & 24/7 technical help.',
    supportHours: 'Admin Online 24/7'
  });
  const [channels, setChannels] = useState<TelegramChannel[]>([]);
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Load from adminStore on mount and sync with Vercel Blob
  useEffect(() => {
    // 1. Immediate local state hydration
    setPlatforms(getStoredReleases());
    setTelegramConfig(getStoredTelegramConfig());
    setChannels(getStoredChannels());
    setUpdates(getStoredUpdates());
    setIsAdminLoggedIn(isStoredAdminLoggedIn());

    // 2. Fetch latest live cloud state from Vercel Blob
    const fetchCloudState = async () => {
      try {
        const cloudRes = await loadAppDataFromBlob();
        if (cloudRes.success && cloudRes.data) {
          const cloudData = cloudRes.data;
          if (Array.isArray(cloudData.platforms) && cloudData.platforms.length > 0) {
            setPlatforms(cloudData.platforms);
            saveStoredReleases(cloudData.platforms);
          }
          if (cloudData.telegramConfig && cloudData.telegramConfig.contactUrl) {
            setTelegramConfig(cloudData.telegramConfig);
            saveStoredTelegramConfig(cloudData.telegramConfig);
          }
          if (Array.isArray(cloudData.channels) && cloudData.channels.length > 0) {
            setChannels(cloudData.channels);
            saveStoredChannels(cloudData.channels);
          }
          if (Array.isArray(cloudData.updates) && cloudData.updates.length > 0) {
            setUpdates(cloudData.updates);
            saveStoredUpdates(cloudData.updates);
          }
          if (cloudData.manifest) {
            saveLocalVersionManifest(cloudData.manifest);
          }
        }
      } catch (err) {
        console.warn('Vercel Blob remote fetch note:', err);
      }
    };

    fetchCloudState();

    const checkAdminRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      
      setCurrentPath(path);

      if (path.includes('chutiya') || hash.includes('chutiya') || search.includes('chutiya')) {
        setAdminModalOpen(true);
      }
    };

    checkAdminRoute();
    window.addEventListener('popstate', checkAdminRoute);
    window.addEventListener('hashchange', checkAdminRoute);

    return () => {
      window.removeEventListener('popstate', checkAdminRoute);
      window.removeEventListener('hashchange', checkAdminRoute);
    };
  }, []);

  const handleCloseAdmin = () => {
    setAdminModalOpen(false);
    // If accessed via /chutiya URL path or hash, smoothly reset back to clean root
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path.includes('chutiya') || hash.includes('chutiya')) {
      window.history.replaceState({}, '', '/');
    }
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

  const handleSavePlatforms = (updated: AppPlatformRelease[]) => {
    setPlatforms(updated);
    saveStoredReleases(updated);
    autoSaveAdminDataToBlob({
      platforms: updated,
      telegramConfig,
      channels,
      updates,
      manifest: getLocalVersionManifest(),
    });
  };

  const handleSaveTelegram = (updated: TelegramConfig) => {
    setTelegramConfig(updated);
    saveStoredTelegramConfig(updated);
    autoSaveAdminDataToBlob({
      platforms,
      telegramConfig: updated,
      channels,
      updates,
      manifest: getLocalVersionManifest(),
    });
  };

  const handleSaveChannels = (updated: TelegramChannel[]) => {
    setChannels(updated);
    saveStoredChannels(updated);
    autoSaveAdminDataToBlob({
      platforms,
      telegramConfig,
      channels: updated,
      updates,
      manifest: getLocalVersionManifest(),
    });
  };

  const handleSaveUpdates = (updated: UpdateItem[]) => {
    setUpdates(updated);
    saveStoredUpdates(updated);
    autoSaveAdminDataToBlob({
      platforms,
      telegramConfig,
      channels,
      updates: updated,
      manifest: getLocalVersionManifest(),
    });
  };

  const handleResetDefaults = () => {
    resetAppToDefaults();
    const defPlatforms = getStoredReleases();
    const defTg = getStoredTelegramConfig();
    const defChannels = getStoredChannels();
    const defUpdates = getStoredUpdates();
    const defManifest = DEFAULT_VERSION_MANIFEST;

    setPlatforms(defPlatforms);
    setTelegramConfig(defTg);
    setChannels(defChannels);
    setUpdates(defUpdates);

    autoSaveAdminDataToBlob({
      platforms: defPlatforms,
      telegramConfig: defTg,
      channels: defChannels,
      updates: defUpdates,
      manifest: defManifest,
    });
    showToast('Reset all configurations to factory defaults and saved to Vercel Blob!');
  };

  const handleLoginStateChange = (loggedIn: boolean) => {
    setIsAdminLoggedIn(loggedIn);
    setStoredAdminLoggedIn(loggedIn);
    if (loggedIn) {
      showToast('Admin logged in: Welcome Varanasi Admin!');
    } else {
      showToast('Admin logged out.');
    }
  };

  if (currentPath === '/admin' || currentPath.startsWith('/admin/')) {
    return <AdminPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* 1. Top Announcement Bar */}
      <TopBanner 
        onDownloadClick={scrollToDownload} 
        telegramLink={telegramConfig.contactUrl} 
      />

      {/* 2. Navigation with Brand, Multi-platform links & Telegram (Admin triggers hidden from UI) */}
      <Navbar 
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        onDownloadClick={scrollToDownload}
        telegramUrl={telegramConfig.contactUrl}
      />

      {/* Main Content Sections */}
      <main className="flex-grow">
        
        {/* 3. Hero Section */}
        <HeroSection 
          platforms={platforms}
          onSelectPlatformDownload={() => {
            scrollToDownload();
          }}
          onViewFeatures={scrollToFeatures}
          telegramUrl={telegramConfig.contactUrl}
        />

        {/* 4. Download Apps Section */}
        <DownloadAppSection 
          platforms={platforms}
          telegramConfig={telegramConfig}
          onOpenBetaModal={() => setBetaModalOpen(true)}
        />

        {/* Sponsored Leaderboard Banner (728x90) */}
        <AdLeaderboard728x90 />

        {/* 4.1 Production Multi-Platform Release Hub & Version Matrix */}
        <div id="downloads-hub">
          <DownloadsPage 
            manifest={getLocalVersionManifest() || DEFAULT_VERSION_MANIFEST}
            onOpenBetaModal={() => setBetaModalOpen(true)}
            telegramContactUrl={telegramConfig.contactUrl}
            isAdminLoggedIn={isAdminLoggedIn}
          />
        </div>

        {/* Sponsored Native In-Feed Container */}
        <AdNativeContainer />

        {/* 5. Official Telegram Channels & Contact Section */}
        <TelegramChannelsSection 
          telegramConfig={telegramConfig}
          channels={channels}
        />

        {/* 6. Why Choose GEN MUSIC Section */}
        <WhyChooseSection 
          onDownloadClick={scrollToDownload}
        />

        {/* Sponsored Compact Banner (468x60) */}
        <AdBanner468x60 />

        {/* 7. Complete Features Section */}
        <PremiumFeaturesSection 
          onDownloadClick={scrollToDownload}
        />

        {/* 8. App Interface Screenshots */}
        <ScreenshotsSection />

        {/* 9. Updates & Announcements (dynamic What's New from admin) */}
        <UpdatesSection 
          updates={updates}
          onDownloadClick={scrollToDownload}
        />

        {/* 10. Frequently Asked Questions */}
        <FAQSection />

      </main>

      {/* Admin Management Modal (Accessible via /chutiya) */}
      <AdminModal
        isOpen={adminModalOpen}
        onClose={handleCloseAdmin}
        isAdminLoggedIn={isAdminLoggedIn}
        onLogin={() => handleLoginStateChange(true)}
        onLoginSuccess={() => handleLoginStateChange(true)}
        onLogout={() => handleLoginStateChange(false)}
        platforms={platforms}
        onUpdatePlatforms={handleSavePlatforms}
        onSavePlatforms={handleSavePlatforms}
        telegramConfig={telegramConfig}
        onUpdateTelegramConfig={handleSaveTelegram}
        onSaveTelegramConfig={handleSaveTelegram}
        channels={channels}
        onUpdateChannels={handleSaveChannels}
        onSaveChannels={handleSaveChannels}
        updates={updates}
        onUpdateUpdates={handleSaveUpdates}
        onSaveUpdates={handleSaveUpdates}
        onResetDefaults={handleResetDefaults}
        onShowToast={showToast}
      />

      {/* Beta Modal */}
      <BetaModal
        isOpen={betaModalOpen}
        onClose={() => setBetaModalOpen(false)}
        onShowToast={showToast}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div 
          id="app-toast-alert"
          className="fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-800 text-xs sm:text-sm font-medium shadow-xl shadow-slate-300/40 backdrop-blur-xl animate-in slide-in-from-bottom-5 fade-in duration-300 flex items-center gap-3"
        >
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
          <span>{toastMessage}</span>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-700 ml-2 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

    </div>
  );
};

export default App;
