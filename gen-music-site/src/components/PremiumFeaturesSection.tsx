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
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
      case 'Infinity': return <InfinityIcon className="w-5 h-5 text-blue-600" />;
      case 'PlaySquare': return <PlaySquare className="w-5 h-5 text-red-600" />;
      case 'Radio': return <Radio className="w-5 h-5 text-emerald-600" />;
      case 'Download': return <Download className="w-5 h-5 text-blue-600" />;
      case 'FileAudio': return <FileAudio className="w-5 h-5 text-purple-600" />;
      case 'Headphones': return <Headphones className="w-5 h-5 text-indigo-600" />;
      case 'Sliders': return <Sliders className="w-5 h-5 text-pink-600" />;
      case 'ListMusic': return <ListMusic className="w-5 h-5 text-blue-600" />;
      case 'Heart': return <Heart className="w-5 h-5 text-pink-600" />;
      case 'History': return <History className="w-5 h-5 text-amber-600" />;
      case 'MonitorSmartphone': return <MonitorSmartphone className="w-5 h-5 text-purple-600" />;
      case 'Smartphone': return <Smartphone className="w-5 h-5 text-blue-600" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-indigo-600" />;
      case 'Compass': return <Compass className="w-5 h-5 text-teal-600" />;
      case 'Zap': return <Zap className="w-5 h-5 text-amber-600" />;
      default: return <Sparkles className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <section 
      aria-label="Features Section"
      className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Feature Capabilities</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-heading">
          All Built In.{' '}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent">
            Nothing Held Back.
          </span>
        </h2>

        <p className="text-base sm:text-lg text-slate-600">
          Everything you need for an uncompromising music experience across your Android, Mac, and Windows devices.
        </p>
      </div>

      {/* 16 Feature Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {FEATURES_LIST.map((feat) => (
          <div
            key={feat.id}
            id={`feature-card-${feat.id}`}
            onClick={onDownloadClick}
            className="group relative rounded-3xl bg-white p-5 border border-slate-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between hover:-translate-y-1 cursor-pointer"
          >
            <div className="space-y-3.5">
              {/* Icon & Badge */}
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 group-hover:scale-105 transition">
                  {getFeatureIcon(feat.icon)}
                </div>

                {feat.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
                    {feat.badge}
                  </span>
                )}
              </div>

              {/* Feature Title & Description */}
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition font-heading flex items-center gap-1.5">
                  <span className="text-emerald-600 text-sm">✓</span>
                  <span>{feat.title}</span>
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            </div>

            {/* Bottom Indicator */}
            <div className="pt-3.5 mt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-slate-600">Cross-Platform</span>
              <span className="text-emerald-600 font-bold group-hover:translate-x-0.5 transition-transform">✓ Free</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
