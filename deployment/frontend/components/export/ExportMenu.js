import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { PDF, Excel, CSV, JSON_EXPORT, Image, Utils } from '../../utils/exportUtils';

/**
 * ExportMenu Component
 * 
 * Provides a dropdown menu for exporting data in various formats
 * Supports PDF, Excel, CSV, JSON, and image exports
 */
const ExportMenu = ({
  data,
  projectName = '',
  elementRef = null,
  exportTypes = ['pdf', 'excel', 'csv', 'json'],
  disabled = false,
  onExportStart = () => {},
  onExportComplete = () => {},
  onExportError = () => {},
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [currentExportType, setCurrentExportType] = useState('');
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Toggle dropdown
  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };
  
  // Generate base filename from project name or default
  const getBaseFilename = () => {
    if (projectName) {
      return Utils.sanitizeFilename(projectName);
    }
    return 'export';
  };
  
  // Handle export click
  const handleExport = async (type) => {
    if (isExporting) return;
    
    setIsExporting(true);
    setCurrentExportType(type);
    setIsOpen(false);
    
    try {
      onExportStart(type);
      
      switch (type) {
        case 'pdf':
          await exportAsPDF();
          break;
        case 'excel':
          await exportAsExcel();
          break;
        case 'csv':
          exportAsCSV();
          break;
        case 'json':
          exportAsJSON();
          break;
        case 'image':
          await exportAsImage();
          break;
        default:
          throw new Error(`Unsupported export type: ${type}`);
      }
      
      onExportComplete(type);
    } catch (error) {
      console.error(`Error exporting as ${type}:`, error);
      onExportError(error, type);
    } finally {
      setIsExporting(false);
      setCurrentExportType('');
    }
  };
  
  // Export as PDF
  const exportAsPDF = async () => {
    if (!elementRef && !data) {
      throw new Error('Either elementRef or data is required for PDF export');
    }
    
    const filename = Utils.generateFilename(getBaseFilename(), 'pdf');
    
    if (elementRef && elementRef.current) {
      // Export element as PDF
      const blob = await PDF.exportFromHTML(elementRef.current, {
        filename,
        title: projectName || 'Export',
        orientation: 'portrait',
        pageSize: 'A4'
      });
      
      PDF.saveToFile(blob, filename);
    } else {
      // Generate HTML from data and export as PDF
      // This is a simplified example - real implementation would generate proper HTML
      const html = `<div><h1>${projectName || 'Export'}</h1><pre>${JSON.stringify(data, null, 2)}</pre></div>`;
      
      const blob = await PDF.exportFromHTML(html, {
        filename,
        title: projectName || 'Export',
        orientation: 'portrait',
        pageSize: 'A4'
      });
      
      PDF.saveToFile(blob, filename);
    }
  };
  
  // Export as Excel
  const exportAsExcel = async () => {
    if (!data) {
      throw new Error('Data is required for Excel export');
    }
    
    const filename = Utils.generateFilename(getBaseFilename(), 'xlsx');
    
    const blob = await Excel.exportFromJSON(data, {
      filename,
      sheetName: projectName || 'Export'
    });
    
    Excel.saveToFile(blob, filename);
  };
  
  // Export as CSV
  const exportAsCSV = () => {
    if (!data || !Array.isArray(data)) {
      throw new Error('Array data is required for CSV export');
    }
    
    const filename = Utils.generateFilename(getBaseFilename(), 'csv');
    
    const csvContent = CSV.exportFromJSON(data, {
      filename,
      includeHeaders: true
    });
    
    CSV.saveToFile(csvContent, filename);
  };
  
  // Export as JSON
  const exportAsJSON = () => {
    if (!data) {
      throw new Error('Data is required for JSON export');
    }
    
    const filename = Utils.generateFilename(getBaseFilename(), 'json');
    
    const jsonContent = JSON_EXPORT.stringify(data, {
      filename,
      indent: 2
    });
    
    JSON_EXPORT.saveToFile(jsonContent, filename);
  };
  
  // Export as image
  const exportAsImage = async () => {
    if (!elementRef || !elementRef.current) {
      throw new Error('Element reference is required for image export');
    }
    
    const filename = Utils.generateFilename(getBaseFilename(), 'png');
    
    const blob = await Image.captureElement(elementRef.current, {
      filename,
      type: 'png',
      scale: 2
    });
    
    Image.saveToFile(blob, filename);
  };
  
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Export Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        disabled={disabled || isExporting}
        className={`flex items-center justify-center px-4 py-2 rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          disabled || isExporting
            ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
        }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {isExporting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Exporting {currentExportType.toUpperCase()}...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </>
        )}
      </button>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {exportTypes.includes('pdf') && (
              <button
                onClick={() => handleExport('pdf')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                role="menuitem"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                PDF Document
              </button>
            )}
            
            {exportTypes.includes('excel') && (
              <button
                onClick={() => handleExport('excel')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                role="menuitem"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Excel Spreadsheet
              </button>
            )}
            
            {exportTypes.includes('csv') && (
              <button
                onClick={() => handleExport('csv')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                role="menuitem"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                CSV File
              </button>
            )}
            
            {exportTypes.includes('json') && (
              <button
                onClick={() => handleExport('json')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                role="menuitem"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                JSON Data
              </button>
            )}
            
            {exportTypes.includes('image') && elementRef && (
              <button
                onClick={() => handleExport('image')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                role="menuitem"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                PNG Image
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

ExportMenu.propTypes = {
  data: PropTypes.any,
  projectName: PropTypes.string,
  elementRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  exportTypes: PropTypes.arrayOf(PropTypes.oneOf(['pdf', 'excel', 'csv', 'json', 'image'])),
  disabled: PropTypes.bool,
  onExportStart: PropTypes.func,
  onExportComplete: PropTypes.func,
  onExportError: PropTypes.func,
  className: PropTypes.string
};

export default ExportMenu;
