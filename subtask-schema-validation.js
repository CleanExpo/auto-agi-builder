/**
 * JSON Schema Validation for Subtask Processing
 * 
 * This module implements a robust architecture that ensures all subtasks in the system
 * must pass validation against a predefined JSON schema before being processed, stored,
 * or transmitted.
 */

const Ajv = require('ajv');
const addFormats = require('ajv-formats');

// Initialize the JSON schema validator
const ajv = new Ajv({ allErrors: true, strict: false });
// Add string formats like 'email', 'uri', etc.
addFormats(ajv);

// Define the JSON schema for subtasks
const subtaskSchema = {
  type: 'object',
  required: ['id', 'title', 'status', 'parentTaskId', 'createdAt'],
  properties: {
    id: {
      type: 'string',
      format: 'uuid'
    },
    title: {
      type: 'string',
      minLength: 1,
      maxLength: 200
    },
    description: {
      type: 'string',
      maxLength: 2000
    },
    status: {
      type: 'string',
      enum: ['pending', 'in-progress', 'completed', 'failed', 'cancelled']
    },
    parentTaskId: {
      type: 'string',
      format: 'uuid'
    },
    assigneeId: {
      type: 'string',
      format: 'uuid'
    },
    priority: {
      type: 'integer',
      minimum: 0,
      maximum: 5
    },
    dueDate: {
      type: 'string',
      format: 'date-time'
    },
    createdAt: {
      type: 'string',
      format: 'date-time'
    },
    updatedAt: {
      type: 'string',
      format: 'date-time'
    },
    metadata: {
      type: 'object',
      additionalProperties: true
    },
    dependencies: {
      type: 'array',
      items: {
        type: 'string',
        format: 'uuid'
      }
    }
  },
  additionalProperties: false
};

// Compile the schema for better performance
const validateSubtask = ajv.compile(subtaskSchema);

/**
 * Main validation function that validates a subtask against the defined schema
 * @param {Object} subtask - The subtask to validate
 * @returns {Object} - Validation result { valid: boolean, errors: Array }
 */
function validateSubtaskData(subtask) {
  const valid = validateSubtask(subtask);
  return {
    valid,
    errors: validateSubtask.errors || []
  };
}

/**
 * Formats validation errors into a more readable format
 * @param {Array} errors - The errors returned from the validator
 * @returns {Array} - Formatted error messages
 */
function formatValidationErrors(errors) {
  return errors.map(err => {
    const path = err.instancePath || '';
    const property = err.params.missingProperty || '';
    const fullPath = path + (property ? `/${property}` : '');
    
    switch (err.keyword) {
      case 'required':
        return `Missing required property: ${property}`;
      case 'type':
        return `${fullPath}: should be ${err.params.type}`;
      case 'enum':
        return `${fullPath}: should be one of [${err.params.allowedValues.join(', ')}]`;
      case 'format':
        return `${fullPath}: should match format "${err.params.format}"`;
      case 'minLength':
        return `${fullPath}: should be at least ${err.params.limit} characters long`;
      case 'maxLength':
        return `${fullPath}: should not be longer than ${err.params.limit} characters`;
      default:
        return `${fullPath}: ${err.message}`;
    }
  });
}

/**
 * Validates a subtask and throws an error with detailed messages if validation fails
 * @param {Object} subtask - The subtask to validate
 * @throws {Error} - Throws error with detailed validation failures
 * @returns {boolean} - True if validation passes
 */
function validateAndThrow(subtask) {
  const { valid, errors } = validateSubtaskData(subtask);
  if (!valid) {
    const formattedErrors = formatValidationErrors(errors);
    const errorMessage = `Subtask validation failed:\n${formattedErrors.join('\n')}`;
    
    const error = new Error(errorMessage);
    error.name = 'SubtaskValidationError';
    error.details = errors;
    error.formattedErrors = formattedErrors;
    
    throw error;
  }
  return true;
}

/**
 * Middleware for validating subtasks in Express.js routes
 * @returns {Function} Express middleware function
 */
function subtaskValidationMiddleware() {
  return (req, res, next) => {
    try {
      // Assuming the subtask is in the request body
      const subtask = req.body;
      validateAndThrow(subtask);
      next();
    } catch (error) {
      if (error.name === 'SubtaskValidationError') {
        res.status(400).json({
          error: 'Validation failed',
          details: error.formattedErrors
        });
      } else {
        next(error);
      }
    }
  };
}

/**
 * Cache for validated objects to improve performance
 */
const validationCache = new Map();

/**
 * Validates a subtask using a cache for performance optimization
 * @param {Object} subtask - The subtask to validate
 * @returns {Object} - Validation result { valid: boolean, errors: Array, cached: boolean }
 */
function validateWithCache(subtask) {
  // Use the subtask ID as cache key if available, otherwise use a hash of the object
  const key = subtask.id || JSON.stringify(subtask);
  
  if (validationCache.has(key)) {
    return { ...validationCache.get(key), cached: true };
  }
  
  const result = validateSubtaskData(subtask);
  validationCache.set(key, result);
  
  return { ...result, cached: false };
}

/**
 * Batch validation for multiple subtasks
 * @param {Array} subtasks - Array of subtasks to validate
 * @returns {Object} - Results with valid and invalid subtasks
 */
function validateBatch(subtasks) {
  const results = {
    valid: [],
    invalid: [],
    summary: {
      total: subtasks.length,
      validCount: 0,
      invalidCount: 0
    }
  };
  
  for (const subtask of subtasks) {
    const { valid, errors } = validateSubtaskData(subtask);
    
    if (valid) {
      results.valid.push({ subtask, valid });
      results.summary.validCount++;
    } else {
      results.invalid.push({
        subtask,
        valid,
        errors,
        formattedErrors: formatValidationErrors(errors)
      });
      results.summary.invalidCount++;
    }
  }
  
  return results;
}

module.exports = {
  validateSubtaskData,
  validateAndThrow,
  formatValidationErrors,
  subtaskValidationMiddleware,
  validateWithCache,
  validateBatch,
  subtaskSchema
};
