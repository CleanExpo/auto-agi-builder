"""
OZ Invoice Hybrid Backend
=========================
Flask-based API backend for the OZ Invoice Hybrid application.
"""

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_restful import Api

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
api = Api()

def create_app(config_object=None):
    """Application factory pattern to create a new Flask instance."""
    app = Flask(__name__)
    
    # Load configuration
    if config_object:
        app.config.from_object(config_object)
    else:
        app.config.from_object('app.config.Config')
    
    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    api.init_app(app)
    
    # Register blueprints
    from app.api import bp as api_bp
    app.register_blueprint(api_bp, url_prefix='/api')
    
    @app.route('/health')
    def health_check():
        """Basic health check endpoint."""
        return {"status": "ok", "message": "API is running"}
    
    return app
