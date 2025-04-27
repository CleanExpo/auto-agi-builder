/**
 * UI Provider Fix
 * 
 * This script fixes the "useUI must be used within a UIProvider" error
 * that occurs during server-side rendering in Next.js.
 * 
 * The fix modifies the UIContext to provide default values when used outside a provider
 * during server-side rendering, which prevents the error from being thrown.
 */

const fs = require('fs');
const path = require('path');

console.log('Starting UI Provider Fix...');

// Path to the UIContext file
const uiContextPath = path.join(__dirname, 'deployment', 'frontend', 'contexts', 'UIContext.js');

// Check if the file exists
if (!fs.existsSync(uiContextPath)) {
  console.error(`Error: File not found at ${uiContextPath}`);
  process.exit(1);
}

// Read the current content
let content = fs.readFileSync(uiContextPath, 'utf8');

// Create the modified content with SSR compatibility
const modifiedContent = `import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

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

export default UIContext;`;

// Write the modified file
fs.writeFileSync(uiContextPath, modifiedContent);

console.log('Updated UIContext.js successfully with SSR compatibility');

// Now update the register-providers.js file to ensure UIProvider is properly configured for SSR
const registerProvidersPath = path.join(__dirname, 'deployment', 'frontend', 'contexts', 'register-providers.js');

if (fs.existsSync(registerProvidersPath)) {
  let registerContent = fs.readFileSync(registerProvidersPath, 'utf8');
  
  // Find the UIProvider registration and update its disableDuringSSR option
  const uiProviderRegex = /(registerContextProvider\(\{\s*Provider:\s*UIProvider,\s*useContext:\s*useUI,\s*options:\s*\{[^}]*disableDuringSSR:\s*)([^,}]*)([\s,}]*\}\);)/;
  
  if (uiProviderRegex.test(registerContent)) {
    // Ensure disableDuringSSR is set to false for UIProvider
    registerContent = registerContent.replace(uiProviderRegex, '$1false$3');
    fs.writeFileSync(registerProvidersPath, registerContent);
    console.log('Updated UIProvider registration in register-providers.js');
  } else {
    console.log('UIProvider registration not modified - pattern not found');
  }
}

// Also modify the next.config.js file to disable static optimization for pages that use UIContext
const nextConfigPath = path.join(__dirname, 'deployment', 'frontend', 'next.config.js');

if (fs.existsSync(nextConfigPath)) {
  let nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');
  
  // Add or modify the environment variable
  if (!nextConfigContent.includes('NEXT_PUBLIC_DISABLE_STATIC_GENERATION')) {
    // Add it to env if not present
    if (nextConfigContent.includes('module.exports')) {
      nextConfigContent = nextConfigContent.replace(
        /module\.exports\s*=\s*({[^}]*})/,
        'module.exports = {\n  env: {\n    NEXT_PUBLIC_DISABLE_STATIC_GENERATION: "true"\n  },\n  $1'
      );
      
      fs.writeFileSync(nextConfigPath, nextConfigContent);
      console.log('Added NEXT_PUBLIC_DISABLE_STATIC_GENERATION to next.config.js');
    }
  }
}

console.log('UI Provider Fix completed successfully.');
