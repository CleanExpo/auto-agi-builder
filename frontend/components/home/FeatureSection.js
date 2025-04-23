import React from 'react';
import Image from 'next/image';

/**
 * Feature section component for the homepage.
 * Displays the main features of the application with icons and descriptions.
 */
const FeatureSection = () => {
  const features = [
    {
      id: 'requirements',
      title: 'Smart Requirements Analysis',
      description: 'Convert meeting notes and documents into structured requirements automatically with AI analysis.',
      icon: '/icons/requirements-icon.svg',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'prototype',
      title: 'Rapid Prototype Generation',
      description: 'Generate interactive prototypes from your requirements with just a few clicks.',
      icon: '/icons/prototype-icon.svg',
      color: 'bg-green-100 text-green-600',
    },
    {
      id: 'preview',
      title: 'Multi-Device Preview',
      description: 'See how your application looks across different devices and screen sizes.',
      icon: '/icons/devices-icon.svg',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      id: 'roi',
      title: 'ROI Calculator',
      description: 'Calculate the return on investment for your project with customizable business metrics.',
      icon: '/icons/calculator-icon.svg',
      color: 'bg-orange-100 text-orange-600',
    },
    {
      id: 'roadmap',
      title: 'Implementation Timeline',
      description: 'Visualize your project timeline and track progress with interactive roadmaps.',
      icon: '/icons/timeline-icon.svg',
      color: 'bg-red-100 text-red-600',
    },
    {
      id: 'collaboration',
      title: 'Real-time Collaboration',
      description: 'Work together with your team in real-time on requirements and prototypes.',
      icon: '/icons/collaboration-icon.svg',
      color: 'bg-indigo-100 text-indigo-600',
    },
  ];

  return (
    <section id="features" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
            AI-Powered Development Tools
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Our platform provides all the tools you need to go from idea to implementation faster than ever before.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>

        {/* How it works section */}
        <div className="mt-24">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white text-center mb-12">
            How It Works
          </h3>

          <div className="relative">
            {/* Process connection line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-blue-100 dark:bg-blue-900 transform -translate-y-1/2 z-0"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
              <ProcessStep 
                number="1"
                title="Input Requirements"
                description="Upload documents or manually enter your project requirements"
              />
              <ProcessStep 
                number="2"
                title="AI Analysis"
                description="Our AI analyzes and structures your requirements"
              />
              <ProcessStep 
                number="3"
                title="Generate Prototype"
                description="Create interactive prototypes based on requirements"
              />
              <ProcessStep 
                number="4"
                title="Review & Refine"
                description="Preview across devices and refine your prototype"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Feature card component
const FeatureCard = ({ feature }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700 h-full flex flex-col">
      <div className={`w-14 h-14 rounded-lg ${feature.color} flex items-center justify-center mb-6`}>
        <Image src={feature.icon} alt={feature.title} width={28} height={28} />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
        {feature.title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 flex-grow">
        {feature.description}
      </p>
    </div>
  );
};

// Process step component
const ProcessStep = ({ number, title, description }) => {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold mb-4 shadow-lg z-10">
        {number}
      </div>
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
        {title}
      </h4>
      <p className="text-gray-600 dark:text-gray-300">
        {description}
      </p>
    </div>
  );
};

export default FeatureSection;
