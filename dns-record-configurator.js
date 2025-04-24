// DNS Record Configurator for Auto AGI Builder on Vercel
// This script automatically configures and verifies DNS records

require('dotenv').config();
const axios = require('axios');
const dns = require('dns').promises;
const readline = require('readline');
const util = require('util');
const execPromise = util.promisify(require('child_process').exec);

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

// Get domain configuration from Vercel
async function getDomainConfiguration(domain) {
  try {
    const configResponse = await vercelClient.get(`/v8/domains/${domain}/config`, {
      params: { teamId: config.teamId }
    });
    
    return configResponse.data;
  } catch (err) {
    console.error('Error getting domain configuration:', err.response?.data || err.message);
    return null;
  }
}

// Check if domain is on Vercel
async function checkDomainOnVercel(domain, projectId) {
  try {
    const domainResponse = await vercelClient.get(`/v9/projects/${projectId}/domains/${domain}`, {
      params: { teamId: config.teamId }
    });
    
    return domainResponse.data;
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return null;
    }
    
    console.error('Error checking domain on Vercel:', err.response?.data || err.message);
    return null;
  }
}

// Get DNS provider info
async function getDNSProvider() {
  const providerQuestion = `
What DNS provider are you using? Select an option:
1. Vercel (recommended)
2. GoDaddy
3. Namecheap
4. Cloudflare
5. Route 53 (AWS)
6. Other
Enter option (1-6): `;

  const providerOption = await askQuestion(providerQuestion);
  let provider;
  
  switch (providerOption) {
    case '1':
      provider = 'vercel';
      break;
    case '2':
      provider = 'godaddy';
      break;
    case '3':
      provider = 'namecheap';
      break;
    case '4':
      provider = 'cloudflare';
      break;
    case '5':
      provider = 'route53';
      break;
    default:
      provider = 'other';
      break;
  }
  
  return provider;
}

// Check DNS records locally
async function checkDNSRecords(domain) {
  console.log(`\nChecking current DNS records for ${domain}...`);
  
  // Function to safely resolve DNS records
  const resolveSafe = async (domain, recordType) => {
    try {
      const records = await dns[`resolve${recordType}`](domain);
      return records;
    } catch (error) {
      return null;
    }
  };
  
  // Check A records
  const aRecords = await resolveSafe(domain, '');
  
  // Check CNAME records (for www subdomain)
  const cnameRecords = domain.startsWith('www.') ? await resolveSafe(domain, 'CNAME') : null;
  
  // Check NS records
  const nsRecords = await resolveSafe(domain, 'NS');
  
  // Check TXT records (for verification)
  const txtRecords = await resolveSafe(domain, 'TXT');
  
  return {
    aRecords,
    cnameRecords,
    nsRecords,
    txtRecords
  };
}

