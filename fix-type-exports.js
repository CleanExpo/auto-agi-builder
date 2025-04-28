// Fix for the type export issue in index.ts
const fs = require('fs');
const path = require('path');

console.log('Fixing type exports in index.ts...');

// Path to the MCP directory
const mcpDir = path.join('deployment', 'frontend', 'lib', 'mcp');

// Updated index.ts content with proper type exports
const fixedIndexTsContent = `
// Main MCP library exports
import { type BaseContextState, type ContextProviderOptions, type ContextProviderRegistration, type ModuleContextProviderProps } from './types';
import { registerContextProvider, useContextProvider } from './provider';
import { registerContext, getRegisteredProviders } from './registry';
import ErrorBoundary from './error-boundary';

export {
  // Types
  type BaseContextState,
  type ContextProviderOptions,
  type ContextProviderRegistration,
  type ModuleContextProviderProps,
  
  // Provider
  registerContextProvider,
  useContextProvider,
  
  // Registry
  registerContext,
  getRegisteredProviders,
  
  // Error Boundary
  ErrorBoundary
};
`;

// Create tsconfig.json to ensure proper TypeScript configuration
const tsConfigContent = `
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
`;

try {
  // Write fixed index.ts file
  fs.writeFileSync(path.join(mcpDir, 'index.ts'), fixedIndexTsContent.trim(), 'utf8');
  console.log('Fixed index.ts file with proper type exports');
  
  // Ensure there's a tsconfig.json file at the root
  const tsConfigPath = path.join('deployment', 'frontend', 'tsconfig.json');
  if (!fs.existsSync(tsConfigPath)) {
    fs.writeFileSync(tsConfigPath, tsConfigContent.trim(), 'utf8');
    console.log('Created tsconfig.json file to ensure proper TypeScript configuration');
  }
  
  console.log('Successfully fixed TypeScript type export issues!');
} catch (error) {
  console.error('Error fixing type exports:', error);
  process.exit(1);
}
