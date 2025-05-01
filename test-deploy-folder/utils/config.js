/**
 * Configuration utilities for the application
 * This file provides configuration values that can be used throughout the frontend
 */

// Public configuration that can be exposed to the client
export const publicConfig = {
  // Application information
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Auto AGI Builder',
  
  // API endpoints
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  
  // Feature flags
  features: {
    requireAnalyticsConsent: true,
    enableDevicePreview: true,
    enableRoadmapVisualizer: true,
    enableROICalculator: true,
    enablePrototypeGenerator: true,
    enableDemoDataGenerator: true,
  },
  
  // Analytics
  analyticsId: process.env.NEXT_PUBLIC_ANALYTICS_ID || '',
  googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID || '',
  googleTagManagerId: process.env.NEXT_PUBLIC_GTM_ID || '',
  
  // Firebase configuration
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''
  },
  
  // Development settings
  debug: process.env.NODE_ENV === 'development'
};

// Default export for backward compatibility
export default {
  publicConfig
};
