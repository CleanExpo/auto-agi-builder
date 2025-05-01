import React from 'react';

/**
 * ResponsiveContainer component for adaptive layouts across different devices
 * Applies appropriate padding, max-width, and responsive behavior
 * 
 * @param {Object} props Component props
 * @param {ReactNode} props.children Child components to render
 * @param {String} props.className Additional CSS classes
 * @param {String} props.size Container size (sm, md, lg, xl, full)
 * @param {Boolean} props.centered Whether to center the container
 * @param {String} props.padding Container padding
 * @param {String} props.animation Optional animation class
 */
const ResponsiveContainer = ({
  children,
  className = '',
  size = 'lg',
  centered = true,
  padding = 'px-4 py-6 sm:px-6 lg:px-8',
  animation = ''
}) => {
  // Define size variants with corresponding max-width values
  const sizeClasses = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-7xl',
    xl: 'max-w-screen-2xl',
    full: 'max-w-full'
  };
  
  // Combine container classes based on props
  const containerClasses = `
    ${padding}
    ${sizeClasses[size]}
    ${centered ? 'mx-auto' : ''}
    ${animation}
    ${className}
  `;
  
  // Apply animation based on viewport width for mobile-first approach
  const animationClass = animation ? `${animation} transition-all duration-300` : '';
  
  return (
    <div className={`${containerClasses} ${animationClass}`}>
      {children}
    </div>
  );
};

/**
 * Responsive grid layout with configurable columns
 */
ResponsiveContainer.Grid = ({
  children,
  className = '',
  cols = {
    sm: 1,   // Default to 1 column on small screens
    md: 2,   // Default to 2 columns on medium screens 
    lg: 3,   // Default to 3 columns on large screens
    xl: 4    // Default to 4 columns on extra large screens
  },
  gap = 'gap-4 md:gap-6 lg:gap-8',
  animation = ''
}) => {
  // Define responsive column classes
  const colClasses = `
    grid 
    grid-cols-${cols.sm || 1}
    md:grid-cols-${cols.md || 2}
    lg:grid-cols-${cols.lg || 3}
    xl:grid-cols-${cols.xl || 4}
    ${gap}
    ${animation}
    ${className}
  `;
  
  return (
    <div className={colClasses}>
      {children}
    </div>
  );
};

export default ResponsiveContainer;
