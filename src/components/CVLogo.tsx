import React from 'react';

interface CVLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'dark' | 'light' | 'transparent';
  className?: string;
}

export const CVLogo: React.FC<CVLogoProps> = ({
  size = 'md',
  variant = 'dark',
  className = '',
}) => {
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const dim = sizeMap[size] || 'w-10 h-10';

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${dim} ${className}`}
      aria-label="CV Maker Logo"
    >
      <svg
        viewBox="0 0 512 512"
        className="w-full h-full drop-shadow-sm select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="cvAccentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>

          <linearGradient id="cvLightGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e0f2fe" />
          </linearGradient>

          <linearGradient id="cvDarkBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#091b29" />
            <stop offset="50%" stopColor="#0c2335" />
            <stop offset="100%" stopColor="#06121d" />
          </linearGradient>

          <linearGradient id="cvLightBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>

          <radialGradient id="cvGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background container if not transparent */}
        {variant === 'dark' && (
          <>
            <rect width="512" height="512" rx="112" fill="url(#cvDarkBgGrad)" />
            <circle cx="256" cy="256" r="210" fill="url(#cvGlow)" opacity="0.6" />
          </>
        )}
        {variant === 'light' && (
          <rect width="512" height="512" rx="112" fill="url(#cvLightBgGrad)" stroke="#cbd5e1" strokeWidth="12" />
        )}

        {/* Pure "CV" Typography Monogram: No icons, only elegant letterforms */}
        <g>
          {/* Letter C: Refined modern geometric arc */}
          <path
            d="M 235 130
               C 145 130 82 195 82 280
               C 82 365 145 430 235 430
               C 268 430 292 422 308 410
               L 286 360
               C 272 368 255 374 235 374
               C 176 374 136 332 136 280
               C 136 228 176 186 235 186
               C 255 186 272 192 286 200
               L 308 150
               C 292 138 268 130 235 130 Z"
            fill="url(#cvAccentGrad)"
          />

          {/* Letter V (left arm): Sharp interlocking clean white diagonal */}
          <path
            d="M 232 135
               L 316 385
               L 366 385
               L 282 135 Z"
            fill={variant === 'light' ? '#0f172a' : 'url(#cvLightGrad)'}
          />

          {/* Letter V (right arm): Dynamic teal/sky-blue diagonal */}
          <path
            d="M 440 135
               L 326 430
               L 272 430
               L 386 135 Z"
            fill="url(#cvAccentGrad)"
          />
        </g>
      </svg>
    </div>
  );
};
