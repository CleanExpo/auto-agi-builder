/**
 * Vercel Deployment Fix Script
 * 
 * This script addresses the Vercel deployment error by creating a completely fresh, standalone
 * Next.js application with the right structure for Vercel deployment.
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
  console.log('Vercel Deployment Fix Script');
  console.log('='.repeat(60));
  console.log('');

  // Define new standalone directory
  const projectDir = path.join(__dirname, 'standalone-app');
  ensureDirExists(projectDir);

  // Navigate to the project directory
  process.chdir(projectDir);
  console.log(`Working in directory: ${process.cwd()}`);

  // Create Vercel configuration to ensure fresh deployment
  writeFile(
    path.join(projectDir, 'vercel.json'),
    JSON.stringify({
      "version": 2,
      "builds": [
        {
          "src": "package.json",
          "use": "@vercel/next"
        }
      ]
    }, null, 2)
  );

  // Create directories
  const pagesDir = path.join(projectDir, 'pages');
  ensureDirExists(pagesDir);
  
  // Create minimal package.json with unique name to avoid conflicts
  const packageJson = {
    "name": "auto-agi-standalone",
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
    path.join(projectDir, 'package.json'),
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
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1>Auto AGI Builder</h1>
      <p>Standalone deployment successful</p>
      <div style={{ marginTop: '40px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>Deployment Notes</h2>
        <p>This is a minimal working deployment that demonstrates:</p>
        <ul style={{ textAlign: 'left' }}>
          <li>Successful Next.js build and Vercel deployment</li>
          <li>No context provider dependency issues</li>
          <li>Clean separation from the original codebase</li>
        </ul>
        <p>Follow the progressive enhancement approach to add features back gradually.</p>
      </div>
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
    path.join(projectDir, 'next.config.js'),
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
  console.log('\nTo deploy to Vercel as a NEW project:');
  console.log('1. Run the following command:');
  console.log('   vercel --name auto-agi-standalone');
  console.log('\nIMPORTANT: When prompted, choose to create a NEW project, NOT link to existing');
  
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readline.question('\nDeploy to Vercel now? (yes/no): ', (answer) => {
    readline.close();
    
    if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
      try {
        console.log('\nDeploying to Vercel as a NEW project...');
        execSync('vercel --name auto-agi-standalone', { stdio: 'inherit' });
        console.log('\n✅ Deployment initiated!');
      } catch (error) {
        console.error('\n❌ Deployment failed.');
        console.error('Please try deploying manually with: cd standalone-app && vercel --name auto-agi-standalone');
      }
    } else {
      console.log('\nDeployment skipped. You can deploy later by running:');
      console.log('cd standalone-app && vercel --name auto-agi-standalone');
    }
    
    console.log('\nDone!');
  });
}

// Run the main function
main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
