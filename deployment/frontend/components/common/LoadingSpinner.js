import React from 'react';

/**
 * LoadingSpinner component to provide visual feedback during async operations
 * Features customizable size, color, and animation effects
 * 
 * @param {Object} props Component props
 * @param {String} props.size Size of the spinner (sm, md, lg)
 * @param {String} props.color Color theme of the spinner
 * @param {String} props.text Optional text to display below spinner
 * @param {Boolean} props.overlay Whether to show spinner as overlay on entire screen
 */
const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  text = '', 
  overlay = false 
}) => {
  // Define size variants
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  // Define color variants
  const colors = {
    primary: 'border-blue-600 border-b-transparent',
    secondary: 'border-gray-600 border-b-transparent',
    success: 'border-green-600 border-b-transparent',
    danger: 'border-red-600 border-b-transparent',
    warning: 'border-yellow-500 border-b-transparent',
    info: 'border-indigo-500 border-b-transparent',
  };

  // Combine classes based on props
  const spinnerClasses = `
    inline-block rounded-full 
    border-4 ${colors[color]} 
    ${sizes[size]} 
    animate-spin
  `;

  // If overlay, show spinner centered on screen with semi-transparent background
  if (overlay) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
        <div className="text-center">
          <div className={spinnerClasses}></div>
          {text && <p className="mt-4 text-white font-medium animate-pulse">{text}</p>}
        </div>
      </div>
    );
  }

  // Regular inline spinner
  return (
    <div className="flex flex-col items-center justify-center">
      <div className={spinnerClasses}></div>
      {text && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
