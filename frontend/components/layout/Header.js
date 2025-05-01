import React from 'react';
import Link from 'next/link';

/**
 * Header component for site navigation
 */
const Header = () => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <a className="text-xl font-bold text-blue-600 dark:text-blue-400">
            Auto AGI Builder
          </a>
        </Link>
        
        <nav className="hidden md:flex space-x-6">
          <Link href="/dashboard">
            <a className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
              Dashboard
            </a>
          </Link>
          <Link href="/projects">
            <a className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
              Projects
            </a>
          </Link>
          <Link href="/requirements">
            <a className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
              Requirements
            </a>
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          <button
            className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
            aria-label="Toggle theme"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
          
          <div className="relative">
            <button
              className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
              aria-label="User menu"
            >
              <span className="sr-only">User menu</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
