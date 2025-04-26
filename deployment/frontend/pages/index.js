import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import { useAuth } from '../contexts/AuthContext';
import { useProject } from '../contexts/ProjectContext';
import { useUI } from '../contexts/UIContext';
import Layout from '../components/layout/Layout';
import ProjectCard from '../components/projects/ProjectCard';
import FeatureSection from '../components/home/FeatureSection';
import QuickStartForm from '../components/home/QuickStartForm';
import HeroSection from '../components/home/HeroSection';
import TestimonialSection from '../components/home/TestimonialSection';
import PricingSection from '../components/home/PricingSection';
import CallToAction from '../components/home/CallToAction';
import AnalyticsConsent from '../components/common/AnalyticsConsent';
import { trackPageView } from '../utils/analytics';

/**
 * Homepage component that serves as the landing page for the application.
 * Shows different content for authenticated and unauthenticated users.
 */
export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { projects, loading: projectsLoading, createProject } = useProject();
  const { showModal } = useUI();
  const [recentProjects, setRecentProjects] = useState([]);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  
  // Track page view
  useEffect(() => {
    trackPageView('home');
  }, []);
  
  // Set recent projects when projects load
  useEffect(() => {
    if (!projectsLoading && projects.length > 0) {
      // Sort projects by last updated date
      const sorted = [...projects].sort((a, b) => 
        new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      // Take the 3 most recent projects
      setRecentProjects(sorted.slice(0, 3));
    }
  }, [projects, projectsLoading]);
  
  // Quick start project creation
  const handleQuickStart = async (projectData) => {
    try {
      setIsCreatingProject(true);
      const newProject = await createProject(projectData);
      router.push(`/projects/${newProject.id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
      showModal('error', {
        title: 'Project Creation Failed',
        message: 'There was an error creating your project. Please try again.'
      });
    } finally {
      setIsCreatingProject(false);
    }
  };
  
  // Content for authenticated users (dashboard view)
  const AuthenticatedContent = () => (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Welcome back, {user?.name || 'User'}</h1>
        <button
          onClick={() => showModal('project-form')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          New Project
        </button>
      </div>
      
      {/* Recent Projects Section */}
      <section className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Recent Projects</h2>
          <Link href="/projects" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            View All Projects
          </Link>
        </div>
        
        {projectsLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : recentProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProjects.map(project => (
              <ProjectCard 
                key={project.id} 
                project={project} 
              />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
            <h3 className="text-xl font-medium text-gray-700 dark:text-gray-200 mb-2">No projects yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Start by creating your first project</p>
            <button
              onClick={() => showModal('project-form')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Create Project
            </button>
          </div>
        )}
      </section>
      
      {/* Quick Actions Section */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard 
            title="Document Import" 
            description="Upload and analyze documents"
            icon="/icons/document.svg"
            href="/documents"
          />
          <QuickActionCard 
            title="Requirements" 
            description="Manage project requirements"
            icon="/icons/requirements.svg"
            href="/requirements"
          />
          <QuickActionCard 
            title="Generate Prototype" 
            description="Create interactive prototypes"
            icon="/icons/prototype.svg"
            href="/prototype"
          />
          <QuickActionCard 
            title="Calculate ROI" 
            description="Estimate project return on investment"
            icon="/icons/roi.svg"
            href="/roi"
          />
        </div>
      </section>
      
      {/* Activity Feed Section */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Recent Activity</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {user?.activities?.length > 0 ? (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {user.activities.slice(0, 5).map((activity, index) => (
                <li key={index} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.description}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
  
  // Content for unauthenticated users (landing page)
  const UnauthenticatedContent = () => (
    <>
      <HeroSection onGetStarted={() => router.push('/auth/register')} />
      
      <FeatureSection />
      
      <section className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-12">
            Create Your First Project
          </h2>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 md:p-8 max-w-3xl mx-auto">
            <QuickStartForm 
              onSubmit={handleQuickStart} 
              isLoading={isCreatingProject}
              requiresAuth={true}
              onRequiresAuth={() => router.push('/auth/login?redirect=/&action=quickstart')}
            />
          </div>
        </div>
      </section>
      
      <TestimonialSection />
      
      <PricingSection />
      
      <CallToAction 
        title="Ready to Build Your Next Big Idea?"
        description="Join thousands of developers and teams using Auto AGI Builder to accelerate their software development process."
        buttonText="Get Started Free"
        buttonLink="/auth/register"
      />
    </>
  );
  
  return (
    <>
      <Head>
        <title>Auto AGI Builder | AI-Powered Software Development</title>
        <meta name="description" content="Transform your ideas into prototype applications in minutes with AI-powered software development assistant" />
      </Head>

      <Layout>
        {authLoading ? (
          <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {isAuthenticated ? <AuthenticatedContent /> : <UnauthenticatedContent />}
          </>
        )}
      </Layout>
    </>
  );
}

// Helper component for quick actions
function QuickActionCard({ title, description, icon, href }) {
  return (
    <Link href={href} className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
        <Image src={icon} alt={title} width={24} height={24} />
      </div>
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400">{description}</p>
    </Link>
  );
}

// Helper functions for activity feed
function getActivityColor(type) {
  switch (type) {
    case 'create':
      return 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300';
    case 'update':
      return 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300';
    case 'delete':
      return 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300';
    case 'import':
      return 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300';
    case 'export':
      return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300';
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
  }
}

function getActivityIcon(type) {
  switch (type) {
    case 'create':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
      );
    case 'update':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
        </svg>
      );
    case 'delete':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
      );
    case 'import':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
        </svg>
      );
    case 'export':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
        </svg>
      );
    default:
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      );
  }
}
