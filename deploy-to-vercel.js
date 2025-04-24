// Full Deployment Script for Auto AGI Builder to Vercel with Domain Configuration
// This script handles domain consolidation, deployment, and verification

require('dotenv').config();
const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs').promises;
const readline = require('readline');
const util = require('util');
const execPromise = util.promisify(exec);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Configuration variables
const config = {
  projectId: process.env.VERCEL_PROJECT_ID || "prj_zJDsetW3XUQ8Pgw0EhEgeZVUk0Ss",
  teamId: process.env.VERCEL_TEAM_ID || "team_hIVuEbN4ena7UPqg1gt1jb6s",
  token: process.env.VERCEL_TOKEN || "ETMf43Je9tpo7EOm9XBNPvQx",
  domain: process.env.DOMAIN || "autoagibuilder.app",
  wwwDomain: process.env.WWW_DOMAIN || "www.autoagibuilder.app",
  githubRepo: process.env.GITHUB_REPO || "your-github-username/auto-agi-builder", 
  localProjectPath: process.env.LOCAL_PROJECT_PATH || "../OneDrive - Disaster Recovery/1111/Auto AGI Builder",
  production: process.env.PRODUCTION === "true"
};

// Vercel API Client
const vercelClient = axios.create({
  baseURL: 'https://api.vercel.com',
  headers: {
    'Authorization': `Bearer ${config.token}`,
    'Content-Type': 'application/json'
  }
});

