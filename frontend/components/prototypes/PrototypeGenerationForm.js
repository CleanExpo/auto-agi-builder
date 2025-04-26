import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Grid, 
  Paper,
  Slider,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  RadioGroup,
  Radio,
  Switch,
  Chip,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  CircularProgress,
  Autocomplete,
  Card,
  CardMedia,
  CardContent,
  Tooltip
} from '@mui/material';
import { 
  Autorenew as GenerateIcon,
  Info as InfoIcon,
  Code as CodeIcon,
  Palette as PaletteIcon,
  Devices as DevicesIcon,
  Lightbulb as CreativityIcon
} from '@mui/icons-material';
import { prototypeService } from '../../services/prototypeService';
import { requirementService } from '../../services/requirementService';

const PrototypeGenerationForm = ({ projectId, onClose, onSuccess }) => {
  // State for form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [prototypeType, setPrototypeType] = useState('mockup');
  const [stylePreferences, setStylePreferences] = useState({
    color_scheme: 'light',
    style: 'modern',
    theme: 'default'
  });
  const [technicalConstraints, setTechnicalConstraints] = useState({
    responsive: true,
    target_devices: ['desktop', 'mobile'],
    tech_stack: [],
    accessibility_level: 'AA'
  });
  const [includedFeatures, setIncludedFeatures] = useState([]);
  const [excludedFeatures, setExcludedFeatures] = useState([]);
  const [aiCreativityLevel, setAICreativityLevel] = useState(5);
  const [requirements, setRequirements] = useState([]);
  const [selectedRequirements, setSelectedRequirements] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchingRequirements, setFetchingRequirements] = useState(false);
  const [error, setError] = useState(null);
  const [succeeded, setSucceeded] = useState(false);
  
  // Predefined options
  const colorSchemes = ['light', 'dark', 'colorful', 'monochrome', 'pastel'];
  const styles = ['modern', 'minimalist', 'classic', 'playful', 'corporate', 'elegant'];
  const themes = ['default', 'material', 'ios', 'bootstrap', 'custom'];
  const targetDevices = ['desktop', 'mobile', 'tablet', 'wearable'];
  const techStacks = ['html_css', 'reactjs', 'angular', 'vue', 'bootstrap', 'material_ui'];
  const accessibilityLevels = ['A', 'AA', 'AAA'];
  const commonFeatures = [
    'login_registration', 'user_profiles', 'search', 'notifications', 
    'dashboard', 'analytics', 'file_upload', 'payment', 'responsive_design', 
    'dark_mode', 'multi_language', 'admin_panel'
  ];
  
  // Fetch project requirements
  useEffect(() => {
    if (!projectId) return;
    
    const fetchRequirements = async () => {
      setFetchingRequirements(true);
      try {
        const data = await requirementService.getRequirementsByProject(
          projectId, 
          { status: 'active' }, // Only get active requirements
          1, 
          100 // Get up to 100 requirements
        );
        setRequirements(data.items || []);
      } catch (err) {
        console.error('Error fetching requirements:', err);
        setError('Failed to load project requirements.');
      } finally {
        setFetchingRequirements(false);
      }
    };
    
    fetchRequirements();
  }, [projectId]);
  
  // Handlers for form field changes
  const handleNameChange = (e) => {
    setName(e.target.value);
    // Clear validation error when field is edited
    if (validationErrors.name) {
      setValidationErrors(prev => ({ ...prev, name: null }));
    }
  };
  
  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
    // Clear validation error when field is edited
    if (validationErrors.description) {
      setValidationErrors(prev => ({ ...prev, description: null }));
    }
  };
  
  const handlePrototypeTypeChange = (e) => {
    setPrototypeType(e.target.value);
  };
  
  const handleStyleChange = (e) => {
    const { name, value } = e.target;
    setStylePreferences(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleTechnicalChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setTechnicalConstraints(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleTargetDevicesChange = (event, newValue) => {
    setTechnicalConstraints(prev => ({
      ...prev,
      target_devices: newValue
    }));
  };
  
  const handleTechStackChange = (event, newValue) => {
    setTechnicalConstraints(prev => ({
      ...prev,
      tech_stack: newValue
    }));
  };
  
  const handleIncludedFeaturesChange = (event, newValue) => {
    setIncludedFeatures(newValue);
  };
  
  const handleExcludedFeaturesChange = (event, newValue) => {
    // Ensure no feature is both included and excluded
    const filteredValue = newValue.filter(
      feature => !includedFeatures.includes(feature)
    );
    setExcludedFeatures(filteredValue);
  };
  
  const handleRequirementsChange = (event, newValue) => {
    setSelectedRequirements(newValue);
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!name.trim()) {
      errors.name = 'Prototype name is required';
    } else if (name.length > 100) {
      errors.name = 'Name must be 100 characters or less';
    }
    
    if (description && description.length > 500) {
      errors.description = 'Description must be 500 characters or less';
    }
    
    if (selectedRequirements.length === 0) {
      errors.requirements = 'Please select at least one requirement';
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
      // Prepare generation parameters
      const generationParameters = prototypeService.createGenerationParameters(
        prototypeType,
        stylePreferences,
        technicalConstraints,
        includedFeatures,
        excludedFeatures,
        aiCreativityLevel
      );
      
      // Prepare the request payload
      const requirementIds = selectedRequirements.map(req => req.id);
      
      const prototypeRequest = prototypeService.preparePrototypeRequest(
        projectId,
        name,
        description,
        requirementIds,
        generationParameters
      );
      
      // Create the prototype
      const result = await prototypeService.createPrototype(prototypeRequest);
      
      setSucceeded(true);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        setTimeout(() => {
          onSuccess(result);
        }, 1500);
      }
    } catch (err) {
      console.error('Error creating prototype:', err);
      setError('Failed to create prototype. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Get feature display name from code
  const getFeatureDisplayName = (code) => {
    return code
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Get tech stack display name
  const getTechStackDisplayName = (code) => {
    const map = {
      'html_css': 'HTML & CSS',
      'reactjs': 'React.js',
      'angular': 'Angular',
      'vue': 'Vue.js',
      'bootstrap': 'Bootstrap',
      'material_ui': 'Material UI'
    };
    return map[code] || code;
  };
  
  // Render prototype type sample images
  const renderPrototypeTypeSamples = () => (
    <Grid container spacing={2} sx={{ mt: 2 }}>
      {['mockup', 'wireframe', 'interactive', 'code'].map((type) => (
        <Grid item xs={6} sm={3} key={type}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              border: 2, 
              borderColor: prototypeType === type ? 'primary.main' : 'transparent',
              '&:hover': { 
                boxShadow: 3 
              }
            }}
            onClick={() => setPrototypeType(type)}
          >
            <CardMedia
              component="img"
              height="100"
              image={`/static/images/prototypes/${type}-sample.jpg`}
              alt={`${type} prototype sample`}
            />
            <CardContent sx={{ p: 1, pb: '8px !important' }}>
              <Typography variant="subtitle2" align="center">
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
  
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {/* Success and error alerts */}
      {succeeded && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Prototype generation started successfully! You will be notified when it's ready.
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
          <Typography variant="h6" gutterBottom>
            Basic Information
          </Typography>
          <TextField
            required
            fullWidth
            id="name"
            name="name"
            label="Prototype Name"
            value={name}
            onChange={handleNameChange}
            error={!!validationErrors.name}
            helperText={validationErrors.name}
            disabled={loading}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            id="description"
            name="description"
            label="Description"
            value={description}
            onChange={handleDescriptionChange}
            error={!!validationErrors.description}
            helperText={validationErrors.description}
            multiline
            rows={2}
            disabled={loading}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Divider />
        </Grid>
        
        {/* Requirements selection */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Project Requirements
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Select the requirements that should be implemented in this prototype.
          </Typography>
          
          <Autocomplete
            multiple
            id="requirements-select"
            options={requirements}
            loading={fetchingRequirements}
            getOptionLabel={(option) => option.title}
            value={selectedRequirements}
            onChange={handleRequirementsChange}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option.title}
                  {...getTagProps({ index })}
                  key={option.id}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Requirements"
                placeholder="Select requirements"
                error={!!validationErrors.requirements}
                helperText={validationErrors.requirements}
                disabled={loading}
              />
            )}
            disabled={loading}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Divider />
        </Grid>
        
        {/* Prototype type selection */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Prototype Type
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Select the type of prototype to generate.
          </Typography>
          
          <FormControl component="fieldset" disabled={loading}>
            <RadioGroup
              row
              name="prototype_type"
              value={prototypeType}
              onChange={handlePrototypeTypeChange}
            >
              <FormControlLabel value="mockup" control={<Radio />} label="Mockup" />
              <FormControlLabel value="wireframe" control={<Radio />} label="Wireframe" />
              <FormControlLabel value="interactive" control={<Radio />} label="Interactive" />
              <FormControlLabel value="code" control={<Radio />} label="Code" />
            </RadioGroup>
          </FormControl>
          
          {renderPrototypeTypeSamples()}
        </Grid>
        
        <Grid item xs={12}>
          <Divider />
        </Grid>
        
        {/* Style preferences */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PaletteIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">
              Style Preferences
            </Typography>
          </Box>
          
          <FormControl fullWidth sx={{ mb: 2 }} disabled={loading}>
            <InputLabel id="color-scheme-label">Color Scheme</InputLabel>
            <Select
              labelId="color-scheme-label"
              id="color_scheme"
              name="color_scheme"
              value={stylePreferences.color_scheme}
              onChange={handleStyleChange}
              label="Color Scheme"
            >
              {colorSchemes.map(scheme => (
                <MenuItem key={scheme} value={scheme}>
                  {scheme.charAt(0).toUpperCase() + scheme.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth sx={{ mb: 2 }} disabled={loading}>
            <InputLabel id="style-label">UI Style</InputLabel>
            <Select
              labelId="style-label"
              id="style"
              name="style"
              value={stylePreferences.style}
              onChange={handleStyleChange}
              label="UI Style"
            >
              {styles.map(style => (
                <MenuItem key={style} value={style}>
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth disabled={loading}>
            <InputLabel id="theme-label">Theme</InputLabel>
            <Select
              labelId="theme-label"
              id="theme"
              name="theme"
              value={stylePreferences.theme}
              onChange={handleStyleChange}
              label="Theme"
            >
              {themes.map(theme => (
                <MenuItem key={theme} value={theme}>
                  {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        {/* Technical constraints */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CodeIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">
              Technical Constraints
            </Typography>
          </Box>
          
          <FormControl fullWidth sx={{ mb: 2 }} disabled={loading}>
            <InputLabel id="accessibility-label">Accessibility Level</InputLabel>
            <Select
              labelId="accessibility-label"
              id="accessibility_level"
              name="accessibility_level"
              value={technicalConstraints.accessibility_level}
              onChange={handleTechnicalChange}
              label="Accessibility Level"
            >
              {accessibilityLevels.map(level => (
                <MenuItem key={level} value={level}>
                  {level}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControlLabel
            control={
              <Switch
                checked={technicalConstraints.responsive}
                onChange={handleTechnicalChange}
                name="responsive"
                color="primary"
                disabled={loading}
              />
            }
            label="Responsive Design"
            sx={{ mb: 2 }}
          />
          
          <Autocomplete
            multiple
            id="target-devices"
            options={targetDevices}
            getOptionLabel={(option) => option.charAt(0).toUpperCase() + option.slice(1)}
            value={technicalConstraints.target_devices}
            onChange={handleTargetDevicesChange}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Target Devices"
                placeholder="Select devices"
                disabled={loading}
              />
            )}
            disabled={!technicalConstraints.responsive || loading}
            sx={{ mb: 2 }}
          />
          
          {prototypeType === 'code' && (
            <Autocomplete
              multiple
              id="tech-stack"
              options={techStacks}
              getOptionLabel={(option) => getTechStackDisplayName(option)}
              value={technicalConstraints.tech_stack}
              onChange={handleTechStackChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Technology Stack"
                  placeholder="Select technologies"
                  disabled={loading}
                />
              )}
              disabled={loading}
            />
          )}
        </Grid>
        
        <Grid item xs={12}>
          <Divider />
        </Grid>
        
        {/* Featured functionality */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Featured Functionality
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Include Features
              </Typography>
              <Autocomplete
                multiple
                id="included-features"
                options={commonFeatures.filter(f => !excludedFeatures.includes(f))}
                getOptionLabel={(option) => getFeatureDisplayName(option)}
                value={includedFeatures}
                onChange={handleIncludedFeaturesChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Features to Include"
                    placeholder="Select features"
                    disabled={loading}
                  />
                )}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Exclude Features
              </Typography>
              <Autocomplete
                multiple
                id="excluded-features"
                options={commonFeatures.filter(f => !includedFeatures.includes(f))}
                getOptionLabel={(option) => getFeatureDisplayName(option)}
                value={excludedFeatures}
                onChange={handleExcludedFeaturesChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Features to Exclude"
                    placeholder="Select features"
                    disabled={loading}
                  />
                )}
                disabled={loading}
              />
            </Grid>
          </Grid>
        </Grid>
        
        <Grid item xs={12}>
          <Divider />
        </Grid>
        
        {/* AI Creativity slider */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CreativityIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">
              AI Creativity Level
            </Typography>
            <Tooltip title="Higher values allow AI more creative freedom, lower values produce more conservative designs following common patterns.">
              <InfoIcon color="action" sx={{ ml: 1 }} fontSize="small" />
            </Tooltip>
          </Box>
          
          <Box sx={{ px: 2 }}>
            <Slider
              value={aiCreativityLevel}
              onChange={(e, newValue) => setAICreativityLevel(newValue)}
              min={1}
              max={10}
              step={1}
              marks={[
                { value: 1, label: 'Conservative' },
                { value: 5, label: 'Balanced' },
                { value: 10, label: 'Creative' }
              ]}
              valueLabelDisplay="on"
              disabled={loading}
            />
          </Box>
        </Grid>
      </Grid>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
        <Button 
          variant="outlined" 
          onClick={onClose} 
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <GenerateIcon />}
        >
          {loading ? 'Generating...' : 'Generate Prototype'}
        </Button>
      </Box>
    </Box>
  );
};

export default PrototypeGenerationForm;
