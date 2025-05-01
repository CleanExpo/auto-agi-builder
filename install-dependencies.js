/**
 * Install Dependencies for Auto AGI Builder
 * 
 * This script installs missing dependencies identified during the build process,
 * specifically focusing on Material UI components that are required by the ROI calculator.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting dependency installation...');

// Navigate to the frontend directory where package.json is located
const frontendDir = path.join(__dirname, 'frontend');

// Check if frontend directory exists
if (!fs.existsSync(frontendDir)) {
  console.error(`Error: Frontend directory not found at ${frontendDir}`);
  process.exit(1);
}

// Check if package.json exists
const packageJsonPath = path.join(frontendDir, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error(`Error: package.json not found at ${packageJsonPath}`);
  process.exit(1);
}

// Read package.json to check existing dependencies
console.log('Checking existing dependencies...');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const dependencies = packageJson.dependencies || {};
const devDependencies = packageJson.devDependencies || {};

// List of required Material UI dependencies
const requiredDependencies = {
  '@mui/material': '^5.14.0',
  '@mui/icons-material': '^5.14.0',
  '@emotion/react': '^11.11.0',
  '@emotion/styled': '^11.11.0',
};

// Check which dependencies are missing
const missingDependencies = [];
for (const [dep, version] of Object.entries(requiredDependencies)) {
  if (!dependencies[dep] && !devDependencies[dep]) {
    missingDependencies.push(`${dep}@${version}`);
  }
}

// Install missing dependencies
if (missingDependencies.length > 0) {
  console.log(`Installing missing dependencies: ${missingDependencies.join(', ')}`);
  
  try {
    // Change directory to frontend and install dependencies
    process.chdir(frontendDir);
    
    // Use npm to install dependencies
    const installCmd = `npm install --save ${missingDependencies.join(' ')}`;
    console.log(`Running: ${installCmd}`);
    
    execSync(installCmd, { stdio: 'inherit' });
    
    console.log('✅ Successfully installed missing dependencies');
  } catch (error) {
    console.error('❌ Error installing dependencies:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ All required dependencies are already installed');
}

// Additional check and fix for case-sensitive folder names
// The error showed 'components/ROI/BusinessMetricsForm.js' but directory might be 'components/roi'
try {
  const componentsDir = path.join(frontendDir, 'components');
  if (fs.existsSync(componentsDir)) {
    const directories = fs.readdirSync(componentsDir);
    
    // Check for case-insensitive match
    const roiDirCaseSensitive = directories.find(dir => dir.toLowerCase() === 'roi');
    if (roiDirCaseSensitive && roiDirCaseSensitive !== 'ROI') {
      console.log(`Found case sensitivity issue: 'components/${roiDirCaseSensitive}' but import uses 'components/ROI'`);
      
      // Fix imports in roi.js file
      const roiPagePath = path.join(frontendDir, 'pages', 'roi.js');
      if (fs.existsSync(roiPagePath)) {
        console.log('Fixing imports in roi.js...');
        const content = fs.readFileSync(roiPagePath, 'utf8');
        const fixedContent = content.replace(/from ['"]\.\.\/components\/ROI\//g, `from '../components/${roiDirCaseSensitive}/`);
        fs.writeFileSync(roiPagePath, fixedContent);
        console.log('✅ Fixed ROI component imports in roi.js');
      }
    }
  }
} catch (error) {
  console.error('Warning: Could not fix component path case sensitivity:', error.message);
}

console.log('\nDependency installation complete.');
console.log('\nNext steps:');
console.log('1. Run the build again: cd frontend && npm run build');
console.log('2. If successful, deploy to Vercel: vercel --prod');
console.log('3. Verify the site is now accessible');
