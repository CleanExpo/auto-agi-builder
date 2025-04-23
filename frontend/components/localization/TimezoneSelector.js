import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../../lib/api';

const TimezoneSelector = ({ selectedTimezone, onChange }) => {
  const [timezones, setTimezones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch timezones from API
  useEffect(() => {
    const fetchTimezones = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/v1/localization/regions/timezones');
        if (response.data) {
          setTimezones(response.data);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching timezones:', err);
        setError('Failed to load timezones. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTimezones();
  }, []);

  // Handle timezone change from dropdown
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter timezones by search term
  const filteredTimezones = timezones.filter(tz => 
    tz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tz.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tz.offset.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="relative">
        <div className="form-select w-full rounded-md border-gray-300 bg-gray-100 py-2 px-3">
          Loading timezones...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative">
        <div className="form-select w-full rounded-md border-red-300 bg-red-50 py-2 px-3 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Search box */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search timezones..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="form-input w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 pl-9"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Timezone dropdown */}
      <select
        value={selectedTimezone || ''}
        onChange={handleChange}
        className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
      >
        <option value="">Use region default</option>
        {filteredTimezones.map((tz) => (
          <option key={tz.code} value={tz.code}>
            {`${tz.name} (${tz.offset})`}
          </option>
        ))}
      </select>
    </div>
  );
};

TimezoneSelector.propTypes = {
  selectedTimezone: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

TimezoneSelector.defaultProps = {
  selectedTimezone: '',
};

export default TimezoneSelector;
