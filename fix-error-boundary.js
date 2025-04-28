// Fix for the error-boundary.tsx file
const fs = require('fs');
const path = require('path');

console.log('Fixing error-boundary.tsx file...');

// Path to the MCP directory
const mcpDir = path.join('deployment', 'frontend', 'lib', 'mcp');

// Content for the error-boundary.tsx file with a default export
const errorBoundaryContent = `
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary component to catch errors in child components
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Return fallback UI if provided, otherwise a default error message
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <p>{this.state.error?.message || 'An error occurred'}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Export as default
export default ErrorBoundary;
`;

// Updated index.ts to properly import ErrorBoundary
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

  // Write error-boundary.tsx file
  fs.writeFileSync(path.join(mcpDir, 'error-boundary.tsx'), errorBoundaryContent.trim(), 'utf8');
  console.log('Created error-boundary.tsx file with default export');
  
  // Ensure index.ts file is correct
  fs.writeFileSync(path.join(mcpDir, 'index.ts'), fixedIndexTsContent.trim(), 'utf8');
  console.log('Updated index.ts file to properly import ErrorBoundary');
  
  console.log('Successfully fixed ErrorBoundary issue!');
} catch (error) {
  console.error('Error fixing ErrorBoundary:', error);
  process.exit(1);
}
