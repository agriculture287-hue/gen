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
      case 'Layers': return <Layers className="w-6 h-6 text-cyan-400" />;
      case 'Sparkles': return <Sparkles className="w-6 h-6 text-pink-400" />;
      case 'DownloadCloud': return <DownloadCloud className="w-6 h-6 text-indigo-400" />;
      case 'Headphones': return <Headphones className="w-6 h-6 text-cyan-400" />;
      case 'Layout': return <Layout className="w-6 h-6 text-purple-400" />;
      case 'CheckCircle2': return <CheckCircle2 className="w-6 h-6 text-emerald-400" />;
      default: return <Sparkles className="w-6 h-6 text-cyan-400" />;
    }
  };

  return (
    <section 
      id="features" 
      aria-label="Why Choose GEN MUSIC"
      className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-white"
    >
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider">
          <Flame className="w-3.5 h-3.5 text-cyan-400" />
          <span>ARCHITECTURAL ADVANTAGES</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-heading">
          Why Choose{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent">
            GEN MUSIC?
          </span>
        </h2>

        <p className="text-base sm:text-lg text-slate-400">
          Zero subscriptions, no country locks, and bit-perfect playback. Engineered for ultimate acoustic purity.
        </p>
      </div>

      {/* 6 Requested Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {WHY_CHOOSE_CARDS.map((card, index) => (
          <div
            key={card.id}
            id={`why-choose-${card.id}`}
            className="group relative rounded-3xl bg-[#0c0f1e]/90 p-7 border border-white/10 hover:border-cyan-500/40 shadow-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.12)] transition-all duration-200 flex flex-col justify-between backdrop-blur-xl hover:-translate-y-1"
          >
            <div className="space-y-4">
              {/* Header with Icon & Counter */}
              <div className="flex items-center justify-between">
                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 group-hover:scale-105 transition shadow-xs">
                  {getIcon(card.icon)}
                </div>
                <span className="text-xs font-mono font-bold text-cyan-400/60">
                  0{index + 1} // PROTOCOL
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition font-heading">
                  {card.title}
                </h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>

            {/* Bottom Feature Pill */}
            <div className="pt-5 mt-5 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold px-3 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                ACTIVE
              </span>
              <button
                onClick={onDownloadClick}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition cursor-pointer"
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
