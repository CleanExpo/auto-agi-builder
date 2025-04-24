"""
Frontend builder for the Auto AGI Builder system.
Handles React component generation, pages, and frontend services.
"""
import os
import sys
import logging
import json
import shutil
from typing import List, Dict, Any, Optional, Union, Tuple
from pathlib import Path

from builder_core import BuilderCore

class FrontendBuilder(BuilderCore):
    """
    Handles the generation and management of frontend components.
    Builds React components, pages, and utilities for the Next.js frontend.
    """
    
    def __init__(self, project_root: str = None):
        """Initialize the frontend builder."""
        super().__init__(project_root)
        self.logger = logging.getLogger("frontend_builder")
        
        # Check Node.js version
        node_version = self._get_node_version()
        if node_version and node_version < (16, 0, 0):
            self.logger.warning(f"Node.js 16+ is recommended. Current version: {'.'.join(map(str, node_version))}")
    
    def _get_node_version(self) -> Optional[Tuple[int, ...]]:
        """Get the Node.js version as a tuple of integers."""
        try:
            _, stdout, _ = self.run_command("node --version")
            if stdout:
                # Remove 'v' prefix and split by '.'
                version_str = stdout.strip().lstrip('v')
                return tuple(map(int, version_str.split('.')))
            return None
        except Exception as e:
            self.logger.error(f"Error getting Node.js version: {e}")
            return None
    
    def setup_nextjs(self) -> bool:
        """
        Set up the Next.js application structure.
        
        Returns:
            bool: True if successful, False otherwise
        """
        self.logger.info("Setting up Next.js application structure...")
        
        # Create necessary directories
        dirs = [
            "frontend",
            "frontend/components",
            "frontend/components/common",
            "frontend/components/layout",
            "frontend/components/auth",
            "frontend/components/requirements",
            "frontend/components/prototype",
            "frontend/components/ROI",
            "frontend/components/documents",
            "frontend/components/roadmap",
            "frontend/pages",
            "frontend/pages/api",
            "frontend/pages/auth",
            "frontend/pages/projects",
            "frontend/styles",
            "frontend/public",
            "frontend/public/images",
            "frontend/utils",
            "frontend/contexts",
            "frontend/lib",
            "frontend/hooks",
        ]
        
        for directory in dirs:
            dir_path = self.project_root / directory
            if not dir_path.exists():
                self.logger.info(f"Creating directory: {dir_path}")
                dir_path.mkdir(parents=True, exist_ok=True)
        
        # Create key files
        
        # Create _app.js
        app_js_content = """
import '../styles/globals.css';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from '../contexts/AuthContext';
import { UIProvider } from '../contexts/UIContext';
import { ProjectProvider } from '../contexts/ProjectContext';
import Layout from '../components/layout/Layout';

// Create a client
const queryClient = new QueryClient();

function MyApp({ Component, pageProps }) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <AuthProvider>
          <UIProvider>
            <ProjectProvider>
              {getLayout(<Component {...pageProps} />)}
            </ProjectProvider>
          </UIProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default MyApp;
"""
        if self.create_file("frontend/pages/_app.js", app_js_content):
            self.logger.info("Created _app.js")
        
        # Create _document.js
        document_js_content = """
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="icon" href="/favicon.ico" />
          <meta name="description" content="Auto AGI Builder - AI-powered prototype development platform" />
          <meta property="og:title" content="Auto AGI Builder" />
          <meta property="og:description" content="AI-powered prototype development platform" />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://auto-agi-builder.vercel.app" />
          <meta property="og:image" content="https://auto-agi-builder.vercel.app/images/og-image.png" />
          <meta name="twitter:card" content="summary_large_image" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
"""
        if self.create_file("frontend/pages/_document.js", document_js_content):
            self.logger.info("Created _document.js")
        
        # Create index.js
        index_js_content = """
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import HeroSection from '../components/home/HeroSection';
import FeatureSection from '../components/home/FeatureSection';
import QuickStartForm from '../components/home/QuickStartForm';
import CallToAction from '../components/home/CallToAction';
import TestimonialSection from '../components/home/TestimonialSection';
import PricingSection from '../components/home/PricingSection';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  // If user is logged in, redirect to dashboard
  if (user) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-900">
      <Head>
        <title>Auto AGI Builder - AI-powered prototype development platform</title>
      </Head>

      <HeroSection />
      <FeatureSection />
      <QuickStartForm />
      <TestimonialSection />
      <PricingSection />
      <CallToAction />
    </div>
  );
}

// Use custom layout without sidebar for homepage
Home.getLayout = function getLayout(page) {
  return (
    <div className="min-h-screen">
      <header className="bg-white dark:bg-gray-900 shadow">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              Auto AGI Builder
            </Link>
          </div>
          <div className="flex space-x-4">
            <Link href="/auth/login" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
              Log in
            </Link>
            <Link href="/auth/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md">
              Sign up
            </Link>
          </div>
        </nav>
      </header>
      <main>{page}</main>
      <footer className="bg-gray-100 dark:bg-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Auto AGI Builder. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
"""
        if self.create_file("frontend/pages/index.js", index_js_content):
            self.logger.info("Created index.js")
        
        # Create dashboard.js
        dashboard_js_content = """
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProject } from '../contexts/ProjectContext';
import { requireAuth } from '../components/auth/ProtectedRoute';
import ProjectCard from '../components/projects/ProjectCard';

function Dashboard() {
  const { user } = useAuth();
  const { projects, loading, error, fetchProjects } = useProject();
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
  });

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user, fetchProjects]);

  useEffect(() => {
    if (projects) {
      setStats({
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'active').length,
        completedProjects: projects.filter(p => p.status === 'completed').length,
      });
    }
  }, [projects]);

  return (
    <>
      <Head>
        <title>Dashboard | Auto AGI Builder</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Welcome, {user?.displayName || 'User'}
        </h1>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Projects</h3>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{stats.totalProjects}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Active Projects</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.activeProjects}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Completed Projects</h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.completedProjects}</p>
          </div>
        </div>

        {/* Projects list */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Projects</h2>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md">
              New Project
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading projects...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded">
              <p>Error loading projects. Please try again.</p>
            </div>
          ) : projects?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No projects yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create your first project to get started with Auto AGI Builder.
              </p>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md">
                Create Project
              </button>
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {[1, 2, 3].map((item) => (
                <li key={item} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-indigo-200 dark:bg-indigo-900 flex items-center justify-center">
                        <span className="text-indigo-600 dark:text-indigo-300 text-sm font-medium">
                          {item}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        Activity {item}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      </p>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date().toLocaleDateString()}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default requireAuth(Dashboard);
"""
        if self.create_file("frontend/pages/dashboard.js", dashboard_js_content):
            self.logger.info("Created dashboard.js")
        
        # Create AuthContext.js
        auth_context_content = """
import { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import api from '../lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Check if user is authenticated on load
  useEffect(() => {
    async function loadUserFromLocalStorage() {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Set default auth header
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch user profile
          const response = await api.get('/auth/me');
          setUser(response.data);
        }
      } catch (err) {
        console.error('Failed to load user', err);
        // Remove invalid token
        localStorage.removeItem('token');
        api.defaults.headers.common['Authorization'] = '';
      } finally {
        setLoading(false);
      }
    }

    loadUserFromLocalStorage();
  }, []);

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      // Store token
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      return user;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (name, email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
      });
      
      const { token, user } = response.data;
      
      // Store token
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      return user;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    api.defaults.headers.common['Authorization'] = '';
    setUser(null);
    router.push('/auth/login');
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
"""
        if self.create_file("frontend/contexts/AuthContext.js", auth_context_content):
            self.logger.info("Created AuthContext.js")
        
        # Create api.js
        api_js_content = """
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Add token to request if it exists
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle token refresh for expired tokens (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const res = await axios.post(`${api.defaults.baseURL}/auth/refresh-token`, {
            refreshToken,
          });
          
          if (res.data.token) {
            localStorage.setItem('token', res.data.token);
            api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
            
            // Retry the original request with the new token
            return api(originalRequest);
          }
        }
      } catch (err) {
        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
"""
        if self.create_file("frontend/lib/api.js", api_js_content):
            self.logger.info("Created api.js")
        
        # Create globals.css
        globals_css_content = """
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900;
  }
  
  h1, h2, h3, h4, h5, h6 {
    @apply font-bold;
  }
  
  h1 {
    @apply text-4xl;
  }
  
  h2 {
    @apply text-3xl;
  }
  
  h3 {
    @apply text-2xl;
  }
  
  h4 {
    @apply text-xl;
  }
  
  a {
    @apply text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300;
  }
  
  /* Custom scrollbar for Webkit browsers */
  ::-webkit-scrollbar {
    @apply w-2;
  }
  
  ::-webkit-scrollbar-track {
    @apply bg-gray-200 dark:bg-gray-800;
  }
  
  ::-webkit-scrollbar-thumb {
    @apply bg-gray-400 dark:bg-gray-600 rounded-full;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    @apply bg-gray-500 dark:bg-gray-500;
  }
}

@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md;
  }
  
  .btn-secondary {
    @apply px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-md;
  }
  
  .btn-danger {
    @apply px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md;
  }
  
  .card {
    @apply bg-white dark:bg-gray-800 rounded-lg shadow p-6;
  }
  
  .form-input {
    @apply mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500;
  }
  
  .form-label {
    @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1;
  }
  
  .form-error {
    @apply mt-1 text-sm text-red-600 dark:text-red-400;
  }
}
"""
        if self.create_file("frontend/styles/globals.css", globals_css_content):
            self.logger.info("Created globals.css")
        
        # Create tailwind.config.js
        tailwind_config_content = """
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
"""
        if self.create_file("frontend/tailwind.config.js", tailwind_config_content):
            self.logger.info("Created tailwind.config.js")
        
        return True
    
    def generate_component(self, component_name: str, component_type: str = "functional") -> bool:
        """
        Generate a React component.
        
        Args:
            component_name: Name of the component
            component_type: Type of component (functional or class)
            
        Returns:
            bool: True if successful, False otherwise
        """
        self.logger.info(f"Generating {component_type} component: {component_name}")
        
        # Determine directory structure from component name
        parts = component_name.split('/')
        file_name = parts[-1]
        
        # Ensure proper casing
        file_name = file_name[0].upper() + file_name[1:]
        
        # Determine the path
        if len(parts) > 1:
            directory = '/'.join(parts[:-1])
            component_path = f"frontend/components/{directory}/{file_name}.js"
        else:
            component_path = f"frontend/components/{file_name}.js"
        
        # Create the component content
        if component_type == "functional":
            component_content = f"""
import React from 'react';

const {file_name} = ({{ children }}) => {{
  return (
    <div className="{file_name.lower()}">
      {{{file_name} component}}
      {{children}}
    </div>
  );
}};

export default {file_name};
"""
        else:  # class component
            component_content = f"""
import React, {{ Component }} from 'react';

class {file_name} extends Component {{
  constructor(props) {{
    super(props);
    this.state = {{
      // Initial state
    }};
  }}

  render() {{
    const {{ children }} = this.props;
    
    return (
      <div className="{file_name.lower()}">
        {{{file_name} component}}
        {{children}}
      </div>
    );
  }}
}}

export default {file_name};
"""
        
        # Create the component file
        if self.create_file(component_path, component_content):
            self.logger.info(f"Created component {file_name} at {component_path}")
            return True
        return False
    
    def generate_page(self, page_name: str) -> bool:
        """
        Generate a Next.js page.
        
        Args:
            page_name: Name of the page
            
        Returns:
            bool: True if successful, False otherwise
        """
        self.logger.info(f"Generating page: {page_name}")
        
        # Determine directory structure from page name
        parts = page_name.split('/')
        file_name = parts[-1]
        
        # Determine the path
        if len(parts) > 1:
            directory = '/'.join(parts[:-1])
            page_path = f"frontend/pages/{directory}/{file_name}.js"
        else:
            page_path = f"frontend/pages/{file_name}.js"
        
        # Create the page content
        page_content = f"""
import Head from 'next/head';
import {{ useAuth }} from '../contexts/AuthContext';
import {{ requireAuth }} from '../components/auth/ProtectedRoute';

function {file_name.charAt(0).toUpperCase() + file_name.slice(1)}Page() {{
  const {{ user }} = useAuth();
  
  return (
    <>
      <Head>
        <title>{file_name.charAt(0).toUpperCase() + file_name.slice(1)} | Auto AGI Builder</title>
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          {file_name.charAt(0).toUpperCase() + file_name.slice(1)}
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-gray-700 dark:text-gray-300">
            Content for {file_name} page goes here.
          </p>
        </div>
      </div>
    </>
  );
}}

export default requireAuth({file_name.charAt(0).toUpperCase() + file_name.slice(1)}Page);
"""
        
        # Create the page file
        if self.create_file(page_path, page_content):
            self.logger.info(f"Created page {file_name} at {page_path}")
            return True
        return False
    
    def setup_api_routes(self) -> bool:
        """
        Set up API routes for Next.js.
        
        Returns:
            bool: True if successful, False otherwise
        """
        self.logger.info("Setting up API routes...")
        
        # Create API directory if it doesn't exist
        api_dir = self.project_root / "frontend" / "pages" / "api"
        api_dir.mkdir(parents=True, exist_ok=True)
        
        # Create health check API route
        health_route_content = """
export default function handler(req, res) {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
}
"""
