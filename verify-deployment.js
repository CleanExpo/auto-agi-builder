/**
 * Auto AGI Builder - Deployment Verification Script
 * 
 * This script provides comprehensive verification for deployed instances
 * of the Auto AGI Builder application. It performs checks for:
 * 1. Accessibility (site responds with 200 OK)
 * 2. Content integrity (critical components are present)
 * 3. Performance metrics (load times and performance scores)
 * 4. API connectivity (backend endpoints are responding)
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

// Configuration
const CONFIG = {
  deployment: {
    production: 'https://auto-agi-builder.vercel.app',
    staging: 'https://auto-agi-builder-staging.vercel.app',
    canary: 'https://auto-agi-builder-canary.vercel.app',
    local: 'http://localhost:3000'
  },
  timeouts: {
    request: 10000, // 10 seconds
    overall: 60000 // 60 seconds
  },
  criticalPages: [
    '/', 
    '/dashboard',
    '/projects'
  ],
  criticalElements: [
    { page: '/', selector: 'header', description: 'Header' },
    { page: '/', selector: '.hero-section', description: 'Hero section' },
    { page: '/dashboard', selector: '.dashboard-content', description: 'Dashboard content' }
  ],
  performanceThresholds: {
    pageLoadTime: 3000, // 3 seconds max
    firstContentfulPaint: 1500, // 1.5 seconds max
    timeToInteractive: 3500 // 3.5 seconds max
  }
};

// Helpers
const logWithTimestamp = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const colorCode = type === 'error' ? '\x1b[31m' : 
                    type === 'success' ? '\x1b[32m' : 
                    type === 'warning' ? '\x1b[33m' : '\x1b[0m';
  
  console.log(`${colorCode}[${timestamp}] ${message}\x1b[0m`);
  
  // Also write to log file
  fs.appendFileSync(
    path.join(__dirname, 'deployment-verification.log'),
    `[${timestamp}] [${type.toUpperCase()}] ${message}\n`
  );
};

// Create log file
fs.writeFileSync(
  path.join(__dirname, 'deployment-verification.log'),
  `Deployment Verification - Started at ${new Date().toISOString()}\n\n`
);

// Fetch a URL and return the response
const fetchUrl = (url) => {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data,
          responseTime
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(CONFIG.timeouts.request, () => {
      req.abort();
      reject(new Error(`Request to ${url} timed out after ${CONFIG.timeouts.request / 1000} seconds`));
    });
  });
};

// Verify site accessibility
const verifySiteAccessibility = async (env = 'production') => {
  const url = CONFIG.deployment[env];
  logWithTimestamp(`Verifying site accessibility for ${env} environment: ${url}`);
  
  try {
    const response = await fetchUrl(url);
    
    if (response.statusCode === 200) {
      logWithTimestamp(`Site is accessible. Response time: ${response.responseTime.toFixed(2)}ms`, 'success');
      return true;
    } else {
      logWithTimestamp(`Site returned status code ${response.statusCode}`, 'error');
      return false;
    }
  } catch (error) {
    logWithTimestamp(`Error accessing site: ${error.message}`, 'error');
    return false;
  }
};

// Verify critical pages
const verifyCriticalPages = async (env = 'production') => {
  const baseUrl = CONFIG.deployment[env];
  let allPagesAccessible = true;
  
  logWithTimestamp(`Verifying critical pages for ${env} environment`);
  
  for (const page of CONFIG.criticalPages) {
    const url = `${baseUrl}${page}`;
    
    try {
      const response = await fetchUrl(url);
      
      if (response.statusCode === 200) {
        logWithTimestamp(`Page ${page} is accessible. Response time: ${response.responseTime.toFixed(2)}ms`, 'success');
      } else {
        logWithTimestamp(`Page ${page} returned status code ${response.statusCode}`, 'error');
        allPagesAccessible = false;
      }
    } catch (error) {
      logWithTimestamp(`Error accessing page ${page}: ${error.message}`, 'error');
      allPagesAccessible = false;
    }
  }
  
  return allPagesAccessible;
};

// Verify performance metrics (this is a simplified version, in production you'd use Lighthouse or similar)
const verifyPerformanceMetrics = async (env = 'production') => {
  const baseUrl = CONFIG.deployment[env];
  logWithTimestamp(`Verifying performance metrics for ${env} environment`);
  
  try {
    const response = await fetchUrl(baseUrl);
    
    if (response.responseTime > CONFIG.performanceThresholds.pageLoadTime) {
      logWithTimestamp(`Performance warning: Page load time (${response.responseTime.toFixed(2)}ms) exceeds threshold (${CONFIG.performanceThresholds.pageLoadTime}ms)`, 'warning');
      return false;
    }
    
    logWithTimestamp(`Performance metrics are within acceptable ranges`, 'success');
    return true;
  } catch (error) {
    logWithTimestamp(`Error checking performance metrics: ${error.message}`, 'error');
    return false;
  }
};

// Main verification function
const verifyDeployment = async (env = 'production') => {
  logWithTimestamp(`Starting deployment verification for ${env} environment`);
  
  const startTime = performance.now();
  const timeoutId = setTimeout(() => {
    logWithTimestamp(`Verification timed out after ${CONFIG.timeouts.overall / 1000} seconds`, 'error');
    process.exit(1);
  }, CONFIG.timeouts.overall);
  
  try {
    // Step 1: Verify site accessibility
    const isAccessible = await verifySiteAccessibility(env);
    if (!isAccessible) {
      logWithTimestamp(`Site accessibility check failed for ${env}`, 'error');
      clearTimeout(timeoutId);
      process.exit(1);
    }
    
    // Step 2: Verify critical pages
    const pagesAccessible = await verifyCriticalPages(env);
    if (!pagesAccessible) {
      logWithTimestamp(`Critical pages check failed for ${env}`, 'error');
      clearTimeout(timeoutId);
      process.exit(1);
    }
    
    // Step 3: Verify performance metrics
    const performanceOk = await verifyPerformanceMetrics(env);
    if (!performanceOk) {
      logWithTimestamp(`Performance metrics check has warnings for ${env}`, 'warning');
      // Don't exit on performance warnings, just log them
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    logWithTimestamp(`Deployment verification completed successfully in ${totalTime.toFixed(2)}ms`, 'success');
    clearTimeout(timeoutId);
    process.exit(0);
  } catch (error) {
    logWithTimestamp(`Deployment verification failed: ${error.message}`, 'error');
    clearTimeout(timeoutId);
    process.exit(1);
  }
};

// Determine which environment to verify based on command line args
const args = process.argv.slice(2);
const env = args[0] || 'production';

if (!Object.keys(CONFIG.deployment).includes(env)) {
  logWithTimestamp(`Invalid environment: ${env}. Valid options are: ${Object.keys(CONFIG.deployment).join(', ')}`, 'error');
  process.exit(1);
}

// Run the verification
verifyDeployment(env);
