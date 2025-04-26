/**
 * Browser support utilities
 * Helps detect browser capabilities and provide graceful degradation for unsupported features
 */

/**
 * Detect browser type and version
 * @returns {Object} Browser information object
 */
export const detectBrowser = () => {
  const userAgent = window.navigator.userAgent;
  let browser = 'Unknown';
  let version = 'Unknown';
  let os = 'Unknown';
  let mobile = false;

  // Detect browser
  if (userAgent.indexOf('Firefox') > -1) {
    browser = 'Firefox';
    version = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || '';
  } else if (userAgent.indexOf('Edge') > -1 || userAgent.indexOf('Edg/') > -1) {
    browser = 'Edge';
    version = userAgent.match(/Edge\/([0-9.]+)/)?.[1] || 
              userAgent.match(/Edg\/([0-9.]+)/)?.[1] || '';
  } else if (userAgent.indexOf('Chrome') > -1) {
    browser = 'Chrome';
    version = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || '';
  } else if (userAgent.indexOf('Safari') > -1) {
    browser = 'Safari';
    version = userAgent.match(/Version\/([0-9.]+)/)?.[1] || '';
  } else if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident/') > -1) {
    browser = 'Internet Explorer';
    version = userAgent.match(/MSIE ([0-9.]+)/)?.[1] || '';
    if (!version) {
      // IE 11 doesn't include "MSIE" in the user agent
      version = userAgent.match(/rv:([0-9.]+)/)?.[1] || '';
    }
  } else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR/') > -1) {
    browser = 'Opera';
    version = userAgent.match(/Opera\/([0-9.]+)/)?.[1] || 
              userAgent.match(/OPR\/([0-9.]+)/)?.[1] || '';
  }

  // Detect OS
  if (userAgent.indexOf('Windows') > -1) {
    os = 'Windows';
  } else if (userAgent.indexOf('Mac') > -1) {
    os = 'MacOS';
  } else if (userAgent.indexOf('Linux') > -1) {
    os = 'Linux';
  } else if (userAgent.indexOf('Android') > -1) {
    os = 'Android';
    mobile = true;
  } else if (userAgent.indexOf('iOS') > -1 || userAgent.indexOf('iPhone') > -1 || userAgent.indexOf('iPad') > -1) {
    os = 'iOS';
    mobile = true;
  }

  // Detect mobile browser
  if (userAgent.indexOf('Mobile') > -1) {
    mobile = true;
  }

  return { browser, version, os, mobile, userAgent };
};

/**
 * Check if the browser is supported
 * @param {Object} options - Browser support options
 * @param {Array<string>} options.supportedBrowsers - List of supported browsers
 * @param {Object} options.minVersions - Minimum supported versions for each browser
 * @returns {boolean} Whether the browser is supported
 */
export const isBrowserSupported = (
  options = {
    supportedBrowsers: ['Chrome', 'Firefox', 'Safari', 'Edge'],
    minVersions: {
      Chrome: 60,
      Firefox: 60,
      Safari: 12,
      Edge: 79 // Chromium-based Edge
    }
  }
) => {
  const { browser, version } = detectBrowser();
  const { supportedBrowsers, minVersions } = options;
  
  // Check if the browser is in the supported list
  if (!supportedBrowsers.includes(browser)) {
    return false;
  }
  
  // Check if the browser version meets the minimum requirement
  const minVersion = minVersions[browser];
  if (minVersion) {
    const majorVersion = parseInt(version.split('.')[0], 10);
    if (isNaN(majorVersion) || majorVersion < minVersion) {
      return false;
    }
  }
  
  return true;
};

/**
 * Feature support checks
 */
