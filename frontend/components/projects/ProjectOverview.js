import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  Stack
} from '@mui/material';
import { 
  Assignment as AssignmentIcon,
  Description as DocumentIcon,
  DeveloperBoard as PrototypeIcon,
  Group as GroupIcon,
  Event as EventIcon,
  CheckCircle as CompletedIcon,
  Pending as PendingIcon,
  Error as BlockedIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useProject } from '../../contexts/ProjectContext';
import LoadingIndicator from '../common/LoadingIndicator';

const StatCard = ({ title, value, icon, color, secondary = null }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4">
              {value}
            </Typography>
            {secondary && (
              <Typography variant="body2" color="textSecondary">
                {secondary}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.main` }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

const ProjectOverview = ({ project }) => {
  const { getProjectStats, loading } = useProject();
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    const loadStats = async () => {
      if (project?.id) {
        const projectStats = await getProjectStats(project.id);
        if (projectStats) {
          setStats(projectStats);
        }
      }
    };
    
    loadStats();
  }, [project, getProjectStats]);
  
  if (loading) {
    return <LoadingIndicator message="Loading project statistics..." />;
  }
  
  if (!project) {
    return (
      <Typography variant="body1">
        Project data not available
      </Typography>
    );
  }
  
  // Calculate requirement completion percentage
  const requirementsTotal = stats?.total_requirements || 0;
  const requirementsCompleted = stats?.completed_requirements || 0;
  const requirementsProgress = requirementsTotal > 0 
    ? Math.round((requirementsCompleted / requirementsTotal) * 100) 
    : 0;
  
  // Format dates
  const createdDate = project.created_at 
    ? format(new Date(project.created_at), 'MMM d, yyyy')
    : 'Unknown';
  
  const updatedDate = project.updated_at 
    ? format(new Date(project.updated_at), 'MMM d, yyyy')
    : 'Unknown';
  
  return (
    <Box sx={{ mb: 4 }}>
      {/* Key Statistics */}
      <Typography variant="h6" gutterBottom>
        Project Statistics
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Requirements" 
            value={requirementsTotal}
            icon={<AssignmentIcon />}
            color="primary"
            secondary={requirementsCompleted > 0 ? `${requirementsCompleted} completed` : null}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Documents" 
            value={stats?.document_count || 0}
            icon={<DocumentIcon />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Prototypes" 
            value={stats?.prototype_count || 0}
            icon={<PrototypeIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Collaborators" 
            value={stats?.collaborator_count || 0}
            icon={<GroupIcon />}
            color="warning"
          />
        </Grid>
      </Grid>
      
      {/* Progress Section */}
      <Typography variant="h6" gutterBottom>
        Project Progress
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom>
              Requirements Completion
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box sx={{ flexGrow: 1, mr: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={requirementsProgress} 
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
              <Typography variant="body2" color="textSecondary">
                {requirementsProgress}%
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Box>
                <Typography variant="subtitle2">Total</Typography>
                <Typography variant="h6">{requirementsTotal}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">Completed</Typography>
                <Typography variant="h6">{requirementsCompleted}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">In Progress</Typography>
                <Typography variant="h6">
                  {(stats?.in_progress_requirements || 0)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">Blocked</Typography>
                <Typography variant="h6">{(stats?.blocked_requirements || 0)}</Typography>
              </Box>
            </Box>
            
            {requirementsTotal === 0 && (
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  No requirements added yet. Add requirements to track project progress.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom>
              Project Timeline
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <EventIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Created" 
                  secondary={createdDate}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <EventIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Last Updated" 
                  secondary={updatedDate}
                />
              </ListItem>
              {project.status === 'completed' && project.completed_at && (
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Completed" 
                    secondary={format(new Date(project.completed_at), 'MMM d, yyyy')}
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Recent Activity - This would typically include a list of recent actions */}
      <Typography variant="h6" gutterBottom>
        Recent Activity
      </Typography>
      <Paper sx={{ p: 3 }}>
        {stats?.recent_activity?.length > 0 ? (
          <List>
            {stats.recent_activity.map((activity, index) => (
              <ListItem key={index} divider={index < stats.recent_activity.length - 1}>
                <ListItemIcon>
                  {activity.type === 'requirement_added' && <AssignmentIcon color="primary" />}
                  {activity.type === 'document_uploaded' && <DocumentIcon color="info" />}
                  {activity.type === 'prototype_generated' && <PrototypeIcon color="success" />}
                  {activity.type === 'collaborator_added' && <GroupIcon color="warning" />}
                </ListItemIcon>
                <ListItemText 
                  primary={activity.description}
                  secondary={activity.timestamp ? format(new Date(activity.timestamp), 'MMM d, yyyy, HH:mm') : ''}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body1" color="textSecondary">
              No recent activity to display
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Start working on your project to see activity here
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ProjectOverview;
