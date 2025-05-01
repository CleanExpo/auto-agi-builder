import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useAuth } from './AuthContext';
import { useUI } from './UIContext';

// Default formatting options for fallback
const DEFAULT_FORMATS = {
  date_format: 'MM/DD/YYYY',
  time_format: 'hh:mm A',
  timezone: 'UTC',
  number_format: {
    decimal_separator: '.',
    thousands_separator: ',',
    currency_symbol: '$',
    currency_position: 'prefix'
  },
  measurement_system: 'imperial',
  region_code: 'en-US',
  region_name: 'English (United States)'
};

const LocalizationContext = createContext(null);

export const LocalizationProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const { showNotification } = useUI();
  
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [availableRegions, setAvailableRegions] = useState([]);
  const [error, setError] = useState(null);
  
  // Detect browser locale
  const detectBrowserLocale = useCallback(() => {
    try {
      return navigator.language || navigator.userLanguage || 'en-US';
    } catch (e) {
      console.warn('Failed to detect browser locale:', e);
      return 'en-US';
    }
  }, []);

  // Fetch localization settings from API
  const fetchSettings = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const browserLocale = detectBrowserLocale();
      const response = await api.get('/api/v1/localization/settings', {
        params: { browser_locale: browserLocale }
      });
      
      if (response.data) {
        setSettings(response.data);
      } else {
        // Use defaults if no settings returned
        setSettings({
          ...DEFAULT_FORMATS,
          source: 'default'
        });
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching localization settings:', err);
      setError('Failed to load localization settings');
      
      // Use defaults on error
      setSettings({
        ...DEFAULT_FORMATS,
        source: 'default'
      });
      
      showNotification({
        title: 'Error',
        message: 'Failed to load localization settings. Using defaults instead.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, detectBrowserLocale, showNotification]);

  // Fetch available regions
  const fetchRegions = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await api.get('/api/v1/localization/regions', {
        params: { active_only: true }
      });
      
      if (response.data && response.data.items) {
        setAvailableRegions(response.data.items);
      }
    } catch (err) {
      console.error('Error fetching available regions:', err);
      showNotification({
        title: 'Error',
        message: 'Failed to load available regions.',
        type: 'error'
      });
    }
  }, [isAuthenticated, showNotification]);

  // Update user's localization settings
  const updateSettings = async (newSettings) => {
    if (!isAuthenticated) return false;
    
    try {
      setLoading(true);
      const response = await api.put('/api/v1/localization/settings', newSettings);
      
      if (response.data) {
        setSettings(response.data);
        showNotification({
          title: 'Success',
          message: 'Localization settings updated successfully.',
          type: 'success'
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating localization settings:', err);
      showNotification({
        title: 'Error',
        message: 'Failed to update localization settings.',
        type: 'error'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Reset user's localization settings to defaults
  const resetSettings = async () => {
    if (!isAuthenticated) return false;
    
    try {
      setLoading(true);
      const response = await api.post('/api/v1/localization/settings/reset');
      
      if (response.data) {
        setSettings(response.data);
        showNotification({
          title: 'Success',
          message: 'Localization settings reset to defaults.',
          type: 'success'
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error resetting localization settings:', err);
      showNotification({
        title: 'Error',
        message: 'Failed to reset localization settings.',
        type: 'error'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Initialize on auth change or component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchSettings();
      fetchRegions();
    }
  }, [isAuthenticated, fetchSettings, fetchRegions]);

  // ==== Formatting Utilities ====

  // Format date according to user preferences
  const formatDate = (date, options = {}) => {
    if (!date) return '';
    
    try {
      // Ensure we have a Date object
      const dateObj = date instanceof Date ? date : new Date(date);
      
      if (isNaN(dateObj.getTime())) {
        console.warn('Invalid date provided to formatDate:', date);
        return 'Invalid Date';
      }
      
      // Use Intl.DateTimeFormat for proper localization
      const formatter = new Intl.DateTimeFormat(
        settings?.region_code || 'en-US',
        {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          timeZone: settings?.timezone || 'UTC',
          ...options
        }
      );
      
      return formatter.format(dateObj);
    } catch (err) {
      console.error('Error formatting date:', err);
      return String(date);
    }
  };

  // Format time according to user preferences
  const formatTime = (time, options = {}) => {
    if (!time) return '';
    
    try {
      // Ensure we have a Date object
      const dateObj = time instanceof Date ? time : new Date(time);
      
      if (isNaN(dateObj.getTime())) {
        console.warn('Invalid time provided to formatTime:', time);
        return 'Invalid Time';
      }
      
      // Use Intl.DateTimeFormat for proper localization
      const formatter = new Intl.DateTimeFormat(
        settings?.region_code || 'en-US',
        {
          hour: 'numeric',
          minute: 'numeric',
          second: options.seconds ? 'numeric' : undefined,
          hour12: settings?.time_format?.includes('A'),
          timeZone: settings?.timezone || 'UTC',
          ...options
        }
      );
      
      return formatter.format(dateObj);
    } catch (err) {
      console.error('Error formatting time:', err);
      return String(time);
    }
  };

  // Format date and time together
  const formatDateTime = (datetime, options = {}) => {
    if (!datetime) return '';
    
    try {
      // Ensure we have a Date object
      const dateObj = datetime instanceof Date ? datetime : new Date(datetime);
      
      if (isNaN(dateObj.getTime())) {
        console.warn('Invalid datetime provided to formatDateTime:', datetime);
        return 'Invalid Date/Time';
      }
      
      // Use Intl.DateTimeFormat for proper localization
      const formatter = new Intl.DateTimeFormat(
        settings?.region_code || 'en-US',
        {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: options.seconds ? 'numeric' : undefined,
          hour12: settings?.time_format?.includes('A'),
          timeZone: settings?.timezone || 'UTC',
          ...options
        }
      );
      
      return formatter.format(dateObj);
    } catch (err) {
      console.error('Error formatting datetime:', err);
      return String(datetime);
    }
  };

  // Format number according to user preferences
  const formatNumber = (number, options = {}) => {
    if (number === null || number === undefined) return '';
    
    try {
      const numberFormat = settings?.number_format || DEFAULT_FORMATS.number_format;
      
      // Special formatting for percentages
      if (options.format === 'percent') {
        const formatter = new Intl.NumberFormat(
          settings?.region_code || 'en-US', 
          { 
            style: 'percent',
            minimumFractionDigits: options.minimumFractionDigits !== undefined 
              ? options.minimumFractionDigits 
              : 0,
            maximumFractionDigits: options.maximumFractionDigits !== undefined 
              ? options.maximumFractionDigits 
              : 2
          }
        );
        return formatter.format(number);
      }
      
      // General number formatting
      const formatter = new Intl.NumberFormat(
        settings?.region_code || 'en-US',
        {
          minimumFractionDigits: options.minimumFractionDigits !== undefined 
            ? options.minimumFractionDigits 
            : 0,
          maximumFractionDigits: options.maximumFractionDigits !== undefined 
            ? options.maximumFractionDigits 
            : 2,
          ...options
        }
      );
      
      return formatter.format(number);
    } catch (err) {
      console.error('Error formatting number:', err);
      return String(number);
    }
  };

  // Format currency according to user preferences
  const formatCurrency = (amount, options = {}) => {
    if (amount === null || amount === undefined) return '';
    
    try {
      const numberFormat = settings?.number_format || DEFAULT_FORMATS.number_format;
      const currencyCode = options.currency || 'USD';
      
      const formatter = new Intl.NumberFormat(
        settings?.region_code || 'en-US',
        {
          style: 'currency',
          currency: currencyCode,
          minimumFractionDigits: options.minimumFractionDigits !== undefined 
            ? options.minimumFractionDigits 
            : 2,
          maximumFractionDigits: options.maximumFractionDigits !== undefined 
            ? options.maximumFractionDigits 
            : 2,
          ...options
        }
      );
      
      return formatter.format(amount);
    } catch (err) {
      console.error('Error formatting currency:', err);
      return String(amount);
    }
  };

  // Context value
  const contextValue = {
    loading,
    settings,
    availableRegions,
    error,
    updateSettings,
    resetSettings,
    formatDate,
    formatTime,
    formatDateTime,
    formatNumber,
    formatCurrency,
    detectBrowserLocale
  };

  return (
    <LocalizationContext.Provider value={contextValue}>
      {children}
    </LocalizationContext.Provider>
  );
};

// Hook for using the localization context
export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  
  return context;
};

export default LocalizationContext;
