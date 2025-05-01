/**
 * Pure Deploy - Minimal Next.js Deployment Script
 * 
 * This script creates an extremely minimal Next.js application
 * with just enough configuration to deploy to Vercel.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to create directories if they don't exist
function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

// Function to write file with content
function writeFile(filePath, content) {
  ensureDirExists(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
  console.log(`Created file: ${filePath}`);
}

// Main function
async function main() {
  try {
    console.log("======================================================");
    console.log("  Auto AGI Builder - Pure Minimal Deployment");
    console.log("======================================================");
    console.log("");

    // Check if frontend directory exists, if not create it
    const frontendDir = path.join(__dirname, 'frontend');
    ensureDirExists(frontendDir);

    // Navigate to frontend directory
    process.chdir(frontendDir);
    console.log(`Working in directory: ${process.cwd()}`);

    // Create pages directory
    const pagesDir = path.join(frontendDir, 'pages');
    ensureDirExists(pagesDir);

    // Create a simple index.js
    writeFile(path.join(pagesDir, 'index.js'), `
export default function Home() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      fontFamily: 'Arial, sans-serif' 
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Auto AGI Builder</h1>
      <p>Welcome to the Auto AGI Builder platform.</p>
      <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: '#666' }}>
        Minimal deployment version
      </p>
    </div>
  )
}
`);

    // Create _app.js
    writeFile(path.join(pagesDir, '_app.js'), `
export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}
`);

    // Create next.config.js
    writeFile(path.join(frontendDir, 'next.config.js'), `
module.exports = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true
  }
}
`);

    // Create package.json if it doesn't exist or update it
    const packageJsonPath = path.join(frontendDir, 'package.json');
    const packageJson = fs.existsSync(packageJsonPath) 
      ? JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
      : {};
    
    // Ensure essential fields are set
    packageJson.name = packageJson.name || 'auto-agi-builder-frontend';
    packageJson.version = packageJson.version || '1.0.0';
    packageJson.private = true;
    packageJson.scripts = {
      ...packageJson.scripts,
      dev: 'next dev',
      build: 'next build',
      start: 'next start'
    };
    packageJson.dependencies = {
      ...packageJson.dependencies,
      'next': '^13.4.9',
      'react': '^18.2.0',
      'react-dom': '^18.2.0'
    };

    // Write updated package.json
    writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

    // Install dependencies
    console.log("\nInstalling essential dependencies...");
    try {
      execSync('npm install react react-dom next --save --force', { stdio: 'inherit' });
    } catch (error) {
      console.warn("Warning: Dependency installation might have issues, continuing anyway...");
    }

    // Build the project
    console.log("\nBuilding the project...");
    try {
      execSync('npm run build', { stdio: 'inherit' });
      console.log("\n✅ Build successful!");
    } catch (error) {
      console.error("\n❌ Build failed!");
      console.error(error.message);

      // Try even more minimal approach
      console.log("\nAttempting even more minimal build...");
      
      // Update _app.js to be even simpler
      writeFile(path.join(pagesDir, '_app.js'), `export default ({Component, pageProps}) => <Component {...pageProps}/>`);
      
      // Update index.js to be even simpler
      writeFile(path.join(pagesDir, 'index.js'), `export default () => <h1>Auto AGI Builder</h1>`);
      
      // Simplify next.config.js further
      writeFile(path.join(frontendDir, 'next.config.js'), `module.exports = {reactStrictMode: false}`);
      
      try {
        execSync('npm run build', { stdio: 'inherit' });
        console.log("\n✅ Minimal build successful!");
      } catch (secondError) {
        console.error("\n❌ All build attempts failed!");
        console.error("Please check the error messages above for more details.");
        process.exit(1);
      }
    }

    // Instructions for Vercel deployment
    console.log("\n======================================================");
    console.log("  Deployment Instructions");
    console.log("======================================================");
    console.log("\nTo deploy to Vercel:");
    console.log("1. Make sure you have Vercel CLI installed:");
    console.log("   npm install -g vercel");
    console.log("\n2. Login to Vercel if not already logged in:");
    console.log("   vercel login");
    console.log("\n3. Run the following command in the frontend directory:");
    console.log("   vercel --prod");
    console.log("\nTo run deployment now, type 'yes'. To exit, type anything else:");

    // Prompt for deployment
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question('Deploy to Vercel now? (yes/no): ', (answer) => {
      readline.close();
      if (answer.toLowerCase() === 'yes') {
        console.log("\nDeploying to Vercel...");
        try {
          execSync('vercel --prod', { stdio: 'inherit' });
          console.log("\n✅ Deployment initiated!");
          console.log("Check your Vercel dashboard for deployment status.");
        } catch (error) {
          console.error("\n❌ Deployment failed!");
          console.error("Please ensure you have Vercel CLI installed and are logged in.");
          console.error("You can try deploying manually with 'vercel --prod'");
        }
      } else {
        console.log("\nDeployment skipped. You can deploy manually later with:");
        console.log("cd frontend && vercel --prod");
      }

      console.log("\nDone!");
    });

  } catch (error) {
    console.error("\n❌ An error occurred:");
    console.error(error);
    process.exit(1);
  }
}

// Run the main function
main();
