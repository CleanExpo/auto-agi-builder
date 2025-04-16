# Oz Invoice Safeguard — Complete Cookbook (Part 8)

*Continuation from COOKBOOK_PART7.md*

## 17. Extensibility and Integration Framework (continued)

### 17.4 Quoting Module Integration (continued)

#### 17.4.4 Integration Points with Invoice System (continued)

```typescript
    // Create invoice
    const { data: invoice, error: invoiceError } = await this.supabase
      .from('invoices')
      .insert([{
        user_id: quote.user_id,
        customer_id: quote.customer_id,
        amount: total,
        status: 'draft',
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        invoice_number: `INV-${Date.now()}`,
        notes: `Invoice for quote: ${quote.quote_number}`,
      }])
      .select()
      .single();
      
    if (invoiceError) {
      console.error('Failed to create invoice:', invoiceError);
      throw invoiceError;
    }
    
    // Create invoice items from quote items
    const invoiceItems = [];
    
    for (const section of quote.quote_sections) {
      for (const item of section.quote_items) {
        const itemTotal = item.unit_price * item.quantity;
        const markup = itemTotal * (item.markup_percentage / 100);
        const discount = itemTotal * (item.discount_percentage / 100);
        const itemTotalWithMarkupAndDiscount = itemTotal + markup - discount;
        
        invoiceItems.push({
          invoice_id: invoice.id,
          description: `${section.name} - ${item.description}`,
          quantity: item.quantity,
          unit_price: item.unit_price,
          markup_percentage: item.markup_percentage,
          discount_percentage: item.discount_percentage,
          amount: itemTotalWithMarkupAndDiscount,
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
    
    // Link quote to invoice
    const { error: linkError } = await this.supabase
      .from('quote_invoice_links')
      .insert([{
        quote_id: quoteId,
        invoice_id: invoice.id,
      }]);
      
    if (linkError) {
      console.error('Failed to link quote to invoice:', linkError);
      throw linkError;
    }
    
    // Publish event
    await eventBus.publish({
      type: 'invoice.created_from_quote',
      source: 'quote-invoice-integration',
      payload: {
        quoteId,
        invoiceId: invoice.id,
      },
    });
    
    return invoice.id;
  }
}

export const quoteInvoiceIntegration = new QuoteInvoiceIntegration();
```

#### 17.4.5 Digital Signature Integration

```typescript
// services/digitalSignature.ts
import { createClient } from '@supabase/supabase-js';
import { eventBus } from './eventBus';

export class DigitalSignature {
  private supabase;
  
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Subscribe to events
    this.subscribeToEvents();
  }
  
  private subscribeToEvents() {
    // When a quote is signed
    eventBus.subscribe('quote.signed', this.handleQuoteSigned.bind(this));
  }
  
  private async handleQuoteSigned(event: any) {
    const { quoteId, signatureData, acceptedBy, ipAddress } = event.payload;
    
    // Record signature
    await this.recordSignature(quoteId, signatureData, acceptedBy, ipAddress);
  }
  
  async generateSignatureLink(quoteId: string): Promise<string> {
    // Get quote details
    const { data: quote, error } = await this.supabase
      .from('quotes')
      .select('*')
      .eq('id', quoteId)
      .single();
      
    if (error) {
      console.error('Failed to fetch quote:', error);
      throw error;
    }
    
    // Generate a unique token
    const token = crypto.randomUUID();
    
    // Store token in database
    const { error: tokenError } = await this.supabase
      .from('signature_tokens')
      .insert([{
        quote_id: quoteId,
        token,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      }]);
      
    if (tokenError) {
      console.error('Failed to store signature token:', tokenError);
      throw tokenError;
    }
    
    // Generate signature link
    const signatureLink = `${process.env.APP_URL}/sign-quote/${token}`;
    
    return signatureLink;
  }
  
  async validateSignatureToken(token: string): Promise<string> {
    // Find token in database
    const { data, error } = await this.supabase
      .from('signature_tokens')
      .select('*')
      .eq('token', token)
      .single();
      
    if (error) {
      console.error('Failed to validate signature token:', error);
      throw new Error('Invalid or expired signature token');
    }
    
    // Check if token is expired
    if (new Date(data.expires_at) < new Date()) {
      throw new Error('Signature token has expired');
    }
    
    return data.quote_id;
  }
  
  async recordSignature(
    quoteId: string,
    signatureData: string,
    acceptedBy: string,
    ipAddress: string
  ): Promise<void> {
    // Get quote details
    const { data: quote, error } = await this.supabase
      .from('quotes')
      .select('*')
      .eq('id', quoteId)
      .single();
      
    if (error) {
      console.error('Failed to fetch quote:', error);
      throw error;
    }
    
    // Record signature
    const { error: signatureError } = await this.supabase
      .from('quote_acceptances')
      .insert([{
        quote_id: quoteId,
        version: quote.version,
        accepted_by: acceptedBy,
        ip_address: ipAddress,
        signature_data: signatureData,
        terms_accepted: true,
      }]);
      
    if (signatureError) {
      console.error('Failed to record signature:', signatureError);
      throw signatureError;
    }
    
    // Update quote status
    const { error: updateError } = await this.supabase
      .from('quotes')
      .update({
        status: 'accepted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', quoteId);
      
    if (updateError) {
      console.error('Failed to update quote status:', updateError);
      throw updateError;
    }
    
    // Publish event
    await eventBus.publish({
      type: 'quote.accepted',
      source: 'digital-signature',
      payload: {
        quoteId,
        acceptedBy,
      },
    });
  }
}

export const digitalSignature = new DigitalSignature();
```

