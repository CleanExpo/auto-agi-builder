import { useRef, useState, useEffect } from 'react';
import { useAnimationContext } from '../contexts/AnimationContext';

/**
 * Custom hook for handling element animations
 * 
 * @param {Object} options - Animation options
 * @param {string} options.animation - CSS animation class to apply (default: 'animate-fade-in')
 * @param {number} options.delay - Delay in milliseconds before animation starts (default: 0)
 * @param {boolean} options.triggerOnce - Whether to trigger the animation only once (default: true)
 * @param {number} options.threshold - Intersection observer threshold (default: 0.1)
 * @returns {Object} Animation properties and methods
 */
const useAnimation = ({
  animation = 'animate-fade-in',
  delay = 0,
  triggerOnce = true,
  threshold = 0.1
} = {}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [animationClasses, setAnimationClasses] = useState('');
  const { animationsEnabled } = useAnimationContext();

  // Function to manually trigger the animation
  const triggerAnimation = () => {
    if (!animationsEnabled) return;
    
    setIsVisible(true);
    if (triggerOnce) {
      setHasAnimated(true);
    }
  };

  // Function to reset the animation state
  const resetAnimation = () => {
    setIsVisible(false);
    setHasAnimated(false);
  };

  // Set up intersection observer to detect when the element is visible
  useEffect(() => {
    if (!ref.current) return;

    // Skip intersection observer if animations are disabled
    if (!animationsEnabled) {
      setAnimationClasses('');
      return;
    }

    const handleIntersection = (entries) => {
      const [entry] = entries;

      if (entry.isIntersecting) {
        // Only trigger if not yet animated (when triggerOnce is true)
        if (triggerOnce && hasAnimated) return;
        
        setIsVisible(true);
        
        if (triggerOnce) {
          setHasAnimated(true);
        }
      } else {
        // Hide if not using triggerOnce
        if (!triggerOnce) {
          setIsVisible(false);
        }
      }
    };

    // Create the observer
    const observer = new IntersectionObserver(handleIntersection, { 
      threshold,
      rootMargin: '0px'
    });
    
    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [threshold, triggerOnce, hasAnimated, animationsEnabled]);

  // Generate animation classes when visibility or delay changes
  useEffect(() => {
    if (!animationsEnabled) {
      setAnimationClasses('');
      return;
    }
    
    if (isVisible) {
      // Apply delay class if specified
      let delayClass = '';
      if (delay) {
        if (delay <= 100) delayClass = 'animation-delay-100';
        else if (delay <= 200) delayClass = 'animation-delay-200';
        else if (delay <= 300) delayClass = 'animation-delay-300';
        else if (delay <= 500) delayClass = 'animation-delay-500';
        else delayClass = 'animation-delay-800';
      }

      setAnimationClasses(`${animation} ${delayClass}`);
    } else {
      setAnimationClasses('opacity-0');
    }
  }, [isVisible, animation, delay, animationsEnabled]);

  return {
    ref,
    isVisible,
    hasAnimated,
    animationClasses,
    triggerAnimation,
    resetAnimation
  };
};

export default useAnimation;
