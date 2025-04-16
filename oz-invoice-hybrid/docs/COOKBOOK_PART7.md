# Oz Invoice Safeguard — Complete Cookbook (Part 7)

*Continuation from COOKBOOK_PART6.md*

## 17. Extensibility and Integration Framework (continued)

### 17.3 Scoping Module Integration (continued)

#### 17.3.4 Integration Points with Invoice System (continued)

```typescript
    // Link scope to invoice
    const { error: linkError } = await this.supabase
      .from('scope_invoice_links')
      .insert([{
        scope_id: scopeId,
        invoice_id: invoice.id,
      }]);
      
    if (linkError) {
      console.error('Failed to link scope to invoice:', linkError);
      throw linkError;
    }
    
    // Publish event
    await eventBus.publish({
      type: 'invoice.created_from_scope',
      source: 'scope-invoice-integration',
      payload: {
        scopeId,
        invoiceId: invoice.id,
      },
    });
    
    return invoice.id;
  }
}

export const scopeInvoiceIntegration = new ScopeInvoiceIntegration();
```

### 17.4 Quoting Module Integration

#### 17.4.1 Data Model Extensions

```sql
-- Database schema for quoting module

-- Quote table
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  scope_id UUID REFERENCES scopes(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  quote_number VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  version INTEGER NOT NULL DEFAULT 1,
  expiry_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Quote sections
CREATE TABLE quote_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Quote items
CREATE TABLE quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES quote_sections(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  markup_percentage NUMERIC(5, 2) DEFAULT 0,
  discount_percentage NUMERIC(5, 2) DEFAULT 0,
  notes TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Quote versions
CREATE TABLE quote_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  data JSONB NOT NULL, -- Snapshot of quote data
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  UNIQUE (quote_id, version)
);

-- Quote approval workflow
CREATE TABLE quote_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  approver_id UUID NOT NULL REFERENCES auth.users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  comments TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (quote_id, version, approver_id)
);

-- Customer acceptance
CREATE TABLE quote_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  accepted_by VARCHAR(100) NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address VARCHAR(50),
  signature_data TEXT, -- Base64 encoded signature image
  terms_accepted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (quote_id, version)
);

-- Link quotes to invoices
CREATE TABLE quote_invoice_links (
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (quote_id, invoice_id)
);

-- Create RLS policies
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_invoice_links ENABLE ROW LEVEL SECURITY;

-- RLS policies for quotes
CREATE POLICY "Users can view their own quotes"
  ON quotes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quotes"
  ON quotes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quotes"
  ON quotes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quotes"
  ON quotes FOR DELETE
  USING (auth.uid() = user_id);

-- Similar policies for other tables...
```

#### 17.4.2 Pricing Rules Engine

