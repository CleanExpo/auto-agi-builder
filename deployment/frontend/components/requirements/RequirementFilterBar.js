import React from 'react';

/**
 * Requirement Filter Bar Component
 * 
 * Provides filtering, searching, and sorting controls for requirements
 */
const RequirementFilterBar = ({ filters, onFilterChange, totalCount, filteredCount }) => {
  // Handle status filter change
  const handleStatusChange = (e) => {
    onFilterChange({ status: e.target.value });
  };

  // Handle priority filter change
  const handlePriorityChange = (e) => {
    onFilterChange({ priority: e.target.value });
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    onFilterChange({ search: e.target.value });
  };

  // Handle sort field change
  const handleSortByChange = (e) => {
    onFilterChange({ sortBy: e.target.value });
  };

  // Handle sort direction toggle
  const handleSortDirectionToggle = () => {
    onFilterChange({ sortDirection: filters.sortDirection === 'asc' ? 'desc' : 'asc' });
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4">
      {/* Filter section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="md:col-span-2">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg 
                className="h-5 w-5 text-gray-400" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor" 
                aria-hidden="true"
              >
                <path 
                  fillRule="evenodd" 
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
            <input
              type="text"
              name="search"
              id="search"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
              placeholder="Search requirements..."
              value={filters.search}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Status filter */}
        <div>
          <select
            id="status-filter"
            name="status-filter"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={filters.status}
            onChange={handleStatusChange}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="inProgress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Priority filter */}
        <div>
          <select
            id="priority-filter"
            name="priority-filter"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={filters.priority}
            onChange={handlePriorityChange}
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Sort and count section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        {/* Count information */}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {filteredCount !== undefined && (
            <>
              Showing <span className="font-medium">{filteredCount}</span> of{' '}
              <span className="font-medium">{totalCount}</span> requirements
            </>
          )}
        </div>

        {/* Sort controls */}
        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          <label htmlFor="sort-by" className="text-sm text-gray-500 dark:text-gray-400">
            Sort by:
          </label>
          <select
            id="sort-by"
            name="sort-by"
            className="block pl-3 pr-10 py-1.5 text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
            value={filters.sortBy}
            onChange={handleSortByChange}
          >
            <option value="priority">Priority</option>
            <option value="createdAt">Date Created</option>
            <option value="title">Title</option>
          </select>
          <button
            type="button"
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={handleSortDirectionToggle}
            title={filters.sortDirection === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
          >
            {filters.sortDirection === 'asc' ? (
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequirementFilterBar;
