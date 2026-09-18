import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Smartphone, 
  Laptop, 
  Monitor, 
  Save, 
  LogOut, 
  Sparkles, 
  FileText,
  ExternalLink,
  Code2,
  RefreshCw,
  Copy,
  Check,
  Send,
  Radio,
  DollarSign,
  Plus,
  Trash2,
  Edit3,
  Layers,
  UploadCloud,
  Database,
  Bell,
  ShieldCheck,
  RotateCcw,
  Zap,
  Info
} from 'lucide-react';
import { 
  AppPlatformRelease, 
  TelegramConfig, 
  TelegramChannel, 
  UpdateItem, 
  AdSettings 
} from '../types';
import { 
  getStoredPlatforms, 
  saveStoredPlatforms, 
  getStoredTelegramConfig, 
  saveStoredTelegramConfig, 
  getStoredChannels, 
  saveStoredChannels, 
  getStoredUpdates, 
  saveStoredUpdates, 
  getStoredAdSettings, 
  saveStoredAdSettings,
  resetAppToDefaults,
  DEFAULT_PLATFORMS,
  DEFAULT_TELEGRAM_CONFIG,
  DEFAULT_CHANNELS,
  DEFAULT_AD_SETTINGS
} from '../data/adminStore';
import { 
  loadAppDataFromBlob, 
  syncAllBackendDataToBlob,
  uploadAppFileToBlob
} from '../lib/blobStorage';
import { BlobDiagnosticModal } from '../components/BlobDiagnosticModal';

type AdminTab = 'versions' | 'platforms' | 'telegram' | 'ads' | 'updates' | 'storage';

