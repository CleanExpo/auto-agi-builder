"""
Executive System Manager for the Autonomous Builder.
Coordinates the Requirements, Backend, Frontend, and Testing quadrants.
"""
import os
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import importlib

# Import quadrants
from quadrants.requirements import RequirementsQuadrant
from quadrants.backend import BackendQuadrant
from quadrants.frontend import FrontendQuadrant
from quadrants.testing import TestingQuadrant


class ExecutiveSystemManager:
    """
    Executive System Manager that coordinates all quadrants of the autonomous builder.
    This is the central orchestrator that manages the workflow between requirements gathering,
    backend development, frontend development, and testing/deployment.
    """
    
    def __init__(self, config_path: Optional[str] = None, frontend_builder=None, ai_builder=None, autonomous_builder=None):
        """
        Initialize the Executive System Manager.
        
        Args:
            config_path: Optional path to configuration file
            frontend_builder: Frontend builder instance
            ai_builder: AI builder instance
            autonomous_builder: Autonomous builder instance
        """
        self.logger = self._setup_logger()
        self.logger.info("Initializing Executive System Manager")
        
        # Initialize builder components
        self.frontend_builder = frontend_builder
        self.ai_builder = ai_builder
        self.autonomous_builder = autonomous_builder
        
        # Load configuration
        self.config = self._load_config(config_path)
        
        # Initialize quadrants
        self.requirements = RequirementsQuadrant(self)
        self.backend = BackendQuadrant(self)
        self.frontend = FrontendQuadrant(self)
        self.testing = TestingQuadrant(self)
        
        # Project state
        self.project_state = {
            "name": self.config.get("project_name", "New Project"),
            "description": self.config.get("project_description", ""),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "status": "initialized",
            "requirements": [],
            "user_stories": [],
            "sprints": [],
            "components": {
                "backend": [],
                "frontend": [],
                "database": [],
                "api": []
            },
            "test_results": [],
            "deployment_status": "not_deployed"
        }
        
        self.logger.info("Executive System Manager initialized")
    
    def _setup_logger(self) -> logging.Logger:
        """Set up a logger for the Executive System Manager."""
        logger = logging.getLogger("esm")
        
        # Set up logging if not already configured
        if not logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
            handler.setFormatter(formatter)
            logger.addHandler(handler)
            logger.setLevel(logging.INFO)
        
        return logger
    
    def _load_config(self, config_path: Optional[str]) -> Dict[str, Any]:
        """
        Load configuration from a file.
        
        Args:
            config_path: Path to configuration file
            
        Returns:
            Dict[str, Any]: Configuration dictionary
        """
        config = {
            "project_name": "New Project",
            "project_description": "A project created with Executive System Manager",
            "log_level": "INFO",
            "ai_service": "openai",
            "database_type": "sqlite",
            "frontend_framework": "react",
            "backend_framework": "fastapi",
            "testing_framework": "pytest",
            "deployment_target": "vercel"
        }
        
        if config_path and os.path.exists(config_path):
            try:
                with open(config_path, 'r') as file:
                    loaded_config = json.load(file)
                    config.update(loaded_config)
                    self.logger.info(f"Loaded configuration from {config_path}")
            except Exception as e:
                self.logger.error(f"Error loading configuration: {str(e)}")
        
        return config
    
    def save_config(self, config_path: str) -> bool:
        """
        Save configuration to a file.
        
        Args:
            config_path: Path to save configuration file
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            with open(config_path, 'w') as file:
                json.dump(self.config, file, indent=2)
            self.logger.info(f"Saved configuration to {config_path}")
            return True
        except Exception as e:
            self.logger.error(f"Error saving configuration: {str(e)}")
            return False
    
    def update_config(self, new_config: Dict[str, Any]) -> None:
        """
        Update configuration with new values.
        
        Args:
            new_config: New configuration values
        """
        self.config.update(new_config)
        self.logger.info("Updated configuration")
    
    def get_status(self) -> Dict[str, Any]:
        """
        Get the current status of the Executive System Manager.
        
        Returns:
            Dict[str, Any]: Status information
        """
        return {
            "system": {
                "status": "active",
                "version": "1.0.0",
                "config": self.config
            },
            "quadrants": {
                "requirements": self.requirements.get_status(),
                "backend": self.backend.get_status(),
                "frontend": self.frontend.get_status(),
                "testing": self.testing.get_status()
            },
            "project": self.project_state
        }
    
    def process_requirements(self, text: str) -> Dict[str, Any]:
        """
        Process requirements from text.
        
        Args:
            text: Text to extract requirements from
            
        Returns:
            Dict[str, Any]: Processing results
        """
        self.logger.info("Processing requirements")
        
        # Extract requirements
        requirements = self.requirements.extract_requirements(text)
        
        # Update project state
        self.project_state["requirements"] = requirements
        self.project_state["updated_at"] = datetime.now().isoformat()
        
        # Create user stories
        user_stories = self.requirements.create_user_stories(requirements)
        self.project_state["user_stories"] = user_stories
        
        # Create sprint plan
        sprints = self.requirements.create_sprint_plan(user_stories)
        self.project_state["sprints"] = sprints
        
        # Categorize requirements
        categorized = self.requirements.categorize_requirements(requirements)
        
        return {
            "status": "success",
            "requirements": requirements,
            "user_stories": user_stories,
            "sprints": sprints,
            "categorized": categorized
        }
    
    def generate_backend(self, requirements: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """
        Generate backend code based on requirements.
        
        Args:
            requirements: Optional list of requirements to use instead of project state
            
        Returns:
            Dict[str, Any]: Generation results
        """
        self.logger.info("Generating backend")
        
        if requirements is None:
            requirements = self.project_state.get("requirements", [])
        
        # Extract model definitions from requirements
        model_definitions = {}
        for req in requirements:
            if req.get("category") == "data":
                # In a real implementation, this would analyze the requirement text
                # and extract model definitions. For now, we'll just create a placeholder.
                req_id = req.get("id", "unknown")
                req_desc = req.get("description", "")
                
                # Create a simple model based on the requirement
                model_name = req_id.replace("-", "_").lower()
                model_definitions[model_name] = {
                    "fields": [
                        {"name": "id", "type": "integer", "primary_key": True},
                        {"name": "name", "type": "string", "max_length": 255},
                        {"name": "description", "type": "text"},
                        {"name": "created_at", "type": "datetime"},
                        {"name": "updated_at", "type": "datetime"}
                    ],
                    "source_requirement": req_id,
                    "description": req_desc
                }
        
        # Generate database schema
        db_engine = self.config.get("database_type", "postgres")
        schema = self.backend.generate_database_schema(model_definitions, db_engine)
        
        # Generate API endpoints
        framework = self.config.get("backend_framework", "fastapi")
        api_definition = {
            "models": model_definitions,
            "operations": ["create", "read", "update", "delete", "list"],
            "authentication": True,
            "rate_limiting": True
        }
        endpoints = self.backend.generate_api_endpoints(api_definition, framework)
        
        # Generate business logic
        language = "python" if framework in ["fastapi", "flask"] else "javascript"
        logic = self.backend.generate_business_logic(api_definition, language)
        
        # Generate authentication system
        auth_definition = {
            "type": "jwt",
            "roles": ["admin", "user"],
            "expiration": 3600  # 1 hour
        }
        auth = self.backend.generate_auth_system(auth_definition)
        
        # Generate validation
        validation = self.backend.generate_validation_system(model_definitions, language)
        
        # Update project state
        self.project_state["components"]["backend"] = [
            {"type": "database_schema", "engine": db_engine, "schema": schema},
            {"type": "api_endpoints", "framework": framework, "endpoints": endpoints},
            {"type": "business_logic", "language": language, "modules": logic.get("modules", [])},
            {"type": "auth_system", "auth_type": auth.get("type"), "roles": auth_definition.get("roles", [])},
            {"type": "validation", "language": language}
        ]
        self.project_state["updated_at"] = datetime.now().isoformat()
        
        return {
            "status": "success",
            "schema": schema,
            "endpoints": endpoints,
            "logic": logic,
            "auth": auth,
            "validation": validation
        }
    
    def generate_frontend(self, user_stories: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """
        Generate frontend code based on user stories.
        
        Args:
            user_stories: Optional list of user stories to use instead of project state
            
        Returns:
            Dict[str, Any]: Generation results
        """
        self.logger.info("Generating frontend")
        
        if user_stories is None:
            user_stories = self.project_state.get("user_stories", [])
        
        # Extract UI components from user stories
        components = []
        for story in user_stories:
            # In a real implementation, this would analyze the user story
            # and extract UI components. For now, we'll just create placeholders.
            story_id = story.get("id", "unknown")
            story_text = story.get("story", "")
            persona = story.get("persona", "user")
            
            # Create a simple component based on the user story
            component_name = f"{persona.capitalize()}View{len(components) + 1}"
            component_definition = {
                "name": component_name,
                "type": "view",
                "source_story": story_id,
                "description": story_text,
                "props": ["data", "onSubmit", "isLoading"]
            }
            components.append(component_definition)
            
            # Also add a form component if the story mentions forms or input
            if "form" in story_text.lower() or "input" in story_text.lower() or "submit" in story_text.lower():
                form_name = f"{persona.capitalize()}Form{len(components) + 1}"
                form_definition = {
                    "name": form_name,
                    "type": "form",
                    "source_story": story_id,
                    "description": f"Form for {story_text}",
                    "fields": [
                        {"name": "name", "type": "text", "label": "Name", "required": True},
                        {"name": "email", "type": "email", "label": "Email", "required": True},
                        {"name": "message", "type": "textarea", "label": "Message"}
                    ]
                }
                components.append(form_definition)
        
        # Generate UI components
        framework = self.config.get("frontend_framework", "react")
        ui_components = {}
        for component in components:
            if component.get("type") == "form":
                ui_components[component.get("name")] = self.frontend.generate_form(component, framework)
            else:
                ui_components[component.get("name")] = self.frontend.generate_component(component, framework)
        
        # Generate theme
        theme_definition = {
            "name": "AppTheme",
            "colors": {
                "primary": "#4A90E2",
                "secondary": "#50E3C2",
                "background": "#FFFFFF",
                "text": "#333333",
                "error": "#E74C3C"
            },
            "typography": {
                "fontFamily": "'Roboto', sans-serif",
                "fontSize": "16px",
                "headingFontFamily": "'Montserrat', sans-serif",
                "headingFontWeight": "600"
            },
            "spacing": {
                "base": "1rem",
                "small": "0.5rem",
                "large": "2rem"
            }
        }
        theme = self.frontend.generate_theme(theme_definition)
        
        # Generate responsive layout
        layout_definition = {
            "name": "AppLayout",
            "type": "flexbox",
            "breakpoints": {
                "sm": "576px",
                "md": "768px",
                "lg": "992px",
                "xl": "1200px"
            },
            "containers": [
                {
                    "name": "app-container",
                    "properties": {
                        "flex-direction": "column",
                        "min-height": "100vh"
                    }
                },
                {
                    "name": "main-content",
                    "properties": {
                        "flex": "1",
                        "padding": "2rem"
                    }
                }
            ]
        }
        layout = self.frontend.generate_responsive_layout(layout_definition)
        
        # Generate interactive prototype
        prototype_definition = {
            "name": "AppPrototype",
            "framework": framework,
            "pages": [
                {
                    "name": "HomePage",
                    "path": "/",
                    "isIndex": True,
                    "sections": [
                        {
                            "title": "Welcome",
                            "components": ["UserView1"]
                        }
                    ]
                },
                {
                    "name": "FormPage",
                    "path": "/form",
                    "sections": [
                        {
                            "title": "Submit Form",
                            "components": ["UserForm1"]
                        }
                    ]
                }
            ],
            "components": components
        }
        prototype = self.frontend.generate_interactive_prototype(prototype_definition)
        
        # Update project state
        self.project_state["components"]["frontend"] = [
            {"type": "ui_components", "framework": framework, "count": len(ui_components)},
            {"type": "theme", "name": theme.get("name")},
            {"type": "layout", "name": layout.get("name"), "type": layout.get("type")},
            {"type": "prototype", "name": prototype.get("name"), "pages": prototype.get("pages", 0)}
        ]
        self.project_state["updated_at"] = datetime.now().isoformat()
        
        return {
            "status": "success",
            "ui_components": ui_components,
            "theme": theme,
            "layout": layout,
            "prototype": prototype
        }
    
    def generate_tests(self, components: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Generate tests for backend and frontend components.
        
        Args:
            components: Optional components to test instead of project state
            
        Returns:
            Dict[str, Any]: Test generation results
        """
        self.logger.info("Generating tests")
        
        if components is None:
            components = self.project_state.get("components", {})
        
        backend_components = components.get("backend", [])
        frontend_components = components.get("frontend", [])
        
        # Mock code files for backend
        backend_code_files = {}
        for component in backend_components:
            component_type = component.get("type", "unknown")
            if component_type == "api_endpoints":
                framework = component.get("framework", "fastapi")
                endpoints = component.get("endpoints", {})
                
                # Create mock code file
                if framework == "fastapi":
                    backend_code_files["app/main.py"] = "# FastAPI main application\nfrom fastapi import FastAPI\n\napp = FastAPI()"
                    backend_code_files["app/models.py"] = "# Database models\nfrom sqlalchemy import Column, Integer, String\nfrom sqlalchemy.ext.declarative import declarative_base\n\nBase = declarative_base()"
                    backend_code_files["app/api/endpoints.py"] = "# API endpoints\nfrom fastapi import APIRouter\n\nrouter = APIRouter()"
                elif framework == "express":
                    backend_code_files["app.js"] = "// Express application\nconst express = require('express');\nconst app = express();"
                    backend_code_files["models/index.js"] = "// Database models\nconst Sequelize = require('sequelize');\n\nconst sequelize = new Sequelize(/* config */);"
                    backend_code_files["routes/api.js"] = "// API routes\nconst express = require('express');\nconst router = express.Router();"
        
        # Mock code files for frontend
        frontend_code_files = {}
        for component in frontend_components:
            component_type = component.get("type", "unknown")
            if component_type == "ui_components":
                framework = component.get("framework", "react")
                
                # Create mock code file
                if framework == "react":
                    frontend_code_files["src/App.js"] = "// React App component\nimport React from 'react';\n\nfunction App() {\n  return <div>App</div>;\n}\n\nexport default App;"
                    frontend_code_files["src/components/Button.js"] = "// Button component\nimport React from 'react';\n\nfunction Button({ children, onClick }) {\n  return <button onClick={onClick}>{children}</button>;\n}\n\nexport default Button;"
                    frontend_code_files["src/pages/Home.js"] = "// Home page\nimport React from 'react';\n\nfunction Home() {\n  return <div>Home</div>;\n}\n\nexport default Home;"
                elif framework == "vue":
                    frontend_code_files["src/App.vue"] = "<template>\n  <div id=\"app\">App</div>\n</template>\n\n<script>\nexport default {\n  name: 'App'\n};\n</script>"
                    frontend_code_files["src/components/Button.vue"] = "<template>\n  <button @click=\"onClick\">{{ text }}</button>\n</template>\n\n<script>\nexport default {\n  name: 'Button',\n  props: ['text', 'onClick']\n};\n</script>"
                    frontend_code_files["src/pages/Home.vue"] = "<template>\n  <div>Home</div>\n</template>\n\n<script>\nexport default {\n  name: 'Home'\n};\n</script>"
        
        # Generate backend tests
        backend_framework = self.config.get("testing_framework", "pytest")
        backend_tests = self.testing.generate_tests(backend_code_files, backend_framework)
        
        # Generate frontend tests
        frontend_framework = "jest" if self.config.get("frontend_framework") in ["react", "vue"] else "mocha"
        frontend_tests = self.testing.generate_tests(frontend_code_files, frontend_framework)
        
        # Generate CI/CD configuration
        ci_cd_definition = {
            "test_command": "pytest" if backend_framework == "pytest" else "npm test",
            "build_command": "npm run build",
            "node_version": "16.x",
            "python_version": "3.9",
            "deploy": True,
            "deploy_target": self.config.get("deployment_target", "vercel")
        }
        ci_cd_platform = "github"  # Default to GitHub Actions
        ci_cd_config = self.testing.generate_ci_cd_config(ci_cd_definition, ci_cd_platform)
        
        # Generate deployment configuration
        deployment_target = self.config.get("deployment_target", "vercel")
        deployment_definition = {
            "service_type": "app_service" if deployment_target == "azure" else "s3" if deployment_target == "aws" else None,
            "project_name": self.config.get("project_name", "new-project")
        }
        deployment_config = self.testing.generate_deployment_config(deployment_definition, deployment_target)
        
        # Update project state
        self.project_state["test_results"] = [
            {"type": "backend_tests", "framework": backend_framework, "count": len(backend_tests)},
            {"type": "frontend_tests", "framework": frontend_framework, "count": len(frontend_tests)},
            {"type": "ci_cd", "platform": ci_cd_platform, "config": "generated"},
            {"type": "deployment", "target": deployment_target, "config": "generated"}
        ]
        self.project_state["updated_at"] = datetime.now().isoformat()
        
        return {
            "status": "success",
            "backend_tests": backend_tests,
            "frontend_tests": frontend_tests,
            "ci_cd_config": ci_cd_config,
            "deployment_config": deployment_config
        }
    
    def run_project(self, project_path: Optional[str] = None) -> Dict[str, Any]:
        """
        Run the entire project workflow from requirements to deployment.
        
        Args:
            project_path: Optional project path for generated code
            
        Returns:
            Dict[str, Any]: Project results
        """
        self.logger.info("Running project workflow")
        
        # Use default path if none provided
        if project_path is None:
            project_path = f"projects/{self.config.get('project_name', 'new-project').lower().replace(' ', '_')}"
        
        # Ensure project directory exists
        os.makedirs(project_path, exist_ok=True)
        
        # Define requirements if they don't exist
        if not self.project_state.get("requirements"):
            requirements_text = """
            The system should allow users to register and login.
            The system must securely store user data and passwords.
            The system should provide a dashboard interface for users.
            Users should be able to create, view, update, and delete their profile.
            The system should have an admin interface for managing users.
            The system must be responsive and work on mobile devices.
            """
            self.process_requirements(requirements_text)
        
        # Generate backend
        backend_result = self.generate_backend()
        
        # Generate frontend
        frontend_result = self.generate_frontend()
        
        # Generate tests
        test_result = self.generate_tests()
        
        # Save results to project directory
        project_info = {
            "name": self.config.get("project_name", "New Project"),
            "description": self.config.get("project_description", ""),
            "created_at": self.project_state.get("created_at"),
            "updated_at": self.project_state.get("updated_at"),
            "requirements_count": len(self.project_state.get("requirements", [])),
            "user_stories_count": len(self.project_state.get("user_stories", [])),
            "sprints_count": len(self.project_state.get("sprints", [])),
            "backend_components_count": len(self.project_state.get("components", {}).get("backend", [])),
            "frontend_components_count": len(self.project_state.get("components", {}).get("frontend", [])),
            "test_results_count": len(self.project_state.get("test_results", []))
        }
        
        with open(f"{project_path}/project_info.json", 'w') as file:
            json.dump(project_info, file, indent=2)
        
        self.logger.info(f"Project workflow completed and saved to {project_path}")
        
        return {
            "status": "success",
            "project_path": project_path,
            "project_info": project_info,
            "backend_result": backend_result,
            "frontend_result": frontend_result,
            "test_result": test_result
        }
    
    def shutdown(self) -> None:
        """Shutdown the Executive System Manager and all quadrants."""
        self.logger.info("Shutting down Executive System Manager")
        
        # Shutdown quadrants
        self.requirements.shutdown()
        self.backend.shutdown()
        self.frontend.shutdown()
        self.testing.shutdown()
        
        self.logger.info("Executive System Manager shutdown complete")

# Add quadrant module initialization
if not os.path.exists('quadrants/__init__.py'):
    os.makedirs('quadrants', exist_ok=True)
    with open('quadrants/__init__.py', 'w') as f:
        f.write('# Quadrants package\n')
