/**
 * Analytics utility functions for the Auto AGI Builder application
 * Provides tracking for pageviews, events, and user interactions
 * Respects user consent settings from local storage
 */

// Check if analytics are enabled by user consent
const isAnalyticsEnabled = () => {
  // Only check localStorage if it exists (won't be available on server)
  if (typeof window !== 'undefined') {
    return localStorage.getItem('analytics-consent') === 'true';
  }
  return false;
};

// Track a page view event
export const trackPageView = (page) => {
  if (!isAnalyticsEnabled()) {
    return;
  }
  
  try {
    // Google Analytics tracking (if configured)
    if (window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        page_path: page,
      });
    }
    
    // Segment tracking (if configured)
    if (window.analytics) {
      window.analytics.page(page);
    }
  } catch (error) {
    console.error('Analytics error:', error);
  }
};

// Track a custom event
export const trackEvent = (eventName, properties = {}) => {
  if (!isAnalyticsEnabled()) {
    return;
  }
  
  try {
    // Google Analytics event tracking
    if (window.gtag) {
      window.gtag('event', eventName, properties);
    }
    
    // Segment event tracking
    if (window.analytics) {
      window.analytics.track(eventName, properties);
    }
  } catch (error) {
    console.error('Analytics event error:', error);
  }
};

// Track a user identification
export const identifyUser = (userId, traits = {}) => {
  if (!isAnalyticsEnabled() || !userId) {
    return;
  }
  
  try {
    // Google Analytics user ID tracking
    if (window.gtag) {
      window.gtag('set', 'user_id', userId);
      window.gtag('set', 'user_properties', traits);
    }
    
    // Segment identify tracking
    if (window.analytics) {
      window.analytics.identify(userId, traits);
    }
  } catch (error) {
    console.error('Analytics identify error:', error);
  }
};

// Special project events
export const projectEvents = {
  created: (projectId, projectDetails) => {
    trackEvent('project_created', {
      project_id: projectId,
      project_type: projectDetails.type,
      has_description: !!projectDetails.description
    });
  },
  
  updated: (projectId, changedFields) => {
    trackEvent('project_updated', {
      project_id: projectId,
      updated_fields: changedFields.join(',')
    });
  },
  
  deleted: (projectId) => {
    trackEvent('project_deleted', { project_id: projectId });
  },
  
  shared: (projectId, sharingMethod) => {
    trackEvent('project_shared', {
      project_id: projectId,
      sharing_method: sharingMethod
    });
  }
};

// Feature usage events
export const featureEvents = {
  requirementAnalysis: {
    started: (projectId) => trackEvent('requirement_analysis_started', { project_id: projectId }),
    completed: (projectId, requirementCount) => trackEvent('requirement_analysis_completed', { 
      project_id: projectId,
      requirement_count: requirementCount
    })
  },
  
  prototypeGeneration: {
    started: (projectId) => trackEvent('prototype_generation_started', { project_id: projectId }),
    completed: (projectId, success) => trackEvent('prototype_generation_completed', {
      project_id: projectId,
      success: success
    })
  },
  
  roi: {
    calculated: (projectId, metrics) => trackEvent('roi_calculated', {
      project_id: projectId,
      estimated_savings: metrics.estimatedSavings,
      time_saved: metrics.timeSaved
    })
  },
  
  devicePreview: {
    used: (projectId, deviceType) => trackEvent('device_preview_used', {
      project_id: projectId,
      device_type: deviceType
    })
  }
};

// Performance metrics tracking
export const trackPagePerformance = () => {
  if (!isAnalyticsEnabled() || typeof window === 'undefined') {
    return;
  }
  
  try {
    // Wait for page to finish loading
    window.addEventListener('load', () => {
      // Delay to ensure metrics are available
      setTimeout(() => {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        const domReadyTime = perfData.domComplete - perfData.domLoading;
        
        trackEvent('page_performance', {
          page_load_ms: pageLoadTime,
          dom_ready_ms: domReadyTime,
          path: window.location.pathname
        });
      }, 0);
    });
  } catch (error) {
    console.error('Performance tracking error:', error);
  }
};

// Initialize analytics based on user consent
export const initAnalytics = () => {
  if (typeof window === 'undefined') {
    return;
  }
  
  // Expose the function globally for the consent component to use
  window.initAnalytics = () => {
    // Load Google Analytics if configured
    if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      // Load Google Analytics script
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`;
      script.async = true;
      document.head.appendChild(script);
      
      // Initialize the gtag
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        anonymize_ip: true,
        send_page_view: false // We'll handle page views manually
      });
    }
    
    // Initialize Segment if configured
    if (process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY) {
      // Load Segment script (simplified version)
      const segmentScript = document.createElement('script');
      segmentScript.textContent = `
        !function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware"];analytics.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);t.unshift(e);analytics.push(t);return analytics}};for(var e=0;e<analytics.methods.length;e++){var key=analytics.methods[e];analytics[key]=analytics.factory(key)}analytics.load=function(key,e){var t=document.createElement("script");t.type="text/javascript";t.async=!0;t.src="https://cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n);analytics._loadOptions=e};analytics._writeKey="${process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY}";analytics.SNIPPET_VERSION="4.15.3";
        analytics.load("${process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY}");
        }}();
      `;
      document.head.appendChild(segmentScript);
    }
    
    // Set up performance tracking
    trackPagePerformance();
    
    // Track current page
    trackPageView(window.location.pathname);
  };
  
  // If user has already consented, initialize analytics
  if (isAnalyticsEnabled()) {
    window.initAnalytics();
  }
};

// Export default object
export default {
  trackPageView,
  trackEvent,
  identifyUser,
  projectEvents,
  featureEvents,
  isAnalyticsEnabled,
  initAnalytics
};
