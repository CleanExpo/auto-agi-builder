import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

// UI Context
const UIContext = createContext(undefined);

export function UIProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  // Track initialization to prevent unnecessary side effects during SSR
  const initialized = useRef(false);

  // Check for dark mode preference on client side only
  useEffect(() => {
    // Skip this effect during SSR
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
    if (typeof window !== 'undefined') {
      // Only throw in browser environment, not during SSR
      throw new Error('useUI must be used within a UIProvider');
    }
    // Return dummy context during SSR
    return {
      isDarkMode: false,
      toggleDarkMode: () => {},
      isMenuOpen: false,
      toggleMenu: () => {},
      closeMenu: () => {},
      isMobileView: false
    };
  }
  
  return context;
}

// Separate hook for theme-specific functionality
export function useTheme() {
  const context = useUI();
  
  return { 
    isDarkMode: context.isDarkMode,
    toggleDarkMode: context.toggleDarkMode
  };
}

// Auth Context
const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    // Check authentication status from local storage or token (client-side only)
    const checkAuth = () => {
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }
      
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
        initialized.current = true;
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (credentials) => {
    if (typeof window === 'undefined') return { success: false };
    
    try {
      // In a real app, this would be an API call
      // Mock successful login
      localStorage.setItem('authToken', 'demo-token-12345');
      setIsAuthenticated(true);
      setCurrentUser({
        id: '1',
        name: 'Demo User',
        email: credentials?.email || 'user@example.com',
        role: 'developer'
      });
      return { success: true };
    } catch (error) {
      console.error('Error during login:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem('authToken');
      setIsAuthenticated(false);
      setCurrentUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const register = async (userData) => {
    if (typeof window === 'undefined') return { success: false };
    
    try {
      // In a real app, this would be an API call
      // Mock successful registration
      localStorage.setItem('authToken', 'demo-token-new-user');
      setIsAuthenticated(true);
      setCurrentUser({
        id: '2',
        name: userData?.name || 'New User',
        email: userData?.email || 'new@example.com',
        role: 'developer'
      });
      return { success: true };
    } catch (error) {
      console.error('Error during registration:', error);
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
    if (typeof window !== 'undefined') {
      // Only throw in browser environment
      throw new Error('useAuth must be used within an AuthProvider');
    }
    // Return dummy context during SSR
    return {
      isAuthenticated: false,
      currentUser: null,
      loading: false,
      login: () => Promise.resolve({ success: false }),
      logout: () => {},
      register: () => Promise.resolve({ success: false })
    };
  }
  
  return context;
};

// Project Context
const ProjectContext = createContext(undefined);

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    // In a real app, fetch projects from the API
    const fetchProjects = async () => {
      // Skip API calls during SSR
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }
      
      try {
        // Mock data - in production, fetch from API
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
        initialized.current = true;
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
    if (typeof window === 'undefined') return null;
    
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
    if (typeof window === 'undefined') return false;
    
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
    if (typeof window === 'undefined') return false;
    
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

  const projectValues = {
    projects: projects || [],
    loading,
    addProject,
    updateProject,
    deleteProject,
    getProject
  };

  return (
    <ProjectContext.Provider value={projectValues}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  
  if (context === undefined) {
    if (typeof window !== 'undefined') {
      // Only throw in browser environment
      throw new Error('useProject must be used within a ProjectProvider');
    }
    // Return dummy context during SSR
    return {
      projects: [],
      loading: false,
      addProject: () => null,
      updateProject: () => false,
      deleteProject: () => false,
      getProject: () => null
    };
  }
  
  return context;
};

// Client Context
const ClientContext = createContext(undefined);

export const ClientProvider = ({ children }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    // In a real app, fetch clients from the API
    const fetchClients = async () => {
      // Skip during SSR
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }
      
      try {
        // Mock data - in production, fetch from API
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
        initialized.current = true;
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
    if (typeof window === 'undefined') return null;
    
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
    if (typeof window === 'undefined') return false;
    
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
    if (typeof window === 'undefined') return false;
    
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
    if (typeof window === 'undefined') return false;
    
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

  const clientValues = {
    clients: clients || [],
    loading,
    addClient,
    updateClient,
    deleteClient,
    getClient,
    associateProjectWithClient
  };

  return (
    <ClientContext.Provider value={clientValues}>
      {children}
    </ClientContext.Provider>
  );
};

export const useClient = () => {
  const context = useContext(ClientContext);
  
  if (context === undefined) {
    if (typeof window !== 'undefined') {
      // Only throw in browser environment
      throw new Error('useClient must be used within a ClientProvider');
    }
    // Return dummy context during SSR
    return {
      clients: [],
      loading: false,
      addClient: () => null,
      updateClient: () => false,
      deleteClient: () => false,
      getClient: () => null,
      associateProjectWithClient: () => false
    };
  }
  
  return context;
};

export default { UIContext, AuthContext, ProjectContext, ClientContext };
