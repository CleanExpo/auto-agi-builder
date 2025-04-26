import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Switch } from '@headlessui/react';
import { BellIcon, ShieldCheckIcon, UserGroupIcon, DocumentTextIcon, ChipIcon, ClockIcon } from '@heroicons/react/outline';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useUI } from '../../contexts/UIContext';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const NotificationSettings = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { settings, updateSettings } = useNotifications();
  const { showNotification } = useUI();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email_notifications: true,
    push_notifications: true,
    in_app_notifications: true,
    system_notifications: true,
    project_notifications: true,
    client_notifications: true,
    task_notifications: true,
    prototype_notifications: true,
    collaboration_notifications: true,
    billing_notifications: true,
    security_notifications: true,
    digest_frequency: 'daily',
    quiet_hours_start: null,
    quiet_hours_end: null,
    minimum_priority: 0
  });
  
  const [isSaving, setIsSaving] = useState(false);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=' + encodeURIComponent(router.asPath));
    }
  }, [isAuthenticated, authLoading, router]);
  
  // Initialize form with settings
  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);
  
  // Handle switch/toggle change
  const handleSwitchChange = (field) => {
    setFormData({
      ...formData,
      [field]: !formData[field]
    });
  };
  
  // Handle select change
  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle number input change
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value === '' ? null : parseInt(value, 10)
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const success = await updateSettings(formData);
      
      if (success) {
        showNotification({
          title: 'Settings Saved',
          message: 'Your notification preferences have been updated.',
          type: 'success'
        });
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
      
      showNotification({
        title: 'Error',
        message: 'Failed to save notification settings. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
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
        <title>Notification Settings | Auto AGI Builder</title>
        <meta name="description" content="Manage your notification preferences and settings" />
      </Head>
      
      <Layout>
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
            <p className="mt-1 text-sm text-gray-500">
              Customize how and when you receive notifications from Auto AGI Builder.
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
              {/* Delivery Methods */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h2 className="text-lg font-medium text-gray-900">Delivery Methods</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Choose how you want to receive notifications.
                  </p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <BellIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <span className="text-sm font-medium text-gray-900">In-app Notifications</span>
                          <p className="text-xs text-gray-500">Receive notifications within the application interface</p>
                        </div>
                      </div>
                      <Switch
                        checked={formData.in_app_notifications}
                        onChange={() => handleSwitchChange('in_app_notifications')}
                        className={classNames(
                          formData.in_app_notifications ? 'bg-blue-600' : 'bg-gray-200',
                          'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        )}
                      >
                        <span className="sr-only">Use in-app notifications</span>
                        <span
                          className={classNames(
                            formData.in_app_notifications ? 'translate-x-5' : 'translate-x-0',
                            'pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                          )}
                        />
                      </Switch>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <BellIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <span className="text-sm font-medium text-gray-900">Email Notifications</span>
                          <p className="text-xs text-gray-500">Receive notifications via email</p>
                        </div>
                      </div>
                      <Switch
                        checked={formData.email_notifications}
                        onChange={() => handleSwitchChange('email_notifications')}
                        className={classNames(
                          formData.email_notifications ? 'bg-blue-600' : 'bg-gray-200',
                          'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        )}
                      >
                        <span className="sr-only">Use email notifications</span>
                        <span
                          className={classNames(
                            formData.email_notifications ? 'translate-x-5' : 'translate-x-0',
                            'pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                          )}
                        />
                      </Switch>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <BellIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <span className="text-sm font-medium text-gray-900">Push Notifications</span>
                          <p className="text-xs text-gray-500">Receive notifications through your browser or device</p>
                        </div>
                      </div>
                      <Switch
                        checked={formData.push_notifications}
                        onChange={() => handleSwitchChange('push_notifications')}
                        className={classNames(
                          formData.push_notifications ? 'bg-blue-600' : 'bg-gray-200',
                          'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        )}
                      >
                        <span className="sr-only">Use push notifications</span>
                        <span
                          className={classNames(
                            formData.push_notifications ? 'translate-x-5' : 'translate-x-0',
                            'pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                          )}
                        />
                      </Switch>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Notification Categories */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h2 className="text-lg font-medium text-gray-900">Notification Categories</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Choose which types of notifications you want to receive.
                  </p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ShieldCheckIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900">System Notifications</span>
                      </div>
                      <Switch
                        checked={formData.system_notifications}
                        onChange={() => handleSwitchChange('system_notifications')}
                        className={classNames(
                          formData.system_notifications ? 'bg-blue-600' : 'bg-gray-200',
                          'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        )}
                      >
                        <span className="sr-only">System notifications</span>
                        <span
                          className={classNames(
                            formData.system_notifications ? 'translate-x-5' : 'translate-x-0',
                            'pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                          )}
                        />
                      </Switch>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900">Project Notifications</span>
                      </div>
                      <Switch
                        checked={formData.project_notifications}
                        onChange={() => handleSwitchChange('project_notifications')}
                        className={classNames(
                          formData.project_notifications ? 'bg-blue-600' : 'bg-gray-200',
                          'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        )}
                      >
                        <span className="sr-only">Project notifications</span>
                        <span
                          className={classNames(
                            formData.project_notifications ? 'translate-x-5' : 'translate-x-0',
                            'pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                          )}
                        />
                      </Switch>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <UserGroupIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900">Client Notifications</span>
                      </div>
                      <Switch
                        checked={formData.client_notifications}
                        onChange={() => handleSwitchChange('client_notifications')}
                        className={classNames(
                          formData.client_notifications ? 'bg-blue-600' : 'bg-gray-200',
                          'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        )}
                      >
                        <span className="sr-only">Client notifications</span>
                        <span
                          className={classNames(
                            formData.client_notifications ? 'translate-x-5' : 'translate-x-0',
                            'pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                          )}
                        />
                      </Switch>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900">Task Notifications</span>
                      </div>
                      <Switch
                        checked={formData.task_notifications}
                        onChange={() => handleSwitchChange('task_notifications')}
                        className={classNames(
                          formData.task_notifications ? 'bg-blue-600' : 'bg-gray-200',
                          'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        )}
                      >
                        <span className="sr-only">Task notifications</span>
                        <span
                          className={classNames(
                            formData.task_notifications ? 'translate-x-5' : 'translate-x-0',
                            'pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                          )}
                        />
                      </Switch>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ChipIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900">Prototype Notifications</span>
                      </div>
                      <Switch
                        checked={formData.prototype_notifications}
                        onChange={() => handleSwitchChange('prototype_notifications')}
                        className={classNames(
                          formData.prototype_notifications ? 'bg-blue-600' : 'bg-gray-200',
                          'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        )}
                      >
                        <span className="sr-only">Prototype notifications</span>
                        <span
                          className={classNames(
                            formData.prototype_notifications ? 'translate-x-5' : 'translate-x-0',
                            'pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                          )}
                        />
                      </Switch>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <UserGroupIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900">Collaboration Notifications</span>
                      </div>
                      <Switch
                        checked={formData.collaboration_notifications}
                        onChange={() => handleSwitchChange('collaboration_notifications')}
                        className={classNames(
                          formData.collaboration_notifications ? 'bg-blue-600' : 'bg-gray-200',
                          'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        )}
                      >
                        <span className="sr-only">Collaboration notifications</span>
                        <span
                          className={classNames(
                            formData.collaboration_notifications ? 'translate-x-5' : 'translate-x-0',
                            'pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                          )}
                        />
                      </Switch>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ShieldCheckIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900">Billing Notifications</span>
                      </div>
                      <Switch
                        checked={formData.billing_notifications}
                        onChange={() => handleSwitchChange('billing_notifications')}
                        className={classNames(
                          formData.billing_notifications ? 'bg-blue-600' : 'bg-gray-200',
                          'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        )}
                      >
                        <span className="sr-only">Billing notifications</span>
                        <span
                          className={classNames(
                            formData.billing_notifications ? 'translate-x-5' : 'translate-x-0',
                            'pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                          )}
                        />
                      </Switch>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ShieldCheckIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900">Security Notifications</span>
                      </div>
                      <Switch
                        checked={formData.security_notifications}
                        onChange={() => handleSwitchChange('security_notifications')}
                        className={classNames(
                          formData.security_notifications ? 'bg-blue-600' : 'bg-gray-200',
                          'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        )}
                      >
                        <span className="sr-only">Security notifications</span>
                        <span
                          className={classNames(
                            formData.security_notifications ? 'translate-x-5' : 'translate-x-0',
                            'pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                          )}
                        />
                      </Switch>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Frequency & Timing */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h2 className="text-lg font-medium text-gray-900">Frequency & Timing</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Control when and how often you receive notifications.
                  </p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="digest_frequency" className="block text-sm font-medium text-gray-700">
                        Email Digest Frequency
                      </label>
                      <select
                        id="digest_frequency"
                        name="digest_frequency"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        value={formData.digest_frequency || 'daily'}
                        onChange={handleSelectChange}
                      >
                        <option value="none">Never (real-time only)</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                      </select>
                      <p className="mt-1 text-xs text-gray-500">
                        How often you want to receive email digests of your notifications
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Quiet Hours
                      </label>
                      <div className="mt-1 grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="quiet_hours_start" className="block text-xs text-gray-500">
                            Start Time (24h)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="23"
                            id="quiet_hours_start"
                            name="quiet_hours_start"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="e.g. 22 for 10 PM"
                            value={formData.quiet_hours_start || ''}
                            onChange={handleNumberChange}
                          />
                        </div>
                        <div>
                          <label htmlFor="quiet_hours_end" className="block text-xs text-gray-500">
                            End Time (24h)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="23"
                            id="quiet_hours_end"
                            name="quiet_hours_end"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="e.g. 6 for 6 AM"
                            value={formData.quiet_hours_end || ''}
                            onChange={handleNumberChange}
                          />
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        We won't send push or email notifications during quiet hours
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="minimum_priority" className="block text-sm font-medium text-gray-700">
                        Minimum Priority
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        id="minimum_priority"
                        name="minimum_priority"
                        className="mt-1 block w-full"
                        value={formData.minimum_priority || 0}
                        onChange={handleNumberChange}
                      />
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">All (0)</span>
                        <span className="text-xs text-gray-700">Current: {formData.minimum_priority}</span>
                        <span className="text-xs text-gray-500">Critical (10)</span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Only receive notifications with this priority level or higher
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </Layout>
    </>
  );
};

export default NotificationSettings;
