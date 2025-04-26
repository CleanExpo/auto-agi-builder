import { useRef, useState, useEffect } from 'react';

/**
 * Custom hook to detect element visibility using Intersection Observer API
 * 
 * @param {Object} options - Hook options
 * @param {number} options.threshold - Visibility threshold (0-1, default: 0.1)
 * @param {string} options.rootMargin - Root margin (default: '0px')
 * @param {Element} options.root - The element used as viewport (default: browser viewport)
 * @param {boolean} options.freezeOnceVisible - If true, isVisible remains true once triggered (default: false)
 * @returns {Object} Observer state and ref
 */
const useIntersectionObserver = ({
  threshold = 0.1,
  rootMargin = '0px',
  root = null,
  freezeOnceVisible = false
} = {}) => {
  const ref = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    // Avoid unnecessary observer setup if already frozen
    if (freezeOnceVisible && hasIntersected) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting;
        
        // Update intersection state
        setIsIntersecting(isElementIntersecting);
        
        // If element is intersecting and we want to freeze visibility
        if (isElementIntersecting && freezeOnceVisible) {
          setHasIntersected(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin, root }
    );
    
    observer.observe(element);
    
    // Cleanup function
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin, root, freezeOnceVisible, hasIntersected]);
  
  // The isVisible value respects the freezeOnceVisible setting
  const isVisible = freezeOnceVisible ? isIntersecting || hasIntersected : isIntersecting;
  
  return { ref, isVisible, hasIntersected };
};

export default useIntersectionObserver;
