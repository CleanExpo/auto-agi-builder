import React from 'react';
import {
  Box,
  Button,
  Typography,
} from '@mui/material';
import ViewTimelineIcon from '@mui/icons-material/ViewTimeline';
import AddIcon from '@mui/icons-material/Add';
import AutorenewIcon from '@mui/icons-material/Autorenew';

/**
 * EmptyRoadmap component for displaying an empty state when no roadmap exists
 */
const EmptyRoadmap = ({ onCreatePhase, onGenerateDefault }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        textAlign: 'center',
        height: '60vh',
      }}
    >
      <ViewTimelineIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
      
      <Typography variant="h5" gutterBottom>
        No Roadmap Yet
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Start planning your project by creating phases and milestones.
      </Typography>
      
      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={onCreatePhase}
        >
          Create Phase
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<AutorenewIcon />}
          onClick={onGenerateDefault}
        >
          Generate Default Roadmap
        </Button>
      </Box>
    </Box>
  );
};

export default EmptyRoadmap;
