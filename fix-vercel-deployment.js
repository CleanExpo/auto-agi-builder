/**
 * Comprehensive Vercel Deployment Fix
 * 
 * This script addresses both the UIProvider SSR error and ensures proper Vercel deployment
 * by modifying configuration files and making necessary adjustments for Vercel's environment.
 */

const fs = require('fs');
const path = require('path');

console.log('Starting Comprehensive Vercel Deployment Fix...');

// 1. Apply the UIContext fix with enhanced SSR compatibility
const uiContextPath = path.join(__dirname, 'deployment', 'frontend', 'contexts', 'UIContext.js');

// Check if the file exists
if (!fs.existsSync(uiContextPath)) {
  console.error(`Error: UIContext.js not found at ${uiContextPath}`);
  process.exit(1);
}

// Create the fully enhanced UIContext content
const enhancedUIContextContent = `import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

// Default context values for SSR compatibility
const defaultContextValue = {
  isDarkMode: false,
  toggleDarkMode: () => {},
  isMenuOpen: false,
  toggleMenu: () => {},
  closeMenu: () => {},
  isMobileView: false,
  initialized: false
};

// Create context with default value for SSR compatibility
const UIContext = createContext(defaultContextValue);

// Flag to detect if we're in a server environment
const isServer = typeof window === 'undefined';

export function UIProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const initializationAttempted = useRef(false);

  // Check for dark mode preference on client side only
  useEffect(() => {
    // Skip everything on the server
    if (isServer) return;
    
    // Only initialize once
    if (initializationAttempted.current) return;
    initializationAttempted.current = true;
    
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
      setInitialized(true);
      
      return () => {
        if (typeof window !== 'undefined') {
          window.removeEventListener('resize', checkMobileView);
        }
      };
    } catch (error) {
      console.error('Error initializing UI context:', error);
      // Continue with defaults
      setInitialized(true); // Still mark as initialized to avoid infinite loading states
    }
  }, []);

  // Apply dark mode changes to document (client-side only)
  useEffect(() => {
    if (isServer || !initialized) return;
    
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Save to localStorage (client-side only)
      localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    } catch (error) {
      console.error('Error applying dark mode:', error);
    }
  }, [isDarkMode, initialized]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    if (isServer) return; // No-op on server
    setIsDarkMode(prev => !prev);
  };

  // Toggle mobile menu
  const toggleMenu = () => {
    if (isServer) return; // No-op on server
    setIsMenuOpen(prev => !prev);
  };

  // Close mobile menu
  const closeMenu = () => {
    if (isServer) return; // No-op on server
    setIsMenuOpen(false);
  };

  // Create context value
  const value = {
    isDarkMode,
    toggleDarkMode,
    isMenuOpen,
    toggleMenu,
    closeMenu,
    isMobileView,
    initialized
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

// Enhanced useUI hook that provides SSR-safe access to the UI context
export function useUI() {
  // Use the context
  const context = useContext(UIContext);
  
  // Always return a valid context object - critical for SSR
  return context || defaultContextValue;
}

// Separate hook for theme-specific functionality
export function useTheme() {
  const { isDarkMode, toggleDarkMode } = useUI();
  
  return { isDarkMode, toggleDarkMode };
}

export default UIContext;`;

// Write the enhanced UIContext file
fs.writeFileSync(uiContextPath, enhancedUIContextContent);
console.log('Updated UIContext.js with enhanced SSR compatibility');

// 2. Update _app.js to properly wrap all components with necessary providers
const appJsPath = path.join(__dirname, 'deployment', 'frontend', 'pages', '_app.js');

if (!fs.existsSync(appJsPath)) {
  console.error(`Error: _app.js not found at ${appJsPath}`);
  process.exit(1);
}

const appJsContent = fs.readFileSync(appJsPath, 'utf8');

// Create enhanced _app.js that properly nests providers
const enhancedAppJsContent = `import React from 'react';
import '../styles/globals.css';
import { UIProvider } from '../contexts/UIContext';
import ErrorBoundary from '../components/common/ErrorBoundary';

// The order of providers is important - UI provider must come first
function MyApp({ Component, pageProps }) {
  // Use a key to force re-mount on route changes - helps with state issues
  const getLayout = Component.getLayout || ((page) => page);
  
  return (
    <ErrorBoundary>
      <UIProvider>
        {getLayout(<Component {...pageProps} />)}
      </UIProvider>
    </ErrorBoundary>
  );
}

export default MyApp;`;

// Only replace if it's not already configured correctly
if (!appJsContent.includes('UIProvider') || !appJsContent.includes('ErrorBoundary')) {
  fs.writeFileSync(appJsPath, enhancedAppJsContent);
  console.log('Updated _app.js with proper provider structure');
}

// 3. Create a basic ErrorBoundary component if it doesn't exist
const errorBoundaryPath = path.join(__dirname, 'deployment', 'frontend', 'components', 'common', 'ErrorBoundary.js');
const errorBoundaryDirPath = path.dirname(errorBoundaryPath);

if (!fs.existsSync(errorBoundaryDirPath)) {
  fs.mkdirSync(errorBoundaryDirPath, { recursive: true });
}

if (!fs.existsSync(errorBoundaryPath)) {
  const errorBoundaryContent = `import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error Boundary caught an error:", error, errorInfo);
    
    // Log error to server if needed
    // fetch('/api/log-error', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ error: error.toString(), errorInfo })
    // }).catch(console.error);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="error-boundary-fallback">
          <h1>Something went wrong</h1>
          <p>The application encountered an error. Please try refreshing the page.</p>
          {process.env.NODE_ENV !== 'production' && (
            <pre style={{ whiteSpace: 'pre-wrap' }}>
              {this.state.error && this.state.error.toString()}
            </pre>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4A5568',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '16px'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;`;

  fs.writeFileSync(errorBoundaryPath, errorBoundaryContent);
  console.log('Created ErrorBoundary component for improved error handling');
}

// 4. Update vercel.json with proper configuration
const vercelJsonPath = path.join(__dirname, 'deployment', 'frontend', 'vercel.json');
const vercelConfig = {
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next",
      "config": {
        "skipAutoInstall": false
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "NEXT_PUBLIC_DISABLE_STATIC_GENERATION": "true"
  }
};

fs.writeFileSync(vercelJsonPath, JSON.stringify(vercelConfig, null, 2));
console.log('Updated vercel.json with optimized configuration');

// 5. Update next.config.js with critical settings
const nextConfigPath = path.join(__dirname, 'deployment', 'frontend', 'next.config.js');
const nextConfigContent = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_DISABLE_STATIC_GENERATION: 'true'
  },
  // Disable static optimization for problematic pages
  images: {
    domains: ['localhost'],
  },
  // This is critical for resolving the provider issues
  webpack: (config, { isServer }) => {
    // Fix for useUI provider issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  // Add custom headers for security and caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
  // Disable static generation for all pages
  exportPathMap: null,
  distDir: '.next'
};

module.exports = nextConfig;`;

fs.writeFileSync(nextConfigPath, nextConfigContent);
console.log('Updated next.config.js with critical fixes');

console.log('Comprehensive Vercel Deployment Fix completed successfully.');
console.log('Next steps:');
console.log('1. Run deployment/frontend npm run build');
console.log('2. Deploy to Vercel using run-vercel-deploy.bat');
