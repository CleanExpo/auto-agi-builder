// Mock context hooks for server-side rendering
import React from 'react';

// Create empty provider components that just render children
export const ClientProvider = ({ children }) => <>{children}</>;
export const AuthProvider = ({ children }) => <>{children}</>;
export const UIProvider = ({ children }) => <>{children}</>;

// Create dummy hook implementations that don't throw errors during SSR
export const useClient = () => ({
  clients: [],
  loading: false,
  error: null,
  getClient: () => null,
  createClient: () => null,
  updateClient: () => null,
  deleteClient: () => null
});

export const useAuth = () => ({
  user: null,
  loading: false,
  error: null,
  login: () => null,
  logout: () => null,
  register: () => null,
  isAuthenticated: false
});

export const useUI = () => ({
  theme: 'light',
  toggleTheme: () => null,
  sidebarOpen: false,
  toggleSidebar: () => null
});

// Default export for dynamic imports
export default {
  ClientProvider,
  AuthProvider,
  UIProvider,
  useClient,
  useAuth,
  useUI
};