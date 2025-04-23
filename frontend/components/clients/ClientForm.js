import React, { useState, useEffect } from 'react';
import { FiSave, FiX } from 'react-icons/fi';

/**
 * Client Form Component
 * 
 * Used for creating new clients and editing existing clients
 * @param {Object} props - Component props
 * @param {Object} props.initialData - Initial client data (for editing)
 * @param {Function} props.onSubmit - Submit handler function
 * @param {Function} props.onCancel - Cancel handler function
 * @param {Boolean} props.isSubmitting - Whether form is currently submitting
 */
const ClientForm = ({ initialData = {}, onSubmit, onCancel, isSubmitting = false }) => {
  const isEditMode = Object.keys(initialData).length > 0;
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    description: '',
    website: '',
    primary_contact_name: '',
    primary_contact_email: '',
    primary_contact_phone: '',
    is_active: true,
    ...initialData
  });
  
  // Form validation
  const [errors, setErrors] = useState({});
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    
    // Name is required
    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Client name is required';
    }
    
    // Email validation (if provided)
    if (formData.primary_contact_email && !/\S+@\S+\.\S+/.test(formData.primary_contact_email)) {
      newErrors.primary_contact_email = 'Please enter a valid email address';
    }
    
    // Website validation (if provided)
    if (formData.website && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(formData.website)) {
      newErrors.website = 'Please enter a valid website URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {/* Basic Information */}
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            {isEditMode ? 'Edit Client Organization' : 'New Client Organization'}
          </h3>
          
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Client Name */}
            <div className="sm:col-span-6">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Client Name <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                    errors.name ? 'border-red-300' : ''
                  }`}
                  placeholder="Enter client name"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>
            
            {/* Industry */}
            <div className="sm:col-span-3">
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                Industry
              </label>
              <div className="mt-1">
                <select
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Select industry</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Education">Education</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Retail">Retail</option>
                  <option value="Energy">Energy</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            
            {/* Website */}
            <div className="sm:col-span-3">
              <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                Website
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="website"
                  id="website"
                  value={formData.website}
                  onChange={handleChange}
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                    errors.website ? 'border-red-300' : ''
                  }`}
                  placeholder="https://example.com"
                />
              </div>
              {errors.website && (
                <p className="mt-1 text-sm text-red-600">{errors.website}</p>
              )}
            </div>
            
            {/* Description */}
            <div className="sm:col-span-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter a brief description of the client organization"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Primary Contact */}
        <div className="px-4 py-5 bg-gray-50 sm:p-6 border-t border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            Primary Contact
          </h3>
          
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Contact Name */}
            <div className="sm:col-span-3">
              <label htmlFor="primary_contact_name" className="block text-sm font-medium text-gray-700">
                Contact Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="primary_contact_name"
                  id="primary_contact_name"
                  value={formData.primary_contact_name}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="John Doe"
                />
              </div>
            </div>
            
            {/* Contact Email */}
            <div className="sm:col-span-3">
              <label htmlFor="primary_contact_email" className="block text-sm font-medium text-gray-700">
                Contact Email
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  name="primary_contact_email"
                  id="primary_contact_email"
                  value={formData.primary_contact_email}
                  onChange={handleChange}
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                    errors.primary_contact_email ? 'border-red-300' : ''
                  }`}
                  placeholder="john@example.com"
                />
              </div>
              {errors.primary_contact_email && (
                <p className="mt-1 text-sm text-red-600">{errors.primary_contact_email}</p>
              )}
            </div>
            
            {/* Contact Phone */}
            <div className="sm:col-span-3">
              <label htmlFor="primary_contact_phone" className="block text-sm font-medium text-gray-700">
                Contact Phone
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="primary_contact_phone"
                  id="primary_contact_phone"
                  value={formData.primary_contact_phone}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
            
            {/* Active Status */}
            <div className="sm:col-span-3">
              <div className="relative flex items-start pt-5">
                <div className="flex items-center h-5">
                  <input
                    id="is_active"
                    name="is_active"
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="is_active" className="font-medium text-gray-700">
                    Active Client
                  </label>
                  <p className="text-gray-500">
                    Inactive clients will not appear in default lists
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isSubmitting}
        >
          <FiX className="inline-block mr-2 -mt-1" />
          Cancel
        </button>
        <button
          type="submit"
          className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="inline-block animate-spin mr-2">⏳</span>
              {isEditMode ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <FiSave className="inline-block mr-2 -mt-1" />
              {isEditMode ? 'Update Client' : 'Create Client'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ClientForm;
