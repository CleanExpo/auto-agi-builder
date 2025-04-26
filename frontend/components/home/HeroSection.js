import React from 'react';
import Image from 'next/image';
import { smoothScrollTo } from '../../utils/smoothScroll';

const HeroSection = ({ onGetStarted }) => {
  return (
    <section
      id="hero"
      className="relative bg-gradient-to-r from-blue-600 to-indigo-800 text-white py-20 md:py-28 overflow-hidden"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{ 
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          backgroundSize: '60px 60px' 
        }} />
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
                onClick={(e) => {
                  e.preventDefault();
                  smoothScrollTo('features');
                }}
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-700 px-6 py-3 rounded-lg font-medium text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              >
                See How It Works
              </a>
            </div>
          </div>

          <div className="md:w-1/2 relative">
            <div className="relative shadow-2xl rounded-lg transform perspective-1200 rotate-y-minus-5 rotate-x-10">
              {/* This would ideally be the prototype example image */}
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <div className="rounded-t-lg h-8 bg-gray-800 flex items-center px-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <div className="p-4 h-[380px] flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                  {/* Fallback UI when image not available */}
                  <div className="text-center">
                    <div className="w-full h-[300px] rounded-md bg-gradient-to-r from-gray-800 to-gray-700 flex flex-col items-center justify-center p-6 border border-gray-700">
                      <div className="w-full flex">
                        <div className="w-1/4 border-r border-gray-700 pr-4">
                          <div className="h-6 w-20 bg-gray-600 rounded mb-4"></div>
                          <div className="h-4 w-24 bg-gray-600 rounded mb-3"></div>
                          <div className="h-4 w-20 bg-gray-600 rounded mb-3"></div>
                          <div className="h-4 w-22 bg-gray-600 rounded"></div>
                        </div>
                        <div className="w-3/4 pl-4">
                          <div className="h-8 w-40 bg-blue-600 rounded mb-6"></div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="h-20 bg-gray-600 rounded"></div>
                            <div className="h-20 bg-gray-600 rounded"></div>
                            <div className="h-20 bg-gray-600 rounded"></div>
                            <div className="h-20 bg-gray-600 rounded"></div>
                          </div>
                        </div>
                      </div>
                      <div className="text-blue-400 mt-6 font-medium">Auto AGI Builder Prototype Interface</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* UI dots decoration */}
            <div className="hidden md:block absolute -bottom-10 -left-10 w-24 h-24">
              <div className="absolute inset-0 grid grid-cols-4 gap-2">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className="w-2 h-2 bg-blue-300 rounded-full opacity-60"></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-filter backdrop-blur-sm border border-white border-opacity-20">
            <div className="text-4xl font-bold text-white mb-2">85%</div>
            <p className="text-blue-100">Reduction in prototype development time</p>
          </div>
          
          <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-filter backdrop-blur-sm border border-white border-opacity-20">
            <div className="text-4xl font-bold text-white mb-2">3.5x</div>
            <p className="text-blue-100">Faster time-to-market for new products</p>
          </div>
          
          <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-filter backdrop-blur-sm border border-white border-opacity-20">
            <div className="text-4xl font-bold text-white mb-2">98%</div>
            <p className="text-blue-100">Customer satisfaction with AI-generated prototypes</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
