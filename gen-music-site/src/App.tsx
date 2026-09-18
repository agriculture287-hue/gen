import React, { useState, useEffect } from 'react';
import { TopBanner } from './components/TopBanner';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { WhyChooseSection } from './components/WhyChooseSection';
import { PremiumFeaturesSection } from './components/PremiumFeaturesSection';
import { ScreenshotsSection } from './components/ScreenshotsSection';
import { TelegramChannelsSection } from './components/TelegramChannelsSection';
import { DownloadAppSection } from './components/DownloadAppSection';
import { UpdatesSection } from './components/UpdatesSection';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';
import { BetaModal } from './components/BetaModal';
import { DownloadsPage } from './components/DownloadsPage';
import { InAppUpdateModal } from './components/InAppUpdateModal';
import { AddUpdateByLinkModal } from './components/AddUpdateByLinkModal';
import { 
  AdLeaderboard728x90, 
  AdBanner468x60, 
  AdNativeContainer,
  AdBanner300x250,
  AdBanner320x50,
  AdBanner160x300,
  AdBanner160x600,
  AdSideSkyscrapers,
  AdStickyBottomBar,
  AdResponsiveLeaderboard,
  AdShowcaseSection,
  AdMultiplyMatrix10x,
  AdDirectSponsorLink
} from './components/AdBanners';
import { getLocalVersionManifest, saveLocalVersionManifest, DEFAULT_VERSION_MANIFEST } from './data/versionManifest';
import { 
  getStoredReleases, 
  getStoredTelegramConfig, 
  getStoredChannels, 
  getStoredUpdates,
  saveStoredUpdates,
  getStoredAdSettings,
  saveStoredAdSettings,
  isStoredAdminLoggedIn, 
  setStoredAdminLoggedIn,
  saveStoredReleases,
  saveStoredTelegramConfig,
  saveStoredChannels,
  resetAppToDefaults
} from './data/adminStore';
import { AppPlatformRelease, TelegramChannel, TelegramConfig, UpdateItem, AdSettings } from './types';
import { loadAppDataFromBlob, autoSaveAdminDataToBlob } from './lib/blobStorage';
import { AdminPage } from './pages/AdminPage';

