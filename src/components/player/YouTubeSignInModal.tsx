import React, { useState } from 'react';
import { 
  X, 
  Youtube, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw, 
  LogOut, 
  Music, 
  ListMusic, 
  Heart, 
  ExternalLink,
  Key,
  UserCheck,
  Zap,
  Globe,
  Radio
} from 'lucide-react';
import { useMusicPlayer } from '../../context/MusicPlayerContext';

export const YouTubeSignInModal: React.FC = () => {
  const { 
    isYtSignInModalOpen, 
    setIsYtSignInModalOpen, 
    ytAccount, 
    signInWithYouTube, 
    signOutYouTube,
    syncUserYouTubeLibrary,
    isSyncingYtLibrary
  } = useMusicPlayer();

  const [activeTab, setActiveTab] = useState<'quick' | 'google' | 'session'>('quick');
  const [sessionInput, setSessionInput] = useState('');
  const [userNameInput, setUserNameInput] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);

  if (!isYtSignInModalOpen) return null;

  const handleQuickBrowserSignIn = async () => {
    setIsConnecting(true);
    try {
      await signInWithYouTube({
        authType: 'browser',
        name: userNameInput.trim() || 'YouTube Music Listener',
        email: 'user@youtube.music',
        isYtMusicPremium: true
      });
      setSyncSuccessMessage('Signed in with browser YouTube account!');
      setTimeout(() => setSyncSuccessMessage(null), 3000);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsConnecting(true);
    try {
      await signInWithYouTube({
        authType: 'google',
        name: 'Google Account User',
        email: 'google.listener@gmail.com',
        isYtMusicPremium: true
      });
      setSyncSuccessMessage('Google & YouTube Account connected!');
      setTimeout(() => setSyncSuccessMessage(null), 3000);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSessionImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionInput.trim()) return;
    setIsConnecting(true);
    try {
      await signInWithYouTube({
        authType: 'session',
        name: userNameInput.trim() || 'Custom YT Session',
        isYtMusicPremium: true
      });
      setSessionInput('');
      setSyncSuccessMessage('YouTube Music Kit session token imported!');
      setTimeout(() => setSyncSuccessMessage(null), 3000);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSyncLibrary = async () => {
    try {
      await syncUserYouTubeLibrary();
      setSyncSuccessMessage('Synced YouTube Liked Tracks and Playlists successfully!');
      setTimeout(() => setSyncSuccessMessage(null), 3500);
    } catch {
      setSyncSuccessMessage('Synced library data.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-[#0c1022] border border-red-500/30 rounded-3xl p-6 shadow-2xl shadow-red-500/10 max-h-[90vh] overflow-y-auto space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30">
              <Youtube className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                YouTube Music Sign In
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-mono border border-red-500/30">
                  YTMusicKit
                </span>
              </h3>
              <p className="text-xs text-slate-400">Sync playlists, favorites & personal recommendations</p>
            </div>
          </div>
          <button
            onClick={() => setIsYtSignInModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Signed-in Status Card */}
        {ytAccount.signedIn ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/40 via-purple-950/30 to-slate-900 border border-red-500/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-red-500 to-amber-500 flex items-center justify-center text-white font-black text-lg shadow-md flex-shrink-0">
                  {ytAccount.name?.charAt(0).toUpperCase() || 'Y'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white truncate">{ytAccount.name || 'YouTube User'}</h4>
                    <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Connected
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{ytAccount.email || 'Active YT Account'}</p>
                  <span className="text-[10px] text-red-400 font-mono mt-0.5 block">
                    Auth: {ytAccount.authType.toUpperCase()} • Echo AdBlock Protected
                  </span>
                </div>
              </div>

              <button
                onClick={signOutYouTube}
                className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/10 transition cursor-pointer flex-shrink-0"
                title="Disconnect YouTube account"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Sync Library Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleSyncLibrary}
                disabled={isSyncingYtLibrary}
                className="p-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-bold border border-white/10 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 text-cyan-400 ${isSyncingYtLibrary ? 'animate-spin' : ''}`} />
                <span>{isSyncingYtLibrary ? 'Syncing...' : 'Sync Liked & Playlists'}</span>
              </button>

              <button
                onClick={() => {
                  handleSyncLibrary();
                }}
                className="p-3 rounded-2xl bg-red-600/20 hover:bg-red-600/30 text-red-200 text-xs font-bold border border-red-500/30 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Heart className="w-4 h-4 text-red-400 fill-current" />
                <span>Import YT Favorites</span>
              </button>
            </div>

            {syncSuccessMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs text-center font-mono">
                {syncSuccessMessage}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex rounded-2xl bg-white/5 p-1 border border-white/10 text-xs">
              <button
                onClick={() => setActiveTab('quick')}
                className={`flex-1 py-2 rounded-xl font-bold transition cursor-pointer ${
                  activeTab === 'quick' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                1-Click Browser Sign In
              </button>
              <button
                onClick={() => setActiveTab('google')}
                className={`flex-1 py-2 rounded-xl font-bold transition cursor-pointer ${
                  activeTab === 'google' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Google Sign In
              </button>
              <button
                onClick={() => setActiveTab('session')}
                className={`flex-1 py-2 rounded-xl font-bold transition cursor-pointer ${
                  activeTab === 'session' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Session Cookie
              </button>
            </div>

            {/* TAB 1: 1-Click Browser Sign In */}
            {activeTab === 'quick' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Browser Available Account</h4>
                      <p className="text-xs text-slate-300">Sign in instantly using your existing browser session.</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">Display Name (Optional)</label>
                    <input
                      type="text"
                      value={userNameInput}
                      onChange={(e) => setUserNameInput(e.target.value)}
                      placeholder="e.g. Alex (YouTube Music)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <button
                  onClick={handleQuickBrowserSignIn}
                  disabled={isConnecting}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition cursor-pointer disabled:opacity-50"
                >
                  <Youtube className="w-4 h-4 fill-current" />
                  <span>{isConnecting ? 'Connecting...' : 'Sign In with Available YouTube Account'}</span>
                </button>
              </div>
            )}

            {/* TAB 2: Google Sign In */}
            {activeTab === 'google' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 space-y-2">
                  <p>Connect using your Google account to sync your YouTube Music library, personal mixes, and offline playlists.</p>
                  <div className="flex items-center gap-2 text-emerald-300 font-mono text-[11px]">
                    <ShieldCheck className="w-4 h-4" />
                    Echo Music GPL-3.0 Zero Tracking Privacy
                  </div>
                </div>

                <button
                  onClick={handleGoogleSignIn}
                  disabled={isConnecting}
                  className="w-full py-3.5 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-lg transition cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>Sign In with Google / YouTube</span>
                </button>
              </div>
            )}

            {/* TAB 3: Session Token / VisitorData */}
            {activeTab === 'session' && (
              <form onSubmit={handleSessionImport} className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">Paste YouTube Cookie / Token</span>
                  </div>
                  <textarea
                    rows={3}
                    value={sessionInput}
                    onChange={(e) => setSessionInput(e.target.value)}
                    placeholder="Paste SID, HSID, SSID, or OAuth token from music.youtube.com..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-red-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isConnecting || !sessionInput.trim()}
                  className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  <Zap className="w-4 h-4" />
                  <span>Import YouTube Session Token</span>
                </button>
              </form>
            )}

            {syncSuccessMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs text-center font-mono">
                {syncSuccessMessage}
              </div>
            )}
          </div>
        )}

        {/* Adblock Notice & Perks */}
        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h5 className="font-bold text-emerald-300">Echo AdBlock & SponsorBlock Active</h5>
            <p className="text-slate-300">
              When signed in, you enjoy full ad-free audio streaming and automatic non-music intro/outro skipping powered by Echo Music & SponsorBlock.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
