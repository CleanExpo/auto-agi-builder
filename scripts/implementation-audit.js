#!/usr/bin/env node

/**
 * Implementation Audit Tool for Auto AGI Builder
 * 
 * This script analyzes the project structure and code to generate a comprehensive
 * report on implementation completeness, missing components, and provides
 * recommendations for filling implementation gaps.
 * 
 * Usage:
 *   node scripts/implementation-audit.js [options]
 * 
 * Options:
 *   --verbose         Show detailed information
 *   --format=json     Output in JSON format (default is markdown)
 *   --output=file     Write to file instead of stdout
 *   --section=name    Audit only a specific section
 */

const fs = require('fs');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);
const readFile = util.promisify(fs.readFile);

// Configuration
const CONFIG = {
  rootDir: path.resolve(__dirname, '..'),
  featuresDefinitionFile: path.resolve(__dirname, '../project-tracker.json'),
  outputFormat: 'markdown', // or 'json'
  verbose: false,
  outputFile: null,
  sectionFilter: null
};

// Parse command line arguments
process.argv.slice(2).forEach(arg => {
  if (arg === '--verbose') {
    CONFIG.verbose = true;
  } else if (arg.startsWith('--format=')) {
    CONFIG.outputFormat = arg.split('=')[1];
  } else if (arg.startsWith('--output=')) {
    CONFIG.outputFile = arg.split('=')[1];
  } else if (arg.startsWith('--section=')) {
    CONFIG.sectionFilter = arg.split('=')[1];
  }
});

/**
 * Feature implementation criteria definitions
 */
const IMPLEMENTATION_CRITERIA = {
  // Core System Features
  authentication: {
    requiredFiles: [
      'frontend/components/auth/ProtectedRoute.js',
      'frontend/contexts/AuthContext.js',
      'frontend/pages/auth/login.js',
      'frontend/pages/auth/register.js',
      'app/core/auth/jwt.py'
    ],
    requiredFunctions: [
      { file: 'frontend/contexts/AuthContext.js', patterns: ['login', 'logout', 'register'] },
      { file: 'app/core/auth/jwt.py', patterns: ['create_access_token', 'get_current_user'] }
    ]
  },
  projectManagement: {
    requiredFiles: [
      'frontend/contexts/ProjectContext.js',
      'frontend/pages/projects/index.js',
      'frontend/pages/projects/[id].js',
      'frontend/components/common/modals/ProjectFormModal.js'
    ],
    requiredFunctions: [
      { file: 'frontend/contexts/ProjectContext.js', patterns: ['createProject', 'updateProject', 'deleteProject'] }
    ]
  },
  requirements: {
    requiredFiles: [
      'frontend/pages/requirements.js',
      'frontend/components/requirements/RequirementsList.js',
      'frontend/components/requirements/RequirementForm.js',
      'app/api/v1/endpoints/requirements.py'
    ],
    requiredFunctions: [
      { file: 'app/api/v1/endpoints/requirements.py', patterns: ['create_requirement', 'update_requirement', 'delete_requirement'] }
    ]
  },
  documentAnalysis: {
    requiredFiles: [
      'frontend/pages/documents.js',
      'frontend/components/documents/DocumentUploader.js',
      'frontend/components/documents/DocumentAnalyzer.js',
      'app/api/document_import.py'
    ],
    requiredFunctions: [
      { file: 'app/api/document_import.py', patterns: ['process_document'] }
    ]
  },
  prototype: {
    requiredFiles: [
      'frontend/pages/prototype.js',
      'frontend/components/prototype/PrototypeGenerator.js',
      'frontend/components/prototype/PrototypeViewer.js',
      'app/api/v1/endpoints/prototype.py'
    ],
    requiredFunctions: [
      { file: 'app/api/v1/endpoints/prototype.py', patterns: ['generate_prototype'] }
    ]
  },
  devicePreview: {
    requiredFiles: [
      'frontend/pages/device-preview.js',
      'frontend/components/device_preview/DevicePreview.js',
      'frontend/components/device_preview/DeviceControl.js',
      'frontend/components/device_preview/DeviceFrame.js'
    ]
  },
  roi: {
    requiredFiles: [
      'frontend/pages/roi.js',
      'frontend/components/ROI/BusinessMetricsForm.js',
      'frontend/components/ROI/ROIParameters.js',
      'frontend/components/ROI/ROIResults.js',
      'app/api/v1/endpoints/roi.py'
    ],
    requiredFunctions: [
      { file: 'app/api/v1/endpoints/roi.py', patterns: ['calculate_roi'] }
    ]
  },
  roadmap: {
    requiredFiles: [
      'frontend/pages/roadmap.js',
      'frontend/components/roadmap/RoadmapVisualizer.js',
      'frontend/components/roadmap/TimelineControls.js',
      'frontend/components/roadmap/ProjectSelector.js'
    ]
  },
  
  // User Experience Features
  userExperience: {
    requiredFiles: [
      'frontend/components/common/ErrorBoundary.js',
      'frontend/components/common/ErrorMessage.js',
      'frontend/components/common/ModalContainer.js',
      'frontend/components/common/NotificationsContainer.js',
      'frontend/components/common/UserFeedback.js',
      'frontend/utils/accessibility.js'
    ]
  },
  analytics: {
    requiredFiles: [
      'frontend/utils/analytics.js',
      'frontend/components/common/AnalyticsConsent.js',
      'docs/analytics_implementation.md'
    ]
  },
  
  // Infrastructure Features
  deployment: {
    requiredFiles: [
      'frontend/next.config.js',
      'scripts/redeploy.sh',
      'scripts/redeploy.bat',
      'docs/vercel_troubleshooting.md',
      'README-vercel-deployment.md'
    ]
  },
  testing: {
    requiredFiles: [
      'frontend/jest.config.js',
      'frontend/jest.setup.js',
      'playwright.config.js',
      'e2e-tests/homepage.spec.js'
    ]
  },
  documentation: {
    requiredFiles: [
      'docs/production_deployment.md',
      'docs/testing_and_verification.md',
      'docs/monitoring_and_analytics.md'
    ]
  },
  errorHandling: {
    requiredFiles: [
      'app/core/error_handling.py',
      'frontend/utils/errorHandling.js',
      'docs/handling_network_errors.md'
    ]
  },
  dataValidation: {
    requiredFiles: [
      'app/schemas/export.py'
    ],
    patterns: [
      { dirs: ['app/schemas'], filePattern: /\.py$/, contentPattern: /class.*BaseModel/ }
    ]
  }
};

