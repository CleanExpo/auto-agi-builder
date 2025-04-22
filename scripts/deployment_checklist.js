#!/usr/bin/env node
/**
 * Deployment Checklist for Auto AGI Builder
 * 
 * This script performs pre-deployment checks to verify that all requirements
 * are met before deploying to Vercel.
 * 
 * Usage:
 *   node scripts/deployment_checklist.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

// Configuration
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_APP_URL',
];
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Colors for console output
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Counters for test results
let passed = 0;
let failed = 0;
let warnings = 0;

/**
 * Print a header
 * @param {string} text - Header text
 */
function printHeader(text) {
  console.log('\n' + COLORS.magenta + '═'.repeat(80) + COLORS.reset);
  console.log(COLORS.magenta + ' ' + text + COLORS.reset);
  console.log(COLORS.magenta + '═'.repeat(80) + COLORS.reset);
}

/**
 * Print a check result
 * @param {string} name - Check name
 * @param {boolean} result - Check result
 * @param {string} message - Additional message
 * @param {boolean} isWarning - Whether this is a warning or a failure
 */
function printResult(name, result, message = '', isWarning = false) {
  if (result) {
    console.log(`${COLORS.green}✓ PASS:${COLORS.reset} ${name}`);
    passed++;
  } else {
    if (isWarning) {
      console.log(`${COLORS.yellow}⚠ WARN:${COLORS.reset} ${name}`);
      warnings++;
    } else {
      console.log(`${COLORS.red}✗ FAIL:${COLORS.reset} ${name}`);
      failed++;
    }
    if (message) {
      console.log(`  ${COLORS.white}${message}${COLORS.reset}`);
    }
  }
}

/**
 * Check if a file exists
 * @param {string} filePath - Path to the file
 * @returns {boolean} - Whether the file exists
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}

/**
 * Check if a command exists
 * @param {string} command - Command to check
 * @returns {boolean} - Whether the command exists
 */
function commandExists(command) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Run the checks
 */
