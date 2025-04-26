import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUI } from '../../contexts/UIContext';

/**
 * AnalyticsConsent component
 * Displays a GDPR-compliant consent banner for analytics tracking
 * Saves user preferences to localStorage
 */
export default function AnalyticsConsent() {
  const [showConsent, setShowConsent] = useState(false);
  const { showModal } = useUI();
  const router = useRouter();

  // Check if consent is needed on component mount
  useEffect(() => {
    // Don't show on auth pages to reduce friction
    if (router.pathname.includes('/auth/')) {
      return;
    }

    // Check if user has already made a choice
    const consentGiven = localStorage.getItem('analytics-consent');
    if (consentGiven === null) {
      // Wait a moment before showing the banner to prevent immediate pop-up
      const timer = setTimeout(() => {
        setShowConsent(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [router.pathname]);

  // Handle accept consent
  const handleAccept = () => {
    localStorage.setItem('analytics-consent', 'true');
    setShowConsent(false);
    
    // Trigger any analytics initialization here
    if (window.initAnalytics) {
      window.initAnalytics();
    }
  };

  // Handle decline consent
  const handleDecline = () => {
    localStorage.setItem('analytics-consent', 'false');
    setShowConsent(false);
  };

  // Show privacy policy
  const handleShowPrivacyPolicy = () => {
    showModal('info', {
      title: 'Privacy Policy',
      message: (
        <div className="privacy-summary">
          <p className="mb-4">
            Auto AGI Builder collects usage data to improve our service. This includes:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Pages you visit</li>
            <li>Features you use</li>
            <li>Technical information about your device</li>
            <li>General location data (country level)</li>
          </ul>
          <p className="mb-4">
            We do not sell your data or share it with third parties except for service providers
            that help us analyze this data.
          </p>
          <p>
            <a 
              href="/privacy"
              className="text-indigo-600 hover:text-indigo-800 underline"
              onClick={(e) => {
                e.preventDefault();
                router.push('/privacy');
              }}
            >
              View our full privacy policy here
            </a>
          </p>
        </div>
      )
    });
  };

  // Don't render anything if consent not needed
  if (!showConsent) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-50">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between">
        <div className="mb-4 sm:mb-0 pr-4 text-sm text-gray-700">
          <p>
            We use cookies and similar technologies to improve your experience and analyze traffic.
            <button 
              className="text-indigo-600 hover:text-indigo-800 ml-1 underline"
              onClick={handleShowPrivacyPolicy}
            >
              Learn more
            </button>
          </p>
        </div>
        <div className="flex space-x-4 flex-shrink-0">
          <button 
            onClick={handleDecline}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Decline
          </button>
          <button 
            onClick={handleAccept}
            className="px-4 py-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
