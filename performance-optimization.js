// Performance optimization script for Auto AGI Builder
// This script performs Lighthouse audits and implements performance improvements

const fs = require('fs');
const path = require('path');
const lighthouse = require('lighthouse');
const puppeteer = require('puppeteer');
const { exec } = require('child_process');

// Key pages to audit
const PAGES_TO_AUDIT = [
  '/',                      // Landing page
  '/dashboard',             // Dashboard
  '/requirements',          // Requirements page
  '/documents',             // Documents page
  '/prototype',             // Prototype page
  '/device-preview',        // Device preview page
  '/roi',                   // ROI page
  '/roadmap',               // Roadmap page
];

// Performance thresholds
const THRESHOLDS = {
  performance: 85,
  accessibility: 90,
  'best-practices': 85,
  seo: 90,
  pwa: 80,
};

// Main function to run performance audits
async function runPerformanceAudits() {
  console.log('===== Auto AGI Builder - Performance Optimization =====');
  
  const reports = [];
  const browser = await puppeteer.launch({ headless: true });
  
  try {
    // Create results directory if it doesn't exist
    const resultsDir = path.join(process.cwd(), 'lighthouse-results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    // Run Lighthouse audit for each page
    for (const page of PAGES_TO_AUDIT) {
      console.log(`\nAuditing page: ${page}`);
      
      const url = `http://localhost:3000${page}`;
      
      // Run Lighthouse audit
      const { lhr } = await lighthouse(url, {
        port: (new URL(browser.wsEndpoint())).port,
        output: 'json',
        logLevel: 'info',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
      });
      
      // Save report
      const reportPath = path.join(resultsDir, `${page.replace(/\//g, '-') || 'home'}.json`);
      fs.writeFileSync(reportPath, JSON.stringify(lhr, null, 2));
      
      // Log results
      console.log('Lighthouse scores:');
      Object.keys(lhr.categories).forEach(category => {
        const score = Math.round(lhr.categories[category].score * 100);
        const threshold = THRESHOLDS[category] || 80;
        const status = score >= threshold ? '✓' : '✗';
        console.log(`  ${category}: ${score}/100 ${status}`);
      });
      
      // Extract critical insights
      const insights = {
        page,
        scores: {},
        opportunities: [],
      };
      
      // Add scores
      Object.keys(lhr.categories).forEach(category => {
        insights.scores[category] = Math.round(lhr.categories[category].score * 100);
      });
      
      // Add opportunities for improvement
      lhr.audits['opportunities'].details?.items?.forEach(item => {
        insights.opportunities.push({
          title: item.title,
          description: item.description,
          savings: item.wastedBytes || item.wastedMs,
        });
      });
      
      reports.push(insights);
    }
    
    // Generate optimization recommendations
    generateOptimizationReport(reports, resultsDir);
    
  } catch (error) {
    console.error('Error running performance audits:', error);
  } finally {
    await browser.close();
  }
  
  console.log('\n===== Performance Optimization Complete =====');
}

// Generate optimization recommendations
function generateOptimizationReport(reports, resultsDir) {
  console.log('\nGenerating optimization recommendations...');
  
  let markdown = `# Auto AGI Builder - Performance Optimization Report
Generated on ${new Date().toLocaleString()}

## Summary

This report provides performance insights and recommendations for improving the Auto AGI Builder application.

`;

  // Add summary table
  markdown += `| Page | Performance | Accessibility | Best Practices | SEO | PWA |\n`;
  markdown += `| ---- | ----------- | ------------- | -------------- | --- | --- |\n`;
  
  reports.forEach(report => {
    const pageName = report.page === '/' ? 'Home' : report.page.replace('/', '');
    markdown += `| ${pageName} | ${report.scores.performance || 'N/A'} | ${report.scores.accessibility || 'N/A'} | ${report.scores['best-practices'] || 'N/A'} | ${report.scores.seo || 'N/A'} | ${report.scores.pwa || 'N/A'} |\n`;
  });
  
  markdown += `\n## Recommendations\n\n`;
  
  // Common optimization recommendations
  markdown += `### Global Optimizations\n\n`;
  markdown += `1. **Implement code splitting**
   - Split JavaScript bundles using dynamic imports
   - Lazy load non-critical components and routes

2. **Optimize image loading**
   - Use next/image component for optimized image loading
   - Implement WebP format with fallbacks
   - Add width and height attributes to all images

3. **Implement caching strategies**
   - Configure proper cache headers
   - Utilize service workers for offline support
   - Implement Redis caching for API responses

4. **Optimize third-party scripts**
   - Load non-critical scripts asynchronously
   - Defer analytics and tracking scripts
   - Use resource hints (preconnect, preload) for critical assets

5. **Improve Core Web Vitals**
   - Reduce Largest Contentful Paint (LCP) time
   - Minimize Cumulative Layout Shift (CLS)
   - Optimize First Input Delay (FID) and Total Blocking Time (TBT)

`;

  // Page-specific recommendations
  markdown += `### Page-Specific Optimizations\n\n`;
  
  reports.forEach(report => {
    const pageName = report.page === '/' ? 'Home' : report.page.replace('/', '');
    markdown += `#### ${pageName} Page\n\n`;
    
    if (report.scores.performance < THRESHOLDS.performance) {
      markdown += `- **Performance Score: ${report.scores.performance}** (Threshold: ${THRESHOLDS.performance})\n`;
      markdown += `  - Optimize render-blocking resources\n`;
      markdown += `  - Reduce unused JavaScript and CSS\n`;
      markdown += `  - Implement code splitting\n\n`;
    }
    
    if (report.scores.accessibility < THRESHOLDS.accessibility) {
      markdown += `- **Accessibility Score: ${report.scores.accessibility}** (Threshold: ${THRESHOLDS.accessibility})\n`;
      markdown += `  - Add proper ARIA attributes\n`;
      markdown += `  - Ensure sufficient color contrast\n`;
      markdown += `  - Add descriptive labels for form elements\n\n`;
    }
    
    if (report.opportunities && report.opportunities.length > 0) {
      markdown += `- **Specific Opportunities:**\n`;
      report.opportunities.slice(0, 3).forEach(opportunity => {
        markdown += `  - ${opportunity.title}\n`;
      });
      markdown += `\n`;
    }
  });
  
  // Implementation plan
  markdown += `## Implementation Plan\n\n`;
  markdown += `1. **Immediate Actions (High Impact / Low Effort)**
   - Optimize images across all pages
   - Fix render-blocking resources
   - Implement responsive loading for different viewports

2. **Short-Term Improvements (Within 1 Week)**
   - Implement code splitting for all routes
   - Add service worker for offline support
   - Configure CDN and caching policies

3. **Long-Term Optimizations (Within 1 Month)**
   - Refactor components for better performance
   - Implement SSR or static generation for critical pages
   - Optimize database queries and API endpoints

`;

  // Save report
  const reportPath = path.join(resultsDir, 'performance-optimization-report.md');
  fs.writeFileSync(reportPath, markdown);
  
  console.log(`Optimization report saved to: ${reportPath}`);
}

// Function to implement critical performance improvements
async function implementPerformanceImprovements() {
  console.log('\nImplementing critical performance improvements...');
  
  // Optimize Next.js configuration
  updateNextConfig();
  
  // Implement image optimization
  implementImageOptimization();
  
  // Add performance utility functions
  addPerformanceUtilities();
  
  console.log('Performance improvements implemented successfully.');
}

// Update Next.js configuration for better performance
function updateNextConfig() {
  console.log('Optimizing Next.js configuration...');
  
  try {
    const nextConfigPath = path.join(process.cwd(), 'frontend', 'next.config.js');
    let nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
    
    // Add performance optimizations if not already present
    if (!nextConfig.includes('compress') || !nextConfig.includes('swcMinify')) {
      nextConfig = nextConfig.replace(
        'module.exports = {',
        `module.exports = {
  swcMinify: true,
  compress: true,
  images: {
    domains: ['localhost'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60,
  },
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },`
      );
      
      fs.writeFileSync(nextConfigPath, nextConfig);
      console.log('Next.js configuration updated successfully.');
    } else {
      console.log('Next.js configuration already optimized.');
    }
  } catch (error) {
    console.error('Error updating Next.js configuration:', error);
  }
}

// Implement image optimization
function implementImageOptimization() {
  console.log('Implementing image optimization...');
  
  try {
    // Scan for image imports and references
    exec('find frontend -type f -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" | xargs grep -l "<img"', (error, stdout) => {
      if (error) {
        console.log('No direct img tags found or error scanning files.');
        return;
      }
      
      const files = stdout.trim().split('\n');
      
      files.forEach(file => {
        if (!file) return;
        
        const content = fs.readFileSync(file, 'utf8');
        
        // Replace <img> tags with next/image component
        const updatedContent = content.replace(
          /<img\s+([^>]*)\s*src=["']([^"']*)["'](.*?)>/g,
          (match, beforeSrc, src, afterSrc) => {
            // Skip if already using next/image
            if (beforeSrc.includes('Image') || content.includes('import Image')) {
              return match;
            }
            
            // Extract width and height if present
            const widthMatch = match.match(/width=["'](\d+)["']/);
            const heightMatch = match.match(/height=["'](\d+)["']/);
            
            const width = widthMatch ? widthMatch[1] : '500';
            const height = heightMatch ? heightMatch[1] : '300';
            
            // Add next/image import if not present
            let updatedContent = content;
            if (!updatedContent.includes('import Image')) {
              updatedContent = updatedContent.replace(
                /import\s.+?from\s["'][^"']+["'];/,
                match => `import Image from 'next/image';\n${match}`
              );
            }
            
            // Replace img tag with Image component
            return `<Image src="${src}" width={${width}} height={${height}} alt="" loading="lazy" ${afterSrc}>`;
          }
        );
        
        if (content !== updatedContent) {
          fs.writeFileSync(file, updatedContent);
          console.log(`Optimized images in: ${file}`);
        }
      });
    });
  } catch (error) {
    console.error('Error implementing image optimization:', error);
  }
}

// Add performance utility functions
function addPerformanceUtilities() {
  console.log('Adding performance utility functions...');
  
  const performanceUtilPath = path.join(process.cwd(), 'frontend', 'utils', 'performance.js');
  
  const utilContent = `/**
 * Performance utility functions for Auto AGI Builder
 */

/**
 * Memoizes a function to cache its results
 * @param {Function} fn - The function to memoize
 * @returns {Function} - The memoized function
 */
export const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

/**
 * Debounces a function to limit how often it can be called
 * @param {Function} fn - The function to debounce
 * @param {number} delay - The delay in milliseconds
 * @returns {Function} - The debounced function
 */
export const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

/**
 * Throttles a function to limit how often it can be called
 * @param {Function} fn - The function to throttle
 * @param {number} limit - The limit in milliseconds
 * @returns {Function} - The throttled function
 */
export const throttle = (fn, limit) => {
  let lastFunc;
  let lastRan;
  return (...args) => {
    if (!lastRan) {
      fn(...args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          fn(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

/**
 * Lazy loads an image and returns a promise that resolves when the image is loaded
 * @param {string} src - The image source URL
 * @returns {Promise} - A promise that resolves when the image is loaded
 */
export const lazyLoadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Prefetches a page to improve perceived performance
 * @param {string} href - The URL to prefetch
 */
export const prefetchPage = (href) => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
};

/**
 * Measures component render time using performance API
 * @param {string} componentName - The name of the component
 * @returns {object} - Functions to start and end timing
 */
export const measureRenderTime = (componentName) => {
  const startMark = \`\${componentName}-start\`;
  const endMark = \`\${componentName}-end\`;
  
  return {
    start: () => {
      if (typeof window !== 'undefined' && window.performance) {
        performance.mark(startMark);
      }
    },
    end: () => {
      if (typeof window !== 'undefined' && window.performance) {
        performance.mark(endMark);
        performance.measure(componentName, startMark, endMark);
        const measurements = performance.getEntriesByName(componentName);
        if (measurements.length > 0) {
          console.log(\`\${componentName} render time: \${measurements[0].duration.toFixed(2)}ms\`);
        }
        performance.clearMarks(startMark);
        performance.clearMarks(endMark);
        performance.clearMeasures(componentName);
      }
    },
  };
};

/**
 * Reports Core Web Vitals metrics
 */
export const reportWebVitals = () => {
  if (typeof window !== 'undefined' && 'web-vitals' in window) {
    import('web-vitals').then(({ getCLS, getFID, getLCP }) => {
      getCLS(metric => console.log('CLS:', metric.value));
      getFID(metric => console.log('FID:', metric.value));
      getLCP(metric => console.log('LCP:', metric.value));
    });
  }
};
`;

  fs.writeFileSync(performanceUtilPath, utilContent);
  console.log(`Performance utilities added to: ${performanceUtilPath}`);
}

// Main module exports
module.exports = {
  runPerformanceAudits,
  implementPerformanceImprovements,
};

// Run if executed directly
if (require.main === module) {
  // Check if Lighthouse and Puppeteer are installed
  try {
    require.resolve('lighthouse');
    require.resolve('puppeteer');
    
    // Check if dev server is running
    exec('curl -s http://localhost:3000', async (error) => {
      if (error) {
        console.error('Error: Development server is not running. Please start the server using "npm run dev" before running this script.');
        process.exit(1);
      }
      
      // Run performance audits and implement improvements
      await runPerformanceAudits();
      await implementPerformanceImprovements();
    });
  } catch (e) {
    console.error('Required dependencies not found. Please run:');
    console.error('npm install -D lighthouse puppeteer');
    process.exit(1);
  }
}
