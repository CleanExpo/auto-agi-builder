"""
API Key Management Service

This module provides functionality for securely storing and retrieving API keys
and credentials for external service integrations such as accounting systems and CRMs.
"""
import os
import json
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
import secrets
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

from app import db
from app.models.api_credential import ApiCredential

logger = logging.getLogger(__name__)


class ApiKeyManagementError(Exception):
    """Exception raised for errors during API key management operations."""
    pass


class ApiKeyManagementService:
    """Service for managing API keys and credentials for external integrations."""
    
    def __init__(self, app_secret_key: Optional[str] = None):
        """
        Initialize the API key management service.
        
        Args:
            app_secret_key: Secret key used for encrypting/decrypting credentials.
                           If not provided, uses the Flask app's SECRET_KEY.
        """
        if not app_secret_key:
            from flask import current_app
            app_secret_key = current_app.config.get('SECRET_KEY', 'dev-key')
        
        # Generate a key from the app secret key using PBKDF2
        salt = b'oz_invoice_api_credentials'  # Salt should be stored securely in production
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        derived_key = kdf.derive(app_secret_key.encode('utf-8'))
        self.cipher_key = base64.urlsafe_b64encode(derived_key)
        self.cipher = Fernet(self.cipher_key)
    
    def store_credentials(self, 
                         business_id: str, 
                         integration_type: str, 
                         credentials: Dict[str, Any],
                         is_active: bool = True) -> ApiCredential:
        """
        Store API credentials for a specific business and integration type.
        
        Args:
            business_id: ID of the business the credentials belong to
            integration_type: Type of integration (e.g., 'xero', 'quickbooks')
            credentials: Dictionary of credentials to store
            is_active: Whether these credentials are active
            
        Returns:
            ApiCredential: The stored API credential object
        """
        try:
            # Encrypt the credentials
            credentials_json = json.dumps(credentials)
            encrypted_credentials = self.cipher.encrypt(credentials_json.encode('utf-8'))
            
            # Check if credentials already exist for this business and integration type
            api_cred = ApiCredential.query.filter_by(
                business_id=business_id,
                integration_type=integration_type
            ).first()
            
            if api_cred:
                # Update existing credentials
                api_cred.encrypted_credentials = encrypted_credentials
                api_cred.is_active = is_active
                api_cred.updated_at = datetime.utcnow()
            else:
                # Create new credentials
                api_cred = ApiCredential(
                    business_id=business_id,
                    integration_type=integration_type,
                    encrypted_credentials=encrypted_credentials,
                    is_active=is_active,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                db.session.add(api_cred)
            
            db.session.commit()
            return api_cred
            
        except Exception as e:
            db.session.rollback()
            logger.exception(f"Error storing API credentials: {str(e)}")
            raise ApiKeyManagementError(f"Failed to store API credentials: {str(e)}")
    
    def get_credentials(self, business_id: str, integration_type: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve and decrypt API credentials for a business and integration type.
        
        Args:
            business_id: ID of the business to get credentials for
            integration_type: Type of integration (e.g., 'xero', 'quickbooks')
            
        Returns:
            Dict or None: Decrypted credentials dictionary, or None if not found
        """
        try:
            api_cred = ApiCredential.query.filter_by(
                business_id=business_id,
                integration_type=integration_type,
                is_active=True
            ).first()
            
            if not api_cred:
                return None
            
            # Decrypt the credentials
            decrypted_data = self.cipher.decrypt(api_cred.encrypted_credentials)
            credentials = json.loads(decrypted_data.decode('utf-8'))
            
            return credentials
            
        except Exception as e:
            logger.exception(f"Error retrieving API credentials: {str(e)}")
            raise ApiKeyManagementError(f"Failed to retrieve API credentials: {str(e)}")
    
    def deactivate_credentials(self, business_id: str, integration_type: str) -> bool:
        """
        Deactivate API credentials for a business and integration type.
        
        Args:
            business_id: ID of the business to deactivate credentials for
            integration_type: Type of integration (e.g., 'xero', 'quickbooks')
            
        Returns:
            bool: True if deactivated, False if not found
        """
        try:
            api_cred = ApiCredential.query.filter_by(
                business_id=business_id,
                integration_type=integration_type
            ).first()
            
            if not api_cred:
                return False
            
            api_cred.is_active = False
            api_cred.updated_at = datetime.utcnow()
            db.session.commit()
            
            return True
            
        except Exception as e:
            db.session.rollback()
            logger.exception(f"Error deactivating API credentials: {str(e)}")
            raise ApiKeyManagementError(f"Failed to deactivate API credentials: {str(e)}")
    
    def delete_credentials(self, business_id: str, integration_type: str) -> bool:
        """
        Delete API credentials for a business and integration type.
        
        Args:
            business_id: ID of the business to delete credentials for
            integration_type: Type of integration (e.g., 'xero', 'quickbooks')
            
        Returns:
            bool: True if deleted, False if not found
        """
        try:
            api_cred = ApiCredential.query.filter_by(
                business_id=business_id,
                integration_type=integration_type
            ).first()
            
            if not api_cred:
                return False
            
            db.session.delete(api_cred)
            db.session.commit()
            
            return True
            
        except Exception as e:
            db.session.rollback()
            logger.exception(f"Error deleting API credentials: {str(e)}")
            raise ApiKeyManagementError(f"Failed to delete API credentials: {str(e)}")
    
    def list_integrations(self, business_id: str) -> List[Dict[str, Any]]:
        """
        List all integrations for a business.
        
        Args:
            business_id: ID of the business to list integrations for
            
        Returns:
            List[Dict]: List of integrations with metadata (not including actual credentials)
        """
        try:
            api_creds = ApiCredential.query.filter_by(
                business_id=business_id
            ).all()
            
            result = []
            for cred in api_creds:
                result.append({
                    'id': cred.id,
                    'integration_type': cred.integration_type,
                    'is_active': cred.is_active,
                    'created_at': cred.created_at.isoformat(),
                    'updated_at': cred.updated_at.isoformat()
                })
            
            return result
            
        except Exception as e:
            logger.exception(f"Error listing integrations: {str(e)}")
            raise ApiKeyManagementError(f"Failed to list integrations: {str(e)}")
    
    def generate_client_link(self, business_id: str, integration_type: str) -> str:
        """
        Generate a unique link that clients can use to set up their integration.
        
        Args:
            business_id: ID of the business the credentials belong to
            integration_type: Type of integration (e.g., 'xero', 'quickbooks')
            
        Returns:
            str: A unique token that can be appended to the setup URL
        """
        # Generate a unique token
        token = secrets.token_urlsafe(32)
        
        # Store the token in a temporary location or database table that maps
        # tokens to business_id and integration_type
        # In a real implementation, this would be stored in a database with an expiration
        
        # For demonstration purposes, we're just returning the token
        # In a real implementation, store this token with the business_id and integration_type
        setup_link = f"/api/integration/setup/{integration_type}?token={token}"
        
        return setup_link
