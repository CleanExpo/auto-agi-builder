# Auto AGI Builder Domain Troubleshooting Guide

This document provides a comprehensive guide to troubleshooting the domain configuration issues encountered with the Auto AGI Builder application deployment on Vercel.

## Current Issues

1. **404 NOT_FOUND Error**: The site at www.autoagibuilder.app is showing a 404 error with code `NOT_FOUND` and ID `pdx1::glgnz-1745810480987-26e42b46425f`.

2. **UIProvider Error**: While this error has been addressed by the fix-ui-provider.js script, there are still domain-related issues preventing the site from being displayed properly.

3. **Invalid Redirect Pattern**: The vercel.json configuration had an invalid redirect route pattern using `http://:host(.+)` which was causing deployment issues.

## Root Cause Analysis

### UI Provider Issues (Fixed)

The "useUI must be used within a UIProvider" error was caused by:
1. Server-side rendering attempting to use the UI context without proper initialization
2. Missing default values for the UIContext during server-side rendering
3. The error was fixed by modifying the UIContext to provide default values during SSR

### Domain Configuration Issues (Current)

The 404 error is likely caused by one or more of the following:
1. Misconfigured DNS records
2. Invalid Vercel domain configuration
3. Incorrect vercel.json settings
4. Recent deployment not yet propagated globally

## Step-by-Step Troubleshooting Guide

### 1. Verify DNS Configuration

DNS records need to be properly configured:

**For the apex domain (autoagibuilder.app)**:
- A record should point to `76.76.21.21`

**For the www subdomain (www.autoagibuilder.app)**:
- CNAME record should point to `cname.vercel-dns.com`

Commands to verify DNS configuration:
```sh
dig a autoagibuilder.app
dig cname www.autoagibuilder.app
```

### 2. Fix Invalid vercel.json Configuration

The invalid redirect pattern has been fixed with the `fix-vercel-json.js` script, which replaces:
```json
{
  "source": "http://:host(.+)",
  ...
}
```

With a proper header-based redirect:
```json
{
  "source": "/(.*)",
  "destination": "https://www.autoagibuilder.app/$1",
  "statusCode": 308,
  "has": [
    {
      "type": "header",
      "key": "x-forwarded-proto",
      "value": "http"
    }
  ]
}
```

### 3. Verify Domain in Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select the Auto AGI Builder project
3. Navigate to Settings > Domains
4. Ensure both domains (autoagibuilder.app and www.autoagibuilder.app) are properly added
5. Check for any configuration errors or warnings
6. If needed, verify domain ownership by adding required TXT records

### 4. Check for Missing CAA Records

If you see SSL certificate issues, you may need to add a CAA record:
```
0 issue "letsencrypt.org"
```

### 5. Redeploy and Force HTTPS

After fixing the configuration:
1. Run `vercel --prod` to force a redeployment
2. Wait for deployment to complete
3. Check domain status in Vercel dashboard

### 6. DNS Propagation

DNS changes can take up to 48 hours to propagate globally. If you've recently updated the DNS records:
1. Clear your browser cache
2. Flush DNS cache on your system
3. Try accessing the site from different networks or devices
4. Use a DNS propagation checker website

## Automated Tools

We've created tools to help diagnose and fix these issues:

1. **fix-domain-issues.js**: Analyzes your vercel.json configuration, checks for invalid domain patterns, and provides guidance on proper DNS setup.

2. **run-dns-checks.bat**: Automates the verification process and provides a checklist for DNS configuration.

## Advanced Troubleshooting

If the issue persists after trying the steps above:

1. **Check CAA Records**: Run `dig -t CAA +noall +ans autoagibuilder.app`

2. **Check for _acme-challenge Records**: Run `dig -t TXT _acme-challenge.autoagibuilder.app`

3. **Verify Output Directory**: Make sure the "outputDirectory" in vercel.json matches your project's build output directory.

4. **Check for Competing Configurations**: Make sure no previous deployments or configurations are causing conflicts.

## Recommended Changes

1. Fix DNS Records:
   - Ensure A record for autoagibuilder.app points to 76.76.21.21
   - Ensure CNAME record for www.autoagibuilder.app points to cname.vercel-dns.com

2. Update vercel.json:
   - Use header-based detection for HTTP to HTTPS redirects
   - Ensure output directory is correctly specified
   - Add proper environment variables

3. Wait for DNS Propagation:
   - After making changes, allow time for global propagation
   - Use `nslookup` or `dig` commands to verify records are being updated

## Additional Resources

- [Vercel Domains Documentation](https://vercel.com/docs/domains/overview)
- [DNS Propagation Checker](https://www.whatsmydns.net/)
- [Let's Debug](https://letsdebug.net/) - For SSL certificate issues
- [DNSViz](https://dnsviz.net/) - For DNS misconfiguration analysis
