import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, 
  Lock, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle,
  HardDrive,
  RefreshCw,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Laptop,
  Monitor,
  Cloud,
  Layers,
  Send,
  Sparkles,
  FileCode,
  FileUp,
  Package,
  Activity,
  LogOut,
  Save,
  Check
} from 'lucide-react';
import { AppPlatformRelease, TelegramChannel, TelegramConfig, UpdateItem } from '../types';
import { ADMIN_CREDENTIALS, verifyAdminCredentials } from '../data/adminStore';

export const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminId, setAdminId] = useState(ADMIN_CREDENTIALS.id);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'platforms' | 'channels' | 'updates' | 'manifest' | 'upload' | 'blob'>('platforms');

  // App State to manage
  const [platforms, setPlatforms] = useState<AppPlatformRelease[]>([]);
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>({
    contactUsername: '@genmusic_admin',
    contactUrl: 'https://t.me/genmusic_admin',
    announcementText: 'Direct APK download links, beta builds & 24/7 technical help.',
    supportHours: 'Admin Online 24/7'
  });
  const [channels, setChannels] = useState<TelegramChannel[]>([]);
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [manifest, setManifest] = useState<any>({
    android: { latestVersion: '1.0.1', minimumVersion: '1.0.0', downloadUrl: '/download/genmusic.apk', mirrorUrl: 'https://t.me/genmusic_apk' },
    windows: { latestVersion: '1.0.1', minimumVersion: '1.0.0', downloadUrl: '/download/genmusic-setup.exe', mirrorUrl: 'https://t.me/genmusic_official' },
    macos: { latestVersion: '1.0.1', minimumVersion: '1.0.0', downloadUrl: '/download/genmusic.dmg', mirrorUrl: 'https://t.me/genmusic_official' },
    releaseNotes: ['Improved streaming engine', '3D Spatial Audio Dolby presets', 'Bug fixes']
  });

  // Blob & backend state
  const [blobConfigured, setBlobConfigured] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ success: boolean; message: string } | null>(null);

  // File Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPlatform, setUploadPlatform] = useState<'android' | 'windows' | 'macos' | 'generic'>('android');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load state from backend on mount
  useEffect(() => {
    // Check local session
    const remembered = localStorage.getItem('genmusic_admin_auth');
    if (remembered === 'true') {
      setIsAuthenticated(true);
    }

    loadBackendData();
  }, []);

  const loadBackendData = async () => {
    try {
      const res = await fetch('/api/admin/data');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          if (Array.isArray(json.data.platforms)) setPlatforms(json.data.platforms);
          if (json.data.telegramConfig) setTelegramConfig(json.data.telegramConfig);
          if (Array.isArray(json.data.channels)) setChannels(json.data.channels);
          if (Array.isArray(json.data.updates)) setUpdates(json.data.updates);
          if (json.data.manifest) setManifest(json.data.manifest);
          if (json.blobConfigured !== undefined) setBlobConfigured(json.blobConfigured);
          if (json.lastUpdated) setLastUpdated(json.lastUpdated);
        }
      }
    } catch (e) {
      console.warn('Failed loading backend admin data:', e);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminCredentials(adminId, password)) {
      setIsAuthenticated(true);
      setLoginError('');
      localStorage.setItem('genmusic_admin_auth', 'true');
    } else {
      setLoginError('Invalid credentials. Varanasi Admin: varansi@genmusic.com / Ankit@123321');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('genmusic_admin_auth');
  };

  // Save everything to backend & Vercel Blob
  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    const payload = {
      platforms,
      telegramConfig,
      channels,
      updates,
      manifest,
      updatedBy: 'Admin (Varanasi)',
      lastUpdated: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/admin/save-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (result.success) {
        setSaveStatus({
          success: true,
          message: result.message || 'Saved to backend storage & Vercel Blob successfully!'
        });
        setLastUpdated(new Date().toLocaleTimeString());
        if (result.blobConfigured !== undefined) {
          setBlobConfigured(result.blobConfigured);
        }
      } else {
        setSaveStatus({
          success: false,
          message: result.error || 'Failed to save to backend.'
        });
      }
    } catch (err: any) {
      setSaveStatus({
        success: false,
        message: err?.message || 'Network error saving to backend'
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 5000);
    }
  };

  // Handle Binary Upload
  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('platform', uploadPlatform);

      const res = await fetch('/api/blob/upload-file', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        setUploadResult({
          success: true,
          url: data.publicUrl || data.blob?.url,
          message: data.message || 'File uploaded successfully!',
          sha256: data.sha256
        });

        // Update corresponding platform download URL automatically
        const finalUrl = data.publicUrl || data.blob?.url;
        if (finalUrl) {
          setPlatforms(prev => prev.map(p => {
            if (p.platform === uploadPlatform) {
              return { ...p, downloadUrl: finalUrl };
            }
            return p;
          }));

          // Also update manifest
          setManifest((prev: any) => {
            const next = { ...prev };
            if (uploadPlatform === 'android' && next.android) next.android.downloadUrl = finalUrl;
            if (uploadPlatform === 'windows' && next.windows) next.windows.downloadUrl = finalUrl;
            if (uploadPlatform === 'macos' && next.macos) next.macos.downloadUrl = finalUrl;
            return next;
          });
        }

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setUploadFile(null);
      } else {
        setUploadResult({
          success: false,
          message: data.error || 'Failed to upload binary file.'
        });
      }
    } catch (err: any) {
      setUploadResult({
        success: false,
        message: err?.message || 'Network error during upload'
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Platform management helpers
  const handleUpdatePlatformField = (index: number, field: string, value: any) => {
    setPlatforms(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Telegram channel helpers
  const handleUpdateChannel = (index: number, field: string, value: string) => {
    setChannels(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAddChannel = () => {
    const newChan: TelegramChannel = {
      id: `ch-${Date.now()}`,
      title: 'New Channel',
      description: 'Channel description here',
      link: 'https://t.me/genmusic_official',
      badge: 'Official',
      memberCount: '1,000+ members'
    };
    setChannels(prev => [...prev, newChan]);
  };

  const handleRemoveChannel = (index: number) => {
    setChannels(prev => prev.filter((_, i) => i !== index));
  };

  // Update item helpers
  const handleAddUpdate = () => {
    const newUp: UpdateItem = {
      id: `up-${Date.now()}`,
      version: 'v2.5.1',
      releaseDate: 'September 2026',
      tag: 'New Release',
      highlights: ['Audio performance improvement', 'Bug fixes']
    };
    setUpdates(prev => [newUp, ...prev]);
  };

  const handleRemoveUpdate = (index: number) => {
    setUpdates(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateItemChange = (index: number, field: string, value: any) => {
    setUpdates(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans text-slate-100">
        <div className="w-full max-w-md bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700/80">
          <div className="flex flex-col items-center justify-center space-y-3 mb-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">GEN MUSIC Admin Control</h1>
            <p className="text-xs text-slate-400">Authorized Varanasi Admin Portal</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Admin Identifier
              </label>
              <input
                type="text"
                value={adminId}
                onChange={e => { setAdminId(e.target.value); setLoginError(''); }}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                placeholder="varansi@genmusic.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setLoginError(''); }}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Enter admin password..."
                autoFocus
                required
              />
            </div>
            
            {loginError && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer text-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Enter Admin Console</span>
            </button>

            <div className="pt-2 text-center">
              <a href="/" className="text-xs text-slate-400 hover:text-slate-200 transition">
                ← Return to Public Website
              </a>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-4 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-600/30 font-black text-lg">
            G
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">GEN MUSIC Admin Console</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Central Control
              </span>
            </div>
            <p className="text-xs text-slate-400">Full backend & Vercel Blob persistence</p>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold transition shadow-md shadow-blue-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-60"
            title="Saves all changes to backend memory, disk, and Vercel Blob"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSaving ? 'Saving to Blob...' : 'Save Everything to Blob'}</span>
          </button>

          <a
            href="/"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition border border-slate-700/80 flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">View Site</span>
          </a>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 transition border border-slate-700/80 cursor-pointer"
            title="Sign out of admin"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Save Notification Toast */}
      {saveStatus && (
        <div className="px-4 sm:px-8 py-2 bg-slate-900/50">
          <div className={`p-3 rounded-xl flex items-center gap-2 text-xs font-medium border ${
            saveStatus.success 
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60' 
              : 'bg-rose-950/40 text-rose-300 border-rose-800/60'
          }`}>
            {saveStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
            <span>{saveStatus.message}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        
        {/* Status Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Storage State</p>
              <p className="text-sm font-bold text-white mt-0.5">Backend Disk + Vercel Blob</p>
            </div>
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/40 animate-pulse" />
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Vercel Blob Status</p>
              <p className="text-sm font-bold text-white mt-0.5">
                {blobConfigured ? 'Connected & Ready' : 'Configured on Server'}
              </p>
            </div>
            <Cloud className="w-5 h-5 text-blue-400" />
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Last Synchronized</p>
              <p className="text-sm font-mono text-slate-300 mt-0.5">{lastUpdated || 'Just now'}</p>
            </div>
            <Activity className="w-5 h-5 text-indigo-400" />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 text-xs font-bold scrollbar-none">
          <button
            onClick={() => setActiveTab('platforms')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'platforms' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Platform Releases ({platforms.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'upload' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileUp className="w-3.5 h-3.5" />
            <span>Direct Binary Uploader</span>
          </button>

          <button
            onClick={() => setActiveTab('channels')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'channels' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Telegram & Support</span>
          </button>

          <button
            onClick={() => setActiveTab('updates')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'updates' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Changelog & Releases</span>
          </button>

          <button
            onClick={() => setActiveTab('manifest')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'manifest' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Version Manifest (app-version.json)</span>
          </button>

          <button
            onClick={() => setActiveTab('blob')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'blob' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Blob Persistence Inspector</span>
          </button>
        </div>

        {/* TAB 1: PLATFORMS */}
        {activeTab === 'platforms' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">App Platforms & Download Links</h2>
                <p className="text-xs text-slate-400">Control file size, version tags, direct download URLs, and mirrors.</p>
              </div>
              <button
                onClick={handleSaveAll}
                disabled={isSaving}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3 h-3" />
                <span>Save Platforms</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {platforms.map((p, idx) => (
                <div key={p.id || idx} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
                        {p.platform === 'android' ? <Smartphone className="w-4 h-4" /> : <Laptop className="w-4 h-4" />}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-white">{p.name}</h3>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">{p.platform} • {p.fileFormat}</span>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={p.version || ''}
                      onChange={e => handleUpdatePlatformField(idx, 'version', e.target.value)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono text-xs w-24 text-center"
                      placeholder="v2.5.0"
                    />
                  </div>

                  <div className="space-y-2 pt-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Direct Download URL (APK / EXE / DMG)
                      </label>
                      <input
                        type="text"
                        value={p.downloadUrl || ''}
                        onChange={e => handleUpdatePlatformField(idx, 'downloadUrl', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-white font-mono text-xs focus:ring-1 focus:ring-blue-500"
                        placeholder="https://... or /download/..."
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Telegram Mirror / Alternative URL
                      </label>
                      <input
                        type="text"
                        value={p.mirrorUrl || ''}
                        onChange={e => handleUpdatePlatformField(idx, 'mirrorUrl', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-white font-mono text-xs focus:ring-1 focus:ring-blue-500"
                        placeholder="https://t.me/..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">File Size</label>
                        <input
                          type="text"
                          value={p.fileSize || ''}
                          onChange={e => handleUpdatePlatformField(idx, 'fileSize', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700/80 text-white text-xs font-mono"
                          placeholder="24.8 MB"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Architecture</label>
                        <input
                          type="text"
                          value={p.architecture || ''}
                          onChange={e => handleUpdatePlatformField(idx, 'architecture', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700/80 text-white text-xs"
                          placeholder="ARM64 / x64"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: DIRECT BINARY UPLOADER */}
        {activeTab === 'upload' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  <FileUp className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Direct App Installer Uploader</h2>
                  <p className="text-xs text-slate-400">Upload APK, EXE, DMG, or JSON directly to Vercel Blob & server disk</p>
                </div>
              </div>

              <form onSubmit={handleUploadFile} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Target Platform
                  </label>
                  <select
                    value={uploadPlatform}
                    onChange={e => setUploadPlatform(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm font-medium focus:outline-none"
                  >
                    <option value="android">Android (.apk) - GEN MUSIC APK</option>
                    <option value="windows">Windows (.exe) - Setup Installer</option>
                    <option value="macos">macOS (.dmg) - Apple Disk Image</option>
                    <option value="generic">Generic Asset (Config / Images / JSON)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Select File (Up to 250 MB)
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadFile(e.target.files[0]);
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                  />
                  {uploadFile && (
                    <p className="text-[11px] text-slate-400 font-mono mt-1">
                      Selected: {uploadFile.name} ({(uploadFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!uploadFile || isUploading}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-lg shadow-blue-600/20"
                >
                  {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                  <span>{isUploading ? 'Uploading file to Blob...' : 'Upload File Now'}</span>
                </button>
              </form>

              {uploadResult && (
                <div className={`p-4 rounded-xl border text-xs ${
                  uploadResult.success 
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60' 
                    : 'bg-rose-950/40 text-rose-300 border-rose-800/60'
                }`}>
                  <p className="font-bold">{uploadResult.message}</p>
                  {uploadResult.url && (
                    <p className="font-mono text-[11px] break-all pt-1 text-emerald-400">
                      Live URL: <a href={uploadResult.url} target="_blank" rel="noopener noreferrer" className="underline">{uploadResult.url}</a>
                    </p>
                  )}
                  {uploadResult.sha256 && (
                    <p className="font-mono text-[10px] break-all text-slate-400 pt-1">
                      SHA256: {uploadResult.sha256}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: TELEGRAM & SUPPORT */}
        {activeTab === 'channels' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h2 className="text-base font-bold text-white">24/7 Admin Contact & Support Bar</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Contact Username / Handle
                  </label>
                  <input
                    type="text"
                    value={telegramConfig.contactUsername || ''}
                    onChange={e => setTelegramConfig({ ...telegramConfig, contactUsername: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                    placeholder="@genmusic_admin"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Contact Direct URL
                  </label>
                  <input
                    type="text"
                    value={telegramConfig.contactUrl || ''}
                    onChange={e => setTelegramConfig({ ...telegramConfig, contactUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                    placeholder="https://t.me/genmusic_admin"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">Public Telegram Channels & Communities</h2>
                  <p className="text-xs text-slate-400">Cards shown in the Telegram Community section on the landing page.</p>
                </div>
                <button
                  onClick={handleAddChannel}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Channel</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {channels.map((chan, idx) => (
                  <div key={chan.id || idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={chan.title || ''}
                        onChange={e => handleUpdateChannel(idx, 'title', e.target.value)}
                        className="px-2 py-1 rounded bg-slate-950 border border-slate-700 font-bold text-white text-xs flex-1 mr-2"
                        placeholder="Channel Title"
                      />
                      <button
                        onClick={() => handleRemoveChannel(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                        title="Delete Channel"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <textarea
                        value={chan.description || ''}
                        onChange={e => handleUpdateChannel(idx, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700/80 text-slate-300 text-xs resize-none"
                        placeholder="Channel description"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={chan.link || ''}
                        onChange={e => handleUpdateChannel(idx, 'link', e.target.value)}
                        className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-slate-300 text-[11px] font-mono"
                        placeholder="https://t.me/..."
                      />
                      <input
                        type="text"
                        value={chan.memberCount || ''}
                        onChange={e => handleUpdateChannel(idx, 'memberCount', e.target.value)}
                        className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-slate-300 text-[11px]"
                        placeholder="15,400+ members"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CHANGELOG & RELEASES */}
        {activeTab === 'updates' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">What's New & Release Highlights</h2>
                <p className="text-xs text-slate-400">Displayed on the Updates section and in the in-app update checker.</p>
              </div>
              <button
                onClick={handleAddUpdate}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Release Note</span>
              </button>
            </div>

            <div className="space-y-3">
              {updates.map((up, idx) => (
                <div key={up.id || idx} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={up.version || ''}
                        onChange={e => handleUpdateItemChange(idx, 'version', e.target.value)}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono font-bold text-xs w-28"
                        placeholder="v2.5.0"
                      />
                      <input
                        type="text"
                        value={up.tag || ''}
                        onChange={e => handleUpdateItemChange(idx, 'tag', e.target.value)}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-blue-400 text-xs w-36"
                        placeholder="Latest Release"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={up.releaseDate || ''}
                        onChange={e => handleUpdateItemChange(idx, 'releaseDate', e.target.value)}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-slate-400 text-xs w-36 text-right"
                        placeholder="September 2026"
                      />
                      <button
                        onClick={() => handleRemoveUpdate(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Highlights (One item per line)
                    </label>
                    <textarea
                      value={Array.isArray(up.highlights) ? up.highlights.join('\n') : (up.highlights || '')}
                      onChange={e => handleUpdateItemChange(idx, 'highlights', e.target.value.split('\n'))}
                      rows={3}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs font-mono"
                      placeholder="Added Dolby Audio 3D spatial surround...&#10;Batch offline downloader..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: VERSION MANIFEST */}
        {activeTab === 'manifest' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  <FileCode className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Version Manifest (app-version.json)</h2>
                  <p className="text-xs text-slate-400">Used by Flutter client to check for latest updates</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Latest Version
                  </label>
                  <input
                    type="text"
                    value={manifest?.android?.latestVersion || '1.0.1'}
                    onChange={e => {
                      const val = e.target.value;
                      setManifest((prev: any) => ({
                        ...prev,
                        android: { ...prev.android, latestVersion: val },
                        windows: { ...prev.windows, latestVersion: val },
                        macos: { ...prev.macos, latestVersion: val },
                      }));
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                    placeholder="1.0.1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Minimum Supported Version
                  </label>
                  <input
                    type="text"
                    value={manifest?.android?.minimumVersion || '1.0.0'}
                    onChange={e => {
                      const val = e.target.value;
                      setManifest((prev: any) => ({
                        ...prev,
                        android: { ...prev.android, minimumVersion: val },
                        windows: { ...prev.windows, minimumVersion: val },
                        macos: { ...prev.macos, minimumVersion: val },
                      }));
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                    placeholder="1.0.0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Android Download URL
                </label>
                <input
                  type="text"
                  value={manifest?.android?.downloadUrl || ''}
                  onChange={e => {
                    const val = e.target.value;
                    setManifest((prev: any) => ({
                      ...prev,
                      android: { ...prev.android, downloadUrl: val },
                    }));
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Windows Download URL
                </label>
                <input
                  type="text"
                  value={manifest?.windows?.downloadUrl || ''}
                  onChange={e => {
                    const val = e.target.value;
                    setManifest((prev: any) => ({
                      ...prev,
                      windows: { ...prev.windows, downloadUrl: val },
                    }));
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  macOS Download URL
                </label>
                <input
                  type="text"
                  value={manifest?.macos?.downloadUrl || ''}
                  onChange={e => {
                    const val = e.target.value;
                    setManifest((prev: any) => ({
                      ...prev,
                      macos: { ...prev.macos, downloadUrl: val },
                    }));
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSaveAll}
                  disabled={isSaving}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-600/20"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Update & Publish app-version.json to Blob</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: BLOB PERSISTENCE INSPECTOR */}
        {activeTab === 'blob' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">Live Backend Payload Preview</h2>
                  <p className="text-xs text-slate-400">
                    This unified JSON configuration package is synced across server memory, disk (public/genmusic-data.json), and Vercel Blob (app/genmusic-data.json).
                  </p>
                </div>
                <button
                  onClick={handleSaveAll}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/30"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
                  <span>Sync to Blob Now</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-96">
                {JSON.stringify(
                  {
                    timestamp: lastUpdated || new Date().toISOString(),
                    platformsCount: platforms.length,
                    channelsCount: channels.length,
                    updatesCount: updates.length,
                    manifest,
                    platforms: platforms.map(p => ({
                      id: p.id,
                      name: p.name,
                      version: p.version,
                      downloadUrl: p.downloadUrl,
                      fileSize: p.fileSize
                    })),
                    telegramConfig
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPage;
