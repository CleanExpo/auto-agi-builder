import React from 'react';
import { useUI } from '../../contexts';

/**
 * Notifications container component
 * Renders toast notifications from the UI context
 */
const NotificationsContainer = () => {
  const { notifications, removeNotification } = useUI();

  if (notifications.length === 0) {
    return null;
  }

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return (
          <svg className="h-6 w-6 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="h-6 w-6 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="h-6 w-6 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="h-6 w-6 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  // Get notification background color based on type
  const getNotificationBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20';
      case 'info':
      default:
        return 'bg-blue-50 dark:bg-blue-900/20';
    }
  };

  // Get notification border color based on type
  const getNotificationBorderColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-green-400 dark:border-green-600';
      case 'error':
        return 'border-red-400 dark:border-red-600';
      case 'warning':
        return 'border-yellow-400 dark:border-yellow-600';
      case 'info':
      default:
        return 'border-blue-400 dark:border-blue-600';
    }
  };

  // Get notification text color based on type
  const getNotificationTextColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-800 dark:text-green-200';
      case 'error':
        return 'text-red-800 dark:text-red-200';
      case 'warning':
        return 'text-yellow-800 dark:text-yellow-200';
      case 'info':
      default:
        return 'text-blue-800 dark:text-blue-200';
    }
  };

  return (
    <div className="fixed bottom-0 right-0 p-4 w-full md:max-w-sm z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`rounded-lg border shadow-lg ${getNotificationBgColor(notification.type)} ${getNotificationBorderColor(notification.type)} animate-appear transition-all duration-300 ease-in-out`}
        >
          <div className="p-4 flex items-start">
            <div className="flex-shrink-0">{getNotificationIcon(notification.type)}</div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className={`text-sm font-medium ${getNotificationTextColor(notification.type)}`}>
                {notification.message}
              </p>
              {notification.description && (
                <p className={`mt-1 text-sm ${getNotificationTextColor(notification.type)} opacity-80`}>
                  {notification.description}
                </p>
              )}
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className={`rounded-md inline-flex ${getNotificationTextColor(notification.type)} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                onClick={() => removeNotification(notification.id)}
              >
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationsContainer;
