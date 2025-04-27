/**
 * Script to add missing dependencies for UIProvider in landing-page project
 * 
 * This script updates the landing-page package.json file to include the missing dependencies
 * needed for the MCP (Model Context Protocol) system and UIProvider implementation.
 */

const fs = require('fs');
const path = require('path');

// Path configuration
const packageJsonPath = path.join('landing-page', 'package.json');

// Read the current package.json
console.log(`Reading ${packageJsonPath}...`);
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add missing dependencies
console.log('Adding missing dependencies...');

// Dependencies that need to be added
const missingDependencies = {
  "dependencies": {
    "zustand": "^4.4.1",
    "react-hot-toast": "^2.4.1",
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "@types/lodash": "^4.14.199"
  }
};

// Add missing dependencies
Object.entries(missingDependencies).forEach(([section, deps]) => {
  packageJson[section] = packageJson[section] || {};
  
  Object.entries(deps).forEach(([pkg, version]) => {
    if (!packageJson[section][pkg]) {
      packageJson[section][pkg] = version;
      console.log(`Added ${pkg}@${version} to ${section}`);
    } else {
      console.log(`${pkg} already exists in ${section}`);
    }
  });
});

// Write the updated package.json back to file
console.log('Writing updated package.json...');
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');

console.log('Package.json updated successfully!');
console.log('\nTo install the new dependencies, run:');
console.log('cd landing-page && npm install');
