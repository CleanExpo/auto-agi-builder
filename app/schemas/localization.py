from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, HttpUrl, Field, validator
from uuid import UUID, uuid4

# Request Schemas

class RegionalSettingCreate(BaseModel):
    """Schema for creating a new regional setting"""
    name: str
    code: str
    date_format: Optional[str] = "MM/DD/YYYY"
    time_format: Optional[str] = "hh:mm A"
    timezone: Optional[str] = "UTC"
    number_format: Optional[Dict[str, str]] = None
    measurement_system: Optional[str] = "imperial"
    week_start: Optional[int] = 0
    is_active: Optional[bool] = True


class RegionalSettingUpdate(BaseModel):
    """Schema for updating an existing regional setting"""
    name: Optional[str] = None
    code: Optional[str] = None
    date_format: Optional[str] = None
    time_format: Optional[str] = None
    timezone: Optional[str] = None
    number_format: Optional[Dict[str, str]] = None
    measurement_system: Optional[str] = None
    week_start: Optional[int] = None
    is_active: Optional[bool] = None


class TaxConfigurationCreate(BaseModel):
    """Schema for creating a new tax configuration"""
    region_id: UUID
    name: str
    code: str
    description: Optional[str] = None
    rate: float
    is_default: Optional[bool] = False
    is_active: Optional[bool] = True
    applies_to_digital: Optional[bool] = True
    applies_to_physical: Optional[bool] = True
    applies_to_services: Optional[bool] = True
    threshold_amount: Optional[float] = None
    effective_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None


class TaxConfigurationUpdate(BaseModel):
    """Schema for updating an existing tax configuration"""
    region_id: Optional[UUID] = None
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    rate: Optional[float] = None
    is_default: Optional[bool] = None
    is_active: Optional[bool] = None
    applies_to_digital: Optional[bool] = None
    applies_to_physical: Optional[bool] = None
    applies_to_services: Optional[bool] = None
    threshold_amount: Optional[float] = None
    effective_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None


class RegulatoryComplianceCreate(BaseModel):
    """Schema for creating a new regulatory compliance record"""
    region_id: UUID
    name: str
    type: str
    description: Optional[str] = None
    requirements: List[str]
    documentation_url: Optional[HttpUrl] = None
    is_mandatory: Optional[bool] = True
    is_active: Optional[bool] = True
    effective_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None


class RegulatoryComplianceUpdate(BaseModel):
    """Schema for updating an existing regulatory compliance record"""
    region_id: Optional[UUID] = None
    name: Optional[str] = None
    type: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[List[str]] = None
    documentation_url: Optional[HttpUrl] = None
    is_mandatory: Optional[bool] = None
    is_active: Optional[bool] = None
    effective_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None


class GeographicalDataSourceCreate(BaseModel):
    """Schema for creating a new geographical data source"""
    name: str
    type: str
    description: Optional[str] = None
    source_url: Optional[HttpUrl] = None
    data_format: Optional[str] = "json"
    is_active: Optional[bool] = True
    sync_frequency_hours: Optional[int] = 24


class GeographicalDataSourceUpdate(BaseModel):
    """Schema for updating an existing geographical data source"""
    name: Optional[str] = None
    type: Optional[str] = None
    description: Optional[str] = None
    source_url: Optional[HttpUrl] = None
    data_format: Optional[str] = None
    is_active: Optional[bool] = None
    sync_frequency_hours: Optional[int] = None
    last_sync: Optional[datetime] = None


class LocalizationPreferenceCreate(BaseModel):
    """Schema for creating a new localization preference"""
    user_id: UUID
    region_id: UUID
    use_browser_locale: Optional[bool] = True
    override_date_format: Optional[str] = None
    override_time_format: Optional[str] = None
    override_timezone: Optional[str] = None
    override_number_format: Optional[Dict[str, str]] = None


class LocalizationPreferenceUpdate(BaseModel):
    """Schema for updating an existing localization preference"""
    region_id: Optional[UUID] = None
    use_browser_locale: Optional[bool] = None
    override_date_format: Optional[str] = None
    override_time_format: Optional[str] = None
    override_timezone: Optional[str] = None
    override_number_format: Optional[Dict[str, str]] = None


# Response Schemas

class RegionalSettingResponse(BaseModel):
    """Schema for regional setting response"""
    id: UUID
    name: str
    code: str
    date_format: str
    time_format: str
    timezone: str
    number_format: Dict[str, str]
    measurement_system: str
    week_start: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class TaxConfigurationResponse(BaseModel):
    """Schema for tax configuration response"""
    id: UUID
    region_id: UUID
    name: str
    code: str
    description: Optional[str]
    rate: float
    is_default: bool
    is_active: bool
    applies_to_digital: bool
    applies_to_physical: bool
    applies_to_services: bool
    threshold_amount: Optional[float]
    effective_date: datetime
    expiry_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class RegulatoryComplianceResponse(BaseModel):
    """Schema for regulatory compliance response"""
    id: UUID
    region_id: UUID
    name: str
    type: str
    description: Optional[str]
    requirements: List[str]
    documentation_url: Optional[HttpUrl]
    is_mandatory: bool
    is_active: bool
    effective_date: datetime
    expiry_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class GeographicalDataSourceResponse(BaseModel):
    """Schema for geographical data source response"""
    id: UUID
    name: str
    type: str
    description: Optional[str]
    source_url: Optional[HttpUrl]
    data_format: str
    is_active: bool
    last_sync: Optional[datetime]
    sync_frequency_hours: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class LocalizationPreferenceResponse(BaseModel):
    """Schema for localization preference response"""
    id: UUID
    user_id: UUID
    region_id: UUID
    use_browser_locale: bool
    override_date_format: Optional[str]
    override_time_format: Optional[str]
    override_timezone: Optional[str]
    override_number_format: Optional[Dict[str, str]]
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


# Pagination and list responses

class PaginatedResponse(BaseModel):
    """Base paginated response"""
    page: int
    size: int
    total: int
    pages: int


class RegionalSettingListResponse(PaginatedResponse):
    """Paginated list of regional settings"""
    items: List[RegionalSettingResponse]


class TaxConfigurationListResponse(PaginatedResponse):
    """Paginated list of tax configurations"""
    items: List[TaxConfigurationResponse]


class RegulatoryComplianceListResponse(PaginatedResponse):
    """Paginated list of regulatory compliances"""
    items: List[RegulatoryComplianceResponse]


class GeographicalDataSourceListResponse(PaginatedResponse):
    """Paginated list of geographical data sources"""
    items: List[GeographicalDataSourceResponse]
