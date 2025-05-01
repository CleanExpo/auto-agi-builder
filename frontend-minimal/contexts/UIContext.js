/**
 * UIContext
 * 
 * Context provider for UI state with SSR safety
 */

import React, { createContext, useState, useContext } from 'react';
import { MCP_PROVIDER_TYPE, registerProvider, createSafeProvider, createSafeConsumer } from '../lib/mcp';

// Create context
const UIContext = createContext(null);

// Default theme values
const defaultTheme = 'light';
const defaultState = {
  theme: defaultTheme, 
  toggleTheme: () => {}
};

// UIProvider component
export function UIProvider({ children }) {
  const [theme, setTheme] = useState(defaultTheme);
  
  // Theme toggler
  const toggleTheme = React.useCallback(() => {
    setTheme(current => current === 'light' ? 'dark' : 'light');
  }, []);
  
  const value = React.useMemo(() => ({
    theme,
    toggleTheme
  }), [theme, toggleTheme]);
  
  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
}

// Base useUI hook
export function useUIBase() {
  const context = useContext(UIContext);
  
  if (context === null) {
    throw new Error('useUI must be used within a UIProvider');
  }
  
  return context;
}

// Register with MCP registry
registerProvider(
  MCP_PROVIDER_TYPE.UI,
  () => defaultState,
  () => defaultState
);

// Create safe versions
export const SafeUIProvider = createSafeProvider(MCP_PROVIDER_TYPE.UI, UIProvider);
export const useUI = createSafeConsumer(MCP_PROVIDER_TYPE.UI, useUIBase);

export default UIContext;
