import React from 'react';
import Head from 'next/head';
import { useUI } from '../contexts/UIContext';

export default function Home() {
  const { isDarkMode, toggleDarkMode } = useUI();

  return (
    <div className="min-h-screen">
      <Head>
        <title>Auto AGI Builder</title>
        <meta name="description" content="Automated AI Project Building Platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Auto AGI Builder
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-gray-600 dark:text-gray-300">
            Build intelligent applications with automated AI workflows
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Welcome to Auto AGI Builder</h2>
            <button
              onClick={toggleDarkMode}
              className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            >
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>

          <p className="mb-6">
            This application is now properly configured with the UIContext provider. The error:
          </p>

          <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-6">
            <code>Error: useUI must be used within a UIProvider</code>
          </div>

          <p className="mb-6">
            Has been resolved by properly implementing the UIContext and UIProvider in the application.
            The provider is now correctly wrapping all components in the _app.js file.
          </p>

          <h3 className="text-xl font-semibold mb-4">Key Fixes:</h3>
          <ul className="list-disc list-inside space-y-2 mb-8">
            <li>Created a robust UIContext with proper provider implementation</li>
            <li>Set up _app.js to wrap components with the UIProvider</li>
            <li>Added proper _document.js configuration for Next.js</li>
            <li>Implemented dark mode toggle functionality</li>
            <li>Added global styles with Tailwind CSS support</li>
          </ul>

          <div className="flex justify-end">
            <button className="btn btn-primary">Continue to Dashboard</button>
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 mt-12 text-center text-gray-500 dark:text-gray-400">
        <p>© {new Date().getFullYear()} Auto AGI Builder. All rights reserved.</p>
      </footer>
    </div>
  );
}
