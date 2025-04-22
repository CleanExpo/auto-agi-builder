"""
Export functionality for the Local Business MCP application.
Handles exporting business data and analysis results in various formats.
"""
import os
import json
import csv
import tempfile
from datetime import datetime
from typing import Dict, List, Any, Optional, Union, Tuple
import pandas as pd
from jinja2 import Environment, FileSystemLoader

from src.config.database import get_db_session
from src.models import Business, BusinessLocation, PerformanceScore


class BusinessDataExporter:
    """
    Exports business data in various formats.
    Supports CSV, JSON, Excel, and HTML exports.
    """
    
    def __init__(self, business_ids: Optional[List[int]] = None, 
                 city: Optional[str] = None, 
                 state: Optional[str] = None,
                 max_results: int = 100):
        """
        Initialize the exporter with filter criteria.
        
        Args:
            business_ids: Optional list of specific business IDs to export.
            city: Optional city name to filter businesses.
            state: Optional state name to filter businesses.
            max_results: Maximum number of businesses to include.
        """
        self.business_ids = business_ids
        self.city = city
        self.state = state
        self.max_results = max_results
        
        # Template setup for HTML exports
        template_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'templates')
        self.jinja_env = Environment(loader=FileSystemLoader(template_dir))
    
    def _get_businesses_data(self) -> List[Dict[str, Any]]:
        """
        Fetch business data based on the filter criteria.
        
        Returns:
            List of dictionaries with business data.
        """
        with get_db_session() as session:
            query = (
                session.query(Business, BusinessLocation, PerformanceScore)
                .join(BusinessLocation, Business.id == BusinessLocation.business_id)
                .outerjoin(PerformanceScore, Business.id == PerformanceScore.business_id)
            )
            
            # Apply filters
            if self.business_ids:
                query = query.filter(Business.id.in_(self.business_ids))
            
            if self.city and self.state:
                query = query.filter(
                    BusinessLocation.city.ilike(f"%{self.city}%"),
                    BusinessLocation.state.ilike(f"%{self.state}%")
                )
            
            # Limit results
            query = query.limit(self.max_results)
            
            # Process results
            results = []
            for business, location, score in query.all():
                business_data = {
                    "id": business.id,
                    "name": business.name,
                    "business_type": business.business_type.value if business.business_type else None,
                    "status": business.status.value if business.status else None,
                    "phone": business.phone,
                    "email": business.email,
                    "website": business.website,
                    "year_established": business.year_established,
                    "employee_count": business.employee_count,
                    "address": {
                        "line1": location.address_line1,
                        "line2": location.address_line2,
                        "city": location.city,
                        "state": location.state,
                        "postal_code": location.postal_code,
                        "country": location.country
                    }
                }
                
                # Add performance scores if available
                if score:
                    business_data["performance"] = {
                        "online_presence_score": score.online_presence_score,
                        "social_engagement_score": score.social_engagement_score,
                        "reputation_score": score.reputation_score,
                        "content_quality_score": score.content_quality_score,
                        "overall_score": score.overall_score,
                        "assessment_date": score.assessment_date.isoformat() if score.assessment_date else None,
                        "recommendations": score.improvement_recommendations
                    }
                
                results.append(business_data)
            
            return results
    
    def export_csv(self, filepath: str) -> str:
        """
        Export business data to a CSV file.
        
        Args:
            filepath: Path to save the CSV file.
            
        Returns:
            Path to the saved file.
        """
        businesses = self._get_businesses_data()
        
        if not businesses:
            raise ValueError("No businesses found to export")
        
        # Flatten nested data for CSV format
        flattened_data = []
        for business in businesses:
            flat_business = {
                "id": business["id"],
                "name": business["name"],
                "business_type": business["business_type"],
                "status": business["status"],
                "phone": business["phone"],
                "email": business["email"],
                "website": business["website"],
                "year_established": business["year_established"],
                "employee_count": business["employee_count"],
                "address_line1": business["address"]["line1"],
                "address_line2": business["address"]["line2"],
                "city": business["address"]["city"],
                "state": business["address"]["state"],
                "postal_code": business["address"]["postal_code"],
                "country": business["address"]["country"]
            }
            
            # Add performance data if available
            if "performance" in business:
                flat_business.update({
                    "online_presence_score": business["performance"]["online_presence_score"],
                    "social_engagement_score": business["performance"]["social_engagement_score"],
                    "reputation_score": business["performance"]["reputation_score"],
                    "content_quality_score": business["performance"]["content_quality_score"],
                    "overall_score": business["performance"]["overall_score"],
                    "assessment_date": business["performance"]["assessment_date"],
                    "recommendations": "; ".join(business["performance"].get("recommendations", []))
                })
            
            flattened_data.append(flat_business)
        
        # Write to CSV
        with open(filepath, 'w', newline='', encoding='utf-8') as csvfile:
            if flattened_data:
                fieldnames = flattened_data[0].keys()
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(flattened_data)
        
        return filepath
    
    def export_json(self, filepath: str) -> str:
        """
        Export business data to a JSON file.
        
        Args:
            filepath: Path to save the JSON file.
            
        Returns:
            Path to the saved file.
        """
        businesses = self._get_businesses_data()
        
        if not businesses:
            raise ValueError("No businesses found to export")
        
        # Write to JSON
        with open(filepath, 'w', encoding='utf-8') as jsonfile:
            json.dump(businesses, jsonfile, indent=2)
        
        return filepath
    
    def export_excel(self, filepath: str) -> str:
        """
        Export business data to an Excel file.
        
        Args:
            filepath: Path to save the Excel file.
            
        Returns:
            Path to the saved file.
        """
        businesses = self._get_businesses_data()
        
        if not businesses:
            raise ValueError("No businesses found to export")
        
        # Flatten nested data for Excel format
        flattened_data = []
        for business in businesses:
            flat_business = {
                "ID": business["id"],
                "Name": business["name"],
                "Business Type": business["business_type"],
                "Status": business["status"],
                "Phone": business["phone"],
                "Email": business["email"],
                "Website": business["website"],
                "Year Established": business["year_established"],
                "Employee Count": business["employee_count"],
                "Address Line 1": business["address"]["line1"],
                "Address Line 2": business["address"]["line2"],
                "City": business["address"]["city"],
                "State": business["address"]["state"],
                "Postal Code": business["address"]["postal_code"],
                "Country": business["address"]["country"]
            }
            
            # Add performance data if available
            if "performance" in business:
                flat_business.update({
                    "Online Presence Score": business["performance"]["online_presence_score"],
                    "Social Engagement Score": business["performance"]["social_engagement_score"],
                    "Reputation Score": business["performance"]["reputation_score"],
                    "Content Quality Score": business["performance"]["content_quality_score"],
                    "Overall Score": business["performance"]["overall_score"],
                    "Assessment Date": business["performance"]["assessment_date"],
                    "Recommendations": "; ".join(business["performance"].get("recommendations", []))
                })
            
            flattened_data.append(flat_business)
        
        # Convert to DataFrame and save as Excel
        df = pd.DataFrame(flattened_data)
        writer = pd.ExcelWriter(filepath, engine='openpyxl')
        df.to_excel(writer, sheet_name="Businesses", index=False)
        
        # Auto-adjust columns width
        for column in df:
            column_width = max(df[column].astype(str).map(len).max(), len(column))
            col_idx = df.columns.get_loc(column)
            writer.sheets["Businesses"].column_dimensions[chr(65 + col_idx)].width = column_width + 2
        
        writer.close()
        
        return filepath
    
    def export_html(self, filepath: str, template_name: str = "business_report.html") -> str:
        """
        Export business data to an HTML file.
        
        Args:
            filepath: Path to save the HTML file.
            template_name: Name of the Jinja2 template to use.
            
        Returns:
            Path to the saved file.
        """
        businesses = self._get_businesses_data()
        
        if not businesses:
            raise ValueError("No businesses found to export")
        
        # Use a default template string if template doesn't exist
        try:
            template = self.jinja_env.get_template(template_name)
        except:
            # Inline template as fallback
            template_str = """
            <!DOCTYPE html>
            <html>
            <head>
                <title>Local Business Analysis Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                    h1 { color: #2c3e50; }
                    .business { margin-bottom: 30px; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
                    .business h2 { margin-top: 0; color: #3498db; }
                    .business-details { margin-bottom: 15px; }
                    .score-container { margin-top: 10px; }
                    .score { display: inline-block; margin-right: 15px; text-align: center; }
                    .score-value { font-size: 24px; font-weight: bold; }
                    .recommendations { margin-top: 15px; }
                    .recommendations h3 { margin-bottom: 5px; color: #e74c3c; }
                    .recommendations ul { margin-top: 5px; }
                    .good { color: #27ae60; }
                    .average { color: #f39c12; }
                    .poor { color: #e74c3c; }
                    .address { margin-top: 5px; color: #7f8c8d; }
                    .contact { margin-top: 5px; }
                </style>
            </head>
            <body>
                <h1>Local Business Analysis Report</h1>
                <p>Generated on {{ generation_date }}</p>
                
                {% for business in businesses %}
                <div class="business">
                    <h2>{{ business.name }}</h2>
                    <div class="business-details">
                        <div><strong>Type:</strong> {{ business.business_type }}</div>
                        <div><strong>Status:</strong> {{ business.status }}</div>
                        <div class="address">
                            {{ business.address.line1 }}{% if business.address.line2 %}, {{ business.address.line2 }}{% endif %}<br>
                            {{ business.address.city }}, {{ business.address.state }} {{ business.address.postal_code }}<br>
                            {{ business.address.country }}
                        </div>
                        <div class="contact">
                            {% if business.phone %}<div><strong>Phone:</strong> {{ business.phone }}</div>{% endif %}
                            {% if business.email %}<div><strong>Email:</strong> {{ business.email }}</div>{% endif %}
                            {% if business.website %}<div><strong>Website:</strong> <a href="{{ business.website }}" target="_blank">{{ business.website }}</a></div>{% endif %}
                        </div>
                    </div>
                    
                    {% if business.performance %}
                    <div class="score-container">
                        <div class="score">
                            <div class="score-value {% if business.performance.overall_score >= 70 %}good{% elif business.performance.overall_score >= 40 %}average{% else %}poor{% endif %}">
                                {{ "%.1f"|format(business.performance.overall_score) }}
                            </div>
                            <div>Overall Score</div>
                        </div>
                        <div class="score">
                            <div class="score-value {% if business.performance.online_presence_score >= 70 %}good{% elif business.performance.online_presence_score >= 40 %}average{% else %}poor{% endif %}">
                                {{ "%.1f"|format(business.performance.online_presence_score) }}
                            </div>
                            <div>Online Presence</div>
                        </div>
                        <div class="score">
                            <div class="score-value {% if business.performance.social_engagement_score >= 70 %}good{% elif business.performance.social_engagement_score >= 40 %}average{% else %}poor{% endif %}">
                                {{ "%.1f"|format(business.performance.social_engagement_score) }}
                            </div>
                            <div>Social Engagement</div>
                        </div>
                        <div class="score">
                            <div class="score-value {% if business.performance.reputation_score >= 70 %}good{% elif business.performance.reputation_score >= 40 %}average{% else %}poor{% endif %}">
                                {{ "%.1f"|format(business.performance.reputation_score) }}
                            </div>
                            <div>Reputation</div>
                        </div>
                        <div class="score">
                            <div class="score-value {% if business.performance.content_quality_score >= 70 %}good{% elif business.performance.content_quality_score >= 40 %}average{% else %}poor{% endif %}">
                                {{ "%.1f"|format(business.performance.content_quality_score) }}
                            </div>
                            <div>Content Quality</div>
                        </div>
                    </div>
                    
                    {% if business.performance.recommendations %}
                    <div class="recommendations">
                        <h3>Recommendations:</h3>
                        <ul>
                            {% for recommendation in business.performance.recommendations %}
                            <li>{{ recommendation }}</li>
                            {% endfor %}
                        </ul>
                    </div>
                    {% endif %}
                    {% endif %}
                </div>
                {% endfor %}
            </body>
            </html>
            """
            from jinja2 import Template
            template = Template(template_str)
        
        # Render HTML with template
        html_content = template.render(
            businesses=businesses,
            generation_date=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        
        # Write to file
        with open(filepath, 'w', encoding='utf-8') as html_file:
            html_file.write(html_content)
        
        return filepath


def export_businesses(
    export_format: str,
    output_path: str,
    business_ids: Optional[List[int]] = None,
    city: Optional[str] = None,
    state: Optional[str] = None,
    max_results: int = 100
) -> str:
    """
    Export businesses data in the specified format.
    
    Args:
        export_format: Format to export ('csv', 'json', 'excel', 'html').
        output_path: Path to save the exported file.
        business_ids: Optional list of specific business IDs to export.
        city: Optional city name to filter businesses.
        state: Optional state name to filter businesses.
        max_results: Maximum number of businesses to include.
        
    Returns:
        Path to the exported file.
    """
    exporter = BusinessDataExporter(
        business_ids=business_ids,
        city=city,
        state=state,
        max_results=max_results
    )
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    
    # Export in the specified format
    if export_format.lower() == 'csv':
        return exporter.export_csv(output_path)
    elif export_format.lower() == 'json':
        return exporter.export_json(output_path)
    elif export_format.lower() == 'excel':
        return exporter.export_excel(output_path)
    elif export_format.lower() == 'html':
        return exporter.export_html(output_path)
    else:
        raise ValueError(f"Unsupported export format: {export_format}")
