import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

// Import homepage components
import HeroSection from '../components/home/HeroSection';
import FeatureSection from '../components/home/FeatureSection';
import CallToAction from '../components/home/CallToAction';

// Import contexts and utilities
import { useAuth } from '../contexts/AuthContext'; // This would be created later
import { useUI } from '../contexts/UIContext'; // This would be created later

const Home = () => {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  
  // These would be implemented later when the auth and UI contexts are created
  const { isAuthenticated } = useAuth ? useAuth() : { isAuthenticated: false };
  const { openModal, closeModal, toast } = useUI ? useUI() : { 
    openModal: () => console.log('Modal would open here'), 
    closeModal: () => {},
    toast: { success: (msg) => console.log(msg), error: (msg) => console.error(msg) }
  };

  // Handle "Get Started" button click
  const handleGetStarted = () => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/projects/new');
      return;
    }

    openModal({
      title: 'Create New Project',
      content: (
        <div className="p-6">
          <p className="text-lg text-center mb-6">
            This would show the QuickStartForm component once implemented.
          </p>
          <div className="flex justify-end">
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => closeModal()}
            >
              Close
            </button>
          </div>
        </div>
      ),
      size: 'lg'
    });
  };

  // This would be replaced with actual API call when the backend is ready
  const handleCreateProject = async (formData) => {
    setIsCreating(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Close modal
      closeModal();

      // Show success message
      toast.success('Project created successfully');

      // Redirect to project page
      router.push(`/projects/new-project-id`);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error(error.message || 'Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <Head>
        <title>Auto AGI Builder - AI-Powered Development</title>
        <meta
          name="description"
          content="Build your ideas faster with AI-powered development. Auto AGI Builder transforms your requirements into working prototypes."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <HeroSection onGetStarted={handleGetStarted} />
        <FeatureSection />
        {/* TestimonialSection and PricingSection would be added here once implemented */}
        <CallToAction onGetStarted={handleGetStarted} />
      </main>

      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between">
            <div className="w-full md:w-1/4 mb-8 md:mb-0">
              <h3 className="text-lg font-bold mb-4">Auto AGI Builder</h3>
              <p className="text-gray-400">Transforming product development with AI-powered prototyping and development tools.</p>
            </div>
            
            <div className="w-full md:w-1/4 mb-8 md:mb-0">
              <h4 className="text-lg font-bold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white">Features</a></li>
                <li><a href="/pricing" className="text-gray-400 hover:text-white">Pricing</a></li>
                <li><a href="/docs" className="text-gray-400 hover:text-white">Documentation</a></li>
              </ul>
            </div>
            
            <div className="w-full md:w-1/4 mb-8 md:mb-0">
              <h4 className="text-lg font-bold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="/about" className="text-gray-400 hover:text-white">About Us</a></li>
                <li><a href="/blog" className="text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="/contact" className="text-gray-400 hover:text-white">Contact</a></li>
              </ul>
            </div>
            
            <div className="w-full md:w-1/4">
              <h4 className="text-lg font-bold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-12 border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">
              © {new Date().getFullYear()} Auto AGI Builder. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="/terms" className="text-gray-400 hover:text-white">Terms</a>
              <a href="/privacy" className="text-gray-400 hover:text-white">Privacy</a>
              <a href="/cookies" className="text-gray-400 hover:text-white">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Home;
