/**
 * Ultra Minimal Deploy Script
 * 
 * Creates the absolutely minimalist Next.js application that can be deployed,
 * explicitly removing all problematic pages and dependencies.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create directories
function ensureDirExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

// Write to file
function writeFile(filepath, content) {
  ensureDirExists(path.dirname(filepath));
  fs.writeFileSync(filepath, content);
  console.log(`Created file: ${filepath}`);
}

// Main function
async function main() {
  console.log('='.repeat(60));
  console.log('Ultra Minimal Deployment Script');
  console.log('='.repeat(60));
  console.log('');

  // Define frontend directory
  const frontendDir = path.join(__dirname, 'frontend-minimal');
  ensureDirExists(frontendDir);

  // Navigate to the frontend directory
  process.chdir(frontendDir);
  console.log(`Working in directory: ${process.cwd()}`);

  // Create directories
  const pagesDir = path.join(frontendDir, 'pages');
  ensureDirExists(pagesDir);
  
  // Create minimal package.json
  const packageJson = {
    "name": "auto-agi-builder-minimal",
    "version": "1.0.0",
    "private": true,
    "scripts": {
      "dev": "next dev",
      "build": "next build",
      "start": "next start"
    },
    "dependencies": {
      "next": "13.4.9",
      "react": "18.2.0",
      "react-dom": "18.2.0"
    }
  };
  
  writeFile(
    path.join(frontendDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  // Create minimal index.js
  writeFile(
    path.join(pagesDir, 'index.js'),
    `export default function Home() {
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '50px', 
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>Auto AGI Builder</h1>
      <p>Minimal deployment successful</p>
    </div>
  );
}`
  );

  // Create minimal _app.js
  writeFile(
    path.join(pagesDir, '_app.js'),
    `export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}`
  );

  // Create minimal next.config.js
  writeFile(
    path.join(frontendDir, 'next.config.js'),
    `/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: false,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  }
};`
  );
  
  console.log('\nInstalling dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
  } catch (error) {
    console.warn('Warning: Issue with npm install, trying with --force');
    execSync('npm install --force', { stdio: 'inherit' });
  }

  console.log('\nBuilding the application...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('\n✅ Build successful!');
  } catch (error) {
    console.error('\n❌ Build failed.');
    console.error(error.message);
    process.exit(1);
  }

  console.log('\n='.repeat(60));
  console.log('Deployment Instructions');
  console.log('='.repeat(60));
  console.log('\nTo deploy to Vercel:');
  console.log('1. Make sure you have the Vercel CLI installed:');
  console.log('   npm install -g vercel');
  console.log('\n2. Run the deployment command:');
  console.log('   vercel --prod');
  
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readline.question('\nDeploy to Vercel now? (yes/no): ', (answer) => {
    readline.close();
    
    if (answer.toLowerCase() === 'yes') {
      try {
        console.log('\nDeploying to Vercel...');
        execSync('vercel --prod', { stdio: 'inherit' });
        console.log('\n✅ Deployment initiated!');
      } catch (error) {
        console.error('\n❌ Deployment failed.');
        console.error('Please try deploying manually with: cd frontend-minimal && vercel --prod');
      }
    } else {
      console.log('\nDeployment skipped. You can deploy later by running:');
      console.log('cd frontend-minimal && vercel --prod');
    }
    
    console.log('\nDone!');
  });
}

// Run the main function
main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
