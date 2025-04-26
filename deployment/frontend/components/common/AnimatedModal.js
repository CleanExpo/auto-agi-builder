import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAnimation } from '../../contexts/AnimationContext';

/**
 * AnimatedModal component
 * A modal dialog with configurable entrance/exit animations
 * Respects user motion preferences via AnimationContext
 * 
 * @param {Object} props Component props
 * @param {Boolean} props.isOpen Whether the modal is open
 * @param {Function} props.onClose Function to call when the modal is closed
 * @param {String} props.title Modal title
 * @param {ReactNode} props.children Modal content
 * @param {String} props.size Modal size (sm, md, lg, xl, full)
 * @param {String} props.animationIn Entrance animation class
 * @param {String} props.animationOut Exit animation class
 * @param {Boolean} props.closeOnOverlayClick Whether to close when overlay is clicked
 * @param {Boolean} props.showCloseButton Whether to show the close button
 * @param {String} props.className Additional classes for the modal content
 * @returns {JSX.Element|null} The modal component or null if closed
 */
const AnimatedModal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  animationIn = 'animate-scale-in',
  animationOut = 'animate-scale-out',
  closeOnOverlayClick = true,
  showCloseButton = true,
  className = ''
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [portalElement, setPortalElement] = useState(null);
  const modalRef = useRef(null);
  const { shouldAnimate, getAnimationDuration } = useAnimation();
  
  // Check if animations are enabled
  const isAnimationEnabled = shouldAnimate('elementAnimations');
  const animationDuration = getAnimationDuration(300); // base animation time
  
  // Create portal target for the modal
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check for existing modal root or create one
      let modalRoot = document.getElementById('modal-root');
      
      if (!modalRoot) {
        modalRoot = document.createElement('div');
        modalRoot.id = 'modal-root';
        document.body.appendChild(modalRoot);
      }
      
      setPortalElement(modalRoot);
      
      return () => {
        // Clean up only if we created it and it's empty
        if (modalRoot.childNodes.length === 0) {
          document.body.removeChild(modalRoot);
        }
      };
    }
  }, []);
  
  // Handle body scroll locking when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Handle mounting/unmounting with animation
  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      setIsAnimatingOut(false);
    } else if (isMounted && isAnimationEnabled) {
      setIsAnimatingOut(true);
      
      // Wait for animation to complete before unmounting
      const timeout = setTimeout(() => {
        setIsMounted(false);
        setIsAnimatingOut(false);
      }, animationDuration);
      
      return () => clearTimeout(timeout);
    } else {
      setIsMounted(false);
    }
  }, [isOpen, isAnimationEnabled, animationDuration]);
  
  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);
  
  // Handle closing the modal
  const handleClose = () => {
    if (isAnimationEnabled) {
      setIsAnimatingOut(true);
      
      setTimeout(() => {
        onClose();
      }, animationDuration);
    } else {
      onClose();
    }
  };
  
  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      handleClose();
    }
  };
  
  // Determine size classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full'
  };
  
  // Don't render if not mounted and no portal
  if (!isMounted || !portalElement) return null;
  
  // Determine animation classes
  const animationClass = isAnimatingOut ? animationOut : animationIn;
  
  return createPortal(
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 ${isAnimatingOut ? 'animate-fade-out' : 'animate-fade-in'}`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      style={{ 
        transition: `opacity ${animationDuration}ms ease-in-out` 
      }}
    >
      <div 
        ref={modalRef}
        className={`
          ${sizeClasses[size]} w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl 
          ${isAnimationEnabled ? animationClass : ''} 
          ${className}
        `}
        style={{ 
          transition: `all ${animationDuration}ms ease-in-out`,
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Modal Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            {title && (
              <h3 
                id="modal-title" 
                className="text-xl font-semibold text-gray-900 dark:text-white"
              >
                {title}
              </h3>
            )}
            
            {showCloseButton && (
              <button
                type="button"
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                aria-label="Close"
              >
                <svg 
                  className="h-6 w-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>
            )}
          </div>
        )}
        
        {/* Modal Body */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>,
    portalElement
  );
};

export default AnimatedModal;
