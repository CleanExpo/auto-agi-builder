"""
Main application entry point.

This file initializes and runs the Flask application for the OZ Invoice Hybrid backend.
"""

import os
from app import create_app

app = create_app()

if __name__ == '__main__':
    # Get port from environment variable or use 5000 as default
    port = int(os.environ.get('PORT', 5000))
    
    # Run the app with debug mode enabled in development
    debug = os.environ.get('FLASK_ENV', 'development') == 'development'
    
    app.run(host='0.0.0.0', port=port, debug=debug)
