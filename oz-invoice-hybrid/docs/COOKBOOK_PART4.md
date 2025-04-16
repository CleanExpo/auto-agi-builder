# Oz Invoice Safeguard — Complete Cookbook (Part 4)

*Continuation from COOKBOOK_PART3.md*

## 14. Future Roadmap and Scalability Planning

### 14.1 Feature Roadmap

#### 14.1.1 Short-term Goals (0-3 months)

```markdown
| Priority | Feature | Description | Dependencies | Estimated Effort |
|----------|---------|-------------|--------------|------------------|
| High | Enhanced Dashboard Analytics | Add interactive charts and KPIs | None | 2 weeks |
| High | Bulk Invoice Processing | Allow creation and sending of multiple invoices | None | 3 weeks |
| Medium | Email Template Customization | Allow users to customize email templates | SendGrid integration | 2 weeks |
| Medium | Advanced Search Filters | Add more search options for invoices and customers | None | 1 week |
| Low | Dark Mode | Add dark mode support to the UI | None | 1 week |
```

#### 14.1.2 Mid-term Goals (3-12 months)

```markdown
| Priority | Feature | Description | Dependencies | Estimated Effort |
|----------|---------|-------------|--------------|------------------|
| High | Mobile App | Develop native mobile app for iOS and Android | API enhancements | 3 months |
| High | Insurance Carrier API Integration | Direct integration with major carriers | API development | 2 months |
| Medium | Advanced Reporting | Custom report builder with export options | Analytics engine | 2 months |
| Medium | Customer Portal | Self-service portal for customers | Auth enhancements | 2 months |
| Low | Multi-language Support | Add support for multiple languages | i18n framework | 1 month |
```

#### 14.1.3 Long-term Goals (1-3 years)

```markdown
| Priority | Feature | Description | Dependencies | Estimated Effort |
|----------|---------|-------------|--------------|------------------|
| High | AI-powered Document Analysis | Automatic extraction of data from documents | ML infrastructure | 6 months |
| High | Predictive Analytics | Forecast cash flow and business trends | Data warehouse | 4 months |
| Medium | Marketplace for Extensions | Allow third-party developers to create extensions | Plugin architecture | 6 months |
| Medium | Advanced Workflow Automation | Custom workflow builder for business processes | Workflow engine | 5 months |
| Low | Blockchain-based Verification | Immutable record of invoice transactions | Blockchain integration | 6 months |
```

### 14.2 Scalability Architecture

#### 14.2.1 Database Scaling

```typescript
// Database connection pooling configuration
const pool = new Pool({
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection to become available
});

// Example of implementing read replicas for scaling read operations
const masterClient = new Client({
  host: process.env.DB_MASTER_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const replicaClient = new Client({
  host: process.env.DB_REPLICA_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Use master for writes
async function executeWrite(query, params) {
  await masterClient.connect();
  try {
    return await masterClient.query(query, params);
  } finally {
    await masterClient.end();
  }
}

// Use replica for reads
async function executeRead(query, params) {
  await replicaClient.connect();
  try {
    return await replicaClient.query(query, params);
  } finally {
    await replicaClient.end();
  }
}
```

#### 14.2.2 Horizontal Scaling with Supabase

Supabase provides built-in scalability through its PostgreSQL infrastructure. Here's how to leverage it:

1. **Connection Pooling**: Enable connection pooling in Supabase dashboard to handle more concurrent connections.

2. **Read Replicas**: As your application grows, consider setting up read replicas for read-heavy operations.

3. **Database Partitioning**: For large tables, implement table partitioning:

```sql
-- Example of partitioning invoices table by date
CREATE TABLE invoices (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    customer_id UUID NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL
) PARTITION BY RANGE (created_at);

-- Create partitions for different date ranges
CREATE TABLE invoices_2024 PARTITION OF invoices
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE invoices_2025 PARTITION OF invoices
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- Add indexes to each partition
CREATE INDEX idx_invoices_2024_customer_id ON invoices_2024(customer_id);
CREATE INDEX idx_invoices_2025_customer_id ON invoices_2025(customer_id);
```

