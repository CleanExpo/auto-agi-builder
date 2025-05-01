import React from 'react';
import { useTheme } from '../../contexts/UIContext';

/**
 * Chart Container Component
 * 
 * Wrapper for visualization charts with consistent styling and responsive layout
 */
const ChartContainer = ({ title, description, children, className, height = '300px' }) => {
  const { darkMode } = useTheme();
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
      <div className="p-4" style={{ height }}>
        {children}
      </div>
    </div>
  );
};

export default ChartContainer;
