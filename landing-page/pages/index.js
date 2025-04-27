import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/layout/Header';
import { useTheme } from '../contexts/ThemeContext';
import { useUI } from '../contexts/UIContext';

export default function Home() {
  const { isDarkMode } = useTheme();
  const { showNotification } = useUI();

  const handleGetStarted = () => {
    showNotification('Sign up feature coming soon', 'info');
  };
  
  return (
    <div>
      <Head>
        <title>Auto AGI Builder - Build AI Applications Faster</title>
        <meta name="description" content="Automate your AI application development with Auto AGI Builder" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="pt-24 pb-16 md:pt-32 md:pb-24 px-4">
          <div className="container mx-auto text-center max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
              Build AI Applications <span className="text-cyan-600 dark:text-cyan-400">Faster</span> Than Ever
            </h1>
            
            <p className="text-lg md:text-xl mb-10 text-gray-700 dark:text-gray-300">
              Auto AGI Builder streamlines the development of AI-powered applications, 
              reducing your development time by up to 70%.
            </p>
            
            <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-6">
              <button 
                onClick={handleGetStarted}
                className="bg-cyan-600 hover:bg-cyan-700 text-white py-3 px-8 rounded-lg text-lg font-medium transition"
              >
                Get Started Free
              </button>
              
              <Link href="/#features"
                className="text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 py-3 px-8 rounded-lg text-lg font-medium transition"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section id="features" className="py-16 bg-gray-100 dark:bg-gray-800 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-gray-900 dark:text-white">
              Powerful Features
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  AI-Powered Development
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Leverage advanced AI to generate code, create prototypes, and streamline your development process.
                </p>
              </div>
              
              {/* Feature 2 */}
              <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  Rapid Prototyping
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Create functional prototypes in minutes instead of days, allowing faster iteration and validation.
                </p>
              </div>
              
              {/* Feature 3 */}
              <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  Enterprise Security
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Built with enterprise-grade security to ensure your code and data remain secure and compliant.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* How it Works Section */}
        <section id="how-it-works" className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-gray-900 dark:text-white">
              How It Works
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="bg-gray-200 dark:bg-gray-700 h-80 rounded-lg shadow-md flex items-center justify-center">
                  {/* Placeholder for video or image */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  Simple 3-Step Process
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-cyan-100 dark:bg-cyan-900 rounded-full w-8 h-8 flex items-center justify-center mt-1 mr-4">
                      <span className="text-cyan-600 dark:text-cyan-400 font-semibold">1</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-1 text-gray-900 dark:text-white">
                        Define Requirements
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300">
                        Describe your project requirements in plain language.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-cyan-100 dark:bg-cyan-900 rounded-full w-8 h-8 flex items-center justify-center mt-1 mr-4">
                      <span className="text-cyan-600 dark:text-cyan-400 font-semibold">2</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-1 text-gray-900 dark:text-white">
                        Generate Prototype
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300">
                        Our AI generates a working prototype based on your requirements.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-cyan-100 dark:bg-cyan-900 rounded-full w-8 h-8 flex items-center justify-center mt-1 mr-4">
                      <span className="text-cyan-600 dark:text-cyan-400 font-semibold">3</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-1 text-gray-900 dark:text-white">
                        Refine & Deploy
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300">
                        Fine-tune the generated code and deploy your application.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Pricing Section */}
        <section id="pricing" className="py-16 bg-gray-100 dark:bg-gray-800 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-gray-900 dark:text-white">
              Pricing Plans
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Free Plan */}
              <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Free</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Perfect for individuals and small projects</p>
                  <div className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">$0<span className="text-lg font-normal text-gray-600 dark:text-gray-400">/month</span></div>
                  
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">1 project</span>
                    </li>
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">Basic AI features</span>
                    </li>
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">Community support</span>
                    </li>
                  </ul>
                  
                  <button 
                    onClick={handleGetStarted}
                    className="w-full py-2 px-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition"
                  >
                    Get Started
                  </button>
                </div>
              </div>
              
              {/* Pro Plan */}
              <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden transform scale-105 border-2 border-cyan-500">
                <div className="bg-cyan-500 text-white py-2 px-6 text-center">
                  <span className="text-sm font-medium">MOST POPULAR</span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Pro</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">For professionals and growing teams</p>
                  <div className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">$49<span className="text-lg font-normal text-gray-600 dark:text-gray-400">/month</span></div>
                  
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">10 projects</span>
                    </li>
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">Advanced AI features</span>
                    </li>
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">Priority email support</span>
                    </li>
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">API access</span>
                    </li>
                  </ul>
                  
                  <button 
                    onClick={handleGetStarted}
                    className="w-full py-2 px-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition"
                  >
                    Get Started
                  </button>
                </div>
              </div>
              
              {/* Enterprise Plan */}
              <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Enterprise</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">For large organizations with custom needs</p>
                  <div className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">Custom</div>
                  
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">Unlimited projects</span>
                    </li>
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">Custom AI features</span>
                    </li>
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">24/7 dedicated support</span>
                    </li>
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">On-premises deployment</span>
                    </li>
                  </ul>
                  
                  <button 
                    onClick={handleGetStarted}
                    className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
                  >
                    Contact Sales
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              Ready to Transform Your Development Process?
            </h2>
            <p className="text-lg mb-8 text-gray-700 dark:text-gray-300">
              Start building AI-powered applications faster today with Auto AGI Builder.
            </p>
            <button 
              onClick={handleGetStarted}
              className="bg-cyan-600 hover:bg-cyan-700 text-white py-3 px-8 rounded-lg text-lg font-medium transition"
            >
              Get Started Free
            </button>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Auto AGI Builder</h3>
              <p className="text-gray-400">
                Building the future of AI application development.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="/#features" className="text-gray-400 hover:text-white">Features</Link></li>
                <li><Link href="/#pricing" className="text-gray-400 hover:text-white">Pricing</Link></li>
                <li><Link href="/" className="text-gray-400 hover:text-white">Documentation</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-400 hover:text-white">About</Link></li>
                <li><Link href="/" className="text-gray-400 hover:text-white">Blog</Link></li>
                <li><Link href="/" className="text-gray-400 hover:text-white">Careers</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-400 hover:text-white">Privacy</Link></li>
                <li><Link href="/" className="text-gray-400 hover:text-white">Terms</Link></li>
                <li><Link href="/" className="text-gray-400 hover:text-white">Security</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-gray-400 text-sm text-center">
            &copy; {new Date().getFullYear()} Auto AGI Builder. All rights reserved.
          </div>
        </div>
      </footer>
      
      {/* Notification */}
      {useUI().notification && (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 max-w-sm animate-fade-in">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {useUI().notification.message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={useUI().clearNotification}
                className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
