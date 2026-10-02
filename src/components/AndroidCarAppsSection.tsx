import React from 'react';
import { 
  Car, 
  Mic, 
  WifiOff, 
  Gauge, 
  Download,
  Check
} from 'lucide-react';
import { DOWNLOAD_LINKS } from '../data/downloadLinks';
import { handleDownloadWithSponsor } from '../utils/downloadHelper';

interface AndroidCarAppsSectionProps {
  onDownloadClick: () => void;
}

export const AndroidCarAppsSection: React.FC<AndroidCarAppsSectionProps> = ({
  onDownloadClick,
}) => {
  const carFeatures = [
    {
      icon: <Car className="w-5 h-5 text-sky-400" />,
      title: "Android Auto Certified",
      desc: "Responsive layout engineered for standard and panoramic widescreen displays with instant wireless and USB connection."
    },
    {
      icon: <Mic className="w-5 h-5 text-sky-400" />,
      title: "Voice Telemetry & Control",
      desc: "Complete hands-free acoustic indexing. Trigger voice queries to search, queue, and filter losslessly without taking your eyes off the road."
    },
    {
      icon: <WifiOff className="w-5 h-5 text-sky-400" />,
      title: "Zero-Latency Offline Cache",
      desc: "Pre-download FLAC & 320kbps MP3 libraries directly to vehicle storage for uninterrupted audio across dead zones."
    },
    {
      icon: <Gauge className="w-5 h-5 text-sky-400" />,
      title: "Steering Wheel & CAN-Bus Mapping",
      desc: "Direct integration with steering wheel media controls, rotary jog dials, and digital cluster heads-up telemetry."
    }
  ];

  const handleCarDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDownloadWithSponsor(DOWNLOAD_LINKS.androidCar.downloadUrl, 'GEN-Music-Car.apk');
  };

  return (
    <section 
      id="car-apps" 
      aria-label="Android Auto & Car OS Integration"
      className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10"
    >
      <div className="space-y-12">
        
        {/* Section Header */}
        <div className="max-w-2xl text-left space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
            Android Auto & In-Car Audio
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            High-contrast, minimal distraction interface engineered for in-cabin acoustics and steering wheel control.
          </p>
        </div>

        {/* Split Layout: Image on one side, Bullets on the other */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Photorealistic Car Dashboard Display */}
          <div className="lg:col-span-7">
            <div className="surface-card overflow-hidden rounded-2xl relative group">
              <img
                src="/src/assets/images/car_dashboard_music_1790968892770.jpg"
                alt="GEN MUSIC running on modern car widescreen dashboard display"
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover aspect-[16/9] transition-transform duration-500 group-hover:scale-[1.02]"
                onError={(e) => {
                  // Fallback container if local path issues
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <div className="p-4 bg-slate-950/80 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-medium text-slate-300">
                  <Check className="w-4 h-4 text-sky-400" />
                  Auto-boots upon vehicle handshake
                </span>
                <span className="font-mono text-slate-500">Universal ARM64 / ARMv7</span>
              </div>
            </div>
          </div>

          {/* Right Column: Bullets & Specs */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-4">
              {carFeatures.map((feat, idx) => (
                <div 
                  key={idx} 
                  className="surface-card p-4 flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    {feat.icon}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white font-heading">{feat.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <a
                href={DOWNLOAD_LINKS.androidCar.downloadUrl}
                download="GEN-Music-Car.apk"
                onClick={handleCarDownload}
                id="btn-car-section-download"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm shadow-sm transition-all transform active:scale-98 cursor-pointer w-full sm:w-auto"
              >
                <Download className="w-4 h-4" />
                <span>Download Android Car APK</span>
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
