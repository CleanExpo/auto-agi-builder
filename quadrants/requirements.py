"""
Requirements Quadrant for the Executive System Manager.
Handles requirements gathering, user story creation, categorization, and prioritization.
"""
import re
import json
from typing import Dict, List, Any, Optional
from datetime import datetime

from .base import QuadrantBase


class RequirementsQuadrant(QuadrantBase):
    """
    Requirements Quadrant.
    Handles requirements gathering, user story creation, prioritization,
    sprint planning, and acceptance criteria generation.
    """
    
    def __init__(self, system_manager):
        """Initialize the Requirements Quadrant."""
        super().__init__(system_manager, "Requirements")
        self.ai_builder = system_manager.ai_builder
        
        # Requirement categories
        self.requirement_categories = {
            "functional": "Features and capabilities the system must provide",
            "non_functional": "Quality attributes like performance, security, etc.",
            "technical": "Implementation-specific requirements",
            "business": "Business rules and constraints",
            "user_interface": "User interface and experience requirements",
            "data": "Data storage, processing, and management requirements",
            "security": "Security and privacy requirements",
            "legal": "Legal and compliance requirements"
        }
        
        # Requirement priorities
        self.requirement_priorities = {
            "critical": "Must have for MVP, showstopper if missing",
            "high": "Important for MVP, significant impact",
            "medium": "Needed but not critical for initial release",
            "low": "Nice to have, can be deferred to later releases",
            "future": "Planned for future versions"
        }
    
    def extract_requirements(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract requirements from text using AI analysis.
        
        Args:
            text: Text to extract requirements from
            
        Returns:
            List[Dict[str, Any]]: Extracted requirements
        """
        self.logger.info("Extracting requirements from text")
        
        # In a real implementation, this would use the AI builder to analyze the text
        # and extract requirements. For now, we'll just simulate the process.
        
        # Parse the text to find requirement-like statements
        requirements = []
        lines = text.split("\n")
        
        for i, line in enumerate(lines):
            # Look for statements that resemble requirements
            # This is a simplified example; a real system would use more sophisticated NLP
            if re.search(r"(should|must|will|shall)", line, re.IGNORECASE) and len(line) > 20:
                # Determine requirement type
                req_type = "functional"
                if re.search(r"(performance|security|usability|reliability|scalability)", line, re.IGNORECASE):
                    req_type = "non_functional"
                elif re.search(r"(interface|UI|UX|screen|display|button|form)", line, re.IGNORECASE):
                    req_type = "user_interface"
                elif re.search(r"(database|data|store|record|log)", line, re.IGNORECASE):
                    req_type = "data"
                elif re.search(r"(secure|protect|encrypt|authenticate|authorize)", line, re.IGNORECASE):
                    req_type = "security"
                
                # Determine priority based on language
                priority = "medium"
                if re.search(r"(critical|crucial|essential|must)", line, re.IGNORECASE):
                    priority = "critical"
                elif re.search(r"(important|high priority|significant)", line, re.IGNORECASE):
                    priority = "high"
                elif re.search(r"(future|later|eventually|roadmap)", line, re.IGNORECASE):
                    priority = "future"
                
                # Create requirement
                requirement = {
                    "id": f"REQ-{len(requirements) + 1:03d}",
                    "description": line.strip(),
                    "category": req_type,
                    "priority": priority,
                    "source": f"Line {i+1}",
                    "extracted_at": datetime.now().isoformat()
                }
                
                requirements.append(requirement)
        
        self.logger.info(f"Extracted {len(requirements)} requirements")
        return requirements
    
    def create_user_stories(self, requirements: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Create user stories from requirements.
        
        Args:
            requirements: List of requirements
            
        Returns:
            List[Dict[str, Any]]: User stories
        """
        self.logger.info("Creating user stories from requirements")
        
        # In a real implementation, this would use the AI builder to create user stories
        # from the requirements. For now, we'll just simulate the process.
        
        user_stories = []
        
        for req in requirements:
            # Skip non-functional requirements for user stories
            if req["category"] in ["non_functional", "technical"]:
                continue
            
            # Create a user story based on the requirement description
            description = req["description"]
            
            # Generate persona
            persona = "user"
            if "admin" in description.lower() or "administrator" in description.lower():
                persona = "admin"
            elif "customer" in description.lower():
                persona = "customer"
            elif "manager" in description.lower():
                persona = "manager"
            
            # Extract action
            action = description
            # In a real implementation, this would use NLP to extract the action
            
            # Extract benefit
            benefit = "to improve their experience"
            # In a real implementation, this would use NLP to extract the benefit
            
            # Format user story
            user_story = {
                "id": f"US-{len(user_stories) + 1:03d}",
                "requirement_id": req["id"],
                "story": f"As a {persona}, I want to {action}, so that {benefit}",
                "persona": persona,
                "acceptance_criteria": [],
                "priority": req["priority"],
                "points": 3,  # Default story points
                "created_at": datetime.now().isoformat()
            }
            
            # Generate acceptance criteria (simplified)
            user_story["acceptance_criteria"] = [
                f"Given {persona} is logged in, when they access the feature, then they should be able to {action}",
                f"Given {persona} completes the action, when they submit, then the system should confirm completion"
            ]
            
            user_stories.append(user_story)
        
        self.logger.info(f"Created {len(user_stories)} user stories")
        return user_stories
    
    def categorize_requirements(self, requirements: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
        """
        Categorize requirements by type.
        
        Args:
            requirements: List of requirements
            
        Returns:
            Dict[str, List[Dict[str, Any]]]: Requirements grouped by category
        """
        self.logger.info("Categorizing requirements")
        
        categorized = {}
        
        for category in self.requirement_categories.keys():
            categorized[category] = []
        
        for req in requirements:
            category = req.get("category", "functional")
            if category in categorized:
                categorized[category].append(req)
            else:
                categorized["functional"].append(req)
        
        return categorized
    
    def prioritize_requirements(self, requirements: List[Dict[str, Any]], criteria: Optional[Dict[str, float]] = None) -> List[Dict[str, Any]]:
        """
        Prioritize requirements based on given criteria.
        
        Args:
            requirements: List of requirements
            criteria: Optional criteria weights for prioritization
            
        Returns:
            List[Dict[str, Any]]: Prioritized requirements
        """
        self.logger.info("Prioritizing requirements")
        
        # Default criteria if none provided
        if not criteria:
            criteria = {
                "business_value": 0.4,
                "user_impact": 0.3,
                "implementation_effort": 0.2,
                "risk": 0.1
            }
        
        # Assign scores (in a real system, this would be more sophisticated)
        for req in requirements:
            # Assign random scores for demonstration
            business_value = 0.8 if req["priority"] in ["critical", "high"] else 0.5
            user_impact = 0.9 if req["category"] in ["user_interface", "functional"] else 0.6
            implementation_effort = 0.6  # Medium effort (lower is better)
            risk = 0.3  # Low risk (lower is better)
            
            # Calculate weighted score
            score = (
                business_value * criteria["business_value"] +
                user_impact * criteria["user_impact"] +
                (1 - implementation_effort) * criteria["implementation_effort"] +
                (1 - risk) * criteria["risk"]
            )
            
            req["prioritization_score"] = round(score, 2)
        
        # Sort by score
        prioritized = sorted(requirements, key=lambda x: x.get("prioritization_score", 0), reverse=True)
        
        return prioritized
    
    def create_sprint_plan(self, user_stories: List[Dict[str, Any]], sprint_capacity: int = 30) -> List[Dict[str, Any]]:
        """
        Create a sprint plan from user stories.
        
        Args:
            user_stories: List of user stories
            sprint_capacity: Capacity of the sprint in story points
            
        Returns:
            List[Dict[str, Any]]: Sprint plans
        """
        self.logger.info(f"Creating sprint plan with capacity {sprint_capacity}")
        
        # Sort user stories by priority
        priority_order = {
            "critical": 0,
            "high": 1,
            "medium": 2,
            "low": 3,
            "future": 4
        }
        
        sorted_stories = sorted(
            user_stories, 
            key=lambda x: (priority_order.get(x.get("priority", "medium"), 5), -x.get("points", 3))
        )
        
        # Create sprints
        sprints = []
        current_sprint = {
            "id": f"SP-{len(sprints) + 1:02d}",
            "name": f"Sprint {len(sprints) + 1}",
            "capacity": sprint_capacity,
            "used_capacity": 0,
            "stories": [],
            "start_date": None,  # Would be set in a real implementation
            "end_date": None     # Would be set in a real implementation
        }
        
        for story in sorted_stories:
            story_points = story.get("points", 3)
            
            # If the story fits in the current sprint, add it
            if current_sprint["used_capacity"] + story_points <= sprint_capacity:
                current_sprint["stories"].append(story)
                current_sprint["used_capacity"] += story_points
            else:
                # Save current sprint and create a new one
                sprints.append(current_sprint)
                current_sprint = {
                    "id": f"SP-{len(sprints) + 1:02d}",
                    "name": f"Sprint {len(sprints) + 1}",
                    "capacity": sprint_capacity,
                    "used_capacity": story_points,
                    "stories": [story],
                    "start_date": None,  # Would be set in a real implementation
                    "end_date": None     # Would be set in a real implementation
                }
        
        # Add the last sprint if it has stories
        if current_sprint["stories"]:
            sprints.append(current_sprint)
        
        self.logger.info(f"Created {len(sprints)} sprints")
        return sprints
    
    def generate_acceptance_criteria(self, user_story: Dict[str, Any]) -> List[str]:
        """
        Generate acceptance criteria for a user story.
        
        Args:
            user_story: User story
            
        Returns:
            List[str]: Acceptance criteria
        """
        self.logger.info(f"Generating acceptance criteria for story {user_story.get('id')}")
        
        # In a real implementation, this would use the AI builder to generate
        # detailed acceptance criteria. For now, we'll generate simple ones.
        
        persona = user_story.get("persona", "user")
        story = user_story.get("story", "")
        
        # Extract action from user story
        action_match = re.search(r"want to (.*?),", story)
        action = action_match.group(1) if action_match else "perform the action"
        
        # Generate standard acceptance criteria
        criteria = [
            f"Given {persona} is on the appropriate screen, when they attempt to {action}, then the system should respond appropriately",
            f"Given {persona} provides invalid input, when they attempt to {action}, then the system should display an error message",
            f"Given {persona} successfully completes the action, when they navigate away, then the changes should be saved"
        ]
        
        # Add specific criteria based on persona
        if persona == "admin":
            criteria.append(f"Given {persona} does not have sufficient permissions, when they attempt to {action}, then the system should deny access")
        
        return criteria
    
    def export_requirements(self, requirements: List[Dict[str, Any]], format: str = "json") -> str:
        """
        Export requirements to a specified format.
        
        Args:
            requirements: List of requirements
            format: Export format (json, csv, markdown)
            
        Returns:
            str: Exported requirements in the specified format
        """
        self.logger.info(f"Exporting requirements to {format}")
        
        if format == "json":
            return json.dumps(requirements, indent=2)
        elif format == "csv":
            # Generate CSV
            csv_lines = ["id,description,category,priority,source"]
            for req in requirements:
                csv_lines.append(f"{req['id']},{req['description']},{req['category']},{req['priority']},{req['source']}")
            return "\n".join(csv_lines)
        elif format == "markdown":
            # Generate Markdown
            md_lines = ["# Requirements\n"]
            md_lines.append("| ID | Description | Category | Priority | Source |")
            md_lines.append("|---|---|---|---|---|")
            for req in requirements:
                md_lines.append(f"| {req['id']} | {req['description']} | {req['category']} | {req['priority']} | {req['source']} |")
            return "\n".join(md_lines)
        else:
            self.logger.warning(f"Unsupported export format: {format}")
            return json.dumps(requirements, indent=2)
    
    def import_requirements(self, content: str, format: str = "json") -> List[Dict[str, Any]]:
        """
        Import requirements from a specified format.
        
        Args:
            content: Content to import
            format: Import format (json, csv, markdown)
            
        Returns:
            List[Dict[str, Any]]: Imported requirements
        """
        self.logger.info(f"Importing requirements from {format}")
        
        requirements = []
        
        if format == "json":
            try:
                requirements = json.loads(content)
            except json.JSONDecodeError:
                self.logger.error("Invalid JSON content")
                return []
        elif format == "csv":
            lines = content.strip().split("\n")
            header = lines[0].split(",")
            for line in lines[1:]:
                values = line.split(",")
                if len(header) == len(values):
                    req = dict(zip(header, values))
                    requirements.append(req)
        elif format == "markdown":
            # This is simplified and may not work for all markdown tables
            lines = content.strip().split("\n")
            header_line = None
            for i, line in enumerate(lines):
                if line.startswith("| ID |") or line.startswith("|ID|"):
                    header_line = i
                    break
            
            if header_line is not None:
                header = [h.strip() for h in lines[header_line].split("|")[1:-1]]
                for line in lines[header_line+2:]:
                    if line.startswith("|"):
                        values = [v.strip() for v in line.split("|")[1:-1]]
                        if len(header) == len(values):
                            req = dict(zip(header, values))
                            requirements.append(req)
        else:
            self.logger.warning(f"Unsupported import format: {format}")
            return []
        
        self.logger.info(f"Imported {len(requirements)} requirements")
        return requirements
