import React, { useState, useEffect } from 'react';
import { Settings, Lock, UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [formData, setFormData] = useState({
    latest_version: '',
    min_supported_version: '',
    force_update: false,
    whats_new: '',
    android_url: '',
    windows_url: '',
    macos_url: ''
  });

  const [isPublishing, setIsPublishing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string; url?: string } | null>(null);

  useEffect(() => {
    // Attempt to load existing app-version.json from the live app
    fetch('/app-version.json')
      .then(res => res.json())
      .then(data => {
        setFormData({
          latest_version: data.latest_version || '',
          min_supported_version: data.min_supported_version || '',
          force_update: !!data.force_update,
          whats_new: Array.isArray(data.whats_new) ? data.whats_new.join('\n') : (data.whats_new || ''),
          android_url: data.download_url?.android || '',
          windows_url: data.download_url?.windows || '',
          macos_url: data.download_url?.macos || ''
        });
      })
      .catch(err => console.warn('Could not load current app-version.json', err));
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    // We check the password on the server side when submitting, but we set local state to show form
    setIsAuthenticated(true);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    setFeedback(null);

    try {
      const payload = {
        latest_version: formData.latest_version,
        min_supported_version: formData.min_supported_version,
        force_update: formData.force_update,
        whats_new: formData.whats_new.split('\n').map(s => s.trim()).filter(Boolean),
        download_url: {
          android: formData.android_url,
          windows: formData.windows_url,
          macos: formData.macos_url
        }
      };

      const res = await fetch('/api/admin/update-version', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, data: payload })
      });

      const result = await res.json();
      if (result.success) {
        setFeedback({
          type: 'success',
          message: 'Update published successfully!',
          url: result.blobUrl
        });
      } else {
        if (res.status === 401) {
          setIsAuthenticated(false);
          setLoginError('Invalid password. Please try again.');
        } else {
          setFeedback({ type: 'error', message: result.error || 'Failed to publish update.' });
        }
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Network error occurred.' });
    } finally {
      setIsPublishing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
          <div className="flex flex-col items-center justify-center space-y-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setLoginError(''); }}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="Enter password..."
                autoFocus
              />
            </div>
            
            {loginError && (
              <p className="text-sm text-rose-600 font-medium">{loginError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition flex items-center justify-center cursor-pointer"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 font-sans">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 p-6 sm:p-8 flex items-center gap-4 text-white">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">App Update Manager</h1>
            <p className="text-sm text-slate-400">Publish new app-version.json to Vercel Blob</p>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <form onSubmit={handlePublish} className="space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Version
                </label>
                <input
                  type="text"
                  value={formData.latest_version}
                  onChange={e => setFormData({ ...formData, latest_version: e.target.value })}
                  placeholder="e.g. 1.0.1"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Min Supported Version
                </label>
                <input
                  type="text"
                  value={formData.min_supported_version}
                  onChange={e => setFormData({ ...formData, min_supported_version: e.target.value })}
                  placeholder="e.g. 1.0.0"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-mono text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="force_update"
                checked={formData.force_update}
                onChange={e => setFormData({ ...formData, force_update: e.target.checked })}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="force_update" className="text-sm font-bold text-slate-800 select-none cursor-pointer">
                Force users to update to this version
              </label>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                What's New (One bullet per line)
              </label>
              <textarea
                value={formData.whats_new}
                onChange={e => setFormData({ ...formData, whats_new: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 text-sm resize-y"
                placeholder="Fixed bugs...&#10;Added new features..."
              />
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Download URLs</h3>
              
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase">Android URL (.apk)</label>
                <input
                  type="url"
                  value={formData.android_url}
                  onChange={e => setFormData({ ...formData, android_url: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none text-sm font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase">Windows URL (.exe)</label>
                <input
                  type="url"
                  value={formData.windows_url}
                  onChange={e => setFormData({ ...formData, windows_url: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none text-sm font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase">macOS URL (.dmg)</label>
                <input
                  type="url"
                  value={formData.macos_url}
                  onChange={e => setFormData({ ...formData, macos_url: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none text-sm font-mono"
                />
              </div>
            </div>

            {feedback && (
              <div className={`p-4 rounded-xl flex items-start gap-3 ${
                feedback.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
              }`}>
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="space-y-1 overflow-hidden text-sm">
                  <p className="font-bold">{feedback.message}</p>
                  {feedback.url && (
                    <p className="text-emerald-700 font-mono text-[11px] break-all pt-1">
                      Live URL: <a href={feedback.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-600">{feedback.url}</a>
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isPublishing}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                <UploadCloud className="w-5 h-5" />
                <span>{isPublishing ? 'Publishing...' : 'Publish Update'}</span>
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};
