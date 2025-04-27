/**
 * fix-provider-options.js
 * 
 * This script fixes the property name mismatch in the MCP provider system
 * that's causing the "useUI must be used within a UIProvider" errors during SSR.
 * 
 * Problem: The TypeScript interface in types.ts defines a property called `skipSSR`,
 * but the implementation in provider.tsx is looking for `disableDuringSSR`.
 * 
 * This script replaces all instances of `options.disableDuringSSR` with `options.skipSSR`
 * in the provider implementation files.
 */

const fs = require('fs');
const path = require('path');

// Files to check and fix
const filesToFix = [
  './lib/mcp/provider.tsx',
  './lib/mcp/provider.js',
  './lib/mcp/index.ts',
  './lib/mcp/index.js'
];

// Main function to fix property name mismatch
function fixPropertyNameMismatch() {
  console.log('Starting provider options property name fix...');
  
  let fixedFiles = 0;
  
  filesToFix.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      console.log(`Processing file: ${filePath}`);
      
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      // Replace the property name in the file
      content = content.replace(/options\.disableDuringSSR/g, 'options.skipSSR');
      
      // Check if any changes were made
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Fixed property name in ${filePath}`);
        fixedFiles++;
      } else {
        console.log(`⏭️ No property name mismatch found in ${filePath}`);
      }
    } else {
      console.log(`⚠️ File not found: ${filePath}`);
    }
  });
  
  if (fixedFiles > 0) {
    console.log(`\n✅ Successfully fixed property name mismatch in ${fixedFiles} file(s).`);
    console.log('The UIProvider should now correctly check for skipSSR during server-side rendering.');
  } else {
    console.log('\n⚠️ No property name mismatches were found or fixed.');
    console.log('Either the files don\'t exist or they already use the correct property name.');
  }
}

// Run the fix
fixPropertyNameMismatch();
