import React from 'react';
import { Dialog } from '@headlessui/react';

/**
 * Confirmation modal component
 * Used for user confirmation before important actions
 */
const ConfirmationModal = ({ data, onClose }) => {
  const {
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm = () => {},
    variant = 'warning', // 'danger', 'warning', 'info'
  } = data || {};
  
  // Handle confirm action
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };
  
  // Style variations based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          bgColor: 'bg-red-100 dark:bg-red-900/20',
          iconColor: 'text-red-600 dark:text-red-400',
          buttonColor: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          icon: (
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
          icon: (
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
        };
      case 'info':
      default:
        return {
          bgColor: 'bg-blue-100 dark:bg-blue-900/20',
          iconColor: 'text-blue-600 dark:text-blue-400',
          buttonColor: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          icon: (
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        };
    }
  };
  
  const { bgColor, iconColor, buttonColor, icon } = getVariantStyles();
  
  return (
    <div className="px-4 pt-5 pb-4 sm:p-6">
      <div className="sm:flex sm:items-start">
        {/* Icon */}
        <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${bgColor}`}>
          <div className={iconColor}>{icon}</div>
        </div>
        
        {/* Content */}
        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            {title}
          </Dialog.Title>
          <div className="mt-2">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {typeof message === 'string' ? (
                <p>{message}</p>
              ) : (
                message
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        <button
          type="button"
          className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white ${buttonColor} focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm`}
          onClick={handleConfirm}
        >
          {confirmText}
        </button>
        <button
          type="button"
          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
          onClick={onClose}
        >
          {cancelText}
        </button>
      </div>
    </div>
  );
};

export default ConfirmationModal;
