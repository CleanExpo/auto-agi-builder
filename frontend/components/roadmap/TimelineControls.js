import React from 'react';
import PropTypes from 'prop-types';

/**
 * TimelineControls Component
 * 
 * Provides controls for adjusting timeline visualization
 * Allows changing timeframe, filtering, and display options
 */
const TimelineControls = ({ 
  timeframe,
  setTimeframe,
  filter,
  setFilter,
  viewMode,
  setViewMode,
  startDate,
  setStartDate,
  className
}) => {
  // Timeframe options
  const timeframeOptions = [
    { id: 'days', name: 'Days' },
    { id: 'weeks', name: 'Weeks' },
    { id: 'months', name: 'Months' }
  ];
  
  // View mode options
  const viewModeOptions = [
    { id: 'gantt', name: 'Gantt Chart', icon: 'view_timeline' },
    { id: 'calendar', name: 'Calendar', icon: 'calendar_month' },
    { id: 'list', name: 'List View', icon: 'view_list' }
  ];
  
  // Filter options
  const filterOptions = [
    { id: 'all', name: 'All Tasks' },
    { id: 'in-progress', name: 'In Progress' },
    { id: 'completed', name: 'Completed' },
    { id: 'not-started', name: 'Not Started' },
    { id: 'delayed', name: 'Delayed' },
    { id: 'on-hold', name: 'On Hold' }
  ];
  
  // Handle date change
  const handleDateChange = (e) => {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      setStartDate(date);
    }
  };
  
  // Format date for input
  const formatDate = (date) => {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    return d.toISOString().split('T')[0];
  };
  
  // Render icon
  const renderIcon = (iconName) => {
    const iconMap = {
      'view_timeline': (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
      ),
      'calendar_month': (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      'view_list': (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      )
    };
    
    return iconMap[iconName] || null;
  };
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 ${className || ''}`}>
      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Timeline Controls</h3>
      
      <div className="space-y-4">
        {/* Timeframe Selection */}
        <div>
          <label htmlFor="timeframe" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Timeframe
          </label>
          <div className="flex space-x-2">
            {timeframeOptions.map(option => (
              <button
                key={option.id}
                onClick={() => setTimeframe(option.id)}
                className={`flex-1 py-2 px-3 text-xs font-medium rounded-md ${
                  timeframe === option.id
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Start Date */}
        <div>
          <label htmlFor="startDate" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Project Start Date
          </label>
          <input
            id="startDate"
            type="date"
            value={formatDate(startDate)}
            onChange={handleDateChange}
            className="w-full py-2 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        
        {/* View Mode */}
        <div>
          <label htmlFor="viewMode" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            View Mode
          </label>
          <div className="flex space-x-2">
            {viewModeOptions.map(option => (
              <button
                key={option.id}
                onClick={() => setViewMode(option.id)}
                className={`flex-1 py-2 px-3 text-xs font-medium rounded-md flex items-center justify-center ${
                  viewMode === option.id
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {option.icon && (
                  <span className="mr-1.5">{renderIcon(option.icon)}</span>
                )}
                {option.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Filter */}
        <div>
          <label htmlFor="filter" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Filter by Status
          </label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full py-2 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {filterOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Additional Controls */}
        <div className="flex space-x-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <button
            className="flex-1 py-2 px-3 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Export Timeline
          </button>
          <button
            className="flex-1 py-2 px-3 text-xs font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

TimelineControls.propTypes = {
  timeframe: PropTypes.oneOf(['days', 'weeks', 'months']).isRequired,
  setTimeframe: PropTypes.func.isRequired,
  filter: PropTypes.string.isRequired,
  setFilter: PropTypes.func.isRequired,
  viewMode: PropTypes.oneOf(['gantt', 'calendar', 'list']).isRequired,
  setViewMode: PropTypes.func.isRequired,
  startDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
  setStartDate: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default TimelineControls;
