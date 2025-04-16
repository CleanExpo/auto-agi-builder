# Oz Invoice Safeguard — Complete Cookbook (Part 2)

*Continuation from COOKBOOK.md*

## 7. API Integrations (continued)

### 7.1 Stripe Integration (continued)

#### 7.1.2 Payment Processing (continued)

```typescript
      // Confirm payment with Stripe.js
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={!stripe || loading}>
        {loading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
      </button>
    </form>
  );
};
```

#### 7.1.3 Webhook Handling

```typescript
// netlify/functions/stripe-webhook.ts
import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const handler: Handler = async (event) => {
  try {
    // Verify webhook signature
    const signature = event.headers['stripe-signature']!;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    const stripeEvent = stripe.webhooks.constructEvent(
      event.body!,
      signature,
      webhookSecret
    );

    // Handle different event types
    switch (stripeEvent.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(stripeEvent.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(stripeEvent.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    // Return successful response
    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    console.error('Webhook error:', error.message);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  // Extract invoice ID from metadata
  const invoiceId = paymentIntent.metadata.invoiceId;
  
  if (!invoiceId) {
    console.error('No invoice ID found in payment intent metadata');
    return;
  }
  
  // Update invoice status in database
  const { error } = await supabase
    .from('invoices')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', invoiceId);
    
  if (error) {
    console.error('Error updating invoice:', error.message);
    throw error;
  }
  
  console.log(`Invoice ${invoiceId} marked as paid`);
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  // Extract invoice ID from metadata
  const invoiceId = paymentIntent.metadata.invoiceId;
  
  if (!invoiceId) {
    console.error('No invoice ID found in payment intent metadata');
    return;
  }
  
  // Update invoice status in database
  const { error } = await supabase
    .from('invoices')
    .update({ status: 'payment_failed' })
    .eq('id', invoiceId);
    
  if (error) {
    console.error('Error updating invoice:', error.message);
    throw error;
  }
  
  console.log(`Invoice ${invoiceId} marked as payment_failed`);
}

export { handler };
```

### 7.2 SendGrid Integration

#### 7.2.1 Setup

