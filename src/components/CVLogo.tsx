import React from 'react';

interface CVLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
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
    '2xl': 'w-24 h-24',
  };

  const dim = sizeMap[size] || 'w-10 h-10';

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden select-none ${dim} ${className}`}
      aria-label="CV Maker-BD Logo"
    >
      <svg
        viewBox="0 0 512 512"
        className="w-full h-full drop-shadow-xs"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background container: pure pitch black like user logo */}
        {variant !== 'transparent' && (
          <rect
            width="512"
            height="512"
            rx={variant === 'dark' ? 84 : 84}
            fill="#000000"
          />
        )}

        {/* Logo Typography Group: CV in Bold White, Maker in White, -BD in Vibrant Green */}
        <g textAnchor="middle">
          {/* Top Big Bold "CV" */}
          <text
            x="256"
            y="280"
            fill="#FFFFFF"
            fontFamily="'Plus Jakarta Sans', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
            fontWeight="900"
            fontSize="215"
            letterSpacing="-3"
          >
            CV
          </text>

          {/* Bottom "Maker-BD" */}
          <text
            x="256"
            y="374"
            fontFamily="'Plus Jakarta Sans', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
            fontWeight="800"
            fontSize="64"
            letterSpacing="-0.5"
          >
            <tspan fill="#FFFFFF">Maker</tspan>
            <tspan fill="#00A86B">-BD</tspan>
          </text>
        </g>
      </svg>
    </div>
  );
};
