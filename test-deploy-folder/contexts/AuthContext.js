import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import api from '../lib/api';
import { useUI } from './UIContext';

// Create context
const AuthContext = createContext();

/**
 * Provider component for authentication
 * Manages user authentication state and related functions
 */
export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const { toast } = useUI();
  
  // User state
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  
  // Function to sign in a user
  const signIn = useCallback(async (email, password) => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      const response = await api.post('/auth/login', { 
        email, 
        password,
      });
      
      const { user, token } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('auth_token', token);
      
      // Update auth state
      setUser(user);
      setIsAuthenticated(true);
      
      // Notify success
      toast.success('Successfully signed in');
      
      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to sign in. Please check your credentials.';
      setAuthError(errorMessage);
      toast.error(errorMessage);
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  // Function to sign up a new user
  const signUp = useCallback(async (userData) => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      const response = await api.post('/auth/register', userData);
      
      const { user, token } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('auth_token', token);
      
      // Update auth state
      setUser(user);
      setIsAuthenticated(true);
      
      // Notify success
      toast.success('Account created successfully');
      
      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create account. Please try again.';
      setAuthError(errorMessage);
      toast.error(errorMessage);
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  // Function to sign out the user
  const signOut = useCallback(async () => {
    try {
      // Call logout API if needed
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Error during logout:', error);
    }
    
    // Clear local storage
    localStorage.removeItem('auth_token');
    
    // Reset auth state
    setUser(null);
    setIsAuthenticated(false);
    
    // Redirect to home page
    router.push('/');
    
    // Notify success
    toast.info('You have been signed out');
  }, [router, toast]);
  
  // Check for existing token and validate on initial load
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Validate token and get user info
        const response = await api.get('/auth/me');
        
        setUser(response.data.user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth validation error:', error);
        
        // Clear invalid token
        localStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Function to update user profile
  const updateProfile = useCallback(async (profileData) => {
    setIsLoading(true);
    
    try {
      const response = await api.put('/auth/profile', profileData);
      
      // Update user state with new data
      setUser((prev) => ({
        ...prev,
        ...response.data.user,
      }));
      
      // Notify success
      toast.success('Profile updated successfully');
      
      return { success: true, user: response.data.user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      toast.error(errorMessage);
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  // Function to change password
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    setIsLoading(true);
    
    try {
      await api.put('/auth/password', {
        currentPassword,
        newPassword,
      });
      
      // Notify success
      toast.success('Password changed successfully');
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      toast.error(errorMessage);
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  // Function to request password reset
  const requestPasswordReset = useCallback(async (email) => {
    setIsLoading(true);
    
    try {
      await api.post('/auth/password-reset-request', { email });
      
      // Notify success
      toast.success('Password reset email sent');
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to request password reset';
      toast.error(errorMessage);
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  // Function to reset password with token
  const resetPassword = useCallback(async (token, newPassword) => {
    setIsLoading(true);
    
    try {
      await api.post('/auth/password-reset', {
        token,
        newPassword,
      });
      
      // Notify success
      toast.success('Password reset successfully. Please sign in with your new password.');
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to reset password';
      toast.error(errorMessage);
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  // Context value
  const value = {
    user,
    isAuthenticated,
    isLoading,
    authError,
    signIn,
    signUp,
    signOut,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
