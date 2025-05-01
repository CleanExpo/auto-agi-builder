import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useAuth } from './AuthContext';
import { useUI } from './UIContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const { showNotification } = useUI();
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    is_read: null,
    is_archived: false,
    type: null,
    category: null
  });

  // Fetch notifications with current filters and pagination
  const fetchNotifications = useCallback(async (page = 1, reset = false) => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams({
        page,
        size: pageSize,
        sort_by: 'created_at',
        sort_dir: 'desc',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== null)
        )
      });
      
      const response = await api.get(`/api/v1/notifications?${queryParams}`);
      
      if (response.data) {
        if (reset) {
          setNotifications(response.data.items);
        } else {
          setNotifications(prev => [...prev, ...response.data.items]);
        }
        
        setUnreadCount(response.data.unread_count);
        setTotalCount(response.data.total);
        setHasMore(page < response.data.pages);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications. Please try again.');
      
      showNotification({
        title: 'Error',
        message: 'Failed to load notifications.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, pageSize, filters, showNotification]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await api.get('/api/v1/notifications/unread-count');
      if (typeof response.data === 'number') {
        setUnreadCount(response.data);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, [isAuthenticated]);

  // Fetch notification settings
  const fetchSettings = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await api.get('/api/v1/notifications/settings');
      if (response.data) {
        setSettings(response.data);
      }
    } catch (err) {
      console.error('Error fetching notification settings:', err);
      
      showNotification({
        title: 'Error',
        message: 'Failed to load notification settings.',
        type: 'error'
      });
    }
  }, [isAuthenticated, showNotification]);

  // Update notification settings
  const updateSettings = async (data) => {
    if (!isAuthenticated) return false;
    
    try {
      const response = await api.put('/api/v1/notifications/settings', data);
      
      if (response.data) {
        setSettings(response.data);
        
        showNotification({
          title: 'Success',
          message: 'Notification settings updated.',
          type: 'success'
        });
        
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating notification settings:', err);
      
      showNotification({
        title: 'Error',
        message: 'Failed to update notification settings.',
        type: 'error'
      });
      
      return false;
    }
  };

  // Mark notification as read/unread
  const markAsRead = async (id, isRead = true) => {
    if (!isAuthenticated) return false;
    
    try {
      const response = await api.post('/api/v1/notifications/mark-read', {
        notification_ids: [id],
        is_read: isRead
      });
      
      if (response.data > 0) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id
              ? { ...notification, is_read: isRead }
              : notification
          )
        );
        
        // Update unread count
        await fetchUnreadCount();
        
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error marking notification:', err);
      
      showNotification({
        title: 'Error',
        message: `Failed to mark notification as ${isRead ? 'read' : 'unread'}.`,
        type: 'error'
      });
      
      return false;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!isAuthenticated) return false;
    
    try {
      const response = await api.post('/api/v1/notifications/mark-all-read');
      
      if (response.data > 0) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, is_read: true }))
        );
        
        setUnreadCount(0);
        
        showNotification({
          title: 'Success',
          message: 'All notifications marked as read.',
          type: 'success'
        });
        
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      
      showNotification({
        title: 'Error',
        message: 'Failed to mark all notifications as read.',
        type: 'error'
      });
      
      return false;
    }
  };

  // Archive/unarchive notification
  const archiveNotification = async (id, isArchived = true) => {
    if (!isAuthenticated) return false;
    
    try {
      const response = await api.post('/api/v1/notifications/mark-archived', {
        notification_ids: [id],
        is_archived: isArchived
      });
      
      if (response.data > 0) {
        if (isArchived) {
          // Remove from current list if we're archiving
          setNotifications(prev => 
            prev.filter(notification => notification.id !== id)
          );
        } else {
          // Update the state if we're unarchiving
          setNotifications(prev => 
            prev.map(notification => 
              notification.id === id
                ? { ...notification, is_archived: isArchived }
                : notification
            )
          );
        }
        
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error archiving notification:', err);
      
      showNotification({
        title: 'Error',
        message: `Failed to ${isArchived ? 'archive' : 'unarchive'} notification.`,
        type: 'error'
      });
      
      return false;
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    if (!isAuthenticated) return false;
    
    try {
      const response = await api.delete(`/api/v1/notifications/${id}`);
      
      if (response.data) {
        // Remove from current list
        setNotifications(prev => 
          prev.filter(notification => notification.id !== id)
        );
        
        // Update counts
        await fetchUnreadCount();
        
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting notification:', err);
      
      showNotification({
        title: 'Error',
        message: 'Failed to delete notification.',
        type: 'error'
      });
      
      return false;
    }
  };

  // Load more notifications
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage);
  }, [fetchNotifications, hasMore, isLoading, page]);

  // Apply filters and reset pagination
  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
    setHasMore(true);
    fetchNotifications(1, true);
  };

  // Initial load and auto-refresh
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications(1, true);
      fetchSettings();
      
      // Set up polling for unread count
      const interval = setInterval(fetchUnreadCount, 60000); // Poll every minute
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchNotifications, fetchUnreadCount, fetchSettings]);

  // Context value
  const contextValue = {
    notifications,
    unreadCount,
    isLoading,
    error,
    settings,
    totalCount,
    hasMore,
    filters,
    loadMore,
    applyFilters,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
    updateSettings,
    fetchNotifications,
    fetchUnreadCount
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  return context;
};

export default NotificationContext;
