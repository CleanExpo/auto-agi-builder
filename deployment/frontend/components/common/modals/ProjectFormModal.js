import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { useProject, useUI } from '../../../contexts';

/**
 * Project form modal component
 * Used to create or edit a project
 */
const ProjectFormModal = ({ data, onClose }) => {
  const { createProject, updateProject } = useProject();
  const { toast } = useUI();
  
  // Type of form: 'create' or 'edit'
  const { type = 'create', project = null } = data || {};
  const isEdit = type === 'edit';
  
  // Form state
  const [formState, setFormState] = useState({
    name: '',
    description: '',
    clientName: '',
    clientEmail: '',
    expectedDeliveryDate: '',
    budget: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Initialize form with project data if editing
  useEffect(() => {
    if (isEdit && project) {
      setFormState({
        name: project.name || '',
        description: project.description || '',
        clientName: project.clientName || '',
        clientEmail: project.clientEmail || '',
        expectedDeliveryDate: project.expectedDeliveryDate 
          ? new Date(project.expectedDeliveryDate).toISOString().slice(0, 10)
          : '',
        budget: project.budget?.toString() || '',
      });
    }
  }, [isEdit, project]);
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formState.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    
    // Optional validation for other fields
    if (formState.clientEmail && !/^\S+@\S+\.\S+$/.test(formState.clientEmail)) {
      newErrors.clientEmail = 'Invalid email address';
    }
    
    if (formState.budget && isNaN(Number(formState.budget))) {
      newErrors.budget = 'Budget must be a number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare data for submission
      const projectData = {
        ...formState,
        // Convert string to number for budget
        budget: formState.budget ? Number(formState.budget) : undefined,
      };
      
      let result;
      
      if (isEdit) {
        // Update existing project
        result = await updateProject(project.id, projectData);
        
        if (result.success) {
          toast.success('Project updated successfully');
          onClose();
        } else {
          setErrors({ form: result.error || 'Failed to update project' });
        }
      } else {
        // Create new project
        result = await createProject(projectData);
        
        if (result.success) {
          toast.success('Project created successfully');
          onClose();
        } else {
          setErrors({ form: result.error || 'Failed to create project' });
        }
      }
    } catch (error) {
      console.error('Project form error:', error);
      setErrors({ form: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="px-4 pt-5 pb-4 sm:p-6">
      <div>
        <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          {isEdit ? 'Edit Project' : 'Create New Project'}
        </Dialog.Title>
        
        {/* Form error message */}
        {errors.form && (
          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm rounded-md">
            {errors.form}
          </div>
        )}
        
        <div className="mt-4 space-y-4">
          {/* Project Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formState.name}
              onChange={handleChange}
              className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md ${
                errors.name 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
              } dark:bg-gray-700 dark:text-white`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
            )}
          </div>
          
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              name="description"
              id="description"
              rows="3"
              value={formState.description}
              onChange={handleChange}
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          {/* Client Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Client Name
              </label>
              <input
                type="text"
                name="clientName"
                id="clientName"
                value={formState.clientName}
                onChange={handleChange}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Client Email
              </label>
              <input
                type="email"
                name="clientEmail"
                id="clientEmail"
                value={formState.clientEmail}
                onChange={handleChange}
                className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md ${
                  errors.clientEmail 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                } dark:bg-gray-700 dark:text-white`}
              />
              {errors.clientEmail && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.clientEmail}</p>
              )}
            </div>
          </div>
          
          {/* Project Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="expectedDeliveryDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Expected Delivery Date
              </label>
              <input
                type="date"
                name="expectedDeliveryDate"
                id="expectedDeliveryDate"
                value={formState.expectedDeliveryDate}
                onChange={handleChange}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Budget
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
                </div>
                <input
                  type="text"
                  name="budget"
                  id="budget"
                  value={formState.budget}
                  onChange={handleChange}
                  className={`pl-7 block w-full shadow-sm sm:text-sm rounded-md ${
                    errors.budget 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                  } dark:bg-gray-700 dark:text-white`}
                  placeholder="0.00"
                />
              </div>
              {errors.budget && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.budget}</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Form Actions */}
      <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isEdit ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            isEdit ? 'Update Project' : 'Create Project'
          )}
        </button>
        <button
          type="button"
          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ProjectFormModal;
