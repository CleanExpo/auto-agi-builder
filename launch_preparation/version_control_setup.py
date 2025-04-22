"""
Version Control Setup for Auto AGI Builder
-----------------------------------------
Automated setup for Git repository and GitHub integration

This script provides:
1. Git repository initialization
2. .gitignore file creation with appropriate settings
3. Initial commit of codebase
4. GitHub remote setup (with instructions for authentication)
5. Branch configuration and initial push
"""

import os
import sys
import argparse
import logging
import subprocess
from pathlib import Path

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("git_setup.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("version_control_setup")


class GitSetup:
    """Setup Git repository and GitHub integration"""
    
    def __init__(self, project_path: str = None, github_repo: str = None, branch_name: str = "main"):
        """
        Initialize Git setup
        
        Args:
            project_path: Path to the project root (default: current directory)
            github_repo: URL of GitHub repository (e.g., "https://github.com/username/repo.git")
            branch_name: Default branch name (default: "main")
        """
        self.project_path = Path(project_path) if project_path else Path.cwd()
        self.github_repo = github_repo
        self.branch_name = branch_name
        
        # Validate project path
        if not self.project_path.exists():
            logger.error(f"Project path does not exist: {self.project_path}")
            raise ValueError(f"Project path does not exist: {self.project_path}")
        
        # Change to project directory
        self.original_dir = Path.cwd()
        os.chdir(self.project_path)
        logger.info(f"Changed working directory to: {self.project_path}")
    
    def __del__(self):
        """Restore original directory on cleanup"""
        try:
            os.chdir(self.original_dir)
            logger.info(f"Restored working directory to: {self.original_dir}")
        except:
            pass
    
    def is_git_initialized(self) -> bool:
        """Check if Git repository is already initialized"""
        git_dir = self.project_path / ".git"
        return git_dir.exists() and git_dir.is_dir()
    
    def initialize_git(self) -> bool:
        """Initialize Git repository if not already initialized"""
        if self.is_git_initialized():
            logger.info("Git repository already initialized")
            return True
        
        try:
            logger.info("Initializing Git repository")
            result = subprocess.run(
                ["git", "init"],
                capture_output=True,
                text=True,
                check=True
            )
            logger.info(f"Git initialization: {result.stdout.strip()}")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Git initialization failed: {e.stderr.strip()}")
            return False
        except Exception as e:
            logger.error(f"Error initializing Git repository: {str(e)}")
            return False
    
    def create_gitignore(self) -> bool:
        """Create .gitignore file with appropriate settings"""
        gitignore_path = self.project_path / ".gitignore"
        
        if gitignore_path.exists():
            logger.info(".gitignore file already exists")
            return True
        
        try:
            logger.info("Creating .gitignore file")
            
            # Create appropriate .gitignore content based on project structure
            if (self.project_path / "package.json").exists():
                # Node.js / Next.js project
                gitignore_content = """# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
"""
            elif (self.project_path / "requirements.txt").exists():
                # Python project
                gitignore_content = """# Byte-compiled / optimized / DLL files
__pycache__/
*.py[cod]
*$py.class

# Distribution / packaging
dist/
build/
*.egg-info/

# Unit test / coverage reports
htmlcov/
.tox/
.coverage
.coverage.*
.cache
coverage.xml
*.cover
.hypothesis/

# Environments
.env
.venv
env/
venv/
ENV/
env.bak/
venv.bak/

# IDE files
.idea/
.vscode/
*.sublime-project
*.sublime-workspace

# Logs
*.log
logs/

# Local development settings
*.sqlite3
.DS_Store
"""
            else:
                # Generic .gitignore
                gitignore_content = """# Environment variables
.env
.env.local

# Dependency directories
node_modules/
venv/
__pycache__/

# Build outputs
dist/
build/
out/
.next/

# Logs
logs/
*.log

# IDE files
.idea/
.vscode/
*.sublime-project
*.sublime-workspace

# OS files
.DS_Store
Thumbs.db

# Local development files
*.sqlite3
"""
            
            # Write .gitignore file
            with open(gitignore_path, "w") as f:
                f.write(gitignore_content)
            
            logger.info(f".gitignore file created at {gitignore_path}")
            return True
        except Exception as e:
            logger.error(f"Error creating .gitignore file: {str(e)}")
            return False
    
    def initial_commit(self) -> bool:
        """Add all files and create initial commit"""
        try:
            # Add all files
            logger.info("Adding files to Git")
            subprocess.run(
                ["git", "add", "."],
                capture_output=True,
                text=True,
                check=True
            )
            
            # Check if there are changes to commit
            status_result = subprocess.run(
                ["git", "status", "--porcelain"],
                capture_output=True,
                text=True,
                check=True
            )
            
            if not status_result.stdout.strip():
                # No changes to commit
                logger.info("No changes to commit")
                return True
            
            # Create initial commit
            logger.info("Creating initial commit")
            commit_result = subprocess.run(
                ["git", "commit", "-m", "Initial commit of Auto AGI Builder platform"],
                capture_output=True,
                text=True,
                check=True
            )
            
            logger.info(f"Initial commit created: {commit_result.stdout.strip()}")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Git operation failed: {e.stderr.strip()}")
            
            # Check if failure is due to Git user configuration
            if "Please tell me who you are" in e.stderr:
                logger.error("Git user configuration not set. Please configure Git user information:")
                logger.error("  git config --global user.email \"you@example.com\"")
                logger.error("  git config --global user.name \"Your Name\"")
            
            return False
        except Exception as e:
            logger.error(f"Error in initial commit: {str(e)}")
            return False
    
    def add_gitignore_commit(self) -> bool:
        """Add .gitignore file and commit it separately"""
        try:
            # Add .gitignore file
            logger.info("Adding .gitignore file")
            subprocess.run(
                ["git", "add", ".gitignore"],
                capture_output=True,
                text=True,
                check=True
            )
            
            # Commit .gitignore
            logger.info("Committing .gitignore file")
            commit_result = subprocess.run(
                ["git", "commit", "-m", "Add .gitignore file"],
                capture_output=True,
                text=True,
                check=True
            )
            
            logger.info(f".gitignore committed: {commit_result.stdout.strip()}")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Git operation failed: {e.stderr.strip()}")
            return False
        except Exception as e:
            logger.error(f"Error committing .gitignore: {str(e)}")
            return False
    
    def configure_github(self) -> bool:
        """Configure GitHub remote repository"""
        if not self.github_repo:
            logger.info("GitHub repository URL not provided. Skipping GitHub configuration.")
            logger.info("To configure GitHub later, use:")
            logger.info("  git remote add origin https://github.com/username/repo.git")
            logger.info("  git branch -M main")
            logger.info("  git push -u origin main")
            return True
        
        try:
            # Check if remote already exists
            remote_result = subprocess.run(
                ["git", "remote", "-v"],
                capture_output=True,
                text=True,
                check=True
            )
            
            if "origin" in remote_result.stdout:
                logger.info("Remote 'origin' already exists. Updating URL.")
                subprocess.run(
                    ["git", "remote", "set-url", "origin", self.github_repo],
                    capture_output=True,
                    text=True,
                    check=True
                )
            else:
                # Add remote
                logger.info(f"Adding GitHub remote: {self.github_repo}")
                subprocess.run(
                    ["git", "remote", "add", "origin", self.github_repo],
                    capture_output=True,
                    text=True,
                    check=True
                )
            
            # Set default branch
            logger.info(f"Setting default branch to {self.branch_name}")
            subprocess.run(
                ["git", "branch", "-M", self.branch_name],
                capture_output=True,
                text=True,
                check=True
            )
            
            logger.info("GitHub remote configured successfully")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"GitHub configuration failed: {e.stderr.strip()}")
            return False
        except Exception as e:
            logger.error(f"Error configuring GitHub: {str(e)}")
            return False
    
    def push_to_github(self) -> bool:
        """Push to GitHub repository"""
        if not self.github_repo:
            logger.info("GitHub repository URL not provided. Skipping GitHub push.")
            return True
        
        try:
            logger.info(f"Pushing to GitHub repository: {self.github_repo}")
            push_result = subprocess.run(
                ["git", "push", "-u", "origin", self.branch_name],
                capture_output=True,
                text=True,
                check=True
            )
            
            logger.info(f"Push to GitHub successful: {push_result.stdout.strip()}")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Push to GitHub failed: {e.stderr.strip()}")
            
            # Provide guidance based on common errors
            if "Authentication failed" in e.stderr:
                logger.error("GitHub authentication failed. Please ensure you have:")
                logger.error("1. Set up authentication (SSH key or Personal Access Token)")
                logger.error("2. Configured Git to use your credentials")
                logger.error("")
                logger.error("For more information, visit: https://docs.github.com/en/authentication")
            elif "Repository not found" in e.stderr:
                logger.error("GitHub repository not found. Please ensure:")
                logger.error("1. The repository exists on GitHub")
                logger.error("2. You have access to the repository")
                logger.error("3. The URL is correct")
            
            return False
        except Exception as e:
            logger.error(f"Error pushing to GitHub: {str(e)}")
            return False
    
    def run_setup(self) -> bool:
        """Run the full Git and GitHub setup process"""
        logger.info("Starting Git and GitHub setup")
        
        # Initialize Git repository
        if not self.initialize_git():
            logger.error("Git initialization failed. Aborting setup.")
            return False
        
        # Create .gitignore file
        if not self.create_gitignore():
            logger.warning("Failed to create .gitignore file. Continuing setup.")
        
        # Initial commit
        if not self.initial_commit():
            logger.error("Initial commit failed. Aborting setup.")
            return False
        
        # Add and commit .gitignore file
        # Note: This is only needed if .gitignore was created after the initial commit
        if Path(".gitignore").exists() and not Path(".gitignore").stat().st_mtime > 0:
            if not self.add_gitignore_commit():
                logger.warning("Failed to commit .gitignore file. Continuing setup.")
        
        # Configure GitHub remote
        if not self.configure_github():
            logger.error("GitHub configuration failed. Aborting setup.")
            return False
        
        # Push to GitHub if repository URL is provided
        if self.github_repo:
            if not self.push_to_github():
                logger.warning("Push to GitHub failed. Manual push will be required.")
                logger.warning(f"Use: git push -u origin {self.branch_name}")
        
        logger.info("Git and GitHub setup completed successfully")
        return True


