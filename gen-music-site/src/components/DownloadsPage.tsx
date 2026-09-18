import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  Laptop, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  ExternalLink, 
  FileCode2, 
  Send
} from 'lucide-react';
import { VersionManifest, SupportedPlatform } from '../types/update';
import { detectCurrentPlatform, DEFAULT_VERSION_MANIFEST } from '../data/versionManifest';
import { DIRECT_SPONSOR_LINK } from './AdBanners';

interface DownloadsPageProps {
  manifest?: VersionManifest;
  onOpenBetaModal?: () => void;
  telegramContactUrl?: string;
  isAdminLoggedIn?: boolean;
}

export const DownloadsPage: React.FC<DownloadsPageProps> = ({
  manifest = DEFAULT_VERSION_MANIFEST,
  isAdminLoggedIn = false,
}) => {
  const [detectedOS, setDetectedOS] = useState<SupportedPlatform>('web');
  const [appVerData, setAppVerData] = useState<any>(null);

  useEffect(() => {
    const os = detectCurrentPlatform();
    setDetectedOS(os);

    // Fetch the live app-version.json directly from the server/CDN
    fetch('/app-version.json')
      .then((res) => res.json())
      .then((data) => {
        setAppVerData(data);
      })
      .catch((err) => {
        console.warn('Error loading app-version.json:', err);
      });
  }, []);

  const handleDownloadWithAd = (e: React.MouseEvent, downloadUrl: string) => {
    e.preventDefault();

    // 1. First open ad link in new tab
    try {
      window.open(DIRECT_SPONSOR_LINK, '_blank');
    } catch {
      // safe fallback
    }

    // 2. Open actual download link after short delay
    setTimeout(() => {
      const a = document.createElement('a');
      a.href = downloadUrl;
      if (downloadUrl.startsWith('http')) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      } else {
        a.target = '_self';
      }
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }, 300);
  };

  const platformsList = [
    {
      id: 'android',
      name: 'GEN MUSIC for Android',
      tagline: 'Official Direct APK Package for Phones & Tablets',
      fileFormat: '.apk',
      version: appVerData?.latest_version || manifest.android.latestVersion,
      downloadUrl: appVerData?.download_url?.android || manifest.android.downloadUrl || '/download/genmusic.apk',
      mirrorUrl: 'https://t.me/genmusic_apk',
      fileSize: manifest.android.fileSize || '24.8 MB',
      sysReq: 'Android 8.0 Oreo or later (Android 8 - 15+)',
      arch: 'ARM64-v8a & Universal (All Devices)',
      icon: <Smartphone className="w-8 h-8 text-emerald-600" />,
      features: ['Background Audio Playback', 'Lossless 320kbps MP3 Saver', 'Dolby Surround Sound', 'Spotify & YouTube Sync', 'Zero Audio Commercials', 'Live Karaoke Lyrics'],
      isRecommended: true,
    },
  ];

  return (
    <section id="downloads-hub-section" className="py-16 sm:py-24 bg-slate-900 text-slate-100 relative overflow-hidden">
      {/* Background Decorative Neon Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Official Mobile Release Hub
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Download <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-emerald-300 to-cyan-400">GEN MUSIC Mobile App</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Free, unlimited music streaming and offline audio player for your Android mobile phone or tablet. Zero audio ads, lossless 320kbps audio engine, and automatic background updates.
          </p>
        </div>

        {/* Platform Download Card */}
        <div className="max-w-xl mx-auto">
          {platformsList.map((p) => (
            <div
              key={p.id}
              id={`download-card-${p.id}`}
              className="relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 bg-gradient-to-b from-slate-800 to-slate-800/90 border-2 border-emerald-500/80 shadow-2xl shadow-emerald-500/10"
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-600 to-emerald-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md">
                ★ Latest Verified APK
              </div>

              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="p-3.5 rounded-2xl bg-slate-700/60 border border-slate-600/50">
                    {p.icon}
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/60">
                      v{p.version}
                    </span>
                    <span className="block text-[11px] text-slate-400 mt-1">{p.fileSize} • Direct APK</span>
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-1">
                  {p.name}
                </h2>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  {p.tagline}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
                  {p.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-900/70 rounded-xl p-3 border border-slate-700/50 mb-6 text-[11px] text-slate-400">
                  <span className="font-bold text-slate-300 block mb-0.5">System Requirement:</span>
                  <span>{p.sysReq}</span>
                </div>
              </div>

              <div>
                <a
                  href={p.downloadUrl}
                  onClick={(e) => handleDownloadWithAd(e, p.downloadUrl)}
                  id={`btn-download-${p.id}`}
                  className="w-full py-4 px-6 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 text-white shadow-lg cursor-pointer bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:opacity-95 shadow-emerald-600/30"
                >
                  <Download className="w-4 h-4" />
                  <span>Download APK ({p.version})</span>
                </a>

                <p className="text-[10.5px] text-amber-300/80 text-center mt-2 font-medium">
                  💡 Opens sponsor ad tab. Simply close ad tab to finish download.
                </p>

                <div className="mt-3 flex items-center justify-center text-xs">
                  <a
                    href={p.mirrorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-emerald-400 transition flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Telegram APK Channel Mirror</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
