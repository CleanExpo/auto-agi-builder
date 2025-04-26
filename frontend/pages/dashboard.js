import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

// Import project context
import { useProject } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';

// Import components
import ProjectCard from '../components/projects/ProjectCard';

/**
 * Dashboard component
 * Main landing page after user login, showing projects and stats
 */
export default function Dashboard() {
  const router = useRouter();
  const { projects, loading, error, fetchProjects } = useProject();
  const { user } = useAuth();
  
  // Local state
  const [view, setView] = useState('grid');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updatedAt');

  // Sample stats data (in a real app, this would come from an API)
  const stats = {
    totalProjects: projects?.length || 0,
    activeProjects: projects?.filter(p => p.status === 'In Progress').length || 0,
    completedRequirements: 123, // Would be calculated from real data
    generatedPrototypes: 8, // Would be calculated from real data
  };

  // Fetch projects on component mount
  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user, fetchProjects]);

  // Filter and sort projects
  const filteredProjects = React.useMemo(() => {
    if (!projects) return [];
    
    // Apply filter
    let result = projects;
    if (filter !== 'all') {
      result = result.filter(project => project.status === filter);
    }
    
    // Apply sorting
    result = [...result].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'createdAt') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
    
    return result;
  }, [projects, filter, sortBy]);

  // Handle creating a new project
  const handleCreateProject = () => {
    router.push('/projects/new');
  };

  return (
    <>
      <Head>
        <title>Dashboard | Auto AGI Builder</title>
        <meta name="description" content="Manage your AI-powered software projects" />
      </Head>
      
      <main className="dashboard-container p-6">
        {/* Welcome Section */}
        <section className="welcome-section mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user?.name || 'Developer'}!
              </h1>
              <p className="text-gray-600">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <button
                onClick={handleCreateProject}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                New Project
              </button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Projects */}
            <div className="stat-card bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Projects</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalProjects}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Active Projects */}
            <div className="stat-card bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Active Projects</p>
                  <p className="text-3xl font-bold mt-1">{stats.activeProjects}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Completed Requirements */}
            <div className="stat-card bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Requirements</p>
                  <p className="text-3xl font-bold mt-1">{stats.completedRequirements}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Generated Prototypes */}
            <div className="stat-card bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Prototypes</p>
                  <p className="text-3xl font-bold mt-1">{stats.generatedPrototypes}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section className="projects-section mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Your Projects</h2>
            
            <div className="flex space-x-2">
              {/* View toggle */}
              <div className="view-toggle bg-gray-100 rounded-lg p-1 flex">
                <button
                  onClick={() => setView('grid')}
                  className={`p-2 rounded ${view === 'grid' ? 'bg-white shadow' : ''}`}
                  aria-label="Grid view"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-2 rounded ${view === 'list' ? 'bg-white shadow' : ''}`}
                  aria-label="List view"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
              
              {/* Filter dropdown */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Projects</option>
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
              
              {/* Sort dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="updatedAt">Recently Updated</option>
                <option value="createdAt">Recently Created</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>
          
          {/* Projects grid/list */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-lg text-red-800">
              <p>Error loading projects: {error}</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-lg font-semibold mb-2">No projects found</h3>
              <p className="text-gray-600 mb-4">
                {filter !== 'all' 
                  ? `You don't have any ${filter.toLowerCase()} projects.` 
                  : "You haven't created any projects yet."}
              </p>
              <button
                onClick={handleCreateProject}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Create Your First Project
              </button>
            </div>
          ) : (
            <div className={`grid ${view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'grid-cols-1 gap-4'}`}>
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </section>
        
        {/* Recent Activity Section */}
        <section className="recent-activity-section">
          <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
          
          {/* In a real app, this would be populated from an API */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <ul className="divide-y divide-gray-200">
              <li className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">You created a new project: <span className="text-indigo-600">E-commerce Platform</span></p>
                    <p className="text-sm text-gray-500">Today at 10:30 AM</p>
                  </div>
                </div>
              </li>
              <li className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Generated a prototype for <span className="text-indigo-600">Inventory Management System</span></p>
                    <p className="text-sm text-gray-500">Yesterday at 2:15 PM</p>
                  </div>
                </div>
              </li>
              <li className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Updated requirements for <span className="text-indigo-600">Customer Portal</span></p>
                    <p className="text-sm text-gray-500">April 24, 2025</p>
                  </div>
                </div>
              </li>
              <li className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Added team member to <span className="text-indigo-600">Marketing Dashboard</span></p>
                    <p className="text-sm text-gray-500">April 23, 2025</p>
                  </div>
                </div>
              </li>
            </ul>
            <div className="bg-gray-50 px-4 py-3 text-center">
              <Link href="/activity" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                View All Activity
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
