import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  FormControl, 
  FormControlLabel, 
  InputLabel, 
  Select, 
  MenuItem, 
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Switch,
  Chip,
  Autocomplete,
  Divider
} from '@mui/material';
import { requirementService } from '../../services/requirementService';
import { documentService } from '../../services/documentService';

const RequirementForm = ({ projectId, initialData = null, onClose, onSuccess }) => {
  const defaultFormData = {
    project_id: projectId,
    title: '',
    description: '',
    requirement_type: 'functional',
    priority: 'medium',
    status: 'draft',
    is_ai_generated: false,
    acceptance_criteria: '',
    source_document_id: null,
    source_text_excerpt: '',
  };
  
  const [formData, setFormData] = useState(initialData || defaultFormData);
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [succeeded, setSucceeded] = useState(false);
  const [projectDocuments, setProjectDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  
  // Load project documents for source document selection
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!projectId) return;
      
      setLoadingDocuments(true);
      try {
        const response = await documentService.getDocumentsByProject(projectId);
        setProjectDocuments(response.items || []);
      } catch (err) {
        console.error('Error loading project documents:', err);
      } finally {
        setLoadingDocuments(false);
      }
    };
    
    fetchDocuments();
  }, [projectId]);
  
  // Set initial data if provided
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        ...defaultFormData,
        project_id: projectId
      });
    }
  }, [initialData, projectId]);
  
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
  
  const handleSourceDocumentChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      source_document_id: newValue ? newValue.id : null
    }));
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Requirement title is required';
    } else if (formData.title.length > 200) {
      errors.title = 'Title must be 200 characters or less';
    }
    
    if (formData.description && formData.description.length > 2000) {
      errors.description = 'Description must be 2000 characters or less';
    }
    
    if (!formData.requirement_type) {
      errors.requirement_type = 'Requirement type is required';
    }
    
    if (!formData.priority) {
      errors.priority = 'Priority is required';
    }
    
    if (!formData.status) {
      errors.status = 'Status is required';
    }
    
    if (formData.acceptance_criteria && formData.acceptance_criteria.length > 1000) {
      errors.acceptance_criteria = 'Acceptance criteria must be 1000 characters or less';
    }
    
    if (formData.source_text_excerpt && formData.source_text_excerpt.length > 500) {
      errors.source_text_excerpt = 'Source text excerpt must be 500 characters or less';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      let result;
      
      if (initialData) {
        // Update existing requirement
        result = await requirementService.updateRequirement(initialData.id, formData);
      } else {
        // Create new requirement
        result = await requirementService.createRequirement(formData);
      }
      
      setSucceeded(true);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      console.error('Error saving requirement:', err);
      setError('Failed to save requirement. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Find source document object based on ID
  const selectedDocument = formData.source_document_id 
    ? projectDocuments.find(doc => doc.id === formData.source_document_id) 
    : null;
  
  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
      {/* Success and error alerts */}
      {succeeded && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Requirement {initialData ? 'updated' : 'created'} successfully!
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Basic information */}
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            id="title"
            name="title"
            label="Requirement Title"
            value={formData.title}
            onChange={handleChange}
            error={!!validationErrors.title}
            helperText={validationErrors.title}
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
        
        <Grid item xs={12} md={4}>
          <FormControl fullWidth error={!!validationErrors.requirement_type} disabled={loading}>
            <InputLabel id="requirement-type-label">Type</InputLabel>
            <Select
              labelId="requirement-type-label"
              id="requirement_type"
              name="requirement_type"
              value={formData.requirement_type}
              onChange={handleChange}
              label="Type"
            >
              <MenuItem value="functional">Functional</MenuItem>
              <MenuItem value="non-functional">Non-Functional</MenuItem>
              <MenuItem value="technical">Technical</MenuItem>
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="business">Business</MenuItem>
            </Select>
            {validationErrors.requirement_type && (
              <Typography variant="caption" color="error">
                {validationErrors.requirement_type}
              </Typography>
            )}
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <FormControl fullWidth error={!!validationErrors.priority} disabled={loading}>
            <InputLabel id="priority-label">Priority</InputLabel>
            <Select
              labelId="priority-label"
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              label="Priority"
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </Select>
            {validationErrors.priority && (
              <Typography variant="caption" color="error">
                {validationErrors.priority}
              </Typography>
            )}
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={4}>
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
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="blocked">Blocked</MenuItem>
            </Select>
            {validationErrors.status && (
              <Typography variant="caption" color="error">
                {validationErrors.status}
              </Typography>
            )}
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="acceptance_criteria"
            name="acceptance_criteria"
            label="Acceptance Criteria"
            value={formData.acceptance_criteria}
            onChange={handleChange}
            error={!!validationErrors.acceptance_criteria}
            helperText={validationErrors.acceptance_criteria || "Define the criteria that must be met for this requirement to be considered complete"}
            multiline
            rows={3}
            disabled={loading}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle1" gutterBottom>
            Source Information
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Autocomplete
            id="source_document_id"
            options={projectDocuments}
            loading={loadingDocuments}
            getOptionLabel={(option) => option.title || ''}
            value={selectedDocument}
            onChange={handleSourceDocumentChange}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Source Document"
                helperText="Select the document this requirement was extracted from (optional)"
                disabled={loading}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.is_ai_generated}
                onChange={handleChange}
                name="is_ai_generated"
                color="primary"
                disabled={loading}
              />
            }
            label="Generated by AI"
          />
          <Typography variant="caption" color="textSecondary" display="block">
            Indicate if this requirement was automatically extracted by AI
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="source_text_excerpt"
            name="source_text_excerpt"
            label="Source Text"
            value={formData.source_text_excerpt}
            onChange={handleChange}
            error={!!validationErrors.source_text_excerpt}
            helperText={validationErrors.source_text_excerpt || "Excerpt from source document that this requirement is based on (optional)"}
            multiline
            rows={3}
            disabled={loading}
          />
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
          {initialData ? 'Update Requirement' : 'Create Requirement'}
        </Button>
      </Box>
    </Box>
  );
};

export default RequirementForm;
