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
            background: 'linear-gradient(135deg, rgba(239,68,68,0.5) 0%, rgba(59,130,246,0.5) 30%, rgba(34,197,94,0.5) 70%, rgba(234,179,8,0.5) 100%)',
          }}
        />
      )}

      {useImage ? (
        <div className={`relative ${sizeClass} rounded-2xl overflow-hidden shadow-xl bg-black border border-white/10 flex items-center justify-center`}>
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
        <div className={`relative ${sizeClass} rounded-2xl overflow-hidden shadow-xl bg-black border border-white/10 flex items-center justify-center p-1`}>
          <VectorLogo size="100%" />
        </div>
      )}
    </div>
  );
};

// High-precision Scalable Vector Graphic representation matching the uploaded GEN MUSIC Play "G" logo
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
        {/* Soft 3D lighting drop shadow */}
        <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.6" />
        </filter>
        {/* Red gradient (Top) */}
        <linearGradient id="redGrad" x1="50" y1="20" x2="150" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF3333" />
          <stop offset="100%" stopColor="#D50000" />
        </linearGradient>
        {/* Yellow gradient (Right tip) */}
        <linearGradient id="yellowGrad" x1="120" y1="80" x2="190" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFEA00" />
          <stop offset="100%" stopColor="#FF9100" />
        </linearGradient>
        {/* Green gradient (Bottom) */}
        <linearGradient id="greenGrad" x1="40" y1="130" x2="130" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00E676" />
          <stop offset="100%" stopColor="#00A844" />
        </linearGradient>
        {/* Blue gradient (Left / Center) */}
        <linearGradient id="blueGrad" x1="30" y1="50" x2="120" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2979FF" />
          <stop offset="100%" stopColor="#004cd8" />
        </linearGradient>
      </defs>

      {/* Rounded Triangle Play Button Outer Container */}
      <g filter="url(#logoGlow)">
        {/* Clip path for the rounded triangular play badge */}
        <clipPath id="playClip">
          <path d="M 45 28 C 30 20 18 27 18 45 L 18 155 C 18 173 30 180 45 172 L 168 112 C 182 104 182 96 168 88 Z" />
        </clipPath>

        <g clipPath="url(#playClip)">
          {/* Base Background: Blue */}
          <rect x="0" y="0" width="200" height="200" fill="url(#blueGrad)" />

          {/* Top Red Segment */}
          <path
            d="M 15 15 L 150 15 L 140 85 L 60 70 Z"
            fill="url(#redGrad)"
          />

          {/* Right Yellow Tip */}
          <path
            d="M 130 50 L 195 100 L 130 150 L 120 100 Z"
            fill="url(#yellowGrad)"
          />

          {/* Bottom Green Segment */}
          <path
            d="M 15 130 L 70 120 L 140 135 L 150 190 L 15 190 Z"
            fill="url(#greenGrad)"
          />

          {/* Subtle 3D glossy highlight on top curve */}
          <path
            d="M 25 35 C 50 22 130 65 160 92"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </g>

        {/* Central Bold White "G" */}
        <g id="center-g" className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
          {/* The Outer Circular Arc of "G" */}
          <path
            d="M 115 75 
               C 105 64 92 58 78 58 
               C 54 58 35 77 35 101 
               C 35 125 54 144 78 144 
               C 100 144 114 130 117 110 
               L 80 110 
               L 80 94 
               L 135 94 
               C 136 100 136 106 136 112 
               C 134 139 113 162 78 162 
               C 43 162 16 135 16 101 
               C 16 67 43 40 78 40 
               C 99 40 117 48 131 63 
               Z"
            fill="#FFFFFF"
          />
        </g>
      </g>
    </svg>
  );
};
