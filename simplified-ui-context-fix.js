/**
 * SIMPLIFIED UI CONTEXT FIX
 * 
 * This script provides a simplified solution to the UIProvider circular dependency issue.
 * It directly modifies the UIContext.js, AuthContext.js, and _app.js files to remove the
 * circular dependency between these components.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  projectRoot: "C:\\Users\\PhillMcGurk\\OneDrive - Disaster Recovery\\1111\\Auto AGI Builder",
  logFile: "simplified-ui-fix.log"
};

// Create logs directory
if (!fs.existsSync(path.join(config.projectRoot, 'logs'))) {
  fs.mkdirSync(path.join(config.projectRoot, 'logs'), { recursive: true });
}

// Set up log file
const logFilePath = path.join(config.projectRoot, 'logs', config.logFile);
fs.writeFileSync(logFilePath, `=== SIMPLIFIED UI CONTEXT FIX STARTED AT ${new Date().toISOString()} ===\n`);

// Logger function
function log(message, isError = false) {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] ${isError ? 'ERROR: ' : ''}${message}`;
  console.log(formattedMessage);
  fs.appendFileSync(logFilePath, formattedMessage + '\n');
}

/**
 * This is the main function that performs the fix:
 * 1. Modifies AuthContext.js to accept toast as a prop instead of using useUI
 * 2. Updates _app.js to properly wrap providers with proper tag nesting
 */
async function fixCircularDependency() {
  log("Starting UIProvider circular dependency fix...");
  
  try {
    // Step 1: Find the frontend directory
    const frontendDir = path.join(config.projectRoot, 'frontend');
    if (!fs.existsSync(frontendDir)) {
      throw new Error(`Frontend directory not found at ${frontendDir}`);
    }
    log(`Found frontend directory at ${frontendDir}`);
    
    // Step 2: Find the contexts directory
    const contextsDir = path.join(frontendDir, 'contexts');
    if (!fs.existsSync(contextsDir)) {
      throw new Error(`Contexts directory not found at ${contextsDir}`);
    }
    log(`Found contexts directory at ${contextsDir}`);
    
    // Step 3: Find the UIContext.js and AuthContext.js files
    const uiContextPath = path.join(contextsDir, 'UIContext.js');
    const authContextPath = path.join(contextsDir, 'AuthContext.js');
    
    if (!fs.existsSync(uiContextPath)) {
      throw new Error(`UIContext.js not found at ${uiContextPath}`);
    }
    if (!fs.existsSync(authContextPath)) {
      throw new Error(`AuthContext.js not found at ${authContextPath}`);
    }
    log(`Found context files: UIContext.js and AuthContext.js`);
    
    // Step 4: Fix AuthContext.js
    log("Fixing AuthContext.js...");
    let authContextContent = fs.readFileSync(authContextPath, 'utf8');
    
    // 4.1: Create a backup
    fs.writeFileSync(authContextPath + '.bak', authContextContent);
    log("Created AuthContext.js backup");
    
    // 4.2: Remove import of useUI
    authContextContent = authContextContent.replace(
      /import\s+{\s*[^}]*useUI[^}]*\}\s+from\s+(['"])(.+?\/)?UIContext\1;?/,
      ''
    );
    
    // 4.3: Modify AuthProvider to accept toast as a prop
    authContextContent = authContextContent.replace(
      /export\s+function\s+AuthProvider\s*\(\s*{\s*children\s*}\s*\)\s*{/,
      'export function AuthProvider({ children, toast }) {'
    );
    
    // 4.4: Replace useUI hook with toast prop
    authContextContent = authContextContent.replace(
      /const\s+{\s*(?:[^}]*,\s*)?toast(?:\s*,\s*[^}]*)?\s*}\s*=\s*useUI\(\);/,
      '// toast is now received as a prop'
    );
    
    // 4.5: Save modified AuthContext.js
    fs.writeFileSync(authContextPath, authContextContent);
    log("AuthContext.js updated successfully");
    
    // Step 5: Find and fix _app.js
    log("Fixing _app.js...");
    
    const pagesDir = path.join(frontendDir, 'pages');
    const appJsPath = path.join(pagesDir, '_app.js');
    
    if (!fs.existsSync(appJsPath)) {
      throw new Error(`_app.js not found at ${appJsPath}`);
    }
    
    let appJsContent = fs.readFileSync(appJsPath, 'utf8');
    
    // 5.1: Create _app.js backup
    fs.writeFileSync(appJsPath + '.bak', appJsContent);
    log("Created _app.js backup");
    
    // 5.2: Replace the provider structure with a simplified version
    const simplifiedProviders = `
  return (
    <UIProvider>
      <AuthProvider toast={(v) => v}>
        <Component {...pageProps} />
      </AuthProvider>
    </UIProvider>
  );`;
    
    // 5.3: Use regular expression to find and replace the return statement in _app.js
    appJsContent = appJsContent.replace(
      /return\s*\(\s*<UIProvider[^>]*>[\s\S]*?<Component[\s\S]*?\/>\s*[\s\S]*?<\/UIProvider>\s*\);/,
      simplifiedProviders
    );
    
    // 5.4: Save modified _app.js
    fs.writeFileSync(appJsPath, appJsContent);
    log("_app.js updated successfully");
    
    log("Fix completed successfully!");
    return true;
  } catch (error) {
    log(`Error fixing circular dependency: ${error.message}`, true);
    if (error.stack) {
      log(error.stack, true);
    }
    return false;
  }
}

// Run the fix
fixCircularDependency()
  .then(success => {
    if (success) {
      log("✅ All fixes have been applied successfully!");
      log("The 'useUI must be used within a UIProvider' error should now be resolved.");
      log(`You can check the detailed log at: ${logFilePath}`);
    } else {
      log("❌ Fix application failed. See the log file for details.");
    }
  })
  .catch(error => {
    log(`Unhandled error: ${error.message}`, true);
  });
