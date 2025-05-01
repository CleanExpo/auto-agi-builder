/**
 * Contexts Index
 * 
 * Main entry point for context providers
 */

import React from 'react';
import { SafeUIProvider } from './UIContext';

// Combined provider for all contexts
export function AppProviders({ children }) {
  return (
    <SafeUIProvider>
      {children}
    </SafeUIProvider>
  );
}

export * from './UIContext';
