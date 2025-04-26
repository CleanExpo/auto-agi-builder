import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  MenuItem,
  Slider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import SaveIcon from '@mui/icons-material/Save';

// Custom color options for phases
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

// Status options for milestones
const STATUS_OPTIONS = [
  { value: 'Not Started', color: '#95a5a6' }, // Gray
  { value: 'In Progress', color: '#3498db' }, // Blue
  { value: 'Completed', color: '#2ecc71' },   // Green
  { value: 'Delayed', color: '#e74c3c' },     // Red
  { value: 'On Hold', color: '#f39c12' },     // Orange
];

/**
 * Phase Dialog component for creating/editing a phase
 */
export const PhaseDialog = ({
  isOpen,
  onClose,
  phaseForm,
  handlePhaseFormChange,
  handlePhaseSubmit,
  dialogAction,
}) => {
  const handleColorChange = (color) => {
    // Create a synthetic event to match the handlePhaseFormChange API
    handlePhaseFormChange('color')({ target: { value: color } });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {dialogAction === 'create' ? 'Create New Phase' : 'Edit Phase'}
      </DialogTitle>
      
      <DialogContent>
        <TextField
          margin="normal"
          label="Phase Name"
          fullWidth
          required
          value={phaseForm.name}
          onChange={handlePhaseFormChange('name')}
        />
        
        <TextField
          margin="normal"
          label="Description"
          fullWidth
          multiline
          rows={3}
          value={phaseForm.description}
          onChange={handlePhaseFormChange('description')}
        />
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Phase Color
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {PHASE_COLORS.map((color) => (
              <Box
                key={color}
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: color,
                  borderRadius: 1,
                  cursor: 'pointer',
                  border: phaseForm.color === color ? '3px solid #000' : 'none',
                }}
                onClick={() => handleColorChange(color)}
              />
            ))}
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handlePhaseSubmit}
        >
          {dialogAction === 'create' ? 'Create' : 'Update'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/**
 * Milestone Dialog component for creating/editing a milestone
 */
export const MilestoneDialog = ({
  isOpen,
  onClose,
  milestoneForm,
  handleMilestoneFormChange,
  handleMilestoneDateChange,
  handleMilestoneSubmit,
  dialogAction,
}) => {
  const handleProgressChange = (event, newValue) => {
    // Create a synthetic event to match the handleMilestoneFormChange API
    handleMilestoneFormChange('progress')({ target: { value: newValue } });
  };
  
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {dialogAction === 'create' ? 'Create New Milestone' : 'Edit Milestone'}
      </DialogTitle>
      
      <DialogContent>
        <TextField
          margin="normal"
          label="Title"
          fullWidth
          required
          value={milestoneForm.title}
          onChange={handleMilestoneFormChange('title')}
        />
        
        <TextField
          margin="normal"
          label="Description"
          fullWidth
          multiline
          rows={3}
          value={milestoneForm.description}
          onChange={handleMilestoneFormChange('description')}
        />
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6}>
            <DatePicker
              label="Start Date"
              value={milestoneForm.start_date}
              onChange={handleMilestoneDateChange('start_date')}
              renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
            />
          </Grid>
          
          <Grid item xs={6}>
            <DatePicker
              label="End Date"
              value={milestoneForm.end_date}
              onChange={handleMilestoneDateChange('end_date')}
              renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
            />
          </Grid>
        </Grid>
        
        <TextField
          select
          margin="normal"
          label="Status"
          fullWidth
          value={milestoneForm.status}
          onChange={handleMilestoneFormChange('status')}
        >
          {STATUS_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    bgcolor: option.color,
                    mr: 1,
                  }}
                />
                {option.value}
              </Box>
            </MenuItem>
          ))}
        </TextField>
        
        <Box sx={{ mt: 3, mb: 2 }}>
          <Typography gutterBottom>Progress: {milestoneForm.progress}%</Typography>
          <Slider
            value={milestoneForm.progress}
            onChange={handleProgressChange}
            valueLabelDisplay="auto"
            step={5}
            marks
            min={0}
            max={100}
          />
        </Box>
        
        <TextField
          select
          margin="normal"
          label="Type"
          fullWidth
          value={milestoneForm.is_milestone.toString()}
          onChange={(e) => {
            handleMilestoneFormChange('is_milestone')({
              target: { value: e.target.value === 'true' },
            });
          }}
        >
          <MenuItem value="true">Milestone</MenuItem>
          <MenuItem value="false">Task</MenuItem>
        </TextField>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleMilestoneSubmit}
        >
          {dialogAction === 'create' ? 'Create' : 'Update'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
