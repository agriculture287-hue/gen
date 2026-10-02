import React from 'react';
import { 
  Layers, 
  Sparkles, 
  DownloadCloud, 
  Headphones, 
  Moon, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { WHY_CHOOSE_CARDS } from '../data/landingData';

interface WhyChooseSectionProps {
  onDownloadClick: () => void;
}

export const WhyChooseSection: React.FC<WhyChooseSectionProps> = ({ onDownloadClick }) => {
  const getIcon = (id: string, iconName: string) => {
    switch (id) {
      case 'wc-1': return <Layers className="w-5 h-5 text-sky-400" />;
      case 'wc-2': return <Sparkles className="w-5 h-5 text-sky-400" />;
      case 'wc-3': return <DownloadCloud className="w-5 h-5 text-sky-400" />;
      case 'wc-4': return <Headphones className="w-5 h-5 text-sky-400" />;
      case 'wc-5': return <Moon className="w-5 h-5 text-sky-400" />;
      case 'wc-6': return <CheckCircle2 className="w-5 h-5 text-sky-400" />;
      default: return <Headphones className="w-5 h-5 text-sky-400" />;
    }
  };

  return (
    <section 
      id="features" 
      aria-label="Why Choose GEN MUSIC"
      className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
          Why Choose GEN MUSIC
        </h2>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          Zero subscriptions, no regional locks, and lossless offline playback engineered for acoustic clarity.
        </p>
      </div>

      {/* 6 Clean Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {WHY_CHOOSE_CARDS.map((card, index) => (
          <div
            key={card.id}
            id={`why-choose-${card.id}`}
            className="surface-card p-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center shrink-0">
                  {getIcon(card.id, card.icon)}
                </div>
                <span className="text-xs font-mono text-slate-500 font-semibold tabular-nums">
                  0{index + 1}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white font-heading">
                  {card.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>

            <div className="pt-5 mt-6 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Included standard</span>
              <button
                onClick={onDownloadClick}
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition cursor-pointer"
              >
                <span>Get App</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
