# DNS Configuration Troubleshooting for Auto AGI Builder

The DNS_PROBE_FINISHED_NXDOMAIN error indicates a DNS resolution issue. This document provides troubleshooting steps to resolve domain configuration problems.

## Understanding the Error

When encountering "DNS_PROBE_FINISHED_NXDOMAIN" when trying to access www.auto-agi-builder.app, it means:

1. The DNS system could not find the domain name
2. Either the domain hasn't been registered, or
3. The DNS records haven't propagated yet

## Solutions

### Immediate Solution: Use Vercel's Default Domain

While waiting for DNS changes to propagate, you can access your deployed application using Vercel's default domain:

```
https://auto-agi-builder.vercel.app 
```

### Check Domain Registration

1. Verify your domain (auto-agi-builder.app) is properly registered with a domain registrar
2. Ensure domain registration has not expired

### Verify DNS Configuration

1. Login to your domain registrar's control panel
2. Confirm you've added the following DNS records:

   | Type  | Name | Value              |
   |-------|------|-------------------|
   | CNAME | www  | cname.vercel-dns.com. |
   | A     | @    | 76.76.21.21 |

3. Note that the trailing dot after "cname.vercel-dns.com." is important in some DNS configurations

### Wait for DNS Propagation

DNS changes can take 24-48 hours to fully propagate across the internet. This is normal, and there's usually no way to speed up this process.

### Verify in Vercel Dashboard

1. Go to your [Vercel dashboard](https://vercel.com/dashboard)
2. Select the project (auto-agi-builder)
3. Go to "Settings" > "Domains"
4. Check if your domain shows as "Valid Configuration" (green checkmark)
5. If there are any issues, Vercel will show specific error messages

### Test with DNS Lookup Tools

Use DNS lookup tools to check if your domain is resolving correctly:

1. Visit [whatsmydns.net](https://www.whatsmydns.net/)
2. Enter "www.auto-agi-builder.app" and select "CNAME"
3. Check if the CNAME record resolves to "cname.vercel-dns.com"
4. Then check "auto-agi-builder.app" for the A record (76.76.21.21)

### Check Nameservers

If you're using custom nameservers rather than your registrar's default:

1. Ensure nameservers are correctly configured
2. Wait for nameserver changes to propagate (can take up to 48 hours)

## Common Issues

### Wrong Value Format

Some DNS providers require you to remove the trailing dot from "cname.vercel-dns.com."

### Domain Not Verified in Vercel

In the Vercel dashboard, check if your domain needs verification:

1. Go to "Settings" > "Domains"
2. Look for any verification requirements
3. Follow the verification steps provided

### DNS Provider Specific Settings

Some DNS providers have specific formats for CNAME and A records:

1. Check your DNS provider's documentation
2. Some providers require an absolute domain for CNAME values
3. Others may require a relative domain name

## Next Steps

1. If DNS propagation is still in progress, wait 24-48 hours
2. Use the Vercel default URL (https://auto-agi-builder.vercel.app) in the meantime
3. After changes have propagated, try accessing www.auto-agi-builder.app again

If problems persist after 48 hours, there might be an issue with your Vercel configuration or DNS settings that requires additional troubleshooting.
