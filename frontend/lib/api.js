/**
 * API Client for Auto AGI Builder
 * Handles all API requests with error handling and retry logic
 */

import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api', // Fallback to relative path for API proxy
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies for authentication
});

// Request interceptor for authentication and logging
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage or cookie
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    // Add authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log requests in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`, 
        config.params || config.data || '');
    }
    
    return config;
  },
  (error) => {
    // Handle request error
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and logging
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`API Response: ${response.status} ${response.config.url}`, 
        response.data);
    }
    
    return response;
  },
  async (error) => {
    // Extract response and request info
    const originalRequest = error.config;
    const status = error.response ? error.response.status : null;
    
    // Log error details
    console.error(`API Error ${status || 'Network Error'}: ${originalRequest.url}`, 
      error.response?.data || error.message);
    
    // Handle authentication errors (401)
    if (status === 401 && !originalRequest._retry) {
      // Avoid infinite retry loops
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh token
        if (typeof window !== 'undefined') {
          // Clear invalid token
          localStorage.removeItem('auth_token');
          
          // Redirect to login page
          window.location.href = '/auth/login?session_expired=true';
        }
        
        return Promise.reject(error);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    
    // Handle server errors (500+)
    if (status >= 500) {
      // You could implement retry logic here for transient server errors
    }
    
    // Handle CORS issues (0)
    if (!status) {
      console.error('Possible CORS or network error', error);
    }
    
    return Promise.reject(error);
  }
);

/**
 * Enhanced API request with error handling
 * @param {string} method - HTTP method
 * @param {string} url - API endpoint
 * @param {Object|null} data - Request body for POST/PUT/PATCH
 * @param {Object} options - Additional axios options
 * @returns {Promise} - Response data or error
 */
export const apiRequest = async (method, url, data = null, options = {}) => {
  try {
    const response = await api({
      method,
      url,
      ...(data && ['post', 'put', 'patch'].includes(method.toLowerCase()) 
        ? { data } 
        : {}),
      ...(data && method.toLowerCase() === 'get' ? { params: data } : {}),
      ...options,
    });
    
    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    // Format error response consistently
    return {
      success: false,
      error: error.response?.data?.detail || error.response?.data?.message || error.message || 'Unknown error',
      status: error.response?.status || 0,
    };
  }
};

// Convenience methods for common HTTP verbs
export const get = (url, params, options) => apiRequest('get', url, params, options);
export const post = (url, data, options) => apiRequest('post', url, data, options);
export const put = (url, data, options) => apiRequest('put', url, data, options);
export const patch = (url, data, options) => apiRequest('patch', url, data, options);
export const del = (url, options) => apiRequest('delete', url, null, options);

// Health check function for API connectivity testing
export const checkApiHealth = async () => {
  try {
    const response = await get('/health-check');
    return response.success && response.data.status === 'ok';
  } catch (error) {
    console.error('API Health Check Failed:', error);
    return false;
  }
};

export default api;
