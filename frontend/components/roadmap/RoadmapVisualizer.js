import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, Brush, LabelList
} from 'recharts';

/**
 * RoadmapVisualizer Component
 * 
 * Displays project timeline in a Gantt chart format
 * Visualizes tasks, dependencies, milestones, and progress
 */
const RoadmapVisualizer = ({ 
  tasks = [],
  milestones = [],
  timeframe = 'months',
  startDate = new Date(),
  className
}) => {
  const containerRef = useRef(null);
  const [chartWidth, setChartWidth] = useState(0);
  const [processedData, setProcessedData] = useState([]);
  const [processedMilestones, setProcessedMilestones] = useState([]);
  
  // Task status colors
  const statusColors = {
    'not-started': '#9CA3AF',
    'in-progress': '#3B82F6',
    'completed': '#10B981',
    'delayed': '#EF4444',
    'on-hold': '#F59E0B'
  };
  
  // Process task data for the Gantt chart
  useEffect(() => {
    if (!tasks.length) return;
    
    // Define the project start date
    const projectStart = startDate instanceof Date ? startDate : new Date(startDate);
    
    // Function to calculate duration based on timeframe
    const calculateDuration = (start, end) => {
      if (!start || !end) return 0;
      
      const startDate = new Date(start);
      const endDate = new Date(end);
      
      const diffTime = Math.abs(endDate - startDate);
      
      if (timeframe === 'days') {
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      } else if (timeframe === 'weeks') {
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
      } else {
        // Default to months
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
      }
    };
    
    // Function to calculate the start position based on project start
    const calculateStartPosition = (taskStart) => {
      if (!taskStart) return 0;
      
      const taskStartDate = new Date(taskStart);
      const diffTime = Math.abs(taskStartDate - projectStart);
      
      if (timeframe === 'days') {
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      } else if (timeframe === 'weeks') {
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
      } else {
        // Default to months
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
      }
    };
    
    // Process tasks for the Gantt chart
    const processed = tasks.map(task => {
      const startPosition = calculateStartPosition(task.startDate);
      const duration = calculateDuration(task.startDate, task.endDate || task.estimatedEndDate);
      const completionPercentage = task.progress || 0;
      
      return {
        id: task.id,
        name: task.name,
        category: task.category || 'Development',
        assignee: task.assignee || 'Unassigned',
        status: task.status || 'not-started',
        startPosition,
        duration,
        completionPercentage,
        actualStartDate: task.startDate,
        actualEndDate: task.endDate,
        estimatedEndDate: task.estimatedEndDate,
        dependencies: task.dependencies || [],
        description: task.description || '',
        fill: statusColors[task.status] || statusColors['not-started']
      };
    });
    
    // Sort tasks by start position
    processed.sort((a, b) => {
      if (a.startPosition !== b.startPosition) {
        return a.startPosition - b.startPosition;
      }
      return a.duration - b.duration;
    });
    
    setProcessedData(processed);
    
    // Process milestones
    if (milestones.length) {
      const processedMilestones = milestones.map(milestone => ({
        id: milestone.id,
        name: milestone.name,
        position: calculateStartPosition(milestone.date),
        date: milestone.date,
        description: milestone.description || '',
        completed: milestone.completed || false
      }));
      
      setProcessedMilestones(processedMilestones);
    }
  }, [tasks, milestones, timeframe, startDate]);
  
  // Update chart width when container resizes
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateWidth = () => {
      if (containerRef.current) {
        setChartWidth(containerRef.current.offsetWidth);
      }
    };
    
    // Initial update
    updateWidth();
    
    // Add resize listener
    window.addEventListener('resize', updateWidth);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, [containerRef]);
  
  // Calculate the maximum duration for X-axis scale
  const maxDuration = processedData.reduce((max, task) => {
    return Math.max(max, task.startPosition + task.duration);
  }, 0);
  
  // Generate X-axis ticks
  const generateTicks = () => {
    const ticks = [];
    for (let i = 0; i <= maxDuration; i++) {
      ticks.push(i);
    }
    return ticks;
  };
  
  // Format X-axis labels based on timeframe
  const formatXAxis = (value) => {
    if (!value && value !== 0) return '';
    
    const date = new Date(startDate);
    
    if (timeframe === 'days') {
      date.setDate(date.getDate() + value);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (timeframe === 'weeks') {
      date.setDate(date.getDate() + (value * 7));
      return `W${value + 1}`;
    } else {
      // Default to months
      date.setMonth(date.getMonth() + value);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
  };
  
  // Custom tooltip content
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white">{data.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{data.description}</p>
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <span className="text-gray-500 dark:text-gray-400">Status:</span>
              <span className="font-medium text-gray-900 dark:text-white capitalize">{data.status.replace('-', ' ')}</span>
              
              <span className="text-gray-500 dark:text-gray-400">Start:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {data.actualStartDate ? new Date(data.actualStartDate).toLocaleDateString() : 'Not started'}
              </span>
              
              <span className="text-gray-500 dark:text-gray-400">End:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {data.actualEndDate ? new Date(data.actualEndDate).toLocaleDateString() : 
                 data.estimatedEndDate ? new Date(data.estimatedEndDate).toLocaleDateString() + ' (est.)' : 'Not set'}
              </span>
              
              <span className="text-gray-500 dark:text-gray-400">Duration:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {data.duration} {timeframe}
              </span>
              
              <span className="text-gray-500 dark:text-gray-400">Progress:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {data.completionPercentage}%
              </span>
              
              <span className="text-gray-500 dark:text-gray-400">Assignee:</span>
              <span className="font-medium text-gray-900 dark:text-white">{data.assignee}</span>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  // Render milestone markers
  const renderMilestones = () => {
    if (!processedMilestones.length) return null;
    
    return processedMilestones.map(milestone => (
      <div 
        key={milestone.id}
        className="absolute top-0 transform -translate-x-1/2"
        style={{ 
          left: `${(milestone.position / maxDuration) * 100}%`,
          height: `${(processedData.length * 50) + 50}px`
        }}
      >
        <div className="flex flex-col items-center">
          <div className={`w-4 h-4 transform rotate-45 ${
            milestone.completed ? 'bg-green-500' : 'bg-yellow-500'
          }`}></div>
          <div className="h-full border-dashed border-l border-gray-300 dark:border-gray-600"></div>
        </div>
        <div className="absolute top-4 transform -translate-x-1/2 -translate-y-full bg-white dark:bg-gray-800 p-1 rounded text-xs whitespace-nowrap">
          {milestone.name}
        </div>
      </div>
    ));
  };
  
  // If no tasks, display empty state
  if (!processedData.length) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className || ''}`}>
        <div className="text-center py-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No timeline data</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Add tasks to your project to visualize the timeline.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-2 sm:p-4 ${className || ''}`} ref={containerRef}>
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Project Timeline</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Visualizing {processedData.length} tasks across {maxDuration} {timeframe}
        </p>
      </div>
      
      <div className="relative mt-4">
        {/* Milestones */}
        {renderMilestones()}
        
        {/* Gantt Chart */}
        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={processedData}
              layout="vertical"
              margin={{ top: 20, right: 50, left: 150, bottom: 20 }}
              barGap={0}
              barSize={20}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number"
                domain={[0, maxDuration]}
                ticks={generateTicks()}
                tickFormatter={formatXAxis}
                label={{ value: timeframe, position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                type="category"
                dataKey="name"
                tick={{ fontSize: 12 }}
                width={150}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Brush dataKey="name" height={30} stroke="#8884d8" />
              <Bar 
                dataKey="duration" 
                name="Duration" 
                stackId="a" 
                fill="#8884d8" 
                minPointSize={2}
                background={{ fill: '#eee' }}
                barSize={20}
              >
                <LabelList 
                  dataKey="name" 
                  position="insideLeft" 
                  style={{ fill: '#fff', fontSize: 10 }} 
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center">
        {Object.entries(statusColors).map(([status, color]) => (
          <div key={status} className="flex items-center">
            <div 
              className="w-4 h-4 mr-2 rounded"
              style={{ backgroundColor: color }}
            ></div>
            <span className="text-xs text-gray-700 dark:text-gray-300 capitalize">
              {status.replace('-', ' ')}
            </span>
          </div>
        ))}
        
        {processedMilestones.length > 0 && (
          <>
            <div className="flex items-center">
              <div className="w-4 h-4 mr-2 transform rotate-45 bg-yellow-500"></div>
              <span className="text-xs text-gray-700 dark:text-gray-300">Pending Milestone</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 mr-2 transform rotate-45 bg-green-500"></div>
              <span className="text-xs text-gray-700 dark:text-gray-300">Completed Milestone</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

RoadmapVisualizer.propTypes = {
  tasks: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    category: PropTypes.string,
    assignee: PropTypes.string,
    status: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    estimatedEndDate: PropTypes.string,
    progress: PropTypes.number,
    dependencies: PropTypes.arrayOf(PropTypes.string),
    description: PropTypes.string
  })),
  milestones: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    description: PropTypes.string,
    completed: PropTypes.bool
  })),
  timeframe: PropTypes.oneOf(['days', 'weeks', 'months']),
  startDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  className: PropTypes.string
};

export default RoadmapVisualizer;
