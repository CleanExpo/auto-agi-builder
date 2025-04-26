import axios from 'axios';
import { getAuthHeader } from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Service for requirement-related API calls
 */
export const requirementService = {
  /**
   * Get all requirements (with optional filters)
   * @param {Object} filters - Optional filters like status, requirement_type, etc.
   * @param {Number} page - Page number for pagination
   * @param {Number} pageSize - Page size for pagination
   * @returns {Promise<Object>} - List of requirements with pagination details
   */
  getAllRequirements: async (filters = {}, page = 1, pageSize = 10) => {
    const skip = (page - 1) * pageSize;
    let queryParams = `?skip=${skip}&limit=${pageSize}`;
    
    // Add filters to query params
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined) {
        queryParams += `&${key}=${encodeURIComponent(filters[key])}`;
      }
    });
    
    const response = await axios.get(`${API_URL}/api/v1/requirements${queryParams}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
  
  /**
   * Get requirements for a specific project
   * @param {Number} projectId - Project ID
   * @param {Object} filters - Optional filters
   * @param {Number} page - Page number for pagination
   * @param {Number} pageSize - Page size for pagination
   * @returns {Promise<Object>} - List of requirements for the project
   */
  getRequirementsByProject: async (projectId, filters = {}, page = 1, pageSize = 10) => {
    const skip = (page - 1) * pageSize;
    let queryParams = `?project_id=${projectId}&skip=${skip}&limit=${pageSize}`;
    
    // Add filters to query params
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined) {
        queryParams += `&${key}=${encodeURIComponent(filters[key])}`;
      }
    });
    
    const response = await axios.get(`${API_URL}/api/v1/requirements${queryParams}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
  
  /**
   * Get a requirement by ID with detailed information
   * @param {Number} id - Requirement ID
   * @returns {Promise<Object>} - Requirement details including related data
   */
  getRequirement: async (id) => {
    const response = await axios.get(`${API_URL}/api/v1/requirements/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
  
  /**
   * Create a new requirement
   * @param {Object} requirement - Requirement data
   * @returns {Promise<Object>} - Created requirement
   */
  createRequirement: async (requirement) => {
    const response = await axios.post(`${API_URL}/api/v1/requirements/`, requirement, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
  
  /**
   * Update an existing requirement
   * @param {Number} id - Requirement ID
   * @param {Object} requirement - Requirement data to update
   * @returns {Promise<Object>} - Updated requirement
   */
  updateRequirement: async (id, requirement) => {
    const response = await axios.put(`${API_URL}/api/v1/requirements/${id}`, requirement, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
  
  /**
   * Delete a requirement
   * @param {Number} id - Requirement ID
   * @returns {Promise<Object>} - Deleted requirement
   */
  deleteRequirement: async (id) => {
    const response = await axios.delete(`${API_URL}/api/v1/requirements/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
  
  /**
   * Create multiple requirements in bulk
   * @param {Number} projectId - Project ID
   * @param {Array<Object>} requirements - Array of requirement data
   * @returns {Promise<Array<Object>>} - Created requirements
   */
  createRequirementsBulk: async (projectId, requirements) => {
    const response = await axios.post(
      `${API_URL}/api/v1/requirements/bulk`,
      {
        project_id: projectId,
        requirements: requirements
      },
      { headers: getAuthHeader() }
    );
    return response.data;
  },
  
  /**
   * Extract requirements from a document
   * @param {Number} documentId - Document ID
   * @param {String} extractionMode - Mode for extraction (auto, standard, detailed)
   * @param {Object} extractionOptions - Additional extraction options
   * @returns {Promise<Array<Object>>} - Extracted requirements
   */
  extractRequirementsFromDocument: async (
    documentId,
    extractionMode = 'auto',
    extractionOptions = null
  ) => {
    const response = await axios.post(
      `${API_URL}/api/v1/requirements/extract`,
      {
        document_id: documentId,
        extraction_mode: extractionMode,
        extraction_options: extractionOptions
      },
      { headers: getAuthHeader() }
    );
    return response.data;
  }
};

export default requirementService;
