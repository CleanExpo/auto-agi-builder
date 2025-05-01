import React, { useState } from 'react';
import { useProject, useUI } from '../../contexts';

/**
 * Prototype Viewer Component
 * 
 * Displays the generated prototype with file structure, code snippets, and API endpoints
 */
const PrototypeViewer = ({ prototype }) => {
  const { toast } = useUI();
  
  const [activeTab, setActiveTab] = useState('file-structure');
  const [expandedDirs, setExpandedDirs] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedSnippet, setSelectedSnippet] = useState(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  
  if (!prototype) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 text-center">
        <svg 
          className="mx-auto h-12 w-12 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1} 
            d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No prototype available</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Generate a prototype first using the generator.
        </p>
      </div>
    );
  }
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Toggle directory expansion
  const toggleDirExpand = (path) => {
    setExpandedDirs(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };
  
  // Get file icon based on file type
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'js':
      case 'jsx':
        return '📄 JS';
      case 'ts':
      case 'tsx':
        return '📄 TS';
      case 'html':
        return '📄 HTML';
      case 'css':
      case 'scss':
      case 'sass':
        return '📄 CSS';
      case 'json':
        return '📄 JSON';
      case 'md':
        return '📄 MD';
      case 'vue':
        return '📄 Vue';
      case 'svg':
        return '📄 SVG';
      case 'ico':
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return '📄 IMG';
      default:
        return '📄';
    }
  };
  
  // Get file size formatted
  const getFormattedFileSize = (bytes) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  };
  
  // Handle file selection
  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setSelectedSnippet(null);
    setSelectedEndpoint(null);
  };
  
  // Handle snippet selection
  const handleSnippetSelect = (snippet) => {
    setSelectedSnippet(snippet);
    setSelectedFile(null);
    setSelectedEndpoint(null);
  };
  
  // Handle endpoint selection
  const handleEndpointSelect = (endpoint) => {
    setSelectedEndpoint(endpoint);
    setSelectedFile(null);
    setSelectedSnippet(null);
  };
  
  // Render file tree recursively
  const renderFileTree = (items, path = '') => {
    return (
      <ul className="pl-4 mt-1">
        {items.map((item) => {
          const itemPath = `${path}/${item.name}`;
          
          if (item.type === 'directory') {
            const isExpanded = expandedDirs[itemPath] !== false; // Default to expanded
            
            return (
              <li key={itemPath} className="py-1">
                <div
                  className="flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1"
                  onClick={() => toggleDirExpand(itemPath)}
                >
                  <span className="mr-1">{isExpanded ? '📂' : '📁'}</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.name}</span>
                </div>
                
                {isExpanded && item.children && (
                  renderFileTree(item.children, itemPath)
                )}
              </li>
            );
          } else {
            return (
              <li key={itemPath} className="py-1">
                <div
                  className={`flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1 ${
                    selectedFile === item ? 'bg-blue-50 dark:bg-blue-900' : ''
                  }`}
                  onClick={() => handleFileSelect(item)}
                >
                  <span className="mr-1">{getFileIcon(item.name)}</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                  <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                    {getFormattedFileSize(item.size)}
                  </span>
                </div>
              </li>
            );
          }
        })}
      </ul>
    );
  };
  
  // Render code snippets
  const renderCodeSnippets = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Component Snippets
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Code generated from requirements
            </p>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
            {prototype.codeSnippets.map((snippetGroup) => (
              <div key={snippetGroup.requirementId} className="p-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {snippetGroup.requirementTitle}
                </h4>
                
                <div className="space-y-2">
                  {snippetGroup.snippets.map((snippet, idx) => (
                    <div
                      key={idx}
                      className={`cursor-pointer p-2 rounded ${
                        selectedSnippet === snippet 
                          ? 'bg-blue-50 dark:bg-blue-900' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => handleSnippetSelect(snippet)}
                    >
                      <div className="flex items-center">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {snippet.name}
                        </span>
                        <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                          {snippet.language}
                        </span>
                      </div>
                      
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                        {snippet.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {selectedSnippet ? selectedSnippet.name : 'Code Preview'}
            </h3>
          </div>
          
          {selectedSnippet ? (
            <div className="p-4">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {selectedSnippet.code}
                </pre>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    // In a real app, this would copy to clipboard
                    navigator.clipboard.writeText(selectedSnippet.code);
                    toast.success('Code copied to clipboard');
                  }}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Copy Code
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Select a component to view its code
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Render API endpoints
  const renderApiEndpoints = () => {
    if (!prototype.apiEndpoints || prototype.apiEndpoints.length === 0) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No API endpoints available. Enable API generation in settings.
          </p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              API Endpoints
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Auto-generated API definitions
            </p>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
            {prototype.apiEndpoints.map((endpoint, idx) => (
              <div
                key={idx}
                className={`p-4 cursor-pointer ${
                  selectedEndpoint === endpoint 
                    ? 'bg-blue-50 dark:bg-blue-900' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => handleEndpointSelect(endpoint)}
              >
                <div className="flex items-center">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    endpoint.method === 'GET' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                      : endpoint.method === 'POST' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                        : endpoint.method === 'PUT' 
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                          : endpoint.method === 'DELETE' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {endpoint.method}
                  </span>
                  <span className="ml-2 text-sm font-mono text-gray-700 dark:text-gray-300 truncate">
                    {endpoint.path}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {endpoint.description}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {selectedEndpoint ? 'API Details' : 'API Preview'}
            </h3>
          </div>
          
          {selectedEndpoint ? (
            <div className="p-4">
              <div className="flex items-center mb-4">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  selectedEndpoint.method === 'GET' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                    : selectedEndpoint.method === 'POST' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                      : selectedEndpoint.method === 'PUT' 
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                        : selectedEndpoint.method === 'DELETE' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {selectedEndpoint.method}
                </span>
                <span className="ml-2 text-sm font-mono text-gray-700 dark:text-gray-300">
                  {selectedEndpoint.path}
                </span>
              </div>
              
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                {selectedEndpoint.description}
              </p>
              
              {/* Path Parameters */}
              {selectedEndpoint.pathParams && selectedEndpoint.pathParams.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Path Parameters
                  </h4>
                  <ul className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                    {selectedEndpoint.pathParams.map((param, idx) => (
                      <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 py-1">
                        <span className="font-mono">{param}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Query Parameters */}
              {selectedEndpoint.queryParams && selectedEndpoint.queryParams.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Query Parameters
                  </h4>
                  <ul className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                    {selectedEndpoint.queryParams.map((param, idx) => (
                      <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 py-1">
                        <span className="font-mono">{param}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Request Body */}
              {selectedEndpoint.requestBodyExample && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Request Body
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-gray-800 dark:text-gray-200">
                      {JSON.stringify(selectedEndpoint.requestBodyExample, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              
              {/* Response */}
              {selectedEndpoint.responseExample && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Response
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-gray-800 dark:text-gray-200">
                      {JSON.stringify(selectedEndpoint.responseExample, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Select an API endpoint to view its details
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Render the prototype preview
  const renderPreview = () => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Multi-Device Preview
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Desktop
            </h4>
            <div className="aspect-w-16 aspect-h-9 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 overflow-hidden">
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Preview not available in demo
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tablet
            </h4>
            <div className="aspect-w-3 aspect-h-4 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 overflow-hidden">
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Preview not available in demo
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mobile
            </h4>
            <div className="aspect-w-9 aspect-h-16 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 overflow-hidden">
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Preview not available in demo
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Prototype Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{prototype.name}</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {prototype.description}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Created: {formatDate(prototype.createdAt)}
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <button 
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => toast.info('Download functionality would be implemented in a real app')}
            >
              Download Zip
            </button>
            <button 
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              onClick={() => toast.info('Deployment functionality would be implemented in a real app')}
            >
              Deploy
            </button>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-2 text-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">Technology</span>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {prototype.settings.technology}
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-2 text-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">Architecture</span>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {prototype.settings.architecture}
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-2 text-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">Language</span>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {prototype.settings.language}
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-2 text-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">Styling</span>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {prototype.settings.styling}
            </p>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('file-structure')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'file-structure'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
            }`}
          >
            File Structure
          </button>
          <button
            onClick={() => setActiveTab('code-snippets')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'code-snippets'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
            }`}
          >
            Code Snippets
          </button>
          <button
            onClick={() => setActiveTab('api-endpoints')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'api-endpoints'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
            }`}
          >
            API Endpoints
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'preview'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
            }`}
          >
            Preview
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      <div>
        {activeTab === 'file-structure' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                File Structure
              </h3>
              {renderFileTree(prototype.fileStructure)}
            </div>
            
            <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {selectedFile ? selectedFile.name : 'File Preview'}
                </h3>
              </div>
              
              {selectedFile ? (
                <div className="p-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    This is a demo preview. In a real application, this would show the actual file content.
                  </p>
                  
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <p className="text-xs font-mono text-gray-600 dark:text-gray-400">
                      File: {selectedFile.name}<br />
                      Type: {selectedFile.language}<br />
                      Size: {getFormattedFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    Select a file to preview it
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'code-snippets' && renderCodeSnippets()}
        
        {activeTab === 'api-endpoints' && renderApiEndpoints()}
        
        {activeTab === 'preview' && renderPreview()}
      </div>
    </div>
  );
};

export default PrototypeViewer;
