import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { useKeyboardShortcuts } from '../../utils/keyboardShortcuts';

/**
 * PresentationMode Component
 * 
 * Provides a distraction-free presentation interface for client demos
 * Transforms project data into professional slides for stakeholder presentations
 */
const PresentationMode = ({
  slides = [],
  projectData = {},
  initialSlide = 0,
  theme = 'default',
  onExit,
  className
}) => {
  const router = useRouter();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(initialSlide);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const presentationRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  
  // Handle keyboard shortcuts
  useKeyboardShortcuts({
    'ArrowRight': handleNextSlide,
    'ArrowLeft': handlePrevSlide,
    'f': toggleFullscreen,
    'n': () => setShowNotes(!showNotes),
    'Escape': exitPresentation,
    ' ': handleNextSlide, // Space key
  });
  
  // Timer for presentation duration
  useEffect(() => {
    let timer;
    if (timerActive) {
      timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timerActive]);
  
  // Auto-hide controls after inactivity
  useEffect(() => {
    function handleMouseMove() {
      setShowControls(true);
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);
  
  // Slides navigation functions
  function handleNextSlide() {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    }
  }
  
  function handlePrevSlide() {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  }
  
  function goToSlide(index) {
    if (index >= 0 && index < slides.length) {
      setCurrentSlideIndex(index);
    }
  }
  
  // Fullscreen mode
  function toggleFullscreen() {
    if (!isFullscreen) {
      if (presentationRef.current.requestFullscreen) {
        presentationRef.current.requestFullscreen();
      } else if (presentationRef.current.webkitRequestFullscreen) {
        presentationRef.current.webkitRequestFullscreen();
      } else if (presentationRef.current.msRequestFullscreen) {
        presentationRef.current.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  }
  
  // Timer functions
  function toggleTimer() {
    setTimerActive(prev => !prev);
  }
  
  function resetTimer() {
    setElapsedTime(0);
    setTimerActive(false);
  }
  
  // Exit presentation mode
  function exitPresentation() {
    if (isFullscreen) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
    
    if (onExit) {
      onExit();
    } else {
      // Default behavior: go back to previous page
      router.back();
    }
  }
  
  // Format elapsed time
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  // Calculate progress percentage
  const progressPercentage = slides.length > 0 
    ? ((currentSlideIndex + 1) / slides.length) * 100 
    : 0;
  
  // Get current slide
  const currentSlide = slides[currentSlideIndex] || null;
  
  // Theme classes
  const themeClasses = {
    default: {
      background: 'bg-white dark:bg-gray-900',
      text: 'text-gray-900 dark:text-white',
      primary: 'text-blue-600 dark:text-blue-400',
      accent: 'text-indigo-600 dark:text-indigo-400',
      controls: 'bg-gray-800/80 text-white',
    },
    corporate: {
      background: 'bg-blue-900',
      text: 'text-white',
      primary: 'text-blue-200',
      accent: 'text-yellow-400',
      controls: 'bg-gray-900/80 text-white',
    },
    minimal: {
      background: 'bg-gray-100 dark:bg-gray-900',
      text: 'text-gray-900 dark:text-gray-100',
      primary: 'text-gray-700 dark:text-gray-300',
      accent: 'text-gray-500 dark:text-gray-400',
      controls: 'bg-gray-800/80 text-white',
    },
    vibrant: {
      background: 'bg-gradient-to-br from-purple-800 to-indigo-900',
      text: 'text-white',
      primary: 'text-pink-300',
      accent: 'text-yellow-300',
      controls: 'bg-gray-900/80 text-white',
    },
  };
  
  const selectedTheme = themeClasses[theme] || themeClasses.default;
  
  // If no slides are available
  if (!slides || slides.length === 0) {
    return (
      <div className={`flex items-center justify-center h-screen ${selectedTheme.background} ${selectedTheme.text}`}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Presentation Slides Available</h2>
          <p className="mb-8">Please generate presentation content first.</p>
          <button
            onClick={exitPresentation}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none"
          >
            Exit Presentation Mode
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      ref={presentationRef}
      className={`relative h-screen overflow-hidden ${selectedTheme.background} ${selectedTheme.text} ${className || ''}`}
    >
      {/* Current Slide */}
      <div className="absolute inset-0 flex items-center justify-center p-8">
        {currentSlide && (
          <div className="w-full max-w-6xl">
            {currentSlide.type === 'title' ? (
              <div className="text-center">
                <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${selectedTheme.primary}`}>
                  {currentSlide.title}
                </h1>
                {currentSlide.subtitle && (
                  <h2 className={`text-xl md:text-2xl ${selectedTheme.accent}`}>
                    {currentSlide.subtitle}
                  </h2>
                )}
                {currentSlide.details && (
                  <div className="mt-12 text-lg">
                    {currentSlide.details}
                  </div>
                )}
              </div>
            ) : currentSlide.type === 'bullets' ? (
              <div>
                <h2 className={`text-2xl md:text-4xl font-bold mb-6 ${selectedTheme.primary}`}>
                  {currentSlide.title}
                </h2>
                <ul className="space-y-4 text-lg md:text-xl">
                  {currentSlide.bullets.map((bullet, index) => (
                    <li key={index} className="flex items-start">
                      <span className={`mr-2 mt-1.5 flex-shrink-0 ${selectedTheme.accent}`}>•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : currentSlide.type === 'image' ? (
              <div>
                <h2 className={`text-2xl md:text-4xl font-bold mb-6 ${selectedTheme.primary}`}>
                  {currentSlide.title}
                </h2>
                <div className="flex justify-center mb-6">
                  <img 
                    src={currentSlide.imageUrl} 
                    alt={currentSlide.imageAlt || currentSlide.title} 
                    className="max-h-[60vh] object-contain rounded-lg shadow-lg"
                  />
                </div>
                {currentSlide.caption && (
                  <p className={`text-center text-base italic ${selectedTheme.accent}`}>
                    {currentSlide.caption}
                  </p>
                )}
              </div>
            ) : currentSlide.type === 'chart' ? (
              <div>
                <h2 className={`text-2xl md:text-4xl font-bold mb-6 ${selectedTheme.primary}`}>
                  {currentSlide.title}
                </h2>
                <div className="flex justify-center mb-6 h-[60vh]">
                  {currentSlide.chartComponent}
                </div>
                {currentSlide.description && (
                  <p className="text-center text-lg">
                    {currentSlide.description}
                  </p>
                )}
              </div>
            ) : currentSlide.type === 'split' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className={`text-2xl md:text-3xl font-bold mb-6 ${selectedTheme.primary}`}>
                    {currentSlide.title}
                  </h2>
                  <div className="space-y-4">
                    {currentSlide.content}
                  </div>
                </div>
                <div className="flex justify-center">
                  {currentSlide.media}
                </div>
              </div>
            ) : currentSlide.type === 'quote' ? (
              <div className="flex flex-col items-center justify-center text-center">
                <div className={`text-5xl mb-8 ${selectedTheme.accent}`}>"</div>
                <blockquote className="text-xl md:text-3xl italic max-w-3xl mb-6">
                  {currentSlide.quote}
                </blockquote>
                <div className={`text-lg md:text-xl font-medium ${selectedTheme.primary}`}>
                  {currentSlide.attribution}
                </div>
              </div>
            ) : (
              <div>
                <h2 className={`text-2xl md:text-4xl font-bold mb-6 ${selectedTheme.primary}`}>
                  {currentSlide.title}
                </h2>
                <div className="text-lg">
                  {currentSlide.content}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Speaker Notes (if enabled) */}
      {showNotes && currentSlide && currentSlide.notes && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-4 z-40 max-h-1/3 overflow-y-auto">
          <h3 className="text-sm font-bold mb-2">Speaker Notes:</h3>
          <div className="text-sm">
            {currentSlide.notes}
          </div>
        </div>
      )}
      
      {/* Navigation Controls */}
      <div className={`absolute bottom-0 left-0 right-0 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Progress Bar */}
        <div className="w-full h-1 bg-gray-300 dark:bg-gray-700">
          <div 
            className="h-1 bg-blue-600 dark:bg-blue-400 transition-all"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        {/* Control Bar */}
        <div className={`flex justify-between items-center px-4 py-2 ${selectedTheme.controls}`}>
          <div className="flex items-center space-x-4">
            {/* Slide Count */}
            <div className="text-sm">
              {currentSlideIndex + 1} / {slides.length}
            </div>
            
            {/* Timer */}
            <div className="flex items-center space-x-2">
              <span className="text-sm">{formatTime(elapsedTime)}</span>
              <button 
                onClick={toggleTimer}
                className="text-white hover:text-blue-300 focus:outline-none"
                title={timerActive ? "Pause timer" : "Start timer"}
              >
                {timerActive ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </button>
              <button 
                onClick={resetTimer}
                className="text-white hover:text-blue-300 focus:outline-none"
                title="Reset timer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Navigation Buttons */}
            <button
              onClick={handlePrevSlide}
              disabled={currentSlideIndex === 0}
              className={`p-1 rounded-full focus:outline-none ${currentSlideIndex === 0 ? 'text-gray-500 cursor-not-allowed' : 'text-white hover:text-blue-300'}`}
              title="Previous slide"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={handleNextSlide}
              disabled={currentSlideIndex === slides.length - 1}
              className={`p-1 rounded-full focus:outline-none ${currentSlideIndex === slides.length - 1 ? 'text-gray-500 cursor-not-allowed' : 'text-white hover:text-blue-300'}`}
              title="Next slide"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {/* Toggle Notes */}
            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`p-1 rounded-full focus:outline-none ${showNotes ? 'text-blue-300' : 'text-white hover:text-blue-300'}`}
              title="Toggle speaker notes"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            
            {/* Toggle Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1 rounded-full text-white hover:text-blue-300 focus:outline-none"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 3h6m0 0v6m0-6l-6 6M9 21H3m0 0v-6m0 6l6-6M21 9v6m0 0h-6m6 0l-6-6M3 9v6m0 0h6m-6 0l6-6" />
                </svg>
              )}
            </button>
            
            {/* Exit Presentation */}
            <button
              onClick={exitPresentation}
              className="p-1 rounded-full text-white hover:text-red-300 focus:outline-none"
              title="Exit presentation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Slide Thumbnails Drawer (hidden by default) */}
      {/* ... Additional functionality could be added here ... */}
    </div>
  );
};

PresentationMode.propTypes = {
  slides: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.oneOf(['title', 'bullets', 'image', 'chart', 'split', 'quote', 'custom']).isRequired,
    title: PropTypes.string,
    subtitle: PropTypes.string,
    content: PropTypes.node,
    bullets: PropTypes.arrayOf(PropTypes.string),
    imageUrl: PropTypes.string,
    imageAlt: PropTypes.string,
    caption: PropTypes.string,
    chartComponent: PropTypes.node,
    description: PropTypes.string,
    media: PropTypes.node,
    quote: PropTypes.string,
    attribution: PropTypes.string,
    notes: PropTypes.string
  })),
  projectData: PropTypes.object,
  initialSlide: PropTypes.number,
  theme: PropTypes.oneOf(['default', 'corporate', 'minimal', 'vibrant']),
  onExit: PropTypes.func,
  className: PropTypes.string
};

export default PresentationMode;
