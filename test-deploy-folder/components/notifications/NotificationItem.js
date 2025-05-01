import React from 'react';
import PropTypes from 'prop-types';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '../../contexts/NotificationContext';

// Icons
import { 
  InformationCircleIcon, 
  CheckCircleIcon, 
  ExclamationIcon, 
  XCircleIcon, 
  BellIcon,
  DotsVerticalIcon
} from '@heroicons/react/solid';

const NotificationItem = ({ notification, variant = 'default' }) => {
  const { markAsRead, archiveNotification, deleteNotification } = useNotifications();
  const [menuOpen, setMenuOpen] = React.useState(false);
  
  if (!notification) return null;
  
  // Format the creation time
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });
  
  // Get the appropriate icon based on notification type
  const getIcon = () => {
    switch (notification.type) {
      case 'info':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'system':
        return <BellIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };
  
  // Handle marking as read/unread
  const handleToggleRead = (e) => {
    e.stopPropagation();
    markAsRead(notification.id, !notification.is_read);
    setMenuOpen(false);
  };
  
  // Handle archiving
  const handleArchive = (e) => {
    e.stopPropagation();
    archiveNotification(notification.id, true);
    setMenuOpen(false);
  };
  
  // Handle deletion
  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this notification?')) {
      deleteNotification(notification.id);
    }
    setMenuOpen(false);
  };
  
  // Handle click on the notification
  const handleNotificationClick = () => {
    // If not read, mark as read
    if (!notification.is_read) {
      markAsRead(notification.id, true);
    }
    
    // If there's an action URL, navigate to it
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };
  
  // Toggle the dropdown menu
  const toggleMenu = (e) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };
  
  // Render different variants
  if (variant === 'compact') {
    return (
      <div 
        className={`flex items-center py-2 px-3 ${notification.is_read ? 'bg-white' : 'bg-blue-50'} hover:bg-gray-50 cursor-pointer`}
        onClick={handleNotificationClick}
      >
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${notification.is_read ? 'text-gray-600' : 'text-gray-900 font-medium'} truncate`}>
            {notification.title}
          </p>
        </div>
      </div>
    );
  }
  
  if (variant === 'minimal') {
    return (
      <div 
        className={`py-1 px-2 ${notification.is_read ? 'text-gray-600' : 'text-gray-900 font-medium'} cursor-pointer hover:bg-gray-50 flex items-center`}
        onClick={handleNotificationClick}
      >
        <span className="mr-1.5 inline-block">{getIcon()}</span>
        <span className="truncate">{notification.title}</span>
      </div>
    );
  }
  
  // Default variant
  return (
    <div 
      className={`border-b border-gray-200 ${notification.is_read ? 'bg-white' : 'bg-blue-50'} relative`}
    >
      <div className="p-4 cursor-pointer" onClick={handleNotificationClick}>
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5 mr-3">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h3 className={`text-sm ${notification.is_read ? 'font-normal text-gray-900' : 'font-semibold text-gray-900'}`}>
                {notification.title}
              </h3>
              <p className="text-xs text-gray-500 ml-2">{timeAgo}</p>
            </div>
            
            <div className="mt-1">
              <p className="text-sm text-gray-600 line-clamp-2">
                {notification.message}
              </p>
            </div>
            
            {notification.category && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  {notification.category}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-shrink-0 ml-2 relative">
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={toggleMenu}
            >
              <DotsVerticalIcon className="h-5 w-5" />
            </button>
            
            {menuOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10">
                <button
                  className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={handleToggleRead}
                >
                  {notification.is_read ? 'Mark as unread' : 'Mark as read'}
                </button>
                <button
                  className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={handleArchive}
                >
                  Archive
                </button>
                <button
                  className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['info', 'success', 'warning', 'error', 'system']).isRequired,
    category: PropTypes.string,
    is_read: PropTypes.bool.isRequired,
    is_archived: PropTypes.bool.isRequired,
    created_at: PropTypes.string.isRequired,
    action_url: PropTypes.string
  }).isRequired,
  variant: PropTypes.oneOf(['default', 'compact', 'minimal'])
};

export default NotificationItem;
