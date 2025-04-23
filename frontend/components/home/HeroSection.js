import React from 'react';
import Image from 'next/image';

/**
 * Hero section component for the landing page.
 * Features a headline, description, and call-to-action buttons.
 * 
 * @param {Function} onGetStarted - Callback function when the "Get Started" button is clicked
 */
const HeroSection = ({ onGetStarted }) => {
  return (
    <section className="relative bg-gradient-to-r from-blue-600 to-indigo-800 text-white py-20 md:py-28 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 10 L40 10 M10 0 L10 40" 
                fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="max-w-2xl md:w-1/2 md:pr-8 text-center md:text-left mb-12 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Build Your Ideas Faster with AI-Powered Development
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-xl">
              Auto AGI Builder transforms your requirements into working prototypes, 
              saving you weeks of development time and accelerating your product roadmap.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button 
                onClick={onGetStarted}
                className="bg-white text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium text-lg shadow-lg hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              >
                Get Started Free
              </button>
              <a 
                href="#features"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-700 px-6 py-3 rounded-lg font-medium text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              >
                See How It Works
              </a>
            </div>
          </div>
          
          <div className="md:w-1/2 relative">
            <div className="bg-white rounded-lg shadow-2xl p-2 relative z-20 transform rotate-1 hover:rotate-0 transition-transform">
              <div className="bg-gray-100 rounded-md p-1">
                <div className="h-6 bg-gray-200 rounded-t-md flex items-center px-2">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <Image 
                  src="/images/prototype-example.png" 
                  alt="AI-generated prototype"
                  width={600}
                  height={400}
                  className="rounded-b-md"
                />
              </div>
            </div>
            
            {/* Floating elements for visual interest */}
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500 rounded-lg opacity-50 z-10 animate-pulse"></div>
            <div className="absolute top-10 -right-10 w-24 h-24 bg-yellow-400 rounded-full opacity-50 z-10 animate-bounce"></div>
          </div>
        </div>
        
        {/* Stats section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">3x</div>
            <div className="text-blue-200">Faster Development</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">85%</div>
            <div className="text-blue-200">User Satisfaction</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">10k+</div>
            <div className="text-blue-200">Projects Delivered</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