// Ask a question and get user input
async function askQuestion(question) {
  return new Promise(resolve => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Print section header
function printHeader(title) {
  console.log('\n=================================================');
  console.log(`= ${title}`);
  console.log('=================================================');
}

// Step 1: Consolidate domains
async function consolidateDomains() {
  printHeader('Domain Consolidation');
  
  try {
    console.log('Checking domain assignments...');
    
    // Get team domains
    const domainsResponse = await vercelClient.get('/v5/domains', {
      params: { teamId: config.teamId }
    });
    
    // Find apex domain
    const apexDomain = domainsResponse.data.domains.find(d => d.name === config.domain);
    
    // Find www domain
    const wwwDomain = domainsResponse.data.domains.find(d => d.name === config.wwwDomain);
    
    if (!apexDomain && !wwwDomain) {
      console.log('Neither domain is currently assigned to any project.');
      return;
    }
    
    // Check if domains are assigned to the target project
    if (apexDomain && apexDomain.projectId !== config.projectId) {
      console.log(`Apex domain '${config.domain}' is assigned to project '${apexDomain.projectId}'.`);
      console.log(`Attempting to remove it from current project...`);
      
      try {
        await vercelClient.delete(`/v8/projects/${apexDomain.projectId}/domains/${config.domain}`, {
          params: { teamId: config.teamId }
        });
        console.log('Successfully removed apex domain from current project.');
      } catch (err) {
        console.error('Error removing apex domain:', err.response?.data || err.message);
        
        // Ask user to manually handle this
        console.log('\n⚠️ Please manually remove the domain from its current project:');
        console.log('1. Go to https://vercel.com/dashboard');
        console.log(`2. Navigate to project "${apexDomain.projectId}"`);
        console.log('3. Go to "Settings" > "Domains"');
        console.log(`4. Remove "${config.domain}"`);
        
        const proceed = await askQuestion('\nHave you removed the domain manually? (yes/no): ');
        if (proceed.toLowerCase() !== 'yes') {
          console.log('Continuing with other tasks, but domain consolidation may not be complete.');
        }
      }
    }
    
    if (wwwDomain && wwwDomain.projectId !== config.projectId) {
      console.log(`WWW domain '${config.wwwDomain}' is assigned to project '${wwwDomain.projectId}'.`);
      console.log(`Attempting to remove it from current project...`);
      
      try {
        await vercelClient.delete(`/v8/projects/${wwwDomain.projectId}/domains/${config.wwwDomain}`, {
          params: { teamId: config.teamId }
        });
        console.log('Successfully removed www domain from current project.');
      } catch (err) {
        console.error('Error removing www domain:', err.response?.data || err.message);
        
        // Ask user to manually handle this
        console.log('\n⚠️ Please manually remove the domain from its current project:');
        console.log('1. Go to https://vercel.com/dashboard');
        console.log(`2. Navigate to project "${wwwDomain.projectId}"`);
        console.log('3. Go to "Settings" > "Domains"');
        console.log(`4. Remove "${config.wwwDomain}"`);
        
        const proceed = await askQuestion('\nHave you removed the domain manually? (yes/no): ');
        if (proceed.toLowerCase() !== 'yes') {
          console.log('Continuing with other tasks, but domain consolidation may not be complete.');
        }
      }
    }
    
    // Add domains to target project
    console.log(`\nAttempting to add domains to target project ${config.projectId}...`);
    
    // Add apex domain
    try {
      const addApexResponse = await vercelClient.post(`/v8/projects/${config.projectId}/domains`, {
        name: config.domain
      }, {
        params: { teamId: config.teamId }
      });
      
      console.log(`✅ Successfully added ${config.domain} to target project.`);
    } catch (err) {
      if (err.response?.data?.error?.code === 'domain_already_exists') {
        console.log(`ℹ️ ${config.domain} is already assigned to the target project.`);
      } else {
        console.error('Error adding apex domain to target project:', err.response?.data || err.message);
      }
    }
    
    // Add www domain
    try {
      const addWwwResponse = await vercelClient.post(`/v8/projects/${config.projectId}/domains`, {
        name: config.wwwDomain
      }, {
        params: { teamId: config.teamId }
      });
      
      console.log(`✅ Successfully added ${config.wwwDomain} to target project.`);
    } catch (err) {
      if (err.response?.data?.error?.code === 'domain_already_exists') {
        console.log(`ℹ️ ${config.wwwDomain} is already assigned to the target project.`);
      } else {
        console.error('Error adding www domain to target project:', err.response?.data || err.message);
      }
    }
    
    // Configure domain redirection (www to apex)
    try {
      console.log('\nConfiguring www to apex domain redirection...');
      const redirectResponse = await vercelClient.post(`/v8/projects/${config.projectId}/domains/${config.wwwDomain}/redirect`, {
        redirect: config.domain,
        type: "permanent"
      }, {
        params: { teamId: config.teamId }
      });
      
      console.log('✅ Successfully configured www to apex redirection.');
    } catch (err) {
      console.error('Error configuring domain redirection:', err.response?.data || err.message);
    }
    
    console.log('\nDomain consolidation process completed.');
    
  } catch (err) {
    console.error('Error during domain consolidation:', err.response?.data || err.message);
  }
}

// Step 2: Deploy to Vercel
async function deployToVercel() {
  printHeader('Deploying to Vercel');
  
  const deploymentMethod = await askQuestion('\nHow would you like to deploy?\n1. From GitHub repo (recommended)\n2. From local files\nChoose option (1/2): ');
  
  if (deploymentMethod === '1') {
    // Deploy from GitHub
    await deployFromGithub();
  } else {
    // Deploy from local files
    await deployFromLocal();
  }
}

// Deploy from GitHub repo
async function deployFromGithub() {
  console.log('\nDeploying from GitHub repository...');
  
  try {
    // If default repo is set, use it, otherwise ask user
    let githubRepo = config.githubRepo;
    if (githubRepo === "your-github-username/auto-agi-builder") {
      githubRepo = await askQuestion('\nEnter your GitHub repository (format: username/repo): ');
    }
    
    // Get repo details
    const [owner, repo] = githubRepo.split('/');
    
    // Create deployment
    console.log('\nCreating deployment from GitHub...');
    
    const createDeploymentResponse = await vercelClient.post('/v13/deployments', {
      name: 'auto-agi-builder',
      gitSource: {
        type: 'github',
        repo: githubRepo,
        ref: 'main'
      },
      target: config.production ? 'production' : 'preview',
      projectSettings: {
        framework: 'nextjs'
      }
    }, {
      params: { teamId: config.teamId }
    });
    
    const deploymentId = createDeploymentResponse.data.id;
    const deploymentUrl = createDeploymentResponse.data.url;
    
    console.log(`\n✅ Deployment created with ID: ${deploymentId}`);
    console.log(`Deployment URL: https://${deploymentUrl}`);
    
    // Poll deployment status
    await pollDeploymentStatus(deploymentId);
    
  } catch (err) {
    console.error('Error deploying from GitHub:', err.response?.data || err.message);
    
    console.log('\n⚠️ Automatic deployment from GitHub failed.');
    console.log('Please deploy manually through the Vercel dashboard:');
    console.log('1. Go to https://vercel.com/dashboard');
    console.log(`2. Navigate to project "${config.projectId}"`);
    console.log('3. Connect your GitHub repository');
    console.log('4. Deploy from the main branch');
    
    const proceed = await askQuestion('\nHave you deployed manually? (yes/no): ');
    if (proceed.toLowerCase() !== 'yes') {
      console.log('Continuing with other tasks, but deployment may not be complete.');
    }
  }
}

// Deploy from local files
async function deployFromLocal() {
  console.log('\nDeploying from local files...');
  
  try {
    // Check if local path exists
    let localPath = config.localProjectPath;
    if (localPath === "../OneDrive - Disaster Recovery/1111/Auto AGI Builder") {
      localPath = await askQuestion('\nEnter the path to your local project: ');
    }
    
    // Install Vercel CLI if needed
    console.log('\nChecking if Vercel CLI is installed...');
    try {
      await execPromise('vercel --version');
      console.log('Vercel CLI is already installed.');
    } catch (err) {
      console.log('Installing Vercel CLI...');
      await execPromise('npm install -g vercel');
      console.log('Vercel CLI installed successfully.');
    }
    
    // Login to Vercel (token-based)
    console.log('\nSetting up Vercel CLI authentication...');
    try {
      // Create .vercel directory if it doesn't exist
      await fs.mkdir('.vercel', { recursive: true });
      
      // Create project.json
      const projectJson = {
        projectId: config.projectId,
        orgId: config.teamId
      };
      await fs.writeFile('.vercel/project.json', JSON.stringify(projectJson, null, 2));
      
      console.log('Project configuration created.');
    } catch (err) {
      console.error('Error setting up Vercel project configuration:', err);
    }
    
    // Deploy using Vercel CLI
    console.log('\nDeploying to Vercel...');
    
    const deployCommand = `cd "${localPath}" && vercel deploy ${config.production ? '--prod' : ''} --token ${config.token}`;
    const { stdout, stderr } = await execPromise(deployCommand);
    
    if (stderr) {
      console.error('Deployment error:', stderr);
    } else {
      console.log('Deployment output:', stdout);
      
      // Extract deployment URL
      const urlMatch = stdout.match(/(https:\/\/[\w.-]+\.vercel\.app)/);
      if (urlMatch && urlMatch[1]) {
        console.log(`\n✅ Deployment successful!`);
        console.log(`Deployment URL: ${urlMatch[1]}`);
      } else {
        console.log('\n✅ Deployment completed, but could not extract URL.');
        console.log('Please check your Vercel dashboard for deployment status.');
      }
    }
    
  } catch (err) {
    console.error('Error deploying from local files:', err);
    
    console.log('\n⚠️ Automatic deployment from local files failed.');
    console.log('Please deploy manually through the Vercel dashboard or CLI.');
    
    const proceed = await askQuestion('\nHave you deployed manually? (yes/no): ');
    if (proceed.toLowerCase() !== 'yes') {
      console.log('Continuing with other tasks, but deployment may not be complete.');
    }
  }
}

// Poll deployment status
async function pollDeploymentStatus(deploymentId) {
  console.log('\nChecking deployment status...');
  
  let isDeployed = false;
  let attempts = 0;
  const maxAttempts = 20; // 5 minutes (15 seconds * 20)
  
  while (!isDeployed && attempts < maxAttempts) {
    try {
      const statusResponse = await vercelClient.get(`/v13/deployments/${deploymentId}`, {
        params: { teamId: config.teamId }
      });
      
      const status = statusResponse.data.readyState;
      console.log(`Deployment status: ${status}`);
      
      if (status === 'READY') {
        isDeployed = true;
        console.log('\n✅ Deployment completed successfully!');
        console.log(`Production URL: https://${config.domain}`);
        break;
      } else if (status === 'ERROR') {
        console.error('\n❌ Deployment failed!');
        console.log('Please check the Vercel dashboard for error details.');
        break;
      }
      
      // Wait before checking again
      await new Promise(resolve => setTimeout(resolve, 15000)); // 15 seconds
      attempts++;
      
    } catch (err) {
      console.error('Error checking deployment status:', err.response?.data || err.message);
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 15000)); // 15 seconds
    }
  }
  
  if (attempts >= maxAttempts) {
    console.log('\n⚠️ Timeout while waiting for deployment to complete.');
    console.log('The deployment may still be in progress. Please check the Vercel dashboard.');
  }
}

