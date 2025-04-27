/**
 * AUTO AGI BUILDER - UI PROVIDER CIRCULAR DEPENDENCY FIX
 * 
 * This script resolves the "useUI must be used within a UIProvider" error
 * by fixing circular dependencies between context providers.
 * 
 * The issue occurs during Next.js server-side rendering because:
 * 1. AuthProvider directly uses the useUI hook
 * 2. This creates a circular dependency since UIProvider must be initialized first
 * 3. React cannot resolve this circular initialization pattern during SSR
 * 
 * USAGE:
 * node fix-ui-provider-desktop.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  projectRoot: "C:\\Users\\PhillMcGurk\\OneDrive - Disaster Recovery\\1111\\Auto AGI Builder",
  logFile: "fix-ui-provider.log"
};

// Create logs directory
if (!fs.existsSync(path.join(config.projectRoot, 'logs'))) {
  fs.mkdirSync(path.join(config.projectRoot, 'logs'), { recursive: true });
}

// Set up log file
const logFilePath = path.join(config.projectRoot, 'logs', config.logFile);
fs.writeFileSync(logFilePath, `=== UI PROVIDER FIX STARTED AT ${new Date().toISOString()} ===\n`);

// Logger function
function log(message, isError = false) {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] ${isError ? 'ERROR: ' : ''}${message}`;
  console.log(formattedMessage);
  fs.appendFileSync(logFilePath, formattedMessage + '\n');
}

// Main function to fix the circular dependency
async function fixCircularDependency() {
  log("Starting UI Provider circular dependency fix...");
  
  try {
    // Step 1: Locate the frontend directory
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
    
    // Step 4: Read the content of both files
    const uiContextContent = fs.readFileSync(uiContextPath, 'utf8');
    const authContextContent = fs.readFileSync(authContextPath, 'utf8');
    log("Read context files content");
    
    // Step 5: Modify AuthContext.js to remove the circular dependency
    log("Modifying AuthContext.js to remove circular dependency...");
    
    // 5.1: Remove the import of useUI from UIContext
    let updatedAuthContext = authContextContent.replace(
      /import\s+\{\s*[^}]*useUI[^}]*\}\s+from\s+(['"])(.+?\/)?UIContext\1;?/,
      ''
    );
    
    // 5.2: Modify the AuthProvider component to accept UI elements as props
    updatedAuthContext = updatedAuthContext.replace(
      /export\s+(const\s+)?function\s+AuthProvider\s*\(\s*\{\s*children\s*\}\s*\)\s*\{/,
      'export function AuthProvider({ children, toast }) {'
    );
    
    // 5.3: Replace useUI hook usage with the props
    updatedAuthContext = updatedAuthContext.replace(
      /const\s+\{\s*(?:[^}]*,\s*)?toast(?:\s*,\s*[^}]*)?\s*\}\s*=\s*useUI\(\);/g,
      '// toast is now received as a prop'
    );
    
    // Step 6: Update UIContext.js to use render props
    log("Updating UIContext.js to use render props pattern...");
    
    // Check if the UIProvider already uses render props
    if (!uiContextContent.includes('children(') && !uiContextContent.includes('children instanceof Function')) {
      // Update UIProvider to support render props
      let updatedUIContext = uiContextContent.replace(
        /return\s*\(\s*<UIContext.Provider\s+value=\{([^}]+)\}\s*>\s*\{children\}\s*<\/UIContext\.Provider>\s*\);/,
        'return (\n' +
        '    <UIContext.Provider value={$1}>\n' +
        '      {typeof children === "function" ? children($1) : children}\n' +
        '    </UIContext.Provider>\n' +
        '  );'
      );
      
      // Write the updated UIContext.js file
      fs.writeFileSync(uiContextPath, updatedUIContext);
      log("Updated UIContext.js successfully");
    } else {
      log("UIContext.js already uses render props, no changes needed");
    }
    
    // Step 7: Write the updated AuthContext.js file
    fs.writeFileSync(authContextPath, updatedAuthContext);
    log("Updated AuthContext.js successfully");
    
    // Step 8: Find and update _app.js
    log("Finding and updating _app.js...");
    
    const pagesDir = path.join(frontendDir, 'pages');
    const appJsPath = path.join(pagesDir, '_app.js');
    
    if (!fs.existsSync(appJsPath)) {
      throw new Error(`_app.js not found at ${appJsPath}`);
    }
    
    const appJsContent = fs.readFileSync(appJsPath, 'utf8');
    
    // Update _app.js to use the new render props pattern
    const updatedAppJs = appJsContent.replace(
      /<UIProvider[^>]*>\s*(?:<React.Fragment>)?\s*(?:<>)?\s*<AuthProvider[^>]*>\s*<Component\s+\{\.\.\.(?:pageProps|props)\}\s*\/>/s,
      '<UIProvider>\n' +
      '      {(uiState) => (\n' +
      '        <AuthProvider toast={uiState.toast || uiState.showToast}>\n' +
      '          <Component {...pageProps} />\n' +
      '        </AuthProvider>\n' +
      '      )}\n' +
      '    </UIProvider>'
    );
    
    // Write the updated _app.js file
    fs.writeFileSync(appJsPath, updatedAppJs);
    log("Updated _app.js successfully");
    
    // Step 9: Add ErrorBoundary component
    log("Adding ErrorBoundary component...");
    
    const componentsDir = path.join(frontendDir, 'components');
    if (!fs.existsSync(componentsDir)) {
      fs.mkdirSync(componentsDir, { recursive: true });
      log("Created components directory");
    }
    
    const errorBoundaryDir = path.join(componentsDir, 'common');
    if (!fs.existsSync(errorBoundaryDir)) {
      fs.mkdirSync(errorBoundaryDir, { recursive: true });
      log("Created common components directory");
    }
    
    const errorBoundaryPath = path.join(errorBoundaryDir, 'ErrorBoundary.js');
    const errorBoundaryContent = `import { Component } from 'react';

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
}`;
    
    fs.writeFileSync(errorBoundaryPath, errorBoundaryContent);
    log("Created ErrorBoundary component");
    
    // Step 10: Update _app.js again to use the ErrorBoundary
    const appJsWithErrorBoundary = fs.readFileSync(appJsPath, 'utf8')
      .replace(
        /import\s+.*?from\s+(['"])next\/app\1;/,
        `import App from 'next/app';\nimport { ProviderErrorBoundary } from '../components/common/ErrorBoundary';`
      )
      .replace(
        /<UIProvider>/,
        '<ProviderErrorBoundary providerName="UIProvider">\n      <UIProvider>'
      )
      .replace(
        /<\/UIProvider>/,
        '</UIProvider>\n    </ProviderErrorBoundary>'
      )
      .replace(
        /<AuthProvider toast=/,
        '<ProviderErrorBoundary providerName="AuthProvider">\n          <AuthProvider toast='
      )
      .replace(
        /<\/AuthProvider>/,
        '</AuthProvider>\n        </ProviderErrorBoundary>'
      );
    
    fs.writeFileSync(appJsPath, appJsWithErrorBoundary);
    log("Updated _app.js with error boundaries");
    
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

// Run the main function
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
