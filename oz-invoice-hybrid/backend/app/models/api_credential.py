"""
API Credential model definition.

Represents secure credentials for external API integrations.
"""
from datetime import datetime
from sqlalchemy.sql import func

from app import db


class ApiCredential(db.Model):
    """
    API Credential model.
    
    Stores encrypted credentials for external API integrations such as
    accounting systems (Xero, QuickBooks, MYOB) and CRMs (HubSpot).
    """
    __tablename__ = 'api_credentials'
    
    id = db.Column(db.Integer, primary_key=True)
    business_id = db.Column(db.String(36), nullable=False, index=True)
    integration_type = db.Column(db.String(50), nullable=False)
    encrypted_credentials = db.Column(db.LargeBinary, nullable=False)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    
    # Metadata
    created_at = db.Column(db.DateTime, nullable=False, default=func.now())
    updated_at = db.Column(db.DateTime, nullable=False, default=func.now(), onupdate=func.now())
    
    # We define a unique constraint to ensure only one active credential per business and integration type
    __table_args__ = (
        db.UniqueConstraint('business_id', 'integration_type', name='uq_business_integration'),
    )
    
    def __repr__(self):
        return f'<ApiCredential {self.id} {self.business_id} {self.integration_type}>'
    
    def to_dict(self, include_sensitive=False):
        """
        Convert API credential to dictionary for API responses.
        
        Args:
            include_sensitive: Whether to include encrypted credentials (usually false)
        """
        result = {
            'id': self.id,
            'business_id': self.business_id,
            'integration_type': self.integration_type,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_sensitive:
            # In practice, we'd never return the raw encrypted credentials,
            # but would instead indicate that credentials exist
            result['has_credentials'] = self.encrypted_credentials is not None
            
        return result
