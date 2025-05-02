import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import LocalizationSettings from '../../components/localization/LocalizationSettings';
import { getServerSideProps as baseGetServerSideProps } from '../../lib/mcp/provider';

const LocalizationPage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=' + encodeURIComponent(router.asPath));
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Localization Settings | Auto AGI Builder</title>
        <meta name="description" content="Customize your localization and regional settings" />
      </Head>

      <Layout>
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Localization Settings</h1>
            <p className="mt-1 text-sm text-gray-500">
              Customize how dates, times, numbers, and currencies are displayed throughout the application.
            </p>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <LocalizationSettings />
            </div>
          </div>
          
          <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">About Localization</h2>
              <div className="prose prose-sm text-gray-500">
                <p>
                  Localization settings control how dates, times, numbers, and currencies are displayed in the Auto AGI Builder
                  application. You can choose to use your browser's detected locale or set custom preferences.
                </p>
                <p className="mt-2">
                  These settings affect all parts of the application where formatted data is displayed, including:
                </p>
                <ul className="list-disc pl-5 mt-2">
                  <li>Project timelines and schedules</li>
                  <li>Requirements and task due dates</li>
                  <li>ROI calculations and financial projections</li>
                  <li>Timestamps on comments and activity logs</li>
                </ul>
                <p className="mt-2">
                  Your preferences are stored with your user account and will be applied across all devices where you use
                  Auto AGI Builder.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export async function getServerSideProps(context) {
  // Server-side data fetching for localization settings
  const localizationData = await fetchLocalizationData();
  
  return {
    props: {
      localization: localizationData
    }
  };
}

export default LocalizationPage;
