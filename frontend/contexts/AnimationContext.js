import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Animation Context
 * Provides global animation settings and preferences throughout the application
 * Includes support for reduced motion and animation customization
 */

// Create the context
const AnimationContext = createContext();

/**
 * Animation Provider component
 * Wraps the application to provide animation context
 * 
 * @param {Object} props
 * @param {ReactNode} props.children Child components
 */
export const AnimationProvider = ({ children }) => {
  // Check if user prefers reduced motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  // Animation speed settings
  const [animationSpeed, setAnimationSpeed] = useState('normal');
  
  // Enable/disable specific animation types
  const [animationSettings, setAnimationSettings] = useState({
    pageTransitions: true,
    elementAnimations: true,
    parallaxEffects: false,
    hoverEffects: true,
  });

  // Check for reduced motion preference on mount
  useEffect(() => {
    // Check for mediaQuery support and user's motion preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      
      // Add listener for preference changes
      const handleChange = (e) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', handleChange);
      
      // Clean up
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // Convert animation speed to timing values (in ms)
  const getAnimationDuration = (baseTime = 300) => {
    const speedFactors = {
      'fast': 0.5,
      'normal': 1,
      'slow': 1.5,
    };
    return baseTime * (speedFactors[animationSpeed] || 1);
  };

  // Toggle animation settings by key
  const toggleAnimationSetting = (key) => {
    setAnimationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Toggle all animations on/off
  const toggleAllAnimations = (enabled) => {
    setAnimationSettings({
      pageTransitions: enabled,
      elementAnimations: enabled,
      parallaxEffects: enabled,
      hoverEffects: enabled,
    });
  };

  // Check if a particular animation type should be shown
  const shouldAnimate = (type) => {
    if (prefersReducedMotion) return false;
    return animationSettings[type] || false;
  };

  // Context value
  const value = {
    prefersReducedMotion,
    animationSpeed,
    animationSettings,
    setAnimationSpeed,
    toggleAnimationSetting,
    toggleAllAnimations,
    shouldAnimate,
    getAnimationDuration
  };

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
};

/**
 * Hook to use animation context
 * @returns {Object} Animation context value
 */
export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
};
