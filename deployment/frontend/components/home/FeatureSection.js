import React from 'react';
import { useUI } from '../../contexts';

const features = [
  {
    title: 'Intelligent Requirements Analysis',
    description: 'Convert business requirements into technical specifications using AI. Automatically identify dependencies and generate implementation roadmaps.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M2.25 6a3 3 0 013-3h13.5a3 3 0 013 3v12a3 3 0 01-3 3H5.25a3 3 0 01-3-3V6zm3.97.97a.75.75 0 011.06 0l2.25 2.25a.75.75 0 010 1.06l-2.25 2.25a.75.75 0 01-1.06-1.06l1.72-1.72-1.72-1.72a.75.75 0 010-1.06zm4.28 4.28a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" clipRule="evenodd" />
      </svg>
    )
  },
  {
    title: 'Rapid Prototyping',
    description: 'Generate functional prototypes from requirements in minutes. Visualize user flows and interactions before writing a single line of code.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm14.25 6a.75.75 0 01-.22.53l-2.25 2.25a.75.75 0 11-1.06-1.06L15.44 12l-1.72-1.72a.75.75 0 111.06-1.06l2.25 2.25c.141.14.22.331.22.53zm-10.28-.53a.75.75 0 000 1.06l2.25 2.25a.75.75 0 101.06-1.06L8.56 12l1.72-1.72a.75.75 0 10-1.06-1.06l-2.25 2.25z" clipRule="evenodd" />
      </svg>
    )
  },
  {
    title: 'Code Generation',
    description: 'Transform prototypes into production-ready code. Support for multiple languages and frameworks with best practices automatically applied.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M12 .75a8.75 8.75 0 00-4.335 16.25 1.25 1.25 0 01.585 1.35c-.068.344-.323.759-.809 1.003l-.637.367A8.75 8.75 0 1012 .75z" />
        <path fillRule="evenodd" d="M12.365 1.71a.75.75 0 00-1.427.476c.316.941.608 2.403.608 4.064 0 3.439-1.131 5.533-2.396 6.785a.75.75 0 101.06 1.06c1.571-1.571 2.886-4.053 2.886-7.845 0-1.655-.223-3.069-.506-4.066l-.225-.574z" clipRule="evenodd" />
      </svg>
    )
  },
  {
    title: 'Automated Testing',
    description: 'Generate comprehensive test suites that cover edge cases and security concerns. Ensure your application works flawlessly from day one.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
      </svg>
    )
  },
  {
    title: 'Collaborative Workflows',
    description: 'Work together in real-time with AI-assisted pair programming. Share insights and accelerate development through intelligent collaboration.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z" clipRule="evenodd" />
        <path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 013.57-4.047zM20.226 19.389a8.287 8.287 0 00-1.308-5.135 3.75 3.75 0 013.57 4.047l-.01.121a.563.563 0 01-.373.486l-.115.04c-.567.2-1.156.349-1.764.441z" />
      </svg>
    )
  },
  {
    title: 'Advanced Analytics',
    description: 'Track project progress, identify bottlenecks, and optimize your development process with AI-powered insights and recommendations.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M12.75 3a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75V3z" clipRule="evenodd" />
      </svg>
    )
  }
];

const FeatureSection = () => {
  const { isDarkMode } = useUI();
  
  return (
    <section className={`py-20 ${isDarkMode ? 'bg-navy-800' : 'bg-silver-100'}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isDarkMode ? 'text-silver-100' : 'text-navy-800'}`}>
            Accelerate Your Development Workflow
          </h2>
          <p className={`max-w-3xl mx-auto text-lg ${isDarkMode ? 'text-silver-300' : 'text-navy-600'}`}>
            AGI AUTO Builder brings the power of advanced AI to every stage of the software development lifecycle,
            helping teams deliver exceptional results faster than ever.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`p-6 rounded-lg ${
                isDarkMode 
                  ? 'bg-navy-700 hover:bg-navy-600' 
                  : 'bg-white hover:bg-silver-200'
              } transition-colors duration-200 shadow-md`}
            >
              <div className="inline-flex p-3 rounded-lg bg-cyan-500 text-navy-900 mb-4">
                {feature.icon}
              </div>
              <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-silver-100' : 'text-navy-800'}`}>
                {feature.title}
              </h3>
              <p className={`${isDarkMode ? 'text-silver-300' : 'text-navy-600'}`}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <a 
            href="/features" 
            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-md bg-green-500 text-navy-900 hover:bg-green-400 transition duration-200"
          >
            Explore All Features
            <svg className="ml-2 -mr-1 w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
