import React from 'react';
import { useAnimation } from '../../contexts/AnimationContext';

/**
 * AnimationSettings component
 * Allows users to customize animation preferences throughout the application
 * Implements accessibility features like reduced motion
 * 
 * @returns {JSX.Element} Animation settings form
 */
const AnimationSettings = () => {
  const {
    prefersReducedMotion,
    animationSpeed,
    animationSettings,
    setAnimationSpeed,
    toggleAnimationSetting,
    toggleAllAnimations,
  } = useAnimation();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Animation Settings</h2>

      {/* Reduced Motion Notice */}
      {prefersReducedMotion && (
        <div className="bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-600 dark:text-blue-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700 dark:text-blue-200">
                We've detected that you prefer reduced motion. Some animations have been automatically disabled to improve your experience.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Main settings section */}
      <div className="space-y-8">
        {/* Global Animation Toggle */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Global Animation Settings</h3>
          <div className="flex items-center">
            <button 
              onClick={() => toggleAllAnimations(true)}
              className={`px-4 py-2 rounded-l-md ${
                Object.values(animationSettings).every(value => value === true)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              All On
            </button>
            <button 
              onClick={() => toggleAllAnimations(false)}
              className={`px-4 py-2 rounded-r-md ${
                Object.values(animationSettings).every(value => value === false)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              All Off
            </button>
          </div>
        </div>

        {/* Animation Speed */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Animation Speed</h3>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setAnimationSpeed('fast')}
              className={`px-4 py-2 rounded-md ${
                animationSpeed === 'fast'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              Fast
            </button>
            <button 
              onClick={() => setAnimationSpeed('normal')}
              className={`px-4 py-2 rounded-md ${
                animationSpeed === 'normal'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              Normal
            </button>
            <button 
              onClick={() => setAnimationSpeed('slow')}
              className={`px-4 py-2 rounded-md ${
                animationSpeed === 'slow'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              Slow
            </button>
          </div>
        </div>

        {/* Specific Animation Toggles */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Animation Types</h3>
          
          <div className="space-y-3">
            {/* Page Transitions */}
            <div className="flex items-center">
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 dark:text-gray-200">Page Transitions</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Smooth transitions between pages</p>
              </div>
              <div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={animationSettings.pageTransitions} 
                    onChange={() => toggleAnimationSetting('pageTransitions')} 
                    disabled={prefersReducedMotion}
                  />
                  <span className={`
                    slider rounded-full w-12 h-6 
                    ${animationSettings.pageTransitions ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'} 
                    ${prefersReducedMotion ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}>
                    <span className={`
                      knob rounded-full bg-white h-5 w-5 block transform 
                      ${animationSettings.pageTransitions ? 'translate-x-6' : 'translate-x-1'}
                      transition-transform duration-200
                    `}></span>
                  </span>
                </label>
              </div>
            </div>

            {/* Element Animations */}
            <div className="flex items-center">
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 dark:text-gray-200">Element Animations</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Fade, slide, and scale effects</p>
              </div>
              <div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={animationSettings.elementAnimations} 
                    onChange={() => toggleAnimationSetting('elementAnimations')} 
                    disabled={prefersReducedMotion}
                  />
                  <span className={`
                    slider rounded-full w-12 h-6 
                    ${animationSettings.elementAnimations ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'} 
                    ${prefersReducedMotion ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}>
                    <span className={`
                      knob rounded-full bg-white h-5 w-5 block transform 
                      ${animationSettings.elementAnimations ? 'translate-x-6' : 'translate-x-1'}
                      transition-transform duration-200
                    `}></span>
                  </span>
                </label>
              </div>
            </div>

            {/* Parallax Effects */}
            <div className="flex items-center">
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 dark:text-gray-200">Parallax Effects</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Depth and layering on scroll</p>
              </div>
              <div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={animationSettings.parallaxEffects} 
                    onChange={() => toggleAnimationSetting('parallaxEffects')} 
                    disabled={prefersReducedMotion}
                  />
                  <span className={`
                    slider rounded-full w-12 h-6 
                    ${animationSettings.parallaxEffects ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'} 
                    ${prefersReducedMotion ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}>
                    <span className={`
                      knob rounded-full bg-white h-5 w-5 block transform 
                      ${animationSettings.parallaxEffects ? 'translate-x-6' : 'translate-x-1'}
                      transition-transform duration-200
                    `}></span>
                  </span>
                </label>
              </div>
            </div>

            {/* Hover Effects */}
            <div className="flex items-center">
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 dark:text-gray-200">Hover Effects</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Interactive animations on hover</p>
              </div>
              <div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={animationSettings.hoverEffects} 
                    onChange={() => toggleAnimationSetting('hoverEffects')} 
                    disabled={prefersReducedMotion}
                  />
                  <span className={`
                    slider rounded-full w-12 h-6 
                    ${animationSettings.hoverEffects ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'} 
                    ${prefersReducedMotion ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}>
                    <span className={`
                      knob rounded-full bg-white h-5 w-5 block transform 
                      ${animationSettings.hoverEffects ? 'translate-x-6' : 'translate-x-1'}
                      transition-transform duration-200
                    `}></span>
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Accessibility Note */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Accessibility</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Your system's <strong>prefers-reduced-motion</strong> setting will automatically be respected. You can also manually disable specific types of animations above.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnimationSettings;
