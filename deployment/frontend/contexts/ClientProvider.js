import React, { createContext, useContext, useState } from 'react';

const ClientContext = createContext();

export function useClient() {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
}

export function ClientProvider({ children }) {
  const [clients, setClients] = useState([]);
  const [currentClient, setCurrentClient] = useState(null);

  const value = {
    clients,
    setClients,
    currentClient,
    setCurrentClient,
  };

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
}