export const featureSupport = {
  /**
   * Check if CSS Grid is supported
   * @returns {boolean} Whether CSS Grid is supported
   */
  cssGrid: () => {
    // Check if CSS Grid properties exist on the HTMLElement prototype
    return window.CSS && CSS.supports && (
      CSS.supports('display', 'grid') ||
      CSS.supports('display', '-ms-grid')
    );
  },
  
  /**
   * Check if Flexbox is supported
   * @returns {boolean} Whether Flexbox is supported
   */
  flexbox: () => {
    return window.CSS && CSS.supports && CSS.supports('display', 'flex');
  },
  
  /**
   * Check if the Intersection Observer API is supported
   * @returns {boolean} Whether the Intersection Observer API is supported
   */
  intersectionObserver: () => {
    return 'IntersectionObserver' in window;
  },
  
  /**
   * Check if the Web Animations API is supported
   * @returns {boolean} Whether the Web Animations API is supported
   */
  webAnimations: () => {
    return typeof Element.prototype.animate === 'function';
  },
  
  /**
   * Check if the Fetch API is supported
   * @returns {boolean} Whether the Fetch API is supported
   */
  fetch: () => {
    return 'fetch' in window;
  },
  
  /**
   * Check if Service Workers are supported
   * @returns {boolean} Whether Service Workers are supported
   */
  serviceWorker: () => {
    return 'serviceWorker' in navigator;
  },
  
  /**
   * Check if WebGL is supported
   * @returns {boolean} Whether WebGL is supported
   */
  webgl: () => {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch (e) {
      return false;
    }
  },
  
  /**
   * Check if WebRTC is supported
   * @returns {boolean} Whether WebRTC is supported
   */
  webrtc: () => {
    return !!(
      navigator.mediaDevices && 
      navigator.mediaDevices.getUserMedia &&
      window.RTCPeerConnection
    );
  },
  
  /**
   * Check if Local Storage is supported
   * @returns {boolean} Whether Local Storage is supported
   */
  localStorage: () => {
    try {
      const testKey = '__test_key__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  },
  
  /**
   * Check if Session Storage is supported
   * @returns {boolean} Whether Session Storage is supported
   */
  sessionStorage: () => {
    try {
      const testKey = '__test_key__';
      sessionStorage.setItem(testKey, testKey);
      sessionStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  },
  
  /**
   * Check if the browser supports Web Sockets
   * @returns {boolean} Whether Web Sockets are supported
   */
  webSockets: () => {
    return 'WebSocket' in window;
  },
  
  /**
   * Check if the browser supports ES6 features
   * @returns {boolean} Whether ES6 features are supported
   */
  es6: () => {
    try {
      // Check for arrow functions
      eval('() => {}');
      // Check for template literals
      eval('`template literal test`');
      // Check for destructuring
      eval('const { a, b } = { a: 1, b: 2 }');
      return true;
    } catch (e) {
      return false;
    }
  }
};

/**
 * Get a list of all unsupported features
 * @param {Array<string>} requiredFeatures - List of feature names to check
 * @returns {Array<string>} List of unsupported features
 */
export const getUnsupportedFeatures = (requiredFeatures = [
  'cssGrid',
  'flexbox',
  'fetch',
  'localStorage',
  'es6'
]) => {
  return requiredFeatures.filter(feature => {
    return featureSupport[feature] && !featureSupport[feature]();
  });
};

/**
 * Create a browser warning message if the browser is not supported
 * @param {Object} options - Browser support options
 * @returns {Object|null} Warning message object or null if browser is supported
 */
export const getBrowserWarning = (options) => {
  const browserInfo = detectBrowser();
  const isSupported = isBrowserSupported(options);
  const unsupportedFeatures = getUnsupportedFeatures();
  
  if (!isSupported || unsupportedFeatures.length > 0) {
    return {
      browser: browserInfo.browser,
      version: browserInfo.version,
      os: browserInfo.os,
      isSupported,
      unsupportedFeatures,
      isMobile: browserInfo.mobile,
      message: !isSupported
        ? `Your browser (${browserInfo.browser} ${browserInfo.version}) is not fully supported. Some features may not work correctly.`
        : `Your browser doesn't support these features: ${unsupportedFeatures.join(', ')}. Some functionality may be limited.`,
      upgradeUrl: getUpgradeUrl(browserInfo.browser)
    };
  }
  
  return null;
};

/**
 * Get the URL to upgrade a specific browser
 * @param {string} browser - Browser name
 * @returns {string} URL to upgrade the browser
 */
export const getUpgradeUrl = (browser) => {
  switch (browser) {
    case 'Chrome':
      return 'https://www.google.com/chrome/';
    case 'Firefox':
      return 'https://www.mozilla.org/firefox/new/';
    case 'Safari':
      return 'https://support.apple.com/downloads/safari';
    case 'Edge':
      return 'https://www.microsoft.com/edge';
    case 'Opera':
      return 'https://www.opera.com/download';
    case 'Internet Explorer':
      return 'https://www.microsoft.com/edge';
    default:
      return 'https://browsehappy.com/';
  }
};

/**
 * Apply polyfills for missing features
 * This function should be called early in the application initialization
 */
export const applyPolyfills = async () => {
  const polyfills = [];
  
  // Fetch API polyfill
  if (!featureSupport.fetch()) {
    polyfills.push(import('whatwg-fetch'));
  }
  
  // Intersection Observer polyfill
  if (!featureSupport.intersectionObserver()) {
    polyfills.push(import('intersection-observer'));
  }
  
  // Promise polyfill
  if (typeof Promise === 'undefined') {
    polyfills.push(import('promise-polyfill/src/polyfill'));
  }
  
  try {
    await Promise.all(polyfills);
    return true;
  } catch (error) {
    console.error('Failed to load polyfills:', error);
    return false;
  }
};

// Export browser information for debugging
export const browserInfo = typeof window !== 'undefined' ? detectBrowser() : {};

/**
 * Calculate an estimated device performance score (0-100)
 * Useful for deciding whether to enable performance-intensive features
 * @returns {number} Performance score
 */
export const getDevicePerformanceScore = () => {
  if (typeof window === 'undefined') return 50; // Default for server-side rendering
  
  // Start with a base score
  let score = 50;
  
  // Adjust based on hardware concurrency (CPU cores)
  if (navigator.hardwareConcurrency) {
    // Add 5 points per core, up to 8 cores
    score += Math.min(navigator.hardwareConcurrency, 8) * 5;
  }
  
  // Adjust based on device memory (if available)
  if (navigator.deviceMemory) {
    // Add 5 points per GB of RAM, up to 8GB
    score += Math.min(navigator.deviceMemory, 8) * 5;
  }
  
  // Adjust based on connection type
  if (navigator.connection) {
    const connection = navigator.connection;
    
    // Adjust based on connection type
    if (connection.effectiveType) {
      switch (connection.effectiveType) {
        case '4g':
          score += 10;
          break;
        case '3g':
          score -= 5;
          break;
        case '2g':
          score -= 15;
          break;
        case 'slow-2g':
          score -= 25;
          break;
      }
    }
    
    // Adjust based on save-data preference
    if (connection.saveData) {
      score -= 10;
    }
  }
  
  // Adjust for mobile devices
  if (browserInfo.mobile) {
    score -= 15;
  }
  
  // Ensure the score stays within 0-100
  return Math.max(0, Math.min(100, Math.round(score)));
};

/**
 * Get appropriate feature flags based on device capabilities
 * @returns {Object} Feature flags
 */
export const getFeatureFlags = () => {
  const performanceScore = getDevicePerformanceScore();
  
  return {
    // Enable advanced animations only on high-performance devices
    enableAdvancedAnimations: performanceScore >= 70 && featureSupport.webAnimations(),
    
    // Enable WebGL features only on compatible devices with decent performance
    enableWebGL: performanceScore >= 60 && featureSupport.webgl(),
    
    // Enable offline support only if service workers are supported
    enableOfflineSupport: featureSupport.serviceWorker() && featureSupport.localStorage(),
    
    // Enable video conferencing only on devices that support WebRTC and have good performance
    enableVideoConferencing: performanceScore >= 75 && featureSupport.webrtc(),
    
    // Enable high-quality images only on devices with good performance
    enableHighQualityImages: performanceScore >= 65,
    
    // Enable advanced charts and visualizations only on devices with good performance
    enableAdvancedVisualizations: performanceScore >= 60,
    
    // Performance score for reference
    performanceScore
  };
};
