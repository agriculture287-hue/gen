import React, { useState } from 'react';
import { Link, Upload, Check, AlertCircle, Sparkles, X, Globe, ShieldCheck, ArrowRight } from 'lucide-react';
import { SupportedPlatform, VersionManifest } from '../types/update';
import { getLocalVersionManifest, saveLocalVersionManifest } from '../data/versionManifest';

interface AddUpdateByLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newVersion: string, platform: SupportedPlatform) => void;
  onShowToast?: (message: string) => void;
}

export const AddUpdateByLinkModal: React.FC<AddUpdateByLinkModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onShowToast,
}) => {
  const [platform, setPlatform] = useState<SupportedPlatform>('android');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [version, setVersion] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [releaseNote, setReleaseNote] = useState('');
  const [mirrorUrl, setMirrorUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const trimmedUrl = downloadUrl.trim();
    const trimmedVersion = version.trim().replace(/^[vV]/, '');

    if (!trimmedUrl) {
      setError('Please provide a valid download link URL');
      return;
    }

    if (!trimmedVersion) {
      setError('Please provide a target version number (e.g. 1.0.2 or 2.5.0)');
      return;
    }

    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      setError('Download URL must begin with http:// or https://');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Fetch current manifest
      const currentManifest: VersionManifest = getLocalVersionManifest();

      // 2. Format updated version info for target platform
      const today = new Date().toISOString().split('T')[0];
      const platformKey = platform === 'web' || platform === 'linux' ? 'android' : platform;

      const updatedManifest: VersionManifest = {
        ...currentManifest,
        [platformKey]: {
          ...currentManifest[platformKey],
          latestVersion: trimmedVersion,
          downloadUrl: trimmedUrl,
          fileSize: fileSize.trim() || currentManifest[platformKey]?.fileSize || '25 MB',
          releaseDate: today,
          mirrorUrl: mirrorUrl.trim() || currentManifest[platformKey]?.mirrorUrl || '',
        },
        releaseNotes: releaseNote.trim()
          ? [releaseNote.trim(), ...currentManifest.releaseNotes.slice(0, 3)]
          : currentManifest.releaseNotes,
        publishedAt: new Date().toISOString(),
      };

      // 3. Save to local storage
      saveLocalVersionManifest(updatedManifest);

      // 4. Send update to backend server API if available
      try {
        await fetch('/api/admin/update-version-manifest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedManifest),
        });
      } catch (apiErr) {
        console.warn('Backend sync warning (local storage updated):', apiErr);
      }

      setSuccessMsg(`App update v${trimmedVersion} for ${platform.toUpperCase()} published successfully!`);
      if (onShowToast) {
        onShowToast(`App update v${trimmedVersion} added by link!`);
      }
      if (onSuccess) {
        onSuccess(trimmedVersion, platform);
      }

      // Reset form after short delay
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 1200);

    } catch (err: any) {
      setError(err.message || 'Failed to save app update');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-white my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Link className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Add App Update by Link</h3>
              <p className="text-xs text-slate-400">Publish a new app version using a direct link</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Target Platform */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Target Platform
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['android', 'windows', 'macos'] as SupportedPlatform[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold capitalize flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    platform === p
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Download URL Link */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Download Link URL <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="url"
                required
                placeholder="https://example.com/downloads/app-v2.5.0.apk"
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <Link className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
            <p className="text-[11px] text-slate-500">
              Direct download link (e.g. Vercel Blob URL, GitHub Release asset, CDN link)
            </p>
          </div>

          {/* Version & File Size */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Version <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="2.5.0"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                File Size (Optional)
              </label>
              <input
                type="text"
                placeholder="25.4 MB"
                value={fileSize}
                onChange={(e) => setFileSize(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Optional Mirror / Telegram Link */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Mirror Link (Optional)
            </label>
            <input
              type="url"
              placeholder="https://t.me/genmusic_apk"
              value={mirrorUrl}
              onChange={(e) => setMirrorUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Release Notes */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Release Notes / Highlights
            </label>
            <textarea
              rows={2}
              placeholder="Added fast streaming engine and bug fixes..."
              value={releaseNote}
              onChange={(e) => setReleaseNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Feedback banners */}
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-blue-600/30 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Publishing...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Publish Update by Link</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
