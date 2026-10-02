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
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-sky-400" />;
      case 'Infinity': return <InfinityIcon className="w-5 h-5 text-sky-400" />;
      case 'PlaySquare': return <PlaySquare className="w-5 h-5 text-sky-400" />;
      case 'Radio': return <Radio className="w-5 h-5 text-sky-400" />;
      case 'Download': return <Download className="w-5 h-5 text-sky-400" />;
      case 'FileAudio': return <FileAudio className="w-5 h-5 text-sky-400" />;
      case 'Headphones': return <Headphones className="w-5 h-5 text-sky-400" />;
      case 'Sliders': return <Sliders className="w-5 h-5 text-sky-400" />;
      case 'ListMusic': return <ListMusic className="w-5 h-5 text-sky-400" />;
      case 'Heart': return <Heart className="w-5 h-5 text-sky-400" />;
      case 'History': return <History className="w-5 h-5 text-sky-400" />;
      case 'MonitorSmartphone': return <MonitorSmartphone className="w-5 h-5 text-sky-400" />;
      case 'Smartphone': return <Smartphone className="w-5 h-5 text-sky-400" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-sky-400" />;
      case 'Compass': return <Compass className="w-5 h-5 text-sky-400" />;
      case 'Zap': return <Zap className="w-5 h-5 text-sky-400" />;
      default: return <Sparkles className="w-5 h-5 text-sky-400" />;
    }
  };

  return (
    <section 
      aria-label="Features Section"
      className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10"
    >
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
          All Built In. Nothing Held Back.
        </h2>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          Everything you need for an uncompromising audio experience across all your devices.
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {FEATURES_LIST.map((feat) => (
          <div
            key={feat.id}
            id={`feature-card-${feat.id}`}
            onClick={onDownloadClick}
            className="surface-card p-5 flex flex-col justify-between cursor-pointer hover:border-sky-500/50"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center shrink-0">
                  {getFeatureIcon(feat.icon)}
                </div>
                {feat.badge && (
                  <span className="text-[11px] font-mono text-slate-400">
                    {feat.badge}
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-base font-bold text-white font-heading">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            </div>

            <div className="pt-3 mt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1 text-slate-400 font-medium">
                <Check className="w-3.5 h-3.5 text-sky-400" />
                Available on all platforms
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
