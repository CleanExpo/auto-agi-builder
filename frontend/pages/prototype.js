import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../components/layout/Layout';
import PrototypeGenerator from '../components/prototype/PrototypeGenerator';
import PrototypeViewer from '../components/prototype/PrototypeViewer';
import { useProject } from '../contexts/ProjectContext';
import { useUI } from '../contexts/UIContext';

/**
 * Prototype Page Component
 * 
 * Serves as the main prototype management page, providing both prototype 
 * generation and viewing capabilities. Switches between modes based on URL parameters.
 */
export default function PrototypePage() {
  const router = useRouter();
  const { id, prototypeId, view } = router.query;
  const { showNotification } = useUI();
  const { getProjectDetails } = useProject();
  
  // State
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('list'); // list, generate, view
  
  // Determine the mode based on URL parameters
  useEffect(() => {
    if (prototypeId) {
      setMode('view');
    } else if (view === 'generate') {
      setMode('generate');
    } else {
      setMode('list');
    }
  }, [prototypeId, view]);
  
  // Load project data
  useEffect(() => {
    if (id) {
      loadProjectData(id);
    }
  }, [id]);
  
  // Load project data
  const loadProjectData = async (projectId) => {
    try {
      setLoading(true);
      setError(null);
      
      const projectData = await getProjectDetails(projectId);
      setProject(projectData);
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading project:', err);
      setError('Failed to load project. Please try again.');
      setLoading(false);
    }
  };
  
  // Navigate to generate view
  const navigateToGenerate = () => {
    router.push(`/projects/${id}/prototype?view=generate`);
  };
  
  // Navigate to prototype list
  const navigateToList = () => {
    router.push(`/projects/${id}/prototype`);
  };
  
  // View prototype
  const viewPrototype = (prototypeId) => {
    router.push(`/projects/${id}/prototype/${prototypeId}`);
  };
  
  // Back to project
  const backToProject = () => {
    router.push(`/projects/${id}`);
  };
  
  // Loading state
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center p-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </Layout>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 p-4 rounded-lg text-red-800">
          <p>{error}</p>
          <button 
            onClick={() => loadProjectData(id)}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </Layout>
    );
  }
  
  // Prototype list component
  const PrototypeList = ({ prototypes = [] }) => {
    const [localPrototypes, setLocalPrototypes] = useState(prototypes);
    const [loadingPrototypes, setLoadingPrototypes] = useState(true);
    
    // Load prototypes
    useEffect(() => {
      if (id) {
        fetchPrototypes();
      }
    }, [id]);
    
    // Fetch prototypes
    const fetchPrototypes = async () => {
      try {
        setLoadingPrototypes(true);
        
        const response = await fetch(`/api/v1/projects/${id}/prototypes`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch prototypes');
        }
        
        const data = await response.json();
        setLocalPrototypes(data.prototypes || []);
        
        setLoadingPrototypes(false);
      } catch (err) {
        console.error('Error fetching prototypes:', err);
        showNotification({
          type: 'error',
          message: 'Failed to load prototypes. Please try again.'
        });
        setLoadingPrototypes(false);
      }
    };
    
    // Delete prototype
    const deletePrototype = async (prototypeId) => {
      try {
        const response = await fetch(`/api/v1/prototypes/${prototypeId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete prototype');
        }
        
        // Update local state
        setLocalPrototypes(prev => prev.filter(p => p.id !== prototypeId));
        
        showNotification({
          type: 'success',
          message: 'Prototype deleted successfully'
        });
      } catch (err) {
        console.error('Error deleting prototype:', err);
        showNotification({
          type: 'error',
          message: 'Failed to delete prototype. Please try again.'
        });
      }
    };
    
    // Loading prototype state
    if (loadingPrototypes) {
      return (
        <div className="flex justify-center items-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      );
    }
    
    // Empty state
    if (localPrototypes.length === 0) {
      return (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No prototypes yet</h3>
          <p className="text-gray-500 mb-6">
            Generate your first prototype to visualize your project's requirements
          </p>
          <button
            onClick={navigateToGenerate}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Generate Prototype
          </button>
        </div>
      );
    }
    
    // Prototype list
    return (
      <div>
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold">Project Prototypes</h2>
          <button
            onClick={navigateToGenerate}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Generate New Prototype
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {localPrototypes.map(prototype => (
            <div key={prototype.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4">
                {/* Prototype preview image (if available) */}
                <div className="bg-gray-100 h-40 rounded-md flex items-center justify-center mb-4">
                  {prototype.thumbnailUrl ? (
                    <img 
                      src={prototype.thumbnailUrl} 
                      alt={prototype.name} 
                      className="h-full w-full object-cover" 
                    />
                  ) : (
                    <div className="text-gray-500 text-sm">
                      {prototype.platform === 'web' ? (
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      ) : prototype.platform === 'mobile' ? (
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      ) : (
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      )}
                      Preview not available
                    </div>
                  )}
                </div>
                
                <h3 className="font-medium text-lg mb-1">{prototype.name}</h3>
                <div className="text-sm text-gray-500 mb-3">
                  <div className="flex items-center">
                    <span className="mr-2">
                      {prototype.platform} • {prototype.fidelity || 'Medium'} fidelity
                    </span>
                  </div>
                  <div>
                    Created {new Date(prototype.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                    {prototype.status || 'Ready'}
                  </span>
                  <div className="space-x-2">
                    <button
                      onClick={() => viewPrototype(prototype.id)}
                      className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                    >
                      View
                    </button>
                    <button
                      onClick={() => deletePrototype(prototype.id)}
                      className="px-3 py-1 bg-white border border-red-500 text-red-500 text-sm rounded hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <Layout>
      <Head>
        <title>
          {mode === 'view' ? 'View Prototype' : 
           mode === 'generate' ? 'Generate Prototype' : 
           'Prototypes'} | {project?.name || 'Project'}
        </title>
      </Head>
      
      <div className="mb-6">
        {/* Header navigation */}
        <div className="flex items-center text-sm mb-4">
          <button
            onClick={backToProject}
            className="text-gray-600 hover:text-gray-800"
          >
            Project
          </button>
          <span className="mx-2">›</span>
          <button
            onClick={navigateToList}
            className={`${mode === 'list' ? 'text-indigo-600 font-medium' : 'text-gray-600 hover:text-gray-800'}`}
          >
            Prototypes
          </button>
          
          {mode === 'generate' && (
            <>
              <span className="mx-2">›</span>
              <span className="text-indigo-600 font-medium">Generate</span>
            </>
          )}
          
          {mode === 'view' && (
            <>
              <span className="mx-2">›</span>
              <span className="text-indigo-600 font-medium">View</span>
            </>
          )}
        </div>
      </div>
      
      {/* Main content */}
      {mode === 'list' && (
        <PrototypeList />
      )}
      
      {mode === 'generate' && (
        <PrototypeGenerator projectId={id} />
      )}
      
      {mode === 'view' && prototypeId && (
        <PrototypeViewer prototypeId={prototypeId} projectId={id} />
      )}
    </Layout>
  );
}
