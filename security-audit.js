// Security Audit Script for Auto AGI Builder
// This script performs security checks and implements best practices

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const axios = require('axios');
const crypto = require('crypto');

// Configuration
const API_ENDPOINTS = [
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/requirements',
  '/api/v1/prototype',
  '/api/v1/roi',
  '/api/v1/export',
  '/api/v1/clients',
  '/api/v1/notifications',
];

// Security checklist items
const SECURITY_CHECKLIST = [
  {
    id: 'auth-protection',
    name: 'Authentication Protection',
    description: 'Verify that authentication mechanisms are properly implemented',
    status: 'pending',
    details: [],
  },
  {
    id: 'api-security',
    name: 'API Security',
    description: 'Check if API endpoints are properly secured',
    status: 'pending',
    details: [],
  },
  {
    id: 'data-validation',
    name: 'Data Validation',
    description: 'Verify that all user inputs are properly validated',
    status: 'pending',
    details: [],
  },
  {
    id: 'xss-protection',
    name: 'XSS Protection',
    description: 'Check for cross-site scripting vulnerabilities',
    status: 'pending',
    details: [],
  },
  {
    id: 'csrf-protection',
    name: 'CSRF Protection',
    description: 'Verify protection against cross-site request forgery',
    status: 'pending',
    details: [],
  },
  {
    id: 'secure-headers',
    name: 'Secure HTTP Headers',
    description: 'Check for proper security headers',
    status: 'pending',
    details: [],
  },
  {
    id: 'sensitive-data',
    name: 'Sensitive Data Handling',
    description: 'Verify that sensitive data is properly protected',
    status: 'pending',
    details: [],
  },
  {
    id: 'dependency-check',
    name: 'Dependency Check',
    description: 'Scan dependencies for known vulnerabilities',
    status: 'pending',
    details: [],
  },
  {
    id: 'error-handling',
    name: 'Error Handling',
    description: 'Check that errors are handled securely',
    status: 'pending',
    details: [],
  },
  {
    id: 'access-control',
    name: 'Access Control',
    description: 'Verify proper implementation of access controls',
    status: 'pending',
    details: [],
  },
];

