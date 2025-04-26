import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

// Create context for authentication data and functions
const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
  register: () => {},
  loading: false,
  error: null,
});

// Create provider component that makes auth data available to child components
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Check if we have a token on initial load
  useEffect(() => {
    const loadUserFromToken = async () => {
      try {
        // Get the token from local storage
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        // Configure axios to include the token in all requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Attempt to load user profile
        const response = await axios.get('/api/v1/auth/me');
        setUser(response.data);
      } catch (err) {
        console.error('Error loading user from token:', err);
        // On error, clear stored tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
      }
    };

    loadUserFromToken();
  }, []);

  // Register a new user
  const register = async (name, email, password, passwordConfirm) => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await axios.post('/api/v1/auth/register', {
        name,
        email,
        password,
        password_confirm: passwordConfirm,
      });
      
      // Store tokens
      const { access_token, refresh_token, user } = response.data;
      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      
      // Set user in state
      setUser(user);
      
      // Set default authorization header for subsequent requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.detail || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Log in a user
  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    
    try {
      // Convert username/password to form data for OAuth2 compatibility
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      
      const response = await axios.post('/api/v1/auth/login', formData);
      
      // Store tokens
      const { access_token, refresh_token, user } = response.data;
      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      
      // Set user in state
      setUser(user);
      
      // Set default authorization header for subsequent requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.detail || 'Login failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Log out a user
  const logout = async (redirectUrl = '/') => {
    try {
      // Call logout endpoint
      await axios.post('/api/v1/auth/logout');
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
      // Clear user state and stored tokens regardless of API call success
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      delete axios.defaults.headers.common['Authorization'];
      
      // Redirect to specified URL
      router.push(redirectUrl);
    }
  };

  // Refresh access token using refresh token
  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await axios.post('/api/v1/auth/refresh', {
        refresh_token: refreshToken,
      });
      
      const { access_token, refresh_token } = response.data;
      
      // Update stored tokens
      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      
      // Update authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      return true;
    } catch (err) {
      console.error('Error refreshing token:', err);
      // If refresh fails, log user out
      logout();
      return false;
    }
  };

  // Setup axios interceptor for token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        // If error is due to token expiration
        if (error.response?.status === 401 && 
            error.response?.data?.detail?.includes('token')) {
          // Try to refresh token
          const tokenRefreshed = await refreshToken();
          
          if (tokenRefreshed) {
            // Retry the original request
            const originalRequest = error.config;
            originalRequest.headers['Authorization'] = 
              `Bearer ${localStorage.getItem('accessToken')}`;
            return axios(originalRequest);
          }
        }
        
        return Promise.reject(error);
      }
    );
    
    // Cleanup interceptor on unmount
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  // Provide auth context value to children
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        login,
        logout,
        register,
        loading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
