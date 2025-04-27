/**
 * Script to fix the registry method issue in landing-page/lib/mcp/provider.tsx
 * Error: Property 'getSortedProviders' does not exist on type 'ProviderRegistry'
 */

const fs = require('fs');
const path = require('path');

// Paths
const providerPath = path.join('landing-page', 'lib', 'mcp', 'provider.tsx');
const typesPath = path.join('landing-page', 'lib', 'mcp', 'types.ts');

console.log('Fixing registry method issue...');

// 1. Read the provider file
console.log(`Reading ${providerPath}...`);
const providerContent = fs.readFileSync(providerPath, 'utf8');

// 2. Fix the method call to use direct access instead
const fixedProviderContent = providerContent.replace(
  'const providers = registry.getSortedProviders();',
  'const providers = registry.sortedProviders;'
);

// 3. Write back the fixed provider file
console.log('Writing fixed provider file...');
fs.writeFileSync(providerPath, fixedProviderContent, 'utf8');

// 4. Verify the types.ts file contains the proper definition
console.log(`Reading ${typesPath}...`);
if (fs.existsSync(typesPath)) {
  const typesContent = fs.readFileSync(typesPath, 'utf8');
  
  // Check if the ProviderRegistry interface has the sortedProviders property
  if (!typesContent.includes('sortedProviders: RegisteredProvider[]')) {
    console.log('Adding sortedProviders to ProviderRegistry interface...');
    
    // Find the ProviderRegistry interface and add the property
    const updatedTypesContent = typesContent.replace(
      /export interface ProviderRegistry {([\s\S]*?)}/,
      'export interface ProviderRegistry {$1  sortedProviders: RegisteredProvider[];\n}'
    );
    
    // Write back the updated types file
    fs.writeFileSync(typesPath, updatedTypesContent, 'utf8');
  } else {
    console.log('ProviderRegistry interface already has sortedProviders property.');
  }
} else {
  console.error(`Types file not found: ${typesPath}`);
}

console.log('Fix completed successfully!');
console.log('Try building the application again.');
