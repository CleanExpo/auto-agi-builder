import React from 'react';

/**
 * Footer component
 */
const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 shadow-inner mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              &copy; {new Date().getFullYear()} Auto AGI Builder. All rights reserved.
            </p>
          </div>
          
          <div className="flex space-x-4">
            <a
              href="#"
              className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
              aria-label="Terms of Service"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
              aria-label="Privacy Policy"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
              aria-label="Contact Us"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
