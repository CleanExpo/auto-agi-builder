/**
 * Fix for React Context Provider issues in Next.js prerendering
 * 
 * This script addresses two main issues:
 * 1. "ProjectProvider is not defined" error by removing redundant ProjectProvider in _app.js
 * 2. Additional provider hierarchy issues that may cause other components to fail
 */

const fs = require('fs');
const path = require('path');

console.log('===== AUTO AGI BUILDER - CONTEXT PROVIDER FIX =====');
console.log('Fixing React context provider issues in Next.js build...');

// Fix paths
const PROJECT_ROOT = path.join(process.cwd(), 'deployment', 'frontend');
const APP_JS_PATH = path.join(PROJECT_ROOT, 'pages', '_app.js');
const CONTEXTS_INDEX_PATH = path.join(PROJECT_ROOT, 'contexts', 'index.js');

// Create backup utility
function createBackup(filePath) {
  const backupPath = `${filePath}.backup`;
  fs.copyFileSync(filePath, backupPath);
  console.log(`Created backup at: ${backupPath}`);
}

// Fix _app.js
function fixAppJs() {
  console.log(`\nFIX 1: Examining _app.js at ${APP_JS_PATH}`);
  
  try {
    // Read the current _app.js file
    let appContent = fs.readFileSync(APP_JS_PATH, 'utf8');
    
    // Create a backup
    createBackup(APP_JS_PATH);
    
    // Check if the file contains the problematic ProjectProvider wrapper
    if (appContent.includes('<ProjectProvider>')) {
      console.log('Found redundant ProjectProvider wrapper in _app.js');
      
      // Replace the problematic code
      const oldCode = /{getLayout\(<ProjectProvider>\s+<Component {...pageProps} \/>\s+<\/ProjectProvider>\)}/;
      const newCode = '{getLayout(<Component {...pageProps} />)}';
      
      const updatedContent = appContent.replace(oldCode, newCode);
      
      // Write the fixed content back to the file
      fs.writeFileSync(APP_JS_PATH, updatedContent);
      
      // Verify if we actually made changes
      if (appContent === updatedContent) {
        console.log('Warning: No changes were made to the file. The pattern might not match exactly.');
        console.log('Manual fix may be required: Remove the ProjectProvider wrapper in _app.js');
      } else {
        console.log('Successfully removed redundant ProjectProvider wrapper from _app.js');
      }
    } else {
      console.log('No redundant ProjectProvider wrapper found in _app.js');
    }
  } catch (error) {
    console.error('Error fixing _app.js:', error);
  }
}

// Verify contexts/index.js provider order
function verifyContextsIndex() {
  console.log(`\nFIX 2: Verifying context provider hierarchy in ${CONTEXTS_INDEX_PATH}`);
  
  try {
    // Read the contexts/index.js file
    const indexContent = fs.readFileSync(CONTEXTS_INDEX_PATH, 'utf8');
    
    // Create a backup
    createBackup(CONTEXTS_INDEX_PATH);
    
    // Check if CombinedProvider exists and has proper nesting
    if (indexContent.includes('CombinedProvider')) {
      console.log('Found CombinedProvider in contexts/index.js');
      
      // Check for proper nesting order
      const expectedOrder = [
        'UIProvider',
        'AuthProvider',
        'LocalizationProvider',
        'NotificationProvider',
        'CollaborationProvider', 
        'ProjectProvider',
        'ClientProvider'
      ];
      
      let hasCorrectOrder = true;
      let lastFoundIndex = -1;
      
      for (const provider of expectedOrder) {
        const providerIndex = indexContent.indexOf(provider);
        if (providerIndex === -1) {
          console.log(`Warning: Could not find ${provider} in CombinedProvider`);
          hasCorrectOrder = false;
          break;
        }
        
        if (providerIndex < lastFoundIndex) {
          console.log(`Warning: ${provider} appears before previous provider, order may be incorrect`);
          hasCorrectOrder = false;
          break;
        }
        
        lastFoundIndex = providerIndex;
      }
      
      if (hasCorrectOrder) {
        console.log('Context provider hierarchy appears to be correctly ordered');
      } else {
        console.log('Provider hierarchy may need manual review and reordering');
      }
    } else {
      console.log('Warning: Could not find CombinedProvider in contexts/index.js');
    }
  } catch (error) {
    console.error('Error verifying contexts/index.js:', error);
  }
}

// Check for missing exports in context files
function verifyContextExports() {
  console.log('\nFIX 3: Verifying context exports');
  
  const contextNames = [
    'UIContext',
    'AuthContext',
    'ProjectContext',
    'ClientContext',
    'LocalizationContext',
    'NotificationContext', 
    'CollaborationContext'
  ];
  
  for (const context of contextNames) {
    const contextPath = path.join(PROJECT_ROOT, 'contexts', `${context}.js`);
    
    try {
      if (fs.existsSync(contextPath)) {
        const content = fs.readFileSync(contextPath, 'utf8');
        
        // Check for proper exports
        const defaultExport = content.includes(`export default ${context}`);
        const providerExport = content.includes(`export const ${context.replace('Context', 'Provider')}`);
        const hookExport = content.includes(`export const use${context.replace('Context', '')}`);
        
        console.log(`${context}: ${defaultExport ? '✓' : '✗'} default export, ${providerExport ? '✓' : '✗'} provider export, ${hookExport ? '✓' : '✗'} hook export`);
        
        if (!defaultExport || !providerExport || !hookExport) {
          console.log(`Warning: ${context} may be missing some exports`);
        }
      } else {
        console.log(`Warning: Could not find ${context} file`);
      }
    } catch (error) {
      console.error(`Error verifying ${context}:`, error);
    }
  }
}

// Run all fixes
function runAllFixes() {
  fixAppJs();
  verifyContextsIndex();
  verifyContextExports();
  
  console.log('\n===== PROVIDER FIX PROCESS COMPLETED =====');
  console.log('The ProjectProvider issue should now be resolved.');
  console.log('To test, try building the project:');
  console.log('cd deployment/frontend && npm run build');
}

// Execute all fixes
runAllFixes();
