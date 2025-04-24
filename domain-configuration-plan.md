# Domain Configuration Plan for Auto AGI Builder

Based on the automatic configuration attempt, I've identified the following issues that need to be resolved:

## Current Status

1. **Domain Assignment Issues:**
   - The apex domain (`autoagibuilder.app`) is currently assigned to a project called "local-lift"
   - The www subdomain (`www.autoagibuilder.app`) is already assigned to the "auto-agi-builder" project

2. **Domain Verification:**
   - Both domains are in "pending verification" status
   - The required nameservers have been identified:
     - ns1.vercel-dns.com
     - ns2.vercel-dns.com

## Action Plan

### 1. Domain Consolidation (Vercel Dashboard)

First, we need to consolidate both domains to the same project:

1. Log in to the [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to the "local-lift" project settings
3. Go to "Domains" section
4. Remove the `autoagibuilder.app` domain from this project
5. Navigate to the "auto-agi-builder" project settings
6. Go to "Domains" section
7. Add the apex domain `autoagibuilder.app` to this project

### 2. DNS Configuration (Domain Registrar)

At your domain registrar (where you purchased autoagibuilder.app):

1. Set the nameservers to:
   - ns1.vercel-dns.com
   - ns2.vercel-dns.com

   This change is made at the registrar level, not in DNS records. Look for "nameservers" or "NS" settings.

2. If you prefer to keep your current nameservers, add these DNS records instead:
   
   **For apex domain (autoagibuilder.app):**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   TTL: 3600 (or Auto)
   ```
   
   ```
   Type: A
   Name: @
   Value: 76.76.21.98
   TTL: 3600 (or Auto)
   ```

   **For www subdomain (www.autoagibuilder.app):**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: 3600 (or Auto)
   ```

   **Domain Verification (TXT record):**
   ```
   Type: TXT
   Name: _vercel
   Value: [verification will be shown in Vercel dashboard]
   TTL: 3600 (or Auto)
   ```

### 3. Configure Domain Redirects (Vercel Dashboard)

After the domains are verified:

1. In the Vercel dashboard, go to the "auto-agi-builder" project settings
2. Navigate to "Domains" section
3. For `www.autoagibuilder.app`, click on the three dots (⋮) and select "Redirect to..."
4. Select "Redirect to autoagibuilder.app" (non-www version)

### 4. Verify DNS Propagation

After making the changes:

1. Wait for DNS propagation (can take 1-48 hours)
2. Check verification status in Vercel dashboard
3. Test both domains in a browser to ensure they're working correctly

## Additional DNS Records for Email (Optional)

For optimal email configuration, consider adding these records:

```
Type: MX
Name: @
Value: mx1.forwardemail.net
Priority: 10
TTL: 3600 (or Auto)
```

```
Type: MX
Name: @
Value: mx2.forwardemail.net
Priority: 20
TTL: 3600 (or Auto)
```

```
Type: TXT
Name: @
Value: v=spf1 include:_spf.google.com ~all
TTL: 3600 (or Auto)
```

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:admin@autoagibuilder.app
TTL: 3600 (or Auto)
```

## Troubleshooting

If you encounter issues:

1. **Verification Timeout**: Make sure your nameservers or DNS records are correctly configured
2. **Domain Already Exists**: Follow the domain consolidation steps above
3. **Redirection Issues**: Wait for DNS propagation and try setting up redirects again
4. **DNS Propagation**: Use [DNS Checker](https://dnschecker.org/) to verify your DNS changes have propagated globally
