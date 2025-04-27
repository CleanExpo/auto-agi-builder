/**
 * WEBPACK ERROR RESOLUTION SCRIPT
 * 
 * This script identifies and fixes common causes of webpack errors when using
 * Next.js with Node.js 22.15.0
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  projectRoot: process.cwd(),
  packageManager: 'npm', // npm, yarn, or pnpm
  logFile: path.join(process.cwd(), 'webpack-fix.log')
};

// Logger setup
function log(message, isError = false) {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] ${isError ? 'ERROR: ' : ''}${message}`;
  console.log(formattedMessage);
  fs.appendFileSync(config.logFile, formattedMessage + '\n');
}

// Initialize log file
fs.writeFileSync(config.logFile, `=== WEBPACK ERROR FIX STARTED AT ${new Date().toISOString()} ===\n`);

// Execute command with error handling
function executeCommand(command, options = {}) {
  log(`Executing: ${command}`);
  try {
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      ...options
    });
    log(`Command succeeded: ${command}`);
    return { success: true, output };
  } catch (error) {
    log(`Command failed: ${command}`, true);
    log(`Error message: ${error.message}`, true);
    if (error.stdout) log(`Stdout: ${error.stdout}`);
    if (error.stderr) log(`Stderr: ${error.stderr}`, true);
    return { success: false, error };
  }
}

// Check Node.js version
function checkNodeVersion() {
  log('Checking Node.js version...');
  const versionResult = executeCommand('node --version');
  if (!versionResult.success) {
    throw new Error('Failed to get Node.js version');
  }
  
  const currentVersion = versionResult.output.trim().replace('v', '');
  log(`Current Node.js version: ${currentVersion}`);
  
  const majorVersion = parseInt(currentVersion.split('.')[0], 10);
  if (majorVersion >= 22) {
    log('Node.js version 22+ detected, applying ESM compatibility fixes');
    return { version: currentVersion, needsEsmFix: true };
  }
  
  return { version: currentVersion, needsEsmFix: false };
}

// Fix package.json for Node.js 22 compatibility
function fixPackageJson(needsEsmFix) {
  const packageJsonPath = path.join(config.projectRoot, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    log('package.json not found, skipping package.json fixes', true);
    return false;
  }
  
  log('Updating package.json for compatibility...');
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    let modified = false;
    
    // Fix 1: Add Node.js engine constraint
    if (!packageJson.engines) {
      packageJson.engines = { node: ">=16.0.0" };
      modified = true;
      log('Added Node.js engine constraint');
    }
    
    // Fix 2: Update babel dependencies if needed
    if (needsEsmFix && packageJson.dependencies) {
      // Add resolutions for Babel compatibility
      if (!packageJson.resolutions) {
        packageJson.resolutions = {};
      }
      
      packageJson.resolutions["@babel/plugin-transform-typescript"] = "7.22.15";
      log('Added @babel/plugin-transform-typescript resolution');
      modified = true;
    }
    
    // Fix 3: Update next version if needed
    if (packageJson.dependencies && packageJson.dependencies.next) {
      const nextVersion = packageJson.dependencies.next;
      if (nextVersion.startsWith('^14')) {
        log('Next.js 14 detected, keeping current version');
      } else if (nextVersion.startsWith('^13') || nextVersion.startsWith('^12')) {
        // For Node.js 22, we need at least Next.js 13.4.12
        packageJson.dependencies.next = "^13.4.12";
        log('Updated Next.js to ^13.4.12 for compatibility');
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      log('package.json updated for compatibility');
      return true;
    }
    
    log('No changes needed for package.json');
    return false;
  } catch (error) {
    log(`Error updating package.json: ${error.message}`, true);
    return false;
  }
}

// Fix webpack configuration in next.config.js
function fixNextConfig(needsEsmFix) {
  const nextConfigPath = path.join(config.projectRoot, 'next.config.js');
  if (!fs.existsSync(nextConfigPath)) {
    log('next.config.js not found, creating it...');
    
    // Create a basic next.config.js with webpack configuration
    const configContent = `
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Fix for Node.js 22 compatibility issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
      };
    }
    
    // Increase memory limit for webpack
    config.performance = {
      ...config.performance,
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    };
    
    return config;
  },
  // Disable SWC minification if causing issues
  swcMinify: false
};

module.exports = nextConfig;
`;
    
    fs.writeFileSync(nextConfigPath, configContent);
    log('Created new next.config.js with webpack compatibility fixes');
    return true;
  }
  
  log('Modifying existing next.config.js...');
  try {
    let configContent = fs.readFileSync(nextConfigPath, 'utf8');
    let modified = false;
    
    // Check if webpack config exists and add if needed
    if (!configContent.includes('webpack:') && !configContent.includes('webpack =')) {
      // Add webpack configuration
      configContent = configContent.replace(
        /const\s+nextConfig\s*=\s*{/,
        `const nextConfig = {
  webpack: (config, { isServer }) => {
    // Fix for Node.js 22 compatibility issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
      };
    }
    
    // Increase memory limit for webpack
    config.performance = {
      ...config.performance,
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    };
    
    return config;
  },`
      );
      modified = true;
      log('Added webpack configuration to next.config.js');
    }
    
    // Disable SWC minification if not explicitly set
    if (!configContent.includes('swcMinify:')) {
      configContent = configContent.replace(
        /const\s+nextConfig\s*=\s*{/,
        `const nextConfig = {
  swcMinify: false,`
      );
      modified = true;
      log('Disabled SWC minification in next.config.js');
    }
    
    if (needsEsmFix && !configContent.includes('experimental:')) {
      // Add experimental configuration for ESM compatibility
      configContent = configContent.replace(
        /const\s+nextConfig\s*=\s*{/,
        `const nextConfig = {
  experimental: {
    esmExternals: 'loose',
  },`
      );
      modified = true;
      log('Added ESM compatibility settings to next.config.js');
    }
    
    if (modified) {
      fs.writeFileSync(nextConfigPath, configContent);
      log('next.config.js updated for webpack compatibility');
      return true;
    }
    
    log('No changes needed for next.config.js');
    return false;
  } catch (error) {
    log(`Error updating next.config.js: ${error.message}`, true);
    return false;
  }
}

// Fix dependencies with package manager
function fixDependencies() {
  log('Installing/updating dependencies for webpack compatibility...');
  
  // Install webpack explicitly
  const installWebpack = executeCommand(`${config.packageManager} install webpack --save-dev`);
  if (!installWebpack.success) {
    log('Failed to install webpack, continuing anyway', true);
  }
  
  // Install babel dependencies
  const installBabel = executeCommand(`${config.packageManager} install @babel/core @babel/plugin-transform-typescript --save-dev`);
  if (!installBabel.success) {
    log('Failed to install Babel dependencies, continuing anyway', true);
  }
  
  // Clean cache and node_modules to avoid dependency conflicts
  log('Cleaning node_modules and package manager cache...');
  executeCommand(`${config.packageManager} cache clean --force`);
  
  // Reinstall all dependencies
  log('Reinstalling all dependencies...');
  const reinstall = executeCommand(`${config.packageManager} install`);
  if (!reinstall.success) {
    log('Failed to reinstall dependencies', true);
    return false;
  }
  
  log('Dependencies updated successfully');
  return true;
}

// Create Node.js version bypass script
function createNodeVersionBypass() {
  const bypassScriptPath = path.join(config.projectRoot, 'build-with-node-options.js');
  log('Creating Node.js version bypass script...');
  
  const scriptContent = `
#!/usr/bin/env node
/**
 * This script runs the Next.js build with special Node.js options
 * to bypass ESM compatibility issues in Node.js 22+
 */
