"""
Business performance analysis module.
Analyzes the online presence and performance of local businesses.
"""
from typing import Dict, List, Any, Optional, Union, Tuple
from datetime import datetime
import re
import math
from urllib.parse import urlparse
import requests
from sqlalchemy.orm import Session

from src.config.database import get_db_session
from src.models import Business, PerformanceScore, SocialMediaPresence, SocialPlatform


class PerformanceAnalyzer:
    """
    Analyzes the performance and online presence of businesses.
    Uses a scoring system to evaluate various aspects of a business's online presence.
    """
    
    def __init__(self):
        """Initialize the performance analyzer."""
        pass
    
    def analyze_business(self, business_id: int) -> Dict[str, Any]:
        """
        Analyze the overall performance of a business.
        
        Args:
            business_id: ID of the business to analyze.
            
        Returns:
            Dictionary containing performance scores and analysis results.
        """
        with get_db_session() as session:
            business = session.query(Business).filter(Business.id == business_id).first()
            
            if not business:
                raise ValueError(f"Business with ID {business_id} not found.")
            
            # Get scores for each category
            online_presence = self._analyze_online_presence(session, business)
            social_engagement = self._analyze_social_engagement(session, business)
            reputation = self._analyze_reputation(session, business)
            content_quality = self._analyze_content_quality(session, business)
            
            # Calculate weighted overall score
            weights = {
                "online_presence": 0.3,
                "social_engagement": 0.3,
                "reputation": 0.3,
                "content_quality": 0.1
            }
            
            overall_score = (
                online_presence["score"] * weights["online_presence"] +
                social_engagement["score"] * weights["social_engagement"] +
                reputation["score"] * weights["reputation"] +
                content_quality["score"] * weights["content_quality"]
            )
            
            # Generate improvement recommendations
            recommendations = self._generate_recommendations(
                online_presence, social_engagement, reputation, content_quality
            )
            
            # Create or update performance score record
            score_record = session.query(PerformanceScore).filter(
                PerformanceScore.business_id == business_id
            ).first()
            
            if not score_record:
                score_record = PerformanceScore(business_id=business_id)
                session.add(score_record)
            
            score_record.online_presence_score = online_presence["score"]
            score_record.social_engagement_score = social_engagement["score"]
            score_record.reputation_score = reputation["score"]
            score_record.content_quality_score = content_quality["score"]
            score_record.overall_score = overall_score
            score_record.assessment_date = datetime.utcnow()
            score_record.improvement_recommendations = recommendations
            
            session.commit()
            
            # Prepare response
            result = {
                "business_id": business_id,
                "business_name": business.name,
                "scores": {
                    "online_presence": online_presence["score"],
                    "social_engagement": social_engagement["score"],
                    "reputation": reputation["score"],
                    "content_quality": content_quality["score"],
                    "overall": overall_score
                },
                "details": {
                    "online_presence": online_presence["details"],
                    "social_engagement": social_engagement["details"],
                    "reputation": reputation["details"],
                    "content_quality": content_quality["details"]
                },
                "recommendations": recommendations,
                "assessment_date": datetime.utcnow().isoformat()
            }
            
            return result
    
    def _analyze_online_presence(self, session: Session, business: Business) -> Dict[str, Any]:
        """
        Analyze the online presence of a business.
        Checks website quality, SEO, and basic online visibility.
        
        Args:
            session: Database session.
            business: Business object to analyze.
            
        Returns:
            Dictionary with score and detailed analysis.
        """
        score = 0
        details = {}
        
        # Check if business has a website
        has_website = bool(business.website)
        details["has_website"] = has_website
        if has_website:
            score += 30
        
        # Check if website is secure (HTTPS)
        if has_website:
            is_secure = business.website.startswith("https://")
            details["website_secure"] = is_secure
            if is_secure:
                score += 10
        
        # Check if website is mobile-friendly (simplified check)
        details["mobile_friendly"] = None  # Would require actual testing
        
        # Check presence of social media profiles
        social_profiles = session.query(SocialMediaPresence).filter(
            SocialMediaPresence.business_id == business.id
        ).all()
        
        social_platforms = [p.platform for p in social_profiles]
        details["social_platforms"] = [p.value for p in social_platforms]
        
        # Points for each platform
        if SocialPlatform.GOOGLE in social_platforms:
            score += 15
        if SocialPlatform.FACEBOOK in social_platforms:
            score += 10
        if SocialPlatform.INSTAGRAM in social_platforms:
            score += 10
        if SocialPlatform.TWITTER in social_platforms:
            score += 5
        if SocialPlatform.YELP in social_platforms:
            score += 10
        if SocialPlatform.LINKEDIN in social_platforms:
            score += 5
        if SocialPlatform.TIKTOK in social_platforms:
            score += 5
        
        # Cap score at 100
        score = min(score, 100)
        
        return {
            "score": score,
            "details": details
        }
    
    def _analyze_social_engagement(self, session: Session, business: Business) -> Dict[str, Any]:
        """
        Analyze the social media engagement of a business.
        
        Args:
            session: Database session.
            business: Business object to analyze.
            
        Returns:
            Dictionary with score and detailed analysis.
        """
        score = 0
        details = {}
        
        # Get social media profiles
        social_profiles = session.query(SocialMediaPresence).filter(
            SocialMediaPresence.business_id == business.id
        ).all()
        
        if not social_profiles:
            return {
                "score": 0,
                "details": {"error": "No social media profiles found"}
            }
        
        # Analyze each platform
        platform_scores = {}
        for profile in social_profiles:
            platform_score = 0
            platform_details = {}
            
            # Check follower count
            followers = profile.follower_count or 0
            platform_details["followers"] = followers
            
            # Score based on followers (logarithmic scale)
            if followers > 0:
                follower_score = min(35, math.log10(followers) * 10)
                platform_score += follower_score
            
            # Check posting frequency
            posting_freq = profile.posting_frequency or 0
            platform_details["posting_frequency"] = posting_freq
            
            # Score based on posting frequency (posts per week)
            if posting_freq > 0:
                freq_score = min(25, posting_freq * 5)
                platform_score += freq_score
            
            # Check recency of posts
            if profile.last_post_date:
                days_since_last_post = (
                    datetime.utcnow() - profile.last_post_date
                ).days
                platform_details["days_since_last_post"] = days_since_last_post
                
                # Score based on recency
                if days_since_last_post < 7:
                    platform_score += 20
                elif days_since_last_post < 30:
                    platform_score += 10
                elif days_since_last_post < 90:
                    platform_score += 5
            
            # Check verification
            if profile.is_verified:
                platform_score += 20
                platform_details["verified"] = True
            
            # Cap platform score at 100
            platform_score = min(platform_score, 100)
            platform_scores[profile.platform.value] = {
                "score": platform_score,
                "details": platform_details
            }
        
        # Calculate average score across platforms
        if platform_scores:
            score = sum(p["score"] for p in platform_scores.values()) / len(platform_scores)
        
        details["platform_scores"] = platform_scores
        
        return {
            "score": score,
            "details": details
        }
    
    def _analyze_reputation(self, session: Session, business: Business) -> Dict[str, Any]:
        """
        Analyze the reputation of a business based on ratings and reviews.
        
        Args:
            session: Database session.
            business: Business object to analyze.
            
        Returns:
            Dictionary with score and detailed analysis.
        """
        score = 0
        details = {}
        
        # Check if business has Google ratings
        metadata = business.metadata or {}
        
        google_rating = metadata.get("rating")
        rating_count = metadata.get("user_ratings_total")
        
        if google_rating is not None and rating_count is not None:
            details["google_rating"] = google_rating
            details["google_rating_count"] = rating_count
            
            # Score based on rating (0-5 scale to 0-50 scale)
            rating_score = min(50, google_rating * 10)
            score += rating_score
            
            # Score based on number of ratings (logarithmic scale)
            if rating_count > 0:
                count_score = min(30, math.log10(rating_count) * 10)
                score += count_score
        
        # Social media presence contributes to reputation
        social_profiles = session.query(SocialMediaPresence).filter(
            SocialMediaPresence.business_id == business.id
        ).all()
        
        if social_profiles:
            # Simplified scoring - more platforms = better reputation
            platform_score = min(20, len(social_profiles) * 5)
            score += platform_score
        
        # Cap score at 100
        score = min(score, 100)
        
        return {
            "score": score,
            "details": details
        }
    
    def _analyze_content_quality(self, session: Session, business: Business) -> Dict[str, Any]:
        """
        Analyze the quality of the business's online content.
        This is a simplified implementation and would need actual content analysis.
        
        Args:
            session: Database session.
            business: Business object to analyze.
            
        Returns:
            Dictionary with score and detailed analysis.
        """
        score = 0
        details = {}
        
        # Check if business has a description
        has_description = bool(business.description)
        details["has_description"] = has_description
        if has_description:
            # Simple length-based scoring for description
            desc_length = len(business.description)
            details["description_length"] = desc_length
            
            if desc_length > 500:
                score += 25
            elif desc_length > 200:
                score += 15
            elif desc_length > 50:
                score += 5
        
        # Check for website (would need actual scraping for full analysis)
        has_website = bool(business.website)
        details["has_website"] = has_website
        if has_website:
            score += 25  # Simplified score
        
        # Check for social media content (would need API access for full analysis)
        social_profiles = session.query(SocialMediaPresence).filter(
            SocialMediaPresence.business_id == business.id
        ).all()
        
        if social_profiles:
            # Simplified scoring based on number of platforms with recent posts
            recent_platforms = sum(
                1 for p in social_profiles 
                if p.last_post_date and (datetime.utcnow() - p.last_post_date).days < 30
            )
            score += min(50, recent_platforms * 10)
        
        # Cap score at 100
        score = min(score, 100)
        
        return {
            "score": score,
            "details": details
        }
    
    def _generate_recommendations(self, 
                                online_presence: Dict[str, Any],
                                social_engagement: Dict[str, Any],
                                reputation: Dict[str, Any],
                                content_quality: Dict[str, Any]) -> List[str]:
        """
        Generate improvement recommendations based on analysis results.
        
        Args:
            online_presence: Online presence analysis results.
            social_engagement: Social engagement analysis results.
            reputation: Reputation analysis results.
            content_quality: Content quality analysis results.
            
        Returns:
            List of improvement recommendations.
        """
        recommendations = []
        
        # Online presence recommendations
        if online_presence["score"] < 50:
            if not online_presence["details"].get("has_website"):
                recommendations.append("Create a professional website for your business")
            
            if online_presence["details"].get("has_website") and not online_presence["details"].get("website_secure"):
                recommendations.append("Upgrade your website to use HTTPS for better security and SEO")
            
            # Social platforms recommendations
            social_platforms = online_presence["details"].get("social_platforms", [])
            if "google" not in social_platforms:
                recommendations.append("Create a Google Business Profile for better visibility")
            
            if "facebook" not in social_platforms:
                recommendations.append("Create a Facebook business page to connect with customers")
            
            if "instagram" not in social_platforms and "facebook" in social_platforms:
                recommendations.append("Expand your social media presence with an Instagram business account")
        
        # Social engagement recommendations
        if social_engagement["score"] < 50:
            platform_scores = social_engagement["details"].get("platform_scores", {})
            
            for platform, data in platform_scores.items():
                if data["score"] < 50:
                    if data["details"].get("followers", 0) < 100:
                        recommendations.append(f"Grow your {platform} audience through engagement and targeted promotions")
                    
                    if data["details"].get("posting_frequency", 0) < 1:
                        recommendations.append(f"Increase posting frequency on {platform} to at least 1-2 times per week")
                    
                    if data["details"].get("days_since_last_post", 999) > 30:
                        recommendations.append(f"Your {platform} account needs attention - post new content soon")
        
        # Reputation recommendations
        if reputation["score"] < 50:
            google_rating = reputation["details"].get("google_rating")
            google_rating_count = reputation["details"].get("google_rating_count")
            
            if google_rating and google_rating < 4.0:
                recommendations.append("Improve your Google rating by addressing customer concerns and improving service")
            
            if google_rating_count and google_rating_count < 50:
                recommendations.append("Encourage satisfied customers to leave reviews on your Google Business Profile")
        
        # Content quality recommendations
        if content_quality["score"] < 50:
            if not content_quality["details"].get("has_description"):
                recommendations.append("Create a detailed business description for your profiles and website")
            
            elif content_quality["details"].get("description_length", 0) < 200:
                recommendations.append("Expand your business description with more details about your services and unique value")
        
        return recommendations


