import axios from 'axios';
import { API_BASE_URL } from '../config';

/**
 * Service for ROI calculations and management
 */
const roiService = {
  /**
   * Create a new ROI calculation
   * @param {Object} roiData - The ROI input data
   * @returns {Promise<Object>} The created ROI calculation with results
   */
  createROICalculation: async (roiData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/roi/`, roiData);
      return response.data;
    } catch (error) {
      console.error('Error creating ROI calculation:', error);
      throw error;
    }
  },

  /**
   * List all ROI calculations, optionally filtered by project
   * @param {Object} options - Query options
   * @param {string} [options.projectId] - Optional project ID to filter by
   * @param {number} [options.skip=0] - Number of items to skip for pagination
   * @param {number} [options.limit=10] - Number of items to return
   * @returns {Promise<Array>} List of ROI calculations
   */
  listROICalculations: async ({ projectId, skip = 0, limit = 10 } = {}) => {
    try {
      const params = { skip, limit };
      if (projectId) {
        params.project_id = projectId;
      }

      const response = await axios.get(`${API_BASE_URL}/roi/`, { params });
      return response.data;
    } catch (error) {
      console.error('Error listing ROI calculations:', error);
      throw error;
    }
  },

  /**
   * Get a specific ROI calculation by ID
   * @param {string} roiId - The ROI calculation ID
   * @returns {Promise<Object>} The ROI calculation with results
   */
  getROICalculation: async (roiId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/roi/${roiId}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting ROI calculation ${roiId}:`, error);
      throw error;
    }
  },

  /**
   * Update an existing ROI calculation
   * @param {string} roiId - The ROI calculation ID to update
   * @param {Object} roiData - The updated ROI input data
   * @returns {Promise<Object>} The updated ROI calculation with results
   */
  updateROICalculation: async (roiId, roiData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/roi/${roiId}`, roiData);
      return response.data;
    } catch (error) {
      console.error(`Error updating ROI calculation ${roiId}:`, error);
      throw error;
    }
  },

  /**
   * Delete an ROI calculation
   * @param {string} roiId - The ROI calculation ID to delete
   * @returns {Promise<Object>} The deleted ROI calculation
   */
  deleteROICalculation: async (roiId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/roi/${roiId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting ROI calculation ${roiId}:`, error);
      throw error;
    }
  },

  /**
   * Helper function to format currency values
   * @param {number} value - The value to format
   * @param {string} currency - The currency code (e.g., 'USD')
   * @returns {string} Formatted currency string
   */
  formatCurrency: (value, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  },

  /**
   * Helper function to format percentage values
   * @param {number} value - The value to format as percentage
   * @param {number} [decimalPlaces=1] - Number of decimal places
   * @returns {string} Formatted percentage string
   */
  formatPercentage: (value, decimalPlaces = 1) => {
    return `${value.toFixed(decimalPlaces)}%`;
  },

  /**
   * Helper function to calculate payback period in years and months
   * @param {number} paybackPeriodMonths - The payback period in months
   * @returns {string} Formatted payback period
   */
  formatPaybackPeriod: (paybackPeriodMonths) => {
    if (paybackPeriodMonths === null || paybackPeriodMonths === undefined) {
      return 'Not calculable';
    }

    const years = Math.floor(paybackPeriodMonths / 12);
    const months = Math.round(paybackPeriodMonths % 12);

    if (years === 0) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else if (months === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    } else {
      return `${years} year${years !== 1 ? 's' : ''} and ${months} month${
        months !== 1 ? 's' : ''
      }`;
    }
  },

  /**
   * Get cost and benefit types for form dropdowns
   * @returns {Object} Object containing cost and benefit types
   */
  getROIItemTypes: () => {
    // This could be fetched from an endpoint in the future
    return {
      costTypes: [
        { value: 'development', label: 'Development' },
        { value: 'operational', label: 'Operational' },
        { value: 'infrastructure', label: 'Infrastructure' },
        { value: 'licensing', label: 'Licensing' },
        { value: 'support', label: 'Support' },
        { value: 'training', label: 'Training' },
        { value: 'other', label: 'Other' },
      ],
      benefitTypes: [
        { value: 'time_saving', label: 'Time Saving' },
        { value: 'cost_reduction', label: 'Cost Reduction' },
        { value: 'revenue_increase', label: 'Revenue Increase' },
        { value: 'quality_improvement', label: 'Quality Improvement' },
        { value: 'user_satisfaction', label: 'User Satisfaction' },
        { value: 'resource_optimization', label: 'Resource Optimization' },
        { value: 'other', label: 'Other' },
      ],
      frequencies: [
        { value: 'monthly', label: 'Monthly' },
        { value: 'quarterly', label: 'Quarterly' },
        { value: 'yearly', label: 'Yearly' },
      ],
    };
  },

  /**
   * Generate colors for chart visualization
   * @returns {Object} Object containing color schemes for charts
   */
  getChartColors: () => {
    return {
      costs: {
        main: 'rgba(244, 67, 54, 0.7)',
        light: 'rgba(244, 67, 54, 0.1)',
        border: 'rgba(244, 67, 54, 1)',
      },
      benefits: {
        main: 'rgba(76, 175, 80, 0.7)',
        light: 'rgba(76, 175, 80, 0.1)',
        border: 'rgba(76, 175, 80, 1)',
      },
      netCashFlow: {
        main: 'rgba(33, 150, 243, 0.7)',
        light: 'rgba(33, 150, 243, 0.1)',
        border: 'rgba(33, 150, 243, 1)',
      },
      cumulativeCashFlow: {
        main: 'rgba(103, 58, 183, 0.7)',
        light: 'rgba(103, 58, 183, 0.1)',
        border: 'rgba(103, 58, 183, 1)',
      },
    };
  },

  /**
   * Get option presets for different ROI calculation scenarios
   * @returns {Array} Array of ROI calculation presets
   */
  getROIPresets: () => {
    return [
      {
        id: 'standard',
        name: 'Standard ROI Analysis',
        description: 'A balanced ROI calculation with default parameters',
        parameters: {
          timeline_months: 24,
          discount_rate: 0.1,
          currency: 'USD',
        },
      },
      {
        id: 'conservative',
        name: 'Conservative Estimate',
        description: 'A cautious ROI calculation with higher discount rate',
        parameters: {
          timeline_months: 36,
          discount_rate: 0.15,
          currency: 'USD',
        },
      },
      {
        id: 'aggressive',
        name: 'Aggressive Estimate',
        description: 'An optimistic ROI calculation with lower discount rate',
        parameters: {
          timeline_months: 18,
          discount_rate: 0.05,
          currency: 'USD',
        },
      },
      {
        id: 'short_term',
        name: 'Short-term Analysis',
        description: 'Focus on immediate returns over a shorter period',
        parameters: {
          timeline_months: 12,
          discount_rate: 0.08,
          currency: 'USD',
        },
      },
      {
        id: 'long_term',
        name: 'Long-term Strategic Analysis',
        description: 'Evaluate long-term returns over an extended period',
        parameters: {
          timeline_months: 60,
          discount_rate: 0.12,
          currency: 'USD',
        },
      },
    ];
  },
};

export default roiService;
