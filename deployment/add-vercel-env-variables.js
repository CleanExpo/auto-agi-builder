#!/usr/bin/env node

/**
 * This script automates adding environment variables to your Vercel project
 * It uses the Vercel API to add the required environment variables for production
 * 
 * Prerequisites:
 * 1. Node.js installed
 * 2. Vercel CLI installed and authenticated
 * 3. A Vercel project already created
 * 
 * Usage:
 * node add-vercel-env-variables.js
 */

const { execSync } = require('child_process');
const readline = require('readline');

// Configuration - Update these values if needed
const PROJECT_ID = 'prj_7uKXTp60gosR1DMXBpOaI0hTyPEO';  // Your Vercel Project ID
const API_URL = 'https://api.autoagibuilder.com';  // Your production API URL

// Environment variables to add
const ENV_VARS = [
  {
    key: 'VERCEL_PROJECT_ID',
    value: PROJECT_ID,
    target: ['production']
  },
  {
    key: 'NEXT_PUBLIC_ENVIRONMENT',
    value: 'production',
    target: ['production']
  },
  {
    key: 'NEXT_PUBLIC_API_URL',
    value: API_URL,
    target: ['production']
  },
  {
    key: 'DISABLE_STATIC_GENERATION',
    value: 'true',
    target: ['production']
  }
];

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Check if Vercel CLI is installed and authenticated
 */
function checkVercelCLI() {
  try {
    console.log('Checking Vercel CLI...');
    execSync('vercel --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    console.error('❌ Vercel CLI is not installed. Please install it with: npm i -g vercel');
    return false;
  }
}

/**
 * Get Vercel token and team/user information
 */
function getVercelAuthInfo() {
  try {
    // Get the Vercel authentication token
    const tokenOutput = execSync('vercel whoami --token').toString().trim();
    
    // Check if we're operating within a team context
    let teamId = null;
    try {
      const teamOutput = execSync('vercel teams ls').toString();
      // Check if we're in a team context by looking for the (current) marker
      const currentTeamLine = teamOutput.split('\n').find(line => line.includes('(current)'));
      if (currentTeamLine) {
        // Extract team ID - this is simplistic and may need adjustment based on actual output format
        teamId = currentTeamLine.split(' ')[0];
      }
    } catch (error) {
      // No team or teams command failed - using personal account
      console.log('Using personal Vercel account (no team context detected)');
    }
    
    return {
      token: tokenOutput,
      teamId
    };
  } catch (error) {
    console.error('❌ Failed to get Vercel authentication info:', error.message);
    console.error('Please run "vercel login" to authenticate the Vercel CLI');
    return null;
  }
}

/**
 * Add environment variables to the Vercel project
 */
async function addEnvironmentVariables(auth, projectId, envVars) {
  console.log('Adding environment variables to Vercel project...');
  
  for (const envVar of envVars) {
    try {
      const teamParam = auth.teamId ? `--scope ${auth.teamId}` : '';
      const command = `vercel env add ${envVar.key} ${teamParam} --token ${auth.token} --project ${projectId}`;
      
      console.log(`Adding ${envVar.key}...`);
      
      // Create a child process that we can interact with
      const child = require('child_process').spawn(command, {
        shell: true,
        stdio: ['pipe', process.stdout, process.stderr]
      });
      
      // Write the variable value to stdin when prompted
      child.stdin.write(`${envVar.value}\n`);
      
      // For each target environment (production, preview, development)
      // Write 'y' or 'n' when prompted
      for (const env of ['production', 'preview', 'development']) {
        const shouldAdd = envVar.target.includes(env);
        setTimeout(() => {
          child.stdin.write(`${shouldAdd ? 'y' : 'n'}\n`);
        }, 1000);  // Wait a bit for the prompt
      }
      
      // Wait for the process to complete
      await new Promise((resolve) => {
        child.on('close', (code) => {
          if (code === 0) {
            console.log(`✅ Successfully added ${envVar.key}`);
          } else {
            console.error(`❌ Failed to add ${envVar.key}`);
          }
          resolve();
        });
      });
      
    } catch (error) {
      console.error(`❌ Failed to add ${envVar.key}:`, error.message);
    }
  }
}

/**
 * Request a redeploy of the project
 */
function requestRedeploy(auth, projectId) {
  try {
    const teamParam = auth.teamId ? `--scope ${auth.teamId}` : '';
    console.log('Requesting project redeploy...');
    execSync(`vercel deploy --prod ${teamParam} --token ${auth.token} --project ${projectId}`, { stdio: 'inherit' });
    console.log('✅ Redeploy requested');
    return true;
  } catch (error) {
    console.error('❌ Failed to request redeploy:', error.message);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('===== Vercel Environment Variables Setup =====');
  
  // Check Vercel CLI
  if (!checkVercelCLI()) {
    rl.close();
    return;
  }
  
  // Get authentication info
  const auth = getVercelAuthInfo();
  if (!auth) {
    rl.close();
    return;
  }
  
  // Confirm with the user before proceeding
  rl.question(`Are you sure you want to add environment variables to project ${PROJECT_ID}? (y/n) `, async (answer) => {
    if (answer.toLowerCase() === 'y') {
      // Add environment variables
      await addEnvironmentVariables(auth, PROJECT_ID, ENV_VARS);
      
      // Ask if user wants to redeploy
      rl.question('Do you want to redeploy the project now? (y/n) ', (answer) => {
        if (answer.toLowerCase() === 'y') {
          requestRedeploy(auth, PROJECT_ID);
        } else {
          console.log('Skipping redeploy. Remember to redeploy manually for the changes to take effect.');
        }
        
        console.log('===== Environment Variables Setup Complete =====');
        console.log('Next steps:');
        console.log('1. Verify environment variables in the Vercel dashboard');
        console.log('2. If you skipped the redeploy, manually redeploy your project');
        console.log('3. Test your application in production');
        
        rl.close();
      });
    } else {
      console.log('Operation cancelled by user');
      rl.close();
    }
  });
}

// Run the main function
main().catch(error => {
  console.error('Unexpected error:', error);
  rl.close();
});
