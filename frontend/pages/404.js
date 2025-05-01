import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Custom404() {
  const router = useRouter();
  
  // Redirect to home after 5 seconds
  React.useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/');
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [router]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Head>
        <title>Page Not Found | Auto AGI Builder</title>
      </Head>
      
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-blue-600 dark:text-blue-400">404</h1>
        <h2 className="text-3xl font-semibold mt-4 text-gray-800 dark:text-gray-200">Page Not Found</h2>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <p className="mt-2 text-gray-500 dark:text-gray-500">
          You'll be redirected to the home page in 5 seconds.
        </p>
        
        <div className="mt-8">
          <Link href="/" className="px-6 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            Go to Home Page
          </Link>
        </div>
      </div>
    </div>
  );
}