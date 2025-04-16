# Oz Invoice Safeguard — Complete Cookbook (Part 5)

*Continuation from COOKBOOK_PART4.md*

## 16. Disaster Recovery and Business Continuity

### 16.1 Recovery Point Objectives (RPO) and Recovery Time Objectives (RTO)

#### 16.1.1 Defining RPO and RTO

```markdown
| Service Component | Recovery Point Objective (RPO) | Recovery Time Objective (RTO) | Criticality |
|-------------------|-------------------------------|-------------------------------|-------------|
| Database          | 1 hour                        | 4 hours                       | Critical    |
| Frontend          | 24 hours                      | 2 hours                       | High        |
| Edge Functions    | 24 hours                      | 2 hours                       | High        |
| Netlify Functions | 24 hours                      | 2 hours                       | High        |
| Email Service     | 24 hours                      | 8 hours                       | Medium      |
| Payment Processing| 1 hour                        | 4 hours                       | Critical    |
```

#### 16.1.2 Backup Strategy

```typescript
// scripts/backup-database.ts
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

async function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '../backups');
  const backupFile = path.join(backupDir, `backup-${timestamp}.sql`);
  
  // Create backup directory if it doesn't exist
  await fs.mkdir(backupDir, { recursive: true });
  
  // Run pg_dump to create backup
  const command = `pg_dump -h ${process.env.DB_HOST} -U ${process.env.DB_USER} -d ${process.env.DB_NAME} -f ${backupFile}`;
  
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Backup failed: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        console.error(`Backup stderr: ${stderr}`);
      }
      console.log(`Backup created at ${backupFile}`);
      resolve(backupFile);
    });
  });
}

async function compressBackup(backupFile: string) {
  const command = `gzip ${backupFile}`;
  
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Compression failed: ${error.message}`);
        return reject(error);
      }
      console.log(`Backup compressed: ${backupFile}.gz`);
      resolve(`${backupFile}.gz`);
    });
  });
}

