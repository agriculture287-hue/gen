import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, Mail, Smartphone, ArrowRight, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { APP_RELEASE_INFO } from '../data/landingData';
import { GenMusicLogo } from './GenMusicLogo';

interface BetaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const BetaModal: React.FC<BetaModalProps> = ({ isOpen, onClose, onShowToast }) => {
  const [email, setEmail] = useState('');
  const [device, setDevice] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00F0FF', '#8A2BE2', '#FF007F'],
      });
    } catch {
      // safe fallback
    }

    setSubmitted(true);
    onShowToast(`Beta seat confirmed for ${email}!`);
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setEmail('');
    setDevice('');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={handleResetAndClose}
    >
      <div 
        className="w-full max-w-lg rounded-3xl bg-[#0e0e18] border border-cyan-500/30 p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow orb */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-purple-600/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <GenMusicLogo size="md" glow={false} />
            <div>
              <h3 className="text-xl font-bold text-white font-heading">
                Join Beta Testing
              </h3>
              <p className="text-xs text-neutral-400">
                Get experimental builds before public release
              </p>
            </div>
          </div>

          <button 
            onClick={handleResetAndClose}
            className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-xl font-bold text-white">Welcome to the Private Beta!</h4>
              <p className="text-sm text-neutral-300 max-w-sm mx-auto mt-1.5 leading-relaxed">
                An invite link and private access token have been queued for <strong className="text-cyan-300 font-mono">{email}</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs text-neutral-400 max-w-xs mx-auto text-left space-y-1.5">
              <span className="font-bold text-white block">Next Steps:</span>
              <p>1. Open invitation email on your Android device.</p>
              <p>2. Install through Firebase App Distribution or direct APK.</p>
              <p>3. Report bugs directly in our Telegram group.</p>
            </div>

            <button
              onClick={handleResetAndClose}
              className="px-6 py-2.5 rounded-xl bg-cyan-400 text-black font-extrabold text-sm hover:bg-cyan-300 transition cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-neutral-300 leading-relaxed">
              Become an official beta tester for <strong>GEN MUSIC {APP_RELEASE_INFO.version}</strong>. Experience new Dolby spatial presets, free music search optimizations, and give feedback directly to developers.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Email Address (Google Account preferred for Play Console)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email || ''}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your-name@gmail.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Your Device Model (Optional)
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={device || ''}
                    onChange={(e) => setDevice(e.target.value)}
                    placeholder="e.g. Samsung Galaxy S24, Pixel 8, Xiaomi 14"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Instant direct invite • Zero spam guarantee</span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-black font-extrabold text-sm shadow-lg shadow-cyan-500/25 hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Confirm Beta Registration</span>
              <ArrowRight className="w-4 h-4 text-black stroke-[2.5]" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
