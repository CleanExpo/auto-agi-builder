"""
Core builder module for the Auto AGI Builder system.
Provides common utilities and base functionality used by all builder components.
"""
import os
import sys
import logging
import subprocess
import shutil
import json
import re
from typing import List, Dict, Any, Optional, Tuple, Union
from pathlib import Path


class BuilderCore:
    """
    Core builder class providing common utilities and base functionality.
    All specialized builders inherit from this class.
    """
    
    def __init__(self, project_root: str = None):
        """
        Initialize the builder core.
        
        Args:
            project_root: Path to the project root directory.
        """
        # Set up logging
        self.logger = logging.getLogger("builder_core")
        
        # Set project root
        if project_root:
            self.project_root = Path(project_root).absolute()
        else:
            self.project_root = Path(os.getcwd()).absolute()
        
        self.logger.info(f"Initialized BuilderCore at {self.project_root}")
        
        # Check environment
        self._check_environment()
    
    def _check_environment(self) -> None:
        """Check the environment for required dependencies."""
        # Check Python version
        python_version = sys.version_info
        required_version = (3, 8)
        
        if python_version < required_version:
            self.logger.warning(
                f"Python {required_version[0]}.{required_version[1]}+ is required. "
                f"Current version: {python_version[0]}.{python_version[1]}"
            )
        
        # Check for required environment variables
        required_env_vars = []
        missing_env_vars = [var for var in required_env_vars if var not in os.environ]
        
        if missing_env_vars:
            self.logger.warning(f"Missing environment variables: {', '.join(missing_env_vars)}")
            self.logger.warning("Consider creating a .env file with the required variables.")
    
    def setup_project_structure(self) -> bool:
        """
        Set up the basic project structure.
        
        Returns:
            bool: True if successful, False otherwise
        """
        self.logger.info("Setting up project structure...")
        
        # Define directory structure
        dirs = [
            "app",
            "app/api",
            "app/api/v1",
            "app/api/v1/endpoints",
            "app/core",
            "app/models",
            "app/schemas",
            "app/services",
            "app/services/ai",
            "app/services/storage",
            "docs",
            "frontend",
            "scripts",
            "tests",
            "tests/unit",
            "tests/integration",
            "tests/e2e",
        ]
        
        try:
            # Create directories
            for directory in dirs:
                dir_path = self.project_root / directory
                if not dir_path.exists():
                    self.logger.info(f"Creating directory: {dir_path}")
                    dir_path.mkdir(parents=True, exist_ok=True)
            
            # Create basic __init__.py files
            self._create_init_files(dirs)
            
            self.logger.info("Project structure setup completed successfully")
            return True
            
        except Exception as e:
            self.logger.error(f"Error setting up project structure: {e}")
            return False
    
    def _create_init_files(self, dirs: List[str]) -> None:
        """
        Create __init__.py files in Python directories.
        
        Args:
            dirs: List of directories to create __init__.py files in
        """
        python_dirs = [d for d in dirs if "app" in d or "tests" in d]
        
        for directory in python_dirs:
            init_file = self.project_root / directory / "__init__.py"
            if not init_file.exists():
                with open(init_file, "w") as f:
                    f.write('"""' + directory.replace("/", ".") + ' module."""\n')
    
    def run_command(self, command: str, cwd: str = None) -> Tuple[int, str, str]:
        """
        Run a shell command and return the result.
        
        Args:
            command: Command to run
            cwd: Working directory to run the command in
            
        Returns:
            Tuple[int, str, str]: (return_code, stdout, stderr)
        """
        self.logger.info(f"Running command: {command}")
        
        if cwd is None:
            cwd = self.project_root
        else:
            cwd = Path(cwd)
        
        try:
            process = subprocess.Popen(
                command,
                shell=True,
                cwd=str(cwd),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                universal_newlines=True,
            )
            
            stdout, stderr = process.communicate()
            return_code = process.returncode
            
            if return_code != 0:
                self.logger.warning(f"Command failed with code {return_code}: {stderr}")
            
            return return_code, stdout, stderr
            
        except Exception as e:
            self.logger.error(f"Error running command: {e}")
            return 1, "", str(e)
    
    def read_file(self, file_path: str) -> Optional[str]:
        """
        Read the contents of a file.
        
        Args:
            file_path: Path to the file to read
            
        Returns:
            Optional[str]: File contents or None if the file could not be read
        """
        path = Path(file_path)
        if not path.is_absolute():
            path = self.project_root / path
        
        try:
            with open(path, "r", encoding="utf-8") as f:
                return f.read()
        except Exception as e:
            self.logger.error(f"Error reading file {path}: {e}")
            return None
    
    def write_file(self, file_path: str, content: str) -> bool:
        """
        Write content to a file.
        
        Args:
            file_path: Path to the file to write
            content: Content to write to the file
            
        Returns:
            bool: True if successful, False otherwise
        """
        path = Path(file_path)
        if not path.is_absolute():
            path = self.project_root / path
        
        try:
            # Create parent directories if they don't exist
            path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)
            
            self.logger.info(f"Successfully wrote to file: {path}")
            return True
            
        except Exception as e:
            self.logger.error(f"Error writing to file {path}: {e}")
            return False
    
    def copy_file(self, source_path: str, target_path: str) -> bool:
        """
        Copy a file from source to target.
        
        Args:
            source_path: Path to the source file
            target_path: Path to the target file
            
        Returns:
            bool: True if successful, False otherwise
        """
        source = Path(source_path)
        if not source.is_absolute():
            source = self.project_root / source
        
        target = Path(target_path)
        if not target.is_absolute():
            target = self.project_root / target
        
        try:
            # Create parent directories if they don't exist
            target.parent.mkdir(parents=True, exist_ok=True)
            
            shutil.copy2(source, target)
            
            self.logger.info(f"Successfully copied {source} to {target}")
            return True
            
        except Exception as e:
            self.logger.error(f"Error copying {source} to {target}: {e}")
            return False
    
    def list_files(self, directory: str, pattern: str = "*", recursive: bool = False) -> List[str]:
        """
        List files in a directory that match a pattern.
        
        Args:
            directory: Directory to list files in
            pattern: Glob pattern to match files
            recursive: Whether to search recursively
            
        Returns:
            List[str]: List of file paths
        """
        dir_path = Path(directory)
        if not dir_path.is_absolute():
            dir_path = self.project_root / dir_path
        
        try:
            if recursive:
                return [str(p.relative_to(self.project_root)) for p in dir_path.glob(f"**/{pattern}") if p.is_file()]
            else:
                return [str(p.relative_to(self.project_root)) for p in dir_path.glob(pattern) if p.is_file()]
                
        except Exception as e:
            self.logger.error(f"Error listing files in {dir_path}: {e}")
            return []
    
    def create_file_from_template(self, template_path: str, output_path: str, 
                                context: Dict[str, Any]) -> bool:
        """
        Create a file from a template, replacing placeholders with context values.
        
        Args:
            template_path: Path to the template file
            output_path: Path to the output file
            context: Dictionary of values to replace placeholders with
            
        Returns:
            bool: True if successful, False otherwise
        """
        # Read the template
        template_content = self.read_file(template_path)
        if template_content is None:
            return False
        
        # Replace placeholders
        for key, value in context.items():
            placeholder = f"{{{{{key}}}}}"
            template_content = template_content.replace(placeholder, str(value))
        
        # Write the output file
        return self.write_file(output_path, template_content)
    
    def load_json(self, file_path: str) -> Optional[Dict[str, Any]]:
        """
        Load JSON data from a file.
        
        Args:
            file_path: Path to the JSON file
            
        Returns:
            Optional[Dict[str, Any]]: Parsed JSON data or None if the file could not be read
        """
        content = self.read_file(file_path)
        if content is None:
            return None
        
        try:
            return json.loads(content)
        except json.JSONDecodeError as e:
            self.logger.error(f"Error parsing JSON from {file_path}: {e}")
            return None
    
    def save_json(self, file_path: str, data: Dict[str, Any], indent: int = 2) -> bool:
        """
        Save data as JSON to a file.
        
        Args:
            file_path: Path to the JSON file
            data: Data to save
            indent: Indentation level
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            json_content = json.dumps(data, indent=indent)
            return self.write_file(file_path, json_content)
        except Exception as e:
            self.logger.error(f"Error saving JSON to {file_path}: {e}")
            return False
    
    def merge_json(self, source_path: str, target_path: str, 
                 overwrite: bool = False) -> bool:
        """
        Merge JSON data from source into target.
        
        Args:
            source_path: Path to the source JSON file
            target_path: Path to the target JSON file
            overwrite: Whether to overwrite existing keys
            
        Returns:
            bool: True if successful, False otherwise
        """
        source_data = self.load_json(source_path)
        if source_data is None:
            return False
        
        target_data = self.load_json(target_path)
        if target_data is None:
            # If target doesn't exist, just copy the source
            return self.save_json(target_path, source_data)
        
        # Merge data
        if overwrite:
            target_data.update(source_data)
        else:
            # Only add keys that don't exist in target
            for key, value in source_data.items():
                if key not in target_data:
                    target_data[key] = value
        
        return self.save_json(target_path, target_data)
    
    def create_gitignore(self) -> bool:
        """
        Create a standard .gitignore file for the project.
        
        Returns:
            bool: True if successful, False otherwise
        """
        gitignore_content = """
