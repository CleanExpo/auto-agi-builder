import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * A reusable loading indicator component
 * @param {Object} props - Component props
 * @param {string} [props.message='Loading...'] - Message to display
 * @param {string} [props.size='medium'] - Size of the indicator ('small', 'medium', or 'large')
 * @param {Object} [props.sx] - Additional styles
 * @returns {JSX.Element} Loading indicator component
 */
const LoadingIndicator = ({ message = 'Loading...', size = 'medium', sx = {} }) => {
  // Map size strings to pixel values
  const sizeMap = {
    small: 24,
    medium: 40,
    large: 64
  };
  
  // Get the appropriate size in pixels
  const pixelSize = sizeMap[size] || sizeMap.medium;
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        height: '100%',
        minHeight: '200px',
        width: '100%',
        p: 3,
        ...sx
      }}
    >
      <CircularProgress 
        size={pixelSize} 
        thickness={4}
      />
      {message && (
        <Typography 
          variant="body1" 
          color="textSecondary" 
          sx={{ mt: 2 }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingIndicator;
