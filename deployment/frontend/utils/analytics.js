/**
 * Analytics utilities for Auto AGI Builder.
 * 
 * This module provides functions for tracking user interactions and page views
 * in Google Analytics and Google Tag Manager. It also includes custom event tracking
 * for application-specific metrics.
 */

import { publicConfig } from './config';

/**
 * Enumeration of available analytics services.
 */
export const AnalyticsServices = {
  GOOGLE_ANALYTICS: 'ga',
  GOOGLE_TAG_MANAGER: 'gtm',
  CUSTOM_EVENTS: 'custom'
};

/**
 * Standard event categories for consistent tracking.
 */
export const EventCategories = {
  USER: 'user',
  PROJECT: 'project',
  PROTOTYPE: 'prototype',
  REQUIREMENT: 'requirement',
  DOCUMENT: 'document',
  ROI: 'roi',
  DEVICE_PREVIEW: 'device_preview',
  ROADMAP: 'roadmap',
  PRESENTATION: 'presentation',
  EXPORT: 'export',
  API: 'api',
  ERROR: 'error',
  PERFORMANCE: 'performance',
  FEATURE: 'feature'
};

/**
 * Standard event actions for consistent tracking.
 */
export const EventActions = {
  // General actions
  VIEW: 'view',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  SEARCH: 'search',
  FILTER: 'filter',
  SORT: 'sort',
  SHARE: 'share',
  DOWNLOAD: 'download',
  UPLOAD: 'upload',
  
  // User actions
  LOGIN: 'login',
  LOGOUT: 'logout',
  REGISTER: 'register',
  PROFILE_UPDATE: 'profile_update',
  PASSWORD_RESET: 'password_reset',
  
  // Navigation actions
  NAVIGATE: 'navigate',
  OPEN_MODAL: 'open_modal',
  CLOSE_MODAL: 'close_modal',
  
  // Feature interactions
  TOGGLE: 'toggle',
  SELECT: 'select',
  SUBMIT: 'submit',
  CANCEL: 'cancel',
  
  // Error actions
  ERROR: 'error',
  
  // Performance actions
  LOAD_TIME: 'load_time',
  RENDER_TIME: 'render_time',
  API_RESPONSE_TIME: 'api_response_time'
};

// Store enabled services
let enabledServices = [];

// Store pending events (events captured before analytics is initialized)
let pendingEvents = [];

// Flag to track initialization status
let isInitialized = false;

// Custom event callbacks
const customEventCallbacks = [];

/**
 * Initialize analytics by loading appropriate scripts and configuring tracking.
 * @param {Object} options - Analytics initialization options
 * @returns {Promise<boolean>} - Promise that resolves to true if initialization is successful
 */
export const initAnalytics = async (options = {}) => {
  // Don't initialize twice
  if (isInitialized) return true;
  
  const {
    services = [AnalyticsServices.GOOGLE_ANALYTICS, AnalyticsServices.GOOGLE_TAG_MANAGER],
    requireConsent = publicConfig.features.requireAnalyticsConsent,
    userConsent = false,
    debug = publicConfig.debug,
    customEventHandler = null
  } = options;
  
  // Early return if consent is required but not given
  if (requireConsent && !userConsent) {
    console.log('Analytics requires user consent. Call initAnalytics with userConsent=true after obtaining consent.');
    return false;
  }
  
  // Load Google Analytics if enabled and ID is provided
  if (
    services.includes(AnalyticsServices.GOOGLE_ANALYTICS) && 
    publicConfig.googleAnalyticsId
  ) {
    try {
      await loadGoogleAnalytics(publicConfig.googleAnalyticsId, debug);
      enabledServices.push(AnalyticsServices.GOOGLE_ANALYTICS);
    } catch (error) {
      console.error('Failed to load Google Analytics:', error);
    }
  }
  
  // Load Google Tag Manager if enabled and ID is provided
  if (
    services.includes(AnalyticsServices.GOOGLE_TAG_MANAGER) && 
    publicConfig.googleTagManagerId
  ) {
    try {
      await loadGoogleTagManager(publicConfig.googleTagManagerId, debug);
      enabledServices.push(AnalyticsServices.GOOGLE_TAG_MANAGER);
    } catch (error) {
      console.error('Failed to load Google Tag Manager:', error);
    }
  }
  
  // Setup custom event handling
  if (services.includes(AnalyticsServices.CUSTOM_EVENTS)) {
    enabledServices.push(AnalyticsServices.CUSTOM_EVENTS);
    
    if (customEventHandler && typeof customEventHandler === 'function') {
      customEventCallbacks.push(customEventHandler);
    }
  }
  
  // Process any pending events
  if (pendingEvents.length > 0) {
    pendingEvents.forEach(event => {
      trackEvent(event.category, event.action, event.label, event.value, event.options);
    });
    pendingEvents = [];
  }
  
  isInitialized = true;
  return enabledServices.length > 0;
};

/**
 * Register a handler for custom events.
 * @param {Function} callback - Function to call with event data
 */
export const registerCustomEventHandler = (callback) => {
  if (typeof callback === 'function') {
    customEventCallbacks.push(callback);
  }
};

