# Oz Invoice Safeguard — Complete Cookbook (Part 3)

*Continuation from COOKBOOK_PART2.md*

## 9. Testing (continued)

### 9.1 Frontend Testing (continued)

#### 9.1.2 Hook Testing (continued)

```typescript
    act(() => {
      result.current.handleBlur({
        target: { name: 'name' },
      } as React.FocusEvent<HTMLInputElement>);
    });
    
    expect(result.current.touched).toEqual({ name: true });
  });
  
  test('resets form state', () => {
    const initialValues = { name: '', email: '' };
    const { result } = renderHook(() => useForm(initialValues));
    
    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'John' },
      } as React.ChangeEvent<HTMLInputElement>);
      
      result.current.handleBlur({
        target: { name: 'name' },
      } as React.FocusEvent<HTMLInputElement>);
      
      result.current.setErrors({ name: 'Name is required' });
    });
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
  });
});
```

### 9.2 Backend Testing

#### 9.2.1 Edge Function Testing

```typescript
// supabase/functions/invoice-operations/__tests__/index.test.ts
import { createClient } from '@supabase/supabase-js';
import { mockRequest, mockResponse } from '../../../test-utils';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

describe('invoice-operations', () => {
  let mockSupabase: any;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock Supabase client implementation
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
    };
    
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });
  
  test('createInvoice - success', async () => {
    // Mock successful response
    mockSupabase.insert.mockReturnThis();
    mockSupabase.select.mockResolvedValue({
      data: [{ id: '123', amount: 100 }],
      error: null,
    });
    
    // Create request
    const req = mockRequest({
      method: 'POST',
      body: {
        action: 'create',
        payload: {
          customer_id: '456',
          amount: 100,
          status: 'draft',
        },
      },
    });
    
    // Import handler (this will use the mocked Supabase client)
    const { handler } = await import('../index');
    
    // Call handler
    const res = await handler(req);
    const body = await res.json();
    
    // Assertions
    expect(res.status).toBe(200);
    expect(body).toEqual({ id: '123', amount: 100 });
    expect(mockSupabase.from).toHaveBeenCalledWith('invoices');
    expect(mockSupabase.insert).toHaveBeenCalledWith([{
      customer_id: '456',
      amount: 100,
      status: 'draft',
    }]);
  });
  
  test('createInvoice - error', async () => {
    // Mock error response
    mockSupabase.insert.mockReturnThis();
    mockSupabase.select.mockResolvedValue({
      data: null,
      error: { message: 'Database error' },
    });
    
    // Create request
    const req = mockRequest({
      method: 'POST',
      body: {
        action: 'create',
        payload: {
          customer_id: '456',
          amount: 100,
          status: 'draft',
        },
      },
    });
    
    // Import handler
    const { handler } = await import('../index');
    
    // Call handler
    const res = await handler(req);
    const body = await res.json();
    
    // Assertions
    expect(res.status).toBe(400);
    expect(body).toEqual({ error: 'Database error' });
  });
  
  // Additional tests for other actions...
});
```

#### 9.2.2 API Testing

