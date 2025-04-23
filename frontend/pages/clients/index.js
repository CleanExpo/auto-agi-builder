import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { FiPlus, FiSearch, FiFilter, FiRefreshCw } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import { useClient } from '../../contexts/ClientContext';
import { useUI } from '../../contexts/UIContext';

const ClientsPage = () => {
  const router = useRouter();
  const { clients, pagination, fetchClients, loading, error, createClient } = useClient();
  const { showModal } = useUI();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  
  // Load clients on mount and when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchClients({
        search: searchTerm || undefined,
        isActive: showInactive ? undefined : true,
      });
    }, 300); // Debounce search
    
    return () => clearTimeout(timeoutId);
  }, [fetchClients, searchTerm, showInactive]);
  
  // Handle pagination change
  const handlePageChange = (newPage) => {
    fetchClients({
      page: newPage,
      search: searchTerm || undefined,
      isActive: showInactive ? undefined : true,
    });
  };
  
  // Handle client creation
  const handleCreateClient = () => {
    showModal({
      title: 'Create New Client Organization',
      content: (
        <div className="p-4">
          <p className="mb-4">This would open a form to create a new client organization.</p>
          <p className="text-sm text-gray-500">
            Form would include fields for name, industry, description, website, and primary contact information.
          </p>
          <div className="mt-4 text-right">
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => {
                // Mock client creation (would be a form submission in real implementation)
                createClient({
                  name: 'New Client Organization',
                  industry: 'Technology',
                  website: 'https://example.com',
                  primary_contact_name: 'John Doe',
                  primary_contact_email: 'john@example.com',
                });
              }}
            >
              Create Client
            </button>
          </div>
        </div>
      ),
      size: 'md',
    });
  };
  
  return (
    <Layout>
      <Head>
        <title>Client Organizations - Auto AGI Builder</title>
      </Head>
      
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Client Organizations</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage your client organizations and their team members.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              onClick={handleCreateClient}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
            >
              <FiPlus className="mr-2" /> New Client
            </button>
          </div>
        </div>
        
        {/* Filters and search */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow max-w-lg">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-sm text-gray-700">
              <input
                type="checkbox"
                className="rounded text-blue-600"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
              />
              <span>Show inactive clients</span>
            </label>
            
            <button
              onClick={() => fetchClients()}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiRefreshCw className="mr-2" /> Refresh
            </button>
          </div>
        </div>
        
        {/* Clients table */}
        <div className="mt-8 flex flex-col">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Name
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Industry
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Contact
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Members
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {loading && clients.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-sm text-gray-500">
                          Loading clients...
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-sm text-red-500">
                          Error loading clients: {error}
                        </td>
                      </tr>
                    ) : clients.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-sm text-gray-500">
                          No clients found. {searchTerm && "Try different search terms."}
                        </td>
                      </tr>
                    ) : (
                      clients.map((client) => (
                        <tr 
                          key={client.id} 
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => router.push(`/clients/${client.id}`)}
                        >
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {client.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {client.industry || "—"}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {client.primary_contact_name || "—"}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {client.members_count || 0}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              client.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {client.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/clients/${client.id}`);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Manage<span className="sr-only">, {client.name}</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        {/* Pagination */}
        {pagination.pages > 1 && (
          <nav
            className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4"
            aria-label="Pagination"
          >
            <div className="hidden sm:block">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                of <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div className="flex flex-1 justify-between sm:justify-end">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${
                  pagination.page === 1
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${
                  pagination.page === pagination.pages
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
          </nav>
        )}
      </div>
    </Layout>
  );
};

export default ClientsPage;
