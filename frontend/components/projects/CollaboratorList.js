import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Paper, 
  Typography, 
  TextField, 
  IconButton, 
  Avatar, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Autocomplete,
  Tooltip
} from '@mui/material';
import { 
  Add as AddIcon,
  Delete as DeleteIcon,
  PersonAdd as InviteIcon,
  Mail as EmailIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { useProject } from '../../contexts/ProjectContext';
import { projectService } from '../../services/projectService';
import { useAuth } from '../../contexts/AuthContext';
import LoadingIndicator from '../common/LoadingIndicator';
import EmptyState from '../common/EmptyState';

const CollaboratorList = ({ projectId }) => {
  const { currentProject, loadProject } = useProject();
  const { user } = useAuth();
  
  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState(null);
  const [emailInput, setEmailInput] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteError, setInviteError] = useState(null);
  
  // Invite dialog handlers
  const handleOpenInviteDialog = () => {
    setInviteDialogOpen(true);
    setInviteSuccess(false);
    setInviteError(null);
    setEmailInput('');
    setSelectedUser(null);
  };
  
  const handleCloseInviteDialog = () => {
    setInviteDialogOpen(false);
  };
  
  // Remove dialog handlers
  const handleOpenRemoveDialog = (collaborator) => {
    setUserToRemove(collaborator);
    setRemoveDialogOpen(true);
  };
  
  const handleCloseRemoveDialog = () => {
    setRemoveDialogOpen(false);
    setUserToRemove(null);
  };
  
  // Search for users
  const handleEmailChange = async (e) => {
    const email = e.target.value;
    setEmailInput(email);
    
    // Only search if we have at least 3 characters
    if (email.length < 3) {
      setUserSearchResults([]);
      return;
    }
    
    setSearchLoading(true);
    try {
      const results = await projectService.searchUsers(email);
      
      // Filter out current collaborators and the project owner
      const currentCollaboratorIds = currentProject.collaborators.map(c => c.id);
      const filteredResults = results.filter(user => 
        !currentCollaboratorIds.includes(user.id) && 
        user.id !== currentProject.owner.id
      );
      
      setUserSearchResults(filteredResults);
    } catch (err) {
      console.error('Error searching users:', err);
      // Don't show error for search
    } finally {
      setSearchLoading(false);
    }
  };
  
  // Handle user selection from search results
  const handleUserSelect = (event, user) => {
    setSelectedUser(user);
    if (user) {
      setEmailInput(user.email);
    }
  };
  
  // Invite user by email
  const handleInviteUser = async () => {
    if (!emailInput && !selectedUser) {
      setInviteError('Please enter an email address or select a user');
      return;
    }
    
    const email = emailInput;
    const userId = selectedUser?.id;
    
    setInviteLoading(true);
    setInviteError(null);
    
    try {
      if (userId) {
        // Add existing user as collaborator
        await projectService.addContributor(projectId, userId);
      } else {
        // Invite by email
        await projectService.inviteCollaborator(projectId, email);
      }
      
      // Show success message
      setInviteSuccess(true);
      
      // Reload project to get updated collaborator list
      await loadProject(projectId);
      
      // Reset form in 1.5 seconds
      setTimeout(() => {
        setEmailInput('');
        setSelectedUser(null);
      }, 1500);
    } catch (err) {
      console.error('Error inviting collaborator:', err);
      setInviteError(err.message || 'Failed to invite collaborator. Please try again.');
    } finally {
      setInviteLoading(false);
    }
  };
  
  // Remove collaborator
  const handleRemoveCollaborator = async () => {
    if (!userToRemove) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await projectService.removeContributor(projectId, userToRemove.id);
      
      // Reload project to get updated collaborator list
      await loadProject(projectId);
      
      // Close dialog
      handleCloseRemoveDialog();
    } catch (err) {
      console.error('Error removing collaborator:', err);
      setError('Failed to remove collaborator. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Helper to determine if current user is the project owner
  const isProjectOwner = () => {
    if (!currentProject || !user) return false;
    return currentProject.owner.id === user.id;
  };
  
  // Render collaborator item
  const renderCollaboratorItem = (collaborator, index) => {
    const isOwner = currentProject.owner.id === collaborator.id;
    const isCurrentUser = user?.id === collaborator.id;
    const canRemove = isProjectOwner() && !isOwner && !isCurrentUser;
    
    return (
      <React.Fragment key={collaborator.id}>
        {index > 0 && <Divider variant="inset" component="li" />}
        <ListItem alignItems="flex-start">
          <ListItemAvatar>
            <Avatar alt={collaborator.name} src={collaborator.avatar_url}>
              {collaborator.name?.charAt(0) || collaborator.email?.charAt(0)}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography component="span" variant="subtitle1">
                  {collaborator.name || collaborator.email}
                </Typography>
                {isOwner && (
                  <Chip 
                    size="small" 
                    label="Owner" 
                    color="primary" 
                    icon={<AdminIcon />}
                    sx={{ ml: 1 }}
                  />
                )}
                {isCurrentUser && (
                  <Chip 
                    size="small" 
                    label="You" 
                    variant="outlined"
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
            }
            secondary={
              <React.Fragment>
                <Typography component="span" variant="body2" color="textSecondary">
                  {collaborator.email}
                </Typography>
                {collaborator.role && (
                  <Typography component="div" variant="body2" color="textSecondary">
                    {collaborator.role}
                  </Typography>
                )}
                {collaborator.pending && (
                  <Chip 
                    size="small" 
                    label="Invitation Pending" 
                    color="warning"
                    variant="outlined"
                    sx={{ mt: 1 }}
                  />
                )}
              </React.Fragment>
            }
          />
          {canRemove && (
            <ListItemSecondaryAction>
              <Tooltip title="Remove collaborator">
                <IconButton 
                  edge="end" 
                  onClick={() => handleOpenRemoveDialog(collaborator)}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </ListItemSecondaryAction>
          )}
        </ListItem>
      </React.Fragment>
    );
  };
  
  // If project data is not loaded yet
  if (!currentProject) {
    return <LoadingIndicator message="Loading collaborators..." />;
  }
  
  // Get all collaborators (including owner)
  const allCollaborators = [
    currentProject.owner,
    ...currentProject.collaborators
  ];
  
  return (
    <Box>
      {/* Header section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Project Collaborators
          <Chip 
            label={allCollaborators.length} 
            color="primary" 
            size="small" 
            sx={{ ml: 1 }}
          />
        </Typography>
        
        {isProjectOwner() && (
          <Button 
            variant="contained" 
            startIcon={<InviteIcon />} 
            onClick={handleOpenInviteDialog}
          >
            Invite Collaborator
          </Button>
        )}
      </Box>
      
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Collaborators list */}
      <Paper variant="outlined" sx={{ mb: 4 }}>
        {allCollaborators.length === 0 ? (
          <EmptyState 
            title="No collaborators found"
            description="This project doesn't have any collaborators yet. Add team members to collaborate on this project."
            actionLabel="Invite Collaborator"
            onAction={handleOpenInviteDialog}
            icon="empty"
          />
        ) : (
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {allCollaborators.map(renderCollaboratorItem)}
          </List>
        )}
      </Paper>
      
      {/* About collaboration section */}
      <Typography variant="h6" gutterBottom>
        About Collaboration
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" paragraph>
          Collaborators can view and edit this project, including its requirements, documents, and prototypes.
        </Typography>
        <Typography variant="body1" paragraph>
          Only the project owner can add or remove collaborators and delete the project.
        </Typography>
        <Typography variant="body1">
          When you invite someone by email, they will receive an invitation to join the project.
        </Typography>
      </Paper>
      
      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onClose={handleCloseInviteDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Invite Collaborator</DialogTitle>
        <DialogContent>
          {inviteSuccess ? (
            <Alert 
              icon={<CheckIcon fontSize="inherit" />} 
              severity="success" 
              sx={{ mb: 2 }}
            >
              Invitation sent successfully!
            </Alert>
          ) : inviteError ? (
            <Alert 
              icon={<ErrorIcon fontSize="inherit" />} 
              severity="error" 
              sx={{ mb: 2 }}
            >
              {inviteError}
            </Alert>
          ) : null}
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            Invite a team member to collaborate on this project.
          </Typography>
          
          <Autocomplete
            id="user-search"
            options={userSearchResults}
            loading={searchLoading}
            getOptionLabel={(option) => option.email}
            filterOptions={(x) => x} // Disable client-side filtering
            value={selectedUser}
            onChange={handleUserSelect}
            noOptionsText="No users found"
            loadingText="Searching..."
            renderInput={(params) => (
              <TextField
                {...params}
                label="Email Address"
                variant="outlined"
                fullWidth
                required
                value={emailInput}
                onChange={handleEmailChange}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <EmailIcon color="action" sx={{ mr: 1 }} />
                      {params.InputProps.startAdornment}
                    </>
                  ),
                  endAdornment: (
                    <>
                      {searchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    alt={option.name} 
                    src={option.avatar_url} 
                    sx={{ width: 24, height: 24, mr: 1 }}
                  >
                    {option.name?.charAt(0) || option.email?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body1">{option.name}</Typography>
                    <Typography variant="body2" color="textSecondary">{option.email}</Typography>
                  </Box>
                </Box>
              </li>
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInviteDialog} disabled={inviteLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleInviteUser} 
            variant="contained" 
            color="primary"
            disabled={inviteLoading || inviteSuccess}
            startIcon={inviteLoading ? <CircularProgress size={20} /> : null}
          >
            {inviteLoading ? 'Sending...' : 'Send Invitation'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Remove Collaborator Dialog */}
      <Dialog open={removeDialogOpen} onClose={handleCloseRemoveDialog}>
        <DialogTitle>Remove Collaborator</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove {userToRemove?.name || userToRemove?.email} from this project?
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            They will no longer have access to this project.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRemoveDialog} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleRemoveCollaborator} 
            color="error" 
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Removing...' : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CollaboratorList;
