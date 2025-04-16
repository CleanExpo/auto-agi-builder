# Oz Invoice Safeguard — Complete Cookbook (Part 6)

*Continuation from COOKBOOK_PART5.md*

## 17. Extensibility and Integration Framework (continued)

### 17.2 Inspection Reporting Module Integration (continued)

#### 17.2.3 Inspection Report Generation (continued)

```typescript
  private async addPhotos(doc: PDFKit.PDFDocument, photos: any[]) {
    doc.addPage();
    
    doc.fontSize(14)
       .text('Inspection Photos', { underline: true });
    
    doc.moveDown(1);
    
    // Arrange photos in a grid (2 columns)
    const photoWidth = 250;
    const photoHeight = 200;
    const margin = 20;
    
    for (let i = 0; i < photos.length; i += 2) {
      const y = doc.y;
      
      // First photo in row
      const photo1 = photos[i];
      const photo1Url = await this.getPhotoUrl(photo1.storage_path);
      
      doc.image(photo1Url, 50, y, {
        width: photoWidth,
        height: photoHeight,
        fit: 'inside',
      });
      
      doc.fontSize(8)
         .text(photo1.caption || 'No caption', 50, y + photoHeight + 5, {
           width: photoWidth,
           align: 'center',
         });
      
      // Second photo in row (if exists)
      if (i + 1 < photos.length) {
        const photo2 = photos[i + 1];
        const photo2Url = await this.getPhotoUrl(photo2.storage_path);
        
        doc.image(photo2Url, 50 + photoWidth + margin, y, {
          width: photoWidth,
          height: photoHeight,
          fit: 'inside',
        });
        
        doc.fontSize(8)
           .text(photo2.caption || 'No caption', 50 + photoWidth + margin, y + photoHeight + 5, {
             width: photoWidth,
             align: 'center',
           });
      }
      
      // Move down for next row
      doc.moveDown(7);
      
      // Add new page if needed
      if (doc.y > 700 && i + 2 < photos.length) {
        doc.addPage();
      }
    }
  }
  
  private async getPhotoUrl(storagePath: string): Promise<string> {
    // Get public URL for photo
    const { data } = this.supabase.storage
      .from('inspection-photos')
      .getPublicUrl(storagePath);
      
    return data.publicUrl;
  }
}

export const reportGenerator = new ReportGenerator();
```

#### 17.2.4 Integration Points with Invoice System

