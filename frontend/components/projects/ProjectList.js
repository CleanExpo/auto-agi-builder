import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Container, 
  Grid, 
  Typography, 
  Chip, 
  TextField, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select,
  Pagination,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip
} from '@mui/material';
import { Add as AddIcon, FilterList as FilterIcon, Clear as ClearIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useProject } from '../../contexts/ProjectContext';
import ProjectCard from './ProjectCard';
import ProjectForm from './ProjectForm';
import EmptyState from '../common/EmptyState';
import LoadingIndicator from '../common/LoadingIndicator';

const ProjectList = () => {
  const { 
    projects,
    loading,
    error,
    pagination,
    filters,
    loadProjects,
    deleteProject,
    setFilters
  } = useProject();
  
  const [showFilters, setShowFilters] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    status: '',
    project_type: '',
    is_public: ''
  });
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  
  useEffect(() => {
    // Reset local filters when global filters change
    setLocalFilters(prevFilters => ({
      status: filters.status || '',
      project_type: filters.project_type || '',
      is_public: filters.is_public === null ? '' : filters.is_public.toString()
    }));
    
    // Determine if filters are applied
    setFiltersApplied(
      filters.status !== null || 
      filters.project_type !== null || 
      filters.is_public !== null
    );
  }, [filters]);
  
  const handlePageChange = (event, value) => {
    loadProjects(value, pagination.pageSize);
  };
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setLocalFilters({
      ...localFilters,
      [name]: value
    });
  };
  
  const applyFilters = () => {
    const newFilters = {
      status: localFilters.status || null,
      project_type: localFilters.project_type || null,
      is_public: localFilters.is_public === '' ? null : localFilters.is_public === 'true'
    };
    
    loadProjects(1, pagination.pageSize, newFilters);
    setFiltersApplied(true);
  };
  
  const clearFilters = () => {
    const emptyFilters = {
      status: null,
      project_type: null,
      is_public: null
    };
    
    setLocalFilters({
      status: '',
      project_type: '',
      is_public: ''
    });
    
    loadProjects(1, pagination.pageSize, emptyFilters);
    setFiltersApplied(false);
  };
  
  const handleCreateClick = () => {
    setFormOpen(true);
  };
  
  const handleFormClose = () => {
    setFormOpen(false);
  };
  
  const handleDeleteClick = (project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (projectToDelete) {
      await deleteProject(projectToDelete.id);
    }
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Projects
        </Typography>
        <Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={handleCreateClick}
            sx={{ mr: 2 }}
          >
            New Project
          </Button>
          <Button 
            variant={filtersApplied ? "contained" : "outlined"}
            color={filtersApplied ? "primary" : "default"}
            startIcon={showFilters ? <ClearIcon /> : <FilterIcon />}
            onClick={toggleFilters}
          >
            {showFilters ? "Hide Filters" : "Filters"}
            {filtersApplied && <Chip 
              size="small" 
              label="Applied" 
              color="primary" 
              sx={{ ml: 1 }} 
            />}
          </Button>
        </Box>
      </Box>
      
      {showFilters && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    name="status"
                    value={localFilters.status}
                    onChange={handleFilterChange}
                    label="Status"
                  >
                    <MenuItem value="">Any Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="archived">Archived</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="project-type-label">Project Type</InputLabel>
                  <Select
                    labelId="project-type-label"
                    name="project_type"
                    value={localFilters.project_type}
                    onChange={handleFilterChange}
                    label="Project Type"
                  >
                    <MenuItem value="">Any Type</MenuItem>
                    <MenuItem value="web">Web Application</MenuItem>
                    <MenuItem value="mobile">Mobile App</MenuItem>
                    <MenuItem value="desktop">Desktop Software</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="is-public-label">Visibility</InputLabel>
                  <Select
                    labelId="is-public-label"
                    name="is_public"
                    value={localFilters.is_public}
                    onChange={handleFilterChange}
                    label="Visibility"
                  >
                    <MenuItem value="">Any Visibility</MenuItem>
                    <MenuItem value="true">Public</MenuItem>
                    <MenuItem value="false">Private</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="contained" 
                  color="primary" 
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
          </CardContent>
        </Card>
      )}
      
      {loading ? (
        <LoadingIndicator message="Loading projects..." />
      ) : error ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="error" variant="h6">{error}</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }}
            onClick={() => loadProjects(pagination.page, pagination.pageSize)}
          >
            Try Again
          </Button>
        </Box>
      ) : projects.length === 0 ? (
        <EmptyState 
          title="No projects found"
          description={filtersApplied ? 
            "No projects match your current filters. Try adjusting your filters or create a new project." : 
            "You don't have any projects yet. Create your first project to get started."}
          actionLabel="Create Project"
          onAction={handleCreateClick}
          icon="project"
        />
      ) : (
        <>
          <Grid container spacing={3}>
            {projects.map((project) => (
              <Grid item xs={12} sm={6} md={4} key={project.id}>
                <ProjectCard 
                  project={project}
                  onEdit={() => {/* Handle edit */}}
                  onDelete={() => handleDeleteClick(project)}
                />
              </Grid>
            ))}
          </Grid>
          
          {pagination.total > pagination.pageSize && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
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
      
      {/* Create Project Dialog */}
      <Dialog open={formOpen} onClose={handleFormClose} maxWidth="md" fullWidth>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <ProjectForm 
            onClose={handleFormClose} 
            onSuccess={handleFormClose}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the project "{projectToDelete?.name}"? 
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
    </Container>
  );
};

export default ProjectList;