async function uploadToS3(compressedFile: string) {
  const command = `aws s3 cp ${compressedFile} s3://${process.env.BACKUP_BUCKET}/database/`;
  
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Upload failed: ${error.message}`);
        return reject(error);
      }
      console.log(`Backup uploaded to S3: ${stdout}`);
      resolve(stdout);
    });
  });
}

async function cleanupOldBackups() {
  const backupDir = path.join(__dirname, '../backups');
  const files = await fs.readdir(backupDir);
  
  // Keep only the last 7 days of backups
  const oldFiles = files
    .filter(file => file.startsWith('backup-') && file.endsWith('.sql.gz'))
    .sort()
    .slice(0, -7);
  
  for (const file of oldFiles) {
    await fs.unlink(path.join(backupDir, file));
    console.log(`Deleted old backup: ${file}`);
  }
}

async function main() {
  try {
    const backupFile = await backupDatabase();
    const compressedFile = await compressBackup(backupFile as string);
    await uploadToS3(compressedFile as string);
    await cleanupOldBackups();
    console.log('Backup process completed successfully');
  } catch (error) {
    console.error('Backup process failed:', error);
    process.exit(1);
  }
}

main();
```

### 16.2 Disaster Recovery Procedures

#### 16.2.1 Database Recovery

```bash
#!/bin/bash
# database-recovery.sh

# Configuration
BACKUP_BUCKET="oz-invoice-safeguard-backups"
BACKUP_PATH="database"
RECOVERY_DIR="/tmp/recovery"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-oz_invoice}"
DB_USER="${DB_USER:-postgres}"

# Create recovery directory
mkdir -p "$RECOVERY_DIR"

# Get latest backup from S3
LATEST_BACKUP=$(aws s3 ls "s3://$BACKUP_BUCKET/$BACKUP_PATH/" | sort | tail -n 1 | awk '{print $4}')
if [ -z "$LATEST_BACKUP" ]; then
  echo "No backup found in S3 bucket"
  exit 1
fi

echo "Latest backup: $LATEST_BACKUP"

# Download backup
aws s3 cp "s3://$BACKUP_BUCKET/$BACKUP_PATH/$LATEST_BACKUP" "$RECOVERY_DIR/$LATEST_BACKUP"

# Decompress backup
gunzip "$RECOVERY_DIR/$LATEST_BACKUP"
DECOMPRESSED_BACKUP="${RECOVERY_DIR}/${LATEST_BACKUP%.gz}"

# Restore database
echo "Restoring database from backup..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$DECOMPRESSED_BACKUP"

# Check restoration status
if [ $? -eq 0 ]; then
  echo "Database restored successfully"
else
  echo "Database restoration failed"
  exit 1
fi

# Clean up
rm -rf "$RECOVERY_DIR"
```

#### 16.2.2 Application Recovery

```yaml
# disaster-recovery-playbook.yml
---
- name: Recover Application
  hosts: all
  become: yes
  vars:
    app_name: oz-invoice-safeguard
    app_version: "{{ lookup('env', 'APP_VERSION') }}"
    environment: "{{ lookup('env', 'ENVIRONMENT') }}"
  
  tasks:
    - name: Check if recovery is needed
      uri:
        url: "https://{{ app_name }}-{{ environment }}.netlify.app/health"
        method: GET
        status_code: 200
      register: health_check
      ignore_errors: yes
      
    - name: Set recovery needed flag
      set_fact:
        recovery_needed: "{{ health_check.status != 200 }}"
      
    - name: Notify recovery start
      debug:
        msg: "Starting recovery process for {{ app_name }} ({{ environment }})"
      when: recovery_needed
      
    - name: Deploy frontend from backup
      shell: |
        netlify deploy --prod --dir=backup/dist --site={{ lookup('env', 'NETLIFY_SITE_ID') }}
      environment:
        NETLIFY_AUTH_TOKEN: "{{ lookup('env', 'NETLIFY_AUTH_TOKEN') }}"
      when: recovery_needed
      
    - name: Deploy Supabase functions from backup
      shell: |
        supabase functions deploy --project-ref {{ lookup('env', 'SUPABASE_PROJECT_REF') }}
      environment:
        SUPABASE_ACCESS_TOKEN: "{{ lookup('env', 'SUPABASE_ACCESS_TOKEN') }}"
      when: recovery_needed
      
    - name: Verify recovery
      uri:
        url: "https://{{ app_name }}-{{ environment }}.netlify.app/health"
        method: GET
        status_code: 200
      register: recovery_check
      ignore_errors: yes
      when: recovery_needed
      
    - name: Report recovery status
      debug:
        msg: "Recovery {{ 'successful' if recovery_check.status == 200 else 'failed' }}"
      when: recovery_needed
```

### 16.3 Failover Architecture

#### 16.3.1 Multi-Region Setup

```hcl
# terraform/multi-region.tf
provider "aws" {
  alias  = "primary"
  region = "us-west-2"
}

provider "aws" {
  alias  = "secondary"
  region = "us-east-1"
}

# Primary region resources
module "primary" {
  source      = "./modules/region"
  providers   = {
    aws = aws.primary
  }
  environment = "production"
  region_name = "primary"
  is_primary  = true
}

# Secondary region resources
module "secondary" {
  source      = "./modules/region"
  providers   = {
    aws = aws.secondary
  }
  environment = "production"
  region_name = "secondary"
  is_primary  = false
}

# Route 53 health checks and failover
resource "aws_route53_health_check" "primary" {
  fqdn              = module.primary.endpoint
  port              = 443
  type              = "HTTPS"
  resource_path     = "/health"
  failure_threshold = 3
  request_interval  = 30
  
  tags = {
    Name = "primary-health-check"
  }
}

resource "aws_route53_record" "primary" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "api.example.com"
  type    = "A"
  
  failover_routing_policy {
    type = "PRIMARY"
  }
  
  set_identifier  = "primary"
  health_check_id = aws_route53_health_check.primary.id
  alias {
    name                   = module.primary.dns_name
    zone_id                = module.primary.zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "secondary" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "api.example.com"
  type    = "A"
  
  failover_routing_policy {
    type = "SECONDARY"
  }
  
  set_identifier = "secondary"
  alias {
    name                   = module.secondary.dns_name
    zone_id                = module.secondary.zone_id
    evaluate_target_health = true
  }
}
```

#### 16.3.2 Database Replication

```sql
-- Primary database setup
-- Enable logical replication
ALTER SYSTEM SET wal_level = logical;
ALTER SYSTEM SET max_replication_slots = 10;
ALTER SYSTEM SET max_wal_senders = 10;

-- Create publication for all tables
CREATE PUBLICATION oz_invoice_pub FOR ALL TABLES;

-- Secondary database setup
-- Create subscription to primary
CREATE SUBSCRIPTION oz_invoice_sub
  CONNECTION 'host=primary-db.example.com port=5432 dbname=oz_invoice user=replicator password=password'
  PUBLICATION oz_invoice_pub;
```

## 17. Extensibility and Integration Framework

### 17.1 Modular Architecture Design

#### 17.1.1 Microservices Boundaries

```markdown
# Microservices Architecture

## Core Services

1. **Invoice Service**
   - Manages invoice creation, updates, and lifecycle
   - Handles payment processing integration
   - Manages invoice templates and customization

2. **Customer Service**
   - Manages customer information
   - Handles customer communication preferences
   - Tracks customer history and interactions

3. **User Service**
   - Manages user accounts and authentication
   - Handles role-based permissions
   - Manages user preferences and settings

4. **Notification Service**
   - Sends emails, SMS, and in-app notifications
   - Manages notification templates
   - Tracks delivery and engagement

## Extension Services

5. **Inspection Service**
   - Manages property inspection data
   - Handles photo and media storage
   - Generates inspection reports

6. **Scoping Service**
   - Manages project scope creation
   - Handles material and labor calculations
   - Manages scope templates and versioning

7. **Quoting Service**
   - Generates quotes from scopes
   - Handles pricing rules and margin calculations
   - Manages quote approval workflows

## Integration Services

8. **API Gateway**
   - Routes requests to appropriate services
   - Handles authentication and rate limiting
   - Provides unified API documentation

9. **Event Bus**
   - Manages asynchronous communication between services
   - Handles event publishing and subscription
   - Provides event replay and recovery

10. **Data Sync Service**
    - Manages data consistency across services
    - Handles conflict resolution
    - Provides audit trail for data changes
```

#### 17.1.2 Event-Driven Communication

```typescript
// services/eventBus.ts
import { createClient } from '@supabase/supabase-js';

export interface Event {
  id?: string;
  type: string;
  payload: any;
  source: string;
  timestamp?: string;
  correlationId?: string;
}

export class EventBus {
  private supabase;
  private subscriptions: Map<string, Function[]> = new Map();
  
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
    
    // Set up realtime subscription
    this.setupRealtimeSubscription();
  }
  
  private setupRealtimeSubscription() {
    const channel = this.supabase
      .channel('events')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'events' },
        (payload) => {
          const event = payload.new as Event;
          this.notifySubscribers(event);
        }
      )
      .subscribe();
  }
  
  async publish(event: Event): Promise<void> {
    // Add timestamp if not provided
    if (!event.timestamp) {
      event.timestamp = new Date().toISOString();
    }
    
    // Add correlation ID if not provided
    if (!event.correlationId) {
      event.correlationId = crypto.randomUUID();
    }
    
    // Store event in database
    const { error } = await this.supabase
      .from('events')
      .insert([event]);
      
    if (error) {
      console.error('Failed to publish event:', error);
      throw error;
    }
    
    // Notify local subscribers
    this.notifySubscribers(event);
  }
  
  subscribe(eventType: string, callback: (event: Event) => void): () => void {
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }
    
    this.subscriptions.get(eventType)!.push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.subscriptions.get(eventType);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index !== -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }
  
  private notifySubscribers(event: Event) {
    const callbacks = this.subscriptions.get(event.type);
    if (callbacks) {
      for (const callback of callbacks) {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in event subscriber:', error);
        }
      }
    }
  }
}

// Singleton instance
export const eventBus = new EventBus();
```

#### 17.1.3 API Gateway Configuration

```typescript
// netlify/functions/api-gateway.ts
import { Handler } from '@netlify/functions';
import fetch from 'node-fetch';

// Service registry
const serviceRegistry = {
  invoices: process.env.INVOICE_SERVICE_URL || 'https://invoice-service.example.com',
  customers: process.env.CUSTOMER_SERVICE_URL || 'https://customer-service.example.com',
  inspections: process.env.INSPECTION_SERVICE_URL || 'https://inspection-service.example.com',
  scopes: process.env.SCOPE_SERVICE_URL || 'https://scope-service.example.com',
  quotes: process.env.QUOTE_SERVICE_URL || 'https://quote-service.example.com',
};

// Rate limiting configuration
const rateLimits = {
  default: {
    limit: 100,
    window: 60 * 1000, // 1 minute
  },
  '/api/invoices': {
    limit: 50,
    window: 60 * 1000, // 1 minute
  },
};

// In-memory rate limiting store (use Redis in production)
const rateLimitStore: Record<string, { count: number, resetTime: number }> = {};

const handler: Handler = async (event) => {
  try {
    // Extract path and service from URL
    const path = event.path.replace(/^\/\.netlify\/functions\/api-gateway/, '');
    const serviceName = path.split('/')[1];
    
    // Check if service exists
    if (!serviceRegistry[serviceName]) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Service not found' }),
      };
    }
    
    // Apply rate limiting
    const clientIp = event.headers['client-ip'] || 'unknown';
    const rateLimitKey = `${clientIp}:${path}`;
    const rateLimit = rateLimits[path] || rateLimits.default;
    
    // Check rate limit
    if (!checkRateLimit(rateLimitKey, rateLimit)) {
      return {
        statusCode: 429,
        body: JSON.stringify({ error: 'Rate limit exceeded' }),
        headers: {
          'Retry-After': Math.ceil((rateLimitStore[rateLimitKey].resetTime - Date.now()) / 1000).toString(),
        },
      };
    }
    
    // Forward request to service
    const serviceUrl = `${serviceRegistry[serviceName]}${path.replace(`/${serviceName}`, '')}`;
    const response = await fetch(serviceUrl, {
      method: event.httpMethod,
      headers: {
        ...event.headers,
        'X-Forwarded-For': clientIp,
        'X-Original-URL': event.rawUrl,
      },
      body: event.body,
    });
    
    // Return response from service
    const responseBody = await response.text();
    
    return {
      statusCode: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseBody,
    };
  } catch (error) {
    console.error('API Gateway error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

function checkRateLimit(key: string, config: { limit: number, window: number }): boolean {
  const now = Date.now();
  
  // Initialize or reset if window has passed
  if (!rateLimitStore[key] || rateLimitStore[key].resetTime <= now) {
    rateLimitStore[key] = {
      count: 0,
      resetTime: now + config.window,
    };
  }
  
  // Increment count
  rateLimitStore[key].count += 1;
  
  // Check if limit exceeded
  return rateLimitStore[key].count <= config.limit;
}

export { handler };
```

### 17.2 Inspection Reporting Module Integration

#### 17.2.1 Data Model Extensions

```sql
-- Database schema for inspection module

-- Inspection table
CREATE TABLE inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  property_address TEXT NOT NULL,
  inspection_date TIMESTAMP WITH TIME ZONE NOT NULL,
  inspection_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inspection sections
CREATE TABLE inspection_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inspection items
CREATE TABLE inspection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES inspection_sections(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  condition VARCHAR(50),
  recommendation TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inspection photos
CREATE TABLE inspection_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  item_id UUID REFERENCES inspection_items(id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL,
  caption TEXT,
  taken_at TIMESTAMP WITH TIME ZONE,
  latitude NUMERIC(10, 6),
  longitude NUMERIC(10, 6),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Link inspections to invoices
CREATE TABLE inspection_invoice_links (
  inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (inspection_id, invoice_id)
);

-- Create RLS policies
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_invoice_links ENABLE ROW LEVEL SECURITY;

-- RLS policies for inspections
CREATE POLICY "Users can view their own inspections"
  ON inspections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inspections"
  ON inspections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inspections"
  ON inspections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inspections"
  ON inspections FOR DELETE
  USING (auth.uid() = user_id);

-- Similar policies for other tables...
```

#### 17.2.2 Media Storage Strategy

```typescript
// services/mediaStorage.ts
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

export interface UploadOptions {
  bucket: string;
  folder: string;
  contentType: string;
  metadata?: Record<string, string>;
  generateThumbnail?: boolean;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
}

export class MediaStorage {
  private supabase;
  
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  
  async uploadFile(
    file: Buffer,
    fileName: string,
    options: UploadOptions
  ): Promise<{ path: string; thumbnailPath?: string }> {
    // Generate unique file name
    const uniqueFileName = `${uuidv4()}-${fileName}`;
    const filePath = `${options.folder}/${uniqueFileName}`;
    
    // Upload original file
    const { error } = await this.supabase.storage
      .from(options.bucket)
      .upload(filePath, file, {
        contentType: options.contentType,
        upsert: false,
        cacheControl: '3600',
        metadata: options.metadata,
      });
      
    if (error) {
      console.error('File upload failed:', error);
      throw error;
    }
    
    // Generate and upload thumbnail if requested
    let thumbnailPath;
    if (options.generateThumbnail && options.contentType.startsWith('image/')) {
      thumbnailPath = await this.generateAndUploadThumbnail(
        file,
        uniqueFileName,
        options
      );
    }
    
    return {
      path: filePath,
      thumbnailPath,
    };
  }
  
  private async generateAndUploadThumbnail(
    file: Buffer,
    uniqueFileName: string,
    options: UploadOptions
  ): Promise<string> {
    try {
      // Generate thumbnail
      const thumbnail = await sharp(file)
        .resize({
          width: options.thumbnailWidth || 300,
          height: options.thumbnailHeight,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 80 })
        .toBuffer();
      
      // Upload thumbnail
      const thumbnailPath = `${options.folder}/thumbnails/${uniqueFileName}`;
      const { error } = await this.supabase.storage
        .from(options.bucket)
        .upload(thumbnailPath, thumbnail, {
          contentType: 'image/jpeg',
          upsert: false,
          cacheControl: '3600',
          metadata: options.metadata,
        });
        
      if (error) {
        console.error('Thumbnail upload failed:', error);
        throw error;
      }
      
      return thumbnailPath;
    } catch (error) {
      console.error('Thumbnail generation failed:', error);
      throw error;
    }
  }
  
  async getPublicUrl(bucket: string, path: string): Promise<string> {
    const { data } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(path);
      
    return data.publicUrl;
  }
  
  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(bucket)
      .remove([path]);
      
    if (error) {
      console.error('File deletion failed:', error);
      throw error;
    }
  }
}

export const mediaStorage = new MediaStorage();
```

#### 17.2.3 Inspection Report Generation

```typescript
// services/reportGenerator.ts
import { createClient } from '@supabase/supabase-js';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

export interface ReportOptions {
  title: string;
  logo?: Buffer;
  includePhotos: boolean;
  includeRecommendations: boolean;
  templateId?: string;
}

export class ReportGenerator {
  private supabase;
  
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  
  async generateInspectionReport(
    inspectionId: string,
    options: ReportOptions
  ): Promise<Buffer> {
    // Fetch inspection data
    const { data: inspection, error: inspectionError } = await this.supabase
      .from('inspections')
      .select(`
        *,
        inspection_sections (
          *,
          inspection_items (
            *
          )
        ),
        inspection_photos (
          *
        )
      `)
      .eq('id', inspectionId)
      .single();
      
    if (inspectionError) {
      console.error('Failed to fetch inspection:', inspectionError);
      throw inspectionError;
    }
    
    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];
    
    // Collect PDF data chunks
    doc.on('data', buffers.push.bind(buffers));
    
    // Add header
    this.addHeader(doc, inspection, options);
    
    // Add inspection details
    this.addInspectionDetails(doc, inspection);
    
    // Add sections and items
    for (const section of inspection.inspection_sections) {
      this.addSection(doc, section, options);
    }
    
    // Add photos if requested
    if (options.includePhotos && inspection.inspection_photos.length > 0) {
      await this.addPhotos(doc, inspection.inspection_photos);
    }
    
    // Finalize PDF
    doc.end();
    
    // Return PDF as buffer
    return new Promise((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });
    });
  }
  
  private addHeader(doc: PDFKit.PDFDocument, inspection: any, options: ReportOptions) {
    // Add logo if provided
    if (options.logo) {
      doc.image(options.logo, 50, 45, { width: 100 });
    }
    
    // Add title
    doc.fontSize(25)
       .text(options.title || 'Inspection Report', 200, 80);
    
    // Add date
    doc.fontSize(10)
       .text(`Date: ${new Date(inspection.inspection_date).toLocaleDateString()}`, 200, 110);
    
    // Add property address
    doc.fontSize(10)
       .text(`Property: ${inspection.property_address}`, 200, 125);
    
    doc.moveDown(2);
  }
  
  private addInspectionDetails(doc: PDFKit.PDFDocument, inspection: any) {
    doc.fontSize(14)
       .text('Inspection Details', { underline: true });
    
    doc.fontSize(10)
       .text(`Type: ${inspection.inspection_type}`)
       .text(`Status: ${inspection.status}`)
       .text(`Notes: ${inspection.notes || 'None'}`);
    
    doc.moveDown(2);
  }
  
  private addSection(doc: PDFKit.PDFDocument, section: any, options: ReportOptions) {
    doc.fontSize(12)
       .text(section.title, { underline: true });
    
    for (const item of section.inspection_items) {
      doc.fontSize(10)
         .text(`${item.title}:`, { continued: true })
         .text(` ${item.description || 'No description'}`);
      
      if (item.condition) {
        doc.text(`Condition: ${item.condition}`);
      }
      
      if (options.includeRecommendations && item.recommendation) {
        doc.text(`Recommendation: ${item.recommendation}`);
      }
      
      doc.moveDown(0.5);
    }
    
    doc.moveDown(1);
  }
  
  private async addPhotos(doc: PDFKit.PDFDocument, photos: any[]) {
    doc.addPage();
    
    doc.fontSize
