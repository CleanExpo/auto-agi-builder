/**
 * Fix Domain Issue Script
 * 
 * This script addresses the 404 issues with the custom domain setup by:
 * 1. Verifying domain configuration in vercel.json
 * 2. Adding proper domain aliases to ensure routing works correctly
 * 3. Setting up proper environment variables for domain routing
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting domain configuration fix...');

// Step 1: Update vercel.json with proper domain configuration
const updateVercelConfig = () => {
  try {
    console.log('Updating Vercel configuration...');
    
    const vercelConfigPath = path.join(__dirname, 'vercel.json');
    let vercelConfig = {};
    
    if (fs.existsSync(vercelConfigPath)) {
      vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
    }
    
    // Add or update domain aliases configuration
    vercelConfig.alias = vercelConfig.alias || [];
    
    // Make sure autoagibuilder.app and www.autoagibuilder.app are in aliases
    if (!vercelConfig.alias.includes('autoagibuilder.app')) {
      vercelConfig.alias.push('autoagibuilder.app');
    }
    
    if (!vercelConfig.alias.includes('www.autoagibuilder.app')) {
      vercelConfig.alias.push('www.autoagibuilder.app');
    }
    
    // Ensure we have proper redirects from HTTP to HTTPS
    vercelConfig.redirects = vercelConfig.redirects || [];
    
    // Add a redirect from non-www to www version if not present
    const hasWwwRedirect = vercelConfig.redirects.some(
      redirect => redirect.source === '/' && redirect.has && redirect.has.host === 'autoagibuilder.app'
    );
    
    if (!hasWwwRedirect) {
      vercelConfig.redirects.push({
        source: '/',
        destination: 'https://www.autoagibuilder.app',
        permanent: true,
        has: [
          {
            type: 'host',
            value: 'autoagibuilder.app'
          }
        ]
      });
    }
    
    // Add a general HTTP to HTTPS redirect if not present
    const hasHttpsRedirect = vercelConfig.redirects.some(
      redirect => redirect.source === 'http://:host(.+)' && redirect.destination === 'https://:host'
    );
    
    if (!hasHttpsRedirect) {
      vercelConfig.redirects.push({
        source: 'http://:host(.+)',
        destination: 'https://:host',
        statusCode: 308
      });
    }
    
    // Write updated config back to file
    fs.writeFileSync(vercelConfigPath, JSON.stringify(vercelConfig, null, 2));
    console.log('Vercel configuration updated successfully!');
    
    return true;
  } catch (error) {
    console.error('Error updating Vercel configuration:', error);
    return false;
  }
};

// Step 2: Update Next.js config with domain settings
const updateNextConfig = () => {
  try {
    console.log('Updating Next.js configuration...');
    
    const nextConfigPath = path.join(__dirname, 'frontend', 'next.config.js');
    
    if (!fs.existsSync(nextConfigPath)) {
      console.log('Next.js config not found at expected path. Skipping...');
      return false;
    }
    
    let configContent = fs.readFileSync(nextConfigPath, 'utf8');
    
    // Check if we already have images domains for autoagibuilder.app
    if (!configContent.includes('autoagibuilder.app')) {
      // Add domain to images config if it exists
      if (configContent.includes('images: {')) {
        configContent = configContent.replace(
          /images:\s*{([^}]*)}/,
          (match, p1) => {
            // Check if domains array exists
            if (p1.includes('domains:')) {
              // Add our domain to existing domains array
              return match.replace(
                /domains:\s*\[([^\]]*)\]/,
                (domainMatch, domains) => {
                  const existingDomains = domains.split(',').map(d => d.trim());
                  
                  if (!existingDomains.includes("'autoagibuilder.app'") && 
                      !existingDomains.includes('"autoagibuilder.app"')) {
                    return `domains: [${domains}${domains ? ', ' : ''}'autoagibuilder.app', 'www.autoagibuilder.app']`;
                  }
                  
                  return domainMatch;
                }
              );
            } else {
              // Add domains array if it doesn't exist
              return `images: {${p1}${p1.trim() ? ', ' : ''}domains: ['localhost', 'autoagibuilder.app', 'www.autoagibuilder.app']}`;
            }
          }
        );
      }
    }
    
    // Add environment variables for custom domain
    if (!configContent.includes('NEXT_PUBLIC_APP_URL')) {
      configContent = configContent.replace(
        /env:\s*{([^}]*)}/,
        (match, p1) => {
          return `env: {${p1}${p1.trim() ? ', ' : ''}
    NEXT_PUBLIC_APP_URL: 'https://www.autoagibuilder.app',
    NEXT_PUBLIC_API_URL: 'https://api.autoagibuilder.app'
  }`;
        }
      );
    }
    
    fs.writeFileSync(nextConfigPath, configContent);
    console.log('Next.js configuration updated successfully!');
    
    return true;
  } catch (error) {
    console.error('Error updating Next.js configuration:', error);
    return false;
  }
};

// Step 3: Create a utility script to verify domain settings
const createDomainVerifier = () => {
  try {
    console.log('Creating domain verification utility...');
    
    const verifierContent = `
/**
 * Domain Verification Utility
 * 
 * This script checks the status of your Vercel custom domain configuration
 * and helps diagnose any issues with DNS or SSL certificates.
 */