```typescript
// netlify/functions/__tests__/stripe-webhook.test.ts
import { handler } from '../stripe-webhook';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Mock Stripe and Supabase
jest.mock('stripe');
jest.mock('@supabase/supabase-js');

describe('stripe-webhook', () => {
  let mockStripe: any;
  let mockSupabase: any;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock Stripe implementation
    mockStripe = {
      webhooks: {
        constructEvent: jest.fn(),
      },
    };
    (Stripe as unknown as jest.Mock).mockReturnValue(mockStripe);
    
    // Mock Supabase implementation
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
    };
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });
  
  test('handles payment_intent.succeeded event', async () => {
    // Mock Stripe webhook event
    const paymentIntent = {
      id: 'pi_123',
      metadata: {
        invoiceId: '456',
      },
    };
    
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'payment_intent.succeeded',
      data: {
        object: paymentIntent,
      },
    });
    
    // Mock Supabase response
    mockSupabase.eq.mockResolvedValue({
      error: null,
    });
    
    // Create event
    const event = {
      body: JSON.stringify({ id: 'evt_123' }),
      headers: {
        'stripe-signature': 'sig_123',
      },
    };
    
    // Call handler
    const response = await handler(event as any);
    
    // Assertions
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ received: true });
    expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
      event.body,
      'sig_123',
      expect.any(String)
    );
    expect(mockSupabase.from).toHaveBeenCalledWith('invoices');
    expect(mockSupabase.update).toHaveBeenCalledWith({
      status: 'paid',
      paid_at: expect.any(String),
    });
    expect(mockSupabase.eq).toHaveBeenCalledWith('id', '456');
  });
  
  test('handles webhook signature verification error', async () => {
    // Mock Stripe webhook error
    mockStripe.webhooks.constructEvent.mockImplementation(() => {
      throw new Error('Invalid signature');
    });
    
    // Create event
    const event = {
      body: JSON.stringify({ id: 'evt_123' }),
      headers: {
        'stripe-signature': 'invalid_sig',
      },
    };
    
    // Call handler
    const response = await handler(event as any);
    
    // Assertions
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({
      error: 'Invalid signature',
    });
  });
  
  // Additional tests for other event types...
});
```

### 9.3 End-to-End Testing

```typescript
// cypress/e2e/invoice-creation.cy.ts
describe('Invoice Creation', () => {
  beforeEach(() => {
    // Log in before each test
    cy.login('test@example.com', 'password');
    cy.visit('/invoices');
  });
  
  it('creates a new invoice', () => {
    // Click the "New Invoice" button
    cy.findByText('New Invoice').click();
    
    // Fill out the form
    cy.findByLabelText('Customer').select('Test Customer');
    cy.findByLabelText('Amount').type('100.00');
    cy.findByLabelText('Due Date').type('2025-05-01');
    cy.findByLabelText('Notes').type('Test invoice');
    
    // Submit the form
    cy.findByText('Create Invoice').click();
    
    // Verify success message
    cy.findByText('Invoice created successfully').should('be.visible');
    
    // Verify invoice appears in the list
    cy.visit('/invoices');
    cy.findByText('Test Customer').should('be.visible');
    cy.findByText('$100.00').should('be.visible');
  });
  
  it('validates required fields', () => {
    // Click the "New Invoice" button
    cy.findByText('New Invoice').click();
    
    // Submit without filling required fields
    cy.findByText('Create Invoice').click();
    
    // Verify validation errors
    cy.findByText('Customer is required').should('be.visible');
    cy.findByText('Amount is required').should('be.visible');
    cy.findByText('Due Date is required').should('be.visible');
  });
  
  it('allows editing an existing invoice', () => {
    // Find and click on an existing invoice
    cy.findByText('Test Customer').click();
    
    // Click edit button
    cy.findByText('Edit').click();
    
    // Update amount
    cy.findByLabelText('Amount').clear().type('200.00');
    
    // Save changes
    cy.findByText('Save Changes').click();
    
    // Verify success message
    cy.findByText('Invoice updated successfully').should('be.visible');
    
    // Verify updated amount
    cy.findByText('$200.00').should('be.visible');
  });
});
```

---

## 10. Deployment

### 10.1 Deployment Checklist

Before deploying, ensure the following:

1. All tests pass
2. Environment variables are configured
3. Database migrations are ready
4. Security policies are in place
5. API integrations are tested
6. Monitoring is configured

### 10.2 Supabase Deployment

#### 10.2.1 Database Migrations

```bash
# Apply migrations
supabase db push
```

#### 10.2.2 Edge Functions Deployment

```bash
# Deploy all functions
supabase functions deploy --project-ref your-project-ref

# Deploy specific function
supabase functions deploy invoice-operations --project-ref your-project-ref
```

