/**
 * Validation utilities for Auto AGI Builder
 */

/**
 * Validate an email address
 * @param {string} email - The email to validate
 * @returns {boolean} - Whether the email is valid
 */
export function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Validate a password
 * @param {string} password - The password to validate
 * @returns {object} - Validation result and message
 */
export function validatePassword(password) {
  if (!password || password.length < 8) {
    return {
      valid: false,
      message: 'Password must be at least 8 characters long',
    };
  }
  
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one uppercase letter',
    };
  }
  
  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one lowercase letter',
    };
  }
  
  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one number',
    };
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one special character',
    };
  }
  
  return {
    valid: true,
    message: 'Password is valid',
  };
}

/**
 * Sanitize HTML content to prevent XSS
 * @param {string} html - The HTML content to sanitize
 * @returns {string} - The sanitized HTML
 */
export function sanitizeHtml(html) {
  if (!html) return '';
  
  // Simple HTML sanitization
  return html
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validate a form object
 * @param {object} formData - The form data to validate
 * @param {object} schema - The validation schema
 * @returns {object} - Validation errors
 */
export function validateForm(formData, schema) {
  const errors = {};
  
  Object.entries(schema).forEach(([field, rules]) => {
    const value = formData[field];
    
    // Required check
    if (rules.required && (!value || value.trim() === '')) {
      errors[field] = `${rules.label || field} is required`;
      return;
    }
    
    // Skip other checks if empty and not required
    if (!value) return;
    
    // Minimum length
    if (rules.minLength && value.length < rules.minLength) {
      errors[field] = `${rules.label || field} must be at least ${rules.minLength} characters`;
      return;
    }
    
    // Maximum length
    if (rules.maxLength && value.length > rules.maxLength) {
      errors[field] = `${rules.label || field} must be at most ${rules.maxLength} characters`;
      return;
    }
    
    // Pattern matching
    if (rules.pattern && !rules.pattern.test(value)) {
      errors[field] = rules.patternError || `${rules.label || field} is invalid`;
      return;
    }
    
    // Email validation
    if (rules.type === 'email' && !isValidEmail(value)) {
      errors[field] = `${rules.label || field} must be a valid email`;
      return;
    }
    
    // Password validation
    if (rules.type === 'password') {
      const passwordValidation = validatePassword(value);
      if (!passwordValidation.valid) {
        errors[field] = passwordValidation.message;
        return;
      }
    }
    
    // Custom validation
    if (rules.validate) {
      const customError = rules.validate(value, formData);
      if (customError) {
        errors[field] = customError;
        return;
      }
    }
  });
  
  return errors;
}
