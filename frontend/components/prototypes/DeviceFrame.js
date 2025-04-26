import React from 'react';
import PropTypes from 'prop-types';
import { Box, useTheme } from '@mui/material';

/**
 * DeviceFrame component
 * Renders a realistic device frame (mobile, tablet, desktop) around content
 */
const DeviceFrame = ({ 
  type = 'desktop',
  orientation = 'portrait',
  children,
  width = '100%',
  height = '100%',
  className = '',
  color = 'default',
  style = {}
}) => {
  const theme = useTheme();
  
  // Set colors based on theme and props
  const deviceColors = {
    default: '#1a1a1a',
    dark: '#000000',
    light: '#e0e0e0',
    white: '#ffffff',
    gray: '#9e9e9e',
    silver: '#c0c0c0',
    gold: '#d4af37'
  };
  
  const deviceColor = deviceColors[color] || deviceColors.default;
  
  // Adjust dimensions based on orientation
  const isLandscape = orientation === 'landscape';
  const frameStyle = {
    ...style,
    width: width,
    height: height
  };
  
  const frameBodyStyle = {
    overflow: 'hidden',
    backgroundColor: '#fff',
    height: '100%',
    width: '100%',
    position: 'relative'
  };
  
  // Render appropriate device frame based on type
  const renderFrame = () => {
    switch (type) {
      case 'mobile':
        return renderMobileFrame();
      case 'tablet':
        return renderTabletFrame();
      case 'laptop':
        return renderLaptopFrame();
      default:
        return renderDesktopFrame();
    }
  };
  
  // Mobile phone frame
  const renderMobileFrame = () => {
    const frameRatio = isLandscape ? 2 : 0.5;
    
    return (
      <Box
        sx={{
          ...frameStyle,
          borderRadius: '36px',
          padding: '12px',
          backgroundColor: deviceColor,
          boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
          position: 'relative',
          aspectRatio: frameRatio,
          maxWidth: isLandscape ? '600px' : '300px',
          margin: '0 auto',
          transform: isLandscape ? 'rotate(90deg)' : 'none',
          '&::before': {
            content: '""',
            position: 'absolute',
            width: '50%',
            height: '4px',
            backgroundColor: '#333',
            borderRadius: '2px',
            top: '6px',
            left: '25%',
            zIndex: 2
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            width: '15px',
            height: '15px',
            borderRadius: '50%',
            backgroundColor: '#333',
            bottom: '6px',
            left: 'calc(50% - 7.5px)',
            zIndex: 2
          }
        }}
      >
        <Box sx={frameBodyStyle}>
          {children}
        </Box>
      </Box>
    );
  };
  
  // Tablet frame
  const renderTabletFrame = () => {
    const frameRatio = isLandscape ? 1.33 : 0.75;
    
    return (
      <Box
        sx={{
          ...frameStyle,
          borderRadius: '20px',
          padding: '16px',
          backgroundColor: deviceColor,
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          position: 'relative',
          aspectRatio: frameRatio,
          maxWidth: isLandscape ? '800px' : '600px',
          margin: '0 auto',
          transform: isLandscape ? 'rotate(90deg)' : 'none',
          '&::before': {
            content: '""',
            position: 'absolute',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            backgroundColor: '#444',
            top: '8px',
            right: '8px',
            zIndex: 2
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            border: '2px solid #444',
            bottom: '8px',
            left: 'calc(50% - 15px)',
            zIndex: 2
          }
        }}
      >
        <Box sx={frameBodyStyle}>
          {children}
        </Box>
      </Box>
    );
  };
  
  // Laptop frame
  const renderLaptopFrame = () => {
    return (
      <Box
        sx={{
          ...frameStyle,
          position: 'relative',
          maxWidth: '1000px',
          margin: '0 auto'
        }}
      >
        {/* Screen */}
        <Box
          sx={{
            borderRadius: '6px 6px 0 0',
            backgroundColor: deviceColor,
            padding: '12px 12px 0',
            boxShadow: '0 5px 15px rgba(0,0,0,0.15)',
            position: 'relative',
            zIndex: 2,
            '&::before': {
              content: '""',
              position: 'absolute',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#666',
              top: '6px',
              left: 'calc(50% - 3px)',
              zIndex: 2
            }
          }}
        >
          <Box sx={frameBodyStyle} style={{ height: 'calc(100% - 10px)', borderRadius: '2px 2px 0 0' }}>
            {children}
          </Box>
        </Box>
        
        {/* Base/Keyboard */}
        <Box
          sx={{
            backgroundColor: deviceColor,
            height: '15px',
            borderRadius: '0 0 6px 6px',
            position: 'relative',
            zIndex: 1,
            '&::after': {
              content: '""',
              position: 'absolute',
              width: '30%',
              height: '3px',
              borderRadius: '0 0 3px 3px',
              backgroundColor: '#555',
              bottom: 0,
              left: '35%'
            }
          }}
        />
      </Box>
    );
  };
  
  // Desktop monitor frame
  const renderDesktopFrame = () => {
    return (
      <Box
        sx={{
          ...frameStyle,
          position: 'relative',
          maxWidth: '1200px',
          margin: '0 auto'
        }}
      >
        {/* Screen */}
        <Box
          sx={{
            borderRadius: '6px',
            backgroundColor: deviceColor,
            padding: '8px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            position: 'relative',
            zIndex: 2
          }}
        >
          <Box sx={frameBodyStyle} style={{ borderRadius: '2px' }}>
            {children}
          </Box>
        </Box>
        
        {/* Stand */}
        <Box
          sx={{
            width: '20%',
            height: '60px',
            backgroundColor: deviceColor,
            margin: '0 auto',
            marginTop: '-5px',
            clipPath: 'polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%)',
            position: 'relative',
            zIndex: 1
          }}
        />
        
        {/* Base */}
        <Box
          sx={{
            width: '40%',
            height: '15px',
            backgroundColor: deviceColor,
            margin: '0 auto',
            borderRadius: '5px',
            position: 'relative',
            zIndex: 0
          }}
        />
      </Box>
    );
  };

  return (
    <Box className={`device-frame ${className}`} data-device-type={type} data-orientation={orientation}>
      {renderFrame()}
    </Box>
  );
};

DeviceFrame.propTypes = {
  type: PropTypes.oneOf(['mobile', 'tablet', 'laptop', 'desktop']),
  orientation: PropTypes.oneOf(['portrait', 'landscape']),
  children: PropTypes.node,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
  color: PropTypes.oneOf(['default', 'dark', 'light', 'white', 'gray', 'silver', 'gold']),
  style: PropTypes.object
};

export default DeviceFrame;