// Generate nameserver or DNS record instructions based on provider
function generateProviderInstructions(provider, dnsConfig, domainVerification) {
  let instructions = "";
  
  // Common instructions for all providers
  const basicRecords = `
## DNS Records Required

### Using A Records (Option 1)

If keeping your current nameservers, add these records:

\`\`\`
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600 (or Auto)
\`\`\`

\`\`\`
Type: A
Name: @
Value: 76.76.21.98
TTL: 3600 (or Auto)
\`\`\`

\`\`\`
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600 (or Auto)
\`\`\`
`;

  const nameserverOption = dnsConfig && dnsConfig.nameservers ? `
### Using Nameservers (Option 2 - Recommended)

Change your nameservers to:
${dnsConfig.nameservers.map(ns => `- ${ns}`).join('\n')}
` : '';

  const verificationRecord = domainVerification && domainVerification.verification && domainVerification.verification.type === 'TXT' ? `
### Verification Record

\`\`\`
Type: TXT
Name: ${domainVerification.verification.domain}
Value: ${domainVerification.verification.value}
TTL: 3600 (or Auto)
\`\`\`
` : '';

  // Provider-specific instructions
  switch(provider) {
    case 'vercel':
      instructions = `
# Vercel DNS Configuration

We recommend using Vercel as your DNS provider since it provides the simplest setup.

1. Go to https://vercel.com/dashboard
2. Navigate to "Domains"
3. Click on your domain (${config.domain})
4. Select "DNS" tab
5. Add the following A records and CNAME record
${basicRecords}

You don't need to set nameservers since Vercel is already your DNS provider.
${verificationRecord}
`;
      break;
      
    case 'godaddy':
      instructions = `
# GoDaddy DNS Configuration

${basicRecords}
${nameserverOption}
${verificationRecord}

## GoDaddy-Specific Instructions

1. Log in to your GoDaddy account
2. Go to "My Products" > Click on your domain
3. Click "Manage DNS"
4. Remove any existing A records for @ (root domain)
5. Add the A records and CNAME record listed above

If using nameservers option, instead:
1. Go to "My Products" > Click on your domain
2. Click "Manage Nameservers"
3. Select "Custom nameservers"
4. Enter the Vercel nameservers listed above
`;
      break;
      
    case 'namecheap':
      instructions = `
# Namecheap DNS Configuration

${basicRecords}
${nameserverOption}
${verificationRecord}

## Namecheap-Specific Instructions

1. Log in to your Namecheap account
2. Click "Domain List" from the left sidebar
3. Find your domain and click "Manage"
4. Click "Advanced DNS" tab
5. Remove any existing A records for @ (root domain)
6. Add the A records and CNAME record listed above

If using nameservers option, instead:
1. Click "Domain List" from the left sidebar
2. Find your domain and click "Manage"
3. Select "Nameservers" tab
4. Choose "Custom DNS" and enter the Vercel nameservers listed above
`;
      break;
      
    case 'cloudflare':
      instructions = `
# Cloudflare DNS Configuration

## Important: Disable Cloudflare Proxying

When adding these records in Cloudflare, make sure the proxy status is set to "DNS only" (gray cloud icon) NOT "Proxied" (orange cloud icon):

${basicRecords}
${verificationRecord}

## Cloudflare-Specific Instructions

1. Log in to your Cloudflare account
2. Select your domain
3. Go to the "DNS" tab
4. Remove any existing A records for @ (root domain)
5. Add the A records and CNAME record listed above
6. Make sure the proxy status is set to "DNS only" (gray cloud icon)

Note: We do not recommend using Cloudflare's nameservers with Vercel. Keep using Cloudflare's nameservers but configure the DNS records as above.
`;
      break;
      
    case 'route53':
      instructions = `
# AWS Route 53 DNS Configuration

${basicRecords}
${nameserverOption}
${verificationRecord}

## Route 53-Specific Instructions

1. Log in to the AWS Management Console
2. Go to Route 53 service
3. Click "Hosted zones"
4. Select your domain
5. Click "Create record"
6. Remove any existing A records for the apex domain (@ or empty value)
7. Add the A records and CNAME record listed above

If using nameservers option, instead:
1. Go to your domain registrar
2. Update the nameservers to the Vercel nameservers listed above
`;
      break;
      
    default:
      instructions = `
# DNS Configuration for Your Provider

${basicRecords}
${nameserverOption}
${verificationRecord}

## General Instructions

1. Log in to your DNS provider's website
2. Find the DNS management section
3. Remove any existing A records for the root domain (@)
4. Add the A records and CNAME record listed above

If using nameservers option, instead:
1. Log in to your domain registrar
2. Find the nameserver settings
3. Update the nameservers to the Vercel nameservers listed above
`;
      break;
  }
  
  return instructions;
}

// Check domain verification status
async function checkDomainVerification(domain, projectId) {
  try {
    const domainInfo = await checkDomainOnVercel(domain, projectId);
    
    if (!domainInfo) {
      console.log(`Domain ${domain} is not configured on the project yet.`);
      return { verified: false };
    }
    
    const { verified, verification } = domainInfo;
    
    if (verified) {
      console.log(`✅ Domain ${domain} is verified.`);
    } else {
      console.log(`⚠️ Domain ${domain} is not verified.`);
      if (verification) {
        console.log(`Verification type: ${verification.type}`);
        if (verification.type === 'TXT') {
          console.log(`TXT record name: ${verification.domain}`);
          console.log(`TXT record value: ${verification.value}`);
        }
      }
    }
    
    return domainInfo;
  } catch (err) {
    console.error('Error checking domain verification:', err.response?.data || err.message);
    return { verified: false };
  }
}

// Generate DNS configuration file
async function generateDNSConfigFile(provider, dnsConfig, domainVerification) {
  const instructions = generateProviderInstructions(provider, dnsConfig, domainVerification);
  
  try {
    const filename = `${provider}-dns-configuration.md`;
    await require('fs').promises.writeFile(filename, instructions);
    console.log(`\n✅ DNS instructions saved to: ${filename}`);
    return filename;
  } catch (err) {
    console.error('Error saving DNS configuration file:', err.message);
    return null;
  }
}

