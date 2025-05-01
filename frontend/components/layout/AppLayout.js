import React from 'react';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

/**
 * Main application layout with header, sidebar, footer and content area
 */
const AppLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex flex-1">
        {/* Optional Sidebar - render if exists */}
        {typeof Sidebar !== 'undefined' && <Sidebar />}
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AppLayout;
