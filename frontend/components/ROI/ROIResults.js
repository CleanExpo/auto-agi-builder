import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, PieChart, Pie, Label 
} from 'recharts';

/**
 * ROIResults Component
 * 
 * Displays calculated ROI results, metrics, and visualizations
 * Based on business metrics and project parameters
 */
const ROIResults = ({ 
  businessMetrics = {},
  projectParameters = {},
  className 
}) => {
  // Calculate ROI metrics
  const calculations = useMemo(() => {
    // Return empty results if required data isn't available
    if (!businessMetrics.industry || !projectParameters.implementationTimeMonths) {
      return {
        isValid: false,
        summary: {},
        cashFlows: [],
        breakdown: {},
        metrics: {}
      };
    }
    
    // Helper function to parse number
    const parseNumber = (value, defaultValue = 0) => {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? defaultValue : parsed;
    };
    
    // Extract numeric values from inputs
    const annualRevenue = parseNumber(businessMetrics.annualRevenue, 100000);
    const revenueGrowthRate = parseNumber(businessMetrics.revenueGrowthRate, 5) / 100;
    const customerCount = parseNumber(businessMetrics.customerCount, 100);
    const laborCostsPerHour = parseNumber(businessMetrics.laborCostsPerHour, 50);
    const operationalCostsMonthly = parseNumber(businessMetrics.operationalCostsMonthly, 10000);
    const customerAcquisitionCost = parseNumber(businessMetrics.customerAcquisitionCost, 1000);
    const averageTaskCompletionTime = parseNumber(businessMetrics.averageTaskCompletionTime, 60);
    const employeeCount = parseNumber(businessMetrics.employeeCount, 10);
    const customerChurnRate = parseNumber(businessMetrics.customerChurnRate, 15) / 100;
    
    const implementationTimeMonths = parseNumber(projectParameters.implementationTimeMonths, 3);
    const upfrontCost = parseNumber(projectParameters.upfrontCost, 50000);
    const ongoingMonthlyCost = parseNumber(projectParameters.ongoingMonthlyCost, 500);
    const maintenanceHoursPerMonth = parseNumber(projectParameters.maintenanceHoursPerMonth, 10);
    
    const efficiencyGainPercent = parseNumber(projectParameters.efficiencyGainPercent, 15) / 100;
    const revenueIncreasePercent = parseNumber(projectParameters.revenueIncreasePercent, 5) / 100;
    const costReductionPercent = parseNumber(projectParameters.costReductionPercent, 10) / 100;
    const employeeProductivityGainPercent = parseNumber(projectParameters.employeeProductivityGainPercent, 20) / 100;
    
    const calculationPeriodYears = parseNumber(projectParameters.calculationPeriodYears, 3);
    const discountRate = parseNumber(projectParameters.discountRate, 10) / 100;
    
    // Calculate monthly values
    const monthlyRevenue = annualRevenue / 12;
    const annualOperationalCosts = operationalCostsMonthly * 12;
    
    // Calculate maintenance costs
    const monthlyMaintenanceCost = maintenanceHoursPerMonth * laborCostsPerHour;
    
    // Calculate monthly benefits
    const monthlyEfficiencyGain = operationalCostsMonthly * efficiencyGainPercent;
    const monthlyRevenueIncrease = monthlyRevenue * revenueIncreasePercent;
    const monthlyCostReduction = operationalCostsMonthly * costReductionPercent;
    const monthlyProductivityValue = laborCostsPerHour * employeeCount * 160 * employeeProductivityGainPercent / 12;
    
    const totalMonthlyBenefit = monthlyEfficiencyGain + monthlyRevenueIncrease + monthlyCostReduction + monthlyProductivityValue;
    
    // Generate cash flow projections
    const totalMonths = Math.ceil(calculationPeriodYears * 12);
    const cashFlows = [];
    let cumulativeCashFlow = -upfrontCost;
    let paybackPeriod = null;
    
    for (let month = 0; month <= totalMonths; month++) {
      let cashFlow = 0;
      
      if (month === 0) {
        // Initial investment
        cashFlow = -upfrontCost;
      } else if (month <= implementationTimeMonths) {
        // During implementation, only costs
        cashFlow = -ongoingMonthlyCost;
      } else {
        // After implementation, benefits minus costs
        cashFlow = totalMonthlyBenefit - ongoingMonthlyCost - monthlyMaintenanceCost;
      }
      
      cumulativeCashFlow += cashFlow;
      
      // Calculate payback period
      if (paybackPeriod === null && cumulativeCashFlow >= 0 && month > 0) {
        paybackPeriod = month;
      }
      
      cashFlows.push({
        month,
        cashFlow,
        cumulativeCashFlow
      });
    }
    
    // Calculate NPV
    let npv = -upfrontCost;
    for (let i = 1; i < cashFlows.length; i++) {
      npv += cashFlows[i].cashFlow / Math.pow(1 + discountRate / 12, i);
    }
    
    // Calculate IRR (simplified approximation)
    // For actual IRR, you'd need to solve for r where NPV = 0
    // This is a rough approximation
    const annualCashFlow = totalMonthlyBenefit * 12 - ongoingMonthlyCost * 12 - monthlyMaintenanceCost * 12;
    const approximateIRR = annualCashFlow / upfrontCost;
    
    // Calculate ROI
    const totalInvestment = upfrontCost + (ongoingMonthlyCost * totalMonths) + (monthlyMaintenanceCost * (totalMonths - implementationTimeMonths));
    const totalBenefits = totalMonthlyBenefit * (totalMonths - implementationTimeMonths);
    const roi = ((totalBenefits - totalInvestment) / totalInvestment) * 100;
    
    // Format for benefit breakdown
    const benefitBreakdown = [
      { name: 'Efficiency Gain', value: monthlyEfficiencyGain * (totalMonths - implementationTimeMonths) },
      { name: 'Revenue Increase', value: monthlyRevenueIncrease * (totalMonths - implementationTimeMonths) },
      { name: 'Cost Reduction', value: monthlyCostReduction * (totalMonths - implementationTimeMonths) },
      { name: 'Productivity Gain', value: monthlyProductivityValue * (totalMonths - implementationTimeMonths) }
    ];
    
    // Format for cost breakdown
    const costBreakdown = [
      { name: 'Upfront Cost', value: upfrontCost },
      { name: 'Ongoing Costs', value: ongoingMonthlyCost * totalMonths },
      { name: 'Maintenance', value: monthlyMaintenanceCost * (totalMonths - implementationTimeMonths) }
    ];
    
    // Return calculated results
    return {
      isValid: true,
      summary: {
        roi: roi.toFixed(2),
        npv: npv.toFixed(2),
        paybackPeriodMonths: paybackPeriod || totalMonths,
        totalInvestment: totalInvestment.toFixed(2),
        totalBenefits: totalBenefits.toFixed(2),
        netBenefit: (totalBenefits - totalInvestment).toFixed(2)
      },
      cashFlows: cashFlows,
      breakdown: {
        benefits: benefitBreakdown,
        costs: costBreakdown
      },
      metrics: {
        annualRevenue,
        annualOperationalCosts,
        monthlyRevenue,
        implementationTimeMonths,
        upfrontCost,
        ongoingMonthlyCost,
        totalMonthlyBenefit,
        irr: approximateIRR * 100
      }
    };
  }, [businessMetrics, projectParameters]);
  
  // Determine if calculations are valid
  const hasValidCalculations = calculations.isValid;
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Colors for visualizations
  const colors = {
    positive: '#4F46E5',
    negative: '#DC2626',
    neutral: '#4B5563',
    breakdown: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280']
  };
  
  // Format cash flow data for chart
  const cashFlowData = useMemo(() => {
    if (!hasValidCalculations) return [];
    
    return calculations.cashFlows.map(flow => ({
      month: `Month ${flow.month}`,
      cashFlow: flow.cashFlow,
      cumulativeCashFlow: flow.cumulativeCashFlow
    }));
  }, [calculations.cashFlows, hasValidCalculations]);
  
  if (!hasValidCalculations) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className || ''}`}>
        <div className="text-center py-10">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Complete the form to view ROI results
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Fill in the business metrics and project parameters to generate ROI calculations
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className || ''}`}>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">ROI Analysis</h2>
      
      {/* ROI summary metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-indigo-900 dark:text-indigo-200 mb-1">Return on Investment</h3>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {calculations.summary.roi}%
            </span>
            <span className="ml-1 text-sm text-indigo-500 dark:text-indigo-300">
              over {projectParameters.calculationPeriodYears} {projectParameters.calculationPeriodYears === '1' ? 'year' : 'years'}
            </span>
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-900 dark:text-green-200 mb-1">Net Present Value</h3>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(calculations.summary.npv)}
            </span>
          </div>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">Payback Period</h3>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {calculations.summary.paybackPeriodMonths}
            </span>
            <span className="ml-1 text-sm text-blue-500 dark:text-blue-300">
              {calculations.summary.paybackPeriodMonths === 1 ? 'month' : 'months'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Additional metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Financial Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Investment</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(calculations.summary.totalInvestment)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Benefits</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {formatCurrency(calculations.summary.totalBenefits)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Net Benefit</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {formatCurrency(calculations.summary.netBenefit)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Monthly Impact</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Cost</span>
              <span className="font-medium text-red-600 dark:text-red-400">
                {formatCurrency(calculations.metrics.ongoingMonthlyCost)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Benefit</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {formatCurrency(calculations.metrics.totalMonthlyBenefit)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Net Monthly Impact</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {formatCurrency(calculations.metrics.totalMonthlyBenefit - calculations.metrics.ongoingMonthlyCost)}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Cash flow chart */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Cash Flow Projection</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={cashFlowData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 10 }}
                interval={Math.ceil(cashFlowData.length / 10)}
              />
              <YAxis
                tickFormatter={(value) => `$${Math.abs(value) > 999 ? `${(value / 1000).toFixed(0)}k` : value}`}
              />
              <Tooltip 
                formatter={(value) => [`${formatCurrency(value)}`, 'Amount']}
                labelFormatter={(label) => label}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="cashFlow" 
                name="Monthly Cash Flow" 
                stroke={colors.positive}
                strokeWidth={2}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="cumulativeCashFlow" 
                name="Cumulative Cash Flow" 
                stroke={colors.neutral}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Benefit breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Benefit Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={calculations.breakdown.benefits}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  label={(entry) => `${entry.name} (${((entry.value / calculations.summary.totalBenefits) * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {calculations.breakdown.benefits.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors.breakdown[index % colors.breakdown.length]} />
                  ))}
                  <Label
                    value={formatCurrency(calculations.summary.totalBenefits)}
                    position="center"
                    className="text-sm font-medium"
                  />
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Cost Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={calculations.breakdown.costs}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number"
                  tickFormatter={(value) => `$${Math.abs(value) > 999 ? `${(value / 1000).toFixed(0)}k` : value}`}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar 
                  dataKey="value" 
                  fill={colors.neutral}
                  radius={[0, 4, 4, 0]}
                >
                  {calculations.breakdown.costs.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors.breakdown[index % colors.breakdown.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Recommendations and conclusions */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Conclusion</h3>
        
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          {parseFloat(calculations.summary.roi) > 100 ? (
            <p>This project shows an <span className="font-medium text-green-600 dark:text-green-400">exceptional ROI</span> and is strongly recommended. The investment is projected to generate significant value, with the payback period occurring in just {calculations.summary.paybackPeriodMonths} months.</p>
          ) : parseFloat(calculations.summary.roi) > 50 ? (
            <p>This project shows a <span className="font-medium text-green-600 dark:text-green-400">strong ROI</span> and is recommended. The benefits significantly outweigh the costs, with the payback period occurring in {calculations.summary.paybackPeriodMonths} months.</p>
          ) : parseFloat(calculations.summary.roi) > 0 ? (
            <p>This project shows a <span className="font-medium text-blue-600 dark:text-blue-400">positive ROI</span> and could be worth pursuing. The investment is projected to pay for itself in {calculations.summary.paybackPeriodMonths} months.</p>
          ) : (
            <p>This project shows a <span className="font-medium text-red-600 dark:text-red-400">negative ROI</span> based on the current parameters. Consider adjusting the project scope or parameters to improve the financial outlook.</p>
          )}
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400 italic">
          <p>Note: This ROI analysis is based on the provided inputs and represents an estimate. Actual results may vary.</p>
          <p className="mt-1">
            The analysis uses a discount rate of {projectParameters.discountRate}% and a time horizon of {projectParameters.calculationPeriodYears} years.
          </p>
        </div>
      </div>
    </div>
  );
};

ROIResults.propTypes = {
  businessMetrics: PropTypes.object,
  projectParameters: PropTypes.object,
  className: PropTypes.string
};

export default ROIResults;
