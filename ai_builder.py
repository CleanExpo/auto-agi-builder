"""
AI builder for the Auto AGI Builder system.
Handles AI integrations, document analysis, and code generation.
"""
import os
import sys
import logging
import json
import re
from typing import List, Dict, Any, Optional, Union, Tuple
from pathlib import Path

from builder_core import BuilderCore

class AIBuilder(BuilderCore):
    """
    Handles AI-powered functionality for the Auto AGI Builder.
    Includes document analysis, code generation, and feedback.
    """
    
    def __init__(self, project_root: str = None, api_key: str = None):
        """
        Initialize the AI builder.
        
        Args:
            project_root: Path to the project root directory.
            api_key: OpenAI API key. If None, it will try to get it from
                     environment variables or the .env file.
        """
        super().__init__(project_root)
        self.logger = logging.getLogger("ai_builder")
        
        # Initialize API key
        self.api_key = api_key or os.environ.get("OPENAI_API_KEY")
        if not self.api_key:
            # Try to get API key from .env file
            env_file = self.project_root / ".env"
            if env_file.exists():
                with open(env_file, "r") as f:
                    for line in f:
                        if line.strip() and not line.strip().startswith("#"):
                            key, *value = line.strip().split("=", 1)
                            if key.strip() == "OPENAI_API_KEY" and value and value[0].strip():
                                self.api_key = value[0].strip()
                                break
        
        # Initialize OpenAI client if API key is available
        if self.api_key:
            try:
                import openai
                self.openai_client = openai.OpenAI(api_key=self.api_key)
                self.logger.info("OpenAI client initialized successfully")
            except ImportError:
                self.logger.warning("OpenAI package not installed. Use 'pip install openai' to install it.")
                self.openai_client = None
            except Exception as e:
                self.logger.error(f"Failed to initialize OpenAI client: {e}")
                self.openai_client = None
        else:
            self.logger.warning("OpenAI API key not found. AI features will not be available.")
            self.openai_client = None
    
    def analyze_document(self, document_path: str, analysis_type: str = "requirements") -> Dict[str, Any]:
        """
        Analyze a document using AI and extract useful information.
        
        Args:
            document_path: Path to the document to analyze
            analysis_type: Type of analysis to perform ('requirements', 'summary', etc.)
            
        Returns:
            Dict[str, Any]: Analysis results
        """
        self.logger.info(f"Analyzing document: {document_path}")
        
        if not self.openai_client:
            self.logger.error("OpenAI client not initialized. Cannot analyze document.")
            return {"error": "OpenAI client not initialized"}
        
        # Read the document
        document_content = self.read_file(document_path)
        if not document_content:
            return {"error": f"Failed to read document at {document_path}"}
        
        # Prepare prompt based on analysis type
        if analysis_type == "requirements":
            system_prompt = """
You are a requirements analyst for software development projects. Your task is to
extract clear, actionable requirements from documents. Organize the requirements into
the following categories:
1. Functional Requirements - What the system should do
2. Non-Functional Requirements - Quality attributes like performance, security, etc.
3. Technical Requirements - Technical constraints or necessities
4. User Interface Requirements - UI/UX related requirements

For each requirement:
- Assign a unique ID (e.g., REQ-F-001 for functional requirements)
- Rate its priority (High, Medium, Low)
- Provide a clear, concise description
- Include any dependencies on other requirements

Format the output as a JSON object.
"""
            user_prompt = f"Analyze the following document and extract requirements:\n\n{document_content}"
            
        elif analysis_type == "summary":
            system_prompt = """
You are a document summarization expert. Your task is to create a concise summary
of documents. Include the following in your summary:
1. Main themes and key points (3-5 bullet points)
2. Important details that should not be overlooked
3. Any action items or next steps
4. Suggested timeline if applicable

Format the output as a JSON object with sections for each component of the summary.
"""
            user_prompt = f"Summarize the following document:\n\n{document_content}"
            
        elif analysis_type == "code_review":
            system_prompt = """
You are a code review expert. Your task is to analyze code and provide feedback.
Focus on:
1. Code quality issues (e.g., code smells, anti-patterns)
2. Security vulnerabilities
3. Performance concerns
4. Maintainability issues
5. Suggestions for improvement

Format the output as a JSON object with sections for each category of feedback.
Include line numbers for specific issues when possible.
"""
            user_prompt = f"Review the following code:\n\n{document_content}"
            
        else:
            self.logger.error(f"Unsupported analysis type: {analysis_type}")
            return {"error": f"Unsupported analysis type: {analysis_type}"}
        
        try:
            # Call the OpenAI API for analysis
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.1,
                max_tokens=2000,
                top_p=1.0,
                frequency_penalty=0.0,
                presence_penalty=0.0
            )
            
            # Extract JSON from response
            try:
                result_text = response.choices[0].message.content.strip()
                # Try to extract JSON from the response
                json_match = re.search(r'```json\n(.*?)\n```', result_text, re.DOTALL)
                if json_match:
                    result_json = json.loads(json_match.group(1))
                else:
                    # If no JSON code block found, try to parse the entire response as JSON
                    result_json = json.loads(result_text)
                
                return result_json
                
            except json.JSONDecodeError:
                self.logger.warning("Failed to parse JSON from OpenAI response. Returning raw text.")
                return {"raw_result": result_text}
                
        except Exception as e:
            self.logger.error(f"Error during document analysis: {e}")
            return {"error": str(e)}
    
    def generate_code(self, prompt: str, language: str = "python", 
                     context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Generate code using AI based on a prompt.
        
        Args:
            prompt: Description of what code to generate
            language: Programming language to use
            context: Additional context like existing code, requirements, etc.
            
        Returns:
            Dict[str, Any]: Generated code and metadata
        """
        self.logger.info(f"Generating {language} code")
        
        if not self.openai_client:
            self.logger.error("OpenAI client not initialized. Cannot generate code.")
            return {"error": "OpenAI client not initialized"}
        
        # Format context if provided
        context_str = ""
        if context:
            if "existing_code" in context:
                context_str += f"\nExisting code:\n```{language}\n{context['existing_code']}\n```\n"
            if "requirements" in context:
                context_str += f"\nRequirements:\n{context['requirements']}\n"
            if "file_structure" in context:
                context_str += f"\nFile structure:\n{context['file_structure']}\n"
        
        # Create system prompt
        system_prompt = f"""
You are an expert {language} developer. Your task is to write clean, efficient, 
and well-documented code based on the provided prompt.

Requirements for the code:
1. Follow best practices for {language}
2. Include proper error handling
3. Be well-documented with comments
4. Be modular and maintainable
5. Follow the principles of clean code

Return only the code without any explanations or additional text. The code should 
be directly usable without modifications.
"""
        
        # Create user prompt
        user_prompt = f"{prompt}\n\n{context_str}"
        
        try:
            # Call the OpenAI API for code generation
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.2,
                max_tokens=4000,
                top_p=1.0,
                frequency_penalty=0.0,
                presence_penalty=0.0
            )
            
            # Extract code from response
            result_text = response.choices[0].message.content.strip()
            
            # Extract the code block if it exists
            code_match = re.search(r'```(?:\w+)?\n(.*?)\n```', result_text, re.DOTALL)
            if code_match:
                code = code_match.group(1)
            else:
                code = result_text
            
            return {
                "code": code,
                "language": language,
                "prompt": prompt,
                "tokens_used": response.usage.total_tokens
            }
                
        except Exception as e:
            self.logger.error(f"Error during code generation: {e}")
            return {"error": str(e)}
    
    def analyze_requirements(self, requirements_text: str) -> Dict[str, Any]:
        """
        Analyze requirements and provide insights.
        
        Args:
            requirements_text: Text containing requirements
            
        Returns:
            Dict[str, Any]: Analysis results
        """
        self.logger.info("Analyzing requirements")
        
        if not self.openai_client:
            self.logger.error("OpenAI client not initialized. Cannot analyze requirements.")
            return {"error": "OpenAI client not initialized"}
        
        system_prompt = """
You are a requirements analysis expert. Your task is to analyze software requirements
and provide insights. For each requirement, assess:
1. Clarity - Is the requirement clear and unambiguous?
2. Testability - Can the requirement be verified through testing?
3. Feasibility - Is the requirement technically feasible?
4. Conflicts - Does the requirement conflict with other requirements?
5. Priority - What should be the priority of this requirement?

Also provide an overall assessment of the requirements set:
1. Completeness - Are there any obvious missing requirements?
2. Consistency - Are the requirements consistent with each other?
3. Implementation complexity - How complex would the implementation be?
4. Risk factors - What are the main risks associated with these requirements?

Format the output as a JSON object.
"""
        
        try:
            # Call the OpenAI API for requirements analysis
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": requirements_text}
                ],
                temperature=0.3,
                max_tokens=3000,
                top_p=1.0,
                frequency_penalty=0.0,
                presence_penalty=0.0
            )
            
            # Extract JSON from response
            try:
                result_text = response.choices[0].message.content.strip()
                # Try to extract JSON from the response
                json_match = re.search(r'```json\n(.*?)\n```', result_text, re.DOTALL)
                if json_match:
                    result_json = json.loads(json_match.group(1))
                else:
                    # If no JSON code block found, try to parse the entire response as JSON
                    result_json = json.loads(result_text)
                
                return result_json
                
            except json.JSONDecodeError:
                self.logger.warning("Failed to parse JSON from OpenAI response. Returning raw text.")
                return {"raw_result": result_text}
                
        except Exception as e:
            self.logger.error(f"Error during requirements analysis: {e}")
            return {"error": str(e)}
    
    def suggest_system_architecture(self, requirements: str) -> Dict[str, Any]:
        """
        Suggest a system architecture based on requirements.
        
        Args:
            requirements: Requirements text
            
        Returns:
            Dict[str, Any]: Suggested architecture
        """
        self.logger.info("Suggesting system architecture")
        
        if not self.openai_client:
            self.logger.error("OpenAI client not initialized. Cannot suggest architecture.")
            return {"error": "OpenAI client not initialized"}
        
        system_prompt = """
You are a software architect. Your task is to suggest a system architecture based
on the given requirements. Include:
1. High-level architecture style (e.g., microservices, monolithic, etc.)
2. Component diagram with main components and their interactions
3. Deployment diagram if applicable
4. Technology stack recommendations (programming languages, frameworks, databases, etc.)
5. Key architectural decisions and their rationale
6. Identified challenges and potential solutions

Format the output as a JSON object with sections for each aspect of the architecture.
For diagrams, provide descriptions that can be used to generate proper UML diagrams later.
"""
        
        try:
            # Call the OpenAI API for architecture suggestion
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": requirements}
                ],
                temperature=0.4,
                max_tokens=3000,
                top_p=1.0,
                frequency_penalty=0.0,
                presence_penalty=0.0
            )
            
            # Extract JSON from response
            try:
                result_text = response.choices[0].message.content.strip()
                # Try to extract JSON from the response
                json_match = re.search(r'```json\n(.*?)\n```', result_text, re.DOTALL)
                if json_match:
                    result_json = json.loads(json_match.group(1))
                else:
                    # If no JSON code block found, try to parse the entire response as JSON
                    result_json = json.loads(result_text)
                
                return result_json
                
            except json.JSONDecodeError:
                self.logger.warning("Failed to parse JSON from OpenAI response. Returning raw text.")
                return {"raw_result": result_text}
                
        except Exception as e:
            self.logger.error(f"Error suggesting system architecture: {e}")
            return {"error": str(e)}
    
    def generate_test_cases(self, code_path: str, test_framework: str = "pytest") -> Dict[str, Any]:
        """
        Generate test cases for provided code.
        
        Args:
            code_path: Path to the code file
            test_framework: Test framework to use (pytest, unittest, etc.)
            
        Returns:
            Dict[str, Any]: Generated test cases
        """
        self.logger.info(f"Generating test cases for {code_path}")
        
        if not self.openai_client:
            self.logger.error("OpenAI client not initialized. Cannot generate test cases.")
            return {"error": "OpenAI client not initialized"}
        
        # Read the code
        code_content = self.read_file(code_path)
        if not code_content:
            return {"error": f"Failed to read code at {code_path}"}
        
        # Determine language from file extension
        _, ext = os.path.splitext(code_path)
        language_map = {
            ".py": "python",
            ".js": "javascript",
            ".ts": "typescript",
            ".java": "java",
            ".cpp": "cpp",
            ".cs": "csharp",
            ".go": "go",
            ".rb": "ruby",
        }
        language = language_map.get(ext.lower(), "unknown")
        
        system_prompt = f"""
You are a test engineer specialized in {language}. Your task is to generate 
comprehensive test cases for the provided code using {test_framework}.

For each function or method:
1. Generate at least 2-3 test cases covering different scenarios
2. Include tests for normal operation, edge cases, and error conditions
3. Add comments explaining the purpose of each test
4. Use mocks or stubs where appropriate
5. Follow best practices for {test_framework}

Return only the code for the test file without additional explanations.
"""
        
        try:
            # Call the OpenAI API for test case generation
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": code_content}
                ],
                temperature=0.3,
                max_tokens=4000,
                top_p=1.0,
                frequency_penalty=0.0,
                presence_penalty=0.0
            )
            
            # Extract the test code from response
            result_text = response.choices[0].message.content.strip()
            
            # Extract the code block if it exists
            code_match = re.search(r'```(?:\w+)?\n(.*?)\n```', result_text, re.DOTALL)
            if code_match:
                test_code = code_match.group(1)
            else:
                test_code = result_text
            
            # Generate file name for the test
            base_name = os.path.basename(code_path)
            base_name_no_ext = os.path.splitext(base_name)[0]
            
            if language == "python":
                test_file_name = f"test_{base_name_no_ext}.py"
            else:
                test_file_name = f"{base_name_no_ext}.test{ext}"
            
            return {
                "test_code": test_code,
                "test_file_name": test_file_name,
                "language": language,
                "framework": test_framework,
                "tokens_used": response.usage.total_tokens
            }
                
        except Exception as e:
            self.logger.error(f"Error generating test cases: {e}")
            return {"error": str(e)}
    
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
        self.logger.info(f"Improving code at {code_path} ({improvement_type})")
        
        if not self.openai_client:
            self.logger.error("OpenAI client not initialized. Cannot improve code.")
            return {"error": "OpenAI client not initialized"}
        
        # Read the code
        code_content = self.read_file(code_path)
        if not code_content:
            return {"error": f"Failed to read code at {code_path}"}
        
        # Determine language from file extension
        _, ext = os.path.splitext(code_path)
        language_map = {
            ".py": "python",
            ".js": "javascript",
            ".ts": "typescript",
            ".java": "java",
            ".cpp": "cpp",
            ".cs": "csharp",
            ".go": "go",
            ".rb": "ruby",
        }
        language = language_map.get(ext.lower(), "unknown")
        
        # Prepare prompt based on improvement type
        if improvement_type == "general":
            system_prompt = f"""
You are a senior {language} developer. Your task is to improve the given code 
for better quality, readability, and maintainability.

Focus on:
1. Code readability and style
2. Error handling
3. Documentation
4. Modularization
5. Removing redundancy
6. Adhering to best practices and conventions for {language}

Provide the improved code, followed by bullet points explaining the key improvements made.
"""
        elif improvement_type == "performance":
            system_prompt = f"""
You are a {language} performance optimization expert. Your task is to improve 
the given code for better performance.

Focus on:
1. Algorithmic efficiency
2. Data structure optimization
3. Memory usage
4. Asynchronous operations where appropriate
5. Caching strategies
6. Resource management

Provide the improved code, followed by bullet points explaining the key performance improvements made.
"""
        elif improvement_type == "security":
            system_prompt = f"""
You are a {language} security expert. Your task is to improve the given code 
to fix security vulnerabilities and follow security best practices.

Focus on:
1. Input validation
2. Authentication and authorization
3. Data encryption
4. Secure communication
5. Protection against common attacks (e.g., XSS, CSRF, injection attacks)
6. Secure resource management

Provide the improved code, followed by bullet points explaining the key security improvements made.
"""
        elif improvement_type == "documentation":
            system_prompt = f"""
You are a documentation specialist for {language}. Your task is to improve 
the documentation of the given code.

Focus on:
1. Function/method documentation
2. Class documentation
3. Module/file documentation
4. Inline comments for complex logic
5. Usage examples
6. Parameter descriptions and return values

Provide the improved code with comprehensive documentation.
"""
        elif improvement_type == "refactoring":
            system_prompt = f"""
You are a refactoring expert for {language}. Your task is to refactor 
the given code while preserving its functionality.

Focus on:
1. Applying design patterns where appropriate
2. Removing code smells
3. Improving code structure
4. Enhancing maintainability
5. Reducing complexity
6. Improving testability

Provide the refactored code, followed by bullet points explaining the key refactoring decisions.
"""
        else:
            self.logger.error(f"Unsupported improvement type: {improvement_type}")
            return {"error": f"Unsupported improvement type: {improvement_type}"}
        
        try:
            # Call the OpenAI API for code improvement
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": code_content}
                ],
                temperature=0.3,
                max_tokens=4000,
                top_p=1.0,
                frequency_penalty=0.0,
                presence_penalty=0.0
            )
            
            # Extract the improved code and explanation from response
            result_text = response.choices[0].message.content.strip()
            
            # Extract the code block if it exists
            code_match = re.search(r'```(?:\w+)?\n(.*?)\n```', result_text, re.DOTALL)
            if code_match:
                improved_code = code_match.group(1)
                
                # Extract explanation (text after the code block)
                explanation = result_text.split("```")[-1].strip()
            else:
                # If no code block is found, try to intelligently split between code and explanation
                if "Explanation:" in result_text:
                    parts = result_text.split("Explanation:", 1)
                    improved_code = parts[0].strip()
                    explanation = "Explanation: " + parts[1].strip()
                elif "Improvements:" in result_text:
                    parts = result_text.split("Improvements:", 1)
                    improved_code = parts[0].strip()
                    explanation = "Improvements: " + parts[1].strip()
                else:
                    # If no clear separator, assume it's all code
                    improved_code = result_text
                    explanation = ""
            
            return {
                "improved_code": improved_code,
                "explanation": explanation,
                "language": language,
                "improvement_type": improvement_type,
                "original_code_path": code_path,
                "tokens_used": response.usage.total_tokens
            }
                
        except Exception as e:
            self.logger.error(f"Error improving code: {e}")
            return {"error": str(e)}
