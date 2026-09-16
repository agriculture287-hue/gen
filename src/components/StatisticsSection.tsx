import React from 'react';
import { Music2, Infinity as InfinityIcon, ListMusic, HeartHandshake, Sparkles } from 'lucide-react';

export const StatisticsSection: React.FC = () => {
  const stats = [
    {
      value: '1M+',
      label: 'Songs & Podcasts',
      description: 'Synchronized from Spotify & YouTube catalogs',
      icon: Music2,
      accent: 'from-cyan-400 to-blue-500',
      glow: 'shadow-[0_0_30px_rgba(0,240,255,0.2)]',
      border: 'border-cyan-500/30',
    },
    {
      value: 'Unlimited',
      label: 'Streaming & Skips',
      description: 'Zero caps, zero ad interruptions, pure sound',
      icon: InfinityIcon,
      accent: 'from-purple-400 to-indigo-500',
      glow: 'shadow-[0_0_30px_rgba(168,85,247,0.2)]',
      border: 'border-purple-500/30',
    },
    {
      value: '100K+',
      label: 'Playlists & Mixes',
      description: 'Moods, gym workouts, study beats & charts',
      icon: ListMusic,
      accent: 'from-pink-400 to-rose-500',
      glow: 'shadow-[0_0_30px_rgba(236,72,153,0.2)]',
      border: 'border-pink-500/30',
    },
    {
      value: 'Free Forever',
      label: 'No Credit Card Needed',
      description: 'Built by audiophiles for music lovers everywhere',
      icon: HeartHandshake,
      accent: 'from-cyan-400 via-teal-400 to-emerald-400',
      glow: 'shadow-[0_0_30px_rgba(45,212,191,0.2)]',
      border: 'border-teal-500/30',
    },
  ];

  return (
    <section 
      id="about" 
      aria-label="Statistics Section"
      className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      <div className="relative rounded-3xl glass-panel p-8 sm:p-12 border border-white/10 overflow-hidden">
        {/* Background glow strip */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-24 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
          {stats.map((stat, i) => {
            const Icon = stat.icon;

            return (
              <div 
                key={i} 
                className={`flex flex-col items-center text-center p-4 ${i !== 0 ? 'sm:pl-8' : ''} ${i !== 0 ? 'pt-6 sm:pt-4' : ''}`}
              >
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 mb-4 text-cyan-400 shadow-lg">
                  <Icon className="w-6 h-6" />
                </div>

                <span className={`text-4xl sm:text-5xl font-black tracking-tight font-heading bg-gradient-to-r ${stat.accent} bg-clip-text text-transparent`}>
                  {stat.value}
                </span>

                <span className="text-sm font-bold text-white mt-2">
                  {stat.label}
                </span>

                <p className="text-xs text-neutral-400 mt-1 max-w-[200px] leading-relaxed">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
