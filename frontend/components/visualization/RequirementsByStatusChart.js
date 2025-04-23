import React, { useMemo } from 'react';
import ChartContainer from './ChartContainer';

/**
 * Requirements By Status Chart
 * 
 * Displays a donut chart showing the distribution of requirements by status
 */
const RequirementsByStatusChart = ({ requirements = [], className }) => {
  // Calculate stats for requirements by status
  const stats = useMemo(() => {
    const statusCounts = requirements.reduce((acc, req) => {
      const status = req.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    const total = requirements.length;
    
    // Define all statuses with their display names and colors
    const allStatuses = {
      pending: { name: 'Pending', color: '#9CA3AF' }, // gray-400
      inProgress: { name: 'In Progress', color: '#3B82F6' }, // blue-500
      completed: { name: 'Completed', color: '#10B981' }, // green-500
      rejected: { name: 'Rejected', color: '#EF4444' }, // red-500
      delayed: { name: 'Delayed', color: '#F59E0B' }, // amber-500
      unknown: { name: 'Unknown', color: '#6B7280' }, // gray-500
    };
    
    // Create data for chart
    const chartData = Object.entries(allStatuses).map(([key, details]) => ({
      id: key,
      name: details.name,
      count: statusCounts[key] || 0,
      percentage: total ? Math.round((statusCounts[key] || 0) * 100 / total) : 0,
      color: details.color
    })).filter(item => item.count > 0);
    
    return { chartData, total };
  }, [requirements]);
  
  // Calculate SVG parameters for donut chart
  const svgSize = 200;
  const donutWidth = 40;
  const radius = svgSize / 2;
  const innerRadius = radius - donutWidth;
  
  // Skip rendering if no data
  if (stats.total === 0) {
    return (
      <ChartContainer 
        title="Requirements by Status" 
        description="Distribution of requirements across different statuses"
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
  
  // Calculate arc segments for donut chart
  let currentAngle = 0;
  const segments = stats.chartData.map(item => {
    const angle = (item.percentage / 100) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    const endAngle = currentAngle;
    
    const startRadians = (startAngle - 90) * (Math.PI / 180);
    const endRadians = (endAngle - 90) * (Math.PI / 180);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const outerStartX = radius + radius * Math.cos(startRadians);
    const outerStartY = radius + radius * Math.sin(startRadians);
    const outerEndX = radius + radius * Math.cos(endRadians);
    const outerEndY = radius + radius * Math.sin(endRadians);
    
    const innerStartX = radius + innerRadius * Math.cos(endRadians);
    const innerStartY = radius + innerRadius * Math.sin(endRadians);
    const innerEndX = radius + innerRadius * Math.cos(startRadians);
    const innerEndY = radius + innerRadius * Math.sin(startRadians);
    
    return {
      ...item,
      path: `
        M ${outerStartX},${outerStartY}
        A ${radius},${radius} 0 ${largeArcFlag},1 ${outerEndX},${outerEndY}
        L ${innerStartX},${innerStartY}
        A ${innerRadius},${innerRadius} 0 ${largeArcFlag},0 ${innerEndX},${innerEndY}
        Z
      `,
      angle,
      startAngle,
      endAngle,
      midAngle: startAngle + angle / 2,
    };
  });
  
  // Calculate label positions
  const labels = segments.map(segment => {
    const labelRadians = (segment.midAngle - 90) * (Math.PI / 180);
    const labelRadius = radius - donutWidth / 2;
    const x = radius + labelRadius * Math.cos(labelRadians);
    const y = radius + labelRadius * Math.sin(labelRadians);
    
    // Only show label if segment is large enough
    const showLabel = segment.angle > 15;
    
    return {
      ...segment,
      labelX: x,
      labelY: y,
      showLabel
    };
  });
  
  return (
    <ChartContainer 
      title="Requirements by Status" 
      description="Distribution of requirements across different statuses"
      className={className}
    >
      <div className="flex flex-col items-center justify-center h-full">
        {/* SVG donut chart */}
        <div className="relative">
          <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
            {segments.map((segment, index) => (
              <path
                key={segment.id}
                d={segment.path}
                fill={segment.color}
                stroke="#ffffff"
                strokeWidth="1"
              />
            ))}
            {labels.map((label, index) => (
              label.showLabel && (
                <text
                  key={`label-${label.id}`}
                  x={label.labelX}
                  y={label.labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="bold"
                >
                  {label.percentage}%
                </text>
              )
            ))}
            <circle cx={radius} cy={radius} r={innerRadius} fill="transparent" />
          </svg>
          
          {/* Center text showing total */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.total}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-2">
          {stats.chartData.map(item => (
            <div key={item.id} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
              <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                ({item.count})
              </span>
            </div>
          ))}
        </div>
      </div>
    </ChartContainer>
  );
};

export default RequirementsByStatusChart;
