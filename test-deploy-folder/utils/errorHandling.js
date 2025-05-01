import { captureException } from '@sentry/browser';

/**
 * Global error handling utility
 * Provides consistent error handling throughout the application
 */

/**
 * Process API error responses
 * @param {Error} error - Error object, typically from a catch block
 * @param {Function} showNotification - Function to display UI notification (from useUI context)
 * @param {Object} options - Additional options
 * @param {boolean} options.log - Whether to log to console
 * @param {boolean} options.report - Whether to report to error tracking service
 * @param {string} options.defaultMessage - Default message if none can be extracted from error
 * @returns {Object} Processed error information
 */
export const handleApiError = (
  error, 
  showNotification = null, 
  options = { log: true, report: true, defaultMessage: 'An unexpected error occurred' }
) => {
  const { log, report, defaultMessage } = options;
  
  // Extract relevant error information
  let status, message, data, errorCode;
  
  // Handle axios/fetch error responses
  if (error.response) {
    // Server responded with an error status
    status = error.response.status;
    data = error.response.data;
    
    // Try to extract message from different response formats
    if (typeof data === 'string') {
      message = data;
    } else if (data?.message) {
      message = data.message;
    } else if (data?.error) {
      message = typeof data.error === 'string' ? data.error : data.error.message || JSON.stringify(data.error);
    } else if (data?.detail) {
      message = data.detail;
    } else {
      message = `Server error: ${status}`;
    }
    
    // Extract error code if available
    errorCode = data?.code || `HTTP_${status}`;
  } else if (error.request) {
    // Request was made but no response received (network error)
    status = 0;
    message = 'Network error. Please check your connection and try again.';
    errorCode = 'NETWORK_ERROR';
  } else if (error.message) {
    // Something else went wrong
    message = error.message;
    errorCode = error.code || 'UNKNOWN_ERROR';
  } else {
    // Fallback for unknown error format
    message = defaultMessage;
    errorCode = 'UNKNOWN_ERROR';
  }
  
  // Create standardized error object
  const processedError = {
    status,
    message,
    errorCode,
    timestamp: new Date().toISOString(),
    original: error,
    data
  };
  
  // Console logging if enabled
  if (log) {
    console.error('[API Error]', processedError);
  }
  
  // Error reporting if enabled
  if (report) {
    try {
      captureException(error, {
        extra: {
          status,
          errorCode,
          data
        }
      });
    } catch (reportingError) {
      // Silently fail if error reporting fails
      console.warn('Failed to report error:', reportingError);
    }
  }
  
  // Show UI notification if function provided
  if (showNotification) {
    const statusText = getStatusMessage(status);
    
    showNotification({
      title: statusText || 'Error',
      message: message || defaultMessage,
      type: 'error',
      duration: status >= 500 ? 8000 : 5000, // Show server errors longer
    });
  }
  
  return processedError;
};

/**
 * Get user-friendly status message based on HTTP status code
 * @param {number} status - HTTP status code
 * @returns {string} User-friendly status message
 */
export const getStatusMessage = (status) => {
  switch (status) {
    case 400:
      return 'Invalid Request';
    case 401:
      return 'Authentication Required';
    case 403:
      return 'Access Denied';
    case 404:
      return 'Not Found';
    case 409:
      return 'Conflict';
    case 422:
      return 'Validation Error';
    case 429:
      return 'Too Many Requests';
    case 500:
      return 'Server Error';
    case 502:
      return 'Bad Gateway';
    case 503:
      return 'Service Unavailable';
    case 504:
      return 'Gateway Timeout';
    case 0:
      return 'Network Error';
    default:
      return status >= 500 ? 'Server Error' : 'Request Error';
  }
};

/**
 * Format validation errors for form display
 * @param {Object} errorData - Error data from API response
 * @returns {Object} Formatted validation errors by field
 */
export const formatValidationErrors = (errorData) => {
  // Handle different validation error formats
  
  // Format 1: { field1: ['error1', 'error2'], field2: ['error1'] }
  if (errorData && typeof errorData === 'object') {
    // Check if it's already in the right format
    if (Object.values(errorData).some(val => Array.isArray(val))) {
      return errorData;
    }
    
    // Format 2: { errors: [{ field: 'field1', message: 'error1' }, ...] }
    if (errorData.errors && Array.isArray(errorData.errors)) {
      return errorData.errors.reduce((acc, error) => {
        if (error.field) {
          if (!acc[error.field]) {
            acc[error.field] = [];
          }
          acc[error.field].push(error.message || 'Invalid value');
        }
        return acc;
      }, {});
    }
    
    // Format 3: { detail: [{ loc: ['body', 'field1'], msg: 'error1' }, ...] }
    if (errorData.detail && Array.isArray(errorData.detail)) {
      return errorData.detail.reduce((acc, error) => {
        if (error.loc && error.loc.length > 1) {
          const field = error.loc[error.loc.length - 1];
          if (!acc[field]) {
            acc[field] = [];
          }
          acc[field].push(error.msg || 'Invalid value');
        }
        return acc;
      }, {});
    }
  }
  
  // Default: return empty object if no valid format found
  return {};
};

/**
 * Safely parse JSON string with error handling
 * @param {string} jsonString - JSON string to parse
 * @param {*} fallback - Fallback value if parsing fails
 * @returns {*} Parsed JSON or fallback value
 */
export const safeJsonParse = (jsonString, fallback = {}) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Failed to parse JSON:', error);
    return fallback;
  }
};

/**
 * Handle unexpected errors in components
 * @param {Error} error - Error object
 * @param {Object} info - React error info
 * @param {Function} showNotification - Function to display UI notification
 */
export const handleComponentError = (error, info, showNotification = null) => {
  console.error('[Component Error]', error, info);
  
  // Report to error tracking service
  try {
    captureException(error, {
      extra: {
        componentStack: info?.componentStack,
      }
    });
  } catch (reportingError) {
    // Silently fail if error reporting fails
    console.warn('Failed to report component error:', reportingError);
  }
  
  // Show UI notification if function provided
  if (showNotification) {
    showNotification({
      title: 'Application Error',
      message: 'An unexpected error occurred in the application. Please try refreshing the page.',
      type: 'error',
      duration: 8000,
    });
  }
};
