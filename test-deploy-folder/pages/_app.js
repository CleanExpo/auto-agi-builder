import React from 'react';
import '../styles/globals.css';
import { UIProvider } from '../contexts/UIContext';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { ClientProvider } from '../contexts/ClientProvider';
import { AuthProvider } from '../contexts/AuthProvider';

/**
 * Custom App component
 * 
 * This is the root component that wraps all pages.
 * The order of providers is critical - UI provider must come first
 * to handle SSR compatibility issues.
 */
function MyApp({ Component, pageProps }) {
  // Use a key to force re-mount on route changes - helps with state issues
  return (
    <ErrorBoundary>
      <UIProvider>
        <AuthProvider>
        <ClientProvider>
          {/* If the page has a custom layout, use it */}
          {Component.getLayout ? (
            Component.getLayout(<Component {...pageProps} />)
          ) : (
            <Component {...pageProps} />
          )}
        </ClientProvider>
      </AuthProvider>
    </UIProvider>
  </ErrorBoundary>
);
}

export default MyApp;