1. Create a SendGrid account at [SendGrid Website](https://sendgrid.com)
2. Set up sender authentication (domain or single sender)
3. Create an API key with appropriate permissions

#### 7.2.2 Email Templates

Create email templates for:
- Invoice notifications
- Welcome emails
- Password reset
- Email verification

#### 7.2.3 Sending Emails

```typescript
// services/email.ts
import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export interface EmailOptions {
  to: string;
  subject: string;
  templateId: string;
  dynamicTemplateData: Record<string, any>;
}

export const emailService = {
  async sendEmail(options: EmailOptions): Promise<void> {
    const msg = {
      to: options.to,
      from: process.env.SENDER_EMAIL!,
      subject: options.subject,
      templateId: options.templateId,
      dynamicTemplateData: options.dynamicTemplateData,
    };
    
    try {
      await sgMail.send(msg);
      console.log(`Email sent to ${options.to}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  },
  
  async sendInvoiceNotification(invoice: Invoice, customer: Customer): Promise<void> {
    await this.sendEmail({
      to: customer.email,
      subject: `Invoice ${invoice.invoice_number} is ready`,
      templateId: process.env.INVOICE_TEMPLATE_ID!,
      dynamicTemplateData: {
        customer_name: customer.name,
        invoice_number: invoice.invoice_number,
        invoice_amount: invoice.amount.toFixed(2),
        invoice_date: new Date(invoice.created_at).toLocaleDateString(),
        due_date: new Date(invoice.due_date).toLocaleDateString(),
        invoice_url: `${process.env.APP_URL}/invoices/${invoice.id}`,
      },
    });
  },
  
  async sendWelcomeEmail(user: User): Promise<void> {
    await this.sendEmail({
      to: user.email,
      subject: 'Welcome to Oz Invoice Safeguard',
      templateId: process.env.WELCOME_TEMPLATE_ID!,
      dynamicTemplateData: {
        first_name: user.first_name,
        login_url: `${process.env.APP_URL}/login`,
      },
    });
  },
  
  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Reset your password',
      templateId: process.env.PASSWORD_RESET_TEMPLATE_ID!,
      dynamicTemplateData: {
        reset_url: `${process.env.APP_URL}/reset-password?token=${token}`,
      },
    });
  },
};
```

#### 7.2.4 Webhook Handling

```typescript
// netlify/functions/sendgrid-webhook.ts
import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const handler: Handler = async (event) => {
  try {
    // Parse webhook payload
    const payload = JSON.parse(event.body!);
    
    // Process events
    for (const event of payload) {
      await processEvent(event);
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    console.error('Webhook error:', error.message);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

async function processEvent(event: any) {
  const { email, event: eventType, timestamp } = event;
  
  // Log email event
  const { error } = await supabase
    .from('email_events')
    .insert([{
      email,
      event_type: eventType,
      timestamp: new Date(timestamp * 1000).toISOString(),
      metadata: JSON.stringify(event),
    }]);
    
  if (error) {
    console.error('Error logging email event:', error.message);
    throw error;
  }
  
  console.log(`Email event logged: ${eventType} for ${email}`);
}

export { handler };
```

### 7.3 Supabase Integration

#### 7.3.1 Client Setup

```typescript
// services/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

#### 7.3.2 Edge Functions

```typescript
// supabase/functions/verify-subscription/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Get user ID from request
    const { user_id } = await req.json();
    
    if (!user_id) {
      throw new Error('User ID is required');
    }
    
    // Check subscription status
    const { data, error } = await supabaseClient
      .from('subscriptions')
      .select('status, plan_id, current_period_end')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error) throw error;
    
    // Check if subscription is active
    const isActive = data && data.status === 'active' && new Date(data.current_period_end) > new Date();
    
    // Return subscription status
    return new Response(
      JSON.stringify({
        active: isActive,
        subscription: data || null,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    // Return error response
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
```

#### 7.3.3 Real-time Subscriptions

```typescript
// hooks/useRealtimeSubscription.ts
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

export function useRealtimeSubscription<T>(
  table: string,
  column: string,
  value: string,
  initialData: T[] = []
) {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Fetch initial data
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: initialData, error } = await supabase
          .from(table)
          .select('*')
          .eq(column, value);
          
        if (error) throw error;
        setData(initialData || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscription
    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: `${column}=eq.${value}`,
        },
        (payload) => {
          console.log('Change received:', payload);
          
          // Handle different change types
          if (payload.eventType === 'INSERT') {
            setData((current) => [...current, payload.new as T]);
          } else if (payload.eventType === 'UPDATE') {
            setData((current) =>
              current.map((item) =>
                (item as any).id === payload.new.id ? payload.new as T : item
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setData((current) =>
              current.filter((item) => (item as any).id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, column, value]);

  return { data, loading, error };
}
```

---

## 8. Security Best Practices

### 8.1 Data Encryption

#### 8.1.1 Encryption at Rest

Supabase PostgreSQL database provides encryption at rest for all data.

#### 8.1.2 Encryption in Transit

All API calls and data transfers use HTTPS/TLS.

#### 8.1.3 API Key Encryption

```typescript
// services/encryption.ts
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 64;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

export const encryptionService = {
  async encrypt(text: string, masterKey: string): Promise<string> {
    // Generate salt
    const salt = crypto.randomBytes(SALT_LENGTH);
    
    // Derive key using PBKDF2
    const key = crypto.pbkdf2Sync(
      masterKey,
      salt,
      ITERATIONS,
      KEY_LENGTH,
      'sha512'
    );
    
    // Generate initialization vector
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // Encrypt data
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get authentication tag
    const tag = cipher.getAuthTag();
    
    // Combine all parts: salt + iv + tag + encrypted
    const result = Buffer.concat([
      salt,
      iv,
      tag,
      Buffer.from(encrypted, 'hex'),
    ]).toString('base64');
    
    return result;
  },
  
  async decrypt(encryptedText: string, masterKey: string): Promise<string> {
    // Convert from base64 to buffer
    const data = Buffer.from(encryptedText, 'base64');
    
    // Extract parts
    const salt = data.subarray(0, SALT_LENGTH);
    const iv = data.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = data.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const encrypted = data.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH).toString('hex');
    
    // Derive key using PBKDF2
    const key = crypto.pbkdf2Sync(
      masterKey,
      salt,
      ITERATIONS,
      KEY_LENGTH,
      'sha512'
    );
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    // Decrypt data
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  },
};
```

### 8.2 Authentication Security

#### 8.2.1 Password Policies

```typescript
// utils/password.ts
export const passwordPolicy = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
};

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < passwordPolicy.minLength) {
    errors.push(`Password must be at least ${passwordPolicy.minLength} characters long`);
  }
  
  if (passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (passwordPolicy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (passwordPolicy.requireNumbers && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (passwordPolicy.requireSpecialChars && !/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
```

#### 8.2.2 Multi-Factor Authentication

```typescript
// components/auth/MfaSetup.tsx
import { useState } from 'react';
import { supabase } from '../../services/supabase';

export const MfaSetup: React.FC = () => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const generateMfaSecret = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call Supabase Edge Function to generate MFA secret
      const { data, error } = await supabase.functions.invoke('generate-mfa-secret');
      
      if (error) throw error;
      
      setQrCode(data.qrCode);
      setSecret(data.secret);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  const verifyAndEnableMfa = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!secret || !verificationCode) {
        throw new Error('Secret and verification code are required');
      }
      
      // Call Supabase Edge Function to verify and enable MFA
      const { data, error } = await supabase.functions.invoke('verify-mfa-setup', {
        body: { secret, code: verificationCode },
      });
      
      if (error) throw error;
      
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="mfa-setup">
      <h2>Set Up Two-Factor Authentication</h2>
      
      {!qrCode && (
        <button onClick={generateMfaSecret} disabled={loading}>
          {loading ? 'Generating...' : 'Generate QR Code'}
        </button>
      )}
      
      {qrCode && (
        <>
          <p>Scan this QR code with your authenticator app:</p>
          <div dangerouslySetInnerHTML={{ __html: qrCode }} />
          
          {secret && (
            <div className="secret-key">
              <p>Or enter this secret key manually:</p>
              <code>{secret}</code>
            </div>
          )}
          
          <div className="verification">
            <label htmlFor="verification-code">Enter verification code:</label>
            <input
              id="verification-code"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="000000"
            />
            
            <button onClick={verifyAndEnableMfa} disabled={loading || !verificationCode}>
              {loading ? 'Verifying...' : 'Verify and Enable'}
            </button>
          </div>
        </>
      )}
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">Two-factor authentication enabled successfully!</div>}
    </div>
  );
};
```

### 8.3 API Security

#### 8.3.1 Rate Limiting

```typescript
// middleware/rateLimit.ts
import { NextFunction, Request, Response } from 'express';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyGenerator?: (req: Request) => string;
  handler?: (req: Request, res: Response) => void;
}

export function rateLimit(options: RateLimitOptions) {
  const {
    windowMs = 60 * 1000, // 1 minute
    max = 100, // 100 requests per windowMs
    keyGenerator = (req) => `${req.ip}:${req.path}`,
    handler = (req, res) => {
      res.status(429).json({
        error: 'Too many requests, please try again later.',
      });
    },
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `rate-limit:${keyGenerator(req)}`;
    
    try {
      // Get current count
      const current = await redis.get(key);
      const count = current ? parseInt(current, 10) : 0;
      
      // Check if limit exceeded
      if (count >= max) {
        return handler(req, res);
      }
      
      // Increment count
      await redis.incr(key);
      
      // Set expiry if not already set
      if (count === 0) {
        await redis.expire(key, Math.floor(windowMs / 1000));
      }
      
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', max.toString());
      res.setHeader('X-RateLimit-Remaining', (max - count - 1).toString());
      
      next();
    } catch (error) {
      console.error('Rate limit error:', error);
      next();
    }
  };
}
```

#### 8.3.2 Input Validation

```typescript
// utils/validation.ts
import { z } from 'zod';

// Invoice schema
export const invoiceSchema = z.object({
  customer_id: z.string().uuid(),
  amount: z.number().positive(),
  status: z.enum(['draft', 'pending', 'paid', 'overdue', 'cancelled']),
  due_date: z.string().datetime(),
  invoice_number: z.string().min(1),
  notes: z.string().optional(),
});

// Customer schema
export const customerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

// Validate function
export function validate<T>(schema: z.ZodType<T>, data: unknown): { valid: boolean; errors: z.ZodError | null; data: T | null } {
  try {
    const validData = schema.parse(data);
    return {
      valid: true,
      errors: null,
      data: validData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error,
        data: null,
      };
    }
    throw error;
  }
}
```

### 8.4 Secrets Management

#### 8.4.1 Environment Variables

```typescript
// utils/env.ts
export function validateEnv(): { valid: boolean; missing: string[] } {
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'SENDGRID_API_KEY',
    'SENDER_EMAIL',
    'JWT_SECRET',
  ];
  
  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);
  
  return {
    valid: missing.length === 0,
    missing,
  };
}
```

#### 8.4.2 Docker Secrets

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    env_file:
      - .env.docker.local
    environment:
      - JWT_SECRET_FILE=/run/secrets/jwt_secret
      - STRIPE_SECRET_KEY_FILE=/run/secrets/stripe_secret_key
      - STRIPE_PUBLISHABLE_KEY_FILE=/run/secrets/stripe_publishable_key
      - STRIPE_WEBHOOK_SECRET_FILE=/run/secrets/stripe_webhook_secret
      - SENDGRID_API_KEY_FILE=/run/secrets/sendgrid_api_key
      - SUPABASE_KEY_FILE=/run/secrets/supabase_key
    secrets:
      - jwt_secret
      - stripe_secret_key
      - stripe_publishable_key
      - stripe_webhook_secret
      - sendgrid_api_key
      - supabase_key

secrets:
  jwt_secret:
    file: ./secrets/jwt_secret.txt
  stripe_secret_key:
    file: ./secrets/stripe_secret_key.txt
  stripe_publishable_key:
    file: ./secrets/stripe_publishable_key.txt
  stripe_webhook_secret:
    file: ./secrets/stripe_webhook_secret.txt
  sendgrid_api_key:
    file: ./secrets/sendgrid_api_key.txt
  supabase_key:
    file: ./secrets/supabase_key.txt
```

---

## 9. Testing

### 9.1 Frontend Testing

#### 9.1.1 Component Testing

```typescript
// components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button', () => {
  test('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
  
  test('applies variant class', () => {
    render(<Button variant="primary">Click me</Button>);
    expect(screen.getByText('Click me')).toHaveClass('btn-primary');
  });
  
  test('applies size class', () => {
    render(<Button size="large">Click me</Button>);
    expect(screen.getByText('Click me')).toHaveClass('btn-large');
  });
});
```

#### 9.1.2 Hook Testing

```typescript
// hooks/__tests__/useForm.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import useForm from '../useForm';

describe('useForm', () => {
  test('initializes with provided values', () => {
    const initialValues = { name: 'John', email: '' };
    const { result } = renderHook(() => useForm(initialValues));
    
    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
  });
  
  test('updates values on handleChange', () => {
    const initialValues = { name: '', email: '' };
    const { result } = renderHook(() => useForm(initialValues));
    
    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'John' },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    
    expect(result.current.values).toEqual({ name: 'John', email: '' });
  });
  
  test('updates touched on handleBlur', () => {
    const initialValues = { name: '', email: '' };
    const { result } = renderHook(() => useForm(initialValues));
    
    act(() => {
      result.current.handleBlur({
        target: { name: 'name' },
