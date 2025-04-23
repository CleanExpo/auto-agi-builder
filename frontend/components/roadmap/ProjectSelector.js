import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useProject } from '../../contexts/ProjectContext';

/**
 * ProjectSelector Component
 * 
 * Allows selection of projects for timeline visualization
 * Provides project filtering and search capabilities
 */
const ProjectSelector = ({ 
  selectedProjectId,
  onProjectSelect,
  className
}) => {
  const { projects, currentProject, isLoading } = useProject();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProjects, setFilteredProjects] = useState([]);
  
  // Filter projects based on search term
  useEffect(() => {
    if (!projects || !projects.length) {
      setFilteredProjects([]);
      return;
    }
    
    if (!searchTerm.trim()) {
      setFilteredProjects(projects);
      return;
    }
    
    const lowerCaseSearch = searchTerm.toLowerCase();
    const filtered = projects.filter(project => 
      project.name.toLowerCase().includes(lowerCaseSearch) ||
      (project.description && project.description.toLowerCase().includes(lowerCaseSearch))
    );
    
    setFilteredProjects(filtered);
  }, [projects, searchTerm]);
  
  // Handle project selection
  const handleProjectSelect = (projectId) => {
    if (onProjectSelect) {
      onProjectSelect(projectId);
    }
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // If no projects available, show message
  if (!isLoading && (!projects || projects.length === 0)) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 ${className || ''}`}>
        <div className="text-center py-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No projects found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by creating a new project.
          </p>
          <div className="mt-4">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Project
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 ${className || ''}`}>
      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Project Selection</h3>
      
      {/* Search Box */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        {searchTerm && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
      
      {/* Project Selection List */}
      <div className={`overflow-y-auto ${filteredProjects.length > 4 ? 'max-h-60' : ''}`}>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading projects...</span>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">No projects match your search</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {filteredProjects.map((project) => (
              <li key={project.id}>
                <button
                  onClick={() => handleProjectSelect(project.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    selectedProjectId === project.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                      : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700'
                  } border`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className={`font-medium ${selectedProjectId === project.id ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}>
                        {project.name}
                      </h4>
                      {project.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                          {project.description}
                        </p>
                      )}
                    </div>
                    <div className={`flex items-center text-sm ${selectedProjectId === project.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      <span className="mr-1">{project.taskCount || 0} tasks</span>
                      {selectedProjectId === project.id && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  {project.progressPercent !== undefined && (
                    <div className="mt-2">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-600">
                        <div 
                          style={{ width: `${project.progressPercent}%` }} 
                          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                            project.progressPercent < 30 ? 'bg-red-500' : 
                            project.progressPercent < 70 ? 'bg-yellow-500' : 
                            'bg-green-500'
                          }`}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {project.completedTasks || 0}/{project.totalTasks || 0} tasks
                        </span>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {project.progressPercent}%
                        </span>
                      </div>
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Current Project Quick Access */}
      {currentProject && currentProject.id !== selectedProjectId && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => handleProjectSelect(currentProject.id)}
            className="w-full flex items-center justify-between px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md"
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-sm">Current Project</span>
            </div>
            <span className="text-sm font-medium truncate max-w-[150px]">{currentProject.name}</span>
          </button>
        </div>
      )}
      
      {/* Create New Project Button */}
      <div className="mt-4">
        <button
          type="button"
          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create New Project
        </button>
      </div>
    </div>
  );
};

ProjectSelector.propTypes = {
  selectedProjectId: PropTypes.string,
  onProjectSelect: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default ProjectSelector;
