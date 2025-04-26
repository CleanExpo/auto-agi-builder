import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  FormControl, 
  FormControlLabel, 
  FormLabel, 
  RadioGroup, 
  Radio, 
  InputLabel, 
  Select, 
  MenuItem, 
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Switch
} from '@mui/material';
import { useProject } from '../../contexts/ProjectContext';

const ProjectForm = ({ initialData = null, onClose, onSuccess }) => {
  const { createProject, updateProject, loading, error } = useProject();
  
  const defaultFormData = {
    name: '',
    description: '',
    project_type: 'web',
    is_public: false,
    status: 'active'
  };
  
  const [formData, setFormData] = useState(initialData || defaultFormData);
  const [validationErrors, setValidationErrors] = useState({});
  const [succeeded, setSucceeded] = useState(false);
  
  useEffect(() => {
    // If initialData is provided, use it to initialize the form
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // For checkboxes, use checked property, otherwise use value
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Project name is required';
    } else if (formData.name.length > 100) {
      errors.name = 'Project name must be 100 characters or less';
    }
    
    if (formData.description && formData.description.length > 500) {
      errors.description = 'Description must be 500 characters or less';
    }
    
    if (!formData.project_type) {
      errors.project_type = 'Project type is required';
    }
    
    if (!formData.status) {
      errors.status = 'Status is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    let result;
    if (initialData) {
      // Update existing project
      result = await updateProject(initialData.id, formData);
    } else {
      // Create new project
      result = await createProject(formData);
    }
    
    if (result) {
      setSucceeded(true);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(result);
      }
    }
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
      {succeeded && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Project {initialData ? 'updated' : 'created'} successfully!
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            id="name"
            name="name"
            label="Project Name"
            value={formData.name}
            onChange={handleChange}
            error={!!validationErrors.name}
            helperText={validationErrors.name}
            disabled={loading}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="description"
            name="description"
            label="Description"
            value={formData.description}
            onChange={handleChange}
            error={!!validationErrors.description}
            helperText={validationErrors.description}
            multiline
            rows={4}
            disabled={loading}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={!!validationErrors.project_type} disabled={loading}>
            <InputLabel id="project-type-label">Project Type</InputLabel>
            <Select
              labelId="project-type-label"
              id="project_type"
              name="project_type"
              value={formData.project_type}
              onChange={handleChange}
              label="Project Type"
            >
              <MenuItem value="web">Web Application</MenuItem>
              <MenuItem value="mobile">Mobile App</MenuItem>
              <MenuItem value="desktop">Desktop Software</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
            {validationErrors.project_type && (
              <Typography variant="caption" color="error">
                {validationErrors.project_type}
              </Typography>
            )}
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={!!validationErrors.status} disabled={loading}>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              label="Status"
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </Select>
            {validationErrors.status && (
              <Typography variant="caption" color="error">
                {validationErrors.status}
              </Typography>
            )}
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.is_public}
                onChange={handleChange}
                name="is_public"
                color="primary"
                disabled={loading}
              />
            }
            label="Make this project public"
          />
          <Typography variant="caption" color="textSecondary" display="block">
            Public projects can be viewed by anyone with the link. Private projects are only visible to you and your collaborators.
          </Typography>
        </Grid>
      </Grid>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {initialData ? 'Update Project' : 'Create Project'}
        </Button>
      </Box>
    </Box>
  );
};

export default ProjectForm;
