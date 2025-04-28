
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
      console.error(`❌ DNS ERROR for ${domain}: ${err.message}`);
    } else {
      console.log(`✅ DNS OK for ${domain}: ${addresses.join(', ')}`);
      
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
          console.log(`✅ HTTPS OK for ${domain}: Status ${res.statusCode}`);
          console.log(`   SSL Certificate: ${res.socket.getPeerCertificate().subject.CN}`);
        }
      );
      
      req.on('error', (e) => {
        console.error(`❌ HTTPS ERROR for ${domain}: ${e.message}`);
      });
      
      req.on('timeout', () => {
        console.error(`❌ HTTPS TIMEOUT for ${domain}`);
        req.abort();
      });
      
      req.end();
    }
  });
});

console.log('DNS and HTTPS checks initiated. Results will appear shortly...');
console.log('Note: Vercel SSL certificates may take up to 24 hours to provision fully.');
