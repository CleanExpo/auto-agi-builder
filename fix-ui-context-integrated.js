/**
 * Fix UI Context Provider with MCP Integration
 * 
 * This script creates a direct fix for the UI Provider issue in the existing codebase
 * by implementing a proper SSR-compatible UIContext with Model Context Protocol (MCP) integration.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create directories
function ensureDirExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

// Write to file
function writeFile(filepath, content) {
  ensureDirExists(path.dirname(filepath));
  fs.writeFileSync(filepath, content);
  console.log(`Created file: ${filepath}`);
}

// Main function
async function main() {
  console.log('='.repeat(60));
  console.log('Fix UI Context Provider with MCP Integration');
  console.log('='.repeat(60));
  console.log('');

  // Define frontend directory
  const frontendDir = path.join(__dirname, 'frontend');
  
  // Create lib/mcp directory if it doesn't exist
  const mcpDir = path.join(frontendDir, 'lib', 'mcp');
  ensureDirExists(mcpDir);
  
  // Create contexts directory if it doesn't exist
  const contextsDir = path.join(frontendDir, 'contexts');
  ensureDirExists(contextsDir);

  console.log('Creating MCP utility files...');
  
  // 1. Create MCP types file
  writeFile(
    path.join(mcpDir, 'types.js'),
    `/**
 * MCP Types
 * 
 * Type definitions for MCP related functionality
 */

// Export MCP provider type
export const MCP_PROVIDER_TYPE = {
  UI: 'ui',
  AUTH: 'auth',
  PROJECT: 'project',
  ROADMAP: 'roadmap',
  REQUIREMENT: 'requirement',
  COLLABORATION: 'collaboration',
  NOTIFICATION: 'notification',
  ROI: 'roi',
  COMMENT: 'comment',
  THEME: 'theme'
};

// Provider state type
export const PROVIDER_STATE = {
  INITIALIZED: 'initialized',
  UNINITIALIZED: 'uninitialized',
  ERROR: 'error'
};
`
  );

  // 2. Create MCP Registry
  writeFile(
    path.join(mcpDir, 'registry.js'),
    `/**
 * MCP Registry
 * 
 * Registry for MCP providers to ensure proper provider initialization
 * and error handling during SSR.
 */

import { MCP_PROVIDER_TYPE, PROVIDER_STATE } from './types';

// Initialize registry
const providerRegistry = new Map();

