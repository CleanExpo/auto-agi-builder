import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import socketService from '../services/socket';
import { useAuth } from './AuthContext';
import { useUI } from './UIContext';
import { useProject } from './ProjectContext';

const CollaborationContext = createContext(null);

export const CollaborationProvider = ({ children }) => {
  const { user, isAuthenticated, token } = useAuth();
  const { showNotification } = useUI();
  const { currentProject } = useProject();
  
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [collaborationEnabled, setCollaborationEnabled] = useState(false);
  const [cursors, setCursors] = useState({});
  const [editingStatus, setEditingStatus] = useState({});
  const [lastActivity, setLastActivity] = useState({});
  const [viewMode, setViewMode] = useState('everyone'); // 'everyone', 'collaborators', 'just-me'
  
  // Initialize socket connection
  useEffect(() => {
    if (!isAuthenticated || !token) return;
    
    const initSocket = async () => {
      try {
        await socketService.connect({ token });
        setIsConnected(true);
        
        // Listen for connection status
        const handleConnect = () => {
          setIsConnected(true);
          console.log('Collaboration service connected');
        };
        
        const handleDisconnect = () => {
          setIsConnected(false);
          console.log('Collaboration service disconnected');
        };
        
        socketService.on('connect', handleConnect);
        socketService.on('disconnect', handleDisconnect);
        
        return () => {
          socketService.off('connect', handleConnect);
          socketService.off('disconnect', handleDisconnect);
        };
      } catch (error) {
        console.error('Failed to initialize collaboration service:', error);
        showNotification({
          title: 'Collaboration Error',
          message: 'Failed to connect to the collaboration service',
          type: 'error'
        });
      }
    };
    
    initSocket();
    
    // Cleanup socket on unmount
    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated, token, showNotification]);
  
  // Join project room when project changes
  useEffect(() => {
    if (!isConnected || !currentProject?.id) return;
    
    const projectRoom = `project:${currentProject.id}`;
    
    // Leave previous room if different
    if (currentRoom && currentRoom !== projectRoom) {
      socketService.leaveRoom(currentRoom);
    }
    
    // Join new room
    socketService.joinRoom(projectRoom);
    setCurrentRoom(projectRoom);
    
    // Listen for active users updates
    const handleActiveUsers = (data) => {
      if (data.room === projectRoom) {
        setActiveUsers(data.users);
      }
    };
    
    // Listen for cursor position updates
    const handleCursorUpdate = (data) => {
      if (data.room === projectRoom) {
        setCursors(prev => ({
          ...prev,
          [data.userId]: {
            x: data.x,
            y: data.y,
            page: data.page,
            username: data.username,
            timestamp: Date.now()
          }
        }));
      }
    };
    
    // Listen for editing status updates
    const handleEditingStatus = (data) => {
      if (data.room === projectRoom) {
        setEditingStatus(prev => ({
          ...prev,
          [data.userId]: {
            isEditing: data.isEditing,
            entityId: data.entityId,
            entityType: data.entityType,
            timestamp: Date.now()
          }
        }));
      }
    };
    
    // Listen for activity updates
    const handleActivityUpdate = (data) => {
      if (data.room === projectRoom) {
        setLastActivity(prev => ({
          ...prev,
          [data.userId]: {
            action: data.action,
            entityId: data.entityId,
            entityType: data.entityType,
            timestamp: Date.now()
          }
        }));
      }
    };
    
    socketService.on('active_users', handleActiveUsers);
    socketService.on('cursor_update', handleCursorUpdate);
    socketService.on('editing_status', handleEditingStatus);
    socketService.on('activity_update', handleActivityUpdate);
    
    // Send join event to update active users list
    socketService.emit('user_joined', { 
      projectId: currentProject.id, 
      user: { 
        id: user.id, 
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    }, { room: projectRoom });
    
    // Cleanup listeners when room changes
    return () => {
      socketService.off('active_users', handleActiveUsers);
      socketService.off('cursor_update', handleCursorUpdate);
      socketService.off('editing_status', handleEditingStatus);
      socketService.off('activity_update', handleActivityUpdate);
      
      // Send leave event before leaving room
      socketService.emit('user_left', { 
        projectId: currentProject.id, 
        userId: user.id 
      }, { room: projectRoom });
    };
  }, [currentProject, isConnected, user]);
  
  // Clean up stale cursors and status data
  useEffect(() => {
    if (!isConnected) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      const CURSOR_TIMEOUT = 30000; // 30 seconds
      const STATUS_TIMEOUT = 60000; // 1 minute
      
      // Clean cursors
      setCursors(prev => {
        const updated = { ...prev };
        let hasChanges = false;
        
        Object.keys(updated).forEach(userId => {
          if (now - updated[userId].timestamp > CURSOR_TIMEOUT) {
            delete updated[userId];
            hasChanges = true;
          }
        });
        
        return hasChanges ? updated : prev;
      });
      
      // Clean editing status
      setEditingStatus(prev => {
        const updated = { ...prev };
        let hasChanges = false;
        
        Object.keys(updated).forEach(userId => {
          if (now - updated[userId].timestamp > STATUS_TIMEOUT) {
            delete updated[userId];
            hasChanges = true;
          }
        });
        
        return hasChanges ? updated : prev;
      });
    }, 10000); // Run every 10 seconds
    
    return () => clearInterval(interval);
  }, [isConnected]);
  
  // Update cursor position
  const updateCursorPosition = useCallback((x, y, page = null) => {
    if (!isConnected || !currentRoom || !collaborationEnabled) return;
    
    socketService.emit('cursor_update', {
      x,
      y,
      page,
      userId: user.id,
      username: user.name
    }, { room: currentRoom });
  }, [isConnected, currentRoom, user, collaborationEnabled]);
  
  // Update editing status
  const updateEditingStatus = useCallback((isEditing, entityId = null, entityType = null) => {
    if (!isConnected || !currentRoom || !collaborationEnabled) return;
    
    socketService.emit('editing_status', {
      isEditing,
      entityId,
      entityType,
      userId: user.id
    }, { room: currentRoom });
  }, [isConnected, currentRoom, user, collaborationEnabled]);
  
  // Log activity
  const logActivity = useCallback((action, entityId = null, entityType = null) => {
    if (!isConnected || !currentRoom || !collaborationEnabled) return;
    
    socketService.emit('activity_update', {
      action,
      entityId,
      entityType,
      userId: user.id
    }, { room: currentRoom });
  }, [isConnected, currentRoom, user, collaborationEnabled]);
  
  // Join a specific room (for document or entity collaboration)
  const joinEntityRoom = useCallback((entityType, entityId) => {
    if (!isConnected || !collaborationEnabled) return;
    
    const room = `${entityType}:${entityId}`;
    socketService.joinRoom(room);
    
    return () => {
      socketService.leaveRoom(room);
    };
  }, [isConnected, collaborationEnabled]);
  
  // Send data to specific room
  const sendDataToRoom = useCallback((event, data, room) => {
    if (!isConnected) return;
    
    socketService.emit(event, data, { room });
  }, [isConnected]);
  
  // Listen for events in specific room
  const listenToRoom = useCallback((event, room, callback) => {
    if (!isConnected) return () => {};
    
    const wrappedCallback = (data) => {
      if (data.room === room) {
        callback(data);
      }
    };
    
    return socketService.on(event, wrappedCallback);
  }, [isConnected]);
  
  // Toggle collaboration features
  const toggleCollaboration = useCallback(() => {
    setCollaborationEnabled(prev => {
      const newValue = !prev;
      
      // If turning off, clear all cursors and statuses
      if (!newValue) {
        setCursors({});
        setEditingStatus({});
      }
      
      return newValue;
    });
  }, []);
  
  // Get users who are editing a specific entity
  const getUsersEditingEntity = useCallback((entityId, entityType) => {
    return Object.entries(editingStatus)
      .filter(([, status]) => 
        status.isEditing && 
        status.entityId === entityId && 
        status.entityType === entityType
      )
      .map(([userId]) => activeUsers.find(user => user.id === userId))
      .filter(Boolean);
  }, [editingStatus, activeUsers]);
  
  // Change view mode
  const changeViewMode = useCallback((mode) => {
    if (['everyone', 'collaborators', 'just-me'].includes(mode)) {
      setViewMode(mode);
    }
  }, []);
  
  // Context value
  const value = {
    isConnected,
    collaborationEnabled,
    activeUsers,
    cursors,
    editingStatus,
    lastActivity,
    viewMode,
    updateCursorPosition,
    updateEditingStatus,
    logActivity,
    joinEntityRoom,
    sendDataToRoom,
    listenToRoom,
    toggleCollaboration,
    getUsersEditingEntity,
    changeViewMode
  };
  
  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
};

export const useCollaboration = () => {
  const context = useContext(CollaborationContext);
  
  if (!context) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  
  return context;
};

export default CollaborationContext;
