"""
LLM Credential model definition.

Represents credentials for accessing LLM (Large Language Model) APIs.
"""
from datetime import datetime
from sqlalchemy.sql import func

from app import db


class LLMCredential(db.Model):
    """
    LLM Credential model.
    
    Stores encrypted credentials for Large Language Model APIs such as
    OpenAI, Anthropic, Google Vertex AI, etc.
    """
    __tablename__ = 'llm_credentials'
    
    id = db.Column(db.Integer, primary_key=True)
    business_id = db.Column(db.String(36), nullable=False, index=True)
    provider = db.Column(db.String(50), nullable=False)
    encrypted_api_key = db.Column(db.LargeBinary, nullable=False)
    model = db.Column(db.String(100), nullable=True)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    
    # Additional configuration (stored as JSON)
    config = db.Column(db.JSON, nullable=True)
    
    # Metadata
    created_at = db.Column(db.DateTime, nullable=False, default=func.now())
    updated_at = db.Column(db.DateTime, nullable=False, default=func.now(), onupdate=func.now())
    
    # We define a unique constraint to ensure only one active credential per business and provider
    __table_args__ = (
        db.UniqueConstraint('business_id', 'provider', name='uq_business_llm_provider'),
    )
    
    def __repr__(self):
        return f'<LLMCredential {self.id} {self.business_id} {self.provider}>'
    
    def to_dict(self, include_sensitive=False):
        """
        Convert LLM credential to dictionary for API responses.
        
        Args:
            include_sensitive: Whether to include encrypted API key indicator (usually false)
        """
        result = {
            'id': self.id,
            'business_id': self.business_id,
            'provider': self.provider,
            'model': self.model,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_sensitive:
            # In practice, we'd never return the raw encrypted API key,
            # but would instead indicate that credentials exist
            result['has_api_key'] = self.encrypted_api_key is not None
            
        return result
