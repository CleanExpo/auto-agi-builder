import React, { createContext, useContext, useState, useCallback } from 'react';

// Create context
const UIContext = createContext();

/**
 * Provider component for UI-related state
 * Manages modals, notifications, theme, and other UI elements
 */
export const UIProvider = ({ children }) => {
  // Modal state
  const [modal, setModal] = useState({
    open: false,
    type: null,
    data: null,
  });

  // Notifications/toast state
  const [notifications, setNotifications] = useState([]);

  // Theme state (light/dark)
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Loading state for global loading indicators
  const [isLoading, setIsLoading] = useState(false);

  // Modal actions
  const openModal = useCallback((type, data = {}) => {
    setModal({
      open: true,
      type,
      data,
    });
  }, []);

  const closeModal = useCallback(() => {
    setModal({
      open: false,
      type: null,
      data: null,
    });
  }, []);

  // Notification/toast actions
  const addNotification = useCallback((notification) => {
    const id = Date.now();
    
    // Add new notification
    setNotifications((prev) => [
      ...prev,
      {
        id,
        duration: 5000, // Default duration of 5 seconds
        ...notification,
      },
    ]);

    // Auto-remove notification after its duration
    setTimeout(() => {
      removeNotification(id);
    }, notification.duration || 5000);

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  // Toast convenience methods
  const toast = {
    success: (message, options = {}) =>
      addNotification({ type: 'success', message, ...options }),
    error: (message, options = {}) =>
      addNotification({ type: 'error', message, ...options }),
    warning: (message, options = {}) =>
      addNotification({ type: 'warning', message, ...options }),
    info: (message, options = {}) =>
      addNotification({ type: 'info', message, ...options }),
  };

  // Theme toggle
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
    
    // Update document class for theme
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  }, [isDarkMode]);

  // Initialize theme from localStorage on client-side
  React.useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window !== 'undefined') {
      // Check local storage for theme preference
      const storedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Set initial theme based on local storage or system preference
      if ((storedTheme === 'dark') || (!storedTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
        setIsDarkMode(true);
      } else {
        document.documentElement.classList.remove('dark');
        setIsDarkMode(false);
      }
    }
  }, []);

  // Global loading indicator
  const showLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  // Context value
  const value = {
    // Modal
    modal,
    openModal,
    closeModal,
    
    // Notifications
    notifications,
    addNotification,
    removeNotification,
    toast,
    
    // Theme
    isDarkMode,
    toggleDarkMode,
    
    // Loading
    isLoading,
    showLoading,
    hideLoading,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

// Custom hook to use the UI context
export const useUI = () => {
  const context = useContext(UIContext);
  
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  
  return context;
};

export default UIContext;
