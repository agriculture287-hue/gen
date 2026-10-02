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

interface NavbarProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
  onDownloadClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeNav,
  setActiveNav,
  onDownloadClick,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    platform: 'android',
    recommendedFileFormat: '.apk',
    platformName: 'Android',
    isMobile: true,
    rawOS: 'Android',
  });

  useEffect(() => {
    setDeviceInfo(detectUserDevice());
  }, []);

  const navLinks = [
    { id: 'listen', label: 'Listen', href: '/listen' },
    { id: 'features', label: 'Features' },
    { id: 'download', label: 'Downloads' },
    { id: 'car-apps', label: 'Car Audio' },
    { id: 'updates', label: 'Changelog' },
    { id: 'faq', label: 'FAQ' },
  ];

  const handleNavClick = (id: string, href?: string) => {
    setActiveNav(id);
    setMobileMenuOpen(false);
    if (href) {
      window.history.pushState({}, '', href);
      window.dispatchEvent(new PopStateEvent('popstate'));
      return;
    }
    const targetElement = document.getElementById(id);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = `/#${id}`;
    }
  };

  const ctaLabel = 
    deviceInfo.platform === 'android' ? 'Download APK' :
    deviceInfo.platform === 'windows' ? 'Download EXE' :
    deviceInfo.platform === 'macos' ? 'Download DMG' :
    'Download';

  return (
    <nav 
      id="main-navbar" 
      aria-label="Main Navigation"
      className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0b0e14]/90 border-b border-white/10 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        
        {/* Zone 1: Single element brand wordmark */}
        <div 
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          id="navbar-brand-logo"
        >
          <GenMusicLogo size="sm" glow={false} />
          <span className="text-lg font-bold tracking-tight text-white font-heading">
            GEN MUSIC
          </span>
        </div>

        {/* Zone 2: Clean text navigation links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = activeNav === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id, link.href)}
                className={`text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'text-sky-400'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onDownloadClick}
            id="navbar-download-cta"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-sm transition-all transform active:scale-95 cursor-pointer whitespace-nowrap"
          >
            {deviceInfo.platform === 'android' ? (
              <Smartphone className="w-3.5 h-3.5" />
            ) : deviceInfo.platform === 'windows' ? (
              <Monitor className="w-3.5 h-3.5" />
            ) : deviceInfo.platform === 'macos' ? (
              <Laptop className="w-3.5 h-3.5" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{ctaLabel}</span>
          </button>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0e121b] border-b border-white/10 px-4 py-4 space-y-2">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id, link.href)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                  activeNav === link.id
                    ? 'text-sky-400 bg-white/5 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-white/10">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onDownloadClick();
              }}
              className="w-full py-2.5 rounded-lg bg-sky-500 text-slate-950 font-bold text-xs text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{ctaLabel}</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
