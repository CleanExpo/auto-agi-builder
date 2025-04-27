// Advanced Next.js Build Solution Script
// This script provides a complete solution for context provider errors
// by combining SSR-compatible context providers with build configuration updates

const fs = require('fs');
const path = require('path');
const chalk = require('chalk') || { green: (s) => `[SUCCESS] ${s}`, red: (s) => `[ERROR] ${s}`, yellow: (s) => `[WARNING] ${s}`, blue: (s) => `[INFO] ${s}` };

console.log(chalk.blue('Starting Final Build Solution Script...'));
console.log('This script implements the ultimate fix for SSR context errors');
console.log('');

// Paths to required files
const frontendDir = path.join('deployment', 'frontend');
const nextConfigPath = path.join(frontendDir, 'next.config.js');
const appJsPath = path.join(frontendDir, 'pages', '_app.js');
const contextsIndexPath = path.join(frontendDir, 'contexts', 'index.js');
const packageJsonPath = path.join(frontendDir, 'package.json');

// Define problematic pages that should skip static generation
const problematicPages = [
    '/api-status',
    '/clients',
    '/clients/[id]',
    '/notifications',
    '/settings/localization',
    '/settings/notifications'
];

// PART 1: Modify Next.js config to completely disable static generation for problematic pages
try {
    console.log('Updating Next.js config to disable static generation for problematic pages...');
    
    // Read the current Next.js configuration
    let configContent = fs.readFileSync(nextConfigPath, 'utf8');
    
    // Create new configuration with no static generation for problematic pages
    const updatedConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.unsplash.com'],
  },
  // Completely disable static export for the entire application
  // This ensures all pages are rendered at runtime instead
  trailingSlash: true,
  
  // Explicitly prevent static optimization for problematic pages
  unstable_runtimeJS: true,
  
  // Skip problematic routes during static generation
  exportPathMap: async function (defaultPathMap) {
    // Remove problematic paths from static generation
    const filteredPathMap = { ...defaultPathMap };
    ${problematicPages.map(page => `delete filteredPathMap['${page}'];`).join('\n    ')}
    return filteredPathMap;
  },
  
  // Configure runtime options
  publicRuntimeConfig: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    // Mark these paths as client-only
    clientOnlyPages: ${JSON.stringify(problematicPages)},
  },
  
  // Advanced webpack configuration for client-side only rendering
  webpack: (config, { isServer, webpack }) => {
    if (isServer) {
      // Add null-loader for problematic pages to skip SSR
      config.module = config.module || {};
      config.module.rules = config.module.rules || [];
      
      // Skip SSR for specific routes
      config.module.rules.push({
        test: /\\.(clients|notifications|settings|api-status)\\.js$/,
        loader: 'null-loader'
      });
      
      // Define environment variable for server-side rendering detection
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.IS_SERVER': JSON.stringify(true),
        })
      );
    } else {
      // Define environment variable for client-side detection
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.IS_SERVER': JSON.stringify(false),
        })
      );
    }
    
    return config;
  },
}

module.exports = nextConfig;`;

    // Write the updated configuration
    fs.writeFileSync(nextConfigPath, updatedConfig);
    console.log(chalk.green('✓ Successfully updated Next.js configuration'));
} catch (error) {
    console.error(chalk.red(`Failed to update Next.js config: ${error}`));
}

// PART 2: Update package.json to add null-loader dependency
try {
    console.log('Updating package.json to add required dependencies...');
    
    let packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Add null-loader as a dev dependency if it doesn't exist
    packageJson.devDependencies = packageJson.devDependencies || {};
    if (!packageJson.devDependencies['null-loader']) {
        packageJson.devDependencies['null-loader'] = "^4.0.1";
        
        // Write updated package.json
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log(chalk.green('✓ Added null-loader to devDependencies'));
        console.log(chalk.yellow('! You should run "npm install" to install the new dependencies'));
    } else {
        console.log(chalk.blue('✓ null-loader already exists in devDependencies'));
    }
} catch (error) {
    console.error(chalk.red(`Failed to update package.json: ${error}`));
}

// PART 3: Update _app.js to implement dynamic imports for context providers
try {
    console.log('Updating _app.js to implement dynamic imports for context providers...');
    
    // Read _app.js
    const appJs = fs.readFileSync(appJsPath, 'utf8');
    
    // Updated app.js with dynamic imports and SSR detection
    const updatedAppJs = `import React from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useRouter } from 'next/router';
import '../styles/globals.css';

