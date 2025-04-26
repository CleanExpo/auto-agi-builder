import axios from 'axios';
import { getAuthHeader } from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Service for project-related API calls
 */
export const projectService = {
  /**
   * Get all projects (with optional filters)
   * @param {Object} filters - Optional filters like status, project_type, etc.
   * @param {Number} page - Page number for pagination
   * @param {Number} pageSize - Page size for pagination
   * @returns {Promise<Object>} - List of projects with pagination details
   */
  getAllProjects: async (filters = {}, page = 1, pageSize = 10) => {
    const skip = (page - 1) * pageSize;
    let queryParams = `?skip=${skip}&limit=${pageSize}`;
    
    // Add filters to query params
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined) {
        queryParams += `&${key}=${encodeURIComponent(filters[key])}`;
      }
    });
    
    const response = await axios.get(`${API_URL}/api/v1/projects${queryParams}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
  
  /**
   * Get a project by ID with detailed information
   * @param {Number} id - Project ID
   * @returns {Promise<Object>} - Project details including related data
   */
  getProject: async (id) => {
    const response = await axios.get(`${API_URL}/api/v1/projects/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
  
  /**
   * Create a new project
   * @param {Object} project - Project data
   * @returns {Promise<Object>} - Created project
   */
  createProject: async (project) => {
    const response = await axios.post(`${API_URL}/api/v1/projects/`, project, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
  
  /**
   * Update an existing project
   * @param {Number} id - Project ID
   * @param {Object} project - Project data to update
   * @returns {Promise<Object>} - Updated project
   */
  updateProject: async (id, project) => {
    const response = await axios.put(`${API_URL}/api/v1/projects/${id}`, project, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
  
  /**
   * Delete a project
   * @param {Number} id - Project ID
   * @returns {Promise<Object>} - Deleted project
   */
  deleteProject: async (id) => {
    const response = await axios.delete(`${API_URL}/api/v1/projects/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
  
  /**
   * Get project statistics
   * @param {Number} id - Project ID
   * @returns {Promise<Object>} - Project statistics
   */
  getProjectStats: async (id) => {
    const response = await axios.get(`${API_URL}/api/v1/projects/${id}/stats`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
  
  /**
   * Add contributor to project
   * @param {Number} projectId - Project ID
   * @param {String} userId - User ID to add as contributor
   * @returns {Promise<Object>} - Updated project with contributors
   */
  addContributor: async (projectId, userId) => {
    const response = await axios.post(
      `${API_URL}/api/v1/projects/${projectId}/contributors`,
      { user_id: userId },
      { headers: getAuthHeader() }
    );
    return response.data;
  },
  
  /**
   * Remove contributor from project
   * @param {Number} projectId - Project ID
   * @param {String} userId - User ID to remove
   * @returns {Promise<Object>} - Updated project
   */
  removeContributor: async (projectId, userId) => {
    const response = await axios.delete(
      `${API_URL}/api/v1/projects/${projectId}/contributors/${userId}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  }
};

export default projectService;
