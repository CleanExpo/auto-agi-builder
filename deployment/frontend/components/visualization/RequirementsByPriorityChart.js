import React, { useMemo } from 'react';
import ChartContainer from './ChartContainer';

/**
 * Requirements By Priority Chart
 * 
 * Displays a bar chart showing the distribution of requirements by priority level
 */
const RequirementsByPriorityChart = ({ requirements = [], className }) => {
  // Calculate stats for requirements by priority
  const stats = useMemo(() => {
    const priorityCounts = requirements.reduce((acc, req) => {
      const priority = req.priority || 'unknown';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {});
    
    // Define all priorities with their display names and colors
    // Order from highest to lowest priority for display
    const allPriorities = {
      critical: { name: 'Critical', color: '#DC2626' }, // red-600
      high: { name: 'High', color: '#EA580C' }, // orange-600
      medium: { name: 'Medium', color: '#D97706' }, // amber-600
      low: { name: 'Low', color: '#65A30D' }, // lime-600
      trivial: { name: 'Trivial', color: '#059669' }, // emerald-600
      unknown: { name: 'Unknown', color: '#6B7280' }, // gray-500
    };
    
    // Calculate max count for scaling
    const maxCount = Math.max(...Object.values(priorityCounts), 0);
    
    // Create data for chart in priority order
    const chartData = Object.entries(allPriorities).map(([key, details]) => ({
      id: key,
      name: details.name,
      count: priorityCounts[key] || 0,
      percentage: maxCount ? Math.round((priorityCounts[key] || 0) * 100 / maxCount) : 0,
      color: details.color
    })).filter(item => item.count > 0);
    
    return { chartData, maxCount };
  }, [requirements]);
  
  // Skip rendering if no data
  if (stats.chartData.length === 0) {
    return (
      <ChartContainer 
        title="Requirements by Priority" 
        description="Distribution of requirements across priority levels"
        className={className}
      >
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 dark:text-gray-400 text-center">
            No requirements data available
          </p>
        </div>
      </ChartContainer>
    );
  }
  
  // Chart dimensions
  const chartHeight = 220;
  const barHeight = 24;
  const barGap = 12;
  const labelWidth = 70;
  const countWidth = 40;
  const maxBarWidth = 100; // Percentage of available width
  
  return (
    <ChartContainer 
      title="Requirements by Priority" 
      description="Distribution of requirements across priority levels"
      className={className}
    >
      <div className="flex flex-col h-full justify-center">
        {/* Bars */}
        <div className="space-y-3">
          {stats.chartData.map((item, index) => (
            <div key={item.id} className="flex items-center">
              {/* Bar label */}
              <div className="w-16 mr-3 text-right">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {item.name}
                </span>
              </div>
              
              {/* Bar */}
              <div className="flex-1 relative h-6">
                <div 
                  className="absolute top-0 left-0 h-full rounded"
                  style={{ 
                    width: `${item.percentage}%`, 
                    maxWidth: `${maxBarWidth}%`,
                    backgroundColor: item.color 
                  }}
                >
                  {/* Show count inside bar if wide enough, otherwise outside */}
                  {item.percentage > 20 ? (
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-medium text-white">
                      {item.count}
                    </span>
                  ) : (
                    <span className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 text-xs font-medium text-gray-600 dark:text-gray-400">
                      {item.count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* X-axis */}
        <div className="mt-6 pl-20 pr-4">
          <div className="flex justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">0</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {stats.maxCount}
            </span>
          </div>
          <div className="h-px bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </ChartContainer>
  );
};

export default RequirementsByPriorityChart;
