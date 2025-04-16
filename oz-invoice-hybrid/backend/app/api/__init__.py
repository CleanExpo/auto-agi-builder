"""
API Blueprint for OZ Invoice Hybrid.
This blueprint will be used for all API endpoints.
"""

from flask import Blueprint

bp = Blueprint('api', __name__)

# Import the endpoints after the blueprint is defined
from app.api import clients, invoices, integration
