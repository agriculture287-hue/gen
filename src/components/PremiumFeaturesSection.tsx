import React from 'react';
import { 
  ShieldCheck, 
  Infinity as InfinityIcon, 
  PlaySquare, 
  Radio, 
  Download, 
  FileAudio, 
  Headphones, 
  Sliders, 
  ListMusic, 
  Heart, 
  History, 
  MonitorSmartphone, 
  Smartphone, 
  Sparkles, 
  Compass, 
  Zap,
  Check
} from 'lucide-react';
import { FEATURES_LIST } from '../data/landingData';

interface PremiumFeaturesSectionProps {
  onDownloadClick: () => void;
}

export const PremiumFeaturesSection: React.FC<PremiumFeaturesSectionProps> = ({
  onDownloadClick,
}) => {
  const getFeatureIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'Infinity': return <InfinityIcon className="w-5 h-5 text-cyan-400" />;
      case 'PlaySquare': return <PlaySquare className="w-5 h-5 text-rose-400" />;
      case 'Radio': return <Radio className="w-5 h-5 text-emerald-400" />;
      case 'Download': return <Download className="w-5 h-5 text-blue-400" />;
      case 'FileAudio': return <FileAudio className="w-5 h-5 text-purple-400" />;
      case 'Headphones': return <Headphones className="w-5 h-5 text-indigo-400" />;
      case 'Sliders': return <Sliders className="w-5 h-5 text-pink-400" />;
      case 'ListMusic': return <ListMusic className="w-5 h-5 text-cyan-400" />;
      case 'Heart': return <Heart className="w-5 h-5 text-pink-400" />;
      case 'History': return <History className="w-5 h-5 text-amber-400" />;
      case 'MonitorSmartphone': return <MonitorSmartphone className="w-5 h-5 text-purple-400" />;
      case 'Smartphone': return <Smartphone className="w-5 h-5 text-blue-400" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-indigo-400" />;
      case 'Compass': return <Compass className="w-5 h-5 text-teal-400" />;
      case 'Zap': return <Zap className="w-5 h-5 text-amber-400" />;
      default: return <Sparkles className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <section 
      aria-label="Features Section"
      className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-white"
    >
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>SPECIFICATIONS & CAPABILITIES</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-heading">
          All Built In.{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent">
            Nothing Held Back.
          </span>
        </h2>

        <p className="text-base sm:text-lg text-slate-400">
          Everything you need for an uncompromising music experience across Android, Android Car, Mac, and Windows devices.
        </p>
      </div>

      {/* 16 Feature Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {FEATURES_LIST.map((feat) => (
          <div
            key={feat.id}
            id={`feature-card-${feat.id}`}
            onClick={onDownloadClick}
            className="group relative rounded-3xl bg-[#0c0f1e]/90 p-5 border border-white/10 hover:border-cyan-500/40 shadow-xl hover:shadow-[0_0_25px_rgba(0,240,255,0.12)] transition-all duration-200 flex flex-col justify-between hover:-translate-y-1 cursor-pointer backdrop-blur-xl"
          >
            <div className="space-y-3.5">
              {/* Icon & Badge */}
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 group-hover:scale-105 transition shadow-xs">
                  {getFeatureIcon(feat.icon)}
                </div>

                {feat.badge && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/[0.05] text-cyan-300 border border-white/10 uppercase tracking-wider">
                    {feat.badge}
                  </span>
                )}
              </div>

              {/* Feature Title & Description */}
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition font-heading flex items-center gap-1.5">
                  <span className="text-cyan-400 text-sm">✓</span>
                  <span>{feat.title}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            </div>

            {/* Bottom Indicator */}
            <div className="pt-3.5 mt-3.5 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="text-slate-500">Universal Matrix</span>
              <span className="text-cyan-400 font-bold group-hover:translate-x-0.5 transition-transform">Included Free</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