```typescript
// services/pricingRulesEngine.ts
import { createClient } from '@supabase/supabase-js';

export interface PricingRule {
  id: string;
  name: string;
  description: string;
  rule_type: 'markup' | 'discount' | 'adjustment';
  condition: string;
  value: number;
  value_type: 'percentage' | 'fixed';
  priority: number;
  applies_to: 'item' | 'section' | 'quote';
  item_categories?: string[];
  min_quantity?: number;
  max_quantity?: number;
  min_amount?: number;
  max_amount?: number;
  start_date?: string;
  end_date?: string;
}

export class PricingRulesEngine {
  private supabase;
  private rules: PricingRule[] = [];
  
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Load pricing rules
    this.loadRules();
  }
  
  private async loadRules() {
    const { data, error } = await this.supabase
      .from('pricing_rules')
      .select('*')
      .order('priority', { ascending: true });
      
    if (error) {
      console.error('Failed to load pricing rules:', error);
      return;
    }
    
    this.rules = data;
  }
  
  async calculateItemPrice(
    item: any,
    context: {
      quoteId: string;
      sectionId: string;
      customerId: string;
      totalAmount: number;
    }
  ): Promise<{
    basePrice: number;
    finalPrice: number;
    markup: number;
    discount: number;
    appliedRules: string[];
  }> {
    const basePrice = item.unit_price * item.quantity;
    let finalPrice = basePrice;
    let markup = 0;
    let discount = 0;
    const appliedRules: string[] = [];
    
    // Get customer information
    const { data: customer, error: customerError } = await this.supabase
      .from('customers')
      .select('*')
      .eq('id', context.customerId)
      .single();
      
    if (customerError) {
      console.error('Failed to fetch customer:', customerError);
      throw customerError;
    }
    
    // Get section information
    const { data: section, error: sectionError } = await this.supabase
      .from('quote_sections')
      .select('*')
      .eq('id', context.sectionId)
      .single();
      
    if (sectionError) {
      console.error('Failed to fetch section:', sectionError);
      throw sectionError;
    }
    
    // Apply pricing rules
    for (const rule of this.rules) {
      // Check if rule applies to this item
      if (this.doesRuleApply(rule, item, section, customer, context)) {
        // Apply rule
        const { newPrice, appliedMarkup, appliedDiscount } = this.applyRule(rule, finalPrice);
        
        finalPrice = newPrice;
        markup += appliedMarkup;
        discount += appliedDiscount;
        appliedRules.push(rule.id);
      }
    }
    
    return {
      basePrice,
      finalPrice,
      markup,
      discount,
      appliedRules,
    };
  }
  
  async calculateQuoteTotal(quoteId: string): Promise<{
    subtotal: number;
    markup: number;
    discount: number;
    tax: number;
    total: number;
    sectionTotals: Record<string, number>;
  }> {
    // Fetch quote details
    const { data: quote, error: quoteError } = await this.supabase
      .from('quotes')
      .select(`
        *,
        quote_sections (
          id,
          name,
          quote_items (
            *
          )
        )
      `)
      .eq('id', quoteId)
      .single();
      
    if (quoteError) {
      console.error('Failed to fetch quote:', quoteError);
      throw quoteError;
    }
    
    let subtotal = 0;
    let totalMarkup = 0;
    let totalDiscount = 0;
    const sectionTotals: Record<string, number> = {};
    
    // Calculate totals for each section
    for (const section of quote.quote_sections) {
      let sectionSubtotal = 0;
      
      for (const item of section.quote_items) {
        // Calculate item price with rules
        const { finalPrice, markup, discount } = await this.calculateItemPrice(item, {
          quoteId,
          sectionId: section.id,
          customerId: quote.customer_id,
          totalAmount: subtotal,
        });
        
        sectionSubtotal += finalPrice;
        totalMarkup += markup;
        totalDiscount += discount;
      }
      
      sectionTotals[section.id] = sectionSubtotal;
      subtotal += sectionSubtotal;
    }
    
    // Calculate tax
    const taxRate = 0.1; // 10% tax rate (should be configurable)
    const tax = subtotal * taxRate;
    
    // Calculate total
    const total = subtotal + tax;
    
    return {
      subtotal,
      markup: totalMarkup,
      discount: totalDiscount,
      tax,
      total,
      sectionTotals,
    };
  }
  
  private doesRuleApply(
    rule: PricingRule,
    item: any,
    section: any,
    customer: any,
    context: any
  ): boolean {
    // Check if rule applies to the right level
    if (rule.applies_to === 'item' && item.category_id && rule.item_categories) {
      if (!rule.item_categories.includes(item.category_id)) {
        return false;
      }
    }
    
    // Check quantity constraints
    if (rule.min_quantity !== undefined && item.quantity < rule.min_quantity) {
      return false;
    }
    
    if (rule.max_quantity !== undefined && item.quantity > rule.max_quantity) {
      return false;
    }
    
    // Check amount constraints
    const itemAmount = item.unit_price * item.quantity;
    
    if (rule.min_amount !== undefined && itemAmount < rule.min_amount) {
      return false;
    }
    
    if (rule.max_amount !== undefined && itemAmount > rule.max_amount) {
      return false;
    }
    
    // Check date constraints
    const now = new Date();
    
    if (rule.start_date && new Date(rule.start_date) > now) {
      return false;
    }
    
    if (rule.end_date && new Date(rule.end_date) < now) {
      return false;
    }
    
    // Evaluate condition if present
    if (rule.condition) {
      try {
        const conditionContext = {
          item,
          section,
          customer,
          quoteTotal: context.totalAmount,
          now,
        };
        
        return this.evaluateCondition(rule.condition, conditionContext);
      } catch (error) {
        console.error(`Error evaluating condition for rule ${rule.id}:`, error);
        return false;
      }
    }
    
    return true;
  }
  
  private applyRule(
    rule: PricingRule,
    price: number
  ): { newPrice: number; appliedMarkup: number; appliedDiscount: number } {
    let newPrice = price;
    let appliedMarkup = 0;
    let appliedDiscount = 0;
    
    if (rule.rule_type === 'markup') {
      if (rule.value_type === 'percentage') {
        appliedMarkup = price * (rule.value / 100);
      } else {
        appliedMarkup = rule.value;
      }
      
      newPrice += appliedMarkup;
    } else if (rule.rule_type === 'discount') {
      if (rule.value_type === 'percentage') {
        appliedDiscount = price * (rule.value / 100);
      } else {
        appliedDiscount = rule.value;
      }
      
      newPrice -= appliedDiscount;
    } else if (rule.rule_type === 'adjustment') {
      // Direct price adjustment
      newPrice = rule.value;
    }
    
    return {
      newPrice: Math.max(0, newPrice), // Ensure price is not negative
      appliedMarkup,
      appliedDiscount,
    };
  }
  
  private evaluateCondition(condition: string, context: Record<string, any>): boolean {
    // Create a function from the condition
    const keys = Object.keys(context);
    const values = Object.values(context);
    
    // Use Function constructor to create a function from the condition
    const func = new Function(...keys, `return ${condition};`);
    
    // Call the function with context values
    return func(...values);
  }
}

export const pricingRulesEngine = new PricingRulesEngine();
```

