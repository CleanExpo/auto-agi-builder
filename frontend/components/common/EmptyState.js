import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import {
  AddCircleOutline as AddIcon,
  Assignment as RequirementsIcon,
  Description as DocumentIcon,
  DeveloperBoard as PrototypeIcon,
  Folder as ProjectIcon,
  FolderOpen as EmptyFolderIcon,
  Search as SearchIcon
} from '@mui/icons-material';

/**
 * A reusable empty state component
 * @param {Object} props - Component props
 * @param {string} props.title - Title text
 * @param {string} props.description - Description text
 * @param {string} props.actionLabel - Primary action button label
 * @param {Function} props.onAction - Primary action button callback
 * @param {string} [props.secondaryActionLabel] - Optional secondary action button label
 * @param {Function} [props.onSecondaryAction] - Optional secondary action button callback
 * @param {string} [props.icon='empty'] - Icon type ('empty', 'project', 'requirements', 'document', 'prototype', 'search')
 * @param {Object} [props.sx] - Additional styles
 * @returns {JSX.Element} Empty state component
 */
const EmptyState = ({
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  icon = 'empty',
  sx = {}
}) => {
  // Map icon types to components
  const iconMap = {
    empty: <EmptyFolderIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />,
    project: <ProjectIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />,
    requirements: <RequirementsIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />,
    document: <DocumentIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />,
    prototype: <PrototypeIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />,
    search: <SearchIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
  };
  
  // Get the appropriate icon
  const IconComponent = iconMap[icon] || iconMap.empty;
  
  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: 6,
        textAlign: 'center',
        borderRadius: 2,
        backgroundColor: 'background.paper',
        border: '1px dashed',
        borderColor: 'divider',
        ...sx
      }}
    >
      {IconComponent}
      
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>
      
      <Typography 
        variant="body1" 
        color="textSecondary" 
        sx={{ maxWidth: 500, mb: 4 }}
      >
        {description}
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
        
        {secondaryActionLabel && onSecondaryAction && (
          <Button
            variant="outlined"
            onClick={onSecondaryAction}
          >
            {secondaryActionLabel}
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default EmptyState;
