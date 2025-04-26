import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import commentService from '../services/commentService';
import { useNotification } from './NotificationContext';

// Create context
const CommentContext = createContext();

export const CommentProvider = ({ children }) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentEntityType, setCurrentEntityType] = useState(null);
  const [currentEntityId, setCurrentEntityId] = useState(null);
  const [commentCounts, setCommentCounts] = useState({});
  const [total, setTotal] = useState(0);

  // Reset comments when entity changes
  useEffect(() => {
    if (currentEntityType && currentEntityId) {
      fetchComments(currentEntityType, currentEntityId);
    } else {
      setComments([]);
      setTotal(0);
    }
  }, [currentEntityType, currentEntityId]);

  // Fetch comments for a specific entity
  const fetchComments = useCallback(async (entityType, entityId, skip = 0, limit = 100, threaded = true) => {
    if (!entityType || !entityId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let result;
      if (threaded) {
        result = await commentService.getThreadedComments(entityType, entityId, skip, limit);
      } else {
        result = await commentService.getComments(entityType, entityId, skip, limit);
      }
      
      setComments(result.items || []);
      setTotal(result.total || 0);
      setCurrentEntityType(entityType);
      setCurrentEntityId(entityId);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments. Please try again later.');
      showNotification('error', 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Create a new comment
  const createComment = useCallback(async (content, entityType, entityId, parentId = null, mentions = []) => {
    if (!user) {
      showNotification('error', 'You must be logged in to comment');
      return null;
    }
    
    if (!content.trim()) {
      showNotification('error', 'Comment cannot be empty');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const commentData = {
        content,
        entity_type: entityType,
        entity_id: entityId,
        parent_id: parentId,
        mentions
      };
      
      const newComment = await commentService.createComment(commentData);
      
      // If this is a comment for the current entity, update the state
      if (entityType === currentEntityType && entityId === currentEntityId) {
        await fetchComments(entityType, entityId);
      }
      
      // Update comment count
      updateCommentCount(entityType, entityId);
      
      showNotification('success', 'Comment added successfully');
      return newComment;
    } catch (err) {
      console.error('Error creating comment:', err);
      setError('Failed to add comment. Please try again later.');
      showNotification('error', 'Failed to add comment');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, currentEntityType, currentEntityId, fetchComments, showNotification]);

  // Update an existing comment
  const updateComment = useCallback(async (commentId, content, mentions = []) => {
    if (!user) {
      showNotification('error', 'You must be logged in to update a comment');
      return null;
    }
    
    if (!content.trim()) {
      showNotification('error', 'Comment cannot be empty');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const commentData = {
        content,
        mentions
      };
      
      const updatedComment = await commentService.updateComment(commentId, commentData);
      
      // If this is a comment for the current entity, refresh the comments
      if (currentEntityType && currentEntityId) {
        await fetchComments(currentEntityType, currentEntityId);
      }
      
      showNotification('success', 'Comment updated successfully');
      return updatedComment;
    } catch (err) {
      console.error('Error updating comment:', err);
      setError('Failed to update comment. Please try again later.');
      showNotification('error', 'Failed to update comment');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, currentEntityType, currentEntityId, fetchComments, showNotification]);

  // Delete a comment
  const deleteComment = useCallback(async (commentId, entityType, entityId) => {
    if (!user) {
      showNotification('error', 'You must be logged in to delete a comment');
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await commentService.deleteComment(commentId);
      
      // If this is a comment for the current entity, refresh the comments
      if (entityType === currentEntityType && entityId === currentEntityId) {
        await fetchComments(entityType, entityId);
      }
      
      // Update comment count
      updateCommentCount(entityType, entityId);
      
      showNotification('success', 'Comment deleted successfully');
      return true;
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment. Please try again later.');
      showNotification('error', 'Failed to delete comment');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, currentEntityType, currentEntityId, fetchComments, showNotification]);

  // Add a reaction to a comment
  const addReaction = useCallback(async (commentId, reactionType) => {
    if (!user) {
      showNotification('error', 'You must be logged in to react to a comment');
      return null;
    }
    
    try {
      const updatedComment = await commentService.addReaction(commentId, reactionType);
      
      // If this is a comment for the current entity, refresh the comments
      if (currentEntityType && currentEntityId) {
        await fetchComments(currentEntityType, currentEntityId);
      }
      
      return updatedComment;
    } catch (err) {
      console.error('Error adding reaction:', err);
      showNotification('error', 'Failed to add reaction');
      return null;
    }
  }, [user, currentEntityType, currentEntityId, fetchComments, showNotification]);

  // Remove a reaction from a comment
  const removeReaction = useCallback(async (commentId, reactionType) => {
    if (!user) {
      showNotification('error', 'You must be logged in to remove a reaction');
      return null;
    }
    
    try {
      const updatedComment = await commentService.removeReaction(commentId, reactionType);
      
      // If this is a comment for the current entity, refresh the comments
      if (currentEntityType && currentEntityId) {
        await fetchComments(currentEntityType, currentEntityId);
      }
      
      return updatedComment;
    } catch (err) {
      console.error('Error removing reaction:', err);
      showNotification('error', 'Failed to remove reaction');
      return null;
    }
  }, [user, currentEntityType, currentEntityId, fetchComments, showNotification]);

  // Get comment count for an entity
  const getCommentCount = useCallback(async (entityType, entityId) => {
    if (!entityType || !entityId) return 0;
    
    try {
      const count = await commentService.getCommentCount(entityType, entityId);
      
      // Update comment counts cache
      setCommentCounts(prev => ({
        ...prev,
        [`${entityType}:${entityId}`]: count
      }));
      
      return count;
    } catch (err) {
      console.error('Error getting comment count:', err);
      return 0;
    }
  }, []);

  // Update comment count for an entity
  const updateCommentCount = useCallback((entityType, entityId) => {
    if (!entityType || !entityId) return;
    
    getCommentCount(entityType, entityId);
  }, [getCommentCount]);

  // Reset context state
  const resetContext = useCallback(() => {
    setComments([]);
    setLoading(false);
    setError(null);
    setCurrentEntityType(null);
    setCurrentEntityId(null);
    setTotal(0);
  }, []);

  // Create value object with all context functions and state
  const value = {
    comments,
    loading,
    error,
    total,
    currentEntityType,
    currentEntityId,
    commentCounts,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
    addReaction,
    removeReaction,
    getCommentCount,
    resetContext
  };

  return (
    <CommentContext.Provider value={value}>
      {children}
    </CommentContext.Provider>
  );
};

// Custom hook to use the comment context
export const useComments = () => {
  const context = useContext(CommentContext);
  
  if (context === undefined) {
    throw new Error('useComments must be used within a CommentProvider');
  }
  
  return context;
};

export default CommentContext;