// Main security audit function
async function runSecurityAudit() {
  console.log('===== Auto AGI Builder - Security Audit =====');
  
  const results = [...SECURITY_CHECKLIST];
  
  // Create results directory if it doesn't exist
  const resultsDir = path.join(process.cwd(), 'security-audit-results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  // Perform security checks
  await checkAuthImplementation(results);
  await checkAPIEndpoints(results);
  await checkInputValidation(results);
  await checkXSSProtection(results);
  await checkCSRFProtection(results);
  await checkSecureHeaders(results);
  await checkSensitiveDataHandling(results);
  await checkDependencies(results);
  await checkErrorHandling(results);
  await checkAccessControl(results);
  
  // Generate security report
  generateSecurityReport(results, resultsDir);
  
  // Implement security fixes
  await implementSecurityFixes(results);
  
  console.log('\n===== Security Audit Complete =====');
}

// Check authentication implementation
async function checkAuthImplementation(results) {
  console.log('\nChecking authentication implementation...');
  
  const authItem = results.find(item => item.id === 'auth-protection');
  
  try {
    // Check for proper JWT implementation
    const jwtFiles = await findFiles('jwt');
    if (jwtFiles.length === 0) {
      authItem.details.push({
        level: 'high',
        message: 'No JWT implementation found',
        fix: 'Implement JWT authentication for secure token handling',
      });
    } else {
      // Check JWT implementation
      const jwtContent = jwtFiles.map(file => fs.readFileSync(file, 'utf8')).join('\n');
      
      if (!jwtContent.includes('verify') || !jwtContent.includes('sign')) {
        authItem.details.push({
          level: 'medium',
          message: 'JWT token verification or signing may be missing',
          fix: 'Ensure tokens are both signed and verified in the JWT implementation',
        });
      }
      
      if (!jwtContent.includes('expiresIn') && !jwtContent.includes('exp')) {
        authItem.details.push({
          level: 'medium',
          message: 'JWT tokens may not have expiration',
          fix: 'Add expiration to JWT tokens',
        });
      }
    }
    
    // Check for password hashing
    const authFiles = await findFiles('auth|password|login');
    const authContent = authFiles.map(file => fs.readFileSync(file, 'utf8')).join('\n');
    
    if (!authContent.includes('bcrypt') && !authContent.includes('argon2') && !authContent.includes('pbkdf2')) {
      authItem.details.push({
        level: 'high',
        message: 'No secure password hashing detected',
        fix: 'Implement bcrypt or Argon2 for password hashing',
      });
    }
    
    // Update status
    if (authItem.details.length === 0) {
      authItem.status = 'passed';
    } else {
      authItem.status = authItem.details.some(d => d.level === 'high') ? 'failed' : 'warning';
    }
  } catch (error) {
    console.error('Error checking authentication:', error);
    authItem.status = 'error';
    authItem.details.push({
      level: 'error',
      message: `Error checking authentication: ${error.message}`,
    });
  }
}

// Check API endpoints
async function checkAPIEndpoints(results) {
  console.log('Checking API endpoints...');
  
  const apiItem = results.find(item => item.id === 'api-security');
  
  try {
    // Check for API rate limiting
    const apiFiles = await findFiles('api|endpoint');
    const apiContent = apiFiles.map(file => fs.readFileSync(file, 'utf8')).join('\n');
    
    if (!apiContent.includes('rate') && !apiContent.includes('limit') && !apiContent.includes('throttle')) {
      apiItem.details.push({
        level: 'medium',
        message: 'No API rate limiting detected',
        fix: 'Implement rate limiting on all API endpoints',
      });
    }
    
    // Check for API validation
    if (!apiContent.includes('validate') && !apiContent.includes('schema')) {
      apiItem.details.push({
        level: 'high',
        message: 'Input validation may be missing from API endpoints',
        fix: 'Add input validation for all API parameters',
      });
    }
    
    // Check for proper authentication on endpoints
    const endpointFiles = await findFiles('endpoint');
    
    for (const file of endpointFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const endpoints = content.match(/@router\.[a-z]+\(['"]\/?[^'"]+['"]/g) || [];
      
      for (const endpoint of endpoints) {
        // Skip authentication endpoints
        if (endpoint.includes('login') || endpoint.includes('register')) {
          continue;
        }
        
        // Check if endpoint has authentication
        if (!content.includes('authenticate') && !content.includes('auth_required') && 
            !content.includes('JWT') && !content.includes('token') && !content.includes('Depends')) {
          apiItem.details.push({
            level: 'high',
            message: `Endpoint in ${path.basename(file)} may not have authentication`,
            fix: 'Add authentication middleware to all secure endpoints',
            location: file,
          });
          break;
        }
      }
    }
    
    // Update status
    if (apiItem.details.length === 0) {
      apiItem.status = 'passed';
    } else {
      apiItem.status = apiItem.details.some(d => d.level === 'high') ? 'failed' : 'warning';
    }
  } catch (error) {
    console.error('Error checking API endpoints:', error);
    apiItem.status = 'error';
    apiItem.details.push({
      level: 'error',
      message: `Error checking API endpoints: ${error.message}`,
    });
  }
}

// Check input validation
async function checkInputValidation(results) {
  console.log('Checking input validation...');
  
  const validationItem = results.find(item => item.id === 'data-validation');
  
  try {
    // Check frontend form validation
    const formFiles = await findFiles('form');
    let formValidationMissing = false;
    
    for (const file of formFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      if (content.includes('<form') || content.includes('onSubmit')) {
        if (!content.includes('validate') && !content.includes('validation') && 
            !content.includes('yup') && !content.includes('formik') && 
            !content.includes('required') && !content.includes('pattern')) {
          validationItem.details.push({
            level: 'medium',
            message: `Form in ${path.basename(file)} may be missing validation`,
            fix: 'Add client-side validation to all forms',
            location: file,
          });
          formValidationMissing = true;
        }
      }
    }
    
    // Check backend schema validation
    const schemaFiles = await findFiles('schema|model');
    let schemaValidationMissing = false;
    
    for (const file of schemaFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      if ((file.endsWith('.py') && content.includes('class') && content.includes('model')) ||
          (file.endsWith('.js') && content.includes('Schema'))) {
        if (!content.includes('validate') && !content.includes('validator') && 
            !content.includes('required') && !content.includes('min') && 
            !content.includes('max') && !content.includes('pattern')) {
          validationItem.details.push({
            level: 'high',
            message: `Schema in ${path.basename(file)} may be missing validation`,
            fix: 'Add comprehensive validation rules to all data schemas',
            location: file,
          });
          schemaValidationMissing = true;
        }
      }
    }
    
    // Update status
    if (validationItem.details.length === 0) {
      validationItem.status = 'passed';
    } else {
      validationItem.status = validationItem.details.some(d => d.level === 'high') ? 'failed' : 'warning';
    }
  } catch (error) {
    console.error('Error checking input validation:', error);
    validationItem.status = 'error';
    validationItem.details.push({
      level: 'error',
      message: `Error checking input validation: ${error.message}`,
    });
  }
}

// Check XSS protection
async function checkXSSProtection(results) {
  console.log('Checking XSS protection...');
  
  const xssItem = results.find(item => item.id === 'xss-protection');
  
  try {
    // Check Next.js config for XSS protection
    let nextConfigPath = path.join(process.cwd(), 'frontend', 'next.config.js');
    if (fs.existsSync(nextConfigPath)) {
      const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
      
      if (!nextConfig.includes('Content-Security-Policy') && !nextConfig.includes('securityHeaders')) {
        xssItem.details.push({
          level: 'high',
          message: 'Content Security Policy (CSP) not found in Next.js configuration',
          fix: 'Add Content Security Policy to Next.js headers configuration',
          location: nextConfigPath,
        });
      }
    }
    
    // Check for dangerouslySetInnerHTML usage without sanitization
    const jsxFiles = await findFiles('js|jsx|ts|tsx');
    
    for (const file of jsxFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      if (content.includes('dangerouslySetInnerHTML') && 
          (!content.includes('sanitize') && !content.includes('DOMPurify') && !content.includes('xss'))) {
        xssItem.details.push({
          level: 'high',
          message: `Unsanitized dangerouslySetInnerHTML in ${path.basename(file)}`,
          fix: 'Use DOMPurify to sanitize all HTML content before rendering',
          location: file,
        });
      }
    }
    
    // Check backend for HTML sanitization
    const apiFiles = await findFiles('api|endpoint');
    const apiContent = apiFiles.map(file => fs.readFileSync(file, 'utf8')).join('\n');
    
    if (apiContent.includes('html') && !apiContent.includes('sanitize') && !apiContent.includes('escape')) {
      xssItem.details.push({
        level: 'medium',
        message: 'HTML content may not be sanitized in API responses',
        fix: 'Implement HTML sanitization for all user-generated content in API responses',
      });
    }
    
    // Update status
    if (xssItem.details.length === 0) {
      xssItem.status = 'passed';
    } else {
      xssItem.status = xssItem.details.some(d => d.level === 'high') ? 'failed' : 'warning';
    }
  } catch (error) {
    console.error('Error checking XSS protection:', error);
    xssItem.status = 'error';
    xssItem.details.push({
      level: 'error',
      message: `Error checking XSS protection: ${error.message}`,
    });
  }
}

// Check CSRF protection
async function checkCSRFProtection(results) {
  console.log('Checking CSRF protection...');
  
  const csrfItem = results.find(item => item.id === 'csrf-protection');
  
  try {
    // Check for CSRF token implementation
    const authFiles = await findFiles('auth|token|csrf');
    let csrfImplemented = false;
    
    for (const file of authFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      if (content.includes('csrf') || content.includes('CSRF') || 
          content.includes('_csrf') || content.includes('xsrf')) {
        csrfImplemented = true;
        break;
      }
    }
    
    if (!csrfImplemented) {
      csrfItem.details.push({
        level: 'high',
        message: 'CSRF protection may not be implemented',
        fix: 'Implement CSRF tokens for all state-changing operations',
      });
    }
    
    // Check for SameSite cookie attribute
    const cookieFiles = await findFiles('cookie');
    let sameSiteFound = false;
    
    for (const file of cookieFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      if (content.includes('sameSite') || content.includes('SameSite')) {
        sameSiteFound = true;
        break;
      }
    }
    
    if (!sameSiteFound) {
      csrfItem.details.push({
        level: 'medium',
        message: 'SameSite cookie attribute may not be set',
        fix: 'Set SameSite=Strict or SameSite=Lax for all cookies',
      });
    }
    
    // Update status
    if (csrfItem.details.length === 0) {
      csrfItem.status = 'passed';
    } else {
      csrfItem.status = csrfItem.details.some(d => d.level === 'high') ? 'failed' : 'warning';
    }
  } catch (error) {
    console.error('Error checking CSRF protection:', error);
    csrfItem.status = 'error';
    csrfItem.details.push({
      level: 'error',
      message: `Error checking CSRF protection: ${error.message}`,
    });
  }
}

// Check secure HTTP headers
async function checkSecureHeaders(results) {
  console.log('Checking secure HTTP headers...');
  
  const headersItem = results.find(item => item.id === 'secure-headers');
  
  try {
    // Check Next.js headers configuration
    let securityHeadersImplemented = false;
    let nextConfigPath = path.join(process.cwd(), 'frontend', 'next.config.js');
    
    if (fs.existsSync(nextConfigPath)) {
      const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
      
      if (nextConfig.includes('headers()')) {
        securityHeadersImplemented = true;
        
        // Check for specific security headers
        const requiredHeaders = [
          'X-Content-Type-Options',
          'X-Frame-Options',
          'X-XSS-Protection',
          'Strict-Transport-Security',
          'Content-Security-Policy',
          'Referrer-Policy',
        ];
        
        for (const header of requiredHeaders) {
          if (!nextConfig.includes(header)) {
            headersItem.details.push({
              level: 'medium',
              message: `${header} header may be missing`,
              fix: `Add ${header} header to Next.js configuration`,
              location: nextConfigPath,
            });
          }
        }
      }
    }
    
    // Check FastAPI headers configuration
    let fastApiHeadersImplemented = false;
    const apiFiles = await findFiles('app\\/main\\.py');
    
    for (const file of apiFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      if (content.includes('CORSMiddleware')) {
        fastApiHeadersImplemented = true;
        
        // Check for unsafe CORS configuration
        if (content.includes('allow_origins=["*"]') || content.includes("allow_origins=['*']")) {
          headersItem.details.push({
            level: 'high',
            message: 'CORS is configured to allow all origins',
            fix: 'Restrict CORS to specific trusted origins',
            location: file,
          });
        }
      }
    }
    
    if (!securityHeadersImplemented && !fastApiHeadersImplemented) {
      headersItem.details.push({
        level: 'high',
        message: 'Security headers may not be implemented',
        fix: 'Implement security headers in frontend and backend',
      });
    }
    
    // Update status
    if (headersItem.details.length === 0) {
      headersItem.status = 'passed';
    } else {
      headersItem.status = headersItem.details.some(d => d.level === 'high') ? 'failed' : 'warning';
    }
  } catch (error) {
    console.error('Error checking secure headers:', error);
    headersItem.status = 'error';
    headersItem.details.push({
      level: 'error',
      message: `Error checking secure headers: ${error.message}`,
    });
  }
}

// Check sensitive data handling
async function checkSensitiveDataHandling(results) {
  console.log('Checking sensitive data handling...');
  
  const sensitiveDataItem = results.find(item => item.id === 'sensitive-data');
  
  try {
    // Check for hardcoded secrets
    const allFiles = await findFiles('js|jsx|ts|tsx|py|json');
    const sensitivePatterns = [
      /(api|jwt|auth|secret|token|password|credential).*?['"]([a-zA-Z0-9_\-=+\/<>]{16,})['"]/, // API keys, tokens
      /sk_live_[a-zA-Z0-9]{24,}/, // Stripe keys
      /AIza[a-zA-Z0-9_\-]{35}/, // Google API keys
      /ssh-rsa AAAA[0-9A-Za-z+\/]+/, // SSH keys
      /-----BEGIN( RSA)? PRIVATE KEY-----/, // Private keys
      /https?:\/\/[^/]*:[^@]*@/, // URLs with credentials
    ];
    
    // Exclude certain files
    const excludePatterns = ['test', 'spec', 'mock', 'example', '.env.example'];
    
    for (const file of allFiles) {
      if (excludePatterns.some(pattern => file.includes(pattern))) {
        continue;
      }
      
      const content = fs.readFileSync(file, 'utf8');
      
      for (const pattern of sensitivePatterns) {
        const match = content.match(pattern);
        
        if (match) {
          sensitiveDataItem.details.push({
            level: 'high',
            message: `Potential hardcoded secret in ${path.basename(file)}`,
            fix: 'Move secrets to environment variables',
            location: file,
          });
          break;
        }
      }
    }
    
    // Check for HTTPS usage
    const apiUrlFiles = await findFiles('api\\.js|config\\.js|axios');
    let httpsUsed = false;
    
    for (const file of apiUrlFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      if (content.includes('http://') && !content.includes('localhost') && !content.includes('127.0.0.1')) {
        sensitiveDataItem.details.push({
          level: 'high',
          message: `Insecure HTTP URL in ${path.basename(file)}`,
          fix: 'Use HTTPS for all external API requests',
          location: file,
        });
      } else if (content.includes('https://')) {
        httpsUsed = true;
      }
    }
    
    // Check for secure cookie usage
    const cookieFiles = await findFiles('cookie');
    let secureHttpOnlyFound = false;
    
    for (const file of cookieFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      if (content.includes('secure') && content.includes('httpOnly')) {
        secureHttpOnlyFound = true;
      } else if (content.includes('cookie') || content.includes('Cookie')) {
        sensitiveDataItem.details.push({
          level: 'medium',
          message: `Cookies in ${path.basename(file)} may not be properly secured`,
          fix: 'Set secure and httpOnly flags for all cookies',
          location: file,
        });
      }
    }
    
    // Update status
    if (sensitiveDataItem.details.length === 0) {
      sensitiveDataItem.status = 'passed';
    } else {
      sensitiveDataItem.status = sensitiveDataItem.details.some(d => d.level === 'high') ? 'failed' : 'warning';
    }
  } catch (error) {
    console.error('Error checking sensitive data handling:', error);
    sensitiveDataItem.status = 'error';
    sensitiveDataItem.details.push({
      level: 'error',
      message: `Error checking sensitive data handling: ${error.message}`,
    });
  }
}

// Check dependencies for vulnerabilities
async function checkDependencies(results) {
  console.log('Checking dependencies for vulnerabilities...');
  
  const dependencyItem = results.find(item => item.id === 'dependency-check');
  
  try {
    // Check for package.json
    const rootPackageJsonPath = path.join(process.cwd(), 'package.json');
    const frontendPackageJsonPath = path.join(process.cwd(), 'frontend', 'package.json');
    
    let packageJsonExists = false;
    let packageJsonFilePath = null;
    
    if (fs.existsSync(rootPackageJsonPath)) {
      packageJsonExists = true;
      packageJsonFilePath = rootPackageJsonPath;
    } else if (fs.existsSync(frontendPackageJsonPath)) {
      packageJsonExists = true;
      packageJsonFilePath = frontendPackageJsonPath;
    }
    
    if (packageJsonExists) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonFilePath, 'utf8'));
      
      // Check for outdated dependencies
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };
      
      // List of known vulnerable packages and safe versions
      const vulnerablePackages = {
        'node-fetch': '< 2.6.7',
        'axios': '< 0.21.2',
        'lodash': '< 4.17.21',
        'minimist': '< 1.2.6',
        'moment': '< 2.29.2',
        'react-dom': '< 16.3.3',
        'tar': '< 6.1.9',
        'trim-newlines': '< 3.0.1',
        'ansi-regex': '< 5.0.1',
      };
      
      for (const [pkg, version] of Object.entries(dependencies)) {
        if (vulnerablePackages[pkg]) {
          const cleanVersion = version.replace(/[^\d.]/g, '');
          
          if (isVersionLessThan(cleanVersion, vulnerablePackages[pkg].replace('< ', ''))) {
            dependencyItem.details.push({
              level: 'high',
              message: `Vulnerable package: ${pkg}@${version}`,
              fix: `Update ${pkg} to a version >= ${vulnerablePackages[pkg].replace('< ', '')}`,
            });
          }
        }
      }
    }
    
    // Check for requirements.txt
    const requirementsPath = path.join(process.cwd(), 'requirements.txt');
    
    if (fs.existsSync(requirementsPath)) {
      const requirements = fs.readFileSync(requirementsPath, 'utf8').split('\n');
      
      // List of known vulnerable Python packages and safe versions
      const vulnerablePythonPackages = {
        'django': '< 3.2.14',
        'flask': '< 2.0.3',
        'jinja2': '< 2.11.3',
        'pillow': '< 9.0.1',
        'cryptography': '< 3.3.2',
        'urllib3': '< 1.26.5',
        'sqlalchemy': '< 1.4.0',
        'pyjwt': '< 2.0.1',
      };
      
      for (const req of requirements) {
        if (!req || req.startsWith('#')) continue;
        
        const [pkg, version] = req.split('==');
        const pkgLower = pkg.toLowerCase().trim();
        
        if (vulnerablePythonPackages[pkgLower] && version) {
          if (isVersionLessThan(version, vulnerablePythonPackages[pkgLower].replace('< ', ''))) {
            dependencyItem.details.push({
              level: 'high',
              message: `Vulnerable Python package: ${pkg}==${version}`,
              fix: `Update ${pkg} to a version >= ${vulnerablePythonPackages[pkgLower].replace('< ', '')}`,
            });
          }
        }
      }
    }
    
    // Update status
    if (dependencyItem.details.length === 0) {
      dependencyItem.status = 'passed';
    } else {
      dependencyItem.status = dependencyItem.details.some(d => d.level === 'high') ? 'failed' : 'warning';
    }
  } catch (error) {
    console.error('Error checking dependencies:', error);
    dependencyItem.status = 'error';
    dependencyItem.details.push({
      level: 'error',
      message: `Error checking dependencies: ${error.message}`,
    });
  }
}

