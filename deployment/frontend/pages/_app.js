import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ModuleContextProvider } from '../lib/mcp';

// Global styles
import '../styles/globals.css';

/**
 * Custom App component with centralized context management
 * 
 * This uses the MCP architecture to manage all context providers in the application.
 * ModuleContextProvider handles provider ordering, error boundaries, and SSR compatibility.
 * 
 * Note: The provider registration is handled in a separate file to ensure it happens
 * only once during initialization. See: ../contexts/register-providers.js
 */
function MyApp({ Component, pageProps }) {
  const router = useRouter();
  
  // Get diagnostic mode from environment
  const enableDiagnostics = process.env.NEXT_PUBLIC_ENABLE_DIAGNOSTICS === 'true';
  
  // Import provider registration
  // This is done here to ensure it's only imported on the client side
  // and to avoid issues with SSR
  React.useEffect(() => {
    // Dynamic import to ensure this only runs on the client side
    import('../contexts/register-providers').catch(err => {
      console.error('Failed to load context providers:', err);
    });
  }, []);
  
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Auto AGI Builder</title>
      </Head>
      
      {/* 
        ModuleContextProvider handles:
        1. Proper nesting order of context providers based on dependencies
        2. Error boundaries for each provider
        3. SSR detection and safe server-side rendering
        4. Dynamic client-side only rendering for providers that need it
      */}
      <ModuleContextProvider enableDiagnostics={enableDiagnostics}>
        <Component {...pageProps} />
      </ModuleContextProvider>
    </>
  );
}

export default MyApp;
