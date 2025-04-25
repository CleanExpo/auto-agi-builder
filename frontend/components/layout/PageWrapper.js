import React from 'react';
import { usePageTransition } from '../../hooks/usePageTransition';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * PageWrapper component that wraps page content with transition animations
 * Provides consistent page transitions throughout the application
 * 
 * @param {Object} props Component props
 * @param {ReactNode} props.children Child components to render
 * @param {String} props.className Additional CSS classes for styling
 * @param {Boolean} props.showLoader Whether to show loading spinner during transitions
 * @param {String} props.enterAnimation Animation to use when entering the page
 * @param {String} props.exitAnimation Animation to use when exiting the page
 */
const PageWrapper = ({
  children,
  className = '',
  showLoader = true,
  enterAnimation = 'animate-fade-in',
  exitAnimation = 'animate-fade-out'
}) => {
  // Use the page transition hook
  const { isTransitioning, currentAnimation } = usePageTransition({
    enterAnimation,
    exitAnimation,
    duration: 300
  });

  // Base classes for the wrapper
  const baseClasses = 'w-full min-h-[50vh] transition-all duration-300';
  
  // Combine base classes with animation class and any additional classes
  const wrapperClasses = `${baseClasses} ${currentAnimation} ${className}`;
  
  return (
    <div className={wrapperClasses}>
      {/* Show loading spinner during transitions if enabled */}
      {isTransitioning && showLoader ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner 
            size="lg" 
            color="primary" 
            text="Loading..." 
          />
        </div>
      ) : (
        // Render children when not transitioning or if loader is disabled
        <div className={isTransitioning ? 'opacity-0' : 'opacity-100'}>
          {children}
        </div>
      )}
    </div>
  );
};

export default PageWrapper;
