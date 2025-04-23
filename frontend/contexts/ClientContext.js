import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useUI } from './UIContext';
import * as clientApi from '../lib/clientApi';

// Create context
const ClientContext = createContext();

// Client provider component
export const ClientProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const { showNotification, showModal } = useUI();
  
  // State
  const [clients, setClients] = useState([]);
  const [currentClient, setCurrentClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  
  // Load clients when user authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchClients();
    } else {
      // Reset state when logged out
      setClients([]);
      setCurrentClient(null);
    }
  }, [isAuthenticated]);
  
  // Fetch clients with pagination, search, and filters
  const fetchClients = useCallback(async (options = {}) => {
    if (!isAuthenticated) return;
    
    const { page = pagination.page, limit = pagination.limit, search, isActive } = options;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await clientApi.getClients({ page, limit, search, isActive });
      
      setClients(data.items || []);
      setPagination({
        page: data.page || 1,
        limit: data.size || 10,
        total: data.total || 0,
        pages: data.pages || 0,
      });
      
      return data;
    } catch (err) {
      setError(err.message || 'Error fetching clients');
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load clients',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, pagination.page, pagination.limit, showNotification]);
  
  // Fetch a single client
  const fetchClient = useCallback(async (clientId) => {
    if (!isAuthenticated || !clientId) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await clientApi.getClient(clientId);
      setCurrentClient(data);
      
      return data;
    } catch (err) {
      setError(err.message || 'Error fetching client');
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load client details',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, showNotification]);
  
  // Create a new client
  const createClient = useCallback(async (clientData) => {
    if (!isAuthenticated) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      const newClient = await clientApi.createClient(clientData);
      
      // Refresh client list
      await fetchClients();
      
      showNotification({
        type: 'success',
        title: 'Success',
        message: 'Client organization created successfully',
      });
      
      return newClient;
    } catch (err) {
      setError(err.message || 'Error creating client');
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to create client organization',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, fetchClients, showNotification]);
  
  // Update an existing client
  const updateClient = useCallback(async (clientId, clientData) => {
    if (!isAuthenticated || !clientId) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      const updatedClient = await clientApi.updateClient(clientId, clientData);
      
      // Update client in state
      if (currentClient && currentClient.id === clientId) {
        setCurrentClient(updatedClient);
      }
      
      // Refresh client list
      await fetchClients();
      
      showNotification({
        type: 'success',
        title: 'Success',
        message: 'Client organization updated successfully',
      });
      
      return updatedClient;
    } catch (err) {
      setError(err.message || 'Error updating client');
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update client organization',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, currentClient, fetchClients, showNotification]);
  
  // Delete a client
  const deleteClient = useCallback(async (clientId) => {
    if (!isAuthenticated || !clientId) return false;
    
    // Show confirmation modal
    const confirmed = await new Promise((resolve) => {
      showModal({
        type: 'confirmation',
        title: 'Delete Client Organization',
        message: 'Are you sure you want to delete this client organization? This action cannot be undone.',
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
    
    if (!confirmed) return false;
    
    try {
      setLoading(true);
      setError(null);
      
      await clientApi.deleteClient(clientId);
      
      // Remove from current if it's the deleted client
      if (currentClient && currentClient.id === clientId) {
        setCurrentClient(null);
      }
      
      // Refresh client list
      await fetchClients();
      
      showNotification({
        type: 'success',
        title: 'Success',
        message: 'Client organization deleted successfully',
      });
      
      return true;
    } catch (err) {
      setError(err.message || 'Error deleting client');
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete client organization',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, currentClient, fetchClients, showModal, showNotification]);
  
  // Add a member to a client
  const addMember = useCallback(async (clientId, memberData) => {
    if (!isAuthenticated || !clientId) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      const newMember = await clientApi.addMember(clientId, memberData);
      
      // Refresh current client to update member list
      if (currentClient && currentClient.id === clientId) {
        await fetchClient(clientId);
      }
      
      showNotification({
        type: 'success',
        title: 'Success',
        message: 'Member added successfully',
      });
      
      return newMember;
    } catch (err) {
      setError(err.message || 'Error adding member');
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to add member',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, currentClient, fetchClient, showNotification]);
  
  // Remove a member from a client
  const removeMember = useCallback(async (clientId, memberId) => {
    if (!isAuthenticated || !clientId || !memberId) return false;
    
    // Show confirmation modal
    const confirmed = await new Promise((resolve) => {
      showModal({
        type: 'confirmation',
        title: 'Remove Member',
        message: 'Are you sure you want to remove this member from the client organization?',
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
    
    if (!confirmed) return false;
    
    try {
      setLoading(true);
      setError(null);
      
      await clientApi.removeMember(clientId, memberId);
      
      // Refresh current client to update member list
      if (currentClient && currentClient.id === clientId) {
        await fetchClient(clientId);
      }
      
      showNotification({
        type: 'success',
        title: 'Success',
        message: 'Member removed successfully',
      });
      
      return true;
    } catch (err) {
      setError(err.message || 'Error removing member');
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to remove member',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, currentClient, fetchClient, showModal, showNotification]);
  
  // Update a member's role
  const updateMemberRole = useCallback(async (clientId, memberId, role) => {
    if (!isAuthenticated || !clientId || !memberId) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      const updatedMember = await clientApi.updateMemberRole(clientId, memberId, role);
      
      // Refresh current client to update member list
      if (currentClient && currentClient.id === clientId) {
        await fetchClient(clientId);
      }
      
      showNotification({
        type: 'success',
        title: 'Success',
        message: `Member role updated to ${role}`,
      });
      
      return updatedMember;
    } catch (err) {
      setError(err.message || 'Error updating member role');
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update member role',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, currentClient, fetchClient, showNotification]);
  
  // Invite a user to join a client
  const inviteUser = useCallback(async (clientId, invitationData) => {
    if (!isAuthenticated || !clientId) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      const invitation = await clientApi.inviteUser(clientId, invitationData);
      
      showNotification({
        type: 'success',
        title: 'Success',
        message: `Invitation sent to ${invitationData.email}`,
      });
      
      return invitation;
    } catch (err) {
      setError(err.message || 'Error sending invitation');
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to send invitation',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, showNotification]);
  
  // Context value
  const value = {
    // State
    clients,
    currentClient,
    loading,
    error,
    pagination,
    
    // Client operations
    fetchClients,
    fetchClient,
    createClient,
    updateClient,
    deleteClient,
    
    // Member operations
    addMember,
    removeMember,
    updateMemberRole,
    inviteUser,
  };
  
  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>;
};

// Custom hook to use the client context
export const useClient = () => {
  const context = useContext(ClientContext);
  
  if (!context) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  
  return context;
};

export default ClientContext;
