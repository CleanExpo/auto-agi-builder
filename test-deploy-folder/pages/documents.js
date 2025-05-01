import React, { useState, useEffect } from 'react';
import { withProtection } from '../components/auth/ProtectedRoute';
import Layout from '../components/layout/Layout';
import { useProject, useUI } from '../contexts';
import DocumentUploader from '../components/documents/DocumentUploader';
import DocumentAnalyzer from '../components/documents/DocumentAnalyzer';
import api from '../lib/api';

/**
 * Documents Page
 * 
 * Provides document upload and analysis functionality
 */
const DocumentsPage = () => {
  const { currentProject } = useProject();
  const { toast } = useUI();
  
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'analyze'
  
  // Fetch documents when current project changes
  useEffect(() => {
    fetchDocuments();
  }, [currentProject]);
  
  // Fetch documents from API
  const fetchDocuments = async () => {
    if (!currentProject) {
      setDocuments([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await api.get(`/projects/${currentProject.id}/documents`);
      setDocuments(response.data.documents);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch documents';
      toast.error(errorMessage);
      // Use demo data for now if API fails
      setDocuments(getDemoDocuments());
    } finally {
      setLoading(false);
    }
  };
  
  // Get demo documents data (for development)
  const getDemoDocuments = () => {
    return [
      {
        id: 'doc-1',
        name: 'project_requirements.pdf',
        type: 'application/pdf',
        size: 245678,
        createdAt: '2025-03-15T10:30:00Z',
        projectId: currentProject?.id
      },
      {
        id: 'doc-2',
        name: 'client_meeting_notes.docx',
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 125400,
        createdAt: '2025-03-20T14:45:00Z',
        projectId: currentProject?.id
      },
      {
        id: 'doc-3',
        name: 'api_documentation.txt',
        type: 'text/plain',
        size: 58942,
        createdAt: '2025-03-25T09:15:00Z',
        projectId: currentProject?.id
      }
    ];
  };
  
  // Handle document upload completion
  const handleUploadComplete = (uploadedDocs) => {
    setDocuments(prev => [...prev, ...uploadedDocs]);
    // If there were no documents before, switch to analyze tab after upload
    if (documents.length === 0 && uploadedDocs.length > 0) {
      setActiveTab('analyze');
    }
  };
  
  return (
    <Layout title="Document Management">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Documents</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {currentProject 
                  ? `Upload and analyze documents for ${currentProject.name}` 
                  : 'Select a project to manage documents'}
              </p>
            </div>
          </div>
          
          {/* Content */}
          {!currentProject ? (
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
                  d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" 
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No project selected</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Please select a project from the sidebar first
              </p>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex">
                  <button
                    onClick={() => setActiveTab('upload')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'upload'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
                    }`}
                  >
                    Upload Documents
                  </button>
                  <button
                    onClick={() => setActiveTab('analyze')}
                    className={`whitespace-nowrap ml-8 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'analyze'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
                    }`}
                  >
                    Analyze Documents{documents.length > 0 && ` (${documents.length})`}
                  </button>
                </nav>
              </div>
              
              {/* Tab content */}
              <div className="mt-4">
                {activeTab === 'upload' ? (
                  <DocumentUploader onUploadComplete={handleUploadComplete} />
                ) : (
                  <DocumentAnalyzer documents={documents} />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default withProtection(DocumentsPage);