export const App: React.FC = () => {
  const [activeNav, setActiveNav] = useState('home');
  const [currentPath, setCurrentPath] = useState(window.location.pathname.toLowerCase());
  const [betaModalOpen, setBetaModalOpen] = useState(false);
  const [addUpdateByLinkModalOpen, setAddUpdateByLinkModalOpen] = useState(false);
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
  const [adSettings, setAdSettings] = useState(() => getStoredAdSettings());

  // Load from adminStore on mount and sync with Vercel Blob
  useEffect(() => {
    // 1. Immediate local state hydration
    const initialPlatforms = getStoredReleases().filter(p => p.platform !== 'linux' && p.platform !== 'web' && p.id !== 'app-linux' && p.id !== 'app-web');
    setPlatforms(initialPlatforms);
    setTelegramConfig(getStoredTelegramConfig());
    setChannels(getStoredChannels());
    setUpdates(getStoredUpdates());
    setIsAdminLoggedIn(isStoredAdminLoggedIn());
    setAdSettings(getStoredAdSettings());

    // 2. Fetch latest live cloud state from Vercel Blob & app-version.json
    const fetchCloudState = async () => {
      try {
        // Also fetch app-version.json to get direct admin configured URLs and versions
        try {
          const appVerRes = await fetch(`/app-version.json?t=${Date.now()}`);
          if (appVerRes.ok) {
            const appVerData = await appVerRes.json();
            if (appVerData?.latest_version) {
              setPlatforms(prevPlatforms => {
                const current = (prevPlatforms.length > 0 ? prevPlatforms : getStoredReleases())
                  .filter(p => p.platform !== 'linux' && p.platform !== 'web' && p.id !== 'app-linux' && p.id !== 'app-web');
                return current.map(p => {
                  let dUrl = p.downloadUrl;
                  if (appVerData.download_url) {
                    if (p.platform === 'android' && appVerData.download_url.android) {
                      dUrl = appVerData.download_url.android;
                    } else if (p.platform === 'windows' && appVerData.download_url.windows) {
                      dUrl = appVerData.download_url.windows;
                    } else if ((p.platform === 'mac' || p.platform === 'macos') && appVerData.download_url.macos) {
                      dUrl = appVerData.download_url.macos;
                    }
                  }
                  return {
                    ...p,
                    version: appVerData.latest_version,
                    downloadUrl: dUrl
                  };
                });
              });
            }
          }
        } catch (appVerErr) {
          console.warn('app-version.json fetch note:', appVerErr);
        }

        const cloudRes = await loadAppDataFromBlob();
        if (cloudRes.success && cloudRes.data) {
          const cloudData = cloudRes.data;
          if (Array.isArray(cloudData.platforms) && cloudData.platforms.length > 0) {
            const filteredPlatforms = cloudData.platforms.filter((p: any) => p.platform !== 'linux' && p.platform !== 'web' && p.id !== 'app-linux' && p.id !== 'app-web');
            setPlatforms(filteredPlatforms);
            saveStoredReleases(filteredPlatforms);
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
          if (cloudData.adSettings) {
            setAdSettings(cloudData.adSettings);
            saveStoredAdSettings(cloudData.adSettings);
            window.dispatchEvent(new Event('genmusic_ads_updated'));
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
      setCurrentPath(path);
    };

    checkAdminRoute();
    window.addEventListener('popstate', checkAdminRoute);
    window.addEventListener('hashchange', checkAdminRoute);

    return () => {
      window.removeEventListener('popstate', checkAdminRoute);
      window.removeEventListener('hashchange', checkAdminRoute);
    };
  }, []);

  // Dynamically load Adsterra Popunder / Social Bar scripts if enabled
  useEffect(() => {
    if (!adSettings.enableAds) {
      // Remove any existing script elements with our custom ad-scripts attribute
      const existing = document.querySelectorAll('script[data-ad-type="popunder"]');
      existing.forEach(el => el.remove());
      return;
    }

    const scriptsToLoad = [adSettings.popunderScriptUrl1, adSettings.popunderScriptUrl2].filter(Boolean);

    scriptsToLoad.forEach(url => {
      // Avoid duplicates
      if (document.querySelector(`script[src="${url}"]`)) return;

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = url;
      script.async = true;
      script.setAttribute('data-ad-type', 'popunder');
      
      script.onerror = () => {
        console.warn(`Dynamic ad script failed to load: ${url}`);
      };

      document.head.appendChild(script);
    });

    return () => {
      // Cleanup on unmount or setting changes
      const existing = document.querySelectorAll('script[data-ad-type="popunder"]');
      existing.forEach(el => el.remove());
    };
  }, [adSettings.enableAds, adSettings.popunderScriptUrl1, adSettings.popunderScriptUrl2]);

  const handleOpenLegalModal = (type: 'privacy' | 'terms' | 'support' | 'contact') => {
    showToast(`Opening ${type.toUpperCase()} policy document...`);
    if (type === 'contact' || type === 'support') {
      window.open(telegramConfig.contactUrl, '_blank');
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
      adSettings,
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
      adSettings,
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
      adSettings,
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
      adSettings,
      manifest: getLocalVersionManifest(),
    });
  };

  const handleSaveAdSettings = (updated: AdSettings) => {
    setAdSettings(updated);
    saveStoredAdSettings(updated);
    autoSaveAdminDataToBlob({
      platforms,
      telegramConfig,
      channels,
      updates,
      adSettings: updated,
      manifest: getLocalVersionManifest(),
    });
    window.dispatchEvent(new Event('genmusic_ads_updated'));
  };

  const handleResetDefaults = () => {
    resetAppToDefaults();
    const defPlatforms = getStoredReleases();
    const defTg = getStoredTelegramConfig();
    const defChannels = getStoredChannels();
    const defUpdates = getStoredUpdates();
    const defAds = getStoredAdSettings();
    const defManifest = DEFAULT_VERSION_MANIFEST;

    setPlatforms(defPlatforms);
    setTelegramConfig(defTg);
    setChannels(defChannels);
    setUpdates(defUpdates);
    setAdSettings(defAds);

    autoSaveAdminDataToBlob({
      platforms: defPlatforms,
      telegramConfig: defTg,
      channels: defChannels,
      updates: defUpdates,
      adSettings: defAds,
      manifest: defManifest,
    });
    window.dispatchEvent(new Event('genmusic_ads_updated'));
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

  if (currentPath === '/download' || currentPath === '/downloads') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white relative">
        <DownloadsPage 
          manifest={getLocalVersionManifest() || DEFAULT_VERSION_MANIFEST}
          isAdminLoggedIn={isAdminLoggedIn} 
        />
        <Footer 
          onOpenLegalModal={handleOpenLegalModal}
          onDownloadClick={() => {}}
          onOpenAdmin={() => {}}
          isAdminLoggedIn={isAdminLoggedIn}
          telegramUrl={telegramConfig.contactUrl}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white relative">
      
      {/* Fixed Side Gutters Skyscraper Ads (160x600 Left & Right on Desktop) */}
      <AdSideSkyscrapers />

      {/* 1. Top Announcement Bar */}
      <TopBanner 
        onDownloadClick={scrollToDownload} 
        telegramLink={telegramConfig.contactUrl} 
        announcementText={telegramConfig.announcementText}
      />

      {/* 2. Navigation with Brand, Multi-platform links & Telegram (Admin triggers hidden from UI) */}
      <Navbar 
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        onDownloadClick={scrollToDownload}
        telegramUrl={telegramConfig.contactUrl}
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
          telegramUrl={telegramConfig.contactUrl}
        />

        {/* Top Responsive Leaderboard (728x90 on desktop / 320x50 on mobile) */}
        <AdResponsiveLeaderboard className="my-6" />

        {/* 4. Unified Multi-Platform Download & Release Hub */}
        <DownloadAppSection 
          platforms={platforms}
          telegramConfig={telegramConfig}
          manifest={getLocalVersionManifest() || DEFAULT_VERSION_MANIFEST}
          isAdminLoggedIn={isAdminLoggedIn}
          onOpenBetaModal={() => setBetaModalOpen(true)}
        />

        {/* Sponsored Native In-Feed Container */}
        <AdNativeContainer />

        {/* 5. Official Telegram Channels & Contact Section */}
        <TelegramChannelsSection 
          telegramConfig={telegramConfig}
          channels={channels}
        />

        {/* Sponsored Medium Rectangle (300x250) & Vertical Banner (160x300) Cluster */}
        <div className="w-full max-w-6xl mx-auto px-4 my-8">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <AdBanner300x250 />
            <AdBanner160x300 />
            <AdBanner300x250 />
          </div>
        </div>

        {/* 6. Why Choose GEN MUSIC Section */}
        <WhyChooseSection 
          onDownloadClick={scrollToDownload}
        />

        {/* Sponsored Compact Banner (468x60) */}
        <AdBanner468x60 />

        {/* All-In-One Dedicated Sponsored Media & Partner Ad Units Showcase */}
        <AdShowcaseSection />

        {/* 7. Complete Features Section */}
        <PremiumFeaturesSection 
          onDownloadClick={scrollToDownload}
        />

        {/* Mid-Page Responsive Leaderboard (728x90 / 320x50) */}
        <AdResponsiveLeaderboard className="my-8" />

        {/* 8. App Interface Screenshots */}
        <ScreenshotsSection />

        {/* High-Impact Skyscraper (160x600), Medium Rectangle (300x250), and Mobile Banner (320x50) Grid */}
        <div className="w-full max-w-6xl mx-auto px-4 my-10 flex flex-wrap items-center justify-center gap-6 sm:gap-8">
          <AdBanner160x600 />
          <div className="flex flex-col items-center justify-center gap-4">
            <AdBanner300x250 />
            <AdBanner320x50 />
            <AdBanner468x60 />
          </div>
          <AdBanner160x600 />
        </div>

        {/* 9. Updates & Announcements (dynamic What's New from admin) */}
        <UpdatesSection 
          updates={updates}
          onDownloadClick={scrollToDownload}
          onOpenAddUpdateByLink={() => setAddUpdateByLinkModalOpen(true)}
        />

        {/* Second Sponsored Native In-Feed Unit */}
        <AdNativeContainer />

        {/* 10. Frequently Asked Questions */}
        <FAQSection />

        {/* Pre-Footer Responsive Leaderboard Ad */}
        <AdResponsiveLeaderboard className="my-10" />

        {/* 10x Ad Multiplier Matrix Block (End of Page Content) */}
        <AdMultiplyMatrix10x />

      </main>

      {/* Main App Footer */}
      <Footer 
        onOpenLegalModal={handleOpenLegalModal}
        onDownloadClick={scrollToDownload}
        onOpenAdmin={() => { window.location.pathname = '/admin'; }}
        isAdminLoggedIn={isAdminLoggedIn}
        telegramUrl={telegramConfig.contactUrl}
      />

      {/* Persistent Floating Sticky Bottom Ad Banner (Always visible while scrolling) */}
      <AdStickyBottomBar />

      {/* Beta Modal */}
      <BetaModal
        isOpen={betaModalOpen}
        onClose={() => setBetaModalOpen(false)}
        onShowToast={showToast}
      />

      {/* In-App Update Trigger & Notification Modal */}
      <InAppUpdateModal
        telegramUrl={telegramConfig.contactUrl}
      />

      {/* Add App Update by Link Modal */}
      <AddUpdateByLinkModal
        isOpen={addUpdateByLinkModalOpen}
        onClose={() => setAddUpdateByLinkModalOpen(false)}
        onShowToast={showToast}
        onSuccess={(newVer, plat) => {
          showToast(`Published v${newVer} (${plat}) update by link!`);
          // Refresh local releases & manifest
          setPlatforms(getStoredReleases());
          setUpdates(getStoredUpdates());
        }}
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
