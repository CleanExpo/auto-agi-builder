// Enhanced UI Provider Fix with Additional Error Checks
const fs = require('fs');
const path = require('path');

console.log('Starting Enhanced UI Provider Fix script...');

// Paths
const basePath = 'deployment/frontend';
const uiContextPath = path.join(basePath, 'contexts/UIContext.js');
const indexContextPath = path.join(basePath, 'contexts/index.js');
const appPath = path.join(basePath, 'pages/_app.js');

// Create SSR-friendly UIContext with additional error handling and more robust checks
const enhancedUIContext = `import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const UIContext = createContext(undefined);

export function UIProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const initialized = useRef(false);

  // Check for dark mode preference on client side only
  useEffect(() => {
    // Only run this effect on the client side
    if (typeof window === 'undefined') return;
    
    try {
      // Check local storage first
      const savedDarkMode = localStorage.getItem('darkMode');
      if (savedDarkMode !== null) {
        setIsDarkMode(JSON.parse(savedDarkMode));
      } else {
        // Then check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(prefersDark);
      }
      
      // Check for mobile view
      const checkMobileView = () => {
        setIsMobileView(window.innerWidth < 768);
      };
      
      checkMobileView();
      window.addEventListener('resize', checkMobileView);
      
      // Mark as initialized
      initialized.current = true;
      
      return () => {
        window.removeEventListener('resize', checkMobileView);
      };
    } catch (error) {
      console.error('Error initializing UI context:', error);
      // Continue with defaults
    }
  }, []);

  // Apply dark mode changes to document (client-side only)
  useEffect(() => {
    if (typeof document === 'undefined' || !initialized.current) return;
    
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Save to localStorage (client-side only)
      if (typeof window !== 'undefined') {
        localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
      }
    } catch (error) {
      console.error('Error applying dark mode:', error);
    }
  }, [isDarkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  // Close mobile menu
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const value = {
    isDarkMode,
    toggleDarkMode,
    isMenuOpen,
    toggleMenu,
    closeMenu,
    isMobileView
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const context = useContext(UIContext);
  
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  
  return context;
}

// Separate hook for theme-specific functionality
export function useTheme() {
  const { isDarkMode, toggleDarkMode } = useUI();
  
  return { isDarkMode, toggleDarkMode };
}

export default UIContext;`;

