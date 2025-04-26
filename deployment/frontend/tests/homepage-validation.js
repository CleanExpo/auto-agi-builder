/**
 * Homepage Validation Utility
 * 
 * This script validates that the homepage implementation is complete and functioning according
 * to the specifications outlined in the Sequential Thinking MCP methodology.
 * 
 * Run this script with: npm run validate-homepage
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

console.log(chalk.blue.bold('\n🔍 AUTO AGI BUILDER HOMEPAGE VALIDATION\n'));

// Required files for complete implementation
const requiredFiles = [
  { path: 'frontend/pages/index.js', name: 'Homepage' },
  { path: 'frontend/components/home/HeroSection.js', name: 'Hero Section' },
  { path: 'frontend/components/home/FeatureSection.js', name: 'Feature Section' },
  { path: 'frontend/components/home/QuickStartForm.js', name: 'Quick Start Form' },
  { path: 'frontend/components/home/TestimonialSection.js', name: 'Testimonial Section' },
  { path: 'frontend/components/home/PricingSection.js', name: 'Pricing Section' },
  { path: 'frontend/components/home/CallToAction.js', name: 'Call to Action' },
  { path: 'frontend/components/projects/ProjectCard.js', name: 'Project Card' },
];

// Required functionality checkers
const functionalityChecks = [
  { 
    name: 'Authentication State Management',
    test: (fileContent) => {
      return fileContent.includes('isAuthenticated') && 
             fileContent.includes('useAuth') &&
             (fileContent.includes('AuthenticatedContent') || fileContent.includes('UnauthenticatedContent'));
    },
    filePath: 'frontend/pages/index.js'
  },
  {
    name: 'Project Management',
    test: (fileContent) => {
      return fileContent.includes('projects') && 
             fileContent.includes('createProject') &&
             fileContent.includes('useProject');
    },
    filePath: 'frontend/pages/index.js'
  },
  {
    name: 'User Interface Management',
    test: (fileContent) => {
      return fileContent.includes('showModal') && fileContent.includes('useUI');
    },
    filePath: 'frontend/pages/index.js'
  },
  {
    name: 'Recent Projects Loading',
    test: (fileContent) => {
      return fileContent.includes('recentProjects') && 
             fileContent.includes('setRecentProjects') &&
             fileContent.includes('projectsLoading');
    },
    filePath: 'frontend/pages/index.js'
  },
  {
    name: 'Quick Start Project Creation',
    test: (fileContent) => {
      return fileContent.includes('handleQuickStart') && 
             fileContent.includes('onSubmit={handleQuickStart}');
    },
    filePath: 'frontend/pages/index.js'
  },
  {
    name: 'Form Validation',
    test: (fileContent) => {
      return fileContent.includes('validateForm') && 
             fileContent.includes('validationErrors');
    },
    filePath: 'frontend/components/home/QuickStartForm.js'
  },
  {
    name: 'Project Card Actions',
    test: (fileContent) => {
      return fileContent.includes('handleDelete') && 
             fileContent.includes('showActions');
    },
    filePath: 'frontend/components/projects/ProjectCard.js'
  },
  {
    name: 'Analytics Integration',
    test: (fileContent) => {
      return fileContent.includes('trackPageView');
    },
    filePath: 'frontend/pages/index.js'
  },
  {
    name: 'Dark Mode Support',
    test: (fileContent) => {
      return fileContent.includes('dark:bg-') || fileContent.includes('dark:text-');
    },
    filePath: 'frontend/pages/index.js'
  }
];

// Check required files
console.log(chalk.yellow('Checking required files...'));
let filesMissing = false;
requiredFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file.path);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${chalk.green(file.name)}: Found at ${file.path}`);
  } else {
    console.log(`❌ ${chalk.red(file.name)}: Missing at ${file.path}`);
    filesMissing = true;
  }
});

if (filesMissing) {
  console.log(chalk.red('\n❌ ERROR: Some required files are missing. Please implement all required components.\n'));
  process.exit(1);
}

// Check functionality
console.log(chalk.yellow('\nChecking required functionality...'));

let functionalityMissing = false;
functionalityChecks.forEach(check => {
  const filePath = path.join(process.cwd(), check.filePath);
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    if (check.test(fileContent)) {
      console.log(`✅ ${chalk.green(check.name)}: Implemented correctly`);
    } else {
      console.log(`❌ ${chalk.red(check.name)}: Not properly implemented in ${check.filePath}`);
      functionalityMissing = true;
    }
  } catch (error) {
    console.log(`❌ ${chalk.red(check.name)}: Error reading file ${check.filePath}`);
    functionalityMissing = true;
  }
});

if (functionalityMissing) {
  console.log(chalk.red('\n❌ ERROR: Some required functionality is missing. Please fix the issues above.\n'));
  process.exit(1);
}

// Final report
console.log(chalk.green('\n✅ SUCCESS: Homepage implementation is complete!\n'));
console.log('Next steps:');
console.log(chalk.blue('1. Run the development server: npm run dev'));
console.log(chalk.blue('2. Open http://localhost:3000 to view the homepage'));
console.log(chalk.blue('3. Test both authenticated and unauthenticated views'));
console.log(chalk.blue('4. Verify responsive behavior on different screen sizes'));
console.log(chalk.blue('5. Deploy to Vercel using the scripts/redeploy.sh script\n'));

console.log(chalk.green('For deployment to Vercel:'));
console.log('Run the following commands:');
console.log(chalk.blue('1. npm run build'));
console.log(chalk.blue('2. npm run scripts/deployment_checklist.js'));
console.log(chalk.blue('3. ./scripts/redeploy.sh\n'));

console.log(chalk.yellow('Documentation:'));
console.log('For more information about the homepage implementation, refer to:');
console.log(chalk.blue('- saas-cookbook.md'));
console.log(chalk.blue('- data-flow-diagram.md'));
console.log(chalk.blue('- docs/vercel_troubleshooting.md\n'));
