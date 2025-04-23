# Analytics Implementation for Auto AGI Builder

This document provides a comprehensive overview of the analytics system implemented in the Auto AGI Builder application. The system is designed to track user behavior, application performance, and business metrics while complying with privacy regulations.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Key Components](#key-components)
- [Integration Points](#integration-points)
- [Event Tracking Taxonomy](#event-tracking-taxonomy)
- [Privacy and Compliance](#privacy-and-compliance)
- [Configuration Options](#configuration-options)
- [Extending the System](#extending-the-system)

## Architecture Overview

The analytics system is built with a modular architecture that supports multiple analytics providers and custom event tracking. At its core, the system consists of:

1. **Analytics Utility Library**: A JavaScript utility that provides a consistent API for tracking events, page views, and user actions.
2. **Consent Management**: A React component that handles user consent for analytics tracking in compliance with privacy regulations.
3. **Configuration System**: Environment variables and settings to configure the analytics system across environments.
4. **Backend Integration**: Optional backend tracking for server-side events and metrics.

The system supports Google Analytics, Google Tag Manager, and custom event handlers, with the ability to expand to additional providers as needed.

## Key Components

### Analytics Utility (`frontend/utils/analytics.js`)

The core utility that provides a standardized API for tracking:

- **Page Views**: When users navigate between pages or views
- **Events**: User interactions like clicks, form submissions, etc.
- **User Actions**: Login, registration, profile updates, etc.
- **Performance Metrics**: Load times, render times, API response times
- **Errors**: Client-side errors and exceptions
- **Feature Usage**: Tracking which features are being used

Key features of the utility include:

- Lazy loading of analytics scripts
- Support for multiple tracking services
- Consistent event taxonomy
- Queue for events captured before initialization
- Debug mode for development
- Consent-based tracking

### Consent Management (`frontend/components/common/AnalyticsConsent.js`)

A React component that:

- Displays a consent banner when required
- Manages user consent cookies
- Initializes analytics only after consent is given
- Provides opt-out functionality
- Supports customization of the consent UI

### App Integration (`frontend/pages/_app.js`)

The analytics system is integrated at the application root level to ensure:

- Consistent tracking across all pages
- Automatic page view tracking with route changes
- Access to router and user context

## Integration Points

The analytics system integrates with the application at multiple points:

1. **Page Views**: Automatically tracked with Next.js route changes
2. **API Requests**: Can be integrated with API client to track response times and errors
3. **Error Boundary**: Integrated with error handling to track client-side errors
4. **User Authentication**: Connected to auth flows to track user behavior
5. **Feature Components**: Individual features can track specific metrics

## Event Tracking Taxonomy

To ensure consistent and meaningful analytics data, the system uses a standardized taxonomy:

### Event Categories

- `user`: User-related events (login, registration, profile updates)
- `project`: Project management events
- `prototype`: Prototype generation and viewing
- `requirement`: Requirement management
- `document`: Document upload and analysis
- `roi`: ROI calculator usage
- `device_preview`: Device preview interactions
- `roadmap`: Roadmap visualization usage
- `presentation`: Presentation mode activities
- `export`: Data export events
- `api`: API interactions
- `error`: Error events
- `performance`: Performance metrics
- `feature`: Feature usage

### Event Actions

- **General**: `view`, `create`, `update`, `delete`, `search`, `filter`, `sort`, etc.
- **User**: `login`, `logout`, `register`, `profile_update`, etc.
- **Navigation**: `navigate`, `open_modal`, `close_modal`
- **Interaction**: `toggle`, `select`, `submit`, `cancel`
- **Performance**: `load_time`, `render_time`, `api_response_time`

## Privacy and Compliance

The analytics system is designed with privacy regulations in mind:

1. **Consent Management**: 
   - Explicit consent required in applicable regions
   - Persistent consent preferences
   - Easy opt-out mechanism

2. **Data Minimization**:
   - No collection of personally identifiable information (PII)
   - Anonymization of user IDs
   - Limited retention periods

3. **Transparency**:
   - Clear consent notices
   - Link to privacy policy
   - Information about data usage

## Configuration Options

The analytics system can be configured through environment variables:

```env
# Analytics Provider IDs
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=UA-XXXXXXXXX-X
NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID=GTM-XXXXXXX

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_REQUIRE_ANALYTICS_CONSENT=true

# Debug Mode
NEXT_PUBLIC_DEBUG=false
```

Additional runtime configuration options:

- Consent requirements
- Services to enable
- Debug mode
- Custom event handlers

## Extending the System

The analytics system can be extended in several ways:

1. **Additional Providers**: Add new analytics services by extending the initialization logic
2. **Custom Event Handlers**: Register custom event handlers for special-case tracking
3. **Backend Integration**: Add server-side tracking for events that don't occur in the browser
4. **Enhanced Privacy Controls**: Add more granular consent options for different tracking types

### Example: Adding a Custom Event Handler

```javascript
import analytics from '../utils/analytics';

// Register a custom event handler
analytics.registerCustomEventHandler((eventType, eventData) => {
  // Custom tracking logic
  console.log(`Custom tracking: ${eventType}`, eventData);
  
  // Send to your custom analytics service
  customAnalyticsService.track(eventType, eventData);
});

// Initialize analytics
analytics.initAnalytics({
  services: [
    analytics.AnalyticsServices.GOOGLE_ANALYTICS,
    analytics.AnalyticsServices.CUSTOM_EVENTS,
  ],
  userConsent: true,
});
```

### Example: Tracking a Custom Feature

```javascript
import analytics from '../utils/analytics';

function MyFeatureComponent() {
  const handleAction = () => {
    // Perform action
    
    // Track the action
    analytics.trackFeature(
      'my-feature',
      'custom-action',
      { additionalData: 'value' }
    );
  };
  
  return <button onClick={handleAction}>Perform Action</button>;
}
```

## Best Practices

1. **Consistent Naming**: Use the predefined event categories and actions
2. **Meaningful Labels**: Make event labels descriptive and unique
3. **Avoid PII**: Never include personal information in analytics events
4. **Performance Consideration**: Avoid tracking too many events that could affect performance
5. **Testing**: Verify tracking in development mode before deploying
6. **Regular Audits**: Periodically review what data is being collected
7. **Documentation**: Document new event categories and actions

By following these guidelines, the analytics implementation will provide valuable insights into user behavior and application performance while respecting user privacy and maintaining high performance.
