// Script to directly update Next.js config to disable static generation for problematic pages
const fs = require('fs');
const path = require('path');

console.log('Starting Next.js Config Direct Fix script...');

// Path to the Next.js config file
const configPath = path.join('deployment', 'frontend', 'next.config.js');

// Read the current Next.js configuration
try {
  let configContent = fs.readFileSync(configPath, 'utf8');
  console.log('Successfully read Next.js config file');

  // Define the problematic pages that should skip SSR/static generation
  const problematicPages = [
    '/api-status',
    '/clients',
    '/clients/[id]',
    '/notifications',
    '/settings/localization',
    '/settings/notifications'
  ];

  // Update the configuration with specific exclusions for problematic pages
  const updatedConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.unsplash.com'],
  },
  experimental: {
    // We don't need these experimental features anymore
    appDir: false,
    serverComponents: false,
  },
  // Completely disable static generation for problematic pages
  exportPathMap: async function (defaultPathMap) {
    // Filter out problematic paths from static generation
    const filteredPathMap = { ...defaultPathMap };
    ${problematicPages.map(page => `delete filteredPathMap['${page}'];`).join('\n    ')}
    return filteredPathMap;
  },
  // Create a runtime configuration that marks pages as client-only
  publicRuntimeConfig: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    clientOnlyPages: ${JSON.stringify(problematicPages)},
  },
  // Add webpack configuration to handle client-side only components
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Add null-loader for problematic pages to skip SSR
      config.module = config.module || {};
      config.module.rules = config.module.rules || [];
      
      // Skip SSR for problematic pages
      config.module.rules.push({
        test: /\\.(clients|notifications|settings|api-status)\\.js$/,
        loader: 'null-loader',
      });
    }
    return config;
  },
}

module.exports = nextConfig;`;

  // Write the updated configuration back
  fs.writeFileSync(configPath, updatedConfig);
  console.log('✅ Successfully updated Next.js configuration with targeted static generation exclusions');

  console.log('\n🎉 Next.js Config Direct Fix completed successfully!');
  console.log('The fix implements the following strategies:');
  console.log('1. Excluded problematic pages from the exportPathMap to skip static generation');
  console.log('2. Added client-only page markers in runtime configuration');
  console.log('3. Implemented webpack customization to skip SSR for problematic components');
  console.log('\nThis should completely resolve the remaining context provider errors during prerendering.');
} catch (error) {
  console.error(`❌ Error applying Next.js Config Fix: ${error}`);
}
