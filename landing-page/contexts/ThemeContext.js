import { createContext, useContext, useState, useEffect } from 'react';
import { registerContextProvider } from '../lib/mcp';

// Create the context
const ThemeContext = createContext({
  isDarkMode: false,
  toggleTheme: () => {},
});

/**
 * Theme provider component
 */
export function ThemeProvider({ children }) {
  // Initialize dark mode based on system preference or localStorage
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for system preference or localStorage on mount
    const darkModePreference = 
      localStorage.getItem('theme') === 'dark' ||
      (localStorage.getItem('theme') === null && 
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setIsDarkMode(darkModePreference);
    
    // Apply theme to document
    if (darkModePreference) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Toggle dark mode
  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      
      // Save to localStorage
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      
      // Update document class
      if (newMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      return newMode;
    });
  };

  // Context value
  const value = {
    isDarkMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Custom hook to use theme context
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Register the theme provider with the MCP system
registerContextProvider({
  Provider: ThemeProvider,
  useContext: useTheme,
  options: {
    id: 'theme',
    priority: 10, // Higher priority (lower number) means it loads earlier
  },
});

// Export the context and hook
export default ThemeContext;
