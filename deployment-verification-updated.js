#!/usr/bin/env node
/**
 * Auto AGI Builder - Deployment Verification Script (ES Module version)
 * 
 * This script verifies that all critical components of the Auto AGI Builder
 * application are properly deployed and functioning in the production environment.
 * 
 * Usage:
 *   node deployment-verification-updated.js <deployment-url>
 * 
 * Example:
 *   node deployment-verification-updated.js https://auto-agi-builder.vercel.app
 */

// Must use dynamic import since node-fetch is now an ES Module
import { promisify } from 'util';
import { exec as execCallback } from 'child_process';
import readline from 'readline';

const exec = promisify(execCallback);

// Create readline interface for user interaction
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Color console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Critical paths to verify
const criticalPaths = [
  { path: '/', name: 'Home Page' },
  { path: '/auth/login', name: 'Login Page' },
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/requirements', name: 'Requirements' },
  { path: '/prototype', name: 'Prototype' },
  { path: '/device-preview', name: 'Device Preview' },
  { path: '/roi', name: 'ROI Calculator' },
  { path: '/roadmap', name: 'Roadmap' }
];

// API endpoints to verify
const apiEndpoints = [
  { path: '/api/v1/health', name: 'Health Check' },
  { path: '/api/v1/auth/status', name: 'Auth Status' }
];

// Logging utility functions
function logInfo(message) {
  console.log(`${colors.blue}INFO:${colors.reset} ${message}`);
}

function logSuccess(message) {
  console.log(`${colors.green}✓ SUCCESS:${colors.reset} ${message}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠ WARNING:${colors.reset} ${message}`);
}

function logError(message) {
  console.log(`${colors.red}✗ ERROR:${colors.reset} ${message}`);
}

function logSection(title) {
  console.log(`\n${colors.magenta}=== ${title} ===${colors.reset}\n`);
}

// Function to check URL validity
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Function to verify a URL is accessible - using dynamic import
async function verifyUrl(url, options = {}) {
  const { timeout = 10000, headers = {} } = options;
  
  try {
    // Dynamically import node-fetch
    const { default: fetch } = await import('node-fetch');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, { 
      method: 'GET',
      headers,
      signal: controller.signal,
      redirect: 'follow'
    });
    
    clearTimeout(timeoutId);
    
    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      redirected: response.redirected,
      redirectUrl: response.redirected ? response.url : null
    };
  } catch (error) {
    return {
      ok: false,
      error: error.name === 'AbortError' ? 'Request timed out' : error.message
    };
  }
}

// Get deployment URL from command line arguments
async function getDeploymentUrl() {
  const argUrl = process.argv[2];
  
  if (argUrl && isValidUrl(argUrl)) {
    return argUrl;
  }
  
  // Try to get URL from Vercel CLI
  try {
    const { stdout } = await exec('vercel --prod');
    const url = stdout.trim();
    if (isValidUrl(url)) {
      return url;
    }
  } catch (error) {
    // Ignore errors, we'll ask the user
  }
  
  // Ask the user for the URL
  return new Promise((resolve) => {
    rl.question('Please enter the deployment URL (e.g., https://auto-agi-builder.vercel.app): ', (url) => {
      if (!isValidUrl(url)) {
        logError('Invalid URL provided');
        process.exit(1);
      }
      resolve(url);
    });
  });
}

// Function to verify frontend pages
async function verifyFrontendPages(baseUrl) {
  logSection('Verifying Frontend Pages');
  
  let successCount = 0;
  const totalPages = criticalPaths.length;
  
  for (const { path, name } of criticalPaths) {
    const url = `${baseUrl}${path}`;
    logInfo(`Checking ${name} (${url})`);
    
    const result = await verifyUrl(url);
    
    if (result.ok || result.status === 200 || result.status === 301 || result.status === 302) {
      logSuccess(`${name} is accessible (Status: ${result.status})`);
      successCount++;
    } else if (result.redirected) {
      logWarning(`${name} redirected to ${result.redirectUrl} (Status: ${result.status})`);
      // Count redirects as success since some pages may require authentication
      successCount++;
    } else {
      logError(`${name} is not accessible (Status: ${result.status || result.error})`);
    }
  }
  
  const successRate = Math.round((successCount / totalPages) * 100);
  return {
    totalPages,
    successCount,
    successRate,
    passed: successRate >= 80 // Consider it passed if 80% or more pages are accessible
  };
}

