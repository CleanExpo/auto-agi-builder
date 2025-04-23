import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * BusinessMetricsForm Component
 * 
 * Collects essential business metrics for ROI calculations
 * Allows users to input their current business state metrics
 */
const BusinessMetricsForm = ({ 
  initialData = {}, 
  onDataChange,
  className 
}) => {
  const [formData, setFormData] = useState({
    // Revenue metrics
    annualRevenue: initialData.annualRevenue || '',
    revenueGrowthRate: initialData.revenueGrowthRate || '',
    customerCount: initialData.customerCount || '',
    
    // Cost metrics
    laborCostsPerHour: initialData.laborCostsPerHour || '',
    operationalCostsMonthly: initialData.operationalCostsMonthly || '',
    customerAcquisitionCost: initialData.customerAcquisitionCost || '',
    
    // Efficiency metrics
    averageTaskCompletionTime: initialData.averageTaskCompletionTime || '',
    employeeCount: initialData.employeeCount || '',
    customerChurnRate: initialData.customerChurnRate || '',
    
    // Industry and business information
    industry: initialData.industry || '',
    businessSize: initialData.businessSize || 'small',
    region: initialData.region || '',
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  // Industry options
  const industryOptions = [
    { value: '', label: 'Select Industry' },
    { value: 'technology', label: 'Technology & Software' },
    { value: 'finance', label: 'Finance & Banking' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'retail', label: 'Retail & E-commerce' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'education', label: 'Education' },
    { value: 'services', label: 'Professional Services' },
    { value: 'hospitality', label: 'Hospitality & Tourism' },
    { value: 'other', label: 'Other' }
  ];
  
  // Business size options
  const businessSizeOptions = [
    { value: 'small', label: 'Small (1-50 employees)' },
    { value: 'medium', label: 'Medium (51-500 employees)' },
    { value: 'large', label: 'Large (501+ employees)' },
  ];
  
  // Region options
  const regionOptions = [
    { value: '', label: 'Select Region' },
    { value: 'north_america', label: 'North America' },
    { value: 'europe', label: 'Europe' },
    { value: 'asia_pacific', label: 'Asia Pacific' },
    { value: 'latin_america', label: 'Latin America' },
    { value: 'middle_east', label: 'Middle East & Africa' },
  ];
  
  // Validate form fields
  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'annualRevenue':
      case 'laborCostsPerHour':
      case 'operationalCostsMonthly':
      case 'customerAcquisitionCost':
        if (value && (isNaN(value) || parseFloat(value) < 0)) {
          error = 'Must be a positive number';
        }
        break;
        
      case 'revenueGrowthRate':
      case 'customerChurnRate':
        if (value && (isNaN(value) || parseFloat(value) < 0 || parseFloat(value) > 100)) {
          error = 'Must be a percentage between 0 and 100';
        }
        break;
        
      case 'customerCount':
      case 'employeeCount':
      case 'averageTaskCompletionTime':
        if (value && (isNaN(value) || parseInt(value) < 0)) {
          error = 'Must be a positive whole number';
        }
        break;
        
      case 'industry':
      case 'region':
        if (!value) {
          error = 'Required field';
        }
        break;
        
      default:
        break;
    }
    
    return error;
  };
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };
  
  // Handle blur events for validation
  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };
  
  // Validate all fields
  const validateForm = () => {
    const newErrors = {};
    const newTouched = {};
    
    Object.keys(formData).forEach(key => {
      newErrors[key] = validateField(key, formData[key]);
      newTouched[key] = true;
    });
    
    setErrors(newErrors);
    setTouched(newTouched);
    
    return Object.values(newErrors).every(error => !error);
  };
  
  // Notify parent component of data changes
  useEffect(() => {
    const isValid = Object.values(errors).every(error => !error);
    if (onDataChange) {
      onDataChange({
        data: formData,
        isValid: isValid && Object.keys(touched).length > 0
      });
    }
  }, [formData, errors, touched, onDataChange]);
  
  // Check if field has error
  const hasError = (field) => {
    return touched[field] && errors[field];
  };
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className || ''}`}>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Business Metrics</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Please enter your current business metrics to calculate potential ROI
      </p>
      
      <form className="space-y-6">
        {/* Business Information */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">Business Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Industry */}
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Industry<span className="text-red-500">*</span>
              </label>
              <select
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full py-2 px-3 border ${hasError('industry') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              >
                {industryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {hasError('industry') && (
                <p className="mt-1 text-xs text-red-500">{errors.industry}</p>
              )}
            </div>
            
            {/* Business Size */}
            <div>
              <label htmlFor="businessSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Business Size
              </label>
              <select
                id="businessSize"
                name="businessSize"
                value={formData.businessSize}
                onChange={handleChange}
                className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {businessSizeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Region */}
            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Region<span className="text-red-500">*</span>
              </label>
              <select
                id="region"
                name="region"
                value={formData.region}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full py-2 px-3 border ${hasError('region') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              >
                {regionOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {hasError('region') && (
                <p className="mt-1 text-xs text-red-500">{errors.region}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Revenue Metrics */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">Revenue Metrics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Annual Revenue */}
            <div>
              <label htmlFor="annualRevenue" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Annual Revenue ($)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">$</span>
                </div>
                <input
                  type="text"
                  id="annualRevenue"
                  name="annualRevenue"
                  value={formData.annualRevenue}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="0.00"
                  className={`w-full py-2 pl-8 pr-3 border ${hasError('annualRevenue') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                />
              </div>
              {hasError('annualRevenue') && (
                <p className="mt-1 text-xs text-red-500">{errors.annualRevenue}</p>
              )}
            </div>
            
            {/* Revenue Growth Rate */}
            <div>
              <label htmlFor="revenueGrowthRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Revenue Growth Rate (%)
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="revenueGrowthRate"
                  name="revenueGrowthRate"
                  value={formData.revenueGrowthRate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="0"
                  className={`w-full py-2 px-3 border ${hasError('revenueGrowthRate') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">%</span>
                </div>
              </div>
              {hasError('revenueGrowthRate') && (
                <p className="mt-1 text-xs text-red-500">{errors.revenueGrowthRate}</p>
              )}
            </div>
            
            {/* Customer Count */}
            <div>
              <label htmlFor="customerCount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Number of Customers
              </label>
              <input
                type="text"
                id="customerCount"
                name="customerCount"
                value={formData.customerCount}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0"
                className={`w-full py-2 px-3 border ${hasError('customerCount') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              />
              {hasError('customerCount') && (
                <p className="mt-1 text-xs text-red-500">{errors.customerCount}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Cost Metrics */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">Cost Metrics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Labor Costs */}
            <div>
              <label htmlFor="laborCostsPerHour" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Average Labor Cost ($/hour)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">$</span>
                </div>
                <input
                  type="text"
                  id="laborCostsPerHour"
                  name="laborCostsPerHour"
                  value={formData.laborCostsPerHour}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="0.00"
                  className={`w-full py-2 pl-8 pr-3 border ${hasError('laborCostsPerHour') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                />
              </div>
              {hasError('laborCostsPerHour') && (
                <p className="mt-1 text-xs text-red-500">{errors.laborCostsPerHour}</p>
              )}
            </div>
            
            {/* Operational Costs */}
            <div>
              <label htmlFor="operationalCostsMonthly" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Monthly Operational Costs ($)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">$</span>
                </div>
                <input
                  type="text"
                  id="operationalCostsMonthly"
                  name="operationalCostsMonthly"
                  value={formData.operationalCostsMonthly}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="0.00"
                  className={`w-full py-2 pl-8 pr-3 border ${hasError('operationalCostsMonthly') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                />
              </div>
              {hasError('operationalCostsMonthly') && (
                <p className="mt-1 text-xs text-red-500">{errors.operationalCostsMonthly}</p>
              )}
            </div>
            
            {/* Customer Acquisition Cost */}
            <div>
              <label htmlFor="customerAcquisitionCost" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Customer Acquisition Cost ($)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">$</span>
                </div>
                <input
                  type="text"
                  id="customerAcquisitionCost"
                  name="customerAcquisitionCost"
                  value={formData.customerAcquisitionCost}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="0.00"
                  className={`w-full py-2 pl-8 pr-3 border ${hasError('customerAcquisitionCost') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                />
              </div>
              {hasError('customerAcquisitionCost') && (
                <p className="mt-1 text-xs text-red-500">{errors.customerAcquisitionCost}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Efficiency Metrics */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">Efficiency Metrics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Task Completion Time */}
            <div>
              <label htmlFor="averageTaskCompletionTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Avg. Task Completion Time (min)
              </label>
              <input
                type="text"
                id="averageTaskCompletionTime"
                name="averageTaskCompletionTime"
                value={formData.averageTaskCompletionTime}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0"
                className={`w-full py-2 px-3 border ${hasError('averageTaskCompletionTime') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              />
              {hasError('averageTaskCompletionTime') && (
                <p className="mt-1 text-xs text-red-500">{errors.averageTaskCompletionTime}</p>
              )}
            </div>
            
            {/* Employee Count */}
            <div>
              <label htmlFor="employeeCount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Number of Employees
              </label>
              <input
                type="text"
                id="employeeCount"
                name="employeeCount"
                value={formData.employeeCount}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0"
                className={`w-full py-2 px-3 border ${hasError('employeeCount') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              />
              {hasError('employeeCount') && (
                <p className="mt-1 text-xs text-red-500">{errors.employeeCount}</p>
              )}
            </div>
            
            {/* Customer Churn Rate */}
            <div>
              <label htmlFor="customerChurnRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Customer Churn Rate (%)
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="customerChurnRate"
                  name="customerChurnRate"
                  value={formData.customerChurnRate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="0"
                  className={`w-full py-2 px-3 border ${hasError('customerChurnRate') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">%</span>
                </div>
              </div>
              {hasError('customerChurnRate') && (
                <p className="mt-1 text-xs text-red-500">{errors.customerChurnRate}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Helper Text */}
        <div className="text-xs text-gray-500 dark:text-gray-400 italic">
          <p>Fields marked with <span className="text-red-500">*</span> are required. Leave other fields blank if not applicable.</p>
          <p className="mt-1">
            The more information you provide, the more accurate your ROI calculation will be.
          </p>
        </div>
      </form>
    </div>
  );
};

BusinessMetricsForm.propTypes = {
  initialData: PropTypes.object,
  onDataChange: PropTypes.func,
  className: PropTypes.string
};

export default BusinessMetricsForm;
