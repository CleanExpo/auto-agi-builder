import React, { useState } from 'react';
import { useComments } from '../../contexts/CommentContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  Avatar,
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Chip,
  Button,
  Paper,
  Tooltip,
  Collapse
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ReplyIcon from '@mui/icons-material/Reply';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { formatDistanceToNow } from 'date-fns';

import CommentForm from './CommentForm';

/**
 * Component to display a single comment
 */
const CommentItem = ({ 
  comment, 
  entityType, 
  entityId,
  isReply = false,
  showReplyForm = true,
  depth = 0,
  maxDepth = 3
}) => {
  const { user } = useAuth();
  const { deleteComment, addReaction, removeReaction } = useComments();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  
  const isAuthor = user && user.id === comment.user_id;
  const hasReplies = comment.replies && comment.replies.length > 0;
  
  // Parse comment reactions
  const reactions = comment.reactions || {};
  const likeCount = reactions.like ? reactions.like.length : 0;
  const hasLiked = user && reactions.like && reactions.like.includes(user.id);
  
  // Check if max nesting depth is reached
  const reachedMaxDepth = depth >= maxDepth;
  
  // Handle menu open/close
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Handle comment edit
  const handleEdit = () => {
    setIsEditing(true);
    handleMenuClose();
  };
  
  // Handle comment delete
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      await deleteComment(comment.id, entityType, entityId);
    }
    handleMenuClose();
  };
  
  // Handle like/unlike
  const handleToggleLike = async () => {
    if (hasLiked) {
      await removeReaction(comment.id, 'like');
    } else {
      await addReaction(comment.id, 'like');
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'unknown time';
    }
  };
  
  return (
    <Box sx={{ mb: 2 }}>
      <Paper 
        elevation={isReply ? 0 : 1} 
        sx={{ 
          p: 2, 
          bgcolor: isReply ? 'background.default' : 'background.paper',
          border: isReply ? '1px solid' : 'none',
          borderColor: isReply ? 'divider' : 'transparent',
          borderRadius: isReply ? 1 : 2
        }}
      >
        {isEditing ? (
          <CommentForm
            entityType={entityType}
            entityId={entityId}
            isEdit={true}
            commentId={comment.id}
            initialContent={comment.content}
            onCancel={() => setIsEditing(false)}
            autoFocus
          />
        ) : (
          <Box>
            {/* Comment header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar
                alt={comment.user_name || 'User'}
                src={comment.user_avatar || undefined}
                sx={{ width: 32, height: 32, mr: 1 }}
              />
              
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" component="span">
                  {comment.user_name || 'Anonymous'}
                </Typography>
                
                <Typography
                  variant="caption"
                  color="text.secondary"
                  component="span"
                  sx={{ ml: 1 }}
                >
                  {formatDate(comment.created_at)}
                </Typography>
                
                {comment.is_edited && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    component="span"
                    sx={{ ml: 1 }}
                  >
                    (edited)
                  </Typography>
                )}
              </Box>
              
              {/* Comment actions menu */}
              {(isAuthor || (user && user.is_superuser)) && (
                <Box>
                  <IconButton
                    size="small"
                    onClick={handleMenuOpen}
                    aria-label="Comment options"
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                  
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                  >
                    {isAuthor && (
                      <MenuItem onClick={handleEdit}>
                        <EditIcon fontSize="small" sx={{ mr: 1 }} />
                        Edit
                      </MenuItem>
                    )}
                    
                    <MenuItem onClick={handleDelete}>
                      <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                      Delete
                    </MenuItem>
                  </Menu>
                </Box>
              )}
            </Box>
            
            {/* Comment content */}
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
              {comment.content}
            </Typography>
            
            {/* Comment actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title={hasLiked ? 'Unlike' : 'Like'}>
                <Chip
                  icon={hasLiked ? <ThumbUpIcon fontSize="small" /> : <ThumbUpOutlinedIcon fontSize="small" />}
                  label={likeCount || 'Like'}
                  variant={hasLiked ? 'filled' : 'outlined'}
                  color={hasLiked ? 'primary' : 'default'}
                  size="small"
                  onClick={handleToggleLike}
                  sx={{ cursor: 'pointer' }}
                />
              </Tooltip>
              
              {showReplyForm && !reachedMaxDepth && (
                <Button
                  size="small"
                  startIcon={<ReplyIcon />}
                  onClick={() => setShowReplyInput(!showReplyInput)}
                  sx={{ ml: 1 }}
                >
                  Reply
                </Button>
              )}
              
              {hasReplies && (
                <Button
                  size="small"
                  endIcon={showReplies ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  onClick={() => setShowReplies(!showReplies)}
                  sx={{ ml: 'auto' }}
                >
                  {showReplies ? 'Hide' : 'Show'} Replies ({comment.replies.length})
                </Button>
              )}
            </Box>
          </Box>
        )}
      </Paper>
      
      {/* Reply form */}
      {showReplyInput && (
        <Box sx={{ ml: 4, mt: 1 }}>
          <CommentForm
            entityType={entityType}
            entityId={entityId}
            parentId={comment.id}
            placeholder={`Reply to ${comment.user_name || 'this comment'}...`}
            onCancel={() => setShowReplyInput(false)}
            autoFocus
            submitButtonText="Reply"
          />
        </Box>
      )}
      
      {/* Replies */}
      {hasReplies && (
        <Collapse in={showReplies}>
          <Box sx={{ ml: isReply ? 2 : 4, mt: 1 }}>
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                entityType={entityType}
                entityId={entityId}
                isReply={true}
                showReplyForm={!reachedMaxDepth}
                depth={depth + 1}
                maxDepth={maxDepth}
              />
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

export default CommentItem;
