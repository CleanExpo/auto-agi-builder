"""
AI API endpoints.

These endpoints handle LLM (Large Language Model) API integrations 
such as OpenAI, Anthropic, Google Vertex AI, and Azure OpenAI.
"""

import logging
from flask import jsonify, request, url_for, current_app
from datetime import datetime

from app import db
from app.api import bp
from app.models.llm_credential import LLMCredential
from app.services.ai.llm_service import LLMService, LLMServiceError

logger = logging.getLogger(__name__)


@bp.route('/ai/providers', methods=['GET'])
def get_llm_providers():
    """List available LLM providers."""
    llm_service = LLMService()
    providers = llm_service.list_providers()
    return jsonify({'providers': providers})


@bp.route('/ai/status', methods=['GET'])
def get_llm_status():
    """Get status of all LLM integrations for the current business."""
    business_id = request.args.get('business_id')
    if not business_id:
        return jsonify({'error': 'Business ID is required'}), 400
    
    llm_service = LLMService()
    
    try:
        providers = llm_service.list_business_providers(business_id)
        return jsonify({'providers': providers})
    
    except LLMServiceError as e:
        logger.exception(f"Error getting LLM status: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/ai/verify-key', methods=['POST'])
def verify_llm_key():
    """Verify an LLM API key by testing it against the provider's API."""
    data = request.json
    provider = data.get('provider')
    api_key = data.get('api_key')
    config = data.get('config')
    
    if not provider or not api_key:
        return jsonify({'error': 'Provider and API key are required'}), 400
    
    llm_service = LLMService()
    
    try:
        is_valid = llm_service.verify_api_key(provider, api_key, config)
        return jsonify({'valid': is_valid})
    
    except LLMServiceError as e:
        logger.exception(f"Error verifying LLM API key: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/ai/credentials', methods=['POST'])
def store_llm_credentials():
    """Store LLM credentials for a business."""
    data = request.json
    business_id = data.get('business_id')
    provider = data.get('provider')
    api_key = data.get('api_key')
    model = data.get('model')
    config = data.get('config')
    
    if not business_id or not provider or not api_key:
        return jsonify({'error': 'Business ID, provider, and API key are required'}), 400
    
    llm_service = LLMService()
    
    try:
        # First verify that the API key is valid
        is_valid = llm_service.verify_api_key(provider, api_key, config)
        if not is_valid:
            return jsonify({'error': 'Invalid API key'}), 400
        
        # Store the credentials
        llm_service.store_credentials(
            business_id=business_id,
            provider=provider,
            api_key=api_key,
            model=model,
            config=config,
            is_active=True
        )
        
        return jsonify({
            'success': True,
            'message': f'Successfully stored {provider} credentials'
        })
    
    except LLMServiceError as e:
        logger.exception(f"Error storing LLM credentials: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/ai/credentials/<provider>', methods=['DELETE'])
def delete_llm_credentials(provider):
    """Delete LLM credentials for a business and provider."""
    business_id = request.args.get('business_id')
    if not business_id:
        return jsonify({'error': 'Business ID is required'}), 400
    
    llm_service = LLMService()
    
    try:
        success = llm_service.delete_credentials(
            business_id=business_id,
            provider=provider
        )
        
        if not success:
            return jsonify({'error': f'No credentials found for {provider}'}), 404
        
        return jsonify({
            'success': True,
            'message': f'Successfully deleted {provider} credentials'
        })
    
    except LLMServiceError as e:
        logger.exception(f"Error deleting LLM credentials: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/ai/generate', methods=['POST'])
def generate_text():
    """Generate text using the specified LLM provider."""
    data = request.json
    business_id = data.get('business_id')
    provider = data.get('provider')
    prompt = data.get('prompt')
    model = data.get('model')
    max_tokens = data.get('max_tokens', 1000)
    temperature = data.get('temperature', 0.7)
    
    if not business_id or not provider or not prompt:
        return jsonify({'error': 'Business ID, provider, and prompt are required'}), 400
    
    llm_service = LLMService()
    
    try:
        result = llm_service.generate_text(
            business_id=business_id,
            provider=provider,
            prompt=prompt,
            model=model,
            max_tokens=max_tokens,
            temperature=temperature
        )
        
        return jsonify(result)
    
    except LLMServiceError as e:
        logger.exception(f"Error generating text: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/ai/field-suggestion', methods=['POST'])
def get_field_suggestion():
    """
    Get AI suggestions for form fields based on previous data.
    
    This endpoint uses historical data and the LLM to suggest values for invoice,
    client, or other form fields to streamline data entry.
    """
    data = request.json
    business_id = data.get('business_id')
    field_type = data.get('field_type')  # e.g., 'invoice_description', 'client_name'
    context = data.get('context', {})  # Additional context like partial input
    
    if not business_id or not field_type:
        return jsonify({'error': 'Business ID and field type are required'}), 400
    
    llm_service = LLMService()
    
    try:
        # Retrieve configured LLM providers for the business
        providers = llm_service.list_business_providers(business_id)
        if not providers:
            return jsonify({'error': 'No LLM provider configured'}), 400
        
        # Use the first active provider
        active_providers = [p for p in providers if p['is_active']]
        if not active_providers:
            return jsonify({'error': 'No active LLM provider found'}), 400
        
        provider = active_providers[0]['id']
        
        # Build a prompt based on the field type and context
        prompt = ""
        if field_type == 'invoice_description':
            prompt = f"Suggest an invoice description based on the following details: {context}"
        elif field_type == 'client_name':
            prompt = f"Suggest a client name completion based on: {context}"
        else:
            prompt = f"Suggest a value for {field_type} based on: {context}"
        
        # Generate suggestions using the LLM
        result = llm_service.generate_text(
            business_id=business_id,
            provider=provider,
            prompt=prompt,
            max_tokens=100,
            temperature=0.3  # Lower temperature for more focused suggestions
        )
        
        # Extract and format suggestions
        suggestions = result['text'].strip().split('\n')
        
        return jsonify({
            'success': True,
            'field_type': field_type,
            'suggestions': suggestions,
            'provider': provider
        })
    
    except LLMServiceError as e:
        logger.exception(f"Error getting field suggestions: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/ai/invoice-summary', methods=['POST'])
def generate_invoice_summary():
    """
    Generate a concise summary of an invoice or group of invoices.
    
    This can be used for reporting or client communications.
    """
    data = request.json
    business_id = data.get('business_id')
    invoice_ids = data.get('invoice_ids', [])
    format = data.get('format', 'text')  # text, html, or markdown
    
    if not business_id or not invoice_ids:
        return jsonify({'error': 'Business ID and invoice IDs are required'}), 400
    
    llm_service = LLMService()
    
    # TODO: In a real implementation, retrieve invoice data from the database
    # For now, we'll just use dummy data
    invoices = [
        {"id": invoice_ids[0], "amount": 1000, "client": "Test Client", "date": "2025-01-01"}
    ]
    
    try:
        # Retrieve configured LLM providers for the business
        providers = llm_service.list_business_providers(business_id)
        if not providers:
            return jsonify({'error': 'No LLM provider configured'}), 400
        
        # Use the first active provider
        active_providers = [p for p in providers if p['is_active']]
        if not active_providers:
            return jsonify({'error': 'No active LLM provider found'}), 400
        
        provider = active_providers[0]['id']
        
        # Build a prompt based on the invoices
        invoice_details = "\n".join([
            f"Invoice {inv['id']}: ${inv['amount']} for {inv['client']} on {inv['date']}"
            for inv in invoices
        ])
        
        prompt = f"""Please generate a concise summary of the following invoices in {format} format:
        
{invoice_details}

The summary should include the total amount, date range, and a brief overview.
"""
        
        # Generate summary using the LLM
        result = llm_service.generate_text(
            business_id=business_id,
            provider=provider,
            prompt=prompt,
            max_tokens=500,
            temperature=0.5
        )
        
        return jsonify({
            'success': True,
            'summary': result['text'],
            'format': format,
            'provider': provider
        })
    
    except LLMServiceError as e:
        logger.exception(f"Error generating invoice summary: {str(e)}")
        return jsonify({'error': str(e)}), 500
