import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  TextField,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  InputAdornment,
  Tooltip,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { v4 as uuidv4 } from 'uuid';

import roiService from '../../services/roiService';

/**
 * BusinessMetricsForm component for collecting cost and benefit metrics for ROI calculation
 */
const BusinessMetricsForm = ({
  projectId,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  // Get ROI item types for dropdowns
  const { costTypes, benefitTypes, frequencies } = roiService.getROIItemTypes();

  // Default form state
  const defaultFormState = {
    project_id: projectId || null,
    name: '',
    description: '',
    parameters: {
      timeline_months: 24,
      discount_rate: 0.1,
      currency: 'USD',
      start_date: new Date().toISOString().split('T')[0],
    },
    costs: [
      {
        id: uuidv4(),
        name: '',
        type: 'development',
        amount: '',
        recurring: false,
        frequency: 'monthly',
        description: '',
      },
    ],
    benefits: [
      {
        id: uuidv4(),
        name: '',
        type: 'time_saving',
        value: '',
        probability: 1.0,
        time_to_realize: 0,
        recurring: false,
        frequency: 'monthly',
        description: '',
      },
    ],
  };

  // Form state
  const [formData, setFormData] = useState(defaultFormState);
  
  // Form errors
  const [errors, setErrors] = useState({});
  
  // Preset selection for parameters
  const [selectedPreset, setSelectedPreset] = useState('');

  // Initialize form with data if provided
  useEffect(() => {
    if (initialData) {
      // Ensure costs and benefits have IDs
      const costs = initialData.costs.map((cost) => ({
        ...cost,
        id: cost.id || uuidv4(),
      }));
      
      const benefits = initialData.benefits.map((benefit) => ({
        ...benefit,
        id: benefit.id || uuidv4(),
      }));
      
      setFormData({
        ...initialData,
        project_id: initialData.project_id || projectId,
        costs,
        benefits,
      });
    } else {
      setFormData({
        ...defaultFormState,
        project_id: projectId,
      });
    }
  }, [initialData, projectId]);

  // Handle basic field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  // Handle parameter changes
  const handleParameterChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      parameters: {
        ...formData.parameters,
        [name]: name === 'discount_rate' ? parseFloat(value) : value,
      },
    });
    
    // Clear preset selection when manually changing parameters
    setSelectedPreset('');
  };

  // Handle cost item changes
  const handleCostChange = (index, field, value) => {
    const updatedCosts = [...formData.costs];
    
    if (field === 'recurring') {
      // Convert to boolean
      updatedCosts[index][field] = value === 'true';
    } else if (field === 'amount') {
      // Ensure numeric value
      updatedCosts[index][field] = value === '' ? '' : parseFloat(value);
    } else {
      updatedCosts[index][field] = value;
    }
    
    setFormData({
      ...formData,
      costs: updatedCosts,
    });
  };

  // Handle benefit item changes
  const handleBenefitChange = (index, field, value) => {
    const updatedBenefits = [...formData.benefits];
    
    if (field === 'recurring') {
      // Convert to boolean
      updatedBenefits[index][field] = value === 'true';
    } else if (['value', 'probability', 'time_to_realize'].includes(field)) {
      // Ensure numeric value
      updatedBenefits[index][field] = value === '' ? '' : parseFloat(value);
    } else {
      updatedBenefits[index][field] = value;
    }
    
    setFormData({
      ...formData,
      benefits: updatedBenefits,
    });
  };

  // Add a new cost item
  const handleAddCost = () => {
    setFormData({
      ...formData,
      costs: [
        ...formData.costs,
        {
          id: uuidv4(),
          name: '',
          type: 'development',
          amount: '',
          recurring: false,
          frequency: 'monthly',
          description: '',
        },
      ],
    });
  };

  // Add a new benefit item
  const handleAddBenefit = () => {
    setFormData({
      ...formData,
      benefits: [
        ...formData.benefits,
        {
          id: uuidv4(),
          name: '',
          type: 'time_saving',
          value: '',
          probability: 1.0,
          time_to_realize: 0,
          recurring: false,
          frequency: 'monthly',
          description: '',
        },
      ],
    });
  };

  // Remove a cost item
  const handleRemoveCost = (index) => {
    const updatedCosts = [...formData.costs];
    updatedCosts.splice(index, 1);
    
    setFormData({
      ...formData,
      costs: updatedCosts,
    });
  };

  // Remove a benefit item
  const handleRemoveBenefit = (index) => {
    const updatedBenefits = [...formData.benefits];
    updatedBenefits.splice(index, 1);
    
    setFormData({
      ...formData,
      benefits: updatedBenefits,
    });
  };

  // Apply a preset to the parameters
  const handlePresetChange = (e) => {
    const presetId = e.target.value;
    setSelectedPreset(presetId);
    
    if (!presetId) return;
    
    const presets = roiService.getROIPresets();
    const preset = presets.find((p) => p.id === presetId);
    
    if (preset) {
      setFormData({
        ...formData,
        parameters: {
          ...formData.parameters,
          ...preset.parameters,
        },
      });
    }
  };

  // Validate the form before submission
  const validateForm = () => {
    const newErrors = {};
    
    // Validate basic fields
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    // Validate parameters
    if (formData.parameters.timeline_months < 1) {
      newErrors['parameters.timeline_months'] = 'Timeline must be at least 1 month';
    }
    
    if (formData.parameters.discount_rate < 0 || formData.parameters.discount_rate > 1) {
      newErrors['parameters.discount_rate'] = 'Discount rate must be between 0 and 1';
    }
    
    // Validate costs
    const costErrors = [];
    formData.costs.forEach((cost, index) => {
      const costError = {};
      
      if (!cost.name.trim()) {
        costError.name = 'Name is required';
      }
      
      if (cost.amount === '' || isNaN(cost.amount)) {
        costError.amount = 'Valid amount is required';
      }
      
      if (cost.recurring && !cost.frequency) {
        costError.frequency = 'Frequency is required for recurring costs';
      }
      
      if (Object.keys(costError).length > 0) {
        costErrors[index] = costError;
      }
    });
    
    if (costErrors.length > 0) {
      newErrors.costs = costErrors;
    }
    
    // Validate benefits
    const benefitErrors = [];
    formData.benefits.forEach((benefit, index) => {
      const benefitError = {};
      
      if (!benefit.name.trim()) {
        benefitError.name = 'Name is required';
      }
      
      if (benefit.value === '' || isNaN(benefit.value)) {
        benefitError.value = 'Valid value is required';
      }
      
      if (benefit.probability < 0 || benefit.probability > 1) {
        benefitError.probability = 'Probability must be between 0 and 1';
      }
      
      if (benefit.time_to_realize < 0) {
        benefitError.time_to_realize = 'Time to realize must be non-negative';
      }
      
      if (benefit.recurring && !benefit.frequency) {
        benefitError.frequency = 'Frequency is required for recurring benefits';
      }
      
      if (Object.keys(benefitError).length > 0) {
        benefitErrors[index] = benefitError;
      }
    });
    
    if (benefitErrors.length > 0) {
      newErrors.benefits = benefitErrors;
    }
    
    // Ensure at least one cost and one benefit
    if (formData.costs.length === 0) {
      newErrors.costsGeneral = 'At least one cost item is required';
    }
    
    if (formData.benefits.length === 0) {
      newErrors.benefitsGeneral = 'At least one benefit item is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Format date if needed
      let submissionData = { ...formData };
      
      if (submissionData.parameters.start_date) {
        // Ensure date is in ISO format for API
        const date = new Date(submissionData.parameters.start_date);
        submissionData.parameters.start_date = date.toISOString().split('T')[0];
      }
      
      onSubmit(submissionData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="ROI Analysis Details" />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="ROI Analysis Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={!!errors.name}
                    helperText={errors.name || 'Give your ROI analysis a descriptive name'}
                    disabled={isLoading}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    multiline
                    rows={1}
                    error={!!errors.description}
                    helperText={errors.description}
                    disabled={isLoading}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* ROI Parameters */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="ROI Parameters" 
              action={
                <FormControl variant="outlined" sx={{ minWidth: 200 }}>
                  <InputLabel id="preset-label">Apply Preset</InputLabel>
                  <Select
                    labelId="preset-label"
                    value={selectedPreset}
                    onChange={handlePresetChange}
                    label="Apply Preset"
                    disabled={isLoading}
                  >
                    <MenuItem value="">
                      <em>Custom parameters</em>
                    </MenuItem>
                    {roiService.getROIPresets().map((preset) => (
                      <MenuItem key={preset.id} value={preset.id}>
                        {preset.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              }
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Timeline (months)"
                    name="timeline_months"
                    value={formData.parameters.timeline_months}
                    onChange={handleParameterChange}
                    error={!!errors['parameters.timeline_months']}
                    helperText={errors['parameters.timeline_months']}
                    disabled={isLoading}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="The number of months over which to calculate ROI">
                            <HelpOutlineIcon fontSize="small" color="action" />
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Discount Rate"
                    name="discount_rate"
                    value={formData.parameters.discount_rate}
                    onChange={handleParameterChange}
                    error={!!errors['parameters.discount_rate']}
                    helperText={
                      errors['parameters.discount_rate'] ||
                      'Annual rate for NPV calculation (0.1 = 10%)'
                    }
                    disabled={isLoading}
                    inputProps={{
                      step: 0.01,
                      min: 0,
                      max: 1,
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="The discount rate adjusts future cash flows to present value">
                            <HelpOutlineIcon fontSize="small" color="action" />
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    select
                    label="Currency"
                    name="currency"
                    value={formData.parameters.currency}
                    onChange={handleParameterChange}
                    disabled={isLoading}
                  >
                    <MenuItem value="USD">USD ($)</MenuItem>
                    <MenuItem value="EUR">EUR (€)</MenuItem>
                    <MenuItem value="GBP">GBP (£)</MenuItem>
                    <MenuItem value="JPY">JPY (¥)</MenuItem>
                    <MenuItem value="CAD">CAD ($)</MenuItem>
                    <MenuItem value="AUD">AUD ($)</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Start Date"
                    name="start_date"
                    value={formData.parameters.start_date}
                    onChange={handleParameterChange}
                    disabled={isLoading}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Costs */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="Costs" 
              subheader="Enter all costs associated with the project"
              action={
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAddCost}
                  disabled={isLoading}
                >
                  Add Cost
                </Button>
              }
            />
            <Divider />
            <CardContent>
              {errors.costsGeneral && (
                <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                  {errors.costsGeneral}
                </Typography>
              )}
              
              {formData.costs.map((cost, index) => (
                <Paper 
                  key={cost.id} 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    mb: 2,
                    position: 'relative',
                    borderLeft: '4px solid #f44336'
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveCost(index)}
                    disabled={isLoading || formData.costs.length <= 1}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Cost Name"
                        value={cost.name}
                        onChange={(e) => handleCostChange(index, 'name', e.target.value)}
                        error={!!(errors.costs && errors.costs[index]?.name)}
                        helperText={errors.costs && errors.costs[index]?.name}
                        disabled={isLoading}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        select
                        label="Cost Type"
                        value={cost.type}
                        onChange={(e) => handleCostChange(index, 'type', e.target.value)}
                        disabled={isLoading}
                      >
                        {costTypes.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Amount"
                        value={cost.amount}
                        onChange={(e) => handleCostChange(index, 'amount', e.target.value)}
                        error={!!(errors.costs && errors.costs[index]?.amount)}
                        helperText={errors.costs && errors.costs[index]?.amount}
                        disabled={isLoading}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              {formData.parameters.currency === 'USD' ? '$' : 
                               formData.parameters.currency === 'EUR' ? '€' : 
                               formData.parameters.currency === 'GBP' ? '£' : 
                               formData.parameters.currency === 'JPY' ? '¥' : 
                               formData.parameters.currency === 'CAD' ? 'C$' : 
                               formData.parameters.currency === 'AUD' ? 'A$' : '$'}
                            </InputAdornment>
                          ),
                        }}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        select
                        label="Recurring"
                        value={cost.recurring.toString()}
                        onChange={(e) => handleCostChange(index, 'recurring', e.target.value)}
                        disabled={isLoading}
                      >
                        <MenuItem value="false">One-time cost</MenuItem>
                        <MenuItem value="true">Recurring cost</MenuItem>
                      </TextField>
                    </Grid>
                    {cost.recurring && (
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          select
                          label="Frequency"
                          value={cost.frequency}
                          onChange={(e) => handleCostChange(index, 'frequency', e.target.value)}
                          error={!!(errors.costs && errors.costs[index]?.frequency)}
                          helperText={errors.costs && errors.costs[index]?.frequency}
                          disabled={isLoading}
                          required={cost.recurring}
                        >
                          {frequencies.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    )}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description (optional)"
                        value={cost.description}
                        onChange={(e) => handleCostChange(index, 'description', e.target.value)}
                        multiline
                        rows={1}
                        disabled={isLoading}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ))}
              
              {formData.costs.length === 0 && (
                <Typography variant="body2" color="text.secondary" align="center">
                  No costs added yet. Click "Add Cost" to begin.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Benefits */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="Benefits" 
              subheader="Enter all benefits expected from the project"
              action={
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAddBenefit}
                  disabled={isLoading}
                >
                  Add Benefit
                </Button>
              }
            />
            <Divider />
            <CardContent>
              {errors.benefitsGeneral && (
                <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                  {errors.benefitsGeneral}
                </Typography>
              )}
              
              {formData.benefits.map((benefit, index) => (
                <Paper 
                  key={benefit.id} 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    mb: 2,
                    position: 'relative',
                    borderLeft: '4px solid #4caf50'
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveBenefit(index)}
                    disabled={isLoading || formData.benefits.length <= 1}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Benefit Name"
                        value={benefit.name}
                        onChange={(e) => handleBenefitChange(index, 'name', e.target.value)}
                        error={!!(errors.benefits && errors.benefits[index]?.name)}
                        helperText={errors.benefits && errors.benefits[index]?.name}
                        disabled={isLoading}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        select
                        label="Benefit Type"
                        value={benefit.type}
                        onChange={(e) => handleBenefitChange(index, 'type', e.target.value)}
                        disabled={isLoading}
                      >
                        {benefitTypes.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Value"
                        value={benefit.value}
                        onChange={(e) => handleBenefitChange(index, 'value', e.target.value)}
                        error={!!(errors.benefits && errors.benefits[index]?.value)}
                        helperText={errors.benefits && errors.benefits[index]?.value}
                        disabled={isLoading}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              {formData.parameters.currency === 'USD' ? '$' : 
                               formData.parameters.currency === 'EUR' ? '€' : 
                               formData.parameters.currency === 'GBP' ? '£' : 
                               formData.parameters.currency === 'JPY' ? '¥' : 
                               formData.parameters.currency === 'CAD' ? 'C$' : 
                               formData.parameters.currency === 'AUD' ? 'A$' : '$'}
                            </InputAdornment>
                          ),
                        }}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Probability"
                        value={benefit.probability}
                        onChange={(e) => handleBenefitChange(index, 'probability', e.target.value)}
                        error={!!(errors.benefits && errors.benefits[index]?.probability)}
                        helperText={
                          (errors.benefits && errors.benefits[index]?.probability) ||
                          'Probability of realizing this benefit (0 to 1)'
                        }
                        disabled={isLoading}
                        inputProps={{
                          step: 0.1,
                          min: 0,
                          max: 1,
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Tooltip title="Probability of 1.0 means 100% certainty, 0.5 means 50% chance">
                                <HelpOutlineIcon fontSize="small" color="action" />
                              </Tooltip>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Time to Realize (months)"
                        value={benefit.time_to_realize}
                        onChange={(e) => handleBenefitChange(index, 'time_to_realize', e.target.value)}
                        error={!!(errors.benefits && errors.benefits[index]?.time_to_realize)}
                        helperText={
                          (errors.benefits && errors.benefits[index]?.time_to_realize) ||
                          'When this benefit will start to be realized'
                        }
                        disabled={isLoading}
                        inputProps={{
                          min: 0,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        select
                        label="Recurring"
                        value={benefit.recurring.toString()}
                        onChange={(e) => handleBenefitChange(index, 'recurring', e.target.value)}
                        disabled={isLoading}
                      >
                        <MenuItem value="false">One-time benefit</MenuItem>
                        <MenuItem value="true">Recurring benefit</MenuItem>
                      </TextField>
                    </Grid>
                    {benefit.recurring && (
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          select
                          label="Frequency"
                          value={benefit.frequency}
                          onChange={(e) => handleBenefitChange(index, 'frequency', e.target.value)}
                          error={!!(errors.benefits && errors.benefits[index]?.frequency)}
                          helperText={errors.benefits && errors.benefits[index]?.frequency}
                          disabled={isLoading}
                          required={benefit.recurring}
                        >
                          {frequencies.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    )}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description (optional)"
                        value={benefit.description}
                        onChange={(e) => handleBenefitChange(index, 'description', e.target.value)}
                        multiline
                        rows={1}
                        disabled={isLoading}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ))}
              
              {formData.benefits.length === 0 && (
                <Typography variant="body2" color="text.secondary" align="center">
                  No benefits added yet. Click "Add Benefit" to begin.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Submit Buttons */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={isLoading}
              sx={{ mr: 2 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading}
            >
              {isLoading ? 'Calculating...' : 'Calculate ROI'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

BusinessMetricsForm.propTypes = {
  projectId: PropTypes.string,
  initialData: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default BusinessMetricsForm;