4. **Caching Strategy**: Implement Redis caching for frequently accessed data:

```typescript
// Redis caching implementation
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

async function getInvoiceWithCache(id) {
  // Try to get from cache first
  const cachedInvoice = await redis.get(`invoice:${id}`);
  
  if (cachedInvoice) {
    return JSON.parse(cachedInvoice);
  }
  
  // If not in cache, get from database
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  
  // Store in cache for future requests (expire after 1 hour)
  await redis.set(`invoice:${id}`, JSON.stringify(data), 'EX', 3600);
  
  return data;
}
```

#### 14.2.3 Frontend Scaling

1. **CDN Integration**: Use Netlify's global CDN for static assets:

```toml
# netlify.toml
[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

2. **Code Splitting**: Implement dynamic imports for route-based code splitting:

```typescript
// Route-based code splitting
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Invoices = lazy(() => import('./pages/Invoices'));
const Customers = lazy(() => import('./pages/Customers'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Switch>
          <Route exact path="/" component={Dashboard} />
          <Route path="/invoices" component={Invoices} />
          <Route path="/customers" component={Customers} />
          <Route path="/settings" component={Settings} />
        </Switch>
      </Suspense>
    </Router>
  );
}
```

3. **Server-Side Rendering**: For improved performance and SEO, consider implementing SSR:

```typescript
// server.js for SSR
import express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import App from './src/App';

const server = express();

