import React from 'react';
import PropTypes from 'prop-types';
import { useLocalization } from '../../contexts/LocalizationContext';

const FormattingPreviewPanel = ({ settings }) => {
  const {
    formatDate,
    formatTime,
    formatDateTime,
    formatNumber,
    formatCurrency
  } = useLocalization();

  // Sample data for previews
  const now = new Date();
  const sampleNumber = 1234567.89;
  const samplePrice = 1299.99;
  const sampleNegative = -42.5;
  const samplePercent = 0.1875;

  return (
    <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Format Preview</h3>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Dates</h4>
          <div className="bg-white rounded p-3 border border-gray-200">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm text-gray-500">Today:</div>
              <div className="text-sm font-medium">{formatDate(now)}</div>
              
              <div className="text-sm text-gray-500">Last month:</div>
              <div className="text-sm font-medium">
                {formatDate(new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()))}
              </div>
              
              <div className="text-sm text-gray-500">Next year:</div>
              <div className="text-sm font-medium">
                {formatDate(new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Times</h4>
          <div className="bg-white rounded p-3 border border-gray-200">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm text-gray-500">Current time:</div>
              <div className="text-sm font-medium">{formatTime(now)}</div>
              
              <div className="text-sm text-gray-500">Morning:</div>
              <div className="text-sm font-medium">
                {formatTime(new Date(now.setHours(9, 30, 0)))}
              </div>
              
              <div className="text-sm text-gray-500">Evening:</div>
              <div className="text-sm font-medium">
                {formatTime(new Date(now.setHours(18, 45, 0)))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Date & Time</h4>
          <div className="bg-white rounded p-3 border border-gray-200">
            <div className="grid grid-cols-1 gap-2">
              <div className="text-sm font-medium">{formatDateTime(now)}</div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Numbers</h4>
          <div className="bg-white rounded p-3 border border-gray-200">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm text-gray-500">Large number:</div>
              <div className="text-sm font-medium">{formatNumber(sampleNumber)}</div>
              
              <div className="text-sm text-gray-500">Price:</div>
              <div className="text-sm font-medium">{formatCurrency(samplePrice)}</div>
              
              <div className="text-sm text-gray-500">Negative value:</div>
              <div className="text-sm font-medium">{formatNumber(sampleNegative)}</div>
              
              <div className="text-sm text-gray-500">Percentage:</div>
              <div className="text-sm font-medium">
                {formatNumber(samplePercent, { format: 'percent' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>This preview reflects how dates, times, and numbers will be displayed throughout the application.</p>
        {settings.source === 'default_region' && (
          <p className="mt-1">Currently using region defaults. Customize using the settings on the left.</p>
        )}
        {settings.source === 'user_preference' && (
          <p className="mt-1">Using your custom preferences.</p>
        )}
        {settings.source === 'browser_locale' && (
          <p className="mt-1">Detected from browser locale.</p>
        )}
      </div>
    </div>
  );
};

FormattingPreviewPanel.propTypes = {
  settings: PropTypes.shape({
    date_format: PropTypes.string,
    time_format: PropTypes.string,
    timezone: PropTypes.string,
    number_format: PropTypes.object,
    measurement_system: PropTypes.string,
    region_code: PropTypes.string,
    region_name: PropTypes.string,
    source: PropTypes.string,
    override_date_format: PropTypes.string,
    override_time_format: PropTypes.string,
    override_timezone: PropTypes.string,
    override_number_format: PropTypes.object
  }).isRequired
};

export default FormattingPreviewPanel;
