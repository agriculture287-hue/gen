'use client';

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
  FileText
} from 'lucide-react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);

  // Form States
  const [latestVersion, setLatestVersion] = useState<string>('');
  const [minSupportedVersion, setMinSupportedVersion] = useState<string>('');
  const [forceUpdate, setForceUpdate] = useState<boolean>(false);
  const [whatsNew, setWhatsNew] = useState<string>('');
  const [androidUrl, setAndroidUrl] = useState<string>('');
  const [windowsUrl, setWindowsUrl] = useState<string>('');
  const [macosUrl, setMacosUrl] = useState<string>('');

  // Status message states
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Get authorization header fallback for iframe testing
  const getAuthHeaders = (baseHeaders: Record<string, string> = {}): Record<string, string> => {
    if (typeof window === 'undefined') return baseHeaders;
    const token = localStorage.getItem('admin_session_token');
    const headers = { ...baseHeaders };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // Check auth cookie on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('admin_session_token');
        const res = await fetch('/api/admin/check-auth', {
          headers: getAuthHeaders()
        });
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated || token === 'authenticated') {
            setIsAuthenticated(true);
            await fetchCurrentVersion();
          }
        }
      } catch (err) {
        console.error('Failed to verify session:', err);
      } finally {
        setIsPageLoading(false);
      }
    };
    checkAuth();
  }, []);

  const fetchCurrentVersion = async () => {
    try {
      const res = await fetch('/app-version.json', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        populateForm(data);
      }
    } catch (err) {
      console.warn('Could not fetch app-version.json directly, using empty values:', err);
    }
  };

  const populateForm = (data: any) => {
    if (data) {
      setLatestVersion(data.latest_version || '');
      setMinSupportedVersion(data.min_supported_version || '');
      setForceUpdate(!!data.force_update);
      
      if (Array.isArray(data.whats_new)) {
        setWhatsNew(data.whats_new.join('\n'));
      } else if (typeof data.whats_new === 'string') {
        setWhatsNew(data.whats_new);
      }

      if (data.download_url) {
        setAndroidUrl(data.download_url.android || '');
        setWindowsUrl(data.download_url.windows || '');
        setMacosUrl(data.download_url.macos || '');
      }
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
      if (res.ok && data.success) {
        localStorage.setItem('admin_session_token', 'authenticated');
        setIsAuthenticated(true);
        await fetchCurrentVersion();
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus(null);
    setIsSaving(true);

    // Parse what's new bullet points
    const bullets = whatsNew
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const payload = {
      latest_version: latestVersion.trim(),
      min_supported_version: minSupportedVersion.trim(),
      force_update: forceUpdate,
      whats_new: bullets,
      download_url: {
        android: androidUrl.trim(),
        windows: windowsUrl.trim(),
        macos: macosUrl.trim()
      }
    };

    try {
      const res = await fetch('/api/admin/update-version', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveStatus({ success: true, message: 'App version manifest updated and deployed live on Vercel Blob successfully!' });
      } else {
        setSaveStatus({ success: false, message: data.error || 'Failed to update app version.' });
      }
    } catch (err) {
      setSaveStatus({ success: false, message: 'Network error. Please try again.' });
    } finally {
      setIsSaving(false);
    }
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
            <p className="text-xs text-slate-500 mt-1">Provide administrator password to manage system updates</p>
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
      {/* Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-4 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/15">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-slate-900">GEN MUSIC</h1>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Updates Manager</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-600 transition cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="space-y-6">
          
          {/* Active status confirmation */}
          {saveStatus && (
            <div className={`p-4 rounded-xl border flex gap-3 ${
              saveStatus.success 
                ? 'bg-emerald-50 border-emerald-200/80 text-emerald-800' 
                : 'bg-red-50 border-red-200/80 text-red-800'
            }`}>
              {saveStatus.success ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-sm font-bold">{saveStatus.success ? 'Success' : 'Error'}</p>
                <p className="text-xs text-slate-600 mt-0.5">{saveStatus.message}</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-800">Configure Update Information</h2>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              
              {/* Version Numbers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Latest Version</label>
                  <input
                    type="text"
                    required
                    value={latestVersion}
                    onChange={(e) => setLatestVersion(e.target.value)}
                    placeholder="e.g. 1.0.5"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition font-medium"
                  />
                  <p className="text-[10px] text-slate-400">The most current build available for download.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Min Supported Version</label>
                  <input
                    type="text"
                    required
                    value={minSupportedVersion}
                    onChange={(e) => setMinSupportedVersion(e.target.value)}
                    placeholder="e.g. 1.0.0"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition font-medium"
                  />
                  <p className="text-[10px] text-slate-400">Any build older than this will be prompted to update.</p>
                </div>
              </div>

              {/* Force Update Checkbox */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                <div>
                  <label htmlFor="force_update" className="text-xs font-bold text-slate-800 cursor-pointer">Enforce Immediate Update</label>
                  <p className="text-[10px] text-slate-400 mt-0.5">Blocks user interface until the user installs the latest build.</p>
                </div>
                <input
                  id="force_update"
                  type="checkbox"
                  checked={forceUpdate}
                  onChange={(e) => setForceUpdate(e.target.checked)}
                  className="h-5 w-5 text-blue-600 border-slate-300 rounded-md focus:ring-blue-500 cursor-pointer"
                />
              </div>

              {/* What's New */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">What's New (One line per bullet)</label>
                <textarea
                  required
                  rows={4}
                  value={whatsNew}
                  onChange={(e) => setWhatsNew(e.target.value)}
                  placeholder="Added custom equalizer settings&#10;Fixed bluetooth delay and latency issues&#10;Enhanced cloud backup speed"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition font-medium placeholder:text-slate-400"
                />
                <p className="text-[10px] text-slate-400">Listed changes to present in the update prompt.</p>
              </div>

              {/* Download URL Section */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Download URLs</h3>
                
                {/* Android */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Smartphone className="h-4 w-4 text-emerald-600" />
                    <label className="text-xs font-bold">Android Download Link</label>
                  </div>
                  <input
                    type="url"
                    required
                    value={androidUrl}
                    onChange={(e) => setAndroidUrl(e.target.value)}
                    placeholder="https://vercel-blob.com/android/genmusic.apk"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition font-mono"
                  />
                </div>

                {/* Windows */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Laptop className="h-4 w-4 text-blue-500" />
                    <label className="text-xs font-bold">Windows Download Link</label>
                  </div>
                  <input
                    type="url"
                    required
                    value={windowsUrl}
                    onChange={(e) => setWindowsUrl(e.target.value)}
                    placeholder="https://vercel-blob.com/windows/genmusic-setup.exe"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition font-mono"
                  />
                </div>

                {/* MacOS */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Monitor className="h-4 w-4 text-slate-700" />
                    <label className="text-xs font-bold">macOS Download Link</label>
                  </div>
                  <input
                    type="url"
                    required
                    value={macosUrl}
                    onChange={(e) => setMacosUrl(e.target.value)}
                    placeholder="https://vercel-blob.com/macos/genmusic.dmg"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition font-mono"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-semibold text-sm rounded-xl transition flex items-center gap-2 shadow-lg shadow-blue-600/10 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save and Publish Live</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
