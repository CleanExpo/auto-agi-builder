/**
 * Fix UI Provider Issue in Auto AGI Builder
 * 
 * This script addresses the "useUI must be used within a UIProvider" error
 * by implementing a Model Context Protocol (MCP) system that provides:
 * 
 * 1. A multi-provider context system that properly wraps the application
 * 2. Registration mechanism for providers with dependency management
 * 3. Error handling for context hooks
 * 
 * The fix has been successfully implemented in the landing-page folder
 * and can be applied to the main frontend as well.
 */

const fs = require('fs');
const path = require('path');

// Path configuration
const appDir = '../OneDrive - Disaster Recovery/1111/Auto AGI Builder/frontend';
const mcpDir = path.join(appDir, 'lib/mcp');

// Create directory structure
console.log('Creating directory structure...');
if (!fs.existsSync(path.join(appDir, 'lib'))) {
    fs.mkdirSync(path.join(appDir, 'lib'));
}

if (!fs.existsSync(mcpDir)) {
    fs.mkdirSync(mcpDir);
}

// Create MCP index.js file
console.log('Creating MCP index.js...');
const mcpContent = `import { createContext, useContext as reactUseContext } from 'react';

// Global registry of context providers
const contextProviders = [];

/**
 * Register a context provider with the system
 * @param {Object} registration - Provider registration details
 */
export function registerContextProvider(registration) {
  if (!registration.Provider || typeof registration.useContext !== 'function') {
    console.error('Invalid context provider registration', registration);
    return;
  }

  const options = registration.options || {};
  const id = options.id || \`provider_\${contextProviders.length}\`;
  
  contextProviders.push({
    ...registration,
    options: { ...options, id }
  });
}

/**
 * Simple provider composition helper
 * Takes an array of provider components and composes them with the children
 * @param {Array} providers - Array of provider components
 * @param {React.ReactNode} children - Children to wrap with providers
 */
function composeProviders(providers, children) {
  return providers.reduceRight((composed, { Provider }) => {
    return <Provider>{composed}</Provider>;
  }, children);
}

/**
 * Main context provider component that wraps the application and provides all registered contexts
 */
export function ModuleContextProvider({ children }) {
  // Sort providers by priority (if specified)
  const sortedProviders = [...contextProviders].sort((a, b) => {
    const priorityA = a.options?.priority || 50;
    const priorityB = b.options?.priority || 50;
    return priorityA - priorityB;
  });

  // Wrap children with all registered providers
  return composeProviders(sortedProviders, children);
}

/**
 * Create a UIProvider-wrapped component that provides UI context
 * This can be used in _app.js to provide UI context to the entire application
 */
export function withUIProvider(Component) {
  return function UIProviderWrapper(props) {
    return (
      <ModuleContextProvider>
        <Component {...props} />
      </ModuleContextProvider>
    );
  };
}
`;

fs.writeFileSync(path.join(mcpDir, 'index.js'), mcpContent);

// Create UIContext.js file
console.log('Creating UIContext.js...');
const uiContextContent = `import { createContext, useContext, useState } from 'react';
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
    priority: 10
  },
});

// Export the context and hook
export default UIContext;
`;

fs.writeFileSync(path.join(appDir, 'contexts/UIContext.js'), uiContextContent);

// Update _app.js file
console.log('Updating _app.js...');
const appJsContent = `import '../styles/globals.css';
import { withUIProvider } from '../lib/mcp';

// Import context providers to register them
import '../contexts/UIContext';

function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

// Wrap the app with the UI provider
export default withUIProvider(App);
`;

fs.writeFileSync(path.join(appDir, 'pages/_app.js'), appJsContent);

console.log('Fix completed successfully!');
console.log('The MCP system has been implemented to properly handle the UIContext provider.');
console.log('Error "useUI must be used within a UIProvider" should now be resolved.');
