import React, { useEffect, useState } from 'react';
import { useComments } from '../../contexts/CommentContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Typography,
  Divider,
  Button,
  Paper,
  CircularProgress,
  Pagination,
  Alert
} from '@mui/material';
import CommentIcon from '@mui/icons-material/Comment';
import SortIcon from '@mui/icons-material/Sort';
import RefreshIcon from '@mui/icons-material/Refresh';

import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import EmptyState from '../common/EmptyState';

/**
 * Component to display a list of comments for an entity
 */
const CommentList = ({
  entityType,
  entityId,
  title = 'Comments',
  emptyMessage = 'No comments yet. Be the first to comment!',
  threaded = true,
  maxDepth = 3,
  limit = 10,
  showTitle = true,
  showDividers = true,
  elevation = 1,
  sx = {}
}) => {
  const { user } = useAuth();
  const { 
    comments, 
    loading, 
    error, 
    total,
    fetchComments, 
    resetContext 
  } = useComments();
  
  const [page, setPage] = useState(1);
  const pageCount = Math.ceil(total / limit);
  
  // Fetch comments when component mounts or when entity changes
  useEffect(() => {
    if (entityType && entityId) {
      fetchComments(entityType, entityId, (page - 1) * limit, limit, threaded);
    }
    
    // Cleanup when component unmounts
    return () => {
      resetContext();
    };
  }, [entityType, entityId, page, limit, threaded, fetchComments, resetContext]);
  
  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
  };
  
  // Handle refresh
  const handleRefresh = () => {
    fetchComments(entityType, entityId, (page - 1) * limit, limit, threaded);
  };
  
  return (
    <Paper 
      elevation={elevation} 
      sx={{ 
        p: 3,
        mb: 3,
        ...sx
      }}
    >
      {/* Header */}
      {showTitle && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CommentIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
            {title} {total > 0 && `(${total})`}
          </Typography>
          
          <Button
            size="small"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      )}
      
      {showDividers && <Divider sx={{ mb: 3 }} />}
      
      {/* Comment form */}
      <CommentForm
        entityType={entityType}
        entityId={entityId}
        placeholder="Join the conversation..."
      />
      
      {showDividers && <Divider sx={{ my: 3 }} />}
      
      {/* Loading state */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {/* Error state */}
      {error && !loading && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Empty state */}
      {!loading && !error && comments.length === 0 && (
        <EmptyState
          icon={<CommentIcon sx={{ fontSize: 48 }} />}
          title="No Comments Yet"
          description={emptyMessage}
          sx={{ my: 4 }}
        />
      )}
      
      {/* Comments list */}
      {!loading && !error && comments.length > 0 && (
        <Box>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              entityType={entityType}
              entityId={entityId}
              maxDepth={maxDepth}
            />
          ))}
          
          {/* Pagination */}
          {pageCount > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={pageCount}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default CommentList;
