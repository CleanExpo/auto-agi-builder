// Fix for the MCP provider.tsx and index.ts files
const fs = require('fs');
const path = require('path');

console.log('Fixing MCP provider files...');

// Path to the MCP directory
const mcpDir = path.join('deployment', 'frontend', 'lib', 'mcp');

// Fix for provider.tsx - export the correct functions
const providerTsxContent = `
import React, { createContext, useContext } from 'react';
import { BaseContextState, ContextProviderOptions, ModuleContextProviderProps } from './types';

// Create a context for provider registration
export const ProviderContext = createContext<Record<string, React.Context<any>>>({});

/**
 * Create a context provider with state management
 */
export function registerContextProvider<T extends BaseContextState>(
  options: ContextProviderOptions<T>
) {
  const Context = createContext<T | null>(null);
  
  const Provider: React.FC<ModuleContextProviderProps<T>> = ({ children, initialState }) => {
    const [state, setState] = React.useState<T>(initialState || options.defaultState);
    
    // Create the context value with state and actions
    const contextValue = {
      ...state,
      ...options.actions(setState, state)
    };
    
    return (
      <Context.Provider value={contextValue}>
        {children}
      </Context.Provider>
    );
  };
  
  function useContext_() {
    const context = useContext(Context);
    if (!context) {
      throw new Error(\`Must be used within a \${options.name} provider\`);
    }
    return context;
  }
  
  return {
    Provider,
    useContext: useContext_,
    Context
  };
}

/**
 * Use a context provider
 */
export function useContextProvider<T>(key: string): T {
  const providers = useContext(ProviderContext);
  
  if (!providers[key]) {
    throw new Error(\`Provider with key "\${key}" not found\`);
  }
  
  return useContext(providers[key]);
}
`;

// Fix for index.ts - import the correct functions from provider
const indexTsContent = `
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

  // Write provider.tsx file
  fs.writeFileSync(path.join(mcpDir, 'provider.tsx'), providerTsxContent.trim(), 'utf8');
  console.log('Fixed provider.tsx file');
  
  // Write index.ts file
  fs.writeFileSync(path.join(mcpDir, 'index.ts'), indexTsContent.trim(), 'utf8');
  console.log('Fixed index.ts file');
  
  console.log('Successfully fixed MCP provider files!');
} catch (error) {
  console.error('Error fixing MCP provider files:', error);
  process.exit(1);
}