# Python
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
.pytest_cache/
.coverage
htmlcov/

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

# Deployment
.vercel
.netlify
"""
        
        return self.write_file(".gitignore", gitignore_content)
    
    def verify_directories(self, directories: List[str]) -> bool:
        """
        Verify that all required directories exist.
        
        Args:
            directories: List of directories to verify
            
        Returns:
            bool: True if all directories exist, False otherwise
        """
        missing_dirs = []
        
        for directory in directories:
            dir_path = self.project_root / directory
            if not dir_path.exists():
                missing_dirs.append(directory)
        
        if missing_dirs:
            self.logger.warning(f"Missing directories: {', '.join(missing_dirs)}")
            return False
        
        return True
    
    def get_python_version(self) -> Tuple[int, int, int]:
        """
        Get the Python version as a tuple.
        
        Returns:
            Tuple[int, int, int]: Python version as (major, minor, micro)
        """
        return sys.version_info[:3]
    
    def get_node_version(self) -> Optional[Tuple[int, ...]]:
        """
        Get the Node.js version as a tuple.
        
        Returns:
            Optional[Tuple[int, ...]]: Node.js version as a tuple of integers, or None if Node.js is not installed
        """
        return_code, stdout, _ = self.run_command("node --version")
        
        if return_code != 0 or not stdout:
            return None
        
        # Parse version (remove 'v' prefix)
        version_str = stdout.strip().lstrip('v')
        try:
            return tuple(map(int, version_str.split('.')))
        except ValueError:
            return None
    
    def install_requirements(self, requirements_file: str = "requirements.txt") -> bool:
        """
        Install Python requirements from a requirements file.
        
        Args:
            requirements_file: Path to the requirements file
            
        Returns:
            bool: True if successful, False otherwise
        """
        file_path = Path(requirements_file)
        if not file_path.is_absolute():
            file_path = self.project_root / file_path
        
        if not file_path.exists():
            self.logger.error(f"Requirements file not found: {file_path}")
            return False
        
        self.logger.info(f"Installing requirements from {file_path}")
        
        return_code, stdout, stderr = self.run_command(f"pip install -r {file_path}")
        
        if return_code != 0:
            self.logger.error(f"Error installing requirements: {stderr}")
            return False
        
        self.logger.info("Requirements installed successfully")
        return True
    
    def create_virtual_environment(self, env_dir: str = "venv") -> bool:
        """
        Create a Python virtual environment.
        
        Args:
            env_dir: Directory to create the virtual environment in
            
        Returns:
            bool: True if successful, False otherwise
        """
        venv_dir = Path(env_dir)
        if not venv_dir.is_absolute():
            venv_dir = self.project_root / venv_dir
        
        if venv_dir.exists():
            self.logger.warning(f"Virtual environment already exists: {venv_dir}")
            return True
        
        self.logger.info(f"Creating virtual environment at {venv_dir}")
        
        return_code, stdout, stderr = self.run_command(f"python -m venv {venv_dir}")
        
        if return_code != 0:
            self.logger.error(f"Error creating virtual environment: {stderr}")
            return False
        
        self.logger.info("Virtual environment created successfully")
        return True
