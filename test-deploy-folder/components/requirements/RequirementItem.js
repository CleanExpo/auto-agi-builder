import React, { useState } from 'react';

/**
 * Requirement Item Component
 * 
 * Displays a single requirement with controls for status, priority and actions
 */
const RequirementItem = ({ requirement, onStatusChange, onPriorityChange, onDelete, onEdit }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Format creation date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get appropriate status badge styling
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'inProgress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
    }
  };

  // Get appropriate priority badge styling
  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100';
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
    }
  };

  // Format status text for display
  const formatStatus = (status) => {
    switch (status) {
      case 'inProgress':
        return 'In Progress';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Handle status change
  const handleStatusChange = (e) => {
    onStatusChange(requirement.id, e.target.value);
  };

  // Handle priority change
  const handlePriorityChange = (e) => {
    onPriorityChange(requirement.id, e.target.value);
  };

  // Handle delete button click
  const handleDelete = () => {
    onDelete(requirement.id);
  };

  // Handle edit button click
  const handleEdit = () => {
    onEdit(requirement);
  };

  // Handle card expansion toggle
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
      {/* Card header with requirement title and actions */}
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h3 
              className="text-lg font-medium text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
              onClick={toggleExpand}
            >
              {requirement.title}
            </h3>
            <div className="ml-2">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(requirement.status)}`}>
                {formatStatus(requirement.status)}
              </span>
            </div>
            <div className="ml-2">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeClass(requirement.priority)}`}>
                {requirement.priority.charAt(0).toUpperCase() + requirement.priority.slice(1)}
              </span>
            </div>
          </div>
          <div className="ml-2 flex-shrink-0 flex">
            <button
              onClick={handleEdit}
              className="mr-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              title="Edit requirement"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              className="text-red-400 hover:text-red-500 dark:hover:text-red-300"
              title="Delete requirement"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4 sm:px-6">
          {/* Description */}
          {requirement.description && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h4>
              <p className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                {requirement.description}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</h4>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">
                {formatDate(requirement.createdAt)}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h4>
              <select
                value={requirement.status}
                onChange={handleStatusChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
              >
                <option value="pending">Pending</option>
                <option value="inProgress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Priority</h4>
              <select
                value={requirement.priority}
                onChange={handlePriorityChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Additional metadata (if available) */}
          {requirement.category && (
            <div className="mt-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Category: </span>
              <span className="text-sm text-gray-900 dark:text-white">{requirement.category}</span>
            </div>
          )}
          {requirement.assignee && (
            <div className="mt-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Assigned to: </span>
              <span className="text-sm text-gray-900 dark:text-white">{requirement.assignee}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RequirementItem;