/**
 * Load Google Analytics script.
 * @param {string} id - Google Analytics ID
 * @param {boolean} debug - Whether to enable debug mode
 * @returns {Promise<void>} - Promise that resolves when script is loaded
 */
const loadGoogleAnalytics = (id, debug = false) => {
  return new Promise((resolve, reject) => {
    if (!id) {
      reject(new Error('Google Analytics ID is required'));
      return;
    }
    
    // Skip if already loaded
    if (window.ga) {
      resolve();
      return;
    }
    
    // Create script element
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    
    // Set up load and error handlers
    script.onload = () => {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function() {
        window.dataLayer.push(arguments);
      };
      
      window.gtag('js', new Date());
      window.gtag('config', id, { 
        debug_mode: debug,
        send_page_view: false // We'll handle page views manually
      });
      
      resolve();
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load Google Analytics script'));
    };
    
    // Add script to the document
    document.head.appendChild(script);
  });
};

/**
 * Load Google Tag Manager script.
 * @param {string} id - Google Tag Manager ID
 * @param {boolean} debug - Whether to enable debug mode
 * @returns {Promise<void>} - Promise that resolves when script is loaded
 */
const loadGoogleTagManager = (id, debug = false) => {
  return new Promise((resolve, reject) => {
    if (!id) {
      reject(new Error('Google Tag Manager ID is required'));
      return;
    }
    
    // Skip if already loaded
    if (window.google_tag_manager) {
      resolve();
      return;
    }
    
    // GTM script
    const script = document.createElement('script');
    script.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl${debug ? '+&gtm_debug=x' : ''};f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${id}');
    `;
    
    // Add script to the document
    document.head.appendChild(script);
    
    // Also add the noscript iframe for browsers with JavaScript disabled
    const noscript = document.createElement('noscript');
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${id}`;
    iframe.height = '0';
    iframe.width = '0';
    iframe.style.display = 'none';
    iframe.style.visibility = 'hidden';
    
    noscript.appendChild(iframe);
    document.body.insertBefore(noscript, document.body.firstChild);
    
    // Assume success since there's no reliable way to detect when GTM is fully loaded
    resolve();
  });
};

/**
 * Track a page view.
 * @param {string} path - The page path
 * @param {string} title - The page title
 * @param {Object} options - Additional tracking options
 */
export const trackPageView = (path, title, options = {}) => {
  if (!isInitialized) {
    // Queue for later if not initialized
    pendingEvents.push({
      category: EventCategories.USER,
      action: EventActions.VIEW,
      label: path,
      value: undefined,
      options: { pageTitle: title, ...options }
    });
    return;
  }
  
  // Google Analytics page view
  if (enabledServices.includes(AnalyticsServices.GOOGLE_ANALYTICS) && window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title,
      ...options
    });
  }
  
  // Google Tag Manager page view
  if (enabledServices.includes(AnalyticsServices.GOOGLE_TAG_MANAGER) && window.dataLayer) {
    window.dataLayer.push({
      event: 'page_view',
      page_path: path,
      page_title: title,
      ...options
    });
  }
  
  // Custom event handlers
  if (enabledServices.includes(AnalyticsServices.CUSTOM_EVENTS)) {
    customEventCallbacks.forEach(callback => {
      try {
        callback('page_view', {
          category: EventCategories.USER,
          action: EventActions.VIEW,
          page_path: path,
          page_title: title,
          ...options
        });
      } catch (e) {
        console.error('Error in custom event handler:', e);
      }
    });
  }
};

/**
 * Track an event.
 * @param {string} category - Event category
 * @param {string} action - Event action
 * @param {string} label - Event label
 * @param {number} value - Event value
 * @param {Object} options - Additional tracking options
 */
export const trackEvent = (category, action, label, value, options = {}) => {
  if (!isInitialized) {
    // Queue for later if not initialized
    pendingEvents.push({ category, action, label, value, options });
    return;
  }
  
  // Google Analytics event
  if (enabledServices.includes(AnalyticsServices.GOOGLE_ANALYTICS) && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      ...options
    });
  }
  
  // Google Tag Manager event
  if (enabledServices.includes(AnalyticsServices.GOOGLE_TAG_MANAGER) && window.dataLayer) {
    window.dataLayer.push({
      event: 'custom_event',
      event_category: category,
      event_action: action,
      event_label: label,
      event_value: value,
      ...options
    });
  }
  
  // Custom event handlers
  if (enabledServices.includes(AnalyticsServices.CUSTOM_EVENTS)) {
    customEventCallbacks.forEach(callback => {
      try {
        callback('custom_event', {
          category,
          action,
          label,
          value,
          ...options
        });
      } catch (e) {
        console.error('Error in custom event handler:', e);
      }
    });
  }
};

/**
 * Track user behavior.
 * @param {string} action - User action (login, register, etc.)
 * @param {string} userId - User ID, if available
 * @param {Object} properties - Additional user properties
 */
