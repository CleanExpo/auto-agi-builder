/**
 * Fix for 404 Issues on Vercel Deployment
 * 
 * This script addresses the 404 errors on the deployed site by ensuring
 * proper Next.js routing configuration and correcting any issues with
 * static page generation.
 */

const fs = require('fs');
const path = require('path');

console.log('Starting 404 Issue Fix...');

// Update next.config.js to ensure proper routing
const updateNextConfig = () => {
  console.log('Updating Next.js configuration...');
  
  const nextConfigPath = path.join(__dirname, 'frontend', 'next.config.js');
  
  if (!fs.existsSync(nextConfigPath)) {
    console.error(`Error: Next.js config file not found at ${nextConfigPath}`);
    return false;
  }
  
  let configContent = fs.readFileSync(nextConfigPath, 'utf8');
  
  // Ensure trailingSlash is set to true for better routing compatibility
  if (!configContent.includes('trailingSlash')) {
    configContent = configContent.replace(
      /module\.exports\s*=\s*({[^}]*})/,
      'module.exports = {\n  trailingSlash: true,\n  $1'
    );
  }
  
  // Ensure basePath is not set which can cause routing issues
  if (configContent.includes('basePath')) {
    configContent = configContent.replace(/basePath\s*:\s*['"][^'"]*['"]\s*,?\n?/g, '');
  }
  
  // Disable static optimization for problematic routes
  if (!configContent.includes('NEXT_PUBLIC_DISABLE_STATIC_GENERATION')) {
    configContent = configContent.replace(
      /module\.exports\s*=\s*({[^}]*})/,
      'module.exports = {\n  env: {\n    NEXT_PUBLIC_DISABLE_STATIC_GENERATION: "true"\n  },\n  $1'
    );
  }
  
  fs.writeFileSync(nextConfigPath, configContent);
  console.log('Successfully updated Next.js configuration');
  return true;
};

// Create a custom 404 page that gracefully handles missing routes
const createCustom404Page = () => {
  console.log('Creating custom 404 page...');
  
  const custom404Path = path.join(__dirname, 'frontend', 'pages', '404.js');
  
  const custom404Content = `import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Custom404() {
  const router = useRouter();
  
  // Redirect to home after 5 seconds
  React.useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/');
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [router]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Head>
        <title>Page Not Found | Auto AGI Builder</title>
      </Head>
      
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-blue-600 dark:text-blue-400">404</h1>
        <h2 className="text-3xl font-semibold mt-4 text-gray-800 dark:text-gray-200">Page Not Found</h2>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <p className="mt-2 text-gray-500 dark:text-gray-500">
          You'll be redirected to the home page in 5 seconds.
        </p>
        
        <div className="mt-8">
          <Link href="/" className="px-6 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            Go to Home Page
          </Link>
        </div>
      </div>
    </div>
  );
}`;

  fs.writeFileSync(custom404Path, custom404Content);
  console.log('Successfully created custom 404 page');
  return true;
};

// Fix the Vercel configuration to ensure proper routing
const fixVercelConfig = () => {
  console.log('Fixing Vercel configuration...');
  
  const vercelConfigPath = path.join(__dirname, 'vercel.json');
  
  // Check if vercel.json exists, if not create a new one
  if (!fs.existsSync(vercelConfigPath)) {
    console.log('Creating new vercel.json file...');
    
    const vercelConfig = {
      "version": 2,
      "routes": [
        { "src": "/(.*)", "dest": "/frontend/$1" },
        { "handle": "filesystem" },
        { "src": "/(.*)", "dest": "/404.html" }
      ],
      "env": {
        "NEXT_PUBLIC_DISABLE_STATIC_GENERATION": "true"
      },
      "outputDirectory": "frontend/out",
      "cleanUrls": true
    };
    
    fs.writeFileSync(vercelConfigPath, JSON.stringify(vercelConfig, null, 2));
    console.log('Successfully created new vercel.json file');
    return true;
  }
  
  // Update existing vercel.json
  let vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
  
  // Ensure routes are correctly configured
  vercelConfig.routes = [
    { "src": "/(.*)", "dest": "/frontend/$1" },
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/404.html" }
  ];
  
  // Set output directory to frontend/out
  vercelConfig.outputDirectory = "frontend/out";
  
  // Enable cleanUrls option
  vercelConfig.cleanUrls = true;
  
  fs.writeFileSync(vercelConfigPath, JSON.stringify(vercelConfig, null, 2));
  console.log('Successfully updated vercel.json file');
  return true;
};

