import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { format } from 'date-fns';

// Helper function to determine status color
const getStatusColor = (status) => {
  const statusColors = {
    'Not Started': '#95a5a6', // Gray
    'In Progress': '#3498db', // Blue
    'Completed': '#2ecc71',   // Green
    'Delayed': '#e74c3c',     // Red
    'On Hold': '#f39c12',     // Orange
  };
  
  return statusColors[status] || '#95a5a6';
};

/**
 * TimelineView component for displaying roadmap in a timeline format
 */
const TimelineView = ({ phases, handleMilestoneMenuOpen }) => {
  // Combine all milestones from all phases
  const allMilestones = phases.flatMap(phase => 
    phase.milestones ? phase.milestones.map(m => ({
      ...m,
      phase_name: phase.name,
      phase_color: phase.color,
    })) : []
  );
  
  // Sort milestones by date
  const sortedMilestones = allMilestones.sort((a, b) => {
    const dateA = a.start_date ? new Date(a.start_date) : new Date();
    const dateB = b.start_date ? new Date(b.start_date) : new Date();
    return dateA - dateB;
  });
  
  return (
    <Timeline position="alternate" sx={{ p: 0 }}>
      {sortedMilestones.map((milestone) => (
        <TimelineItem key={milestone.id}>
          <TimelineOppositeContent color="text.secondary">
            {milestone.start_date && (
              <Typography variant="body2">
                {format(new Date(milestone.start_date), 'MMM d, yyyy')}
              </Typography>
            )}
          </TimelineOppositeContent>
          
          <TimelineSeparator>
            <TimelineDot
              sx={{ bgcolor: getStatusColor(milestone.status) }}
              variant={milestone.is_milestone ? 'filled' : 'outlined'}
            >
              <AccessTimeIcon fontSize="small" />
            </TimelineDot>
            <TimelineConnector />
          </TimelineSeparator>
          
          <TimelineContent>
            <Paper elevation={2} sx={{ 
              p: 2, 
              mb: 2,
              borderLeft: `4px solid ${milestone.phase_color || '#3498db'}` 
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1">
                  {milestone.title}
                </Typography>
                
                <IconButton 
                  size="small"
                  onClick={(event) => handleMilestoneMenuOpen(event, milestone.id)}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
              
              {milestone.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {milestone.description.length > 150
                    ? `${milestone.description.substring(0, 147)}...`
                    : milestone.description}
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: getStatusColor(milestone.status),
                  }}
                >
                  {milestone.status}
                </Typography>
                
                <Divider orientation="vertical" flexItem />
                
                <Typography variant="caption" color="text.secondary">
                  {milestone.phase_name}
                </Typography>
                
                {milestone.progress > 0 && (
                  <>
                    <Divider orientation="vertical" flexItem />
                    <Typography variant="caption">
                      {`${milestone.progress}% complete`}
                    </Typography>
                  </>
                )}
              </Box>
            </Paper>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
};

export default TimelineView;
