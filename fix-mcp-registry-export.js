// Fix for the MCP registry.ts file to correct the export names
const fs = require('fs');
const path = require('path');

console.log('Fixing MCP registry export issue...');

// Path to the MCP directory
const mcpDir = path.join('deployment', 'frontend', 'lib', 'mcp');
const indexFile = path.join(mcpDir, 'index.ts');
const registryFile = path.join(mcpDir, 'registry.ts');

// Fix for registry.ts - ensure it exports the correct functions
const registryTsContent = `
import { createContext } from 'react';
import { ContextProviderRegistration } from './types';

// Registry to store all registered context providers
const registry = {};

/**
 * Register a context provider in the registry
 */
export function registerContext(key, registration) {
  if (registry[key]) {
    console.warn("Context provider with key " + key + " already registered. Overwriting...");
  }
  registry[key] = registration;
}

/**
 * Get all registered providers
 */
export function getRegisteredProviders() {
  return { ...registry };
}

// Provider context
export const RegistryProvider = createContext({});
`;

// Fix for index.ts - use the correct function name from registry
const fixedIndexTsContent = `
// Main MCP library exports
import { BaseContextState, ContextProviderOptions, ContextProviderRegistration, ModuleContextProviderProps } from './types';
import { registerContextProvider, useContextProvider } from './provider';
import { registerContext, getRegisteredProviders } from './registry';
import ErrorBoundary from './error-boundary';

export {
  // Types
  BaseContextState,
  ContextProviderOptions,
  ContextProviderRegistration,
  ModuleContextProviderProps,
  
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

try {
  // Create MCP directory if it doesn't exist
  if (!fs.existsSync(mcpDir)) {
    fs.mkdirSync(mcpDir, { recursive: true });
    console.log(`Created directory: ${mcpDir}`);
  }

  // Write registry.ts file
  fs.writeFileSync(registryFile, registryTsContent.trim(), 'utf8');
  console.log('Fixed registry.ts file with correct exports');
  
  // Write index.ts file
  fs.writeFileSync(indexFile, fixedIndexTsContent.trim(), 'utf8');
  console.log('Fixed index.ts file with correct imports');
  
  console.log('Successfully aligned MCP registry exports with index.ts imports!');
} catch (error) {
  console.error('Error fixing MCP files:', error);
  process.exit(1);
}
