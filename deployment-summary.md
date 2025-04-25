# Auto AGI Builder Deployment Toolkit

This toolkit provides a comprehensive set of utilities for deploying the Auto AGI Builder platform to production environments with a focus on Vercel deployments. The toolkit addresses common deployment challenges and provides streamlined solutions for environment configuration, version control, build processes, and deployment verification.

## Core Components

### Configuration Scripts

| Script | Purpose |
|--------|---------|
| `database-setup.bat` | Configure database connections for multiple database types |
| `storage-setup.bat` | Set up storage providers and file upload settings |
| `auth-setup.bat` | Configure authentication providers and security settings |

### Deployment Scripts

| Script | Purpose |
|--------|---------|
| `full-deploy.bat` | Prepare frontend and backend for deployment |
| `commit-push-deploy.bat` | Combined workflow: commit changes, push to Git, deploy to Vercel |
| `verify-deployment.bat` | Verify deployed application functionality |
| `git-commit-and-push.bat` | Manage source control operations |

### Launcher System

| Script | Purpose |
|--------|---------|
| `run-deploy.bat` | Universal launcher that handles shell compatibility |
| `run-deploy-pipeline.bat` | Command Prompt version of the deployment pipeline |
| `run-deploy-pipeline.ps1` | PowerShell version with enhanced output |

## Workflow Examples

### Standard Deployment Workflow

1. **Configuration**
   ```
   database-setup.bat
   storage-setup.bat
   auth-setup.bat
   ```

2. **Prepare for Deployment**
   ```
   full-deploy.bat
   ```

3. **Deploy to Production**
   ```
   commit-push-deploy.bat
   ```

### Quick Deployment

For users who have already configured their environment:

```
commit-push-deploy.bat
```

This script handles:
- Committing all changes to Git
- Pushing to the remote repository
- Deploying to Vercel production
- Optional verification of the deployment

### Manual Process Control

For users who need more control over the deployment process:

1. **Git Operations**
   ```
   git-commit-and-push.bat
   ```

2. **Deployment**
   ```
   full-deploy.bat
   ```

3. **Verification**
   ```
   verify-deployment.bat
   ```

## Feature Highlights

### Shell Compatibility
- Works across Command Prompt and PowerShell environments
- Handles PowerShell execution policy restrictions
- Preserves environment settings across shell types

### Source Control Integration
- Conventional commits support
- Branch management
- Remote repository handling
- Selective file staging

### Deployment Verification
- Tiered verification (basic, standard, comprehensive)
- Frontend/backend endpoint testing
- Detailed reporting
- Troubleshooting guidance

### Vercel Integration
- Production deployment support
- Frontend and backend separation
- Automatic configuration generation
- Environment variable handling

## Troubleshooting

Common issues and their solutions:

1. **PowerShell Execution Policy**
   - Use `run-deploy.bat` which automatically handles execution policy issues

2. **Git Remote Issues**
   - The scripts will attempt to set up remotes if they don't exist
   - Manual input for remote URLs is supported

3. **Vercel CLI Missing**
   - Automatic installation of Vercel CLI when needed

4. **Directory Structure Issues**
   - Automatic creation of deployment directories
   - Validation of required files

## Best Practices

1. **Configuration First**
   - Always run the configuration scripts before deployment
   - Verify environment settings in .env files

2. **Frequent Verification**
   - Run verification after deployment to catch issues early
   - Use different verification levels based on change impact

3. **Source Control**
   - Commit frequently with descriptive messages
   - Use the conventional commit format for clarity

4. **Environment Isolation**
   - Use different configurations for development and production
   - Keep sensitive data out of source control

## Documentation

For detailed usage instructions, refer to `DEPLOYMENT-USAGE.md`.
