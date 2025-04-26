import React from 'react';
import { useAnimationContext } from '../../contexts/AnimationContext';

/**
 * AnimatedCard Component
 * Provides a standardized card component with animation capabilities
 * and compound components for different parts of the card
 * 
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.animation - Animation type (e.g., 'animate-fade-in')
 * @param {number} props.delay - Animation delay in ms
 */
const AnimatedCard = ({ 
  children, 
  className = '', 
  animation = 'animate-fade-in', 
  delay = 0 
}) => {
  const { animationsEnabled } = useAnimationContext();

  // Generate animation classes
  const getAnimationClasses = () => {
    if (!animationsEnabled) return '';
    
    let delayClass = '';
    if (delay) {
      if (delay <= 100) delayClass = 'animation-delay-100';
      else if (delay <= 200) delayClass = 'animation-delay-200';
      else if (delay <= 300) delayClass = 'animation-delay-300';
      else if (delay <= 500) delayClass = 'animation-delay-500';
      else delayClass = 'animation-delay-800';
    }
    
    return `${animation} ${delayClass}`;
  };
  
  return (
    <div 
      className={`
        bg-white dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700 
        rounded-lg shadow-sm 
        ${getAnimationClasses()}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

// Sub-components for the card using compound component pattern

/**
 * Card Title Component
 */
AnimatedCard.Title = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-gray-900 dark:text-white mb-2 ${className}`}>
    {children}
  </h3>
);

/**
 * Card Body Component
 */
AnimatedCard.Body = ({ children, className = '' }) => (
  <div className={`text-gray-700 dark:text-gray-200 ${className}`}>
    {children}
  </div>
);

/**
 * Card Footer Component
 */
AnimatedCard.Footer = ({ children, className = '' }) => (
  <div className={`mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 ${className}`}>
    {children}
  </div>
);

/**
 * Card Icon Component
 */
AnimatedCard.Icon = ({ children, className = '' }) => (
  <div className={`text-xl ${className}`}>
    {children}
  </div>
);

/**
 * Card Stat Component
 * For displaying statistics or metrics
 */
AnimatedCard.Stat = ({ 
  value, 
  label, 
  trend = null, // 'up', 'down', or null
  trendValue = null, 
  className = '' 
}) => (
  <div className={`${className}`}>
    <div className="flex items-baseline">
      <span className="text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </span>
      
      {trend && (
        <span className={`ml-2 text-sm font-medium ${
          trend === 'up' ? 'text-green-600 dark:text-green-400' : 
          trend === 'down' ? 'text-red-600 dark:text-red-400' : 
          'text-gray-500 dark:text-gray-400'
        }`}>
          {trend === 'up' ? '↑' : '↓'} {trendValue}
        </span>
      )}
    </div>
    
    {label && (
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {label}
      </p>
    )}
  </div>
);

/**
 * Card Image Component
 */
AnimatedCard.Image = ({ 
  src, 
  alt = '', 
  className = '',
  position = 'top' // 'top', 'bottom', or 'cover'
}) => {
  const positionClasses = {
    top: 'rounded-t-lg',
    bottom: 'rounded-b-lg',
    cover: 'rounded-lg absolute inset-0 h-full w-full object-cover'
  };
  
  return (
    <img 
      src={src} 
      alt={alt} 
      className={`w-full ${positionClasses[position] || positionClasses.top} ${className}`}
    />
  );
};

export default AnimatedCard;