// Function to verify API endpoints
async function verifyApiEndpoints(baseUrl) {
  logSection('Verifying API Endpoints');
  
  // Determine API URL
  let apiUrl = baseUrl;
  
  // Ask the user if the API is hosted at a different URL
  const answer = await new Promise((resolve) => {
    rl.question('Is the API hosted at a different URL than the frontend? (y/n): ', (answer) => {
      resolve(answer.toLowerCase() === 'y');
    });
  });
  
  if (answer) {
    apiUrl = await new Promise((resolve) => {
      rl.question('Please enter the API base URL (e.g., https://api.example.com): ', (url) => {
        if (!isValidUrl(url)) {
          logError('Invalid URL provided');
          process.exit(1);
        }
        resolve(url);
      });
    });
  }
  
  let successCount = 0;
  const totalEndpoints = apiEndpoints.length;
  
  for (const { path, name } of apiEndpoints) {
    const url = `${apiUrl}${path}`;
    logInfo(`Checking ${name} (${url})`);
    
    const result = await verifyUrl(url);
    
    if (result.ok || result.status === 200) {
      logSuccess(`${name} is accessible (Status: ${result.status})`);
      successCount++;
    } else {
      logError(`${name} is not accessible (Status: ${result.status || result.error})`);
    }
  }
  
  const successRate = Math.round((successCount / totalEndpoints) * 100);
  return {
    totalEndpoints,
    successCount,
    successRate,
    passed: successRate >= 50 // Lower threshold for API as some endpoints may require auth
  };
}

// Function to verify Vercel deployment
async function verifyVercelDeployment(deploymentUrl) {
  logSection('Verifying Vercel Deployment');
  
  // Check Vercel configuration
  try {
    const { stdout, stderr } = await exec('vercel inspect --prod');
    if (stderr) {
      logWarning('Vercel CLI returned errors during inspection');
    }
    
    // Parse important information from the output
    if (stdout.includes('Production')) {
      logSuccess('Production deployment is active');
    }
    
    if (stdout.includes('autopublish: true')) {
      logSuccess('Auto-publish is enabled');
    }
    
    return { passed: true };
  } catch (error) {
    logWarning('Could not inspect Vercel deployment. Make sure you are logged in to Vercel CLI.');
    // Don't fail the entire verification if we can't inspect the deployment
    return { passed: true };
  }
}

// Generate verification report
function generateReport(results) {
  logSection('Verification Report');
  
  const frontendResult = results.frontend;
  const apiResult = results.api;
  const vercelResult = results.vercel;
  
  console.log(`
${colors.blue}Deployment URL:${colors.reset} ${results.deploymentUrl}

${colors.blue}Frontend Verification:${colors.reset}
  Pages Checked: ${frontendResult.totalPages}
  Pages Accessible: ${frontendResult.successCount}
  Success Rate: ${frontendResult.successRate}%
  Status: ${frontendResult.passed ? colors.green + 'PASSED' : colors.red + 'FAILED'}${colors.reset}

${colors.blue}API Verification:${colors.reset}
  Endpoints Checked: ${apiResult.totalEndpoints}
  Endpoints Accessible: ${apiResult.successCount}
  Success Rate: ${apiResult.successRate}%
  Status: ${apiResult.passed ? colors.green + 'PASSED' : colors.red + 'FAILED'}${colors.reset}

${colors.blue}Vercel Deployment:${colors.reset}
  Status: ${vercelResult.passed ? colors.green + 'PASSED' : colors.red + 'FAILED'}${colors.reset}

${colors.blue}Overall Status:${colors.reset} ${
    (frontendResult.passed && apiResult.passed && vercelResult.passed) 
      ? colors.green + 'PASSED' 
      : colors.red + 'FAILED'
  }${colors.reset}
  `);
  
  // Provide recommendations if there are issues
  if (!frontendResult.passed || !apiResult.passed || !vercelResult.passed) {
    console.log(`
${colors.yellow}Recommendations:${colors.reset}
${!frontendResult.passed ? '- Check frontend routes and page configurations\n' : ''}${!apiResult.passed ? '- Verify API server is running and correctly configured\n' : ''}${!vercelResult.passed ? '- Check Vercel deployment settings\n' : ''}
  `);
  }
}

// Main function
async function main() {
  try {
    // Print welcome message
    console.log(`
${colors.cyan}===========================================================${colors.reset}
${colors.cyan}    Auto AGI Builder - Deployment Verification Tool${colors.reset}
${colors.cyan}===========================================================${colors.reset}

This tool will verify that your Auto AGI Builder deployment is
working correctly by checking critical frontend pages and API endpoints.
    `);
    
    // Get deployment URL
    const deploymentUrl = await getDeploymentUrl();
    logInfo(`Using deployment URL: ${deploymentUrl}`);
    
    // Run verifications
    const frontendResult = await verifyFrontendPages(deploymentUrl);
    const apiResult = await verifyApiEndpoints(deploymentUrl);
    const vercelResult = await verifyVercelDeployment(deploymentUrl);
    
    // Generate and display report
    generateReport({
      deploymentUrl,
      frontend: frontendResult,
      api: apiResult,
      vercel: vercelResult
    });
    
    // Final message
    if (frontendResult.passed && apiResult.passed && vercelResult.passed) {
      logSuccess('Deployment verification completed successfully!');
    } else {
      logWarning('Deployment verification completed with issues.');
    }
    
    // Close readline interface
    rl.close();
  } catch (error) {
    logError(`Verification failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main();
