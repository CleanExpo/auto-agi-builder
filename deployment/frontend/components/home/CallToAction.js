import React from 'react';
import Link from 'next/link';

/**
 * Call to action component for the landing page.
 * Displays a prominent message and button to encourage users to take action.
 * 
 * @param {string} title - The main title text
 * @param {string} description - The description text
 * @param {string} buttonText - The text for the call-to-action button
 * @param {string} buttonLink - The link for the call-to-action button
 * @param {string} bgColor - Optional background color class
 */
const CallToAction = ({ 
  title = "Ready to Get Started?", 
  description = "Join thousands of teams who are building better software faster.",
  buttonText = "Sign Up Now",
  buttonLink = "/auth/register",
  bgColor = "bg-gradient-to-r from-blue-600 to-indigo-700"
}) => {
  return (
    <section className={`py-20 ${bgColor} text-white`}>
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          {title}
        </h2>
        <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href={buttonLink}
            className="inline-flex justify-center items-center px-8 py-4 text-lg font-medium bg-white text-blue-700 rounded-lg hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
          >
            {buttonText}
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
          </Link>
          <Link
            href="/demo"
            className="inline-flex justify-center items-center px-8 py-4 text-lg font-medium bg-transparent border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
          >
            Watch Demo
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
