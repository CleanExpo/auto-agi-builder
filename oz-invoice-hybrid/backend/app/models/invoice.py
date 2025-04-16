"""
Invoice and related models definition.

Represents invoices, invoice items, and payments in the system.
"""
from datetime import datetime
from sqlalchemy.sql import func

from app import db


class Invoice(db.Model):
    """
    Invoice model.
    
    Represents an invoice that can be associated with a client and payments.
    Invoices can be imported from external systems or created manually.
    """
    __tablename__ = 'invoices'
    
    id = db.Column(db.Integer, primary_key=True)
    business_id = db.Column(db.String(36), nullable=False, index=True)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=False)
    external_id = db.Column(db.String(255), nullable=True)
    source = db.Column(db.String(50), nullable=True)
    
    invoice_number = db.Column(db.String(50), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    date = db.Column(db.Date, nullable=False)
    due_date = db.Column(db.Date, nullable=True)
    status = db.Column(db.String(20), nullable=False, default='draft')
    
    # Metadata
    created_at = db.Column(db.DateTime, nullable=False, default=func.now())
    updated_at = db.Column(db.DateTime, nullable=False, default=func.now(), onupdate=func.now())
    
    # Relationships
    items = db.relationship('InvoiceItem', backref='invoice', lazy=True, cascade='all, delete-orphan')
    payments = db.relationship('Payment', backref='invoice', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Invoice {self.id} {self.invoice_number}>'
    
    def to_dict(self):
        """Convert invoice to dictionary for API responses."""
        return {
            'id': self.id,
            'business_id': self.business_id,
            'client_id': self.client_id,
            'external_id': self.external_id,
            'source': self.source,
            'invoice_number': self.invoice_number,
            'amount': float(self.amount) if self.amount else 0.0,
            'date': self.date.isoformat() if self.date else None,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'items': [item.to_dict() for item in self.items],
            'payments': [payment.to_dict() for payment in self.payments]
        }


class InvoiceItem(db.Model):
    """
    Invoice Item model.
    
    Represents an individual line item within an invoice.
    """
    __tablename__ = 'invoice_items'
    
    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoices.id'), nullable=False)
    
    description = db.Column(db.String(255), nullable=False)
    quantity = db.Column(db.Numeric(10, 2), nullable=False, default=1)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    
    # Metadata
    created_at = db.Column(db.DateTime, nullable=False, default=func.now())
    updated_at = db.Column(db.DateTime, nullable=False, default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f'<InvoiceItem {self.id} {self.description}>'
    
    def to_dict(self):
        """Convert invoice item to dictionary for API responses."""
        return {
            'id': self.id,
            'invoice_id': self.invoice_id,
            'description': self.description,
            'quantity': float(self.quantity) if self.quantity else 0.0,
            'unit_price': float(self.unit_price) if self.unit_price else 0.0,
            'amount': float(self.amount) if self.amount else 0.0,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class Payment(db.Model):
    """
    Payment model.
    
    Represents a payment made against an invoice.
    Payments can be imported from external systems or created manually.
    """
    __tablename__ = 'payments'
    
    id = db.Column(db.Integer, primary_key=True)
    business_id = db.Column(db.String(36), nullable=False, index=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoices.id'), nullable=False)
    external_id = db.Column(db.String(255), nullable=True)
    source = db.Column(db.String(50), nullable=True)
    
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    date = db.Column(db.Date, nullable=False)
    method = db.Column(db.String(50), nullable=True)
    reference = db.Column(db.String(255), nullable=True)
    
    # Metadata
    created_at = db.Column(db.DateTime, nullable=False, default=func.now())
    updated_at = db.Column(db.DateTime, nullable=False, default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f'<Payment {self.id} {self.amount}>'
    
    def to_dict(self):
        """Convert payment to dictionary for API responses."""
        return {
            'id': self.id,
            'business_id': self.business_id,
            'invoice_id': self.invoice_id,
            'external_id': self.external_id,
            'source': self.source,
            'amount': float(self.amount) if self.amount else 0.0,
            'date': self.date.isoformat() if self.date else None,
            'method': self.method,
            'reference': self.reference,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
