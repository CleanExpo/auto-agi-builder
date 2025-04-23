import React, { useMemo } from 'react';
import ChartContainer from './ChartContainer';

/**
 * Project Progress Chart
 * 
 * Displays a line chart showing project progress over time
 */
const ProjectProgressChart = ({ projectData = {}, timeRange = 'month', className }) => {
  // Generate chart data based on project history and time range
  const chartData = useMemo(() => {
    // Handle empty project data
    if (!projectData.history || !projectData.history.length) {
      return { timeline: [], progressData: [], milestones: [] };
    }
    
    const history = [...projectData.history].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    // Determine time periods based on selected range
    const now = new Date();
    let startDate;
    let dateFormat;
    
    switch(timeRange) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        dateFormat = date => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        dateFormat = date => date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        break;
      case 'month':
      default:
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        dateFormat = date => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        break;
    }
    
    // Filter history data by time range
    const filteredHistory = history.filter(item => new Date(item.date) >= startDate);
    
    // Get latest entries if history is empty after filtering
    if (filteredHistory.length === 0 && history.length > 0) {
      filteredHistory.push(history[history.length - 1]);
    }
    
    // Generate timeline and progress data points
    let timeline = [];
    let progressData = [];
    
    filteredHistory.forEach(item => {
      const date = new Date(item.date);
      timeline.push(dateFormat(date));
      progressData.push(item.progress || 0);
    });
    
    // Find milestones within time range
    const milestones = projectData.milestones ? 
      projectData.milestones
        .filter(m => new Date(m.date) >= startDate)
        .map(m => ({
          ...m,
          formattedDate: dateFormat(new Date(m.date))
        })) : [];
    
    return { timeline, progressData, milestones };
  }, [projectData, timeRange]);
  
  // Skip rendering if no data
  if (chartData.timeline.length === 0) {
    return (
      <ChartContainer 
        title="Project Progress" 
        description="Track project completion over time"
        className={className}
      >
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 dark:text-gray-400 text-center">
            No progress data available
          </p>
        </div>
      </ChartContainer>
    );
  }
  
  // Chart configuration
  const chartHeight = 200;
  const chartWidth = '100%';
  const paddingX = 40;
  const paddingY = 30;
  const innerWidth = `calc(100% - ${paddingX * 2}px)`;
  const innerHeight = chartHeight - paddingY * 2;
  
  // Generate points for SVG polyline
  const generatePoints = () => {
    if (chartData.progressData.length === 0) return '';
    
    const points = [];
    const segmentWidth = `calc(${innerWidth} / ${Math.max(chartData.timeline.length - 1, 1)})`;
    
    for (let i = 0; i < chartData.timeline.length; i++) {
      const x = i === 0 ? paddingX : `calc(${paddingX}px + ${segmentWidth} * ${i})`;
      const y = paddingY + (100 - chartData.progressData[i]) / 100 * innerHeight;
      points.push(`${x},${y}`);
    }
    
    return points.join(' ');
  };
  
  return (
    <ChartContainer 
      title="Project Progress" 
      description="Track project completion over time"
      className={className}
      height={`${chartHeight + 80}px`}
    >
      {/* Time range selector */}
      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            className={`px-3 py-1 text-xs font-medium rounded-l-lg ${
              timeRange === 'week' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            Week
          </button>
          <button
            type="button"
            className={`px-3 py-1 text-xs font-medium ${
              timeRange === 'month' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            Month
          </button>
          <button
            type="button"
            className={`px-3 py-1 text-xs font-medium rounded-r-lg ${
              timeRange === 'year' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            Year
          </button>
        </div>
      </div>
      
      {/* Chart */}
      <div className="relative" style={{ height: chartHeight }}>
        <svg width="100%" height={chartHeight}>
          {/* Chart grid */}
          <line x1={paddingX} y1={paddingY} x2={paddingX} y2={chartHeight - paddingY} 
                stroke="#E5E7EB" strokeWidth="1" />
          <line x1={paddingX} y1={chartHeight - paddingY} x2="100%" y2={chartHeight - paddingY} 
                stroke="#E5E7EB" strokeWidth="1" />
          
          {/* Progress line */}
          <polyline
            points={generatePoints()}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {chartData.progressData.map((value, index) => {
            const segmentWidth = `calc(${innerWidth} / ${Math.max(chartData.timeline.length - 1, 1)})`;
            const x = index === 0 ? paddingX : `calc(${paddingX}px + ${segmentWidth} * ${index})`;
            const y = paddingY + (100 - value) / 100 * innerHeight;
            
            return (
              <g key={`point-${index}`}>
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#3B82F6"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                
                {/* Milestone indicators */}
                {chartData.milestones.map((milestone, mIndex) => {
                  if (milestone.formattedDate === chartData.timeline[index]) {
                    return (
                      <g key={`milestone-${mIndex}`}>
                        <circle
                          cx={x}
                          cy={y}
                          r="6"
                          fill="#F59E0B"
                          stroke="#FFFFFF"
                          strokeWidth="2"
                        />
                        <title>{milestone.name}</title>
                      </g>
                    );
                  }
                  return null;
                })}
                
                {/* Tooltip on hover (simplified) */}
                <title>{`${chartData.timeline[index]}: ${value}%`}</title>
              </g>
            );
          })}
        </svg>
        
        {/* Y axis labels */}
        <div className="absolute top-0 left-0 h-full flex flex-col justify-between py-6">
          <span className="text-xs text-gray-500 dark:text-gray-400">100%</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">50%</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">0%</span>
        </div>
      </div>
      
      {/* X axis labels */}
      <div className="flex justify-between px-10 mt-2">
        {chartData.timeline.map((date, index) => (
          <div 
            key={`label-${index}`} 
            className="text-xs text-gray-500 dark:text-gray-400"
            style={{ 
              width: index === 0 || index === chartData.timeline.length - 1 
                ? 'auto' 
                : `${100 / Math.max(chartData.timeline.length, 1)}%` 
            }}
          >
            {chartData.milestones.some(m => m.formattedDate === date) ? (
              <span className="text-amber-500">●</span>
            ) : null}
            {date}
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-end mt-4">
        <div className="flex items-center mr-4">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
          <span className="text-xs text-gray-700 dark:text-gray-300">Progress</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-amber-500 rounded-full mr-1"></div>
          <span className="text-xs text-gray-700 dark:text-gray-300">Milestone</span>
        </div>
      </div>
    </ChartContainer>
  );
};

export default ProjectProgressChart;