### 17.5 Shared Authentication and Authorization

#### 17.5.1 Cross-Module User Profiles

```typescript
// services/userProfileService.ts
import { createClient } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  permissions: string[];
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export class UserProfileService {
  private supabase;
  
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  
  async getUserProfile(userId: string): Promise<UserProfile> {
    // Get user from auth.users
    const { data: user, error: userError } = await this.supabase.auth.admin.getUserById(userId);
    
    if (userError) {
      console.error('Failed to fetch user:', userError);
      throw userError;
    }
    
    // Get user profile from profiles table
    const { data: profile, error: profileError } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      console.error('Failed to fetch profile:', profileError);
      throw profileError;
    }
    
    // Get user permissions
    const { data: permissions, error: permissionsError } = await this.supabase
      .from('user_permissions')
      .select('permission')
      .eq('user_id', userId);
      
    if (permissionsError) {
      console.error('Failed to fetch permissions:', permissionsError);
      throw permissionsError;
    }
    
    // Combine user data
    return {
      id: user.user.id,
      email: user.user.email!,
      first_name: profile.first_name,
      last_name: profile.last_name,
      role: profile.role,
      permissions: permissions.map(p => p.permission),
      preferences: profile.preferences || {},
      created_at: user.user.created_at,
      updated_at: profile.updated_at,
    };
  }
  
  async updateUserProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile> {
    const profileUpdates: any = {};
    
    // Extract profile fields
    if (updates.first_name !== undefined) profileUpdates.first_name = updates.first_name;
    if (updates.last_name !== undefined) profileUpdates.last_name = updates.last_name;
    if (updates.role !== undefined) profileUpdates.role = updates.role;
    if (updates.preferences !== undefined) profileUpdates.preferences = updates.preferences;
    
    // Update profile
    if (Object.keys(profileUpdates).length > 0) {
      profileUpdates.updated_at = new Date().toISOString();
      
      const { error: profileError } = await this.supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', userId);
        
      if (profileError) {
        console.error('Failed to update profile:', profileError);
        throw profileError;
      }
    }
    
    // Update email if provided
    if (updates.email !== undefined) {
      const { error: emailError } = await this.supabase.auth.admin.updateUserById(
        userId,
        { email: updates.email }
      );
      
      if (emailError) {
        console.error('Failed to update email:', emailError);
        throw emailError;
      }
    }
    
    // Update permissions if provided
    if (updates.permissions !== undefined) {
      // Delete existing permissions
      const { error: deleteError } = await this.supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', userId);
        
      if (deleteError) {
        console.error('Failed to delete permissions:', deleteError);
        throw deleteError;
      }
      
      // Insert new permissions
      if (updates.permissions.length > 0) {
        const permissionsToInsert = updates.permissions.map(permission => ({
          user_id: userId,
          permission,
        }));
        
        const { error: insertError } = await this.supabase
          .from('user_permissions')
          .insert(permissionsToInsert);
          
        if (insertError) {
          console.error('Failed to insert permissions:', insertError);
          throw insertError;
        }
      }
    }
    
    // Return updated profile
    return this.getUserProfile(userId);
  }
  
  async checkPermission(userId: string, permission: string): Promise<boolean> {
    // Get user profile
    const profile = await this.getUserProfile(userId);
    
    // Check if user has permission
    return profile.permissions.includes(permission);
  }
}

export const userProfileService = new UserProfileService();
```

