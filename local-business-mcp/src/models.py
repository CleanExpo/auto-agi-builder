"""
Database models for the Local Business MCP application.
"""
import enum
from datetime import datetime
from typing import List, Optional
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, ForeignKey,
    Boolean, Text, Enum, JSON, func, Index
)
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.orm import relationship
from geoalchemy2 import Geography

from src.config.database import Base


class TimestampMixin:
    """Mixin to add created_at and updated_at timestamp columns to models."""
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class BusinessType(enum.Enum):
    """Enum for business types."""
    RESTAURANT = "restaurant"
    CAFE = "cafe"
    RETAIL = "retail"
    SERVICE = "service"
    HEALTHCARE = "healthcare"
    ENTERTAINMENT = "entertainment"
    OTHER = "other"


class BusinessStatus(enum.Enum):
    """Enum for business operational status."""
    OPERATIONAL = "operational"
    TEMPORARILY_CLOSED = "temporarily_closed"
    PERMANENTLY_CLOSED = "permanently_closed"
    UNKNOWN = "unknown"


class SocialPlatform(enum.Enum):
    """Enum for social media platforms."""
    GOOGLE = "google"
    FACEBOOK = "facebook"
    YELP = "yelp"
    INSTAGRAM = "instagram"
    TWITTER = "twitter"
    LINKEDIN = "linkedin"
    TIKTOK = "tiktok"
    OTHER = "other"


class Business(Base, TimestampMixin):
    """Business entity representing a local business."""
    __tablename__ = "businesses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    business_type = Column(Enum(BusinessType), nullable=False)
    status = Column(Enum(BusinessStatus), default=BusinessStatus.UNKNOWN, nullable=False)
    
    # Contact & identity information
    phone = Column(String(20))
    email = Column(String(255))
    website = Column(String(255))
    google_place_id = Column(String(255), unique=True, index=True)
    
    # Business details
    description = Column(Text)
    year_established = Column(Integer)
    employee_count = Column(Integer)
    metadata = Column(JSON, default=dict)
    
    # Relationships
    location = relationship("BusinessLocation", back_populates="business", uselist=False, cascade="all, delete-orphan")
    performance_scores = relationship("PerformanceScore", back_populates="business", cascade="all, delete-orphan")
    social_presence = relationship("SocialMediaPresence", back_populates="business", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Business {self.name} ({self.id})>"


class BusinessLocation(Base, TimestampMixin):
    """Geographic location information for a business."""
    __tablename__ = "business_locations"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, unique=True)
    
    # Address components
    address_line1 = Column(String(255), nullable=False)
    address_line2 = Column(String(255))
    city = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False, index=True)
    postal_code = Column(String(20), nullable=False, index=True)
    country = Column(String(100), nullable=False, default="United States")
    
    # Geographic coordinates (stored as WGS 84 geography point)
    coordinates = Column(Geography(geometry_type='POINT', srid=4326), nullable=False)
    
    # Relationship back to business
    business = relationship("Business", back_populates="location")

    # Spatial index for geographic queries
    __table_args__ = (
        Index('idx_business_location_coordinates', 'coordinates', postgresql_using='gist'),
    )

    def __repr__(self) -> str:
        return f"<BusinessLocation for {self.business_id}: {self.city}, {self.state}>"


class PerformanceScore(Base, TimestampMixin):
    """
    Performance metrics for evaluating the business's online presence and engagement.
    Higher scores indicate better performance.
    """
    __tablename__ = "performance_scores"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Score categories (0-100 scale, higher is better)
    online_presence_score = Column(Float, default=0)  # Website quality, SEO, etc.
    social_engagement_score = Column(Float, default=0)  # Social media activity and engagement
    reputation_score = Column(Float, default=0)  # Reviews, ratings, sentiment
    content_quality_score = Column(Float, default=0)  # Quality of online content
    
    # Overall score (weighted average of all categories)
    overall_score = Column(Float, default=0)
    
    # Last assessment date
    assessment_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Notes and recommendations
    notes = Column(Text)
    improvement_recommendations = Column(JSON, default=list)
    
    # Relationship back to business
    business = relationship("Business", back_populates="performance_scores")

    def __repr__(self) -> str:
        return f"<PerformanceScore for {self.business_id}: {self.overall_score}>"


class SocialMediaPresence(Base, TimestampMixin):
    """Information about a business's presence on a social media platform."""
    __tablename__ = "social_media_presence"

    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Platform information
    platform = Column(Enum(SocialPlatform), nullable=False)
    profile_url = Column(String(255), nullable=False)
    profile_name = Column(String(255))
    
    # Metrics
    follower_count = Column(Integer, default=0)
    posting_frequency = Column(Float, default=0)  # Average posts per week
    last_post_date = Column(DateTime)
    is_verified = Column(Boolean, default=False)
    
    # Platform-specific data
    platform_data = Column(JSON, default=dict)
    
    # Relationship back to business
    business = relationship("Business", back_populates="social_presence")
    
    __table_args__ = (
        # Ensure a business can only have one presence per platform
        Index('idx_unique_business_platform', 'business_id', 'platform', unique=True),
    )

    def __repr__(self) -> str:
        return f"<SocialMediaPresence {self.business_id} on {self.platform.value}>"