```typescript
// services/inspectionInvoiceIntegration.ts
import { createClient } from '@supabase/supabase-js';
import { eventBus } from './eventBus';

export class InspectionInvoiceIntegration {
  private supabase;
  
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Subscribe to relevant events
    this.subscribeToEvents();
  }
  
  private subscribeToEvents() {
    // When an inspection is completed, suggest creating an invoice
    eventBus.subscribe('inspection.completed', this.handleInspectionCompleted.bind(this));
    
    // When an invoice is created from an inspection, link them
    eventBus.subscribe('invoice.created_from_inspection', this.handleInvoiceCreatedFromInspection.bind(this));
  }
  
  private async handleInspectionCompleted(event: any) {
    const inspectionId = event.payload.inspectionId;
    
    // Fetch inspection details
    const { data: inspection, error } = await this.supabase
      .from('inspections')
      .select('*')
      .eq('id', inspectionId)
      .single();
      
    if (error) {
      console.error('Failed to fetch inspection:', error);
      return;
    }
    
    // Notify user that they can create an invoice from this inspection
    await eventBus.publish({
      type: 'notification.send',
      source: 'inspection-invoice-integration',
      payload: {
        userId: inspection.user_id,
        title: 'Inspection Completed',
        message: `Inspection for ${inspection.property_address} is complete. Would you like to create an invoice?`,
        action: {
          type: 'create_invoice_from_inspection',
          inspectionId,
        },
      },
    });
  }
  
  private async handleInvoiceCreatedFromInspection(event: any) {
    const { inspectionId, invoiceId } = event.payload;
    
    // Link inspection to invoice
    const { error } = await this.supabase
      .from('inspection_invoice_links')
      .insert([{
        inspection_id: inspectionId,
        invoice_id: invoiceId,
      }]);
      
    if (error) {
      console.error('Failed to link inspection to invoice:', error);
      return;
    }
    
    console.log(`Linked inspection ${inspectionId} to invoice ${invoiceId}`);
  }
  
  async createInvoiceFromInspection(inspectionId: string): Promise<string> {
    // Fetch inspection details
    const { data: inspection, error } = await this.supabase
      .from('inspections')
      .select(`
        *,
        inspection_sections (
          *,
          inspection_items (
            *
          )
        )
      `)
      .eq('id', inspectionId)
      .single();
      
    if (error) {
      console.error('Failed to fetch inspection:', error);
      throw error;
    }
    
    // Create invoice
    const { data: invoice, error: invoiceError } = await this.supabase
      .from('invoices')
      .insert([{
        user_id: inspection.user_id,
        customer_id: inspection.customer_id, // Assuming inspection has customer_id
        amount: 0, // Will be updated later
        status: 'draft',
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        invoice_number: `INV-${Date.now()}`,
        notes: `Invoice for inspection at ${inspection.property_address}`,
      }])
      .select()
      .single();
      
    if (invoiceError) {
      console.error('Failed to create invoice:', invoiceError);
      throw invoiceError;
    }
    
    // Create invoice items from inspection items
    const invoiceItems = [];
    
    for (const section of inspection.inspection_sections) {
      for (const item of section.inspection_items) {
        if (item.recommendation) {
          invoiceItems.push({
            invoice_id: invoice.id,
            description: `${section.title} - ${item.title}: ${item.recommendation}`,
            quantity: 1,
            unit_price: 0, // Will be updated later
            amount: 0, // Will be updated later
          });
        }
      }
    }
    
    if (invoiceItems.length > 0) {
      const { error: itemsError } = await this.supabase
        .from('invoice_items')
        .insert(invoiceItems);
        
      if (itemsError) {
        console.error('Failed to create invoice items:', itemsError);
        throw itemsError;
      }
    }
    
    // Link inspection to invoice
    const { error: linkError } = await this.supabase
      .from('inspection_invoice_links')
      .insert([{
        inspection_id: inspectionId,
        invoice_id: invoice.id,
      }]);
      
    if (linkError) {
      console.error('Failed to link inspection to invoice:', linkError);
      throw linkError;
    }
    
    // Publish event
    await eventBus.publish({
      type: 'invoice.created_from_inspection',
      source: 'inspection-invoice-integration',
      payload: {
        inspectionId,
        invoiceId: invoice.id,
      },
    });
    
    return invoice.id;
  }
}

export const inspectionInvoiceIntegration = new InspectionInvoiceIntegration();
```

### 17.3 Scoping Module Integration

#### 17.3.1 Data Model Extensions

```sql
-- Database schema for scoping module

-- Scope table
CREATE TABLE scopes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  inspection_id UUID REFERENCES inspections(id),
  property_address TEXT NOT NULL,
  scope_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  version INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Scope categories
CREATE TABLE scope_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_id UUID NOT NULL REFERENCES scopes(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Scope items
CREATE TABLE scope_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES scope_categories(id) ON DELETE CASCADE,
  item_code VARCHAR(50),
  description TEXT NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  markup_percentage NUMERIC(5, 2) DEFAULT 0,
  notes TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Scope versions
CREATE TABLE scope_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_id UUID NOT NULL REFERENCES scopes(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  data JSONB NOT NULL, -- Snapshot of scope data
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  UNIQUE (scope_id, version)
);

-- Scope approval workflow
CREATE TABLE scope_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_id UUID NOT NULL REFERENCES scopes(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  approver_id UUID NOT NULL REFERENCES auth.users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  comments TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (scope_id, version, approver_id)
);

-- Link scopes to invoices
CREATE TABLE scope_invoice_links (
  scope_id UUID NOT NULL REFERENCES scopes(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (scope_id, invoice_id)
);

-- Create RLS policies
ALTER TABLE scopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scope_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE scope_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE scope_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scope_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE scope_invoice_links ENABLE ROW LEVEL SECURITY;

-- RLS policies for scopes
CREATE POLICY "Users can view their own scopes"
  ON scopes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scopes"
  ON scopes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scopes"
  ON scopes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scopes"
  ON scopes FOR DELETE
  USING (auth.uid() = user_id);

-- Similar policies for other tables...
```

#### 17.3.2 Material and Labor Calculation Engine

