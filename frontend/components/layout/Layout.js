import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileSidebar from './MobileSidebar';
import { useAuth } from '../../contexts';

const Layout = ({ children, title = 'Auto AGI Builder', hideNav = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  // Determine if the sidebar should be shown (only for authenticated users and non-auth pages)
  const showSidebar = isAuthenticated && !hideNav && !router.pathname.includes('/auth/');
  
  // Format the page title
  const pageTitle = `${title} | Auto AGI Builder`;
  
  // Close sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [router.pathname]);
  
  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Show navbar except on pages where hideNav is true */}
        {!hideNav && (
          <Navbar 
            sidebarOpen={sidebarOpen} 
            setSidebarOpen={setSidebarOpen} 
            showSidebarToggle={showSidebar}
          />
        )}
        
        {/* Mobile sidebar */}
        {showSidebar && (
          <MobileSidebar 
            sidebarOpen={sidebarOpen} 
            setSidebarOpen={setSidebarOpen} 
          />
        )}
        
        {/* Static sidebar for desktop */}
        {showSidebar && (
          <div className="hidden md:flex md:flex-shrink-0">
            <Sidebar />
          </div>
        )}
        
        {/* Main content area */}
        <div className={`flex flex-col ${showSidebar ? 'md:pl-64' : ''} flex-1`}>
          {/* Page content */}
          <main className="flex-1">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
          
          {/* Footer */}
          <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center space-x-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    &copy; {new Date().getFullYear()} Auto AGI Builder. All rights reserved.
                  </p>
                </div>
                
                <div className="mt-4 md:mt-0 flex items-center space-x-6">
                  <a 
                    href="/privacy"
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    Privacy Policy
                  </a>
                  <a 
                    href="/terms"
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    Terms of Service
                  </a>
                  <a 
                    href="/contact"
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    Contact Us
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
};

export default Layout;
