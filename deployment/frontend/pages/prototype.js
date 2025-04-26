import React, { useState, useEffect } from 'react';
import { withProtection } from '../components/auth/ProtectedRoute';
import Layout from '../components/layout/Layout';
import PrototypeGenerator from '../components/prototype/PrototypeGenerator';
import PrototypeViewer from '../components/prototype/PrototypeViewer';
import { useProject, useUI } from '../contexts';
import api from '../lib/api';

/**
 * Prototype Page
 * 
 * Integrates the prototype generator and viewer for creating code prototypes
 * based on project requirements
 */
const PrototypePage = () => {
  const { currentProject } = useProject();
  const { toast } = useUI();
  
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prototype, setPrototype] = useState(null);
  
  // Fetch requirements when current project changes
  useEffect(() => {
    fetchRequirements();
  }, [currentProject]);
  
  // Fetch requirements from API
  const fetchRequirements = async () => {
    if (!currentProject) {
      setRequirements([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await api.get(`/projects/${currentProject.id}/requirements`);
      setRequirements(response.data.requirements);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch requirements';
      toast.error(errorMessage);
      // Use demo data for now if API fails
      setRequirements(getDemoRequirements());
    } finally {
      setLoading(false);
    }
  };
  
  // Get demo requirements data (for development)
  const getDemoRequirements = () => {
    return [
      {
        id: 'req-1',
        title: 'User Authentication System',
        description: 'Implement secure login/logout with JWT and role-based access control',
        priority: 'high',
        status: 'completed',
        category: 'Security',
        createdAt: '2025-03-15T10:30:00Z',
        updatedAt: '2025-03-20T14:45:00Z',
        assignee: 'John Doe'
      },
      {
        id: 'req-2',
        title: 'Dashboard Analytics',
        description: 'Create visual representations of project metrics and KPIs',
        priority: 'medium',
        status: 'inProgress',
        category: 'Reporting',
        createdAt: '2025-03-18T11:20:00Z',
        updatedAt: '2025-03-22T09:15:00Z',
        assignee: 'Jane Smith'
      },
      {
        id: 'req-3',
        title: 'Document Export Functionality',
        description: 'Allow users to export reports in PDF, Excel, and CSV formats',
        priority: 'low',
        status: 'pending',
        category: 'Feature',
        createdAt: '2025-03-19T15:40:00Z',
        updatedAt: '2025-03-19T15:40:00Z',
        assignee: 'Unassigned'
      },
      {
        id: 'req-4',
        title: 'Multi-device Preview',
        description: 'Enable responsive design testing across desktop, tablet, and mobile',
        priority: 'high',
        status: 'completed',
        category: 'UI/UX',
        createdAt: '2025-03-20T13:10:00Z',
        updatedAt: '2025-03-25T11:30:00Z',
        assignee: 'Alice Johnson'
      },
      {
        id: 'req-5',
        title: 'API Documentation',
        description: 'Generate comprehensive API documentation with example requests/responses',
        priority: 'medium',
        status: 'inProgress',
        category: 'Documentation',
        createdAt: '2025-03-22T10:20:00Z',
        updatedAt: '2025-03-26T16:45:00Z',
        assignee: 'Bob Martin'
      }
    ];
  };
  
  // Handle prototype generation completion
  const handlePrototypeGenerated = (generatedPrototype) => {
    setPrototype(generatedPrototype);
    toast.success('Prototype generated successfully');
  };
  
  return (
    <Layout title="Prototype Generation">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Prototype Generator</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {currentProject 
                  ? `Generate code prototypes for ${currentProject.name} project` 
                  : 'Select a project to generate prototypes'}
              </p>
            </div>
          </div>
          
          {/* Content */}
          {!currentProject ? (
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 text-center">
              <svg 
                className="mx-auto h-12 w-12 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1} 
                  d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" 
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No project selected</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Please select a project from the sidebar first
              </p>
            </div>
          ) : loading ? (
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 text-center">
              <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading requirements...</p>
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 text-center">
              <div className="text-red-500 text-lg mb-2">Error</div>
              <p className="text-red-700 dark:text-red-400">{error}</p>
              <button
                onClick={fetchRequirements}
                className="mt-4 px-4 py-2 bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-100 rounded hover:bg-red-200 dark:hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Prototype Generator */}
              <div className="mb-8">
                <PrototypeGenerator 
                  requirements={requirements} 
                  onPrototypeGenerated={handlePrototypeGenerated} 
                />
              </div>
              
              {/* Prototype Viewer */}
              {prototype && (
                <div className="mt-8">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Generated Prototype</h2>
                  <PrototypeViewer prototype={prototype} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default withProtection(PrototypePage);