// Check error handling
async function checkErrorHandling(results) {
  console.log('Checking error handling...');
  
  const errorHandlingItem = results.find(item => item.id === 'error-handling');
  
  try {
    // Check for global error handling
    const appFiles = await findFiles('app\\.js|_app\\.js|main\\.py');
    let globalErrorHandlingFound = false;
    
    for (const file of appFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      if ((file.endsWith('.js') && (content.includes('ErrorBoundary') || content.includes('try {') || 
                                   content.includes('catch ('))) ||
          (file.endsWith('.py') && (content.includes('except ') || content.includes('try:')))) {
        globalErrorHandlingFound = true;
        break;
      }
    }
    
    if (!globalErrorHandlingFound) {
      errorHandlingItem.details.push({
        level: 'medium',
        message: 'Global error handling may not be implemented',
        fix: 'Implement global error handling to catch and process all errors',
      });
    }
    
    // Check for sensitive information in error responses
    const apiFiles = await findFiles('api|endpoint|route');
    
    for (const file of apiFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      if ((file.endsWith('.js') && content.includes('error.stack')) ||
          (file.endsWith('.py') && content.includes('traceback.format_exc()'))) {
        errorHandlingItem.details.push({
          level: 'high',
          message: `Potential sensitive error details exposure in ${path.basename(file)}`,
          fix: 'Do not include stack traces or detailed error information in production responses',
          location: file,
        });
      }
    }
    
    // Update status
    if (errorHandlingItem.details.length === 0) {
      errorHandlingItem.status = 'passed';
    } else {
      errorHandlingItem.status = errorHandlingItem.details.some(d => d.level === 'high') ? 'failed' : 'warning';
    }
  } catch (error) {
    console.error('Error checking error handling:', error);
    errorHandlingItem.status = 'error';
    errorHandlingItem.details.push({
      level: 'error',
      message: `Error checking error handling: ${error.message}`,
    });
  }
}

