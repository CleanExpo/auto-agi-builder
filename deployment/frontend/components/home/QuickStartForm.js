import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

/**
 * QuickStartForm component allows users to quickly create a new project
 * with basic information. Shows login/signup prompt for unauthenticated users.
 * 
 * @param {Function} onSubmit - Callback function when form is submitted
 * @param {Boolean} isLoading - Whether the form is in a loading state
 * @param {Boolean} requiresAuth - Whether authentication is required to submit
 * @param {Function} onRequiresAuth - Callback when auth is required but user isn't authenticated
 */
const QuickStartForm = ({ onSubmit, isLoading = false, requiresAuth = true, onRequiresAuth }) => {
  const { isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'web',
  });
  
  const [validationErrors, setValidationErrors] = useState({});
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation errors for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Project name is required';
    } else if (formData.name.length < 3) {
      errors.name = 'Project name must be at least 3 characters';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Project description is required';
    }
    
    if (!formData.type) {
      errors.type = 'Project type is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (requiresAuth && !isAuthenticated) {
      if (onRequiresAuth) {
        onRequiresAuth();
      }
      return;
    }
    
    onSubmit(formData);
  };
  
  // Project types with icons and descriptions
  const projectTypes = [
    {
      id: 'web',
      name: 'Web Application',
      description: 'Interactive website with multiple pages and backend',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
        </svg>
      )
    },
    {
      id: 'mobile',
      name: 'Mobile App',
      description: 'iOS or Android application with touch interface',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
        </svg>
      )
    },
    {
      id: 'desktop',
      name: 'Desktop App',
      description: 'Windows, macOS, or Linux application',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
        </svg>
      )
    },
    {
      id: 'api',
      name: 'API/Backend',
      description: 'Server-side application with API endpoints',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
      )
    }
  ];
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!isAuthenticated && requiresAuth && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You need to be signed in to create a project.{" "}
                <Link href="/auth/login" className="font-medium underline text-yellow-700 hover:text-yellow-600">
                  Sign in
                </Link>
                {" "}or{" "}
                <Link href="/auth/register" className="font-medium underline text-yellow-700 hover:text-yellow-600">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div>
        <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Project Name
        </label>
        <input
          id="project-name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="My Awesome Project"
          className={`w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300 focus:border-blue-500 text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-700 ${validationErrors.name ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
          disabled={isLoading}
        />
        {validationErrors.name && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.name}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="project-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Project Description
        </label>
        <textarea
          id="project-description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your project idea..."
          rows="3"
          className={`w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300 focus:border-blue-500 text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-700 ${validationErrors.description ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
          disabled={isLoading}
        ></textarea>
        {validationErrors.description && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.description}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Project Type
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {projectTypes.map((type) => (
            <div key={type.id}>
              <label 
                htmlFor={`project-type-${type.id}`}
                className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                  formData.type === type.id 
                    ? 'bg-blue-50 border-blue-500 dark:bg-blue-900 dark:border-blue-500 dark:text-white' 
                    : 'bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    id={`project-type-${type.id}`}
                    name="type"
                    value={type.id}
                    checked={formData.type === type.id}
                    onChange={handleChange}
                    className="sr-only"
                    disabled={isLoading}
                  />
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    formData.type === type.id 
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300' 
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400'
                  }`}>
                    {type.icon}
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${
                      formData.type === type.id 
                        ? 'text-blue-800 dark:text-blue-300' 
                        : 'text-gray-800 dark:text-gray-300'
                    }`}>
                      {type.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {type.description}
                    </p>
                  </div>
                </div>
              </label>
            </div>
          ))}
        </div>
        {validationErrors.type && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.type}</p>
        )}
      </div>
      
      <div className="text-right">
        <button
          type="submit"
          className={`px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
            isLoading ? 'opacity-75 cursor-not-allowed' : ''
          }`}
          disabled={isLoading || (requiresAuth && !isAuthenticated)}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </span>
          ) : (
            'Create Project'
          )}
        </button>
      </div>
    </form>
  );
};

export default QuickStartForm;
