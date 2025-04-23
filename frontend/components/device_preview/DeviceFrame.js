import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * DeviceFrame Component
 * 
 * Renders a mockup of a device with the prototype displayed within
 * Supports responsive preview across different device form factors
 */
const DeviceFrame = ({ 
  deviceType = 'desktop',
  url,
  orientation = 'portrait',
  width = '100%',
  height = '100%',
  scale = 1,
  className
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Handle iframe load events
  const handleLoad = () => {
    setLoading(false);
  };
  
  const handleError = () => {
    setLoading(false);
    setError('Failed to load prototype');
  };
  
  // Get device dimensions based on type and orientation
  const getDeviceDimensions = () => {
    // Base dimensions (in aspect ratios)
    const dimensions = {
      desktop: { width: 1440, height: 900 },
      laptop: { width: 1366, height: 768 },
      tablet: { width: 768, height: 1024 },
      phone: { width: 375, height: 812 },
      watch: { width: 240, height: 240 }
    };
    
    // Get base dimensions for the selected device
    const base = dimensions[deviceType] || dimensions.desktop;
    
    // Adjust for orientation if needed (except desktop and watch)
    if (['tablet', 'phone', 'laptop'].includes(deviceType) && orientation === 'landscape') {
      return { width: base.height, height: base.width };
    }
    
    return base;
  };
  
  // Get device styles (frame, bezels, etc.)
  const getDeviceStyles = () => {
    const dimensions = getDeviceDimensions();
    const aspectRatio = dimensions.width / dimensions.height;
    
    // Base styles
    const styles = {
      container: {
        position: 'relative',
        width,
        height,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        transition: 'all 0.3s ease'
      },
      frame: {
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        borderRadius: '0px',
        boxShadow: 'none',
        background: '#000',
        aspectRatio: `${aspectRatio}`
      },
      screen: {
        position: 'absolute',
        border: 'none',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: '#fff'
      }
    };
    
    // Device-specific styles
    switch (deviceType) {
      case 'phone':
        styles.frame.borderRadius = '36px';
        styles.frame.boxShadow = '0 0 0 10px #111, 0 0 0 11px #333';
        styles.screen.top = '2%';
        styles.screen.left = '2%';
        styles.screen.width = '96%';
        styles.screen.height = '96%';
        styles.screen.borderRadius = '32px';
        // Add notch for modern phone look
        styles.notch = {
          position: 'absolute',
          top: '2%',
          left: 'calc(50% - 20%)',
          width: '40%',
          height: '3%',
          background: '#111',
          borderBottomLeftRadius: '10px',
          borderBottomRightRadius: '10px',
          zIndex: 2
        };
        break;
        
      case 'tablet':
        styles.frame.borderRadius = '20px';
        styles.frame.boxShadow = '0 0 0 10px #111, 0 0 0 11px #333';
        styles.screen.top = '2%';
        styles.screen.left = '2%';
        styles.screen.width = '96%';
        styles.screen.height = '96%';
        styles.screen.borderRadius = '16px';
        break;
        
      case 'laptop':
        styles.container.height = 'auto';
        styles.frame.height = 'auto';
        styles.frame.borderRadius = '16px 16px 0 0';
        styles.frame.boxShadow = '0 0 0 10px #111, 0 3px 0 10px #999';
        styles.frame.paddingBottom = '5%'; // Space for keyboard
        styles.screen.top = '2%';
        styles.screen.left = '2%';
        styles.screen.width = '96%';
        styles.screen.height = '90%';
        styles.screen.borderRadius = '10px';
        // Add keyboard for laptop
        styles.keyboard = {
          position: 'absolute',
          bottom: '0',
          left: '25%',
          width: '50%',
          height: '2%',
          background: '#444',
          borderRadius: '2px',
          zIndex: 2
        };
        break;
        
      case 'watch':
        styles.frame.borderRadius = '50%';
        styles.frame.boxShadow = '0 0 0 6px #555, 0 0 0 10px #111';
        styles.screen.top = '5%';
        styles.screen.left = '5%';
        styles.screen.width = '90%';
        styles.screen.height = '90%';
        styles.screen.borderRadius = '50%';
        // Add watch strap
        styles.strapTop = {
          position: 'absolute',
          top: '-40%',
          left: '30%',
          width: '40%',
          height: '40%',
          background: 'linear-gradient(to top, #333, #222)',
          borderRadius: '10px'
        };
        styles.strapBottom = {
          position: 'absolute',
          bottom: '-40%',
          left: '30%',
          width: '40%',
          height: '40%',
          background: 'linear-gradient(to bottom, #333, #222)',
          borderRadius: '10px'
        };
        break;
        
      case 'desktop':
      default:
        styles.frame.borderRadius = '8px 8px 0 0';
        styles.frame.boxShadow = '0 0 0 10px #111, 0 0 0 11px #333, 0 20px 30px rgba(0,0,0,0.2)';
        styles.screen.top = '4%';
        styles.screen.left = '2%';
        styles.screen.width = '96%';
        styles.screen.height = '92%';
        styles.screen.borderRadius = '4px';
        // Add stand for desktop
        styles.stand = {
          position: 'absolute',
          bottom: '-10%',
          left: '40%',
          width: '20%',
          height: '10%',
          background: 'linear-gradient(to bottom, #666, #111)',
          borderRadius: '0 0 10px 10px',
          zIndex: -1
        };
        styles.base = {
          position: 'absolute',
          bottom: '-15%',
          left: '30%',
          width: '40%',
          height: '5%',
          background: '#111',
          borderRadius: '50%',
          zIndex: -1
        };
        break;
    }
    
    return styles;
  };
  
  const styles = getDeviceStyles();
  
  return (
    <div style={styles.container} className={className}>
      {/* Device Frame */}
      <div style={styles.frame}>
        {/* Additional device UI elements */}
        {deviceType === 'phone' && <div style={styles.notch}></div>}
        {deviceType === 'laptop' && <div style={styles.keyboard}></div>}
        {deviceType === 'watch' && (
          <>
            <div style={styles.strapTop}></div>
            <div style={styles.strapBottom}></div>
          </>
        )}
        {deviceType === 'desktop' && (
          <>
            <div style={styles.stand}></div>
            <div style={styles.base}></div>
          </>
        )}
        
        {/* Screen Content */}
        <div style={styles.screen}>
          {loading && (
            <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
              <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
              <div className="text-red-500 text-center p-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p>{error}</p>
              </div>
            </div>
          )}
          
          {url && (
            <iframe 
              src={url} 
              title={`${deviceType} preview`}
              width="100%" 
              height="100%" 
              frameBorder="0"
              onLoad={handleLoad}
              onError={handleError}
              style={{ backgroundColor: '#fff', visibility: loading ? 'hidden' : 'visible' }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

DeviceFrame.propTypes = {
  deviceType: PropTypes.oneOf(['desktop', 'laptop', 'tablet', 'phone', 'watch']),
  url: PropTypes.string.isRequired,
  orientation: PropTypes.oneOf(['portrait', 'landscape']),
  width: PropTypes.string,
  height: PropTypes.string,
  scale: PropTypes.number,
  className: PropTypes.string
};

export default DeviceFrame;
