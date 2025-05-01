import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useUI } from '../../contexts/UIContext';
import { useProject } from '../../contexts/ProjectContext';

/**
 * ProjectCard component displays a project summary with action buttons.
 * Used in project listing pages and dashboard.
 * 
 * @param {Object} project - The project data object
 * @param {Boolean} showActions - Whether to show action buttons
 */
const ProjectCard = ({ project, showActions = true }) => {
  const router = useRouter();
  const { showModal } = useUI();
  const { deleteProject } = useProject();
  
  // Format date as "Month Day, Year"
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };
  
  // Get human readable status
  const getStatusText = (status) => {
    switch (status) {
      case 'planning':
        return 'Planning';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'archived':
        return 'Archived';
      default:
        return 'Unknown';
    }
  };
  
  // Get project type icon
  const getProjectTypeIcon = (type) => {
    switch (type) {
      case 'web':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
          </svg>
        );
      case 'mobile':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
          </svg>
        );
      case 'desktop':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
        );
      case 'api':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        );
    }
  };
  
  // Handle delete project
  const handleDelete = async () => {
    showModal('confirmation', {
      title: 'Delete Project',
      message: `Are you sure you want to delete "${project.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      confirmVariant: 'danger',
      onConfirm: async () => {
        try {
          await deleteProject(project.id);
        } catch (error) {
          console.error('Failed to delete project:', error);
          showModal('error', {
            title: 'Delete Failed',
            message: 'There was an error deleting the project. Please try again.'
          });
        }
      }
    });
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-100 dark:border-gray-700">
      {/* Project Status Banner */}
      <div className={`px-4 py-1 text-xs font-medium ${getStatusColor(project.status)}`}>
        {getStatusText(project.status)}
      </div>
      
      {/* Project Content */}
      <div className="p-6">
        <div className="flex items-start mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 mr-3 flex-shrink-0">
            {getProjectTypeIcon(project.type)}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-1 line-clamp-1">
              {project.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Created: {formatDate(project.createdAt)}
            </p>
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-2 text-sm h-10">
          {project.description || "No description provided."}
        </p>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-6 text-center text-xs">
          <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
            <div className="font-semibold text-gray-800 dark:text-white">{project.requirementsCount || 0}</div>
            <div className="text-gray-500 dark:text-gray-400">Requirements</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
            <div className="font-semibold text-gray-800 dark:text-white">{project.documentsCount || 0}</div>
            <div className="text-gray-500 dark:text-gray-400">Documents</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
            <div className="font-semibold text-gray-800 dark:text-white">{project.completionPercentage || 0}%</div>
            <div className="text-gray-500 dark:text-gray-400">Complete</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
          <div 
            className="bg-blue-600 h-2 rounded-full" 
            style={{ width: `${project.completionPercentage || 0}%` }}
          ></div>
        </div>
        
        {/* Actions */}
        {showActions && (
          <div className="flex justify-between items-center">
            <Link 
              href={`/projects/${project.id}`}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
            >
              View Details
            </Link>
            <div className="flex space-x-2">
              <button
                onClick={() => router.push(`/prototype?projectId=${project.id}`)}
                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Generate Prototype"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
              </button>
              <button
                onClick={() => showModal('project-form', { project })}
                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Edit Project"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 rounded hover:bg-red-50 dark:hover:bg-red-900"
                title="Delete Project"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