// Update contexts/index.js to re-export UIContext
const updatedIndexContext = `import React, { createContext, useContext, useState, useEffect } from 'react';
import UIContext, { UIProvider, useUI, useTheme } from './UIContext';

// Re-export UI context components
export { UIProvider, useUI, useTheme };

// Auth Context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication status from local storage or token (client-side only)
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        try {
          const token = localStorage.getItem('authToken');
          if (token) {
            // In a real app, verify the token with the server
            setIsAuthenticated(true);
            // Mock user data - in a real app, you'd fetch this from the server
            setCurrentUser({
              id: '1',
              name: 'Demo User',
              email: 'user@example.com',
              role: 'developer'
            });
          }
        } catch (error) {
          console.error('Error checking authentication:', error);
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      // In a real app, this would be an API call
      // Mock successful login
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', 'demo-token-12345');
      }
      setIsAuthenticated(true);
      setCurrentUser({
        id: '1',
        name: 'Demo User',
        email: credentials?.email || 'user@example.com',
        role: 'developer'
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }
      setIsAuthenticated(false);
      setCurrentUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const register = async (userData) => {
    try {
      // In a real app, this would be an API call
      // Mock successful registration
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', 'demo-token-new-user');
      }
      setIsAuthenticated(true);
      setCurrentUser({
        id: '2',
        name: userData?.name || 'New User',
        email: userData?.email || 'new@example.com',
        role: 'developer'
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Safe authentication values
  const authValues = {
    isAuthenticated: isAuthenticated || false, 
    currentUser: currentUser || null,
    loading,
    login: login || (() => {}),
    logout: logout || (() => {}),
    register: register || (() => {})
  };

  return (
    <AuthContext.Provider value={authValues}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Project Context
const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch projects from the API
    const fetchProjects = async () => {
      try {
        // Mock data
        const mockProjects = [
          { 
            id: '1', 
            name: 'E-commerce Platform', 
            description: 'Building an AI-powered e-commerce platform with personalized recommendations.',
            status: 'in-progress',
            progress: 65,
            created: '2025-02-15'
          },
          { 
            id: '2', 
            name: 'Health Monitoring App', 
            description: 'Mobile application for health monitoring with AI-powered insights.',
            status: 'planning',
            progress: 30,
            created: '2025-03-10'
          },
          { 
            id: '3', 
            name: 'Smart Home Dashboard', 
            description: 'Centralized dashboard for smart home devices with predictive maintenance.',
            status: 'completed',
            progress: 100,
            created: '2025-01-05'
          }
        ];
        setProjects(mockProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const addProject = (project) => {
    try {
      const newProject = {
        id: Date.now().toString(),
        ...project,
        created: new Date().toISOString().split('T')[0],
        progress: 0,
        status: 'planning'
      };
      setProjects(prev => [...prev, newProject]);
      return newProject;
    } catch (error) {
      console.error('Error adding project:', error);
      return null;
    }
  };

  const updateProject = (id, data) => {
    try {
      const updatedProjects = projects.map(project => 
        project.id === id ? { ...project, ...data } : project
      );
      setProjects(updatedProjects);
      return true;
    } catch (error) {
      console.error('Error updating project:', error);
      return false;
    }
  };

  const deleteProject = (id) => {
    try {
      const updatedProjects = projects.filter(project => project.id !== id);
      setProjects(updatedProjects);
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  };

  const getProject = (id) => {
    try {
      return projects.find(project => project.id === id) || null;
    } catch (error) {
      console.error('Error getting project:', error);
      return null;
    }
  };

  return (
    <ProjectContext.Provider value={{
      projects: projects || [],
      loading,
      addProject,
      updateProject,
      deleteProject,
      getProject
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

// Client Context
const ClientContext = createContext();

export const ClientProvider = ({ children }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch clients from the API
    const fetchClients = async () => {
      try {
        // Mock data
        const mockClients = [
          { 
            id: '1', 
            name: 'Acme Corporation', 
            contactName: 'John Doe',
            email: 'john@acme.com',
            phone: '(555) 123-4567',
            projects: ['1']
          },
          { 
            id: '2', 
            name: 'Healthcare Solutions', 
            contactName: 'Jane Smith',
            email: 'jane@healthsolutions.com',
            phone: '(555) 987-6543',
            projects: ['2']
          },
          { 
            id: '3', 
            name: 'Smart Living, Inc.', 
            contactName: 'Robert Johnson',
            email: 'robert@smartliving.com',
            phone: '(555) 456-7890',
            projects: ['3']
          }
        ];
        setClients(mockClients);
      } catch (error) {
        console.error('Error fetching clients:', error);
        setClients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const addClient = (client) => {
    try {
      const newClient = {
        id: Date.now().toString(),
        ...client,
        projects: []
      };
      setClients(prev => [...prev, newClient]);
      return newClient;
    } catch (error) {
      console.error('Error adding client:', error);
      return null;
    }
  };

  const updateClient = (id, data) => {
    try {
      const updatedClients = clients.map(client => 
        client.id === id ? { ...client, ...data } : client
      );
      setClients(updatedClients);
      return true;
    } catch (error) {
      console.error('Error updating client:', error);
      return false;
    }
  };

  const deleteClient = (id) => {
    try {
      const updatedClients = clients.filter(client => client.id !== id);
      setClients(updatedClients);
      return true;
    } catch (error) {
      console.error('Error deleting client:', error);
      return false;
    }
  };

  const getClient = (id) => {
    try {
      return clients.find(client => client.id === id) || null;
    } catch (error) {
      console.error('Error getting client:', error);
      return null;
    }
  };

  const associateProjectWithClient = (clientId, projectId) => {
    try {
      if (!clientId || !projectId) return false;
      
      const updatedClients = clients.map(client => {
        if (client.id === clientId) {
          const updatedProjects = [...(client.projects || [])];
          if (!updatedProjects.includes(projectId)) {
            updatedProjects.push(projectId);
          }
          return {
            ...client,
            projects: updatedProjects
          };
        }
        return client;
      });
      setClients(updatedClients);
      return true;
    } catch (error) {
      console.error('Error associating project with client:', error);
      return false;
    }
  };

  return (
    <ClientContext.Provider value={{
      clients: clients || [],
      loading,
      addClient,
      updateClient,
      deleteClient,
      getClient,
      associateProjectWithClient
    }}>
      {children}
    </ClientContext.Provider>
  );
};

export const useClient = () => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
};`;

// Update _app.js to ensure it has proper error boundary and provider wrapping
const enhancedApp = `import React, { Component } from 'react';
import '../styles/globals.css';
import { UIProvider, AuthProvider, ProjectProvider, ClientProvider } from '../contexts';

// Error boundary to catch rendering errors
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary p-4 m-4 bg-red-50 border border-red-300 rounded">
          <h2 className="text-red-700 text-xl mb-2">Something went wrong</h2>
          <p className="text-red-600">{this.state.error?.message || 'Unknown error'}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

function MyApp({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <UIProvider>
        <AuthProvider>
          <ProjectProvider>
            <ClientProvider>
              <Component {...pageProps} />
            </ClientProvider>
          </ProjectProvider>
        </AuthProvider>
      </UIProvider>
    </ErrorBoundary>
  );
}

export default MyApp;`;

// Write the updated files
try {
  fs.writeFileSync(uiContextPath, enhancedUIContext);
  console.log('✅ Updated UIContext.js with enhanced error handling and SSR compatibility');
  
  fs.writeFileSync(indexContextPath, updatedIndexContext);
  console.log('✅ Updated index.js with improved error handling and null checks');
  
  fs.writeFileSync(appPath, enhancedApp);
  console.log('✅ Updated _app.js with error boundary and robust provider nesting');
  
  console.log('\n🎉 Enhanced UI Provider fix completed successfully!');
  console.log('The enhanced fix improves upon the SSR compatibility with:');
  console.log('1. Additional error handling and try/catch blocks throughout the context code');
  console.log('2. Added useRef to track initialization state and prevent unnecessary effects');
  console.log('3. Implemented React ErrorBoundary to catch and display rendering errors');
  console.log('4. Added null checks and default values for enhanced stability');
  console.log('5. Improved console.error messages to aid debugging');
  console.log('\nThis should completely resolve the "useUI must be used within a UIProvider" errors during prerendering.');
} catch (error) {
  console.error('❌ Error applying enhanced UI Provider fix:', error);
}
