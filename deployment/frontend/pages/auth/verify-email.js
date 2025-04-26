import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/layout/Layout';
import { useAuth, useUI } from '../../contexts';

const VerifyEmail = () => {
  const router = useRouter();
  const { token } = router.query;
  const { verifyEmail, requestEmailVerification } = useAuth();
  const { toast } = useUI();
  
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) return;
      
      try {
        setVerifying(true);
        const result = await verifyEmail(token);
        
        if (result.success) {
          setVerified(true);
          toast.success('Email verified successfully!');
        } else {
          setError(result.error || 'Invalid or expired verification token.');
        }
      } catch (error) {
        console.error('Email verification error:', error);
        setError('An error occurred during verification. Please try again.');
      } finally {
        setVerifying(false);
      }
    };
    
    if (router.isReady && token) {
      verifyToken();
    } else if (router.isReady && !token) {
      setVerifying(false);
      setError('Verification token is missing.');
    }
  }, [router.isReady, token, verifyEmail, toast]);
  
  const handleResendVerification = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setResendLoading(true);
    
    try {
      const result = await requestEmailVerification(email);
      
      if (result.success) {
        toast.success('Verification email sent! Please check your inbox.');
      } else {
        toast.error(result.error || 'Failed to send verification email. Please try again.');
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      toast.error('An error occurred. Please try again later.');
    } finally {
      setResendLoading(false);
    }
  };
  
  // Loading state
  if (verifying) {
    return (
      <Layout title="Verifying Email">
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
            <div className="flex justify-center mb-4">
              <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Verifying your email
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Please wait while we verify your email address...
            </p>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Success state
  if (verified) {
    return (
      <Layout title="Email Verified">
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 mb-5">
              <svg className="h-6 w-6 text-green-600 dark:text-green-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Email Verified
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Your email has been successfully verified. You can now access all features of Auto AGI Builder.
            </p>
            <div className="mt-6">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Error state
  return (
    <Layout title="Email Verification">
      <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center mb-6">
            <svg className="mx-auto h-12 w-12 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Verification Failed
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              {error || 'There was a problem verifying your email.'}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="mb-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Need a new verification link? Enter your email below.
              </p>
            </div>
            
            <form className="space-y-6" onSubmit={handleResendVerification}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={resendLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendLoading ? 'Sending...' : 'Resend verification email'}
                </button>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
              >
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VerifyEmail;
