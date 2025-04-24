# Auto AGI Builder - Deployment & Domain Configuration Toolkit

This comprehensive toolkit provides everything needed to deploy the Auto AGI Builder application to Vercel and configure custom domains. This document summarizes the core features and provides instructions for using the three main components.

## Core Components Overview

### 1. Full Deployment System
- `deploy-to-vercel.js` - Complete deployment system with domain consolidation
- `deploy-production.bat`/`.sh` - One-click production deployment launchers

### 2. DNS Configuration System  
- `dns-record-configurator.js` - Interactive DNS setup with provider-specific instructions
- `run-dns-config.bat`/`.sh` - Easy-to-use DNS configuration launchers

### 3. Domain Verification System
- `verify-domain-status.js` - Thorough domain and DNS status checking
- `verify-domain.bat`/`.sh` - Domain verification launchers

## How to Use Each Component

### 1. Full Deployment

**Windows:**
```
# Double-click deploy-production.bat
```

**Mac/Linux:**
```
# Make executable
chmod +x deploy-production.sh

# Run deployment
./deploy-production.sh
```

**What it does:**
- Consolidates domains assigned to the wrong projects
- Deploys the application to Vercel (from GitHub or local files)
- Configures environment variables
- Sets up domain redirects
- Verifies deployment status

### 2. DNS Configuration

**Windows:**
```
# Double-click run-dns-config.bat
```

**Mac/Linux:**
```
# Make executable
chmod +x run-dns-config.sh

# Run DNS configuration
./run-dns-config.sh
```

**What it does:**
- Checks current DNS records for your domains
- Detects your DNS provider and generates tailored instructions
- Creates detailed configuration files with exact DNS records
- Generates provider-specific tutorials for popular DNS providers:
  - Vercel DNS
  - GoDaddy
  - Namecheap
  - Cloudflare
  - AWS Route 53
  - Other providers
- Creates a markdown file with step-by-step DNS setup instructions

### 3. Domain Verification

**Windows:**
```
# Double-click verify-domain.bat
```

**Mac/Linux:**
```
# Make executable
chmod +x verify-domain.sh

# Run verification
./verify-domain.sh
```

**What it does:**
- Checks verification status with Vercel for both domains
- Verifies DNS records point to Vercel servers
- Confirms nameserver configuration
- Tests domain accessibility
- Provides detailed guidance for resolving any verification issues

## Deployment Workflow

For best results, follow this sequence:

1. **Run Full Deployment** (`deploy-production.bat`/`.sh`)
   - Deploy the app to Vercel and consolidate domains

2. **Configure DNS Records** (`run-dns-config.bat`/`.sh`)
   - Set up DNS records according to provider-specific instructions

3. **Verify Domain Status** (`verify-domain.bat`/`.sh`)
   - After DNS propagation (24-48 hours), verify domain configuration

## System Requirements

- Node.js (version 14+)
- npm (version 6+)
- Vercel account with API token
- Internet connection
- Access to your domain's DNS settings

## Advanced Configuration

All scripts use the `.env` file for configuration with these variables:

```
VERCEL_TOKEN=ETMf43Je9tpo7EOm9XBNPvQx
VERCEL_PROJECT_ID=prj_zJDsetW3XUQ8Pgw0EhEgeZVUk0Ss
VERCEL_TEAM_ID=team_hIVuEbN4ena7UPqg1gt1jb6s
DOMAIN=autoagibuilder.app
WWW_DOMAIN=www.autoagibuilder.app
GITHUB_REPO=your-github-username/auto-agi-builder
```

## Troubleshooting

- If deployment fails, check the Vercel logs in the dashboard
- If DNS configuration isn't working, re-run the DNS configurator
- Domain verification can take 24-48 hours due to DNS propagation
- For any issues, consult `complete-deployment-guide.md`
