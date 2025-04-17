"""
Configuration settings for the Local Business MCP application.
Loads environment variables from .env file and provides them as settings.
"""
import os
from typing import Optional, Dict, Any
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = BASE_DIR / ".env"

if os.path.exists(ENV_FILE):
    load_dotenv(ENV_FILE)
else:
    print(f"Warning: .env file not found at {ENV_FILE}. Using environment variables.")

# Database settings
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", 5432)),
    "database": os.getenv("DB_NAME", "local_business_mcp"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", ""),
}

# Database URL for SQLAlchemy
DATABASE_URL = (
    f"postgresql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@"
    f"{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}"
)

# API Keys
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "")
GOOGLE_BUSINESS_API_KEY = os.getenv("GOOGLE_BUSINESS_API_KEY", "")
FACEBOOK_APP_ID = os.getenv("FACEBOOK_APP_ID", "")
FACEBOOK_APP_SECRET = os.getenv("FACEBOOK_APP_SECRET", "")

# Application settings
API_HOST = os.getenv("API_HOST", "127.0.0.1")
API_PORT = int(os.getenv("API_PORT", 8000))
DEBUG = os.getenv("DEBUG", "False").lower() in ("true", "1", "t")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# Export settings
PDF_EXPORT_ENABLED = os.getenv("PDF_EXPORT_ENABLED", "True").lower() in ("true", "1", "t")
WKHTMLTOPDF_PATH = os.getenv("WKHTMLTOPDF_PATH", "/usr/local/bin/wkhtmltopdf")

# Default search parameters
DEFAULT_SEARCH_RADIUS_KM = 20
DEFAULT_MAX_RESULTS = 100
DEFAULT_BUSINESS_TYPES = ["restaurant", "cafe", "retail", "service"]

def get_settings() -> Dict[str, Any]:
    """Return all settings as a dictionary."""
    return {
        "db_config": DB_CONFIG,
        "database_url": DATABASE_URL,
        "google_maps_api_key": GOOGLE_MAPS_API_KEY,
        "google_business_api_key": GOOGLE_BUSINESS_API_KEY,
        "facebook_app_id": FACEBOOK_APP_ID,
        "facebook_app_secret": FACEBOOK_APP_SECRET,
        "api_host": API_HOST,
        "api_port": API_PORT,
        "debug": DEBUG,
        "log_level": LOG_LEVEL,
        "pdf_export_enabled": PDF_EXPORT_ENABLED,
        "wkhtmltopdf_path": WKHTMLTOPDF_PATH,
        "default_search_radius_km": DEFAULT_SEARCH_RADIUS_KM,
        "default_max_results": DEFAULT_MAX_RESULTS,
        "default_business_types": DEFAULT_BUSINESS_TYPES,
    }