```typescript
// services/scopeCalculationEngine.ts
import { createClient } from '@supabase/supabase-js';

export interface CalculationRule {
  id: string;
  name: string;
  description: string;
  formula: string;
  applies_to: string[];
  parameters: Record<string, any>;
}

export class ScopeCalculationEngine {
  private supabase;
  private rules: CalculationRule[] = [];
  
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Load calculation rules
    this.loadRules();
  }
  
  private async loadRules() {
    const { data, error } = await this.supabase
      .from('calculation_rules')
      .select('*')
      .order('priority', { ascending: true });
      
    if (error) {
      console.error('Failed to load calculation rules:', error);
      return;
    }
    
    this.rules = data;
  }
  
  async calculateScopeItem(
    itemCode: string,
    description: string,
    quantity: number,
    unit: string,
    parameters: Record<string, any> = {}
  ): Promise<{ unitPrice: number; totalPrice: number; appliedRules: string[] }> {
    // Get base price from price database
    const { data: priceData, error: priceError } = await this.supabase
      .from('price_database')
      .select('unit_price')
      .eq('item_code', itemCode)
      .single();
      
    if (priceError) {
      console.error('Failed to get price for item:', priceError);
      throw priceError;
    }
    
    let unitPrice = priceData.unit_price;
    const appliedRules: string[] = [];
    
    // Apply calculation rules
    for (const rule of this.rules) {
      // Check if rule applies to this item
      if (rule.applies_to.includes(itemCode) || rule.applies_to.includes('*')) {
        try {
          // Create context for formula evaluation
          const context = {
            unitPrice,
            quantity,
            unit,
            ...parameters,
            ...rule.parameters,
          };
          
          // Evaluate formula
          const newUnitPrice = this.evaluateFormula(rule.formula, context);
          
          // Update unit price if formula returned a valid number
          if (!isNaN(newUnitPrice) && isFinite(newUnitPrice)) {
            unitPrice = newUnitPrice;
            appliedRules.push(rule.id);
          }
        } catch (error) {
          console.error(`Error applying rule ${rule.id}:`, error);
        }
      }
    }
    
    // Calculate total price
    const totalPrice = unitPrice * quantity;
    
    return {
      unitPrice,
      totalPrice,
      appliedRules,
    };
  }
  
  async calculateScope(scopeId: string): Promise<{ totalPrice: number; categoryTotals: Record<string, number> }> {
    // Fetch scope items
    const { data: categories, error: categoriesError } = await this.supabase
      .from('scope_categories')
      .select(`
        id,
        name,
        scope_items (
          id,
          item_code,
          description,
          quantity,
          unit,
          unit_price,
          markup_percentage
        )
      `)
      .eq('scope_id', scopeId);
      
    if (categoriesError) {
      console.error('Failed to fetch scope categories:', categoriesError);
      throw categoriesError;
    }
    
    let totalPrice = 0;
    const categoryTotals: Record<string, number> = {};
    
    // Calculate totals for each category
    for (const category of categories) {
      let categoryTotal = 0;
      
      for (const item of category.scope_items) {
        // Calculate item total with markup
        const itemTotal = item.unit_price * item.quantity;
        const markup = itemTotal * (item.markup_percentage / 100);
        const itemTotalWithMarkup = itemTotal + markup;
        
        categoryTotal += itemTotalWithMarkup;
      }
      
      categoryTotals[category.id] = categoryTotal;
      totalPrice += categoryTotal;
    }
    
    return {
      totalPrice,
      categoryTotals,
    };
  }
  
  private evaluateFormula(formula: string, context: Record<string, any>): number {
    // Create a function from the formula
    const keys = Object.keys(context);
    const values = Object.values(context);
    
    // Use Function constructor to create a function from the formula
    const func = new Function(...keys, `return ${formula};`);
    
    // Call the function with context values
    return func(...values);
  }
}

export const scopeCalculationEngine = new ScopeCalculationEngine();
```

#### 17.3.3 Scope Version Control

