import React, { useState } from 'react';
import { FiSave, FiSliders, FiEye, FiLayout, FiSettings, FiCheckSquare } from 'react-icons/fi';

/**
 * Client Settings Component
 * 
 * Used for managing client organization settings and preferences
 * @param {Object} props - Component props
 * @param {Object} props.client - Client data
 * @param {Function} props.onSave - Save handler function
 * @param {Boolean} props.isSaving - Whether settings are currently saving
 */
const ClientSettings = ({ client, onSave, isSaving = false }) => {
  // Initialize settings state with client data or defaults
  const [settings, setSettings] = useState({
    theme: {
      primaryColor: '#007bff',
      secondaryColor: '#6c757d',
      logoPosition: 'left',
      darkMode: false,
      ...client?.settings?.theme
    },
    features: {
      collaborationEnabled: true,
      exportEnabled: true,
      customDomainEnabled: false,
      advancedAnalyticsEnabled: false,
      aiAssistantEnabled: true,
      ...client?.settings?.features
    },
    notifications: {
      emailNotifications: true,
      slackIntegration: false,
      notifyOnProjectUpdates: true,
      notifyOnComments: true,
      notifyOnMemberChanges: true,
      ...client?.settings?.notifications
    },
    security: {
      enforceStrongPasswords: true,
      twoFactorRequired: false,
      sessionTimeout: 30, // minutes
      ipRestrictions: false,
      ...client?.settings?.security
    },
    ...client?.settings
  });
  
  // Handle theme color change
  const handleColorChange = (colorType, color) => {
    setSettings({
      ...settings,
      theme: {
        ...settings.theme,
        [colorType]: color
      }
    });
  };
  
  // Handle logo position change
  const handleLogoPositionChange = (position) => {
    setSettings({
      ...settings,
      theme: {
        ...settings.theme,
        logoPosition: position
      }
    });
  };
  
  // Handle feature toggle
  const handleFeatureToggle = (feature) => {
    setSettings({
      ...settings,
      features: {
        ...settings.features,
        [feature]: !settings.features[feature]
      }
    });
  };
  
  // Handle notification toggle
  const handleNotificationToggle = (notificationType) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [notificationType]: !settings.notifications[notificationType]
      }
    });
  };
  
  // Handle security toggle
  const handleSecurityToggle = (securityOption) => {
    setSettings({
      ...settings,
      security: {
        ...settings.security,
        [securityOption]: !settings.security[securityOption]
      }
    });
  };
  
  // Handle session timeout change
  const handleSessionTimeoutChange = (timeout) => {
    setSettings({
      ...settings,
      security: {
        ...settings.security,
        sessionTimeout: parseInt(timeout, 10) || 30
      }
    });
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...client,
      settings
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Theme Settings */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex items-center">
          <FiEye className="mr-2 text-blue-500" />
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Theme Settings
          </h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Primary Color */}
            <div className="sm:col-span-3">
              <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">
                Primary Color
              </label>
              <div className="mt-1 flex items-center">
                <input
                  type="color"
                  id="primaryColor"
                  value={settings.theme.primaryColor}
                  onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                  className="h-8 w-8 rounded-full border border-gray-300 mr-2"
                />
                <input
                  type="text"
                  value={settings.theme.primaryColor}
                  onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            {/* Secondary Color */}
            <div className="sm:col-span-3">
              <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700">
                Secondary Color
              </label>
              <div className="mt-1 flex items-center">
                <input
                  type="color"
                  id="secondaryColor"
                  value={settings.theme.secondaryColor}
                  onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                  className="h-8 w-8 rounded-full border border-gray-300 mr-2"
                />
                <input
                  type="text"
                  value={settings.theme.secondaryColor}
                  onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            {/* Logo Position */}
            <div className="sm:col-span-3">
              <label htmlFor="logoPosition" className="block text-sm font-medium text-gray-700">
                Logo Position
              </label>
              <div className="mt-1">
                <select
                  id="logoPosition"
                  value={settings.theme.logoPosition}
                  onChange={(e) => handleLogoPositionChange(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>
            
            {/* Dark Mode */}
            <div className="sm:col-span-3">
              <div className="flex items-center h-full">
                <input
                  id="darkMode"
                  name="darkMode"
                  type="checkbox"
                  checked={settings.theme.darkMode}
                  onChange={() => handleColorChange('darkMode', !settings.theme.darkMode)}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="darkMode" className="ml-2 block text-sm text-gray-700">
                  Enable Dark Mode
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Feature Settings */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex items-center">
          <FiCheckSquare className="mr-2 text-blue-500" />
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Feature Settings
          </h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2">
            {/* Feature Toggles */}
            <div className="relative flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="collaborationEnabled"
                  name="collaborationEnabled"
                  type="checkbox"
                  checked={settings.features.collaborationEnabled}
                  onChange={() => handleFeatureToggle('collaborationEnabled')}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="collaborationEnabled" className="font-medium text-gray-700">
                  Collaboration
                </label>
                <p className="text-gray-500">Allow real-time collaboration between team members</p>
              </div>
            </div>
            
            <div className="relative flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="exportEnabled"
                  name="exportEnabled"
                  type="checkbox"
                  checked={settings.features.exportEnabled}
                  onChange={() => handleFeatureToggle('exportEnabled')}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="exportEnabled" className="font-medium text-gray-700">
                  Export
                </label>
                <p className="text-gray-500">Enable exporting to PDF, Word, and other formats</p>
              </div>
            </div>
            
            <div className="relative flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="customDomainEnabled"
                  name="customDomainEnabled"
                  type="checkbox"
                  checked={settings.features.customDomainEnabled}
                  onChange={() => handleFeatureToggle('customDomainEnabled')}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="customDomainEnabled" className="font-medium text-gray-700">
                  Custom Domain
                </label>
                <p className="text-gray-500">Host the application on your own domain</p>
              </div>
            </div>
            
            <div className="relative flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="advancedAnalyticsEnabled"
                  name="advancedAnalyticsEnabled"
                  type="checkbox"
                  checked={settings.features.advancedAnalyticsEnabled}
                  onChange={() => handleFeatureToggle('advancedAnalyticsEnabled')}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="advancedAnalyticsEnabled" className="font-medium text-gray-700">
                  Advanced Analytics
                </label>
                <p className="text-gray-500">Access detailed analytics and reporting</p>
              </div>
            </div>
            
            <div className="relative flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="aiAssistantEnabled"
                  name="aiAssistantEnabled"
                  type="checkbox"
                  checked={settings.features.aiAssistantEnabled}
                  onChange={() => handleFeatureToggle('aiAssistantEnabled')}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="aiAssistantEnabled" className="font-medium text-gray-700">
                  AI Assistant
                </label>
                <p className="text-gray-500">Enable AI-powered suggestions and automation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Notification Settings */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex items-center">
          <FiSliders className="mr-2 text-blue-500" />
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Notification Settings
          </h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2">
            {/* Notification Toggles */}
            <div className="relative flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="emailNotifications"
                  name="emailNotifications"
                  type="checkbox"
                  checked={settings.notifications.emailNotifications}
                  onChange={() => handleNotificationToggle('emailNotifications')}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="emailNotifications" className="font-medium text-gray-700">
                  Email Notifications
                </label>
                <p className="text-gray-500">Receive updates via email</p>
              </div>
            </div>
            
            <div className="relative flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="slackIntegration"
                  name="slackIntegration"
                  type="checkbox"
                  checked={settings.notifications.slackIntegration}
                  onChange={() => handleNotificationToggle('slackIntegration')}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="slackIntegration" className="font-medium text-gray-700">
                  Slack Integration
                </label>
                <p className="text-gray-500">Receive notifications in Slack</p>
              </div>
            </div>
            
            <div className="relative flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="notifyOnProjectUpdates"
                  name="notifyOnProjectUpdates"
                  type="checkbox"
                  checked={settings.notifications.notifyOnProjectUpdates}
                  onChange={() => handleNotificationToggle('notifyOnProjectUpdates')}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="notifyOnProjectUpdates" className="font-medium text-gray-700">
                  Project Updates
                </label>
                <p className="text-gray-500">Notify when projects are updated</p>
              </div>
            </div>
            
            <div className="relative flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="notifyOnComments"
                  name="notifyOnComments"
                  type="checkbox"
                  checked={settings.notifications.notifyOnComments}
                  onChange={() => handleNotificationToggle('notifyOnComments')}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="notifyOnComments" className="font-medium text-gray-700">
                  Comments
                </label>
                <p className="text-gray-500">Notify on new comments</p>
              </div>
            </div>
            
            <div className="relative flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="notifyOnMemberChanges"
                  name="notifyOnMemberChanges"
                  type="checkbox"
                  checked={settings.notifications.notifyOnMemberChanges}
                  onChange={() => handleNotificationToggle('notifyOnMemberChanges')}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="notifyOnMemberChanges" className="font-medium text-gray-700">
                  Team Changes
                </label>
                <p className="text-gray-500">Notify when team members are added or removed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Security Settings */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex items-center">
          <FiSettings className="mr-2 text-blue-500" />
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Security Settings
          </h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2">
            {/* Security Toggles */}
            <div className="relative flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="enforceStrongPasswords"
                  name="enforceStrongPasswords"
                  type="checkbox"
                  checked={settings.security.enforceStrongPasswords}
                  onChange={() => handleSecurityToggle('enforceStrongPasswords')}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="enforceStrongPasswords" className="font-medium text-gray-700">
                  Strong Passwords
                </label>
                <p className="text-gray-500">Require complex passwords for all users</p>
              </div>
            </div>
            
            <div className="relative flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="twoFactorRequired"
                  name="twoFactorRequired"
                  type="checkbox"
                  checked={settings.security.twoFactorRequired}
                  onChange={() => handleSecurityToggle('twoFactorRequired')}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="twoFactorRequired" className="font-medium text-gray-700">
                  Two-Factor Authentication
                </label>
                <p className="text-gray-500">Require 2FA for all users</p>
              </div>
            </div>
            
            <div className="sm:col-span-1">
              <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700">
                Session Timeout (minutes)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  id="sessionTimeout"
                  name="sessionTimeout"
                  min="5"
                  max="240"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => handleSessionTimeoutChange(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="relative flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="ipRestrictions"
                  name="ipRestrictions"
                  type="checkbox"
                  checked={settings.security.ipRestrictions}
                  onChange={() => handleSecurityToggle('ipRestrictions')}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="ipRestrictions" className="font-medium text-gray-700">
                  IP Restrictions
                </label>
                <p className="text-gray-500">Limit access to specific IP addresses</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <span className="inline-block animate-spin mr-2">⏳</span>
              Saving...
            </>
          ) : (
            <>
              <FiSave className="mr-2 -mt-1" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ClientSettings;