// Create a preflight check for Next.js router
const createRouterFixScript = () => {
  console.log('Creating router preflight check...');
  
  const routerFixPath = path.join(__dirname, 'frontend', 'lib', 'routerFix.js');
  
  // Create the directory if it doesn't exist
  const libDir = path.join(__dirname, 'frontend', 'lib');
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
  }
  
  const routerFixContent = `/**
 * Router Preflight Check
 * 
 * This module ensures that the Next.js router is properly configured
 * and fallbacks to defaults when running outside browser context.
 */

export function setupRouterDefaults() {
  // Only run on client side
  if (typeof window === 'undefined') return;
  
  // Check for Next.js router
  if (!window.__NEXT_DATA__) {
    console.warn('Next.js router data not found, this may cause routing issues');
  }
  
  // Set up route change error handler
  if (typeof window.next !== 'undefined' && window.next.router) {
    window.next.router.events.on('routeChangeError', (err, url) => {
      console.error(\`Route change error: Failed to navigate to \${url}\`, err);
      
      // If the error is a cancelled route, ignore it
      if (err.cancelled) {
        console.log('Route change was cancelled, this is normal during rapid navigation');
        return;
      }
      
      // For other errors, try to recover by forcefully navigating
      if (url.startsWith('/')) {
        console.log('Attempting to recover from route error by forcefully navigating');
        window.location.href = url;
      }
    });
  }
}`;

  fs.writeFileSync(routerFixPath, routerFixContent);
  console.log('Successfully created router preflight check script');
  
  // Now update _app.js to include our router fix
  const appPath = path.join(__dirname, 'frontend', 'pages', '_app.js');
  
  if (!fs.existsSync(appPath)) {
    console.error(`Error: _app.js file not found at ${appPath}`);
    return false;
  }
  
  let appContent = fs.readFileSync(appPath, 'utf8');
  
  // Check if we already imported the router fix
  if (!appContent.includes('routerFix')) {
    // Add the import
    appContent = appContent.replace(
      /import\s+(['"])next\/app['"]/,
      `import $1next/app$1\nimport { setupRouterDefaults } from '../lib/routerFix'`
    );
    
    // Add the setup call to componentDidMount if class component
    if (appContent.includes('componentDidMount')) {
      appContent = appContent.replace(
        /componentDidMount\(\)\s*{/,
        'componentDidMount() {\n    setupRouterDefaults();'
      );
    }
    // Or add to useEffect if functional component
    else if (appContent.includes('useEffect')) {
      appContent = appContent.replace(
        /useEffect\(\(\)\s*=>\s*{/,
        'useEffect(() => {\n    setupRouterDefaults();'
      );
    }
    // Otherwise add a new useEffect
    else if (appContent.includes('function') && appContent.includes('return')) {
      const insertPosition = appContent.indexOf('return');
      const beforeReturn = appContent.substring(0, insertPosition);
      const afterReturn = appContent.substring(insertPosition);
      
      appContent = `${beforeReturn}\n  // Set up router defaults\n  React.useEffect(() => {\n    setupRouterDefaults();\n  }, []);\n\n${afterReturn}`;
    }
    
    fs.writeFileSync(appPath, appContent);
    console.log('Successfully updated _app.js to include router fix');
  }
  
  return true;
};

// Run the fixes
const success = 
  updateNextConfig() && 
  createCustom404Page() && 
  fixVercelConfig() && 
  createRouterFixScript();

if (success) {
  console.log('\n✅ All 404 issue fixes have been successfully applied.');
  console.log('\nNext steps:');
  console.log('1. Rebuild the project: npm run build');
  console.log('2. Deploy to Vercel: vercel --prod');
  console.log('3. Verify the site is now accessible at https://auto-agi-builder-g0wa25wsn-team-agi.vercel.app/');
} else {
  console.error('\n❌ Some fixes could not be applied. Please check the errors above.');
}