// Step 3: Configure environment variables
async function configureEnvironmentVariables() {
  printHeader('Environment Variables Configuration');
  
  try {
    // First, get current environment variables
    const envResponse = await vercelClient.get(`/v8/projects/${config.projectId}/env`, {
      params: { teamId: config.teamId }
    });
    
    const currentEnvVars = envResponse.data.envs || [];
    console.log(`Found ${currentEnvVars.length} existing environment variables.`);
    
    // Ask if user wants to add new variables
    const addEnv = await askQuestion('\nDo you want to add or update environment variables? (yes/no): ');
    
    if (addEnv.toLowerCase() === 'yes') {
      let addingVars = true;
      
      while (addingVars) {
        const varName = await askQuestion('\nEnter environment variable name (or "done" to finish): ');
        
        if (varName.toLowerCase() === 'done') {
          addingVars = false;
          continue;
        }
        
        const varValue = await askQuestion(`Enter value for ${varName}: `);
        const varType = await askQuestion(`Is this variable for "production", "preview", "development", or "all"? `);
        
        // Determine target based on user input
        let target;
        switch (varType.toLowerCase()) {
          case 'production':
            target = ['production'];
            break;
          case 'preview':
            target = ['preview'];
            break;
          case 'development':
            target = ['development'];
            break;
          case 'all':
          default:
            target = ['production', 'preview', 'development'];
            break;
        }
        
        // Check if variable already exists
        const existingVar = currentEnvVars.find(v => v.key === varName);
        
        if (existingVar) {
          console.log(`Updating environment variable "${varName}"...`);
          
          // Update existing variable
          await vercelClient.patch(`/v8/projects/${config.projectId}/env/${existingVar.id}`, {
            value: varValue,
            target
          }, {
            params: { teamId: config.teamId }
          });
          
          console.log(`✅ Environment variable "${varName}" updated.`);
        } else {
          console.log(`Adding new environment variable "${varName}"...`);
          
          // Add new variable
          await vercelClient.post(`/v8/projects/${config.projectId}/env`, {
            key: varName,
            value: varValue,
            target,
            type: 'plain'
          }, {
            params: { teamId: config.teamId }
          });
          
          console.log(`✅ Environment variable "${varName}" added.`);
        }
      }
      
      // Ask if deployment should be restarted
      const restartDeploy = await askQuestion('\nDo you want to redeploy to apply the new environment variables? (yes/no): ');
      
      if (restartDeploy.toLowerCase() === 'yes') {
        // Trigger a new deployment
        console.log('\nTriggering new deployment for environment variables to take effect...');
        await deployToVercel();
      } else {
        console.log('\nSkipping redeployment. Environment variables will be applied on the next deployment.');
      }
      
    } else {
      console.log('Skipping environment variables configuration.');
    }
    
  } catch (err) {
    console.error('Error configuring environment variables:', err.response?.data || err.message);
  }
}

