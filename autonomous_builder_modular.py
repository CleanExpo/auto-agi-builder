"""
Autonomous AGI Builder for the Auto AGI Builder system.
Main entry point that combines all builder components.
"""
import os
import sys
import logging
import argparse
import json
from typing import List, Dict, Any, Optional, Union, Tuple
from pathlib import Path

from builder_core import BuilderCore
from frontend_builder import FrontendBuilder
from ai_builder import AIBuilder

class AutonomousBuilder:
    """
    Main builder class that combines all builder components.
    Provides a unified interface for the Auto AGI Builder system.
    """
    
    def __init__(self, project_root: str = None, api_key: str = None):
        """
        Initialize the autonomous builder.
        
        Args:
            project_root: Path to the project root directory.
            api_key: OpenAI API key. If None, it will try to get it from
                     environment variables or the .env file.
        """
        # Initialize logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.StreamHandler(),
                logging.FileHandler('auto_agi_builder.log')
            ]
        )
        self.logger = logging.getLogger("autonomous_builder")
        
        # Set project root
        if project_root:
            self.project_root = Path(project_root).absolute()
        else:
            self.project_root = Path(os.getcwd()).absolute()
        
        # Initialize builder components
        self.core_builder = BuilderCore(project_root)
        self.frontend_builder = FrontendBuilder(project_root)
        self.ai_builder = AIBuilder(project_root, api_key)
        
        self.logger.info(f"Autonomous Builder initialized at {self.project_root}")
    
    def setup_project(self, project_name: str, options: Optional[Dict[str, Any]] = None) -> bool:
        """
        Set up a new project with the given name and options.
        
        Args:
            project_name: Name of the project
            options: Dictionary of options for customizing the project setup
            
        Returns:
            bool: True if successful, False otherwise
        """
        self.logger.info(f"Setting up project: {project_name}")
        
        # Default options
        default_options = {
            "frontend": True,
            "backend": True,
            "database": "sqlite",
            "auth": True,
            "deployment": True,
            "testing": True,
        }
        
        # Merge with provided options
        if options:
            for key, value in options.items():
                default_options[key] = value
                
        options = default_options
        
        try:
            # Create project directory if it doesn't exist
            project_dir = self.project_root / project_name
            if not project_dir.exists():
                os.makedirs(project_dir)
                self.logger.info(f"Created project directory: {project_dir}")
            
            # Set up basic project structure
            self.core_builder.setup_project_structure()
            
            # Set up frontend if enabled
            if options["frontend"]:
                self.frontend_builder.setup_nextjs()
                self.logger.info("Frontend setup completed")
            
            # Set up backend with chosen database
            if options["backend"]:
                from backend_builder import BackendBuilder
                backend_builder = BackendBuilder(self.project_root)
                backend_builder.setup_fastapi()
                backend_builder.setup_database(options["database"])
                backend_builder.setup_ai_services()
                self.logger.info(f"Backend setup completed with {options['database']} database")
            
            # Create .env file with template values
            env_content = """# Auto AGI Builder Environment Variables

# API Keys
OPENAI_API_KEY=your-openai-api-key-here

# Database Configuration
DATABASE_URL=sqlite:///./auto_agi_builder.db
# For PostgreSQL: DATABASE_URL=postgresql://user:password@localhost/dbname

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Authentication
JWT_SECRET=generate-a-secure-random-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Firebase (if used)
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=

# Storage (if used)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
S3_BUCKET_NAME=
"""
            env_file = self.project_root / ".env"
            if not env_file.exists():
                with open(env_file, "w") as f:
                    f.write(env_content)
                self.logger.info("Created .env file template")
            
            # Create .gitignore file
            gitignore_content = """# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
*.egg-info/
.installed.cfg
*.egg

# Virtual Environment
venv/
env/
ENV/

# Node.js
node_modules/
npm-debug.log
yarn-debug.log
yarn-error.log
.pnpm-debug.log
.next/
out/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Database
*.db
*.sqlite3

# Logs
logs/
*.log

# Testing
.coverage
htmlcov/
.pytest_cache/
coverage/

# Misc
.vercel
.netlify
"""
            gitignore_file = self.project_root / ".gitignore"
            if not gitignore_file.exists():
                with open(gitignore_file, "w") as f:
                    f.write(gitignore_content)
                self.logger.info("Created .gitignore file")
            
            # Create README.md file
            readme_content = f"""# {project_name}

An AI-powered prototype development platform built with the Auto AGI Builder.

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Installation

1. Clone this repository
2. Install backend dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```
4. Copy `.env.example` to `.env` and configure your environment variables

### Development

Run the development server:

```bash
# Run backend
cd {project_name}
python -m app.main

# Run frontend (in a separate terminal)
cd {project_name}/frontend
npm run dev
```

Access the application at http://localhost:3000

## Features

- AI-powered prototype generation
- Document analysis and requirements extraction
- ROI calculation and project planning
- Interactive prototype preview

## Project Structure

- `/app` - Backend application (FastAPI)
- `/frontend` - Frontend application (Next.js)
- `/docs` - Documentation
- `/tests` - Tests

## License

MIT
"""
            readme_file = self.project_root / "README.md"
            if not readme_file.exists():
                with open(readme_file, "w") as f:
                    f.write(readme_content)
                self.logger.info("Created README.md file")
            
            self.logger.info(f"Project setup completed successfully: {project_name}")
            return True
            
        except Exception as e:
            self.logger.error(f"Error setting up project: {e}")
            return False
    
    def generate_prototype(self, requirements_path: str, output_dir: str = None) -> bool:
        """
        Generate a prototype based on requirements.
        
        Args:
            requirements_path: Path to the requirements file
            output_dir: Directory to output the prototype
            
        Returns:
            bool: True if successful, False otherwise
        """
        self.logger.info(f"Generating prototype from requirements: {requirements_path}")
        
        try:
            # Set default output directory if not provided
            if not output_dir:
                output_dir = "prototype"
            
            output_path = self.project_root / output_dir
            if not output_path.exists():
                os.makedirs(output_path)
            
            # Read requirements
            requirements_content = self.core_builder.read_file(requirements_path)
            if not requirements_content:
                self.logger.error(f"Failed to read requirements file: {requirements_path}")
                return False
            
            # Analyze requirements
            analysis_result = self.ai_builder.analyze_requirements(requirements_content)
            if "error" in analysis_result:
                self.logger.error(f"Failed to analyze requirements: {analysis_result['error']}")
                return False
            
            # Suggest system architecture
            architecture = self.ai_builder.suggest_system_architecture(requirements_content)
            if "error" in architecture:
                self.logger.error(f"Failed to suggest architecture: {architecture['error']}")
                return False
            
            # Save analysis and architecture to output directory
            with open(output_path / "requirements_analysis.json", "w") as f:
                json.dump(analysis_result, f, indent=2)
            
            with open(output_path / "system_architecture.json", "w") as f:
                json.dump(architecture, f, indent=2)
            
            # Generate main components based on the architecture
            if "components" in architecture:
                for component in architecture.get("components", []):
                    component_name = component.get("name", "").lower().replace(" ", "_")
                    if not component_name:
                        continue
                        
                    component_type = component.get("type", "")
                    component_desc = component.get("description", "")
                    
                    if "frontend" in component_type.lower():
                        # Generate frontend component
                        if not self.frontend_builder.generate_component(component_name):
                            self.logger.warning(f"Failed to generate frontend component: {component_name}")
                    
                    elif "api" in component_type.lower() or "backend" in component_type.lower():
                        # Generate backend code for this component
                        code_result = self.ai_builder.generate_code(
                            f"Create a {component_type} for {component_name}. Description: {component_desc}",
                            "python"
                        )
                        
                        if "error" not in code_result:
                            # Save the generated code
                            code_path = output_path / f"{component_name}.py"
                            with open(code_path, "w") as f:
                                f.write(code_result["code"])
                            self.logger.info(f"Generated backend code for {component_name}")
                            
                            # Generate tests for the component
                            test_result = self.ai_builder.generate_test_cases(str(code_path))
                            if "error" not in test_result:
                                test_path = output_path / test_result["test_file_name"]
                                with open(test_path, "w") as f:
                                    f.write(test_result["test_code"])
                                self.logger.info(f"Generated tests for {component_name}")
                        else:
                            self.logger.warning(f"Failed to generate code for {component_name}: {code_result['error']}")
            
            self.logger.info(f"Prototype generation completed successfully. Output directory: {output_path}")
            return True
            
        except Exception as e:
            self.logger.error(f"Error generating prototype: {e}")
            return False
    
    def analyze_document(self, document_path: str, analysis_type: str = "requirements") -> Dict[str, Any]:
        """
        Analyze a document using AI.
        
        Args:
            document_path: Path to the document to analyze
            analysis_type: Type of analysis to perform ('requirements', 'summary', 'code_review')
            
        Returns:
            Dict[str, Any]: Analysis results
        """
        self.logger.info(f"Analyzing document: {document_path}")
        return self.ai_builder.analyze_document(document_path, analysis_type)
    
    def improve_code(self, code_path: str, improvement_type: str = "general") -> Dict[str, Any]:
        """
        Improve existing code.
        
        Args:
            code_path: Path to the code file
            improvement_type: Type of improvement ('general', 'performance', 
                             'security', 'documentation', 'refactoring')
            
        Returns:
            Dict[str, Any]: Improved code and explanation
        """
        self.logger.info(f"Improving code: {code_path}")
        return self.ai_builder.improve_code(code_path, improvement_type)
    
    def deploy_project(self, deployment_target: str = "vercel") -> bool:
        """
        Deploy the project to the specified target.
        
        Args:
            deployment_target: Target platform ('vercel', 'netlify', 'aws', 'azure', 'gcp')
            
        Returns:
            bool: True if successful, False otherwise
        """
        self.logger.info(f"Deploying project to {deployment_target}")
        
        try:
            if deployment_target == "vercel":
                # Check if vercel CLI is installed
                _, stdout, _ = self.core_builder.run_command("vercel --version")
                if not stdout:
                    self.logger.warning("Vercel CLI not found. Installing...")
                    self.core_builder.run_command("npm install -g vercel")
                
                # Create vercel.json if it doesn't exist
                vercel_config = {
                    "version": 2,
                    "buildCommand": "npm run build",
                    "devCommand": "npm run dev",
                    "outputDirectory": "out",
                    "routes": [
                        { "src": "/api/(.*)", "dest": "/api/$1" },
                        { "src": "/(.*)", "dest": "/$1" }
                    ],
                    "env": {
                        "NEXT_PUBLIC_API_URL": "@next_public_api_url"
                    }
                }
                
                vercel_json_path = self.project_root / "vercel.json"
                if not vercel_json_path.exists():
                    with open(vercel_json_path, "w") as f:
                        json.dump(vercel_config, f, indent=2)
                    self.logger.info("Created vercel.json configuration file")
                
                # Deploy to Vercel
                self.logger.info("Deploying to Vercel...")
                result_code, stdout, stderr = self.core_builder.run_command("vercel --prod")
                
                if result_code == 0:
                    self.logger.info("Deployment to Vercel successful!")
                    return True
                else:
                    self.logger.error(f"Deployment to Vercel failed: {stderr}")
                    return False
                    
            elif deployment_target == "netlify":
                # Netlify deployment implementation
                self.logger.warning("Netlify deployment not implemented yet")
                return False
                
            elif deployment_target == "aws":
                # AWS deployment implementation
                self.logger.warning("AWS deployment not implemented yet")
                return False
                
            else:
                self.logger.error(f"Unsupported deployment target: {deployment_target}")
                return False
                
        except Exception as e:
            self.logger.error(f"Error deploying project: {e}")
            return False

