import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  IconButton,
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
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
 * KanbanView component for displaying roadmap in a kanban board format
 */
const KanbanView = ({
  phases,
  currentPhase,
  milestones,
  handlePhaseMenuOpen,
  handleMilestoneMenuOpen,
  openCreateMilestoneDialog,
  selectPhase,
  onDragEnd
}) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="phases" type="phase">
        {(provided) => (
          <Box
            {...provided.droppableProps}
            ref={provided.innerRef}
            sx={{ width: '100%' }}
          >
            {phases.map((phase, index) => (
              <Draggable key={phase.id} draggableId={phase.id} index={index}>
                {(provided) => (
                  <Paper
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    elevation={2}
                    sx={{
                      mb: 3,
                      borderLeft: `6px solid ${phase.color || '#3498db'}`,
                    }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Box
                        {...provided.dragHandleProps}
                        sx={{ mr: 1, display: 'flex', alignItems: 'center' }}
                      >
                        <DragIndicatorIcon color="action" />
                      </Box>
                      
                      <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        {phase.name}
                      </Typography>
                      
                      <IconButton
                        size="small"
                        onClick={() => openCreateMilestoneDialog(phase.id)}
                      >
                        <AddIcon />
                      </IconButton>
                      
                      <IconButton
                        size="small"
                        onClick={(event) => handlePhaseMenuOpen(event, phase.id)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                    
                    <Divider />
                    
                    {currentPhase && currentPhase.id === phase.id ? (
                      <Box sx={{ p: 2 }}>
                        {milestones.length > 0 ? (
                          <Droppable droppableId={`milestones-${phase.id}`} type="milestone">
                            {(provided) => (
                              <Box
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                              >
                                {milestones.map((milestone, index) => (
                                  <Draggable
                                    key={milestone.id}
                                    draggableId={milestone.id}
                                    index={index}
                                  >
                                    {(provided) => (
                                      <Paper
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        elevation={1}
                                        sx={{
                                          mb: 2,
                                          p: 2,
                                          borderLeft: `4px solid ${getStatusColor(milestone.status)}`,
                                        }}
                                      >
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                          <Box
                                            {...provided.dragHandleProps}
                                            sx={{ mr: 1, display: 'flex', alignItems: 'center' }}
                                          >
                                            <DragIndicatorIcon fontSize="small" color="action" />
                                          </Box>
                                          
                                          <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="subtitle1">
                                              {milestone.title}
                                            </Typography>
                                            
                                            {milestone.description && (
                                              <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ mt: 0.5 }}
                                              >
                                                {milestone.description.length > 100
                                                  ? `${milestone.description.substring(0, 97)}...`
                                                  : milestone.description}
                                              </Typography>
                                            )}
                                            
                                            <Box
                                              sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                mt: 1,
                                                gap: 2,
                                              }}
                                            >
                                              <Typography variant="caption" color="text.secondary">
                                                {milestone.start_date &&
                                                  format(new Date(milestone.start_date), 'MMM d, yyyy')}
                                                {milestone.start_date &&
                                                  milestone.end_date &&
                                                  ' - '}
                                                {milestone.end_date &&
                                                  format(new Date(milestone.end_date), 'MMM d, yyyy')}
                                              </Typography>
                                              
                                              <Typography
                                                variant="caption"
                                                sx={{
                                                  color: getStatusColor(milestone.status),
                                                }}
                                              >
                                                {milestone.status}
                                              </Typography>
                                              
                                              {milestone.progress > 0 && (
                                                <Typography variant="caption">
                                                  {`${milestone.progress}% complete`}
                                                </Typography>
                                              )}
                                            </Box>
                                          </Box>
                                          
                                          <IconButton
                                            size="small"
                                            onClick={(event) =>
                                              handleMilestoneMenuOpen(event, milestone.id)
                                            }
                                          >
                                            <MoreVertIcon fontSize="small" />
                                          </IconButton>
                                        </Box>
                                      </Paper>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </Box>
                            )}
                          </Droppable>
                        ) : (
                          <Typography variant="body2" color="text.secondary" align="center">
                            No milestones in this phase. Use the + button to add one.
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Box
                        sx={{ p: 2, cursor: 'pointer' }}
                        onClick={() => selectPhase(phase.id)}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Click to view milestones
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default KanbanView;
