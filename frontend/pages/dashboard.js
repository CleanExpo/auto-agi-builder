import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/layout/Layout';
import { useAuth, useProject, useUI } from '../contexts';

// Main dashboard component
const Dashboard = () => {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { 
    projects, 
    currentProject, 
    loading: projectsLoading, 
    fetchProjects, 
    hasProjects 
  } = useProject();
  const { openModal } = useUI();
  
  // Fetch projects on component mount
  useEffect(() => {
    if (isAuthenticated && !projectsLoading) {
      fetchProjects();
    }
  }, [isAuthenticated, fetchProjects, projectsLoading]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);
  
  // Show loading state if authentication status is being checked
  if (authLoading || !isAuthenticated) {
    return (
      <Layout title="Loading...">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }
  
  // Handle creating a new project
  const handleCreateProject = () => {
    openModal('project-form', { type: 'create' });
  };
  
  return (
    <Layout title="Dashboard">
      <div className="py-6">
        {/* Welcome section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome, {user?.name || 'User'}!
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Your AI-powered software development assistant
          </p>
        </div>
        
        {/* Dashboard content */}
        {projectsLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : hasProjects ? (
          <DashboardContent 
            projects={projects} 
            currentProject={currentProject} 
            handleCreateProject={handleCreateProject}
          />
        ) : (
          <EmptyDashboard handleCreateProject={handleCreateProject} />
        )}
      </div>
    </Layout>
  );
};

// Dashboard content when user has projects
const DashboardContent = ({ projects, currentProject, handleCreateProject }) => {
  return (
    <div className="space-y-8">
      {/* Quick stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Current project */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Current Project
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {currentProject?.name || 'No project selected'}
                  </div>
                </dd>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              {currentProject ? (
                <Link href={`/projects/${currentProject.id}`} className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
                  View details
                </Link>
              ) : (
                <button 
                  onClick={handleCreateProject}
                  className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
                >
                  Create a project
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Total projects */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Total Projects
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {projects.length}
                  </div>
                </dd>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <Link href="/projects" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
                View all projects
              </Link>
            </div>
          </div>
        </div>
        
        {/* Quick actions */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Quick Actions
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    Get Started
                  </div>
                </dd>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="flex space-x-4 text-sm">
              <button
                onClick={handleCreateProject}
                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
              >
                New Project
              </button>
              {currentProject && (
                <>
                  <span className="text-gray-500 dark:text-gray-400">|</span>
                  <Link href="/documents" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
                    Import Document
                  </Link>
                  <span className="text-gray-500 dark:text-gray-400">|</span>
                  <Link href="/requirements" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
                    Requirements
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Feature cards */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Key Features</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Document Analysis */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
            <div className="p-5">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Document Analysis
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Import and analyze project documents to extract requirements and specifications.
                  </p>
                  <div className="mt-3">
                    <Link href="/documents" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
                      Import documents →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Requirements Management */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
            <div className="p-5">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Requirements Management
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Organize, prioritize, and track project requirements through the development lifecycle.
                  </p>
                  <div className="mt-3">
                    <Link href="/requirements" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
                      Manage requirements →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Prototype Generation */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
            <div className="p-5">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Prototype Generation
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Generate functional prototypes based on your project requirements.
                  </p>
                  <div className="mt-3">
                    <Link href="/prototype" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
                      Generate prototype →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Device Preview */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
            <div className="p-5">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Device Preview
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Preview your application across multiple devices and screen sizes.
                  </p>
                  <div className="mt-3">
                    <Link href="/device-preview" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
                      Preview devices →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* ROI Calculator */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
            <div className="p-5">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    ROI Calculator
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Calculate the return on investment for your software project.
                  </p>
                  <div className="mt-3">
                    <Link href="/roi" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
                      Calculate ROI →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Project Roadmap */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
            <div className="p-5">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Project Roadmap
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Visualize your project timeline and milestone planning.
                  </p>
                  <div className="mt-3">
                    <Link href="/roadmap" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
                      View roadmap →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Projects</h2>
          <Link href="/projects" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
            View all
          </Link>
        </div>
        
        {projects.length > 0 && (
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">
                    Project Name
                  </th>
                  <th scope="col" className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white sm:table-cell">
                    Client
                  </th>
                  <th scope="col" className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white lg:table-cell">
                    Due Date
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {projects.slice(0, 5).map((project) => (
                  <tr key={project.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                      {project.name}
                    </td>
                    <td className="hidden whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400 sm:table-cell">
                      {project.clientName || '-'}
                    </td>
                    <td className="hidden whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400 lg:table-cell">
                      {project.expectedDeliveryDate 
                        ? new Date(project.expectedDeliveryDate).toLocaleDateString() 
                        : '-'}
                    </td>
                    <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <Link href={`/projects/${project.id}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-500">
                        View<span className="sr-only">, {project.name}</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Empty state when user has no projects
const EmptyDashboard = ({ handleCreateProject }) => {
  return (
    <div className="rounded-lg bg-white dark:bg-gray-800 overflow-hidden shadow divide-y divide-gray-200 dark:divide-gray-700">
      <div className="px-4 py-5 sm:p-6">
        <div className="text-center">
          <svg 
            className="mx-auto h-12 w-12 text-gray-400" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1} 
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No projects</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by creating a new project
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={handleCreateProject}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg 
                className="-ml-1 mr-2 h-5 w-5" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" 
                  clipRule="evenodd" 
                />
              </svg>
              New Project
            </button>
          </div>
        </div>
      </div>
      
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Get Started with Auto AGI Builder</h2>
        
        <div className="space-y-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                <span className="text-xl font-bold">1</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Create a project</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Start by creating a new project with basic information about your software development initiative.
              </p>
            </div>
          </div>
          
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                <span className="text-xl font-bold">2</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Import documents</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Upload existing project documentation to extract requirements and specifications automatically.
              </p>
            </div>
          </div>
          
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                <span className="text-xl font-bold">3</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Refine requirements</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Review, organize, and prioritize project requirements for clarity and completeness.
              </p>
            </div>
          </div>
          
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                <span className="text-xl font-bold">4</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Generate prototype</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Use AI to transform your requirements into working prototypes that you can interact with.
              </p>
            </div>
          </div>
          
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                <span className="text-xl font-bold">5</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">View across devices</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Test your application on different devices and screen sizes to ensure a consistent experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
