import React, { useEffect, useRef, useState } from 'react';
import { useAnimation } from '../../contexts/AnimationContext';

/**
 * ParallaxSection component
 * Creates a section with parallax scrolling effect for depth
 * Respects user's animation preferences and accessibility settings
 * 
 * @param {Object} props Component props
 * @param {ReactNode} props.children Content to display in the parallax section
 * @param {String} props.backgroundImage URL of the background image
 * @param {Number} props.speed Parallax speed factor (default: 0.5)
 * @param {String} props.height Height of the section (default: '400px')
 * @param {String} props.className Additional CSS classes
 */
const ParallaxSection = ({
  children,
  backgroundImage,
  speed = 0.5,
  height = '400px',
  className = ''
}) => {
  const sectionRef = useRef(null);
  const [offsetY, setOffsetY] = useState(0);
  const { animationSettings, prefersReducedMotion } = useAnimation();
  
  // Check if parallax effects are enabled
  const isParallaxEnabled = animationSettings.parallaxEffects && !prefersReducedMotion;
  
  // Effect to handle scroll events for parallax
  useEffect(() => {
    // Skip effect if parallax is disabled or no backgroundImage
    if (!isParallaxEnabled || !backgroundImage) return;
    
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      // Calculate the element's position relative to viewport
      const rect = sectionRef.current.getBoundingClientRect();
      const elementTop = rect.top;
      const elementHeight = rect.height;
      const windowHeight = window.innerHeight;
      
      // Only update parallax when element is visible
      if (elementTop < windowHeight && elementTop + elementHeight > 0) {
        // Calculate how far the element is from the center of the viewport
        const centerOffset = elementTop - (windowHeight / 2) + (elementHeight / 2);
        setOffsetY(centerOffset * speed);
      }
    };
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initialize on mount
    handleScroll();
    
    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [backgroundImage, speed, isParallaxEnabled]);
  
  // Generate styles for the section and background
  const sectionStyle = {
    height,
    position: 'relative',
    overflow: 'hidden',
    ...(!isParallaxEnabled && backgroundImage ? {
      // Standard background for non-parallax mode
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    } : {})
  };
  
  // Background styles with parallax effect
  const backgroundStyle = isParallaxEnabled && backgroundImage ? {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: `calc(100% + ${Math.abs(offsetY * 2)}px)`,
    transform: `translateY(${offsetY}px)`,
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    transition: 'transform 0.1s ease-out'
  } : {};
  
  // Content container styles
  const contentStyle = {
    position: 'relative',
    zIndex: 10,
    height: '100%'
  };
  
  return (
    <section 
      ref={sectionRef} 
      className={`parallax-section ${className}`}
      style={sectionStyle}
      role="region"
      aria-label="Parallax Content Section"
    >
      {/* Parallax background */}
      {isParallaxEnabled && backgroundImage && (
        <div 
          className="parallax-background" 
          style={backgroundStyle}
          aria-hidden="true"
        />
      )}
      
      {/* Content container */}
      <div className="parallax-content" style={contentStyle}>
        {children}
      </div>
    </section>
  );
};

export default ParallaxSection;
