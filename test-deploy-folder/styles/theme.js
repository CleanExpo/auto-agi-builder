import React from 'react';

/**
 * LogoSVG component for the AGI AUTO logo abstract mark
 */
export const LogoSVG = ({ width = 40, height = 40, className = '' }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="50" cy="50" r="50" fill="url(#logo-gradient)" />
    <path 
      d="M30 30L50 20L70 30V70L50 80L30 70V30Z" 
      fill="#0F172A" 
      stroke="url(#logo-stroke)" 
      strokeWidth="4" 
    />
    <path 
      d="M50 20V50L70 30" 
      stroke="#06B6D4" 
      strokeWidth="4" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <path 
      d="M50 50V80L30 70" 
      stroke="#06B6D4" 
      strokeWidth="4" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <defs>
      <linearGradient id="logo-gradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#06B6D4" />
        <stop offset="100%" stopColor="#10B981" />
      </linearGradient>
      <linearGradient id="logo-stroke" x1="30" y1="20" x2="70" y2="80" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#06B6D4" />
        <stop offset="100%" stopColor="#10B981" />
      </linearGradient>
    </defs>
  </svg>
);

/**
 * LogoWithText component that combines the logo with the company name
 */
export const LogoWithText = ({ height = 40, className = '' }) => {
  // Calculate width based on height to maintain aspect ratio (approximately 3:1)
  const width = height * 3;
  
  return (
    <div className={`flex items-center ${className}`}>
      <LogoSVG width={height} height={height} className="mr-2" />
      <div className="flex flex-col leading-none">
        <span className="text-xl font-bold text-navy-800 dark:text-silver-100">AGI AUTO</span>
        <span className="text-sm">
          <span className="text-navy-900 dark:text-white">AUTO </span>
          <span className="text-green-500">BUILDER</span>
        </span>
      </div>
    </div>
  );
};

/**
 * Theme configuration
 */
export const theme = {
  // Color palette
  colors: {
    navy: {
      50: '#EFF6FF', 
      100: '#DBEAFE', 
      200: '#BFDBFE', 
      300: '#93C5FD', 
      400: '#60A5FA', 
      500: '#3B82F6', 
      600: '#2563EB',
      700: '#0F172A', // Primary dark background
      800: '#0B1120', // Darker background
      900: '#070C16', // Darkest background
    },
    silver: {
      50: '#FAFAFA',
      100: '#F4F4F5',
      200: '#E4E4E7',
      300: '#D4D4D8',
      400: '#A1A1AA',
      500: '#71717A',
      600: '#52525B',
      700: '#3F3F46',
      800: '#27272A',
      900: '#18181B',
    },
    cyan: {
      400: '#22D3EE',
      500: '#06B6D4', // Primary accent
      600: '#0891B2',
      700: '#0E7490',
    },
    green: {
      400: '#4ADE80',
      500: '#10B981', // Secondary accent
      600: '#059669',
      700: '#047857',
    }
  },
  
  // Typography
  fonts: {
    sans: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"Fira Code", Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  
  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  
  // Transitions
  transitions: {
    default: 'all 0.2s ease',
    fast: 'all 0.1s ease',
    slow: 'all 0.3s ease',
  }
};

export default theme;
