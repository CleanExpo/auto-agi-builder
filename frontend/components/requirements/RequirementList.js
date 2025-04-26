import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  Typography, 
  Chip, 
  TextField, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  FormControlLabel,
  Switch
} from '@mui/material';
import { 
  Add as AddIcon, 
  FilterList as FilterIcon, 
  Clear as ClearIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon,
  ContentCopy as DuplicateIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewGridIcon,
  Sort as SortIcon,
  ImportExport as ImportIcon,
  Autorenew as AIGenerateIcon,
  LightbulbOutlined as AIIcon
} from '@mui/icons-material';
import { requirementService } from '../../services/requirementService';
import RequirementForm from './RequirementForm';
import RequirementCard from './RequirementCard';
import LoadingIndicator from '../common/LoadingIndicator';
import EmptyState from '../common/EmptyState';

const RequirementList = ({ projectId }) => {
  // State
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [formOpen, setFormOpen] = useState(false);
  const [requirementToEdit, setRequirementToEdit] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requirementToDelete, setRequirementToDelete] = useState(null);
  const [aiDialogOpen, setAIDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 10,
  });
  const [filters, setFilters] = useState({
    status: '',
    requirement_type: '',
    priority: '',
    is_ai_generated: ''
  });
  
  // Fetch requirements
  useEffect(() => {
    if (projectId) {
      fetchRequirements();
    }
  }, [projectId, pagination.page]);
  
  const fetchRequirements = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const cleanFilters = {};
      Object.keys(filters).forEach(key => {
        if (filters[key] !== '') {
          if (key === 'is_ai_generated') {
            cleanFilters[key] = filters[key] === 'true';
          } else {
            cleanFilters[key] = filters[key];
          }
        }
      });
      
      const data = await requirementService.getRequirementsByProject(
        projectId,
        cleanFilters,
        pagination.page,
        pagination.pageSize
      );
      
      setRequirements(data.items);
      setPagination({
        ...pagination,
        total: data.total
      });
    } catch (err) {
      console.error('Error fetching requirements:', err);
      setError('Failed to load requirements. Please try again.');
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
    fetchRequirements();
  };
  
  const clearFilters = () => {
    setFilters({
      status: '',
      requirement_type: '',
      priority: '',
      is_ai_generated: ''
    });
    setPagination({
      ...pagination,
      page: 1
    });
    fetchRequirements();
  };
  
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };
  
  const handleCreateClick = () => {
    setRequirementToEdit(null);
    setFormOpen(true);
  };
  
  const handleEditClick = (requirement) => {
    setRequirementToEdit(requirement);
    setFormOpen(true);
  };
  
  const handleFormClose = () => {
    setFormOpen(false);
    setRequirementToEdit(null);
  };
  
  const handleFormSuccess = () => {
    setFormOpen(false);
    setRequirementToEdit(null);
    fetchRequirements();
  };
  
  const handleDeleteClick = (requirement) => {
    setRequirementToDelete(requirement);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (requirementToDelete) {
      setLoading(true);
      try {
        await requirementService.deleteRequirement(requirementToDelete.id);
        fetchRequirements();
      } catch (err) {
        console.error('Error deleting requirement:', err);
        setError('Failed to delete requirement. Please try again.');
      } finally {
        setLoading(false);
        setDeleteDialogOpen(false);
        setRequirementToDelete(null);
      }
    }
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setRequirementToDelete(null);
  };
  
  const handleAIGenerate = () => {
    setAIDialogOpen(true);
  };
  
  const handleAIDialogClose = () => {
    setAIDialogOpen(false);
  };
  
  const handleDuplicateRequirement = async (requirement) => {
    setLoading(true);
    try {
      const newRequirement = { ...requirement };
      delete newRequirement.id;
      newRequirement.title = `Copy of ${requirement.title}`;
      
      await requirementService.createRequirement(newRequirement);
      fetchRequirements();
    } catch (err) {
      console.error('Error duplicating requirement:', err);
      setError('Failed to duplicate requirement. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Status chip color mapping
  const statusColors = {
    draft: 'default',
    active: 'primary',
    completed: 'success',
    blocked: 'error'
  };
  
  // Priority chip color mapping
  const priorityColors = {
    low: 'info',
    medium: 'warning',
    high: 'error',
    critical: 'error'
  };
  
  // Render functions
  const renderGridView = () => (
    <Grid container spacing={3}>
      {requirements.map(requirement => (
        <Grid item xs={12} sm={6} md={4} key={requirement.id}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Chip 
                  size="small" 
                  label={requirement.requirement_type?.toUpperCase() || 'FUNCTIONAL'} 
                  color="primary"
                  variant="outlined"
                />
                <Box>
                  <Chip 
                    size="small" 
                    label={requirement.status?.toUpperCase() || 'DRAFT'} 
                    color={statusColors[requirement.status] || 'default'}
                    sx={{ mr: 1 }}
                  />
                  <Chip 
                    size="small" 
                    label={requirement.priority?.toUpperCase() || 'MEDIUM'} 
                    color={priorityColors[requirement.priority] || 'default'}
                  />
                </Box>
              </Box>
              
              <Typography variant="h6" gutterBottom noWrap>
                {requirement.title}
              </Typography>
              
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
                {requirement.description || 'No description available.'}
              </Typography>
              
              {requirement.is_ai_generated && (
                <Chip 
                  size="small" 
                  icon={<AIIcon />} 
                  label="AI-Generated" 
                  variant="outlined"
                  color="secondary"
                  sx={{ mt: 1 }}
                />
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Tooltip title="Duplicate">
                  <IconButton size="small" onClick={() => handleDuplicateRequirement(requirement)} sx={{ mr: 1 }}>
                    <DuplicateIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => handleEditClick(requirement)} sx={{ mr: 1 }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" onClick={() => handleDeleteClick(requirement)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
  
  const renderListView = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>AI Generated</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {requirements.map(requirement => (
            <TableRow key={requirement.id}>
              <TableCell>{requirement.title}</TableCell>
              <TableCell>
                <Chip 
                  size="small" 
                  label={requirement.requirement_type?.toUpperCase() || 'FUNCTIONAL'} 
                  color="primary"
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Chip 
                  size="small" 
                  label={requirement.status?.toUpperCase() || 'DRAFT'} 
                  color={statusColors[requirement.status] || 'default'}
                />
              </TableCell>
              <TableCell>
                <Chip 
                  size="small" 
                  label={requirement.priority?.toUpperCase() || 'MEDIUM'} 
                  color={priorityColors[requirement.priority] || 'default'}
                />
              </TableCell>
              <TableCell>
                {requirement.is_ai_generated ? (
                  <Chip 
                    size="small" 
                    icon={<AIIcon />} 
                    label="AI" 
                    variant="outlined"
                    color="secondary"
                  />
                ) : (
                  <Typography variant="body2">No</Typography>
                )}
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Duplicate">
                  <IconButton size="small" onClick={() => handleDuplicateRequirement(requirement)}>
                    <DuplicateIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => handleEditClick(requirement)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" onClick={() => handleDeleteClick(requirement)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
  
  return (
    <Box>
      {/* Header and controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Requirements
          <Badge 
            color="primary" 
            badgeContent={pagination.total} 
            sx={{ ml: 1 }} 
            max={999}
          />
        </Typography>
        
        <Box>
          <Tooltip title="Generate with AI">
            <Button 
              variant="outlined" 
              startIcon={<AIGenerateIcon />} 
              onClick={handleAIGenerate}
              sx={{ mr: 1 }}
            >
              Generate with AI
            </Button>
          </Tooltip>
          
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={handleCreateClick}
            sx={{ mr: 1 }}
          >
            Add Requirement
          </Button>
          
          <Button 
            variant={showFilters ? "contained" : "outlined"}
            color={showFilters ? "primary" : "default"}
            startIcon={showFilters ? <ClearIcon /> : <FilterIcon />}
            onClick={toggleFilters}
            sx={{ mr: 1 }}
          >
            {showFilters ? "Hide Filters" : "Filters"}
          </Button>
          
          <Box sx={{ display: 'inline-flex', border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Tooltip title="Grid View">
              <IconButton 
                color={viewMode === 'grid' ? 'primary' : 'default'} 
                onClick={() => handleViewModeChange('grid')}
              >
                <ViewGridIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="List View">
              <IconButton 
                color={viewMode === 'list' ? 'primary' : 'default'} 
                onClick={() => handleViewModeChange('list')}
              >
                <ViewListIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
      
      {/* Filters */}
      {showFilters && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
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
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="blocked">Blocked</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="type-label">Type</InputLabel>
                <Select
                  labelId="type-label"
                  name="requirement_type"
                  value={filters.requirement_type}
                  onChange={handleFilterChange}
                  label="Type"
                >
                  <MenuItem value="">Any Type</MenuItem>
                  <MenuItem value="functional">Functional</MenuItem>
                  <MenuItem value="non-functional">Non-Functional</MenuItem>
                  <MenuItem value="technical">Technical</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="business">Business</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="priority-label">Priority</InputLabel>
                <Select
                  labelId="priority-label"
                  name="priority"
                  value={filters.priority}
                  onChange={handleFilterChange}
                  label="Priority"
                >
                  <MenuItem value="">Any Priority</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="ai-generated-label">AI Generated</InputLabel>
                <Select
                  labelId="ai-generated-label"
                  name="is_ai_generated"
                  value={filters.is_ai_generated}
                  onChange={handleFilterChange}
                  label="AI Generated"
                >
                  <MenuItem value="">Any</MenuItem>
                  <MenuItem value="true">AI Generated</MenuItem>
                  <MenuItem value="false">Manually Created</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                onClick={applyFilters}
                sx={{ mr: 1 }}
              >
                Apply Filters
              </Button>
              <Button 
                variant="outlined" 
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {/* Main content */}
      {loading ? (
        <LoadingIndicator message="Loading requirements..." />
      ) : error ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="error" variant="h6">{error}</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }}
            onClick={fetchRequirements}
          >
            Try Again
          </Button>
        </Box>
      ) : requirements.length === 0 ? (
        <EmptyState 
          title="No requirements found"
          description="Start adding requirements to your project or use AI to generate them from your project documents."
          actionLabel="Add Requirement"
          secondaryActionLabel="Generate with AI"
          onAction={handleCreateClick}
          onSecondaryAction={handleAIGenerate}
          icon="requirements"
        />
      ) : (
        <>
          {/* View mode toggle & content */}
          <Box sx={{ mb: 3 }}>
            {viewMode === 'grid' ? renderGridView() : renderListView()}
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
      
      {/* Requirement Form Dialog */}
      <Dialog open={formOpen} onClose={handleFormClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {requirementToEdit ? 'Edit Requirement' : 'Add Requirement'}
        </DialogTitle>
        <DialogContent>
          <RequirementForm 
            projectId={projectId}
            initialData={requirementToEdit}
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
            Are you sure you want to delete the requirement "{requirementToDelete?.title}"? 
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
      
      {/* AI Generation Dialog */}
      <Dialog open={aiDialogOpen} onClose={handleAIDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Generate Requirements with AI</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Use AI to automatically extract requirements from your project documents.
          </Typography>
          
          {/* This would be replaced with a proper AI generation form */}
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            This feature will be implemented in the next iteration.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAIDialogClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RequirementList;
