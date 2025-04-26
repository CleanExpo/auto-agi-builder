import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { 
  Step, 
  Stepper, 
  StepLabel, 
  Button, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  TextField, 
  CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckIcon from '@mui/icons-material/Check';
import CodeIcon from '@mui/icons-material/Code';
import DevicesIcon from '@mui/icons-material/Devices';
import ApiIcon from '@mui/icons-material/Api';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import BuildIcon from '@mui/icons-material/Build';

/**
 * Enhanced QuickStartForm component
 * A multi-step wizard for creating new projects with templates and AI assistance
 */
export default function QuickStartForm({ 
  onSubmit, 
  isLoading = false, 
  requiresAuth = false,
  onRequiresAuth = () => {}
}) {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [projectData, setProjectData] = useState({
    name: '',
    type: '',
    templateId: '',
    description: '',
    aiPrompt: ''
  });
  const [errors, setErrors] = useState({});

  // Project templates
  const templates = [
    {
      id: 'e-commerce',
      title: 'E-Commerce App',
      type: 'web',
      description: 'A complete online shopping platform with product catalog, cart, and checkout',
      image: '/images/templates/ecommerce.jpg',
      icon: <DevicesIcon />
    },
    {
      id: 'blog',
      title: 'Blog/Content Platform',
      type: 'web',
      description: 'Content management system with user accounts and commenting',
      image: '/images/templates/blog.jpg',
      icon: <DevicesIcon />
    },
    {
      id: 'mobile-app',
      title: 'Mobile Application',
      type: 'mobile',
      description: 'Cross-platform mobile app with authentication and data management',
      image: '/images/templates/mobile.jpg',
      icon: <DevicesIcon />
    },
    {
      id: 'rest-api',
      title: 'RESTful API Service',
      type: 'api',
      description: 'Backend API with authentication, data models, and documentation',
      image: '/images/templates/api.jpg',
      icon: <ApiIcon />
    },
    {
      id: 'desktop-app',
      title: 'Desktop Application',
      type: 'desktop',
      description: 'Cross-platform desktop app with modern UI and system integration',
      image: '/images/templates/desktop.jpg',
      icon: <DesktopWindowsIcon />
    },
    {
      id: 'custom',
      title: 'Custom Project',
      type: 'other',
      description: 'Start from scratch with a completely custom configuration',
      image: '/images/templates/custom.jpg',
      icon: <BuildIcon />
    }
  ];

  // Steps for the wizard
  const steps = ['Project Info', 'Select Template', 'AI Assistant'];

  // Handle form field changes
  const handleChange = (field, value) => {
    setProjectData({
      ...projectData,
      [field]: value
    });
    
    // Clear error when user types
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null
      });
    }
  };

  // Select a template
  const handleTemplateSelect = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    setProjectData({
      ...projectData,
      templateId,
      type: template.type
    });
  };

  // Validate the current step
  const validateStep = () => {
    const newErrors = {};
    
    if (activeStep === 0) {
      if (!projectData.name.trim()) {
        newErrors.name = 'Project name is required';
      }
    } else if (activeStep === 1) {
      if (!projectData.templateId) {
        newErrors.templateId = 'Please select a template';
      }
    } else if (activeStep === 2) {
      // AI prompt is optional, no validation needed
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Move to the next step
  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  // Move to the previous step
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Handle form submission
  const handleSubmit = () => {
    if (validateStep()) {
      if (requiresAuth) {
        onRequiresAuth();
        return;
      }
      
      onSubmit(projectData);
    }
  };

  // Render the project info step
  const renderProjectInfoStep = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Basic Project Information
      </Typography>
      
      <TextField
        label="Project Name"
        fullWidth
        margin="normal"
        value={projectData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        error={!!errors.name}
        helperText={errors.name || 'Give your project a descriptive name'}
        disabled={isLoading}
      />
      
      <TextField
        label="Brief Description (optional)"
        fullWidth
        margin="normal"
        multiline
        rows={3}
        value={projectData.description}
        onChange={(e) => handleChange('description', e.target.value)}
        helperText="Describe what you want to build in a few sentences"
        disabled={isLoading}
      />
    </Box>
  );

  // Render the template selection step
  const renderTemplateStep = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Choose a Project Template
      </Typography>
      
      {errors.templateId && (
        <Typography color="error" sx={{ mb: 2 }}>
          {errors.templateId}
        </Typography>
      )}
      
      <Grid container spacing={3}>
        {templates.map((template) => (
          <Grid item xs={12} sm={6} md={4} key={template.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                border: projectData.templateId === template.id ? '2px solid #4a6cf7' : '1px solid #eee',
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  transform: 'translateY(-5px)'
                }
              }}
              onClick={() => handleTemplateSelect(template.id)}
            >
              <CardMedia
                component="img"
                height="140"
                image={template.image}
                alt={template.title}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ mr: 1, color: '#4a6cf7' }}>
                    {template.icon}
                  </Box>
                  <Typography variant="h6" component="div">
                    {template.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {template.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  // Render the AI assistant step
  const renderAIAssistantStep = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        AI-Powered Project Setup
      </Typography>
      
      <Typography variant="body1" paragraph>
        Describe your project goals in natural language, and our AI will help generate the initial requirements and structure.
      </Typography>
      
      <TextField
        label="Tell the AI what you want to build (optional)"
        fullWidth
        margin="normal"
        multiline
        rows={5}
        value={projectData.aiPrompt}
        onChange={(e) => handleChange('aiPrompt', e.target.value)}
        helperText="Example: I want to build an e-commerce site for selling handmade jewelry with user accounts, a shopping cart, and payment processing"
        disabled={isLoading}
      />
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        This will help our AI assistant generate appropriate requirements, data models, and UI components for your project.
      </Typography>
    </Box>
  );

  // Render the current step content
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return renderProjectInfoStep();
      case 1:
        return renderTemplateStep();
      case 2:
        return renderAIAssistantStep();
      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3 }}>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {renderStepContent()}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          disabled={activeStep === 0 || isLoading}
          sx={{ mr: 1 }}
        >
          Back
        </Button>
        
        <Box>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              endIcon={<CheckIcon />}
              onClick={handleSubmit}
              disabled={isLoading}
              sx={{ 
                bgcolor: '#4a6cf7',
                '&:hover': {
                  bgcolor: '#3a5ce7'
                }
              }}
            >
              {isLoading ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} />
                  Creating Project...
                </>
              ) : (
                'Create Project'
              )}
            </Button>
          ) : (
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={handleNext}
              disabled={isLoading}
              sx={{ 
                bgcolor: '#4a6cf7',
                '&:hover': {
                  bgcolor: '#3a5ce7'
                }
              }}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>
      
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
        No credit card required. Start building in minutes.
      </Typography>
    </Box>
  );
}
