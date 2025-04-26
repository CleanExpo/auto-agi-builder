import React, { useState, useRef, useEffect } from 'react';
import { withProtection } from '../components/auth/ProtectedRoute';
import Layout from '../components/layout/Layout';
import ExportMenu from '../components/export/ExportMenu';
import { useProject } from '../contexts/ProjectContext';
import { useAPI } from '../lib/api';

// InfoCard component for displaying labeled information
const InfoCard = ({ label, value }) => (
  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
    <p className="text-lg font-medium text-gray-900 dark:text-white">{value}</p>
  </div>
);

/**
 * Export Page
 * 
 * Provides a central interface for exporting project data in various formats
 * Supports exporting project data, requirements, ROI analysis, and timeline
 */
const ExportPage = () => {
  const { projects, currentProject } = useProject();
  const api = useAPI();
  
  const [selectedProject, setSelectedProject] = useState(null);
  const [exportSection, setExportSection] = useState('project');
  const [exportData, setExportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exportSuccess, setExportSuccess] = useState(null);
  
  const exportPanelRef = useRef(null);
  
  // Set initial project
  useEffect(() => {
    if (currentProject && !selectedProject) {
      setSelectedProject(currentProject);
      fetchProjectData(currentProject.id, exportSection);
    }
  }, [currentProject, selectedProject, exportSection]);
  
  // Fetch project data based on selected section
  const fetchProjectData = async (projectId, section) => {
    if (!projectId) return;
    
    setIsLoading(true);
    setError(null);
    setExportData(null);
    
    try {
      // In a real implementation, this would fetch from the API
      // For demonstration, we'll use mock data
      let data;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      switch (section) {
        case 'project':
          // Project overview data
          data = generateMockProjectData(projectId);
          break;
        case 'requirements':
          // Requirements data
          data = generateMockRequirementsData(projectId);
          break;
        case 'roi':
          // ROI analysis data
          data = generateMockROIData(projectId);
          break;
        case 'timeline':
          // Timeline data
          data = generateMockTimelineData(projectId);
          break;
        default:
          data = generateMockProjectData(projectId);
      }
      
      setExportData(data);
    } catch (err) {
      console.error('Error fetching export data:', err);
      setError('Failed to load export data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle project selection
  const handleProjectChange = (e) => {
    const projectId = e.target.value;
    const project = projects.find(p => p.id === projectId) || null;
    setSelectedProject(project);
    
    if (project) {
      fetchProjectData(project.id, exportSection);
    } else {
      setExportData(null);
    }
  };
  
  // Handle export section change
  const handleSectionChange = (section) => {
    setExportSection(section);
    
    if (selectedProject) {
      fetchProjectData(selectedProject.id, section);
    }
  };
  
  // Handle export start
  const handleExportStart = (type) => {
    setExportSuccess(null);
    console.log(`Starting export as ${type}...`);
  };
  
  // Handle export complete
  const handleExportComplete = (type) => {
    setExportSuccess(`Successfully exported as ${type.toUpperCase()}.`);
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setExportSuccess(null);
    }, 3000);
  };
  
  // Handle export error
  const handleExportError = (error, type) => {
    setError(`Failed to export as ${type.toUpperCase()}: ${error.message}`);
  };
  
  // Mock data generators
  const generateMockProjectData = (projectId) => ({
    id: projectId,
    name: selectedProject?.name || 'Project Name',
    description: 'Comprehensive project details for export',
    client: 'ACME Corporation',
    startDate: '2025-01-15',
    estimatedCompletionDate: '2025-06-30',
    status: 'In Progress',
    progress: 45,
    team: [
      { id: 1, name: 'John Smith', role: 'Project Manager' },
      { id: 2, name: 'Jane Doe', role: 'Lead Developer' },
      { id: 3, name: 'Alice Johnson', role: 'UX Designer' },
      { id: 4, name: 'Bob Wilson', role: 'QA Engineer' }
    ],
    budget: {
      total: 120000,
      spent: 58000,
      remaining: 62000
    },
    risks: [
      { id: 'R1', description: 'Schedule delays due to API integration', impact: 'high', probability: 'medium' },
      { id: 'R2', description: 'Technical complexity in data migration', impact: 'medium', probability: 'high' }
    ],
    notes: 'This project is proceeding according to plan with minor adjustments to the timeline.'
  });
  
  const generateMockRequirementsData = (projectId) => [
    { id: 'REQ-001', name: 'User Authentication', description: 'Secure login and registration system', priority: 'high', status: 'completed', type: 'functional' },
    { id: 'REQ-002', name: 'Data Dashboard', description: 'Interactive dashboard with key metrics', priority: 'high', status: 'in-progress', type: 'functional' },
    { id: 'REQ-003', name: 'Mobile Compatibility', description: 'Responsive design for mobile devices', priority: 'medium', status: 'not-started', type: 'non-functional' },
    { id: 'REQ-004', name: 'Export Functionality', description: 'Allow data export in multiple formats', priority: 'medium', status: 'in-progress', type: 'functional' }
  ];
  
  const generateMockROIData = (projectId) => ({
    summary: {
      initialCost: 150000,
      ongoingCosts: 25000,
      totalBenefits: 450000,
      roi: 200,
      paybackPeriod: 14,
      npv: 235000
    },
    costs: [
      { category: 'Development', amount: 100000, description: 'Software development costs' },
      { category: 'Licensing', amount: 20000, description: 'Third-party software licenses' }
    ],
    benefits: [
      { category: 'Productivity', amount: 200000, description: 'Improved employee productivity' },
      { category: 'Revenue', amount: 150000, description: 'Increased sales revenue' }
    ]
  });
  
  const generateMockTimelineData = (projectId) => ({
    projectStartDate: '2025-01-15',
    projectEndDate: '2025-06-30',
    milestones: [
      { id: 'M1', name: 'Project Kickoff', date: '2025-01-15', completed: true },
      { id: 'M2', name: 'Requirements Approval', date: '2025-02-10', completed: true }
    ],
    tasks: [
      { id: 'T1', name: 'Requirement Gathering', startDate: '2025-01-15', endDate: '2025-02-05', status: 'completed', dependencies: [] },
      { id: 'T2', name: 'System Design', startDate: '2025-02-06', endDate: '2025-03-15', status: 'in-progress', dependencies: ['T1'] }
    ]
  });
  
  // Render section content based on type
  const renderSectionContent = () => {
    if (!exportData) return null;
    
    switch (exportSection) {
      case 'project':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InfoCard label="Project Status" value={exportData.status} />
              <InfoCard label="Progress" value={`${exportData.progress}%`} />
              <InfoCard label="Start Date" value={new Date(exportData.startDate).toLocaleDateString()} />
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Project Description</h3>
              <p className="text-gray-700 dark:text-gray-300">{exportData.description}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Team Members</h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                    {exportData.team.map(member => (
                      <tr key={member.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{member.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{member.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Budget Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoCard label="Total Budget" value={`$${exportData.budget.total.toLocaleString()}`} />
                <InfoCard label="Spent" value={`$${exportData.budget.spent.toLocaleString()}`} />
                <InfoCard label="Remaining" value={`$${exportData.budget.remaining.toLocaleString()}`} />
              </div>
            </div>
          </div>
        );
        
      case 'requirements':
        return (
          <div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                  {exportData.map(requirement => (
                    <tr key={requirement.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{requirement.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{requirement.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          requirement.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                          requirement.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                          'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        }`}>
                          {requirement.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          requirement.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                          requirement.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {requirement.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {requirement.type}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
        
      case 'roi':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InfoCard label="Initial Cost" value={`$${exportData.summary.initialCost.toLocaleString()}`} />
              <InfoCard label="ROI" value={`${exportData.summary.roi}%`} />
              <InfoCard label="Payback Period" value={`${exportData.summary.paybackPeriod} months`} />
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Costs</h3>
              <ul className="space-y-2">
                {exportData.costs.map((cost, index) => (
                  <li key={index} className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <span className="text-gray-700 dark:text-gray-300">{cost.category}</span>
                    <span className="font-medium text-gray-900 dark:text-white">${cost.amount.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Benefits</h3>
              <ul className="space-y-2">
                {exportData.benefits.map((benefit, index) => (
                  <li key={index} className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <span className="text-gray-700 dark:text-gray-300">{benefit.category}</span>
                    <span className="font-medium text-green-600 dark:text-green-400">${benefit.amount.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
        
      case 'timeline':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard label="Project Start" value={new Date(exportData.projectStartDate).toLocaleDateString()} />
              <InfoCard label="Project End" value={new Date(exportData.projectEndDate).toLocaleDateString()} />
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Milestones</h3>
              <ul className="space-y-2">
                {exportData.milestones.map(milestone => (
                  <li key={milestone.id} className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">{milestone.name}</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(milestone.date).toLocaleDateString()}</p>
                    </div>
                    <span className={`self-center px-2 py-1 rounded-full text-xs ${
                      milestone.completed ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                    }`}>
                      {milestone.completed ? 'Completed' : 'Pending'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Tasks</h3>
              <ul className="space-y-2">
                {exportData.tasks.map(task => (
                  <li key={task.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900 dark:text-white">{task.name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                        task.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span>{new Date(task.startDate).toLocaleDateString()} - {new Date(task.endDate).toLocaleDateString()}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
        
      default:
        return <div>No export data available for this section.</div>;
    }
  };
  
  return (
    <Layout title="Export">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Export Manager</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Export project data in various formats including PDF, Excel, CSV, and JSON
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Export Options */}
            <div className="lg:col-span-1 space-y-6">
              {/* Project Selection */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Select Project</h2>
                <select
                  id="project-select"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={selectedProject?.id || ''}
                  onChange={handleProjectChange}
                >
                  <option value="">Select a project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Export Section Selection */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">What to Export</h2>
                <div className="space-y-2">
                  {['project', 'requirements', 'roi', 'timeline'].map(section => (
                    <button
                      key={section}
                      className={`w-full text-left px-4 py-3 rounded-md ${
                        exportSection === section
                          ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-l-4 border-blue-500'
                          : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                      onClick={() => handleSectionChange(section)}
                    >
                      <span className="font-medium capitalize">{section}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Export Format */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Export Format</h2>
                  <ExportMenu
                    data={exportData}
                    projectName={selectedProject?.name}
                    elementRef={exportPanelRef}
                    exportTypes={['pdf', 'excel', 'csv', 'json']}
                    disabled={!exportData || isLoading}
                    onExportStart={handleExportStart}
                    onExportComplete={handleExportComplete}
                    onExportError={handleExportError}
                  />
                </div>
              </div>
            </div>
            
            {/* Right Column - Preview */}
            <div className="lg:col-span-2">
              <div 
                ref={exportPanelRef}
                className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 min-h-[600px]"
              >
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading export data...</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center h-full py-12">
                    <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Error Loading Data</h3>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">{error}</p>
                    <button
                      onClick={() => selectedProject && fetchProjectData(selectedProject.id, exportSection)}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Try Again
                    </button>
                  </div>
                ) : !selectedProject ? (
                  <div className="flex flex-col items-center justify-center h-full py-12">
                    <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No Project Selected</h3>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                      Select a project from the dropdown to generate export data
                    </p>
                  </div>
                ) : !exportData ? (
                  <div className="flex flex-col items-center justify-center h-full py-12">
                    <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No Export Data Available</h3>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                      Please select a different export section or project
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Export Preview: {selectedProject.name}
                      </h2>
                      {exportSuccess && (
                        <div className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-3 py-1 rounded-md text-sm">
                          {exportSuccess}
                        </div>
                      )}
                    </div>
                    
                    {renderSectionContent()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default withProtection(ExportPage);