// Check access control
async function checkAccessControl(results) {
  console.log('Checking access control...');
  
  const accessControlItem = results.find(item => item.id === 'access-control');
  
  try {
    // Check for role-based access control
    const authFiles = await findFiles('auth|role|permission|access');
    let rbacImplemented = false;
    
    for (const file of authFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      if (content.includes('role') || content.includes('permission') || 
          content.includes('access') || content.includes('authorize')) {
        rbacImplemented = true;
        break;
      }
    }
    
    if (!rbacImplemented) {
      accessControlItem.details.push({
        level: 'high',
        message: 'Role-based access control may not be implemented',
        fix: 'Implement proper role and permission checks',
      });
    }
    
    // Check for proper authorization in API endpoints
    const endpointFiles = await findFiles('endpoint|controller|route');
    
    for (const file of endpointFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      if (!content.includes('admin') && !content.includes('role') && 
          !content.includes('permission') && !content.includes('authorize')) {
        accessControlItem.details.push({
          level: 'medium',
          message: `Endpoint in ${path.basename(file)} may not check for proper authorization`,
          fix: 'Implement role-based access controls for all sensitive operations',
          location: file,
        });
      }
    }
    
    // Update status
    if (accessControlItem.details.length === 0) {
      accessControlItem.status = 'passed';
    } else {
      accessControlItem.status = accessControlItem.details.some(d => d.level === 'high') ? 'failed' : 'warning';
    }
  } catch (error) {
    console.error('Error checking access control:', error);
    accessControlItem.status = 'error';
    accessControlItem.details.push({
      level: 'error',
      message: `Error checking access control: ${error.message}`,
    });
  }
}