/**
 * Check if a file exists and is a file (not a directory)
 */
async function fileExists(filePath) {
  try {
    const stats = await stat(filePath);
    return stats.isFile();
  } catch (error) {
    return false;
  }
}

/**
 * Check if a directory exists
 */
async function directoryExists(dirPath) {
  try {
    const stats = await stat(dirPath);
    return stats.isDirectory();
  } catch (error) {
    return false;
  }
}

/**
 * Search for a pattern in a file
 */
async function fileContainsPattern(filePath, pattern) {
  try {
    const content = await readFile(filePath, 'utf8');
    return content.includes(pattern) || (pattern instanceof RegExp && pattern.test(content));
  } catch (error) {
    return false;
  }
}

/**
 * Find files matching a pattern within directories
 */
async function findFilesMatchingPattern(baseDirs, filePattern, contentPattern = null) {
  let matches = [];

  for (const dir of baseDirs) {
    const dirPath = path.join(CONFIG.rootDir, dir);
    if (!(await directoryExists(dirPath))) continue;

    const processDirectory = async (currentPath) => {
      try {
        const entries = await readdir(currentPath, { withFileTypes: true });
        
        for (const entry of entries) {
          const entryPath = path.join(currentPath, entry.name);
          
          if (entry.isDirectory()) {
            await processDirectory(entryPath);
          } else if (entry.isFile() && filePattern.test(entry.name)) {
            if (!contentPattern) {
              matches.push(entryPath);
            } else {
              const containsPattern = await fileContainsPattern(entryPath, contentPattern);
              if (containsPattern) {
                matches.push(entryPath);
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error processing directory ${currentPath}:`, error);
      }
    };

    await processDirectory(dirPath);
  }

  return matches;
}

/**
 * Check implementation of a feature
 */
async function checkFeatureImplementation(featureName, criteria) {
  const result = {
    name: featureName,
    implemented: true,
    missingFiles: [],
    missingFunctions: [],
    implementationPercentage: 100,
    patterns: [],
    details: {}
  };

  // Check required files
  if (criteria.requiredFiles) {
    for (const file of criteria.requiredFiles) {
      const filePath = path.join(CONFIG.rootDir, file);
      const exists = await fileExists(filePath);
      
      if (!exists) {
        result.implemented = false;
        result.missingFiles.push(file);
      }
      
      result.details[file] = exists;
    }
  }

  // Check required functions
  if (criteria.requiredFunctions) {
    for (const funcDef of criteria.requiredFunctions) {
      const filePath = path.join(CONFIG.rootDir, funcDef.file);
      if (await fileExists(filePath)) {
        const content = await readFile(filePath, 'utf8');
        
        for (const pattern of funcDef.patterns) {
          const functionExists = content.includes(pattern);
          
          if (!functionExists) {
            result.implemented = false;
            result.missingFunctions.push(`${funcDef.file}:${pattern}`);
          }
          
          result.details[`${funcDef.file}:${pattern}`] = functionExists;
        }
      } else {
        // File doesn't exist, so neither do any of the functions
        for (const pattern of funcDef.patterns) {
          result.implemented = false;
          result.missingFunctions.push(`${funcDef.file}:${pattern}`);
          result.details[`${funcDef.file}:${pattern}`] = false;
        }
      }
    }
  }

  // Check pattern matches if any
  if (criteria.patterns) {
    for (const pattern of criteria.patterns) {
      try {
        const matches = await findFilesMatchingPattern(
          pattern.dirs,
          pattern.filePattern,
          pattern.contentPattern
        );
        
        result.patterns.push({
          description: `${pattern.dirs.join(', ')} (${pattern.filePattern})`,
          matches: matches.map(m => path.relative(CONFIG.rootDir, m)),
          implemented: matches.length > 0
        });
        
        if (matches.length === 0) {
          result.implemented = false;
        }
      } catch (error) {
        console.error(`Error processing pattern for ${featureName}:`, error);
      }
    }
  }

  // Calculate implementation percentage
  const totalChecks = (criteria.requiredFiles?.length || 0) +
                      (criteria.requiredFunctions?.flatMap(f => f.patterns)?.length || 0) +
                      (criteria.patterns?.length || 0);
  
  const missingItems = result.missingFiles.length + result.missingFunctions.length +
                      result.patterns.filter(p => !p.implemented).length;
  
  result.implementationPercentage = totalChecks > 0
    ? Math.round(((totalChecks - missingItems) / totalChecks) * 100)
    : 100;

  return result;
}

/**
 * Generate a detailed feature audit report
 */
async function generateFeatureAuditReport() {
  const results = {};
  let totalPercentage = 0;
  let featureCount = 0;
  
  for (const [featureName, criteria] of Object.entries(IMPLEMENTATION_CRITERIA)) {
    if (CONFIG.sectionFilter && CONFIG.sectionFilter !== featureName) continue;
    
    if (CONFIG.verbose) {
      console.log(`Checking implementation of ${featureName}...`);
    }
    
    results[featureName] = await checkFeatureImplementation(featureName, criteria);
    totalPercentage += results[featureName].implementationPercentage;
    featureCount++;
  }
  
  const averageImplementation = featureCount > 0 ? Math.round(totalPercentage / featureCount) : 0;
  
  return {
    timestamp: new Date().toISOString(),
    overallImplementation: averageImplementation,
    features: results
  };
}

/**
 * Format the audit report as Markdown
 */
function formatReportAsMarkdown(report) {
  const { overallImplementation, features, timestamp } = report;
  
  let markdown = `# Auto AGI Builder Implementation Audit Report\n\n`;
  markdown += `*Generated on: ${new Date(timestamp).toLocaleString()}*\n\n`;
  markdown += `## Overall Implementation: ${overallImplementation}%\n\n`;
  
  // Summary table
  markdown += `## Implementation Summary\n\n`;
  markdown += `| Feature | Status | Implementation |\n`;
  markdown += `|---------|--------|----------------|\n`;
  
  Object.values(features).sort((a, b) => b.implementationPercentage - a.implementationPercentage).forEach(feature => {
    const status = feature.implemented ? '✅ Complete' : feature.implementationPercentage > 0 ? '⚠️ Partial' : '❌ Missing';
    markdown += `| ${feature.name} | ${status} | ${feature.implementationPercentage}% |\n`;
  });
  
  // Detailed breakdown
  markdown += `\n## Detailed Feature Analysis\n\n`;
  
  Object.values(features).forEach(feature => {
    markdown += `### ${feature.name} (${feature.implementationPercentage}%)\n\n`;
    
    if (feature.implemented) {
      markdown += `✅ Fully implemented\n\n`;
    } else {
      if (feature.missingFiles.length > 0) {
        markdown += `#### Missing Files\n\n`;
        feature.missingFiles.forEach(file => {
          markdown += `- \`${file}\`\n`;
        });
        markdown += `\n`;
      }
      
      if (feature.missingFunctions.length > 0) {
        markdown += `#### Missing Functions\n\n`;
        feature.missingFunctions.forEach(func => {
          markdown += `- \`${func}\`\n`;
        });
        markdown += `\n`;
      }
      
      if (feature.patterns && feature.patterns.some(p => !p.implemented)) {
        markdown += `#### Missing Patterns\n\n`;
        feature.patterns.filter(p => !p.implemented).forEach(pattern => {
          markdown += `- No matches found for: ${pattern.description}\n`;
        });
        markdown += `\n`;
      }
    }
    
    if (CONFIG.verbose && feature.patterns && feature.patterns.some(p => p.implemented)) {
      markdown += `#### Pattern Matches\n\n`;
      feature.patterns.filter(p => p.implemented).forEach(pattern => {
        markdown += `- **${pattern.description}**:\n`;
        pattern.matches.forEach(match => {
          markdown += `  - \`${match}\`\n`;
        });
      });
      markdown += `\n`;
    }
  });
  
  // Implementation recommendations
  markdown += `\n## Implementation Recommendations\n\n`;
  
  // Group features by implementation status
  const incomplete = Object.values(features).filter(f => !f.implemented);
  
  if (incomplete.length === 0) {
    markdown += `🎉 Congratulations! All features are fully implemented.\n`;
  } else {
    markdown += `The following features need attention:\n\n`;
    
    // Sort by implementation percentage (ascending)
    incomplete.sort((a, b) => a.implementationPercentage - b.implementationPercentage);
    
    incomplete.forEach(feature => {
      markdown += `### ${feature.name} (${feature.implementationPercentage}%)\n\n`;
      
      // Missing files recommendations
      if (feature.missingFiles.length > 0) {
        markdown += `#### Create the following files:\n\n`;
        feature.missingFiles.forEach(file => {
          markdown += `- \`${file}\`\n`;
        });
        markdown += `\n`;
      }
      
      // Missing functions recommendations
      if (feature.missingFunctions.length > 0) {
        markdown += `#### Implement the following functions:\n\n`;
        feature.missingFunctions.forEach(func => {
          const [file, funcName] = func.split(':');
          markdown += `- \`${funcName}\` in \`${file}\`\n`;
        });
        markdown += `\n`;
      }
    });
  }
  
  return markdown;
}

/**
 * Main function
 */
async function main() {
  try {
    if (CONFIG.verbose) {
      console.log(`Starting implementation audit in ${CONFIG.rootDir}...`);
    }
    
    // Generate the audit report
    const report = await generateFeatureAuditReport();
    
    // Format the report
    let output;
    if (CONFIG.outputFormat === 'json') {
      output = JSON.stringify(report, null, 2);
    } else {
      output = formatReportAsMarkdown(report);
    }
    
    // Output the report
    if (CONFIG.outputFile) {
      fs.writeFileSync(CONFIG.outputFile, output);
      console.log(`Report written to ${CONFIG.outputFile}`);
    } else {
      console.log(output);
    }
    
  } catch (error) {
    console.error('Error generating audit report:', error);
    process.exit(1);
  }
}

main();
