import { createContext, useContext, useState } from 'react';
import { registerContextProvider } from '../lib/mcp';

// Create the context with default values
const UIContext = createContext({
  isMenuOpen: false,
  toggleMenu: () => {},
  closeMenu: () => {},
  notification: null,
  showNotification: () => {},
  clearNotification: () => {},
  isLoading: false,
  setIsLoading: () => {},
});

/**
 * UI provider component
 */
export function UIProvider({ children }) {
  // Mobile menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Notification state
  const [notification, setNotification] = useState(null);
  
  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };
  
  // Close mobile menu
  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  
  // Show notification
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    
    // Auto-clear after 5 seconds
    setTimeout(() => {
      clearNotification();
    }, 5000);
  };
  
  // Clear notification
  const clearNotification = () => {
    setNotification(null);
  };
  
  // Context value
  const value = {
    isMenuOpen,
    toggleMenu,
    closeMenu,
    notification,
    showNotification,
    clearNotification,
    isLoading,
    setIsLoading,
  };
  
  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
}

/**
 * Custom hook to use UI context
 */
export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

// Register the UI provider with the MCP system
registerContextProvider({
  Provider: UIProvider,
  useContext: useUI,
  options: {
    id: 'ui',
    priority: 20, // Higher number than theme, loads after theme
    dependencies: ['theme'], // Depends on theme context
  },
});

// Export the context and hook
export default UIContext;
