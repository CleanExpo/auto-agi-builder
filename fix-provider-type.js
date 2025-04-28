// Fix for the ModuleContextProviderProps generic type issue
const fs = require('fs');
const path = require('path');

console.log('Fixing ModuleContextProviderProps generic type issue...');

// Path to the MCP directory
const mcpDir = path.join('deployment', 'frontend', 'lib', 'mcp');

// First, check and fix the types.ts file
const typesPath = path.join(mcpDir, 'types.ts');
const typesContent = fs.existsSync(typesPath) ? fs.readFileSync(typesPath, 'utf8') : '';

// Fix the types.ts file to make ModuleContextProviderProps a generic type
const fixedTypesContent = typesContent.replace(
  /export interface ModuleContextProviderProps \{/g,
  'export interface ModuleContextProviderProps<T = any> {'
);

// Fix the provider.tsx file
const providerPath = path.join(mcpDir, 'provider.tsx');
const providerContent = fs.existsSync(providerPath) ? fs.readFileSync(providerPath, 'utf8') : '';

// Update the provider function to correctly use the generic type
const fixedProviderContent = providerContent.replace(
  /const Provider: React\.FC<ModuleContextProviderProps<T>>/g,
  'const Provider: React.FC<ModuleContextProviderProps<T>>'
);

try {
  // Write the fixed files
  fs.writeFileSync(typesPath, fixedTypesContent, 'utf8');
  console.log('Fixed types.ts file to make ModuleContextProviderProps a generic type');
  
  fs.writeFileSync(providerPath, fixedProviderContent, 'utf8');
  console.log('Verified provider.tsx file is using the correct generic type');
  
  console.log('Successfully fixed ModuleContextProviderProps generic type issue!');
} catch (error) {
  console.error('Error fixing ModuleContextProviderProps issue:', error);
  process.exit(1);
}
