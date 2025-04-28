// Ultimate fix for MCP registry.ts file
const fs = require('fs');
const path = require('path');

console.log('Applying ultimate fix to registry.ts...');

const registryPath = path.join('deployment', 'frontend', 'lib', 'mcp', 'registry.ts');

try {
  // Create a complete replacement for registry.ts
  const completeRegistryFile = `
import React, { createContext, useContext } from 'react';
import { ContextRegistry } from './types';

const RegistryContext = createContext<ContextRegistry | null>(null);

// Create a global registry
export const globalRegistry: ContextRegistry = Object.create(null);

/**
 * Register a context to the registry
 */
export function registerContext<T>(key: string, context: React.Context<T>) {
  if (globalRegistry[key]) {
    console.warn(\`Context with key "\${key}" already exists in the registry.\`);
  }

  globalRegistry[key] = context;
}

/**
 * Gets a context from the registry
 */
export function getContext<T>(key: string): React.Context<T> {
  const context = globalRegistry[key];

  if (!context) {
    throw new Error(\`Context with key "\${key}" not found in registry.\`);
  }

  return context as React.Context<T>;
}

/**
 * Custom hook to use the registry
 */
export function useRegistry(): ContextRegistry {
  const registry = useContext(RegistryContext);

  if (!registry) {
    throw new Error('useRegistry must be used within a RegistryProvider');
  }

  return registry;
}

/**
 * Custom hook to use a specific context from the registry
 */
export function useRegistryContext<T>(key: string): T {
  const registry = useRegistry();
  const context = registry[key];

  if (!context) {
    throw new Error(\`Context with key "\${key}" not found in registry.\`);
  }

  return useContext(context as React.Context<T>);
}

/**
 * Provider for the registry
 */
export const RegistryProvider: React.FC<{
  children: React.ReactNode;
  registry?: ContextRegistry;
}> = ({ children, registry = globalRegistry }) => {
  return (
    <RegistryContext.Provider value={registry}>
      {children}
    </RegistryContext.Provider>
  );
};
`;

  // Write the fixed content back
  fs.writeFileSync(registryPath, completeRegistryFile.trim());
  
  console.log('Successfully replaced registry.ts with correct implementation!');
} catch (error) {
  console.error('Error fixing registry.ts:', error);
  process.exit(1);
}
