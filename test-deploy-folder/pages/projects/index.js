import React, { useState, useMemo, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { useProject, useUI } from '../../contexts';
import Link from 'next/link';
import { withProtection } from '../../components/auth/ProtectedRoute';

/**
 * Projects page component
 * 
 * Displays all user projects with search, filtering and sorting capabilities
 */
const ProjectsPage = () => {
  const { projects, fetchProjects, isLoading, setActiveProject } = useProject();
  const { openModal } = useUI();
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, archived
  const [sortBy, setSortBy] = useState('updatedAt'); // name, createdAt, updatedAt
  const [sortDirection, setSortDirection] = useState('desc'); // asc, desc
  
  // Refresh projects when component mounts
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);
  
  // Open modal to create a new project
  const handleCreateProject = () => {
    openModal('project-form', { type: 'create' });
  };
  
  // Open modal to edit an existing project
  const handleEditProject = (project) => {
    openModal('project-form', { type: 'edit', project });
  };
  
  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter(project => {
        // Apply status filter
        if (statusFilter === 'active' && project.status === 'archived') return false;
        if (statusFilter === 'archived' && project.status !== 'archived') return false;
        
        // Apply search filter (case insensitive)
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            project.name.toLowerCase().includes(query) ||
            (project.description && project.description.toLowerCase().includes(query)) ||
            (project.clientName && project.clientName.toLowerCase().includes(query))
          );
        }
        
        return true;
      })
      .sort((a, b) => {
        // Apply sorting
        let valueA, valueB;
        
        switch (sortBy) {
          case 'name':
            valueA = a.name.toLowerCase();
            valueB = b.name.toLowerCase();
            break;
          case 'createdAt':
            valueA = new Date(a.createdAt).getTime();
            valueB = new Date(b.createdAt).getTime();
            break;
          case 'updatedAt':
          default:
            valueA = new Date(a.updatedAt || a.createdAt).getTime();
            valueB = new Date(b.updatedAt || b.createdAt).getTime();
            break;
        }
        
        // Apply sort direction
        return sortDirection === 'asc' 
          ? (valueA > valueB ? 1 : -1)
          : (valueA < valueB ? 1 : -1);
      });
  }, [projects, searchQuery, statusFilter, sortBy, sortDirection]);
  
  // Toggle sort direction when clicking the same sort field
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };
  
  return (
    <Layout title="Projects">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Manage your projects and collaborate with team members
              </p>
            </div>
            <div className="mt-4 md:mt-0">
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
          
          {/* Filters and search */}
          <div className="mb-6 bg-white dark:bg-gray-800 shadow-sm p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="col-span-2">
                <label htmlFor="search" className="sr-only">Search projects</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg 
                      className="h-5 w-5 text-gray-400" 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="search"
                    id="search"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    placeholder="Search projects..."
                  />
                </div>
              </div>
              
              {/* Status filter */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <select
                  id="status"
                  name="status"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Projects</option>
                  <option value="active">Active Projects</option>
                  <option value="archived">Archived Projects</option>
                </select>
              </div>
              
              {/* Sort by */}
              <div>
                <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sort by</label>
                <select
                  id="sortBy"
                  name="sortBy"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="updatedAt">Last Updated</option>
                  <option value="createdAt">Date Created</option>
                  <option value="name">Project Name</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Projects list */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {filteredProjects.length > 0 ? (
                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center">
                            <span>Project Name</span>
                            {sortBy === 'name' && (
                              <span className="ml-1">
                                {sortDirection === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Client
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('updatedAt')}
                        >
                          <div className="flex items-center">
                            <span>Last Updated</span>
                            {sortBy === 'updatedAt' && (
                              <span className="ml-1">
                                {sortDirection === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('createdAt')}
                        >
                          <div className="flex items-center">
                            <span>Created</span>
                            {sortBy === 'createdAt' && (
                              <span className="ml-1">
                                {sortDirection === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredProjects.map((project) => (
                        <tr 
                          key={project.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            <Link href={`/projects/${project.id}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                              {project.name}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {project.clientName || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {project.updatedAt 
                              ? new Date(project.updatedAt).toLocaleDateString() 
                              : new Date(project.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(project.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {project.status === 'archived' ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200">
                                Archived
                              </span>
                            ) : (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200">
                                Active
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-3">
                              <button
                                onClick={() => setActiveProject(project)}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                              >
                                Select
                              </button>
                              <button
                                onClick={() => handleEditProject(project)}
                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                              >
                                Edit
                              </button>
                              <Link 
                                href={`/projects/${project.id}`}
                                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                              >
                                View
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 text-center">
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
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    {searchQuery || statusFilter !== 'all' 
                      ? 'No projects match your filters' 
                      : 'No projects yet'}
                  </h3>
                  {searchQuery || statusFilter !== 'all' ? (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Try adjusting your search or filter criteria.
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Get started by creating a new project.
                    </p>
                  )}
                  
                  {searchQuery || statusFilter !== 'all' ? (
                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setStatusFilter('all');
                        }}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Clear filters
                      </button>
                    </div>
                  ) : (
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
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

// Protect the projects page
export default withProtection(ProjectsPage);
