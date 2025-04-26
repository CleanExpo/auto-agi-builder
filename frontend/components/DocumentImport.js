import React, { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useUI } from '../contexts/UIContext';

/**
 * DocumentImport Component
 * Handles document uploading and displays upload status
 */
export default function DocumentImport({ projectId = null, onDocumentUploaded }) {
  const router = useRouter();
  const { showNotification } = useUI();
  const fileInputRef = useRef(null);
  
  // State
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  
  // Handle file drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileSelected(file);
    }
  }, []);

  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  // Handle file input change
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFileSelected(file);
    }
  };
  
  // Handle file selection
  const handleFileSelected = (file) => {
    // Reset state
    setError(null);
    setUploadProgress(0);
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown'];
    
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload a PDF, Word document, or text file.');
      return;
    }
    
    // Validate file size (max 20MB)
    const maxSize = 20 * 1024 * 1024; // 20MB in bytes
    
    if (file.size > maxSize) {
      setError('File is too large. Maximum file size is 20MB.');
      return;
    }
    
    // Set file info
    setFileName(file.name);
    setFileSize(file.size);
    
    // Upload the file
    uploadFile(file);
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  // Get file type icon
  const getFileTypeIcon = (filename) => {
    if (!filename) return null;
    
    const extension = filename.split('.').pop().toLowerCase();
    
    if (extension === 'pdf') {
      return (
        <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          <path d="M8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
        </svg>
      );
    } else if (extension === 'doc' || extension === 'docx') {
      return (
        <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          <path d="M8 10a1 1 0 100-2 1 1 0 000 2zm0 2a1 1 0 100 2 1 1 0 000-2zm9-4a1 1 0 10-2 0v6a1 1 0 102 0V8z" />
        </svg>
      );
    } else if (extension === 'txt' || extension === 'md') {
      return (
        <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          <path d="M8 8a1 1 0 00-1 1v2a1 1 0 001 1h4a1 1 0 001-1V9a1 1 0 00-1-1H8z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
    }
  };
  
  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Upload file
  const uploadFile = async (file) => {
    setIsUploading(true);
    
    try {
      // Create FormData object
      const formData = new FormData();
      formData.append('file', file);
      
      if (projectId) {
        formData.append('projectId', projectId);
      }
      
      // Mock progress updates for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);
      
      // Upload file to server
      const response = await fetch('/api/v1/documents/upload', {
        method: 'POST',
        body: formData
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload document');
      }
      
      setUploadProgress(100);
      
      // Get the uploaded document data
      const documentData = await response.json();
      
      // Show success notification
      showNotification({
        type: 'success',
        message: 'Document uploaded successfully'
      });
      
      // Call the callback if provided
      if (onDocumentUploaded) {
        onDocumentUploaded(documentData);
      }
      
      // Reset form after a short delay
      setTimeout(() => {
        setIsUploading(false);
        setFileName('');
        setFileSize(0);
        setUploadProgress(0);
      }, 1500);
      
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Failed to upload document. Please try again.');
      setIsUploading(false);
    }
  };
  
  return (
    <div className="document-import bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">Upload Document</h2>
        
        {/* File drop zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center ${
            dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.md"
            onChange={handleFileInputChange}
            disabled={isUploading}
          />
          
          {!isUploading && !fileName ? (
            <>
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mt-2 font-medium">
                {dragActive ? 'Drop file here to upload' : 'Click to upload or drag and drop'}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                PDF, Word, or text file (max 20MB)
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center">
              {getFileTypeIcon(fileName)}
              <p className="mt-2 font-medium truncate max-w-full">{fileName}</p>
              <p className="text-sm text-gray-500">{formatFileSize(fileSize)}</p>
              
              {isUploading && (
                <div className="w-full mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-1">
                    {uploadProgress < 100 
                      ? `Uploading... ${uploadProgress}%` 
                      : 'Upload complete!'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Error message */}
        {error && (
          <div className="mt-4 bg-red-50 p-3 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
        
        {/* Upload tips */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Tips for best results:</h3>
          <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
            <li>PDFs with selectable text work best</li>
            <li>Structured documents with clear headings are easier to analyze</li>
            <li>For Word documents, ensure they are not password protected</li>
            <li>For optimal results, upload requirements documents, specification sheets, or project briefs</li>
          </ul>
        </div>
        
        {/* Support links */}
        <div className="mt-6 flex justify-between text-xs">
          <a href="#" className="text-indigo-600 hover:text-indigo-800">Supported file formats</a>
          <a href="#" className="text-indigo-600 hover:text-indigo-800">Help with document analysis</a>
        </div>
      </div>
    </div>
  );
}
