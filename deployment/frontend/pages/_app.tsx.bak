import React from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ModuleContextProvider, registerContextProvider } from '../lib/mcp';

// Global styles
import '../styles/globals.css';

// Import UI Context implementation
import UIProvider from '../contexts/UIContext';
import { useUI } from '../contexts/UIContext';

// Import Auth Context implementation
import AuthProvider from '../contexts/AuthContext';
import { useAuth } from '../contexts/AuthContext';

// Import Project Context implementation
import ProjectProvider from '../contexts/ProjectContext';
import { useProject } from '../contexts/ProjectContext';

// Import Client Context implementation
import ClientProvider from '../contexts/ClientContext';
import { useClient } from '../contexts/ClientContext';

// Import other context implementations as needed
import RequirementProvider from '../contexts/RequirementContext';
import DocumentProvider from '../contexts/DocumentContext';
import PrototypeProvider from '../contexts/PrototypeContext';
import CommentProvider from '../contexts/CommentContext';
import RoadmapProvider from '../contexts/RoadmapContext';
import ROIProvider from '../contexts/ROIContext';
import NotificationProvider from '../contexts/NotificationContext';
import CollaborationProvider from '../contexts/CollaborationContext';

// Register all context providers with the MCP registry
// This makes them available to the ModuleContextProvider

// UI Context (should be first as many other contexts depend on it)
registerContextProvider({
  Provider: UIProvider,
  useContext: useUI,
  options: {
    id: 'ui',
    defaultValues: {
      theme: 'light',
      isLoading: false,
    },
    priority: 10, // Lower number means higher priority (loads first)
    disableDuringSSR: false, // UI context is safe to use during SSR
  }
});

// Auth Context (should be loaded early as many features require authentication)
registerContextProvider({
  Provider: AuthProvider,
  useContext: useAuth,
  options: {
    id: 'auth',
    defaultValues: {
      user: null,
      loading: true,
      error: null,
      isAuthenticated: false,
    },
    priority: 20,
    dependsOn: ['ui'], // Auth depends on UI context
    disableDuringSSR: true, // Auth often requires browser APIs like localStorage
  }
});

// Project Context
registerContextProvider({
  Provider: ProjectProvider,
  useContext: useProject,
  options: {
    id: 'project',
    defaultValues: {
      projects: [],
      currentProject: null,
      loading: false,
      error: null,
    },
    priority: 30,
    dependsOn: ['auth', 'ui'], // Projects depend on auth and UI
    disableDuringSSR: true,
  }
});

// Client Context
registerContextProvider({
  Provider: ClientProvider,
  useContext: useClient,
  options: {
    id: 'client',
    defaultValues: {
      clients: [],
      currentClient: null,
      loading: false,
      error: null,
    },
    priority: 40,
    dependsOn: ['auth', 'ui'],
    disableDuringSSR: true,
  }
});

// Register other context providers...
// RequirementProvider, DocumentProvider, PrototypeProvider, etc.

/**
 * Custom App component with centralized context management
 * 
 * This uses the MCP architecture to manage all context providers in the application.
 * ModuleContextProvider handles provider ordering, error boundaries, and SSR compatibility.
 */
function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  // Get diagnostic mode from environment
  const enableDiagnostics = process.env.NEXT_PUBLIC_ENABLE_DIAGNOSTICS === 'true';
  
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
