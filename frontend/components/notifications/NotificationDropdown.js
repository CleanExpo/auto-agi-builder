import React, { useRef, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/outline';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationList from './NotificationList';

const NotificationDropdown = () => {
  const { notifications, unreadCount, fetchNotifications } = useNotifications();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  
  // Handle click on the bell icon
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    
    // Refresh notifications on open
    if (!isOpen) {
      fetchNotifications(1, true);
    }
  };
  
  // Handle clicking outside to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);
  
  // Close dropdown when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      setIsOpen(false);
    };
    
    router.events.on('routeChangeStart', handleRouteChange);
    
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center justify-center p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center transform translate-x-1 -translate-y-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 overflow-hidden">
          <div className="py-1">
            <div className="border-b border-gray-200">
              <div className="flex justify-between items-center px-4 py-2">
                <h3 className="text-sm font-medium text-gray-700">Notifications</h3>
                <Link href="/notifications">
                  <a className="text-xs text-blue-600 hover:text-blue-800">
                    View all
                  </a>
                </Link>
              </div>
            </div>
            
            <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <NotificationList
                variant="compact"
                maxItems={5}
                emptyMessage="No new notifications"
                showMarkAllRead={true}
                showLoadMore={false}
              />
            </div>
            
            <div className="border-t border-gray-200 py-2 px-4 bg-gray-50">
              <Link href="/settings/notifications">
                <a className="text-xs text-gray-600 hover:text-gray-800">
                  Notification settings
                </a>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
