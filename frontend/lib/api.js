import axios from 'axios';

/**
 * API client for making HTTP requests to the backend
 * Handles authentication, error handling, and request configuration
 */

// Determine the base URL based on environment
const baseURL = process.env.NEXT_PUBLIC_API_URL || 
                (process.env.NODE_ENV === 'production' 
                  ? 'https://api.autoagibuilder.com/api/v1'
                  : 'http://localhost:8000/api/v1');

// Create axios instance with default config
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Add auth token from localStorage if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error codes
    if (error.response) {
      const { status } = error.response;
      
      // Handle authentication errors
      if (status === 401) {
        // Clear token if it's invalid
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        
        // If we need to redirect to login page (but avoid redirect loops)
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
        if (currentPath !== '/auth/login' && currentPath !== '/' && typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }
      
      // Handle forbidden errors
      if (status === 403) {
        console.error('Access forbidden:', error.response.data);
      }
      
      // Handle not found errors
      if (status === 404) {
        console.error('Resource not found:', error.response.data);
      }
      
      // Handle server errors
      if (status >= 500) {
        console.error('Server error:', error.response.data);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network error - no response received:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

/**
 * Helper methods for different HTTP methods
 * These provide a more convenient API with automatic error handling
 */

// Generic request with error handling
const request = async (method, url, data = null, config = {}) => {
  try {
    const response = await api({
      method,
      url,
      data,
      ...config,
    });
    
    return response.data;
  } catch (error) {
    console.error(`${method} request error:`, error);
    throw error;
  }
};

// Convenience methods for different HTTP verbs
const apiClient = {
  // Base axios instance for advanced use cases
  instance: api,
  
  // GET request
  get: (url, config = {}) => request('get', url, null, config),
  
  // POST request
  post: (url, data = {}, config = {}) => request('post', url, data, config),
  
  // PUT request
  put: (url, data = {}, config = {}) => request('put', url, data, config),
  
  // PATCH request
  patch: (url, data = {}, config = {}) => request('patch', url, data, config),
  
  // DELETE request
  delete: (url, config = {}) => request('delete', url, null, config),
  
  // Upload file(s)
  upload: (url, formData, onProgress = null, config = {}) => {
    const uploadConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...config,
    };
    
    // Add progress tracker if provided
    if (onProgress) {
      uploadConfig.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      };
    }
    
    return request('post', url, formData, uploadConfig);
  },
  
  // Download file
  download: async (url, filename, config = {}) => {
    try {
      const response = await api({
        method: 'get',
        url,
        responseType: 'blob',
        ...config,
      });
      
      // Create blob link to download
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      
      // Start download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      return true;
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  },
};

export default apiClient;
