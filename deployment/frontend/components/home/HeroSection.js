import React from 'react';
import { useUI } from '../../contexts';
import { LogoWithText } from '../../styles/theme';

const HeroSection = () => {
  const { isDarkMode } = useUI();

  return (
    <section className={`relative overflow-hidden ${isDarkMode ? 'bg-navy-900' : 'bg-silver-100'} pt-32 pb-16`}>
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0 grid grid-cols-12 gap-4">
          {Array.from({ length: 12 }).map((_, colIndex) => (
            <div key={`col-${colIndex}`} className="h-full border-r border-cyan-500"></div>
          ))}
        </div>
        <div className="absolute inset-0 grid grid-rows-12 gap-4">
          {Array.from({ length: 12 }).map((_, rowIndex) => (
            <div key={`row-${rowIndex}`} className="w-full border-b border-cyan-500"></div>
          ))}
        </div>
      </div>

      {/* Decorative Circles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl opacity-10 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500 rounded-full filter blur-3xl opacity-10 translate-x-1/2 translate-y-1/2"></div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          {/* Content */}
          <div className="flex flex-col w-full lg:w-1/2 space-y-8 text-center lg:text-left">
            <div className="flex justify-center lg:justify-start">
              <LogoWithText height={80} />
            </div>
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold leading-tight ${isDarkMode ? 'text-silver-100' : 'text-navy-900'}`}>
              AI-Powered <span className="text-cyan-500">Software Development</span> Automation
            </h1>
            <p className={`text-xl leading-relaxed ${isDarkMode ? 'text-silver-300' : 'text-navy-600'}`}>
              Transform your ideas into working software at unprecedented speed. 
              Our platform handles everything from requirements analysis to code generation and testing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a 
                href="/demo" 
                className="px-8 py-4 text-lg font-semibold rounded-lg bg-cyan-500 text-navy-900 hover:bg-cyan-400 transition-colors duration-300"
              >
                Request Demo
              </a>
              <a 
                href="/documentation" 
                className={`px-8 py-4 text-lg font-semibold rounded-lg border ${
                  isDarkMode ? 'border-silver-500 text-silver-100 hover:bg-navy-700' : 'border-navy-500 text-navy-800 hover:bg-silver-200'
                } transition-colors duration-300`}
              >
                Learn More
              </a>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <div 
                    key={i}
                    className={`w-10 h-10 rounded-full border-2 ${isDarkMode ? 'border-navy-800' : 'border-white'} flex items-center justify-center ${
                      ['bg-indigo-500', 'bg-pink-500', 'bg-amber-500', 'bg-emerald-500'][i - 1]
                    }`}
                  >
                    <span className="text-white text-xs font-bold">
                      {['DS', 'JM', 'RL', 'KT'][i - 1]}
                    </span>
                  </div>
                ))}
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-silver-400' : 'text-navy-600'}`}>
                Join <span className="font-bold">2,000+</span> developers building with AGI AUTO
              </p>
            </div>
          </div>
          
          {/* Image/Animation */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
            <div className={`relative rounded-xl ${isDarkMode ? 'bg-navy-800' : 'bg-white'} shadow-xl border ${isDarkMode ? 'border-navy-700' : 'border-gray-200'} p-1`}>
              {/* Code editor mockup */}
              <div className={`w-full max-w-lg rounded-lg overflow-hidden ${isDarkMode ? 'bg-navy-700' : 'bg-silver-200'}`}>
                <div className={`flex items-center ${isDarkMode ? 'bg-navy-800' : 'bg-silver-300'} px-4 py-2`}>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="mx-auto text-sm text-center">main.js</div>
                </div>
                <div className="p-4 font-mono text-sm">
                  <pre className={isDarkMode ? 'text-silver-300' : 'text-navy-700'}>
                    <code>{`// Auto-generated by AGI AUTO
import React from 'react';
import { render } from 'react-dom';
import { AppProvider } from './context';
import Dashboard from './components/Dashboard';
import './styles/global.css';

// Initialize application
const rootElement = document.getElementById('root');

// Render application with provider
render(
  <AppProvider>
    <Dashboard />
  </AppProvider>,
  rootElement
);`}</code>
                  </pre>
                </div>
              </div>
              
              {/* Floating elements to show AI automation */}
              <div className="absolute -right-4 -top-4 px-3 py-2 bg-gradient-to-r from-cyan-500 to-green-500 text-white text-xs font-semibold rounded">
                AI Generated
              </div>
              
              <div className="absolute -left-4 bottom-12 px-3 py-2 bg-gradient-to-r from-green-500 to-green-400 text-navy-900 text-xs font-semibold rounded-full shadow-lg">
                100% Test Coverage
              </div>
              
              <div className="absolute -right-3 -bottom-3 px-3 py-2 bg-gradient-to-r from-cyan-600 to-cyan-400 text-white text-xs font-semibold rounded-full shadow-lg">
                Ready to Deploy
              </div>
            </div>
          </div>
        </div>
        
        {/* Nav dots */}
        <div className="absolute bottom-8 left-0 right-0">
          <div className="flex justify-center space-x-2">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-cyan-500' : isDarkMode ? 'bg-navy-600' : 'bg-silver-400'}`}></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
