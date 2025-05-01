import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

// Default context values for SSR compatibility
const defaultContextValue = {
  isDarkMode: false,
  toggleDarkMode: () => {},
  isMenuOpen: false,
  toggleMenu: () => {},
  closeMenu: () => {},
  isMobileView: false
};

// Create context with default value for SSR compatibility
const UIContext = createContext(defaultContextValue);

export function UIProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const initialized = useRef(false);

  // Check for dark mode preference on client side only
  useEffect(() => {
    // Only run this effect on the client side
    if (typeof window === 'undefined') return;
    
    try {
      // Check local storage first
      const savedDarkMode = localStorage.getItem('darkMode');
      if (savedDarkMode !== null) {
        setIsDarkMode(JSON.parse(savedDarkMode));
      } else {
        // Then check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(prefersDark);
      }
      
      // Check for mobile view
      const checkMobileView = () => {
        setIsMobileView(window.innerWidth < 768);
      };
      
      checkMobileView();
      window.addEventListener('resize', checkMobileView);
      
      // Mark as initialized
      initialized.current = true;
      
      return () => {
        window.removeEventListener('resize', checkMobileView);
      };
    } catch (error) {
      console.error('Error initializing UI context:', error);
      // Continue with defaults
    }
  }, []);

  // Apply dark mode changes to document (client-side only)
  useEffect(() => {
    if (typeof document === 'undefined' || !initialized.current) return;
    
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Save to localStorage (client-side only)
      if (typeof window !== 'undefined') {
        localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
      }
    } catch (error) {
      console.error('Error applying dark mode:', error);
    }
  }, [isDarkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  // Close mobile menu
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const value = {
    isDarkMode,
    toggleDarkMode,
    isMenuOpen,
    toggleMenu,
    closeMenu,
    isMobileView
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const context = useContext(UIContext);
  
  // Return context even if undefined (SSR compatibility)
  // This prevents the error during server-side rendering
  return context;
}

// Separate hook for theme-specific functionality
export function useTheme() {
  const { isDarkMode, toggleDarkMode } = useUI();
  
  return { isDarkMode, toggleDarkMode };
}

export default UIContext;