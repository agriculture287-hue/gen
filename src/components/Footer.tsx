import React from 'react';
import { 
  Music, 
  Instagram, 
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
      className="border-t border-white/10 bg-[#05070d] text-slate-400 text-sm mt-16 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <GenMusicLogo size="md" glow={true} />
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white font-heading">
                  GEN <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent">MUSIC</span>
                </span>
                <span className="text-xs font-semibold text-slate-500 font-mono">
                  Music For Every Mood
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              Futuristic, high-fidelity music streaming client with high-speed direct APK releases for Android, Android Car, Windows, and macOS.
            </p>

            <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                GEN MUSIC v2.4.1 Online
              </span>
              <span className="font-mono text-slate-500">• 100% Free Forever</span>
            </div>
          </div>

          {/* Legal & Help Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Legal & Help
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onOpenLegalModal('privacy')}
                  id="footer-privacy-link"
                  className="hover:text-cyan-300 transition cursor-pointer text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegalModal('terms')}
                  id="footer-terms-link"
                  className="hover:text-cyan-300 transition cursor-pointer text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegalModal('support')}
                  id="footer-support-link"
                  className="hover:text-cyan-300 transition cursor-pointer text-left"
                >
                  Support & Help Center
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegalModal('contact')}
                  id="footer-contact-link"
                  className="hover:text-cyan-300 transition cursor-pointer text-left"
                >
                  Contact Developers
                </button>
              </li>
            </ul>
          </div>

          {/* Landing Navigation */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Navigation
            </h3>
            <ul className="space-y-2 text-xs">
              <li><a href="#home" className="hover:text-cyan-300 transition">Terminal Home</a></li>
              <li><a href="#download" className="hover:text-cyan-300 transition">Client Binaries</a></li>
              <li><a href="#android-car" className="hover:text-cyan-300 transition">Android Car OS</a></li>
              <li><a href="#features" className="hover:text-cyan-300 transition">Features</a></li>
              <li><a href="#faq" className="hover:text-cyan-300 transition">FAQ</a></li>
              <li><a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300 transition text-cyan-400 font-semibold font-mono">XML Sitemap</a></li>
            </ul>
          </div>

          {/* Social Community & Admin Access */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Channels
            </h3>
            <div className="flex flex-col space-y-2">
              <a
                href="https://instagram.com/genmusic.official"
                target="_blank"
                rel="noreferrer"
                id="footer-social-instagram"
                className="flex items-center gap-2 text-xs text-slate-400 hover:text-pink-400 transition p-1.5 rounded-lg hover:bg-white/[0.04]"
              >
                <Instagram className="w-4 h-4 text-pink-400" />
                <span>Instagram Feed</span>
              </a>

              <a
                href="https://instagram.com/genmusic.official"
                target="_blank"
                rel="noreferrer"
                id="footer-social-community"
                className="flex items-center gap-2 text-xs text-slate-400 hover:text-cyan-300 transition p-1.5 rounded-lg hover:bg-white/[0.04]"
              >
                <Music className="w-4 h-4 text-cyan-400" />
                <span>Audio Community</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
          <p className="text-slate-500 text-center sm:text-left">
            © {new Date().getFullYear()} GEN MUSIC. Built with 3D Spatial Audio & Neural DSP. Free for everyone.
          </p>

          <button
            onClick={scrollToTop}
            id="back-to-top-btn"
            className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-300 transition cursor-pointer p-1.5 rounded-lg hover:bg-white/[0.04]"
          >
            <span>Back to top</span>
            <ArrowUp className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>
    </footer>
  );
};
