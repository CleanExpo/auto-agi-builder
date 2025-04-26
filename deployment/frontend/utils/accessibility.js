/**
 * Accessibility utilities for the application
 * These utilities help ensure the application is accessible to all users
 */

/**
 * Focus management utilities
 */

/**
 * Set focus to the first focusable element within a container
 * @param {HTMLElement} container - The container to search within
 * @param {Object} options - Options for focus behavior
 * @param {boolean} options.preventScroll - Prevent scrolling to the element
 * @param {boolean} options.fallbackToContainer - Focus the container itself if no focusable element is found
 * @returns {boolean} Whether focus was successfully set
 */
export const focusFirstElement = (container, options = {}) => {
  if (!container) return false;
  
  const { preventScroll = false, fallbackToContainer = true } = options;
  
  // Find all focusable elements
  const focusable = getFocusableElements(container);
  
  // Focus the first element if available
  if (focusable.length > 0) {
    focusable[0].focus({ preventScroll });
    return true;
  }
  
  // Focus the container itself as a fallback
  if (fallbackToContainer) {
    container.setAttribute('tabindex', '-1');
    container.focus({ preventScroll });
    return true;
  }
  
  return false;
};

/**
 * Trap focus within a container when Tab and Shift+Tab are pressed
 * @param {Event} event - The keyboard event
 * @param {HTMLElement} container - The container to trap focus within
 * @returns {void}
 */
export const trapFocus = (event, container) => {
  // Only process Tab key
  if (event.key !== 'Tab') return;
  
  const focusableElements = getFocusableElements(container);
  
  if (focusableElements.length === 0) return;
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  // If Shift+Tab and the active element is the first element, focus the last element
  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  } 
  // If Tab and the active element is the last element, focus the first element
  else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
};

/**
 * Get all focusable elements within a container
 * @param {HTMLElement} container - The container to search within
 * @returns {Array} Array of focusable elements
 */
export const getFocusableElements = (container) => {
  if (!container) return [];
  
  // List of selectors for focusable elements
  const focusableSelectors = [
    'a[href]:not([disabled])',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    'area[href]',
    'iframe',
    'object',
    'embed',
    '[contenteditable]'
  ];
  
  const elements = Array.from(
    container.querySelectorAll(focusableSelectors.join(','))
  ).filter(element => {
    // Filter out hidden elements
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           element.offsetWidth > 0 && 
           element.offsetHeight > 0;
  });
  
  return elements;
};

/**
 * Restore focus to an element after an operation
 * @param {HTMLElement} element - The element to focus
 * @returns {Function} Function to restore focus
 */
export const createFocusRestorer = (element = document.activeElement) => {
  return () => {
    if (element && typeof element.focus === 'function') {
      try {
        element.focus();
      } catch (e) {
        console.warn('Failed to restore focus:', e);
      }
    }
  };
};

/**
 * Announce a message to screen readers using ARIA live regions
 * @param {string} message - The message to announce
 * @param {string} priority - The announcement priority ('polite' or 'assertive')
 * @returns {Function} Function to clean up the announcement element
 */
export const announceToScreenReader = (message, priority = 'polite') => {
  // Create a live region if it doesn't exist yet
  let liveRegion = document.getElementById('aria-live-announcer');
  
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'aria-live-announcer';
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-relevant', 'additions');
    
    // Hide visually but keep available to screen readers
    Object.assign(liveRegion.style, {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: '0'
    });
    
    document.body.appendChild(liveRegion);
  }
  
  // Set the priority attribute in case it changed
  liveRegion.setAttribute('aria-live', priority);
  
  // Clear any existing text
  liveRegion.textContent = '';
  
  // Update the text (in a new task to ensure screen readers register the change)
  setTimeout(() => {
    liveRegion.textContent = message;
  }, 100);
  
  // Return a cleanup function
  return () => {
    if (liveRegion) {
      liveRegion.textContent = '';
    }
  };
};

/**
 * Create an element with appropriate ARIA attributes for screen readers
 * @param {Object} options - ARIA options
 * @param {string} options.role - ARIA role
 * @param {Object} options.attributes - Additional ARIA attributes
 * @returns {Object} Props object to spread onto a component
 */
