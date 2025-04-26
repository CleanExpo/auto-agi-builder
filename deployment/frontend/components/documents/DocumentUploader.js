import React, { useState, useRef } from 'react';
import { useProject, useUI } from '../../contexts';

/**
 * Document Uploader Component
 * 
 * Handles document uploads with file type validation, preview, and progress indication
 */
const DocumentUploader = ({ onUploadComplete }) => {
  const { currentProject } = useProject();
  const { toast } = useUI();
  
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  
  // Accepted file types
  const acceptedFileTypes = {
    'application/pdf': 'PDF',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
    'application/msword': 'DOC',
    'text/plain': 'TXT',
    'text/markdown': 'MD',
    'text/csv': 'CSV',
    'application/json': 'JSON'
  };
  
  // Helper to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = [];
    
    // Validate file types
    for (const file of selectedFiles) {
      if (acceptedFileTypes[file.type]) {
        validFiles.push({
          file,
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: file.type,
          size: file.size,
          progress: 0,
          error: null,
          uploaded: false
        });
      } else {
        toast.error(`File type not supported: ${file.name}`);
      }
    }
    
    setFiles(prev => [...prev, ...validFiles]);
  };
  
  // Remove a file from the list
  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };
  
  // Start upload process
  const handleUpload = async () => {
    if (!currentProject) {
      toast.error('Please select a project first');
      return;
    }
    
    if (files.length === 0) {
      toast.error('Please select files to upload');
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Upload each file with progress tracking
      const uploadPromises = files.map(async (fileObj, index) => {
        const formData = new FormData();
        formData.append('file', fileObj.file);
        formData.append('projectId', currentProject.id);
        
        try {
          // Simulating upload progress
          const totalFiles = files.length;
          
          // In a real implementation, you would use the actual API call with progress tracking
          // For example with axios:
          // const response = await api.post('/upload', formData, {
          //   onUploadProgress: (progressEvent) => {
          //     const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          //     setFiles(prev => prev.map(f => 
          //       f.id === fileObj.id ? { ...f, progress: percentCompleted } : f
          //     ));
          //     
          //     // Update overall progress
          //     const overallProgress = ((index / totalFiles) + (percentCompleted / 100 / totalFiles)) * 100;
          //     setUploadProgress(Math.round(overallProgress));
          //   }
          // });
          
          // Simulated upload
          await new Promise(resolve => {
            let progress = 0;
            const interval = setInterval(() => {
              progress += 5;
              if (progress > 100) {
                clearInterval(interval);
                resolve();
                return;
              }
              
              // Update individual file progress
              setFiles(prev => prev.map(f => 
                f.id === fileObj.id ? { ...f, progress } : f
              ));
              
              // Update overall progress
              const overallProgress = ((index / totalFiles) + (progress / 100 / totalFiles)) * 100;
              setUploadProgress(Math.round(overallProgress));
            }, 100);
          });
          
          // Mark as uploaded
          setFiles(prev => prev.map(f => 
            f.id === fileObj.id ? { ...f, uploaded: true, progress: 100 } : f
          ));
          
          return { success: true, fileId: fileObj.id };
        } catch (error) {
          setFiles(prev => prev.map(f => 
            f.id === fileObj.id ? { ...f, error: 'Upload failed', progress: 0 } : f
          ));
          return { success: false, fileId: fileObj.id, error };
        }
      });
      
      // Wait for all uploads to complete
      const results = await Promise.all(uploadPromises);
      const successCount = results.filter(r => r.success).length;
      
      if (successCount === files.length) {
        toast.success(`Successfully uploaded ${successCount} file${successCount !== 1 ? 's' : ''}`);
        if (onUploadComplete) {
          onUploadComplete(files.map(f => ({
            id: f.id,
            name: f.name,
            type: f.type,
            size: f.size
          })));
        }
      } else {
        toast.warning(`Uploaded ${successCount} of ${files.length} file${files.length !== 1 ? 's' : ''}`);
      }
    } catch (error) {
      toast.error('Upload failed: ' + (error.message || 'Unknown error'));
    } finally {
      setUploading(false);
      setUploadProgress(100);
    }
  };
  
  // Trigger file input click
  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
      <div className="space-y-6">
        {/* Upload Area */}
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
            uploading ? 'opacity-50 pointer-events-none' : ''
          }`}
          onClick={openFileSelector}
        >
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
            accept={Object.keys(acceptedFileTypes).join(',')}
          />
          
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
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
            />
          </svg>
          
          <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            Click to select files or drag and drop
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Supported formats: PDF, DOCX, DOC, TXT, MD, CSV, JSON
          </p>
        </div>
        
        {/* File List */}
        {files.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Selected Files ({files.length})
            </h4>
            <ul className="space-y-2">
              {files.map(file => (
                <li key={file.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="flex-shrink-0 h-8 w-8 rounded flex items-center justify-center bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200">
                        {acceptedFileTypes[file.type]?.charAt(0) || '?'}
                      </span>
                      <div className="ml-3 truncate">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    
                    {!uploading && !file.uploaded && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(file.id);
                        }}
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        title="Remove file"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                    
                    {file.uploaded && (
                      <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  
                  {/* Progress bar */}
                  {(uploading || file.progress > 0) && !file.error && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {/* Error message */}
                  {file.error && (
                    <p className="mt-1 text-xs text-red-500">{file.error}</p>
                  )}
                </li>
              ))}
            </ul>
            
            {/* Upload button */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleUpload}
                disabled={uploading || files.every(f => f.uploaded)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading ({uploadProgress}%)
                  </>
                ) : files.every(f => f.uploaded) ? (
                  'Files Uploaded'
                ) : (
                  'Upload Files'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUploader;
