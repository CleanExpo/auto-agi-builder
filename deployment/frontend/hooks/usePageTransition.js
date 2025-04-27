import { useState, useEffect } from 'react';

// Export usePageTransition hook that was missing
export const usePageTransition = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('');

  useEffect(() => {
    // Get current route
    if (typeof window !== 'undefined') {
      setCurrentRoute(window.location.pathname);
    }
  }, []);

  return {
    isTransitioning,
    currentRoute,
    startTransition: () => setIsTransitioning(true),
    endTransition: () => setIsTransitioning(false),
  };
};