export const createAriaProps = ({ role, ...attributes } = {}) => {
  const props = {};
  
  if (role) {
    props.role = role;
  }
  
  // Convert camelCase to kebab-case for ARIA attributes
  Object.keys(attributes).forEach(key => {
    const value = attributes[key];
    
    if (value !== undefined && value !== null) {
      const ariaKey = key.startsWith('aria') 
        ? key.replace(/([A-Z])/g, '-$1').toLowerCase() 
        : `aria-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      
      props[ariaKey] = value.toString();
    }
  });
  
  return props;
};

/**
 * Keyboard accessibility utilities
 */

/**
 * Detect if an event is a keyboard or screen reader activation
 * @param {Event} event - The event to check
 * @returns {boolean} Whether the event is an activation
 */
export const isActivationEvent = (event) => {
  return (
    (event.type === 'click') ||
    (event.type === 'keydown' && (event.key === 'Enter' || event.key === ' '))
  );
};

/**
 * Create a keyboard event handler that only triggers on Enter or Space
 * @param {Function} callback - The function to call when activated
 * @returns {Function} Keyboard event handler
 */
export const createKeyboardHandler = (callback) => {
  return (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback(event);
    }
  };
};

/**
 * Create navigation keyboard event handler for arrow keys
 * @param {Object} options - Options for navigation
 * @param {Function} options.onUp - Handler for up arrow
 * @param {Function} options.onDown - Handler for down arrow
 * @param {Function} options.onLeft - Handler for left arrow
 * @param {Function} options.onRight - Handler for right arrow
 * @param {Function} options.onHome - Handler for home key
 * @param {Function} options.onEnd - Handler for end key
 * @param {boolean} options.preventDefault - Whether to prevent default behavior
 * @returns {Function} Keyboard event handler
 */
export const createArrowKeyHandler = ({
  onUp,
  onDown,
  onLeft,
  onRight,
  onHome,
  onEnd,
  preventDefault = true
} = {}) => {
  return (event) => {
    switch (event.key) {
      case 'ArrowUp':
      case 'Up':
        if (onUp) {
          if (preventDefault) event.preventDefault();
          onUp(event);
        }
        break;
      case 'ArrowDown':
      case 'Down':
        if (onDown) {
          if (preventDefault) event.preventDefault();
          onDown(event);
        }
        break;
      case 'ArrowLeft':
      case 'Left':
        if (onLeft) {
          if (preventDefault) event.preventDefault();
          onLeft(event);
        }
        break;
      case 'ArrowRight':
      case 'Right':
        if (onRight) {
          if (preventDefault) event.preventDefault();
          onRight(event);
        }
        break;
      case 'Home':
        if (onHome) {
          if (preventDefault) event.preventDefault();
          onHome(event);
        }
        break;
      case 'End':
        if (onEnd) {
          if (preventDefault) event.preventDefault();
          onEnd(event);
        }
        break;
      default:
        break;
    }
  };
};

/**
 * Media-specific accessibility utilities
 */

/**
 * Check contrast ratio for text
 * @param {string} foreground - Foreground color (text)
 * @param {string} background - Background color
 * @returns {number} Contrast ratio (1:1 to 21:1)
 */
export const getContrastRatio = (foreground, background) => {
  // Convert hex color to RGB
  const hexToRgb = (hex) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : null;
  };
  
  // Calculate relative luminance
  const getLuminance = (rgb) => {
    const [r, g, b] = rgb.map(c => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  // Parse colors
  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);
  
  if (!fgRgb || !bgRgb) {
    console.warn('Invalid color format. Use hex colors (e.g., #FFFFFF).');
    return 1;
  }
  
  // Calculate luminances
  const fgLuminance = getLuminance(fgRgb);
  const bgLuminance = getLuminance(bgRgb);
  
  // Calculate contrast ratio
  const lighterLum = Math.max(fgLuminance, bgLuminance);
  const darkerLum = Math.min(fgLuminance, bgLuminance);
  
  return (lighterLum + 0.05) / (darkerLum + 0.05);
};

/**
 * Validate whether a color combination meets WCAG contrast guidelines
 * @param {string} foreground - Foreground color (text)
 * @param {string} background - Background color
 * @param {string} level - Compliance level ('AA' or 'AAA')
 * @param {string} size - Text size ('normal' or 'large')
 * @returns {boolean} Whether the contrast meets the specified level
 */
export const meetsContrastGuidelines = (
  foreground,
  background,
  level = 'AA',
  size = 'normal'
) => {
  const ratio = getContrastRatio(foreground, background);
  
  if (level === 'AAA') {
    return size === 'large' ? ratio >= 4.5 : ratio >= 7;
  } else { // AA
    return size === 'large' ? ratio >= 3 : ratio >= 4.5;
  }
};

/**
 * Image accessibility utilities
 */

/**
 * Generate appropriate alt text props based on image purpose
 * @param {Object} options - Alt text options
 * @param {string} options.alt - Alt text
 * @param {boolean} options.decorative - Whether the image is decorative
 * @returns {Object} Props to apply to the image
 */
export const getImageAccessibilityProps = ({ alt = '', decorative = false } = {}) => {
  if (decorative) {
    return {
      alt: '',
      role: 'presentation',
      'aria-hidden': 'true'
    };
  }
  
  if (!alt) {
    console.warn('Non-decorative images should have meaningful alt text');
  }
  
  return {
    alt
  };
};
