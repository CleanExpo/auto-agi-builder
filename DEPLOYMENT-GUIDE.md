# Auto AGI Builder - Comprehensive Deployment Guide

This guide provides detailed instructions and best practices for deploying the Auto AGI Builder application using the enhanced deployment tools and workflows.

## Table of Contents

1. [Deployment Architecture](#deployment-architecture)
2. [Deployment Tools](#deployment-tools)
3. [Deployment Process](#deployment-process)
4. [CI/CD Workflow](#cicd-workflow)
5. [Deployment Verification](#deployment-verification)
6. [Rollback Procedures](#rollback-procedures)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

## Deployment Architecture

The Auto AGI Builder uses a frontend-first deployment approach with the following architecture:

- **Frontend**: Next.js static export deployed to Vercel
- **Backend**: (Optional) Python FastAPI backend deployed separately
- **CI/CD**: GitHub Actions for automated testing and deployment
- **Monitoring**: Post-deployment verification and monitoring

### Environments

- **Development**: Local development environment
- **Staging**: Pre-production testing environment
- **Canary**: Production environment with limited traffic (10%)
- **Production**: Main production environment

## Deployment Tools

The deployment toolkit includes:

1. **fresh-deploy.bat** - Script for clean deployment setup and configuration
2. **github-actions-ci-cd.yml** - CI/CD workflow configuration
3. **verify-deployment.js** - Post-deployment verification script
4. **run-diagnostic.bat** - Deployment diagnostic tool

## Deployment Process

### Quick Start

For a quick deployment using the deployment script:

```bash
# Run the fresh deployment script
./fresh-deploy.bat

# After deployment, verify the deployment
node verify-deployment.js
```

### Manual Deployment Steps

1. **Prepare the Next.js configuration**:
   ```javascript
   // next.config.js
   const nextConfig = {
     output: 'export',
     distDir: 'out',
     images: {
       domains: [],
       deviceSizes: [640, 750, 828, 1080, 1200, 1920],
       imageSizes: [16, 32, 48, 64, 96, 128, 256],
       formats: ['image/webp'],
       minimumCacheTTL: 60,
     },
     // Additional optimization settings
   };
   ```

2. **Configure Vercel settings**:
   ```json
   {
     "version": 2,
     "buildCommand": "npm run build",
     "outputDirectory": "frontend/out",
     "framework": "nextjs",
     "regions": ["sfo1"],
     "headers": [
       {
         "source": "/static/(.*)",
         "headers": [
           {
             "key": "Cache-Control",
             "value": "public, max-age=31536000, immutable"
           }
         ]
       }
     ]
   }
   ```

3. **Clean existing configuration**:
   ```bash
   # Remove any existing .vercel directory
   rm -rf .vercel
   ```

4. **Deploy to Vercel**:
   ```bash
   # Using the Vercel CLI
   vercel --prod
   ```

5. **Verify the deployment**:
   ```bash
   # Run verification script
   node verify-deployment.js
   ```

## CI/CD Workflow

The CI/CD workflow automates the testing and deployment process through GitHub Actions.

### Workflow Stages

1. **Frontend CI**:
   - Linting
   - Unit tests
   - Build
   - Bundle analysis

2. **End-to-End Testing**:
   - Playwright tests for critical user journeys

3. **Backend CI**:
   - Unit tests with pytest
   - Coverage reporting

4. **Performance Testing**:
   - Lighthouse performance testing
   - Performance metrics validation

5. **Deployment Pipeline**:
   - Staging deployment from develop branch
   - Canary deployment (10% traffic) from main branch
   - Production deployment from main branch after canary validation

### Triggering the Workflow

- Push to `develop` branch: Triggers staging deployment
- Push to `main` branch: Triggers canary + production deployment
- Manual trigger: Available through GitHub Actions UI

## Deployment Verification

The deployment verification script (`verify-deployment.js`) performs several checks:

1. **Accessibility**: Verifies that the site is accessible and responds with 200 OK
2. **Critical Pages**: Checks that important pages (home, dashboard, projects) are accessible
3. **Performance**: Validates performance metrics against thresholds

### Running Verification

```bash
# Verify production deployment
node verify-deployment.js production

# Verify staging deployment
node verify-deployment.js staging

# Verify local deployment
node verify-deployment.js local
```

## Rollback Procedures

In case of deployment issues, you can rollback to the previous version:

### Automatic Rollback

The CI/CD workflow includes automatic rollback capabilities that trigger when the production deployment fails.

### Manual Rollback

```bash
# Using Vercel CLI
vercel rollback --prod

# Using the rollback script in CI/CD
./rollback-deployment.bat
```

## Troubleshooting

Common deployment issues and their solutions:

### 1. Build Failures

**Issue**: The Next.js build process fails.

**Solution**:
- Check the build logs for specific errors
- Verify dependencies in package.json
- Ensure Next.js configuration is correct

### 2. Deployment Connection Issues

**Issue**: Unable to connect to Vercel.

**Solution**:
- Verify Vercel CLI authentication
- Check for `.vercel` directory issues
- Run `vercel login` to refresh authentication

### 3. Performance Issues

**Issue**: Deployment verification fails due to performance issues.

**Solution**:
- Check bundle sizes using bundle analyzer
- Optimize image loading with Next.js Image component
- Review and optimize client-side code

### 4. 404 Errors After Deployment

**Issue**: Pages return 404 errors after deployment.

**Solution**:
- Verify routing configuration in Next.js
- Check for proper static export settings
- Ensure `next.config.js` has `output: 'export'` set

## Best Practices

### Environment Configuration

- Use `.env.production` for production environment variables
- Keep sensitive information in Vercel environment variables, not in code
- Use different environment configurations for staging and production

### Deployment Strategy

- Always test in staging before deploying to production
- Use canary deployments for major changes
- Implement feature flags for risky features

### Performance Optimization

- Enable image optimization in Next.js
- Configure proper caching headers
- Use tree shaking and dead code elimination
- Implement code splitting and lazy loading

### Monitoring

- Set up alerts for deployment failures
- Monitor performance metrics after deployment
- Create dashboards for tracking deployment status

---

## Appendix: Reference Commands

### Deployment Commands

```bash
# Fresh deployment
./fresh-deploy.bat

# Diagnostic run
./run-diagnostic.bat

# Verify deployment
node verify-deployment.js

# Deploy to Vercel
vercel --prod
```

### CI/CD Commands

```bash
# Manually trigger workflow from GitHub CLI
gh workflow run ci_cd.yml -f environment=staging

# View workflow runs
gh run list --workflow=ci_cd.yml
```

### Utility Commands

```bash
# Check Vercel CLI version
vercel --version

# Login to Vercel
vercel login

# Check project status
vercel project ls
