import React, { useState, useEffect } from 'react';

/**
 * RequirementFilterBar Component
 * Provides filtering and search functionality for requirements
 */
export default function RequirementFilterBar({ 
  onFilterChange,
  totalRequirements = 0,
  defaultFilters = {}
}) {
  // Filter states
  const [searchQuery, setSearchQuery] = useState(defaultFilters.searchQuery || '');
  const [selectedStatuses, setSelectedStatuses] = useState(defaultFilters.statuses || []);
  const [selectedTypes, setSelectedTypes] = useState(defaultFilters.types || []);
  const [selectedPriorities, setSelectedPriorities] = useState(defaultFilters.priorities || []);
  const [selectedTags, setSelectedTags] = useState(defaultFilters.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState(defaultFilters.sortBy || 'updated');
  const [sortOrder, setSortOrder] = useState(defaultFilters.sortOrder || 'desc');

  // Status options
  const statusOptions = [
    { value: 'draft', label: 'Draft', color: 'bg-gray-100' },
    { value: 'review', label: 'In Review', color: 'bg-blue-100' },
    { value: 'approved', label: 'Approved', color: 'bg-green-100' },
    { value: 'in-progress', label: 'In Progress', color: 'bg-indigo-100' },
    { value: 'testing', label: 'Testing', color: 'bg-yellow-100' },
    { value: 'completed', label: 'Completed', color: 'bg-purple-100' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100' },
  ];

  // Type options
  const typeOptions = [
    { value: 'functional', label: 'Functional' },
    { value: 'non-functional', label: 'Non-Functional' },
    { value: 'technical', label: 'Technical' },
    { value: 'feature', label: 'Feature' },
    { value: 'bug', label: 'Bug Fix' },
    { value: 'improvement', label: 'Improvement' },
    { value: 'documentation', label: 'Documentation' },
    { value: 'other', label: 'Other' },
  ];

  // Priority options
  const priorityOptions = [
    { value: 'critical', label: 'Critical', color: 'bg-red-100' },
    { value: 'high', label: 'High', color: 'bg-orange-100' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100' },
    { value: 'low', label: 'Low', color: 'bg-green-100' },
  ];

  // Sort options
  const sortOptions = [
    { value: 'title', label: 'Title' },
    { value: 'priority', label: 'Priority' },
    { value: 'status', label: 'Status' },
    { value: 'created', label: 'Date Created' },
    { value: 'updated', label: 'Date Updated' },
    { value: 'storyPoints', label: 'Story Points' },
  ];

  // Update filters when they change
  useEffect(() => {
    const filters = {
      searchQuery,
      statuses: selectedStatuses,
      types: selectedTypes,
      priorities: selectedPriorities,
      tags: selectedTags,
      sortBy,
      sortOrder
    };
    
    onFilterChange(filters);
  }, [searchQuery, selectedStatuses, selectedTypes, selectedPriorities, selectedTags, sortBy, sortOrder]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Toggle status filter
  const toggleStatus = (status) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status) 
        : [...prev, status]
    );
  };

  // Toggle type filter
  const toggleType = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };

  // Toggle priority filter
  const togglePriority = (priority) => {
    setSelectedPriorities(prev => 
      prev.includes(priority) 
        ? prev.filter(p => p !== priority) 
        : [...prev, priority]
    );
  };

  // Add tag
  const addTag = () => {
    if (tagInput.trim() === '') return;
    
    if (!selectedTags.includes(tagInput.trim())) {
      setSelectedTags(prev => [...prev, tagInput.trim()]);
    }
    
    setTagInput('');
  };

  // Remove tag
  const removeTag = (tag) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
  };

  // Handle tag key down (add tag on enter)
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedStatuses([]);
    setSelectedTypes([]);
    setSelectedPriorities([]);
    setSelectedTags([]);
    setSortBy('updated');
    setSortOrder('desc');
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // Count active filters
  const getActiveFilterCount = () => {
    return (
      (searchQuery ? 1 : 0) +
      selectedStatuses.length +
      selectedTypes.length +
      selectedPriorities.length +
      selectedTags.length
    );
  };

  return (
    <div className="requirements-filter bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
        <div className="mb-3 md:mb-0">
          <h2 className="text-lg font-semibold text-gray-800">
            Requirements
            <span className="ml-1 text-sm font-normal text-gray-500">({totalRequirements})</span>
          </h2>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search requirements"
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full md:w-64 pl-9 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <svg
              className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Sort dropdown */}
          <div className="flex items-center">
            <label className="text-sm text-gray-600 mr-1 whitespace-nowrap">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="mr-1 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            
            {/* Sort Order Toggle */}
            <button
              onClick={toggleSortOrder}
              className="p-2 text-gray-500 hover:text-indigo-600 focus:outline-none"
              aria-label={sortOrder === 'asc' ? 'Sort ascending' : 'Sort descending'}
              title={sortOrder === 'asc' ? 'Sort ascending' : 'Sort descending'}
            >
              {sortOrder === 'asc' ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center py-2 px-3 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <svg className="h-4 w-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filters</span>
            {getActiveFilterCount() > 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-4 h-4 text-xs font-semibold text-white bg-indigo-500 rounded-full">
                {getActiveFilterCount()}
              </span>
            )}
          </button>
        </div>
      </div>
      
      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="mt-4 p-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filters */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
              <div className="space-y-2">
                {statusOptions.map(status => (
                  <label key={status.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedStatuses.includes(status.value)}
                      onChange={() => toggleStatus(status.value)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span 
                      className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${status.color} text-gray-800`}
                    >
                      {status.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Type Filters */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Type</h3>
              <div className="space-y-2">
                {typeOptions.map(type => (
                  <label key={type.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type.value)}
                      onChange={() => toggleType(type.value)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {type.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Priority Filters */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Priority</h3>
              <div className="space-y-2">
                {priorityOptions.map(priority => (
                  <label key={priority.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedPriorities.includes(priority.value)}
                      onChange={() => togglePriority(priority.value)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span 
                      className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${priority.color} text-gray-800`}
                    >
                      {priority.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Tags Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
              <div className="flex items-center mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Add tag"
                  className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  onClick={addTag}
                  className="px-3 py-1 bg-gray-100 text-gray-700 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200 text-sm"
                >
                  Add
                </button>
              </div>
              
              {/* Selected tags */}
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-indigo-600 hover:text-indigo-900 focus:outline-none"
                    >
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                ))}
                {selectedTags.length === 0 && (
                  <span className="text-xs text-gray-500 italic">No tags selected</span>
                )}
              </div>
            </div>
          </div>
          
          {/* Clear Filters Button */}
          {getActiveFilterCount() > 0 && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearAllFilters}
                className="text-sm text-indigo-600 hover:text-indigo-800 focus:outline-none"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
