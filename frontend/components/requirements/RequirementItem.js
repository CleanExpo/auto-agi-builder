import React from 'react';
import { useRouter } from 'next/router';
import { useUI } from '../../contexts/UIContext';
import { useProject } from '../../contexts/ProjectContext';

/**
 * RequirementItem component
 * Displays a single requirement in the requirements list
 * Includes status, priority, and actions like edit/delete
 */
export default function RequirementItem({ requirement, showActions = true, isExpanded = false, toggleExpand }) {
  const router = useRouter();
  const { showModal } = useUI();
  const { deleteRequirement } = useProject();

  // Get status style based on requirement status
  const getStatusStyle = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'review':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-indigo-100 text-indigo-800';
      case 'testing':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority style based on requirement priority
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format type for display
  const formatType = (type) => {
    switch (type) {
      case 'functional':
        return 'Functional';
      case 'non-functional':
        return 'Non-Functional';
      case 'technical':
        return 'Technical';
      case 'feature':
        return 'Feature';
      case 'bug':
        return 'Bug Fix';
      case 'improvement':
        return 'Improvement';
      case 'documentation':
        return 'Documentation';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  // Handle edit requirement
  const handleEdit = (e) => {
    e.stopPropagation();
    showModal('requirementForm', { requirement });
  };

  // Handle delete requirement
  const handleDelete = async (e) => {
    e.stopPropagation();
    showModal('confirmation', {
      title: 'Delete Requirement',
      message: 'Are you sure you want to delete this requirement? This action cannot be undone.',
      confirmButton: 'Delete',
      cancelButton: 'Cancel',
      onConfirm: async () => {
        try {
          await deleteRequirement(requirement.id);
          // Let the parent component refresh the list
        } catch (error) {
          console.error('Error deleting requirement:', error);
        }
      },
    });
  };

  return (
    <div 
      className={`requirement-item bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 ${
        isExpanded ? 'shadow-md' : 'hover:shadow-md'
      }`}
      onClick={toggleExpand}
    >
      {/* Requirement Header */}
      <div className="p-4">
        <div className="flex flex-wrap gap-2 mb-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(requirement.status)}`}>
            {requirement.status === 'in-progress' ? 'In Progress' : requirement.status.charAt(0).toUpperCase() + requirement.status.slice(1)}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityStyle(requirement.priority)}`}>
            {requirement.priority.charAt(0).toUpperCase() + requirement.priority.slice(1)} Priority
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            {formatType(requirement.type)}
          </span>
        </div>
        
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-gray-900">{requirement.title}</h3>
          
          {/* Action Buttons */}
          {showActions && (
            <div className="flex space-x-2 ml-4">
              <button
                onClick={handleEdit}
                className="p-1 text-gray-500 hover:text-indigo-600 transition-colors"
                aria-label="Edit"
                title="Edit"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={handleDelete}
                className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                aria-label="Delete"
                title="Delete"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Always visible content */}
        <div className="mt-2">
          <p className={`text-gray-600 ${isExpanded ? '' : 'line-clamp-2'}`}>
            {requirement.description}
          </p>
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          {requirement.tags && requirement.tags.map((tag, index) => (
            <span 
              key={index}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <div className="flex items-center mr-4">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>{requirement.storyPoints} {requirement.storyPoints === 1 ? 'point' : 'points'}</span>
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{requirement.complexity.charAt(0).toUpperCase() + requirement.complexity.slice(1)} complexity</span>
            </div>
          </div>
          
          {/* Expand/Collapse button */}
          <button 
            className="text-indigo-600 hover:text-indigo-800 flex items-center"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand();
            }}
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            <span className="mr-1">{isExpanded ? 'Less' : 'More'}</span>
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'transform rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
          {/* Acceptance Criteria */}
          {requirement.acceptanceCriteria && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-800 mb-1">Acceptance Criteria</h4>
              <p className="text-gray-600">{requirement.acceptanceCriteria}</p>
            </div>
          )}
          
          {/* Dependencies */}
          {requirement.dependencies && requirement.dependencies.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-800 mb-1">Dependencies</h4>
              <ul className="list-disc pl-5 text-gray-600">
                {requirement.dependencies.map((dependency, index) => (
                  <li key={index}>{dependency}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Assigned To */}
          {requirement.assignedTo && requirement.assignedTo.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-800 mb-1">Assigned To</h4>
              <div className="flex flex-wrap gap-2">
                {requirement.assignedTo.map((person, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {person}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
