import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

import { projectService } from '../services/projectService';
import { useAuth } from './AuthContext';

// Create context
const ProjectContext = createContext({});

/**
 * Provider component that wraps the application to provide project state
 */
export const ProjectProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  
  // State for projects
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 10,
  });
  const [filters, setFilters] = useState({
    status: null,
    project_type: null,
    is_public: null,
  });
  
  /**
   * Load projects list with pagination and filters
   */
  const loadProjects = useCallback(async (page = 1, pageSize = 10, newFilters = null) => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Apply new filters if provided, otherwise use current filters
      const appliedFilters = newFilters !== null ? newFilters : filters;
      if (newFilters !== null) {
        setFilters(newFilters);
      }
      
      const data = await projectService.getAllProjects(appliedFilters, page, pageSize);
      setProjects(data.items);
      setPagination({
        total: data.total,
        page: data.page,
        pageSize: data.page_size,
      });
    } catch (err) {
      console.error('Error loading projects:', err);
      setError('Failed to load projects. Please try again.');
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, filters]);
  
  /**
   * Load a specific project by ID
   */
  const loadProject = useCallback(async (id) => {
    if (!isAuthenticated || !id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const project = await projectService.getProject(id);
      setCurrentProject(project);
    } catch (err) {
      console.error(`Error loading project ${id}:`, err);
      setError('Failed to load project details.');
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);
  
  /**
   * Create a new project
   */
  const createProject = useCallback(async (projectData) => {
    if (!isAuthenticated) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const newProject = await projectService.createProject(projectData);
      // Refresh projects list
      loadProjects();
      toast.success('Project created successfully');
      return newProject;
    } catch (err) {
      console.error('Error creating project:', err);
      setError('Failed to create project.');
      toast.error('Failed to create project');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, loadProjects]);
  
  /**
   * Update an existing project
   */
  const updateProject = useCallback(async (id, projectData) => {
    if (!isAuthenticated) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedProject = await projectService.updateProject(id, projectData);
      
      // If this is the current project, update it
      if (currentProject && currentProject.id === id) {
        setCurrentProject(updatedProject);
      }
      
      // Refresh projects list
      loadProjects();
      toast.success('Project updated successfully');
      return updatedProject;
    } catch (err) {
      console.error(`Error updating project ${id}:`, err);
      setError('Failed to update project.');
      toast.error('Failed to update project');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, loadProjects, currentProject]);
  
  /**
   * Delete a project
   */
  const deleteProject = useCallback(async (id) => {
    if (!isAuthenticated) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      await projectService.deleteProject(id);
      
      // If this is the current project, clear it
      if (currentProject && currentProject.id === id) {
        setCurrentProject(null);
      }
      
      // Refresh projects list
      loadProjects();
      toast.success('Project deleted successfully');
      return true;
    } catch (err) {
      console.error(`Error deleting project ${id}:`, err);
      setError('Failed to delete project.');
      toast.error('Failed to delete project');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, loadProjects, currentProject]);
  
  /**
   * Add a contributor to a project
   */
  const addContributor = useCallback(async (projectId, userId) => {
    if (!isAuthenticated) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedProject = await projectService.addContributor(projectId, userId);
      
      // If this is the current project, update it
      if (currentProject && currentProject.id === projectId) {
        setCurrentProject(updatedProject);
      }
      
      toast.success('Contributor added successfully');
      return true;
    } catch (err) {
      console.error(`Error adding contributor to project ${projectId}:`, err);
      setError('Failed to add contributor.');
      toast.error('Failed to add contributor');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, currentProject]);
  
  /**
   * Remove a contributor from a project
   */
  const removeContributor = useCallback(async (projectId, userId) => {
    if (!isAuthenticated) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedProject = await projectService.removeContributor(projectId, userId);
      
      // If this is the current project, update it
      if (currentProject && currentProject.id === projectId) {
        setCurrentProject(updatedProject);
      }
      
      toast.success('Contributor removed successfully');
      return true;
    } catch (err) {
      console.error(`Error removing contributor from project ${projectId}:`, err);
      setError('Failed to remove contributor.');
      toast.error('Failed to remove contributor');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, currentProject]);
  
  /**
   * Get project statistics
   */
  const getProjectStats = useCallback(async (id) => {
    if (!isAuthenticated) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const stats = await projectService.getProjectStats(id);
      return stats;
    } catch (err) {
      console.error(`Error loading project stats for ${id}:`, err);
      setError('Failed to load project statistics.');
      toast.error('Failed to load project statistics');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);
  
  /**
   * Load projects when user authentication changes
   */
  useEffect(() => {
    if (isAuthenticated) {
      loadProjects();
    } else {
      setProjects([]);
      setCurrentProject(null);
    }
  }, [isAuthenticated, loadProjects]);
  
  /**
   * Clear current project when navigating away from project page
   */
  useEffect(() => {
    const handleRouteChange = (url) => {
      if (!url.includes('/projects/')) {
        setCurrentProject(null);
      }
    };
    
    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router.events]);
  
  // Context value
  const value = {
    projects,
    currentProject,
    loading,
    error,
    pagination,
    filters,
    loadProjects,
    loadProject,
    createProject,
    updateProject,
    deleteProject,
    addContributor,
    removeContributor,
    getProjectStats,
    setFilters,
  };
  
  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

/**
 * Hook to use the project context
 */
export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

export default ProjectContext;