async function runChecks() {
  printHeader('Auto AGI Builder Deployment Checklist');
  
  // Check system requirements
  printHeader('System Requirements');
  
  // Check Node.js version
  try {
    const nodeVersion = execSync('node --version').toString().trim();
    const versionMatch = nodeVersion.match(/v(\d+)\./);
    const majorVersion = versionMatch ? parseInt(versionMatch[1]) : 0;
    printResult(
      `Node.js version (${nodeVersion})`,
      majorVersion >= 16,
      majorVersion < 16 ? 'Node.js 16 or higher is required' : ''
    );
  } catch (err) {
    printResult('Node.js version', false, 'Failed to check Node.js version');
  }
  
  // Check npm/yarn
  const hasYarn = commandExists('yarn');
  const hasNpm = commandExists('npm');
  printResult(
    'Package manager (npm/yarn)',
    hasYarn || hasNpm,
    !hasYarn && !hasNpm ? 'Neither npm nor yarn found' : ''
  );
  
  // Check git
  printResult(
    'Git',
    commandExists('git'),
    !commandExists('git') ? 'Git is required for deployment' : ''
  );
  
  // Check frontend dependencies
  printHeader('Frontend Dependencies');
  
  // Check if package.json exists
  const packageJsonPath = path.join(FRONTEND_DIR, 'package.json');
  printResult(
    'package.json exists',
    fileExists(packageJsonPath),
    !fileExists(packageJsonPath) ? `File not found: ${packageJsonPath}` : ''
  );
  
  // Check if node_modules exists
  const nodeModulesPath = path.join(FRONTEND_DIR, 'node_modules');
  printResult(
    'node_modules exists',
    fileExists(nodeModulesPath),
    !fileExists(nodeModulesPath) ? 'Dependencies not installed. Run npm install or yarn install' : '',
    true // This is a warning, not a failure
  );
  
  // Check next.config.js
  const nextConfigPath = path.join(FRONTEND_DIR, 'next.config.js');
  printResult(
    'next.config.js exists',
    fileExists(nextConfigPath),
    !fileExists(nextConfigPath) ? `File not found: ${nextConfigPath}` : ''
  );
  
  // Check build script
  if (fileExists(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      printResult(
        'build script exists',
        packageJson.scripts && packageJson.scripts.build,
        !packageJson.scripts || !packageJson.scripts.build ? 'No build script found in package.json' : ''
      );
    } catch (err) {
      printResult('build script exists', false, 'Failed to parse package.json');
    }
  }
  
  // Check environment variables
  printHeader('Environment Variables');
  
  // Check .env.local
  const envLocalPath = path.join(FRONTEND_DIR, '.env.local');
  printResult(
    '.env.local exists',
    fileExists(envLocalPath),
    !fileExists(envLocalPath) ? `File not found: ${envLocalPath}` : '',
    true // This is a warning, not a failure (might be set directly in Vercel)
  );
  
  // Check required environment variables
  for (const envVar of REQUIRED_ENV_VARS) {
    printResult(
      `${envVar} is set`,
      process.env[envVar] !== undefined,
      process.env[envVar] === undefined ? `Environment variable ${envVar} is not set` : '',
      true // This is a warning, not a failure (might be set directly in Vercel)
    );
  }
  
  // Check API connectivity
  printHeader('API Connectivity');
  
  // Check API health endpoint
  try {
    console.log(`Testing API health endpoint: ${API_ENDPOINT}/health-check`);
    const response = await axios.get(`${API_ENDPOINT}/health-check`, { timeout: 5000 });
    printResult(
      'API health check',
      response.status === 200 && response.data && response.data.status === 'ok',
      response.status !== 200 ? `API returned status ${response.status}` :
        (!response.data || response.data.status !== 'ok') ? 'API health check failed' : ''
    );
  } catch (err) {
    printResult(
      'API health check',
      false,
      `Failed to connect to API: ${err.message}`
    );
  }
  
  // Check static assets
  printHeader('Static Assets');
  
  // Check public directory
  const publicDirPath = path.join(FRONTEND_DIR, 'public');
  printResult(
    'public directory exists',
    fileExists(publicDirPath) && fs.statSync(publicDirPath).isDirectory(),
    !fileExists(publicDirPath) ? 'public directory not found' :
      !fs.statSync(publicDirPath).isDirectory() ? 'public is not a directory' : ''
  );
  
  // Check if key static assets exist
  const favIconPath = path.join(publicDirPath, 'favicon.ico');
  printResult(
    'favicon.ico exists',
    fileExists(favIconPath),
    !fileExists(favIconPath) ? 'favicon.ico not found in public directory' : '',
    true // This is a warning, not a failure
  );
  
  // Check route configuration
  printHeader('Route Configuration');
  
  // Check pages directory
  const pagesDirPath = path.join(FRONTEND_DIR, 'pages');
  printResult(
    'pages directory exists',
    fileExists(pagesDirPath) && fs.statSync(pagesDirPath).isDirectory(),
    !fileExists(pagesDirPath) ? 'pages directory not found' :
      !fs.statSync(pagesDirPath).isDirectory() ? 'pages is not a directory' : ''
  );
  
  // Check index.js/tsx
  const indexJsPath = path.join(pagesDirPath, 'index.js');
  const indexTsxPath = path.join(pagesDirPath, 'index.tsx');
  printResult(
    'index page exists',
    fileExists(indexJsPath) || fileExists(indexTsxPath),
    !fileExists(indexJsPath) && !fileExists(indexTsxPath) ? 'index page not found' : ''
  );
  
  // Check _app.js/tsx
  const appJsPath = path.join(pagesDirPath, '_app.js');
  const appTsxPath = path.join(pagesDirPath, '_app.tsx');
  printResult(
    '_app page exists',
    fileExists(appJsPath) || fileExists(appTsxPath),
    !fileExists(appJsPath) && !fileExists(appTsxPath) ? '_app page not found' : ''
  );
  
  // Print summary
  printHeader('Summary');
  console.log(`${COLORS.green}Passed: ${passed}${COLORS.reset}`);
  console.log(`${COLORS.yellow}Warnings: ${warnings}${COLORS.reset}`);
  console.log(`${COLORS.red}Failed: ${failed}${COLORS.reset}`);
  
  if (failed > 0) {
    console.log(`\n${COLORS.red}❌ Deployment checks failed! Fix the issues before deploying.${COLORS.reset}`);
    process.exit(1);
  } else if (warnings > 0) {
    console.log(`\n${COLORS.yellow}⚠️ Deployment checks passed with warnings. Review the warnings before deploying.${COLORS.reset}`);
    process.exit(0);
  } else {
    console.log(`\n${COLORS.green}✅ All deployment checks passed! Ready to deploy.${COLORS.reset}`);
    process.exit(0);
  }
}

// Run the checks
runChecks().catch(err => {
  console.error(`${COLORS.red}Error running checks: ${err.message}${COLORS.reset}`);
  process.exit(1);
});
