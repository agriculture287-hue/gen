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
import { UpdateModal } from './components/UpdateModal';
import { useAutoUpdate } from './hooks/useAutoUpdate';
import { getLocalVersionManifest, DEFAULT_VERSION_MANIFEST } from './data/versionManifest';
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

export const App: React.FC = () => {
  const [activeNav, setActiveNav] = useState('home');
  const [betaModalOpen, setBetaModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-Update Engine Hook (handles Capacitor on Android and Electron on Win/Mac, with 6h cache)
  const {
    updateInfo,
    isChecking,
    isDownloading,
    downloadProgress,
    isUpdateModalOpen,
    isForceUpdateScreen,
    detectedPlatform,
    installedVersion,
    checkNow,
    triggerDownload,
    installAndRestart,
    dismissUpdate,
    openUpdateModal,
    closeUpdateModal,
    simulateVersionCheck,
  } = useAutoUpdate();

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

  // Load from adminStore on mount and listen to /chutiya route
  useEffect(() => {
    setPlatforms(getStoredReleases());
    setTelegramConfig(getStoredTelegramConfig());
    setChannels(getStoredChannels());
    setUpdates(getStoredUpdates());
    setIsAdminLoggedIn(isStoredAdminLoggedIn());

    const checkAdminRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
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
  };

  const handleSaveTelegram = (updated: TelegramConfig) => {
    setTelegramConfig(updated);
    saveStoredTelegramConfig(updated);
  };

  const handleSaveChannels = (updated: TelegramChannel[]) => {
    setChannels(updated);
    saveStoredChannels(updated);
  };

  const handleSaveUpdates = (updated: UpdateItem[]) => {
    setUpdates(updated);
    saveStoredUpdates(updated);
  };

  const handleResetDefaults = () => {
    resetAppToDefaults();
    setPlatforms(getStoredReleases());
    setTelegramConfig(getStoredTelegramConfig());
    setChannels(getStoredChannels());
    setUpdates(getStoredUpdates());
    showToast('Reset all configurations to factory defaults!');
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

        {/* 4.1 Production Multi-Platform Release Hub & Version Matrix */}
        <div id="downloads-hub">
          <DownloadsPage 
            manifest={getLocalVersionManifest() || DEFAULT_VERSION_MANIFEST}
            onOpenBetaModal={() => setBetaModalOpen(true)}
            telegramContactUrl={telegramConfig.contactUrl}
          />
        </div>

        {/* 5. Official Telegram Channels & Contact Section */}
        <TelegramChannelsSection 
          telegramConfig={telegramConfig}
          channels={channels}
        />

        {/* 6. Why Choose GEN MUSIC Section */}
        <WhyChooseSection 
          onDownloadClick={scrollToDownload}
        />

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

      {/* Production Auto-Update Modal (Mandatory & Optional states) */}
      <UpdateModal
        isOpen={isUpdateModalOpen}
        updateInfo={updateInfo}
        isDownloading={isDownloading}
        downloadProgress={downloadProgress}
        onDownload={triggerDownload}
        onDismiss={dismissUpdate}
        onInstallAndRestart={installAndRestart}
        detectedPlatform={detectedPlatform}
        installedVersion={installedVersion}
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
