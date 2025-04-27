import React from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Header component for the landing page
 * Includes navigation and theme toggle
 */
export function Header() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header className="fixed w-full bg-white dark:bg-gray-900 shadow-md z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo and Name */}
        <div className="flex items-center">
          <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
            Auto AGI Builder
          </span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex space-x-8">
          <Link href="#features" className="text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400">
            Features
          </Link>
          <Link href="#benefits" className="text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400">
            Benefits
          </Link>
          <Link href="#testimonials" className="text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400">
            Testimonials
          </Link>
          <Link href="#pricing" className="text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400">
            Pricing
          </Link>
        </nav>

        {/* Theme Toggle and CTA */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          
          <Link href="#demo" className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md font-medium">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
