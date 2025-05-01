import React from 'react';
import PropTypes from 'prop-types';

const RegionSelector = ({ regions, selectedRegionId, onChange }) => {
  // Handle region change from dropdown
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative">
      <select
        value={selectedRegionId}
        onChange={handleChange}
        className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
      >
        <option value="">Select a region...</option>
        {regions && regions.map((region) => (
          <option key={region.id} value={region.id}>
            {region.name} ({region.code})
          </option>
        ))}
      </select>
    </div>
  );
};

RegionSelector.propTypes = {
  regions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      code: PropTypes.string.isRequired,
    })
  ),
  selectedRegionId: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

RegionSelector.defaultProps = {
  regions: [],
  selectedRegionId: '',
};

export default RegionSelector;
