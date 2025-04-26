import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { RoadmapProvider } from '../../contexts/RoadmapContext';
import { 
  Container, 
  Box, 
  Tabs, 
  Tab, 
  Typography, 
  Paper, 
  Breadcrumbs, 
  Link, 
  Button, 
  Chip, 
  Divider,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ListAlt as RequirementsIcon,
  Description as DocumentsIcon,
  DeveloperBoard as PrototypesIcon,
  Group as CollaboratorsIcon,
  Edit as EditIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';

import { ProjectProvider, useProject } from '../../contexts/ProjectContext';
import AppLayout from '../../components/layout/AppLayout';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import ProjectForm from '../../components/projects/ProjectForm';
import ProjectOverview from '../../components/projects/ProjectOverview';
import RequirementList from '../../components/requirements/RequirementList';
import DocumentList from '../../components/documents/DocumentList';
import PrototypeList from '../../components/prototypes/PrototypeList';
import CollaboratorList from '../../components/projects/CollaboratorList';

// Define tab content components
const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
      style={{ paddingTop: '24px' }}
    >
      {value === index && children}
    </div>
  );
};

const ProjectDetailContent = () => {
  const router = useRouter();
  const { id } = router.query;
  const { currentProject, loadProject, loading, error, updateProject } = useProject();
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  
  // Load project data when ID is available
  useEffect(() => {
    if (id) {
      loadProject(id);
    }
  }, [id, loadProject]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle back button click
  const handleBackClick = () => {
    router.push('/projects');
  };
  
  // Handle edit button click
  const handleEditClick = () => {
    setEditMode(true);
  };
  
  // Handle form close/cancel
  const handleFormClose = () => {
    setEditMode(false);
  };
  
  // Handle form success
  const handleFormSuccess = () => {
    setEditMode(false);
    // Reload project data
    loadProject(id);
  };
  
  // If loading, show loading indicator
  if (loading) {
    return <LoadingIndicator message="Loading project details..." />;
  }
  
  // If error, show error message
  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error" gutterBottom>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => loadProject(id)}
          sx={{ mt: 2 }}
        >
          Try Again
        </Button>
      </Box>
    );
  }
  
  // If no project loaded, show message
  if (!currentProject) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Project not found
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleBackClick}
          startIcon={<BackIcon />}
          sx={{ mt: 2 }}
        >
          Back to Projects
        </Button>
      </Box>
    );
  }
  
  // Determine status color
  const statusColor = {
    active: 'success',
    completed: 'info',
    archived: 'default'
  }[currentProject.status] || 'default';
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs navigation */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/" underline="hover">Home</Link>
        <Link color="inherit" href="/projects" underline="hover">Projects</Link>
        <Typography color="text.primary">{currentProject.name}</Typography>
      </Breadcrumbs>
      
      {editMode ? (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>Edit Project</Typography>
          <ProjectForm 
            initialData={currentProject} 
            onClose={handleFormClose} 
            onSuccess={handleFormSuccess}
          />
        </Paper>
      ) : (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="h4">{currentProject.name}</Typography>
                <Chip 
                  label={currentProject.status?.toUpperCase()} 
                  color={statusColor} 
                  size="small" 
                  sx={{ ml: 2 }}
                />
                {currentProject.is_public && (
                  <Chip 
                    label="PUBLIC" 
                    size="small"
                    variant="outlined"
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {currentProject.description || 'No description provided.'}
              </Typography>
            </Box>
            <Box>
              <Button 
                variant="outlined" 
                startIcon={<EditIcon />} 
                onClick={handleEditClick}
              >
                Edit Project
              </Button>
            </Box>
          </Box>
        </Paper>
      )}
      
      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label="Overview" 
            icon={<DashboardIcon />} 
            iconPosition="start"
            id="project-tab-0"
            aria-controls="project-tabpanel-0"
          />
          <Tab 
            label="Requirements" 
            icon={<RequirementsIcon />} 
            iconPosition="start"
            id="project-tab-1"
            aria-controls="project-tabpanel-1"
          />
          <Tab 
            label="Documents" 
            icon={<DocumentsIcon />} 
            iconPosition="start"
            id="project-tab-2"
            aria-controls="project-tabpanel-2"
          />
          <Tab 
            label="Prototypes" 
            icon={<PrototypesIcon />} 
            iconPosition="start"
            id="project-tab-3"
            aria-controls="project-tabpanel-3"
          />
          <Tab 
            label="Collaborators" 
            icon={<CollaboratorsIcon />} 
            iconPosition="start"
            id="project-tab-4"
            aria-controls="project-tabpanel-4"
          />
        </Tabs>
      </Paper>
      
      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <ProjectOverview project={currentProject} />
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <RequirementList projectId={currentProject.id} />
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <DocumentList projectId={currentProject.id} />
      </TabPanel>
      
      <TabPanel value={tabValue} index={3}>
        <PrototypeList projectId={currentProject.id} />
      </TabPanel>
      
      <TabPanel value={tabValue} index={4}>
        <CollaboratorList projectId={currentProject.id} />
      </TabPanel>
    </Container>
  );
};

const ProjectDetailPage = () => {
  return (
    <>
      <Head>
        <title>Project Details | Auto AGI Builder</title>
        <meta name="description" content="View and manage project details" />
      </Head>
      <ProjectProvider>
        <RoadmapProvider>
          <AppLayout>
            <ProjectDetailContent />
          </AppLayout>
        </RoadmapProvider>
      </ProjectProvider>
    </>
  );
};

export default ProjectDetailPage;
