// Fix UI Provider SSR Issues
const fs = require('fs');
const path = require('path');

console.log('Starting UI Provider Fix script...');

// Paths
const basePath = 'deployment/frontend';
const uiContextPath = path.join(basePath, 'contexts/UIContext.js');
const indexContextPath = path.join(basePath, 'contexts/index.js');
const appPath = path.join(basePath, 'pages/_app.js');

// Create SSR-friendly UIContext
const updatedUIContext = `import React, { createContext, useContext, useState, useEffect } from 'react';

const UIContext = createContext(undefined);

export function UIProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  // Check for dark mode preference on client side only
  useEffect(() => {
    // Check local storage first
    const savedDarkMode = typeof window !== 'undefined' ? localStorage.getItem('darkMode') : null;
    if (savedDarkMode !== null) {
      setIsDarkMode(JSON.parse(savedDarkMode));
    } else if (typeof window !== 'undefined') {
      // Then check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
    
    // Apply dark mode to document if needed (client-side only)
    if (isDarkMode && typeof document !== 'undefined') {
      document.documentElement.classList.add('dark');
    }

    // Check for mobile view (client-side only)
    if (typeof window !== 'undefined') {
      const checkMobileView = () => {
        setIsMobileView(window.innerWidth < 768);
      };
      
      checkMobileView();
      window.addEventListener('resize', checkMobileView);
      
      return () => {
        window.removeEventListener('resize', checkMobileView);
      };
    }
  }, []);

  // Apply dark mode changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    
    // Save to localStorage (client-side only)
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
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
import UIContext, { UIProvider, useUI } from './UIContext';

// Re-export UI context components
export { UIProvider, useUI };

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
        email: credentials.email,
        role: 'developer'
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
    setIsAuthenticated(false);
    setCurrentUser(null);
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
        name: userData.name,
        email: userData.email,
        role: 'developer'
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      currentUser, 
      loading,
      login,
      logout,
      register
    }}>
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
        setLoading(false);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const addProject = (project) => {
    const newProject = {
      id: Date.now().toString(),
      ...project,
      created: new Date().toISOString().split('T')[0],
      progress: 0,
      status: 'planning'
    };
    setProjects([...projects, newProject]);
    return newProject;
  };

  const updateProject = (id, data) => {
    const updatedProjects = projects.map(project => 
      project.id === id ? { ...project, ...data } : project
    );
    setProjects(updatedProjects);
  };

  const deleteProject = (id) => {
    const updatedProjects = projects.filter(project => project.id !== id);
    setProjects(updatedProjects);
  };

  const getProject = (id) => {
    return projects.find(project => project.id === id);
  };

  return (
    <ProjectContext.Provider value={{
      projects,
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
        setLoading(false);
      } catch (error) {
        console.error('Error fetching clients:', error);
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const addClient = (client) => {
    const newClient = {
      id: Date.now().toString(),
      ...client,
      projects: []
    };
    setClients([...clients, newClient]);
    return newClient;
  };

  const updateClient = (id, data) => {
    const updatedClients = clients.map(client => 
      client.id === id ? { ...client, ...data } : client
    );
    setClients(updatedClients);
  };

  const deleteClient = (id) => {
    const updatedClients = clients.filter(client => client.id !== id);
    setClients(updatedClients);
  };

  const getClient = (id) => {
    return clients.find(client => client.id === id);
  };

  const associateProjectWithClient = (clientId, projectId) => {
    const updatedClients = clients.map(client => {
      if (client.id === clientId) {
        return {
          ...client,
          projects: [...client.projects, projectId]
        };
      }
      return client;
    });
    setClients(updatedClients);
  };

  return (
    <ClientContext.Provider value={{
      clients,
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

// Update _app.js to ensure it has proper provider wrapping
const updatedApp = `import '../styles/globals.css';
import { UIProvider, AuthProvider, ProjectProvider, ClientProvider } from '../contexts';

function MyApp({ Component, pageProps }) {
  return (
    <UIProvider>
      <AuthProvider>
        <ProjectProvider>
          <ClientProvider>
            <Component {...pageProps} />
          </ClientProvider>
        </ProjectProvider>
      </AuthProvider>
    </UIProvider>
  );
}

export default MyApp;`;

// Write the updated files
try {
  fs.writeFileSync(uiContextPath, updatedUIContext);
  console.log('✅ Updated UIContext.js to be SSR-friendly');
  
  fs.writeFileSync(indexContextPath, updatedIndexContext);
  console.log('✅ Updated index.js to re-export UIContext');
  
  fs.writeFileSync(appPath, updatedApp);
  console.log('✅ Updated _app.js to ensure proper provider wrapping');
  
  console.log('\n🎉 UI Provider fix completed successfully!');
  console.log('The fix makes all UI context code SSR-compatible by:');
  console.log('1. Adding checks for "typeof window !== undefined" and "typeof document !== undefined"');
  console.log('2. Standardizing on a single UIContext implementation');
  console.log('3. Ensuring proper provider wrapping in _app.js');
  console.log('\nThis should resolve the "useUI must be used within a UIProvider" errors during prerendering.');
} catch (error) {
  console.error('❌ Error fixing UI Provider:', error);
}