#### 17.5.2 Role-Based Access Control

```typescript
// services/rbacService.ts
import { createClient } from '@supabase/supabase-js';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export class RbacService {
  private supabase;
  
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  
  async getRoles(): Promise<Role[]> {
    // Get roles
    const { data: roles, error: rolesError } = await this.supabase
      .from('roles')
      .select('*');
      
    if (rolesError) {
      console.error('Failed to fetch roles:', rolesError);
      throw rolesError;
    }
    
    // Get permissions for each role
    const result: Role[] = [];
    
    for (const role of roles) {
      const { data: permissions, error: permissionsError } = await this.supabase
        .from('role_permissions')
        .select('permission')
        .eq('role_id', role.id);
        
      if (permissionsError) {
        console.error('Failed to fetch permissions:', permissionsError);
        throw permissionsError;
      }
      
      result.push({
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: permissions.map(p => p.permission),
      });
    }
    
    return result;
  }
  
  async getRole(roleId: string): Promise<Role> {
    // Get role
    const { data: role, error: roleError } = await this.supabase
      .from('roles')
      .select('*')
      .eq('id', roleId)
      .single();
      
    if (roleError) {
      console.error('Failed to fetch role:', roleError);
      throw roleError;
    }
    
    // Get permissions
    const { data: permissions, error: permissionsError } = await this.supabase
      .from('role_permissions')
      .select('permission')
      .eq('role_id', roleId);
      
    if (permissionsError) {
      console.error('Failed to fetch permissions:', permissionsError);
      throw permissionsError;
    }
    
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: permissions.map(p => p.permission),
    };
  }
  
  async createRole(role: Omit<Role, 'id'>): Promise<Role> {
    // Create role
    const { data: newRole, error: roleError } = await this.supabase
      .from('roles')
      .insert([{
        name: role.name,
        description: role.description,
      }])
      .select()
      .single();
      
    if (roleError) {
      console.error('Failed to create role:', roleError);
      throw roleError;
    }
    
    // Add permissions
    if (role.permissions.length > 0) {
      const permissionsToInsert = role.permissions.map(permission => ({
        role_id: newRole.id,
        permission,
      }));
      
      const { error: permissionsError } = await this.supabase
        .from('role_permissions')
        .insert(permissionsToInsert);
        
      if (permissionsError) {
        console.error('Failed to add permissions:', permissionsError);
        throw permissionsError;
      }
    }
    
    return {
      id: newRole.id,
      name: newRole.name,
      description: newRole.description,
      permissions: role.permissions,
    };
  }
  
  async updateRole(roleId: string, updates: Partial<Role>): Promise<Role> {
    const roleUpdates: any = {};
    
    // Extract role fields
    if (updates.name !== undefined) roleUpdates.name = updates.name;
    if (updates.description !== undefined) roleUpdates.description = updates.description;
    
    // Update role
    if (Object.keys(roleUpdates).length > 0) {
      const { error: roleError } = await this.supabase
        .from('roles')
        .update(roleUpdates)
        .eq('id', roleId);
        
      if (roleError) {
        console.error('Failed to update role:', roleError);
        throw roleError;
      }
    }
    
    // Update permissions if provided
    if (updates.permissions !== undefined) {
      // Delete existing permissions
      const { error: deleteError } = await this.supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', roleId);
        
      if (deleteError) {
        console.error('Failed to delete permissions:', deleteError);
        throw deleteError;
      }
      
      // Insert new permissions
      if (updates.permissions.length > 0) {
        const permissionsToInsert = updates.permissions.map(permission => ({
          role_id: roleId,
          permission,
        }));
        
        const { error: insertError } = await this.supabase
          .from('role_permissions')
          .insert(permissionsToInsert);
          
        if (insertError) {
          console.error('Failed to insert permissions:', insertError);
          throw insertError;
        }
      }
    }
    
    // Return updated role
    return this.getRole(roleId);
  }
  
  async deleteRole(roleId: string): Promise<void> {
    // Delete role
    const { error } = await this.supabase
      .from('roles')
      .delete()
      .eq('id', roleId);
      
    if (error) {
      console.error('Failed to delete role:', error);
      throw error;
    }
  }
  
  async assignRoleToUser(userId: string, roleId: string): Promise<void> {
    // Get role
    const role = await this.getRole(roleId);
    
    // Update user profile
    const { error: profileError } = await this.supabase
      .from('profiles')
      .update({ role: role.name })
      .eq('id', userId);
      
    if (profileError) {
      console.error('Failed to update profile:', profileError);
      throw profileError;
    }
    
    // Delete existing permissions
    const { error: deleteError } = await this.supabase
      .from('user_permissions')
      .delete()
      .eq('user_id', userId);
      
    if (deleteError) {
      console.error('Failed to delete permissions:', deleteError);
      throw deleteError;
    }
    
    // Insert role permissions
    if (role.permissions.length > 0) {
      const permissionsToInsert = role.permissions.map(permission => ({
        user_id: userId,
        permission,
      }));
      
      const { error: insertError } = await this.supabase
        .from('user_permissions')
        .insert(permissionsToInsert);
        
      if (insertError) {
        console.error('Failed to insert permissions:', insertError);
        throw insertError;
      }
    }
  }
}

export const rbacService = new RbacService();
```

