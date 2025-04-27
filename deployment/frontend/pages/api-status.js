import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useUI } from '../contexts/UIContext';

export default function ApiStatus() {
  const { isDarkMode } = useUI();
  const [status, setStatus] = useState({ loading: true, connected: false, error: null });

  useEffect(() => {
    async function checkBackendStatus() {
      try {
        // Attempt to fetch from API
        const response = await fetch('/api/health-check');
        
        if (response.ok) {
          const data = await response.json();
          setStatus({
            loading: false,
            connected: true,
            message: data.message || 'Backend is connected and operational',
            version: data.version,
            error: null
          });
        } else {
          setStatus({
            loading: false,
            connected: false,
            error: `API returned status: ${response.status}`
          });
        }
      } catch (error) {
        setStatus({
          loading: false,
          connected: false,
          error: `Failed to connect to backend: ${error.message}`
        });
      }
    }

    checkBackendStatus();
  }, []);

  return (
    <div className="min-h-screen">
      <Head>
        <title>API Status | Auto AGI Builder</title>
        <meta name="description" content="Backend API Status" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            API Status Check
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-gray-600 dark:text-gray-300">
            Checking connection to the Auto AGI Builder backend
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
          {status.loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
              <p className="mt-4 text-xl">Testing connection to backend...</p>
            </div>
          ) : status.connected ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500 rounded-full mx-auto flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold mt-4 mb-2 text-green-600 dark:text-green-400">Connected Successfully</h2>
              <p className="text-lg mb-4">{status.message}</p>
              {status.version && (
                <p className="text-sm text-gray-500 dark:text-gray-400">API Version: {status.version}</p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-500 rounded-full mx-auto flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold mt-4 mb-2 text-red-600 dark:text-red-400">Connection Failed</h2>
              <p className="text-lg mb-4">{status.error}</p>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                The frontend cannot connect to the backend API. Please check if the backend server is running.
              </p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
              >
                Retry Connection
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 mt-12 text-center text-gray-500 dark:text-gray-400">
        <p>© {new Date().getFullYear()} Auto AGI Builder. All rights reserved.</p>
      </footer>
    </div>
  );
}
