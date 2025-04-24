// Domain Verification Script for Auto AGI Builder
// This script checks the status of your domains in Vercel without making any changes

require('dotenv').config();
const axios = require('axios');
const dns = require('dns').promises;
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Configuration variables (loaded from .env)
const config = {
  projectId: process.env.VERCEL_PROJECT_ID || "prj_zJDsetW3XUQ8Pgw0EhEgeZVUk0Ss",
  teamId: process.env.VERCEL_TEAM_ID || "team_hIVuEbN4ena7UPqg1gt1jb6s",
  token: process.env.VERCEL_TOKEN || "",
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

// Verify domain status in Vercel
async function checkDomainVerification(domain) {
  try {
    console.log(`\nChecking Vercel status for ${domain}...`);
    
    // First check if domain exists in the project
    try {
      const domainResponse = await vercelClient.get(`/v9/projects/${config.projectId}/domains/${domain}`, {
        params: {
          teamId: config.teamId
        }
      });
      
      console.log(`✅ Domain ${domain} is registered to the project.`);
      
      const { verified, misconfigured } = domainResponse.data;
      
      if (verified) {
        console.log(`✅ Domain ${domain} is verified.`);
      } else if (misconfigured) {
        console.log(`❌ Domain ${domain} is misconfigured.`);
      } else {
        console.log(`⏳ Domain ${domain} is pending verification.`);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log(`❌ Domain ${domain} is not registered to the project.`);
        
        // Check if domain exists in team
        try {
          const teamsDomainsResponse = await vercelClient.get(`/v5/domains`, {
            params: {
              teamId: config.teamId,
              limit: 100
            }
          });
          
          const domainInTeam = teamsDomainsResponse.data.domains.find(d => d.name === domain);
          
          if (domainInTeam) {
            console.log(`ℹ️ Domain ${domain} exists in your team but is assigned to project: ${domainInTeam.projectId || 'N/A'}`);
          } else {
            console.log(`ℹ️ Domain ${domain} does not exist in your team.`);
          }
        } catch (teamError) {
          console.error('Error checking team domains:', teamError.response?.data || teamError.message);
        }
      } else {
        console.error('Error checking domain in project:', error.response?.data || error.message);
      }
    }
    
    // Check domain nameservers and DNS records
    try {
      const configResponse = await vercelClient.get(`/v8/domains/${domain}/config`, {
        params: {
          teamId: config.teamId
        }
      });
      
      const { nameservers, configuredBy, acceptedChallenges } = configResponse.data;
      
      console.log(`ℹ️ Configuration method: ${configuredBy || 'Unknown'}`);
      
      if (nameservers && nameservers.length > 0) {
        console.log('\nRequired nameservers:');
        nameservers.forEach(ns => console.log(`- ${ns}`));
      }
      
      if (acceptedChallenges && acceptedChallenges.length > 0) {
        console.log('\nAccepted verification challenges:');
        acceptedChallenges.forEach(challenge => console.log(`- ${challenge}`));
      }
    } catch (error) {
      console.error('Error checking domain configuration:', error.response?.data || error.message);
    }
    
    return true;
  } catch (error) {
    console.error(`Error checking domain verification for ${domain}:`, error.response?.data || error.message);
    return false;
  }
}

// Check DNS records for the domain
async function checkDNSRecords(domain) {
  console.log(`\nChecking DNS records for ${domain}...`);
  
  // Function to safely resolve DNS records
  const resolveSafe = async (domain, recordType) => {
    try {
      const records = await dns[`resolve${recordType}`](domain);
      return records;
    } catch (error) {
      return null;
    }
  };
  
  try {
    // Check A records
    const aRecords = await resolveSafe(domain, '');
    if (aRecords) {
      console.log('\nA Records:');
      aRecords.forEach(record => console.log(`- ${record}`));
      
      // Check for Vercel's IPs
      const hasVercelIPs = aRecords.some(ip => 
        ip === '76.76.21.21' || ip === '76.76.21.98');
      
      if (hasVercelIPs) {
        console.log('✅ Domain has Vercel A records configured.');
      } else {
        console.log('❌ Domain does not have Vercel A records (76.76.21.21 or 76.76.21.98).');
      }
    } else {
      console.log('ℹ️ No A records found for the domain.');
    }
    
    // Check NS records
    const nsRecords = await resolveSafe(domain, 'NS');
    if (nsRecords) {
      console.log('\nNS Records:');
      nsRecords.forEach(record => console.log(`- ${record}`));
      
      // Check for Vercel's nameservers
      const hasVercelNS = nsRecords.some(ns => 
        ns.includes('vercel-dns.com'));
      
      if (hasVercelNS) {
        console.log('✅ Domain is using Vercel nameservers.');
      } else {
        console.log('ℹ️ Domain is not using Vercel nameservers. This is fine if you\'re using DNS records instead.');
      }
    } else {
      console.log('ℹ️ No NS records found for the domain.');
    }
    
    // Check TXT records (for verification)
    const txtRecords = await resolveSafe(domain, 'TXT');
    if (txtRecords) {
      console.log('\nTXT Records:');
      txtRecords.forEach(record => console.log(`- ${record}`));
      
      // Check for Vercel verification
      const hasVercelTXT = txtRecords.some(txt => 
        txt.toString().includes('_vercel'));
      
      if (hasVercelTXT) {
        console.log('✅ Domain has Vercel verification TXT record.');
      } else {
        console.log('ℹ️ No Vercel verification TXT record found. You might need to add the _vercel TXT record.');
      }
    } else {
      console.log('ℹ️ No TXT records found for the domain.');
    }
    
    // Check CNAME for www subdomain
    if (domain.startsWith('www.')) {
      const cnameRecords = await resolveSafe(domain, 'CNAME');
      if (cnameRecords) {
        console.log('\nCNAME Records:');
        cnameRecords.forEach(record => console.log(`- ${record}`));
        
        // Check for Vercel CNAME
        const hasVercelCNAME = cnameRecords.some(cname => 
          cname.includes('vercel-dns.com') || cname.includes('vercel.app'));
        
        if (hasVercelCNAME) {
          console.log('✅ WWW subdomain has correct Vercel CNAME record.');
        } else {
          console.log('❌ WWW subdomain does not have Vercel CNAME record.');
        }
      } else {
        console.log('ℹ️ No CNAME records found for the www subdomain.');
      }
    }
    
    // Check MX records (for email)
    const mxRecords = await resolveSafe(domain, 'MX');
    if (mxRecords) {
      console.log('\nMX Records:');
      mxRecords.forEach(record => console.log(`- Priority: ${record.priority}, Exchange: ${record.exchange}`));
    } else {
      console.log('ℹ️ No MX records found for the domain.');
    }
    
  } catch (error) {
    console.error('Error checking DNS records:', error.message);
  }
}

// Test domain accessibility
async function testDomainAccessibility(domain) {
  console.log(`\nTesting accessibility for https://${domain}...`);
  
  try {
    const response = await axios.get(`https://${domain}`, {
      timeout: 10000,
      validateStatus: function (status) {
        return status < 500; // Accept any status code less than 500
      }
    });
    
    console.log(`✅ Domain is accessible! Status code: ${response.status}`);
    return true;
  } catch (error) {
    console.log(`❌ Domain is not accessible: ${error.message}`);
    return false;
  }
}

// Main function
async function main() {
  try {
    console.log('==== Auto AGI Builder Domain Verification ====');
    
    // Prompt for token if not provided
    await promptForToken();
    
    // Check apex domain
    await checkDomainVerification(config.domain);
    await checkDNSRecords(config.domain);
    await testDomainAccessibility(config.domain);
    
    // Check www subdomain
    await checkDomainVerification(config.wwwDomain);
    await checkDNSRecords(config.wwwDomain);
    await testDomainAccessibility(config.wwwDomain);
    
    console.log('\n==== Verification Complete ====');
    console.log('\nNext Steps:');
    console.log('1. Follow the steps in domain-configuration-plan.md to resolve any issues');
    console.log('2. Run this script again to verify your changes');
    console.log('3. Check the Vercel dashboard for additional information');
    
    rl.close();
  } catch (error) {
    console.error('\nError in verification process:', error);
    rl.close();
  }
}

// Run the main function
main();
