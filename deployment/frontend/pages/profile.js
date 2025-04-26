import React from 'react';
import Layout from '../components/layout/Layout';
import UserProfile from '../components/auth/UserProfile';
import { withProtection } from '../components/auth/ProtectedRoute';

/**
 * User profile page
 * 
 * This page is protected and only accessible to authenticated users.
 * It displays the UserProfile component which allows users to:
 * - View their profile information
 * - Edit personal details
 * - Change password
 * - View account status
 */
const ProfilePage = () => {
  return (
    <Layout title="Your Profile">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Profile</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage your account information and preferences
          </p>
        </div>
        
        <UserProfile />
      </div>
    </Layout>
  );
};

// Wrap the page with protection to ensure only authenticated users can access it
export default withProtection(ProfilePage);
