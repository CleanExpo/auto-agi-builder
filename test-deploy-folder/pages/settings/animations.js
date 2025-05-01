import React from 'react';
import Layout from '../../components/layout/Layout';
import PageWrapper from '../../components/layout/PageWrapper';
import ResponsiveContainer from '../../components/common/ResponsiveContainer';
import AnimationSettings from '../../components/settings/AnimationSettings';
import { AnimationProvider } from '../../contexts/AnimationContext';

/**
 * Animation Settings Page
 * Handles customization of animation preferences throughout the app
 * Allows for reduced motion settings and tweaking animation parameters
 */
const AnimationsPage = () => {
  return (
    <Layout title="Animation Settings">
      <AnimationProvider>
        <PageWrapper
          enterAnimation="animate-fade-in"
          exitAnimation="animate-fade-out"
        >
          <ResponsiveContainer size="md">
            <div className="py-6">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 animate-fade-in-up">
                Animation Settings
              </h1>
              
              <div className="mb-6 text-gray-600 dark:text-gray-300 animate-fade-in-up animation-delay-100">
                <p>Customize the animation experience throughout the application. These settings allow you to enable or disable specific animation types and control their speed.</p>
                <p className="mt-2">For accessibility needs, you can completely disable animations or adjust them to your preferences.</p>
              </div>
              
              <AnimationSettings />
              
              <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700 animate-fade-in-up animation-delay-300">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Animation Preview</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Preview Cards with Different Animations */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md animate-fade-in">
                    <h3 className="font-medium mb-2">Fade In</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Simple opacity transition</p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md animate-fade-in-up animation-delay-100">
                    <h3 className="font-medium mb-2">Fade In Up</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Combines movement with opacity</p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md animate-scale-in animation-delay-200">
                    <h3 className="font-medium mb-2">Scale In</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Grows from smaller size</p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md animate-slide-in-right animation-delay-100">
                    <h3 className="font-medium mb-2">Slide In Right</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Slides in from the right</p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md animate-card-reveal animation-delay-200">
                    <h3 className="font-medium mb-2">Card Reveal</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Specialized card animation</p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md animate-pulse-custom">
                    <h3 className="font-medium mb-2">Pulse</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Continuous pulsing effect</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="font-medium mb-3">Hover Effect Demo</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Hover over these buttons to see animations</p>
                    
                    <div className="flex flex-wrap gap-3">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transform hover:-translate-y-1 transition-all duration-300">
                        Lift Effect
                      </button>
                      
                      <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 hover:shadow-lg transition-all duration-300">
                        Shadow Effect
                      </button>
                      
                      <button className="px-4 py-2 bg-green-600 text-white rounded hover:scale-110 transition-all duration-300">
                        Scale Effect
                      </button>
                      
                      <button className="px-4 py-2 bg-amber-600 text-white rounded btn-click-effect">
                        Ripple Effect
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ResponsiveContainer>
        </PageWrapper>
      </AnimationProvider>
    </Layout>
  );
};

export default AnimationsPage;