#### 17.4.3 Quote Approval Workflow

```typescript
// services/quoteApprovalWorkflow.ts
import { createClient } from '@supabase/supabase-js';
import { eventBus } from './eventBus';

export interface ApprovalStep {
  id: string;
  name: string;
  description: string;
  approvers: string[]; // User IDs
  min_approvers: number;
  order: number;
  conditions?: {
    min_amount?: number;
    max_amount?: number;
    customer_types?: string[];
  };
}

export class QuoteApprovalWorkflow {
  private supabase;
  private approvalSteps: ApprovalStep[] = [];
  
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Load approval steps
    this.loadApprovalSteps();
    
    // Subscribe to events
    this.subscribeToEvents();
  }
  
  private async loadApprovalSteps() {
    const { data, error } = await this.supabase
      .from('approval_steps')
      .select('*')
      .order('order', { ascending: true });
      
    if (error) {
      console.error('Failed to load approval steps:', error);
      return;
    }
    
    this.approvalSteps = data;
  }
  
  private subscribeToEvents() {
    // When a quote is submitted for approval
    eventBus.subscribe('quote.submitted_for_approval', this.handleQuoteSubmitted.bind(this));
    
    // When a quote is approved
    eventBus.subscribe('quote.approved', this.handleQuoteApproved.bind(this));
    
    // When a quote is rejected
    eventBus.subscribe('quote.rejected', this.handleQuoteRejected.bind(this));
  }
  
  private async handleQuoteSubmitted(event: any) {
    const quoteId = event.payload.quoteId;
    
    // Start approval workflow
    await this.startApprovalWorkflow(quoteId);
  }
  
  private async handleQuoteApproved(event: any) {
    const { quoteId, approverId, stepId } = event.payload;
    
    // Check if all approvals for this step are complete
    await this.checkStepCompletion(quoteId, stepId);
  }
  
  private async handleQuoteRejected(event: any) {
    const { quoteId, approverId, stepId, reason } = event.payload;
    
    // Update quote status
    const { error } = await this.supabase
      .from('quotes')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', quoteId);
      
    if (error) {
      console.error('Failed to update quote status:', error);
      return;
    }
    
    // Notify quote owner
    const { data: quote, error: quoteError } = await this.supabase
      .from('quotes')
      .select('user_id')
      .eq('id', quoteId)
      .single();
      
    if (quoteError) {
      console.error('Failed to fetch quote:', quoteError);
      return;
    }
    
    await eventBus.publish({
      type: 'notification.send',
      source: 'quote-approval-workflow',
      payload: {
        userId: quote.user_id,
        title: 'Quote Rejected',
        message: `Your quote has been rejected. Reason: ${reason}`,
        action: {
          type: 'view_quote',
          quoteId,
        },
      },
    });
  }
  
  async startApprovalWorkflow(quoteId: string): Promise<void> {
    // Get quote details
    const { data: quote, error: quoteError } = await this.supabase
      .from('quotes')
      .select(`
        *,
        customers (
          *
        )
      `)
      .eq('id', quoteId)
      .single();
      
    if (quoteError) {
      console.error('Failed to fetch quote:', quoteError);
      throw quoteError;
    }
    
    // Calculate quote total
    const { data: quoteTotal, error: totalError } = await this.supabase
      .rpc('calculate_quote_total', { quote_id: quoteId });
      
    if (totalError) {
      console.error('Failed to calculate quote total:', totalError);
      throw totalError;
    }
    
    // Find applicable approval steps
    const applicableSteps = this.approvalSteps.filter(step => {
      // Check amount conditions
      if (step.conditions?.min_amount !== undefined && quoteTotal < step.conditions.min_amount) {
        return false;
      }
      
      if (step.conditions?.max_amount !== undefined && quoteTotal > step.conditions.max_amount) {
        return false;
      }
      
      // Check customer type conditions
      if (step.conditions?.customer_types && quote.customers.type) {
        if (!step.conditions.customer_types.includes(quote.customers.type)) {
          return false;
        }
      }
      
      return true;
    });
    
    if (applicableSteps.length === 0) {
      // No approval steps needed, auto-approve
      await this.supabase
        .from('quotes')
        .update({
          status: 'approved',
          updated_at: new Date().toISOString(),
        })
        .eq('id', quoteId);
        
      await eventBus.publish({
        type: 'quote.auto_approved',
        source: 'quote-approval-workflow',
        payload: {
          quoteId,
        },
      });
      
      return;
    }
    
    // Update quote status
    await this.supabase
      .from('quotes')
      .update({
        status: 'pending_approval',
        updated_at: new Date().toISOString(),
      })
      .eq('id', quoteId);
    
    // Create approval requests for first step
    const firstStep = applicableSteps[0];
    
    for (const approverId of firstStep.approvers) {
      await this.supabase
        .from('quote_approvals')
        .insert([{
          quote_id: quoteId,
          version: quote.version,
          approver_id: approverId,
          status: 'pending',
          step_id: firstStep.id,
        }]);
        
      // Notify approver
      await eventBus.publish({
        type: 'notification.send',
        source: 'quote-approval-workflow',
        payload: {
          userId: approverId,
          title: 'Quote Approval Request',
          message: `A quote requires your approval: ${quote.quote_number}`,
          action: {
            type: 'approve_quote',
            quoteId,
            stepId: firstStep.id,
          },
        },
      });
    }
  }
  
  async approveQuote(
    quoteId: string,
    approverId: string,
    stepId: string,
    comments?: string
  ): Promise<void> {
    // Update approval status
    const { error } = await this.supabase
      .from('quote_approvals')
      .update({
        status: 'approved',
        comments,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('quote_id', quoteId)
      .eq('approver_id', approverId)
      .eq('step_id', stepId);
      
    if (error) {
      console.error('Failed to update approval status:', error);
      throw error;
    }
    
    // Publish event
    await eventBus.publish({
      type: 'quote.approved',
      source: 'quote-approval-workflow',
      payload: {
        quoteId,
        approverId,
        stepId,
        comments,
      },
    });
  }
  
  async rejectQuote(
    quoteId: string,
    approverId: string,
    stepId: string,
    reason: string
  ): Promise<void> {
    // Update approval status
    const { error } = await this.supabase
      .from('quote_approvals')
      .update({
        status: 'rejected',
        comments: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('quote_id', quoteId)
      .eq('approver_id', approverId)
      .eq('step_id', stepId);
      
    if (error) {
      console.error('Failed to update approval status:', error);
      throw error;
    }
    
    // Publish event
    await eventBus.publish({
      type: 'quote.rejected',
      source: 'quote-approval-workflow',
      payload: {
        quoteId,
        approverId,
        stepId,
        reason,
      },
    });
  }
  
  private async checkStepCompletion(quoteId: string, stepId: string): Promise<void> {
    // Get step details
    const step = this.approvalSteps.find(s => s.id === stepId);
    
    if (!step) {
      console.error(`Step not found: ${stepId}`);
      return;
    }
    
    // Get approvals for this step
    const { data: approvals, error } = await this.supabase
      .from('quote_approvals')
      .select('*')
      .eq('quote_id', quoteId)
      .eq('step_id', stepId);
      
    if (error) {
      console.error('Failed to fetch approvals:', error);
      return;
    }
    
    // Count approved
    const approvedCount = approvals.filter(a => a.status === 'approved').length;
    
    // Check if minimum approvals reached
    if (approvedCount >= step.min_approvers) {
      // Find next step
      const currentStepIndex = this.approvalSteps.findIndex(s => s.id === stepId);
      const nextStep = this.approvalSteps[currentStepIndex + 1];
      
      if (nextStep) {
        // Move to next step
        for (const approverId of nextStep.approvers) {
          await this.supabase
            .from('quote_approvals')
            .insert([{
              quote_id: quoteId,
              approver_id: approverId,
              status: 'pending',
              step_id: nextStep.id,
            }]);
            
          // Notify approver
          await eventBus.publish({
            type: 'notification.send',
            source: 'quote-approval-workflow',
            payload: {
              userId: approverId,
              title: 'Quote Approval Request',
              message: `A quote requires your approval`,
              action: {
                type: 'approve_quote',
                quoteId,
                stepId: nextStep.id,
              },
            },
          });
        }
      } else {
        // Final approval
        await this.supabase
          .from('quotes')
          .update({
            status: 'approved',
            updated_at: new Date().toISOString(),
          })
          .eq('id', quoteId);
          
        // Notify quote owner
        const { data: quote, error: quoteError } = await this.supabase
          .from('quotes')
          .select('user_id')
          .eq('id', quoteId)
          .single();
          
        if (quoteError) {
          console.error('Failed to fetch quote:', quoteError);
          return;
        }
        
        await eventBus.publish({
          type: 'quote.fully_approved',
          source: 'quote-approval-workflow',
          payload: {
            quoteId,
          },
        });
        
        await eventBus.publish({
          type: 'notification.send',
          source: 'quote-approval-workflow',
          payload: {
            userId: quote.user_id,
            title: 'Quote Approved',
            message: 'Your quote has been approved and is ready to send to the customer.',
            action: {
              type: 'view_quote',
              quoteId,
            },
          },
        });
      }
    }
  }
}

export const quoteApprovalWorkflow = new QuoteApprovalWorkflow();
```

