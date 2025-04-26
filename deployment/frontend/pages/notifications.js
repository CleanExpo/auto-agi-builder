import React, { useState } from 'react';
import Head from 'next/head';
import { Tab } from '@headlessui/react';
import { 
  InboxIcon, 
  ArchiveIcon, 
  AdjustmentsIcon,
  FilterIcon,
  SearchIcon,
  XIcon
} from '@heroicons/react/outline';
import Layout from '../components/layout/Layout';
import NotificationList from '../components/notifications/NotificationList';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const NotificationsPage = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { 
    notifications, 
    applyFilters, 
    filters: currentFilters 
  } = useNotifications();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: currentFilters.type || null,
    category: currentFilters.category || null,
    priority_min: currentFilters.priority_min || 0,
    priority_max: currentFilters.priority_max || 10
  });
  
  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=' + encodeURIComponent(router.asPath));
    }
  }, [isAuthenticated, authLoading, router]);
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    applyFilters({
      ...currentFilters,
      search: searchQuery.trim() || null
    });
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    applyFilters({
      ...currentFilters,
      search: null
    });
  };
  
  // Apply filters
  const handleApplyFilters = () => {
    applyFilters({
      ...currentFilters,
      ...filters
    });
    setShowFilters(false);
  };
  
  // Reset filters
  const handleResetFilters = () => {
    const resetFilters = {
      is_read: null,
      is_archived: currentFilters.is_archived,
      type: null,
      category: null,
      priority_min: null,
      priority_max: null,
      search: currentFilters.search
    };
    
    setFilters({
      type: null,
      category: null,
      priority_min: 0,
      priority_max: 10
    });
    
    applyFilters(resetFilters);
  };
  
  // Handle tab change
  const handleTabChange = (index) => {
    // Tab index 0 = Inbox, 1 = Archive
    const is_archived = index === 1;
    
    applyFilters({
      ...currentFilters,
      is_archived
    });
  };
  
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="spinner"></div>
      </div>
    );
  }
  
  return (
    <>
      <Head>
        <title>Notifications | Auto AGI Builder</title>
        <meta name="description" content="View and manage your notifications" />
      </Head>
      
      <Layout>
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="mt-1 text-sm text-gray-500">
              View and manage all your notifications in one place.
            </p>
          </div>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <Tab.Group onChange={handleTabChange}>
                <div className="border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <Tab.List className="flex space-x-4">
                      <Tab
                        className={({ selected }) =>
                          classNames(
                            selected
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center'
                          )
                        }
                      >
                        <InboxIcon className="h-5 w-5 mr-2" />
                        Inbox
                      </Tab>
                      <Tab
                        className={({ selected }) =>
                          classNames(
                            selected
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center'
                          )
                        }
                      >
                        <ArchiveIcon className="h-5 w-5 mr-2" />
                        Archive
                      </Tab>
                      <Tab
                        className={({ selected }) =>
                          classNames(
                            selected
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center'
                          )
                        }
                        onClick={(e) => {
                          e.preventDefault();
                          router.push('/settings/notifications');
                        }}
                      >
                        <AdjustmentsIcon className="h-5 w-5 mr-2" />
                        Settings
                      </Tab>
                    </Tab.List>
                    
                    <div className="flex items-center space-x-2">
                      <form onSubmit={handleSearch} className="relative">
                        <input
                          type="text"
                          placeholder="Search notifications"
                          className="rounded-md border border-gray-300 shadow-sm py-2 pl-10 pr-8 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <SearchIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        {searchQuery && (
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={clearSearch}
                          >
                            <XIcon className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                          </button>
                        )}
                      </form>
                      
                      <button
                        type="button"
                        className={`ml-2 p-2 rounded-md ${
                          showFilters
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setShowFilters(!showFilters)}
                      >
                        <FilterIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {showFilters && (
                  <div className="pt-3 pb-4 px-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Filters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="filter-type" className="block text-xs font-medium text-gray-700">
                          Type
                        </label>
                        <select
                          id="filter-type"
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          value={filters.type || ''}
                          onChange={(e) => setFilters({ ...filters, type: e.target.value || null })}
                        >
                          <option value="">All Types</option>
                          <option value="info">Info</option>
                          <option value="success">Success</option>
                          <option value="warning">Warning</option>
                          <option value="error">Error</option>
                          <option value="system">System</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="filter-category" className="block text-xs font-medium text-gray-700">
                          Category
                        </label>
                        <select
                          id="filter-category"
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          value={filters.category || ''}
                          onChange={(e) => setFilters({ ...filters, category: e.target.value || null })}
                        >
                          <option value="">All Categories</option>
                          <option value="system">System</option>
                          <option value="project">Project</option>
                          <option value="client">Client</option>
                          <option value="task">Task</option>
                          <option value="prototype">Prototype</option>
                          <option value="collaboration">Collaboration</option>
                          <option value="billing">Billing</option>
                          <option value="security">Security</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="filter-priority" className="block text-xs font-medium text-gray-700">
                          Priority (0-10)
                        </label>
                        <div className="flex items-center mt-1 space-x-2">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={filters.priority_min}
                            onChange={(e) => setFilters({ ...filters, priority_min: parseInt(e.target.value, 10) || 0 })}
                          />
                          <span className="text-gray-500">to</span>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={filters.priority_max}
                            onChange={(e) => setFilters({ ...filters, priority_max: parseInt(e.target.value, 10) || 10 })}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end space-x-3">
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={handleResetFilters}
                      >
                        Reset
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={handleApplyFilters}
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                )}
                
                <Tab.Panels className="mt-4">
                  <Tab.Panel>
                    <NotificationList variant="default" />
                  </Tab.Panel>
                  <Tab.Panel>
                    <NotificationList variant="default" emptyMessage="No archived notifications" />
                  </Tab.Panel>
                  <Tab.Panel></Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default NotificationsPage;
