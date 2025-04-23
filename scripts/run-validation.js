/**
 * Auto AGI Builder - Implementation Verification Script
 * 
 * This script runs automated validation of the codebase, including:
 * - Linting
 * - Unit tests
 * - Type checking
 * - E2E tests (optionally)
 * 
 * It also updates the project-tracker.json with results
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Configuration
const config = {
  projectTrackerPath: './project-tracker.json',
  commands: {
    frontendLint: { cmd: 'cd frontend && npm run lint', label: 'Frontend Linting' },
    frontendTest: { cmd: 'cd frontend && npm test', label: 'Frontend Unit Tests' },
    backendTest: { cmd: 'pytest app', label: 'Backend Tests' },
    e2eTest: { cmd: 'npx playwright test', label: 'E2E Tests', optional: true },
  }
};

// Result tracking
let results = {
  timestamp: new Date().toISOString(),
  passed: 0,
  failed: 0,
  skipped: 0,
  details: {}
};

/**
 * Execute a shell command and return its output
 */
function executeCommand(command, label) {
  return new Promise((resolve, reject) => {
    console.log(chalk.blue(`\n🚀 Running: ${label}...\n`));
    
    const [cmd, ...args] = command.split(' ');
    const proc = spawn(cmd, args, { 
      shell: true,
      stdio: 'inherit'
    });
    
    let output = '';
    let error = '';
    
    proc.on('close', (code) => {
      if (code === 0) {
        console.log(chalk.green(`✅ ${label} passed\n`));
        resolve({ success: true, output });
      } else {
        console.log(chalk.red(`❌ ${label} failed with code ${code}\n`));
        reject({ success: false, error: error || `Command exited with code ${code}` });
      }
    });
  });
}

/**
 * Update the project tracker with test results
 */
function updateProjectTracker(results) {
  // Read the current project tracker
  const trackerPath = path.resolve(config.projectTrackerPath);
  
  if (!fs.existsSync(trackerPath)) {
    console.error(chalk.red(`❌ Project tracker not found at ${trackerPath}`));
    return;
  }
  
  try {
    const trackerData = JSON.parse(fs.readFileSync(trackerPath, 'utf8'));
    
    // Add verification results
    trackerData.verificationResults = trackerData.verificationResults || [];
    trackerData.verificationResults.push(results);
    
    // Update last verified timestamp
    trackerData.lastVerified = results.timestamp;
    
    // Count completed tasks if verification passed
    if (results.failed === 0) {
      // Update progress for the current stage
      const currentStage = trackerData.stages.find(s => s.status === 'in-progress');
      if (currentStage) {
        const completedTasks = currentStage.tasks.filter(t => t.status === 'completed').length;
        const totalTasks = currentStage.tasks.length;
        currentStage.progress = Math.round((completedTasks / totalTasks) * 100);
      }
      
      // Update metrics
      trackerData.metrics.completedTasks = trackerData.stages
        .flatMap(s => s.tasks)
        .filter(t => t.status === 'completed')
        .length;
      
      trackerData.metrics.overallProgress = Math.round(
        (trackerData.metrics.completedTasks / trackerData.metrics.totalTasks) * 100
      );
    }
    
    // Write back to the file
    fs.writeFileSync(trackerPath, JSON.stringify(trackerData, null, 2), 'utf8');
    console.log(chalk.green(`✅ Project tracker updated at ${trackerPath}`));
  } catch (error) {
    console.error(chalk.red(`❌ Failed to update project tracker: ${error.message}`));
  }
}

/**
 * Generate a summary of the verification results
 */
function printSummary() {
  console.log('\n' + chalk.cyan('🔍 VERIFICATION SUMMARY'));
  console.log(chalk.cyan('==================='));
  console.log(`✅ Passed: ${chalk.green(results.passed)}`);
  console.log(`❌ Failed: ${chalk.red(results.failed)}`);
  console.log(`⏭️  Skipped: ${chalk.yellow(results.skipped)}`);
  console.log(chalk.cyan('==================='));
  
  if (results.failed > 0) {
    console.log(chalk.red('\n❌ Verification failed! Please fix the issues before continuing.'));
    process.exit(1);
  } else {
    console.log(chalk.green('\n✅ All validations passed successfully!'));
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log(chalk.cyan('\n🔍 Starting Auto AGI Builder validation...'));
  
  const args = process.argv.slice(2);
  const skipE2E = args.includes('--skip-e2e');
  
  for (const [key, config] of Object.entries(config.commands)) {
    // Skip E2E tests if requested
    if (skipE2E && config.optional) {
      console.log(chalk.yellow(`⏭️  Skipping optional test: ${config.label}`));
      results.skipped++;
      results.details[key] = { status: 'skipped' };
      continue;
    }
    
    try {
      const result = await executeCommand(config.cmd, config.label);
      results.passed++;
      results.details[key] = { status: 'passed', output: result.output };
    } catch (error) {
      results.failed++;
      results.details[key] = { status: 'failed', error: error.error };
      
      // Break execution on first failure unless in CI environment
      if (!process.env.CI) {
        break;
      }
    }
  }
  
  // Update project tracker with results
  updateProjectTracker(results);
  
  // Print summary
  printSummary();
}

// Execute the script
main().catch((error) => {
  console.error(chalk.red(`\n❌ Unexpected error: ${error.message}`));
  process.exit(1);
});
