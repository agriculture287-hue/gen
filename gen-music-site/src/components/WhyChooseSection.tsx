import React from 'react';
import { 
  Layers, 
  Sparkles, 
  DownloadCloud, 
  Headphones, 
  Layout, 
  CheckCircle2,
  ArrowRight,
  Flame
} from 'lucide-react';
import { WHY_CHOOSE_CARDS } from '../data/landingData';

interface WhyChooseSectionProps {
  onDownloadClick: () => void;
}

export const WhyChooseSection: React.FC<WhyChooseSectionProps> = ({ onDownloadClick }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Layers': return <Layers className="w-6 h-6 text-blue-600" />;
      case 'Sparkles': return <Sparkles className="w-6 h-6 text-purple-600" />;
      case 'DownloadCloud': return <DownloadCloud className="w-6 h-6 text-pink-600" />;
      case 'Headphones': return <Headphones className="w-6 h-6 text-indigo-600" />;
      case 'Layout': return <Layout className="w-6 h-6 text-blue-600" />;
      case 'CheckCircle2': return <CheckCircle2 className="w-6 h-6 text-emerald-600" />;
      default: return <Sparkles className="w-6 h-6 text-blue-600" />;
    }
  };

  return (
    <section 
      id="features" 
      aria-label="Why Choose GEN MUSIC"
      className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
          <Flame className="w-3.5 h-3.5 text-blue-600" />
          <span>Core Highlights</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-heading">
          Why Choose{' '}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent">
            GEN MUSIC?
          </span>
        </h2>

        <p className="text-base sm:text-lg text-slate-600">
          No subscriptions, no country locks, and no compromise on audio fidelity. Built from the ground up for ultimate musical freedom.
        </p>
      </div>

      {/* 6 Requested Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {WHY_CHOOSE_CARDS.map((card, index) => (
          <div
            key={card.id}
            id={`why-choose-${card.id}`}
            className="group relative rounded-3xl bg-white p-7 border border-slate-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Header with Icon & Counter */}
              <div className="flex items-center justify-between">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 group-hover:scale-105 transition">
                  {getIcon(card.icon)}
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">
                  0{index + 1}
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition font-heading">
                  {card.title}
                </h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>

            {/* Bottom Feature Pill */}
            <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-bold px-3 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Verified Feature
              </span>
              <button
                onClick={onDownloadClick}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition cursor-pointer"
              >
                <span>Get App</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
