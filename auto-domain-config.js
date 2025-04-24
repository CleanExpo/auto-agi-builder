// Auto Domain Configuration Script for Vercel Projects
// Requires: Node.js v14+ and npm packages: axios, dotenv

require('dotenv').config();
const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Configuration variables
const config = {
  projectId: process.env.VERCEL_PROJECT_ID || "prj_zJDsetW3XUQ8Pgw0EhEgeZVUk0Ss", // Auto AGI Builder project ID
  teamId: process.env.VERCEL_TEAM_ID || "team_hIVuEbN4ena7UPqg1gt1jb6s", // Your team ID  
  token: process.env.VERCEL_TOKEN || "", // Your Vercel API token
  domain: process.env.DOMAIN || "autoagibuilder.app",
  wwwDomain: process.env.WWW_DOMAIN || "www.autoagibuilder.app"
};

// Vercel API Client
const vercelClient = axios.create({
  baseURL: 'https://api.vercel.com',
  headers: {
    'Authorization': `Bearer ${config.token}`,
    'Content-Type': 'application/json'
  }
});

// Prompt for Vercel API token if not provided
async function promptForToken() {
  if (!config.token) {
    return new Promise(resolve => {
      rl.question('Enter your Vercel API token: ', (token) => {
        config.token = token;
        vercelClient.defaults.headers.Authorization = `Bearer ${token}`;
        resolve();
      });
    });
  }
}

// Add apex domain (e.g., autoagibuilder.app)
async function addApexDomain() {
  try {
    console.log(`Adding apex domain: ${config.domain}...`);
    
    const response = await vercelClient.post(`/v8/projects/${config.projectId}/domains`, {
      name: config.domain
    }, {
      params: {
        teamId: config.teamId
      }
    });
    
    console.log('Apex domain added successfully!');
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 400 && error.response.data.error?.code === 'domain_already_exists') {
      console.log('Apex domain already exists. Skipping...');
    } else {
      console.error('Error adding apex domain:', error.response?.data || error.message);
    }
  }
}

// Add www subdomain (e.g., www.autoagibuilder.app)
async function addWwwDomain() {
  try {
    console.log(`Adding www subdomain: ${config.wwwDomain}...`);
    
    const response = await vercelClient.post(`/v8/projects/${config.projectId}/domains`, {
      name: config.wwwDomain
    }, {
      params: {
        teamId: config.teamId
      }
    });
    
    console.log('WWW subdomain added successfully!');
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 400 && error.response.data.error?.code === 'domain_already_exists') {
      console.log('WWW subdomain already exists. Skipping...');
    } else {
      console.error('Error adding WWW subdomain:', error.response?.data || error.message);
    }
  }
}

// Check verification status of domains
async function checkDomainVerification(domain) {
  try {
    console.log(`Checking verification status for ${domain}...`);
    
    const response = await vercelClient.get(`/v8/domains/${domain}/config`, {
      params: {
        teamId: config.teamId
      }
    });
    
    const { verified, misconfigured, configuredBy, nameservers } = response.data;
    
    if (verified) {
      console.log(`✅ Domain ${domain} is verified.`);
    } else if (misconfigured) {
      console.log(`❌ Domain ${domain} is misconfigured.`);
    } else {
      console.log(`⏳ Domain ${domain} is pending verification.`);
    }
    
    if (nameservers && nameservers.length > 0) {
      console.log('\nRequired nameservers:');
      nameservers.forEach(ns => console.log(`- ${ns}`));
    }
    
    // If domain is not verified, get verification details
    if (!verified) {
      await getDomainVerification(domain);
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error checking domain verification for ${domain}:`, error.response?.data || error.message);
  }
}

// Get verification details (DNS records) for a domain
async function getDomainVerification(domain) {
  try {
    console.log(`\nGetting verification details for ${domain}...`);
    
    const response = await vercelClient.get(`/v6/domains/${domain}/verification`, {
      params: {
        teamId: config.teamId
      }
    });
    
    const { verificationRecord, aRecords = [], cnameRecords = [] } = response.data;
    
    console.log('\n=== Required DNS Records ===');
    
    if (verificationRecord) {
      console.log('\nTXT Record for Verification:');
      console.log(`Type: TXT`);
      console.log(`Name: ${verificationRecord.name}`);
      console.log(`Value: ${verificationRecord.value}`);
      console.log(`TTL: 3600 (or Auto)`);
    }
    
    if (aRecords && aRecords.length > 0) {
      console.log('\nA Records:');
      aRecords.forEach(record => {
        console.log(`Type: A`);
        console.log(`Name: ${record.name}`);
        console.log(`Value: ${record.value}`);
        console.log(`TTL: 3600 (or Auto)`);
      });
    }
    
    if (cnameRecords && cnameRecords.length > 0) {
      console.log('\nCNAME Records:');
      cnameRecords.forEach(record => {
        console.log(`Type: CNAME`);
        console.log(`Name: ${record.name}`);
        console.log(`Value: ${record.value}`);
        console.log(`TTL: 3600 (or Auto)`);
      });
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error getting verification details for ${domain}:`, error.response?.data || error.message);
  }
}

// Configure redirect from www to apex or vice versa
async function configureRedirection(source, target) {
  try {
    console.log(`\nConfiguring redirection from ${source} to ${target}...`);
    
    const response = await vercelClient.post(`/v8/projects/${config.projectId}/domains/${source}/redirect`, {
      redirect: target,
      type: "permanent"
    }, {
      params: {
        teamId: config.teamId
      }
    });
    
    console.log(`Redirection configured successfully!`);
    return response.data;
  } catch (error) {
    console.error('Error configuring redirection:', error.response?.data || error.message);
  }
}

// Main function
async function main() {
  try {
    console.log('==== Auto Domain Configuration for Vercel ====');
    
    // Prompt for token if not provided
    await promptForToken();
    
    // Add domains
    await addApexDomain();
    await addWwwDomain();
    
    // Check verification status
    await checkDomainVerification(config.domain);
    await checkDomainVerification(config.wwwDomain);
    
    // Configure redirection (WWW to apex domain)
    await configureRedirection(config.wwwDomain, config.domain);
    
    console.log('\n==== Configuration Complete ====');
    console.log('\nNext Steps:');
    console.log('1. Update your DNS records with the information provided above');
    console.log('2. Wait for DNS propagation (may take up to 24 hours)');
    console.log('3. Check the verification status in the Vercel dashboard');
    
    rl.close();
  } catch (error) {
    console.error('Error in main process:', error);
    rl.close();
  }
}

// Run the main function
main();
