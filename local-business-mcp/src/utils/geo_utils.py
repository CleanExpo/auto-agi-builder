"""
Geo-utilities for location-based operations in the Local Business MCP application.
Includes functions for geocoding, distance calculations, and spatial queries.
"""
import math
from typing import Tuple, List, Dict, Any, Optional
from functools import lru_cache
import requests
import geopy.distance
from sqlalchemy import func, text
from sqlalchemy.orm import Session
from geoalchemy2.elements import WKTElement
from geoalchemy2.functions import ST_DWithin, ST_Distance, ST_AsText, ST_GeomFromText

from src.config.settings import GOOGLE_MAPS_API_KEY
from src.models import Business, BusinessLocation


def geocode_address(address: str) -> Tuple[float, float]:
    """
    Convert an address to geographic coordinates (latitude, longitude) using Google Maps Geocoding API.
    
    Args:
        address: The address to geocode.
        
    Returns:
        Tuple of (latitude, longitude).
        
    Raises:
        ValueError: If geocoding fails or no results are found.
    """
    if not GOOGLE_MAPS_API_KEY:
        raise ValueError("Google Maps API key not configured. Please set GOOGLE_MAPS_API_KEY.")
    
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "address": address,
        "key": GOOGLE_MAPS_API_KEY
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    
    if data["status"] != "OK":
        raise ValueError(f"Geocoding failed: {data['status']}")
    
    if not data["results"]:
        raise ValueError(f"No results found for address: {address}")
    
    location = data["results"][0]["geometry"]["location"]
    return location["lat"], location["lng"]


@lru_cache(maxsize=100)
def calculate_distance(point1: Tuple[float, float], point2: Tuple[float, float]) -> float:
    """
    Calculate the distance between two geographic points in kilometers.
    Uses geopy.distance which implements the Vincenty formula.
    
    Args:
        point1: (latitude, longitude) of the first point.
        point2: (latitude, longitude) of the second point.
        
    Returns:
        Distance in kilometers.
    """
    return geopy.distance.distance(point1, point2).km


def point_to_wkt(latitude: float, longitude: float) -> str:
    """
    Convert a latitude/longitude point to a WKT (Well-Known Text) string.
    
    Args:
        latitude: The latitude coordinate.
        longitude: The longitude coordinate.
        
    Returns:
        WKT representation of the point.
    """
    return f"POINT({longitude} {latitude})"


def create_geography_point(latitude: float, longitude: float) -> WKTElement:
    """
    Create a Geography POINT element for use with GeoAlchemy2.
    
    Args:
        latitude: The latitude coordinate.
        longitude: The longitude coordinate.
        
    Returns:
        WKTElement suitable for storing in a Geography column.
    """
    return WKTElement(point_to_wkt(latitude, longitude), srid=4326)


def find_businesses_within_radius(
    session: Session,
    latitude: float,
    longitude: float,
    radius_km: float = 20,
    limit: int = 100,
    business_type: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Find businesses within a specified radius of a geographic point.
    
    Args:
        session: SQLAlchemy database session.
        latitude: The latitude of the center point.
        longitude: The longitude of the center point.
        radius_km: The search radius in kilometers.
        limit: Maximum number of businesses to return.
        business_type: Filter by business type (optional).
        
    Returns:
        List of businesses with distance information.
    """
    # Convert radius from kilometers to meters for PostGIS
    radius_meters = radius_km * 1000
    
    # Create query
    query = (
        session.query(
            Business,
            BusinessLocation,
            func.ST_Distance(
                BusinessLocation.coordinates,
                func.ST_SetSRID(func.ST_MakePoint(longitude, latitude), 4326)
            ).label("distance_meters")
        )
        .join(BusinessLocation)
        .filter(
            func.ST_DWithin(
                BusinessLocation.coordinates,
                func.ST_SetSRID(func.ST_MakePoint(longitude, latitude), 4326),
                radius_meters
            )
        )
        .order_by("distance_meters")
        .limit(limit)
    )
    
    # Add business type filter if specified
    if business_type:
        query = query.filter(Business.business_type == business_type)
    
    results = []
    for business, location, distance_meters in query.all():
        business_dict = {
            "id": business.id,
            "name": business.name,
            "business_type": business.business_type.value if business.business_type else None,
            "status": business.status.value if business.status else None,
            "address": {
                "line1": location.address_line1,
                "line2": location.address_line2,
                "city": location.city,
                "state": location.state,
                "postal_code": location.postal_code,
                "country": location.country
            },
            "distance_km": distance_meters / 1000,
            "coordinates": {
                "latitude": None,  # Will be filled from coordinates
                "longitude": None  # Will be filled from coordinates
            }
        }
        
        # Extract coordinates from geographic point
        wkt_point = session.scalar(func.ST_AsText(location.coordinates))
        if wkt_point and wkt_point.startswith("POINT("):
            # Parse "POINT(long lat)" format
            point_str = wkt_point.replace("POINT(", "").replace(")", "")
            lng, lat = map(float, point_str.split())
            business_dict["coordinates"]["latitude"] = lat
            business_dict["coordinates"]["longitude"] = lng
        
        results.append(business_dict)
    
    return results


def get_cities_in_state(session: Session, state: str) -> List[str]:
    """
    Get a list of all cities in a state that have businesses.
    
    Args:
        session: SQLAlchemy database session.
        state: The state name or abbreviation.
        
    Returns:
        List of city names.
    """
    cities = (
        session.query(BusinessLocation.city)
        .filter(func.lower(BusinessLocation.state) == state.lower())
        .distinct()
        .order_by(BusinessLocation.city)
        .all()
    )
    return [city[0] for city in cities]
