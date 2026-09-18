import React from 'react';
import { 
  Music, 
  Instagram, 
  Send, 
  ArrowUp,
  Shield,
  Download,
  Lock,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { GenMusicLogo } from './GenMusicLogo';

interface FooterProps {
  onOpenLegalModal: (type: 'privacy' | 'terms' | 'support' | 'contact') => void;
  onDownloadClick: () => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
  telegramUrl: string;
}

export const Footer: React.FC<FooterProps> = ({ 
  onOpenLegalModal, 
  onDownloadClick,
  onOpenAdmin,
  isAdminLoggedIn,
  telegramUrl,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer 
      id="main-footer" 
      aria-label="Footer"
      className="border-t border-slate-200 bg-slate-50 text-slate-600 text-sm mt-16 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <GenMusicLogo size="md" glow={false} />
              <div className="flex flex-col">
                <span className="text-2xl font-black text-slate-900 font-heading">
                  GEN <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent">MUSIC</span>
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Music For Every Mood
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 max-w-sm leading-relaxed">
              The modern free music streaming client with high-speed direct APK releases for Android, Windows, and Mac.
            </p>

            <div className="flex items-center gap-3 text-xs text-slate-600 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                GEN MUSIC APK Ready
              </span>
              <span>• Free Forever</span>
            </div>
          </div>

          {/* Legal & Help Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Legal & Help
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onOpenLegalModal('privacy')}
                  id="footer-privacy-link"
                  className="hover:text-blue-600 transition cursor-pointer text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegalModal('terms')}
                  id="footer-terms-link"
                  className="hover:text-blue-600 transition cursor-pointer text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegalModal('support')}
                  id="footer-support-link"
                  className="hover:text-blue-600 transition cursor-pointer text-left"
                >
                  Support & Help Center
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegalModal('contact')}
                  id="footer-contact-link"
                  className="hover:text-blue-600 transition cursor-pointer text-left"
                >
                  Contact Devs
                </button>
              </li>
            </ul>
          </div>

          {/* Landing Navigation */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Quick Links
            </h3>
            <ul className="space-y-2 text-xs">
              <li><a href="#home" className="hover:text-blue-600 transition">Home</a></li>
              <li><a href="#download" className="hover:text-blue-600 transition">Download Mobile APK</a></li>
              <li><a href="#channels" className="hover:text-blue-600 transition">Telegram Channels</a></li>
              <li><a href="#features" className="hover:text-blue-600 transition">Features</a></li>
              <li><a href="#screenshots" className="hover:text-blue-600 transition">Screenshots</a></li>
              <li><a href="#faq" className="hover:text-blue-600 transition">FAQ</a></li>
              <li><a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition text-blue-600 font-semibold">XML Sitemap</a></li>
            </ul>
          </div>

          {/* Social Community & Admin Access */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Community & Admin
            </h3>
            <div className="flex flex-col space-y-2">
              <a
                href={telegramUrl}
                target="_blank"
                rel="noreferrer"
                id="footer-social-telegram"
                className="flex items-center gap-2 text-xs text-blue-700 hover:text-blue-900 transition p-1.5 rounded-lg hover:bg-blue-50"
              >
                <Send className="w-4 h-4 text-blue-600" />
                <span>Official Telegram</span>
              </a>

              <a
                href="https://instagram.com/genmusic.official"
                target="_blank"
                rel="noreferrer"
                id="footer-social-instagram"
                className="flex items-center gap-2 text-xs text-slate-600 hover:text-pink-600 transition p-1.5 rounded-lg hover:bg-pink-50"
              >
                <Instagram className="w-4 h-4 text-pink-500" />
                <span>Instagram Channel</span>
              </a>

              <a
                href={telegramUrl || "https://t.me/genmusic_apk"}
                target="_blank"
                rel="noreferrer"
                id="footer-social-community"
                className="flex items-center gap-2 text-xs text-slate-600 hover:text-blue-600 transition p-1.5 rounded-lg hover:bg-blue-50"
              >
                <Music className="w-4 h-4 text-blue-500" />
                <span>Free Music Community</span>
              </a>
            </div>

            {/* Admin shortcut if logged in */}
            {isAdminLoggedIn && (
              <div className="pt-2 border-t border-slate-200">
                <a
                  href="/admin"
                  id="footer-admin-btn"
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer border bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Control Console</span>
                </a>
              </div>
            )}
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-slate-500 text-center sm:text-left">
            © {new Date().getFullYear()} Remix GEN MUSIC. "Music For Every Mood". Direct APK & app packages. Free music for everyone.
          </p>

          <button
            onClick={scrollToTop}
            id="back-to-top-btn"
            className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition cursor-pointer p-1.5 rounded-lg hover:bg-slate-200/50"
          >
            <span>Back to top</span>
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};
