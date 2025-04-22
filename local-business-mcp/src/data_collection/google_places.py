"""
Google Places API integration for discovering local businesses.
"""
import time
from typing import Dict, List, Any, Optional, Union, Tuple
import googlemaps
from datetime import datetime

from src.config.settings import GOOGLE_MAPS_API_KEY, DEFAULT_SEARCH_RADIUS_KM
from src.utils.geo_utils import create_geography_point, geocode_address
from src.models import Business, BusinessLocation, BusinessType, BusinessStatus
from src.config.database import get_db_session


class GooglePlacesAPI:
    """Interface for the Google Places API to discover local businesses."""
    
    def __init__(self):
        """Initialize the Google Places API client."""
        if not GOOGLE_MAPS_API_KEY:
            raise ValueError("Google Maps API key not configured. Please set GOOGLE_MAPS_API_KEY.")
        
        self.client = googlemaps.Client(key=GOOGLE_MAPS_API_KEY)
    
    def search_nearby(
        self,
        location: Union[str, Tuple[float, float]],
        radius_km: float = DEFAULT_SEARCH_RADIUS_KM,
        keyword: Optional[str] = None,
        business_type: Optional[str] = None,
        max_results: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Search for businesses near a location.
        
        Args:
            location: Location to search near. Either an address string or (lat, lng) tuple.
            radius_km: Search radius in kilometers (max 50km for Google Places API).
            keyword: Keyword to filter results (e.g., "coffee", "restaurant").
            business_type: Type of place (e.g., "restaurant", "cafe").
            max_results: Maximum number of results to return.
            
        Returns:
            List of dictionaries containing business information.
        """
        # Convert radius to meters for Google Places API
        radius_meters = int(radius_km * 1000)
        if radius_meters > 50000:
            radius_meters = 50000  # Google Places API maximum
            print(f"Warning: Radius limited to 50km (Google API restriction)")
        
        # Process location parameter
        if isinstance(location, str):
            lat, lng = geocode_address(location)
        else:
            lat, lng = location
        
        # Prepare request parameters
        params = {
            "location": (lat, lng),
            "radius": radius_meters
        }
        
        if keyword:
            params["keyword"] = keyword
            
        if business_type:
            params["type"] = business_type
        
        # Execute search
        results = []
        next_page_token = None
        
        while len(results) < max_results:
            # Add page token if it exists
            if next_page_token:
                params["page_token"] = next_page_token
                # Google requires a small delay when using page tokens
                time.sleep(2)
            
            # Make the API request
            response = self.client.places_nearby(**params)
            
            # Process results
            places = response.get("results", [])
            results.extend(places)
            
            # Check for next page
            next_page_token = response.get("next_page_token")
            
            # Break if no more pages or reached max results
            if not next_page_token or len(places) == 0:
                break
        
        # Limit to max_results
        return results[:max_results]
    
    def get_place_details(self, place_id: str) -> Dict[str, Any]:
        """
        Get detailed information about a specific place.
        
        Args:
            place_id: The Google Place ID.
            
        Returns:
            Dictionary containing detailed place information.
        """
        return self.client.place(place_id=place_id, fields=[
            "name", "formatted_address", "formatted_phone_number", "website",
            "opening_hours", "rating", "user_ratings_total", "price_level",
            "business_status", "geometry", "types", "reviews", "photos"
        ])["result"]
    
    def save_businesses_to_db(self, places: List[Dict[str, Any]]) -> List[int]:
        """
        Save discovered businesses to the database.
        
        Args:
            places: List of place dictionaries from Google Places API.
            
        Returns:
            List of business IDs that were created or updated.
        """
        business_ids = []
        
        with get_db_session() as session:
            for place in places:
                place_id = place.get("place_id")
                
                # Check if this business already exists
                existing_business = session.query(Business).filter(
                    Business.google_place_id == place_id
                ).first()
                
                if existing_business:
                    # Update existing business
                    business = existing_business
                    business_ids.append(business.id)
                    # We might update some fields here, but for simplicity we're skipping that
                    continue
                
                # Get additional details if needed
                try:
                    place_details = self.get_place_details(place_id)
                except Exception as e:
                    print(f"Error getting details for place {place_id}: {e}")
                    place_details = place
                
                # Determine business type
                business_type = BusinessType.OTHER
                if "types" in place_details:
                    type_mapping = {
                        "restaurant": BusinessType.RESTAURANT,
                        "food": BusinessType.RESTAURANT,
                        "cafe": BusinessType.CAFE,
                        "bar": BusinessType.CAFE,
                        "store": BusinessType.RETAIL,
                        "shop": BusinessType.RETAIL,
                        "health": BusinessType.HEALTHCARE,
                        "entertainment": BusinessType.ENTERTAINMENT,
                        "service": BusinessType.SERVICE,
                    }
                    
                    for place_type in place_details["types"]:
                        for key, value in type_mapping.items():
                            if key in place_type:
                                business_type = value
                                break
                        if business_type != BusinessType.OTHER:
                            break
                
                # Determine business status
                status = BusinessStatus.UNKNOWN
                if "business_status" in place_details:
                    status_mapping = {
                        "OPERATIONAL": BusinessStatus.OPERATIONAL,
                        "CLOSED_TEMPORARILY": BusinessStatus.TEMPORARILY_CLOSED,
                        "CLOSED_PERMANENTLY": BusinessStatus.PERMANENTLY_CLOSED,
                    }
                    business_status = place_details.get("business_status")
                    status = status_mapping.get(business_status, BusinessStatus.UNKNOWN)
                
                # Create new business object
                business = Business(
                    name=place_details.get("name", ""),
                    business_type=business_type,
                    status=status,
                    phone=place_details.get("formatted_phone_number", ""),
                    website=place_details.get("website", ""),
                    google_place_id=place_id,
                    metadata={
                        "rating": place_details.get("rating"),
                        "user_ratings_total": place_details.get("user_ratings_total"),
                        "price_level": place_details.get("price_level"),
                        "opening_hours": place_details.get("opening_hours"),
                        "types": place_details.get("types"),
                    }
                )
                
                session.add(business)
                # Need to flush to get the business ID for location relation
                session.flush()
                
                # Extract address components
                address = place_details.get("formatted_address", "")
                address_parts = address.split(",")
                
                address_line1 = address_parts[0].strip() if len(address_parts) > 0 else ""
                city = ""
                state = ""
                postal_code = ""
                country = "United States"
                
                if len(address_parts) > 1:
                    # Try to extract city, state, postal code
                    if len(address_parts) >= 2:
                        location_parts = address_parts[-2].strip().split()
                        if len(location_parts) >= 2:
                            city = " ".join(location_parts[:-1])
                            state = location_parts[-1]
                    
                    # Try to extract postal code
                    if len(address_parts) >= 2:
                        postal_parts = address_parts[-2].strip().split()
                        if len(postal_parts) > 1 and postal_parts[-1].isdigit():
                            postal_code = postal_parts[-1]
                    
                    # Country is usually the last part
                    if len(address_parts) >= 3:
                        country = address_parts[-1].strip()
                
                # Get coordinates
                lat = place_details.get("geometry", {}).get("location", {}).get("lat")
                lng = place_details.get("geometry", {}).get("location", {}).get("lng")
                
                if lat and lng:
                    # Create location record
                    location = BusinessLocation(
                        business_id=business.id,
                        address_line1=address_line1,
                        city=city,
                        state=state,
                        postal_code=postal_code,
                        country=country,
                        coordinates=create_geography_point(lat, lng)
                    )
                    
                    session.add(location)
                
                business_ids.append(business.id)
                
            # Commit changes
            session.commit()
        
        return business_ids


def discover_businesses(
    location: Union[str, Tuple[float, float]],
    radius_km: float = DEFAULT_SEARCH_RADIUS_KM,
    keywords: Optional[List[str]] = None,
    business_types: Optional[List[str]] = None,
    max_results: int = 100
) -> List[int]:
    """
    Discover businesses in the specified area and save them to the database.
    
    Args:
        location: Location to search near (address or coordinates).
        radius_km: Search radius in kilometers.
        keywords: List of keywords to search for.
        business_types: List of business types to filter by.
        max_results: Maximum number of businesses to return.
        
    Returns:
        List of business IDs that were discovered and saved.
    """
    api = GooglePlacesAPI()
    all_results = []
    
    # If no keywords or business types specified, search with defaults
    if not keywords and not business_types:
        results = api.search_nearby(
            location=location,
            radius_km=radius_km,
            max_results=max_results
        )
        all_results.extend(results)
    else:
        # Search with each keyword
        if keywords:
            for keyword in keywords:
                results = api.search_nearby(
                    location=location,
                    radius_km=radius_km,
                    keyword=keyword,
                    max_results=max_results // len(keywords) if keywords else max_results
                )
                all_results.extend(results)
        
        # Search with each business type
        if business_types:
            for business_type in business_types:
                results = api.search_nearby(
                    location=location,
                    radius_km=radius_km,
                    business_type=business_type,
                    max_results=max_results // len(business_types) if business_types else max_results
                )
                all_results.extend(results)
    
    # Deduplicate results by place_id
    seen_place_ids = set()
    unique_results = []
    
    for place in all_results:
        place_id = place.get("place_id")
        if place_id and place_id not in seen_place_ids:
            seen_place_ids.add(place_id)
            unique_results.append(place)
    
    # Save to database and return business IDs
    return api.save_businesses_to_db(unique_results[:max_results])
