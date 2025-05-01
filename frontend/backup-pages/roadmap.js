import React, { useState, useEffect } from 'react';
import { withProtection } from '../components/auth/ProtectedRoute';
import Layout from '../components/layout/Layout';
import ProjectSelector from '../components/roadmap/ProjectSelector';
import TimelineControls from '../components/roadmap/TimelineControls';
import RoadmapVisualizer from '../components/roadmap/RoadmapVisualizer';
import { useProject } from '../contexts/ProjectContext';
import { useAPI } from '../lib/api';

/**
 * Roadmap Page
 * 
 * Project timeline visualization showing tasks, milestones, and dependencies
 * Allows for project planning and progress tracking
 */
const RoadmapPage = () => {
  // State for selected project and visualization controls
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [timeframe, setTimeframe] = useState('months');
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('gantt');
  const [startDate, setStartDate] = useState(new Date());
  
  // Tasks and milestones data
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Access project context and API
  const { projects, currentProject } = useProject();
  const api = useAPI();
  
  // Set initial project when component mounts
  useEffect(() => {
    if (currentProject && currentProject.id && !selectedProjectId) {
      setSelectedProjectId(currentProject.id);
    }
  }, [currentProject, selectedProjectId]);
  
  // Fetch project timeline data when selected project changes
  useEffect(() => {
    if (!selectedProjectId) return;
    
    const fetchTimelineData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // In a real implementation, this would fetch from the API
        // For now, we'll use dummy data for demonstration
        
        // Example API calls would look like:
        // const tasksResponse = await api.get(`/api/v1/projects/${selectedProjectId}/tasks`);
        // const milestonesResponse = await api.get(`/api/v1/projects/${selectedProjectId}/milestones`);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate example tasks and milestones
        const dummyTasks = generateDummyTasks(selectedProjectId);
        const dummyMilestones = generateDummyMilestones(selectedProjectId);
        
        setTasks(dummyTasks);
        setMilestones(dummyMilestones);
      } catch (err) {
        console.error('Error fetching timeline data:', err);
        setError('Failed to load timeline data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTimelineData();
  }, [selectedProjectId, api]);
  
  // Filter tasks based on status filter
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });
  
  // Handle project selection
  const handleProjectSelect = (projectId) => {
    if (projectId !== selectedProjectId) {
      setSelectedProjectId(projectId);
    }
  };
  
  // Generate dummy tasks for demonstration
  const generateDummyTasks = (projectId) => {
    const statuses = ['not-started', 'in-progress', 'completed', 'delayed', 'on-hold'];
    const taskTypes = ['Development', 'Design', 'Testing', 'Documentation', 'Planning'];
    const assignees = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams', 'System'];
    
    // Set project start date
    const projectStartDate = new Date();
    projectStartDate.setMonth(projectStartDate.getMonth() - 1);
    setStartDate(projectStartDate);
    
    // Generate 15-20 tasks with realistic data
    const numberOfTasks = 15 + Math.floor(Math.random() * 6);
    const tasks = [];
    
    for (let i = 1; i <= numberOfTasks; i++) {
      // Generate random properties
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const category = taskTypes[Math.floor(Math.random() * taskTypes.length)];
      const assignee = assignees[Math.floor(Math.random() * assignees.length)];
      const duration = 1 + Math.floor(Math.random() * 4); // 1-4 months duration
      const startOffset = Math.floor(Math.random() * 6); // 0-5 months from project start
      
      // Generate task dates
      const taskStartDate = new Date(projectStartDate);
      taskStartDate.setMonth(taskStartDate.getMonth() + startOffset);
      
      const taskEndDate = new Date(taskStartDate);
      taskEndDate.setMonth(taskEndDate.getMonth() + duration);
      
      // Generate dependencies (some tasks depend on previous tasks)
      const dependencies = [];
      if (i > 1 && Math.random() > 0.7) {
        const dependencyCount = 1 + Math.floor(Math.random() * 2);
        for (let j = 0; j < dependencyCount; j++) {
          const dependOnId = Math.floor(Math.random() * (i - 1)) + 1;
          if (!dependencies.includes(`T${dependOnId}`)) {
            dependencies.push(`T${dependOnId}`);
          }
        }
      }
      
      // Calculate progress based on status
      let progress = 0;
      if (status === 'completed') {
        progress = 100;
      } else if (status === 'in-progress') {
        progress = 25 + Math.floor(Math.random() * 50); // 25-74%
      } else if (status === 'not-started') {
        progress = 0;
      } else if (status === 'delayed') {
        progress = 10 + Math.floor(Math.random() * 40); // 10-49%
      } else if (status === 'on-hold') {
        progress = 25 + Math.floor(Math.random() * 50); // 25-74%
      }
      
      // Create task object
      tasks.push({
        id: `T${i}`,
        name: `Task ${i}: ${category} Task`,
        description: `This is a ${status.replace('-', ' ')} ${category.toLowerCase()} task with ${duration} month duration.`,
        status,
        category,
        assignee,
        startDate: taskStartDate.toISOString(),
        endDate: status === 'completed' ? taskEndDate.toISOString() : null,
        estimatedEndDate: taskEndDate.toISOString(),
        dependencies,
        progress
      });
    }
    
    return tasks;
  };
  
  // Generate dummy milestones for demonstration
  const generateDummyMilestones = (projectId) => {
    // Set project start date (same as in tasks)
    const projectStartDate = new Date();
    projectStartDate.setMonth(projectStartDate.getMonth() - 1);
    
    // Generate 3-5 milestones
    const numberOfMilestones = 3 + Math.floor(Math.random() * 3);
    const milestones = [];
    
    for (let i = 1; i <= numberOfMilestones; i++) {
      // Generate milestone date
      const monthOffset = Math.floor((i / numberOfMilestones) * 10); // Spread milestones across 10 months
      const milestoneDate = new Date(projectStartDate);
      milestoneDate.setMonth(milestoneDate.getMonth() + monthOffset);
      
      // Determine if milestone is completed
      const isCompleted = monthOffset <= 2; // First few milestones are completed
      
      // Create milestone object
      milestones.push({
        id: `M${i}`,
        name: `Milestone ${i}`,
        description: `Project milestone ${i} - ${isCompleted ? 'Completed' : 'Upcoming'}`,
        date: milestoneDate.toISOString(),
        completed: isCompleted
      });
    }
    
    return milestones;
  };
  
  // Find the selected project name
  const getSelectedProjectName = () => {
    if (!selectedProjectId || !projects) return 'Select a Project';
    
    const selectedProject = projects.find(p => p.id === selectedProjectId);
    return selectedProject ? selectedProject.name : 'Unknown Project';
  };
  
  return (
    <Layout title="Project Roadmap">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Project Roadmap</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Visualize project timeline, milestones, and task dependencies
            </p>
          </div>
          
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Project Selector */}
              <ProjectSelector
                selectedProjectId={selectedProjectId}
                onProjectSelect={handleProjectSelect}
              />
              
              {/* Timeline Controls */}
              <TimelineControls
                timeframe={timeframe}
                setTimeframe={setTimeframe}
                filter={filter}
                setFilter={setFilter}
                viewMode={viewMode}
                setViewMode={setViewMode}
                startDate={startDate}
                setStartDate={setStartDate}
              />
            </div>
            
            {/* Main Visualization Area */}
            <div className="lg:col-span-3">
              {/* Selected Project Header */}
              <div className="mb-4 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    {getSelectedProjectName()}
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Share
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Visualization Area */}
              {isLoading ? (
                // Loading state
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center justify-center min-h-[500px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Loading timeline data...</p>
                </div>
              ) : error ? (
                // Error state
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center justify-center min-h-[500px]">
                  <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Error Loading Timeline</h3>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">{error}</p>
                  <button
                    onClick={() => handleProjectSelect(selectedProjectId)}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Try Again
                  </button>
                </div>
              ) : !selectedProjectId ? (
                // No project selected
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center justify-center min-h-[500px]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No Project Selected</h3>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">
                    Select a project from the sidebar to view its timeline
                  </p>
                </div>
              ) : (
                // Timeline visualization
                <RoadmapVisualizer
                  tasks={filteredTasks}
                  milestones={milestones}
                  timeframe={timeframe}
                  startDate={startDate}
                />
              )}
              
              {/* Task Summary */}
              {selectedProjectId && !isLoading && !error && filteredTasks.length > 0 && (
                <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Task Summary</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {/* Total Tasks */}
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Total Tasks</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">{tasks.length}</div>
                    </div>
                    
                    {/* Completed */}
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-xs text-green-800 dark:text-green-300">Completed</div>
                      <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                        {tasks.filter(t => t.status === 'completed').length}
                      </div>
                    </div>
                    
                    {/* In Progress */}
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-xs text-blue-800 dark:text-blue-300">In Progress</div>
                      <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                        {tasks.filter(t => t.status === 'in-progress').length}
                      </div>
                    </div>
                    
                    {/* Delayed */}
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="text-xs text-red-800 dark:text-red-300">Delayed</div>
                      <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                        {tasks.filter(t => t.status === 'delayed').length}
                      </div>
                    </div>
                    
                    {/* Not Started */}
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Not Started</div>
                      <div className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                        {tasks.filter(t => t.status === 'not-started').length}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default withProtection(RoadmapPage);
