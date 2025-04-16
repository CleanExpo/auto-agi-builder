"""
Configuration settings for the OZ Invoice Hybrid backend.
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

class Config:
    """Base configuration."""
    
    # Flask
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-key-for-development-only')
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL', 
        'sqlite:///oz_invoice.db'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # API Settings
    API_TITLE = 'OZ Invoice Hybrid API'
    API_VERSION = 'v1'
    
    # External API Integration Settings
    XERO_CLIENT_ID = os.environ.get('XERO_CLIENT_ID')
    XERO_CLIENT_SECRET = os.environ.get('XERO_CLIENT_SECRET')
    
    QUICKBOOKS_CLIENT_ID = os.environ.get('QUICKBOOKS_CLIENT_ID')
    QUICKBOOKS_CLIENT_SECRET = os.environ.get('QUICKBOOKS_CLIENT_SECRET')
    
    MYOB_CLIENT_ID = os.environ.get('MYOB_CLIENT_ID')
    MYOB_CLIENT_SECRET = os.environ.get('MYOB_CLIENT_SECRET')
    
    HUBSPOT_API_KEY = os.environ.get('HUBSPOT_API_KEY')
    
    # JWT Settings
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', SECRET_KEY)
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hour


class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True


class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'


class ProductionConfig(Config):
    """Production configuration."""
    SECRET_KEY = os.environ.get('SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
    DEBUG = False
    TESTING = False
