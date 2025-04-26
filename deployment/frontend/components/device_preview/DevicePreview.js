import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useProject } from '../../contexts/ProjectContext';
import DeviceFrame from './DeviceFrame';
import DeviceControl from './DeviceControl';

/**
 * DevicePreview Component
 * 
 * Main component for multi-device preview functionality
 * Displays a prototype across different devices and screen sizes
 */
const DevicePreview = ({
  url: externalUrl,
  projectId: externalProjectId,
  className
}) => {
  // Get current project context
  const { currentProject } = useProject();
  
  // Device settings state
  const [deviceType, setDeviceType] = useState('desktop');
  const [orientation, setOrientation] = useState('portrait');
  const [scale, setScale] = useState(0.75);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get URL from props or project
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    const getPreviewUrl = async () => {
      try {
        // If external URL is provided, use it directly
        if (externalUrl) {
          setUrl(externalUrl);
          setLoading(false);
          return;
        }
        
        // Get project ID from props or context
        const projectId = externalProjectId || currentProject?.id;
        
        if (!projectId) {
          setError('No project selected. Please select a project or provide a URL.');
          setLoading(false);
          return;
        }
        
        // In a real implementation, we would fetch the prototype URL from the API
        // const response = await api.get(`/projects/${projectId}/prototype/url`);
        // setUrl(response.data.url);
        
        // For demo purposes, we'll use a placeholder URL
        setUrl(`https://auto-agi-builder.vercel.app/preview/${projectId}`);
        
        // Simulate API call delay
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to load preview URL: ' + (err.message || 'Unknown error'));
        setLoading(false);
      }
    };
    
    getPreviewUrl();
  }, [externalUrl, externalProjectId, currentProject]);
  
  // Update orientation when device type changes
  useEffect(() => {
    // Reset to portrait for devices that don't support landscape
    if (deviceType === 'desktop' || deviceType === 'watch') {
      setOrientation('portrait');
    }
  }, [deviceType]);
  
  return (
    <div className={`${className || ''}`}>
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Device Preview</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">View your prototype on different devices and screen sizes</p>
      </div>
      
      {/* Error display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg mb-4 text-red-700 dark:text-red-400">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p>{error}</p>
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Device controls */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <DeviceControl
            deviceType={deviceType}
            setDeviceType={setDeviceType}
            orientation={orientation}
            setOrientation={setOrientation}
            scale={scale}
            setScale={setScale}
            className="sticky top-4"
          />
          
          {/* URL display */}
          {url && !loading && !error && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Preview URL</p>
              <div className="flex items-center">
                <div className="bg-white dark:bg-gray-700 p-2 rounded flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-gray-600 dark:text-gray-300">
                  {url}
                </div>
                <button
                  onClick={() => window.open(url, '_blank')}
                  className="ml-2 p-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                  title="Open in new tab"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          {/* Device info */}
          {!loading && !error && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Device Info</p>
              <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                <div className="flex justify-between">
                  <span>Device:</span>
                  <span className="font-medium">{deviceType.charAt(0).toUpperCase() + deviceType.slice(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Orientation:</span>
                  <span className="font-medium">{orientation.charAt(0).toUpperCase() + orientation.slice(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Zoom:</span>
                  <span className="font-medium">{Math.round(scale * 100)}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Device frame */}
        <div className="flex-1 overflow-auto">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 p-8 min-h-[500px] flex items-center justify-center">
            {loading ? (
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading preview...</p>
              </div>
            ) : url && !error ? (
              <DeviceFrame
                deviceType={deviceType}
                url={url}
                orientation={orientation}
                scale={scale}
              />
            ) : !error ? (
              <div className="text-center text-gray-500 dark:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p>No preview available</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

DevicePreview.propTypes = {
  url: PropTypes.string,
  projectId: PropTypes.string,
  className: PropTypes.string
};

export default DevicePreview;
