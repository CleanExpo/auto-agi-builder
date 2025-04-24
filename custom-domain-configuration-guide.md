# Custom Domain Configuration Guide for autoagibuilder.app

This guide provides step-by-step instructions for configuring your custom domain with Vercel for the Auto AGI Builder application.

## 1. Domain Configuration in Vercel Dashboard

Since we're experiencing permission limitations with the CLI, we'll need to complete the domain configuration through the Vercel web dashboard:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`auto-agi-builder`)
3. Navigate to the "Settings" tab
4. Select "Domains" from the left sidebar
5. Add your domains:
   - `autoagibuilder.app` (apex/root domain)
   - `www.autoagibuilder.app` (www subdomain)

## 2. DNS Records Configuration

When you add domains through the Vercel dashboard, it will provide specific DNS records to configure. Below are the standard DNS records you'll need to add at your domain registrar:

### For the Apex Domain (autoagibuilder.app)

| Record Type | Name | Value | TTL |
|-------------|------|-------|-----|
| A | @ | 76.76.21.21 | Auto/3600 |
| A | @ | 76.76.21.98 | Auto/3600 |

### For the WWW Subdomain (www.autoagibuilder.app)

| Record Type | Name | Value | TTL |
|-------------|------|-------|-----|
| CNAME | www | cname.vercel-dns.com. | Auto/3600 |

### Domain Verification Records

Vercel will also provide a TXT record for domain verification. This typically looks like:

| Record Type | Name | Value | TTL |
|-------------|------|-------|-----|
| TXT | _vercel | [Verification string provided by Vercel] | Auto/3600 |

## 3. Additional Recommended DNS Records

For optimal email configuration and security, consider adding these records:

### MX Records for Email

| Record Type | Name | Value | Priority | TTL |
|-------------|------|-------|----------|-----|
| MX | @ | mx1.forwardemail.net | 10 | Auto/3600 |
| MX | @ | mx2.forwardemail.net | 20 | Auto/3600 |

### SPF, DKIM, and DMARC Records for Email Security

| Record Type | Name | Value | TTL |
|-------------|------|-------|-----|
| TXT | @ | v=spf1 include:_spf.google.com ~all | Auto/3600 |
| TXT | _dmarc | v=DMARC1; p=quarantine; rua=mailto:admin@autoagibuilder.app | Auto/3600 |

## 4. Domain Verification and SSL Setup

After adding the DNS records:

1. In the Vercel dashboard, refresh the domain verification page
2. Vercel will automatically detect the DNS changes (may take up to 24 hours for propagation)
3. Once verification is complete, Vercel will automatically issue an SSL certificate

## 5. HTTP to HTTPS Redirection

Vercel automatically configures HTTP to HTTPS redirection, so no additional steps are needed for this.

## 6. Post-Domain Configuration Checks

After your domain is verified and SSL is configured:

1. Visit `https://autoagibuilder.app` to verify the site loads correctly
2. Check that `http://autoagibuilder.app` redirects to HTTPS
3. Verify `www.autoagibuilder.app` properly redirects to or serves the site
4. Test all core functionality with the new domain:
   - Authentication
   - API endpoints
   - Asset loading

## 7. Troubleshooting

If you encounter issues:

1. **DNS Propagation**: Changes may take up to 24 hours to propagate globally
2. **SSL Certificate Issues**: Ensure no CAA records block certificate issuance
3. **Redirect Loops**: Check your Vercel configuration doesn't conflict with CDN settings

## 8. Maintenance

For ongoing domain maintenance:

1. Monitor SSL certificate expiration (Vercel handles renewal automatically)
2. Periodically check domain verification status in Vercel dashboard
3. If changing your hosting provider, update DNS records accordingly

This guide provides standard configurations for Vercel deployments with custom domains. The specific DNS records provided by Vercel through the dashboard should be used when available.