server.get('*', (req, res) => {
  const context = {};
  const app = renderToString(
    <StaticRouter location={req.url} context={context}>
      <App />
    </StaticRouter>
  );
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Oz Invoice Safeguard</title>
        <link rel="stylesheet" href="/static/css/main.css">
      </head>
      <body>
        <div id="root">${app}</div>
        <script src="/static/js/main.js"></script>
      </body>
    </html>
  `;
  
  res.send(html);
});

server.listen(3000);
```

### 14.3 Performance Benchmarks

#### 14.3.1 Establishing Baseline Metrics

```typescript
// services/performance.ts
export interface PerformanceMetrics {
  apiResponseTime: Record<string, number>; // in ms
  pageLoadTime: Record<string, number>; // in ms
  databaseQueryTime: Record<string, number>; // in ms
  concurrentUsers: number;
  errorRate: number; // percentage
}

export const performanceTargets: PerformanceMetrics = {
  apiResponseTime: {
    getInvoice: 100, // ms
    listInvoices: 200, // ms
    createInvoice: 300, // ms
    updateInvoice: 200, // ms
  },
  pageLoadTime: {
    dashboard: 1000, // ms
    invoiceList: 800, // ms
    invoiceDetail: 600, // ms
    customerList: 800, // ms
  },
  databaseQueryTime: {
    getInvoice: 50, // ms
    listInvoices: 100, // ms
    createInvoice: 150, // ms
    updateInvoice: 100, // ms
  },
  concurrentUsers: 500,
  errorRate: 0.1, // 0.1%
};

export function measureApiPerformance(
  apiName: string,
  startTime: number
): void {
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.log(`API ${apiName} took ${duration.toFixed(2)}ms`);
  
  // Compare with target
  const target = performanceTargets.apiResponseTime[apiName] || 200;
  if (duration > target) {
    console.warn(`API ${apiName} exceeded target time of ${target}ms`);
  }
  
  // In production, send metrics to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Example: send to Google Analytics or custom metrics service
  }
}
```

#### 14.3.2 Load Testing Configuration

```javascript
// k6 load testing script (loadtest.js)
import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 }, // Ramp up to 50 users over 1 minute
    { duration: '3m', target: 50 }, // Stay at 50 users for 3 minutes
    { duration: '1m', target: 100 }, // Ramp up to 100 users over 1 minute
    { duration: '5m', target: 100 }, // Stay at 100 users for 5 minutes
    { duration: '1m', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'], // Less than 1% of requests should fail
  },
};

export default function() {
  // Test authentication
  const loginRes = http.post('https://api.example.com/auth/login', {
    email: 'test@example.com',
    password: 'password',
  });
  
  check(loginRes, {
    'login successful': (r) => r.status === 200,
    'has token': (r) => r.json('token') !== undefined,
  });
  
  const token = loginRes.json('token');
  
  // Test getting invoices
  const invoicesRes = http.get('https://api.example.com/invoices', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  check(invoicesRes, {
    'get invoices successful': (r) => r.status === 200,
    'invoices returned': (r) => Array.isArray(r.json('data')),
  });
  
  sleep(1);
}
```

## 15. Advanced DevOps and CI/CD

### 15.1 CI/CD Pipeline Configuration

#### 15.1.1 GitHub Actions Workflow

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
      
      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/test_db
          JWT_SECRET: test_secret
  
  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build
          path: dist
  
  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build
          path: dist
      
      - name: Deploy to Netlify (Staging)
        uses: netlify/actions/cli@master
        with:
          args: deploy --dir=dist --prod
        env:
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_STAGING_SITE_ID }}
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
      
      - name: Deploy Supabase Functions (Staging)
        run: |
          npm install -g supabase
          supabase functions deploy --project-ref ${{ secrets.SUPABASE_STAGING_PROJECT_REF }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
  
  deploy-production:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build
          path: dist
      
      - name: Deploy to Netlify (Production)
        uses: netlify/actions/cli@master
        with:
          args: deploy --dir=dist --prod
        env:
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_PRODUCTION_SITE_ID }}
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
      
      - name: Deploy Supabase Functions (Production)
        run: |
          npm install -g supabase
          supabase functions deploy --project-ref ${{ secrets.SUPABASE_PRODUCTION_PROJECT_REF }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

#### 15.1.2 CircleCI Configuration (Alternative)

```yaml
# .circleci/config.yml
version: 2.1

orbs:
  node: circleci/node@5.0.0
  postgres: circleci/postgres@1.5.0

jobs:
  test:
    docker:
      - image: cimg/node:18.18.0
      - image: cimg/postgres:15.0
        environment:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
    
    steps:
      - checkout
      - node/install-packages:
          pkg-manager: npm
      - run:
          name: Lint
          command: npm run lint
      - run:
          name: Type check
          command: npm run type-check
      - run:
          name: Run tests
          command: npm test
          environment:
            DATABASE_URL: postgres://postgres:postgres@localhost:5432/test_db
            JWT_SECRET: test_secret
  
  build:
    docker:
      - image: cimg/node:18.18.0
    
    steps:
      - checkout
      - node/install-packages:
          pkg-manager: npm
      - run:
          name: Build
          command: npm run build
      - persist_to_workspace:
          root: .
          paths:
            - dist
  
  deploy-staging:
    docker:
      - image: cimg/node:18.18.0
    
    steps:
      - checkout
      - attach_workspace:
          at: .
      - run:
          name: Install Netlify CLI
          command: npm install -g netlify-cli
      - run:
          name: Deploy to Netlify (Staging)
          command: netlify deploy --dir=dist --prod
          environment:
            NETLIFY_SITE_ID: ${NETLIFY_STAGING_SITE_ID}
            NETLIFY_AUTH_TOKEN: ${NETLIFY_AUTH_TOKEN}
      - run:
          name: Install Supabase CLI
          command: npm install -g supabase
      - run:
          name: Deploy Supabase Functions (Staging)
          command: supabase functions deploy --project-ref ${SUPABASE_STAGING_PROJECT_REF}
          environment:
            SUPABASE_ACCESS_TOKEN: ${SUPABASE_ACCESS_TOKEN}
  
  deploy-production:
    docker:
      - image: cimg/node:18.18.0
    
    steps:
      - checkout
      - attach_workspace:
          at: .
      - run:
          name: Install Netlify CLI
          command: npm install -g netlify-cli
      - run:
          name: Deploy to Netlify (Production)
          command: netlify deploy --dir=dist --prod
          environment:
            NETLIFY_SITE_ID: ${NETLIFY_PRODUCTION_SITE_ID}
            NETLIFY_AUTH_TOKEN: ${NETLIFY_AUTH_TOKEN}
      - run:
          name: Install Supabase CLI
          command: npm install -g supabase
      - run:
          name: Deploy Supabase Functions (Production)
          command: supabase functions deploy --project-ref ${SUPABASE_PRODUCTION_PROJECT_REF}
          environment:
            SUPABASE_ACCESS_TOKEN: ${SUPABASE_ACCESS_TOKEN}

workflows:
  version: 2
  test-build-deploy:
    jobs:
      - test
      - build:
          requires:
            - test
      - deploy-staging:
          requires:
            - build
          filters:
            branches:
              only: develop
      - deploy-production:
          requires:
            - build
          filters:
            branches:
              only: main
```

### 15.2 Blue/Green Deployment Strategy

#### 15.2.1 Netlify Blue/Green Deployment

Netlify provides built-in support for blue/green deployments through its deploy previews and branch deploys.

```bash
# Deploy the "blue" environment (current production)
netlify deploy --prod

# Deploy the "green" environment (new version) to a branch deploy
netlify deploy --alias green

# Test the green environment
# Run automated tests, manual verification, etc.

# Promote green to production (swap blue and green)
netlify deploy --prod --alias green
```

#### 15.2.2 Database Migrations with Zero Downtime

```typescript
// migrations/20250401_add_invoice_tags.ts
import { MigrationFn } from 'node-pg-migrate';

// Up migration - forward compatible with existing code
export const up: MigrationFn = async (pgm) => {
  // Step 1: Add new table without constraints
  pgm.createTable('invoice_tags', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    invoice_id: { type: 'uuid', notNull: true },
    tag: { type: 'text', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
  });
  
  // Step 2: Create index for performance
  pgm.createIndex('invoice_tags', 'invoice_id');
  
  // Step 3: Add foreign key constraint last (after deployment)
  // This is done in a separate migration to allow zero-downtime deployment
};

// Down migration
export const down: MigrationFn = async (pgm) => {
  pgm.dropTable('invoice_tags');
};

// migrations/20250402_add_invoice_tags_constraints.ts
export const up: MigrationFn = async (pgm) => {
  // Add foreign key constraint after the new code is deployed
  pgm.addConstraint('invoice_tags', 'invoice_tags_invoice_id_fkey', {
    foreignKeys: {
      columns: 'invoice_id',
      references: 'invoices(id)',
      onDelete: 'CASCADE',
    },
  });
};

export const down: MigrationFn = async (pgm) => {
  pgm.dropConstraint('invoice_tags', 'invoice_tags_invoice_id_fkey');
};
```

### 15.3 Infrastructure as Code

#### 15.3.1 Terraform Configuration for AWS

```hcl
# main.tf
provider "aws" {
  region = var.aws_region
}

# S3 bucket for static assets
resource "aws_s3_bucket" "static_assets" {
  bucket = "${var.project_name}-static-assets"
  acl    = "private"
  
  versioning {
    enabled = true
  }
  
  lifecycle_rule {
    enabled = true
    
    noncurrent_version_expiration {
      days = 30
    }
  }
  
  tags = {
    Name        = "${var.project_name}-static-assets"
    Environment = var.environment
  }
}

# CloudFront distribution for CDN
resource "aws_cloudfront_distribution" "cdn" {
  origin {
    domain_name = aws_s3_bucket.static_assets.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.static_assets.bucket}"
    
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }
  
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.static_assets.bucket}"
    
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
    
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }
  
  price_class = "PriceClass_100"
  
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  
  viewer_certificate {
    cloudfront_default_certificate = true
  }
  
  tags = {
    Name        = "${var.project_name}-cdn"
    Environment = var.environment
  }
}

# RDS PostgreSQL instance
resource "aws_db_instance" "postgres" {
  allocated_storage    = 20
  storage_type         = "gp2"
  engine               = "postgres"
  engine_version       = "15.0"
  instance_class       = "db.t3.micro"
  name                 = var.db_name
  username             = var.db_username
  password             = var.db_password
  parameter_group_name = "default.postgres15"
  skip_final_snapshot  = true
  
  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "mon:04:00-mon:05:00"
  
  vpc_security_group_ids = [aws_security_group.db.id]
  db_subnet_group_name   = aws_db_subnet_group.db.name
  
  tags = {
    Name        = "${var.project_name}-db"
    Environment = var.environment
  }
}

# Redis for caching
resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "${var.project_name}-redis"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis6.x"
  engine_version       = "6.x"
  port                 = 6379
  
  subnet_group_name    = aws_elasticache_subnet_group.redis.name
  security_group_ids   = [aws_security_group.redis.id]
  
  tags = {
    Name        = "${var.project_name}-redis"
    Environment = var.environment
  }
}

# Variables
variable "aws_region" {
  description = "AWS region"
  default     = "us-west-2"
}

variable "project_name" {
  description = "Project name"
  default     = "oz-invoice-safeguard"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  default     = "dev"
}

variable "db_name" {
  description = "Database name"
  default     = "oz_invoice"
}

variable "db_username" {
  description = "Database username"
  sensitive   = true
}

variable "db_password" {
  description = "Database password"
  sensitive   = true
}

# Outputs
output "cloudfront_domain_name" {
  value = aws_cloudfront_distribution.cdn.domain_name
}

output "db_endpoint" {
  value = aws_db_instance.postgres.endpoint
}

output "redis_endpoint" {
  value = aws_elasticache_cluster.redis.cache_nodes.0.address
}
```

#### 15.3.2 Kubernetes Manifests

```yaml
# kubernetes/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: oz-invoice-safeguard

---
# kubernetes/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: oz-invoice-safeguard
type: Opaque
data:
  JWT_SECRET: <base64-encoded-jwt-secret>
  STRIPE_SECRET_KEY: <base64-encoded-stripe-secret-key>
  STRIPE_WEBHOOK_SECRET: <base64-encoded-stripe-webhook-secret>
  SENDGRID_API_KEY: <base64-encoded-sendgrid-api-key>
  SUPABASE_SERVICE_ROLE_KEY: <base64-encoded-supabase-key>

---
# kubernetes/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: oz-invoice-safeguard
data:
  NODE_ENV: "production"
  PORT: "3000"
  HOST: "0.0.0.0"
  SUPABASE_URL: "https://your-project.supabase.co"
  STRIPE_PUBLISHABLE_KEY: "pk_live_your_publishable_key"
  SENDER_EMAIL: "invoices@example.com"

---
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
  namespace: oz-invoice-safeguard
spec:
  replicas: 3
  selector:
    matchLabels:
      app: oz-invoice-safeguard
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: oz-invoice-safeguard
    spec:
      containers:
      - name: app
        image: your-registry/oz-invoice-safeguard:latest
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: app-config
        - secretRef:
            name: app-secrets
        resources:
          requests:
            cpu: "100m"
            memory: "256Mi"
          limits:
            cpu: "500m"
            memory: "512Mi"
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 15
          periodSeconds: 20

---
# kubernetes/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: app
  namespace: oz-invoice-safeguard
spec:
  selector:
    app: oz-invoice-safeguard
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP

---
# kubernetes/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
