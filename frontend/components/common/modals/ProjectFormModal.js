import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useProject } from '../../../contexts/ProjectContext';
import { useUI } from '../../../contexts/UIContext';

/**
 * ProjectFormModal component
 * Modal for creating or editing projects
 * Opens when user clicks "New Project" button
 */
export default function ProjectFormModal({ project = null, onClose }) {
  const router = useRouter();
  const { createProject, updateProject } = useProject();
  const { closeModal } = useUI();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'web-app',
    status: 'Planning',
    teamMembers: [],
    isPublic: false,
  });
  
  // Error state
  const [errors, setErrors] = useState({});
  // Loading state
  const [loading, setLoading] = useState(false);

  // If project is provided, populate form with project data (edit mode)
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        type: project.type || 'web-app',
        status: project.status || 'Planning',
        teamMembers: project.teamMembers || [],
        isPublic: project.isPublic || false,
      });
    }
  }, [project]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field if it exists
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
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Project name must be at least 3 characters';
    }
    
    // Description validation (optional but if provided must be at least 10 chars)
    if (formData.description && formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    
    // Type validation
    if (!formData.type) {
      newErrors.type = 'Please select a project type';
    }
    
    // Set errors and return validation result
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      let result;
      
      // Create or update project
      if (project) {
        // Update existing project
        result = await updateProject(project.id, formData);
      } else {
        // Create new project
        result = await createProject(formData);
      }
      
      // Close modal
      closeModal();
      
      // Redirect to the new/updated project
      router.push(`/projects/${result.id}`);
    } catch (error) {
      console.error('Error creating/updating project:', error);
      setErrors((prev) => ({
        ...prev,
        form: error.message || 'An error occurred. Please try again.',
      }));
    } finally {
      setLoading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      closeModal();
    }
  };

  return (
    <div className="project-form-modal">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {project ? 'Edit Project' : 'Create New Project'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error message */}
        {errors.form && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-4">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Project Name */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Project Name*
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter project name"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Project Description */}
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Describe your project"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.description ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Project Type */}
          <div className="mb-4">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Project Type*
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.type ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
              }`}
            >
              <option value="web-app">Web Application</option>
              <option value="mobile-app">Mobile Application</option>
              <option value="desktop-app">Desktop Application</option>
              <option value="api">API</option>
              <option value="cms">Content Management System</option>
              <option value="e-commerce">E-Commerce</option>
              <option value="other">Other</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type}</p>
            )}
          </div>

          {/* Project Status */}
          <div className="mb-4">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
              <option value="Canceled">Canceled</option>
            </select>
          </div>

          {/* Project Visibility */}
          <div className="mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                Make project public
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Public projects can be viewed by anyone with the link.
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : project ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
