import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import roiService from '../services/roiService';
import { useProject } from './ProjectContext';

const ROIContext = createContext();

export function ROIProvider({ children }) {
  const [roiCalculations, setRoiCalculations] = useState([]);
  const [selectedCalculation, setSelectedCalculation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { selectedProject } = useProject();
  const router = useRouter();

  useEffect(() => {
    if (selectedProject?.id) {
      fetchROICalculations(selectedProject.id);
    }
  }, [selectedProject]);

  const fetchROICalculations = async (projectId = null) => {
    setLoading(true);
    setError(null);
    try {
      const data = await roiService.listROICalculations({ projectId });
      setRoiCalculations(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching ROI calculations:', err);
      setError('Failed to load ROI calculations. Please try again.');
      setLoading(false);
    }
  };

  const getROICalculation = async (roiId) => {
    setLoading(true);
    setError(null);
    try {
      const calculation = await roiService.getROICalculation(roiId);
      setSelectedCalculation(calculation);
      setLoading(false);
      return calculation;
    } catch (err) {
      console.error(`Error fetching ROI calculation ${roiId}:`, err);
      setError('Failed to load ROI calculation. Please try again.');
      setLoading(false);
      return null;
    }
  };

  const createROICalculation = async (roiData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await roiService.createROICalculation(roiData);
      
      // Update list with new calculation
      setRoiCalculations(prev => [result, ...prev]);
      
      // Set as selected calculation
      setSelectedCalculation(result);
      setLoading(false);
      return result;
    } catch (err) {
      console.error('Error creating ROI calculation:', err);
      setError('Failed to create ROI calculation. Please try again.');
      setLoading(false);
      return null;
    }
  };

  const updateROICalculation = async (roiId, roiData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await roiService.updateROICalculation(roiId, roiData);
      
      // Update the list with the updated calculation
      setRoiCalculations(prev => 
        prev.map(calc => calc.id === roiId ? result : calc)
      );
      
      // Update selected calculation if it's the one being edited
      if (selectedCalculation && selectedCalculation.id === roiId) {
        setSelectedCalculation(result);
      }
      
      setLoading(false);
      return result;
    } catch (err) {
      console.error(`Error updating ROI calculation ${roiId}:`, err);
      setError('Failed to update ROI calculation. Please try again.');
      setLoading(false);
      return null;
    }
  };

  const deleteROICalculation = async (roiId) => {
    setLoading(true);
    setError(null);
    try {
      await roiService.deleteROICalculation(roiId);
      
      // Remove from list
      setRoiCalculations(prev => prev.filter(calc => calc.id !== roiId));
      
      // Clear selected calculation if it's the one being deleted
      if (selectedCalculation && selectedCalculation.id === roiId) {
        setSelectedCalculation(null);
      }
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error(`Error deleting ROI calculation ${roiId}:`, err);
      setError('Failed to delete ROI calculation. Please try again.');
      setLoading(false);
      return false;
    }
  };

  // Helper function to print ROI results
  const printROIResults = () => {
    if (!selectedCalculation) return;
    
    // Create a new window with the content to print
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      // Create simplified HTML content for printing
      printWindow.document.write(`
        <html>
          <head>
            <title>ROI Analysis: ${selectedCalculation.name}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #1976d2; }
              h2 { color: #333; margin-top: 20px; }
              table { border-collapse: collapse; width: 100%; margin: 10px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f5f5f5; }
              .positive { color: green; }
              .negative { color: red; }
              .metrics { display: flex; flex-wrap: wrap; }
              .metric-card { margin: 10px; padding: 15px; border: 1px solid #ddd; width: 200px; }
            </style>
          </head>
          <body>
            <h1>ROI Analysis: ${selectedCalculation.name}</h1>
            <p>${selectedCalculation.description || 'No description provided.'}</p>
            
            <h2>Summary</h2>
            <div class="metrics">
              <div class="metric-card">
                <h3>ROI</h3>
                <p class="${selectedCalculation.results.roi_percentage >= 0 ? 'positive' : 'negative'}">
                  ${roiService.formatPercentage(selectedCalculation.results.roi_percentage)}
                </p>
              </div>
              <div class="metric-card">
                <h3>Net Present Value</h3>
                <p class="${selectedCalculation.results.net_present_value >= 0 ? 'positive' : 'negative'}">
                  ${roiService.formatCurrency(selectedCalculation.results.net_present_value, selectedCalculation.parameters.currency)}
                </p>
              </div>
              <div class="metric-card">
                <h3>Payback Period</h3>
                <p>${roiService.formatPaybackPeriod(selectedCalculation.results.payback_period_months) || 'N/A'}</p>
              </div>
              <div class="metric-card">
                <h3>Benefit-Cost Ratio</h3>
                <p class="${selectedCalculation.results.benefit_cost_ratio >= 1 ? 'positive' : 'negative'}">
                  ${selectedCalculation.results.benefit_cost_ratio.toFixed(2)}
                </p>
              </div>
            </div>
            
            <h2>Cash Flow Timeline</h2>
            <table>
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Costs</th>
                  <th>Benefits</th>
                  <th>Net Cash Flow</th>
                  <th>Cumulative Cash Flow</th>
                </tr>
              </thead>
              <tbody>
                ${selectedCalculation.results.timeline.map(item => {
                  const totalCosts = Object.values(item.costs).reduce((sum, value) => sum + value, 0);
                  const totalBenefits = Object.values(item.benefits).reduce((sum, value) => sum + value, 0);
                  return `
                    <tr>
                      <td>Month ${item.period}</td>
                      <td>${roiService.formatCurrency(totalCosts, selectedCalculation.parameters.currency)}</td>
                      <td>${roiService.formatCurrency(totalBenefits, selectedCalculation.parameters.currency)}</td>
                      <td class="${item.net_cash_flow >= 0 ? 'positive' : 'negative'}">
                        ${roiService.formatCurrency(item.net_cash_flow, selectedCalculation.parameters.currency)}
                      </td>
                      <td class="${item.cumulative_cash_flow >= 0 ? 'positive' : 'negative'}">
                        ${roiService.formatCurrency(item.cumulative_cash_flow, selectedCalculation.parameters.currency)}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
            
            <div style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
              <p>Generated by Auto AGI Builder on ${new Date().toLocaleDateString()}</p>
            </div>
          </body>
        </html>
      `);
      
      // Print and close the window
      printWindow.document.close();
      printWindow.print();
    }
  };

  const exportROIResults = (format = 'pdf') => {
    // This would be implemented with a library like jsPDF or file-saver
    alert(`Export to ${format} not implemented in this demo`);
  };

  const shareROIResults = () => {
    // This would be implemented with a sharing API or link generation
    alert('Sharing functionality not implemented in this demo');
  };

  const value = {
    roiCalculations,
    selectedCalculation,
    loading,
    error,
    fetchROICalculations,
    getROICalculation,
    createROICalculation,
    updateROICalculation,
    deleteROICalculation,
    setSelectedCalculation,
    printROIResults,
    exportROIResults,
    shareROIResults,
  };

  return <ROIContext.Provider value={value}>{children}</ROIContext.Provider>;
}

export function useROI() {
  const context = useContext(ROIContext);
  if (context === undefined) {
    throw new Error('useROI must be used within an ROIProvider');
  }
  return context;
}
