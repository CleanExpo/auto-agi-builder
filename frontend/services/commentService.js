import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

/**
 * Service for handling comment-related API requests
 */
export const commentService = {
  /**
   * Get comments for an entity
   * @param {string} entityType - Type of entity (e.g., 'requirement', 'document', 'prototype')
   * @param {string} entityId - ID of the entity
   * @param {number} skip - Number of comments to skip for pagination
   * @param {number} limit - Maximum number of comments to retrieve
   * @returns {Promise} Promise with comments data
   */
  async getComments(entityType, entityId, skip = 0, limit = 100) {
    const response = await axios.get(`${API_URL}/comments`, {
      params: {
        entity_type: entityType,
        entity_id: entityId,
        skip,
        limit,
      }
    });
    return response.data;
  },

  /**
   * Get threaded comments for an entity
   * @param {string} entityType - Type of entity
   * @param {string} entityId - ID of the entity
   * @param {number} skip - Number of comments to skip for pagination
   * @param {number} limit - Maximum number of comments to retrieve
   * @returns {Promise} Promise with threaded comments data
   */
  async getThreadedComments(entityType, entityId, skip = 0, limit = 100) {
    const response = await axios.get(`${API_URL}/comments/threaded`, {
      params: {
        entity_type: entityType,
        entity_id: entityId,
        skip,
        limit,
      }
    });
    return response.data;
  },

  /**
   * Create a new comment
   * @param {object} commentData - Comment data (content, entity_type, entity_id, parent_id, mentions)
   * @returns {Promise} Promise with created comment data
   */
  async createComment(commentData) {
    const response = await axios.post(`${API_URL}/comments`, commentData);
    return response.data;
  },

  /**
   * Update an existing comment
   * @param {number} commentId - ID of the comment to update
   * @param {object} commentData - Updated comment data
   * @returns {Promise} Promise with updated comment data
   */
  async updateComment(commentId, commentData) {
    const response = await axios.put(`${API_URL}/comments/${commentId}`, commentData);
    return response.data;
  },

  /**
   * Delete a comment
   * @param {number} commentId - ID of the comment to delete
   * @returns {Promise} Promise with deleted comment data
   */
  async deleteComment(commentId) {
    const response = await axios.delete(`${API_URL}/comments/${commentId}`);
    return response.data;
  },

  /**
   * Add a reaction to a comment
   * @param {number} commentId - ID of the comment
   * @param {string} reactionType - Type of reaction (e.g., 'like', 'heart')
   * @returns {Promise} Promise with updated comment data
   */
  async addReaction(commentId, reactionType) {
    const response = await axios.post(`${API_URL}/comments/${commentId}/reaction/${reactionType}`);
    return response.data;
  },

  /**
   * Remove a reaction from a comment
   * @param {number} commentId - ID of the comment
   * @param {string} reactionType - Type of reaction to remove
   * @returns {Promise} Promise with updated comment data
   */
  async removeReaction(commentId, reactionType) {
    const response = await axios.delete(`${API_URL}/comments/${commentId}/reaction/${reactionType}`);
    return response.data;
  },

  /**
   * Get comment count for an entity
   * @param {string} entityType - Type of entity
   * @param {string} entityId - ID of the entity
   * @returns {Promise} Promise with comment count
   */
  async getCommentCount(entityType, entityId) {
    const response = await axios.get(`${API_URL}/comments/count/entity`, {
      params: {
        entity_type: entityType,
        entity_id: entityId,
      }
    });
    return response.data.count;
  },
};

export default commentService;