```typescript
// services/scopeVersionControl.ts
import { createClient } from '@supabase/supabase-js';
import { eventBus } from './eventBus';

export class ScopeVersionControl {
  private supabase;
  
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Subscribe to relevant events
    this.subscribeToEvents();
  }
  
  private subscribeToEvents() {
    // When a scope is updated, create a new version
    eventBus.subscribe('scope.updated', this.handleScopeUpdated.bind(this));
  }
  
  private async handleScopeUpdated(event: any) {
    const scopeId = event.payload.scopeId;
    const userId = event.payload.userId;
    
    // Create a new version
    await this.createVersion(scopeId, userId);
  }
  
  async createVersion(scopeId: string, userId: string): Promise<number> {
    // Get current scope data
    const { data: scope, error: scopeError } = await this.supabase
      .from('scopes')
      .select(`
        *,
        scope_categories (
          *,
          scope_items (
            *
          )
        )
      `)
      .eq('id', scopeId)
      .single();
      
    if (scopeError) {
      console.error('Failed to fetch scope:', scopeError);
      throw scopeError;
    }
    
    // Get current version number
    const currentVersion = scope.version;
    
    // Create new version
    const { data: versionData, error: versionError } = await this.supabase
      .from('scope_versions')
      .insert([{
        scope_id: scopeId,
        version: currentVersion,
        data: scope,
        created_by: userId,
      }])
      .select()
      .single();
      
    if (versionError) {
      console.error('Failed to create scope version:', versionError);
      throw versionError;
    }
    
    // Increment version number in scope
    const { error: updateError } = await this.supabase
      .from('scopes')
      .update({
        version: currentVersion + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', scopeId);
      
    if (updateError) {
      console.error('Failed to update scope version:', updateError);
      throw updateError;
    }
    
    // Publish event
    await eventBus.publish({
      type: 'scope.version_created',
      source: 'scope-version-control',
      payload: {
        scopeId,
        version: currentVersion,
        userId,
      },
    });
    
    return currentVersion;
  }
  
  async getVersion(scopeId: string, version: number): Promise<any> {
    const { data, error } = await this.supabase
      .from('scope_versions')
      .select('*')
      .eq('scope_id', scopeId)
      .eq('version', version)
      .single();
      
    if (error) {
      console.error('Failed to fetch scope version:', error);
      throw error;
    }
    
    return data.data;
  }
  
  async compareVersions(scopeId: string, version1: number, version2: number): Promise<any> {
    // Get both versions
    const v1 = await this.getVersion(scopeId, version1);
    const v2 = await this.getVersion(scopeId, version2);
    
    // Compare categories
    const categoryChanges = this.compareCategories(v1.scope_categories, v2.scope_categories);
    
    // Compare scope properties
    const propertyChanges = this.compareProperties(v1, v2, [
      'scope_name',
      'property_address',
      'status',
      'notes',
    ]);
    
    return {
      propertyChanges,
      categoryChanges,
    };
  }
  
  private compareCategories(categories1: any[], categories2: any[]): any[] {
    const changes: any[] = [];
    
    // Map categories by ID for easier comparison
    const categoriesMap1 = new Map(categories1.map(c => [c.id, c]));
    const categoriesMap2 = new Map(categories2.map(c => [c.id, c]));
    
    // Find added categories
    for (const [id, category] of categoriesMap2.entries()) {
      if (!categoriesMap1.has(id)) {
        changes.push({
          type: 'category_added',
          category,
        });
      }
    }
    
    // Find removed categories
    for (const [id, category] of categoriesMap1.entries()) {
      if (!categoriesMap2.has(id)) {
        changes.push({
          type: 'category_removed',
          category,
        });
      }
    }
    
    // Find modified categories
    for (const [id, category1] of categoriesMap1.entries()) {
      if (categoriesMap2.has(id)) {
        const category2 = categoriesMap2.get(id);
        
        // Compare category properties
        const propertyChanges = this.compareProperties(category1, category2, [
          'name',
          'description',
          'order_index',
        ]);
        
        if (propertyChanges.length > 0) {
          changes.push({
            type: 'category_modified',
            categoryId: id,
            changes: propertyChanges,
          });
        }
        
        // Compare items
        const itemChanges = this.compareItems(category1.scope_items, category2.scope_items);
        
        if (itemChanges.length > 0) {
          changes.push({
            type: 'items_changed',
            categoryId: id,
            changes: itemChanges,
          });
        }
      }
    }
    
    return changes;
  }
  
  private compareItems(items1: any[], items2: any[]): any[] {
    const changes: any[] = [];
    
    // Map items by ID for easier comparison
    const itemsMap1 = new Map(items1.map(i => [i.id, i]));
    const itemsMap2 = new Map(items2.map(i => [i.id, i]));
    
    // Find added items
    for (const [id, item] of itemsMap2.entries()) {
      if (!itemsMap1.has(id)) {
        changes.push({
          type: 'item_added',
          item,
        });
      }
    }
    
    // Find removed items
    for (const [id, item] of itemsMap1.entries()) {
      if (!itemsMap2.has(id)) {
        changes.push({
          type: 'item_removed',
          item,
        });
      }
    }
    
    // Find modified items
    for (const [id, item1] of itemsMap1.entries()) {
      if (itemsMap2.has(id)) {
        const item2 = itemsMap2.get(id);
        
        // Compare item properties
        const propertyChanges = this.compareProperties(item1, item2, [
          'item_code',
          'description',
          'quantity',
          'unit',
          'unit_price',
          'markup_percentage',
          'notes',
          'order_index',
        ]);
        
        if (propertyChanges.length > 0) {
          changes.push({
            type: 'item_modified',
            itemId: id,
            changes: propertyChanges,
          });
        }
      }
    }
    
    return changes;
  }
  
  private compareProperties(obj1: any, obj2: any, properties: string[]): any[] {
    const changes: any[] = [];
    
    for (const prop of properties) {
      if (obj1[prop] !== obj2[prop]) {
        changes.push({
          property: prop,
          oldValue: obj1[prop],
          newValue: obj2[prop],
        });
      }
    }
    
    return changes;
  }
}

export const scopeVersionControl = new ScopeVersionControl();
```

