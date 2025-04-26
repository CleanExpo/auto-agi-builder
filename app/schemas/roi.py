from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import date
from enum import Enum


class CostType(str, Enum):
    """Types of costs for ROI calculation"""
    DEVELOPMENT = "development"
    OPERATIONAL = "operational"
    INFRASTRUCTURE = "infrastructure"
    LICENSING = "licensing"
    SUPPORT = "support"
    TRAINING = "training"
    OTHER = "other"


class BenefitType(str, Enum):
    """Types of benefits for ROI calculation"""
    TIME_SAVING = "time_saving"
    COST_REDUCTION = "cost_reduction"
    REVENUE_INCREASE = "revenue_increase"
    QUALITY_IMPROVEMENT = "quality_improvement"
    USER_SATISFACTION = "user_satisfaction"
    RESOURCE_OPTIMIZATION = "resource_optimization"
    OTHER = "other"


class CostItem(BaseModel):
    """Individual cost item for ROI calculation"""
    id: Optional[str] = None
    name: str
    type: CostType
    amount: float
    recurring: bool = False
    frequency: Optional[str] = None  # monthly, quarterly, yearly
    description: Optional[str] = None
    
    class Config:
        schema_extra = {
            "example": {
                "name": "Developer salaries",
                "type": "development",
                "amount": 50000,
                "recurring": True,
                "frequency": "monthly",
                "description": "Salaries for 5 developers"
            }
        }


class BenefitItem(BaseModel):
    """Individual benefit item for ROI calculation"""
    id: Optional[str] = None
    name: str
    type: BenefitType
    value: float
    probability: float = 1.0  # 0.0 to 1.0
    time_to_realize: int = 0  # in months
    recurring: bool = False
    frequency: Optional[str] = None  # monthly, quarterly, yearly
    description: Optional[str] = None
    
    class Config:
        schema_extra = {
            "example": {
                "name": "Development time reduction",
                "type": "time_saving",
                "value": 100000,
                "probability": 0.8,
                "time_to_realize": 3,
                "recurring": False,
                "description": "Reduction in development time by 50%"
            }
        }


class ProjectParameters(BaseModel):
    """Basic project parameters for ROI calculation"""
    timeline_months: int = Field(..., ge=1, le=120, description="Project timeline in months")
    discount_rate: float = Field(0.1, ge=0, le=1, description="Discount rate for NPV calculation")
    currency: str = "USD"
    start_date: Optional[date] = None


class ROIInput(BaseModel):
    """Input data for ROI calculation"""
    project_id: Optional[str] = None
    name: str
    description: Optional[str] = None
    parameters: ProjectParameters
    costs: List[CostItem]
    benefits: List[BenefitItem]
    
    class Config:
        schema_extra = {
            "example": {
                "name": "AI Prototype Generator ROI Analysis",
                "description": "ROI analysis for implementing AI-powered prototype generation",
                "parameters": {
                    "timeline_months": 24,
                    "discount_rate": 0.1,
                    "currency": "USD"
                },
                "costs": [
                    {
                        "name": "Initial development",
                        "type": "development",
                        "amount": 100000,
                        "recurring": False
                    },
                    {
                        "name": "Cloud infrastructure",
                        "type": "infrastructure",
                        "amount": 2000,
                        "recurring": True,
                        "frequency": "monthly"
                    }
                ],
                "benefits": [
                    {
                        "name": "Developer productivity increase",
                        "type": "time_saving",
                        "value": 200000,
                        "probability": 0.9,
                        "time_to_realize": 3,
                        "recurring": True,
                        "frequency": "yearly"
                    }
                ]
            }
        }


class ROITimelineItem(BaseModel):
    """Single timeline item in ROI calculation results"""
    period: int
    date: Optional[date] = None
    costs: Dict[str, float]
    benefits: Dict[str, float]
    net_cash_flow: float
    discounted_cash_flow: float
    cumulative_cash_flow: float


class ROICalculationResult(BaseModel):
    """Results of ROI calculation"""
    roi_percentage: float
    net_present_value: float
    payback_period_months: Optional[float] = None
    internal_rate_of_return: Optional[float] = None
    benefit_cost_ratio: float
    total_costs: float
    total_benefits: float
    net_benefit: float
    timeline: List[ROITimelineItem]
    chart_data: Dict[str, Any]  # Flexible structure for chart data


class ROIOutput(BaseModel):
    """Output data for ROI calculation including results"""
    id: str
    project_id: Optional[str] = None
    name: str
    description: Optional[str] = None
    parameters: ProjectParameters
    costs: List[CostItem]
    benefits: List[BenefitItem]
    results: ROICalculationResult
    created_at: Optional[date] = None
    updated_at: Optional[date] = None


class ROIListItem(BaseModel):
    """Simplified ROI item for listing"""
    id: str
    project_id: Optional[str] = None
    name: str
    roi_percentage: float
    net_present_value: float
    created_at: Optional[date] = None
