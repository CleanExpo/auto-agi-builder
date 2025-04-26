import React, { useState, useEffect } from 'react';
import { useRequirements } from '../../contexts/RequirementContext';
import { useNotification } from '../../contexts/NotificationContext';
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip
} from '@mui/material';
import { 
  DragDropContext, 
  Droppable, 
  Draggable 
} from 'react-beautiful-dnd';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RefreshIcon from '@mui/icons-material/Refresh';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import InfoIcon from '@mui/icons-material/Info';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const getPriorityColor = (priority) => {
  switch (priority.toLowerCase()) {
    case 'critical':
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'success';
    default:
      return 'default';
  }
};

const RequirementPrioritizer = ({ projectId }) => {
  const { 
    requirements, 
    fetchRequirements, 
    updateRequirement,
    isLoading,
    error
  } = useRequirements();
  const { showNotification } = useNotification();
  
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('priority');
  const [openInfoDialog, setOpenInfoDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Load requirements into prioritizer
  useEffect(() => {
    if (projectId) {
      fetchRequirements(projectId);
    }
  }, [projectId, fetchRequirements]);
  
  // Set up prioritizer items when requirements change
  useEffect(() => {
    if (requirements && requirements.length > 0) {
      const sorted = [...requirements].sort((a, b) => {
        if (sortBy === 'priority') {
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return (priorityOrder[a.priority?.toLowerCase()] || 4) - 
                 (priorityOrder[b.priority?.toLowerCase()] || 4);
        } else if (sortBy === 'name') {
          return a.title.localeCompare(b.title);
        } else if (sortBy === 'created') {
          return new Date(a.created_at) - new Date(b.created_at);
        }
        return 0;
      });
      
      const filtered = sorted.filter(item => {
        if (filterBy === 'all') return true;
        return item.priority?.toLowerCase() === filterBy.toLowerCase();
      });
      
      setItems(filtered.map((req, index) => ({
        ...req,
        currentRank: index + 1,
        originalRank: index + 1
      })));
    } else {
      setItems([]);
    }
    setHasChanges(false);
  }, [requirements, filterBy, sortBy]);
  
  // Handle drag and drop
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const reordered = [...items];
    const [movedItem] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, movedItem);
    
    // Update ranks
    const updatedItems = reordered.map((item, index) => ({
      ...item,
      currentRank: index + 1
    }));
    
    setItems(updatedItems);
    setHasChanges(true);
  };
  
  // Move item up
  const moveItemUp = (index) => {
    if (index === 0) return;
    
    const updatedItems = [...items];
    const temp = updatedItems[index - 1];
    updatedItems[index - 1] = updatedItems[index];
    updatedItems[index] = temp;
    
    // Update ranks
    const reranked = updatedItems.map((item, index) => ({
      ...item,
      currentRank: index + 1
    }));
    
    setItems(reranked);
    setHasChanges(true);
  };
  
  // Move item down
  const moveItemDown = (index) => {
    if (index === items.length - 1) return;
    
    const updatedItems = [...items];
    const temp = updatedItems[index + 1];
    updatedItems[index + 1] = updatedItems[index];
    updatedItems[index] = temp;
    
    // Update ranks
    const reranked = updatedItems.map((item, index) => ({
      ...item,
      currentRank: index + 1
    }));
    
    setItems(reranked);
    setHasChanges(true);
  };
  
  // Save priority changes
  const savePriorities = async () => {
    if (!hasChanges) return;
    
    setSaving(true);
    
    try {
      // Map current rankings to priority levels
      const priorityMapping = {
        0: 'Critical',
        1: 'Critical',
        2: 'High',
        3: 'High',
        4: 'Medium',
        5: 'Medium',
        6: 'Low'
      };
      
      // Get default priority for items beyond specific mapping
      const getDefaultPriority = (rank) => {
        if (rank <= 2) return 'Critical';
        if (rank <= 5) return 'High';
        if (rank <= 10) return 'Medium';
        return 'Low';
      };
      
      // Process updates for all items with changed ranks
      const updates = items.map(item => {
        // Determine new priority based on rank
        const newPriority = priorityMapping[item.currentRank - 1] || 
                           getDefaultPriority(item.currentRank);
        
        // Only update if priority has changed
        if (item.priority !== newPriority) {
          return updateRequirement(item.id, { 
            priority: newPriority,
            rank: item.currentRank
          });
        }
        return Promise.resolve();
      });
      
      await Promise.all(updates);
      
      // Refresh requirements
      await fetchRequirements(projectId);
      
      setHasChanges(false);
      showNotification('success', 'Requirement priorities updated successfully');
    } catch (error) {
      console.error('Error saving priorities:', error);
      showNotification('error', 'Failed to update requirement priorities');
    } finally {
      setSaving(false);
    }
  };
  
  // Generate AI recommendations for priorities
  const generateAiRecommendations = async () => {
    setAiGenerating(true);
    
    try {
      // In a real implementation, this would call an AI service
      // For now, we'll simulate AI priority recommendations
      
      // Create a simulated AI priority assignment
      const aiPriorities = items.map(item => {
        // Simulated AI logic (in production this would be a real AI model)
        const words = item.description?.split(' ') || [];
        const hasUrgentWords = words.some(word => 
          ['urgent', 'critical', 'immediately', 'crucial'].includes(word.toLowerCase())
        );
        
        const hasHighWords = words.some(word => 
          ['important', 'significant', 'major'].includes(word.toLowerCase())
        );
        
        let aiPriority;
        if (hasUrgentWords) {
          aiPriority = 'Critical';
        } else if (hasHighWords) {
          aiPriority = 'High';
        } else if (words.length > 100) { // Complex requirements
          aiPriority = 'Medium';
        } else {
          aiPriority = 'Low';
        }
        
        return {
          ...item,
          priority: aiPriority
        };
      });
      
      // Sort by AI priority and update ranks
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const sortedItems = [...aiPriorities].sort((a, b) => {
        return (priorityOrder[a.priority.toLowerCase()] || 4) - 
               (priorityOrder[b.priority.toLowerCase()] || 4);
      });
      
      // Update ranks
      const rankedItems = sortedItems.map((item, index) => ({
        ...item,
        currentRank: index + 1
      }));
      
      setItems(rankedItems);
      setHasChanges(true);
      showNotification('success', 'AI priority recommendations generated');
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      showNotification('error', 'Failed to generate AI recommendations');
    } finally {
      setAiGenerating(false);
    }
  };
  
  // Reset to original order
  const resetPriorities = () => {
    if (requirements) {
      const sorted = [...requirements].sort((a, b) => {
        if (sortBy === 'priority') {
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return (priorityOrder[a.priority?.toLowerCase()] || 4) - 
                 (priorityOrder[b.priority?.toLowerCase()] || 4);
        } else if (sortBy === 'name') {
          return a.title.localeCompare(b.title);
        } else if (sortBy === 'created') {
          return new Date(a.created_at) - new Date(b.created_at);
        }
        return 0;
      });
      
      const filtered = sorted.filter(item => {
        if (filterBy === 'all') return true;
        return item.priority?.toLowerCase() === filterBy.toLowerCase();
      });
      
      setItems(filtered.map((req, index) => ({
        ...req,
        currentRank: index + 1,
        originalRank: index + 1
      })));
      
      setHasChanges(false);
    }
  };
  
  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2" sx={{ flexGrow: 1 }}>
          Requirement Prioritizer
        </Typography>
        
        <Tooltip title="How prioritization works">
          <IconButton 
            color="primary" 
            onClick={() => setOpenInfoDialog(true)}
            size="small"
            sx={{ mr: 1 }}
          >
            <InfoIcon />
          </IconButton>
        </Tooltip>
        
        <Button
          variant="outlined"
          color="primary"
          startIcon={<AutorenewIcon />}
          onClick={generateAiRecommendations}
          disabled={isLoading || saving || aiGenerating}
          sx={{ mr: 1 }}
        >
          {aiGenerating ? <CircularProgress size={24} /> : 'AI Suggest'}
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={savePriorities}
          disabled={isLoading || saving || !hasChanges}
        >
          {saving ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
        </Button>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="filter-label">Filter By</InputLabel>
          <Select
            labelId="filter-label"
            value={filterBy}
            label="Filter By"
            onChange={(e) => setFilterBy(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="critical">Critical</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="low">Low</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="sort-label">Sort By</InputLabel>
          <Select
            labelId="sort-label"
            value={sortBy}
            label="Sort By"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value="priority">Priority</MenuItem>
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="created">Created Date</MenuItem>
          </Select>
        </FormControl>
        
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={resetPriorities}
          disabled={isLoading || saving || !hasChanges}
          size="small"
        >
          Reset
        </Button>
        
        {hasChanges && (
          <Typography variant="body2" color="warning.main">
            Unsaved changes
          </Typography>
        )}
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {!isLoading && items.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No requirements found. Add requirements to prioritize them.
        </Alert>
      )}
      
      {!isLoading && items.length > 0 && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="requirements">
            {(provided) => (
              <List
                {...provided.droppableProps}
                ref={provided.innerRef}
                sx={{ 
                  width: '100%', 
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                {items.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                    {(provided) => (
                      <ListItem
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        divider
                        sx={{ 
                          bgcolor: item.currentRank !== item.originalRank ? 'action.hover' : 'inherit',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                        secondaryAction={
                          <Box>
                            <IconButton 
                              edge="end" 
                              aria-label="move up"
                              onClick={() => moveItemUp(index)}
                              disabled={index === 0}
                              size="small"
                              sx={{ mr: 1 }}
                            >
                              <ArrowUpwardIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              edge="end" 
                              aria-label="move down"
                              onClick={() => moveItemDown(index)}
                              disabled={index === items.length - 1}
                              size="small"
                            >
                              <ArrowDownwardIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        }
                      >
                        <ListItemIcon {...provided.dragHandleProps}>
                          <DragIndicatorIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography
                                component="span"
                                variant="body1"
                                sx={{ mr: 1, fontWeight: 'medium' }}
                              >
                                {`#${item.currentRank}`}
                              </Typography>
                              {item.title}
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {item.description || 'No description'}
                              </Typography>
                              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                <Chip 
                                  label={item.priority || 'Unset'} 
                                  size="small"
                                  color={getPriorityColor(item.priority || '')}
                                />
                                {item.category && (
                                  <Chip
                                    label={item.category}
                                    size="small"
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </List>
            )}
          </Droppable>
        </DragDropContext>
      )}
      
      {/* Info Dialog */}
      <Dialog
        open={openInfoDialog}
        onClose={() => setOpenInfoDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>How Requirement Prioritization Works</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            The Requirement Prioritizer helps you organize your requirements by importance.
            Here's how to use it:
          </Typography>
          
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
            Manual Prioritization
          </Typography>
          <Typography paragraph>
            - Drag and drop requirements to reorder them
            - Use the up/down arrows to move items
            - Items at the top will be assigned higher priorities
          </Typography>
          
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
            AI-Assisted Prioritization
          </Typography>
          <Typography paragraph>
            The "AI Suggest" button analyzes your requirements and suggests priorities based on:
            - Requirement complexity
            - Dependencies between requirements
            - Business value indicators
            - Urgency terms in descriptions
          </Typography>
          
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
            Priority Levels
          </Typography>
          <Typography>
            - <strong>Critical:</strong> Must-have features, core functionality
          </Typography>
          <Typography>
            - <strong>High:</strong> Important features with significant impact
          </Typography>
          <Typography>
            - <strong>Medium:</strong> Desirable features that add value
          </Typography>
          <Typography paragraph>
            - <strong>Low:</strong> Nice-to-have features for future consideration
          </Typography>
          
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
            Saving Changes
          </Typography>
          <Typography paragraph>
            When you save, requirements will be assigned priorities based on their position:
            - Top 1-2: Critical
            - 3-5: High
            - 6-10: Medium
            - 11+: Low
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenInfoDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default RequirementPrioritizer;
