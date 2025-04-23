# Environment Management Guide for Auto AGI Builder

This guide explains best practices for managing environment variables and secrets across different deployment environments for the Auto AGI Builder application.

## Table of Contents
- [Environment Management Guide for Auto AGI Builder](#environment-management-guide-for-auto-agi-builder)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Environment Files Structure](#environment-files-structure)
  - [Secret Management Best Practices](#secret-management-best-practices)
  - [Environment-Specific Configuration](#environment-specific-configuration)
  - [Deployment Pipeline Integration](#deployment-pipeline-integration)
  - [Rotating Secrets](#rotating-secrets)
  - [Environment Variable Access in Code](#environment-variable-access-in-code)
  - [Troubleshooting](#troubleshooting)

## Introduction

The Auto AGI Builder application uses environment variables to configure various aspects of the system, from database connections to API keys. Properly managing these variables is critical for security, maintainability, and operational reliability.

## Environment Files Structure

We use the following structure for environment management:

1. `.env.example` - Template with all required variables but no actual values
2. `production.env.example` - Production-specific template with recommended settings
3. `.env` - Local development environment (not committed to git)
4. `.env.test` - Testing environment configuration
5. `.env.staging` - Staging environment configuration

**Important:** Never commit files containing actual secrets to version control. The `.env` file is included in `.gitignore` for this reason.

## Secret Management Best Practices

When dealing with sensitive environment variables:

1. **Use a secrets manager** in production:
   - AWS Secrets Manager
   - HashiCorp Vault
   - Vercel Environment Variables
   - GitHub Secrets for CI/CD

2. **Generate strong secrets:**
   ```bash
   # Generate a secure random string in Linux/macOS
   openssl rand -base64 32
   
   # Generate a secure random string in Windows PowerShell
   [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::Create().GetBytes(32))
   ```

3. **Separate access based on environment:**
   - Restrict production secrets to production systems only
   - Use different values for development, testing, and production
   - Limit access to production secrets to essential personnel only

4. **Encrypt sensitive files:**
   If you need to store environment files with real secrets temporarily, encrypt them:
   ```bash
   # Encrypt a file
   gpg -c .env.production
   
   # Decrypt
   gpg .env.production.gpg
   ```

## Environment-Specific Configuration

Configure different settings based on the deployment environment:

1. **Development:**
   - Higher log levels (`DEBUG=true`, `LOG_LEVEL=debug`)
   - Local database connections
   - Disabled rate limiting or higher limits
   - Mock external services where applicable

2. **Testing:**
   - Use in-memory databases or test-specific instances
   - Set `IS_TESTING_ENVIRONMENT=true`
   - Disable external API calls or use mocks
   - Minimal logging

3. **Staging:**
   - Mirror production settings where possible
   - Use separate but similar infrastructure
   - Enable monitoring but with lower alert thresholds
   - Add `-staging` suffix to resource names

4. **Production:**
   - Maximum security settings
   - Optimized performance configurations
   - Minimal debug information
   - Full monitoring and alerting

## Deployment Pipeline Integration

Integrate environment management with CI/CD pipelines:

1. **GitHub Actions:**
   ```yaml
   # Example GitHub workflow step for secrets
   steps:
     - name: Create .env file
       run: |
         echo "DATABASE_URL=${{ secrets.DATABASE_URL }}" >> .env
         echo "SECRET_KEY=${{ secrets.SECRET_KEY }}" >> .env
   ```

2. **Vercel Deployment:**
   - Use Vercel's Environment Variables UI
   - Segregate by environment (Preview, Development, Production)
   - Use Vercel's integration with GitHub secrets

3. **Docker Deployments:**
   ```bash
   # Pass environment variables to container
   docker run -d --name auto-agi-api \
     -e DATABASE_URL=$DATABASE_URL \
     -e SECRET_KEY=$SECRET_KEY \
     auto-agi-api:latest
   ```

4. **Kubernetes Secrets:**
   ```yaml
   # Store as Kubernetes secrets
   apiVersion: v1
   kind: Secret
   metadata:
     name: auto-agi-secrets
   type: Opaque
   data:
     database-url: <base64-encoded-value>
     secret-key: <base64-encoded-value>
   ```

## Rotating Secrets

Regularly rotate sensitive credentials:

1. **Scheduled rotations:**
   - Database credentials: Every 90 days
   - API keys: Every 60 days
   - JWT secret: Every 30 days
   
2. **Emergency rotations:**
   - Immediately after suspected compromise
   - When team members with access leave the organization
   - Following any security incident

3. **Rotation process:**
   1. Generate new credentials
   2. Update the relevant service (database, API provider)
   3. Update environment variables in production
   4. Verify application is functioning correctly
   5. Revoke old credentials

## Environment Variable Access in Code

Access environment variables securely in code:

1. **Backend (Python/FastAPI):**
   ```python
   # app/core/config.py
   import os
   from pydantic import BaseSettings, SecretStr
   
   class Settings(BaseSettings):
       # Application settings
       APP_NAME: str = "Auto AGI Builder"
       DEBUG: bool = False
       
       # Security settings
       SECRET_KEY: SecretStr
       JWT_SECRET: SecretStr
       
       # Database settings
       DATABASE_URL: str
       
       class Config:
           env_file = ".env"
           env_file_encoding = "utf-8"
   
   settings = Settings()
   ```

2. **Frontend (Next.js):**
   ```javascript
   // frontend/lib/config.js
   export const config = {
     apiUrl: process.env.NEXT_PUBLIC_API_URL,
     environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
     analyticsId: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
     
     // Only expose variables that are safe for client-side
     // Never expose API keys or secrets in NEXT_PUBLIC_ variables
   }
   ```

3. **Environment Variable Validation:**
   ```python
   # Validate required variables on startup
   def validate_settings():
       required_vars = [
           "SECRET_KEY", "DATABASE_URL", "JWT_SECRET"
       ]
       
       missing = [var for var in required_vars if not getattr(settings, var, None)]
       
       if missing:
           raise ValueError(f"Missing required environment variables: {', '.join(missing)}")
   ```

## Troubleshooting

Common environment-related issues and solutions:

1. **Missing environment variables:**
   - Check if `.env` file exists in the correct location
   - Verify variable names match exactly (case-sensitive)
   - Ensure quotes are properly escaped for complex values

2. **Environment variables not loading:**
   - Restart the application after changing environment files
   - Verify file permissions (chmod 600 recommended for .env files)
   - Check file encoding (use UTF-8 without BOM)

3. **Secrets leaking:**
   - Immediately rotate any exposed secrets
   - Check logs and error outputs for accidental secret exposure
   - Use tools like GitLeaks to scan repositories for secrets

4. **Different behavior across environments:**
   - Compare environment files for discrepancies
   - Look for environment-specific code paths
   - Check for hardcoded values overriding environment variables
