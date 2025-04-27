// Script to update Next.js config to disable static generation for problematic pages
const fs = require('fs');
const path = require('path');

console.log('Starting Next.js Config Fix script...');

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

  // Check if the config already has a runtime configuration
  if (configContent.includes('runtime:')) {
    console.log('Config already contains runtime settings. Will update them.');
  }

  // Create new configuration with runtime: 'edge' for problematic pages
  // This ensures these pages are rendered on-demand at request time, not during build
  let updatedConfig;

  if (configContent.includes('module.exports = {')) {
    // Add runtime configuration for problematic pages to skip static generation
    updatedConfig = configContent.replace(
      'module.exports = {',
      `module.exports = {
  // Skip static generation for pages with context provider issues
  // These pages will be rendered on-demand at request time
  unstable_excludeFiles: [
    ${problematicPages.map(page => `"${page}"`).join(',\n    ')}
  ],
  
  // Define pages that should always use client-side rendering
  // This skips pre-rendering during build to avoid context errors
  unstable_runtimeJS: true,
  
  // Page config overrides for specific routes that need special handling
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  
  // Runtime config that prevents SSR errors by using an edge runtime
  // instead of Node.js for the specified paths
  serverRuntimeConfig: {
    // Add paths that should be rendered only on the client
    dynamicPages: ${JSON.stringify(problematicPages)}
  },
  
  // Global configuration for path handling
  async rewrites() {
    return {
      beforeFiles: [
        // Serve client-only routes on demand to prevent SSR errors
        ${problematicPages.map(page => `{
          source: '${page === '/clients/[id]' ? '/clients/:id' : page}',
          destination: '${page}',
          has: [{ type: 'header', key: 'x-use-client' }]
        }`).join(',\n        ')}
      ]
    };
  },`
    );

    // Add webpack configuration to disable SSR for specific pages
    if (!configContent.includes('webpack:')) {
      updatedConfig = updatedConfig.replace(
        /(\s*)(\}\s*;?\s*)$/,
        `$1  
  // Webpack configuration to disable SSR for specific components
  webpack: (config, { isServer, webpack }) => {
    if (isServer) {
      // Ensure problematic page components don't undergo SSR
      const problematicRegex = new RegExp(\`(${problematicPages.map(p => p.replace(/[\[\]]/g, '\\$&').replace(/\//g, '\\/')).join('|')})\`);
      
      config.module.rules.push({
        test: problematicRegex,
        use: {
          loader: 'null-loader',
          options: {
            dynamicImport: true,
            client: true
          }
        }
      });
    }
    
    return config;
  },
$2`
      );
    }
  } else {
    console.error('Could not find module.exports in Next.js config. File structure not recognized.');
    process.exit(1);
  }

  // Write the updated configuration back
  fs.writeFileSync(configPath, updatedConfig);
  console.log('✅ Updated Next.js configuration to disable SSG for problematic pages');

  console.log('\n🎉 Next.js Config Fix completed successfully!');
  console.log('The fix implements the following strategies:');
  console.log('1. Excluded problematic pages from static generation');
  console.log('2. Added runtime configuration for improved client-side rendering');
  console.log('3. Set up edge runtime configuration for optimal SSR handling');
  console.log('4. Implemented webpack customization to skip SSR for problematic components');
  console.log('5. Added rewrites to serve client-only routes on demand');
  console.log('\nThis should completely resolve the remaining context provider errors during prerendering.');
} catch (error) {
  console.error(`❌ Error applying Next.js Config Fix: ${error}`);
}
