import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const ProjectContext = createContext(undefined);

// Project provider component
export const ProjectProvider = ({ children }) => {
  const [currentProject, setCurrentProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load projects (mock implementation for build to succeed)
  const loadProjects = async () => {
    try {
      setLoading(true);
      // Mock data for static generation
      const mockProjects = [
        { id: '1', name: 'Project 1', description: 'First project' },
        { id: '2', name: 'Project 2', description: 'Second project' }
      ];
      setProjects(mockProjects);
      return mockProjects;
    } catch (err) {
      setError('Failed to load projects');
      console.error('Error loading projects:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get project by ID
  const getProject = async (id) => {
    if (!id) return null;
    // First check if we already have it
    let project = projects.find(p => p.id === id);
    if (project) return project;
    
    // Mock implementation for build
    return { id, name: `Project ${id}`, description: 'Project description' };
  };

  // Create a new project
  const createProject = async (projectData) => {
    try {
      setLoading(true);
      // Mock implementation
      const newProject = {
        id: Date.now().toString(),
        ...projectData,
        createdAt: new Date().toISOString()
      };
      setProjects([...projects, newProject]);
      return newProject;
    } catch (err) {
      setError('Failed to create project');
      console.error('Error creating project:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update a project
  const updateProject = async (id, data) => {
    try {
      setLoading(true);
      // Mock implementation
      const updatedProjects = projects.map(p => 
        p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
      );
      setProjects(updatedProjects);
      const updatedProject = updatedProjects.find(p => p.id === id);
      if (currentProject?.id === id) {
        setCurrentProject(updatedProject);
      }
      return updatedProject;
    } catch (err) {
      setError('Failed to update project');
      console.error('Error updating project:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete a project
  const deleteProject = async (id) => {
    try {
      setLoading(true);
      // Mock implementation
      const filteredProjects = projects.filter(p => p.id !== id);
      setProjects(filteredProjects);
      if (currentProject?.id === id) {
        setCurrentProject(null);
      }
      return true;
    } catch (err) {
      setError('Failed to delete project');
      console.error('Error deleting project:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Initialize current project
  const setProject = async (id) => {
    const project = await getProject(id);
    setCurrentProject(project);
    return project;
  };

  // Clear current project
  const clearProject = () => {
    setCurrentProject(null);
  };

  // Context value
  const value = {
    currentProject,
    projects,
    loading,
    error,
    loadProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    setProject,
    clearProject
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

// Hook to use the project context
export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

// Higher-order component to wrap pages with ProjectProvider
export const withProject = (Component) => {
  const WithProject = (props) => (
    <ProjectProvider>
      <Component {...props} />
    </ProjectProvider>
  );
  
  // Copy static methods
  if (Component.getInitialProps) {
    WithProject.getInitialProps = Component.getInitialProps;
  }
  
  return WithProject;
};

// Export default context for completeness
export default ProjectContext;
