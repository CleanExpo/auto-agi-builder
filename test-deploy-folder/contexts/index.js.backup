/**
 * Central export for all contexts and providers 
 * This makes it easier to import multiple contexts in components
 */

// UI Context
export { useUI, UIProvider, default as UIContext } from './UIContext';

// Auth Context
export { useAuth, AuthProvider, default as AuthContext } from './AuthContext';

// Project Context
export { useProject, ProjectProvider, default as ProjectContext } from './ProjectContext';

// Client Context
export { useClient, ClientProvider, default as ClientContext } from './ClientContext';

// Localization Context
export { useLocalization, LocalizationProvider, default as LocalizationContext } from './LocalizationContext';

// Notification Context
export { useNotifications, NotificationProvider, default as NotificationContext } from './NotificationContext';

// Collaboration Context
export { useCollaboration, CollaborationProvider, default as CollaborationContext } from './CollaborationContext';

/**
 * CombinedProvider - Wraps all context providers for easier usage in _app.js
 * Maintains proper nesting order for dependent contexts
 */
import React from 'react';
import { UIProvider } from './UIContext';
import { AuthProvider } from './AuthContext';
import { ProjectProvider } from './ProjectContext';
import { ClientProvider } from './ClientContext';
import { LocalizationProvider } from './LocalizationContext';
import { NotificationProvider } from './NotificationContext';
import { CollaborationProvider } from './CollaborationContext';

export const CombinedProvider = ({ children }) => (
  <UIProvider>
    <AuthProvider>
      <LocalizationProvider>
        <NotificationProvider>
          <CollaborationProvider>
            <ProjectProvider>
              <ClientProvider>
                {children}
              </ClientProvider>
            </ProjectProvider>
          </CollaborationProvider>
        </NotificationProvider>
      </LocalizationProvider>
    </AuthProvider>
  </UIProvider>
);
