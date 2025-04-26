import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Tab,
  Tabs,
  Typography,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  PieChart,
  Pie,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  Area,
  AreaChart,
  ReferenceLine,
} from 'recharts';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import PrintIcon from '@mui/icons-material/Print';
import SaveIcon from '@mui/icons-material/Save';

import roiService from '../../services/roiService';

// TabPanel component for tabbed content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`roi-tabpanel-${index}`}
      aria-labelledby={`roi-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

/**
 * ROIResults component to display the calculated ROI metrics
 */
const ROIResults = ({ 
  roiData, 
  onSave,
  onPrint,
  onExport,
  onShare,
  isLoading = false
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  // Get chart colors
  const chartColors = roiService.getChartColors();

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Format the summary metrics for display
  const formatSummaryMetrics = () => {
    const { results, parameters } = roiData;
    
    return [
      {
        title: 'ROI',
        value: roiService.formatPercentage(results.roi_percentage),
        description: 'Return on Investment',
        positive: results.roi_percentage > 0,
        mainMetric: true,
      },
      {
        title: 'NPV',
        value: roiService.formatCurrency(results.net_present_value, parameters.currency),
        description: 'Net Present Value',
        positive: results.net_present_value > 0,
        mainMetric: true,
      },
      {
        title: 'Payback Period',
        value: roiService.formatPaybackPeriod(results.payback_period_months),
        description: 'Time to recoup investment',
        positive: true,
        mainMetric: true,
      },
      {
        title: 'Benefit-Cost Ratio',
        value: results.benefit_cost_ratio.toFixed(2),
        description: 'Benefits relative to costs',
        positive: results.benefit_cost_ratio > 1,
        mainMetric: true,
      }
    ];
  };

  // Format data for the cash flow line chart
  const prepareCashFlowChartData = () => {
    if (!roiData?.results?.timeline) return [];
    
    return roiData.results.timeline.map((item) => {
      const totalCosts = Object.values(item.costs).reduce((sum, value) => sum + value, 0);
      const totalBenefits = Object.values(item.benefits).reduce((sum, value) => sum + value, 0);
      
      let periodLabel = `Month ${item.period}`;
      if (item.date) {
        const date = new Date(item.date);
        periodLabel = date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short'
        });
      }
      
      return {
        period: periodLabel,
        periodMonth: item.period,
        costs: -totalCosts,
        benefits: totalBenefits,
        netCashFlow: item.net_cash_flow,
        cumulativeCashFlow: item.cumulative_cash_flow,
      };
    });
  };

  // Calculate summary metrics and chart data
  const summaryMetrics = formatSummaryMetrics();
  const cashFlowChartData = prepareCashFlowChartData();
  const paybackPeriodMonth = roiData?.results?.payback_period_months;
  const isPositiveROI = roiData?.results?.roi_percentage > 0;
  
  return (
    <Box>
      {/* Header with Key Metrics */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 3, 
          bgcolor: isPositiveROI ? 'success.light' : 'error.light',
          color: '#fff'
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" gutterBottom>
              ROI Analysis: {roiData.name}
            </Typography>
            <Typography variant="body1" gutterBottom>
              {roiData.description || 'ROI calculation results based on provided costs and benefits.'}
            </Typography>
            {roiData.project_id && (
              <Chip 
                label={`Project ID: ${roiData.project_id}`} 
                size="small" 
                sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.2)' }}
              />
            )}
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Tooltip title="Save ROI Analysis">
                <IconButton onClick={onSave} disabled={isLoading} color="inherit">
                  <SaveIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Print ROI Analysis">
                <IconButton onClick={onPrint} disabled={isLoading} color="inherit">
                  <PrintIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export as PDF/Excel">
                <IconButton onClick={onExport} disabled={isLoading} color="inherit">
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Share ROI Analysis">
                <IconButton onClick={onShare} disabled={isLoading} color="inherit">
                  <ShareIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Summary Metrics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {summaryMetrics
          .filter(metric => metric.mainMetric)
          .map((metric, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  borderLeft: 4,
                  borderColor: metric.positive ? 'success.main' : 'error.main',
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {metric.title}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {metric.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {metric.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
      </Grid>
      
      {/* Tabbed Content */}
      <Box sx={{ width: '100%', bgcolor: 'background.paper', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Cash Flow Analysis" />
          <Tab label="Timeline" />
          <Tab label="Details" />
        </Tabs>
        
        {/* Cash Flow Analysis Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Cash Flow Over Time" />
                <Divider />
                <CardContent sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cashFlowChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis 
                        tickFormatter={(value) => 
                          roiService.formatCurrency(value, roiData.parameters.currency).replace(/[^0-9-+.]/g, '')}
                      />
                      <RechartsTooltip 
                        formatter={(value, name) => {
                          const formattedValue = roiService.formatCurrency(
                            Math.abs(value), 
                            roiData.parameters.currency
                          );
                          const displayName = {
                            'costs': 'Costs',
                            'benefits': 'Benefits',
                            'netCashFlow': 'Net Cash Flow',
                            'cumulativeCashFlow': 'Cumulative Cash Flow',
                          }[name];
                          return [formattedValue, displayName];
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="costs" 
                        name="Costs" 
                        stroke={chartColors.costs.border} 
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="benefits" 
                        name="Benefits" 
                        stroke={chartColors.benefits.border} 
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="netCashFlow" 
                        name="Net Cash Flow" 
                        stroke={chartColors.netCashFlow.border} 
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="cumulativeCashFlow" 
                        name="Cumulative Cash Flow" 
                        stroke={chartColors.cumulativeCashFlow.border} 
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />
                      {paybackPeriodMonth != null && (
                        <ReferenceLine 
                          x={`Month ${Math.floor(paybackPeriodMonth)}`} 
                          stroke="green" 
                          strokeDasharray="3 3" 
                          label={{ 
                            value: 'Payback Period', 
                            position: 'top', 
                            fill: 'green',
                            fontSize: 12
                          }} 
                        />
                      )}
                      <ReferenceLine y={0} stroke="#000" strokeWidth={1} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Cumulative Cash Flow" />
                <Divider />
                <CardContent sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={cashFlowChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis 
                        tickFormatter={(value) => 
                          roiService.formatCurrency(value, roiData.parameters.currency).replace(/[^0-9-+.]/g, '')}
                      />
                      <RechartsTooltip 
                        formatter={(value) => [
                          roiService.formatCurrency(value, roiData.parameters.currency),
                          'Cumulative Cash Flow'
                        ]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="cumulativeCashFlow" 
                        stroke={chartColors.cumulativeCashFlow.border}
                        fill={chartColors.cumulativeCashFlow.main}
                        strokeWidth={2}
                      />
                      <ReferenceLine y={0} stroke="#000" strokeWidth={1} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Timeline Tab */}
        <TabPanel value={activeTab} index={1}>
          <Card>
            <CardHeader 
              title="Monthly Cash Flow Timeline" 
              subheader={`Timeline: ${roiData.parameters.timeline_months} months | Currency: ${roiData.parameters.currency}`}
            />
            <Divider />
            <Box sx={{ overflow: 'auto', maxHeight: 600 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Period</TableCell>
                    <TableCell align="right">Costs</TableCell>
                    <TableCell align="right">Benefits</TableCell>
                    <TableCell align="right">Net Cash Flow</TableCell>
                    <TableCell align="right">Cumulative Cash Flow</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roiData.results.timeline.map((item) => {
                    const totalCosts = Object.values(item.costs).reduce((sum, value) => sum + value, 0);
                    const totalBenefits = Object.values(item.benefits).reduce((sum, value) => sum + value, 0);
                    let periodLabel = `Month ${item.period}`;
                    if (item.date) {
                      const date = new Date(item.date);
                      periodLabel = date.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short'
                      });
                    }
                    
                    const isPaybackPeriod = paybackPeriodMonth && 
                      Math.floor(paybackPeriodMonth) === item.period;
                    
                    return (
                      <TableRow 
                        key={item.period}
                        sx={{ 
                          backgroundColor: isPaybackPeriod ? 'success.light' : 'inherit',
                          '&:nth-of-type(odd)': { bgcolor: 'action.hover' }
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {periodLabel}
                          {isPaybackPeriod && (
                            <Chip 
                              label="Payback Period" 
                              size="small" 
                              color="success"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {roiService.formatCurrency(totalCosts, roiData.parameters.currency)}
                        </TableCell>
                        <TableCell align="right">
                          {roiService.formatCurrency(totalBenefits, roiData.parameters.currency)}
                        </TableCell>
                        <TableCell 
                          align="right"
                          sx={{ 
                            color: item.net_cash_flow >= 0 ? 'success.main' : 'error.main',
                            fontWeight: 'medium'
                          }}
                        >
                          {roiService.formatCurrency(item.net_cash_flow, roiData.parameters.currency)}
                        </TableCell>
                        <TableCell 
                          align="right"
                          sx={{ 
                            color: item.cumulative_cash_flow >= 0 ? 'success.main' : 'error.main',
                            fontWeight: 'bold'
                          }}
                        >
                          {roiService.formatCurrency(item.cumulative_cash_flow, roiData.parameters.currency)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </Card>
        </TabPanel>
        
        {/* Details Tab */}
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Project Parameters" />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Timeline</Typography>
                      <Typography variant="body1">
                        {roiData.parameters.timeline_months} months
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Discount Rate</Typography>
                      <Typography variant="body1">
                        {(roiData.parameters.discount_rate * 100).toFixed(1)}%
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Currency</Typography>
                      <Typography variant="body1">
                        {roiData.parameters.currency}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Start Date</Typography>
                      <Typography variant="body1">
                        {roiData.parameters.start_date 
                          ? new Date(roiData.parameters.start_date).toLocaleDateString() 
                          : 'Not specified'}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Summary" />
                <Divider />
                <CardContent>
                  <Typography variant="body1" paragraph>
                    This ROI analysis shows {isPositiveROI
                      ? `a positive return of ${roiService.formatPercentage(roiData.results.roi_percentage)}`
                      : `a negative return of ${roiService.formatPercentage(roiData.results.roi_percentage)}`}
                    {" "}with a Net Present Value of {roiService.formatCurrency(roiData.results.net_present_value, roiData.parameters.currency)}.
                  </Typography>
                  <Typography variant="body1">
                    {roiData.results.payback_period_months 
                      ? `The investment will be recovered in ${roiService.formatPaybackPeriod(roiData.results.payback_period_months)}.`
                      : "The investment will not be recovered within the analyzed timeline."}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Box>
    </Box>
  );
};

ROIResults.propTypes = {
  roiData: PropTypes.object.isRequired,
  onSave: PropTypes.func,
  onPrint: PropTypes.func,
  onExport: PropTypes.func,
  onShare: PropTypes.func,
  isLoading: PropTypes.bool,
};

export default ROIResults;
