import React, { useState } from 'react';
import { useAnimationContext } from '../../contexts/AnimationContext';

/**
 * AnimatedButton component with hover and click animations
 * 
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Button content
 * @param {string} props.variant - Button variant (primary, secondary, success, danger, outline)
 * @param {string} props.size - Button size (sm, md, lg)
 * @param {string} props.animation - Animation type for button (ripple, scale, glow)
 * @param {Function} props.onClick - Button click handler
 * @param {string} props.className - Additional CSS classes
 */
const AnimatedButton = ({
  children,
  variant = 'primary',
  size = 'md',
  animation = 'scale',
  onClick,
  className = '',
  disabled = false,
  ...props
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const { animationsEnabled } = useAnimationContext();
  
  // Base button styles
  const baseStyles = 'font-medium rounded focus:outline-none transition-all duration-300';
  
  // Size variants
  const sizeStyles = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };
  
  // Color variants
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800',
    success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600 active:bg-yellow-700',
    info: 'bg-cyan-600 text-white hover:bg-cyan-700 active:bg-cyan-800',
    light: 'bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300',
    dark: 'bg-gray-800 text-white hover:bg-gray-900 active:bg-black',
    outline: 'bg-transparent border border-current text-blue-600 hover:bg-blue-50 active:bg-blue-100',
    ghost: 'bg-transparent hover:bg-gray-100 active:bg-gray-200 text-gray-700',
  };
  
  // Disabled state
  const disabledStyles = 'opacity-60 cursor-not-allowed';
  
  // Handle click with animation
  const handleClick = (e) => {
    if (disabled) return;
    
    // Trigger animation if animations are enabled
    if (animationsEnabled && animation) {
      setIsAnimating(true);
      
      // Reset animation state after animation completes
      setTimeout(() => {
        setIsAnimating(false);
      }, 600);
    }
    
    // Call the provided onClick handler
    if (onClick) {
      onClick(e);
    }
  };
  
  // Animation styles
  const getAnimationStyles = () => {
    if (!animationsEnabled) return '';
    
    const animationStyles = {
      ripple: isAnimating ? 'animate-ripple' : 'hover:shadow-md active:shadow-inner',
      scale: isAnimating ? 'animate-button-press' : 'hover:scale-105 active:scale-95',
      glow: isAnimating ? 'animate-glow-pulse' : 'hover:shadow-glow',
      bounce: isAnimating ? 'animate-bounce-once' : 'hover:translate-y-[-2px]',
      none: '',
    };
    
    return animationStyles[animation] || animationStyles.scale;
  };
  
  return (
    <button
      className={`
        ${baseStyles}
        ${sizeStyles[size] || sizeStyles.md}
        ${variantStyles[variant] || variantStyles.primary}
        ${getAnimationStyles()}
        ${disabled ? disabledStyles : ''}
        ${className}
      `}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default AnimatedButton;
