"""
Client model definition.

Represents a client in the system, which can be imported from external systems.
"""
from datetime import datetime
from sqlalchemy.sql import func

from app import db


class Client(db.Model):
    """
    Client model.
    
    Represents a client that can be associated with invoices and payments.
    Clients can be imported from external systems or created manually.
    """
    __tablename__ = 'clients'
    
    id = db.Column(db.Integer, primary_key=True)
    business_id = db.Column(db.String(36), nullable=False, index=True)
    external_id = db.Column(db.String(255), nullable=True)
    source = db.Column(db.String(50), nullable=True)
    
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), nullable=True)
    phone = db.Column(db.String(50), nullable=True)
    address = db.Column(db.Text, nullable=True)
    
    # Metadata
    created_at = db.Column(db.DateTime, nullable=False, default=func.now())
    updated_at = db.Column(db.DateTime, nullable=False, default=func.now(), onupdate=func.now())
    
    # Relationships
    invoices = db.relationship('Invoice', backref='client', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Client {self.id} {self.name}>'
    
    def to_dict(self):
        """Convert client to dictionary for API responses."""
        return {
            'id': self.id,
            'business_id': self.business_id,
            'external_id': self.external_id,
            'source': self.source,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'address': self.address,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
