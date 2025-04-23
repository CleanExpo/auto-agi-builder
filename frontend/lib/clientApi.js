import { fetchWithAuth } from './api';

/**
 * Client Management API functions
 */

/**
 * Create a new client organization
 * @param {Object} data - Client data
 * @returns {Promise<Object>} - Created client
 */
export const createClient = async (data) => {
  try {
    const response = await fetchWithAuth('/api/v1/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Error creating client:', error);
    throw error;
  }
};

/**
 * Get all clients for the current user
 * @param {Object} options - Query options
 * @param {number} options.page - Page number
 * @param {number} options.limit - Results per page
 * @param {string} options.search - Search term
 * @param {boolean} options.isActive - Filter by active status
 * @returns {Promise<Object>} - Paginated clients
 */
export const getClients = async ({ page = 1, limit = 10, search, isActive } = {}) => {
  try {
    // Calculate skip based on page and limit
    const skip = (page - 1) * limit;
    
    // Build query string
    const params = new URLSearchParams({
      skip,
      limit,
    });
    
    if (search) params.append('search', search);
    if (isActive !== undefined) params.append('is_active', isActive);
    
    const response = await fetchWithAuth(`/api/v1/clients?${params.toString()}`);
    return response;
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }
};

/**
 * Get a specific client by ID
 * @param {string} clientId - Client ID
 * @returns {Promise<Object>} - Client details
 */
export const getClient = async (clientId) => {
  try {
    const response = await fetchWithAuth(`/api/v1/clients/${clientId}`);
    return response;
  } catch (error) {
    console.error('Error fetching client:', error);
    throw error;
  }
};

/**
 * Update a client
 * @param {string} clientId - Client ID
 * @param {Object} data - Updated client data
 * @returns {Promise<Object>} - Updated client
 */
export const updateClient = async (clientId, data) => {
  try {
    const response = await fetchWithAuth(`/api/v1/clients/${clientId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Error updating client:', error);
    throw error;
  }
};

/**
 * Delete a client
 * @param {string} clientId - Client ID
 * @returns {Promise<void>}
 */
export const deleteClient = async (clientId) => {
  try {
    await fetchWithAuth(`/api/v1/clients/${clientId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    throw error;
  }
};

/**
 * Add a member to a client
 * @param {string} clientId - Client ID
 * @param {Object} data - Member data
 * @returns {Promise<Object>} - Added member
 */
export const addMember = async (clientId, data) => {
  try {
    const response = await fetchWithAuth(`/api/v1/clients/${clientId}/members`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Error adding member:', error);
    throw error;
  }
};

/**
 * Remove a member from a client
 * @param {string} clientId - Client ID
 * @param {string} memberId - Member ID
 * @returns {Promise<void>}
 */
export const removeMember = async (clientId, memberId) => {
  try {
    await fetchWithAuth(`/api/v1/clients/${clientId}/members/${memberId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error removing member:', error);
    throw error;
  }
};

/**
 * Update a member's role
 * @param {string} clientId - Client ID
 * @param {string} memberId - Member ID
 * @param {string} role - New role
 * @returns {Promise<Object>} - Updated member
 */
export const updateMemberRole = async (clientId, memberId, role) => {
  try {
    const response = await fetchWithAuth(`/api/v1/clients/${clientId}/members/${memberId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
    return response;
  } catch (error) {
    console.error('Error updating member role:', error);
    throw error;
  }
};

/**
 * Invite a user to join a client
 * @param {string} clientId - Client ID
 * @param {Object} data - Invitation data
 * @returns {Promise<Object>} - Invitation details
 */
export const inviteUser = async (clientId, data) => {
  try {
    const response = await fetchWithAuth(`/api/v1/clients/${clientId}/invitations`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Error inviting user:', error);
    throw error;
  }
};