#### 10.2.3 Environment Variables

Set environment variables in Supabase Dashboard:
1. Go to Project Settings → API → Edge Function Environment Variables
2. Add required environment variables

### 10.3 Netlify Deployment

#### 10.3.1 Netlify Configuration

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[dev]
  command = "npm run dev"
  port = 3000
  targetPort = 5173
  publish = "dist"
  autoLaunch = true

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 10.3.2 Environment Variables

Set environment variables in Netlify Dashboard:
1. Go to Site Settings → Build & Deploy → Environment Variables
2. Add required environment variables

#### 10.3.3 Deployment Command

```bash
# Deploy to Netlify
netlify deploy --prod
```

### 10.4 Docker Deployment

#### 10.4.1 Building Docker Image

```bash
# Build Docker image
docker build -t oz-invoice-safeguard .
```

#### 10.4.2 Running with Docker Compose

```bash
# Start services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### 10.4.3 Production Deployment

For production deployment with Docker:

1. Use a reverse proxy (like Nginx) for SSL termination
2. Set up proper volume mounts for persistent data
3. Configure health checks
4. Set up monitoring and logging

---

## 11. Monitoring and Maintenance

### 11.1 Logging

#### 11.1.1 Frontend Logging

```typescript
// services/logger.ts
interface LogOptions {
  level: 'info' | 'warn' | 'error';
  context?: Record<string, any>;
}

export const logger = {
  info(message: string, context?: Record<string, any>) {
    this.log(message, { level: 'info', context });
  },
  
  warn(message: string, context?: Record<string, any>) {
    this.log(message, { level: 'warn', context });
  },
  
  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log(message, {
      level: 'error',
      context: {
        ...context,
        error: error ? {
          message: error.message,
          stack: error.stack,
          name: error.name,
        } : undefined,
      },
    });
  },
  
  log(message: string, options: LogOptions) {
    const { level, context } = options;
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console[level](message, context);
    }
    
    // Log to Sentry in production
    if (import.meta.env.PROD) {
      // Send to Sentry or other logging service
      const sentryEnabled = import.meta.env.VITE_SENTRY_DSN;
      
      if (sentryEnabled && window.Sentry) {
        if (level === 'error') {
          window.Sentry.captureException(new Error(message), {
            extra: context,
          });
        } else {
          window.Sentry.captureMessage(message, {
            level,
            extra: context,
          });
        }
      }
    }
  },
};
```

#### 11.1.2 Backend Logging

```typescript
// supabase/functions/utils/logger.ts
export interface LogOptions {
  level: 'info' | 'warn' | 'error';
  context?: Record<string, any>;
}

export const logger = {
  info(message: string, context?: Record<string, any>) {
    this.log(message, { level: 'info', context });
  },
  
  warn(message: string, context?: Record<string, any>) {
    this.log(message, { level: 'warn', context });
  },
  
  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log(message, {
      level: 'error',
      context: {
        ...context,
        error: error ? {
          message: error.message,
          stack: error.stack,
          name: error.name,
        } : undefined,
      },
    });
  },
  
  log(message: string, options: LogOptions) {
    const { level, context } = options;
    
    // Format log entry
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...context,
    };
    
    // Log to console
    console[level](JSON.stringify(logEntry));
    
    // In a production environment, you might want to send logs to a service
    // This could be implemented by calling another Edge Function or API
  },
};
```

### 11.2 Monitoring

#### 11.2.1 Health Checks

```typescript
// netlify/functions/health-check.ts
import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const handler: Handler = async () => {
  try {
    // Check database connection
    const { data, error } = await supabase
      .from('health_checks')
      .select('id')
      .limit(1);
      
    if (error) throw error;
    
    // Check Stripe API
    const stripeEnabled = !!process.env.STRIPE_SECRET_KEY;
    let stripeStatus = 'disabled';
    
    if (stripeEnabled) {
      try {
        const Stripe = require('stripe');
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        await stripe.paymentIntents.list({ limit: 1 });
        stripeStatus = 'connected';
      } catch (err) {
        stripeStatus = 'error';
      }
    }
    
    // Check SendGrid API
    const sendgridEnabled = !!process.env.SENDGRID_API_KEY;
    let sendgridStatus = 'disabled';
    
    if (sendgridEnabled) {
      try {
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        // Just validate the API key, don't send an actual email
        sendgridStatus = 'connected';
      } catch (err) {
        sendgridStatus = 'error';
      }
    }
    
    // Return health status
    return {
      statusCode: 200,
      body: JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'connected',
          stripe: stripeStatus,
          sendgrid: sendgridStatus,
        },
      }),
    };
  } catch (error) {
    console.error('Health check failed:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      }),
    };
  }
};

