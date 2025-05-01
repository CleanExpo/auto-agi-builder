import React from 'react';

/**
 * Requirement Card Component
 * Displays a single requirement with its details and actions
 */
const RequirementCard = ({ requirement, onEdit, onDelete }) => {
  if (!requirement) return null;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
            {requirement.title}
          </h3>
          <div className="flex items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400 mr-3">
              Priority: <span className="font-medium">{requirement.priority || 'Medium'}</span>
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Status: <span className="font-medium">{requirement.status || 'New'}</span>
            </span>
          </div>
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
            {requirement.description}
          </p>
          <div className="flex flex-wrap">
            {requirement.tags && requirement.tags.map((tag, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2 mb-1 dark:bg-blue-900 dark:text-blue-200">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex">
          {onEdit && (
            <button
              onClick={() => onEdit(requirement)}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-2"
              aria-label="Edit requirement"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(requirement.id)}
              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              aria-label="Delete requirement"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequirementCard;