// Step 4: Verify domain DNS settings
async function verifyDomainSettings() {
  printHeader('Domain Verification and DNS Settings');
  
  try {
    // Check domain verification status
    console.log(`Checking verification status for ${config.domain}...`);
    
    const domainResponse = await vercelClient.get(`/v9/projects/${config.projectId}/domains/${config.domain}`, {
      params: { teamId: config.teamId }
    });
    
    const { verified, verification } = domainResponse.data;
    
    if (verified) {
      console.log(`✅ Domain ${config.domain} is verified.`);
    } else {
      console.log(`⚠️ Domain ${config.domain} is not verified.`);
      
      if (verification && verification.type === 'TXT') {
        console.log('\nYou need to add the following TXT record to your DNS settings:');
        console.log(`Name/Host: ${verification.domain}`);
        console.log(`Value/Content: ${verification.value}`);
      }
      
      // Get domain configuration
      const configResponse = await vercelClient.get(`/v8/domains/${config.domain}/config`, {
        params: { teamId: config.teamId }
      });
      
      if (configResponse.data.nameservers && configResponse.data.nameservers.length > 0) {
        console.log('\nYou need to configure your nameservers to:');
        configResponse.data.nameservers.forEach(ns => console.log(`- ${ns}`));
      }
      
      console.log('\nAlternatively, add these A records to your current DNS settings:');
      console.log('Name/Host: @');
      console.log('Value/Content: 76.76.21.21');
      console.log('TTL: 3600 (or Auto)');
      
      console.log('\nAnd add this CNAME record for the www subdomain:');
      console.log('Name/Host: www');
      console.log('Value/Content: cname.vercel-dns.com');
      console.log('TTL: 3600 (or Auto)');
      
      // Ask if user has updated DNS
      const dnsUpdated = await askQuestion('\nHave you updated your DNS settings? (yes/no): ');
      
      if (dnsUpdated.toLowerCase() === 'yes') {
        console.log('\nDNS changes may take up to 48 hours to propagate.');
        console.log('You can re-run this script later to check verification status.');
      }
    }
    
  } catch (err) {
    console.error('Error verifying domain settings:', err.response?.data || err.message);
  }
}

// Main function
async function main() {
  try {
    console.log('==== Auto AGI Builder Deployment to Vercel ====');
    
    // Step 1: Consolidate domains
    await consolidateDomains();
    
    // Step 2: Deploy to Vercel
    await deployToVercel();
    
    // Step 3: Configure environment variables
    await configureEnvironmentVariables();
    
    // Step 4: Verify domain settings
    await verifyDomainSettings();
    
    console.log('\n==== Deployment Process Complete ====');
    console.log('\nYour Auto AGI Builder application should now be deployed to Vercel.');
    console.log(`Once DNS propagation is complete, it will be accessible at https://${config.domain}`);
    
    rl.close();
  } catch (error) {
    console.error('\nError in deployment process:', error);
    rl.close();
  }
}

// Run the main function
main();
