import React, { useState, useEffect } from 'react';
import { withProtection } from '../components/auth/ProtectedRoute';
import Layout from '../components/layout/Layout';
import { useProject, useUI } from '../contexts';
import RequirementsList from '../components/requirements/RequirementsList';
import RequirementForm from '../components/requirements/RequirementForm';
import api from '../lib/api';

/**
 * Requirements Management Page
 * 
 * Displays all project requirements and allows CRUD operations
 */
const RequirementsPage = () => {
  const { currentProject } = useProject();
  const { toast, openModal, closeModal } = useUI();
  
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRequirement, setEditingRequirement] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
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
        title: 'User Authentication',
        description: 'Implement secure user authentication with email and password',
        status: 'completed',
        priority: 'high',
        category: 'Security',
        assignee: 'John Doe',
        createdAt: '2025-03-15T10:30:00Z'
      },
      {
        id: 'req-2',
        title: 'Dashboard UI',
        description: 'Create responsive dashboard with project statistics',
        status: 'inProgress',
        priority: 'medium',
        category: 'Frontend',
        assignee: 'Jane Smith',
        createdAt: '2025-03-20T14:45:00Z'
      },
      {
        id: 'req-3',
        title: 'Data Export Functionality',
        description: 'Add ability to export project data in CSV and PDF formats',
        status: 'pending',
        priority: 'low',
        category: 'Feature',
        assignee: 'Alex Johnson',
        createdAt: '2025-03-25T09:15:00Z'
      },
      {
        id: 'req-4',
        title: 'API Rate Limiting',
        description: 'Implement rate limiting to prevent abuse of the API',
        status: 'pending',
        priority: 'critical',
        category: 'Backend',
        assignee: 'Michael Brown',
        createdAt: '2025-03-28T11:20:00Z'
      }
    ];
  };
  
  // Create a new requirement
  const createRequirement = async (requirementData) => {
    if (!currentProject) {
      toast.error('Please select a project first');
      return;
    }
    
    try {
      const response = await api.post(`/projects/${currentProject.id}/requirements`, requirementData);
      setRequirements(prev => [...prev, response.data.requirement]);
      toast.success('Requirement created successfully');
      closeRequirementForm();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create requirement';
      toast.error(errorMessage);
      
      // For demo purposes, still add the requirement
      setRequirements(prev => [...prev, {
        ...requirementData,
        id: `req-${Date.now()}`
      }]);
      closeRequirementForm();
    }
  };
  
  // Update an existing requirement
  const updateRequirement = async (requirementData) => {
    try {
      const response = await api.put(`/requirements/${requirementData.id}`, requirementData);
      setRequirements(prev => 
        prev.map(req => req.id === requirementData.id ? response.data.requirement : req)
      );
      toast.success('Requirement updated successfully');
      closeRequirementForm();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update requirement';
      toast.error(errorMessage);
      
      // For demo purposes, still update the requirement
      setRequirements(prev => 
        prev.map(req => req.id === requirementData.id ? requirementData : req)
      );
      closeRequirementForm();
    }
  };
  
  // Delete a requirement
  const deleteRequirement = async (id) => {
    openModal('confirmation', {
      title: 'Delete Requirement',
      message: 'Are you sure you want to delete this requirement? This action cannot be undone.',
      confirmButtonText: 'Delete',
      confirmButtonVariant: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/requirements/${id}`);
          setRequirements(prev => prev.filter(req => req.id !== id));
          toast.success('Requirement deleted successfully');
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to delete requirement';
          toast.error(errorMessage);
          
          // For demo purposes, still remove the requirement
          setRequirements(prev => prev.filter(req => req.id !== id));
        }
      }
    });
  };
  
  // Change requirement status
  const handleStatusChange = async (id, status) => {
    try {
      const requirement = requirements.find(req => req.id === id);
      const updatedRequirement = { ...requirement, status };
      await api.put(`/requirements/${id}`, updatedRequirement);
      
      setRequirements(prev => 
        prev.map(req => req.id === id ? { ...req, status } : req)
      );
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update status';
      toast.error(errorMessage);
      
      // For demo purposes, still update the status
      setRequirements(prev => 
        prev.map(req => req.id === id ? { ...req, status } : req)
      );
    }
  };
  
  // Change requirement priority
  const handlePriorityChange = async (id, priority) => {
    try {
      const requirement = requirements.find(req => req.id === id);
      const updatedRequirement = { ...requirement, priority };
      await api.put(`/requirements/${id}`, updatedRequirement);
      
      setRequirements(prev => 
        prev.map(req => req.id === id ? { ...req, priority } : req)
      );
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update priority';
      toast.error(errorMessage);
      
      // For demo purposes, still update the priority
      setRequirements(prev => 
        prev.map(req => req.id === id ? { ...req, priority } : req)
      );
    }
  };
  
  // Open requirement form for editing
  const handleEditRequirement = (requirement) => {
    setEditingRequirement(requirement);
    setIsFormOpen(true);
  };
  
  // Open requirement form for creating
  const openRequirementForm = () => {
    setEditingRequirement(null);
    setIsFormOpen(true);
  };
  
  // Close requirement form
  const closeRequirementForm = () => {
    setEditingRequirement(null);
    setIsFormOpen(false);
  };
  
  // Handle requirement form submission
  const handleRequirementSubmit = (requirementData) => {
    if (editingRequirement) {
      updateRequirement(requirementData);
    } else {
      createRequirement(requirementData);
    }
  };
  
  return (
    <Layout title="Requirements Management">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Requirements</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {currentProject 
                  ? `Manage requirements for ${currentProject.name}` 
                  : 'Select a project to manage requirements'}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex">
              <button
                onClick={openRequirementForm}
                disabled={!currentProject}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Requirement
              </button>
            </div>
          </div>
          
          {/* Requirements List */}
          <RequirementsList
            requirements={requirements}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            onDelete={deleteRequirement}
            onEdit={handleEditRequirement}
            loading={loading}
          />
          
          {/* Requirement Form Modal */}
          {isFormOpen && (
            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                  <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                  <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                          {editingRequirement ? 'Edit Requirement' : 'Add Requirement'}
                        </h3>
                        <div className="mt-4">
                          <RequirementForm
                            requirement={editingRequirement}
                            onSubmit={handleRequirementSubmit}
                            onCancel={closeRequirementForm}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default withProtection(RequirementsPage);