export { handler };
```

#### 11.2.2 Performance Monitoring

```typescript
// services/performance.ts
export const performanceMonitor = {
  startMeasurement(name: string) {
    if (window.performance && window.performance.mark) {
      window.performance.mark(`${name}-start`);
    }
  },
  
  endMeasurement(name: string) {
    if (window.performance && window.performance.mark && window.performance.measure) {
      window.performance.mark(`${name}-end`);
      window.performance.measure(name, `${name}-start`, `${name}-end`);
      
      const measures = window.performance.getEntriesByName(name, 'measure');
      if (measures.length > 0) {
        const duration = measures[0].duration;
        console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
        
        // Send to analytics in production
        if (import.meta.env.PROD) {
          // Example: send to Google Analytics
          if (window.gtag) {
            window.gtag('event', 'timing_complete', {
              name,
              value: duration,
              event_category: 'Performance',
            });
          }
        }
        
        return duration;
      }
    }
    
    return null;
  },
  
  clearMeasurements() {
    if (window.performance && window.performance.clearMarks && window.performance.clearMeasures) {
      window.performance.clearMarks();
      window.performance.clearMeasures();
    }
  },
};
```

### 11.3 Error Handling

#### 11.3.1 Global Error Boundary

```tsx
// components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../services/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error
    logger.error('Error boundary caught an error', error, {
      componentStack: errorInfo.componentStack,
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Render fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>We're sorry, but an error occurred. Please try again or contact support if the problem persists.</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### 11.3.2 API Error Handling

```typescript
// services/api.ts
import { logger } from './logger';

export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `API error: ${response.status} ${response.statusText}`;
    let errorData: any = null;
    
    try {
      errorData = await response.json();
      if (errorData && errorData.error) {
        errorMessage = errorData.error;
      }
    } catch (e) {
      // Ignore JSON parsing error
    }
    
    logger.error(errorMessage, null, {
      status: response.status,
      url: response.url,
      errorData,
    });
    
    throw new ApiError(errorMessage, response.status);
  }
  
  return response.json();
}
```

### 11.4 Backup and Recovery

#### 11.4.1 Database Backup

```bash
# Backup Supabase database
supabase db dump -f backup.sql
```

#### 11.4.2 Automated Backup Script

```bash
#!/bin/bash
# backup.sh

# Configuration
BACKUP_DIR="/path/to/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"
LOG_FILE="$BACKUP_DIR/backup_log.txt"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Log start
echo "$(date): Starting backup..." >> "$LOG_FILE"

# Run backup
supabase db dump -f "$BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ]; then
  echo "$(date): Backup completed successfully: $BACKUP_FILE" >> "$LOG_FILE"
  
  # Compress backup
  gzip "$BACKUP_FILE"
  echo "$(date): Backup compressed: $BACKUP_FILE.gz" >> "$LOG_FILE"
  
  # Clean up old backups (keep last 7 days)
  find "$BACKUP_DIR" -name "backup_*.sql.gz" -type f -mtime +7 -delete
  echo "$(date): Cleaned up old backups" >> "$LOG_FILE"
else
  echo "$(date): Backup failed" >> "$LOG_FILE"
  exit 1
fi
```

---

## 12. Troubleshooting

### 12.1 Common Issues

#### 12.1.1 Authentication Issues

**Issue**: Users unable to log in or receive "Invalid credentials" errors.

**Solutions**:
1. Check if the user's email is verified
2. Verify Supabase auth configuration
3. Check for rate limiting or IP blocking
4. Ensure the correct API keys are being used

#### 12.1.2 Payment Processing Issues

**Issue**: Payments failing or not being processed.

**Solutions**:
1. Check Stripe webhook logs for errors
2. Verify webhook signature is correct
3. Ensure the correct API keys are being used
4. Check for test mode vs. live mode configuration
5. Verify the customer's payment method is valid

#### 12.1.3 Email Delivery Issues

**Issue**: Emails not being delivered or bouncing.

**Solutions**:
1. Check SendGrid logs for errors
2. Verify sender authentication is set up correctly
3. Check for email template issues
4. Ensure the correct API keys are being used
5. Verify recipient email addresses are valid

### 12.2 Debugging Techniques

#### 12.2.1 Frontend Debugging

```typescript
// Debug React component re-renders
import { useEffect, useRef } from 'react';

function useRenderCounter(componentName: string) {
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current += 1;
    console.log(`${componentName} rendered ${renderCount.current} times`);
  });
}

// Usage in component
function MyComponent() {
  useRenderCounter('MyComponent');
  // ...
}
```

#### 12.2.2 Backend Debugging

```typescript
// Debug Supabase queries
const { data, error } = await supabase
  .from('invoices')
  .select('*')
  .eq('id', '123');

console.log('Query result:', { data, error });
console.log('SQL query:', supabase.from('invoices').select('*').eq('id', '123').toSQL());
```

### 12.3 Troubleshooting Guides

#### 12.3.1 Database Connection Issues

1. Check database credentials
2. Verify network connectivity
3. Check for IP restrictions
4. Verify SSL configuration
5. Check for database resource limits

#### 12.3.2 API Integration Issues

1. Verify API keys and credentials
2. Check request and response formats
3. Verify webhook configurations
4. Check for rate limiting
5. Verify SSL/TLS configuration

---

## 13. User Guides

### 13.1 Admin Guide

#### 13.1.1 User Management

1. Navigate to Admin → Users
2. View, create, edit, or delete users
3. Assign roles and permissions
4. Reset user passwords
5. View user activity logs

#### 13.1.2 Subscription Management

1. Navigate to Admin → Subscriptions
2. View active and expired subscriptions
3. Upgrade or downgrade subscriptions
4. Cancel subscriptions
5. View payment history

#### 13.1.3 System Configuration

1. Navigate to Admin → Settings
2. Configure system-wide settings
3. Manage API integrations
4. Configure email templates
5. View system logs

### 13.2 User Guide

#### 13.2.1 Getting Started

1. Sign up for an account
2. Verify your email address
3. Complete your profile
4. Set up your company information
5. Invite team members

#### 13.2.2 Creating Invoices

1. Navigate to Invoices → New Invoice
2. Select a customer or create a new one
3. Add line items and set prices
4. Set due date and payment terms
5. Save as draft or send to customer

#### 13.2.3 Managing Jobs and Claims

1. Navigate to Jobs → New Job
2. Enter job details and claim information
3. Upload photos and documentation
4. Add moisture readings and equipment tracking
5. Generate reports and invoices

#### 13.2.4 Reports and Analytics

1. Navigate to Reports
2. View financial reports
3. Analyze job performance
4. Track payment status
5. Export data for accounting

---

This completes the comprehensive cookbook for the Oz Invoice Safeguard SaaS application. The cookbook provides detailed guidance for understanding, developing, deploying, and maintaining the application, covering all aspects from system architecture to user guides.
