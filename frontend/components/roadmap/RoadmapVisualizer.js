import React, { useState, useEffect } from 'react';
import { useRoadmap } from '../../contexts/RoadmapContext';
import { useNotification } from '../../contexts/NotificationContext';
import {
  Box,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Tooltip,
  IconButton,
  Divider,
  Menu,
  MenuItem,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import ViewTimelineIcon from '@mui/icons-material/ViewTimeline';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RefreshIcon from '@mui/icons-material/Refresh';

// Import the custom components
import TimelineView from './TimelineView';
import KanbanView from './KanbanView';
import EmptyRoadmap from './EmptyRoadmap';
import { PhaseDialog, MilestoneDialog } from './RoadmapDialogs';

// Status options for milestones
const STATUS_OPTIONS = [
  { value: 'Not Started', color: '#95a5a6' }, // Gray
  { value: 'In Progress', color: '#3498db' }, // Blue
  { value: 'Completed', color: '#2ecc71' },   // Green
  { value: 'Delayed', color: '#e74c3c' },     // Red
  { value: 'On Hold', color: '#f39c12' },     // Orange
];

// Phase colors
const PHASE_COLORS = [
  '#3498db', // Blue
  '#9b59b6', // Purple
  '#2ecc71', // Green
  '#f1c40f', // Yellow
  '#e74c3c', // Red
  '#1abc9c', // Teal
  '#e67e22', // Orange
  '#34495e', // Dark Blue
];

/**
 * RoadmapVisualizer component for displaying and managing project roadmap
 */
const RoadmapVisualizer = ({ projectId }) => {
  const {
    roadmap,
    phases,
    milestones,
    currentPhase,
    currentMilestone,
    loading,
    error,
    fetchProjectRoadmap,
    generateDefaultRoadmap,
    createPhase,
    updatePhase,
    deletePhase,
    reorderPhases,
    selectPhase,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    reorderMilestones,
    selectMilestone,
  } = useRoadmap();
  
  const { showNotification } = useNotification();
  
  // Local state
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'kanban'
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPhaseDialogOpen, setIsPhaseDialogOpen] = useState(false);
  const [isMilestoneDialogOpen, setIsMilestoneDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState('create'); // 'create' or 'edit'
  const [showEmptyState, setShowEmptyState] = useState(false);
  
  // Menu states
  const [phaseMenuAnchorEl, setPhaseMenuAnchorEl] = useState(null);
  const [phaseMenuId, setPhaseMenuId] = useState(null);
  const [milestoneMenuAnchorEl, setMilestoneMenuAnchorEl] = useState(null);
  const [milestoneMenuId, setMilestoneMenuId] = useState(null);
  
  // Form states
  const [phaseForm, setPhaseForm] = useState({
    name: '',
    description: '',
    color: PHASE_COLORS[0],
  });
  
  const [milestoneForm, setMilestoneForm] = useState({
    title: '',
    description: '',
    start_date: null,
    end_date: null,
    status: 'Not Started',
    progress: 0,
    is_milestone: true,
  });

  // Check if roadmap is empty
  useEffect(() => {
    if (!loading && phases.length === 0) {
      setShowEmptyState(true);
    } else {
      setShowEmptyState(false);
    }
  }, [loading, phases]);

  // Fetch roadmap data when projectId changes
  useEffect(() => {
    if (projectId) {
      fetchProjectRoadmap(projectId);
    }
  }, [projectId, fetchProjectRoadmap]);
  
  // Handle zoom controls
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 2));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };
  
  // Handle view mode toggle
  const toggleViewMode = () => {
    setViewMode(prev => (prev === 'timeline' ? 'kanban' : 'timeline'));
  };
  
  // Phase menu handlers
  const handlePhaseMenuOpen = (event, phaseId) => {
    setPhaseMenuAnchorEl(event.currentTarget);
    setPhaseMenuId(phaseId);
  };
  
  const handlePhaseMenuClose = () => {
    setPhaseMenuAnchorEl(null);
    setPhaseMenuId(null);
  };
  
  // Phase dialog handlers
  const openCreatePhaseDialog = () => {
    setDialogAction('create');
    setPhaseForm({
      name: '',
      description: '',
      color: PHASE_COLORS[0],
    });
    setIsPhaseDialogOpen(true);
  };
  
  const openEditPhaseDialog = () => {
    if (!phaseMenuId) return;
    
    const phase = phases.find(p => p.id === phaseMenuId);
    if (phase) {
      setDialogAction('edit');
      setPhaseForm({
        name: phase.name,
        description: phase.description || '',
        color: phase.color,
      });
      setIsPhaseDialogOpen(true);
    }
    handlePhaseMenuClose();
  };
  
  const handlePhaseDialogClose = () => {
    setIsPhaseDialogOpen(false);
  };
  
  // Phase form handlers
  const handlePhaseFormChange = (field) => (event) => {
    setPhaseForm({
      ...phaseForm,
      [field]: event.target.value,
    });
  };
  
  const handlePhaseSubmit = async () => {
    if (!phaseForm.name) {
      showNotification('error', 'Phase name is required');
      return;
    }
    
    if (dialogAction === 'create') {
      await createPhase(projectId, {
        ...phaseForm,
        order: phases.length,
      });
    } else if (dialogAction === 'edit' && phaseMenuId) {
      await updatePhase(phaseMenuId, phaseForm);
    }
    
    handlePhaseDialogClose();
  };
  
  // Phase delete handler
  const handlePhaseDelete = async () => {
    if (phaseMenuId) {
      if (window.confirm('Are you sure you want to delete this phase? All milestones in this phase will also be deleted.')) {
        await deletePhase(phaseMenuId);
      }
    }
    
    handlePhaseMenuClose();
  };
  
  // Milestone menu handlers
  const handleMilestoneMenuOpen = (event, milestoneId) => {
    event.stopPropagation();
    setMilestoneMenuAnchorEl(event.currentTarget);
    setMilestoneMenuId(milestoneId);
  };
  
  const handleMilestoneMenuClose = () => {
    setMilestoneMenuAnchorEl(null);
    setMilestoneMenuId(null);
  };
  
  // Milestone dialog handlers
  const openCreateMilestoneDialog = (phaseId) => {
    setDialogAction('create');
    setMilestoneForm({
      title: '',
      description: '',
      start_date: new Date(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 1 week
      status: 'Not Started',
      progress: 0,
      is_milestone: true,
    });
    selectPhase(phaseId);
    setIsMilestoneDialogOpen(true);
  };
  
  const openEditMilestoneDialog = () => {
    if (!milestoneMenuId) return;
    
    const milestone = milestones.find(m => m.id === milestoneMenuId);
    if (milestone) {
      setDialogAction('edit');
      setMilestoneForm({
        title: milestone.title,
        description: milestone.description || '',
        start_date: milestone.start_date ? new Date(milestone.start_date) : null,
        end_date: milestone.end_date ? new Date(milestone.end_date) : null,
        status: milestone.status,
        progress: milestone.progress,
        is_milestone: milestone.is_milestone,
      });
      selectMilestone(milestone.id);
      setIsMilestoneDialogOpen(true);
    }
    handleMilestoneMenuClose();
  };
  
  const handleMilestoneDialogClose = () => {
    setIsMilestoneDialogOpen(false);
  };
  
  // Milestone form handlers
  const handleMilestoneFormChange = (field) => (event) => {
    setMilestoneForm({
      ...milestoneForm,
      [field]: event.target.value,
    });
  };
  
  const handleMilestoneDateChange = (field) => (date) => {
    setMilestoneForm({
      ...milestoneForm,
      [field]: date,
    });
  };
  
  const handleMilestoneSubmit = async () => {
    if (!milestoneForm.title) {
      showNotification('error', 'Milestone title is required');
      return;
    }
    
    if (dialogAction === 'create' && currentPhase) {
      await createMilestone(currentPhase.id, {
        ...milestoneForm,
        order: milestones.length,
      });
    } else if (dialogAction === 'edit' && milestoneMenuId) {
      await updateMilestone(milestoneMenuId, milestoneForm);
    }
    
    handleMilestoneDialogClose();
  };
  
  // Milestone delete handler
  const handleMilestoneDelete = async () => {
    if (milestoneMenuId) {
      if (window.confirm('Are you sure you want to delete this milestone?')) {
        await deleteMilestone(milestoneMenuId);
      }
    }
    
    handleMilestoneMenuClose();
  };
  
  // Generate default roadmap handler
  const handleGenerateDefaultRoadmap = async () => {
    if (window.confirm('This will create a default roadmap template. Any existing roadmap data will be preserved. Continue?')) {
      await generateDefaultRoadmap(projectId);
    }
  };
  
  // Drag and drop handlers
  const handleDragEnd = (result) => {
    const { source, destination, type } = result;
    
    // Dropped outside the list
    if (!destination) return;
    
    // Reorder phases
    if (type === 'phase') {
      if (source.index !== destination.index) {
        const newPhaseIds = Array.from(phases).map(phase => phase.id);
        const [movedItem] = newPhaseIds.splice(source.index, 1);
        newPhaseIds.splice(destination.index, 0, movedItem);
        reorderPhases(projectId, newPhaseIds);
      }
    }
    // Reorder milestones
    else if (type === 'milestone' && currentPhase) {
      if (source.index !== destination.index) {
        const newMilestoneIds = Array.from(milestones).map(milestone => milestone.id);
        const [movedItem] = newMilestoneIds.splice(source.index, 1);
        newMilestoneIds.splice(destination.index, 0, movedItem);
        reorderMilestones(currentPhase.id, newMilestoneIds);
      }
    }
  };
  
  return (
    <Box sx={{ mb: 4 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ flexGrow: 1 }}>
            Project Roadmap
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Toggle view mode">
              <IconButton onClick={toggleViewMode}>
                {viewMode === 'timeline' ? (
                  <CalendarViewMonthIcon />
                ) : (
                  <ViewTimelineIcon />
                )}
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Refresh roadmap">
              <IconButton onClick={() => fetchProjectRoadmap(projectId)}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            
            {viewMode === 'timeline' && (
              <>
                <Tooltip title="Zoom in">
                  <IconButton onClick={handleZoomIn}>
                    <ZoomInIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Zoom out">
                  <IconButton onClick={handleZoomOut}>
                    <ZoomOutIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
            
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              size="small"
              onClick={openCreatePhaseDialog}
            >
              Add Phase
            </Button>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {error && !loading && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {!loading && !error && showEmptyState && (
          <EmptyRoadmap
            onCreatePhase={openCreatePhaseDialog}
            onGenerateDefault={handleGenerateDefaultRoadmap}
          />
        )}
        
        {!loading && !error && !showEmptyState && (
          <Box
            sx={{
              transform: viewMode === 'timeline' ? `scale(${zoomLevel})` : 'none',
              transformOrigin: 'top center',
              transition: 'transform 0.2s',
            }}
          >
            {viewMode === 'timeline' ? (
              <TimelineView
                phases={phases}
                handleMilestoneMenuOpen={handleMilestoneMenuOpen}
              />
            ) : (
              <KanbanView
                phases={phases}
                currentPhase={currentPhase}
                milestones={milestones}
                handlePhaseMenuOpen={handlePhaseMenuOpen}
                handleMilestoneMenuOpen={handleMilestoneMenuOpen}
                openCreateMilestoneDialog={openCreateMilestoneDialog}
                selectPhase={selectPhase}
                onDragEnd={handleDragEnd}
              />
            )}
          </Box>
        )}
      </Paper>
      
      {/* Phase Dialog */}
      <PhaseDialog
        isOpen={isPhaseDialogOpen}
        onClose={handlePhaseDialogClose}
        phaseForm={phaseForm}
        handlePhaseFormChange={handlePhaseFormChange}
        handlePhaseSubmit={handlePhaseSubmit}
        dialogAction={dialogAction}
      />
      
      {/* Milestone Dialog */}
      <MilestoneDialog
        isOpen={isMilestoneDialogOpen}
        onClose={handleMilestoneDialogClose}
        milestoneForm={milestoneForm}
        handleMilestoneFormChange={handleMilestoneFormChange}
        handleMilestoneDateChange={handleMilestoneDateChange}
        handleMilestoneSubmit={handleMilestoneSubmit}
        dialogAction={dialogAction}
      />
      
      {/* Phase Context Menu */}
      <Menu
        anchorEl={phaseMenuAnchorEl}
        open={Boolean(phaseMenuAnchorEl)}
        onClose={handlePhaseMenuClose}
      >
        <MenuItem onClick={openEditPhaseDialog}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Phase
        </MenuItem>
        <MenuItem onClick={handlePhaseDelete}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Phase
        </MenuItem>
      </Menu>
      
      {/* Milestone Context Menu */}
      <Menu
        anchorEl={milestoneMenuAnchorEl}
        open={Boolean(milestoneMenuAnchorEl)}
        onClose={handleMilestoneMenuClose}
      >
        <MenuItem onClick={openEditMilestoneDialog}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Milestone
        </MenuItem>
        <MenuItem onClick={handleMilestoneDelete}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Milestone
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default RoadmapVisualizer;
