import React, { createContext, useContext, useState, useEffect } from 'react';

const UIContext = createContext();

export function UIProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');
  const [toastVisible, setToastVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const showToast = (message, type = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);

    // Auto-hide toast after 5 seconds
    setTimeout(() => {
      setToastVisible(false);
    }, 5000);
  };

  const hideToast = () => {
    setToastVisible(false);
  };

  const value = {
    sidebarOpen,
    toggleSidebar,
    showToast,
    hideToast,
    toastMessage,
    toastType,
    toastVisible
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}