#### 17.4.4 Integration Points with Invoice System

```typescript
// services/quoteInvoiceIntegration.ts
import { createClient } from '@supabase/supabase-js';
import { eventBus } from './eventBus';
import { pricingRulesEngine } from './pricingRulesEngine';

export class QuoteInvoiceIntegration {
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
    // When a quote is accepted by customer
    eventBus.subscribe('quote.accepted', this.handleQuoteAccepted.bind(this));
    
    // When an invoice is created from a quote
    eventBus.subscribe('invoice.created_from_quote', this.handleInvoiceCreatedFromQuote.bind(this));
  }
  
  private async handleQuoteAccepted(event: any) {
    const quoteId = event.payload.quoteId;
    
    // Fetch quote details
    const { data: quote, error } = await this.supabase
      .from('quotes')
      .select('*')
      .eq('id', quoteId)
      .single();
      
    if (error) {
      console.error('Failed to fetch quote:', error);
      return;
    }
    
    // Notify user that they can create an invoice from this quote
    await eventBus.publish({
      type: 'notification.send',
      source: 'quote-invoice-integration',
      payload: {
        userId: quote.user_id,
        title: 'Quote Accepted',
        message: `Quote ${quote.quote_number} has been accepted by the customer. Would you like to create an invoice?`,
        action: {
          type: 'create_invoice_from_quote',
          quoteId,
        },
      },
    });
  }
  
  private async handleInvoiceCreatedFromQuote(event: any) {
    const { quoteId, invoiceId } = event.payload;
    
    // Link quote to invoice
    const { error } = await this.supabase
      .from('quote_invoice_links')
      .insert([{
        quote_id: quoteId,
        invoice_id: invoiceId,
      }]);
      
    if (error) {
      console.error('Failed to link quote to invoice:', error);
      return;
    }
    
    console.log(`Linked quote ${quoteId} to invoice ${invoiceId}`);
  }
  
  async createInvoiceFromQuote(quoteId: string): Promise<string> {
    // Fetch quote details
    const { data: quote, error } = await this.supabase
      .from('quotes')
      .select(`
        *,
        quote_sections (
          *,
          quote_items (
            *
          )
        )
      `)
      .eq('id', quoteId)
      .single();
      
    if (error) {
      console.error('Failed to fetch quote:', error);
      throw error;
    }
    
    // Calculate quote total
    const { total } = await pricingRulesEngine.calculateQuoteTotal(quoteId);
    
    // Create invoice
    const { data: invoice, error: invoiceError } = await this.supabase
      .from('invoices')
      .insert([{
        user_id: quote.user_id,
        customer_id: quote.customer_id,
        amount: total,
        status: 'draft',
        due_date: new Date(Date.
