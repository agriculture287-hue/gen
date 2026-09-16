import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  Laptop, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  ExternalLink, 
  RefreshCw, 
  FileCode2, 
  Copy, 
  QrCode, 
  HardDrive,
  Info,
  Calendar,
  AlertTriangle,
  Zap,
  Send,
  Layers,
  ChevronDown
} from 'lucide-react';
import { VersionManifest, SupportedPlatform } from '../types/update';
import { detectCurrentPlatform, DEFAULT_VERSION_MANIFEST, compareSemver } from '../data/versionManifest';
import { GenMusicLogo } from './GenMusicLogo';

interface DownloadsPageProps {
  manifest: VersionManifest;
  onOpenBetaModal?: () => void;
  telegramContactUrl?: string;
}

export const DownloadsPage: React.FC<DownloadsPageProps> = ({
  manifest = DEFAULT_VERSION_MANIFEST,
  onOpenBetaModal,
  telegramContactUrl = 'https://t.me/genmusic_admin',
}) => {
  const [detectedOS, setDetectedOS] = useState<SupportedPlatform>('web');
  const [copiedSha, setCopiedSha] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'android' | 'windows' | 'macos'>('all');
  
  // Interactive Version Checker Simulation Tool inside the page
  const [simPlatform, setSimPlatform] = useState<SupportedPlatform>('android');
  const [simVersion, setSimVersion] = useState<string>('1.0.0');
  const [simResult, setSimResult] = useState<{
    hasUpdate: boolean;
    isMandatory: boolean;
    latest: string;
    minimum: string;
  } | null>(null);

  useEffect(() => {
    const os = detectCurrentPlatform();
    setDetectedOS(os);
    if (os === 'android' || os === 'windows' || os === 'macos') {
      setSimPlatform(os);
    }
  }, []);

  const handleCopySha = (sha: string) => {
    navigator.clipboard.writeText(sha);
    setCopiedSha(sha);
    setTimeout(() => setCopiedSha(null), 2500);
  };

  const handleSimulateCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const platInfo = manifest[simPlatform === 'macos' ? 'macos' : simPlatform === 'windows' ? 'windows' : 'android'];
    const hasUpdate = compareSemver(platInfo.latestVersion, simVersion) > 0;
    const isMandatory = compareSemver(platInfo.minimumVersion, simVersion) > 0;
    setSimResult({
      hasUpdate,
      isMandatory,
      latest: platInfo.latestVersion,
      minimum: platInfo.minimumVersion,
    });
  };

  const platformsList = [
    {
      id: 'android',
      name: 'Android App',
      tagline: 'Direct APK Package for Phones & Tablets',
      fileFormat: '.apk',
      version: manifest.android.latestVersion,
      minVersion: manifest.android.minimumVersion,
      downloadUrl: '/download/genmusic.apk',
      mirrorUrl: 'https://t.me/genmusic_apk',
      fileSize: manifest.android.fileSize || '24.8 MB',
      sysReq: 'Android 8.0 Oreo or later (Android 8 - 15+)',
      sha256: manifest.android.sha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      arch: 'ARM64-v8a / Universal',
      icon: <Smartphone className="w-8 h-8 text-emerald-600" />,
      accentColor: 'emerald',
      badge: 'Direct APK (No Ads)',
      features: ['Background Audio Playback', 'Lossless 320kbps MP3 Saver', 'Dolby Surround Sound', 'Spotify & YouTube Sync'],
      isRecommended: detectedOS === 'android',
    },
    {
      id: 'windows',
      name: 'Windows Desktop',
      tagline: 'Standard 64-bit Installer with Auto-Updates',
      fileFormat: '.exe',
      version: manifest.windows.latestVersion,
      minVersion: manifest.windows.minimumVersion,
      downloadUrl: '/download/genmusic-setup.exe',
      mirrorUrl: 'https://t.me/genmusic_apk',
      fileSize: manifest.windows.fileSize || '56.2 MB',
      sysReq: 'Windows 10 / 11 (64-bit architecture)',
      sha256: manifest.windows.sha256 || 'a12bc44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b899',
      arch: 'x64 / ARM64',
      icon: <Monitor className="w-8 h-8 text-blue-600" />,
      accentColor: 'blue',
      badge: 'Windows Setup (NSIS)',
      features: ['Discord Rich Presence', 'System Media Key Hotkeys', '10-Band EQ & Bass Virtualizer', 'Silent Auto-Updates'],
      isRecommended: detectedOS === 'windows',
    },
    {
      id: 'macos',
      name: 'macOS Desktop',
      tagline: 'Universal DMG for Apple Silicon & Intel Macs',
      fileFormat: '.dmg',
      version: manifest.macos.latestVersion,
      minVersion: manifest.macos.minimumVersion,
      downloadUrl: '/download/genmusic.dmg',
      mirrorUrl: 'https://t.me/genmusic_official',
      fileSize: manifest.macos.fileSize || '68.4 MB',
      sysReq: 'macOS 12.0 Monterey or later (M1/M2/M3/M4 & Intel)',
      sha256: manifest.macos.sha256 || 'c88df44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b112',
      arch: 'Universal (Apple Silicon + Intel)',
      icon: <Laptop className="w-8 h-8 text-indigo-600" />,
      accentColor: 'indigo',
      badge: 'macOS DMG (Universal)',
      features: ['Menu Bar Mini Player', 'Native Apple Silicon Decoding', 'AirPlay & Spatial Audio', 'Auto-Updater Integration'],
      isRecommended: detectedOS === 'macos',
    },
  ];

  return (
    <section id="downloads-hub-section" className="py-16 sm:py-24 bg-slate-900 text-slate-100 relative overflow-hidden">
      
      {/* Background Decorative Neon Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-900/60 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Official Release Hub
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Download <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400">GEN MUSIC</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Free, unlimited music streaming and offline audio player for all your devices. Zero audio ads, lossless 320kbps audio engine, and automatic background updates.
          </p>

          {/* Detected Platform Quick Highlight */}
          {detectedOS !== 'web' && (
            <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-800/90 border border-slate-700 text-xs font-semibold text-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>We detected your operating system: <strong className="text-white capitalize">{detectedOS}</strong>. We've highlighted the recommended package below.</span>
            </div>
          )}
        </div>

        {/* Platform Download Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {platformsList.map((p) => (
            <div
              key={p.id}
              id={`download-card-${p.id}`}
              className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                p.isRecommended
                  ? 'bg-gradient-to-b from-slate-800 to-slate-800/90 border-2 border-blue-500 shadow-2xl shadow-blue-500/10 scale-102 sm:scale-103'
                  : 'bg-slate-800/60 border border-slate-700/80 hover:border-slate-600 hover:bg-slate-800'
              }`}
            >
              {/* Recommended Top Badge */}
              {p.isRecommended && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md">
                  ★ Recommended For You
                </div>
              )}

              <div>
                {/* Header Icon + Format */}
                <div className="flex items-center justify-between mb-5">
                  <div className="p-3.5 rounded-2xl bg-slate-700/60 border border-slate-600/50">
                    {p.icon}
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-blue-400 px-2.5 py-1 rounded-lg bg-blue-950/60 border border-blue-800/60">
                      v{p.version}
                    </span>
                    <span className="block text-[11px] text-slate-400 mt-1">{p.fileSize}</span>
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-1">
                  {p.name}
                </h2>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  {p.tagline}
                </p>

                {/* Features List */}
                <div className="space-y-2.5 mb-6">
                  {p.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* System Requirement Tag */}
                <div className="bg-slate-900/70 rounded-xl p-3 border border-slate-700/50 mb-6 text-[11px] text-slate-400">
                  <span className="font-bold text-slate-300 block mb-0.5">System Requirement:</span>
                  <span>{p.sysReq}</span>
                </div>
              </div>

              <div>
                {/* Primary Download Button */}
                <a
                  href={p.downloadUrl}
                  download
                  id={`btn-download-${p.id}`}
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 text-white shadow-lg cursor-pointer ${
                    p.isRecommended
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-600/30'
                      : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  <span>Download {p.fileFormat.toUpperCase()}</span>
                </a>

                {/* Secondary Fast Telegram Mirror */}
                <div className="mt-3 flex items-center justify-between text-xs">
                  <a
                    href={p.mirrorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-cyan-400 transition flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Telegram Mirror</span>
                  </a>

                  <button
                    onClick={() => handleCopySha(p.sha256)}
                    className="text-slate-400 hover:text-slate-200 transition flex items-center gap-1 cursor-pointer"
                    title={p.sha256}
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedSha === p.sha256 ? 'SHA Copied!' : 'SHA-256'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Update System Simulator & Version Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          
          {/* Left Column: Live Interactive Version Checker */}
          <div className="lg:col-span-6 bg-slate-800/80 rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Live Update System Inspector</h3>
                <p className="text-xs text-slate-400">Verify installed client version against /version.json manifest</p>
              </div>
            </div>

            <form onSubmit={handleSimulateCheck} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Platform</label>
                  <select
                    value={simPlatform}
                    onChange={(e) => setSimPlatform(e.target.value as SupportedPlatform)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="android">Android (.apk)</option>
                    <option value="windows">Windows (.exe)</option>
                    <option value="macos">macOS (.dmg)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Installed Version</label>
                  <input
                    type="text"
                    value={simVersion}
                    onChange={(e) => setSimVersion(e.target.value)}
                    placeholder="e.g. 1.0.0 or 0.9.0"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Run Update Check Simulation</span>
              </button>
            </form>

            {/* Simulation Result */}
            {simResult && (
              <div className="mt-5 p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-slate-400">Check Status</span>
                  {simResult.isMandatory ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Force Update Required
                    </span>
                  ) : simResult.hasUpdate ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Optional Update Available
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Up to Date
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono my-2 text-slate-300">
                  <div className="bg-slate-800 p-2.5 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Current</span>
                    v{simVersion}
                  </div>
                  <div className="bg-slate-800 p-2.5 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Latest Available</span>
                    v{simResult.latest} (Min: v{simResult.minimum})
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 mt-2">
                  {simResult.isMandatory
                    ? '⚠️ Installed version is strictly below minimum required version. The app blocks background usage and displays full-screen force update prompt.'
                    : simResult.hasUpdate
                    ? '💡 Newer version available. Non-blocking prompt offered with "Update Now" and "Later" options.'
                    : '✅ You are on the newest release. Update check caches response for 6 hours.'}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Release Notes & Feed Information */}
          <div className="lg:col-span-6 bg-slate-800/80 rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                  <FileCode2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Live Release Notes & Manifest</h3>
                  <p className="text-xs text-slate-400">Served dynamically at <code className="text-blue-400 font-mono">/version.json</code></p>
                </div>
              </div>
              <a
                href="/version.json"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-[11px] text-slate-200 font-semibold flex items-center gap-1"
              >
                <span>JSON</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-3 mb-6">
              {manifest.releaseNotes.map((note, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs text-slate-300 bg-slate-900/50 p-3 rounded-xl border border-slate-700/40">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-mono text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span>{note}</span>
                </div>
              ))}
            </div>

            {/* Verification & Security Notice */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-800/50 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300">
                <strong className="text-white block mb-0.5">Integrity & Cryptographic Verification</strong>
                All Gen Music releases are signed and verified against checksum fingerprints before installation. 6-hour caching and offline failover protect against network dropouts.
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
