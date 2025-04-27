# Custom Domain Setup Guide

This guide explains how to set up your custom domain with your Vercel deployment.

## DNS Configuration

To point your custom domain to your Vercel deployment, you need to add the following DNS record to your domain's DNS settings:

| Type  | Name | Value              |
|-------|------|-------------------|
| CNAME | www  | cname.vercel-dns.com. |

## Steps to Configure Your Domain

1. **Log in to your domain registrar's website**
   - This could be GoDaddy, Namecheap, Google Domains, or any other domain provider

2. **Navigate to the DNS management section**
   - This is often called "DNS Settings," "DNS Management," or "Name Servers"

3. **Add a new DNS record**
   - Select record type: `CNAME`
   - Enter hostname/name: `www`
   - Enter value/points to: `cname.vercel-dns.com.`
   - TTL (Time to Live): Use the default (usually 3600 or 1 hour)

4. **Save your changes**
   - It may take up to 48 hours for DNS changes to fully propagate

## Root Domain Configuration

For your root domain (e.g., example.com) setup:

1. **Add an A record**:
   - Type: `A`
   - Name: `@` (represents the root domain)
   - Value: `76.76.21.21` (Vercel's IP address)

This A record will direct your apex/root domain to your Vercel deployment, allowing visitors to access your site without the www prefix.

## Verifying Your Domain in Vercel

1. **Go to your Vercel project dashboard**

2. **Navigate to "Settings" > "Domains"**

3. **Add your domain**:
   - Enter your domain name (e.g., www.example.com)
   - Click "Add"

4. **Verify domain configuration**:
   - Vercel will automatically check if the DNS configuration is correct
   - If everything is set up properly, you'll see a green "Valid Configuration" status

## Troubleshooting

### Domain Not Connecting

- Ensure your DNS records match exactly as specified above
- Check if you need to wait longer for DNS propagation
- Use a DNS checker tool like [whatsmydns.net](https://www.whatsmydns.net/) to verify propagation

### SSL Certificate Issues

- Vercel automatically provisions SSL certificates for your domain
- This process usually takes about 15 minutes but can take up to 24 hours
- If you continue to see SSL errors after 24 hours, contact Vercel support

### Subdomain Configuration

If you want to add additional subdomains (e.g., blog.example.com):

1. Add another CNAME record with:
   - Type: `CNAME`
   - Name: `blog` (or whatever subdomain you want)
   - Value: `cname.vercel-dns.com.`

2. Add the subdomain in Vercel's domain settings

## Testing Your Domain

After configuring your domain, test it by:

1. Opening a browser and navigating to your domain
2. Checking that the SSL certificate is valid (look for the padlock icon)
3. Verifying that your site loads correctly
