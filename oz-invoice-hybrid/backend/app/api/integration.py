"""
Integration API endpoints.

These endpoints handle external API integrations such as connecting
to accounting software (Xero, QuickBooks, MYOB) and CRMs (HubSpot).
"""

import logging
from datetime import datetime
from flask import jsonify, request, url_for, current_app
from flask_restful import Resource

from app import db
from app.api import bp
from app.models.api_credential import ApiCredential
from app.services.integration.api_key_management import ApiKeyManagementService
from app.services.integration.external_data_sync import ExternalDataSyncService

logger = logging.getLogger(__name__)


@bp.route('/integration/providers', methods=['GET'])
def get_integration_providers():
    """List available integration providers."""
    providers = [
        {
            'id': 'xero',
            'name': 'Xero',
            'description': 'Connect to Xero accounting software',
            'icon': 'xero-icon.png',
            'auth_type': 'oauth2',
            'setup_url': url_for('api.get_integration_oauth_url', provider='xero', _external=True)
        },
        {
            'id': 'quickbooks',
            'name': 'QuickBooks',
            'description': 'Connect to QuickBooks accounting software',
            'icon': 'quickbooks-icon.png',
            'auth_type': 'oauth2',
            'setup_url': url_for('api.get_integration_oauth_url', provider='quickbooks', _external=True)
        },
        {
            'id': 'myob',
            'name': 'MYOB',
            'description': 'Connect to MYOB accounting software',
            'icon': 'myob-icon.png',
            'auth_type': 'oauth2',
            'setup_url': url_for('api.get_integration_oauth_url', provider='myob', _external=True)
        },
        {
            'id': 'hubspot',
            'name': 'HubSpot',
            'description': 'Connect to HubSpot CRM',
            'icon': 'hubspot-icon.png',
            'auth_type': 'api_key',
            'setup_url': url_for('api.get_integration_api_key_form', provider='hubspot', _external=True)
        }
    ]
    return jsonify({'providers': providers})


