from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, HttpUrl, Field
from uuid import UUID, uuid4

class RegionalSetting(BaseModel):
    """Regional settings model for localization"""
    id: UUID = Field(default_factory=uuid4)
    name: str
    code: str  # Region/locale code (e.g., en-US, fr-FR)
    is_active: bool = True
    date_format: str = "MM/DD/YYYY"  # Default US format
    time_format: str = "hh:mm A"  # 12-hour with AM/PM
    timezone: str = "UTC"
    number_format: Dict[str, str] = {
        "decimal_separator": ".",
        "thousands_separator": ",",
        "currency_symbol": "$",
        "currency_symbol_position": "prefix"  # or "suffix"
    }
    measurement_system: str = "imperial"  # or "metric"
    week_start: int = 0  # 0 = Sunday, 1 = Monday, etc.
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        orm_mode = True


class TaxConfiguration(BaseModel):
    """Tax configuration model for a region"""
    id: UUID = Field(default_factory=uuid4)
    region_id: UUID
    name: str
    code: str  # Tax code identifier
    description: Optional[str] = None
    rate: float  # Tax rate percentage
    is_default: bool = False
    is_active: bool = True
    applies_to_digital: bool = True
    applies_to_physical: bool = True
    applies_to_services: bool = True
    threshold_amount: Optional[float] = None  # Minimum amount for tax
    effective_date: datetime = Field(default_factory=datetime.utcnow)
    expiry_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        orm_mode = True


class RegulatoryCompliance(BaseModel):
    """Regulatory compliance model for a region"""
    id: UUID = Field(default_factory=uuid4)
    region_id: UUID
    name: str
    type: str  # e.g., "privacy", "data_protection", "financial", etc.
    description: Optional[str] = None
    requirements: List[str]
    documentation_url: Optional[HttpUrl] = None
    is_mandatory: bool = True
    is_active: bool = True
    effective_date: datetime = Field(default_factory=datetime.utcnow)
    expiry_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        orm_mode = True


class GeographicalDataSource(BaseModel):
    """Geographical data source model"""
    id: UUID = Field(default_factory=uuid4)
    name: str
    type: str  # e.g., "countries", "states", "cities", "postal_codes", etc.
    description: Optional[str] = None
    source_url: Optional[HttpUrl] = None
    data_format: str = "json"  # or "csv", "xml", etc.
    is_active: bool = True
    last_sync: Optional[datetime] = None
    sync_frequency_hours: int = 24  # Sync every 24 hours by default
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        orm_mode = True


class LocalizationPreference(BaseModel):
    """User-specific localization preferences"""
    id: UUID = Field(default_factory=uuid4)
    user_id: UUID
    region_id: UUID
    use_browser_locale: bool = True
    override_date_format: Optional[str] = None
    override_time_format: Optional[str] = None
    override_timezone: Optional[str] = None
    override_number_format: Optional[Dict[str, str]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        orm_mode = True
