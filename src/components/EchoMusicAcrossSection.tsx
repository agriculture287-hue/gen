import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Download, 
  ArrowRight, 
  Sparkles, 
  Smartphone, 
  Monitor, 
  Laptop, 
  Car, 
  Check, 
  Copy, 
  QrCode, 
  Radio, 
  ShieldCheck, 
  Zap, 
  Volume2, 
  Search, 
  ExternalLink,
  Flame,
  Music,
  Headphones
} from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { Track } from '../types/music';
import { DOWNLOAD_LINKS } from '../data/downloadLinks';
import { detectUserDevice, DeviceInfo } from '../utils/deviceDetector';
import { 
  handleDownloadWithSponsor, 
  triggerSponsorHyperlink, 
  triggerDownloadCelebration,
  OMG10_SPONSOR_URL 
} from '../utils/downloadHelper';

interface EchoMusicAcrossSectionProps {
  onEnterEchoMusic: (searchQuery?: string) => void;
  className?: string;
}

export const EchoMusicAcrossSection: React.FC<EchoMusicAcrossSectionProps> = ({
  onEnterEchoMusic,
  className = '',
}) => {
  const { currentTrack, isPlaying, playTrack, togglePlay } = useMusicPlayer();
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    platform: 'android',
    recommendedFileFormat: '.apk',
    platformName: 'Android',
    isMobile: true,
    rawOS: 'Android',
  });
  const [searchInput, setSearchInput] = useState('');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [downloadSuccessPlatform, setDownloadSuccessPlatform] = useState<string | null>(null);

  useEffect(() => {
    setDeviceInfo(detectUserDevice());
  }, []);

  // Curated popular hits ready for 1-click enter & play
  const popularEchoHits: Track[] = [
    {
      id: '4NRXx6U8ABQ',
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      album: 'After Hours',
      durationSeconds: 200,
      durationText: '3:20',
      thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80',
      type: 'song',
    },
    {
      id: 'eVli-tstM5E',
      title: 'Espresso',
      artist: 'Sabrina Carpenter',
      album: 'Short n\' Sweet',
      durationSeconds: 175,
      durationText: '2:55',
      thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80',
      type: 'song',
    },
    {
      id: 'TUVcZfQe-Kw',
      title: 'Levitating',
      artist: 'Dua Lipa',
      album: 'Future Nostalgia',
      durationSeconds: 203,
      durationText: '3:23',
      thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80',
      type: 'song',
    },
    {
      id: '34Na4j8AVgA',
      title: 'Starboy',
      artist: 'The Weeknd ft. Daft Punk',
      album: 'Starboy',
      durationSeconds: 230,
      durationText: '3:50',
      thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&q=80',
      type: 'song',
    },
    {
      id: 'JGwWNGJdvx8',
      title: 'Shape of You',
      artist: 'Ed Sheeran',
      album: 'Divide (÷)',
      durationSeconds: 233,
      durationText: '3:53',
      thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&q=80',
      type: 'song',
    },
    {
      id: 'kTJczUoc56U',
      title: 'Stay',
      artist: 'The Kid LAROI, Justin Bieber',
      album: 'F*CK LOVE 3',
      durationSeconds: 141,
      durationText: '2:21',
      thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&q=80',
      type: 'song',
    }
  ];

  // Platforms for download across devices
  const platformOptions = [
    {
      id: 'android',
      name: 'Android App',
      deviceType: 'Phone & Tablet',
      icon: Smartphone,
      format: '.apk',
      version: DOWNLOAD_LINKS.version,
      fileSize: DOWNLOAD_LINKS.android.fileSize,
      minSystem: DOWNLOAD_LINKS.android.minSystem,
      downloadUrl: DOWNLOAD_LINKS.android.downloadUrl,
      filename: 'GEN-Music.apk',
      badge: 'Most Popular',
      color: 'from-emerald-500 to-teal-500',
      borderHover: 'hover:border-emerald-500/50',
    },
    {
      id: 'windows',
      name: 'Windows Desktop',
      deviceType: 'PC & Laptop',
      icon: Monitor,
      format: '.exe',
      version: DOWNLOAD_LINKS.version,
      fileSize: DOWNLOAD_LINKS.windows.fileSize,
      minSystem: DOWNLOAD_LINKS.windows.minSystem,
      downloadUrl: DOWNLOAD_LINKS.windows.downloadUrl,
      filename: 'Gen-Music.exe',
      badge: '64-Bit Desktop',
      color: 'from-blue-500 to-cyan-500',
      borderHover: 'hover:border-blue-500/50',
    },
    {
      id: 'macos',
      name: 'macOS Client',
      deviceType: 'MacBook & iMac',
      icon: Laptop,
      format: '.dmg',
      version: DOWNLOAD_LINKS.version,
      fileSize: DOWNLOAD_LINKS.macos.fileSize,
      minSystem: DOWNLOAD_LINKS.macos.minSystem,
      downloadUrl: DOWNLOAD_LINKS.macos.downloadUrl,
      filename: 'Gen-Music.dmg',
      badge: 'Apple Silicon + Intel',
      color: 'from-purple-500 to-indigo-500',
      borderHover: 'hover:border-purple-500/50',
    },
    {
      id: 'car',
      name: 'Android Auto / Car',
      deviceType: 'In-Dash Touchscreens',
      icon: Car,
      format: '.apk',
      version: DOWNLOAD_LINKS.version,
      fileSize: DOWNLOAD_LINKS.androidCar.fileSize,
      minSystem: DOWNLOAD_LINKS.androidCar.minSystem,
      downloadUrl: DOWNLOAD_LINKS.androidCar.downloadUrl,
      filename: 'GEN-Music-Car.apk',
      badge: 'Automotive OS',
      color: 'from-amber-500 to-orange-500',
      borderHover: 'hover:border-amber-500/50',
    },
  ];

  // Determine user's best recommended download
  const getRecommendedPlatform = () => {
    if (deviceInfo.platform === 'windows') return platformOptions[1];
    if (deviceInfo.platform === 'macos') return platformOptions[2];
    return platformOptions[0]; // Android default
  };

  const recommendedPlatform = getRecommendedPlatform();

  const handleDownload = (platform: typeof platformOptions[0]) => {
    handleDownloadWithSponsor(platform.downloadUrl, { filename: platform.filename });
    triggerDownloadCelebration();
    setDownloadSuccessPlatform(platform.id);
    setTimeout(() => setDownloadSuccessPlatform(null), 4000);
  };

  const handleCopyLink = (url: string, platformId: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(platformId);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const handlePlayTrackAndEnter = (track: Track) => {
    triggerSponsorHyperlink(() => {
      playTrack(track, popularEchoHits);
      onEnterEchoMusic();
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim();
    triggerSponsorHyperlink(() => {
      if (query) {
        onEnterEchoMusic(query);
      } else {
        onEnterEchoMusic();
      }
    });
  };

  const handleLaunchWebPlayer = () => {
    triggerSponsorHyperlink(() => {
      onEnterEchoMusic();
    });
  };

  return (
    <section 
      id="echo-music-across" 
      className={`relative py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#060810] via-[#090d1c] to-[#05070e] text-white border-y border-white/10 overflow-hidden ${className}`}
    >
      {/* Background visualizer glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none -z-0" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[300px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none -z-0" />

      <div className="relative max-w-7xl mx-auto z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-semibold tracking-wider uppercase mb-4 shadow-sm shadow-cyan-500/20">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Echo Music Universe • Across All Devices</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
            Enter <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">Echo Music Across</span> with Download Option
          </h2>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Jump straight into pure audio streaming in your browser, or download native standalone Echo Music packages across 
            <strong className="text-white font-semibold"> Android</strong>, 
            <strong className="text-white font-semibold"> Windows</strong>, 
            <strong className="text-white font-semibold"> macOS</strong>, and 
            <strong className="text-white font-semibold"> Car</strong> with zero hyperlink ads.
          </p>
        </div>

        {/* Dual Gateways Grid: Left = Enter Echo Music Player, Right = Download Across Devices */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT GATEWAY (5 Cols): Enter Echo Music & Instant Play */}
          <div className="lg:col-span-6 flex flex-col justify-between rounded-2xl bg-[#0c1020]/90 border border-cyan-500/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
            {/* Ambient accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500" />
            
            <div>
              {/* Header */}
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
                    <Headphones className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      Enter Echo Music Online
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                        Live Stream
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">Unlimited high-fidelity streaming • Zero ads</p>
                  </div>
                </div>

                {/* Animated sound bars */}
                <div className="flex items-end gap-1 h-6">
                  <span className="w-1 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s] h-4" />
                  <span className="w-1 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s] h-6" />
                  <span className="w-1 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.45s] h-3" />
                  <span className="w-1 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.2s] h-5" />
                </div>
              </div>

              {/* Quick Search & Enter Bar */}
              <form onSubmit={handleSearchSubmit} className="relative mb-6">
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search any song, artist or album to enter..."
                    className="w-full pl-10 pr-28 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-md transition flex items-center gap-1.5"
                  >
                    <span>Enter</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {/* Primary Instant Enter Button */}
              <div className="mb-6">
                <button
                  onClick={handleLaunchWebPlayer}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:via-sky-400 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 group"
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                  </div>
                  <span>Launch Echo Music Web Player</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>

              {/* Popular Echo Hits (1-Click Play & Enter) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    Instant 1-Click Play & Enter
                  </span>
                  <span className="text-xs text-cyan-400 font-medium hover:underline cursor-pointer" onClick={handleLaunchWebPlayer}>
                    View all catalog →
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {popularEchoHits.map((track) => {
                    const isThisTrackPlaying = currentTrack?.id === track.id && isPlaying;

                    return (
                      <div
                        key={track.id}
                        onClick={() => handlePlayTrackAndEnter(track)}
                        className={`group/track flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                          currentTrack?.id === track.id
                            ? 'bg-cyan-500/15 border-cyan-500/40'
                            : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.08] hover:border-cyan-500/30'
                        }`}
                      >
                        <div className="relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800">
                          <img 
                            src={track.thumbnail} 
                            alt={track.title} 
                            className="w-full h-full object-cover group-hover/track:scale-110 transition duration-300"
                            loading="lazy"
                          />
                          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition ${
                            isThisTrackPlaying ? 'opacity-100' : 'opacity-0 group-hover/track:opacity-100'
                          }`}>
                            {isThisTrackPlaying ? (
                              <Pause className="w-4 h-4 text-cyan-300 fill-cyan-300" />
                            ) : (
                              <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                            )}
                          </div>
                        </div>

                        <div className="flex-grow min-w-0 text-left">
                          <p className={`text-xs font-semibold truncate ${
                            currentTrack?.id === track.id ? 'text-cyan-300' : 'text-white'
                          }`}>
                            {track.title}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {track.artist}
                          </p>
                        </div>

                        <div className="flex-shrink-0 text-[10px] text-slate-400 font-mono">
                          {track.durationText}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom trust banner */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <div 
                onClick={() => triggerSponsorHyperlink()}
                className="flex items-center gap-2 cursor-pointer hover:text-amber-300 transition"
                title="Tap to visit verified sponsor"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Sponsored by OMG10 • Exclusive Perks</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-cyan-400">
                <Volume2 className="w-3.5 h-3.5" />
                <span>320 kbps Audio</span>
              </div>
            </div>
          </div>

          {/* RIGHT GATEWAY (6 Cols): Download Across Platforms Options */}
          <div className="lg:col-span-6 flex flex-col justify-between rounded-2xl bg-[#0c1020]/90 border border-purple-500/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
            {/* Ambient accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-400 to-pink-500" />

            <div>
              {/* Header */}
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                    <Download className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      Download Echo Music Across
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                        Standalone Apps
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">Direct packages • Offline caching • Dolby 3D Audio</p>
                  </div>
                </div>

                {/* QR Code Quick Toggle for Mobile */}
                <button
                  onClick={() => setShowQrModal(!showQrModal)}
                  title="Scan QR Code to download on Mobile"
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-medium"
                >
                  <QrCode className="w-4 h-4 text-purple-400" />
                  <span className="hidden sm:inline">Mobile QR</span>
                </button>
              </div>

              {/* QR Modal Popover if open */}
              {showQrModal && (
                <div className="mb-6 p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 text-center animate-in fade-in duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Scan to Download on Phone</span>
                    <button onClick={() => setShowQrModal(false)} className="text-slate-400 hover:text-white text-xs">✕ Close</button>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2">
                    <div className="p-2 bg-white rounded-lg shadow-md">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(DOWNLOAD_LINKS.android.downloadUrl)}`} 
                        alt="Download Android APK QR Code" 
                        className="w-28 h-28"
                      />
                    </div>
                    <div className="text-left max-w-xs">
                      <p className="text-xs font-semibold text-white mb-1">Android APK Direct Package</p>
                      <p className="text-[11px] text-slate-300 mb-2">Scan with camera on phone or tablet to start instant {DOWNLOAD_LINKS.android.fileSize} download.</p>
                      <button
                        onClick={() => handleCopyLink(DOWNLOAD_LINKS.android.downloadUrl, 'android-qr')}
                        className="inline-flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 font-medium"
                      >
                        {copiedLink === 'android-qr' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedLink === 'android-qr' ? 'Link Copied!' : 'Copy Direct Download URL'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Detected Device Quick Action Banner */}
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-transparent border border-purple-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                    <recommendedPlatform.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Recommended for Your Device</span>
                      <span className="text-[10px] font-mono text-purple-300 px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                        {deviceInfo.platformName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {recommendedPlatform.name} ({recommendedPlatform.fileSize}) • {recommendedPlatform.version}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDownload(recommendedPlatform)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-2 flex-shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Download {recommendedPlatform.format}</span>
                </button>
              </div>

              {/* Multi-Platform Download Grid ("Across All Your Devices") */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-purple-400" />
                    Download Across All Ecosystems
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Version {DOWNLOAD_LINKS.version}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {platformOptions.map((platform) => {
                    const isSuccess = downloadSuccessPlatform === platform.id;
                    const Icon = platform.icon;

                    return (
                      <div
                        key={platform.id}
                        className={`p-3.5 rounded-xl bg-white/[0.03] border border-white/10 ${platform.borderHover} transition-all duration-200 hover:bg-white/[0.06] flex flex-col justify-between`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${platform.color} flex items-center justify-center text-white shadow`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-white leading-tight">
                                {platform.name}
                              </h4>
                              <p className="text-[10px] text-slate-400">
                                {platform.deviceType}
                              </p>
                            </div>
                          </div>

                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                            {platform.format}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3 font-mono">
                          <span>{platform.fileSize}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{platform.badge}</span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                          <button
                            onClick={() => handleDownload(platform)}
                            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                              isSuccess
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white/10 hover:bg-white/20 text-white'
                            }`}
                          >
                            {isSuccess ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-white" />
                                <span>Downloading</span>
                              </>
                            ) : (
                              <>
                                <Download className="w-3.5 h-3.5 text-purple-300" />
                                <span>Get {platform.format}</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleCopyLink(platform.downloadUrl, platform.id)}
                            title="Copy download link"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
                          >
                            {copiedLink === platform.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom trust banner */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>GPL-3.0 Open Source • Safe & Verified</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-purple-300">
                <Zap className="w-3.5 h-3.5" />
                <span>Direct High-Speed CDN</span>
              </div>
            </div>
          </div>

        </div>

        {/* Global Summary Chips */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <Check className="w-3.5 h-3.5 text-emerald-400" /> No Registration or Account Needed
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <Check className="w-3.5 h-3.5 text-cyan-400" /> Instant In-Browser Web Player
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <Check className="w-3.5 h-3.5 text-purple-400" /> Offline MP3 & Lossless Audio Caching
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <Check className="w-3.5 h-3.5 text-orange-400" /> 100% Free & Open Source
          </span>
        </div>

      </div>
    </section>
  );
};
