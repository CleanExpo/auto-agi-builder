import React from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  Card, 
  CardActionArea, 
  CardActions, 
  CardContent,
  Typography,
  Chip,
  IconButton,
  Avatar,
  Tooltip,
  Grid,
  LinearProgress
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Public as PublicIcon,
  LockOutlined as PrivateIcon,
  Bolt as AIIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const statusColors = {
  active: 'success',
  completed: 'info',
  archived: 'default'
};

const typeIcons = {
  web: '🌐',
  mobile: '📱',
  desktop: '💻',
  other: '📋'
};

const ProjectCard = ({ project, onEdit, onDelete }) => {
  const router = useRouter();
  
  const handleCardClick = () => {
    router.push(`/projects/${project.id}`);
  };

  const calculateProgress = () => {
    if (!project.stats) return 0;
    const { completed_requirements, total_requirements } = project.stats;
    if (!total_requirements) return 0;
    return (completed_requirements / total_requirements) * 100;
  };
  
  return (
    <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea onClick={handleCardClick} sx={{ flexGrow: 1 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" color="textSecondary">
              {typeIcons[project.project_type] || typeIcons.other} {project.project_type?.toUpperCase() || 'PROJECT'}
            </Typography>
            <Chip 
              size="small" 
              label={project.status?.toUpperCase() || 'ACTIVE'} 
              color={statusColors[project.status] || 'default'}
              sx={{ height: 20 }}
            />
          </Box>
          
          <Typography variant="h6" component="h2" gutterBottom noWrap>
            {project.name}
          </Typography>
          
          <Typography 
            variant="body2" 
            color="textSecondary" 
            sx={{ 
              mb: 2, 
              height: 60, 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              display: '-webkit-box', 
              WebkitLineClamp: 3, 
              WebkitBoxOrient: 'vertical' 
            }}
          >
            {project.description || 'No description available.'}
          </Typography>
          
          <Grid container spacing={1} sx={{ mb: 1 }}>
            {project.stats && (
              <>
                <Grid item xs={6}>
                  <Typography variant="caption" display="block" color="textSecondary">
                    Requirements
                  </Typography>
                  <Typography variant="body2">
                    {project.stats.completed_requirements || 0}/{project.stats.total_requirements || 0}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" display="block" color="textSecondary">
                    Prototypes
                  </Typography>
                  <Typography variant="body2">
                    {project.stats.prototype_count || 0}
                  </Typography>
                </Grid>
              </>
            )}
          </Grid>
          
          <Box sx={{ mt: 2, width: '100%' }}>
            <LinearProgress 
              variant="determinate" 
              value={calculateProgress()} 
              sx={{ height: 6, borderRadius: 3 }} 
            />
          </Box>
        </CardContent>
      </CardActionArea>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, backgroundColor: 'background.subtle' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title={project.is_public ? 'Public Project' : 'Private Project'}>
            <Box component="span" sx={{ mr: 1 }}>
              {project.is_public ? 
                <PublicIcon fontSize="small" color="action" /> : 
                <PrivateIcon fontSize="small" color="action" />
              }
            </Box>
          </Tooltip>
          
          <Tooltip title="Creation Date">
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
              <EventIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
              <Typography variant="caption" color="textSecondary">
                {project.created_at ? format(new Date(project.created_at), 'MMM d, yyyy') : 'Unknown'}
              </Typography>
            </Box>
          </Tooltip>
        </Box>
        
        <Box>
          <Tooltip title="Edit Project">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(project); }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Project">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(project); }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Card>
  );
};

export default ProjectCard;