### 17.6 Unified User Experience

#### 17.6.1 Micro-Frontend Architecture

```typescript
// src/microfrontends/registry.ts
import { lazy } from 'react';

export interface MicroFrontend {
  name: string;
  path: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  permissions?: string[];
  icon?: string;
  order?: number;
}

// Core micro-frontends
const coreMicroFrontends: MicroFrontend[] = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    component: lazy(() => import('../pages/Dashboard')),
    icon: 'dashboard',
    order: 1,
  },
  {
    name: 'Invoices',
    path: '/invoices',
    component: lazy(() => import('../pages/Invoices')),
    icon: 'receipt',
    order: 2,
  },
  {
    name: 'Customers',
    path: '/customers',
    component: lazy(() => import('../pages/Customers')),
    icon: 'people',
    order: 3,
  },
  {
    name: 'Settings',
    path: '/settings',
    component: lazy(() => import('../pages/Settings')),
    icon: 'settings',
    order: 100,
  },
];

// Extension micro-frontends
const extensionMicroFrontends: MicroFrontend[] = [
  {
    name: 'Inspections',
    path: '/inspections',
    component: lazy(() => import('../extensions/inspections/pages/Inspections')),
    permissions: ['inspections.view'],
    icon: 'search',
    order: 4,
  },
  {
    name: 'Scopes',
    path: '/scopes',
    component: lazy(() => import('../extensions/scopes/pages/Scopes')),
    permissions: ['scopes.view'],
    icon: 'list_alt',
    order: 5,
  },
  {
    name: 'Quotes',
    path: '/quotes',
    component: lazy(() => import('../extensions/quotes/pages/Quotes')),
    permissions: ['quotes.view'],
    icon: 'request_quote',
    order: 6,
  },
];

// Combine all micro-frontends
export const microFrontends: MicroFrontend[] = [
  ...coreMicroFrontends,
  ...extensionMicroFrontends,
].sort((a, b) => (a.order || 0) - (b.order || 0));

// Get micro-frontends for user
export function getMicroFrontendsForUser(userPermissions: string[]): MicroFrontend[] {
  return microFrontends.filter(mf => {
    // If no permissions required, show to all users
    if (!mf.permissions || mf.permissions.length === 0) {
      return true;
    }
    
    // Check if user has any of the required permissions
    return mf.permissions.some(permission => userPermissions.includes(permission));
  });
}
```

#### 17.6.2 Shared Component Library

