import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Box, Container, Typography } from '@mui/material';

import { ProjectProvider, useProject } from '../../contexts/ProjectContext';
import ProjectList from '../../components/projects/ProjectList';
import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../contexts/AuthContext';

const ProjectsContent = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/projects');
    }
  }, [isAuthenticated, authLoading, router]);
  
  if (authLoading || !isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }
  
  return <ProjectList />;
};

const ProjectsPage = () => {
  return (
    <>
      <Head>
        <title>Projects | Auto AGI Builder</title>
        <meta name="description" content="Manage your AI-powered projects" />
      </Head>
      <ProjectProvider>
        <AppLayout>
          <ProjectsContent />
        </AppLayout>
      </ProjectProvider>
    </>
  );
};

export default ProjectsPage;