#### 17.3.4 Integration Points with Invoice System

```typescript
// services/scopeInvoiceIntegration.ts
import { createClient } from '@supabase/supabase-js';
import { eventBus } from './eventBus';
import { scopeCalculationEngine } from './scopeCalculationEngine';

export class ScopeInvoiceIntegration {
  private supabase;
  
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Subscribe to relevant events
    this.subscribeToEvents();
  }
  
  private subscribeToEvents() {
    // When a scope is approved, suggest creating an invoice
    eventBus.subscribe('scope.approved', this.handleScopeApproved.bind(this));
    
    // When an invoice is created from a scope, link them
    eventBus.subscribe('invoice.created_from_scope', this.handleInvoiceCreatedFromScope.bind(this));
  }
  
  private async handleScopeApproved(event: any) {
    const scopeId = event.payload.scopeId;
    
    // Fetch scope details
    const { data: scope, error } = await this.supabase
      .from('scopes')
      .select('*')
      .eq('id', scopeId)
      .single();
      
    if (error) {
      console.error('Failed to fetch scope:', error);
      return;
    }
    
    // Notify user that they can create an invoice from this scope
    await eventBus.publish({
      type: 'notification.send',
      source: 'scope-invoice-integration',
      payload: {
        userId: scope.user_id,
        title: 'Scope Approved',
        message: `Scope "${scope.scope_name}" has been approved. Would you like to create an invoice?`,
        action: {
          type: 'create_invoice_from_scope',
          scopeId,
        },
      },
    });
  }
  
  private async handleInvoiceCreatedFromScope(event: any) {
    const { scopeId, invoiceId } = event.payload;
    
    // Link scope to invoice
    const { error } = await this.supabase
      .from('scope_invoice_links')
      .insert([{
        scope_id: scopeId,
        invoice_id: invoiceId,
      }]);
      
    if (error) {
      console.error('Failed to link scope to invoice:', error);
      return;
    }
    
    console.log(`Linked scope ${scopeId} to invoice ${invoiceId}`);
  }
  
  async createInvoiceFromScope(scopeId: string): Promise<string> {
    // Fetch scope details
    const { data: scope, error } = await this.supabase
      .from('scopes')
      .select(`
        *,
        scope_categories (
          *,
          scope_items (
            *
          )
        )
      `)
      .eq('id', scopeId)
      .single();
      
    if (error) {
      console.error('Failed to fetch scope:', error);
      throw error;
    }
    
    // Calculate scope total
    const { totalPrice } = await scopeCalculationEngine.calculateScope(scopeId);
    
    // Create invoice
    const { data: invoice, error: invoiceError } = await this.supabase
      .from('invoices')
      .insert([{
        user_id: scope.user_id,
        customer_id: scope.customer_id, // Assuming scope has customer_id
        amount: totalPrice,
        status: 'draft',
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        invoice_number: `INV-${Date.now()}`,
        notes: `Invoice for scope: ${scope.scope_name}`,
      }])
      .select()
      .single();
      
    if (invoiceError) {
      console.error('Failed to create invoice:', invoiceError);
      throw invoiceError;
    }
    
    // Create invoice items from scope items
    const invoiceItems = [];
    
    for (const category of scope.scope_categories) {
      for (const item of category.scope_items) {
        const itemTotal = item.unit_price * item.quantity;
        const markup = itemTotal * (item.markup_percentage / 100);
        const itemTotalWithMarkup = itemTotal + markup;
        
        invoiceItems.push({
          invoice_id: invoice.id,
          description: `${category.name} - ${item.description}`,
          quantity: item.quantity,
          unit_price: item.unit_price,
          markup_percentage: item.markup_percentage,
          amount: itemTotalWithMarkup,
        });
      }
    }
    
    if (invoiceItems.length > 0) {
      const { error: itemsError } = await this.supabase
        .from('invoice_items')
        .insert(invoiceItems);
        
      if (itemsError) {
        console.error('Failed to create invoice items:', itemsError);
        throw itemsError;
      }
    }
    
    // Link scope to invoice
    const { error: linkError } = await this.supabase
      .from('scope_invoice_
