/**
 * Context Provider Registration
 * 
 * This file registers all context providers with the MCP registry.
 * It's imported dynamically in _app.js to ensure context providers
 * are only registered on the client side.
 */

import { registerContextProvider } from '../lib/mcp';

// Import context providers and their hooks
// We need both the provider component and the hook function
import UIProvider, { useUI } from './UIContext';
import AuthProvider, { useAuth } from './AuthContext';
import ProjectProvider, { useProject } from './ProjectContext';
import ClientProvider, { useClient } from './ClientContext';

// These may be conditionally imported if they exist
let RequirementProvider, useRequirement;
let DocumentProvider, useDocument;
let PrototypeProvider, usePrototype;
let ROIProvider, useROI;
let CommentProvider, useComment;
let RoadmapProvider, useRoadmap;
let CollaborationProvider, useCollaboration;
let NotificationProvider, useNotification;

// Try to import optional context providers
// This ensures the app won't crash if some providers don't exist
try {
  const RequirementModule = require('./RequirementContext');
  RequirementProvider = RequirementModule.default;
  useRequirement = RequirementModule.useRequirement;
} catch (err) {
  console.log('RequirementContext not available');
}

try {
  const DocumentModule = require('./DocumentContext');
  DocumentProvider = DocumentModule.default;
  useDocument = DocumentModule.useDocument;
} catch (err) {
  console.log('DocumentContext not available');
}

try {
  const PrototypeModule = require('./PrototypeContext');
  PrototypeProvider = PrototypeModule.default;
  usePrototype = PrototypeModule.usePrototype;
} catch (err) {
  console.log('PrototypeContext not available');
}

try {
  const ROIModule = require('./ROIContext');
  ROIProvider = ROIModule.default;
  useROI = ROIModule.useROI;
} catch (err) {
  console.log('ROIContext not available');
}

try {
  const CommentModule = require('./CommentContext');
  CommentProvider = CommentModule.default;
  useComment = CommentModule.useComment;
} catch (err) {
  console.log('CommentContext not available');
}

try {
  const RoadmapModule = require('./RoadmapContext');
  RoadmapProvider = RoadmapModule.default;
  useRoadmap = RoadmapModule.useRoadmap;
} catch (err) {
  console.log('RoadmapContext not available');
}

try {
  const CollaborationModule = require('./CollaborationContext');
  CollaborationProvider = CollaborationModule.default;
  useCollaboration = CollaborationModule.useCollaboration;
} catch (err) {
  console.log('CollaborationContext not available');
}

try {
  const NotificationModule = require('./NotificationContext');
  NotificationProvider = NotificationModule.default;
  useNotification = NotificationModule.useNotification;
} catch (err) {
  console.log('NotificationContext not available');
}

// Register core providers that should always be available

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

// Register optional providers only if they're available
if (RequirementProvider && useRequirement) {
  registerContextProvider({
    Provider: RequirementProvider,
    useContext: useRequirement,
    options: {
      id: 'requirement',
      defaultValues: {
        requirements: [],
        loading: false,
        error: null,
      },
      priority: 50,
      dependsOn: ['project', 'auth', 'ui'],
      disableDuringSSR: true,
    }
  });
}

if (DocumentProvider && useDocument) {
  registerContextProvider({
    Provider: DocumentProvider,
    useContext: useDocument,
    options: {
      id: 'document',
      defaultValues: {
        documents: [],
        loading: false,
        error: null,
      },
      priority: 60,
      dependsOn: ['project', 'auth', 'ui'],
      disableDuringSSR: true,
    }
  });
}

if (PrototypeProvider && usePrototype) {
  registerContextProvider({
    Provider: PrototypeProvider,
    useContext: usePrototype,
    options: {
      id: 'prototype',
      defaultValues: {
        prototypes: [],
        currentPrototype: null,
        loading: false,
        error: null,
      },
      priority: 70,
      dependsOn: ['project', 'requirement', 'auth', 'ui'],
      disableDuringSSR: true,
    }
  });
}

if (ROIProvider && useROI) {
  registerContextProvider({
    Provider: ROIProvider,
    useContext: useROI,
    options: {
      id: 'roi',
      defaultValues: {
        metrics: {},
        results: null,
        loading: false,
        error: null,
      },
      priority: 80,
      dependsOn: ['project', 'auth', 'ui'],
      disableDuringSSR: true,
    }
  });
}

if (CommentProvider && useComment) {
  registerContextProvider({
    Provider: CommentProvider,
    useContext: useComment,
    options: {
      id: 'comment',
      defaultValues: {
        comments: [],
        loading: false,
        error: null,
      },
      priority: 90,
      dependsOn: ['auth', 'ui'],
      disableDuringSSR: true,
    }
  });
}

if (RoadmapProvider && useRoadmap) {
  registerContextProvider({
    Provider: RoadmapProvider,
    useContext: useRoadmap,
    options: {
      id: 'roadmap',
      defaultValues: {
        roadmap: null,
        loading: false,
        error: null,
      },
      priority: 100,
      dependsOn: ['project', 'requirement', 'auth', 'ui'],
      disableDuringSSR: true,
    }
  });
}

if (CollaborationProvider && useCollaboration) {
  registerContextProvider({
    Provider: CollaborationProvider,
    useContext: useCollaboration,
    options: {
      id: 'collaboration',
      defaultValues: {
        collaborators: [],
        activeUsers: [],
        loading: false,
        error: null,
      },
      priority: 110,
      dependsOn: ['auth', 'ui'],
      disableDuringSSR: true,
    }
  });
}

if (NotificationProvider && useNotification) {
  registerContextProvider({
    Provider: NotificationProvider,
    useContext: useNotification,
    options: {
      id: 'notification',
      defaultValues: {
        notifications: [],
        unreadCount: 0,
        loading: false,
        error: null,
      },
      priority: 120,
      dependsOn: ['auth', 'ui'],
      disableDuringSSR: true,
    }
  });
}

console.log('Context providers registered successfully');