// Generate security report
function generateSecurityReport(results, resultsDir) {
  console.log('\nGenerating security report...');
  
  let markdown = `# Auto AGI Builder - Security Audit Report
Generated on ${new Date().toLocaleString()}

## Summary

This report provides security insights and recommendations for the Auto AGI Builder application.

`;

  // Add summary table
  markdown += `| Check | Status | Description |\n`;
  markdown += `| ----- | ------ | ----------- |\n`;
  
  results.forEach(item => {
    const statusEmoji = item.status === 'passed' ? '✅' : 
                       item.status === 'warning' ? '⚠️' : 
                       item.status === 'failed' ? '❌' : '❓';
    
    markdown += `| ${item.name} | ${statusEmoji} ${item.status} | ${item.description} |\n`;
  });
  
  markdown += `\n## Detailed Findings\n\n`;
  
  // Add detailed findings
  results.forEach(item => {
    if (item.details.length === 0 && item.status === 'passed') {
      return;
    }
    
    markdown += `### ${item.name}\n\n`;
    markdown += `**Status**: ${item.status}\n\n`;
    
    if (item.details.length === 0) {
      markdown += `No issues found.\n\n`;
    } else {
      markdown += `Issues found:\n\n`;
      
      item.details.forEach(detail => {
        const levelEmoji = detail.level === 'high' ? '🔴' : 
                          detail.level === 'medium' ? '🟠' : 
                          detail.level === 'low' ? '🟡' : '⚪';
        
        markdown += `${levelEmoji} **${detail.level.toUpperCase()}**: ${detail.message}\n`;
        if (detail.fix) {
          markdown += `   - Fix: ${detail.fix}\n`;
        }
        if (detail.location) {
          markdown += `   - Location: ${detail.location}\n`;
        }
        markdown += `\n`;
      });
    }
  });
  
  // Add recommendations and implementation plan
  markdown += `## Security Recommendations\n\n`;
  markdown += `Based on the findings, the following security improvements are recommended:\n\n`;
  
  const highPriorityFixes = results
    .flatMap(item => item.details.filter(d => d.level === 'high'))
    .map(d => d.fix);
  
  const mediumPriorityFixes = results
    .flatMap(item => item.details.filter(d => d.level === 'medium'))
    .map(d => d.fix);
  
  if (highPriorityFixes.length > 0) {
    markdown += `### High Priority Fixes\n\n`;
    
    // Remove duplicates
    [...new Set(highPriorityFixes)].forEach(fix => {
      markdown += `- ${fix}\n`;
    });
    
    markdown += `\n`;
  }
  
  if (mediumPriorityFixes.length > 0) {
    markdown += `### Medium Priority Fixes\n\n`;
    
    // Remove duplicates
    [...new Set(mediumPriorityFixes)].forEach(fix => {
      markdown += `- ${fix}\n`;
    });
    
    markdown += `\n`;
  }
  
  // Add implementation plan
  markdown += `## Implementation Plan\n\n`;
  markdown += `1. **Address High-Risk Issues Immediately**
   - Fix authentication vulnerabilities
   - Secure API endpoints
   - Remove any hardcoded secrets
   - Implement proper input validation

2. **Implement Security Headers**
   - Add Content Security Policy
   - Configure HTTPS and HSTS
   - Implement proper CORS policy
   - Add XSS protection headers

3. **Enhance Access Controls**
   - Implement role-based access control
   - Add proper authorization checks
   - Secure sensitive operations

4. **Improve Error Handling**
   - Implement global error handling
   - Remove sensitive information from error responses
   - Add logging for security events

5. **Update Dependencies**
   - Update all packages with known vulnerabilities
   - Implement dependency scanning in CI/CD pipeline
   - Set up automatic security updates
`;

  // Save report
  const reportPath = path.join(resultsDir, 'security-audit-report.md');
  fs.writeFileSync(reportPath, markdown);
  
  console.log(`Security report saved to: ${reportPath}`);
}

