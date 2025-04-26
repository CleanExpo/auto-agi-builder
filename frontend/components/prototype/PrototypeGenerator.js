import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUI } from '../../contexts/UIContext';
import { useProject } from '../../contexts/ProjectContext';

/**
 * PrototypeGenerator Component
 * Allows users to generate interactive prototypes based on project requirements
 */
export default function PrototypeGenerator({ projectId = null }) {
  const router = useRouter();
  const { id } = router.query;
  const { showNotification, showModal } = useUI();
  const { getProjectDetails, getRequirements } = useProject();
  
  // State
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [project, setProject] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [selectedRequirements, setSelectedRequirements] = useState([]);
  const [prototypes, setPrototypes] = useState([]);
  const [error, setError] = useState(null);
  
  // Generation options
  const [options, setOptions] = useState({
    platform: 'web',
    fidelity: 'medium',
    includeNavigation: true,
    includeAnimations: false,
    styleTheme: 'default',
    customBranding: false,
    useRealData: false,
    optimizeFor: 'usability',
    targetFramework: 'react',
  });
  
  // Load project and requirements data
  useEffect(() => {
    const projectIdentifier = projectId || id;
    if (projectIdentifier) {
      loadProjectData(projectIdentifier);
    }
  }, [projectId, id]);
  
  // Load project data and requirements
  const loadProjectData = async (projectId) => {
    try {
      setLoading(true);
      
      // Get project details
      const projectData = await getProjectDetails(projectId);
      setProject(projectData);
      
      // Get requirements
      const requirementsData = await getRequirements(projectId);
      
      // Filter for approved and in-progress requirements
      const filteredRequirements = requirementsData.filter(req => 
        ['approved', 'in-progress'].includes(req.status)
      );
      
      setRequirements(filteredRequirements);
      
      // Default to selecting all approved requirements
      const approvedRequirements = requirementsData
        .filter(req => req.status === 'approved')
        .map(req => req.id);
        
      setSelectedRequirements(approvedRequirements);
      
      // Load existing prototypes if any
      await loadExistingPrototypes(projectId);
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading project data:', err);
      setError('Failed to load project data. Please try again.');
      setLoading(false);
    }
  };
  
  // Load existing prototypes
  const loadExistingPrototypes = async (projectId) => {
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/prototypes`);
      
      if (!response.ok) {
        throw new Error('Failed to load existing prototypes');
      }
      
      const data = await response.json();
      setPrototypes(data.prototypes || []);
      
    } catch (err) {
      console.error('Error loading existing prototypes:', err);
      // We don't set error state here since this is not critical
      setPrototypes([]);
    }
  };
  
  // Toggle requirement selection
  const toggleRequirement = (requirementId) => {
    setSelectedRequirements(prev => {
      if (prev.includes(requirementId)) {
        return prev.filter(id => id !== requirementId);
      } else {
        return [...prev, requirementId];
      }
    });
  };
  
  // Select all requirements
  const selectAllRequirements = () => {
    setSelectedRequirements(requirements.map(req => req.id));
  };
  
  // Clear all selected requirements
  const clearSelectedRequirements = () => {
    setSelectedRequirements([]);
  };
  
  // Handle option change
  const handleOptionChange = (name, value) => {
    setOptions(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Specific option dependencies
    if (name === 'platform' && value === 'mobile') {
      setOptions(prev => ({
        ...prev,
        targetFramework: 'react-native'
      }));
    }
    
    if (name === 'fidelity' && value === 'high') {
      setOptions(prev => ({
        ...prev,
        includeAnimations: true
      }));
    }
  };
  
  // Generate prototype
  const generatePrototype = async () => {
    if (selectedRequirements.length === 0) {
      showNotification({
        type: 'warning',
        message: 'Please select at least one requirement for the prototype'
      });
      return;
    }
    
    try {
      setGenerating(true);
      setError(null);
      
      // Filter out selected requirements
      const selectedRequirementObjects = requirements.filter(
        req => selectedRequirements.includes(req.id)
      );
      
      // Prepare data for API
      const requestData = {
        projectId: projectId || id,
        requirements: selectedRequirementObjects,
        options: options
      };
      
      // Call API to generate prototype
      const response = await fetch('/api/v1/prototypes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate prototype');
      }
      
      const data = await response.json();
      
      // Add new prototype to local state
      setPrototypes(prev => [data.prototype, ...prev]);
      
      // Show success notification
      showNotification({
        type: 'success',
        message: 'Prototype generated successfully'
      });
      
      // Show success modal
      showModal('infoModal', {
        title: 'Prototype Generated',
        content: (
          <div>
            <p>Your prototype has been successfully generated.</p>
            <div className="p-4 bg-green-50 rounded-md mt-2">
              <h3 className="font-medium text-green-800">Prototype details:</h3>
              <ul className="mt-2 text-sm text-green-700 list-disc list-inside">
                <li>Name: {data.prototype.name}</li>
                <li>Target platform: {options.platform}</li>
                <li>Fidelity level: {options.fidelity}</li>
              </ul>
            </div>
          </div>
        ),
        onConfirm: () => router.push(`/projects/${projectId || id}/prototypes/${data.prototype.id}`)
      });
      
      setGenerating(false);
    } catch (err) {
      console.error('Error generating prototype:', err);
      setError('Failed to generate prototype. Please try again.');
      setGenerating(false);
    }
  };
  
  // View prototype
  const viewPrototype = (prototypeId) => {
    router.push(`/projects/${projectId || id}/prototypes/${prototypeId}`);
  };
  
  // Export prototype
  const exportPrototype = async (prototypeId) => {
    try {
      const prototype = prototypes.find(p => p.id === prototypeId);
      
      if (!prototype) {
        throw new Error('Prototype not found');
      }
      
      showModal('exportOptions', {
        title: `Export ${prototype.name}`,
        entityType: 'prototype',
        entityId: prototypeId,
        formats: [
          { id: 'html', name: 'HTML/CSS/JS', icon: 'code' },
          { id: 'react', name: 'React Components', icon: 'react' },
          { id: 'figma', name: 'Figma Design', icon: 'figma' },
          { id: 'pdf', name: 'PDF Document', icon: 'document' }
        ]
      });
    } catch (err) {
      showNotification({
        type: 'error',
        message: 'Failed to prepare prototype export'
      });
    }
  };
  
  // Delete prototype
  const deletePrototype = async (prototypeId) => {
    showModal('confirmation', {
      title: 'Delete Prototype',
      message: 'Are you sure you want to delete this prototype?',
      confirmButton: 'Delete',
      cancelButton: 'Cancel',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/v1/prototypes/${prototypeId}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) {
            throw new Error('Failed to delete prototype');
          }
          
          setPrototypes(prev => prev.filter(p => p.id !== prototypeId));
          
          showNotification({
            type: 'success',
            message: 'Prototype deleted successfully'
          });
        } catch (err) {
          showNotification({
            type: 'error',
            message: 'Failed to delete prototype'
          });
        }
      }
    });
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-800">
        <p>{error}</p>
        <button 
          onClick={() => loadProjectData(projectId || id)}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="prototype-generator space-y-6">
      <div>
        <h1 className="text-xl font-bold mb-2">Generate Prototype</h1>
        <p className="text-gray-600">
          Create interactive prototypes based on your project requirements.
        </p>
      </div>
      
      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left sidebar - Requirements selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold">Requirements</h2>
            <p className="text-sm text-gray-500">Select requirements to include</p>
            
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm">{selectedRequirements.length} of {requirements.length} selected</span>
              <div>
                <button onClick={selectAllRequirements} className="text-xs text-indigo-600 hover:text-indigo-800 mr-2">
                  Select All
                </button>
                <button onClick={clearSelectedRequirements} className="text-xs text-indigo-600 hover:text-indigo-800">
                  Clear All
                </button>
              </div>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto p-2">
            {requirements.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>No approved or in-progress requirements found.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {requirements.map((req) => (
                  <li key={req.id} className="px-2 py-2">
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedRequirements.includes(req.id)}
                        onChange={() => toggleRequirement(req.id)}
                        className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-1"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium">{req.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-2">{req.description}</p>
                      </div>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* Right side - Options and actions */}
        <div className="lg:col-span-2 space-y-4">
          {/* Platform options */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-4">
            <h2 className="font-semibold mb-3">Prototype Options</h2>
            
            {/* Platform selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Platform:</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleOptionChange('platform', 'web')}
                  className={`px-3 py-1.5 rounded-md text-sm ${
                    options.platform === 'web' 
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' 
                      : 'bg-white border border-gray-300 text-gray-700'
                  }`}
                >
                  Web
                </button>
                <button
                  onClick={() => handleOptionChange('platform', 'mobile')}
                  className={`px-3 py-1.5 rounded-md text-sm ${
                    options.platform === 'mobile' 
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' 
                      : 'bg-white border border-gray-300 text-gray-700'
                  }`}
                >
                  Mobile
                </button>
                <button
                  onClick={() => handleOptionChange('platform', 'desktop')}
                  className={`px-3 py-1.5 rounded-md text-sm ${
                    options.platform === 'desktop' 
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' 
                      : 'bg-white border border-gray-300 text-gray-700'
                  }`}
                >
                  Desktop
                </button>
              </div>
            </div>
            
            {/* Fidelity selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Fidelity Level:</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleOptionChange('fidelity', 'low')}
                  className={`px-3 py-1.5 rounded-md text-sm ${
                    options.fidelity === 'low' 
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' 
                      : 'bg-white border border-gray-300 text-gray-700'
                  }`}
                >
                  Low
                </button>
                <button
                  onClick={() => handleOptionChange('fidelity', 'medium')}
                  className={`px-3 py-1.5 rounded-md text-sm ${
                    options.fidelity === 'medium' 
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' 
                      : 'bg-white border border-gray-300 text-gray-700'
                  }`}
                >
                  Medium
                </button>
                <button
                  onClick={() => handleOptionChange('fidelity', 'high')}
                  className={`px-3 py-1.5 rounded-md text-sm ${
                    options.fidelity === 'high' 
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' 
                      : 'bg-white border border-gray-300 text-gray-700'
                  }`}
                >
                  High
                </button>
              </div>
            </div>
            
            {/* Framework selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Framework:</label>
              <select
                value={options.targetFramework}
                onChange={(e) => handleOptionChange('targetFramework', e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded-md"
              >
                {options.platform === 'web' && (
                  <>
                    <option value="html">HTML/CSS/JavaScript</option>
                    <option value="react">React</option>
                    <option value="vue">Vue.js</option>
                    <option value="angular">Angular</option>
                  </>
                )}
                {options.platform === 'mobile' && (
                  <>
                    <option value="react-native">React Native</option>
                    <option value="flutter">Flutter</option>
                    <option value="swift">Swift (iOS)</option>
                    <option value="kotlin">Kotlin (Android)</option>
                  </>
                )}
                {options.platform === 'desktop' && (
                  <>
                    <option value="electron">Electron</option>
                    <option value="wpf">.NET WPF</option>
                    <option value="qt">Qt</option>
                  </>
                )}
              </select>
            </div>
            
            {/* Toggle options */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center">
                <input
                  id="include-navigation"
                  type="checkbox"
                  checked={options.includeNavigation}
                  onChange={(e) => handleOptionChange('includeNavigation', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label htmlFor="include-navigation" className="ml-2 text-sm text-gray-700">
                  Include Navigation
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="include-animations"
                  type="checkbox"
                  checked={options.includeAnimations}
                  onChange={(e) => handleOptionChange('includeAnimations', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label htmlFor="include-animations" className="ml-2 text-sm text-gray-700">
                  Include Animations
                </label>
              </div>
            </div>
            
            {/* Generate button */}
            <div className="mt-4 text-right">
              <button
                onClick={generatePrototype}
                disabled={generating || selectedRequirements.length === 0}
                className={`px-4 py-2 rounded-md ${
                  generating || selectedRequirements.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {generating ? 'Generating...' : 'Generate Prototype'}
              </button>
            </div>
          </div>
          
          {/* Existing Prototypes */}
          {prototypes.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold">Existing Prototypes</h2>
                <p className="text-sm text-gray-500">Previously generated prototypes</p>
              </div>
              
              <ul className="divide-y divide-gray-100">
                {prototypes.map((prototype) => (
                  <li key={prototype.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{prototype.name}</h3>
                        <p className="text-sm text-gray-500">
                          {prototype.platform} {prototype.framework} - {prototype.createdAt ? new Date(prototype.createdAt).toLocaleDateString() : 'Unknown date'}
                        </p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => viewPrototype(prototype.id)}
                          className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
                        >
                          View
                        </button>
                        <button
                          onClick={() => exportPrototype(prototype.id)}
                          className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Export
                        </button>
                        <button
                          onClick={() => deletePrototype(prototype.id)}
                          className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
