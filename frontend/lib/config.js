/**
 * Configuration module for Auto AGI Builder frontend.
 * 
 * This module provides access to environment variables and configuration settings
 * for the frontend application. It handles public and private environment variables,
 * feature flags, and environment-specific settings.
 * 
 * IMPORTANT: Never expose API keys or secrets through NEXT_PUBLIC_ variables!
 */

/**
 * Public configuration values that can be exposed to the browser.
 * These must be prefixed with NEXT_PUBLIC_ in the environment variables.
 */
export const publicConfig = {
  // Application information
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Auto AGI Builder',
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  
  // Environment information
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
  isDevelopment: process.env.NEXT_PUBLIC_ENVIRONMENT === 'development',
  isProduction: process.env.NEXT_PUBLIC_ENVIRONMENT === 'production',
  isStaging: process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging',
  
  // API configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  apiVersion: process.env.NEXT_PUBLIC_API_VERSION || 'v1',
  
  // Analytics IDs (these are not sensitive)
  googleAnalyticsId: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || '',
  googleTagManagerId: process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID || '',
  
  // Feature flags
  features: {
    enableCollaboration: process.env.NEXT_PUBLIC_ENABLE_COLLABORATION === 'true',
    enableDevicePreview: process.env.NEXT_PUBLIC_ENABLE_DEVICE_PREVIEW !== 'false',
    enableAIPrototypeGeneration: process.env.NEXT_PUBLIC_ENABLE_AI_PROTOTYPE !== 'false',
    enableRealTimeUpdates: process.env.NEXT_PUBLIC_ENABLE_REAL_TIME_UPDATES !== 'false',
    enableAdminDashboard: process.env.NEXT_PUBLIC_ENABLE_ADMIN_DASHBOARD === 'true',
    enableUserFeedback: process.env.NEXT_PUBLIC_ENABLE_USER_FEEDBACK !== 'false',
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== 'false',
  },
  
  // UI configuration
  ui: {
    theme: process.env.NEXT_PUBLIC_THEME || 'auto',
    colorMode: process.env.NEXT_PUBLIC_COLOR_MODE || 'light',
    defaultLanguage: process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || 'en',
    maxUploadSizeMB: parseInt(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE_MB || '10', 10),
    passwordMinLength: parseInt(process.env.NEXT_PUBLIC_PASSWORD_MIN_LENGTH || '8', 10),
  },
  
  // Storage URLs
  storageUrl: process.env.NEXT_PUBLIC_STORAGE_URL || '/storage',
  
  // Date and time
  defaultTimeZone: process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE || 'UTC',
  dateFormat: process.env.NEXT_PUBLIC_DATE_FORMAT || 'YYYY-MM-DD',
  timeFormat: process.env.NEXT_PUBLIC_TIME_FORMAT || 'HH:mm:ss',
  
  // Other configuration
  debug: process.env.NEXT_PUBLIC_DEBUG === 'true',
};

/**
 * Get the full API URL for a specific endpoint.
 * @param {string} endpoint - The API endpoint path without leading slash
 * @returns {string} - The complete API URL
 */
export function getApiUrl(endpoint) {
  const baseUrl = publicConfig.apiUrl.endsWith('/')
    ? publicConfig.apiUrl.slice(0, -1)
    : publicConfig.apiUrl;
  
  const versionPrefix = publicConfig.apiVersion
    ? `/${publicConfig.apiVersion}`
    : '';
  
  const endpointWithSlash = endpoint.startsWith('/')
    ? endpoint
    : `/${endpoint}`;
  
  return `${baseUrl}${versionPrefix}${endpointWithSlash}`;
}

/**
 * Check if a feature is enabled.
 * @param {string} featureName - The name of the feature to check
 * @returns {boolean} - Whether the feature is enabled
 */
export function isFeatureEnabled(featureName) {
  // Handle features not explicitly defined
  if (typeof publicConfig.features[featureName] === 'undefined') {
    // In development, be permissive with unknown features
    if (publicConfig.isDevelopment) {
      console.warn(`Feature flag not defined: ${featureName}`);
      return true;
    }
    // In production, be restrictive with unknown features
    return false;
  }
  
  return publicConfig.features[featureName];
}

/**
 * Get storage URL for a specific path.
 * @param {string} path - The storage path without leading slash
 * @returns {string} - The complete storage URL
 */
export function getStorageUrl(path) {
  const baseUrl = publicConfig.storageUrl.endsWith('/')
    ? publicConfig.storageUrl.slice(0, -1)
    : publicConfig.storageUrl;
  
  const pathWithSlash = path.startsWith('/')
    ? path
    : `/${path}`;
  
  return `${baseUrl}${pathWithSlash}`;
}

/**
 * Runtime configuration validation to ensure required environment variables are set.
 * This runs only in development to help catch configuration issues early.
 */
if (typeof window !== 'undefined' && publicConfig.isDevelopment) {
  const requiredEnvVars = [
    'NEXT_PUBLIC_API_URL',
  ];
  
  const missingEnvVars = requiredEnvVars.filter(
    varName => !process.env[varName]
  );
  
  if (missingEnvVars.length > 0) {
    console.error(
      'Missing required environment variables:\n' +
      missingEnvVars.map(name => `  - ${name}`).join('\n') +
      '\nCreate a .env.local file in the frontend directory with these variables.'
    );
  }
}

export default publicConfig;