@bp.route('/integration/status', methods=['GET'])
def get_integration_status():
    """Get status of all integrations for the current business."""
    business_id = request.args.get('business_id')
    if not business_id:
        return jsonify({'error': 'Business ID is required'}), 400
    
    api_service = ApiKeyManagementService()
    
    try:
        integrations = api_service.list_integrations(business_id)
        
        # Format the response
        result = []
        for integration in integrations:
            # We could potentially check the last sync time, sync status, etc.
            # For now, we'll just return the basic integration info
            result.append({
                'provider_id': integration['integration_type'],
                'is_active': integration['is_active'],
                'connected_at': integration['created_at'],
                'last_updated': integration['updated_at']
            })
        
        return jsonify({'integrations': result})
    
    except Exception as e:
        logger.exception(f"Error getting integration status: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/integration/oauth/<provider>', methods=['GET'])
def get_integration_oauth_url(provider):
    """Get OAuth authorization URL for the specified provider."""
    business_id = request.args.get('business_id')
    if not business_id:
        return jsonify({'error': 'Business ID is required'}), 400
    
    if provider not in ['xero', 'quickbooks', 'myob']:
        return jsonify({'error': f'Unsupported provider: {provider}'}), 400
    
    # In a real implementation, we would generate an OAuth authorization URL
    # For this demo, we'll just return a mock URL
    callback_url = url_for('api.handle_oauth_callback', provider=provider, _external=True)
    
    # In a real implementation, we would use the OAuth library for the specific provider
    # to generate the authorization URL with the correct scopes, state, etc.
    mock_auth_url = f"https://example.com/{provider}/oauth/authorize?client_id=mock_client_id&redirect_uri={callback_url}&state={business_id}&response_type=code"
    
    return jsonify({
        'auth_url': mock_auth_url,
        'provider': provider
    })


@bp.route('/integration/oauth/<provider>/callback', methods=['GET'])
def handle_oauth_callback(provider):
    """
    Handle OAuth callback from external provider.
    
    This endpoint is called by the external provider after the user
    has authorized access to their account.
    """
    # Get the authorization code and state (business_id) from the request
    code = request.args.get('code')
    business_id = request.args.get('state')
    
    if not code or not business_id:
        return jsonify({'error': 'Missing required parameters'}), 400
    
    if provider not in ['xero', 'quickbooks', 'myob']:
        return jsonify({'error': f'Unsupported provider: {provider}'}), 400
    
    # In a real implementation, we would exchange the code for an access token
    # and store it in the database
    # For this demo, we'll just create a mock credential
    
    api_service = ApiKeyManagementService()
    
    try:
        # Mock credentials - in a real implementation, these would be obtained from the OAuth flow
        mock_credentials = {
            'access_token': 'mock_access_token',
            'refresh_token': 'mock_refresh_token',
            'expires_at': (datetime.utcnow().timestamp() + 3600),
            'token_type': 'Bearer'
        }
        
        api_service.store_credentials(
            business_id=business_id,
            integration_type=provider,
            credentials=mock_credentials,
            is_active=True
        )
        
        # Redirect to a success page
        return jsonify({
            'success': True,
            'message': f'Successfully connected to {provider}',
            'redirect_url': f'/dashboard?integration_success={provider}'
        })
    
    except Exception as e:
        logger.exception(f"Error handling OAuth callback: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/integration/apikey/<provider>', methods=['GET'])
def get_integration_api_key_form(provider):
    """
    Get API key form for the specified provider.
    
    This endpoint returns metadata about what fields are needed
    for the API key form.
    """
    business_id = request.args.get('business_id')
    if not business_id:
        return jsonify({'error': 'Business ID is required'}), 400
    
    if provider != 'hubspot':
        return jsonify({'error': f'Unsupported provider for API key: {provider}'}), 400
    
    # Define the form fields needed for HubSpot API key
    form_fields = [
        {
            'name': 'api_key',
            'label': 'API Key',
            'type': 'password',
            'required': True,
            'placeholder': 'Enter your HubSpot API key',
            'help_text': 'You can find your API key in your HubSpot account settings'
        }
    ]
    
    return jsonify({
        'provider': provider,
        'form_fields': form_fields,
        'submit_url': url_for('api.submit_api_key', provider=provider, _external=True),
        'help_url': 'https://knowledge.hubspot.com/integrations/how-do-i-get-my-hubspot-api-key'
    })


@bp.route('/integration/apikey/<provider>', methods=['POST'])
def submit_api_key(provider):
    """
    Submit API key for the specified provider.
    
    This endpoint accepts API keys and stores them securely.
    """
    business_id = request.json.get('business_id')
    api_key = request.json.get('api_key')
    
    if not business_id or not api_key:
        return jsonify({'error': 'Business ID and API key are required'}), 400
    
    if provider != 'hubspot':
        return jsonify({'error': f'Unsupported provider for API key: {provider}'}), 400
    
    api_service = ApiKeyManagementService()
    
    try:
        # Store the API key
        api_service.store_credentials(
            business_id=business_id,
            integration_type=provider,
            credentials={'api_key': api_key},
            is_active=True
        )
        
        return jsonify({
            'success': True,
            'message': f'Successfully connected to {provider}',
            'provider': provider
        })
    
    except Exception as e:
        logger.exception(f"Error storing API key: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/integration/disconnect/<provider>', methods=['POST'])
def disconnect_integration(provider):
    """
    Disconnect from the specified provider.
    
    This endpoint deactivates the API credentials for the specified provider.
    """
    business_id = request.json.get('business_id')
    
    if not business_id:
        return jsonify({'error': 'Business ID is required'}), 400
    
    if provider not in ['xero', 'quickbooks', 'myob', 'hubspot']:
        return jsonify({'error': f'Unsupported provider: {provider}'}), 400
    
    api_service = ApiKeyManagementService()
    
    try:
        # Deactivate the credentials
        success = api_service.deactivate_credentials(
            business_id=business_id,
            integration_type=provider
        )
        
        if not success:
            return jsonify({'error': f'No active connection found for {provider}'}), 404
        
        return jsonify({
            'success': True,
            'message': f'Successfully disconnected from {provider}',
            'provider': provider
        })
    
    except Exception as e:
        logger.exception(f"Error disconnecting integration: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/integration/client-link/<provider>', methods=['POST'])
def generate_client_link(provider):
    """
    Generate a link that clients can use to connect their account.
    
    This endpoint generates a unique, secure link that can be shared with clients
    to allow them to connect their accounting system without giving them access
    to the business dashboard.
    """
    business_id = request.json.get('business_id')
    
    if not business_id:
        return jsonify({'error': 'Business ID is required'}), 400
    
    if provider not in ['xero', 'quickbooks', 'myob', 'hubspot']:
        return jsonify({'error': f'Unsupported provider: {provider}'}), 400
    
    api_service = ApiKeyManagementService()
    
    try:
        # Generate a unique client link
        client_link = api_service.generate_client_link(
            business_id=business_id,
            integration_type=provider
        )
        
        # Build the full URL
        full_url = request.host_url.rstrip('/') + client_link
        
        return jsonify({
            'success': True,
            'client_link': full_url,
            'provider': provider,
            'expires_in': '7 days'  # In a real implementation, this would be configurable
        })
    
    except Exception as e:
        logger.exception(f"Error generating client link: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/integration/sync/<provider>', methods=['POST'])
def sync_data(provider):
    """
    Trigger a data sync from the specified provider.
    
    This endpoint triggers a manual data sync from the specified provider.
    """
    business_id = request.json.get('business_id')
    
    if not business_id:
        return jsonify({'error': 'Business ID is required'}), 400
    
    if provider not in ['xero', 'quickbooks', 'myob', 'hubspot']:
        return jsonify({'error': f'Unsupported provider: {provider}'}), 400
    
    # Get the API credentials for the provider
    api_service = ApiKeyManagementService()
    
    try:
        # Check if there are active credentials for this provider
        credentials = api_service.get_credentials(
            business_id=business_id,
            integration_type=provider
        )
        
        if not credentials:
            return jsonify({'error': f'No active connection found for {provider}'}), 404
        
        # TODO: Implement the actual sync logic using the appropriate adapter
        # For now, we'll just return a mock result
        
        result = {
            'success': True,
            'provider': provider,
            'sync_started_at': datetime.utcnow().isoformat(),
            'status': 'in_progress',
            'job_id': 'mock_job_id'
        }
        
        return jsonify(result)
    
    except Exception as e:
        logger.exception(f"Error starting data sync: {str(e)}")
        return jsonify({'error': str(e)}), 500


@bp.route('/integration/sync-status/<job_id>', methods=['GET'])
def get_sync_status(job_id):
    """
    Get the status of a data sync job.
    
    This endpoint returns the status of a previously triggered data sync job.
    """
    # In a real implementation, this would query a database or job queue
    # to get the status of the specified job
    # For now, we'll just return a mock result
    
    result = {
        'job_id': job_id,
        'provider': 'xero',  # This would come from the database in a real implementation
        'status': 'completed',
        'started_at': (datetime.utcnow().isoformat()),
        'completed_at': (datetime.utcnow().isoformat()),
        'stats': {
            'clients': {
                'created': 5,
                'updated': 10,
                'errors': 0
            },
            'invoices': {
                'created': 15,
                'updated': 20,
                'errors': 1
            },
            'payments': {
                'created': 8,
                'updated': 5,
                'errors': 0
            }
        }
    }
    
    return jsonify(result)


@bp.route('/integration/sync-schedule', methods=['GET', 'POST'])
def manage_sync_schedule():
    """
    Manage the sync schedule for integrations.
    
    GET: Get the current sync schedule
    POST: Update the sync schedule
    """
    business_id = request.args.get('business_id') if request.method == 'GET' else request.json.get('business_id')
    
    if not business_id:
        return jsonify({'error': 'Business ID is required'}), 400
    
    if request.method == 'GET':
        # In a real implementation, this would query a database
        # For now, we'll just return a mock result
        
        schedule = {
            'enabled': True,
            'frequency': 'daily',
            'time': '02:00',
            'timezone': 'UTC',
            'providers': ['xero', 'quickbooks'],
            'next_run': (datetime.utcnow().isoformat())
        }
        
        return jsonify(schedule)
    
    elif request.method == 'POST':
        # Update the sync schedule
        enabled = request.json.get('enabled')
        frequency = request.json.get('frequency')
        time = request.json.get('time')
        timezone = request.json.get('timezone')
        providers = request.json.get('providers')
        
        # Validate the inputs
        if enabled is None or not frequency or not time or not timezone or not providers:
            return jsonify({'error': 'Missing required parameters'}), 400
        
        if frequency not in ['hourly', 'daily', 'weekly']:
            return jsonify({'error': f'Invalid frequency: {frequency}'}), 400
        
        # In a real implementation, this would update a database
        # For now, we'll just return a success response
        
        return jsonify({
            'success': True,
            'message': 'Sync schedule updated successfully',
            'schedule': {
                'enabled': enabled,
                'frequency': frequency,
                'time': time,
                'timezone': timezone,
                'providers': providers,
                'next_run': (datetime.utcnow().isoformat())
            }
        })


# Register API endpoints using Flask-RESTful (alternative to blueprint routes)
# This shows another approach for more complex resources

class IntegrationWebhookResource(Resource):
    """
    Resource for handling webhooks from external providers.
    
    Webhooks are used by external systems to notify us of changes to
    data, such as new invoices, payments, or client updates.
    """
    
    def post(self, provider):
        """Handle a webhook from the specified provider."""
        if provider not in ['xero', 'quickbooks', 'myob', 'hubspot']:
            return {'error': f'Unsupported provider: {provider}'}, 400
        
        # Log the webhook request for debugging
        logger.debug(f"Received webhook from {provider}: {request.json}")
        
        # Verify the webhook signature if applicable
        # This is important for security to ensure the webhook is legitimate
        
        # Process the webhook data
        # In a real implementation, this would depend on the provider and event type
        
        # For now, we'll just return a success response
        return {
            'success': True,
            'message': f'Webhook from {provider} received and processed',
            'provider': provider
        }
