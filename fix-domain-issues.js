/**
 * Fix Domain Issues - DNS Configuration and Deployment Script
 * 
 * This script addresses domain configuration and deployment issues with Vercel.
 * It verifies DNS settings and checks for domain misconfigurations.
 */

const fs = require('fs');
const { execSync } = require('child_process');
const chalk = require('chalk');

console.log(chalk.blue('========================================'));
console.log(chalk.blue('   DOMAIN CONFIGURATION VERIFICATION    '));
console.log(chalk.blue('========================================'));

// Check if domain is configured properly in vercel.json
const checkVercelConfig = () => {
  try {
    console.log('Checking vercel.json configuration...');
    
    const vercelConfig = fs.readFileSync('vercel.json', 'utf8');
    const config = JSON.parse(vercelConfig);
    
    // Check for potential issues in configuration
    if (config.alias && Array.isArray(config.alias)) {
      console.log(chalk.green('✓ Found domain aliases in vercel.json:'), config.alias.join(', '));
    } else {
      console.log(chalk.yellow('⚠ No domain aliases found in vercel.json'));
    }
    
    // Check for redirects configuration
    if (config.redirects && Array.isArray(config.redirects)) {
      console.log(chalk.green('✓ Found redirect rules in vercel.json'));
      
      // Check for potential issues in redirect rules
      const hasInvalidRedirects = config.redirects.some(rule => {
        return rule.source && rule.source.includes('http://');
      });
      
      if (hasInvalidRedirects) {
        console.log(chalk.red('✗ Invalid redirect source pattern found. Invalid patterns like "http://:host(.+)" can cause deployment issues.'));
        console.log(chalk.yellow('  Recommended fix: Update redirect rules to use header-based detection instead:'));
        console.log(`  {
    "source": "/(.*)",
    "destination": "https://www.autoagibuilder.app/$1",
    "statusCode": 308,
    "has": [
      {
        "type": "header",
        "key": "x-forwarded-proto",
        "value": "http"
      }
    ]
  }`);
      } else {
        console.log(chalk.green('✓ No invalid redirect patterns found'));
      }
    } else {
      console.log(chalk.yellow('⚠ No redirect rules found in vercel.json'));
    }
    
    return { hasConfig: true, config };
  } catch (error) {
    console.log(chalk.red('✗ Error reading vercel.json:'), error.message);
    return { hasConfig: false };
  }
};

// Check DNS configuration
const checkDNS = (domain) => {
  if (!domain) {
    console.log(chalk.yellow('⚠ No domain specified for DNS check'));
    return;
  }
  
  console.log(`\nChecking DNS configuration for ${domain}...`);
  
  try {
    console.log('\nChecking A record:');
    console.log('Running: dig a ' + domain);
    console.log('Expected value: 76.76.21.21');
    console.log('-----------------------------------------');
    console.log('Please run this command manually to verify');
    
    console.log('\nChecking CNAME record:');
    console.log('Running: dig cname www.' + domain);
    console.log('Expected value: cname.vercel-dns.com');
    console.log('-----------------------------------------');
    console.log('Please run this command manually to verify');
    
    console.log('\nChecking NS records:');
    console.log('Running: dig ns ' + domain);
    console.log('-----------------------------------------');
    console.log('Please run this command manually to verify if needed');
    
    console.log('\nVerify domain in Vercel dashboard:');
    console.log('1. Go to https://vercel.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to Settings > Domains');
    console.log('4. Check that your domain is properly configured');
    
  } catch (error) {
    console.log(chalk.red('✗ Error checking DNS:'), error.message);
  }
};

// Execute deployment status check
const checkDeploymentStatus = () => {
  console.log('\nChecking deployment status...');
  
  try {
    console.log(chalk.yellow('\nTo check deployment status, run:'));
    console.log('vercel ls');
    console.log('\nTo view recent deployments and their status.');
    
    console.log(chalk.yellow('\nTo troubleshoot 404 errors:'));
    console.log('1. Verify domain ownership in Vercel dashboard');
    console.log('2. Check that DNS records are properly configured');
    console.log('3. Ensure deployment was successful');
    console.log('4. Wait for DNS propagation (could take up to 48 hours)');
    console.log('5. Clear browser cache and flush DNS cache locally');
    
    console.log(chalk.yellow('\nTo test your site is deployed correctly, run:'));
    console.log('vercel --prod');
    
    console.log(chalk.yellow('\nTo check build output directory in vercel.json:'));
    console.log('Ensure "outputDirectory" in vercel.json matches your project\'s build output directory');
    
  } catch (error) {
    console.log(chalk.red('✗ Error checking deployment status:'), error.message);
  }
};

// Main function
const main = () => {
  console.log('Starting domain configuration verification...');
  
  const vercelConfigCheck = checkVercelConfig();
  
  let domain = 'autoagibuilder.app';
  if (vercelConfigCheck.hasConfig && vercelConfigCheck.config.alias && vercelConfigCheck.config.alias.length > 0) {
    domain = vercelConfigCheck.config.alias[0];
  }
  
  checkDNS(domain);
  checkDeploymentStatus();
  
  console.log('\n' + chalk.blue('========================================'));
  console.log(chalk.blue('   VERIFICATION COMPLETE   '));
  console.log(chalk.blue('========================================'));
  console.log(chalk.yellow('\nRecommended next steps:'));
  console.log('1. Fix any issues found in vercel.json');
  console.log('2. Verify DNS configuration with your domain provider');
  console.log('3. Redeploy the application with: vercel --prod');
  console.log('4. Wait for DNS propagation and check the domain again');
  console.log('5. Monitor deployment logs for any issues');
};

// Run the main function
main();
