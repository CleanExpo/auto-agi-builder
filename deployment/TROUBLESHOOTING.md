# Deployment Troubleshooting Guide

This document provides solutions for common issues that may arise during deployment of the Auto AGI Builder to Vercel.

## UIContext Provider Errors

### Symptoms
- Error messages containing: `Error: useUI must be used within a UIProvider`
- Prerendering errors during build or deployment
- Pages failing to render with context-related errors

### Solutions
1. **Verify Next.js Configuration**:
   - Ensure `experimental.disableStaticGeneration: true` is set in `next.config.js`
   - This prevents the SSR/static generation issues with context providers

2. **Check Provider Order**:
   - The UIProvider must wrap other components that use the `useUI` hook
   - Verify in `_app.js` that providers are properly nested

3. **Error Boundary Implementation**:
   - Confirm the ErrorBoundary component is properly wrapping the application
   - Check that it's providing fallback UI for context errors

## GitHub Actions Deployment Issues

### Symptoms
- GitHub Action workflow failing
- Deployment not triggered on push
- Missing secrets errors

### Solutions
1. **Verify GitHub Secrets**:
   ```
   VERCEL_TOKEN
   VERCEL_ORG_ID
   VERCEL_PROJECT_ID
   ```
   - Check that all three secrets are properly set in your repository settings

2. **Workflow File Validation**:
   - Ensure `.github/workflows/vercel-deployment.yml` exists and is correctly formatted
   - Verify the branch name matches your main branch (e.g., `main`, `master`)

3. **GitHub Token Permissions**:
   - Check that the Vercel token has appropriate scopes
   - Regenerate the token if necessary

## Environment Variable Issues

### Symptoms
- API endpoints failing
- Authentication issues
- Missing configuration errors

### Solutions
1. **Local .env File**:
   - Run `node deployment/create-env-file.js` to regenerate your .env.local file
   - Verify all required variables are set

2. **Vercel Environment Variables**:
   - Check that all variables from .env.local are also set in Vercel project settings
   - Environment variables are case-sensitive

3. **Production vs Development**:
   - Some variables may need different values in production
   - Set `NEXT_PUBLIC_ENVIRONMENT="production"` in Vercel environment settings

## Build Failures

### Symptoms
- Build failing during deployment
- TypeScript or ESLint errors
- Missing dependency errors

### Solutions
1. **Dependency Issues**:
   - Ensure `package.json` and `package-lock.json` are up to date
   - Try running `npm ci` locally to verify dependencies install correctly

2. **TypeScript Errors**:
   - Address any TypeScript errors in the codebase
   - Temporarily add `// @ts-ignore` comments for complex issues that need more time to fix

3. **Build Command**:
   - Verify Vercel is using the correct build command: `npm run build`
   - Check that the output directory is set to `.next`

## Runtime Errors

### Symptoms
- Application deploys but shows errors when used
- API requests failing
- White screen or error page displayed

### Solutions
1. **Browser Console Errors**:
   - Check browser console for JavaScript errors
   - Look for network request failures

2. **API Endpoint Configuration**:
   - Verify API URLs are correctly set for the production environment
   - Check CORS settings if applicable

3. **Server Logs**:
   - Check Vercel logs for server-side errors
   - Look for issues with server-side rendering or API routes

## Custom Domain Issues

### Symptoms
- Domain not connecting to Vercel deployment
- SSL certificate errors
- Incorrect domain resolution

### Solutions
1. **DNS Verification**:
   - Verify DNS settings match Vercel's instructions
   - Check that TXT verification records are correctly set

2. **SSL/HTTPS Issues**:
   - Allow time for SSL certificate generation (up to 24 hours)
   - Temporarily disable forced HTTPS to test domain connection

3. **Domain Propagation**:
   - DNS changes may take up to 48 hours to fully propagate
   - Test using different networks and DNS resolvers

## Performance Issues

### Symptoms
- Slow page loads
- High memory usage
- Timeout errors

### Solutions
1. **Image Optimization**:
   - Utilize Next.js Image component for optimized image loading
   - Verify image formats and sizes are appropriate

2. **Bundle Size**:
   - Check bundle analyzer reports for unusually large dependencies
   - Implement code splitting for large components

3. **API Response Times**:
   - Monitor API response times and optimize slow endpoints
   - Implement caching where appropriate

## Getting Additional Help

If you encounter issues not covered in this guide:

1. Check the [Next.js documentation](https://nextjs.org/docs)
2. Review the [Vercel deployment documentation](https://vercel.com/docs)
3. Search for similar issues in the project repository
4. Contact the development team for assistance

Remember to include detailed error messages and steps to reproduce when reporting issues.
