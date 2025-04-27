#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * This script finalizes the Vercel deployment by:
 * 1. Updating environment variables with the Vercel Project ID
 * 2. Creating a .env.production file with the necessary settings
 * 3. Pushing the changes to the repository
 * 4. Triggering a build through Vercel CLI if installed
 */

// Configuration values
const VERCEL_PROJECT_ID = 'prj_7uKXTp60gosR1DMXBpOaI0hTyPEO';
const frontendDir = path.join(__dirname, 'frontend');
const envProductionPath = path.join(frontendDir, '.env.production');
const nextConfigPath = path.join(frontendDir, 'next.config.js');

console.log('=== Finalizing Vercel Deployment ===');

// Step 1: Create or update .env.production
try {
  console.log('Setting up production environment variables...');
  
  const prodEnvContent = `# Production Environment Variables
VERCEL_PROJECT_ID="${VERCEL_PROJECT_ID}"
NEXT_PUBLIC_ENVIRONMENT="production"
NEXT_PUBLIC_API_URL="https://api.autoagibuilder.com"

# Disable static generation to fix context provider errors
DISABLE_STATIC_GENERATION=true
`;

  fs.writeFileSync(envProductionPath, prodEnvContent);
  console.log(`✅ Created ${envProductionPath}`);
} catch (error) {
  console.error(`❌ Failed to create .env.production: ${error.message}`);
  process.exit(1);
}

// Step 2: Verify next.config.js has disableStaticGeneration
try {
  console.log('Verifying Next.js configuration...');
  
  let nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
  
  if (!nextConfig.includes('disableStaticGeneration: true')) {
    console.log('Adding disableStaticGeneration to Next.js config...');
    
    // Simple replacement - assumes module.exports exists
    if (nextConfig.includes('module.exports')) {
      nextConfig = nextConfig.replace(
        'module.exports = {', 
        'module.exports = {\n  experimental: {\n    disableStaticGeneration: true\n  },'
      );
      
      fs.writeFileSync(nextConfigPath, nextConfig);
      console.log(`✅ Updated ${nextConfigPath} with disableStaticGeneration`);
    } else {
      console.warn('⚠️ Could not update next.config.js - unexpected format');
      console.warn('Please manually add: experimental: { disableStaticGeneration: true }');
    }
  } else {
    console.log('✅ Next.js configuration already has disableStaticGeneration');
  }
} catch (error) {
  console.error(`❌ Failed to verify next.config.js: ${error.message}`);
}

// Step 3: Check for Git repository and commit changes
try {
  console.log('Checking Git repository status...');
  
  // Check if in a git repository
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
  } catch (error) {
    console.log('⚠️ Not in a Git repository. Skipping Git operations.');
    console.log('To complete deployment, please commit and push these changes manually.');
    process.exit(0);
  }
  
  // Add files to git
  execSync('git add .', { stdio: 'inherit' });
  
  // Commit changes
  try {
    execSync('git commit -m "Configure Vercel deployment with project ID and environmental settings"', { stdio: 'inherit' });
    console.log('✅ Changes committed');
  } catch (error) {
    console.log('ℹ️ No changes to commit or commit failed');
  }
  
  // Push to remote if available
  try {
    console.log('Pushing to remote repository...');
    execSync('git push', { stdio: 'inherit' });
    console.log('✅ Changes pushed to remote');
  } catch (error) {
    console.warn('⚠️ Failed to push to remote. You may need to push manually.');
    console.warn('Command: git push');
  }
} catch (error) {
  console.error(`❌ Git operations failed: ${error.message}`);
}

// Step 4: Check for Vercel CLI and deploy if available
try {
  console.log('Checking for Vercel CLI...');
  
  try {
    execSync('vercel --version', { stdio: 'ignore' });
    console.log('✅ Vercel CLI found');
    
    // Try to deploy using Vercel CLI
    console.log('Deploying to Vercel...');
    execSync(`cd ${frontendDir} && vercel deploy --prod`, { stdio: 'inherit' });
  } catch (error) {
    console.log('ℹ️ Vercel CLI not found or not logged in.');
    console.log('To deploy manually:');
    console.log('1. Install Vercel CLI: npm i -g vercel');
    console.log('2. Login: vercel login');
    console.log('3. Deploy: cd deployment/frontend && vercel deploy --prod');
    console.log('\nAlternatively, the push to GitHub should trigger deployment if GitHub Actions are set up correctly.');
  }
} catch (error) {
  console.error(`❌ Vercel deployment check failed: ${error.message}`);
}

console.log('\n=== Deployment Finalization Complete ===');
console.log('Your project should be building on Vercel with the configured settings.');
console.log('Project ID:', VERCEL_PROJECT_ID);
console.log('\nNext steps:');
console.log('1. Verify the build succeeds in Vercel dashboard');
console.log('2. Set up your custom domain DNS records:');
console.log('   - CNAME: www → cname.vercel-dns.com.');
console.log('   - A: @ → 76.76.21.21');
console.log('\nRefer to deployment/CUSTOM-DOMAIN-SETUP.md for detailed instructions.');
