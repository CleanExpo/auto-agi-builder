import React, { useState, useEffect } from 'react';
import { useProject } from '../../contexts';
import RequirementItem from './RequirementItem';
import RequirementFilterBar from './RequirementFilterBar';

/**
 * Requirements List Component
 * 
 * Displays and manages project requirements with filtering, sorting, and status controls
 */
const RequirementsList = ({ requirements, onStatusChange, onPriorityChange, onDelete, onEdit, loading }) => {
  const { currentProject } = useProject();
  const [filteredRequirements, setFilteredRequirements] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all', // all, pending, inProgress, completed, rejected
    priority: 'all', // all, low, medium, high, critical
    search: '',
    sortBy: 'priority', // priority, createdAt, title
    sortDirection: 'desc', // asc, desc
  });

  // Apply filters and sorting when requirements or filters change
  useEffect(() => {
    if (!requirements) return;

    let filtered = [...requirements];

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(req => req.status === filters.status);
    }

    // Apply priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(req => req.priority === filters.priority);
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(req => 
        req.title.toLowerCase().includes(searchLower) || 
        (req.description && req.description.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let valueA, valueB;
      
      switch (filters.sortBy) {
        case 'priority':
          // Convert priority to numeric value for sorting
          const priorityValues = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
          valueA = priorityValues[a.priority] || 0;
          valueB = priorityValues[b.priority] || 0;
          break;
        case 'createdAt':
          valueA = new Date(a.createdAt).getTime();
          valueB = new Date(b.createdAt).getTime();
          break;
        case 'title':
          valueA = a.title.toLowerCase();
          valueB = b.title.toLowerCase();
          break;
        default:
          return 0;
      }
      
      // Apply sort direction
      return filters.sortDirection === 'asc' 
        ? (valueA > valueB ? 1 : -1)
        : (valueA < valueB ? 1 : -1);
    });

    setFilteredRequirements(filtered);
  }, [requirements, filters]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Empty state
  if (!requirements || requirements.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 text-center">
        <svg 
          className="mx-auto h-12 w-12 text-gray-400" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1} 
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" 
          />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No requirements yet</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {currentProject 
            ? 'Get started by adding your first requirement' 
            : 'Please select a project first'
          }
        </p>
      </div>
    );
  }

  // No results after filtering
  if (filteredRequirements.length === 0) {
    return (
      <div>
        <RequirementFilterBar 
          filters={filters} 
          onFilterChange={handleFilterChange} 
        />
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 text-center mt-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No matching requirements</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your filters
          </p>
          <button
            className="mt-3 inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            onClick={() => setFilters({
              status: 'all',
              priority: 'all',
              search: '',
              sortBy: 'priority',
              sortDirection: 'desc',
            })}
          >
            Clear filters
          </button>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div>
      <RequirementFilterBar 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        totalCount={requirements.length}
        filteredCount={filteredRequirements.length}
      />
      
      <div className="mt-4 space-y-3">
        {filteredRequirements.map(requirement => (
          <RequirementItem
            key={requirement.id}
            requirement={requirement}
            onStatusChange={onStatusChange}
            onPriorityChange={onPriorityChange}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  );
};

export default RequirementsList;
