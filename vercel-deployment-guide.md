# Auto AGI Builder - Vercel Deployment Guide

This guide provides step-by-step instructions for deploying the Auto AGI Builder application to Vercel.

## Prerequisites

1. Vercel account
2. GitHub repository with the Auto AGI Builder codebase
3. Node.js and npm installed

## Setup Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login
```

## Configuration

Ensure all environment variables are set up correctly:

1. Copy `.env.example` to `.env` and fill in all required values
2. Set up required environment variables in Vercel project settings:
   - `DATABASE_URL`: PostgreSQL connection string
   - `JWT_SECRET`: Secret for JWT token generation
   - `SENDGRID_API_KEY`: For email services
   - `API_BASE_URL`: Backend API URL for production

## Deployment Process

### Link Your Project

```bash
# In your project root directory
vercel link
```

### Deploy to Vercel

```bash
# Production deployment
vercel --prod
```

## Monitoring and Verification

1. Check deployment status and logs in the Vercel dashboard
2. Verify all API endpoints are functioning:
   - Authentication flows
   - Document processing
   - Requirements management
   - Prototype generation
   - ROI calculations
   - Roadmap visualization

3. Test multi-device previews and responsiveness

## Rollback Procedure

If issues are detected in production:

```bash
# List deployments
vercel ls

# Rollback to a previous deployment
vercel alias set [deployment-id] [your-domain.com]
```

## Automating Deployments

The project uses GitHub Actions for CI/CD. Check `.github/workflows/ci_cd.yml` for the automated deployment configuration.

## Post-Deployment Tasks

1. Set up Vercel monitoring and alerts
2. Configure custom domains and SSL certificates
3. Set up performance monitoring with Vercel Analytics
4. Enable automatic preview deployments for feature branches

## Troubleshooting

See `docs/vercel_troubleshooting.md` for common issues and solutions.

## Security Considerations

1. Ensure all API keys and secrets are stored in Vercel environment variables, not in code
2. Use Vercel's Edge Security features for additional protection
3. Configure proper CORS settings in `app/main.py`
4. Ensure JWT authentication is properly implemented across all protected routes

## Performance Optimizations

1. The `next.config.js` contains optimizations for:
   - Image optimization
   - Static file caching
   - Incremental Static Regeneration settings
   - API route performance tuning

2. Ensure CDN caching is properly configured for static assets

## Maintenance

Use the included scripts for maintenance tasks:
- `scripts/redeploy.sh` / `scripts/redeploy.bat` - Redeployment with validation
- `scripts/deployment_checklist.js` - Pre-deployment verification
- `scripts/run-validation.js` - Validate codebase integrity
