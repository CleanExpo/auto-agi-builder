import React, { useState, useEffect } from 'react';
import { withProtection } from '../components/auth/ProtectedRoute';
import Layout from '../components/layout/Layout';
import BusinessMetricsForm from '../components/ROI/BusinessMetricsForm';
import ROIParameters from '../components/ROI/ROIParameters';
import ROIResults from '../components/ROI/ROIResults';

/**
 * ROI Calculator Page
 * 
 * Provides ROI calculation capabilities for potential application implementations
 * Allows users to input business metrics and project parameters
 */
const ROIPage = () => {
  // Track the active step
  const [activeStep, setActiveStep] = useState(1);
  
  // Form data states
  const [businessMetrics, setBusinessMetrics] = useState({
    data: {},
    isValid: false
  });
  
  const [projectParameters, setProjectParameters] = useState({
    data: {
      projectName: 'Auto AGI Builder Implementation',
      projectType: 'custom',
      calculationPeriodYears: '3',
      discountRate: '10'
    },
    isValid: false
  });
  
  // Handle business metrics data changes
  const handleBusinessMetricsChange = (data) => {
    setBusinessMetrics(data);
  };
  
  // Handle project parameters data changes
  const handleProjectParametersChange = (data) => {
    setProjectParameters(data);
  };
  
  // Check if we can proceed to results
  const canShowResults = businessMetrics.isValid && projectParameters.isValid;
  
  // Predefined industry datasets for examples
  const exampleIndustryData = {
    technology: {
      industry: 'technology',
      annualRevenue: '5000000',
      revenueGrowthRate: '15',
      customerCount: '200',
      laborCostsPerHour: '75',
      operationalCostsMonthly: '250000',
      customerAcquisitionCost: '2500',
      averageTaskCompletionTime: '120',
      employeeCount: '50',
      customerChurnRate: '12',
      businessSize: 'medium',
      region: 'north_america'
    },
    healthcare: {
      industry: 'healthcare',
      annualRevenue: '12000000',
      revenueGrowthRate: '8',
      customerCount: '1500',
      laborCostsPerHour: '85',
      operationalCostsMonthly: '750000',
      customerAcquisitionCost: '1200',
      averageTaskCompletionTime: '45',
      employeeCount: '120',
      customerChurnRate: '5',
      businessSize: 'medium',
      region: 'north_america'
    },
    retail: {
      industry: 'retail',
      annualRevenue: '8500000',
      revenueGrowthRate: '6',
      customerCount: '25000',
      laborCostsPerHour: '40',
      operationalCostsMonthly: '450000',
      customerAcquisitionCost: '75',
      averageTaskCompletionTime: '30',
      employeeCount: '85',
      customerChurnRate: '20',
      businessSize: 'medium',
      region: 'north_america'
    }
  };
  
  // Predefined project datasets for examples
  const exampleProjectData = {
    enterprise: {
      projectName: 'Enterprise Implementation',
      projectType: 'custom',
      implementationTimeMonths: '6',
      upfrontCost: '250000',
      ongoingMonthlyCost: '5000',
      maintenanceHoursPerMonth: '40',
      efficiencyGainPercent: '25',
      revenueIncreasePercent: '8',
      costReductionPercent: '15',
      employeeProductivityGainPercent: '20',
      calculationPeriodYears: '5',
      discountRate: '10'
    },
    smallBusiness: {
      projectName: 'Small Business Package',
      projectType: 'web',
      implementationTimeMonths: '2',
      upfrontCost: '50000',
      ongoingMonthlyCost: '1500',
      maintenanceHoursPerMonth: '10',
      efficiencyGainPercent: '15',
      revenueIncreasePercent: '5',
      costReductionPercent: '10',
      employeeProductivityGainPercent: '12',
      calculationPeriodYears: '3',
      discountRate: '10'
    },
    startup: {
      projectName: 'Startup Solution',
      projectType: 'mobile',
      implementationTimeMonths: '1',
      upfrontCost: '25000',
      ongoingMonthlyCost: '800',
      maintenanceHoursPerMonth: '5',
      efficiencyGainPercent: '10',
      revenueIncreasePercent: '12',
      costReductionPercent: '5',
      employeeProductivityGainPercent: '15',
      calculationPeriodYears: '2',
      discountRate: '15'
    }
  };
  
  // Handle loading example data
  const loadExampleData = (type, dataset) => {
    if (type === 'business') {
      const data = exampleIndustryData[dataset];
      if (data) {
        setBusinessMetrics({
          data,
          isValid: true
        });
        // Move to next step
        setActiveStep(2);
      }
    } else if (type === 'project') {
      const data = exampleProjectData[dataset];
      if (data) {
        setProjectParameters({
          data,
          isValid: true
        });
        // Move to results
        setActiveStep(3);
      }
    }
  };
  
  // Step content based on active step
  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Step 1: Business Metrics</h2>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => loadExampleData('business', 'technology')}
                  className="text-sm px-3 py-1 rounded-md text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                >
                  Tech Example
                </button>
                <button
                  type="button"
                  onClick={() => loadExampleData('business', 'healthcare')}
                  className="text-sm px-3 py-1 rounded-md text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 border border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  Healthcare Example
                </button>
                <button
                  type="button"
                  onClick={() => loadExampleData('business', 'retail')}
                  className="text-sm px-3 py-1 rounded-md text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  Retail Example
                </button>
              </div>
            </div>
            <BusinessMetricsForm
              initialData={businessMetrics.data}
              onDataChange={handleBusinessMetricsChange}
            />
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setActiveStep(2)}
                disabled={!businessMetrics.isValid}
                className={`px-4 py-2 rounded-md text-white font-medium ${
                  businessMetrics.isValid
                    ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                }`}
              >
                Next: Project Parameters
              </button>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Step 2: Project Parameters</h2>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => loadExampleData('project', 'enterprise')}
                  className="text-sm px-3 py-1 rounded-md text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                >
                  Enterprise Example
                </button>
                <button
                  type="button"
                  onClick={() => loadExampleData('project', 'smallBusiness')}
                  className="text-sm px-3 py-1 rounded-md text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 border border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  Small Business Example
                </button>
                <button
                  type="button"
                  onClick={() => loadExampleData('project', 'startup')}
                  className="text-sm px-3 py-1 rounded-md text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  Startup Example
                </button>
              </div>
            </div>
            <ROIParameters
              initialData={projectParameters.data}
              onDataChange={handleProjectParametersChange}
            />
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setActiveStep(1)}
                className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
              >
                Back: Business Metrics
              </button>
              <button
                onClick={() => setActiveStep(3)}
                disabled={!projectParameters.isValid}
                className={`px-4 py-2 rounded-md text-white font-medium ${
                  projectParameters.isValid
                    ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                }`}
              >
                View ROI Analysis
              </button>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">ROI Analysis Results</h2>
              <div>
                <button
                  onClick={() => window.print()}
                  className="text-sm px-3 py-1 rounded-md text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                >
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print Report
                  </span>
                </button>
              </div>
            </div>
            
            <ROIResults
              businessMetrics={businessMetrics.data}
              projectParameters={projectParameters.data}
            />
            
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setActiveStep(2)}
                className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
              >
                Back: Project Parameters
              </button>
              
              <button
                onClick={() => {
                  // Reset the entire form
                  setBusinessMetrics({ data: {}, isValid: false });
                  setProjectParameters({ 
                    data: {
                      projectName: 'Auto AGI Builder Implementation',
                      projectType: 'custom',
                      calculationPeriodYears: '3',
                      discountRate: '10'
                    }, 
                    isValid: false 
                  });
                  setActiveStep(1);
                }}
                className="px-4 py-2 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Start New Calculation
              </button>
            </div>
          </div>
        );
        
      default:
        return <div>Unknown step</div>;
    }
  };
  
  return (
    <Layout title="ROI Calculator">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ROI Calculator</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Calculate the return on investment for implementing Auto AGI Builder in your organization
            </p>
          </div>
          
          {/* Progress Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex" aria-label="Tabs">
                <button
                  onClick={() => setActiveStep(1)}
                  className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                    activeStep === 1
                      ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <span className="flex items-center justify-center">
                    <span className={`flex items-center justify-center h-5 w-5 rounded-full text-xs mr-2 ${
                      activeStep === 1
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200'
                        : businessMetrics.isValid
                          ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      1
                    </span>
                    Business Metrics
                  </span>
                </button>
                
                <button
                  onClick={() => businessMetrics.isValid && setActiveStep(2)}
                  className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                    activeStep === 2
                      ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                      : !businessMetrics.isValid
                        ? 'border-transparent text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                  }`}
                  disabled={!businessMetrics.isValid}
                >
                  <span className="flex items-center justify-center">
                    <span className={`flex items-center justify-center h-5 w-5 rounded-full text-xs mr-2 ${
                      activeStep === 2
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200'
                        : projectParameters.isValid
                          ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      2
                    </span>
                    Project Parameters
                  </span>
                </button>
                
                <button
                  onClick={() => canShowResults && setActiveStep(3)}
                  className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                    activeStep === 3
                      ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                      : !canShowResults
                        ? 'border-transparent text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                  }`}
                  disabled={!canShowResults}
                >
                  <span className="flex items-center justify-center">
                    <span className={`flex items-center justify-center h-5 w-5 rounded-full text-xs mr-2 ${
                      activeStep === 3
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      3
                    </span>
                    ROI Analysis
                  </span>
                </button>
              </nav>
            </div>
          </div>
          
          {/* Step Content */}
          <div>
            {renderStepContent()}
          </div>
          
          {/* Help Section */}
          {activeStep !== 3 && (
            <div className="mt-8 bg-gray-50 dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">About the ROI Calculator</h3>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <p>The ROI calculator helps you understand the potential return on investment from implementing the Auto AGI Builder in your organization.</p>
                <p>We use industry-standard financial metrics to provide insights into:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Projected return on investment (ROI)</li>
                  <li>Net present value (NPV) of the investment</li>
                  <li>Payback period</li>
                  <li>Detailed cost and benefit breakdown</li>
                  <li>Cash flow projections over time</li>
                </ul>
                <p className="mt-2">For a more personalized analysis, please contact our team for a detailed consultation.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default withProtection(ROIPage);
