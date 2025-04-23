import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useUI } from './UIContext';

// Create context
const ProjectContext = createContext();

/**
 * Provider component for project data
 * Manages project state and CRUD operations
 */
export const ProjectProvider = ({ children }) => {
  const { toast } = useUI();
  
  // Projects state
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all projects
  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/projects');
      setProjects(response.data.projects);
      return response.data.projects;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch projects';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  // Fetch a specific project by ID
  const fetchProject = useCallback(async (projectId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/projects/${projectId}`);
      return { success: true, project: response.data.project };
    } catch (error) {
      const errorMessage = error.response?.data?.message || `Failed to fetch project ${projectId}`;
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  // Create a new project
  const createProject = useCallback(async (projectData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/projects', projectData);
      
      // Add to projects list
      setProjects((prev) => [...prev, response.data.project]);
      
      // Set as current project if no current project is selected
      if (!currentProject) {
        setCurrentProject(response.data.project);
      }
      
      return { success: true, project: response.data.project };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create project';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [currentProject, toast]);
  
  // Update an existing project
  const updateProject = useCallback(async (projectId, projectData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.put(`/projects/${projectId}`, projectData);
      
      // Update in projects list
      setProjects((prev) => 
        prev.map((project) => 
          project.id === projectId ? response.data.project : project
        )
      );
      
      // Update current project if needed
      if (currentProject?.id === projectId) {
        setCurrentProject(response.data.project);
      }
      
      return { success: true, project: response.data.project };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update project';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [currentProject, toast]);
  
  // Delete a project
  const deleteProject = useCallback(async (projectId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await api.delete(`/projects/${projectId}`);
      
      // Remove from projects list
      setProjects((prev) => prev.filter((project) => project.id !== projectId));
      
      // Clear current project if needed
      if (currentProject?.id === projectId) {
        setCurrentProject(null);
      }
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete project';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [currentProject, toast]);
  
  // Set active project
  const setActiveProject = useCallback((project) => {
    setCurrentProject(project);
    
    // Store in local storage to persist selection
    if (project) {
      localStorage.setItem('currentProjectId', project.id);
    } else {
      localStorage.removeItem('currentProjectId');
    }
  }, []);
  
  // Archive a project
  const archiveProject = useCallback(async (projectId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.put(`/projects/${projectId}/archive`);
      
      // Update in projects list
      setProjects((prev) => 
        prev.map((project) => 
          project.id === projectId ? response.data.project : project
        )
      );
      
      // Update current project if needed
      if (currentProject?.id === projectId) {
        setCurrentProject(response.data.project);
      }
      
      return { success: true, project: response.data.project };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to archive project';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [currentProject, toast]);
  
  // Restore an archived project
  const restoreProject = useCallback(async (projectId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.put(`/projects/${projectId}/restore`);
      
      // Update in projects list
      setProjects((prev) => 
        prev.map((project) => 
          project.id === projectId ? response.data.project : project
        )
      );
      
      // Update current project if needed
      if (currentProject?.id === projectId) {
        setCurrentProject(response.data.project);
      }
      
      return { success: true, project: response.data.project };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to restore project';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [currentProject, toast]);
  
  // Share project with another user
  const shareProject = useCallback(async (projectId, userEmail, role = 'viewer') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.post(`/projects/${projectId}/share`, {
        email: userEmail,
        role,
      });
      
      toast.success(`Project shared with ${userEmail}`);
      
      return { success: true, share: response.data.share };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to share project';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  // Remove user access from a project
  const removeAccess = useCallback(async (projectId, userId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await api.delete(`/projects/${projectId}/share/${userId}`);
      
      toast.success('User access removed');
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to remove user access';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  // Fetch projects on initial load
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);
  
  // Restore current project from localStorage if available
  useEffect(() => {
    const storedProjectId = localStorage.getItem('currentProjectId');
    
    if (storedProjectId && projects.length > 0) {
      const storedProject = projects.find((p) => p.id === storedProjectId);
      
      if (storedProject) {
        setCurrentProject(storedProject);
      } else {
        // If stored project no longer exists, remove from localStorage
        localStorage.removeItem('currentProjectId');
      }
    }
  }, [projects]);
  
  // Context value
  const value = {
    projects,
    currentProject,
    isLoading,
    error,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    setActiveProject,
    archiveProject,
    restoreProject,
    shareProject,
    removeAccess,
  };
  
  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

// Custom hook to use the project context
export const useProject = () => {
  const context = useContext(ProjectContext);
  
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  
  return context;
};

export default ProjectContext;