// Main function
async function main() {
  try {
    printHeader('DNS Configuration for Auto AGI Builder');
    
    console.log('This script will help you configure the correct DNS records for your custom domain.');
    
    // Check if domains are configured on project
    console.log('\nChecking domain configuration in Vercel...');
    
    const apexDomainInfo = await checkDomainOnVercel(config.domain, config.projectId);
    const wwwDomainInfo = await checkDomainOnVercel(config.wwwDomain, config.projectId);
    
    if (!apexDomainInfo && !wwwDomainInfo) {
      console.log(`\n⚠️ Neither domain is configured on the project. Please run the deployment process first.`);
      
      const proceed = await askQuestion('\nDo you want to proceed anyway? (yes/no): ');
      if (proceed.toLowerCase() !== 'yes') {
        console.log('Exiting...');
        rl.close();
        return;
      }
    }
    
    // Get domain configuration
    const dnsConfig = await getDomainConfiguration(config.domain);
    
    if (dnsConfig) {
      console.log('\nVercel DNS Configuration:');
      
      if (dnsConfig.nameservers && dnsConfig.nameservers.length > 0) {
        console.log('\nRecommended Nameservers:');
        dnsConfig.nameservers.forEach(ns => console.log(`- ${ns}`));
      }
      
      console.log(`\nConfiguration method: ${dnsConfig.configuredBy || 'Not configured yet'}`);
    }
    
    // Check current DNS records
    const dnsRecords = await checkDNSRecords(config.domain);
    
    if (dnsRecords.aRecords) {
      console.log('\nCurrent A Records:');
      dnsRecords.aRecords.forEach(record => console.log(`- ${record}`));
      
      // Check for Vercel's IPs
      const hasVercelIPs = dnsRecords.aRecords.some(ip => 
        ip === '76.76.21.21' || ip === '76.76.21.98');
      
      if (hasVercelIPs) {
        console.log('✅ A records are correctly configured with Vercel IPs.');
      } else {
        console.log('❌ A records do not match Vercel\'s recommended IPs (76.76.21.21 or 76.76.21.98).');
      }
    } else {
      console.log('\n❌ No A records found. DNS records need to be configured.');
    }
    
    if (dnsRecords.nsRecords) {
      console.log('\nCurrent NS Records:');
      dnsRecords.nsRecords.forEach(record => console.log(`- ${record}`));
      
      // Check for Vercel's nameservers
      const hasVercelNS = dnsRecords.nsRecords.some(ns => 
        ns.includes('vercel-dns.com'));
      
      if (hasVercelNS) {
        console.log('✅ Using Vercel nameservers.');
      } else {
        console.log('ℹ️ Not using Vercel nameservers. This is fine if you\'re configuring individual DNS records instead.');
      }
    } else {
      console.log('\n❌ No NS records found.');
    }
    
    // Get DNS provider from user
    const provider = await getDNSProvider();
    
    // Check domain verification status
    const domainVerification = await checkDomainVerification(config.domain, config.projectId);
    
    // Generate provider-specific instructions
    const instructionsFile = await generateDNSConfigFile(provider, dnsConfig, domainVerification);
    
    if (provider === 'vercel') {
      console.log('\nSince you\'re using Vercel as your DNS provider, would you like to set up the DNS records automatically?');
      const autoSetup = await askQuestion('Automatically set up DNS records? (yes/no): ');
      
      if (autoSetup.toLowerCase() === 'yes') {
        console.log('\nThis feature is not available yet. Please follow the instructions in the generated file.');
        // TODO: Implement automatic DNS record setup for Vercel DNS provider
      }
    }
    
    // Final summary
    printHeader('DNS Configuration Summary');
    
    console.log(`\nApex Domain (${config.domain}): ${apexDomainInfo?.verified ? '✅ Verified' : '❌ Not Verified'}`);
    console.log(`WWW Domain (${config.wwwDomain}): ${wwwDomainInfo?.verified ? '✅ Verified' : '❌ Not Verified'}`);
    
    console.log(`\nDNS Provider: ${provider}`);
    console.log(`DNS Configuration Instructions: ${instructionsFile}`);
    
    console.log('\nNext Steps:');
    console.log('1. Follow the DNS configuration instructions in the generated file');
    console.log('2. Wait for DNS propagation (24-48 hours)');
    console.log('3. Run this script again to verify DNS configuration');
    
    console.log('\nAfter DNS propagation is complete, your site will be accessible at:');
    console.log(`https://${config.domain}`);
    
    rl.close();
  } catch (error) {
    console.error('\nError in DNS configuration process:', error);
    rl.close();
  }
}

// Run the main function
main();
