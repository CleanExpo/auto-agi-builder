import React, { useState } from 'react';
import { withProtection } from '../components/auth/ProtectedRoute';
import Layout from '../components/layout/Layout';
import DevicePreview from '../components/device_preview/DevicePreview';
import { useProject } from '../contexts/ProjectContext';

/**
 * Device Preview Page
 * 
 * Page for viewing prototypes across different devices and screen sizes
 */
const DevicePreviewPage = () => {
  const { currentProject } = useProject();
  const [customUrl, setCustomUrl] = useState('');
  const [previewingCustomUrl, setPreviewingCustomUrl] = useState(false);
  
  // Handle custom URL input
  const handleUrlChange = (e) => {
    setCustomUrl(e.target.value);
  };
  
  // Handle form submission for custom URL
  const handleSubmit = (e) => {
    e.preventDefault();
    setPreviewingCustomUrl(!!customUrl);
  };
  
  // Reset to project preview
  const resetToProject = () => {
    setCustomUrl('');
    setPreviewingCustomUrl(false);
  };
  
  return (
    <Layout title="Device Preview">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with Custom URL Input */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Multi-Device Preview</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Test how your prototype looks on different devices
              </p>
            </div>
            
            <div className="flex-shrink-0">
              <form onSubmit={handleSubmit} className="flex">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Enter custom URL to preview"
                    value={customUrl}
                    onChange={handleUrlChange}
                    className="py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm w-full text-gray-900 dark:text-white"
                  />
                  {previewingCustomUrl && (
                    <button
                      type="button"
                      onClick={resetToProject}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={!customUrl}
                  className={`ml-2 px-4 py-2 rounded-md text-sm font-medium shadow-sm ${
                    customUrl
                      ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Preview
                </button>
              </form>
            </div>
          </div>
          
          {/* Preview Status Banner */}
          {previewingCustomUrl && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 rounded-md mb-6 flex justify-between items-center">
              <div className="flex items-center text-blue-700 dark:text-blue-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">Previewing custom URL: <span className="font-normal">{customUrl}</span></span>
              </div>
              <button
                onClick={resetToProject}
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                Return to Project
              </button>
            </div>
          )}
          
          {!previewingCustomUrl && !currentProject && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-md mb-6">
              <div className="flex items-center text-yellow-700 dark:text-yellow-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-sm">No project selected. Please select a project or enter a custom URL to preview.</span>
              </div>
            </div>
          )}
          
          {/* Device Preview Component */}
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
            <DevicePreview 
              url={previewingCustomUrl ? customUrl : null}
              projectId={!previewingCustomUrl ? currentProject?.id : null}
            />
          </div>
          
          {/* Help Section */}
          <div className="mt-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">About Device Preview</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <p>The Device Preview feature helps you visualize how your prototype looks on different devices and screen sizes.</p>
              <p>You can:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Switch between different device types (desktop, tablet, phone, etc.)</li>
                <li>Toggle orientation between portrait and landscape modes</li>
                <li>Control the zoom level to see more or less detail</li>
                <li>Preview external URLs by entering them in the field above</li>
              </ul>
              <p>This helps ensure your application is responsive and provides a good user experience across all devices.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default withProtection(DevicePreviewPage);
