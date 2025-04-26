import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import Layout from '../components/layout/Layout';
import BusinessMetricsForm from '../components/roi/BusinessMetricsForm';
import ROIResults from '../components/roi/ROIResults';
import { useROI } from '../contexts/ROIContext';
import { useProject } from '../contexts/ProjectContext';
import LoadingIndicator from '../components/common/LoadingIndicator';
import EmptyState from '../components/common/EmptyState';

// Mock data for initial development
const MOCK_ROI_DATA = {
  id: 'mock-roi-1',
  name: 'AI Prototype Generator ROI Analysis',
  description: 'ROI analysis for implementing AI-powered prototype generation',
  project_id: 'project-1',
  parameters: {
    timeline_months: 24,
    discount_rate: 0.1,
    currency: 'USD',
    start_date: new Date().toISOString().split('T')[0],
  },
  costs: [
    {
      id: 'cost-1',
      name: 'Initial development',
      type: 'development',
      amount: 100000,
      recurring: false,
      frequency: null,
      description: 'Cost of initial development of the AI prototype generator',
    },
    {
      id: 'cost-2',
      name: 'Cloud infrastructure',
      type: 'infrastructure',
      amount: 2000,
      recurring: true,
      frequency: 'monthly',
      description: 'Monthly cost of cloud infrastructure for the AI prototype generator',
    },
    {
      id: 'cost-3',
      name: 'AI model licensing',
      type: 'licensing',
      amount: 5000,
      recurring: true,
      frequency: 'quarterly',
      description: 'Quarterly licensing cost for AI models',
    },
  ],
  benefits: [
    {
      id: 'benefit-1',
      name: 'Developer productivity increase',
      type: 'time_saving',
      value: 200000,
      probability: 0.9,
      time_to_realize: 3,
      recurring: true,
      frequency: 'yearly',
      description: 'Annual productivity increase due to faster prototype generation',
    },
    {
      id: 'benefit-2',
      name: 'Reduced time-to-market',
      type: 'revenue_increase',
      value: 150000,
      probability: 0.8,
      time_to_realize: 6,
      recurring: false,
      frequency: null,
      description: 'One-time benefit from releasing products faster',
    },
  ],
  results: {
    roi_percentage: 127.5,
    net_present_value: 127500,
    payback_period_months: 14.5,
    internal_rate_of_return: 0.42,
    benefit_cost_ratio: 2.275,
    total_costs: 200000,
    total_benefits: 455000,
    net_benefit: 255000,
    timeline: Array.from({ length: 24 }, (_, i) => ({
      period: i,
      date: new Date(new Date().setMonth(new Date().getMonth() + i)).toISOString().split('T')[0],
      costs: i === 0 
        ? { 'cost-1': 100000, 'cost-2': 2000, 'cost-3': 0 } 
        : i % 3 === 0 
          ? { 'cost-2': 2000, 'cost-3': 5000 } 
          : { 'cost-2': 2000 },
      benefits: i >= 3 
        ? i === 6 
          ? { 'benefit-1': i >= 12 ? 20000 : 16666, 'benefit-2': 150000 } 
          : { 'benefit-1': i >= 12 ? 20000 : 16666 } 
        : {},
      net_cash_flow: i === 0 
        ? -102000 
        : i === 3 
          ? 14666 
          : i === 6 
            ? 159666 
            : i % 3 === 0 
              ? 13000 
              : 18000,
      discounted_cash_flow: i === 0 
        ? -102000 
        : (i === 3 ? 14666 : i === 6 ? 159666 : i % 3 === 0 ? 13000 : 18000) / Math.pow(1.1, i/12),
      cumulative_cash_flow: -102000 + (i * 15000),
    })),
    chart_data: {
      labels: Array.from({ length: 24 }, (_, i) => `Month ${i}`),
      series: {
        costs: Array.from({ length: 24 }, (_, i) => i === 0 ? 102000 : i % 3 === 0 ? 7000 : 2000),
        benefits: Array.from({ length: 24 }, (_, i) => i < 3 ? 0 : i === 6 ? 166666 : i >= 12 ? 20000 : 16666),
        netCashFlow: Array.from({ length: 24 }, (_, i) => 
          i === 0 ? -102000 : i === 3 ? 14666 : i === 6 ? 159666 : i % 3 === 0 ? 13000 : 18000
        ),
        cumulativeCashFlow: Array.from({ length: 24 }, (_, i) => -102000 + (i * 15000)),
      },
      summary: {
        timeline_months: 24,
        currency: 'USD',
      }
    }
  },
  created_at: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
  updated_at: new Date().toISOString().split('T')[0],
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`roi-tab-${index}`}
      aria-labelledby={`roi-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ROICalculator() {
  const router = useRouter();
  const { projects, selectedProject, setSelectedProject } = useProject();
  const {
    roiCalculations,
    selectedCalculation,
    setSelectedCalculation,
    loading,
    error,
    createROICalculation,
    updateROICalculation,
    deleteROICalculation,
    printROIResults,
    exportROIResults,
    shareROIResults,
  } = useROI();

  const [activeTab, setActiveTab] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [calculationToDelete, setCalculationToDelete] = useState(null);
  const [editData, setEditData] = useState(null);
  
  // Use mock data for development (would be removed in production)
  const useMockData = process.env.NODE_ENV === 'development' && roiCalculations.length === 0;
  const displayCalculations = useMockData ? [MOCK_ROI_DATA] : roiCalculations;
  const displaySelectedCalculation = useMockData ? MOCK_ROI_DATA : selectedCalculation;

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenForm = (calculationData = null) => {
    setEditData(calculationData);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditData(null);
    setIsFormOpen(false);
  };

  const handleCreateOrUpdate = async (formData) => {
    try {
      if (editData) {
        await updateROICalculation(editData.id, formData);
      } else {
        await createROICalculation(formData);
      }
      setIsFormOpen(false);
      setEditData(null);
    } catch (err) {
      console.error('Error saving ROI calculation:', err);
    }
  };

  const handleConfirmDelete = async () => {
    if (calculationToDelete) {
      await deleteROICalculation(calculationToDelete.id);
      setIsDeleteDialogOpen(false);
      setCalculationToDelete(null);
    }
  };

  const handleOpenDeleteDialog = (calculation) => {
    setCalculationToDelete(calculation);
    setIsDeleteDialogOpen(true);
  };

  const handleSelectCalculation = (calculation) => {
    setSelectedCalculation(calculation);
    setActiveTab(1); // Switch to Results tab
  };

  return (
    <Layout>
      <Head>
        <title>ROI Calculator | Auto AGI Builder</title>
      </Head>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            ROI Calculator
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Calculate and visualize the return on investment for your AI-powered projects.
            Compare costs and benefits over time to make informed decisions.
          </Typography>
        </Box>

        <Paper sx={{ mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="ROI Calculations" />
            <Tab 
              label="Results" 
              disabled={!displaySelectedCalculation}
            />
          </Tabs>

          {/* Calculations List Tab */}
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Your ROI Calculations
                {selectedProject && (
                  <Chip 
                    label={`Project: ${selectedProject.name}`} 
                    size="small" 
                    color="primary" 
                    sx={{ ml: 2 }}
                  />
                )}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpenForm()}
              >
                New Calculation
              </Button>
            </Box>

            {loading ? (
              <LoadingIndicator message="Loading ROI calculations..." />
            ) : error ? (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            ) : displayCalculations.length === 0 ? (
              <EmptyState
                title="No ROI Calculations Found"
                description="Create your first ROI calculation to analyze the costs and benefits of your project."
                actionText="Create ROI Calculation"
                onAction={() => handleOpenForm()}
              />
            ) : (
              <Grid container spacing={3}>
                {displayCalculations.map((calculation) => (
                  <Grid item xs={12} key={calculation.id}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': { boxShadow: 4 },
                        borderLeft: 4,
                        borderColor: calculation.results.roi_percentage >= 0 ? 'success.main' : 'error.main'
                      }}
                      onClick={() => handleSelectCalculation(calculation)}
                    >
                      <CardContent sx={{ pb: 1 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="h6" component="h3">
                              {calculation.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {calculation.description || 'No description provided'}
                            </Typography>
                            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                              Created: {new Date(calculation.created_at).toLocaleDateString()}
                              {calculation.created_at !== calculation.updated_at && 
                                ` • Updated: ${new Date(calculation.updated_at).toLocaleDateString()}`}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="h5" component="p" sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                                ROI: {calculation.results.roi_percentage > 0 ? '+' : ''}
                                {calculation.results.roi_percentage.toFixed(1)}%
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'right' }}>
                                NPV: {calculation.results.net_present_value >= 0 ? '+' : ''}
                                {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: calculation.parameters.currency,
                                  maximumFractionDigits: 0
                                }).format(calculation.results.net_present_value)}
                              </Typography>
                            </Box>
                            <Box sx={{ ml: 2 }}>
                              <IconButton 
                                color="primary" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenForm(calculation);
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton 
                                color="error" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenDeleteDialog(calculation);
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>

          {/* Results Tab */}
          <TabPanel value={activeTab} index={1}>
            {!displaySelectedCalculation ? (
              <EmptyState
                title="No ROI Calculation Selected"
                description="Select a calculation from the list to view detailed results."
                actionText="View Calculations"
                onAction={() => setActiveTab(0)}
              />
            ) : (
              <ROIResults
                roiData={displaySelectedCalculation}
                onSave={() => {}} // Save functionality would be implemented here
                onPrint={printROIResults}
                onExport={exportROIResults}
                onShare={shareROIResults}
                isLoading={loading}
              />
            )}
          </TabPanel>
        </Paper>
      </Container>

      {/* New/Edit ROI Calculation Form Dialog */}
      <Dialog 
        open={isFormOpen} 
        onClose={handleCloseForm}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editData ? 'Edit ROI Calculation' : 'New ROI Calculation'}
        </DialogTitle>
        <DialogContent dividers>
          <BusinessMetricsForm
            projectId={selectedProject?.id}
            initialData={editData}
            onSubmit={handleCreateOrUpdate}
            onCancel={handleCloseForm}
            isLoading={loading}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete ROI Calculation?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{calculationToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