const https = require('https');
const dns = require('dns');

const domains = [
  'www.autoagibuilder.app',
  'autoagibuilder.app',
  'auto-agi-builder-git-main-team-agi.vercel.app'
];

console.log('Starting domain verification checks...');

// Check DNS resolution
domains.forEach(domain => {
  dns.resolve4(domain, (err, addresses) => {
    if (err) {
      console.error(\`❌ DNS ERROR for \${domain}: \${err.message}\`);
    } else {
      console.log(\`✅ DNS OK for \${domain}: \${addresses.join(', ')}\`);
      
      // Check HTTPS connection
      const req = https.request(
        { 
          hostname: domain,
          port: 443,
          path: '/',
          method: 'GET',
          timeout: 5000
        },
        (res) => {
          console.log(\`✅ HTTPS OK for \${domain}: Status \${res.statusCode}\`);
          console.log(\`   SSL Certificate: \${res.socket.getPeerCertificate().subject.CN}\`);
        }
      );
      
      req.on('error', (e) => {
        console.error(\`❌ HTTPS ERROR for \${domain}: \${e.message}\`);
      });
      
      req.on('timeout', () => {
        console.error(\`❌ HTTPS TIMEOUT for \${domain}\`);
        req.abort();
      });
      
      req.end();
    }
  });
});

console.log('DNS and HTTPS checks initiated. Results will appear shortly...');
console.log('Note: Vercel SSL certificates may take up to 24 hours to provision fully.');
`;
    
    const verifierPath = path.join(__dirname, 'verify-domains.js');
    fs.writeFileSync(verifierPath, verifierContent);
    console.log('Domain verification utility created successfully!');
    
    return true;
  } catch (error) {
    console.error('Error creating domain verification utility:', error);
    return false;
  }
};

// Main execution
try {
  const vercelConfigUpdated = updateVercelConfig();
  const nextConfigUpdated = updateNextConfig();
  const verifierCreated = createDomainVerifier();
  
  if (vercelConfigUpdated && nextConfigUpdated && verifierCreated) {
    console.log('\n✅ All domain configuration fixes have been applied successfully!');
    console.log('\nNext steps:');
    console.log('1. Commit and push these changes to your repository');
    console.log('2. Trigger a new Vercel deployment');
    console.log('3. Run "node verify-domains.js" to check domain status');
    console.log('4. If domains still show 404 errors after deployment, wait up to 24 hours for SSL certificate provisioning');
  } else {
    console.log('\n⚠️ Some domain configuration updates were not applied successfully.');
    console.log('Please check the error messages above and fix any issues manually.');
  }
} catch (error) {
  console.error('Unexpected error:', error);
}
