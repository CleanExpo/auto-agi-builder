import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useUI } from '../../contexts/UIContext';

/**
 * PrototypeViewer Component
 * Displays and allows interaction with generated prototypes
 * with support for different platforms and frameworks
 */
export default function PrototypeViewer({ prototypeId, projectId = null }) {
  const router = useRouter();
  const { showNotification, showModal } = useUI();
  const iframeRef = useRef(null);
  
  // State
  const [prototype, setPrototype] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('desktop');
  const [currentPage, setCurrentPage] = useState(null);
  const [availablePages, setAvailablePages] = useState([]);
  const [scale, setScale] = useState(100);
  const [fullscreen, setFullscreen] = useState(false);
  const [comments, setComments] = useState([]);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [newCommentPosition, setNewCommentPosition] = useState({ x: 0, y: 0 });
  
  // Fetch prototype data
  useEffect(() => {
    if (prototypeId) {
      fetchPrototype();
    }
  }, [prototypeId]);
  
  // Fetch prototype data
  const fetchPrototype = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/v1/prototypes/${prototypeId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch prototype');
      }
      
      const data = await response.json();
      setPrototype(data);
      
      // Set default page if available
      if (data.pages && data.pages.length > 0) {
        setAvailablePages(data.pages);
        setCurrentPage(data.pages[0]);
      }
      
      // Fetch comments
      await fetchComments();
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching prototype:', err);
      setError('Failed to load prototype. Please try again.');
      setLoading(false);
    }
  };
  
  // Fetch prototype comments
  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/v1/prototypes/${prototypeId}/comments`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      
      const data = await response.json();
      setComments(data.comments || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
      // Don't set error state as this is not critical
    }
  };
  
  // Change device view
  const changeView = (view) => {
    setCurrentView(view);
  };
  
  // Navigate to a specific page
  const navigateToPage = (page) => {
    setCurrentPage(page);
  };
  
  // Change zoom level
  const changeScale = (newScale) => {
    if (newScale >= 25 && newScale <= 200) {
      setScale(newScale);
    }
  };
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };
  
  // Handle iframe click for comment positioning
  const handleIframeClick = (e) => {
    if (!isAddingComment) return;
    
    // Get click coordinates relative to iframe
    const rect = iframeRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / scale) * 100;
    const y = ((e.clientY - rect.top) / scale) * 100;
    
    setNewCommentPosition({ x, y });
  };
  
  // Start adding a comment
  const startAddingComment = () => {
    setIsAddingComment(true);
  };
  
  // Cancel adding a comment
  const cancelAddingComment = () => {
    setIsAddingComment(false);
    setNewCommentText('');
  };
  
  // Save a new comment
  const saveComment = async () => {
    if (!newCommentText.trim()) {
      showNotification({
        type: 'warning',
        message: 'Please enter a comment'
      });
      return;
    }
    
    try {
      const response = await fetch(`/api/v1/prototypes/${prototypeId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: newCommentText,
          position: newCommentPosition,
          page: currentPage.id || currentPage.name
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save comment');
      }
      
      // Refresh comments
      await fetchComments();
      
      // Reset comment state
      setNewCommentText('');
      setIsAddingComment(false);
      
      showNotification({
        type: 'success',
        message: 'Comment added successfully'
      });
    } catch (err) {
      console.error('Error saving comment:', err);
      showNotification({
        type: 'error',
        message: 'Failed to save comment. Please try again.'
      });
    }
  };
  
  // Delete a comment
  const deleteComment = async (commentId) => {
    showModal('confirmation', {
      title: 'Delete Comment',
      message: 'Are you sure you want to delete this comment?',
      confirmButton: 'Delete',
      cancelButton: 'Cancel',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/v1/prototypes/${prototypeId}/comments/${commentId}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) {
            throw new Error('Failed to delete comment');
          }
          
          // Remove from local state
          setComments(prev => prev.filter(c => c.id !== commentId));
          
          showNotification({
            type: 'success',
            message: 'Comment deleted successfully'
          });
        } catch (err) {
          console.error('Error deleting comment:', err);
          showNotification({
            type: 'error',
            message: 'Failed to delete comment. Please try again.'
          });
        }
      }
    });
  };
  
  // Export prototype
  const exportPrototype = async () => {
    try {
      showModal('exportOptions', {
        title: `Export ${prototype.name}`,
        entityType: 'prototype',
        entityId: prototypeId,
        formats: [
          { id: 'html', name: 'HTML/CSS/JS', icon: 'code' },
          { id: 'react', name: 'React Components', icon: 'react' },
          { id: 'figma', name: 'Figma Design', icon: 'figma' },
          { id: 'pdf', name: 'PDF Document', icon: 'document' }
        ]
      });
    } catch (err) {
      showNotification({
        type: 'error',
        message: 'Failed to prepare prototype export. Please try again.'
      });
    }
  };
  
  // Back to project
  const backToProject = () => {
    router.push(`/projects/${projectId || prototype?.projectId || router.query.id}`);
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
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
          onClick={fetchPrototype}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  // No prototype state
  if (!prototype) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg text-gray-500 text-center">
        <p>Prototype not found.</p>
        <button 
          onClick={backToProject}
          className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Back to Project
        </button>
      </div>
    );
  }
  
  return (
    <div className={`prototype-viewer ${fullscreen ? 'fixed inset-0 z-50 bg-white p-4' : ''}`}>
      {/* Header */}
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">{prototype.name}</h1>
          <p className="text-gray-600">
            {prototype.platform} • {prototype.targetFramework} • Created {new Date(prototype.createdAt).toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={backToProject}
            className="px-3 py-1.5 rounded-md text-sm border border-gray-300 hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={exportPrototype}
            className="px-3 py-1.5 rounded-md text-sm bg-green-600 text-white hover:bg-green-700"
          >
            Export
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar - Page navigation and comments */}
        <div className="md:col-span-1 space-y-4">
          {/* Pages navigation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-3 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800">Pages</h2>
            </div>
            
            {availablePages.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {availablePages.map((page) => (
                  <li key={page.id || page.name}>
                    <button
                      onClick={() => navigateToPage(page)}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${
                        (currentPage && (currentPage.id === page.id || currentPage.name === page.name))
                          ? 'bg-indigo-50 text-indigo-600' 
                          : 'text-gray-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="flex-1 truncate">{page.name || page.title}</span>
                        {page.isHome && (
                          <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-gray-100">Home</span>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p>No pages available</p>
              </div>
            )}
          </div>
          
          {/* Comments */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-3 border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-semibold text-gray-800">Comments</h2>
              <button
                onClick={startAddingComment}
                disabled={isAddingComment}
                className={`px-2 py-1 text-xs rounded-md ${
                  isAddingComment
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                Add
              </button>
            </div>
            
            {isAddingComment ? (
              <div className="p-3 border-b border-gray-200 bg-blue-50">
                <h3 className="text-sm font-medium mb-2">New Comment</h3>
                <textarea
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Click on the prototype to place your comment"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  rows="3"
                />
                <div className="mt-2 flex justify-end space-x-2">
                  <button
                    onClick={cancelAddingComment}
                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveComment}
                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : null}
            
            {/* Comment list */}
            <div className="max-h-80 overflow-y-auto">
              {comments.filter(c => !currentPage || c.page === (currentPage.id || currentPage.name)).length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {comments
                    .filter(c => !currentPage || c.page === (currentPage.id || currentPage.name))
                    .map((comment) => (
                      <li key={comment.id} className="p-3 hover:bg-gray-50">
                        <div className="flex justify-between">
                          <p className="font-medium text-sm">{comment.author.name || 'Anonymous'}</p>
                          <button
                            onClick={() => deleteComment(comment.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{comment.text}</p>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString()}
                        </div>
                      </li>
                    ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <p>No comments yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Main prototype preview area */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Toolbar */}
            <div className="p-3 border-b border-gray-200 flex justify-between items-center">
              {/* Device selection */}
              <div className="flex space-x-2">
                <button
                  onClick={() => changeView('desktop')}
                  className={`p-1.5 rounded-md ${
                    currentView === 'desktop' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  onClick={() => changeView('tablet')}
                  className={`p-1.5 rounded-md ${
                    currentView === 'tablet' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  onClick={() => changeView('mobile')}
                  className={`p-1.5 rounded-md ${
                    currentView === 'mobile' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              
              {/* Zoom controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => changeScale(scale - 25)}
                  disabled={scale <= 25}
                  className={`p-1 rounded-md ${
                    scale <= 25 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                  </svg>
                </button>
                <span className="text-sm text-gray-600">{scale}%</span>
                <button
                  onClick={() => changeScale(scale + 25)}
                  disabled={scale >= 200}
                  className={`p-1 rounded-md ${
                    scale >= 200 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="p-1 rounded-md text-gray-500 hover:text-gray-800 ml-2"
                >
                  {fullscreen ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            {/* Prototype display */}
            <div className="relative bg-gray-100 min-h-[500px] flex justify-center items-start p-4 overflow-auto">
              <div 
                className={`prototype-frame relative bg-white transition-all overflow-hidden ${
                  currentView === 'desktop' ? 'w-full max-w-5xl' :
                  currentView === 'tablet' ? 'w-[768px] h-[1024px]' :
                  'w-[375px] h-[667px]'
                }`}
                style={{ transform: `scale(${scale / 100})`, transformOrigin: 'top center' }}
                onClick={handleIframeClick}
              >
                {/* Prototype content (iframe or component) */}
                <div className="w-full h-full">
                  {currentPage ? (
                    <iframe
                      ref={iframeRef}
                      src={currentPage.url || `/api/v1/prototypes/${prototypeId}/preview/${currentPage.id || currentPage.name}`}
                      className="w-full h-full border-0"
                      title={`${prototype.name} - ${currentPage.name || currentPage.title}`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-gray-500">No preview available</p>
                    </div>
                  )}
                </div>
                
                {/* Comment markers */}
                {comments
                  .filter(c => !currentPage || c.page === (currentPage.id || currentPage.name))
                  .map((comment) => (
                    <div
                      key={comment.id}
                      className="absolute w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
                      style={{ 
                        left: `${comment.position?.x || 50}%`, 
                        top: `${comment.position?.y || 50}%` 
                      }}
                      title={comment.text}
                    >
                      <span className="text-xs font-bold">{comments.indexOf(comment) + 1}</span>
                    </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
