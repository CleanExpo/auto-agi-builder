import axios from 'axios';
import { getAuthHeader } from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Service for document-related API calls
 */
export const documentService = {
  /**
   * Get all documents (with optional filters)
   * @param {Object} filters - Optional filters like document_type, is_archived, etc.
   * @param {Number} page - Page number for pagination
   * @param {Number} pageSize - Page size for pagination
   * @returns {Promise<Object>} - List of documents with pagination details
   */
  getAllDocuments: async (filters = {}, page = 1, pageSize = 10) => {
    const skip = (page - 1) * pageSize;
    let queryParams = `?skip=${skip}&limit=${pageSize}`;
    
    // Add filters to query params
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined) {
        queryParams += `&${key}=${encodeURIComponent(filters[key])}`;
      }
    });
    
    const response = await axios.get(`${API_URL}/api/v1/documents${queryParams}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
  
  /**
   * Get documents for a specific project
   * @param {Number} projectId - Project ID
   * @param {Object} filters - Optional filters
   * @param {Number} page - Page number for pagination
   * @param {Number} pageSize - Page size for pagination
   * @returns {Promise<Object>} - List of documents for the project
   */
  getDocumentsByProject: async (projectId, filters = {}, page = 1, pageSize = 10) => {
    const skip = (page - 1) * pageSize;
    let queryParams = `?project_id=${projectId}&skip=${skip}&limit=${pageSize}`;
    
    // Add filters to query params
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined) {
        queryParams += `&${key}=${encodeURIComponent(filters[key])}`;
      }
    });
    
    const response = await axios.get(`${API_URL}/api/v1/documents${queryParams}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
  
  /**
   * Get a document by ID with detailed information
   * @param {Number} id - Document ID
   * @returns {Promise<Object>} - Document details including related data
   */
  getDocument: async (id) => {
    const response = await axios.get(`${API_URL}/api/v1/documents/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
  
  /**
   * Upload a new document
   * @param {FormData} formData - Form data with file and metadata
   * @returns {Promise<Object>} - Uploaded document
   */
  uploadDocument: async (formData) => {
    const response = await axios.post(`${API_URL}/api/v1/documents/upload`, formData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data'
      },
    });
    return response.data;
  },
  
  /**
   * Update an existing document's metadata
   * @param {Number} id - Document ID
   * @param {Object} document - Document metadata to update
   * @returns {Promise<Object>} - Updated document
   */
  updateDocument: async (id, document) => {
    const response = await axios.put(`${API_URL}/api/v1/documents/${id}`, document, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
  
  /**
   * Delete a document
   * @param {Number} id - Document ID
   * @returns {Promise<Object>} - Deleted document
   */
  deleteDocument: async (id) => {
    const response = await axios.delete(`${API_URL}/api/v1/documents/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
  
  /**
   * Download a document
   * @param {Number} id - Document ID
   * @returns {Promise<Blob>} - Document file as blob
   */
  downloadDocument: async (id) => {
    const response = await axios.get(`${API_URL}/api/v1/documents/${id}/download`, {
      headers: getAuthHeader(),
      responseType: 'blob'
    });
    return response.data;
  },
  
  /**
   * Get document preview URL
   * @param {Number} id - Document ID
   * @returns {String} - Preview URL
   */
  getDocumentPreviewUrl: (id) => {
    return `${API_URL}/api/v1/documents/${id}/preview`;
  },
  
  /**
   * Extract text and requirements from a document
   * @param {Number} id - Document ID
   * @returns {Promise<Object>} - Extraction result
   */
  extractFromDocument: async (id) => {
    const response = await axios.post(
      `${API_URL}/api/v1/documents/${id}/extract`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  },
  
  /**
   * Helper function to create a FormData object for document upload
   * @param {File} file - File object from input
   * @param {Number} projectId - Project ID
   * @param {String} title - Document title (optional, will use filename if not provided)
   * @param {String} description - Document description (optional)
   * @param {Boolean} extractRequirements - Whether to extract requirements after upload
   * @returns {FormData} - FormData object ready for upload
   */
  createDocumentFormData: (file, projectId, title = '', description = '', extractRequirements = false) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_id', projectId);
    formData.append('title', title || file.name);
    formData.append('description', description);
    formData.append('document_type', _getDocumentType(file.name));
    formData.append('extract_requirements', extractRequirements);
    return formData;
  },
};

/**
 * Helper function to determine document type from filename
 * @param {String} filename - Name of the file
 * @returns {String} - Document type
 */
function _getDocumentType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  
  if (['pdf'].includes(ext)) {
    return 'pdf';
  } else if (['doc', 'docx'].includes(ext)) {
    return 'word';
  } else if (['txt'].includes(ext)) {
    return 'text';
  } else if (['md', 'markdown'].includes(ext)) {
    return 'markdown';
  } else if (['html', 'htm'].includes(ext)) {
    return 'html';
  } else if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg'].includes(ext)) {
    return 'image';
  } else {
    return 'other';
  }
}

export default documentService;
