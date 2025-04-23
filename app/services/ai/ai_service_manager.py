"""
AI Service Manager

This module provides a centralized manager for AI services used throughout the application.
It acts as a facade for various AI providers and services.
"""

import logging
from typing import List, Dict, Any, Optional, Union

from app.services.ai.openai_service import OpenAIService

# Configure logging
logger = logging.getLogger("auto-agi-builder")


class AIServiceManager:
    """
    Manager for AI services.
    
    Provides a unified interface for AI capabilities across the application,
    abstracting the underlying AI service providers.
    """
    
    def __init__(self):
        """Initialize the AI service manager."""
        self.openai_service = OpenAIService()
        logger.info("AI Service Manager initialized")
    
    async def analyze_requirements(self, text: str) -> Dict[str, Any]:
        """
        Analyze requirements text and extract structured requirements.
        
        Args:
            text: Requirements text to analyze
            
        Returns:
            Structured requirements data
        """
        return await self.openai_service.analyze_requirements(text)
    
    async def generate_code(
        self, 
        prompt: str, 
        language: str = "javascript",
        comments: bool = True
    ) -> str:
        """
        Generate code based on a prompt.
        
        Args:
            prompt: Description of code to generate
            language: Programming language to generate
            comments: Whether to include comments
            
        Returns:
            Generated code
        """
        return await self.openai_service.generate_code(prompt, language, comments)
    
    async def summarize_document(self, text: str, max_length: int = 500) -> str:
        """
        Summarize a document.
        
        Args:
            text: Document text to summarize
            max_length: Maximum length of summary
            
        Returns:
            Summarized text
        """
        return await self.openai_service.summarize_document(text, max_length)
    
    async def calculate_roi(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate ROI and financial metrics for a project.
        
        Args:
            project_data: Project financial data
            
        Returns:
            ROI analysis
        """
        return await self.openai_service.calculate_roi(project_data)
    
    async def generate_timeline(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a project timeline based on requirements and scope.
        
        Args:
            project_data: Project data including requirements
            
        Returns:
            Timeline data
        """
        prompt = f"""
        Generate a detailed project timeline based on the following project data.
        Include realistic milestones, tasks, dependencies, and durations.
        
        Return your response as a valid JSON object with the following structure:
        
        {{
            "milestones": [
                {{
                    "id": "M1",
                    "name": "Project Kickoff",
                    "description": "Initial project meeting and setup",
                    "date": "2025-01-15",
                    "dependencies": []
                }}
            ],
            "tasks": [
                {{
                    "id": "T1",
                    "name": "Requirements Gathering",
                    "description": "Collect and document requirements",
                    "startDate": "2025-01-15",
                    "endDate": "2025-01-30",
                    "dependencies": [],
                    "assignedTo": "Team",
                    "status": "not-started",
                    "milestoneDependency": "M1"
                }}
            ],
            "phases": [
                {{
                    "name": "Planning Phase",
                    "startDate": "2025-01-15",
                    "endDate": "2025-02-15",
                    "tasks": ["T1", "T2", "T3"]
                }}
            ],
            "projectDuration": {{
                "startDate": "2025-01-15",
                "endDate": "2025-06-01",
                "totalDays": 137
            }},
            "criticalPath": ["T1", "T4", "T7", "T9"],
            "risks": [
                {{
                    "description": "Resource availability",
                    "impact": "high",
                    "mitigation": "Early resource planning and allocation"
                }}
            ]
        }}
        
        Project data:
        {project_data}
        """
        
        response_text = await self.openai_service.generate_text(
            prompt,
            temperature=0.3,
            model="gpt-4-turbo"
        )
        
        try:
            import json
            import re
            
            # Try to parse response directly
            try:
                return json.loads(response_text)
            except json.JSONDecodeError:
                # Try to extract JSON if response has additional text
                json_match = re.search(r'```json\n([\s\S]*?)\n```', response_text)
                if json_match:
                    try:
                        return json.loads(json_match.group(1))
                    except json.JSONDecodeError:
                        pass
            
            # Fallback
            return {
                "error": "Could not parse timeline response",
                "raw_response": response_text
            }
            
        except Exception as e:
            logger.error(f"Error parsing timeline response: {str(e)}")
            return {
                "error": f"Error parsing timeline response: {str(e)}",
                "raw_response": response_text
            }
    
    async def generate_prototype_code(
        self, 
        requirements: List[Dict[str, Any]],
        tech_stack: Dict[str, Any]
    ) -> Dict[str, str]:
        """
        Generate prototype code based on requirements and tech stack.
        
        Args:
            requirements: List of requirement objects
            tech_stack: Dictionary of tech stack details
            
        Returns:
            Dictionary mapping file paths to generated code
        """
        prompt = f"""
        Generate a prototype application based on the following requirements and tech stack.
        The result should be a mapping of file paths to code content.
        
        Requirements:
        {requirements}
        
        Tech Stack:
        {tech_stack}
        
        Return only the essential files needed to demonstrate the core functionality.
        Each file should be production-quality code following best practices.
        
        Return your response as a valid JSON object with the following structure:
        
        {{
            "files": [
                {{
                    "path": "src/components/App.js",
                    "content": "// React component code here"
                }},
                {{
                    "path": "src/styles/main.css",
                    "content": "/* CSS styles here */"
                }}
            ],
            "instructions": "Instructions for running the prototype"
        }}
        """
        
        response_text = await self.openai_service.generate_text(
            prompt,
            temperature=0.3,
            model="gpt-4-turbo"
        )
        
        try:
            import json
            import re
            
            # Try to parse response directly
            try:
                prototype_data = json.loads(response_text)
                
                # Convert to file path -> content dictionary
                result = {}
                for file_info in prototype_data.get("files", []):
                    result[file_info["path"]] = file_info["content"]
                
                # Add instructions if available
                if "instructions" in prototype_data:
                    result["__instructions__"] = prototype_data["instructions"]
                
                return result
                
            except json.JSONDecodeError:
                # Try to extract JSON if response has additional text
                json_match = re.search(r'```json\n([\s\S]*?)\n```', response_text)
                if json_match:
                    try:
                        prototype_data = json.loads(json_match.group(1))
                        
                        # Convert to file path -> content dictionary
                        result = {}
                        for file_info in prototype_data.get("files", []):
                            result[file_info["path"]] = file_info["content"]
                        
                        # Add instructions if available
                        if "instructions" in prototype_data:
                            result["__instructions__"] = prototype_data["instructions"]
                        
                        return result
                    except json.JSONDecodeError:
                        pass
            
            # Fallback
            return {
                "__error__": "Could not parse prototype response",
                "__raw_response__": response_text
            }
            
        except Exception as e:
            logger.error(f"Error parsing prototype response: {str(e)}")
            return {
                "__error__": f"Error parsing prototype response: {str(e)}",
                "__raw_response__": response_text
            }
    
    async def explain_code(self, code: str, detail_level: str = "medium") -> str:
        """
        Explain code with the specified level of detail.
        
        Args:
            code: Code to explain
            detail_level: Level of detail (brief, medium, detailed)
            
        Returns:
            Explanation of the code
        """
        detail_prompts = {
            "brief": "Provide a brief, high-level explanation of what this code does.",
            "medium": "Explain what this code does with moderate detail, highlighting key functionality.",
            "detailed": "Provide a detailed explanation of this code, including how it works, design patterns used, and potential improvements."
        }
        
        prompt = f"""
        {detail_prompts.get(detail_level, detail_prompts["medium"])}
        
        CODE:
        ```
        {code}
        ```
        """
        
        return await self.openai_service.generate_text(
            prompt,
            temperature=0.3
        )
    
    async def generate_test_cases(
        self, 
        code: str,
        test_framework: str = "jest"
    ) -> str:
        """
        Generate test cases for the provided code.
        
        Args:
            code: Code to generate tests for
            test_framework: Testing framework to use
            
        Returns:
            Generated test code
        """
        framework_configs = {
            "jest": {
                "language": "javascript",
                "prompt_addition": "Use Jest and React Testing Library where appropriate."
            },
            "pytest": {
                "language": "python",
                "prompt_addition": "Use pytest fixtures and parameterized tests where appropriate."
            },
            "junit": {
                "language": "java",
                "prompt_addition": "Use JUnit 5 features like @DisplayName and parameterized tests."
            }
        }
        
        config = framework_configs.get(test_framework.lower(), framework_configs["jest"])
        
        prompt = f"""
        Generate comprehensive test cases for the following code.
        {config["prompt_addition"]}
        Include tests for both normal operations and edge cases.
        
        CODE:
        ```
        {code}
        ```
        
        Provide only the test code with no additional explanation or markdown.
        """
        
        return await self.openai_service.generate_code(
            prompt,
            language=config["language"],
            comments=True
        )
    
    async def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for a list of texts.
        
        Args:
            texts: List of texts to generate embeddings for
            
        Returns:
            List of embedding vectors
        """
        return await self.openai_service.generate_embeddings(texts)
