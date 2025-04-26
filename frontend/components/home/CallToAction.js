import React from 'react';

const CallToAction = ({ onGetStarted }) => {
  return (
    <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-800 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Start Building Your Next Project in Minutes, Not Months
          </h2>
          
          <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-3xl mx-auto">
            Join thousands of developers, startups, and enterprises who are accelerating
            their development process with Auto AGI Builder.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="bg-white text-blue-700 hover:bg-blue-50 px-10 py-4 rounded-lg font-medium text-lg shadow-lg hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            >
              Get Started Free
            </button>
            
            <a
              href="/pricing"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-700 px-10 py-4 rounded-lg font-medium text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            >
              View Pricing
            </a>
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-blue-100 mb-4">Trusted by innovative companies worldwide</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
              {/* Company logos would go here */}
              <div className="h-8 w-24 bg-white opacity-70 rounded"></div>
              <div className="h-8 w-24 bg-white opacity-70 rounded"></div>
              <div className="h-8 w-24 bg-white opacity-70 rounded"></div>
              <div className="h-8 w-24 bg-white opacity-70 rounded"></div>
              <div className="h-8 w-24 bg-white opacity-70 rounded"></div>
            </div>
          </div>
          
          <div className="mt-16 bg-white bg-opacity-10 p-8 rounded-xl backdrop-filter backdrop-blur-sm border border-white border-opacity-20 max-w-3xl mx-auto">
            <blockquote className="text-xl italic">
              "Auto AGI Builder has transformed how we approach product development. 
              What used to take us weeks of prototyping now happens in hours."
            </blockquote>
            <div className="mt-4">
              <p className="font-semibold">Alex Johnson</p>
              <p className="text-blue-200">CTO, FutureTech Solutions</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2">
        <svg width="404" height="784" fill="none" viewBox="0 0 404 784" className="text-white opacity-10">
          <defs>
            <pattern id="56409614-3d62-4985-9a10-7ca758a8f4f0" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="4" height="4" fill="currentColor"></rect>
            </pattern>
          </defs>
          <rect width="404" height="784" fill="url(#56409614-3d62-4985-9a10-7ca758a8f4f0)"></rect>
        </svg>
      </div>
    </section>
  );
};

export default CallToAction;