export const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('versions');

  // Tab 1: Version Manifest States (app-version.json)
  const [latestVersion, setLatestVersion] = useState<string>('v2.5.0');
  const [minSupportedVersion, setMinSupportedVersion] = useState<string>('v1.0.0');
  const [forceUpdate, setForceUpdate] = useState<boolean>(false);
  const [whatsNew, setWhatsNew] = useState<string>('Dolby Audio 3D spatial surround sound\nBatch offline MP3 downloader up to 320kbps\nUnified YouTube Music & Spotify catalogs\nZero audio advertising interruptions');
  const [androidUrl, setAndroidUrl] = useState<string>('/download/genmusic.apk');
  const [windowsUrl, setWindowsUrl] = useState<string>('/download/genmusic-setup.exe');
  const [macosUrl, setMacosUrl] = useState<string>('/download/genmusic.dmg');

  // Tab 2: Platforms Detailed Specs
  const [platforms, setPlatforms] = useState<AppPlatformRelease[]>([]);
  const [editingPlatform, setEditingPlatform] = useState<AppPlatformRelease | null>(null);

  // Tab 3: Telegram Support & Channels
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>(DEFAULT_TELEGRAM_CONFIG);
  const [channels, setChannels] = useState<TelegramChannel[]>([]);
  const [editingChannel, setEditingChannel] = useState<TelegramChannel | null>(null);
  const [isAddingChannel, setIsAddingChannel] = useState<boolean>(false);

  // Tab 4: Ad Network & Monetization
  const [adSettings, setAdSettings] = useState<AdSettings>(DEFAULT_AD_SETTINGS);

  // Tab 5: Changelog & In-App Updates History
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [editingUpdate, setEditingUpdate] = useState<UpdateItem | null>(null);
  const [isAddingUpdate, setIsAddingUpdate] = useState<boolean>(false);

  // Tab 6: Blob Storage Diagnostic
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState<boolean>(false);

  // File Upload States
  const [uploadTargetPlatform, setUploadTargetPlatform] = useState<'android' | 'windows' | 'macos'>('android');
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadSuccessUrl, setUploadSuccessUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Global Status Messages
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<{ success: boolean; message: string; blobUrl?: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [broadcastMessage, setBroadcastMessage] = useState<string | null>(null);

  // Get authorization header fallback for iframe testing
  const getAuthHeaders = (baseHeaders: Record<string, string> = {}): Record<string, string> => {
    const token = localStorage.getItem('admin_session_token');
    const headers = { ...baseHeaders };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // Check auth session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/check-auth', {
          headers: getAuthHeaders()
        });
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setIsAuthenticated(true);
            await hydrateAllAdminData();
          } else {
            localStorage.removeItem('admin_session_token');
          }
        } else {
          localStorage.removeItem('admin_session_token');
        }
      } catch (err) {
        console.error('Failed to verify session:', err);
      } finally {
        setIsPageLoading(false);
      }
    };
    checkAuth();
  }, []);

  const hydrateAllAdminData = async () => {
    // 1. Hydrate local store first
    setPlatforms(getStoredPlatforms().filter(p => p.platform !== 'linux' && p.platform !== 'web' && p.id !== 'app-linux' && p.id !== 'app-web'));
    setTelegramConfig(getStoredTelegramConfig());
    setChannels(getStoredChannels());
    setUpdates(getStoredUpdates());
    setAdSettings(getStoredAdSettings());

    // 2. Fetch live app-version.json
    try {
      const res = await fetch(`/app-version.json?t=${Date.now()}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data) {
          if (data.latest_version) setLatestVersion(data.latest_version);
          if (data.min_supported_version) setMinSupportedVersion(data.min_supported_version);
          setForceUpdate(!!data.force_update);
          if (Array.isArray(data.whats_new)) {
            setWhatsNew(data.whats_new.join('\n'));
          } else if (typeof data.whats_new === 'string') {
            setWhatsNew(data.whats_new);
          }
          if (data.download_url) {
            if (data.download_url.android) setAndroidUrl(data.download_url.android);
            if (data.download_url.windows) setWindowsUrl(data.download_url.windows);
            if (data.download_url.macos) setMacosUrl(data.download_url.macos);
          }
        }
      }
    } catch (err) {
      console.warn('Note on app-version.json:', err);
    }

    // 3. Fetch comprehensive data payload from Vercel Blob
    try {
      const blobRes = await loadAppDataFromBlob();
      if (blobRes.success && blobRes.data) {
        const d = blobRes.data;
        if (Array.isArray(d.platforms) && d.platforms.length > 0) setPlatforms(d.platforms);
        if (d.telegramConfig) setTelegramConfig(d.telegramConfig);
        if (Array.isArray(d.channels) && d.channels.length > 0) setChannels(d.channels);
        if (Array.isArray(d.updates) && d.updates.length > 0) setUpdates(d.updates);
        if (d.adSettings) setAdSettings(d.adSettings);
      }
    } catch (err) {
      console.warn('Note on blob remote load:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.token) {
        localStorage.setItem('admin_session_token', data.token);
        setIsAuthenticated(true);
        await hydrateAllAdminData();
      } else {
        setLoginError(data.error || 'Invalid password');
      }
    } catch (err) {
      setLoginError('Server error. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { 
        method: 'POST',
        headers: getAuthHeaders()
      });
      localStorage.removeItem('admin_session_token');
      setIsAuthenticated(false);
      setPassword('');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const getAppVersionPayload = () => ({
    latest_version: latestVersion.trim(),
    min_supported_version: minSupportedVersion.trim(),
    force_update: forceUpdate,
    whats_new: whatsNew
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0),
    download_url: {
      android: androidUrl.trim(),
      windows: windowsUrl.trim(),
      macos: macosUrl.trim()
    }
  });

  const getFullAdminPayload = (platformsOverride?: AppPlatformRelease[]) => ({
    platforms: platformsOverride || platforms,
    telegramConfig,
    channels,
    updates,
    adSettings,
    manifest: {
      android: { latestVersion, downloadUrl: androidUrl.trim() },
      windows: { latestVersion, downloadUrl: windowsUrl.trim() },
      macos: { latestVersion, downloadUrl: macosUrl.trim() },
      releaseNotes: whatsNew.split('\n').filter(Boolean)
    },
    appVersion: getAppVersionPayload(),
    lastUpdated: new Date().toISOString()
  });

  // Save All / Publish Everything
  const handleSaveAll = async () => {
    setSaveStatus(null);
    setIsSaving(true);

    try {
      // 0. Keep the detailed Platform cards and the Versions tab (app-version.json
      // source of truth) in sync, no matter which tab the admin edited last,
      // so the live Download buttons and the admin's own card view never disagree.
      const syncedPlatforms = platforms.map(p => {
        if (p.platform === 'android') return { ...p, downloadUrl: androidUrl.trim() || p.downloadUrl };
        if (p.platform === 'windows') return { ...p, downloadUrl: windowsUrl.trim() || p.downloadUrl };
        if (p.platform === 'mac') return { ...p, downloadUrl: macosUrl.trim() || p.downloadUrl };
        return p;
      });
      setPlatforms(syncedPlatforms);

      // 1. Save to local storage stores
      saveStoredPlatforms(syncedPlatforms);
      saveStoredTelegramConfig(telegramConfig);
      saveStoredChannels(channels);
      saveStoredUpdates(updates);
      saveStoredAdSettings(adSettings);

      // 2. Post to /api/admin/update-version (writes app-version.json & version.json)
      const verRes = await fetch('/api/admin/update-version', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(getAppVersionPayload())
      });

      // 3. Sync full blob payload
      const blobRes = await syncAllBackendDataToBlob(getFullAdminPayload(syncedPlatforms));

      if (verRes.ok && blobRes.success) {
        setSaveStatus({
          success: true,
          message: 'All settings, download links, Telegram community info, and ad parameters have been successfully synchronized to Vercel Blob and saved locally!'
        });
        window.dispatchEvent(new Event('genmusic_ads_updated'));
      } else {
        // IMPORTANT: if either the version-manifest save or the Blob sync failed,
        // the update only exists in THIS browser's local storage — other visitors
        // will NOT see it. Surface this clearly instead of claiming success.
        let reason = 'Unknown error.';
        try {
          const errBody = await verRes.clone().json();
          if (errBody?.error) reason = errBody.error;
        } catch {
          if (!verRes.ok) reason = `Server responded with ${verRes.status}.`;
        }
        if (!blobRes.success && blobRes.error) reason = blobRes.error;

        setSaveStatus({
          success: false,
          message: `Saved locally on THIS device only \u2014 it did NOT sync to other visitors. Reason: ${reason} (Check that BLOB_READ_WRITE_TOKEN is set in your Vercel project's environment variables, then redeploy.)`
        });
      }
    } catch (err: any) {
      setSaveStatus({
        success: false,
        message: err?.message || 'Error occurred while saving configurations.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Trigger Instant In-App Update Broadcast
  const handleBroadcastAlert = async () => {
    setBroadcastMessage(null);
    try {
      const res = await fetch('/api/admin/trigger-update-alert', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          version: latestVersion,
          title: `GEN MUSIC ${latestVersion} Now Available!`,
          releaseNotes: whatsNew.split('\n').filter(Boolean),
          isMandatory: forceUpdate,
          minSupportedVersion: minSupportedVersion,
          downloadUrls: {
            android: androidUrl,
            windows: windowsUrl,
            macos: macosUrl
          }
        })
      });
      if (res.ok) {
        setBroadcastMessage('Update broadcast published! Connected app clients will receive the update dialog.');
        setTimeout(() => setBroadcastMessage(null), 5000);
      }
    } catch (err: any) {
      setBroadcastMessage('Failed to broadcast alert: ' + err.message);
    }
  };

  // Handle Binary Upload to Vercel Blob
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccessUrl(null);

    try {
      const res = await uploadAppFileToBlob(
        file,
        file.name,
        uploadTargetPlatform === 'android' ? 'android' : uploadTargetPlatform === 'windows' ? 'windows' : 'macos',
        'public',
        (p) => setUploadProgress(p)
      );

      if (res.success && res.publicUrl) {
        setUploadSuccessUrl(res.publicUrl);
        if (uploadTargetPlatform === 'android') {
          setAndroidUrl(res.publicUrl);
        } else if (uploadTargetPlatform === 'windows') {
          setWindowsUrl(res.publicUrl);
        } else if (uploadTargetPlatform === 'macos') {
          setMacosUrl(res.publicUrl);
        }
        setSaveStatus({
          success: true,
          message: `Uploaded ${file.name} to Blob and populated ${uploadTargetPlatform} download link!`
        });
      } else {
        setUploadError(res.error || 'Failed to upload binary.');
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Upload failed.');
    } finally {
      setUploadingFile(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        <p className="mt-4 text-sm text-slate-500 font-medium">Checking admin session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/80 shadow-xl overflow-hidden">
          <div className="px-8 pt-8 pb-6 text-center border-b border-slate-100">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-50 text-blue-600 mb-4">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">GEN MUSIC Admin</h1>
            <p className="text-xs text-slate-500 mt-1">Provide administrator password to manage system updates & download links</p>
          </div>
          
          <form onSubmit={handleLogin} className="p-8 space-y-4">
            {loginError && (
              <div className="flex items-center gap-2 p-3 text-xs bg-red-50 text-red-600 rounded-lg border border-red-100">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="font-semibold">{loginError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">Admin Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-semibold text-sm rounded-xl transition shadow-lg shadow-blue-600/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Unlock Control Panel</span>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 py-4 z-20">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/15">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-slate-900">GEN MUSIC Admin Panel</h1>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Full System & Live Sync Control</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              <span>Save & Publish Live</span>
            </button>

            <button
              onClick={hydrateAllAdminData}
              title="Refresh all data from cloud"
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl hover:bg-slate-100 text-xs font-semibold text-slate-600 transition cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl hover:bg-slate-100 text-xs font-semibold text-slate-600 transition cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-6xl mx-auto mt-4 flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'versions', label: 'App Versions & Downloads', icon: Smartphone },
            { id: 'platforms', label: 'Platform Specs', icon: Layers },
            { id: 'telegram', label: 'Telegram & Channels', icon: Send },
            { id: 'ads', label: 'Ad Monetization', icon: DollarSign },
            { id: 'updates', label: 'Changelog History', icon: FileText },
            { id: 'storage', label: 'Blob Blueprint & Raw JSON', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  active 
                    ? 'bg-slate-900 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Global Save Feedback */}
        {saveStatus && (
          <div className={`p-4 rounded-2xl border flex items-start gap-3 transition ${
            saveStatus.success 
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
              : 'bg-red-50/80 border-red-200 text-red-900'
          }`}>
            {saveStatus.success ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className="text-sm font-bold">{saveStatus.message}</p>
              {saveStatus.blobUrl && (
                <p className="text-xs text-emerald-700 font-mono break-all">
                  Blob Endpoint: {saveStatus.blobUrl}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Global Broadcast Feedback */}
        {broadcastMessage && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs font-bold flex items-center gap-2">
            <Bell className="h-4 w-4 text-blue-600" />
            <span>{broadcastMessage}</span>
          </div>
        )}

        {/* TAB 1: App Versions & Downloads */}
        {activeTab === 'versions' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Core Version Configuration Card */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-blue-600" />
                    <span>App Release Version & Update Rules</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Controls public app-version.json and active update triggers</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">Latest Public Version</label>
                    <input
                      type="text"
                      required
                      value={latestVersion}
                      onChange={(e) => setLatestVersion(e.target.value)}
                      placeholder="e.g. v2.5.0"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">Minimum Supported Version</label>
                    <input
                      type="text"
                      required
                      value={minSupportedVersion}
                      onChange={(e) => setMinSupportedVersion(e.target.value)}
                      placeholder="e.g. v1.0.0"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-slate-900">Force Mandatory Update</span>
                    <p className="text-xs text-slate-500">Prevent older app versions from playing music until updated</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={forceUpdate}
                      onChange={(e) => setForceUpdate(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Release Highlights / What's New (One per line)</label>
                  <textarea
                    rows={4}
                    value={whatsNew}
                    onChange={(e) => setWhatsNew(e.target.value)}
                    placeholder="Enter highlights, one per line..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={handleBroadcastAlert}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Bell className="h-3.5 w-3.5 text-blue-400" />
                    <span>Broadcast In-App Update Modal</span>
                  </button>
                </div>
              </div>

              {/* Direct Binary File Uploader */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <UploadCloud className="h-4 w-4 text-blue-600" />
                    <span>Upload Binary to Blob</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Directly upload .apk, .exe, or .dmg to Vercel Blob and auto-fill download URLs</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase">Target Platform</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['android', 'windows', 'macos'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setUploadTargetPlatform(p)}
                        className={`py-2 text-xs font-bold rounded-xl border capitalize cursor-pointer transition ${
                          uploadTargetPlatform === p
                            ? 'bg-blue-50 border-blue-600 text-blue-700 font-black'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl p-6 text-center transition bg-slate-50/50">
                  <input
                    type="file"
                    accept=".apk,.exe,.dmg,.zip"
                    onChange={handleFileUpload}
                    disabled={uploadingFile}
                    className="hidden"
                    id="admin-installer-file"
                  />
                  <label htmlFor="admin-installer-file" className="cursor-pointer space-y-2 block">
                    <div className="inline-flex p-3 rounded-full bg-blue-50 text-blue-600">
                      {uploadingFile ? <Loader2 className="h-6 w-6 animate-spin" /> : <UploadCloud className="h-6 w-6" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {uploadingFile ? `Uploading (${uploadProgress}%)...` : `Click to upload ${uploadTargetPlatform} package`}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Supports .apk, .exe, .dmg (Max 300MB)</p>
                    </div>
                  </label>
                </div>

                {uploadProgress > 0 && uploadingFile && (
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-2 transition-all duration-200" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}

                {uploadSuccessUrl && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      Uploaded Successfully!
                    </p>
                    <p className="font-mono break-all opacity-80">{uploadSuccessUrl}</p>
                  </div>
                )}

                {uploadError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                    {uploadError}
                  </div>
                )}
              </div>
            </div>

            {/* Platform Download URLs */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-blue-600" />
                  <span>Platform Download URLs</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Set the exact public download destinations or mirrors for every operating system</p>
              </div>

              <div className="space-y-4">
                {/* Android Input */}
                <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase">
                      <Smartphone className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Android Download Link (.apk)</span>
                    </label>
                    <a
                      href={androidUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Test URL</span>
                    </a>
                  </div>
                  <input
                    type="text"
                    required
                    value={androidUrl}
                    onChange={(e) => setAndroidUrl(e.target.value)}
                    placeholder="https://... or /download/genmusic.apk"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  />
                </div>

                {/* Windows Input */}
                <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase">
                      <Monitor className="h-3.5 w-3.5 text-blue-600" />
                      <span>Windows Download Link (.exe)</span>
                    </label>
                    <a
                      href={windowsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Test URL</span>
                    </a>
                  </div>
                  <input
                    type="text"
                    required
                    value={windowsUrl}
                    onChange={(e) => setWindowsUrl(e.target.value)}
                    placeholder="https://... or /download/genmusic-setup.exe"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  />
                </div>

                {/* macOS Input */}
                <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase">
                      <Laptop className="h-3.5 w-3.5 text-purple-600" />
                      <span>macOS Download Link (.dmg)</span>
                    </label>
                    <a
                      href={macosUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Test URL</span>
                    </a>
                  </div>
                  <input
                    type="text"
                    required
                    value={macosUrl}
                    onChange={(e) => setMacosUrl(e.target.value)}
                    placeholder="https://... or /download/genmusic.dmg"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Platform Specs */}
        {activeTab === 'platforms' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-blue-600" />
                    <span>Platform Releases & Specs Editor</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Customize download cards, file sizes, architecture, and system requirements</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {platforms.map((p, idx) => (
                  <div key={p.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">{p.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">{p.platform}</span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Version:</span>
                        <span className="font-mono font-bold text-slate-900">{p.version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Size:</span>
                        <span className="font-bold">{p.fileSize}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Architecture:</span>
                        <span className="truncate max-w-[150px]">{p.architecture || 'Universal'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Min OS:</span>
                        <span className="truncate max-w-[150px]">{p.minSystem}</span>
                      </div>
                      <div className="flex justify-between items-center gap-2 pt-1 mt-1 border-t border-slate-200/70">
                        <span className="text-slate-400 shrink-0">Download Link:</span>
                        <span className="truncate max-w-[150px] font-mono text-[10px] text-blue-700" title={p.downloadUrl}>{p.downloadUrl || 'Not set'}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setEditingPlatform({ ...p })}
                      className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit Specifications</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Editing Platform Modal / Form */}
              {editingPlatform && (
                <div className="p-5 bg-white border border-blue-200 rounded-2xl shadow-lg space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Edit3 className="h-4 w-4 text-blue-600" />
                      <span>Edit Platform: {editingPlatform.name}</span>
                    </h3>
                    <button
                      onClick={() => setEditingPlatform(null)}
                      className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Display Name</label>
                      <input
                        type="text"
                        value={editingPlatform.name}
                        onChange={(e) => setEditingPlatform({ ...editingPlatform, name: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Version</label>
                      <input
                        type="text"
                        value={editingPlatform.version}
                        onChange={(e) => setEditingPlatform({ ...editingPlatform, version: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">File Size</label>
                      <input
                        type="text"
                        value={editingPlatform.fileSize}
                        onChange={(e) => setEditingPlatform({ ...editingPlatform, fileSize: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Architecture</label>
                      <input
                        type="text"
                        value={editingPlatform.architecture || ''}
                        onChange={(e) => setEditingPlatform({ ...editingPlatform, architecture: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Min System Requirements</label>
                      <input
                        type="text"
                        value={editingPlatform.minSystem}
                        onChange={(e) => setEditingPlatform({ ...editingPlatform, minSystem: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">File Format</label>
                      <input
                        type="text"
                        value={editingPlatform.fileFormat}
                        onChange={(e) => setEditingPlatform({ ...editingPlatform, fileFormat: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Release Date Label</label>
                      <input
                        type="text"
                        value={editingPlatform.releaseDate}
                        onChange={(e) => setEditingPlatform({ ...editingPlatform, releaseDate: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Badge Label</label>
                      <input
                        type="text"
                        value={editingPlatform.badge || ''}
                        onChange={(e) => setEditingPlatform({ ...editingPlatform, badge: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                        Download Button Link
                        <span className="text-[9px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">This is the live URL every Download button on the site uses</span>
                      </label>
                      <input
                        type="text"
                        value={editingPlatform.downloadUrl}
                        onChange={(e) => setEditingPlatform({ ...editingPlatform, downloadUrl: e.target.value })}
                        placeholder="https://... or /download/genmusic.apk"
                        className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-1">
                      <label className="text-[11px] font-bold text-slate-700">Mirror Link (Telegram, etc.)</label>
                      <input
                        type="text"
                        value={editingPlatform.mirrorUrl || ''}
                        onChange={(e) => setEditingPlatform({ ...editingPlatform, mirrorUrl: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-3">
                      <label className="text-[11px] font-bold text-slate-700">Changelog (one line per bullet)</label>
                      <textarea
                        value={(editingPlatform.changelog || []).join('\n')}
                        onChange={(e) => setEditingPlatform({ ...editingPlatform, changelog: e.target.value.split('\n') })}
                        rows={4}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 mt-2">
                    <p className="text-[10px] text-slate-400 max-w-xs">
                      Changes here update this platform's card everywhere on the site. Android / Windows / macOS links also update the Versions tab automatically. Click "Save &amp; Publish Live" to write app-version.json and sync to Blob.
                    </p>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => setEditingPlatform(null)}
                        className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          const cleanedChangelog = (editingPlatform.changelog || [])
                            .map(l => l.trim())
                            .filter(l => l.length > 0);
                          const updated = { ...editingPlatform, changelog: cleanedChangelog };

                          setPlatforms(platforms.map(p => p.id === updated.id ? updated : p));

                          // Keep the Versions tab (app-version.json source of truth) in sync
                          // so the live Download button reflects this edit immediately.
                          if (updated.platform === 'android') setAndroidUrl(updated.downloadUrl.trim());
                          if (updated.platform === 'windows') setWindowsUrl(updated.downloadUrl.trim());
                          if (updated.platform === 'mac') setMacosUrl(updated.downloadUrl.trim());

                          setEditingPlatform(null);
                          setSaveStatus({ success: true, message: `Updated specifications for ${updated.name}. Click "Save & Publish Live" to sync.` });
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Apply Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Telegram Support & Channels */}
        {activeTab === 'telegram' && (
          <div className="space-y-6">
            {/* Telegram Support Configuration */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Send className="h-4 w-4 text-blue-600" />
                  <span>Telegram Support & Contact Settings</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Configure direct admin Telegram contact and support hours</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Contact Username</label>
                  <input
                    type="text"
                    value={telegramConfig.contactUsername}
                    onChange={(e) => setTelegramConfig({ ...telegramConfig, contactUsername: e.target.value })}
                    placeholder="@genmusic_admin"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Direct Contact URL</label>
                  <input
                    type="text"
                    value={telegramConfig.contactUrl}
                    onChange={(e) => setTelegramConfig({ ...telegramConfig, contactUrl: e.target.value })}
                    placeholder="https://t.me/genmusic_admin"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Support Hours Text</label>
                  <input
                    type="text"
                    value={telegramConfig.supportHours}
                    onChange={(e) => setTelegramConfig({ ...telegramConfig, supportHours: e.target.value })}
                    placeholder="Admin Direct Support • Available 24/7"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Top Announcement Banner Text</label>
                  <input
                    type="text"
                    value={telegramConfig.announcementText || ''}
                    onChange={(e) => setTelegramConfig({ ...telegramConfig, announcementText: e.target.value })}
                    placeholder="Contact admin directly on Telegram for fast APK assistance..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Telegram Channels Section */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Radio className="h-4 w-4 text-blue-600" />
                    <span>Telegram Community Channels</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Manage community links, discussion groups, and release channels</p>
                </div>

                <button
                  onClick={() => setIsAddingChannel(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Channel</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {channels.map((ch, idx) => (
                  <div key={ch.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">{ch.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">{ch.badge}</span>
                    </div>
                    <p className="text-xs text-slate-600">{ch.description}</p>
                    <p className="text-xs font-mono text-blue-600 break-all">{ch.link}</p>
                    
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/60">
                      <button
                        onClick={() => setEditingChannel({ ...ch })}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setChannels(channels.filter((_, i) => i !== idx))}
                        className="px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add / Edit Channel Modal */}
              {(isAddingChannel || editingChannel) && (
                <div className="p-5 bg-white border border-blue-200 rounded-2xl shadow-lg space-y-4">
                  <h4 className="text-sm font-bold text-slate-900">
                    {isAddingChannel ? 'Add New Telegram Channel' : 'Edit Telegram Channel'}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Title</label>
                      <input
                        type="text"
                        value={isAddingChannel ? '' : editingChannel?.title || ''}
                        onChange={(e) => {
                          if (isAddingChannel) {
                            setEditingChannel({ id: `ch-${Date.now()}`, title: e.target.value, description: '', link: 'https://t.me/', badge: 'Channel', memberCount: 'Community' });
                            setIsAddingChannel(false);
                          } else if (editingChannel) {
                            setEditingChannel({ ...editingChannel, title: e.target.value });
                          }
                        }}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Link URL</label>
                      <input
                        type="text"
                        value={editingChannel?.link || ''}
                        onChange={(e) => editingChannel && setEditingChannel({ ...editingChannel, link: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-700">Description</label>
                      <input
                        type="text"
                        value={editingChannel?.description || ''}
                        onChange={(e) => editingChannel && setEditingChannel({ ...editingChannel, description: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => { setIsAddingChannel(false); setEditingChannel(null); }}
                      className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (editingChannel) {
                          const existingIndex = channels.findIndex(c => c.id === editingChannel.id);
                          if (existingIndex >= 0) {
                            setChannels(channels.map((c, i) => i === existingIndex ? editingChannel : c));
                          } else {
                            setChannels([...channels, editingChannel]);
                          }
                          setEditingChannel(null);
                        }
                      }}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Save Channel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Ad Monetization */}
        {activeTab === 'ads' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                    <span>Ad Monetization & Direct Sponsor Settings</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Control sponsor redirect destination and Adsterra / banner network scripts</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-700">Enable Monetization:</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={adSettings.enableAds}
                      onChange={(e) => setAdSettings({ ...adSettings, enableAds: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                {/* Direct Sponsor Link */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                    <ExternalLink className="h-3.5 w-3.5 text-emerald-600" />
                    <span>8. Direct Sponsor Redirect Link (Triggered on Downloads / Smartlink)</span>
                  </label>
                  <input
                    type="text"
                    value={adSettings.directSponsorLink}
                    onChange={(e) => setAdSettings({ ...adSettings, directSponsorLink: e.target.value })}
                    placeholder="https://repeattelegraph.com/wvr8xjtukm?key=..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>

                {/* Banner Script Host & Unit Keys */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Adsterra / RepeatTelegraph Banner Unit Keys & Host
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">Host: {adSettings.adsterraScriptHost || 'https://repeattelegraph.com'}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">1. Medium Rectangle (300x250) Key</label>
                      <input
                        type="text"
                        value={adSettings.key300x250}
                        onChange={(e) => setAdSettings({ ...adSettings, key300x250: e.target.value })}
                        placeholder="c015de54225846752d4a34b052156ee8"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">2. Skyscraper (160x600) Key</label>
                      <input
                        type="text"
                        value={adSettings.key160x600}
                        onChange={(e) => setAdSettings({ ...adSettings, key160x600: e.target.value })}
                        placeholder="32c075957815f785e7ce0236d78b802b"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">3. Leaderboard (728x90) Key</label>
                      <input
                        type="text"
                        value={adSettings.key728x90}
                        onChange={(e) => setAdSettings({ ...adSettings, key728x90: e.target.value })}
                        placeholder="3635bbbdc742fefb24519c63b6bff3c5"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">4. Mobile Leaderboard (320x50) Key</label>
                      <input
                        type="text"
                        value={adSettings.key320x50}
                        onChange={(e) => setAdSettings({ ...adSettings, key320x50: e.target.value })}
                        placeholder="b9f225aac9d6cce00383764f5a5e0888"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">5. Vertical Banner (160x300) Key</label>
                      <input
                        type="text"
                        value={adSettings.key160x300}
                        onChange={(e) => setAdSettings({ ...adSettings, key160x300: e.target.value })}
                        placeholder="8fd0348a4e76f85f02e3cfba92e5d1b5"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">6. Compact Banner (468x60) Key</label>
                      <input
                        type="text"
                        value={adSettings.key468x60}
                        onChange={(e) => setAdSettings({ ...adSettings, key468x60: e.target.value })}
                        placeholder="f1c6f46aca31d8a642cea0cfb8809420"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                      <label className="text-[11px] font-bold text-slate-700">Script Host Domain</label>
                      <input
                        type="text"
                        value={adSettings.adsterraScriptHost}
                        onChange={(e) => setAdSettings({ ...adSettings, adsterraScriptHost: e.target.value })}
                        placeholder="https://repeattelegraph.com"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Popunder Scripts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">9. Popunder Script 1 URL</label>
                    <input
                      type="text"
                      value={adSettings.popunderScriptUrl1}
                      onChange={(e) => setAdSettings({ ...adSettings, popunderScriptUrl1: e.target.value })}
                      placeholder="https://repeattelegraph.com/59/d6/4a/59d64af1ed83ddee08ed24c679de3f7d.js"
                      className="w-full px-3.5 py-2 bg-slate-50 border rounded-xl text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">10. Popunder Script 2 URL</label>
                    <input
                      type="text"
                      value={adSettings.popunderScriptUrl2}
                      onChange={(e) => setAdSettings({ ...adSettings, popunderScriptUrl2: e.target.value })}
                      placeholder="https://repeattelegraph.com/f7/ea/44/f7ea4494ea85550007019f97df638807.js"
                      className="w-full px-3.5 py-2 bg-slate-50 border rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Native Banner Config */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">7. Native Ad Script URL</label>
                    <input
                      type="text"
                      value={adSettings.nativeScriptUrl}
                      onChange={(e) => setAdSettings({ ...adSettings, nativeScriptUrl: e.target.value })}
                      placeholder="https://repeattelegraph.com/05b45b5e8a25fd475368da7053c8dd8d/invoke.js"
                      className="w-full px-3.5 py-2 bg-slate-50 border rounded-xl text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">7. Native Container ID</label>
                    <input
                      type="text"
                      value={adSettings.nativeContainerId}
                      onChange={(e) => setAdSettings({ ...adSettings, nativeContainerId: e.target.value })}
                      placeholder="container-05b45b5e8a25fd475368da7053c8dd8d"
                      className="w-full px-3.5 py-2 bg-slate-50 border rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Changelog History */}
        {activeTab === 'updates' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span>In-App Changelog & Release Announcements</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Manage release history displayed in the Updates section</p>
                </div>

                <button
                  onClick={() => setIsAddingUpdate(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Release Note</span>
                </button>
              </div>

              <div className="space-y-4">
                {updates.map((item, idx) => (
                  <div key={item.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{item.version}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">{item.tag}</span>
                      </div>
                      <span className="text-xs text-slate-500">{item.releaseDate}</span>
                    </div>

                    <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                      {item.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/60">
                      <button
                        onClick={() => setEditingUpdate({ ...item })}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setUpdates(updates.filter((_, i) => i !== idx))}
                        className="px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add / Edit Update Form */}
              {(isAddingUpdate || editingUpdate) && (
                <div className="p-5 bg-white border border-blue-200 rounded-2xl shadow-lg space-y-4">
                  <h4 className="text-sm font-bold text-slate-900">
                    {isAddingUpdate ? 'Add Release Announcement' : 'Edit Release Announcement'}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Version</label>
                      <input
                        type="text"
                        value={isAddingUpdate ? '' : editingUpdate?.version || ''}
                        onChange={(e) => {
                          if (isAddingUpdate) {
                            setEditingUpdate({ id: `up-${Date.now()}`, version: e.target.value, releaseDate: 'Current', tag: 'Latest', highlights: [] });
                            setIsAddingUpdate(false);
                          } else if (editingUpdate) {
                            setEditingUpdate({ ...editingUpdate, version: e.target.value });
                          }
                        }}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Release Date</label>
                      <input
                        type="text"
                        value={editingUpdate?.releaseDate || ''}
                        onChange={(e) => editingUpdate && setEditingUpdate({ ...editingUpdate, releaseDate: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Badge / Tag</label>
                      <input
                        type="text"
                        value={editingUpdate?.tag || ''}
                        onChange={(e) => editingUpdate && setEditingUpdate({ ...editingUpdate, tag: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-3">
                      <label className="text-[11px] font-bold text-slate-700">Highlights (One bullet per line)</label>
                      <textarea
                        rows={3}
                        value={editingUpdate?.highlights.join('\n') || ''}
                        onChange={(e) => editingUpdate && setEditingUpdate({ ...editingUpdate, highlights: e.target.value.split('\n').filter(Boolean) })}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => { setIsAddingUpdate(false); setEditingUpdate(null); }}
                      className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (editingUpdate) {
                          const existingIndex = updates.findIndex(u => u.id === editingUpdate.id);
                          if (existingIndex >= 0) {
                            setUpdates(updates.map((u, i) => i === existingIndex ? editingUpdate : u));
                          } else {
                            setUpdates([editingUpdate, ...updates]);
                          }
                          setEditingUpdate(null);
                        }
                      }}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Save Update
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: Storage & Raw Blueprint */}
        {activeTab === 'storage' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Database className="h-4 w-4 text-blue-600" />
                    <span>Cloud Storage & Live JSON Blueprints</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Inspect payload structures and backup configuration files</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsDiagnosticOpen(true)}
                    className="px-3 py-1.5 border border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    <span>Run Blob Diagnostic</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to reset all admin configurations to initial factory defaults?')) {
                        resetAppToDefaults();
                        setPlatforms(DEFAULT_PLATFORMS);
                        setTelegramConfig(DEFAULT_TELEGRAM_CONFIG);
                        setChannels(DEFAULT_CHANNELS);
                        setAdSettings(DEFAULT_AD_SETTINGS);
                        setSaveStatus({ success: true, message: 'All settings have been reset to factory defaults.' });
                      }
                    }}
                    className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset Factory Defaults</span>
                  </button>
                </div>
              </div>

              {/* app-version.json preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 font-mono">app-version.json Payload</span>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(getAppVersionPayload(), null, 2), 'app-ver')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'app-ver' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'app-ver' ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto max-h-56">
                  {JSON.stringify(getAppVersionPayload(), null, 2)}
                </pre>
              </div>

              {/* Full Dataset preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 font-mono">genmusic-data.json (Complete Cloud State)</span>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(getFullAdminPayload(), null, 2), 'full-data')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'full-data' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'full-data' ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto max-h-56">
                  {JSON.stringify(getFullAdminPayload(), null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </main>

      <BlobDiagnosticModal
        isOpen={isDiagnosticOpen}
        onClose={() => setIsDiagnosticOpen(false)}
      />
    </div>
  );
};
export default AdminPage;
