/**
 * Authentication Service
 * Provides authentication-related functionality
 */

// Mock token for development purposes
const mockToken = 'mock-jwt-token';

/**
 * Get the auth token from localStorage or session
 */
export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || mockToken;
  }
  return mockToken;
};

/**
 * Get auth headers for API requests
 */
export const getAuthHeaders = () => {
  const token = getToken();
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Login user and store token
 */
export const login = async (credentials) => {
  // In a real app, this would call an API
  console.log('Mock login with credentials:', credentials);
  
  // Store mock token
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', mockToken);
  }
  
  return {
    user: { id: '1', email: 'user@example.com', name: 'Test User' },
    token: mockToken
  };
};

/**
 * Logout user and remove token
 */
export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
  }
};

export default {
  getToken,
  getAuthHeaders,
  isAuthenticated,
  login,
  logout
};
