import React from 'react';

interface GenMusicLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero' | number;
  className?: string;
  glow?: boolean;
  useImage?: boolean;
  alt?: string;
}

const sizeMap = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
  '2xl': 'w-20 h-20',
  hero: 'w-28 h-28 sm:w-32 sm:h-32',
};

export const GenMusicLogo: React.FC<GenMusicLogoProps> = ({
  size = 'md',
  className = '',
  glow = true,
  useImage = true,
  alt = 'GEN MUSIC Logo',
}) => {
  const sizeClass = typeof size === 'number' ? `w-[${size}px] h-[${size}px]` : sizeMap[size] || sizeMap.md;
  const inlineStyle = typeof size === 'number' ? { width: `${size}px`, height: `${size}px` } : undefined;

  return (
    <div 
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none group ${className}`}
      style={inlineStyle}
    >
      {/* Dynamic Ambient Neon Glow */}
      {glow && (
        <div 
          className="absolute -inset-1 rounded-2xl opacity-60 group-hover:opacity-90 blur-md transition duration-500 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(0,240,255,0.7) 0%, rgba(138,43,226,0.7) 50%, rgba(236,72,153,0.7) 100%)',
          }}
        />
      )}

      {useImage ? (
        <div className={`relative ${sizeClass} rounded-2xl overflow-hidden shadow-xl bg-[#090b14] border border-white/10 flex items-center justify-center`}>
          <img
            src="/logo.png"
            alt={alt}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // fallback to svg if image fails
              const target = e.currentTarget as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                const svgFallback = parent.querySelector('.svg-fallback') as HTMLElement;
                if (svgFallback) svgFallback.style.display = 'block';
              }
            }}
          />
          <div className="svg-fallback hidden w-full h-full">
            <VectorLogo size="100%" />
          </div>
        </div>
      ) : (
        <div className={`relative ${sizeClass} rounded-2xl overflow-hidden shadow-xl bg-[#090b14] border border-white/10 flex items-center justify-center p-1`}>
          <VectorLogo size="100%" />
        </div>
      )}
    </div>
  );
};

// Scalable Vector Graphic representation matching the winged music note logo
const VectorLogo: React.FC<{ size: string }> = ({ size }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <defs>
        <linearGradient id="wingGrad1" x1="50" y1="180" x2="170" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="40%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <linearGradient id="wingGrad2" x1="70" y1="150" x2="190" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D946EF" />
          <stop offset="60%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
        <linearGradient id="noteGrad" x1="40" y1="40" x2="110" y2="170" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E1B4B" />
          <stop offset="70%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <filter id="logoNeonGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#06B6D4" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Background dark shield */}
      <rect width="200" height="200" rx="40" fill="#070913" />

      {/* Wing Feathers Flaring Right */}
      <g filter="url(#logoNeonGlow)">
        {/* Outer Feather 1 (Top) */}
        <path
          d="M 105 50 C 130 30, 165 25, 185 35 C 165 55, 140 70, 115 80 Z"
          fill="url(#wingGrad2)"
          opacity="0.95"
        />
        {/* Feather 2 */}
        <path
          d="M 110 75 C 135 60, 175 60, 188 75 C 165 92, 135 105, 112 110 Z"
          fill="url(#wingGrad1)"
        />
        {/* Feather 3 */}
        <path
          d="M 105 102 C 130 90, 168 95, 178 115 C 155 125, 125 130, 102 132 Z"
          fill="url(#wingGrad2)"
          opacity="0.9"
        />
        {/* Feather 4 (Bottom curve) */}
        <path
          d="M 98 125 C 120 120, 150 128, 158 145 C 138 152, 115 150, 95 145 Z"
          fill="url(#wingGrad1)"
          opacity="0.85"
        />
      </g>

      {/* Eighth Note Stem & Head */}
      <g>
        {/* Music Note Stem */}
        <path
          d="M 92 42 L 106 40 C 108 80, 107 125, 104 140 L 92 142 Z"
          fill="url(#noteGrad)"
          stroke="#38BDF8"
          strokeWidth="2"
        />
        {/* Note Head */}
        <ellipse
          cx="72"
          cy="148"
          rx="26"
          ry="18"
          transform="rotate(-25 72 148)"
          fill="url(#noteGrad)"
          stroke="#22D3EE"
          strokeWidth="3"
        />
        {/* Note Inner Core Light */}
        <ellipse
          cx="70"
          cy="147"
          rx="14"
          ry="9"
          transform="rotate(-25 70 147)"
          fill="#38BDF8"
          opacity="0.5"
        />
        {/* Top Flag Hook */}
        <path
          d="M 98 42 C 115 40, 130 50, 138 65 C 125 65, 110 58, 98 52 Z"
          fill="#22D3EE"
        />
      </g>
    </svg>
  );
};
