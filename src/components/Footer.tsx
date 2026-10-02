import React from 'react';
import { ArrowUp } from 'lucide-react';
import { GenMusicLogo } from './GenMusicLogo';

interface FooterProps {
  onOpenLegalModal: (type: 'privacy' | 'terms' | 'support' | 'contact') => void;
  onDownloadClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  onOpenLegalModal, 
  onDownloadClick,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer 
      id="main-footer" 
      aria-label="Footer"
      className="border-t border-white/10 bg-[#090b10] text-slate-400 text-sm mt-16 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <GenMusicLogo size="sm" glow={false} />
              <span className="text-xl font-bold text-white font-heading">
                GEN MUSIC
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              High-fidelity music streaming client with verified direct package releases for Android, Android Car, Windows, and macOS.
            </p>

            <div className="text-xs text-slate-400 pt-1 font-medium">
              <span>100% Free Forever · No Subscription</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Navigation
            </h3>
            <ul className="space-y-2 text-xs">
              <li><a href="/" className="hover:text-white transition">Home</a></li>
              <li><a href="/listen" className="hover:text-white transition text-sky-400 font-medium">Web Player (Listen)</a></li>
              <li><a href="/#download" className="hover:text-white transition">Downloads</a></li>
              <li><a href="/#car-apps" className="hover:text-white transition">Car Audio</a></li>
              <li><a href="/#features" className="hover:text-white transition">Features</a></li>
              <li><a href="/#faq" className="hover:text-white transition">FAQ</a></li>
              <li>
                <a 
                  href="https://omg10.com/4/11864587" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sky-400 hover:text-sky-300 font-semibold transition"
                >
                  ★ Sponsored Offers
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Policy Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Legal & Help
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onOpenLegalModal('privacy')}
                  id="footer-privacy-link"
                  className="hover:text-white transition cursor-pointer text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegalModal('terms')}
                  id="footer-terms-link"
                  className="hover:text-white transition cursor-pointer text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegalModal('support')}
                  id="footer-support-link"
                  className="hover:text-white transition cursor-pointer text-left"
                >
                  Support & Help
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegalModal('contact')}
                  id="footer-contact-link"
                  className="hover:text-white transition cursor-pointer text-left"
                >
                  Contact Developers
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-slate-500">
            © {new Date().getFullYear()} GEN MUSIC. Free, unlimited music streaming and offline audio player.
          </p>

          <button
            onClick={scrollToTop}
            id="back-to-top-btn"
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition cursor-pointer p-1.5 rounded-lg hover:bg-white/5"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5 text-sky-400" />
          </button>
        </div>
      </div>
    </footer>
  );
};
