import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  Download, 
  Smartphone,
  Monitor,
  Laptop
} from 'lucide-react';
import { GenMusicLogo } from './GenMusicLogo';
import { detectUserDevice, DeviceInfo } from '../utils/deviceDetector';
import { triggerSponsorHyperlink } from '../utils/downloadHelper';

interface NavbarProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
  onDownloadClick: () => void;
  currentMode?: 'player' | 'hub';
  onSwitchMode?: (mode: 'player' | 'hub') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeNav,
  setActiveNav,
  onDownloadClick,
  currentMode = 'player',
  onSwitchMode,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    platform: 'android',
    recommendedFileFormat: '.apk',
    platformName: 'Android',
    isMobile: true,
    rawOS: 'Android',
  });

  useEffect(() => {
    setDeviceInfo(detectUserDevice());

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const navLinks = currentMode === 'player' ? [
    { id: 'home-hub', label: '🏠 Home & Downloads' },
    { id: 'player', label: '🎵 Online Streaming' },
  ] : [
    { id: 'player', label: '🎵 Play Online' },
    { id: 'download', label: '📥 Download App' },
    { id: 'features', label: '⚡ Features' },
    { id: 'screenshots', label: '📱 Screenshots' },
    { id: 'faq', label: 'FAQ' },
  ];

  const handleNavClick = (id: string) => {
    setActiveNav(id);
    setMobileMenuOpen(false);

    if (id === 'home-hub') {
      if (onSwitchMode) onSwitchMode('hub');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (id === 'player') {
      if (currentMode !== 'player') {
        triggerSponsorHyperlink(() => {
          if (onSwitchMode) onSwitchMode('player');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    if (id === 'echo-music-across') {
      const el = document.getElementById('echo-music-across');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else if (onSwitchMode) {
        onSwitchMode('hub');
        setTimeout(() => {
          const target = document.getElementById('echo-music-across');
          if (target) target.scrollIntoView({ behavior: 'smooth' });
        }, 80);
      }
      return;
    }

    if (id === 'country-music') {
      // If in hub mode, scroll to country-music-section; if in player mode, can stay in player or open section
      const el = document.getElementById('country-music-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else if (onSwitchMode) {
        onSwitchMode('hub');
        setTimeout(() => {
          const target = document.getElementById('country-music-section');
          if (target) target.scrollIntoView({ behavior: 'smooth' });
        }, 80);
      }
      return;
    }

    if (id === 'download') {
      if (onSwitchMode) onSwitchMode('hub');
      setTimeout(() => {
        const el = document.getElementById('download');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
      return;
    }

    if (onSwitchMode) onSwitchMode('hub');
    setTimeout(() => {
      const targetElement = document.getElementById(id);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  return (
    <nav 
      id="main-navbar" 
      aria-label="Main Navigation"
      className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-[#070912]/85 border-b border-white/10 transition-all shadow-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Name */}
        <div 
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
          id="navbar-brand-logo"
        >
          <div className="relative">
            <GenMusicLogo size="md" glow={true} />
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 pointer-events-none">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-heading">
                GEN <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent">MUSIC</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                v2.4
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 tracking-wider -mt-0.5 hidden sm:block uppercase">
              Spatial Audio System
            </span>
          </div>
        </div>

        {/* Center Nav Links - Desktop */}
        <div className="hidden lg:flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.03] border border-white/10">
          {navLinks.map((link) => {
            const isActive = activeNav === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {/* PWA Install Button */}
          {isInstallable && (
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-xs font-semibold hover:bg-cyan-500/30 transition cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.2)]"
              title="Install Gen Music App"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Install Web App</span>
            </button>
          )}

          {/* Primary CTA with Device Suggestion */}
          <button
            onClick={onDownloadClick}
            id="navbar-download-cta"
            className="hidden sm:inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:opacity-95 transition transform hover:-translate-y-0.5 cursor-pointer"
          >
            {deviceInfo.platform === 'android' ? (
              <Smartphone className="w-3.5 h-3.5 text-cyan-200" />
            ) : deviceInfo.platform === 'windows' ? (
              <Monitor className="w-3.5 h-3.5 text-blue-200" />
            ) : deviceInfo.platform === 'macos' ? (
              <Laptop className="w-3.5 h-3.5 text-purple-200" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>
              {deviceInfo.platform === 'android' ? 'Download APK' :
               deviceInfo.platform === 'windows' ? 'Download EXE' :
               deviceInfo.platform === 'macos' ? 'Download DMG' :
               'Get Apps'}
            </span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer border border-white/10"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0a0d18] border-b border-white/10 px-4 pt-2 pb-6 space-y-3 shadow-2xl">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition cursor-pointer ${
                  activeNav === link.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onDownloadClick();
              }}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              {deviceInfo.platform === 'android' ? (
                <Smartphone className="w-4 h-4 text-cyan-200" />
              ) : deviceInfo.platform === 'windows' ? (
                <Monitor className="w-4 h-4 text-blue-200" />
              ) : deviceInfo.platform === 'macos' ? (
                <Laptop className="w-4 h-4 text-purple-200" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>
                {deviceInfo.platform === 'android' ? 'Download Android APK Package' :
                 deviceInfo.platform === 'windows' ? 'Download Windows Setup (.exe)' :
                 deviceInfo.platform === 'macos' ? 'Download macOS App (.dmg)' :
                 'Download Android, Mac & Windows Apps'}
              </span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
