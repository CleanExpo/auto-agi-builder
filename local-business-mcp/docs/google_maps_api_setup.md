# Google Maps Platform API Setup Guide

This guide will walk you through setting up the necessary Google Maps Platform APIs for the Local Business MCP application.

## Overview of Required APIs

The Local Business MCP application uses the following Google APIs:

1. **Places API**: For discovering and retrieving information about local businesses
2. **Geocoding API**: For converting addresses to geographic coordinates
3. **Maps JavaScript API**: For displaying maps in the web interface (optional)

## Setup Steps

### 1. Create a Google Cloud Platform Account

1. Visit the [Google Cloud Platform Console](https://console.cloud.google.com/)
2. Sign in with your Google account or create a new one
3. Accept the Google Cloud Platform terms of service

### 2. Create a New Project

1. In the Google Cloud Platform Console, click on the project dropdown at the top of the page
2. Click "New Project"
3. Enter a name for your project (e.g., "Local Business MCP")
4. Click "Create"
5. Wait for the project to be created and then select it from the dropdown

### 3. Enable the Required APIs

1. In the left sidebar, navigate to "APIs & Services" > "Library"
2. Search for and enable each of the following APIs:
   - **Places API**: Search for "Places API" and click on it
     - Click "Enable"
   - **Geocoding API**: Search for "Geocoding API" and click on it
     - Click "Enable"
   - **Maps JavaScript API** (optional): Search for "Maps JavaScript API" and click on it
     - Click "Enable"

### 4. Create API Key

1. In the left sidebar, navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" and select "API key"
3. Your new API key will be displayed. Copy this key as you will need it for your application
4. Click "Restrict key" to set up restrictions (recommended for production)

### 5. Set Up API Key Restrictions (Recommended)

To improve security, you should restrict your API key:

1. On the API key page, under "Application restrictions", select "HTTP referrers" for web applications or "IP addresses" for server applications
   - For development, you can add `localhost` and your development domain
   - For production, add your application's domain

2. Under "API restrictions", select "Restrict key"
   - Select the APIs you enabled earlier (Places API, Geocoding API, Maps JavaScript API)
   - Click "Save"

### 6. Billing Setup (Required)

Google Maps Platform requires billing to be enabled, even though there is a free tier:

1. In the left sidebar, navigate to "Billing"
2. Click "Link a billing account"
3. Follow the steps to set up billing information
   - Note: Google provides a generous free tier ($200 monthly credit), which is sufficient for most small to medium applications

### 7. Configure Your Local Business MCP Application

1. Create or edit the `.env` file in your project root directory
2. Add the following lines:

```
# Google Maps Platform API Keys
GOOGLE_MAPS_API_KEY=your_api_key_here
```

3. Replace `your_api_key_here` with the API key you created earlier

## Using the Places API in Development

When using the Places API for the first time, you'll need to test that it's working correctly:

1. Make sure you've added your API key to the `.env` file
2. Run the application setup: `python run.py init`
3. Test the Places API with a simple search:
   ```bash
   python run.py cli search --location "San Francisco, CA" --radius 5 --business-type restaurant
   ```

## Troubleshooting

### API Key Not Working

If your API key isn't working:

1. Check that you've enabled the correct APIs for your project
2. Verify that your API key is correctly entered in the `.env` file
3. Check if you have any API restrictions that might be blocking your requests
4. Verify your billing account is active

### Billing Issues

If you receive messages about billing:

1. Verify that billing is properly set up for your project
2. Check your Google Cloud Console to see if you've exceeded the free tier limits
3. Review your API usage metrics in the Google Cloud Console

### Quota Limits

If you hit quota limits:

1. Google Maps Platform has usage limits for the free tier
2. You can check your usage in the Google Cloud Console
3. Consider optimizing your API requests to reduce usage
4. For production environments, you may need to increase your quotas or budget

## Additional Resources

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Places API Documentation](https://developers.google.com/maps/documentation/places/web-service/overview)
- [Geocoding API Documentation](https://developers.google.com/maps/documentation/geocoding/overview)
- [Google Cloud Console](https://console.cloud.google.com/)