def print_instructions(success: bool, github_repo: str = None, branch_name: str = "main"):
    """Print instructions for next steps"""
    print("\n=====================================================")
    print("           GIT AND GITHUB SETUP")
    print("=====================================================\n")
    
    if success:
        print("✅ Git repository setup completed successfully!")
        
        if github_repo:
            print(f"\nRepository is connected to: {github_repo}")
            print(f"Default branch: {branch_name}")
            print("\nTo verify the setup:")
            print("  git remote -v")
            print("  git status")
        else:
            print("\nRepository is setup locally.")
            print("\nTo connect to GitHub:")
            print("1. Create a new repository on GitHub")
            print("2. Link your local repository:")
            print("   git remote add origin https://github.com/username/repo.git")
            print(f"   git branch -M {branch_name}")
            print(f"   git push -u origin {branch_name}")
    else:
        print("❌ Git repository setup encountered issues.")
        print("\nPlease review the errors above and:")
        print("1. Resolve any configuration issues")
        print("2. Run the setup script again")
        print("3. Or manually complete the setup using Git commands")
    
    print("\nFor more information, see:")
    print("- Git documentation: https://git-scm.com/doc")
    print("- GitHub documentation: https://docs.github.com/en/get-started")
    print("\n=====================================================\n")


def main():
    """Main execution function"""
    parser = argparse.ArgumentParser(description="Version Control Setup for Auto AGI Builder")
    parser.add_argument("--project-path", help="Path to the project root directory")
    parser.add_argument("--github-repo", help="URL of GitHub repository (e.g., 'https://github.com/username/repo.git')")
    parser.add_argument("--branch-name", default="main", help="Default branch name (default: 'main')")
    
    args = parser.parse_args()
    
    try:
        # Create and run Git setup
        git_setup = GitSetup(
            project_path=args.project_path,
            github_repo=args.github_repo,
            branch_name=args.branch_name
        )
        
        success = git_setup.run_setup()
        
        # Print instructions
        print_instructions(success, args.github_repo, args.branch_name)
        
        sys.exit(0 if success else 1)
    except Exception as e:
        logger.error(f"Setup failed: {str(e)}")
        print(f"\nError: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
