import React from 'react';
import { 
  Coffee, 
  Brain, 
  Zap, 
  Moon, 
  Heart, 
  Flame, 
  Play, 
  Radio, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { MOOD_CATEGORIES } from '../data/musicData';
import { MoodCategory } from '../types';

interface MoodCategoriesProps {
  selectedMood: string | null;
  onSelectMood: (mood: MoodCategory['name'] | null) => void;
  onPlayMoodSample: (moodName: MoodCategory['name']) => void;
}

export const MoodCategories: React.FC<MoodCategoriesProps> = ({
  selectedMood,
  onSelectMood,
  onPlayMoodSample,
}) => {
  const getMoodIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case 'Coffee': return <Coffee className={className} />;
      case 'Brain': return <Brain className={className} />;
      case 'Zap': return <Zap className={className} />;
      case 'Moon': return <Moon className={className} />;
      case 'Heart': return <Heart className={className} />;
      case 'Flame': return <Flame className={className} />;
      default: return <Sparkles className={className} />;
    }
  };

  return (
    <section 
      id="discover" 
      aria-label="Mood Categories"
      className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Radio className="w-4 h-4" />
            <span>Harmonic State of Mind</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
            Mood <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Categories</span>
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base mt-1">
            Choose your emotional frequency. Real-time synthesized flows curated for every moment.
          </p>
        </div>

        {selectedMood && (
          <button
            onClick={() => onSelectMood(null)}
            id="clear-mood-filter-btn"
            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 transition cursor-pointer self-start md:self-auto"
          >
            Clear Filter ({selectedMood}) ✕
          </button>
        )}
      </div>

      {/* Mood Grid (6 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOOD_CATEGORIES.map((mood) => {
          const isSelected = selectedMood === mood.name;

          return (
            <div
              key={mood.id}
              id={`mood-card-${mood.id}`}
              onClick={() => onSelectMood(isSelected ? null : mood.name)}
              className={`group relative rounded-2xl p-6 overflow-hidden cursor-pointer transition-all duration-300 border ${
                isSelected 
                  ? 'border-cyan-400 bg-white/[0.08] shadow-[0_0_30px_rgba(0,240,255,0.25)] scale-[1.02]' 
                  : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 hover:scale-[1.01]'
              }`}
            >
              {/* Backing Ambient Gradient Mesh */}
              <div 
                className={`absolute inset-0 bg-gradient-to-br ${mood.gradient} opacity-50 group-hover:opacity-80 transition-opacity duration-500`} 
              />

              <div className="relative z-10 flex flex-col justify-between h-44">
                {/* Card Header: Icon & Track Count */}
                <div className="flex items-center justify-between">
                  <div 
                    className="p-3 rounded-xl backdrop-blur-md bg-black/40 border border-white/10 shadow-lg group-hover:scale-110 transition duration-300"
                    style={{ color: mood.accent }}
                  >
                    {getMoodIcon(mood.iconName, 'w-6 h-6')}
                  </div>

                  <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-black/50 border border-white/10 text-neutral-300 backdrop-blur-sm">
                    {mood.trackCount}
                  </span>
                </div>

                {/* Card Bottom: Title, Tagline & Direct Play */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black text-white group-hover:text-cyan-300 transition font-heading">
                      {mood.name}
                    </h3>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayMoodSample(mood.name);
                      }}
                      id={`play-mood-${mood.id}-btn`}
                      aria-label={`Play ${mood.name} mood music`}
                      className="w-9 h-9 rounded-full bg-white/10 hover:bg-cyan-400 hover:text-black text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition group-hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]"
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </button>
                  </div>

                  <p className="text-xs text-neutral-300 font-normal line-clamp-2 pr-2">
                    {mood.tagline}
                  </p>
                </div>
              </div>

              {/* Bottom Glow accent strip */}
              <div 
                className="absolute bottom-0 left-0 right-0 h-1 opacity-60 group-hover:opacity-100 transition"
                style={{ backgroundColor: mood.accent }}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};