def main():
    """Main entry point for the Auto AGI Builder CLI."""
    parser = argparse.ArgumentParser(description="Auto AGI Builder CLI")
    
    # Main command argument
    parser.add_argument("command", choices=["setup", "generate", "analyze", "improve", "deploy"],
                      help="Command to execute")
    
    # Command-specific arguments
    parser.add_argument("--name", help="Project name (for setup command)")
    parser.add_argument("--requirements", help="Path to requirements file (for generate command)")
    parser.add_argument("--output", help="Output directory (for generate command)")
    parser.add_argument("--document", help="Path to document (for analyze command)")
    parser.add_argument("--analysis-type", choices=["requirements", "summary", "code_review"],
                      default="requirements", help="Type of analysis (for analyze command)")
    parser.add_argument("--code", help="Path to code file (for improve command)")
    parser.add_argument("--improvement-type", choices=["general", "performance", "security", 
                                                 "documentation", "refactoring"],
                      default="general", help="Type of improvement (for improve command)")
    parser.add_argument("--target", choices=["vercel", "netlify", "aws", "azure", "gcp"],
                      default="vercel", help="Deployment target (for deploy command)")
    
    # Global options
    parser.add_argument("--project-root", help="Path to project root directory")
    parser.add_argument("--api-key", help="OpenAI API key")
    
    args = parser.parse_args()
    
    # Initialize the autonomous builder
    builder = AutonomousBuilder(args.project_root, args.api_key)
    
    # Execute the requested command
    if args.command == "setup":
        if not args.name:
            print("Error: Project name is required for setup command")
            return 1
        
        success = builder.setup_project(args.name)
        if not success:
            print("Error: Failed to set up project")
            return 1
        
        print(f"Project '{args.name}' set up successfully!")
        
    elif args.command == "generate":
        if not args.requirements:
            print("Error: Requirements file path is required for generate command")
            return 1
        
        success = builder.generate_prototype(args.requirements, args.output)
        if not success:
            print("Error: Failed to generate prototype")
            return 1
        
        print(f"Prototype generated successfully! Output directory: {args.output or 'prototype'}")
        
    elif args.command == "analyze":
        if not args.document:
            print("Error: Document path is required for analyze command")
            return 1
        
        result = builder.analyze_document(args.document, args.analysis_type)
        if "error" in result:
            print(f"Error: {result['error']}")
            return 1
        
        print(f"Analysis results for '{args.document}':")
        print(json.dumps(result, indent=2))
        
    elif args.command == "improve":
        if not args.code:
            print("Error: Code file path is required for improve command")
            return 1
        
        result = builder.improve_code(args.code, args.improvement_type)
        if "error" in result:
            print(f"Error: {result['error']}")
            return 1
        
        # Save improved code
        code_path = Path(args.code)
        improved_path = code_path.parent / f"{code_path.stem}_improved{code_path.suffix}"
        with open(improved_path, "w") as f:
            f.write(result["improved_code"])
        
        print(f"Code improved successfully! Saved to: {improved_path}")
        print("\nImprovements made:")
        print(result["explanation"])
        
    elif args.command == "deploy":
        success = builder.deploy_project(args.target)
        if not success:
            print(f"Error: Failed to deploy to {args.target}")
            return 1
        
        print(f"Deployment to {args.target} completed successfully!")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
