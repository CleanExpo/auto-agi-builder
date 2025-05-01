import React from 'react';
import { useUI } from '../../contexts';

const CallToAction = () => {
  const { isDarkMode } = useUI();

  return (
    <section className={`py-24 ${isDarkMode ? 'bg-gradient-to-r from-navy-800 to-navy-900' : 'bg-gradient-to-r from-silver-200 to-silver-100'}`}>
      <div className="container mx-auto px-4">
        <div className={`relative overflow-hidden rounded-2xl p-8 md:p-16 ${isDarkMode ? 'shadow-xl' : 'shadow-lg'} ${isDarkMode ? 'bg-navy-700' : 'bg-white'}`}>
          {/* Background elements */}
          <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400 opacity-20 filter blur-xl"></div>
          <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-gradient-to-r from-green-500 to-green-400 opacity-20 filter blur-xl"></div>
          
          <div className="grid md:grid-cols-5 gap-8 items-center">
            {/* Content */}
            <div className="md:col-span-3 text-center md:text-left">
              <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${isDarkMode ? 'text-silver-100' : 'text-navy-900'}`}>
                Ready to Accelerate Your Development?
              </h2>
              <p className={`text-lg mb-8 ${isDarkMode ? 'text-silver-300' : 'text-navy-600'}`}>
                Join over 2,000 developers and teams who have transformed their workflow with our AI-powered platform. 
                Get started with a free trial and see the difference for yourself.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <a 
                  href="/documentation" 
                  className="px-8 py-4 rounded-lg bg-transparent border-2 border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-navy-900 transition-colors font-semibold"
                >
                  Read Documentation
                </a>
                <a 
                  href="/signup" 
                  className="px-8 py-4 rounded-lg bg-gradient-to-r from-green-500 to-cyan-500 font-semibold text-navy-900 hover:from-green-400 hover:to-cyan-400 transition-colors"
                >
                  Start Free Trial
                </a>
              </div>
            </div>
            
            {/* Stats */}
            <div className="md:col-span-2">
              <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-navy-800 border border-navy-600' : 'bg-silver-100 border border-silver-200'}`}>
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { value: '85%', label: 'Development Time Saved' },
                    { value: '3.5x', label: 'Faster Prototyping' },
                    { value: '99%', label: 'Error Reduction' },
                    { value: '24/7', label: 'Support & Updates' },
                  ].map((stat, index) => (
                    <div key={index} className="text-center">
                      <p className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>{stat.value}</p>
                      <p className={`text-sm ${isDarkMode ? 'text-silver-400' : 'text-navy-600'}`}>{stat.label}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-6 border-t border-dashed border-opacity-30 border-cyan-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${isDarkMode ? 'bg-green-500' : 'bg-green-600'} mr-2`}></div>
                      <span className={`text-xs ${isDarkMode ? 'text-silver-400' : 'text-navy-600'}`}>Active Users</span>
                    </div>
                    <span className={`text-sm font-semibold ${isDarkMode ? 'text-silver-300' : 'text-navy-800'}`}>2,134</span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${isDarkMode ? 'bg-cyan-500' : 'bg-cyan-600'} mr-2`}></div>
                      <span className={`text-xs ${isDarkMode ? 'text-silver-400' : 'text-navy-600'}`}>Projects Generated</span>
                    </div>
                    <span className={`text-sm font-semibold ${isDarkMode ? 'text-silver-300' : 'text-navy-800'}`}>14,892</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Testimonial Quote */}
          <div className={`mt-12 rounded-lg p-6 ${isDarkMode ? 'bg-navy-800' : 'bg-silver-100'} ${isDarkMode ? 'border-navy-600' : 'border-silver-200'} border text-center`}>
            <p className={`italic text-lg mb-4 ${isDarkMode ? 'text-silver-300' : 'text-navy-600'}`}>
              "AGI AUTO Builder reduced our development time by 80% while improving code quality. It's transformed how we approach software development."
            </p>
            <div className="flex items-center justify-center">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-green-500 flex items-center justify-center mr-3 ${isDarkMode ? 'text-navy-900' : 'text-white'} font-bold`}>
                ML
              </div>
              <div className="text-left">
                <p className={`font-semibold ${isDarkMode ? 'text-silver-100' : 'text-navy-800'}`}>Maria Lopez</p>
                <p className={`text-sm ${isDarkMode ? 'text-silver-400' : 'text-navy-600'}`}>CTO, TechSprint Inc.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
