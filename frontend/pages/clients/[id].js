import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { FiEdit2, FiUsers, FiSettings, FiTrash2, FiChevronLeft } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import { useClient } from '../../contexts/ClientContext';
import { useUI } from '../../contexts/UIContext';

const ClientDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { 
    currentClient, 
    fetchClient, 
    updateClient, 
    deleteClient, 
    addMember, 
    removeMember, 
    updateMemberRole, 
    loading, 
    error 
  } = useClient();
  const { showModal, showNotification } = useUI();
  
  const [activeTab, setActiveTab] = useState('details');
  
  // Fetch client data when ID is available
  useEffect(() => {
    if (id) {
      fetchClient(id);
    }
  }, [id, fetchClient]);
  
  // Handle edit client details
  const handleEditClient = () => {
    if (!currentClient) return;
    
    showModal({
      title: 'Edit Client Organization',
      content: (
        <div className="p-4">
          <p className="mb-4">This would open a form to edit the client details.</p>
          <p className="text-sm text-gray-500">
            Form would include fields for name, industry, description, website, and primary contact information.
          </p>
          <div className="mt-4 text-right">
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => {
                // Mock client update (would be a form submission in real implementation)
                updateClient(currentClient.id, {
                  ...currentClient,
                  name: `${currentClient.name} (Updated)`,
                });
              }}
            >
              Update Client
            </button>
          </div>
        </div>
      ),
      size: 'md',
    });
  };
  
  // Handle delete client
  const handleDeleteClient = async () => {
    if (!currentClient) return;
    
    const success = await deleteClient(currentClient.id);
    if (success) {
      router.push('/clients');
    }
  };
  
  // Handle add member
  const handleAddMember = () => {
    if (!currentClient) return;
    
    showModal({
      title: 'Add Team Member',
      content: (
        <div className="p-4">
          <p className="mb-4">This would open a form to add a new team member.</p>
          <p className="text-sm text-gray-500">
            Form would include fields for user ID (or email for invitation) and role selection.
          </p>
          <div className="mt-4 text-right">
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => {
                // Mock member addition (would be a form submission in real implementation)
                addMember(currentClient.id, {
                  user_id: 'user_123',
                  role: 'member',
                });
              }}
            >
              Add Member
            </button>
          </div>
        </div>
      ),
      size: 'md',
    });
  };
  
  // Handle update member role
  const handleUpdateMemberRole = (memberId, currentRole) => {
    if (!currentClient) return;
    
    const roles = ['admin', 'member', 'viewer'];
    const otherRoles = roles.filter(r => r !== currentRole);
    
    showModal({
      title: 'Update Member Role',
      content: (
        <div className="p-4">
          <p className="mb-4">Select a new role for this team member:</p>
          <div className="space-y-2">
            {otherRoles.map(role => (
              <button
                key={role}
                className="w-full px-4 py-2 text-left border rounded hover:bg-gray-50"
                onClick={() => {
                  updateMemberRole(currentClient.id, memberId, role);
                }}
              >
                <span className="capitalize">{role}</span>
              </button>
            ))}
          </div>
        </div>
      ),
      size: 'sm',
    });
  };
  
  // Handle remove member
  const handleRemoveMember = (memberId) => {
    if (!currentClient) return;
    
    removeMember(currentClient.id, memberId);
  };
  
  // If loading and no client yet
  if (loading && !currentClient) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading client information...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  // If error
  if (error && !currentClient) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full p-8">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">Error loading client</div>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => router.push('/clients')}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Back to Clients
            </button>
          </div>
        </div>
      </Layout>
    );
  }
  
  // If no client found
  if (!loading && !currentClient) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full p-8">
          <div className="text-center">
            <div className="text-xl mb-4">Client not found</div>
            <p className="text-gray-600">The requested client organization does not exist or you don't have access.</p>
            <button
              onClick={() => router.push('/clients')}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Back to Clients
            </button>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Head>
        <title>{currentClient?.name || 'Client'} - Auto AGI Builder</title>
      </Head>
      
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button and actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
          <button
            onClick={() => router.push('/clients')}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4 sm:mb-0"
          >
            <FiChevronLeft className="mr-1" /> Back to Clients
          </button>
          
          <div className="flex space-x-4">
            <button
              onClick={handleEditClient}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiEdit2 className="mr-2" /> Edit
            </button>
            <button
              onClick={handleDeleteClient}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <FiTrash2 className="mr-2" /> Delete
            </button>
          </div>
        </div>
        
        {/* Client header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
            {currentClient?.name}
            <span className={`ml-4 inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
              currentClient?.is_active 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {currentClient?.is_active ? 'Active' : 'Inactive'}
            </span>
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            {currentClient?.industry || 'No industry specified'} • Created {new Date(currentClient?.created_at).toLocaleDateString()}
          </p>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('details')}
            >
              Details
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'team'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('team')}
            >
              Team Members
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>
          </nav>
        </div>
        
        {/* Tab content */}
        <div className="mt-6">
          {/* Details tab */}
          {activeTab === 'details' && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Client Information
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Details and contact information.
                </p>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Company name</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {currentClient?.name}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Industry</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {currentClient?.industry || '—'}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Website</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {currentClient?.website ? (
                        <a href={currentClient.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {currentClient.website}
                        </a>
                      ) : '—'}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {currentClient?.description || '—'}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Primary contact</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {currentClient?.primary_contact_name || '—'}
                      {currentClient?.primary_contact_email && (
                        <>
                          <br />
                          <a href={`mailto:${currentClient.primary_contact_email}`} className="text-blue-600 hover:underline">
                            {currentClient.primary_contact_email}
                          </a>
                        </>
                      )}
                      {currentClient?.primary_contact_phone && (
                        <>
                          <br />
                          {currentClient.primary_contact_phone}
                        </>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
          
          {/* Team tab */}
          {activeTab === 'team' && (
            <div>
              <div className="sm:flex sm:items-center mb-6">
                <div className="sm:flex-auto">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Team Members
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage who has access to this client organization.
                  </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
                  >
                    Add Member
                  </button>
                </div>
              </div>
              
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentClient?.members?.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                          No team members found.
                        </td>
                      </tr>
                    ) : (
                      currentClient?.members?.map((member) => (
                        <tr key={member.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {member.user_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="capitalize">{member.role}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              member.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {member.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {member.joined_at ? new Date(member.joined_at).toLocaleDateString() : '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleUpdateMemberRole(member.id, member.role)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              Change Role
                            </button>
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Settings tab */}
          {activeTab === 'settings' && (
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Client Settings
              </h3>
              
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Theme Settings
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Customize the appearance of client interfaces.
                  </p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Primary Color
                      </label>
                      <div className="flex items-center">
                        <div 
                          className="w-8 h-8 rounded-full mr-2 border border-gray-300" 
                          style={{ backgroundColor: currentClient?.settings?.theme?.primaryColor || '#007bff' }}
                        ></div>
                        <span className="text-sm text-gray-600">
                          {currentClient?.settings?.theme?.primaryColor || '#007bff'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Secondary Color
                      </label>
                      <div className="flex items-center">
                        <div 
                          className="w-8 h-8 rounded-full mr-2 border border-gray-300" 
                          style={{ backgroundColor: currentClient?.settings?.theme?.secondaryColor || '#6c757d' }}
                        ></div>
                        <span className="text-sm text-gray-600">
                          {currentClient?.settings?.theme?.secondaryColor || '#6c757d'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Logo Position
                      </label>
                      <span className="text-sm text-gray-600 capitalize">
                        {currentClient?.settings?.theme?.logoPosition || 'left'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Feature Settings
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Configure which features are available for this client.
                  </p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <div className="relative flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="collaboration"
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            checked={currentClient?.settings?.features?.collaborationEnabled}
                            readOnly
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="collaboration" className="font-medium text-gray-700">
                            Collaboration
                          </label>
                          <p className="text-gray-500">Allow team collaboration features</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="relative flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="export"
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            checked={currentClient?.settings?.features?.exportEnabled}
                            readOnly
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="export" className="font-medium text-gray-700">
                            Export
                          </label>
                          <p className="text-gray-500">Enable exporting capabilities</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="relative flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="customDomain"
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            checked={currentClient?.settings?.features?.customDomainEnabled}
                            readOnly
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="customDomain" className="font-medium text-gray-700">
                            Custom Domain
                          </label>
                          <p className="text-gray-500">Allow custom domain configuration</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => {
                    showNotification({
                      type: 'info',
                      title: 'Settings',
                      message: 'Settings update functionality would be implemented here.',
                    });
                  }}
                >
                  Save Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ClientDetailPage;
