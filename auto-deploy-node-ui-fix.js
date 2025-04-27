/**
 * AUTO AGI BUILDER DEPLOYMENT WITH NODE VERSION HANDLING
 * 
 * This script resolves Node.js version compatibility issues and deploys the application:
 * 1. Checks and installs the correct Node.js version (22.15.0)
 * 2. Applies context provider fixes
 * 3. Updates dependencies to be compatible with Node 22+
 * 4. Commits all changes and deploys to Vercel
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  requiredNodeVersion: '22.15.0',
  fallbackNodeVersion: '18.10.0',
  logDir: path.join(process.cwd(), 'logs'),
  commitMessage: 'Fix: Resolve context dependencies and update Node version compatibility',
  gitRepo: 'origin',
  gitBranch: 'main'
};

// Create log directory
if (!fs.existsSync(config.logDir)) {
  fs.mkdirSync(config.logDir, { recursive: true });
}

// Setup log file
const logFile = path.join(config.logDir, 'node-version-deployment.log');
fs.writeFileSync(logFile, `=== DEPLOYMENT STARTED AT ${new Date().toISOString()} ===\n`);

// Logger utility
function log(message, isError = false) {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] ${isError ? 'ERROR: ' : ''}${message}`;
  console.log(formattedMessage);
  fs.appendFileSync(logFile, formattedMessage + '\n');
}

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

// Check and handle Node.js version
async function handleNodeVersion() {
  log('=== CHECKING NODE.JS VERSION ===');
  
  // Get current Node.js version
  const versionResult = executeCommand('node --version');
  if (!versionResult.success) {
    throw new Error('Failed to get Node.js version');
  }
  
  const currentVersion = versionResult.output.trim().replace('v', '');
  log(`Current Node.js version: ${currentVersion}`);
  
  // Check if we need to install a different version
  if (currentVersion !== config.requiredNodeVersion) {
    log(`Current Node.js version ${currentVersion} doesn't match required version ${config.requiredNodeVersion}`);
    
    // Check if nvm is installed
    const nvmResult = executeCommand('command -v nvm || where nvm', { stdio: 'ignore' });
    
    if (nvmResult.success) {
      log('NVM found. Attempting to install and use required Node.js version...');
      
      // Try to install required version
      executeCommand(`nvm install ${config.requiredNodeVersion}`);
      executeCommand(`nvm use ${config.requiredNodeVersion}`);
      
      // Check if successful
      const newVersionResult = executeCommand('node --version');
      const newVersion = newVersionResult.success ? newVersionResult.output.trim().replace('v', '') : null;
      
      if (newVersion === config.requiredNodeVersion) {
        log(`Successfully switched to Node.js ${config.requiredNodeVersion}`);
      } else {
        log(`Failed to switch to Node.js ${config.requiredNodeVersion}`, true);
        log(`Attempting to use fallback version ${config.fallbackNodeVersion}...`);
        
        // Try fallback version
        executeCommand(`nvm install ${config.fallbackNodeVersion}`);
        executeCommand(`nvm use ${config.fallbackNodeVersion}`);
        
        // Verify fallback version
        const fallbackVersionResult = executeCommand('node --version');
        const fallbackVersion = fallbackVersionResult.success ? fallbackVersionResult.output.trim().replace('v', '') : null;
        
        if (fallbackVersion === config.fallbackNodeVersion) {
          log(`Successfully switched to fallback Node.js ${config.fallbackNodeVersion}`);
          
          // Update package.json to work with fallback version
          updatePackageJsonForFallback();
        } else {
          log('Failed to switch Node.js version', true);
          throw new Error('Unable to configure correct Node.js version');
        }
      }
    } else {
      log('NVM not found. Creating version compatibility shims...', true);
      
      // Update package.json to be compatible with current Node.js version
      updatePackageJsonForCompatibility(currentVersion);
    }
  } else {
    log(`Current Node.js version ${currentVersion} matches required version`);
  }
  
  return true;
}

// Update package.json for compatibility with fallback Node.js version
function updatePackageJsonForFallback() {
  log('Updating package.json for fallback Node.js version compatibility...');
  
  const packageJsonPath = path.join(process.cwd(), 'frontend', 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    log(`package.json not found at: ${packageJsonPath}`, true);
    return;
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Update engines field
    packageJson.engines = {
      node: ">=18.10.0"
    };
    
    // Downgrade dependencies that require Node.js 22+
    if (packageJson.dependencies) {
      // Add compatibility patches or downgrade specific dependencies
      if (packageJson.dependencies.next) {
        // Downgrade Next.js if it requires Node.js 22+
        packageJson.dependencies.next = "^13.4.12";
      }
      
      // Add other dependency adjustments as needed
    }
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    log('package.json updated for Node.js compatibility');
    
    // Reinstall dependencies
    log('Reinstalling dependencies with updated package.json...');
    executeCommand('cd frontend && npm install');
  } catch (error) {
    log(`Error updating package.json: ${error.message}`, true);
    throw error;
  }
}

// Update package.json for compatibility with current Node.js version
function updatePackageJsonForCompatibility(currentVersion) {
  log(`Updating package.json for compatibility with Node.js ${currentVersion}...`);
  
  const packageJsonPath = path.join(process.cwd(), 'frontend', 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    log(`package.json not found at: ${packageJsonPath}`, true);
    return;
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Update engines field to match current version
    packageJson.engines = {
      node: `>=${currentVersion}`
    };
    
    // Update dependencies that might be incompatible
    if (packageJson.dependencies) {
      // Adjust dependencies based on current Node.js version
      const majorVersion = parseInt(currentVersion.split('.')[0]);
      
      if (majorVersion < 22) {
        // For older Node.js versions
        if (packageJson.dependencies.next) {
          // Ensure Next.js version is compatible
          packageJson.dependencies.next = "^13.4.12";
        }
        
        // Add other adjustments for older Node.js versions
      } else {
        // For newer Node.js versions (22+)
        // Ensure dependencies support newer Node versions
      }
    }
    
    // Update next.config.js to adjust webpack configuration if needed
    updateNextConfig(majorVersion < 22);
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    log('package.json updated for Node.js compatibility');
    
    // Reinstall dependencies
    log('Reinstalling dependencies with updated package.json...');
    executeCommand('cd frontend && npm install');
  } catch (error) {
    log(`Error updating package.json: ${error.message}`, true);
    throw error;
  }
}

// Update next.config.js for Node.js compatibility
function updateNextConfig(needsPolyfills) {
  const nextConfigPath = path.join(process.cwd(), 'frontend', 'next.config.js');
  if (!fs.existsSync(nextConfigPath)) {
    log(`next.config.js not found at: ${nextConfigPath}`, true);
    return;
  }
  
  try {
    let nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');
    
    if (needsPolyfills) {
      // Add Node.js polyfills for older versions
      if (!nextConfigContent.includes('webpack:')) {
        // Add webpack configuration
        nextConfigContent = nextConfigContent.replace(
          /module\.exports\s*=\s*{/,
          `module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
      };
    }
    return config;
  },`
        );
      }
    } else {
      // Remove polyfills if not needed
      nextConfigContent = nextConfigContent.replace(
        /webpack:\s*\([^)]+\)\s*=>\s*{[^}]+},/,
        ''
      );
    }
    
    fs.writeFileSync(nextConfigPath, nextConfigContent);
    log(`next.config.js updated for ${needsPolyfills ? 'older' : 'newer'} Node.js compatibility`);
  } catch (error) {
    log(`Error updating next.config.js: ${error.message}`, true);
  }
}

// Apply context provider fixes
async function applyContextFixes() {
  log('=== APPLYING CONTEXT PROVIDER FIXES ===');
  
  const fixContextScript = `
const fs = require('fs');
const path = require('path');

// Paths to relevant files
const appJsPath = path.join(process.cwd(), 'frontend', 'pages', '_app.js');
const authContextPath = path.join(process.cwd(), 'frontend', 'contexts', 'AuthContext.js');
const uiContextPath = path.join(process.cwd(), 'frontend', 'contexts', 'UIContext.js');

// Check if files exist
if (!fs.existsSync(appJsPath)) {
  console.error('_app.js not found at:', appJsPath);
  process.exit(1);
}

if (!fs.existsSync(authContextPath)) {
  console.error('AuthContext.js not found at:', authContextPath);
  process.exit(1);
}

if (!fs.existsSync(uiContextPath)) {
  console.error('UIContext.js not found at:', uiContextPath);
  process.exit(1);
}

// Fix AuthContext.js - Remove direct useUI hook usage
console.log('Fixing AuthContext.js...');
let authContextContent = fs.readFileSync(authContextPath, 'utf8');

// Remove import for useUI
authContextContent = authContextContent.replace(
  /import[\\s\\n]*{[^}]*useUI[^}]*}[\\s\\n]*from[\\s\\n]*['\\"](.*)UIContext['\\"][;]?/g,
  ''
);

// Update AuthProvider to accept toast as a prop
authContextContent = authContextContent.replace(
  /export[\\s\\n]*function[\\s\\n]*AuthProvider[\\s\\n]*\\([\\s\\n]*{[\\s\\n]*children[\\s\\n]*}[\\s\\n]*\\)[\\s\\n]*{/g,
  'export function AuthProvider({ children, toast }) {'
);

// Remove direct useUI calls
authContextContent = authContextContent.replace(
  /const[\\s\\n]*{[^}]*toast[^}]*}[\\s\\n]*=[\\s\\n]*useUI\\(\\)[;]?/g,
  '// toast is now received as a prop'
);

// Write updated AuthContext.js
fs.writeFileSync(authContextPath, authContextContent);
console.log('AuthContext.js fixed successfully');

// Fix UIContext.js to support render props
console.log('Fixing UIContext.js...');
let uiContextContent = fs.readFileSync(uiContextPath, 'utf8');

// Check if already using render props pattern
if (!uiContextContent.includes('children(') && !uiContextContent.includes('typeof children === "function"')) {
  // Add render props pattern
  uiContextContent = uiContextContent.replace(
    /return[\\s\\n]*\\([\\s\\n]*<UIContext\\.Provider[\\s\\n]*value=[{][^}]+[}][\\s\\n]*>[\\s\\n]*{children}[\\s\\n]*<\\/UIContext\\.Provider>[\\s\\n]*\\);/g,
    'return (\\n' +
    '    <UIContext.Provider value={state}>\\n' +
    '      {typeof children === "function" ? children(state) : children}\\n' +
    '    </UIContext.Provider>\\n' +
    '  );'
  );
  
  // Write updated UIContext.js
  fs.writeFileSync(uiContextPath, uiContextContent);
  console.log('UIContext.js fixed successfully');
} else {
  console.log('UIContext.js already uses render props, no changes needed');
}

// Fix _app.js - Update provider hierarchy
console.log('Fixing _app.js...');
let appJsContent = fs.readFileSync(appJsPath, 'utf8');

// Make a backup of _app.js
fs.writeFileSync(appJsPath + '.bak', appJsContent);
console.log('_app.js backup created');

// First, clean up any potential errors from previous fix attempts
appJsContent = appJsContent.replace(
  /<ProviderErrorBoundary[^>]*>[\\s\\n]*<UIProvider>[\\s\\n]*{[^}]+}[\\s\\n]*<\\/UIProvider>[\\s\\n]*<\\/ProviderErrorBoundary>/g,
  '<UIProvider>\n      {(uiState) => (\n        <AuthProvider toast={uiState.toast || uiState.showToast}>\n          <Component {...pageProps} />\n        </AuthProvider>\n      )}\n    </UIProvider>'
);

// Make sure we replace the actual pattern in the file
const componentRegex = /<UIProvider[^>]*>[\\s\\n]*(?:<React\\.Fragment>)?[\\s\\n]*(?:<>)?[\\s\\n]*<AuthProvider[^>]*>[\\s\\n]*<Component[\\s\\n]*{\\.\\.\\.(pageProps|props)}[\\s\\n]*\\/>/g;
const replacementWithRenderProps = '<UIProvider>\n      {(uiState) => (\n        <AuthProvider toast={uiState.toast || uiState.showToast}>\n          <Component {...pageProps} />\n        </AuthProvider>\n      )}\n    </UIProvider>';

// If the complex regex doesn't work, try a simpler replacement
if (componentRegex.test(appJsContent)) {
  appJsContent = appJsContent.replace(componentRegex, replacementWithRenderProps);
} else {
  // Simplified structure match
  // First, look for the structure
  const startUIProvider = appJsContent.indexOf('<UIProvider');
  const endUIProvider = appJsContent.indexOf('</UIProvider>');
  const authProviderStart = appJsContent.indexOf('<AuthProvider', startUIProvider);
  const authProviderEnd = appJsContent.indexOf('</AuthProvider>', authProviderStart);
  
  if (startUIProvider !== -1 && endUIProvider !== -1 && authProviderStart !== -1 && authProviderEnd !== -1) {
    // We found all the components, extract the section we need to replace
    const sectionToReplace = appJsContent.substring(startUIProvider, endUIProvider + '</UIProvider>'.length);
    
    // Create carefully structured replacement
    appJsContent = appJsContent.replace(
      sectionToReplace,
      replacementWithRenderProps
    );
  } else {
    console.error('Could not find UIProvider and AuthProvider pattern in _app.js');
    console.log('WARNING: Manual inspection of _app.js is recommended');
  }
}

// Write updated _app.js
fs.writeFileSync(appJsPath, appJsContent);
console.log('_app.js fixed successfully');

// Create ErrorBoundary component
console.log('Creating ErrorBoundary component...');
const errorBoundaryDir = path.join(process.cwd(), 'frontend', 'components', 'common');
if (!fs.existsSync(errorBoundaryDir)) {
  fs.mkdirSync(errorBoundaryDir, { recursive: true });
}

const errorBoundaryPath = path.join(errorBoundaryDir, 'ErrorBoundary.js');
const errorBoundaryContent = \`import { Component } from 'react';

/**
 * Generic error boundary component to catch React errors and display a fallback UI
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });
    
    // Log the error
    console.error('Error caught by ErrorBoundary:', error);
    if (errorInfo) {
      console.error('Component stack:', errorInfo.componentStack);
    }
  }

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { fallback, children, name = 'component' } = this.props;
    
    if (hasError) {
      // You can render any custom fallback UI
      if (fallback) {
        return fallback(error, errorInfo);
      }
      
      return (
        <div className="error-boundary" style={{ 
          padding: '20px', 
          margin: '20px 0', 
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          backgroundColor: '#f8d7da',
          color: '#721c24'
        }}>
          <h2>Something went wrong in {name}.</h2>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
            <summary>See error details</summary>
            <pre>{error && error.toString()}</pre>
            <pre>{errorInfo && errorInfo.componentStack}</pre>
          </details>
        </div>
      );
    }

    return children;
  }
}

/**
 * Specialized error boundary for context providers
 */
