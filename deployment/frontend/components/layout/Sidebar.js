import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useProject } from '../../contexts';

const Sidebar = () => {
  const router = useRouter();
  const { currentProject } = useProject();
  
  // Check if the current route matches the given href
  const isActive = (href) => {
    return router.pathname === href || router.pathname.startsWith(`${href}/`);
  };
  
  // Link styles
  const linkClass = (href) => {
    return `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
      isActive(href)
        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
    }`;
  };
  
  // Icon styles
  const iconClass = (href) => {
    return `mr-3 flex-shrink-0 h-6 w-6 ${
      isActive(href)
        ? 'text-blue-600 dark:text-blue-400'
        : 'text-gray-500 dark:text-gray-400'
    }`;
  };
  
  return (
    <div className="flex flex-col w-64 h-screen fixed bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 pt-5">
      {/* Project selection */}
      <div className="px-4 mb-8">
        <div className="flex items-center">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            {currentProject ? 'Current Project' : 'No Project Selected'}
          </h2>
        </div>
        
        {currentProject ? (
          <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold">
                {currentProject.name.charAt(0)}
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {currentProject.name}
                </p>
                {currentProject.clientName && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {currentProject.clientName}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-2 flex space-x-2">
              <Link
                href={`/projects/${currentProject.id}`}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                View Details
              </Link>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <Link
                href="/projects"
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                Switch Project
              </Link>
            </div>
          </div>
        ) : (
          <Link
            href="/projects"
            className="mt-2 block text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            Select or create a project
          </Link>
        )}
      </div>
      
      {/* Navigation */}
      <div className="flex flex-col flex-grow px-4 pb-4 overflow-y-auto">
        <nav className="flex-1 space-y-8">
          {/* Main Navigation */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Main
            </h3>
            <div className="mt-2 space-y-1">
              <Link href="/dashboard" className={linkClass('/dashboard')}>
                <svg className={iconClass('/dashboard')} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </Link>
              <Link href="/projects" className={linkClass('/projects')}>
                <svg className={iconClass('/projects')} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Projects
              </Link>
            </div>
          </div>
          
          {/* Project Development */}
          {currentProject && (
            <div>
              <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Development
              </h3>
              <div className="mt-2 space-y-1">
                <Link href="/documents" className={linkClass('/documents')}>
                  <svg className={iconClass('/documents')} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Documents
                </Link>
                <Link href="/requirements" className={linkClass('/requirements')}>
                  <svg className={iconClass('/requirements')} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  Requirements
                </Link>
                <Link href="/prototype" className={linkClass('/prototype')}>
                  <svg className={iconClass('/prototype')} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Prototype
                </Link>
                <Link href="/device-preview" className={linkClass('/device-preview')}>
                  <svg className={iconClass('/device-preview')} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Device Preview
                </Link>
              </div>
            </div>
          )}
          
          {/* Analysis */}
          {currentProject && (
            <div>
              <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Analysis
              </h3>
              <div className="mt-2 space-y-1">
                <Link href="/roi" className={linkClass('/roi')}>
                  <svg className={iconClass('/roi')} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  ROI Calculator
                </Link>
                <Link href="/roadmap" className={linkClass('/roadmap')}>
                  <svg className={iconClass('/roadmap')} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Roadmap
                </Link>
                <Link href="/demo-data" className={linkClass('/demo-data')}>
                  <svg className={iconClass('/demo-data')} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                  Demo Data
                </Link>
              </div>
            </div>
          )}
          
          {/* Settings */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Settings
            </h3>
            <div className="mt-2 space-y-1">
              <Link href="/settings" className={linkClass('/settings')}>
                <svg className={iconClass('/settings')} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </Link>
              <Link href="/profile" className={linkClass('/profile')}>
                <svg className={iconClass('/profile')} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </Link>
            </div>
          </div>
          
          {/* Help */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Help
            </h3>
            <div className="mt-2 space-y-1">
              <Link href="/documentation" className={linkClass('/documentation')}>
                <svg className={iconClass('/documentation')} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Documentation
              </Link>
              <Link href="/help" className={linkClass('/help')}>
                <svg className={iconClass('/help')} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Help & Support
              </Link>
            </div>
          </div>
        </nav>
      </div>
      
      {/* Bottom section */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Auto AGI Builder
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Version 1.0.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
