# Production Deployment Guide for Auto AGI Builder

This guide provides detailed instructions for deploying the Auto AGI Builder platform to production environments.

## Table of Contents
1. [Vercel Frontend Deployment](#vercel-frontend-deployment)
2. [FastAPI Backend Deployment](#fastapi-backend-deployment)
3. [Domain Configuration & SSL](#domain-configuration--ssl)
4. [Environment Variable Management](#environment-variable-management)
5. [Deployment Testing & Verification](#deployment-testing--verification)

## Vercel Frontend Deployment

### Prerequisites
- GitHub repository containing your Next.js project
- Vercel account (https://vercel.com)
- Your domain name (if using a custom domain)

### Step 1: Connect Your Repository to Vercel

1. Log in to your Vercel account
2. Click on "Add New" > "Project"
3. Import your GitHub repository:
   - Select "Continue with GitHub"
   - Grant necessary permissions
   - Find and select your `auto-agi-builder` repository

### Step 2: Configure Project Settings

1. Configure the project settings:
   - **Project Name**: `auto-agi-builder` (or your preferred name)
   - **Framework Preset**: Next.js
   - **Root Directory**: `/frontend` (adjust if your Next.js code is in a different directory)
   - **Build Command**: `npm run build` (or your custom build command)
   - **Output Directory**: `.next` (default for Next.js apps)

2. Click "Deploy" to initiate the first deployment

### Step 3: Configure Environment Variables

1. Once initial deployment is complete, go to the "Settings" tab of your project
2. Select "Environment Variables" from the side menu
3. Add all required environment variables:

```
# API Configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# Authentication
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-nextauth-secret

# SendGrid Configuration (for client-side email templates if used)
NEXT_PUBLIC_SUPPORT_EMAIL=support@yourdomain.com

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

4. For each variable, select which Environments it applies to:
   - Production
   - Preview (for PR deployments)
   - Development

5. Click "Save" to apply the environment variables

### Step 4: Configure Build & Development Settings

1. Go to "Settings" > "General"
2. Under "Build & Development Settings":
   - **Framework Preset**: Verify Next.js is selected
   - **Node.js Version**: Select version 18.x or your required version
   - **Install Command**: `npm install` (or `yarn install` if using Yarn)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

3. Under "Root Directory", ensure it's set to your frontend folder

### Step 5: Set Up Custom Domain

1. Go to "Settings" > "Domains"
2. Click "Add" and enter your domain name (e.g., `yourdomain.com`)
3. Follow the DNS configuration instructions provided by Vercel:
   - Option 1: Use Vercel nameservers (easiest)
   - Option 2: Add custom DNS records to your current DNS provider

4. For non-www to www redirects, add both domains and configure the redirect

5. Verify your domain once DNS propagation is complete

### Step 6: Configure Preview Deployments

1. Go to "Settings" > "Git"
2. Configure preview deployments:
   - **Production Branch**: `main` (or your production branch)
   - **Preview Deployment for PRs**: Enabled
   - **Ignored Build Step**: Configure if needed to avoid unnecessary builds

## FastAPI Backend Deployment

### Option 1: Deploying to VM/VPS

1. SSH into your server:
   ```bash
   ssh username@your_server_ip
   ```

2. Install required packages:
   ```bash
   sudo apt update
   sudo apt install python3 python3-pip python3-venv nginx
   ```

3. Clone your repository:
   ```bash
   git clone https://github.com/CleanExpo/auto-agi-builder.git
   cd auto-agi-builder
   ```

4. Create and activate virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

5. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

6. Create service file for systemd:
   ```bash
   sudo nano /etc/systemd/system/autoagibuilder.service
   ```

7. Add the following content:
   ```
   [Unit]
   Description=Auto AGI Builder FastAPI Application
   After=network.target

   [Service]
   User=your_username
   Group=your_group
   WorkingDirectory=/path/to/auto-agi-builder
   Environment="PATH=/path/to/auto-agi-builder/venv/bin"
   EnvironmentFile=/path/to/auto-agi-builder/.env
   ExecStart=/path/to/auto-agi-builder/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000

   [Install]
   WantedBy=multi-user.target
   ```

8. Enable and start the service:
   ```bash
   sudo systemctl enable autoagibuilder
   sudo systemctl start autoagibuilder
   ```

9. Configure Nginx as reverse proxy:
   ```bash
   sudo nano /etc/nginx/sites-available/autoagibuilder
   ```

10. Add the following configuration:
    ```
    server {
        listen 80;
        server_name api.yourdomain.com;

        location / {
            proxy_pass http://localhost:8000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
    ```

11. Enable the site and restart Nginx:
    ```bash
    sudo ln -s /etc/nginx/sites-available/autoagibuilder /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    ```

12. Set up SSL with Certbot:
    ```bash
    sudo apt install certbot python3-certbot-nginx
    sudo certbot --nginx -d api.yourdomain.com
    ```

### Option 2: Deploying with Docker

1. Create a Dockerfile in your project root if not already present:
   ```
   FROM python:3.10-slim

   WORKDIR /app

   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt

   COPY . .

   CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
   ```

2. Build and push the Docker image:
   ```bash
   docker build -t auto-agi-builder:latest .
   docker tag auto-agi-builder:latest your-registry/auto-agi-builder:latest
   docker push your-registry/auto-agi-builder:latest
   ```

3. Deploy using Docker Compose or Kubernetes:
   - Docker Compose:
     ```yaml
     version: '3'
     services:
       api:
         image: your-registry/auto-agi-builder:latest
         ports:
           - "8000:8000"
         env_file:
           - .env
         restart: always
     ```

   - Run with Docker Compose:
     ```bash
     docker-compose up -d
     ```

## Domain Configuration & SSL

### DNS Configuration

1. Log in to your domain registrar's control panel
2. Create the following DNS records:

   - **Frontend (Vercel)**:
     - Type: A or CNAME (as instructed by Vercel)
     - Name: @ (root domain)
     - Value: (Vercel's IP or domain)
     - TTL: 3600 (or as recommended)

   - **API Backend**:
     - Type: A
     - Name: api
     - Value: Your server IP address
     - TTL: 3600

   - **WWW Subdomain**:
     - Type: CNAME
     - Name: www
     - Value: yourdomain.com
     - TTL: 3600

3. Create additional records for any other subdomains you plan to use

### SSL Configuration

1. **Vercel Frontend**:
   - SSL is automatically handled by Vercel once you add your domain

2. **API Backend (if using Let's Encrypt)**:
   - SSH into your server
   - If not already installed:
     ```bash
     sudo apt install certbot python3-certbot-nginx
     ```
   - Obtain certificate:
     ```bash
     sudo certbot --nginx -d api.yourdomain.com
     ```
   - Configure auto-renewal:
     ```bash
     sudo systemctl status certbot.timer
     ```

3. **Testing SSL Configuration**:
   - Visit https://www.ssllabs.com/ssltest/
   - Enter your domain names to verify proper SSL setup
   - Ensure A+ or A rating

## Environment Variable Management

### Frontend Environment Variables

1. **Development Environment**:
   - Create a `.env.local` file in your frontend directory
   - Add required variables:
     ```
     NEXT_PUBLIC_API_URL=http://localhost:8000
     NEXTAUTH_URL=http://localhost:3000
     NEXTAUTH_SECRET=your-dev-secret
     ```

2. **Production Environment (Vercel)**:
   - Add variables through Vercel dashboard as described earlier
   - For sensitive values, use Vercel's encrypted environment variables

3. **Environment Variable Types**:
   - **Build-time variables**: Available during build process
   - **Runtime variables**: Available during application runtime
   - **Preview variables**: For preview deployments only

4. **Security Considerations**:
   - Never commit `.env` files to git
   - Prefix client-exposed variables with `NEXT_PUBLIC_`
   - Rotate secrets regularly

### Backend Environment Variables

1. **Development Environment**:
   - Use `.env` file for local development
   - Ensure this file is in `.gitignore`

2. **Production Environment**:
   - Create a production-only `.env` file on your server
   - Set restricted permissions:
     ```bash
     chmod 600 /path/to/.env
     ```

3. **Systemd Service**:
   - Reference the environment file in your systemd service:
     ```
     EnvironmentFile=/path/to/.env
     ```

4. **Docker Deployment**:
   - Use docker-compose `env_file` directive
   - Or pass environment variables through the Docker run command:
     ```bash
     docker run -d --env-file .env your-image
     ```

### Secrets Management

1. **API Keys and Sensitive Credentials**:
   - Consider using a secrets manager:
     - HashiCorp Vault
     - AWS Secrets Manager
     - Azure Key Vault
   
2. **Database Credentials**:
   - Use connection strings with credentials
   - Consider using managed database services with IAM authentication

## Connecting Frontend to Backend

### API Configuration

1. **CORS Configuration**:
   - Update your FastAPI CORS settings in `app/main.py`:
     ```python
     from fastapi.middleware.cors import CORSMiddleware

     app.add_middleware(
         CORSMiddleware,
         allow_origins=[
             "https://yourdomain.com",
             "https://www.yourdomain.com",
             # For development and preview environments
             "http://localhost:3000",
             "https://*.vercel.app", 
         ],
         allow_credentials=True,
         allow_methods=["*"],
         allow_headers=["*"],
     )
     ```

2. **API Endpoints**:
   - Ensure all API endpoints are properly documented
   - Verify API versioning is correctly implemented (e.g., `/api/v1/...`)

### Frontend API Configuration

1. **API Client Setup**:
   - Create or update your API client in the frontend:
     ```javascript
     // frontend/lib/api.js
     import axios from 'axios';

     const api = axios.create({
       baseURL: process.env.NEXT_PUBLIC_API_URL,
       withCredentials: true,
       headers: {
         'Content-Type': 'application/json',
       }
     });

     // Add request interceptor for authentication
     api.interceptors.request.use((config) => {
       const token = localStorage.getItem('token');
       if (token) {
         config.headers.Authorization = `Bearer ${token}`;
       }
       return config;
     });

     export default api;
     ```

2. **Environment Variables**:
   - Ensure `NEXT_PUBLIC_API_URL` is set correctly in all environments

## Deployment Testing & Verification

1. **Initial Deployment Tests**:
   - Verify frontend deployment URL is accessible
   - Verify API deployment URL is accessible
   - Check SSL certificates are valid
   - Verify CORS allows communication between frontend and backend

2. **Deployment Rollback Plan**:
   - Document process for emergency rollbacks
   - Vercel: Use the deployment history for instant rollbacks
   - Backend: Keep previous working Docker image or commit

3. **Post-Deployment Checks**:
   - Verify all environment variables are correct
   - Check log files for any errors
   - Run basic functionality tests
   - Verify authentication flows
   - Test third-party integrations

## Continuous Deployment

### GitHub Actions Integration

1. Create or update `.github/workflows/cd.yml`:
   ```yaml
   name: Continuous Deployment

   on:
     push:
       branches: [ main ]

   jobs:
     deploy-backend:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Set up Python
           uses: actions/setup-python@v4
           with:
             python-version: '3.10'
         - name: Install dependencies
           run: pip install -r requirements.txt
         - name: Run tests
           run: pytest
         - name: Deploy to production
           run: |
             # Add your deployment script or commands here
             # For example, SSH into server and pull latest changes
           env:
             SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
             SERVER_IP: ${{ secrets.SERVER_IP }}

     # Frontend deployment handled automatically by Vercel GitHub integration
   ```

### Vercel GitHub Integration

1. Ensure Vercel GitHub integration is enabled
2. Configure auto-deployment settings in Vercel:
   - Production branch: `main`
   - Preview branches: All other branches or PRs

## Database Migration Process

1. **Pre-Deployment**:
   - Create database backups:
     ```bash
     pg_dump -U username -d database_name > backup_$(date +%Y%m%d).sql
     ```
   
2. **Migration Execution**:
   - Run migrations as part of deployment:
     ```bash
     alembic upgrade head
     ```

3. **Post-Migration Verification**:
   - Verify database schema
   - Run data integrity checks
   - Have rollback scripts ready

## Troubleshooting Common Deployment Issues

1. **CORS Issues**:
   - Verify allowed origins include all domains/subdomains
   - Check for trailing slashes in URLs
   - Ensure credentials are handled properly

2. **Environment Variable Problems**:
   - Confirm all required variables are set
   - Check for typos in variable names
   - Verify values are correctly formatted

3. **Database Connection Issues**:
   - Verify connection strings
   - Check network/firewall settings
   - Ensure database service is running

4. **API Connection Problems**:
   - Test API endpoints directly using Postman or curl
   - Check for SSL certificate validation issues
   - Verify correct API URL in frontend configuration
