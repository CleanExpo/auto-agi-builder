from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.session import get_db
from app.core.auth.jwt import get_current_user
from app.models.user import User
from app.schemas.localization import (
    RegionalSettingCreate,
    RegionalSettingUpdate,
    RegionalSettingResponse,
    RegionalSettingListResponse,
    TaxConfigurationCreate,
    TaxConfigurationUpdate,
    TaxConfigurationResponse,
    TaxConfigurationListResponse,
    RegulatoryComplianceCreate,
    RegulatoryComplianceUpdate,
    RegulatoryComplianceResponse,
    RegulatoryComplianceListResponse,
    GeographicalDataSourceCreate,
    GeographicalDataSourceUpdate,
    GeographicalDataSourceResponse,
    GeographicalDataSourceListResponse,
    LocalizationPreferenceCreate,
    LocalizationPreferenceUpdate,
    LocalizationPreferenceResponse
)
from app.services.localization import (
    RegionalSettingService,
    TaxConfigurationService,
    RegulatoryComplianceService,
    GeographicalDataService,
    LocalizationPreferenceService
)

router = APIRouter()

# Regional Settings Endpoints

@router.post("/regions", response_model=RegionalSettingResponse, status_code=201)
async def create_regional_setting(
    data: RegionalSettingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new regional setting (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only administrators can create regional settings")
    
    service = RegionalSettingService(db)
    return await service.create_regional_setting(data)

@router.get("/regions", response_model=RegionalSettingListResponse)
async def list_regional_settings(
    page: int = 1,
    size: int = 10,
    active_only: bool = True,
    search: Optional[str] = None,
    sort_by: str = "name",
    sort_dir: str = "asc",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List regional settings with pagination and filtering"""
    service = RegionalSettingService(db)
    return await service.list_regional_settings(
        page=page,
        size=size,
        active_only=active_only,
        search=search,
        sort_by=sort_by,
        sort_dir=sort_dir
    )

@router.get("/regions/{setting_id}", response_model=RegionalSettingResponse)
async def get_regional_setting(
    setting_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get regional setting by ID"""
    service = RegionalSettingService(db)
    return await service.get_regional_setting(setting_id)

@router.get("/regions/code/{code}", response_model=RegionalSettingResponse)
async def get_regional_setting_by_code(
    code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get regional setting by code (e.g., 'en-US')"""
    service = RegionalSettingService(db)
    return await service.get_regional_setting_by_code(code)

@router.put("/regions/{setting_id}", response_model=RegionalSettingResponse)
async def update_regional_setting(
    setting_id: UUID,
    data: RegionalSettingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update regional setting (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only administrators can update regional settings")
    
    service = RegionalSettingService(db)
    return await service.update_regional_setting(setting_id, data)

@router.delete("/regions/{setting_id}", response_model=bool)
async def delete_regional_setting(
    setting_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete regional setting (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only administrators can delete regional settings")
    
    service = RegionalSettingService(db)
    return await service.delete_regional_setting(setting_id)

@router.get("/regions/timezones", response_model=List[Dict[str, Any]])
async def get_timezones(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get list of supported timezones"""
    service = RegionalSettingService(db)
    return await service.get_supported_timezones()

# Tax Configuration Endpoints

@router.post("/taxes", response_model=TaxConfigurationResponse, status_code=201)
async def create_tax_configuration(
    data: TaxConfigurationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new tax configuration (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only administrators can create tax configurations")
    
    service = TaxConfigurationService(db)
    return await service.create_tax_configuration(data)

@router.get("/taxes", response_model=TaxConfigurationListResponse)
async def list_tax_configurations(
    region_id: Optional[UUID] = None,
    page: int = 1,
    size: int = 10,
    active_only: bool = True,
    search: Optional[str] = None,
    sort_by: str = "name",
    sort_dir: str = "asc",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List tax configurations with pagination and filtering"""
    service = TaxConfigurationService(db)
    return await service.list_tax_configurations(
        region_id=region_id,
        page=page,
        size=size,
        active_only=active_only,
        search=search,
        sort_by=sort_by,
        sort_dir=sort_dir
    )

@router.get("/taxes/{config_id}", response_model=TaxConfigurationResponse)
async def get_tax_configuration(
    config_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get tax configuration by ID"""
    service = TaxConfigurationService(db)
    return await service.get_tax_configuration(config_id)

@router.put("/taxes/{config_id}", response_model=TaxConfigurationResponse)
async def update_tax_configuration(
    config_id: UUID,
    data: TaxConfigurationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update tax configuration (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only administrators can update tax configurations")
    
    service = TaxConfigurationService(db)
    return await service.update_tax_configuration(config_id, data)

@router.delete("/taxes/{config_id}", response_model=bool)
async def delete_tax_configuration(
    config_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete tax configuration (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only administrators can delete tax configurations")
    
    service = TaxConfigurationService(db)
    return await service.delete_tax_configuration(config_id)

@router.get("/taxes/rate/{region_id}")
async def get_tax_rate(
    region_id: UUID,
    product_type: str = Query("digital", description="Product type: 'digital', 'physical', or 'service'"),
    amount: Optional[float] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get applicable tax rate for a region, product type, and amount"""
    service = TaxConfigurationService(db)
    return {"tax_rate": await service.get_tax_rate(region_id, product_type, amount)}

# Regulatory Compliance Endpoints

@router.post("/compliance", response_model=RegulatoryComplianceResponse, status_code=201)
async def create_regulatory_compliance(
    data: RegulatoryComplianceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new regulatory compliance record (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only administrators can create regulatory compliance records")
    
    service = RegulatoryComplianceService(db)
    return await service.create_regulatory_compliance(data)

@router.get("/compliance", response_model=RegulatoryComplianceListResponse)
async def list_regulatory_compliances(
    region_id: Optional[UUID] = None,
    compliance_type: Optional[str] = None,
    is_mandatory: Optional[bool] = None,
    page: int = 1,
    size: int = 10,
    active_only: bool = True,
    search: Optional[str] = None,
    sort_by: str = "name",
    sort_dir: str = "asc",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List regulatory compliances with pagination and filtering"""
    service = RegulatoryComplianceService(db)
    return await service.list_regulatory_compliances(
        region_id=region_id,
        compliance_type=compliance_type,
        is_mandatory=is_mandatory,
        page=page,
        size=size,
        active_only=active_only,
        search=search,
        sort_by=sort_by,
        sort_dir=sort_dir
    )

@router.get("/compliance/{compliance_id}", response_model=RegulatoryComplianceResponse)
async def get_regulatory_compliance(
    compliance_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get regulatory compliance by ID"""
    service = RegulatoryComplianceService(db)
    return await service.get_regulatory_compliance(compliance_id)

@router.put("/compliance/{compliance_id}", response_model=RegulatoryComplianceResponse)
async def update_regulatory_compliance(
    compliance_id: UUID,
    data: RegulatoryComplianceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update regulatory compliance (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only administrators can update regulatory compliance records")
    
    service = RegulatoryComplianceService(db)
    return await service.update_regulatory_compliance(compliance_id, data)

@router.delete("/compliance/{compliance_id}", response_model=bool)
async def delete_regulatory_compliance(
    compliance_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete regulatory compliance (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only administrators can delete regulatory compliance records")
    
    service = RegulatoryComplianceService(db)
    return await service.delete_regulatory_compliance(compliance_id)

@router.get("/compliance/types", response_model=List[str])
async def get_compliance_types(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get list of all compliance types in use"""
    service = RegulatoryComplianceService(db)
    return await service.get_compliance_types()

@router.get("/compliance/stats/{region_id}", response_model=Dict[str, Any])
async def check_compliance_requirements(
    region_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Check all compliance requirements for a region"""
    service = RegulatoryComplianceService(db)
    return await service.check_compliance_requirements(region_id)

# Geographical Data Endpoints

@router.post("/geo-data", response_model=GeographicalDataSourceResponse, status_code=201)
async def create_geographical_data_source(
    data: GeographicalDataSourceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new geographical data source (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only administrators can create geographical data sources")
    
    service = GeographicalDataService(db)
    return await service.create_geographical_data_source(data)

@router.get("/geo-data", response_model=GeographicalDataSourceListResponse)
async def list_geographical_data_sources(
    source_type: Optional[str] = None,
    page: int = 1,
    size: int = 10,
    active_only: bool = True,
    search: Optional[str] = None,
    sort_by: str = "name",
    sort_dir: str = "asc",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List geographical data sources with pagination and filtering"""
    service = GeographicalDataService(db)
    return await service.list_geographical_data_sources(
        source_type=source_type,
        page=page,
        size=size,
        active_only=active_only,
        search=search,
        sort_by=sort_by,
        sort_dir=sort_dir
    )

@router.get("/geo-data/{source_id}", response_model=GeographicalDataSourceResponse)
async def get_geographical_data_source(
    source_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get geographical data source by ID"""
    service = GeographicalDataService(db)
    return await service.get_geographical_data_source(source_id)

@router.put("/geo-data/{source_id}", response_model=GeographicalDataSourceResponse)
async def update_geographical_data_source(
    source_id: UUID,
    data: GeographicalDataSourceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update geographical data source (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only administrators can update geographical data sources")
    
    service = GeographicalDataService(db)
    return await service.update_geographical_data_source(source_id, data)

@router.delete("/geo-data/{source_id}", response_model=bool)
async def delete_geographical_data_source(
    source_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete geographical data source (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only administrators can delete geographical data sources")
    
    service = GeographicalDataService(db)
    return await service.delete_geographical_data_source(source_id)

@router.post("/geo-data/{source_id}/sync", response_model=Dict[str, Any])
async def sync_geographical_data(
    source_id: UUID,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Trigger a synchronization for a geographical data source (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only administrators can sync geographical data sources")
    
    service = GeographicalDataService(db)
    return await service.sync_data_source(source_id, background_tasks)

@router.get("/geo-data/{source_id}/data", response_model=Dict[str, Any])
async def get_geographical_data(
    source_id: UUID,
    force_refresh: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get data from a geographical data source"""
    service = GeographicalDataService(db)
    return await service.get_data(source_id, force_refresh)

@router.get("/geo-data/{source_id}/search", response_model=List[Dict[str, Any]])
async def search_geographical_data(
    source_id: UUID,
    query: str,
    field: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Search within a geographical data source"""
    service = GeographicalDataService(db)
    return await service.search_geographical_data(source_id, query, field)

@router.get("/geo-data/types", response_model=List[str])
async def get_geographical_data_types(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get list of all geographical data types in use"""
    service = GeographicalDataService(db)
    return await service.get_available_data_types()

# User Localization Preferences Endpoints

@router.get("/settings", response_model=Dict[str, Any])
async def get_localization_settings(
    browser_locale: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get effective localization settings for the current user"""
    service = LocalizationPreferenceService(db)
    return await service.get_effective_settings(current_user.id, browser_locale)

@router.put("/settings", response_model=LocalizationPreferenceResponse)
async def update_localization_settings(
    data: LocalizationPreferenceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update localization settings for the current user"""
    service = LocalizationPreferenceService(db)
    return await service.update_preference_by_user(current_user.id, data)

@router.post("/settings/reset", response_model=LocalizationPreferenceResponse)
async def reset_localization_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Reset localization settings for the current user to defaults"""
    service = LocalizationPreferenceService(db)
    
    try:
        # Try to get existing preference first
        preference = await service.get_preference_by_user(current_user.id)
        return await service.reset_preference(preference.id)
    except HTTPException as e:
        if e.status_code == 404:
            # If no preference exists, create one with default settings
            # Need to get a default region first
            region_service = RegionalSettingService(db)
            default_region = None
            
            try:
                # Try to get en-US first
                default_region = await region_service.get_regional_setting_by_code("en-US")
            except HTTPException:
                # Fall back to any active region
                regions = await region_service.list_regional_settings(page=1, size=1)
                if regions.items:
                    default_region = regions.items[0]
                else:
                    raise HTTPException(status_code=404, detail="No active regional settings found")
            
            # Create preference with default settings
            preference_data = LocalizationPreferenceCreate(
                user_id=current_user.id,
                region_id=default_region.id,
                use_browser_locale=True,
                override_date_format=None,
                override_time_format=None,
                override_timezone=None,
                override_number_format=None
            )
            
            return await service.create_preference(preference_data)
        else:
            # Re-raise other exceptions
            raise
