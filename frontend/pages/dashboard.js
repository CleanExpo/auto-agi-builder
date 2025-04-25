import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import PageWrapper from '../components/layout/PageWrapper';
import ResponsiveContainer from '../components/common/ResponsiveContainer';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../contexts';
import Link from 'next/link';

const DashboardPage = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    projects: 0,
    requirements: 0,
    documents: 0,
    prototypes: 0
  });

  // Simulated data loading
  useEffect(() => {
    const loadDashboardData = async () => {
      // In a real app, this would fetch data from API
      setTimeout(() => {
        setStats({
          projects: 5,
          requirements: 27,
          documents: 12,
          prototypes: 3
        });
        setIsLoading(false);
      }, 1000);
    };

    loadDashboardData();
  }, []);

  const statCards = [
    { 
      title: 'Projects', 
      value: stats.projects, 
      icon: '📋', 
      href: '/projects',
      color: 'bg-blue-500',
      delay: 'animation-delay-100'
    },
    { 
      title: 'Requirements', 
      value: stats.requirements, 
      icon: '✓', 
      href: '/requirements',
      color: 'bg-green-500',
      delay: 'animation-delay-200'
    },
    { 
      title: 'Documents', 
      value: stats.documents, 
      icon: '📄', 
      href: '/documents',
      color: 'bg-purple-500',
      delay: 'animation-delay-300'
    },
    { 
      title: 'Prototypes', 
      value: stats.prototypes, 
      icon: '⚙️', 
      href: '/prototype',
      color: 'bg-orange-500',
      delay: 'animation-delay-400'
    }
  ];

  const featuredTools = [
    {
      name: 'ROI Calculator',
      description: 'Calculate the potential return on investment for your projects',
      icon: '💰',
      href: '/roi',
      delay: 'animation-delay-100'
    },
    {
      name: 'Device Preview',
      description: 'Preview your designs across different device sizes',
      icon: '📱',
      href: '/device-preview',
      delay: 'animation-delay-200'
    },
    {
      name: 'Project Roadmap',
      description: 'Visualize and plan your project timeline',
      icon: '🗺️',
      href: '/roadmap',
      delay: 'animation-delay-300'
    },
    {
      name: 'Presentation Mode',
      description: 'Create presentations from your project data',
      icon: '🎭',
      href: '/presentation',
      delay: 'animation-delay-400'
    }
  ];

  return (
    <Layout title="Dashboard">
      <PageWrapper>
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner 
              size="lg" 
              color="primary" 
              text="Loading your dashboard..."
            />
          </div>
        ) : (
          <ResponsiveContainer animation="animate-fade-in">
            {/* Welcome Section */}
            <div className="mb-10 animate-fade-in-up">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                Welcome back, {user?.name || 'User'}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Here's an overview of your latest activity and tools
              </p>
            </div>
            
            {/* Stats Section */}
            <div className="mb-12">
              <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200 animate-fade-in-up animation-delay-100">
                Project Statistics
              </h2>
              <ResponsiveContainer.Grid
                cols={{ sm: 1, md: 2, lg: 4 }}
                gap="gap-6"
              >
                {statCards.map((stat, index) => (
                  <Link 
                    key={index} 
                    href={stat.href} 
                    className={`
                      ${stat.color} text-white rounded-lg shadow-md hover:shadow-lg 
                      transition-all duration-300 transform hover:-translate-y-1 
                      animate-card-reveal ${stat.delay}
                    `}
                  >
                    <div className="p-6">
                      <div className="text-3xl mb-2">{stat.icon}</div>
                      <div className="text-2xl font-bold mb-1">{stat.value}</div>
                      <div className="text-sm opacity-90">{stat.title}</div>
                    </div>
                  </Link>
                ))}
              </ResponsiveContainer.Grid>
            </div>
            
            {/* Recent Activity Section */}
            <div className="mb-12 animate-fade-in-up animation-delay-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
                Recent Activity
              </h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="space-y-4">
                  <div className="animate-slide-in-right animation-delay-100">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Yesterday</p>
                    <div className="flex items-center mt-1">
                      <span className="text-green-500 mr-2">✓</span>
                      <p>Added 5 new requirements to <span className="font-medium">Mobile App</span> project</p>
                    </div>
                  </div>
                  
                  <div className="animate-slide-in-right animation-delay-200">
                    <p className="text-sm text-gray-500 dark:text-gray-400">2 days ago</p>
                    <div className="flex items-center mt-1">
                      <span className="text-blue-500 mr-2">📄</span>
                      <p>Uploaded <span className="font-medium">Project Spec</span> document</p>
                    </div>
                  </div>
                  
                  <div className="animate-slide-in-right animation-delay-300">
                    <p className="text-sm text-gray-500 dark:text-gray-400">3 days ago</p>
                    <div className="flex items-center mt-1">
                      <span className="text-orange-500 mr-2">⚙️</span>
                      <p>Generated <span className="font-medium">Homepage</span> prototype</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tools Section */}
            <div className="mb-10 animate-fade-in-up animation-delay-300">
              <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
                Featured Tools
              </h2>
              <ResponsiveContainer.Grid
                cols={{ sm: 1, md: 2 }}
                gap="gap-6"
              >
                {featuredTools.map((tool, index) => (
                  <Link 
                    key={index} 
                    href={tool.href} 
                    className="
                      bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg p-6
                      transition-all duration-300 transform hover:-translate-y-1
                      animate-scale-in ${tool.delay}
                    "
                  >
                    <div className="text-3xl mb-3">{tool.icon}</div>
                    <h3 className="text-lg font-semibold mb-2">{tool.name}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{tool.description}</p>
                  </Link>
                ))}
              </ResponsiveContainer.Grid>
            </div>
          </ResponsiveContainer>
        )}
      </PageWrapper>
    </Layout>
  );
};

export default DashboardPage;
