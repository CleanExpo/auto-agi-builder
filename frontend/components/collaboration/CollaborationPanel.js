import React, { useState } from 'react';
import { useCollaboration } from '../../contexts/CollaborationContext';
import { Switch } from '@headlessui/react';
import { 
  UserGroupIcon, 
  EyeIcon, 
  EyeOffIcon, 
  UserIcon,
  UsersIcon,
  ClockIcon,
  CogIcon
} from '@heroicons/react/outline';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const UserAvatar = ({ user, isActive = false, status = null }) => {
  if (!user) return null;
  
  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : '?';
  
  return (
    <div className="relative">
      {user.avatar ? (
        <img 
          src={user.avatar} 
          alt={user.name} 
          className={`w-8 h-8 rounded-full border-2 ${isActive ? 'border-green-500' : 'border-gray-200'}`}
        />
      ) : (
        <div className={`w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium border-2 ${isActive ? 'border-green-500' : 'border-gray-200'}`}>
          {initials}
        </div>
      )}
      
      {isActive && (
        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-green-400 ring-1 ring-white"></span>
      )}
      
      {status && (
        <div className="absolute -bottom-1 -right-1 bg-gray-100 rounded-full p-0.5">
          <div className="text-xs text-gray-700">
            {status === 'editing' && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            )}
            {status === 'viewing' && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ViewModeSelector = ({ viewMode, onChange }) => {
  return (
    <div className="flex bg-gray-100 p-0.5 rounded-md">
      <button
        className={`px-2 py-1 text-xs font-medium rounded-md ${viewMode === 'everyone' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
        onClick={() => onChange('everyone')}
      >
        <UsersIcon className="w-4 h-4 inline-block mr-1" />
        Everyone
      </button>
      <button
        className={`px-2 py-1 text-xs font-medium rounded-md ${viewMode === 'collaborators' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
        onClick={() => onChange('collaborators')}
      >
        <UserGroupIcon className="w-4 h-4 inline-block mr-1" />
        Collaborators
      </button>
      <button
        className={`px-2 py-1 text-xs font-medium rounded-md ${viewMode === 'just-me' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
        onClick={() => onChange('just-me')}
      >
        <UserIcon className="w-4 h-4 inline-block mr-1" />
        Just Me
      </button>
    </div>
  );
};

const CollaborationPanel = ({ position = 'right', className = '' }) => {
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  
  const {
    isConnected,
    collaborationEnabled,
    activeUsers,
    editingStatus,
    viewMode,
    toggleCollaboration,
    changeViewMode
  } = useCollaboration();
  
  if (!isConnected) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-3 ${className}`}>
        <p className="text-sm font-medium">Collaboration unavailable</p>
        <p className="text-xs mt-1">The collaboration service is currently offline. Try refreshing the page.</p>
      </div>
    );
  }
  
  const positionClasses = position === 'right' 
    ? 'right-4 top-20' 
    : position === 'left'
    ? 'left-4 top-20'
    : position === 'bottom'
    ? 'bottom-4 right-4'
    : 'top-20 right-4';
  
  return (
    <div className={`fixed ${positionClasses} z-40 ${className}`}>
      <div className={`transition-all duration-200 ${isPanelExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}`}>
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden mb-4 w-64">
          <div className="p-3 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-700">Collaboration</h3>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">{collaborationEnabled ? 'On' : 'Off'}</span>
                <Switch
                  checked={collaborationEnabled}
                  onChange={toggleCollaboration}
                  className={classNames(
                    collaborationEnabled ? 'bg-blue-600' : 'bg-gray-200',
                    'relative inline-flex flex-shrink-0 h-5 w-9 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  )}
                >
                  <span className="sr-only">Toggle collaboration</span>
                  <span
                    className={classNames(
                      collaborationEnabled ? 'translate-x-4' : 'translate-x-0',
                      'pointer-events-none relative inline-block h-4 w-4 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                    )}
                  />
                </Switch>
              </div>
            </div>
            
            {collaborationEnabled && (
              <div className="mt-2">
                <ViewModeSelector viewMode={viewMode} onChange={changeViewMode} />
              </div>
            )}
          </div>
          
          {collaborationEnabled && (
            <>
              <div className="p-3 border-b border-gray-200">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Active Users ({activeUsers.length})</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {activeUsers.length === 0 ? (
                    <p className="text-xs text-gray-500">No active users</p>
                  ) : (
                    activeUsers.map(user => {
                      // Determine if user is editing anything
                      const userStatus = editingStatus[user.id]?.isEditing ? 'editing' : 'viewing';
                      
                      return (
                        <div key={user.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <UserAvatar user={user} isActive={true} status={userStatus} />
                            <span className="text-sm font-medium text-gray-700 truncate">{user.name}</span>
                          </div>
                          
                          {userStatus === 'editing' && (
                            <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                              Editing
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
              
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Recent Activity</h4>
                  <button className="text-xs text-blue-600 hover:text-blue-800">
                    View all
                  </button>
                </div>
                
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  <p className="text-xs text-gray-500">No recent activity</p>
                  {/* Activity list would go here */}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={() => setIsPanelExpanded(!isPanelExpanded)}
          className={`bg-white rounded-full p-2 shadow-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            collaborationEnabled ? 'text-blue-600' : 'text-gray-500'
          }`}
        >
          {isPanelExpanded ? (
            <XIcon className="h-5 w-5" />
          ) : (
            <UserGroupIcon className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
};

// XIcon definition for closing the panel
const XIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default CollaborationPanel;
