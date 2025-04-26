import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

/**
 * Animation Context provides global animation settings and controls
 * Application-wide animation settings, preferences, and state management
 */
const AnimationContext = createContext({
  prefersReducedMotion: false,
  animationsEnabled: true,
  animationSpeed: 'normal', // 'slow', 'normal', 'fast'
  enableAnimations: () => {},
  disableAnimations: () => {},
  setAnimationSpeed: () => {},
  toggleAnimations: () => {},
});

/**
 * Animation Provider Component
 * Provides animation settings and controls to all child components
 * 
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components
 */
export const AnimationProvider = ({ children }) => {
  // Check if user prefers reduced motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  // General animation settings
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState('normal');

  // Check system preferences for reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    
    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);
    
    // Add listener for changes
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  // Load user preferences from localStorage
  useEffect(() => {
    try {
      const storedPrefs = localStorage.getItem('animation_preferences');
      if (storedPrefs) {
        const prefs = JSON.parse(storedPrefs);
        setAnimationsEnabled(prefs.enabled ?? true);
        setAnimationSpeed(prefs.speed ?? 'normal');
      }
    } catch (err) {
      console.error('Failed to load animation preferences:', err);
    }
  }, []);

  // Save preferences to localStorage
  const savePreferences = useCallback(() => {
    try {
      localStorage.setItem('animation_preferences', JSON.stringify({
        enabled: animationsEnabled,
        speed: animationSpeed,
      }));
    } catch (err) {
      console.error('Failed to save animation preferences:', err);
    }
  }, [animationsEnabled, animationSpeed]);

  // Save preferences when they change
  useEffect(() => {
    savePreferences();
  }, [animationsEnabled, animationSpeed, savePreferences]);

  // Animation control functions
  const enableAnimations = useCallback(() => {
    setAnimationsEnabled(true);
  }, []);

  const disableAnimations = useCallback(() => {
    setAnimationsEnabled(false);
  }, []);

  const toggleAnimations = useCallback(() => {
    setAnimationsEnabled(prev => !prev);
  }, []);

  const setSpeed = useCallback((speed) => {
    if (['slow', 'normal', 'fast'].includes(speed)) {
      setAnimationSpeed(speed);
    }
  }, []);

  // Update document classes based on animation settings
  useEffect(() => {
    const htmlElement = document.documentElement;
    
    // Remove all animation speed classes
    htmlElement.classList.remove('animations-slow', 'animations-normal', 'animations-fast');
    
    // Add appropriate classes
    if (animationsEnabled && !prefersReducedMotion) {
      htmlElement.classList.add(`animations-${animationSpeed}`);
      htmlElement.classList.remove('reduce-motion');
    } else {
      htmlElement.classList.add('reduce-motion');
    }
  }, [animationsEnabled, animationSpeed, prefersReducedMotion]);

  const contextValue = {
    prefersReducedMotion,
    animationsEnabled: animationsEnabled && !prefersReducedMotion,
    animationSpeed,
    enableAnimations,
    disableAnimations,
    setAnimationSpeed: setSpeed,
    toggleAnimations,
  };

  return (
    <AnimationContext.Provider value={contextValue}>
      {children}
    </AnimationContext.Provider>
  );
};

/**
 * Custom hook to use animation context
 * @returns {Object} Animation context values and functions
 */
export const useAnimationContext = () => {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error('useAnimationContext must be used within an AnimationProvider');
  }
  return context;
};

export default AnimationContext;
