import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import analytics, { hasOptedOut } from '../../utils/analytics';
import { publicConfig } from '../../utils/config';

/**
 * Component that manages user consent for analytics tracking.
 * It displays a banner when consent is required and not yet provided.
 * It also initializes analytics when consent is provided.
 */
const AnalyticsConsent = ({ 
  children,
  requireConsent = publicConfig.features.requireAnalyticsConsent,
  showBanner = true,
  initialConsent = null,
  privacyPolicyUrl = '/privacy-policy',
  onConsentChange = () => {}
}) => {
  // State for tracking if user has given consent
  const [consent, setConsent] = useState(initialConsent);
  // State for tracking if banner should be visible
  const [showConsentBanner, setShowConsentBanner] = useState(false);
  // Get Next.js router for analytics initialization
  const router = useRouter();

  // Initialize from cookie on mount
  useEffect(() => {
    // If initial consent is provided as a prop, use it
    if (initialConsent !== null) {
      setConsent(initialConsent);
      return;
    }

    // Check if user has already opted out
    const userOptedOut = hasOptedOut();
    
    // Check for existing consent cookie
    const hasCookieConsent = document.cookie.indexOf('analytics-consent=true') !== -1;
    
    if (userOptedOut) {
      // User has explicitly opted out
      setConsent(false);
    } else if (hasCookieConsent) {
      // User has already given consent via cookie
      setConsent(true);
    } else if (requireConsent) {
      // Consent is required but not yet given, show banner
      setShowConsentBanner(showBanner);
      setConsent(false);
    } else {
      // Consent is not required, assume granted
      setConsent(true);
    }
  }, [initialConsent, requireConsent, showBanner]);

  // Initialize analytics when consent is given
  useEffect(() => {
    const initializeAnalytics = async () => {
      if (consent === true) {
        // Set consent cookie
        document.cookie = `analytics-consent=true; max-age=${60 * 60 * 24 * 365}; path=/; SameSite=Strict`;
        
        // Initialize analytics
        await analytics.initAnalytics({
          services: [
            analytics.AnalyticsServices.GOOGLE_ANALYTICS,
            analytics.AnalyticsServices.GOOGLE_TAG_MANAGER,
            analytics.AnalyticsServices.CUSTOM_EVENTS
          ],
          requireConsent: requireConsent,
          userConsent: true,
          debug: publicConfig.debug
        });
        
        // Initialize router tracking for page views
        if (router) {
          analytics.initRouterTracking(router);
        }
        
        // Hide banner
        setShowConsentBanner(false);
      } else if (consent === false) {
        // User has denied consent
        analytics.optOut();
        // Set opt-out cookie
        document.cookie = `analytics-consent=false; max-age=${60 * 60 * 24 * 365}; path=/; SameSite=Strict`;
        // Hide banner
        setShowConsentBanner(false);
      }
      
      // Notify parent of consent change
      onConsentChange(consent);
    };
    
    if (consent !== null) {
      initializeAnalytics();
    }
  }, [consent, requireConsent, router, onConsentChange]);

  // Handle accepting analytics
  const handleAccept = () => {
    setConsent(true);
  };

  // Handle declining analytics
  const handleDecline = () => {
    setConsent(false);
  };

  // Render
  return (
    <>
      {children}
      
      {/* Consent Banner */}
      {showConsentBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-100 dark:bg-gray-800 shadow-lg p-4 z-50 border-t border-gray-200 dark:border-gray-700">
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0 md:mr-4 text-gray-800 dark:text-gray-200">
              <p className="text-sm">
                We use cookies and similar technologies to analyze traffic, personalize content, and improve your experience.
                By continuing to use our site, you consent to our use of cookies.
                {' '}
                <a 
                  href={privacyPolicyUrl} 
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more in our Privacy Policy
                </a>
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleDecline}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AnalyticsConsent;
