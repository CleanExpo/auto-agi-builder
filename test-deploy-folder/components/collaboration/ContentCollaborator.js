import React, { useEffect, useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useCollaboration } from '../../contexts/CollaborationContext';
import { useAuth } from '../../contexts/AuthContext';
import { debounce } from 'lodash';

// Custom cursor component that shows another user's cursor
const CollaboratorCursor = ({ position, username, color }) => {
  if (!position || !position.x || !position.y) return null;
  
  return (
    <div 
      className="absolute pointer-events-none z-50"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)' 
      }}
    >
      <div className="relative">
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 16 16" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          style={{ transform: 'rotate(15deg)' }}
        >
          <path 
            d="M1 1L7 15L9 9L15 7L1 1Z" 
            fill={color || '#3B82F6'}
            stroke="white"
            strokeWidth="1.5"
          />
        </svg>
        
        <div 
          className="absolute left-full ml-1 top-0 px-2 py-1 rounded-md text-xs text-white whitespace-nowrap"
          style={{ backgroundColor: color || '#3B82F6' }}
        >
          {username}
        </div>
      </div>
    </div>
  );
};

const ContentCollaborator = ({ 
  entityId, 
  entityType, 
  containerRef, 
  onUserEditing = () => {}, 
  disableEditConflicts = false,
  showCursors = true,
  showUserBadges = true
}) => {
  const { user } = useAuth();
  const { 
    collaborationEnabled,
    isConnected,
    cursors, 
    activeUsers,
    editingStatus,
    updateCursorPosition,
    updateEditingStatus,
    listenToRoom,
    joinEntityRoom,
    getUsersEditingEntity,
    viewMode
  } = useCollaboration();
  
  const [localCursorPosition, setLocalCursorPosition] = useState({ x: 0, y: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [editingConflict, setEditingConflict] = useState(false);
  const [showUserIndicators, setShowUserIndicators] = useState(true);
  
  const container = containerRef?.current;
  const mouseMoveListenerRef = useRef(null);
  const mouseClickListenerRef = useRef(null);
  const focusListenerRef = useRef(null);
  const blurListenerRef = useRef(null);
  
  // Define entity room name
  const roomName = `${entityType}:${entityId}`;
  
  // Cleanup function for room subscription
  const leaveRoomRef = useRef(null);
  
  // Creates colors for users
  const getUserColor = useCallback((userId) => {
    // Generate a deterministic color based on userId
    const colors = [
      '#3B82F6', // blue
      '#10B981', // green
      '#F59E0B', // amber
      '#EF4444', // red
      '#8B5CF6', // purple
      '#EC4899', // pink
      '#06B6D4', // cyan
      '#F97316', // orange
    ];
    
    // Simple hash function
    const hash = userId.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    return colors[hash % colors.length];
  }, []);
  
  // Join entity room on mount
  useEffect(() => {
    if (!isConnected || !collaborationEnabled || !entityId || !entityType) return;
    
    // Join the room for this specific entity
    const cleanup = joinEntityRoom(entityType, entityId);
    leaveRoomRef.current = cleanup;
    
    return () => {
      if (leaveRoomRef.current) {
        leaveRoomRef.current();
        leaveRoomRef.current = null;
      }
    };
  }, [isConnected, collaborationEnabled, entityId, entityType, joinEntityRoom]);
  
  // Setup listeners for cursor movement and editing
  useEffect(() => {
    if (!isConnected || !collaborationEnabled || !container || !showCursors) return;
    
    // Check if user can edit based on other users' editing status
    const checkEditConflicts = () => {
      if (disableEditConflicts) return false;
      
      const editingUsers = getUsersEditingEntity(entityId, entityType);
      const conflict = editingUsers.length > 0 && !editingUsers.some(u => u.id === user.id);
      setEditingConflict(conflict);
      return conflict;
    };
    
    // Debounced cursor position update to avoid excessive network traffic
    const debouncedCursorUpdate = debounce((x, y) => {
      updateCursorPosition(x, y, entityId);
      setLocalCursorPosition({ x, y });
    }, 50);
    
    // Handle mouse movement to update cursor position
    const handleMouseMove = (e) => {
      const { left, top } = container.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;
      
      debouncedCursorUpdate(x, y);
    };
    
    // Handle click to check for edit conflicts
    const handleClick = (e) => {
      const hasConflict = checkEditConflicts();
      if (hasConflict && onUserEditing) {
        onUserEditing(false, 'Another user is currently editing this content');
      }
    };
    
    // Handle focus in content area
    const handleFocus = (e) => {
      const hasConflict = checkEditConflicts();
      setIsEditing(true);
      updateEditingStatus(true, entityId, entityType);
      
      if (hasConflict && onUserEditing) {
        onUserEditing(false, 'Another user is currently editing this content');
      } else if (onUserEditing) {
        onUserEditing(true);
      }
    };
    
    // Handle blur (focus out) in content area
    const handleBlur = (e) => {
      setIsEditing(false);
      updateEditingStatus(false, entityId, entityType);
      
      if (onUserEditing) {
        onUserEditing(false);
      }
    };
    
    // Add listeners
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mousedown', handleClick);
    container.addEventListener('focus', handleFocus, true);
    container.addEventListener('blur', handleBlur, true);
    
    // Save refs for cleanup
    mouseMoveListenerRef.current = handleMouseMove;
    mouseClickListenerRef.current = handleClick;
    focusListenerRef.current = handleFocus;
    blurListenerRef.current = handleBlur;
    
    // Initial conflict check
    checkEditConflicts();
    
    return () => {
      // Cleanup listeners
      if (mouseMoveListenerRef.current) {
        container.removeEventListener('mousemove', mouseMoveListenerRef.current);
      }
      
      if (mouseClickListenerRef.current) {
        container.removeEventListener('mousedown', mouseClickListenerRef.current);
      }
      
      if (focusListenerRef.current) {
        container.removeEventListener('focus', focusListenerRef.current, true);
      }
      
      if (blurListenerRef.current) {
        container.removeEventListener('blur', blurListenerRef.current, true);
      }
      
      // Clear editing status when unmounting
      updateEditingStatus(false, entityId, entityType);
    };
  }, [
    isConnected, 
    collaborationEnabled, 
    container, 
    updateCursorPosition, 
    updateEditingStatus,
    entityId, 
    entityType,
    showCursors,
    disableEditConflicts,
    getUsersEditingEntity,
    user,
    onUserEditing
  ]);
  
  // Control visibility of user indicators based on viewMode
  useEffect(() => {
    if (viewMode === 'just-me') {
      setShowUserIndicators(false);
    } else if (viewMode === 'collaborators') {
      setShowUserIndicators(activeUsers.length > 1);
    } else {
      setShowUserIndicators(true);
    }
  }, [viewMode, activeUsers]);
  
  // Filter cursors for this specific entity or in general 
  const filteredCursors = Object.entries(cursors)
    .filter(([userId]) => userId !== user.id) // Don't show own cursor
    .filter(([, cursor]) => {
      // Either show all cursors or only those for this entity
      return !cursor.page || cursor.page === entityId;
    })
    .map(([userId, cursor]) => {
      const collaborator = activeUsers.find(u => u.id === userId);
      const username = collaborator?.name || 'Unknown user';
      const color = getUserColor(userId);
      
      return {
        userId,
        position: { x: cursor.x, y: cursor.y },
        username,
        color
      };
    });
  
  if (!isConnected || !collaborationEnabled || !showUserIndicators) {
    return null;
  }
  
  return (
    <>
      {/* Render the collaborator cursors */}
      {filteredCursors.map(cursor => (
        <CollaboratorCursor
          key={cursor.userId}
          position={cursor.position}
          username={cursor.username}
          color={cursor.color}
        />
      ))}
      
      {/* Editing conflict warning */}
      {editingConflict && showUserBadges && (
        <div className="absolute top-2 right-2 bg-yellow-50 text-yellow-800 px-3 py-2 rounded-md shadow-sm border border-yellow-200 text-sm flex items-center space-x-2 z-40">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 text-yellow-400" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
              clipRule="evenodd" 
            />
          </svg>
          <span>
            Another user is editing this content
          </span>
        </div>
      )}
      
      {/* Current editors list */}
      {showUserBadges && getUsersEditingEntity(entityId, entityType).length > 0 && (
        <div className="absolute top-2 left-2 z-40 flex space-x-1">
          {getUsersEditingEntity(entityId, entityType)
            .filter(u => u.id !== user.id)
            .map(editor => (
              <div 
                key={editor.id} 
                className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium border border-blue-100"
                style={{ backgroundColor: `${getUserColor(editor.id)}15`, borderColor: `${getUserColor(editor.id)}30`, color: getUserColor(editor.id) }}
              >
                <div className="w-4 h-4 mr-1 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden"
                  style={{ backgroundColor: `${getUserColor(editor.id)}30` }}
                >
                  {editor.avatar ? (
                    <img src={editor.avatar} alt={editor.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-medium" style={{ color: getUserColor(editor.id) }}>
                      {editor.name.charAt(0)}
                    </span>
                  )}
                </div>
                <span>{editor.name}</span>
              </div>
            ))}
        </div>
      )}
    </>
  );
};

ContentCollaborator.propTypes = {
  entityId: PropTypes.string.isRequired,
  entityType: PropTypes.string.isRequired,
  containerRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  onUserEditing: PropTypes.func,
  disableEditConflicts: PropTypes.bool,
  showCursors: PropTypes.bool,
  showUserBadges: PropTypes.bool
};

export default ContentCollaborator;
