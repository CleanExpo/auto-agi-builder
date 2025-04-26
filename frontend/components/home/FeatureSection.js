import React from 'react';

const FeatureSection = () => {
  const features = [
    {
      title: 'Requirements Analysis',
      description: 'Convert natural language requirements into structured development tasks using our AI-powered analysis engine.',
      icon: (
        <svg className="w-10 h-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <line x1="8" y1="6" x2="21" y2="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="8" y1="12" x2="21" y2="12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="8" y1="18" x2="21" y2="18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="3" y1="6" x2="3.01" y2="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="3" y1="12" x2="3.01" y2="12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="3" y1="18" x2="3.01" y2="18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      title: 'Prototype Generation',
      description: 'Generate working prototypes from requirements with just one click, no coding required.',
      icon: (
        <svg className="w-10 h-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="3" y1="9" x2="21" y2="9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="9" y1="21" x2="9" y2="9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      title: 'Device Preview',
      description: 'Test your prototype across multiple device sizes and operating systems with our interactive preview.',
      icon: (
        <svg className="w-10 h-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <rect x="4" y="4" width="16" height="16" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="14" y="14" width="7" height="7" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 4L4 10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      title: 'ROI Calculator',
      description: 'Calculate the return on investment for your project with our detailed breakdown of time and cost savings.',
      icon: (
        <svg className="w-10 h-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="8" y1="6" x2="16" y2="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="8" y1="10" x2="10" y2="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="14" y1="10" x2="16" y2="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="8" y1="14" x2="10" y2="14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="14" y1="14" x2="16" y2="14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="8" y1="18" x2="10" y2="18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="14" y1="18" x2="16" y2="18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      title: 'Development Roadmap',
      description: 'Plan your development journey with AI-generated timelines and resource allocation recommendations.',
      icon: (
        <svg className="w-10 h-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <line x1="3" y1="12" x2="21" y2="12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="7" cy="12" r="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="14" cy="12" r="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="21" cy="12" r="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 8v-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 4v4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 8v-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 16v4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 20v-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 16v4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      title: 'Collaboration Tools',
      description: 'Share prototypes, collect feedback, and iterate together with your team and stakeholders in real-time.',
      icon: (
        <svg className="w-10 h-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="9" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Everything You Need to Accelerate Development
          </h2>
          <p className="text-xl text-gray-600">
            Our AI-powered platform streamlines the entire development process, 
            from requirements to working prototypes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="bg-blue-50 p-3 rounded-lg inline-block mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-3/5 mb-8 md:mb-0">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to try Auto AGI Builder?
              </h3>
              <p className="text-lg text-gray-700">
                Experience the future of development today. No credit card required for your first project.
              </p>
            </div>
            <div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium text-lg shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50">
                Get Started Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
