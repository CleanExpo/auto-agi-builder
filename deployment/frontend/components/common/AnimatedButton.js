import React from 'react';
import { useAnimation } from '../../contexts/AnimationContext';

/**
 * AnimatedButton component
 * Button with configurable animations and effects
 * Respects user motion preferences via AnimationContext
 * 
 * @param {Object} props Component props
 * @param {String} props.variant Button style variant (primary, secondary, success, danger, warning, info, light, dark, link)
 * @param {String} props.size Button size (xs, sm, md, lg, xl)
 * @param {String} props.animation Animation effect (pulse, ripple, hover-lift, hover-glow, hover-scale)
 * @param {Boolean} props.fullWidth Whether the button should take up full width
 * @param {Boolean} props.disabled Whether the button is disabled
 * @param {Boolean} props.isLoading Whether to show loading state
 * @param {String} props.loadingText Text to show during loading
 * @param {ReactNode} props.leftIcon Icon to show on the left
 * @param {ReactNode} props.rightIcon Icon to show on the right
 * @param {String} props.className Additional classes
 * @param {Function} props.onClick Click handler
 * @param {ReactNode} props.children Button content
 * @returns {JSX.Element} The button component
 */
const AnimatedButton = ({
  variant = 'primary',
  size = 'md',
  animation = 'hover-lift',
  fullWidth = false,
  disabled = false,
  isLoading = false,
  loadingText,
  leftIcon,
  rightIcon,
  className = '',
  onClick,
  children,
  ...rest
}) => {
  const { shouldAnimate } = useAnimation();
  
  // Check if hover animations are enabled
  const isHoverAnimationEnabled = shouldAnimate('hoverEffects');
  
  // Generate variant classes
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white border-transparent',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white border-transparent',
    success: 'bg-green-600 hover:bg-green-700 text-white border-transparent',
    danger: 'bg-red-600 hover:bg-red-700 text-white border-transparent',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white border-transparent',
    info: 'bg-sky-500 hover:bg-sky-600 text-white border-transparent',
    light: 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200',
    dark: 'bg-gray-800 hover:bg-gray-900 text-white border-transparent',
    link: 'bg-transparent hover:bg-transparent text-blue-600 hover:text-blue-800 border-transparent',
    outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white',
    'outline-primary': 'bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20',
  };
  
  // Generate size classes
  const sizeClasses = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-2.5 text-lg',
    xl: 'px-6 py-3 text-xl'
  };
  
  // Generate animation classes
  const getAnimationClass = () => {
    if (!isHoverAnimationEnabled || disabled) return '';
    
    switch (animation) {
      case 'pulse':
        return 'animate-pulse-custom';
      case 'hover-lift':
        return 'transform hover:-translate-y-1 transition-transform duration-200';
      case 'hover-glow':
        return 'hover:shadow-glow transition-shadow duration-200';
      case 'hover-scale':
        return 'transform hover:scale-105 transition-transform duration-200';
      case 'ripple':
        return 'btn-ripple-effect';
      default:
        return '';
    }
  };
  
  // Base button classes
  const baseClasses = `
    inline-flex items-center justify-center font-medium
    rounded-md border transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
    ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
    ${fullWidth ? 'w-full' : ''}
    ${sizeClasses[size] || sizeClasses.md}
    ${variantClasses[variant] || variantClasses.primary}
    ${getAnimationClass()}
    ${className}
  `;
  
  // Handle ripple effect
  const handleRipple = (e) => {
    if (!isHoverAnimationEnabled || disabled || animation !== 'ripple') return;
    
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    
    button.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600); // match with CSS animation duration
  };
  
  const handleClick = (e) => {
    if (disabled || isLoading) return;
    
    if (animation === 'ripple') {
      handleRipple(e);
    }
    
    if (onClick) onClick(e);
  };
  
  return (
    <button
      className={baseClasses}
      disabled={disabled || isLoading}
      onClick={handleClick}
      {...rest}
    >
      {/* Loading spinner */}
      {isLoading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          ></circle>
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      
      {/* Left icon */}
      {!isLoading && leftIcon && (
        <span className="mr-2 inline-block">{leftIcon}</span>
      )}
      
      {/* Button text */}
      {isLoading && loadingText ? loadingText : children}
      
      {/* Right icon */}
      {!isLoading && rightIcon && (
        <span className="ml-2 inline-block">{rightIcon}</span>
      )}
    </button>
  );
};

export default AnimatedButton;
