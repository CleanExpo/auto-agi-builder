/**
 * Fix for "ProjectProvider is not defined" error in Next.js prerendering
 * 
 * This script fixes the issue by removing the redundant ProjectProvider wrapper in _app.js
 * since ProjectProvider is already included in the CombinedProvider with proper nesting.
 */

const fs = require('fs');
const path = require('path');

// Path to the _app.js file
const appFilePath = path.join(process.cwd(), 'deployment', 'frontend', 'pages', '_app.js');

console.log('Fixing ProjectProvider issue in Next.js build...');
console.log(`Reading file: ${appFilePath}`);

try {
  // Read the current _app.js file
  let appContent = fs.readFileSync(appFilePath, 'utf8');
  
  // Create a backup of the original file
  const backupPath = `${appFilePath}.backup`;
  fs.writeFileSync(backupPath, appContent);
  console.log(`Created backup at: ${backupPath}`);
  
  // Replace the problematic code that wraps with ProjectProvider
  const oldCode = /{getLayout\(<ProjectProvider>\s+<Component {...pageProps} \/>\s+<\/ProjectProvider>\)}/;
  const newCode = '{getLayout(<Component {...pageProps} />)}';
  
  const updatedContent = appContent.replace(oldCode, newCode);
  
  // Write the fixed content back to the file
  fs.writeFileSync(appFilePath, updatedContent);
  console.log('Fixed _app.js by removing redundant ProjectProvider wrapper');
  
  // Verify if we actually made changes
  if (appContent === updatedContent) {
    console.log('Warning: No changes were made to the file. The pattern might not match exactly.');
    console.log('You might need to manually remove the ProjectProvider wrapper in _app.js');
  }
  
  console.log('\nFix completed! The ProjectProvider issue should be resolved.');
  console.log('To test, try running the Next.js build again:');
  console.log('cd deployment/frontend && npm run build');
  
} catch (error) {
  console.error('Error fixing ProjectProvider issue:', error);
  process.exit(1);
}
