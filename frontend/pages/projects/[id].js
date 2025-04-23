import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/layout/Layout';
import { useProject, useUI } from '../../contexts';
import { withProtection } from '../../components/auth/ProtectedRoute';

/**
 * Project detail page component
 * 
 * Shows comprehensive information about a single project
 */
const ProjectDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { openModal, toast } = useUI();
  const { fetchProject, archiveProject, restoreProject, deleteProject, setActiveProject } = useProject();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch project data when ID is available
  useEffect(() => {
    const getProjectData = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const { success, project, error } = await fetchProject(id);
        
        if (success) {
          setProject(project);
        } else {
          setError(error || 'Failed to load project');
          toast.error(error || 'Failed to load project');
        }
      } catch (err) {
        setError('An unexpected error occurred');
        toast.error('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    getProjectData();
  }, [id, fetchProject, toast]);
  
  // Format a date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };
  
  // Handle project editing
  const handleEditProject = () => {
    openModal('project-form', { type: 'edit', project });
    
    // Update local state when project is updated via modal
    const handleProjectUpdate = (updatedProject) => {
      setProject(updatedProject);
    };
    
    return handleProjectUpdate;
  };
  
  // Handle project archiving/restoration
  const handleArchiveToggle = async () => {
    try {
      const { success, project: updatedProject, error } = project.status === 'archived'
        ? await restoreProject(id)
        : await archiveProject(id);
      
      if (success) {
        setProject(updatedProject);
        toast.success(
          project.status === 'archived'
            ? 'Project restored successfully'
            : 'Project archived successfully'
        );
      } else {
        toast.error(error || 'Failed to update project status');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    }
  };
  
  // Handle project deletion
  const handleDeleteProject = () => {
    openModal('confirmation', {
      title: 'Delete Project',
      message: `Are you sure you want to delete "${project?.name}"? This action cannot be undone.`,
      confirmButtonText: 'Delete Project',
      confirmButtonVariant: 'danger',
      onConfirm: async () => {
        try {
          const { success, error } = await deleteProject(id);
          
          if (success) {
            toast.success('Project deleted successfully');
            router.push('/projects');
          } else {
            toast.error(error || 'Failed to delete project');
          }
        } catch (err) {
          toast.error('An unexpected error occurred');
        }
      }
    });
  };
  
  // Handle setting as current project
  const handleSetActive = () => {
    setActiveProject(project);
    toast.success(`${project.name} set as current project`);
  };
  
  // Handle sharing the project
  const handleShareProject = () => {
    openModal('share-project', { projectId: id });
  };
  
  // Show loading state
  if (loading) {
    return (
      <Layout title="Loading Project...">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }
  
  // Show error state
  if (error || !project) {
    return (
      <Layout title="Project Not Found">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
            <svg 
              className="mx-auto h-12 w-12 text-gray-400" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1} 
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Project not found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {error || 'The requested project could not be found or you do not have access to it.'}
            </p>
            <div className="mt-6">
              <Link href="/projects" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Go to Projects
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title={project.name}>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Project header */}
          <div className="md:flex md:items-center md:justify-between mb-8">
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {project.name}
                </h1>
                {project.status === 'archived' && (
                  <span className="ml-3 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200">
                    Archived
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {project.description || 'No description provided.'}
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
              <button 
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={handleSetActive}
              >
                Set as Current
              </button>
              <button
                type="button"
                onClick={handleEditProject}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Edit Project
              </button>
              <div className="dropdown relative inline-block text-left">
                <button className="inline-flex items-center px-2 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
                <div className="dropdown-menu hidden origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <button 
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={handleShareProject}
                    >
                      Share Project
                    </button>
                    <button 
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={handleArchiveToggle}
                    >
                      {project.status === 'archived' ? 'Restore Project' : 'Archive Project'}
                    </button>
                    <button 
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={handleDeleteProject}
                    >
                      Delete Project
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Project details */}
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Project Details
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                Basic information and project metadata.
              </p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Project name</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{project.name}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Client</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {project.clientName || 'No client specified.'}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created at</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {formatDate(project.createdAt)}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last updated</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {project.updatedAt 
                      ? formatDate(project.updatedAt)
                      : formatDate(project.createdAt)}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {project.status === 'archived' ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200">
                        Archived
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200">
                        Active
                      </span>
                    )}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Expected delivery date</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {project.expectedDeliveryDate 
                      ? formatDate(project.expectedDeliveryDate)
                      : 'No delivery date specified.'}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {project.description || 'No description provided.'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          
          {/* Quick actions */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link 
                href="/documents" 
                className="block bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">Documents</h4>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Import and analyze documents</p>
                  </div>
                </div>
              </Link>
              
              <Link 
                href="/requirements" 
                className="block bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">Requirements</h4>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage requirements</p>
                  </div>
                </div>
              </Link>
              
              <Link 
                href="/prototype" 
                className="block bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">Prototype</h4>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Generate prototype</p>
                  </div>
                </div>
              </Link>
              
              <Link 
                href="/device-preview" 
                className="block bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">Device Preview</h4>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">View on different devices</p>
                  </div>
                </div>
              </Link>
              
              <Link 
                href="/roi" 
                className="block bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">ROI Calculator</h4>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Calculate ROI</p>
                  </div>
                </div>
              </Link>
              
              <Link 
                href="/roadmap" 
                className="block bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">Roadmap</h4>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">View timeline</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Protect the project detail page
export default withProtection(ProjectDetailPage);
