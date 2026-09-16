import React from 'react';
import { X, Shield, FileText, HelpCircle, Mail, ExternalLink } from 'lucide-react';
import { APP_RELEASE_INFO } from '../data/landingData';

interface LegalModalProps {
  type: 'privacy' | 'terms' | 'support' | 'contact' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  const getContent = () => {
    switch (type) {
      case 'privacy':
        return {
          title: 'Privacy Policy',
          icon: <Shield className="w-5 h-5 text-cyan-400" />,
          body: (
            <div className="space-y-4 text-sm text-neutral-300 leading-relaxed">
              <p>
                <strong>Last Updated: September 2026</strong>
              </p>
              <p>
                GEN MUSIC ("we", "our", or "the app") is committed to protecting your personal privacy. Unlike commercial streaming platforms, GEN MUSIC operates on a strict <strong>zero-telemetry, zero-surveillance</strong> policy.
              </p>
              <h4 className="text-white font-bold text-base mt-3">1. Data We Do NOT Collect</h4>
              <p>
                We do not collect, store, sell, or monetize:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-neutral-400">
                <li>Your personal identity, legal name, or phone numbers.</li>
                <li>Your GPS location coordinates or device telemetry.</li>
                <li>Your audio listening logs or search queries.</li>
                <li>Financial details or credit card accounts (the app is completely free).</li>
              </ul>
              <h4 className="text-white font-bold text-base mt-3">2. Local Storage</h4>
              <p>
                All your playlists, favorite tracks, offline downloaded MP3 files, and custom equalizer settings are stored exclusively in your local Android device sandbox.
              </p>
              <h4 className="text-white font-bold text-base mt-3">3. Third-Party APIs</h4>
              <p>
                When searching YouTube or Spotify catalogs, network requests connect directly from your client to public audio streams without intermediate proxy logging.
              </p>
            </div>
          ),
        };

      case 'terms':
        return {
          title: 'Terms of Service',
          icon: <FileText className="w-5 h-5 text-purple-400" />,
          body: (
            <div className="space-y-4 text-sm text-neutral-300 leading-relaxed">
              <p>
                <strong>Effective Date: September 2026</strong>
              </p>
              <p>
                By downloading, installing, or using the GEN MUSIC Android APK ({APP_RELEASE_INFO.version}), you agree to comply with and be bound by the following terms.
              </p>
              <h4 className="text-white font-bold text-base mt-3">1. Personal Non-Commercial Use</h4>
              <p>
                GEN MUSIC is provided solely for personal, private audio listening, research, and non-commercial educational enjoyment.
              </p>
              <h4 className="text-white font-bold text-base mt-3">2. Offline Caching & MP3 Conversion</h4>
              <p>
                Users are solely responsible for respecting intellectual property rights and applicable local copyright laws in their respective jurisdictions when archiving content offline.
              </p>
              <h4 className="text-white font-bold text-base mt-3">3. Disclaimer of Warranty</h4>
              <p>
                GEN MUSIC is distributed on an "AS IS" and "AS AVAILABLE" basis without representations or warranties of any kind.
              </p>
            </div>
          ),
        };

      case 'support':
        return {
          title: 'Support & Help Center',
          icon: <HelpCircle className="w-5 h-5 text-pink-400" />,
          body: (
            <div className="space-y-4 text-sm text-neutral-300 leading-relaxed">
              <h4 className="text-white font-bold text-base">Frequently Encountered Questions</h4>
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10">
                  <strong className="text-cyan-300 block text-xs uppercase tracking-wider mb-1">Android Installation Error: "Blocked by Play Protect"</strong>
                  <p className="text-xs text-neutral-300">Because GEN MUSIC is in public Beta outside the Google Play Store, Play Protect may display a generic unknown developer warning. Tap "More details" &gt; "Install anyway" to proceed safely.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10">
                  <strong className="text-purple-300 block text-xs uppercase tracking-wider mb-1">Where are exported MP3s saved?</strong>
                  <p className="text-xs text-neutral-300">Exported 320kbps MP3s are saved in your device's standard <code>/Music/GEN Music/</code> directory and are immediately recognized by all media players.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10">
                  <strong className="text-pink-300 block text-xs uppercase tracking-wider mb-1">Enabling Dolby Audio 3D Spatial Surround</strong>
                  <p className="text-xs text-neutral-300">Open the Player screen, tap the "Dolby Atmos" badge, and switch the Spatial Virtualizer to "On". Wired or Bluetooth headphones are recommended.</p>
                </div>
              </div>
            </div>
          ),
        };

      case 'contact':
      default:
        return {
          title: 'Contact Devs',
          icon: <Mail className="w-5 h-5 text-blue-400" />,
          body: (
            <div className="space-y-4 text-sm text-neutral-300 leading-relaxed">
              <p>
                Need to reach the core GEN MUSIC development team? We are active daily across multiple channels:
              </p>
              <ul className="space-y-2.5 text-xs text-neutral-200">
                <li className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Email Direct:</span>
                    <span className="font-mono text-cyan-300">support@genmusic.app</span>
                  </div>
                  <a href="mailto:support@genmusic.app" className="px-3 py-1 rounded bg-cyan-500/20 text-cyan-300 text-xs font-bold">Mail</a>
                </li>

                <li className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Telegram Community:</span>
                    <span className="font-mono text-purple-300">t.me/GenMusicApp</span>
                  </div>
                  <a href="https://t.me/GenMusicApp" target="_blank" rel="noreferrer" className="px-3 py-1 rounded bg-purple-500/20 text-purple-300 text-xs font-bold">Join</a>
                </li>
              </ul>
            </div>
          ),
        };
    }
  };

  const modal = getContent();

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl max-h-[85vh] flex flex-col rounded-3xl bg-[#0d0d16] border border-white/15 p-6 sm:p-8 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/[0.06] border border-white/10">
              {modal.icon}
            </div>
            <h3 className="text-xl font-bold text-white font-heading">
              {modal.title}
            </h3>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto py-5 pr-2 flex-grow custom-scrollbar">
          {modal.body}
        </div>

        <div className="pt-4 border-t border-white/10 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
