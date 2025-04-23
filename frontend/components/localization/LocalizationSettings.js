import React, { useState, useEffect } from 'react';
import { useLocalization } from '../../contexts/LocalizationContext';
import { useUI } from '../../contexts/UIContext';
import RegionSelector from './RegionSelector';
import FormattingPreviewPanel from './FormattingPreviewPanel';
import TimezoneSelector from './TimezoneSelector';

const LocalizationSettings = () => {
  const { 
    settings, 
    availableRegions, 
    updateSettings, 
    resetSettings, 
    loading 
  } = useLocalization();
  
  const { showNotification } = useUI();
  
  const [formValues, setFormValues] = useState({
    region_id: '',
    use_browser_locale: true,
    override_date_format: '',
    override_time_format: '',
    override_timezone: '',
    override_number_format: null
  });
  
  const [isModified, setIsModified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form with current settings
  useEffect(() => {
    if (settings && !loading) {
      setFormValues({
        region_id: settings.region_id || '',
        use_browser_locale: settings.use_browser_locale !== undefined ? settings.use_browser_locale : true,
        override_date_format: settings.override_date_format || '',
        override_time_format: settings.override_time_format || '',
        override_timezone: settings.override_timezone || '',
        override_number_format: settings.override_number_format || null
      });
      setIsModified(false);
    }
  }, [settings, loading]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    setIsModified(true);
  };
  
  // Handle number format changes
  const handleNumberFormatChange = (formatType, value) => {
    setFormValues(prev => ({
      ...prev,
      override_number_format: {
        ...(prev.override_number_format || {}),
        [formatType]: value
      }
    }));
    
    setIsModified(true);
  };
  
  // Handle region selection
  const handleRegionChange = (regionId) => {
    setFormValues(prev => ({
      ...prev,
      region_id: regionId
    }));
    
    setIsModified(true);
  };
  
  // Handle timezone selection
  const handleTimezoneChange = (timezone) => {
    setFormValues(prev => ({
      ...prev,
      override_timezone: timezone
    }));
    
    setIsModified(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isModified) return;
    
    setIsSaving(true);
    
    try {
      // Prepare the data for API
      const updateData = {
        region_id: formValues.region_id || undefined,
        use_browser_locale: formValues.use_browser_locale,
        override_date_format: formValues.override_date_format || null,
        override_time_format: formValues.override_time_format || null,
        override_timezone: formValues.override_timezone || null,
        override_number_format: formValues.override_number_format
      };
      
      // Clean up undefined values
      Object.keys(updateData).forEach(key => 
        updateData[key] === undefined && delete updateData[key]
      );
      
      const success = await updateSettings(updateData);
      
      if (success) {
        setIsModified(false);
      }
    } catch (error) {
      console.error('Error updating localization settings:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to update localization settings.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle form reset
  const handleReset = async () => {
    try {
      setIsSaving(true);
      await resetSettings();
      setIsModified(false);
    } catch (error) {
      console.error('Error resetting localization settings:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to reset localization settings.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="spinner"></div></div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Localization Settings</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left column - Settings */}
          <div className="space-y-6">
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Region</label>
              <RegionSelector 
                regions={availableRegions} 
                selectedRegionId={formValues.region_id} 
                onChange={handleRegionChange} 
              />
            </div>
            
            <div className="mb-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="use_browser_locale"
                  checked={formValues.use_browser_locale}
                  onChange={handleChange}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="text-gray-700">Detect locale from browser</span>
              </label>
              <p className="text-sm text-gray-500 mt-1">
                If enabled, we'll use your browser's language preference when available.
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Date format</label>
              <select
                name="override_date_format"
                value={formValues.override_date_format}
                onChange={handleChange}
                className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
                <option value="">Use region default</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                <option value="YYYY/MM/DD">YYYY/MM/DD</option>
                <option value="DD.MM.YYYY">DD.MM.YYYY</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Time format</label>
              <select
                name="override_time_format"
                value={formValues.override_time_format}
                onChange={handleChange}
                className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
                <option value="">Use region default</option>
                <option value="HH:mm">24 hour (HH:mm)</option>
                <option value="HH:mm:ss">24 hour with seconds (HH:mm:ss)</option>
                <option value="hh:mm A">12 hour (hh:mm AM/PM)</option>
                <option value="hh:mm:ss A">12 hour with seconds (hh:mm:ss AM/PM)</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Timezone</label>
              <TimezoneSelector 
                selectedTimezone={formValues.override_timezone} 
                onChange={handleTimezoneChange} 
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Number format</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Decimal separator</label>
                  <select
                    value={formValues.override_number_format?.decimal_separator || ''}
                    onChange={(e) => handleNumberFormatChange('decimal_separator', e.target.value)}
                    className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                    <option value="">Use region default</option>
                    <option value=".">Period (.)</option>
                    <option value=",">Comma (,)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Thousands separator</label>
                  <select
                    value={formValues.override_number_format?.thousands_separator || ''}
                    onChange={(e) => handleNumberFormatChange('thousands_separator', e.target.value)}
                    className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                    <option value="">Use region default</option>
                    <option value=",">Comma (,)</option>
                    <option value=".">Period (.)</option>
                    <option value=" ">Space ( )</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column - Preview */}
          <div>
            <FormattingPreviewPanel 
              settings={{
                ...settings,
                override_date_format: formValues.override_date_format,
                override_time_format: formValues.override_time_format,
                override_timezone: formValues.override_timezone,
                override_number_format: formValues.override_number_format
              }}
            />
          </div>
        </div>
        
        <div className="mt-8 flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleReset}
            disabled={isSaving || !isModified}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Reset to Defaults
          </button>
          <button
            type="submit"
            disabled={isSaving || !isModified}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LocalizationSettings;
