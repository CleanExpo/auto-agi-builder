import React from 'react';
import PropTypes from 'prop-types';
import { ExclamationCircleIcon, XCircleIcon, RefreshIcon } from '@heroicons/react/outline';

/**
 * ErrorMessage component
 * Displays consistent error messages throughout the application
 */
const ErrorMessage = ({ 
  title = 'Error', 
  message = 'An unexpected error occurred.', 
  details = null,
  variant = 'warning',
  icon = null,
  tryAgain = null,
  className = ''
}) => {
  // Determine color and icon based on variant
  let colorClasses, IconComponent;
  
  switch (variant) {
    case 'critical':
      colorClasses = 'bg-red-50 text-red-800 border-red-200';
      IconComponent = icon || XCircleIcon;
      break;
    case 'warning':
      colorClasses = 'bg-yellow-50 text-yellow-800 border-yellow-200';
      IconComponent = icon || ExclamationCircleIcon;
      break;
    case 'info':
      colorClasses = 'bg-blue-50 text-blue-800 border-blue-200';
      IconComponent = icon || ExclamationCircleIcon;
      break;
    default:
      colorClasses = 'bg-gray-50 text-gray-800 border-gray-200';
      IconComponent = icon || ExclamationCircleIcon;
  }
  
  return (
    <div className={`rounded-md border p-4 ${colorClasses} ${className}`} role="alert">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <IconComponent className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium">{title}</h3>
          <div className="mt-2 text-sm">
            <p>{message}</p>
            {details && (
              <div className="mt-2 p-2 bg-white bg-opacity-50 rounded text-xs font-mono overflow-auto max-h-32">
                {details}
              </div>
            )}
          </div>
          {tryAgain && (
            <div className="mt-4">
              <button
                type="button"
                onClick={tryAgain}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <RefreshIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ErrorMessage.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  details: PropTypes.string,
  variant: PropTypes.oneOf(['critical', 'warning', 'info']),
  icon: PropTypes.elementType,
  tryAgain: PropTypes.func,
  className: PropTypes.string
};

export default ErrorMessage;