// Implement security fixes
async function implementSecurityFixes(results) {
  console.log('\nImplementing critical security fixes...');
  
  // Implement security headers
  implementSecurityHeaders();
  
  // Implement proper CORS policy
  implementCorsPolicy();
  
  // Add missing authentication checks
  implementAuthChecks();
  
  // Add input validation
  implementInputValidation();
  
  console.log('Critical security fixes implemented successfully.');
}

// Implement security headers
function implementSecurityHeaders() {
  console.log('Implementing security headers...');
  
  const nextConfigPath = path.join(process.cwd(), 'frontend', 'next.config.js');
  
  if (!fs.existsSync(nextConfigPath)) {
    console.log('Next.js config file not found. Skipping security headers implementation.');
    return;
  }
  
  const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
  
  // Check if headers are already implemented
  if (nextConfig.includes('Content-Security-Policy') || nextConfig.includes('securityHeaders')) {
    console.log('Security headers already implemented.');
    return;
  }
  
  // Add security headers to Next.js config
  const securityHeaders = `
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://*.vercel.app",
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },`;
  
  // Insert headers into Next.js config
  let updatedConfig = nextConfig.replace(
    'module.exports = {',
    `module.exports = {
  ${securityHeaders}`
  );
  
  fs.writeFileSync(nextConfigPath, updatedConfig);
  console.log('Security headers added to Next.js config.');
}

