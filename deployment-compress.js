#!/usr/bin/env node
/**
 * Auto AGI Builder - Deployment Compression Script
 * 
 * This script integrates the middle-out compression algorithm into the
 * deployment pipeline for Auto AGI Builder. It compresses large files
 * before deployment to reduce size and enhance performance.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const config = require('./compression-config.js');

// ANSI color codes for console output
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

// Configuration
const DEFAULT_ENV = 'production';
const OUTPUT_DIR = './compressed-deploy';
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');
const LOG_FILE = `./compression-deploy-log-${TIMESTAMP}.log`;

/**
 * Log message to console and file
 */
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}`;

  // Append to log file
  fs.appendFileSync(LOG_FILE, logMessage + '\n');

  // Format console output
  switch (type) {
    case 'success':
      console.log(`${COLORS.green}✓ ${message}${COLORS.reset}`);
      break;
    case 'error':
      console.log(`${COLORS.red}✗ ${message}${COLORS.reset}`);
      break;
    case 'warning':
      console.log(`${COLORS.yellow}⚠ ${message}${COLORS.reset}`);
      break;
    case 'header':
      console.log(`\n${COLORS.cyan}${COLORS.bold}=== ${message} ===${COLORS.reset}\n`);
      break;
    case 'step':
      console.log(`${COLORS.blue}→ ${message}${COLORS.reset}`);
      break;
    default:
      console.log(`${message}`);
  }
}

/**
 * Initialize the compression log
 */
function initializeLog() {
  const header = `
=============================================================
AUTO AGI BUILDER - DEPLOYMENT COMPRESSION LOG
=============================================================
Date: ${new Date().toISOString()}
Environment: ${process.env.NODE_ENV || DEFAULT_ENV}
=============================================================
`;

  // Create or clear the log file
  fs.writeFileSync(LOG_FILE, header + '\n');
}

/**
 * Get total size of a directory recursively
 */
function getTotalSize(dirPath, excludes = []) {
  let totalSize = 0;

  function processDirectory(directory) {
    const files = fs.readdirSync(directory);
    
    for (const file of files) {
      const filePath = path.join(directory, file);
      
      // Skip if file/dir matches exclude pattern
      if (excludes.some(pattern => {
        if (pattern.includes('*')) {
          const regex = new RegExp(pattern.replace('*', '.*'));
          return regex.test(file);
        }
        return file === pattern;
      })) {
        continue;
      }
      
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        processDirectory(filePath);
      } else {
        totalSize += stats.size;
      }
    }
  }
  
  processDirectory(dirPath);
  return totalSize;
}

/**
 * Find large files that exceed a certain size threshold
 */
function findLargeFiles(directoryPath, threshold = 500 * 1024, excludes = []) {
  const largeFiles = [];
  
  function processDirectory(directory) {
    const files = fs.readdirSync(directory);
    
    for (const file of files) {
      const filePath = path.join(directory, file);
      
      // Skip if file/dir matches exclude pattern
      if (excludes.some(pattern => {
        if (pattern.includes('*')) {
          const regex = new RegExp(pattern.replace('*', '.*'));
          return regex.test(file);
        }
        return file === pattern;
      })) {
        continue;
      }
      
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        processDirectory(filePath);
      } else if (stats.size > threshold) {
        largeFiles.push({
          path: filePath,
          size: stats.size,
          lastModified: stats.mtime
        });
      }
    }
  }
  
  processDirectory(directoryPath);
  return largeFiles;
}

/**
 * Run the middle-out compression on specified files
 */
function compressFiles(files, compressionLevel = 'medium') {
  log(`Compressing ${files.length} files with ${compressionLevel} compression...`, 'step');
  
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  let totalOriginalSize = 0;
  let totalCompressedSize = 0;
  
  for (const file of files) {
    try {
      const fileContent = fs.readFileSync(file.path, 'utf8');
      totalOriginalSize += file.size;
      
      // Execute middle-out compression
      const outputPath = path.join(OUTPUT_DIR, path.basename(file.path));
      
      // Call middle-out-compress.js with appropriate parameters
      const command = `node middle-out-compress.js --file="${file.path}" --output="${outputPath}" --level=${compressionLevel}`;
      
      execSync(command);
      
      // Get compressed size
      const compressedStats = fs.statSync(outputPath);
      totalCompressedSize += compressedStats.size;
      
      const compressionRatio = ((file.size - compressedStats.size) / file.size * 100).toFixed(2);
      log(`Compressed ${file.path} (${compressionRatio}% reduction)`, 'success');
      
    } catch (error) {
      log(`Error compressing ${file.path}: ${error.message}`, 'error');
    }
  }
  
  // Calculate overall compression stats
  if (totalOriginalSize > 0) {
    const overallRatio = ((totalOriginalSize - totalCompressedSize) / totalOriginalSize * 100).toFixed(2);
    log(`Overall compression: ${overallRatio}% reduction (${formatBytes(totalOriginalSize)} → ${formatBytes(totalCompressedSize)})`, 'header');
  }
}

/**
 * Format bytes to human-readable format
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

/**
 * Run the deployment compression
 */
async function runDeploymentCompression() {
  // Initialize logging
  initializeLog();
  log('Starting deployment compression...', 'header');
  
  // Determine environment
  const env = process.env.NODE_ENV || DEFAULT_ENV;
  log(`Environment: ${env}`, 'info');
  
  // Get configuration for this environment
  const envConfig = config[env] || config.production;
  
  if (!envConfig.enabled) {
    log(`Compression disabled for ${env} environment`, 'warning');
    return true;
  }
  
  log(`Compression level: ${envConfig.level}`, 'info');
  
  // Process each path
  for (const dirPath of envConfig.paths) {
    log(`Processing directory: ${dirPath}`, 'step');
    
    try {
      const dirSize = getTotalSize(dirPath, envConfig.excludes);
      log(`Total size: ${formatBytes(dirSize)}`, 'info');
      
      // Find large files that might need compression
      const largeFiles = findLargeFiles(dirPath, 100 * 1024, envConfig.excludes);
      log(`Found ${largeFiles.length} large files`, 'info');
      
      if (largeFiles.length > 0) {
        // Sort by size (largest first)
        largeFiles.sort((a, b) => b.size - a.size);
        
        // Log the top 5 largest files
        log('Largest files:', 'info');
        largeFiles.slice(0, 5).forEach((file, index) => {
          log(`${index + 1}. ${file.path} (${formatBytes(file.size)})`, 'info');
        });
        
        // Compress files
        compressFiles(largeFiles, envConfig.level);
      } else {
        log('No large files found that require compression', 'info');
      }
    } catch (error) {
      log(`Error processing ${dirPath}: ${error.message}`, 'error');
    }
  }
  
  log('Deployment compression completed', 'header');
  log(`Compressed files saved to: ${OUTPUT_DIR}`, 'info');
  log(`Full compression log: ${LOG_FILE}`, 'info');
  
  return true;
}

// Run the compression if the script is called directly
if (require.main === module) {
  runDeploymentCompression()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      log(`Deployment compression failed: ${error.message}`, 'error');
      process.exit(1);
    });
}

// Export for use in other scripts
module.exports = {
  runDeploymentCompression
};
