import React, { useState } from 'react';

/**
 * QuickStartForm component
 * Provides a form for users to quickly start a new project from the homepage
 */
export default function QuickStartForm({ 
  onSubmit, 
  isLoading = false, 
  requiresAuth = false,
  onRequiresAuth = () => {}
}) {
  // Form state
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState('web');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  // Project type options
  const projectTypes = [
    { value: 'web', label: 'Web Application' },
    { value: 'mobile', label: 'Mobile App' },
    { value: 'api', label: 'API Service' },
    { value: 'desktop', label: 'Desktop Application' },
    { value: 'other', label: 'Other' }
  ];

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!projectName.trim()) {
      setError('Project name is required');
      return;
    }

    if (requiresAuth) {
      onRequiresAuth();
      return;
    }
    
    // Clear any previous errors
    setError('');
    
    // Submit the project data
    onSubmit({
      name: projectName.trim(),
      type: projectType,
      description: description.trim()
    });
  };

  return (
    <div className="quick-start-form bg-white shadow-lg rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4">Get Started in Seconds</h3>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label 
            htmlFor="projectName" 
            className="block text-gray-700 font-medium mb-2"
          >
            Project Name
          </label>
          <input
            id="projectName"
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="My Awesome Project"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isLoading}
          />
        </div>
        
        <div className="mb-4">
          <label 
            htmlFor="projectType" 
            className="block text-gray-700 font-medium mb-2"
          >
            Project Type
          </label>
          <select
            id="projectType"
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isLoading}
          >
            {projectTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-6">
          <label 
            htmlFor="description" 
            className="block text-gray-700 font-medium mb-2"
          >
            Brief Description (optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your project idea briefly..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            rows="3"
            disabled={isLoading}
          ></textarea>
        </div>
        
        <button
          type="submit"
          className={`w-full py-3 px-4 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="inline-block animate-spin mr-2">⚙️</span>
              Creating Project...
            </>
          ) : (
            'Start Building Now'
          )}
        </button>
      </form>
      
      <p className="text-sm text-gray-600 mt-4 text-center">
        No credit card required. Start building in minutes.
      </p>
    </div>
  );
}
