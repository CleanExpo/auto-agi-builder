import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * ROIParameters Component
 * 
 * Collects project implementation parameters for ROI calculations
 * Allows users to configure timeline, costs, and expected benefits
 */
const ROIParameters = ({ 
  initialData = {}, 
  onDataChange,
  className 
}) => {
  const [formData, setFormData] = useState({
    // Implementation details
    implementationTimeMonths: initialData.implementationTimeMonths || '',
    upfrontCost: initialData.upfrontCost || '',
    ongoingMonthlyCost: initialData.ongoingMonthlyCost || '',
    maintenanceHoursPerMonth: initialData.maintenanceHoursPerMonth || '',
    
    // Expected benefits
    efficiencyGainPercent: initialData.efficiencyGainPercent || '',
    revenueIncreasePercent: initialData.revenueIncreasePercent || '',
    costReductionPercent: initialData.costReductionPercent || '',
    employeeProductivityGainPercent: initialData.employeeProductivityGainPercent || '',
    
    // Project details
    projectName: initialData.projectName || '',
    projectType: initialData.projectType || 'custom',
    calculationPeriodYears: initialData.calculationPeriodYears || '3',
    discountRate: initialData.discountRate || '10',
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  // Project type options
  const projectTypeOptions = [
    { value: 'custom', label: 'Custom Software Development' },
    { value: 'integration', label: 'System Integration' },
    { value: 'automation', label: 'Process Automation' },
    { value: 'mobile', label: 'Mobile Application' },
    { value: 'web', label: 'Web Application' },
    { value: 'data', label: 'Data Analytics Solution' },
    { value: 'erp', label: 'ERP Implementation' },
    { value: 'crm', label: 'CRM Solution' },
    { value: 'ecommerce', label: 'E-Commerce Platform' },
  ];
  
  // Period options for ROI calculation
  const periodOptions = [
    { value: '1', label: '1 Year' },
    { value: '2', label: '2 Years' },
    { value: '3', label: '3 Years' },
    { value: '5', label: '5 Years' },
    { value: '10', label: '10 Years' },
  ];
  
  // Discount rate options
  const discountRateOptions = [
    { value: '5', label: '5%' },
    { value: '7', label: '7%' },
    { value: '10', label: '10%' },
    { value: '12', label: '12%' },
    { value: '15', label: '15%' },
    { value: '20', label: '20%' },
  ];
  
  // Validate form fields
  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'implementationTimeMonths':
        if (!value) {
          error = 'Required field';
        } else if (isNaN(value) || parseInt(value) <= 0 || parseInt(value) > 60) {
          error = 'Must be a number between 1 and 60';
        }
        break;
        
      case 'upfrontCost':
      case 'ongoingMonthlyCost':
        if (!value) {
          error = 'Required field';
        } else if (isNaN(value) || parseFloat(value) < 0) {
          error = 'Must be a positive number';
        }
        break;
        
      case 'maintenanceHoursPerMonth':
        if (value && (isNaN(value) || parseFloat(value) < 0)) {
          error = 'Must be a positive number';
        }
        break;
        
      case 'efficiencyGainPercent':
      case 'revenueIncreasePercent':
      case 'costReductionPercent':
      case 'employeeProductivityGainPercent':
        if (value && (isNaN(value) || parseFloat(value) < 0 || parseFloat(value) > 100)) {
          error = 'Must be a percentage between 0 and 100';
        }
        break;
        
      case 'projectName':
        if (!value.trim()) {
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
  
  // Helper text based on project type
  const getProjectTypeHelperText = () => {
    switch (formData.projectType) {
      case 'custom':
        return 'Custom software tailored to your specific needs';
      case 'integration':
        return 'Connecting existing systems for seamless data flow';
      case 'automation':
        return 'Automating repetitive tasks and workflows';
      case 'mobile':
        return 'Native or cross-platform mobile applications';
      case 'web':
        return 'Browser-based applications or websites';
      case 'data':
        return 'Business intelligence and analytics solutions';
      case 'erp':
        return 'Enterprise resource planning system implementation';
      case 'crm':
        return 'Customer relationship management solution';
      case 'ecommerce':
        return 'Online shopping and transaction platform';
      default:
        return '';
    }
  };
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className || ''}`}>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Project Parameters</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Configure the implementation details and expected benefits
      </p>
      
      <form className="space-y-6">
        {/* Project Details */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">Project Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Project Name */}
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="projectName"
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Auto AGI Builder Implementation"
                className={`w-full py-2 px-3 border ${hasError('projectName') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              />
              {hasError('projectName') && (
                <p className="mt-1 text-xs text-red-500">{errors.projectName}</p>
              )}
            </div>
            
            {/* Project Type */}
            <div>
              <label htmlFor="projectType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project Type
              </label>
              <select
                id="projectType"
                name="projectType"
                value={formData.projectType}
                onChange={handleChange}
                className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {projectTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {getProjectTypeHelperText()}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Calculation Period */}
            <div>
              <label htmlFor="calculationPeriodYears" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ROI Calculation Period
              </label>
              <select
                id="calculationPeriodYears"
                name="calculationPeriodYears"
                value={formData.calculationPeriodYears}
                onChange={handleChange}
                className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {periodOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Time period for calculating return on investment
              </p>
            </div>
            
            {/* Discount Rate */}
            <div>
              <label htmlFor="discountRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Discount Rate
              </label>
              <select
                id="discountRate"
                name="discountRate"
                value={formData.discountRate}
                onChange={handleChange}
                className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {discountRateOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Rate used for calculating present value of future cash flows
              </p>
            </div>
          </div>
        </div>
        
        {/* Implementation Details */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">Implementation Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Implementation Time */}
            <div>
              <label htmlFor="implementationTimeMonths" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Implementation Time (months)<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="implementationTimeMonths"
                name="implementationTimeMonths"
                value={formData.implementationTimeMonths}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="3"
                className={`w-full py-2 px-3 border ${hasError('implementationTimeMonths') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              />
              {hasError('implementationTimeMonths') && (
                <p className="mt-1 text-xs text-red-500">{errors.implementationTimeMonths}</p>
              )}
            </div>
            
            {/* Maintenance Hours */}
            <div>
              <label htmlFor="maintenanceHoursPerMonth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Monthly Maintenance (hours)
              </label>
              <input
                type="text"
                id="maintenanceHoursPerMonth"
                name="maintenanceHoursPerMonth"
                value={formData.maintenanceHoursPerMonth}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="10"
                className={`w-full py-2 px-3 border ${hasError('maintenanceHoursPerMonth') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              />
              {hasError('maintenanceHoursPerMonth') && (
                <p className="mt-1 text-xs text-red-500">{errors.maintenanceHoursPerMonth}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Upfront Cost */}
            <div>
              <label htmlFor="upfrontCost" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Upfront Cost ($)<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">$</span>
                </div>
                <input
                  type="text"
                  id="upfrontCost"
                  name="upfrontCost"
                  value={formData.upfrontCost}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="10000"
                  className={`w-full py-2 pl-8 pr-3 border ${hasError('upfrontCost') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                />
              </div>
              {hasError('upfrontCost') && (
                <p className="mt-1 text-xs text-red-500">{errors.upfrontCost}</p>
              )}
            </div>
            
            {/* Ongoing Monthly Cost */}
            <div>
              <label htmlFor="ongoingMonthlyCost" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ongoing Monthly Cost ($)<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">$</span>
                </div>
                <input
                  type="text"
                  id="ongoingMonthlyCost"
                  name="ongoingMonthlyCost"
                  value={formData.ongoingMonthlyCost}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="500"
                  className={`w-full py-2 pl-8 pr-3 border ${hasError('ongoingMonthlyCost') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                />
              </div>
              {hasError('ongoingMonthlyCost') && (
                <p className="mt-1 text-xs text-red-500">{errors.ongoingMonthlyCost}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Expected Benefits */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">Expected Benefits</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            Estimate the impact this solution will have on your business metrics
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Efficiency Gain */}
            <div>
              <label htmlFor="efficiencyGainPercent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Operational Efficiency Gain (%)
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="efficiencyGainPercent"
                  name="efficiencyGainPercent"
                  value={formData.efficiencyGainPercent}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="15"
                  className={`w-full py-2 px-3 border ${hasError('efficiencyGainPercent') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">%</span>
                </div>
              </div>
              {hasError('efficiencyGainPercent') && (
                <p className="mt-1 text-xs text-red-500">{errors.efficiencyGainPercent}</p>
              )}
            </div>
            
            {/* Revenue Increase */}
            <div>
              <label htmlFor="revenueIncreasePercent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Revenue Increase (%)
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="revenueIncreasePercent"
                  name="revenueIncreasePercent"
                  value={formData.revenueIncreasePercent}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="5"
                  className={`w-full py-2 px-3 border ${hasError('revenueIncreasePercent') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">%</span>
                </div>
              </div>
              {hasError('revenueIncreasePercent') && (
                <p className="mt-1 text-xs text-red-500">{errors.revenueIncreasePercent}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cost Reduction */}
            <div>
              <label htmlFor="costReductionPercent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cost Reduction (%)
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="costReductionPercent"
                  name="costReductionPercent"
                  value={formData.costReductionPercent}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="10"
                  className={`w-full py-2 px-3 border ${hasError('costReductionPercent') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">%</span>
                </div>
              </div>
              {hasError('costReductionPercent') && (
                <p className="mt-1 text-xs text-red-500">{errors.costReductionPercent}</p>
              )}
            </div>
            
            {/* Employee Productivity */}
            <div>
              <label htmlFor="employeeProductivityGainPercent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Employee Productivity Gain (%)
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="employeeProductivityGainPercent"
                  name="employeeProductivityGainPercent"
                  value={formData.employeeProductivityGainPercent}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="20"
                  className={`w-full py-2 px-3 border ${hasError('employeeProductivityGainPercent') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">%</span>
                </div>
              </div>
              {hasError('employeeProductivityGainPercent') && (
                <p className="mt-1 text-xs text-red-500">{errors.employeeProductivityGainPercent}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Helper Text */}
        <div className="text-xs text-gray-500 dark:text-gray-400 italic">
          <p>Fields marked with <span className="text-red-500">*</span> are required. Leave other fields blank if not applicable.</p>
          <p className="mt-1">
            Enter conservative estimates for the most accurate ROI calculation.
          </p>
        </div>
      </form>
    </div>
  );
};

ROIParameters.propTypes = {
  initialData: PropTypes.object,
  onDataChange: PropTypes.func,
  className: PropTypes.string
};

export default ROIParameters;
