import React, { useState, useRef, useEffect } from 'react';
import { useComments } from '../../contexts/CommentContext';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar, Button, TextField, Box, CircularProgress, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';

/**
 * Component for adding or editing comments
 */
const CommentForm = ({
  entityType,
  entityId,
  parentId = null,
  initialContent = '',
  isEdit = false,
  commentId = null,
  onCancel = null,
  placeholder = 'Add a comment...',
  autoFocus = false,
  fullWidth = true,
  multiline = true,
  rows = 3,
  showAvatar = true,
  submitButtonText = 'Post',
  submitButtonProps = {},
  cancelButtonText = 'Cancel',
  cancelButtonProps = {},
}) => {
  const { user } = useAuth();
  const { createComment, updateComment } = useComments();
  
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mentions, setMentions] = useState([]);
  const textFieldRef = useRef(null);
  
  // Set initial content when editing a comment
  useEffect(() => {
    if (isEdit && initialContent) {
      setContent(initialContent);
    }
  }, [isEdit, initialContent]);
  
  // Focus on text field when component mounts and autoFocus is true
  useEffect(() => {
    if (autoFocus && textFieldRef.current) {
      textFieldRef.current.focus();
    }
  }, [autoFocus]);
  
  // Handle comment submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      if (isEdit && commentId) {
        // Update existing comment
        await updateComment(commentId, content, mentions);
      } else {
        // Create new comment
        await createComment(content, entityType, entityId, parentId, mentions);
      }
      
      // Reset form
      setContent('');
      setMentions([]);
      
      // Call onCancel if provided (for inline editing)
      if (isEdit && onCancel) {
        onCancel();
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle cancel button click
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      setContent('');
      setMentions([]);
    }
  };
  
  // If user is not authenticated, don't render the form
  if (!user) {
    return (
      <Box sx={{ py: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Please sign in to leave a comment.
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        {showAvatar && (
          <Avatar
            alt={user.name || 'User'}
            src={user.avatar || undefined}
            sx={{ width: 36, height: 36 }}
          />
        )}
        
        <Box sx={{ flexGrow: 1 }}>
          <TextField
            inputRef={textFieldRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            fullWidth={fullWidth}
            multiline={multiline}
            rows={rows}
            variant="outlined"
            disabled={isSubmitting}
            sx={{ mb: 1 }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            {(isEdit || content) && (
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleCancel}
                disabled={isSubmitting}
                startIcon={<CancelIcon />}
                {...cancelButtonProps}
              >
                {cancelButtonText}
              </Button>
            )}
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting || !content.trim()}
              endIcon={isEdit ? <EditIcon /> : <SendIcon />}
              {...submitButtonProps}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                submitButtonText
              )}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CommentForm;
