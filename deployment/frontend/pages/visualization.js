import React, { useState, useEffect } from 'react';
import { withProtection } from '../components/auth/ProtectedRoute';
import Layout from '../components/layout/Layout';
import RequirementsByStatusChart from '../components/visualization/RequirementsByStatusChart';
import RequirementsByPriorityChart from '../components/visualization/RequirementsByPriorityChart';
import ProjectProgressChart from '../components/visualization/ProjectProgressChart';
import { useProject, useUI } from '../contexts';
import api from '../lib/api';

/**
 * Project Visualization Page
 * 
 * Displays data visualization dashboards for project metrics and analytics
 */
const VisualizationPage = () => {
  const { currentProject } = useProject();
  const { toast } = useUI();
  
  const [requirements, setRequirements] = useState([]);
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  
  // Fetch project data when current project changes
  useEffect(() => {
    if (currentProject) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [currentProject]);
  
  // Fetch requirements and project data
  const fetchData = async () => {
    if (!currentProject) {
      return;
    }
    
    setLoading(true);
    
    try {
      // In a real implementation, we'd call our API
      // const reqResponse = await api.get(`/projects/${currentProject.id}/requirements`);
      // const projectResponse = await api.get(`/projects/${currentProject.id}`);
      
      // For demo purposes, we'll use mock data
      setRequirements(getMockRequirements());
      setProjectData(getMockProjectData());
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch data';
      toast.error(errorMessage);
      setError(errorMessage);
      
      // Still use mock data for the demo
      setRequirements(getMockRequirements());
      setProjectData(getMockProjectData());
    } finally {
      setLoading(false);
    }
  };
  
  // Mock requirements data
  const getMockRequirements = () => {
    return [
      { id: 'req-1', title: 'User Authentication', description: 'Implement secure login and signup', status: 'completed', priority: 'high', category: 'Security' },
      { id: 'req-2', title: 'Dashboard Overview', description: 'Create main dashboard with KPIs', status: 'completed', priority: 'high', category: 'UI' },
      { id: 'req-3', title: 'Project Management', description: 'Add, edit and delete projects', status: 'inProgress', priority: 'high', category: 'Core' },
      { id: 'req-4', title: 'Requirements Tracking', description: 'Create, assign and track requirements', status: 'inProgress', priority: 'medium', category: 'Core' },
      { id: 'req-5', title: 'Document Analysis', description: 'Extract requirements from documents', status: 'completed', priority: 'medium', category: 'AI' },
      { id: 'req-6', title: 'Prototype Generation', description: 'Generate code from requirements', status: 'completed', priority: 'critical', category: 'AI' },
      { id: 'req-7', title: 'Data Visualization', description: 'Chart-based insights and metrics', status: 'inProgress', priority: 'medium', category: 'Reporting' },
      { id: 'req-8', title: 'Export Functionality', description: 'Export project data in multiple formats', status: 'pending', priority: 'low', category: 'Reporting' },
      { id: 'req-9', title: 'User Roles', description: 'Role-based access control', status: 'pending', priority: 'medium', category: 'Security' },
      { id: 'req-10', title: 'Email Notifications', description: 'Send updates and alerts via email', status: 'pending', priority: 'low', category: 'Communication' },
      { id: 'req-11', title: 'Mobile Responsiveness', description: 'Optimize UI for mobile devices', status: 'pending', priority: 'medium', category: 'UI' },
      { id: 'req-12', title: 'Real-time Collaboration', description: 'Live editing and commenting', status: 'pending', priority: 'high', category: 'Communication' }
    ];
  };
  
  // Mock project data with history for progress chart
  const getMockProjectData = () => {
    const now = new Date();
    
    // Create dates going back about a month
    const dates = [];
    for (let i = 30; i >= 0; i -= 3) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString());
    }
    
    // Start with 15% progress and gradually increase
    const history = dates.map((date, index) => {
      return {
        date,
        progress: Math.min(15 + index * 3, 75) // Gradually increase to 75% (current progress)
      };
    });
    
    // Add some milestone dates
    const milestones = [
      { date: dates[3], name: 'Project Start' },
      { date: dates[7], name: 'Requirements Defined' },
      { date: dates[12], name: 'MVP Release' }
    ];
    
    return {
      name: currentProject?.name || 'Auto AGI Builder',
      description: 'AI-powered software development assistant',
      startDate: dates[0],
      targetCompletionDate: history[history.length - 1].date,
      progress: history[history.length - 1].progress,
      history,
      milestones
    };
  };
  
  // Handle time range change for progress chart
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };
  
  return (
    <Layout title="Data Visualization">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Project Analytics</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {currentProject ? `Visual insights for ${currentProject.name}` : 'Select a project to view analytics'}
            </p>
          </div>
          
          {/* Content */}
          {!currentProject ? (
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 text-center">
              <svg 
                className="mx-auto h-12 w-12 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1} 
                  d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" 
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No project selected</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Please select a project from the sidebar first
              </p>
            </div>
          ) : loading ? (
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 text-center">
              <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading project data...</p>
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 text-center">
              <div className="text-red-500 text-lg mb-2">Error</div>
              <p className="text-red-700 dark:text-red-400">{error}</p>
              <button
                onClick={fetchData}
                className="mt-4 px-4 py-2 bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-100 rounded hover:bg-red-200 dark:hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Project Summary */}
              <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 mb-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Project Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Overall Progress</div>
                    <div className="mt-1 relative pt-1">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-600">
                        <div 
                          style={{ width: `${projectData.progress}%` }} 
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                        ></div>
                      </div>
                      <div className="mt-1 text-lg font-bold text-gray-700 dark:text-gray-300">{projectData.progress}%</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Requirements</div>
                    <div className="flex justify-between items-baseline mt-1">
                      <div className="text-lg font-bold text-gray-700 dark:text-gray-300">{requirements.length}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {requirements.filter(r => r.status === 'completed').length} completed
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Project Started</div>
                    <div className="mt-1 text-lg font-bold text-gray-700 dark:text-gray-300">
                      {new Date(projectData.startDate).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Target Completion</div>
                    <div className="mt-1 text-lg font-bold text-gray-700 dark:text-gray-300">
                      {new Date(projectData.targetCompletionDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Progress Over Time */}
              <div className="mb-6">
                <ProjectProgressChart 
                  projectData={projectData} 
                  timeRange={timeRange} 
                />
              </div>
              
              {/* Requirements Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <RequirementsByStatusChart requirements={requirements} />
                <RequirementsByPriorityChart requirements={requirements} />
              </div>
              
              {/* Additional Metrics (Placeholder) */}
              <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Team Contributions</h2>
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>Team contribution metrics will be implemented in a future update.</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default withProtection(VisualizationPage);
