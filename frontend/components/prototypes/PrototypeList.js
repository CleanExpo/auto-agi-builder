import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardMedia,
  CardActions,
  Grid, 
  Typography, 
  Chip, 
  TextField, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  Pagination,
  LinearProgress,
  Tabs,
  Tab,
  Menu,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  Add as AddIcon, 
  FilterList as FilterIcon, 
  Clear as ClearIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon,
  Refresh as RegenerateIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewGridIcon,
  MoreVert as MoreIcon,
  Download as DownloadIcon,
  Code as CodeIcon,
  Share as ShareIcon,
  Launch as LaunchIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  DevicesOther as DevicesIcon,
  DeveloperMode as AIIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { prototypeService } from '../../services/prototypeService';
import PrototypeGenerationForm from './PrototypeGenerationForm';
import LoadingIndicator from '../common/LoadingIndicator';
import EmptyState from '../common/EmptyState';

// Sample prototype thumbnails for the demo
const sampleThumbnails = [
  '/static/images/prototypes/prototype-thumbnail-1.jpg',
  '/static/images/prototypes/prototype-thumbnail-2.jpg',
  '/static/images/prototypes/prototype-thumbnail-3.jpg',
  '/static/images/prototypes/prototype-thumbnail-4.jpg',
  '/static/images/prototypes/prototype-thumbnail-5.jpg'
];

