import { useState, useEffect, useRef } from 'react';
import { useAnimation } from '../contexts/AnimationContext';

/**
 * Custom hook for detecting when elements enter the viewport
 * Allows triggering animations when elements become visible
 * Respects user motion preferences from AnimationContext
 * 
 * @param {Object} options Configuration options
 * @param {String} options.animationType Type of animation to consider from animation settings
 * @param {String} options.rootMargin Distance from viewport edge to trigger (default: '0px')
 * @param {Number} options.threshold Visibility threshold (0-1) to trigger (default: 0.1)
 * @param {Boolean} options.triggerOnce Only trigger once (default: true)
 * @returns {Object} Intersection state and ref to attach
 */
const useIntersectionObserver = ({
  animationType = 'elementAnimations',
  rootMargin = '0px',
  threshold = 0.1,
  triggerOnce = true
} = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const ref = useRef(null);
  const { shouldAnimate } = useAnimation();
  
  // Check if this animation type should be enabled
  const isAnimationEnabled = shouldAnimate(animationType);
  
  useEffect(() => {
    // If animations are disabled or we've already triggered (and triggerOnce is true),
    // immediately mark as visible and return
    if (!isAnimationEnabled || (triggerOnce && hasTriggered)) {
      setIsVisible(true);
      return;
    }
    
    const currentRef = ref.current;
    if (!currentRef) return;
    
    const observer = new IntersectionObserver(
      entries => {
        // Check if the target element is intersecting
        const [entry] = entries;
        
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasTriggered(true);
          
          // Unobserve if we only need to trigger once
          if (triggerOnce) {
            observer.unobserve(currentRef);
          }
        } else if (!triggerOnce) {
          // If we're not triggering once, toggle visibility
          setIsVisible(false);
        }
      },
      { rootMargin, threshold }
    );
    
    // Start observing the target element
    observer.observe(currentRef);
    
    // Clean up
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [rootMargin, threshold, triggerOnce, hasTriggered, isAnimationEnabled, animationType]);
  
  return { ref, isVisible };
};

export default useIntersectionObserver;