```typescript
// src/components/shared/index.ts
export { Button } from './Button';
export { Card } from './Card';
export { DataTable } from './DataTable';
export { DatePicker } from './DatePicker';
export { Dialog } from './Dialog';
export { Dropdown } from './Dropdown';
export { FileUpload } from './FileUpload';
export { Form } from './Form';
export { Input } from './Input';
export { Modal } from './Modal';
export { Pagination } from './Pagination';
export { Select } from './Select';
export { Spinner } from './Spinner';
export { Tabs } from './Tabs';
export { Toast } from './Toast';
export { Tooltip } from './Tooltip';
```

#### 17.6.3 Navigation Framework

```typescript
// src/components/Navigation.tsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getMicroFrontendsForUser, MicroFrontend } from '../microfrontends/registry';
import { useAuth } from '../hooks/useAuth';

export const Navigation: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [microFrontends, setMicroFrontends] = useState<MicroFrontend[]>([]);
  
  useEffect(() => {
    if (user) {
      const mfs = getMicroFrontendsForUser(user.permissions);
      setMicroFrontends(mfs);
    }
  }, [user]);
  
  if (!user) {
    return null;
  }
  
  return (
    <nav className="navigation">
      <div className="navigation-header">
        <img src="/logo.svg" alt="Logo" className="logo" />
        <h1>Oz Invoice Safeguard</h1>
      </div>
      
      <ul className="navigation-menu">
        {microFrontends.map(mf => (
          <li key={mf.path} className={location.pathname.startsWith(mf.path) ? 'active' : ''}>
            <Link to={mf.path}>
              {mf.icon && <span className="material-icons">{mf.icon}</span>}
              <span>{mf.name}</span>
            </Link>
          </li>
        ))}
      </ul>
      
      <div className="navigation-footer">
        <div className="user-info">
          <span className="material-icons">account_circle</span>
          <span>{user.first_name} {user.last_name}</span>
        </div>
        
        <button className="logout-button" onClick={() => useAuth().logout()}>
          <span className="material-icons">logout</span>
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};
```

## 18. Conclusion

This cookbook provides a comprehensive guide to understanding, developing, deploying, and maintaining the Oz Invoice Safeguard SaaS application. It covers all aspects of the application, from system architecture to user guides, and includes detailed code examples for implementing various features.

The cookbook is organized into multiple parts due to size limitations:

- **COOKBOOK.md**: System Architecture, Development Environment Setup, Frontend Development, Backend Development
- **COOKBOOK_PART2.md**: API Integrations, Security Best Practices, Testing
- **COOKBOOK_PART3.md**: Testing (continued), Deployment, Monitoring and Maintenance, Troubleshooting, User Guides
- **COOKBOOK_PART4.md**: Future Roadmap and Scalability Planning, Advanced DevOps and CI/CD
- **COOKBOOK_PART5.md**: Disaster Recovery and Business Continuity, Extensibility and Integration Framework (Inspection Reporting Module)
- **COOKBOOK_PART6.md**: Extensibility and Integration Framework (continued - Inspection Reporting Module, Scoping Module)
- **COOKBOOK_PART7.md**: Extensibility and Integration Framework (continued - Scoping Module, Quoting Module)
- **COOKBOOK_PART8.md**: Extensibility and Integration Framework (continued - Quoting Module, Shared Authentication and Authorization, Unified User Experience)

The cookbook is designed to be a living document that can be updated as the application evolves. It provides a solid foundation for understanding the application and implementing new features.

### Key Takeaways

1. **Modular Architecture**: The application is designed with a modular architecture that allows for easy extension and integration of new modules.

2. **Event-Driven Communication**: The application uses an event-driven architecture for communication between modules, which provides loose coupling and flexibility.

3. **Shared Authentication and Authorization**: The application has a unified authentication and authorization system that works across all modules.

4. **Unified User Experience**: The application provides a consistent user experience across all modules through shared components and navigation.

5. **Extensibility**: The application is designed to be easily extended with new modules, such as the Inspection Reporting, Scoping, and Quoting modules demonstrated in this cookbook.

By following the patterns and practices outlined in this cookbook, you can maintain and extend the Oz Invoice Safeguard SaaS application to meet the evolving needs of your users.