export const trackUser = (action, userId, properties = {}) => {
  trackEvent(
    EventCategories.USER,
    action,
    userId ? `user_${userId}` : 'anonymous',
    undefined,
    properties
  );
  
  // Set user ID for Google Analytics
  if (
    userId && 
    enabledServices.includes(AnalyticsServices.GOOGLE_ANALYTICS) && 
    window.gtag
  ) {
    window.gtag('set', { user_id: userId });
  }
};

/**
 * Track API request.
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method
 * @param {number} status - HTTP status code
 * @param {number} duration - Request duration in milliseconds
 */
export const trackApiRequest = (endpoint, method, status, duration) => {
  trackEvent(
    EventCategories.API,
    method,
    endpoint,
    duration,
    { status }
  );
  
  // Also track performance for API requests
  if (duration) {
    trackEvent(
      EventCategories.PERFORMANCE,
      EventActions.API_RESPONSE_TIME,
      endpoint,
      duration,
      { method, status }
    );
  }
};

/**
 * Track error.
 * @param {string} errorType - Type of error
 * @param {string} errorMessage - Error message
 * @param {Object} details - Additional error details
 */
export const trackError = (errorType, errorMessage, details = {}) => {
  trackEvent(
    EventCategories.ERROR,
    errorType,
    errorMessage,
    undefined,
    details
  );
};

/**
 * Track performance metric.
 * @param {string} metricName - Name of the metric
 * @param {number} value - Metric value
 * @param {Object} properties - Additional properties
 */
export const trackPerformance = (metricName, value, properties = {}) => {
  trackEvent(
    EventCategories.PERFORMANCE,
    metricName,
    properties.name || 'application',
    value,
    properties
  );
};

/**
 * Track feature usage.
 * @param {string} featureName - Name of the feature
 * @param {string} action - Action performed
 * @param {Object} properties - Additional properties
 */
export const trackFeature = (featureName, action, properties = {}) => {
  trackEvent(
    EventCategories.FEATURE,
    action,
    featureName,
    undefined,
    properties
  );
};

/**
 * Set user properties for analytics.
 * @param {Object} properties - User properties to set
 */
export const setUserProperties = (properties) => {
  if (!isInitialized) return;
  
  // Google Analytics user properties
  if (enabledServices.includes(AnalyticsServices.GOOGLE_ANALYTICS) && window.gtag) {
    window.gtag('set', 'user_properties', properties);
  }
  
  // Google Tag Manager user properties
  if (enabledServices.includes(AnalyticsServices.GOOGLE_TAG_MANAGER) && window.dataLayer) {
    window.dataLayer.push({
      event: 'set_user_properties',
      user_properties: properties
    });
  }
  
  // Custom event handlers
  if (enabledServices.includes(AnalyticsServices.CUSTOM_EVENTS)) {
    customEventCallbacks.forEach(callback => {
      try {
        callback('set_user_properties', properties);
      } catch (e) {
        console.error('Error in custom event handler:', e);
      }
    });
  }
};

/**
 * Integrates with Next.js Router to automatically track page views.
 * @param {Object} router - Next.js router instance
 */
export const initRouterTracking = (router) => {
  if (!router) return;
  
  // Track initial page load
  trackPageView(
    router.pathname,
    document.title,
    { isInitialPageLoad: true }
  );
  
  // Track route changes
  router.events.on('routeChangeComplete', (url) => {
    // Wait for React to update the document title
    setTimeout(() => {
      trackPageView(url, document.title);
    }, 0);
  });
};

/**
 * Opt out of analytics tracking.
 */
export const optOut = () => {
  // Google Analytics opt-out
  if (window.gtag) {
    window.gtag('config', publicConfig.googleAnalyticsId, {
      send_page_view: false,
      anonymize_ip: true
    });
    
    // Create opt-out cookie
    document.cookie = `ga-opt-out=true; max-age=${60*60*24*365*2}; path=/; SameSite=Strict`;
  }
  
  // Google Tag Manager opt-out (limited options)
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'opt_out'
    });
  }
  
  // Disable tracking going forward
  enabledServices = [];
  isInitialized = false;
};

/**
 * Check if a user has opted out of analytics tracking.
 * @returns {boolean} - True if the user has opted out
 */
export const hasOptedOut = () => {
  return document.cookie.indexOf('ga-opt-out=true') !== -1;
};

/**
 * Get the enabled analytics services.
 * @returns {Array<string>} - Array of enabled service identifiers
 */
export const getEnabledServices = () => {
  return [...enabledServices];
};

/**
 * Check if analytics is initialized.
 * @returns {boolean} - True if analytics is initialized
 */
export const isAnalyticsInitialized = () => {
  return isInitialized;
};

// Export a default object with all functions
export default {
  initAnalytics,
  trackPageView,
  trackEvent,
  trackUser,
  trackApiRequest,
  trackError,
  trackPerformance,
  trackFeature,
  setUserProperties,
  initRouterTracking,
  optOut,
  hasOptedOut,
  getEnabledServices,
  isAnalyticsInitialized,
  registerCustomEventHandler,
  // Constants
  AnalyticsServices,
  EventCategories,
  EventActions
};
