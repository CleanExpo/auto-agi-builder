import React from 'react';
import PropTypes from 'prop-types';

/**
 * DeviceControl Component
 * 
 * Provides controls for adjusting device preview settings
 * Allows selection of device type, orientation, and zoom level
 */
const DeviceControl = ({
  deviceType,
  setDeviceType,
  orientation,
  setOrientation,
  scale,
  setScale,
  className
}) => {
  // Device options
  const deviceOptions = [
    { id: 'desktop', name: 'Desktop', icon: 'computer' },
    { id: 'laptop', name: 'Laptop', icon: 'laptop' },
    { id: 'tablet', name: 'Tablet', icon: 'tablet' },
    { id: 'phone', name: 'Phone', icon: 'smartphone' },
    { id: 'watch', name: 'Watch', icon: 'watch' }
  ];
  
  // Orientation options
  const orientationOptions = [
    { id: 'portrait', name: 'Portrait', icon: 'stay_current_portrait' },
    { id: 'landscape', name: 'Landscape', icon: 'stay_current_landscape' }
  ];
  
  // Scale percentage for display
  const scalePercentage = Math.round(scale * 100);
  
  // Handle scale change
  const handleScaleChange = (e) => {
    const newScale = parseFloat(e.target.value) / 100;
    setScale(newScale);
  };
  
  // Render device icon based on type
  const renderDeviceIcon = (icon) => {
    switch (icon) {
      case 'computer':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'laptop':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
          </svg>
        );
      case 'tablet':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'smartphone':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'watch':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'stay_current_portrait':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'stay_current_landscape':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M19 12h.01M12 19c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z" transform="rotate(90)" />
          </svg>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 ${className}`}>
      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Device Settings</h3>
      
      {/* Device Type Selection */}
      <div className="mb-5">
        <label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block">Device Type</label>
        <div className="flex flex-wrap gap-1">
          {deviceOptions.map((device) => (
            <button
              key={device.id}
              onClick={() => setDeviceType(device.id)}
              className={`flex items-center justify-center p-2 rounded-md transition-colors ${
                deviceType === device.id
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title={device.name}
            >
              {renderDeviceIcon(device.icon)}
              <span className="ml-1 text-xs">{device.name}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Orientation Selection (disabled for desktop and watch) */}
      <div className="mb-5">
        <label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block">
          Orientation
          {(deviceType === 'desktop' || deviceType === 'watch') && (
            <span className="ml-2 text-xs text-gray-400">(not available for {deviceType})</span>
          )}
        </label>
        <div className="flex gap-1">
          {orientationOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setOrientation(option.id)}
              disabled={deviceType === 'desktop' || deviceType === 'watch'}
              className={`flex items-center justify-center p-2 rounded-md transition-colors ${
                orientation === option.id
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              } ${
                (deviceType === 'desktop' || deviceType === 'watch')
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
              title={option.name}
            >
              {renderDeviceIcon(option.icon)}
              <span className="ml-1 text-xs">{option.name}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Scale/Zoom Control */}
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <label className="text-xs text-gray-500 dark:text-gray-400">Zoom Level</label>
          <span className="text-xs text-gray-500 dark:text-gray-400">{scalePercentage}%</span>
        </div>
        <input
          type="range"
          min="10"
          max="100"
          step="5"
          value={scalePercentage}
          onChange={handleScaleChange}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">10%</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">100%</span>
        </div>
      </div>
      
      {/* Preset Zoom Buttons */}
      <div className="flex gap-2">
        {[0.25, 0.5, 0.75, 1].map((presetScale) => (
          <button
            key={presetScale}
            onClick={() => setScale(presetScale)}
            className={`flex-1 py-1 px-2 text-xs rounded-md transition-colors ${
              scale === presetScale
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {Math.round(presetScale * 100)}%
          </button>
        ))}
      </div>
    </div>
  );
};

DeviceControl.propTypes = {
  deviceType: PropTypes.oneOf(['desktop', 'laptop', 'tablet', 'phone', 'watch']).isRequired,
  setDeviceType: PropTypes.func.isRequired,
  orientation: PropTypes.oneOf(['portrait', 'landscape']).isRequired,
  setOrientation: PropTypes.func.isRequired,
  scale: PropTypes.number.isRequired,
  setScale: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default DeviceControl;