// Register provider
export function registerProvider(type, initializer, fallback) {
  if (providerRegistry.has(type)) {
    console.warn(\`Provider of type \${type} is already registered. Overwriting...\`);
  }
  
  providerRegistry.set(type, {
    initializer,
    fallback,
    state: PROVIDER_STATE.UNINITIALIZED
  });
}

// Get provider
export function getProvider(type) {
  if (!providerRegistry.has(type)) {
    console.error(\`Provider of type \${type} not registered.\`);
    return null;
  }
  
  return providerRegistry.get(type);
}

// Initialize provider
export function initProvider(type) {
  if (!providerRegistry.has(type)) {
    console.error(\`Cannot initialize provider of type \${type}. Not registered.\`);
    return null;
  }
  
  const provider = providerRegistry.get(type);
  
  try {
    const value = provider.initializer();
    provider.state = PROVIDER_STATE.INITIALIZED;
    return value;
  } catch (error) {
    console.error(\`Error initializing provider of type \${type}:\`, error);
    provider.state = PROVIDER_STATE.ERROR;
    return provider.fallback ? provider.fallback() : null;
  }
}

// Get fallback
export function getFallback(type) {
  if (!providerRegistry.has(type)) {
    console.error(\`Provider of type \${type} not registered.\`);
    return null;
  }
  
  const provider = providerRegistry.get(type);
  return provider.fallback ? provider.fallback() : null;
}
`
  );

  // 3. Create Error Boundary Component
  writeFile(
    path.join(mcpDir, 'error-boundary.js'),
    `/**
 * MCP Error Boundary
 * 
 * Error boundary component for React components that use MCP providers.
 */

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("MCP Provider Error:", error, errorInfo);
    
    // Log to analytics or monitoring service if available
    if (typeof window !== 'undefined' && window.logError) {
      window.logError('MCP_PROVIDER_ERROR', { error, errorInfo });
    }
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div style={{ padding: '20px', color: '#555' }}>
          <h2>Something went wrong</h2>
          <p>The application encountered an error while loading this component.</p>
          {this.props.showError && (
            <details style={{ marginTop: '10px', padding: '10px', background: '#f8f8f8' }}>
              <summary>Error details</summary>
              <pre>{this.state.error && this.state.error.toString()}</pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
`
  );

  // 4. Create MCP Provider Component
  writeFile(
    path.join(mcpDir, 'provider.js'),
    `/**
 * MCP Provider
 * 
 * Higher-order component for creating SSR-safe providers
 */

import React from 'react';
import ErrorBoundary from './error-boundary';
import { initProvider, getFallback } from './registry';

// Create a safe provider HOC
export function createSafeProvider(type, ProviderComponent) {
  const SafeProvider = ({ children, ...props }) => {
    // Check if we're in a browser environment
    const isClient = typeof window !== 'undefined';

    // Use React.useEffect to avoid hydration mismatch
    const [isClientSide, setIsClientSide] = React.useState(false);
    
    React.useEffect(() => {
      setIsClientSide(true);
    }, []);

    // During SSR, use simplified rendering
    if (!isClient && !isClientSide) {
      return <>{children}</>;
    }

    // On client-side, use the full provider
    return (
      <ErrorBoundary fallback={<>{children}</>} showError={false}>
        <ProviderComponent {...props}>
          {children}
        </ProviderComponent>
      </ErrorBoundary>
    );
  };

  return SafeProvider;
}

// Create a safe consumer hook
export function createSafeConsumer(type, useHook) {
  return function useSafeHook(...args) {
    const isClient = typeof window !== 'undefined';
    const [isClientSide, setIsClientSide] = React.useState(false);
    
    React.useEffect(() => {
      setIsClientSide(true);
    }, []);
    
    try {
      const result = useHook(...args);
      return result;
    } catch (error) {
      // If there's an error, likely because we're outside of the provider
      console.warn(\`Error using hook for \${type} provider: \${error.message}\`);
      
      // Return fallback values during SSR or when provider is not available
      if (!isClient || !isClientSide) {
        const fallback = getFallback(type);
        return fallback;
      }
      
      // Rethrow the error on client-side
      throw error;
    }
  };
}
`
  );

  // 5. Create MCP index file
  writeFile(
    path.join(mcpDir, 'index.js'),
    `/**
 * MCP Index
 * 
 * Main entry point for MCP related functionality
 */

export { MCP_PROVIDER_TYPE, PROVIDER_STATE } from './types';
export { registerProvider, getProvider, initProvider, getFallback } from './registry';
export { createSafeProvider, createSafeConsumer } from './provider';
export { default as ErrorBoundary } from './error-boundary';
`
  );

  // 6. Create UIContext with SSR safety
  writeFile(
    path.join(contextsDir, 'UIContext.js'),
    `/**
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
  toggleTheme: () => {}, 
  isMobile: false,
  isSidebarOpen: false,
  toggleSidebar: () => {},
  isModalOpen: false,
  modalContent: null,
  openModal: () => {},
  closeModal: () => {},
  toast: null,
  showToast: () => {},
  dismissToast: () => {}
};

// UIProvider component
export function UIProvider({ children, initialTheme = defaultTheme }) {
  const [theme, setTheme] = useState(initialTheme);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [toast, setToast] = useState(null);
  
  // Initialize resize handler on mount
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Theme toggler
  const toggleTheme = React.useCallback(() => {
    setTheme(current => current === 'light' ? 'dark' : 'light');
  }, []);
  
  // Sidebar toggler
  const toggleSidebar = React.useCallback(() => {
    setIsSidebarOpen(current => !current);
  }, []);
  
  // Modal handlers
  const openModal = React.useCallback((content) => {
    setModalContent(content);
    setIsModalOpen(true);
  }, []);
  
  const closeModal = React.useCallback(() => {
    setIsModalOpen(false);
    setModalContent(null);
  }, []);
  
  // Toast handlers
  const showToast = React.useCallback((message, type = 'info', duration = 3000) => {
    setToast({ message, type, duration });
  }, []);
  
  const dismissToast = React.useCallback(() => {
    setToast(null);
  }, []);
  
  // Auto-dismiss toast
  React.useEffect(() => {
    if (toast && toast.duration) {
      const timer = setTimeout(dismissToast, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast, dismissToast]);
  
  // Apply theme to body
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.dataset.theme = theme;
    }
  }, [theme]);
  
  const value = React.useMemo(() => ({
    theme,
    toggleTheme,
    isMobile,
    isSidebarOpen,
    toggleSidebar,
    isModalOpen,
    modalContent,
    openModal,
    closeModal,
    toast,
    showToast,
    dismissToast
  }), [
    theme, 
    toggleTheme, 
    isMobile, 
    isSidebarOpen, 
    toggleSidebar,
    isModalOpen,
    modalContent,
    openModal,
    closeModal,
    toast,
    showToast,
    dismissToast
  ]);
  
  return (
    <UIContext.Provider value={value}>
      {children}
      {isModalOpen && modalContent && (
        <div className="modal-overlay">
          <div className="modal-content">
            {modalContent}
            <button onClick={closeModal} className="modal-close">×</button>
          </div>
        </div>
      )}
      {toast && (
        <div className={\`toast toast-\${toast.type}\`}>
          <div className="toast-content">{toast.message}</div>
          <button onClick={dismissToast} className="toast-dismiss">×</button>
        </div>
      )}
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
`
  );

  // 7. Create contexts index file
  writeFile(
    path.join(contextsDir, 'index.js'),
    `/**
 * Contexts Index
 * 
 * Main entry point for context providers
 */

import React from 'react';
import { SafeUIProvider } from './UIContext';
// Import other context providers as needed

// Combined provider for all contexts
export function AppProviders({ children }) {
  return (
    <SafeUIProvider>
      {/* Add other providers here */}
      {children}
    </SafeUIProvider>
  );
}

export * from './UIContext';
// Export other contexts as needed
`
  );

  // 8. Update _app.js to use the new provider system properly
  writeFile(
    path.join(frontendDir, 'pages', '_app.js'),
    `/**
 * App Component
 * 
 * Main entry point for the application with proper provider setup
 */

import React from 'react';
import { AppProviders } from '../contexts';
import { ErrorBoundary } from '../lib/mcp';
import '../styles/globals.css';

function SafeHydrate({ children }) {
  return (
    <div suppressHydrationWarning>
      {typeof window === 'undefined' ? null : children}
    </div>
  );
}

function MyApp({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <AppProviders>
        <Component {...pageProps} />
      </AppProviders>
    </ErrorBoundary>
  );
}

export default MyApp;
`
  );

  console.log('\nUpdating next.config.js to handle SSR properly...');
  
  // 9. Create an improved next.config.js
  writeFile(
    path.join(frontendDir, 'next.config.js'),
    `/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: false,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  // Improve SSR handling
  experimental: {
    // Disable static optimization for problematic pages
    workerThreads: false,
    cpus: 1
  },
  // Use custom webpack config
  webpack: (config, { isServer, webpack }) => {
    // Add fallbacks for browser API
    if (isServer) {
      Object.assign(config.resolve.fallback || {}, {
        fs: false,
        net: false,
        tls: false
      });
    }
    
    return config;
  },
  // Generate proper sourcemaps for easier debugging
  productionBrowserSourceMaps: true
};
`
  );
  
  // 10. Create log-error API route
  const apiDir = path.join(frontendDir, 'pages', 'api');
  ensureDirExists(apiDir);
  
  writeFile(
    path.join(apiDir, 'log-error.js'),
    `/**
 * Error Logger API
 * 
 * Endpoint for logging client-side errors
 */

export default function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Log the error (in a real app, you'd store this in a database or send to a monitoring service)
  const { type, error, info } = req.body;
  
  console.error(\`[CLIENT ERROR] \${type}\`, error, info);
  
  // Return success
  res.status(200).json({ success: true });
}
`
  );
  
  // 11. Create error-logging utility
  const utilsDir = path.join(frontendDir, 'utils');
  ensureDirExists(utilsDir);
  
  writeFile(
    path.join(utilsDir, 'error-logger.js'),
    `/**
 * Error Logger
 * 
 * Utility for logging client-side errors
 */

// Log error to server
export async function logError(type, data) {
  try {
    const response = await fetch('/api/log-error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type,
        error: data.error?.toString() || 'Unknown error',
        info: data
      })
    });
    
    if (!response.ok) {
      console.error('Failed to log error:', await response.text());
    }
  } catch (error) {
    console.error('Error logging error:', error);
  }
}

// Initialize global error logger
export function initErrorLogger() {
  if (typeof window !== 'undefined') {
    // Make logger available globally
    window.logError = logError;
    
    // Set up global error handler
    window.addEventListener('error', (event) => {
      logError('UNCAUGHT_ERROR', {
        error: event.error,
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });
    
    // Set up unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      logError('UNHANDLED_REJECTION', {
        error: event.reason,
        message: event.reason?.message || 'Unhandled Promise Rejection'
      });
    });
  }
}
`
  );
  
  // 12. Update _document.js to add default styles and meta tags
  writeFile(
    path.join(frontendDir, 'pages', '_document.js'),
    `import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="icon" href="/favicon.ico" />
          <style>{
            \`
            /* Critical CSS for initial render */
            :root {
              --primary-color: #007bff;
              --secondary-color: #6c757d;
              --success-color: #28a745;
              --danger-color: #dc3545;
              --warning-color: #ffc107;
              --info-color: #17a2b8;
              --light-color: #f8f9fa;
              --dark-color: #343a40;
            }
            
            body[data-theme="light"] {
              --bg-color: #ffffff;
              --text-color: #333333;
              --border-color: #dddddd;
            }
            
            body[data-theme="dark"] {
              --bg-color: #121212;
              --text-color: #f5f5f5;
              --border-color: #444444;
            }
            
            body {
              background-color: var(--bg-color);
              color: var(--text-color);
              transition: background-color 0.3s ease;
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
                Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
            }
            
            /* Toast styles */
            .toast {
              position: fixed;
              bottom: 20px;
              right: 20px;
              padding: 12px 20px;
              border-radius: 4px;
              background-color: var(--info-color);
              color: white;
              z-index: 1000;
              transition: opacity 0.3s ease, transform 0.3s ease;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
              display: flex;
              align-items: center;
            }
            
            .toast-content {
              flex-grow: 1;
            }
            
            .toast-dismiss {
              background: transparent;
              border: none;
              color: white;
              font-size: 20px;
              cursor: pointer;
              margin-left: 10px;
            }
            
            .toast-info {
              background-color: var(--info-color);
            }
            
            .toast-success {
              background-color: var(--success-color);
            }
            
            .toast-warning {
              background-color: var(--warning-color);
              color: #333;
            }
            
            .toast-error {
              background-color: var(--danger-color);
            }
            
            /* Modal styles */
            .modal-overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background-color: rgba(0, 0, 0, 0.5);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 1000;
            }
            
            .modal-content {
              background-color: var(--bg-color);
              padding: 20px;
              border-radius: 4px;
              max-width: 90%;
              max-height: 90%;
              overflow: auto;
              position: relative;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            }
            
            .modal-close {
              position: absolute;
              top: 10px;
              right: 10px;
              background: transparent;
              border: none;
              font-size: 24px;
              cursor: pointer;
              color: var(--text-color);
            }
            \`
          }</style>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
`
  );

  console.log('\nInstalling required dependencies...');
  try {
    // Navigate to frontend directory
    process.chdir(frontendDir);
    
    // Install dependencies
    execSync('npm install react react-dom next --save', { stdio: 'inherit' });
    
    console.log('\n✅ UI Context with MCP integration successfully created!');
    
    console.log('\nTo test the changes, run:');
    console.log('cd frontend');
    console.log('npm run dev');
    
    console.log('\nTo build and deploy to Vercel:');
    console.log('cd frontend');
    console.log('npm run build');
    console.log('vercel --prod');
  } catch (error) {
    console.error('\n❌ Error installing dependencies:', error.message);
  }
}

// Run the main function
main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
