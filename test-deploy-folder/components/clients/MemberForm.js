import React, { useState } from 'react';
import { FiSave, FiX } from 'react-icons/fi';

/**
 * Member Form Component
 * 
 * Used for adding new members and editing existing members to client organizations
 * @param {Object} props - Component props
 * @param {Object} props.initialData - Initial member data (for editing)
 * @param {Function} props.onSubmit - Submit handler function
 * @param {Function} props.onCancel - Cancel handler function
 * @param {Boolean} props.isSubmitting - Whether form is currently submitting
 */
const MemberForm = ({ initialData = {}, onSubmit, onCancel, isSubmitting = false }) => {
  const isEditMode = Object.keys(initialData).length > 0;
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    role: 'member',
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
    
    // Email is required and must be valid
    if (!formData.email || formData.email.trim() === '') {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Role is required
    if (!formData.role || formData.role.trim() === '') {
      newErrors.role = 'Role is required';
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
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            {isEditMode ? 'Edit Member' : 'Add Team Member'}
          </h3>
          
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Email */}
            <div className="sm:col-span-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                    errors.email ? 'border-red-300' : ''
                  }`}
                  placeholder="member@example.com"
                  disabled={isEditMode} // Can't change email in edit mode
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
              {isEditMode && (
                <p className="mt-1 text-xs text-gray-500">Email cannot be changed once a member is added.</p>
              )}
            </div>
            
            {/* Role */}
            <div className="sm:col-span-3">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                    errors.role ? 'border-red-300' : ''
                  }`}
                >
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
              )}
            </div>
            
            {/* Active Status */}
            <div className="sm:col-span-6">
              <div className="relative flex items-start">
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
                    Active Member
                  </label>
                  <p className="text-gray-500">
                    Inactive members will not be able to log in or access this client organization.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Permission Information */}
        <div className="px-4 py-5 bg-gray-50 sm:p-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Role Permissions</h4>
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium text-gray-700">Admin: </span>
              <span className="text-gray-500">Full access to all features and settings, can manage team members.</span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-gray-700">Member: </span>
              <span className="text-gray-500">Can create, edit, and view all content but cannot manage team members or settings.</span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-gray-700">Viewer: </span>
              <span className="text-gray-500">Read-only access to all content, cannot make changes.</span>
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
              {isEditMode ? 'Updating...' : 'Adding...'}
            </>
          ) : (
            <>
              <FiSave className="inline-block mr-2 -mt-1" />
              {isEditMode ? 'Update Member' : 'Add Member'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default MemberForm;
