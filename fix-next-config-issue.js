/**
 * Script to fix the next.config.js invalid options warning
 * Removing deprecated experimental options: 'serverComponents', 'fontLoaders'
 */

const fs = require('fs');
const path = require('path');

// Path to next.config.js
const configPath = path.join('landing-page', 'next.config.js');

console.log('Fixing Next.js config issues...');

// Read the current config
console.log(`Reading ${configPath}...`);
if (fs.existsSync(configPath)) {
  const configContent = fs.readFileSync(configPath, 'utf8');
  
  // Create a fixed version by removing deprecated options
  let fixedConfigContent = configContent;
  
  // Remove 'serverComponents' option if it exists
  fixedConfigContent = fixedConfigContent.replace(/serverComponents:\s*[^,}]+[,]?/g, '');
  
  // Remove 'fontLoaders' option if it exists
  fixedConfigContent = fixedConfigContent.replace(/fontLoaders:\s*[^,}]+[,]?/g, '');
  
  // Clean up any empty experimental objects or trailing commas
  fixedConfigContent = fixedConfigContent
    .replace(/experimental:\s*{\s*,?\s*}/g, '') // Remove empty experimental objects
    .replace(/,\s*}/g, '}') // Fix trailing commas at end of objects
    .replace(/,\s*,/g, ','); // Fix consecutive commas
  
  // Write the fixed config back
  console.log('Writing fixed Next.js config...');
  fs.writeFileSync(configPath, fixedConfigContent, 'utf8');
  
  console.log('Next.js config fixed successfully!');
} else {
  console.error(`Next.js config file not found: ${configPath}`);
}
