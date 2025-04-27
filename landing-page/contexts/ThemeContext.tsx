import React, { createContext, useContext, useState, ReactNode } from 'react';
import { registerContextProvider } from '@/lib/mcp';

interface ThemeContextProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

// Create the context with default values
const ThemeContext = createContext<ThemeContextProps>({
  isDarkMode: false,
  toggleTheme: () => {}
});

// Custom hook to use the theme context
export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Provider component
export const ThemeProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle between light and dark mode
  const toggleTheme = () => {
    setIsDarkMode((prev: boolean) => !prev);
  };

  // Apply theme to document
  React.useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  const value = {
    isDarkMode,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Register provider with MCP system
registerContextProvider({
  Provider: ThemeProvider,
  useContext: useTheme,
  options: {
    id: 'theme',
    priority: 10, // High priority as other components may depend on theme
  },
});
