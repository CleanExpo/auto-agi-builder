import axios from 'axios';
import { getAuthHeader } from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Service for prototype-related API calls
 */
export const prototypeService = {
  /**
   * Get all prototypes (with optional filters)
   * @param {Object} filters - Optional filters like prototype_type, status, etc.
   * @param {Number} page - Page number for pagination
   * @param {Number} pageSize - Page size for pagination
   * @returns {Promise<Object>} - List of prototypes with pagination details
   */
  getAllPrototypes: async (filters = {}, page = 1, pageSize = 10) => {
    const skip = (page - 1) * pageSize;
    let queryParams = `?skip=${skip}&limit=${pageSize}`;
    
    // Add filters to query params
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined) {
        queryParams += `&${key}=${encodeURIComponent(filters[key])}`;
      }
    });
    
    const response = await axios.get(`${API_URL}/api/v1/prototypes${queryParams}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
  
  /**
   * Get prototypes for a specific project
   * @param {Number} projectId - Project ID
   * @param {Object} filters - Optional filters
   * @param {Number} page - Page number for pagination
   * @param {Number} pageSize - Page size for pagination
   * @returns {Promise<Object>} - List of prototypes for the project
   */
  getPrototypesByProject: async (projectId, filters = {}, page = 1, pageSize = 10) => {
    const skip = (page - 1) * pageSize;
    let queryParams = `?project_id=${projectId}&skip=${skip}&limit=${pageSize}`;
    
    // Add filters to query params
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined) {
        queryParams += `&${key}=${encodeURIComponent(filters[key])}`;
      }
    });
    
    const response = await axios.get(`${API_URL}/api/v1/prototypes${queryParams}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
  
  /**
   * Get a prototype by ID with detailed information
   * @param {Number} id - Prototype ID
   * @returns {Promise<Object>} - Prototype details including related data
   */
  getPrototype: async (id) => {
    const response = await axios.get(`${API_URL}/api/v1/prototypes/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
  
  /**
   * Create and start generating a new prototype
   * @param {Object} prototype - Prototype data with generation parameters and requirement IDs
   * @returns {Promise<Object>} - Created prototype
   */
  createPrototype: async (prototype) => {
    const response = await axios.post(`${API_URL}/api/v1/prototypes/`, prototype, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
  
  /**
   * Update an existing prototype's metadata
   * @param {Number} id - Prototype ID
   * @param {Object} prototype - Prototype data to update
   * @returns {Promise<Object>} - Updated prototype
   */
  updatePrototype: async (id, prototype) => {
    const response = await axios.put(`${API_URL}/api/v1/prototypes/${id}`, prototype, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
  
  /**
   * Delete a prototype
   * @param {Number} id - Prototype ID
   * @returns {Promise<Object>} - Deleted prototype
   */
  deletePrototype: async (id) => {
    const response = await axios.delete(`${API_URL}/api/v1/prototypes/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
  
  /**
   * Regenerate an existing prototype with new parameters
   * @param {Number} id - Prototype ID
   * @param {Object} regenerateOptions - Options for regeneration
   * @returns {Promise<Object>} - Regenerated prototype
   */
  regeneratePrototype: async (id, regenerateOptions = {}) => {
    const response = await axios.post(
      `${API_URL}/api/v1/prototypes/${id}/regenerate`,
      regenerateOptions,
      { headers: getAuthHeader() }
    );
    return response.data;
  },
  
  /**
   * Export a prototype to a specific format
   * @param {Number} id - Prototype ID
   * @param {String} format - Export format (zip, pdf, html, reactjs, etc.)
   * @param {Object} options - Export options
   * @returns {Promise<Object>} - Export task details
   */
  exportPrototype: async (id, format = 'zip', options = {}) => {
    const response = await axios.post(
      `${API_URL}/api/v1/prototypes/${id}/export`,
      {
        export_format: format,
        export_options: options
      },
      { headers: getAuthHeader() }
    );
    return response.data;
  },
  
  /**
   * Toggle favorite status of a prototype
   * @param {Number} id - Prototype ID
   * @returns {Promise<Object>} - Updated prototype
   */
  toggleFavorite: async (id) => {
    const response = await axios.post(
      `${API_URL}/api/v1/prototypes/${id}/toggle_favorite`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  },
  
  /**
   * Helper function to create prototype generation parameters
   * @param {String} prototypeType - Type of prototype to generate
   * @param {Object} stylePreferences - Visual style preferences
   * @param {Object} technicalConstraints - Technical constraints
   * @param {Array<String>} includedFeatures - Features to include
   * @param {Array<String>} excludedFeatures - Features to exclude
   * @param {Number} aiCreativityLevel - AI creativity level (1-10)
   * @returns {Object} - Parameters object for prototype generation
   */
  createGenerationParameters: (
    prototypeType = 'mockup',
    stylePreferences = {},
    technicalConstraints = {},
    includedFeatures = [],
    excludedFeatures = [],
    aiCreativityLevel = 5
  ) => {
    return {
      prototype_type: prototypeType,
      style_preferences: stylePreferences,
      technical_constraints: technicalConstraints,
      included_features: includedFeatures,
      excluded_features: excludedFeatures,
      ai_creativity_level: aiCreativityLevel
    };
  },
  
  /**
   * Helper to prepare prototype creation request
   * @param {Number} projectId - Project ID
   * @param {String} name - Prototype name
   * @param {String} description - Prototype description
   * @param {Array<Number>} requirementIds - IDs of requirements to implement
   * @param {Object} generationParameters - Generation parameters
   * @returns {Object} - Prototype creation request object
   */
  preparePrototypeRequest: (
    projectId,
    name,
    description = '',
    requirementIds = [],
    generationParameters = {}
  ) => {
    return {
      project_id: projectId,
      name: name,
      description: description,
      requirement_ids: requirementIds,
      generation_parameters: generationParameters
    };
  }
};

export default prototypeService;
