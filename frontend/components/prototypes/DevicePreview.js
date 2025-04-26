import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Paper, 
  ToggleButtonGroup, 
  ToggleButton, 
  Slider, 
  Typography,
  IconButton,
  Tooltip,
  Divider,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import TabletIcon from '@mui/icons-material/Tablet';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import LaptopIcon from '@mui/icons-material/Laptop';
import ScreenRotationIcon from '@mui/icons-material/ScreenRotation';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import RefreshIcon from '@mui/icons-material/Refresh';
import PaletteIcon from '@mui/icons-material/Palette';

import DeviceFrame from './DeviceFrame';

// Styled components
const PreviewContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
  overflow: 'hidden',
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
}));

const ControlBar = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  zIndex: 100,
}));

const ControlGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const ViewportContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflow: 'auto',
  padding: theme.spacing(4),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.grey[100],
}));

const DevicePreview = ({
  content,
  initialDevice = 'desktop',
  initialOrientation = 'portrait',
  onRefresh = () => {},
  isLoading = false,
  title = 'Device Preview',
  url = ''
}) => {
  const [device, setDevice] = useState(initialDevice);
  const [orientation, setOrientation] = useState(initialOrientation);
  const [zoom, setZoom] = useState(100);
  const [frameColor, setFrameColor] = useState('default');
  const frameRef = useRef(null);
  const iframeRef = useRef(null);

  // Device viewport dimensions (width, height) in pixels
  const deviceDimensions = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    laptop: { width: 1366, height: 768 },
    desktop: { width: 1920, height: 1080 }
  };

  // Calculate the actual dimensions based on device, orientation and zoom
  const getViewportDimensions = () => {
    const { width, height } = deviceDimensions[device];
    const dims = orientation === 'landscape' && device !== 'desktop' && device !== 'laptop'
      ? { width: height, height: width }
      : { width, height };
    
    const scaleFactor = zoom / 100;
    return {
      width: dims.width * scaleFactor,
      height: dims.height * scaleFactor
    };
  };

  // Handle device change
  const handleDeviceChange = (event, newDevice) => {
    if (newDevice !== null) {
      setDevice(newDevice);
      
      // Automatically adjust orientation for laptop and desktop
      if (newDevice === 'laptop' || newDevice === 'desktop') {
        setOrientation('landscape');
      }
    }
  };

  // Toggle orientation
  const toggleOrientation = () => {
    setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait');
  };

  // Handle zoom change
  const handleZoomChange = (event, newValue) => {
    setZoom(newValue);
  };

  // Reset zoom to 100%
  const resetZoom = () => {
    setZoom(100);
  };

  // Handle color change
  const handleColorChange = (event) => {
    setFrameColor(event.target.value);
  };

  // Handle refresh click
  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
    onRefresh();
  };

  // Check if content is HTML code or a URL
  const isHtmlContent = typeof content === 'string' && (content.includes('<html') || content.includes('<!DOCTYPE'));
  
  // Render the appropriate content inside the frame
  const renderFrameContent = () => {
    if (isLoading) {
      return (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            bgcolor: 'background.paper'
          }}
        >
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Loading preview...
          </Typography>
        </Box>
      );
    }
    
    if (url) {
      return (
        <iframe
          ref={iframeRef}
          src={url}
          title="Prototype Preview"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            backgroundColor: '#fff'
          }}
        />
      );
    }
    
    if (isHtmlContent) {
      return (
        <iframe
          ref={iframeRef}
          srcDoc={content}
          title="Prototype Preview"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            backgroundColor: '#fff'
          }}
        />
      );
    }
    
    // For React component content
    if (React.isValidElement(content)) {
      return content;
    }
    
    // Default fallback
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          p: 3,
          textAlign: 'center',
          bgcolor: 'background.paper'
        }}
      >
        <Typography variant="body1" color="text.secondary">
          {content || 'No preview content available'}
        </Typography>
      </Box>
    );
  };

  return (
    <PreviewContainer>
      {/* Control bar */}
      <ControlBar elevation={0}>
        <Typography variant="subtitle1" fontWeight="medium">
          {title}
        </Typography>
        
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <ControlGroup>
            {/* Device type selector */}
            <ToggleButtonGroup
              value={device}
              exclusive
              onChange={handleDeviceChange}
              size="small"
              aria-label="device selection"
            >
              <ToggleButton value="mobile" aria-label="mobile">
                <Tooltip title="Mobile">
                  <SmartphoneIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="tablet" aria-label="tablet">
                <Tooltip title="Tablet">
                  <TabletIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="laptop" aria-label="laptop">
                <Tooltip title="Laptop">
                  <LaptopIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="desktop" aria-label="desktop">
                <Tooltip title="Desktop">
                  <DesktopWindowsIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
            
            <Divider orientation="vertical" flexItem />
            
            {/* Orientation toggle */}
            <Tooltip title="Toggle orientation">
              <IconButton 
                onClick={toggleOrientation}
                disabled={device === 'desktop' || device === 'laptop'}
                size="small"
              >
                <ScreenRotationIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Divider orientation="vertical" flexItem />
            
            {/* Frame color selector */}
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel id="frame-color-label">Color</InputLabel>
              <Select
                labelId="frame-color-label"
                id="frame-color-select"
                value={frameColor}
                label="Color"
                onChange={handleColorChange}
                size="small"
                IconComponent={PaletteIcon}
              >
                <MenuItem value="default">Default</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="white">White</MenuItem>
                <MenuItem value="silver">Silver</MenuItem>
                <MenuItem value="gold">Gold</MenuItem>
              </Select>
            </FormControl>
          </ControlGroup>
        </Box>
        
        <ControlGroup>
          {/* Zoom controls */}
          <Tooltip title="Zoom out">
            <IconButton onClick={() => setZoom(Math.max(50, zoom - 10))} size="small">
              <ZoomOutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Slider
            value={zoom}
            onChange={handleZoomChange}
            min={50}
            max={150}
            step={10}
            valueLabelDisplay="auto"
            valueLabelFormat={value => `${value}%`}
            sx={{ width: 100 }}
          />
          
          <Tooltip title="Zoom in">
            <IconButton onClick={() => setZoom(Math.min(150, zoom + 10))} size="small">
              <ZoomInIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Reset zoom">
            <IconButton onClick={resetZoom} size="small">
              <FullscreenIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Divider orientation="vertical" flexItem />
          
          {/* Refresh button */}
          <Tooltip title="Refresh preview">
            <IconButton onClick={handleRefresh} size="small" disabled={isLoading}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </ControlGroup>
      </ControlBar>
      
      {/* Viewport with device frame */}
      <ViewportContainer>
        <Box
          ref={frameRef}
          sx={{
            transform: `scale(${zoom / 100})`,
            transition: 'transform 0.3s ease',
            transformOrigin: 'center',
            maxWidth: '100%',
            maxHeight: '100%'
          }}
        >
          <DeviceFrame
            type={device}
            orientation={orientation}
            color={frameColor}
          >
            {renderFrameContent()}
          </DeviceFrame>
        </Box>
      </ViewportContainer>
      
      {/* Viewport size indicator */}
      <Box sx={{ p: 1, textAlign: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">
          Viewport: {getViewportDimensions().width} × {getViewportDimensions().height}px
          {' • '}
          {device.charAt(0).toUpperCase() + device.slice(1)}
          {' • '}
          {orientation.charAt(0).toUpperCase() + orientation.slice(1)}
          {' • '}
          Zoom: {zoom}%
        </Typography>
      </Box>
    </PreviewContainer>
  );
};

DevicePreview.propTypes = {
  content: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ]),
  initialDevice: PropTypes.oneOf(['mobile', 'tablet', 'laptop', 'desktop']),
  initialOrientation: PropTypes.oneOf(['portrait', 'landscape']),
  onRefresh: PropTypes.func,
  isLoading: PropTypes.bool,
  title: PropTypes.string,
  url: PropTypes.string
};

export default DevicePreview;