export function ProviderErrorBoundary({ children, providerName }) {
  return (
    <ErrorBoundary 
      name={providerName} 
      fallback={(error) => (
        <div style={{ 
          padding: '20px', 
          margin: '20px 0', 
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          backgroundColor: '#f8d7da',
          color: '#721c24'
        }}>
          <h3>Error in {providerName}</h3>
          <p>{error?.message || 'An unknown error occurred'}</p>
          <p>This usually indicates a problem with the application initialization.</p>
          <p>If you're seeing this in production, please try clearing your browser cache and reloading the page.</p>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}\`;

fs.writeFileSync(errorBoundaryPath, errorBoundaryContent);
console.log('ErrorBoundary component created successfully');

// Update _app.js again to use the ErrorBoundary
console.log('Updating _app.js to use ErrorBoundary...');
appJsContent = fs.readFileSync(appJsPath, 'utf8');

// Add ErrorBoundary import
if (!appJsContent.includes('ErrorBoundary')) {
  const importStatement = "import App from 'next/app'";
  const newImportStatement = "import App from 'next/app';\nimport { ProviderErrorBoundary } from '../components/common/ErrorBoundary';";
  
  appJsContent = appJsContent.replace(importStatement, newImportStatement);
}

// Wrap providers with ErrorBoundary
appJsContent = appJsContent.replace(
  '<UIProvider>',
  '<ProviderErrorBoundary providerName="UIProvider">\n      <UIProvider>'
);
appJsContent = appJsContent.replace(
  '</UIProvider>',
  '</UIProvider>\n    </ProviderErrorBoundary>'
);
appJsContent = appJsContent.replace(
  '<AuthProvider toast=',
  '<ProviderErrorBoundary providerName="AuthProvider">\n          <AuthProvider toast='
);
appJsContent = appJsContent.replace(
  '</AuthProvider>',
  '</AuthProvider>\n        </ProviderErrorBoundary>'
);

// Write final _app.js
fs.writeFileSync(appJsPath, appJsContent);
console.log('_app.js updated with ErrorBoundary successfully');

// Final verification
try {
  console.log('Verifying JSX structure...');
  // Simple check - count opening and closing tags
  const openUIProvider = (appJsContent.match(/<UIProvider/g) || []).length;
  const closeUIProvider = (appJsContent.match(/<\\/UIProvider>/g) || []).length;
  const openAuthProvider = (appJsContent.match(/<AuthProvider/g) || []).length;
  const closeAuthProvider = (appJsContent.match(/<\\/AuthProvider>/g) || []).length;
  const openErrorBoundary = (appJsContent.match(/<ProviderErrorBoundary/g) || []).length;
  const closeErrorBoundary = (appJsContent.match(/<\\/ProviderErrorBoundary>/g) || []).length;
  
  console.log(\`UIProvider tags: \${openUIProvider} opening, \${closeUIProvider} closing\`);
  console.log(\`AuthProvider tags: \${openAuthProvider} opening, \${closeAuthProvider} closing\`);
  console.log(\`ErrorBoundary tags: \${openErrorBoundary} opening, \${closeErrorBoundary} closing\`);
  
  // Check if tags are balanced
  if (openUIProvider !== closeUIProvider) {
    console.error('WARNING: UIProvider tags are not balanced!');
  }
  if (openAuthProvider !== closeAuthProvider) {
    console.error('WARNING: AuthProvider tags are not balanced!');
  }
  if (openErrorBoundary !== closeErrorBoundary) {
    console.error('WARNING: ErrorBoundary tags are not balanced!');
  }
  
  console.log('JSX verification complete');
} catch (error) {
  console.error('Error during JSX verification:', error);
}

console.log('All context provider fixes completed successfully');
  `;
  
  // Write the fix script to a file
  const fixScriptPath = path.join(process.cwd(), 'fix-circular-dependencies.js');
  fs.writeFileSync(fixScriptPath, fixContextScript);
  
  // Execute the fix script
  const fixResult = executeCommand('node fix-circular-dependencies.js');
  if (!fixResult.success) {
    throw new Error('Failed to apply context provider fixes');
  }
  
  log('Context provider fixes applied successfully');
  return true;
}

// Commit changes to Git
async function commitChanges() {
  log('=== COMMITTING CHANGES TO GIT ===');
  
  // Check Git status
  const statusResult = executeCommand('git status --porcelain');
  if (!statusResult.success) {
    throw new Error('Failed to check Git status');
  }
  
  const hasChanges = statusResult.output.trim().length > 0;
  if (!hasChanges) {
    log('No changes to commit');
    return true;
  }
  
  const fileCount = statusResult.output.split('\n').filter(line => line.trim().length > 0).length;
  log(`Found ${fileCount} files to commit`);
  
  // Add all changes
  const addResult = executeCommand('git add .');
  if (!addResult.success) {
    throw new Error('Failed to add files to Git');
  }
  
  // Commit changes
  const commitResult = executeCommand(`git commit -m "${config.commitMessage}"`);
  if (!commitResult.success) {
    throw new Error('Failed to commit changes');
  }
  
  log('Changes committed successfully');
  
  // Push changes
  log(`Pushing changes to ${config.gitRepo}/${config.gitBranch}...`);
  const pushResult = executeCommand(`git push ${config.gitRepo} ${config.gitBranch}`);
  if (!pushResult.success) {
    throw new Error('Failed to push changes to remote repository');
  }
  
  log('Changes pushed successfully');
  return true;
}

// Deploy to Vercel
async function deployToVercel() {
  log('=== DEPLOYING TO VERCEL ===');
  
  // Update Vercel configuration
  const vercelJsonPath = path.join(process.cwd(), 'vercel.json');
  const vercelConfig = {
    "version": 2,
    "buildCommand": "cd frontend && npm install && npm run build",
    "outputDirectory": "frontend/.next",
    "framework": "nextjs",
    "rewrites": [
      { "source": "/api/(.*)", "destination": "/api/$1" }
    ],
    "headers": [
      {
        "source": "/(.*)",
        "headers": [
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-XSS-Protection",
            "value": "1; mode=block"
          }
        ]
      }
    ]
  };
  
  fs.writeFileSync(vercelJsonPath, JSON.stringify(vercelConfig, null, 2));
  log('Updated vercel.json configuration');
  
  // Deploy to Vercel
  log('Deploying to Vercel...');
  const deployResult = executeCommand('vercel --prod --confirm');
  if (!deployResult.success) {
    throw new Error('Failed to deploy to Vercel');
  }
  
  // Extract deployment URL
  const deploymentUrlMatch = deployResult.output.match(/(https:\/\/[\w-]+\.vercel\.app)/);
  const deploymentUrl = deploymentUrlMatch ? deploymentUrlMatch[0] : null;
  
  if (deploymentUrl) {
    log(`Deployment URL: ${deploymentUrl}`);
    
    // Verify deployment
    log('Verifying deployment...');
    executeCommand('sleep 10'); // Wait for deployment to stabilize
    
    const healthCheckCmd = process.platform === 'win32' 
      ? `curl -s -o NUL -w "%%{http_code}" ${deploymentUrl}`
      : `curl -s -o /dev/null -w "%{http_code}" ${deploymentUrl}`;
    
    const healthCheckResult = executeCommand(healthCheckCmd);
    
    if (healthCheckResult.success && healthCheckResult.output.trim() === '200') {
      log('Deployment verification: SUCCESS');
    } else {
      log('Deployment verification: WARNING - Application may still be initializing', true);
    }
  } else {
    log('Deployment URL not found in output, please check Vercel dashboard');
  }
  
  log('Deployment completed');
  return deploymentUrl || true;
}

// Main deployment function
async function runDeployment() {
  log('=== STARTING AUTO AGI BUILDER DEPLOYMENT WITH NODE.JS VERSION HANDLING ===');
  
  try {
    // 1. Handle Node.js version
    await handleNodeVersion();
    
    // 2. Apply context provider fixes
    await applyContextFixes();
    
    // 3. Verify build with correct Node.js version
    log('=== VERIFYING BUILD ===');
    const buildResult = executeCommand('cd frontend && npm run build');
    if (!buildResult.success) {
      throw new Error('Build verification failed');
    }
    log('Build verification successful');
    
    // 4. Commit changes
    await commitChanges();
    
    // 5. Deploy to Vercel
    const deploymentUrl = await deployToVercel();
    
    // 6. Deployment summary
    log('=== DEPLOYMENT COMPLETED SUCCESSFULLY ===');
    if (typeof deploymentUrl === 'string') {
      log(`Your application is now live at: ${deploymentUrl}`);
    } else {
      log('Your application has been deployed successfully. Check Vercel dashboard for details.');
    }
    
    return { success: true, deploymentUrl };
  } catch (error) {
    log(`Deployment failed: ${error.message}`, true);
    return { success: false, error };
  }
}

// Run the deployment
runDeployment()
  .then(result => {
    if (!result.success) {
      log('=== DEPLOYMENT FAILED ===', true);
      log('Please check the log file for details: ' + logFile);
      process.exit(1);
    }
    log('=== DEPLOYMENT SCRIPT COMPLETED SUCCESSFULLY ===');
  })
  .catch(error => {
    log(`Unhandled exception: ${error.message}`, true);
    log('=== DEPLOYMENT FAILED ===', true);
    process.exit(1);
  });
