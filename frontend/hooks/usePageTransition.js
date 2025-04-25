import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * Custom hook to handle page transitions with animations
 * Provides smooth transitions between pages with customizable animations
 * 
 * @param {Object} options Configuration options
 * @param {String} options.exitAnimation Animation class to apply when exiting a page
 * @param {String} options.enterAnimation Animation class to apply when entering a page
 * @param {Number} options.duration Duration of the transition in milliseconds
 * @returns {Object} Transition state and handlers
 */
const usePageTransition = ({
  exitAnimation = 'animate-fade-out',
  enterAnimation = 'animate-fade-in',
  duration = 300
} = {}) => {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState(enterAnimation);
  
  // Handle route change start
  useEffect(() => {
    const handleRouteChangeStart = () => {
      setIsTransitioning(true);
      setCurrentAnimation(exitAnimation);
    };
    
    // Handle route change complete
    const handleRouteChangeComplete = () => {
      // Short delay to ensure exit animation completes
      setTimeout(() => {
        setCurrentAnimation(enterAnimation);
        
        // Another short delay to complete enter animation
        setTimeout(() => {
          setIsTransitioning(false);
        }, duration);
      }, duration);
    };
    
    // Listen for route change events
    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    
    // Clean up event listeners
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [router, enterAnimation, exitAnimation, duration]);
  
  /**
   * Navigate to a new page with transition
   * @param {String} path Path to navigate to
   */
  const navigateWithTransition = (path) => {
    setIsTransitioning(true);
    setCurrentAnimation(exitAnimation);
    
    setTimeout(() => {
      router.push(path);
    }, duration / 2); // Start navigation halfway through exit animation
  };
  
  return {
    isTransitioning,
    currentAnimation,
    navigateWithTransition
  };
};

export default usePageTransition;
