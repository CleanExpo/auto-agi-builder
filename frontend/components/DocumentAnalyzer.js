import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useUI } from '../contexts/UIContext';
import { useProject } from '../contexts/ProjectContext';

/**
 * DocumentAnalyzer Component
 * Analyzes uploaded documents and extracts information such as requirements,
 * entities, and other useful project data.
 */
export default function DocumentAnalyzer({ documentId = null, projectId = null }) {
  const router = useRouter();
  const { showNotification, showModal } = useUI();
  const { addRequirements } = useProject();
  
  // State for document and analysis
  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [selectedEntities, setSelectedEntities] = useState({
    requirements: true,
    stakeholders: false,
    risks: false,
    dependencies: false,
    constraints: true
  });
  
  // Refs for sections
  const resultsRef = useRef(null);
  
  // Fetch document data when component mounts
  useEffect(() => {
    if (documentId) {
      fetchDocument();
    }
  }, [documentId]);

  // Fetch document data
  const fetchDocument = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/v1/documents/${documentId}`);
      if (!response.ok) throw new Error('Failed to fetch document');
      
      const data = await response.json();
      setDocument(data);
      
      // If document was already analyzed, fetch the analysis
      if (data.isAnalyzed) {
        fetchAnalysis();
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching document:', err);
      setError('Could not load document information. Please try again.');
      setIsLoading(false);
    }
  };

  // Fetch analysis if it exists
  const fetchAnalysis = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/v1/documents/${documentId}/analysis`);
      if (!response.ok) throw new Error('Failed to fetch document analysis');
      
      const data = await response.json();
      setAnalysis(data);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching analysis:', err);
      setError('Could not load document analysis. Please try again.');
      setIsLoading(false);
    }
  };

  // Analyze document
  const analyzeDocument = async () => {
    try {
      setIsAnalyzing(true);
      setError(null);
      
      // Determine which entities to extract
      const extractionOptions = {
        extractRequirements: selectedEntities.requirements,
        extractStakeholders: selectedEntities.stakeholders,
        extractRisks: selectedEntities.risks,
        extractDependencies: selectedEntities.dependencies,
        extractConstraints: selectedEntities.constraints
      };
      
      const response = await fetch(`/api/v1/documents/${documentId}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId,
          options: extractionOptions
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to analyze document');
      }
      
      const analysisData = await response.json();
      setAnalysis(analysisData);
      
      // Show success notification
      showNotification({
        type: 'success',
        message: 'Document analyzed successfully'
      });
      
      // Scroll to results
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth' });
      }
      
      setIsAnalyzing(false);
    } catch (err) {
      console.error('Error analyzing document:', err);
      setError('Analysis failed. Please try again or check document format.');
      setIsAnalyzing(false);
    }
  };

  // Handle importing requirements to project
  const handleImportRequirements = async () => {
    if (!analysis || !analysis.requirements || analysis.requirements.length === 0) {
      showNotification({
        type: 'warning',
        message: 'No requirements found to import'
      });
      return;
    }
    
    try {
      // Map extracted requirements to the format expected by the API
      const requirementsToImport = analysis.requirements.map(req => ({
        title: req.title || 'Untitled Requirement',
        description: req.description || '',
        type: mapRequirementType(req.category || 'functional'),
        priority: mapRequirementPriority(req.priority || 'medium'),
        status: 'draft',
        complexity: req.complexity || 'medium',
        storyPoints: req.effort ? Math.ceil(req.effort) : 3, // Default to 3 story points if not provided
        tags: req.tags || [],
        acceptanceCriteria: req.acceptanceCriteria || '',
        dependencies: req.dependencies || []
      }));
      
      // Add requirements to the project
      await addRequirements(projectId, requirementsToImport);
      
      // Show success notification
      showNotification({
        type: 'success',
        message: `${requirementsToImport.length} requirement(s) imported successfully`
      });
      
      // Show import summary modal
      showModal('infoModal', {
        title: 'Requirements Import Complete',
        content: (
          <div className="space-y-4">
            <p>Successfully imported {requirementsToImport.length} requirement(s) into your project.</p>
            <div>
              <h3 className="font-semibold">Import Summary:</h3>
              <ul className="list-disc list-inside ml-4 mt-2">
                <li>{requirementsToImport.filter(r => r.type === 'functional').length} functional requirements</li>
                <li>{requirementsToImport.filter(r => r.type === 'non-functional').length} non-functional requirements</li>
                <li>{requirementsToImport.filter(r => r.type !== 'functional' && r.type !== 'non-functional').length} other requirements</li>
              </ul>
            </div>
            <p>You can now view and edit these requirements in the Requirements tab.</p>
          </div>
        ),
        onConfirm: () => router.push(`/projects/${projectId}/requirements`)
      });
      
    } catch (err) {
      console.error('Error importing requirements:', err);
      showNotification({
        type: 'error',
        message: 'Failed to import requirements. Please try again.'
      });
    }
  };
  
  // Map extracted requirement types to our system's types
  const mapRequirementType = (extractedType) => {
    // Normalize the type string
    const normalizedType = extractedType.toLowerCase().trim();
    
    if (normalizedType.includes('functional')) {
      return 'functional';
    } else if (normalizedType.includes('non-functional') || normalizedType.includes('nonfunctional')) {
      return 'non-functional';
    } else if (normalizedType.includes('tech') || normalizedType.includes('system')) {
      return 'technical';
    } else if (normalizedType.includes('feature')) {
      return 'feature';
    } else if (normalizedType.includes('bug') || normalizedType.includes('fix')) {
      return 'bug';
    } else if (normalizedType.includes('improve') || normalizedType.includes('enhance')) {
      return 'improvement';
    } else if (normalizedType.includes('doc')) {
      return 'documentation';
    } else {
      return 'functional'; // Default to functional
    }
  };
  
  // Map extracted priorities to our system's priorities
  const mapRequirementPriority = (extractedPriority) => {
    // Normalize the priority string
    const normalizedPriority = extractedPriority.toLowerCase().trim();
    
    if (normalizedPriority.includes('critical') || normalizedPriority.includes('must') || normalizedPriority === 'high+') {
      return 'critical';
    } else if (normalizedPriority.includes('high') || normalizedPriority.includes('important')) {
      return 'high';
    } else if (normalizedPriority.includes('medium') || normalizedPriority.includes('should')) {
      return 'medium';
    } else if (normalizedPriority.includes('low') || normalizedPriority.includes('could')) {
      return 'low';
    } else {
      return 'medium'; // Default to medium
    }
  };

  // Toggle entity extraction selection
  const toggleEntitySelection = (entity) => {
    setSelectedEntities(prevState => ({
      ...prevState,
      [entity]: !prevState[entity]
    }));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center p-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-800">
        <p>{error}</p>
        <button 
          onClick={fetchDocument}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  // No document state
  if (!document) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg text-gray-500 text-center">
        <p>Please select a document to analyze</p>
      </div>
    );
  }

  return (
    <div className="document-analyzer bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Document information */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h2 className="text-xl font-bold mb-2 text-gray-800">{document.name}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span>{document.fileType}</span>
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{new Date(document.uploadedAt).toLocaleDateString()}</span>
              </div>
              {document.pageCount && (
                <div className="hidden md:flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>{document.pageCount} pages</span>
                </div>
              )}
            </div>
          </div>
          
          {document.isAnalyzed && analysis ? (
            <div className="mt-4 md:mt-0">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Analyzed
              </span>
            </div>
          ) : (
            <div className="mt-4 md:mt-0">
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                Not Analyzed
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Analysis options */}
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <h3 className="text-md font-semibold mb-4 text-gray-700">Extract information from this document</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Requirements */}
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              selectedEntities.requirements ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => toggleEntitySelection('requirements')}
          >
            <div className="flex items-center mb-2">
              <input 
                type="checkbox" 
                checked={selectedEntities.requirements} 
                onChange={() => toggleEntitySelection('requirements')}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 font-medium text-gray-700">Requirements</label>
            </div>
            <p className="text-xs text-gray-500">Extract functional and non-functional requirements</p>
          </div>
          
          {/* Stakeholders */}
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              selectedEntities.stakeholders ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => toggleEntitySelection('stakeholders')}
          >
            <div className="flex items-center mb-2">
              <input 
                type="checkbox" 
                checked={selectedEntities.stakeholders} 
                onChange={() => toggleEntitySelection('stakeholders')}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 font-medium text-gray-700">Stakeholders</label>
            </div>
            <p className="text-xs text-gray-500">Identify key stakeholders and their roles</p>
          </div>
          
          {/* Risks */}
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              selectedEntities.risks ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => toggleEntitySelection('risks')}
          >
            <div className="flex items-center mb-2">
              <input 
                type="checkbox" 
                checked={selectedEntities.risks} 
                onChange={() => toggleEntitySelection('risks')}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 font-medium text-gray-700">Risks</label>
            </div>
            <p className="text-xs text-gray-500">Identify potential project risks and concerns</p>
          </div>
          
          {/* Dependencies */}
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              selectedEntities.dependencies ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => toggleEntitySelection('dependencies')}
          >
            <div className="flex items-center mb-2">
              <input 
                type="checkbox" 
                checked={selectedEntities.dependencies} 
                onChange={() => toggleEntitySelection('dependencies')}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 font-medium text-gray-700">Dependencies</label>
            </div>
            <p className="text-xs text-gray-500">Identify external dependencies and integrations</p>
          </div>
          
          {/* Constraints */}
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              selectedEntities.constraints ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => toggleEntitySelection('constraints')}
          >
            <div className="flex items-center mb-2">
              <input 
                type="checkbox" 
                checked={selectedEntities.constraints} 
                onChange={() => toggleEntitySelection('constraints')}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 font-medium text-gray-700">Constraints</label>
            </div>
            <p className="text-xs text-gray-500">Identify project constraints and limitations</p>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={analyzeDocument}
            disabled={isAnalyzing || !Object.values(selectedEntities).some(value => value === true)}
            className={`${
              isAnalyzing || !Object.values(selectedEntities).some(value => value === true)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            } px-4 py-2 rounded-md transition-colors`}
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : document.isAnalyzed ? 'Re-analyze Document' : 'Analyze Document'}
          </button>
        </div>
      </div>
      
      {/* Analysis results */}
      {analysis && (
        <div ref={resultsRef} className="p-6">
          <h3 className="text-lg font-bold mb-6">Analysis Results</h3>
          
          {/* Requirements section */}
          {analysis.requirements && analysis.requirements.length > 0 && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-semibold">Requirements ({analysis.requirements.length})</h4>
                {projectId && (
                  <button
                    onClick={handleImportRequirements}
                    className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Import to Project
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                {analysis.requirements.map((requirement, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <h5 className="font-medium">{requirement.title || 'Untitled Requirement'}</h5>
                      <div className="flex space-x-2">
                        {requirement.priority && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            requirement.priority.toLowerCase().includes('high')
                              ? 'bg-orange-100 text-orange-800'
                              : requirement.priority.toLowerCase().includes('critical')
                              ? 'bg-red-100 text-red-800'
                              : requirement.priority.toLowerCase().includes('low')
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {requirement.priority}
                          </span>
                        )}
                        {requirement.category && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {requirement.category}
                          </span>
                        )}
                      </div>
                    </div>
                    {requirement.description && (
                      <p className="mt-2 text-sm text-gray-600">{requirement.description}</p>
                    )}
                    {requirement.tags && requirement.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {requirement.tags.map((tag, tagIndex) => (
                          <span key={tagIndex} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {requirement.source && (
                      <div className="mt-2 text-xs text-gray-500">
                        Source: Page {requirement.source.page || '?'}, Section {requirement.source.section || '?'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Stakeholders section */}
          {analysis.stakeholders && analysis.stakeholders.length > 0 && (
            <div className="mb-8">
              <h4 className="text-md font-semibold mb-4">Stakeholders ({analysis.stakeholders.length})</h4>
              <div className="space-y-3">
                {analysis.stakeholders.map((stakeholder, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between">
                      <h5 className="font-medium">{stakeholder.name || 'Unnamed Stakeholder'}</h5>
                      {stakeholder.role && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {stakeholder.role}
                        </span>
                      )}
                    </div>
                    {stakeholder.description && (
                      <p className="mt-1 text-sm text-gray-600">{stakeholder.description}</p>
                    )}
                    {stakeholder.interests && stakeholder.interests.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs font-medium text-gray-500">Interests: </span>
                        <span className="text-xs text-gray-600">{stakeholder.interests.join(', ')}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Risks section */}
          {analysis.risks && analysis.risks.length > 0 && (
            <div className="mb-8">
              <h4 className="text-md font-semibold mb-4">Risks ({analysis.risks.length})</h4>
              <div className="space-y-3">
                {analysis.risks.map((risk, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between">
                      <h5 className="font-medium">{risk.title || 'Unnamed Risk'}</h5>
                      {risk.severity && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          risk.severity.toLowerCase().includes('high')
                            ? 'bg-red-100 text-red-800'
                            : risk.severity.toLowerCase().includes('medium')
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {risk.severity}
                        </span>
                      )}
                    </div>
                    {risk.description && (
                      <p className="mt-1 text-sm text-gray-600">{risk.description}</p>
                    )}
                    {risk.mitigation && (
                      <div className="mt-2">
                        <span className="text-xs font-medium text-gray-500">Mitigation: </span>
                        <span className="text-xs text-gray-600">{risk.mitigation}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Dependencies section */}
          {analysis.dependencies && analysis.dependencies.length > 0 && (
            <div className="mb-8">
              <h4 className="text-md font-semibold mb-4">Dependencies ({analysis.dependencies.length})</h4>
              <div className="space-y-3">
                {analysis.dependencies.map((dependency, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between">
                      <h5 className="font-medium">{dependency.name || 'Unnamed Dependency'}</h5>
                      {dependency.type && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {dependency.type}
                        </span>
                      )}
                    </div>
                    {dependency.description && (
                      <p className="mt-1 text-sm text-gray-600">{dependency.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Constraints section */}
          {analysis.constraints && analysis.constraints.length > 0 && (
            <div className="mb-8">
              <h4 className="text-md font-semibold mb-4">Constraints ({analysis.constraints.length})</h4>
              <div className="space-y-3">
                {analysis.constraints.map((constraint, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between">
                      <h5 className="font-medium">{constraint.title || 'Unnamed Constraint'}</h5>
                      {constraint.type && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {constraint.type}
                        </span>
                      )}
                    </div>
                    {constraint.description && (
                      <p className="mt-1 text-sm text-gray-600">{constraint.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Analysis not found sections */}
          {!analysis.requirements?.length &&
           !analysis.stakeholders?.length &&
           !analysis.risks?.length &&
           !analysis.dependencies?.length &&
           !analysis.constraints?.length && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">No entities found</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>No entities were found in this document based on your extraction options. Try selecting different options or analyze a different document.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
