import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  
  // Check if the user is authenticated on page load
  useEffect(() => {
    // This would normally fetch the logged-in user from an API endpoint
    // For now we'll just simulate it
    setLoading(false);
  }, []);
  
  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      // This would normally make an API call to authenticate
      // Simulated login
      setUser({ email, name: 'User', role: 'admin' });
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = () => {
    setUser(null);
    router.push('/auth/login');
  };
  
  const value = {
    isAuthenticated: !!user,
    user,
    login,
    logout,
    loading,
    error
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}