import React, { useState, useEffect } from 'react';
import { useProject, useUI } from '../../contexts';
import api from '../../lib/api';

/**
 * Document Analyzer Component
 * 
 * Analyzes uploaded documents and extracts insights, summaries, and key information
 */
const DocumentAnalyzer = ({ documents }) => {
  const { currentProject } = useProject();
  const { toast } = useUI();
  
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState({});
  const [activeDocument, setActiveDocument] = useState(null);
  const [extractionType, setExtractionType] = useState('summary');
  const [entityFilters, setEntityFilters] = useState({
    requirements: true,
    timelines: true,
    stakeholders: true,
    risks: true,
    costs: true
  });
  
  // Extraction options
  const extractionOptions = [
    { id: 'summary', label: 'Summary', icon: 'document-text' },
    { id: 'requirements', label: 'Requirements', icon: 'clipboard-check' },
    { id: 'entities', label: 'Key Entities', icon: 'identification' },
    { id: 'insights', label: 'Insights', icon: 'light-bulb' },
    { id: 'sentiment', label: 'Sentiment', icon: 'chart-bar' }
  ];
  
  // Entity filter options
  const entityFilterOptions = [
    { id: 'requirements', label: 'Requirements' },
    { id: 'timelines', label: 'Timelines' },
    { id: 'stakeholders', label: 'Stakeholders' },
    { id: 'risks', label: 'Risks' },
    { id: 'costs', label: 'Costs' }
  ];
  
  // Set first document as active when documents are loaded
  useEffect(() => {
    if (documents && documents.length > 0 && !activeDocument) {
      setActiveDocument(documents[0]);
    }
  }, [documents]);
  
  // Analyze a document
  const analyzeDocument = async (document) => {
    if (!document || analyzed[document.id]?.[extractionType]) return;
    
    setAnalyzing(true);
    
    try {
      // In a real implementation, this would be an API call to the analysis endpoint
      // const response = await api.post('/analyze-document', {
      //   documentId: document.id,
      //   projectId: currentProject?.id,
      //   extractionType,
      //   entityFilters: Object.entries(entityFilters)
      //     .filter(([_, enabled]) => enabled)
      //     .map(([key]) => key)
      // });
      
      // For demo purposes, return mock data based on document type and extraction type
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
      
      const mockAnalysisResults = generateMockAnalysisResults(document, extractionType);
      
      setAnalyzed(prev => ({
        ...prev,
        [document.id]: {
          ...prev[document.id],
          [extractionType]: mockAnalysisResults
        }
      }));
      
      toast.success(`Successfully analyzed ${document.name}`);
    } catch (error) {
      toast.error('Analysis failed: ' + (error.message || 'Unknown error'));
    } finally {
      setAnalyzing(false);
    }
  };
  
  // Generate mock analysis results for demo purposes
  const generateMockAnalysisResults = (document, type) => {
    const docType = document.type.split('/').pop();
    const isTextDocument = ['txt', 'md', 'json', 'csv'].some(ext => docType.includes(ext));
    const isPDF = docType.includes('pdf');
    const isWord = docType.includes('doc');
    
    // Base results with common properties
    const results = {
      analyzedAt: new Date().toISOString(),
      documentId: document.id,
      documentName: document.name,
      confidence: 0.85 + Math.random() * 0.1
    };
    
    // Specific results based on extraction type
    switch (type) {
      case 'summary':
        results.summary = isPDF
          ? "This document appears to be a project specification outlining system requirements, architecture, and implementation timeline. It contains several sections including project overview, stakeholder information, functional and non-functional requirements, budget constraints, and risk assessments."
          : isWord
            ? "This document contains meeting notes from a client requirement gathering session. It details requested features, priority levels, and expected delivery dates. Several stakeholders are mentioned along with their roles and responsibilities."
            : "This text file contains a list of technical specifications and API documentation. It includes endpoint definitions, data structures, and usage examples. There are references to integration requirements with several third-party services.";
        break;
        
      case 'requirements':
        results.requirements = [
          {
            id: `req-${Date.now()}-1`,
            title: 'User Authentication System',
            description: 'Implement secure login/logout with JWT and role-based access control',
            priority: 'high',
            category: 'Security',
            confidence: 0.92
          },
          {
            id: `req-${Date.now()}-2`,
            title: 'Dashboard Analytics',
            description: 'Create visual representations of project metrics and KPIs',
            priority: 'medium',
            category: 'Reporting',
            confidence: 0.89
          },
          {
            id: `req-${Date.now()}-3`,
            title: 'Document Export Functionality',
            description: 'Allow users to export reports in PDF, Excel, and CSV formats',
            priority: 'low',
            category: 'Feature',
            confidence: 0.86
          }
        ];
        break;
        
      case 'entities':
        results.entities = {
          requirements: entityFilters.requirements ? [
            { text: 'Authentication system', type: 'requirement', confidence: 0.94 },
            { text: 'Reporting dashboard', type: 'requirement', confidence: 0.91 },
            { text: 'Mobile responsive design', type: 'requirement', confidence: 0.89 }
          ] : [],
          timelines: entityFilters.timelines ? [
            { text: 'Project kickoff: June 15, 2025', type: 'timeline', confidence: 0.93 },
            { text: 'Alpha release: August 5, 2025', type: 'timeline', confidence: 0.90 },
            { text: 'Beta testing: September 10, 2025', type: 'timeline', confidence: 0.88 }
          ] : [],
          stakeholders: entityFilters.stakeholders ? [
            { text: 'John Smith, Product Manager', type: 'stakeholder', confidence: 0.95 },
            { text: 'Technical team lead', type: 'stakeholder', confidence: 0.87 },
            { text: 'Marketing department', type: 'stakeholder', confidence: 0.82 }
          ] : [],
          risks: entityFilters.risks ? [
            { text: 'Integration with legacy systems', type: 'risk', confidence: 0.91 },
            { text: 'Security compliance challenges', type: 'risk', confidence: 0.89 },
            { text: 'Timeline constraints', type: 'risk', confidence: 0.85 }
          ] : [],
          costs: entityFilters.costs ? [
            { text: 'Development budget: $120,000', type: 'cost', confidence: 0.93 },
            { text: 'Infrastructure costs', type: 'cost', confidence: 0.88 },
            { text: 'Maintenance estimate: $25,000/year', type: 'cost', confidence: 0.86 }
          ] : []
        };
        break;
        
      case 'insights':
        results.insights = [
          {
            title: 'Security Focus',
            description: 'This document places significant emphasis on security requirements, suggesting it should be a priority in implementation.',
            confidence: 0.88
          },
          {
            title: 'Integration Complexity',
            description: 'Multiple third-party integrations are mentioned, which may increase project complexity and timeline.',
            confidence: 0.85
          },
          {
            title: 'Stakeholder Alignment',
            description: 'There appears to be some misalignment between technical and business stakeholders on priority features.',
            confidence: 0.79
          }
        ];
        break;
        
      case 'sentiment':
        results.sentiment = {
          overall: 0.65, // Positive sentiment (0-1 scale)
          breakdown: {
            positive: 0.65,
            neutral: 0.25,
            negative: 0.10
          },
          topics: [
            { topic: 'Timeline', sentiment: 0.45, tone: 'concerned' },
            { topic: 'Features', sentiment: 0.85, tone: 'enthusiastic' },
            { topic: 'Budget', sentiment: 0.55, tone: 'cautious' }
          ]
        };
        break;
        
      default:
        results.defaultAnalysis = "Basic analysis of document completed";
    }
    
    return results;
  };
  
  // Handle document selection
  const handleDocumentSelect = (document) => {
    setActiveDocument(document);
  };
  
  // Handle extraction type change
  const handleExtractionTypeChange = (type) => {
    setExtractionType(type);
  };
  
  // Handle entity filter toggle
  const handleEntityFilterToggle = (filterId) => {
    setEntityFilters(prev => ({
      ...prev,
      [filterId]: !prev[filterId]
    }));
  };
  
  // Handle analyze button click
  const handleAnalyzeClick = () => {
    if (activeDocument) {
      analyzeDocument(activeDocument);
    }
  };
  
  // Render entity filter toggles (only shown for entities extraction type)
  const renderEntityFilters = () => {
    if (extractionType !== 'entities') return null;
    
    return (
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Entity Filters
        </h4>
        <div className="flex flex-wrap gap-2">
          {entityFilterOptions.map(filter => (
            <button
              key={filter.id}
              onClick={() => handleEntityFilterToggle(filter.id)}
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                entityFilters[filter.id]
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  // Render analysis results based on extraction type
  const renderAnalysisResults = () => {
    if (!activeDocument) return null;
    
    const results = analyzed[activeDocument.id]?.[extractionType];
    
    if (!results) {
      return (
        <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" 
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No analysis yet</h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Click "Analyze Document" to extract {extractionType} from this document
          </p>
          <button
            onClick={handleAnalyzeClick}
            disabled={analyzing}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              'Analyze Document'
            )}
          </button>
        </div>
      );
    }
    
    // Render results based on extraction type
    switch (extractionType) {
      case 'summary':
        return (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Document Summary</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Confidence: {Math.round(results.confidence * 100)}%
              </span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {results.summary}
            </p>
          </div>
        );
        
      case 'requirements':
        return (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Extracted Requirements ({results.requirements.length})
              </h3>
              <button
                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                title="Import to requirements"
              >
                Import All
              </button>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {results.requirements.map(req => (
                <div key={req.id} className="py-4">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-base font-medium text-gray-900 dark:text-white">{req.title}</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        req.priority === 'high' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                          : req.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                            : 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                      }`}>
                        {req.priority.charAt(0).toUpperCase() + req.priority.slice(1)}
                      </span>
                      <button
                        className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        title="Import to requirements"
                      >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{req.description}</p>
                  <div className="mt-1 flex items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Category: {req.category}</span>
                    <span className="mx-2 text-gray-300 dark:text-gray-600">|</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Confidence: {Math.round(req.confidence * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'entities':
        // Flatten entities for display
        const flattenedEntities = Object.entries(results.entities)
          .flatMap(([type, entities]) => entities.map(entity => ({ ...entity, groupType: type })));
        
        return (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Extracted Entities ({flattenedEntities.length})
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Confidence: {Math.round(results.confidence * 100)}%
              </span>
            </div>
            
            {flattenedEntities.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No entities found with the current filters. Try adjusting your filters.
              </p>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {flattenedEntities.map((entity, index) => (
                  <li key={index} className="py-3">
                    <div className="flex justify-between">
                      <div className="text-sm text-gray-900 dark:text-white">{entity.text}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {Math.round(entity.confidence * 100)}%
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Type: {entity.type.charAt(0).toUpperCase() + entity.type.slice(1)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
        
      case 'insights':
        return (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Document Insights ({results.insights.length})
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Confidence: {Math.round(results.confidence * 100)}%
              </span>
            </div>
            
            <div className="space-y-4">
              {results.insights.map((insight, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-base font-medium text-gray-900 dark:text-white mb-1">
                    {insight.title}
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {insight.description}
                  </p>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Confidence: {Math.round(insight.confidence * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'sentiment':
        return (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Sentiment Analysis
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Confidence: {Math.round(results.confidence * 100)}%
              </span>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Overall Sentiment
              </h4>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200 dark:bg-blue-800 dark:text-blue-200">
                      {results.sentiment.overall < 0.4 
                        ? 'Negative' 
                        : results.sentiment.overall < 0.6 
                          ? 'Neutral' 
                          : 'Positive'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-blue-600 dark:text-blue-200">
                      {Math.round(results.sentiment.overall * 100)}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200 dark:bg-gray-600">
                  <div 
                    style={{ width: `${results.sentiment.overall * 100}%` }} 
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sentiment Breakdown
              </h4>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(results.sentiment.breakdown).map(([sentiment, value]) => (
                  <div key={sentiment} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {Math.round(value * 100)}%
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Topic Sentiment
              </h4>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {results.sentiment.topics.map((topic, index) => (
                  <li key={index} className="py-3">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {topic.topic}
                      </div>
                      <div 
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          topic.sentiment < 0.4 
                            ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' 
                            : topic.sentiment < 0.6 
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' 
                              : 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                        }`}
                      >
                        {Math.round(topic.sentiment * 100)}%
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Tone: {topic.tone.charAt(0).toUpperCase() + topic.tone.slice(1)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 text-center">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Select an extraction type to view results
            </p>
          </div>
        );
    }
  };
  
  // If no documents available
  if (!documents || documents.length === 0) {
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No documents</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Upload documents to analyze them
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar: Document list and extraction types */}
      <div className="lg:col-span-1 space-y-6">
        {/* Document list */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Documents ({documents.length})
          </h3>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {documents.map((doc) => (
              <li key={doc.id}>
                <button
                  onClick={() => handleDocumentSelect(doc)}
                  className={`w-full py-3 flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-2 ${
                    activeDocument?.id === doc.id 
                      ? 'bg-blue-50 dark:bg-blue-900' 
                      : ''
                  }`}
                >
                  <span className="flex-shrink-0 h-8 w-8 rounded flex items-center justify-center bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200">
                    {doc.name.split('.').pop().toUpperCase().substring(0, 1)}
                  </span>
                  <div className="ml-3 text-left">
                    <p className={`text-sm font-medium ${
                      activeDocument?.id === doc.id 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-gray-900 dark:text-white'
                    } truncate max-w-[180px]`}>
                      {doc.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {Object.values(analyzed).some(a => a[doc.id]) 
                        ? 'Analyzed' 
                        : 'Not analyzed'}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Extraction type selector */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Analysis Type
          </h3>
          <div className="space-y-2">
            {extractionOptions.map(option => (
              <button
                key={option.id}
                onClick={() => handleExtractionTypeChange(option.id)}
                className={`w-full py-2 px-3 flex items-center rounded-md ${
                  extractionType === option.id
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-200'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="lg:col-span-3">
        {/* Document name and meta */}
        {activeDocument && (
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                {activeDocument.name}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={handleAnalyzeClick}
                  disabled={analyzing || analyzed[activeDocument.id]?.[extractionType]}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {analyzing ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Entity filters (only shown for entities extraction type) */}
        {renderEntityFilters()}
        
        {/* Analysis results */}
        {renderAnalysisResults()}
      </div>
    </div>
  );
};

export default DocumentAnalyzer;
