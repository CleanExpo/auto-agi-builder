# Auto AGI Builder - Automated Domain Configuration

This tool automates the process of configuring your custom domain (`autoagibuilder.app`) with your Vercel-deployed Auto AGI Builder application. It handles domain registration with Vercel, verification configuration, and DNS record management.

## Features

- Automatically adds apex domain and www subdomain to your Vercel project
- Retrieves DNS verification details and configuration requirements
- Sets up proper redirects (e.g., from www to non-www)
- Provides clear instructions for DNS record configuration
- Supports email configuration

## Prerequisites

1. **Node.js and npm**: Make sure you have Node.js (v14 or later) and npm installed
2. **Vercel Account**: You need a Vercel account with access to the Auto AGI Builder project
3. **Vercel API Token**: Generate a personal access token from the Vercel dashboard
4. **Domain Ownership**: You must own the domain you want to configure

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Obtain a Vercel API Token**:
   - Go to https://vercel.com/account/tokens
   - Click "Create" and give it a name like "Auto AGI Domain Config"
   - Set appropriate expiration (or no expiration for permanent token)
   - Copy the generated token

3. **Configure Environment Variables**:
   - Create a `.env` file by copying `.env.example`
   - Add your Vercel API token
   - The project ID and team ID are pre-configured but can be changed if needed
   ```
   cp .env.example .env
   ```

## Usage

### Windows Users

Simply double-click on the `run-domain-config.bat` file or run:

```bash
npm run configure-domain
```

### Linux/Mac Users

Make the script executable and run it:

```bash
chmod +x run-domain-config.sh
./run-domain-config.sh
```

Alternatively, you can run:

```bash
npm run configure-domain
```

The script will:
1. Connect to Vercel using your API token
2. Add the domains to your Auto AGI Builder project
3. Retrieve verification details and DNS records requirements
4. Configure proper redirects
5. Provide next steps for domain verification

## Understanding the Output

The script will output several sections:

### Domain Addition Status

```
Adding apex domain: autoagibuilder.app...
Apex domain added successfully!

Adding www subdomain: www.autoagibuilder.app...
WWW subdomain added successfully!
```

### DNS Configuration Requirements

```
=== Required DNS Records ===

TXT Record for Verification:
Type: TXT
Name: _vercel
Value: [verification string]
TTL: 3600 (or Auto)

A Records:
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600 (or Auto)

CNAME Records:
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600 (or Auto)
```

## Next Steps After Running the Script

1. **Add DNS Records**: Add the provided DNS records at your domain registrar's website
2. **Wait for Propagation**: DNS changes can take 1-48 hours to propagate globally
3. **Check Verification Status**: Monitor the verification status in your Vercel dashboard
4. **Test Your Domain**: Once verified, test both apex domain and www subdomain

## Getting Help

If you encounter issues:

1. Check the Vercel dashboard for domain verification status
2. Ensure DNS records are correctly configured at your registrar
3. Verify that your Vercel API token has the correct permissions
4. If needed, refer to the manual configuration guide in `custom-domain-configuration-guide.md`

## Accessing Your API Token from Vercel

1. Log in to your Vercel account
2. Click on your profile picture in the top-right corner
3. Select "Settings"
4. In the left sidebar, click "Tokens"
5. Click "Create" to generate a new token
6. Give it a descriptive name like "Auto AGI Domain Config"
7. Set the appropriate scope (full account access is recommended for domain configuration)
8. Choose an expiration date (or "No expiration" for a permanent token)
9. Click "Create Token"
10. Copy the generated token and add it to your `.env` file

## Obtaining the Team ID and Project ID

These values are pre-configured in the `.env.example` file, but if you need to find them:

### Team ID:
1. Log in to Vercel dashboard
2. If you're part of a team, select it
3. In the URL, the team ID appears as `team_xxxxxxxx`

### Project ID:
1. Go to your project settings
2. The project ID appears in the URL as `prj_xxxxxxxx`

## Troubleshooting

- **Authentication Errors**: Check your Vercel API token
- **Permission Errors**: Ensure your account has access to the project
- **Domain Already Exists**: The domain may already be added to another project
- **Verification Problems**: Double-check DNS record configuration
