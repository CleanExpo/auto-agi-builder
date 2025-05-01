import React from 'react';
import PropTypes from 'prop-types';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationItem from './NotificationItem';
import { BellIcon, ExclamationIcon } from '@heroicons/react/outline';

const NotificationList = ({ 
  variant = 'default',
  maxItems = null,
  emptyMessage = 'No notifications',
  className = '',
  itemVariant = 'default',
  showMarkAllRead = true,
  showLoadMore = true
}) => {
  const { 
    notifications, 
    isLoading, 
    error, 
    hasMore, 
    loadMore,
    markAllAsRead,
    unreadCount,
    totalCount
  } = useNotifications();

  // Handle marking all as read
  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  // Handle loading more notifications
  const handleLoadMore = () => {
    loadMore();
  };

  // If still loading initially
  if (isLoading && notifications.length === 0) {
    return (
      <div className={`flex justify-center items-center py-8 ${className}`}>
        <div className="spinner h-8 w-8 text-blue-500" />
      </div>
    );
  }

  // If there's an error
  if (error && notifications.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-8 text-center ${className}`}>
        <ExclamationIcon className="h-8 w-8 text-red-500 mb-2" />
        <p className="text-sm text-gray-600">{error}</p>
      </div>
    );
  }

  // If no notifications
  if (notifications.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-8 text-center ${className}`}>
        <BellIcon className="h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">{emptyMessage}</p>
      </div>
    );
  }

  // Determine which notifications to display
  const displayedNotifications = maxItems ? notifications.slice(0, maxItems) : notifications;

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={`${className}`}>
        {unreadCount > 0 && showMarkAllRead && (
          <div className="flex justify-end px-3 pt-2">
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Mark all as read
            </button>
          </div>
        )}
        <div className="divide-y divide-gray-200">
          {displayedNotifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              variant="compact"
            />
          ))}
        </div>
        {hasMore && showLoadMore && (
          <div className="pt-2 pb-1 px-3">
            <button
              onClick={handleLoadMore}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800 py-1"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Load more'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Minimal variant (for sidebars, etc.)
  if (variant === 'minimal') {
    return (
      <div className={`${className}`}>
        <div className="space-y-1">
          {displayedNotifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              variant="minimal"
            />
          ))}
        </div>
        {hasMore && showLoadMore && displayedNotifications.length < totalCount && (
          <div className="mt-2">
            <button
              onClick={handleLoadMore}
              className="text-xs text-blue-600 hover:text-blue-800"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Load more'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Default full variant
  return (
    <div className={`${className}`}>
      {unreadCount > 0 && showMarkAllRead && (
        <div className="flex justify-between items-center p-3 bg-gray-50 border-b border-gray-200">
          <div className="text-sm font-medium text-gray-700">
            {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
          </div>
          <button
            onClick={handleMarkAllRead}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Mark all as read
          </button>
        </div>
      )}
      
      <div className="divide-y divide-gray-200">
        {displayedNotifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            variant={itemVariant}
          />
        ))}
      </div>
      
      {hasMore && showLoadMore && (
        <div className="p-4 text-center bg-gray-50 border-t border-gray-200">
          <button
            onClick={handleLoadMore}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 focus:outline-none"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load more notifications'}
          </button>
        </div>
      )}
    </div>
  );
};

NotificationList.propTypes = {
  variant: PropTypes.oneOf(['default', 'compact', 'minimal']),
  maxItems: PropTypes.number,
  emptyMessage: PropTypes.string,
  className: PropTypes.string,
  itemVariant: PropTypes.oneOf(['default', 'compact', 'minimal']),
  showMarkAllRead: PropTypes.bool,
  showLoadMore: PropTypes.bool
};

export default NotificationList;