const { execSync } = require('child_process');

console.log('Running Next.js build with Node.js compatibility options...');

try {
  // Add the --no-experimental-require-module flag to disable ESM by default
  const command = 'cross-env NODE_OPTIONS="--no-experimental-require-module --max-old-space-size=4096" next build';
  
  execSync(command, {
    stdio: 'inherit',
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: '1'
    }
  });
  
  console.log('Build completed successfully with compatibility options');
  process.exit(0);
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
`;
  
  fs.writeFileSync(bypassScriptPath, scriptContent);
  fs.chmodSync(bypassScriptPath, '755');
  log('Created Node.js version bypass script');
  
  // Install cross-env for consistent environment variables
  executeCommand(`${config.packageManager} install cross-env --save-dev`);
  
  // Update package.json scripts
  const packageJsonPath = path.join(config.projectRoot, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      if (!packageJson.scripts) {
        packageJson.scripts = {};
      }
      
      // Add special build script
      packageJson.scripts['build:compatible'] = 'node build-with-node-options.js';
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      log('Added build:compatible script to package.json');
    } catch (error) {
      log(`Error updating package.json scripts: ${error.message}`, true);
    }
  }
  
  return true;
}

// Main function to fix webpack errors
async function fixWebpackErrors() {
  log('=== STARTING WEBPACK ERROR FIX ===');
  
  try {
    // Step 1: Check Node.js version
    const { needsEsmFix } = checkNodeVersion();
    
    // Step 2: Fix package.json
    const packageJsonFixed = fixPackageJson(needsEsmFix);
    
    // Step 3: Fix next.config.js
    const nextConfigFixed = fixNextConfig(needsEsmFix);
    
    // Step 4: Fix dependencies
    const dependenciesFixed = fixDependencies();
    
    // Step 5: Create Node.js version bypass script
    createNodeVersionBypass();
    
    // Step 6: Test build with compatibility options
    log('Testing build with compatibility options...');
    const buildTest = executeCommand('npm run build:compatible');
    
    if (buildTest.success) {
      log('=== WEBPACK ERROR FIX COMPLETED SUCCESSFULLY ===');
      log('The build now completes without webpack errors');
      return { success: true };
    } else {
      log('Build still failing, but fixes have been applied', true);
      log('Try running the build manually: npm run build:compatible', true);
      return { success: false, error: 'Build still failing after fixes' };
    }
  } catch (error) {
    log(`Error fixing webpack errors: ${error.message}`, true);
    return { success: false, error: error.message };
  }
}

// Execute the fix
fixWebpackErrors()
  .then(result => {
    if (result.success) {
      log('=== WEBPACK ERROR FIX COMPLETED SUCCESSFULLY ===');
    } else {
      log('=== WEBPACK ERROR FIX COMPLETED WITH ISSUES ===', true);
      log(`Error: ${result.error}`, true);
    }
  })
  .catch(error => {
    log(`Unhandled exception: ${error.message}`, true);
    log('=== WEBPACK ERROR FIX FAILED ===', true);
  });