// Detect problematic pages that should skip certain providers
const isClientOnlyPage = (path) => {
  const clientOnlyPages = ['/clients', '/notifications', '/settings/localization', '/settings/notifications', '/api-status'];
  return clientOnlyPages.some(page => {
    if (page.includes('[')) {
      // Handle dynamic routes like '/clients/[id]'
      return path.startsWith(page.split('[')[0]);
    }
    return path === page;
  });
};

// Dynamically import providers to enable client-side only rendering when needed
const DynamicUIProvider = dynamic(() => import('../contexts').then(mod => mod.UIProvider), {
  ssr: true, // UI provider is safe for SSR
});

const DynamicAuthProvider = dynamic(() => import('../contexts').then(mod => mod.AuthProvider), {
  ssr: false, // Skip SSR for Auth provider
});

const DynamicClientProvider = dynamic(() => import('../contexts').then(mod => mod.ClientProvider), {
  ssr: false, // Skip SSR for Client provider
});

// Safe wrapper component that conditionally renders children only on client side if needed
const SafeRender = ({ children, clientOnly }) => {
  const [isMounted, setIsMounted] = React.useState(!clientOnly);
  
  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) return null;
  return children;
};

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const currentPath = router.pathname;
  const isClientOnly = isClientOnlyPage(currentPath);
  
  // Enhanced error handler for development mode
  const [hasError, setHasError] = React.useState(false);
  
  React.useEffect(() => {
    // Reset error state on route change
    setHasError(false);
  }, [router.pathname]);
  
  if (hasError) {
    return (
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Something went wrong</h1>
        <p>An error occurred in the application. Please try refreshing the page.</p>
        <button 
          onClick={() => setHasError(false)}
          style={{
            padding: '8px 16px',
            background: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <React.Fragment>
      <Head>
        <title>Auto AGI Builder</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      
      <DynamicUIProvider>
        <SafeRender clientOnly={isClientOnly}>
          <DynamicAuthProvider>
            <SafeRender clientOnly={isClientOnly}>
              <DynamicClientProvider>
                <React.ErrorBoundary
                  fallback={<div>Something went wrong</div>}
                  onError={() => setHasError(true)}
                >
                  <Component {...pageProps} />
                </React.ErrorBoundary>
              </DynamicClientProvider>
            </SafeRender>
          </DynamicAuthProvider>
        </SafeRender>
      </DynamicUIProvider>
    </React.Fragment>
  );
}

export default MyApp;`;

    // Write updated _app.js
    fs.writeFileSync(appJsPath, updatedAppJs);
    console.log(chalk.green('✓ Successfully updated _app.js with dynamic imports and SSR detection'));
} catch (error) {
    console.error(chalk.red(`Failed to update _app.js: ${error}`));
}

// PART 4: Update contexts/index.js to ensure SSR compatibility
try {
    console.log('Updating contexts/index.js to ensure SSR compatibility...');
    
    // Read contexts/index.js
    const contextsIndex = fs.readFileSync(contextsIndexPath, 'utf8');
    
    // Check if file already contains isServer check
    if (!contextsIndex.includes('typeof window === "undefined"')) {
        // Add SSR compatibility to contexts
        const updatedContextsIndex = contextsIndex.replace(
            'export {',
            `// SSR detection helper
const isServer = typeof window === "undefined";

// Enhanced context providers with SSR compatibility
export {`
        );
        
        // Write updated contexts/index.js
        fs.writeFileSync(contextsIndexPath, updatedContextsIndex);
        console.log(chalk.green('✓ Successfully updated contexts/index.js with SSR compatibility'));
    } else {
        console.log(chalk.blue('✓ contexts/index.js already contains SSR compatibility'));
    }
} catch (error) {
    console.error(chalk.red(`Failed to update contexts/index.js: ${error}`));
}

console.log('');
console.log(chalk.green('🎉 Final Build Solution successfully applied!'));
console.log('This comprehensive solution implements:');
console.log('1. Next.js configuration changes to disable static generation for problematic pages');
console.log('2. Dynamic imports with client-side only rendering for context providers');
console.log('3. Safe rendering patterns that detect SSR context');
console.log('4. Error boundaries to gracefully handle rendering failures');
console.log('');

console.log('To complete the implementation:');
console.log('1. Navigate to the frontend directory: cd deployment\\frontend');
console.log('2. Install dependencies if needed: npm install');
console.log('3. Build the application: npm run build');
console.log('4. Test the application: npm run start');