// Implement proper CORS policy
function implementCorsPolicy() {
  console.log('Implementing proper CORS policy...');
  
  const mainPyPath = path.join(process.cwd(), 'app', 'main.py');
  
  if (!fs.existsSync(mainPyPath)) {
    console.log('FastAPI main.py file not found. Skipping CORS implementation.');
    return;
  }
  
  const mainPy = fs.readFileSync(mainPyPath, 'utf8');
  
  // Check if CORS is already properly implemented
  if (mainPy.includes('allow_origins=[') && !mainPy.includes('allow_origins=["*"]') && 
      !mainPy.includes("allow_origins=['*']")) {
    console.log('Proper CORS policy already implemented.');
    return;
  }
  
  // Update CORS policy in main.py
  let updatedMainPy = mainPy;
  
  if (mainPy.includes('CORSMiddleware')) {
    // Replace existing CORS configuration
    updatedMainPy = mainPy.replace(
      /app\.add_middleware\(\s*CORSMiddleware\s*,[^)]*\)/s,
      `app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://auto-agi-builder.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)`
    );
  } else {
    // Add new CORS configuration
    updatedMainPy = mainPy.replace(
      /(from fastapi import [^]*)/,
      `$1
from fastapi.middleware.cors import CORSMiddleware`
    ).replace(
      /(app = FastAPI\([^)]*\))/,
      `$1

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://auto-agi-builder.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)`
    );
  }
  
  fs.writeFileSync(mainPyPath, updatedMainPy);
  console.log('Proper CORS policy implemented.');
}

