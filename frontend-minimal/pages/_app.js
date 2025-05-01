/**
 * App Component
 * 
 * Main entry point for the application with proper provider setup
 */

import React from 'react';
import { AppProviders } from '../contexts';
import { ErrorBoundary } from '../lib/mcp';
import { UIProvider } from '../contexts/UIContext';

function MyApp({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <UIProvider>
        <AppProviders>
          <Component {...pageProps} />
        </AppProviders>
      </UIProvider>
    </ErrorBoundary>
  );
}

export default MyApp;
