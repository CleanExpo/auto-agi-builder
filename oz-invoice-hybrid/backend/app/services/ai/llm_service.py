"""
LLM Service

This module provides functionality to interact with Large Language Models (LLMs)
using credentials stored in the database. It supports various LLM providers
such as OpenAI, Anthropic, and Google Vertex AI.
"""
import logging
import json
import os
from typing import Dict, Any, Optional, List
import base64
from datetime import datetime
import requests

from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

from app import db
from app.models.llm_credential import LLMCredential

logger = logging.getLogger(__name__)


class LLMServiceError(Exception):
    """Exception raised for errors with the LLM service."""
    pass


class LLMService:
    """Service for interacting with various LLM providers."""
    
    SUPPORTED_PROVIDERS = {
        'openai': {
            'display_name': 'OpenAI',
            'available_models': ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
            'requires_organization_id': False
        },
        'anthropic': {
            'display_name': 'Anthropic',
            'available_models': ['claude-2', 'claude-instant-1', 'claude-3-opus', 'claude-3-sonnet'],
            'requires_organization_id': False
        },
        'google': {
            'display_name': 'Google Vertex AI',
            'available_models': ['gemini-pro', 'gemini-ultra'],
            'requires_organization_id': False
        },
        'azure_openai': {
            'display_name': 'Azure OpenAI',
            'available_models': ['gpt-4', 'gpt-35-turbo'],
            'requires_organization_id': True,
            'requires_endpoint': True
        }
    }
    
    def __init__(self, app_secret_key: Optional[str] = None):
        """
        Initialize the LLM service.
        
        Args:
            app_secret_key: Secret key used for encrypting/decrypting credentials.
                           If not provided, uses the Flask app's SECRET_KEY.
        """
        if not app_secret_key:
            from flask import current_app
            app_secret_key = current_app.config.get('SECRET_KEY', 'dev-key')
        
        # Generate a key from the app secret key using PBKDF2
        salt = b'oz_invoice_llm_credentials'  # Salt should be stored securely in production
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
                         provider: str,
                         api_key: str,
                         model: Optional[str] = None,
                         config: Optional[Dict[str, Any]] = None,
                         is_active: bool = True) -> LLMCredential:
        """
        Store LLM API credentials for a specific business and provider.
        
        Args:
            business_id: ID of the business the credentials belong to
            provider: LLM provider (e.g., 'openai', 'anthropic')
            api_key: The API key to store
            model: Default model to use (optional)
            config: Additional configuration options (optional)
            is_active: Whether these credentials are active
            
        Returns:
            LLMCredential: The stored LLM credential object
        """
        try:
            # Validate provider
            if provider not in self.SUPPORTED_PROVIDERS:
                raise LLMServiceError(f"Unsupported LLM provider: {provider}")
            
            # Encrypt the API key
            encrypted_api_key = self.cipher.encrypt(api_key.encode('utf-8'))
            
            # Check if credentials already exist for this business and provider
            llm_cred = LLMCredential.query.filter_by(
                business_id=business_id,
                provider=provider
            ).first()
            
            if llm_cred:
                # Update existing credentials
                llm_cred.encrypted_api_key = encrypted_api_key
                llm_cred.model = model
                llm_cred.config = config
                llm_cred.is_active = is_active
                llm_cred.updated_at = datetime.utcnow()
            else:
                # Create new credentials
                llm_cred = LLMCredential(
                    business_id=business_id,
                    provider=provider,
                    encrypted_api_key=encrypted_api_key,
                    model=model,
                    config=config,
                    is_active=is_active,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                db.session.add(llm_cred)
            
            db.session.commit()
            return llm_cred
            
        except Exception as e:
            db.session.rollback()
            logger.exception(f"Error storing LLM credentials: {str(e)}")
            raise LLMServiceError(f"Failed to store LLM credentials: {str(e)}")
    
    def get_credentials(self, business_id: str, provider: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve and decrypt LLM credentials for a business and provider.
        
        Args:
            business_id: ID of the business to get credentials for
            provider: LLM provider (e.g., 'openai', 'anthropic')
            
        Returns:
            Dict or None: Decrypted credentials dictionary, or None if not found
        """
        try:
            llm_cred = LLMCredential.query.filter_by(
                business_id=business_id,
                provider=provider,
                is_active=True
            ).first()
            
            if not llm_cred:
                return None
            
            # Decrypt the API key
            decrypted_api_key = self.cipher.decrypt(llm_cred.encrypted_api_key).decode('utf-8')
            
            return {
                'api_key': decrypted_api_key,
                'model': llm_cred.model,
                'config': llm_cred.config or {}
            }
            
        except Exception as e:
            logger.exception(f"Error retrieving LLM credentials: {str(e)}")
            raise LLMServiceError(f"Failed to retrieve LLM credentials: {str(e)}")
    
    def list_providers(self) -> List[Dict[str, Any]]:
        """
        List all supported LLM providers with their details.
        
        Returns:
            List[Dict]: List of provider details
        """
        result = []
        for provider_id, details in self.SUPPORTED_PROVIDERS.items():
            result.append({
                'id': provider_id,
                'name': details['display_name'],
                'models': details['available_models'],
                'requires_organization_id': details.get('requires_organization_id', False),
                'requires_endpoint': details.get('requires_endpoint', False)
            })
        return result
    
    def list_business_providers(self, business_id: str) -> List[Dict[str, Any]]:
        """
        List all LLM providers configured for a specific business.
        
        Args:
            business_id: ID of the business to list providers for
            
        Returns:
            List[Dict]: List of configured providers
        """
        try:
            llm_creds = LLMCredential.query.filter_by(
                business_id=business_id
            ).all()
            
            result = []
            for cred in llm_creds:
                provider_details = self.SUPPORTED_PROVIDERS.get(cred.provider, {})
                result.append({
                    'id': cred.provider,
                    'name': provider_details.get('display_name', cred.provider),
                    'model': cred.model,
                    'is_active': cred.is_active,
                    'created_at': cred.created_at.isoformat(),
                    'updated_at': cred.updated_at.isoformat()
                })
            
            return result
            
        except Exception as e:
            logger.exception(f"Error listing business LLM providers: {str(e)}")
            raise LLMServiceError(f"Failed to list business LLM providers: {str(e)}")
    
    def deactivate_credentials(self, business_id: str, provider: str) -> bool:
        """
        Deactivate LLM credentials for a business and provider.
        
        Args:
            business_id: ID of the business to deactivate credentials for
            provider: LLM provider (e.g., 'openai', 'anthropic')
            
        Returns:
            bool: True if deactivated, False if not found
        """
        try:
            llm_cred = LLMCredential.query.filter_by(
                business_id=business_id,
                provider=provider
            ).first()
            
            if not llm_cred:
                return False
            
            llm_cred.is_active = False
            llm_cred.updated_at = datetime.utcnow()
            db.session.commit()
            
            return True
            
        except Exception as e:
            db.session.rollback()
            logger.exception(f"Error deactivating LLM credentials: {str(e)}")
            raise LLMServiceError(f"Failed to deactivate LLM credentials: {str(e)}")
    
    def delete_credentials(self, business_id: str, provider: str) -> bool:
        """
        Delete LLM credentials for a business and provider.
        
        Args:
            business_id: ID of the business to delete credentials for
            provider: LLM provider (e.g., 'openai', 'anthropic')
            
        Returns:
            bool: True if deleted, False if not found
        """
        try:
            llm_cred = LLMCredential.query.filter_by(
                business_id=business_id,
                provider=provider
            ).first()
            
            if not llm_cred:
                return False
            
            db.session.delete(llm_cred)
            db.session.commit()
            
            return True
            
        except Exception as e:
            db.session.rollback()
            logger.exception(f"Error deleting LLM credentials: {str(e)}")
            raise LLMServiceError(f"Failed to delete LLM credentials: {str(e)}")
    
    def verify_api_key(self, provider: str, api_key: str, config: Optional[Dict[str, Any]] = None) -> bool:
        """
        Verify that an API key is valid by making a simple request to the provider's API.
        
        Args:
            provider: LLM provider (e.g., 'openai', 'anthropic')
            api_key: The API key to verify
            config: Additional configuration options (optional)
            
        Returns:
            bool: True if the API key is valid, False otherwise
        """
        try:
            config = config or {}
            
            if provider == 'openai':
                response = requests.get(
                    'https://api.openai.com/v1/models',
                    headers={'Authorization': f'Bearer {api_key}'}
                )
                return response.status_code == 200
                
            elif provider == 'anthropic':
                # Just a simple request to check if the API key is valid
                response = requests.get(
                    'https://api.anthropic.com/v1/models',
                    headers={'x-api-key': api_key}
                )
                return response.status_code == 200
                
            elif provider == 'google':
                # For Google Vertex AI, we need a project ID
                project_id = config.get('project_id')
                if not project_id:
                    return False
                    
                # This is a simplified check - in a real implementation, 
                # you would use the Google Cloud SDK
                headers = {'Authorization': f'Bearer {api_key}'}
                response = requests.get(
                    f'https://aiplatform.googleapis.com/v1/projects/{project_id}/locations/us-central1/models',
                    headers=headers
                )
                return response.status_code == 200
                
            elif provider == 'azure_openai':
                # For Azure OpenAI, we need an endpoint
                endpoint = config.get('endpoint')
                if not endpoint:
                    return False
                    
                # This is a simplified check
                headers = {'api-key': api_key}
                response = requests.get(
                    f'{endpoint}/openai/models',
                    headers=headers
                )
                return response.status_code == 200
                
            else:
                raise LLMServiceError(f"Unsupported LLM provider: {provider}")
                
        except Exception as e:
            logger.exception(f"Error verifying API key: {str(e)}")
            return False
    
    def generate_text(self, 
                    business_id: str, 
                    provider: str, 
                    prompt: str,
                    model: Optional[str] = None,
                    max_tokens: int = 1000,
                    temperature: float = 0.7) -> Dict[str, Any]:
        """
        Generate text using the specified LLM provider.
        
        Args:
            business_id: ID of the business to use credentials for
            provider: LLM provider (e.g., 'openai', 'anthropic')
            prompt: The text prompt to generate from
            model: The specific model to use (overrides default)
            max_tokens: Maximum number of tokens to generate
            temperature: Controls randomness (0.0 to 1.0)
            
        Returns:
            Dict: The generated text and metadata
        """
        try:
            # Get credentials
            creds = self.get_credentials(business_id, provider)
            if not creds:
                raise LLMServiceError(f"No active credentials found for {provider}")
            
            api_key = creds['api_key']
            config = creds['config'] or {}
            
            # Use specified model or default from credentials
            model_name = model or creds['model']
            if not model_name:
                # If no model is specified, use the first available model for the provider
                model_name = self.SUPPORTED_PROVIDERS[provider]['available_models'][0]
            
            # Different implementation for each provider
            if provider == 'openai':
                return self._generate_openai(api_key, prompt, model_name, max_tokens, temperature)
                
            elif provider == 'anthropic':
                return self._generate_anthropic(api_key, prompt, model_name, max_tokens, temperature)
                
            elif provider == 'google':
                return self._generate_google(api_key, prompt, model_name, max_tokens, temperature, config)
                
            elif provider == 'azure_openai':
                return self._generate_azure_openai(api_key, prompt, model_name, max_tokens, temperature, config)
                
            else:
                raise LLMServiceError(f"Unsupported LLM provider: {provider}")
                
        except Exception as e:
            logger.exception(f"Error generating text: {str(e)}")
            raise LLMServiceError(f"Failed to generate text: {str(e)}")
    
    def _generate_openai(self, 
                        api_key: str, 
                        prompt: str, 
                        model: str,
                        max_tokens: int,
                        temperature: float) -> Dict[str, Any]:
        """Generate text using OpenAI's API."""
        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
        
        data = {
            'model': model,
            'messages': [{'role': 'user', 'content': prompt}],
            'max_tokens': max_tokens,
            'temperature': temperature
        }
        
        response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers=headers,
            json=data
        )
        
        if response.status_code != 200:
            raise LLMServiceError(f"OpenAI API error: {response.text}")
        
        result = response.json()
        
        return {
            'text': result['choices'][0]['message']['content'],
            'provider': 'openai',
            'model': model,
            'usage': result.get('usage', {})
        }
    
    def _generate_anthropic(self, 
                           api_key: str, 
                           prompt: str, 
                           model: str,
                           max_tokens: int,
                           temperature: float) -> Dict[str, Any]:
        """Generate text using Anthropic's API."""
        headers = {
            'x-api-key': api_key,
            'Content-Type': 'application/json'
        }
        
        data = {
            'model': model,
            'prompt': f"\n\nHuman: {prompt}\n\nAssistant:",
            'max_tokens_to_sample': max_tokens,
            'temperature': temperature
        }
        
        response = requests.post(
            'https://api.anthropic.com/v1/complete',
            headers=headers,
            json=data
        )
        
        if response.status_code != 200:
            raise LLMServiceError(f"Anthropic API error: {response.text}")
        
        result = response.json()
        
        return {
            'text': result['completion'],
            'provider': 'anthropic',
            'model': model,
            'usage': {
                'prompt_tokens': result.get('prompt_tokens', 0),
                'completion_tokens': result.get('completion_tokens', 0),
                'total_tokens': result.get('prompt_tokens', 0) + result.get('completion_tokens', 0)
            }
        }
    
    def _generate_google(self, 
                        api_key: str, 
                        prompt: str, 
                        model: str,
                        max_tokens: int,
                        temperature: float,
                        config: Dict[str, Any]) -> Dict[str, Any]:
        """Generate text using Google Vertex AI API."""
        # This is a simplified implementation - in a real application,
        # you would use the Google Cloud SDK
        
        project_id = config.get('project_id')
        if not project_id:
            raise LLMServiceError("Missing Google Cloud project ID")
        
        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
        
        data = {
            'instances': [{
                'prompt': prompt
            }],
            'parameters': {
                'maxOutputTokens': max_tokens,
                'temperature': temperature
            }
        }
        
        response = requests.post(
            f'https://us-central1-aiplatform.googleapis.com/v1/projects/{project_id}/locations/us-central1/publishers/google/models/{model}:predict',
            headers=headers,
            json=data
        )
        
        if response.status_code != 200:
            raise LLMServiceError(f"Google Vertex AI API error: {response.text}")
        
        result = response.json()
        
        return {
            'text': result['predictions'][0]['content'],
            'provider': 'google',
            'model': model,
            'usage': {}  # Google doesn't provide token usage in the same way
        }
    
    def _generate_azure_openai(self, 
                              api_key: str, 
                              prompt: str, 
                              model: str,
                              max_tokens: int,
                              temperature: float,
                              config: Dict[str, Any]) -> Dict[str, Any]:
        """Generate text using Azure OpenAI's API."""
        endpoint = config.get('endpoint')
        if not endpoint:
            raise LLMServiceError("Missing Azure OpenAI endpoint")
        
        headers = {
            'api-key': api_key,
            'Content-Type': 'application/json'
        }
        
        data = {
            'messages': [{'role': 'user', 'content': prompt}],
            'max_tokens': max_tokens,
            'temperature': temperature
        }
        
        response = requests.post(
            f'{endpoint}/openai/deployments/{model}/chat/completions?api-version=2023-05-15',
            headers=headers,
            json=data
        )
        
        if response.status_code != 200:
            raise LLMServiceError(f"Azure OpenAI API error: {response.text}")
        
        result = response.json()
        
        return {
            'text': result['choices'][0]['message']['content'],
            'provider': 'azure_openai',
            'model': model,
            'usage': result.get('usage', {})
        }