// Add missing authentication checks
function implementAuthChecks() {
  console.log('Implementing missing authentication checks...');
  
  // For simplicity, we'll create a reusable auth middleware
  const authMiddlewarePath = path.join(process.cwd(), 'frontend', 'middleware', 'auth.js');
  
  // Create middleware directory if it doesn't exist
  const middlewareDir = path.dirname(authMiddlewarePath);
  if (!fs.existsSync(middlewareDir)) {
    fs.mkdirSync(middlewareDir, { recursive: true });
  }
  
  // Create auth middleware
  const authMiddlewareContent = `/**
 * Authentication middleware for Auto AGI Builder
 */

import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Public paths that don't require authentication
const publicPaths = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
];

/**
 * Higher-order component for protecting routes
 * @param {React.Component} Component - The component to wrap
 * @returns {React.Component} - The protected component
 */
export function withAuth(Component) {
  const ProtectedRoute = (props) => {
    const router = useRouter();
    const { isAuthenticated, loading } = useAuth();
    
    useEffect(() => {
      // Check if the path is public
      const isPublicPath = publicPaths.some(path => 
        router.pathname === path ||
        router.pathname.startsWith('/api/')
      );
      
      // Redirect to login if not authenticated and not on a public path
      if (!loading && !isAuthenticated && !isPublicPath) {
        router.push('/auth/login?redirect=' + encodeURIComponent(router.asPath));
      }
    }, [router, isAuthenticated, loading]);
    
    // Show loading state
    if (loading) {
      return <div>Loading...</div>;
    }
    
    // Return the component if authenticated or on public path
    return <Component {...props} />;
  };
  
  // Copy getInitialProps if it exists
  if (Component.getInitialProps) {
    ProtectedRoute.getInitialProps = Component.getInitialProps;
  }
  
  return ProtectedRoute;
}

/**
 * Check if user has required permissions
 * @param {string[]} requiredPermissions - Required permissions
 * @returns {boolean} - Whether the user has the required permissions
 */
export function hasPermission(requiredPermissions) {
  const { user } = useAuth();
  
  if (!user || !user.permissions) {
    return false;
  }
  
  return requiredPermissions.every(permission => 
    user.permissions.includes(permission)
  );
}

/**
 * Higher-order component for role-based access control
 * @param {React.Component} Component - The component to wrap
 * @param {string[]} requiredPermissions - Required permissions
 * @returns {React.Component} - The protected component
 */
export function withPermission(Component, requiredPermissions) {
  return function PermissionProtectedRoute(props) {
    const router = useRouter();
    const hasRequiredPermission = hasPermission(requiredPermissions);
    
    useEffect(() => {
      if (!hasRequiredPermission) {
        router.push('/dashboard?error=insufficient_permissions');
      }
    }, [router, hasRequiredPermission]);
    
    if (!hasRequiredPermission) {
      return <div>You don't have permission to access this page.</div>;
    }
    
    return <Component {...props} />;
  };
}
`;
  
  fs.writeFileSync(authMiddlewarePath, authMiddlewareContent);
  console.log('Authentication middleware created.');
  
  // Now let's update _app.js to use this middleware
  const appJsPath = path.join(process.cwd(), 'frontend', 'pages', '_app.js');
  
  if (fs.existsSync(appJsPath)) {
    const appJs = fs.readFileSync(appJsPath, 'utf8');
    
    if (!appJs.includes('withAuth')) {
      // Add withAuth to _app.js
      let updatedAppJs = appJs;
      
      if (appJs.includes('export default')) {
        // Replace export default
        updatedAppJs = appJs.replace(
          /export default (\w+)/,
          `import { withAuth } from '../middleware/auth';\n\nexport default withAuth($1)`
        );
      } else {
        // Append withAuth
        updatedAppJs += `\n\nimport { withAuth } from '../middleware/auth';\nexport default withAuth(MyApp);\n`;
      }
      
      fs.writeFileSync(appJsPath, updatedAppJs);
      console.log('Authentication added to _app.js.');
    } else {
      console.log('Authentication already implemented in _app.js.');
    }
  }
}

// Add input validation
function implementInputValidation() {
  console.log('Implementing input validation...');
  
  // Create validation utility
  const validationUtilPath = path.join(process.cwd(), 'frontend', 'utils', 'validation.js');
  
  // Create utils directory if it doesn't exist
  const utilsDir = path.dirname(validationUtilPath);
  if (!fs.existsSync(utilsDir)) {
    fs.mkdirSync(utilsDir, { recursive: true });
  }
  
  // Create validation utility
  const validationUtilContent = `/**
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
      errors[field] = \`\${rules.label || field} is required\`;
      return;
    }
    
    // Skip other checks if empty and not required
    if (!value) return;
    
    // Minimum length
    if (rules.minLength && value.length < rules.minLength) {
      errors[field] = \`\${rules.label || field} must be at least \${rules.minLength} characters\`;
      return;
    }
    
    // Maximum length
    if (rules.maxLength && value.length > rules.maxLength) {
      errors[field] = \`\${rules.label || field} must be at most \${rules.maxLength} characters\`;
      return;
    }
    
    // Pattern matching
    if (rules.pattern && !rules.pattern.test(value)) {
      errors[field] = rules.patternError || \`\${rules.label || field} is invalid\`;
      return;
    }
    
    // Email validation
    if (rules.type === 'email' && !isValidEmail(value)) {
      errors[field] = \`\${rules.label || field} must be a valid email\`;
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
`;
  
  fs.writeFileSync(validationUtilPath, validationUtilContent);
  console.log('Validation utility created.');
}

// Helper function to find files matching a regex pattern
async function findFiles(pattern) {
  return new Promise((resolve, reject) => {
    const command = process.platform === 'win32'
      ? `powershell -Command "Get-ChildItem -Path . -Recurse -File | Where-Object { $_.Name -match '${pattern}' } | Select-Object -ExpandProperty FullName"`
      : `find . -type f -regextype posix-extended -regex '.*${pattern}.*' | grep -v 'node_modules' | grep -v '.git'`;
    
    exec(command, (error, stdout) => {
      if (error && error.code !== 1) { // grep returns 1 if no matches, but we don't want to fail in that case
        return reject(error);
      }
      
      resolve(stdout.trim().split('\n').filter(Boolean));
    });
  });
}

// Helper function to compare versions
function isVersionLessThan(version1, version2) {
  const v1Parts = version1.split('.').map(Number);
  const v2Parts = version2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;
    
    if (v1Part < v2Part) {
      return true;
    } else if (v1Part > v2Part) {
      return false;
    }
  }
  
  return false;
}

// Main module exports
module.exports = {
  runSecurityAudit,
  implementSecurityFixes,
};

// Run if executed directly
if (require.main === module) {
  runSecurityAudit().catch(error => {
    console.error('Error running security audit:', error);
    process.exit(1);
  });
}