const PrototypeList = ({ projectId }) => {
  // State
  const [prototypes, setPrototypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [prototypeToDelete, setPrototypeToDelete] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 9,
  });
  const [filters, setFilters] = useState({
    status: '',
    prototype_type: '',
    is_favorite: ''
  });
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [activePrototype, setActivePrototype] = useState(null);
  
  const router = useRouter();
  
  // Tabs configuration
  const tabConfig = [
    { label: 'All', value: '' },
    { label: 'Mockups', value: 'mockup' },
    { label: 'Wireframes', value: 'wireframe' },
    { label: 'Interactive', value: 'interactive' },
    { label: 'Code', value: 'code' }
  ];
  
  // Fetch prototypes
  useEffect(() => {
    if (projectId) {
      fetchPrototypes();
    }
  }, [projectId, pagination.page, activeTabIndex]);
  
  const fetchPrototypes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Prepare filters including the active tab filter
      const appliedFilters = { ...filters };
      
      // Apply prototype type filter based on active tab
      if (activeTabIndex > 0) {
        appliedFilters.prototype_type = tabConfig[activeTabIndex].value;
      } else {
        // Clear prototype type filter if "All" tab is selected
        appliedFilters.prototype_type = '';
      }
      
      // Clean filters (remove empty values)
      const cleanFilters = {};
      Object.keys(appliedFilters).forEach(key => {
        if (appliedFilters[key] !== '') {
          if (key === 'is_favorite') {
            cleanFilters[key] = appliedFilters[key] === 'true';
          } else {
            cleanFilters[key] = appliedFilters[key];
          }
        }
      });
      
      const data = await prototypeService.getPrototypesByProject(
        projectId,
        cleanFilters,
        pagination.page,
        pagination.pageSize
      );
      
      setPrototypes(data.items);
      setPagination({
        ...pagination,
        total: data.total
      });
    } catch (err) {
      console.error('Error fetching prototypes:', err);
      setError('Failed to load prototypes. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handlers
  const handlePageChange = (event, value) => {
    setPagination({
      ...pagination,
      page: value
    });
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTabIndex(newValue);
    setPagination({
      ...pagination,
      page: 1 // Reset to first page when changing tabs
    });
  };
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };
  
  const applyFilters = () => {
    setPagination({
      ...pagination,
      page: 1 // Reset to first page when filters change
    });
    fetchPrototypes();
  };
  
  const clearFilters = () => {
    setFilters({
      status: '',
      prototype_type: '',
      is_favorite: ''
    });
    setPagination({
      ...pagination,
      page: 1
    });
    fetchPrototypes();
  };
  
  const handleGenerateClick = () => {
    setFormOpen(true);
  };
  
  const handleFormClose = () => {
    setFormOpen(false);
  };
  
  const handleFormSuccess = () => {
    setFormOpen(false);
    fetchPrototypes();
  };
  
  const handleDeleteClick = (prototype) => {
    setPrototypeToDelete(prototype);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (prototypeToDelete) {
      setLoading(true);
      try {
        await prototypeService.deletePrototype(prototypeToDelete.id);
        fetchPrototypes();
      } catch (err) {
        console.error('Error deleting prototype:', err);
        setError('Failed to delete prototype. Please try again.');
      } finally {
        setLoading(false);
        setDeleteDialogOpen(false);
        setPrototypeToDelete(null);
      }
    }
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPrototypeToDelete(null);
  };
  
  const handlePrototypeClick = (prototype) => {
    router.push(`/prototypes/${prototype.id}`);
  };
  
  // Menu handlers
  const handleMenuOpen = (event, prototype) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setActivePrototype(prototype);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setActivePrototype(null);
  };
  
  const handleRegeneratePrototype = async (prototype) => {
    handleMenuClose();
    setLoading(true);
    try {
      await prototypeService.regeneratePrototype(prototype.id);
      fetchPrototypes();
    } catch (err) {
      console.error('Error regenerating prototype:', err);
      setError('Failed to regenerate prototype. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleExportPrototype = async (prototype, format = 'zip') => {
    handleMenuClose();
    try {
      await prototypeService.exportPrototype(prototype.id, format);
    } catch (err) {
      console.error('Error exporting prototype:', err);
      setError(`Failed to export prototype to ${format}. Please try again.`);
    }
  };
  
  const handleToggleFavorite = async (event, prototype) => {
    event.stopPropagation();
    try {
      await prototypeService.toggleFavorite(prototype.id);
      fetchPrototypes();
    } catch (err) {
      console.error('Error toggling favorite status:', err);
      setError('Failed to update favorite status. Please try again.');
    }
  };
  
  // Render prototype cards
  const renderPrototypeCards = () => (
    <Grid container spacing={3}>
      {prototypes.map((prototype, index) => (
        <Grid item xs={12} sm={6} md={4} key={prototype.id}>
          <Card 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6
              }
            }}
            onClick={() => handlePrototypeClick(prototype)}
          >
            <CardMedia
              component="img"
              height="160"
              image={prototype.thumbnail_url || sampleThumbnails[index % sampleThumbnails.length]}
              alt={prototype.name}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="h6" component="h2" noWrap>
                  {prototype.name}
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={(e) => handleToggleFavorite(e, prototype)}
                  color={prototype.is_favorite ? 'primary' : 'default'}
                >
                  {prototype.is_favorite ? <StarIcon /> : <StarBorderIcon />}
                </IconButton>
              </Box>
              
              <Box sx={{ display: 'flex', mt: 1, mb: 2 }}>
                <Chip 
                  size="small" 
                  label={prototype.prototype_type?.toUpperCase() || 'MOCKUP'} 
                  color="primary"
                  variant="outlined"
                  sx={{ mr: 1 }}
                />
                <Chip 
                  size="small" 
                  label={prototype.status?.toUpperCase() || 'DRAFT'} 
                  color={prototype.status === 'completed' ? 'success' : 'default'}
                />
              </Box>
              
              <Typography 
                variant="body2" 
                color="textSecondary" 
                sx={{ 
                  height: 60, 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  display: '-webkit-box', 
                  WebkitLineClamp: 3, 
                  WebkitBoxOrient: 'vertical' 
                }}
              >
                {prototype.description || 'No description available.'}
              </Typography>
              
              <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                Created: {format(new Date(prototype.created_at), 'MMM d, yyyy')}
              </Typography>
              
              {prototype.status === 'generating' && (
                <Box sx={{ width: '100%', mt: 2 }}>
                  <LinearProgress />
                  <Typography variant="caption" align="center" display="block" sx={{ mt: 0.5 }}>
                    Generating...
                  </Typography>
                </Box>
              )}
            </CardContent>
            <CardActions sx={{ justifyContent: 'space-between', padding: 1 }}>
              <Button 
                size="small" 
                startIcon={<LaunchIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrototypeClick(prototype);
                }}
              >
                View
              </Button>
              <Box>
                <Tooltip title="More Actions">
                  <IconButton 
                    size="small" 
                    onClick={(e) => handleMenuOpen(e, prototype)}
                  >
                    <MoreIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(prototype);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
  
  return (
    <Box>
      {/* Header and controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Prototypes
          <Badge 
            color="primary" 
            badgeContent={pagination.total} 
            sx={{ ml: 1 }} 
            max={999}
          />
        </Typography>
        
        <Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={handleGenerateClick}
            sx={{ mr: 1 }}
          >
            Generate Prototype
          </Button>
          
          <Button 
            variant={showFilters ? "contained" : "outlined"}
            color={showFilters ? "primary" : "default"}
            startIcon={showFilters ? <ClearIcon /> : <FilterIcon />}
            onClick={toggleFilters}
          >
            {showFilters ? "Hide Filters" : "Filters"}
          </Button>
        </Box>
      </Box>
      
      {/* Tabs for prototype types */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTabIndex} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          indicatorColor="primary"
          textColor="primary"
        >
          {tabConfig.map((tab, index) => (
            <Tab key={index} label={tab.label} />
          ))}
        </Tabs>
      </Paper>
      
      {/* Filters */}
      {showFilters && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  label="Status"
                >
                  <MenuItem value="">Any Status</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="generating">Generating</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="favorite-label">Favorite</InputLabel>
                <Select
                  labelId="favorite-label"
                  name="is_favorite"
                  value={filters.is_favorite}
                  onChange={handleFilterChange}
                  label="Favorite"
                >
                  <MenuItem value="">Any</MenuItem>
                  <MenuItem value="true">Favorites Only</MenuItem>
                  <MenuItem value="false">Non-Favorites</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                onClick={applyFilters}
                sx={{ mr: 1 }}
              >
                Apply
              </Button>
              <Button 
                variant="outlined" 
                onClick={clearFilters}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {/* Main content */}
      {loading ? (
        <LoadingIndicator message="Loading prototypes..." />
      ) : error ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="error" variant="h6">{error}</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }}
            onClick={fetchPrototypes}
          >
            Try Again
          </Button>
        </Box>
      ) : prototypes.length === 0 ? (
        <EmptyState 
          title="No prototypes found"
          description="Generate new prototypes based on your project requirements."
          actionLabel="Generate Prototype"
          onAction={handleGenerateClick}
          icon="prototype"
        />
      ) : (
        <>
          {/* Prototype grid */}
          <Box sx={{ mb: 3 }}>
            {renderPrototypeCards()}
          </Box>
          
          {/* Pagination */}
          {pagination.total > pagination.pageSize && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination 
                count={Math.ceil(pagination.total / pagination.pageSize)} 
                page={pagination.page} 
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
      
      {/* Prototype Generation Form Dialog */}
      <Dialog open={formOpen} onClose={handleFormClose} maxWidth="md" fullWidth>
        <DialogTitle>Generate New Prototype</DialogTitle>
        <DialogContent>
          <PrototypeGenerationForm 
            projectId={projectId}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the prototype "{prototypeToDelete?.name}"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        {activePrototype && activePrototype.status !== 'generating' && (
          <MenuItem onClick={() => handleRegeneratePrototype(activePrototype)}>
            <ListItemIcon>
              <RegenerateIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Regenerate</ListItemText>
          </MenuItem>
        )}
        
        {activePrototype && activePrototype.status === 'completed' && (
          <>
            <MenuItem onClick={() => handleExportPrototype(activePrototype, 'zip')}>
              <ListItemIcon>
                <DownloadIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Export as ZIP</ListItemText>
            </MenuItem>
            
            <MenuItem onClick={() => handleExportPrototype(activePrototype, 'html')}>
              <ListItemIcon>
                <CodeIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Export as HTML</ListItemText>
            </MenuItem>
            
            {activePrototype.prototype_type === 'code' && (
              <MenuItem onClick={() => handleExportPrototype(activePrototype, 'reactjs')}>
                <ListItemIcon>
                  <CodeIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Export as React.js</ListItemText>
              </MenuItem>
            )}
            
            <MenuItem onClick={(e) => {
              e.stopPropagation();
              handleMenuClose();
              // This would typically open a share dialog
            }}>
              <ListItemIcon>
                <ShareIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Share Prototype</ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
};

export default PrototypeList;