def analyze_business_performance(business_id: int) -> Dict[str, Any]:
    """
    Analyze the performance of a specific business.
    
    Args:
        business_id: ID of the business to analyze.
        
    Returns:
        Analysis results with scores and recommendations.
    """
    analyzer = PerformanceAnalyzer()
    return analyzer.analyze_business(business_id)


def analyze_businesses_in_area(
    city: str,
    state: str,
    max_businesses: int = 100,
    max_score: Optional[float] = None
) -> List[Dict[str, Any]]:
    """
    Analyze businesses in a specific geographic area.
    Optionally filter to only show struggling businesses (low score).
    
    Args:
        city: City name.
        state: State name or abbreviation.
        max_businesses: Maximum number of businesses to analyze.
        max_score: Only include businesses with scores below this threshold.
        
    Returns:
        List of business analysis results.
    """
    with get_db_session() as session:
        from src.models import BusinessLocation
        
        # Query businesses in the specified area
        query = (
            session.query(Business)
            .join(BusinessLocation)
            .filter(
                func.lower(BusinessLocation.city) == city.lower(),
                func.lower(BusinessLocation.state) == state.lower()
            )
            .limit(max_businesses)
        )
        
        businesses = query.all()
        
        # Analyze each business
        analyzer = PerformanceAnalyzer()
        results = []
        
        for business in businesses:
            analysis = analyzer.analyze_business(business.id)
            
            # Filter by score if specified
            if max_score is None or analysis["scores"]["overall"] <= max_score:
                results.append(analysis)
        
        return results
