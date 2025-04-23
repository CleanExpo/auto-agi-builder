"""
OpenAI Integration Service

This module provides integration with OpenAI APIs for various AI-powered features.
"""

import os
import json
import logging
import asyncio
from typing import List, Dict, Any, Optional, Union
import httpx
from fastapi import HTTPException

# Configure logging
logger = logging.getLogger("auto-agi-builder")


class OpenAIService:
    """
    Service for interacting with OpenAI APIs.
    
    Provides methods for text completion, chat completion, embeddings,
    and other OpenAI-powered features.
    """
    
    def __init__(self):
        """Initialize the OpenAI service."""
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            logger.warning("OPENAI_API_KEY environment variable is not set")
        
        self.api_base = os.getenv("OPENAI_API_BASE", "https://api.openai.com/v1")
        self.default_model = os.getenv("OPENAI_DEFAULT_MODEL", "gpt-4-turbo")
        self.timeout = int(os.getenv("OPENAI_TIMEOUT_SECONDS", "60"))
        
        # Configure default headers
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
    
    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        top_p: float = 1.0,
        frequency_penalty: float = 0.0,
        presence_penalty: float = 0.0,
        stop: Optional[Union[str, List[str]]] = None,
        user: Optional[str] = None,
        stream: bool = False
    ) -> Dict[str, Any]:
        """
        Generate a chat completion using OpenAI's chat API.
        
        Args:
            messages: List of message dictionaries with 'role' and 'content'
            model: Model to use (defaults to env variable or gpt-4-turbo)
            temperature: Sampling temperature (0-2)
            max_tokens: Maximum number of tokens to generate
            top_p: Nucleus sampling parameter
            frequency_penalty: Frequency penalty parameter
            presence_penalty: Presence penalty parameter
            stop: Sequences where API will stop generating
            user: Unique user identifier for OpenAI to monitor abuse
            stream: Whether to stream the response
            
        Returns:
            Complete API response as a dictionary
            
        Raises:
            HTTPException: If the API request fails
        """
        # Check API key
        if not self.api_key:
            raise HTTPException(
                status_code=500,
                detail="OpenAI API key is not configured"
            )
        
        # Prepare request payload
        payload = {
            "model": model or self.default_model,
            "messages": messages,
            "temperature": temperature,
            "top_p": top_p,
            "frequency_penalty": frequency_penalty,
            "presence_penalty": presence_penalty,
            "stream": stream
        }
        
        # Add optional parameters if provided
        if max_tokens is not None:
            payload["max_tokens"] = max_tokens
        
        if stop is not None:
            payload["stop"] = stop
        
        if user is not None:
            payload["user"] = user
        
        # Make API request
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.api_base}/chat/completions",
                    headers=self.headers,
                    json=payload
                )
                
                # Check for errors
                if response.status_code != 200:
                    logger.error(
                        f"OpenAI API error: {response.status_code} - {response.text}"
                    )
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"OpenAI API error: {response.text}"
                    )
                
                return response.json()
        
        except httpx.TimeoutException:
            logger.error("OpenAI API request timed out")
            raise HTTPException(
                status_code=504,
                detail="OpenAI API request timed out"
            )
        
        except Exception as e:
            logger.error(f"Error calling OpenAI API: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error calling OpenAI API: {str(e)}"
            )
    
    async def generate_text(self, prompt: str, **kwargs) -> str:
        """
        Generate text from a prompt.
        
        This is a convenience wrapper around chat_completion that returns
        just the generated text content.
        
        Args:
            prompt: Text prompt to generate from
            **kwargs: Additional parameters to pass to chat_completion
            
        Returns:
            Generated text as a string
            
        Raises:
            HTTPException: If the API request fails
        """
        messages = [{"role": "user", "content": prompt}]
        
        response = await self.chat_completion(messages, **kwargs)
        
        try:
            return response["choices"][0]["message"]["content"]
        except (KeyError, IndexError) as e:
            logger.error(f"Error parsing OpenAI response: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error parsing OpenAI response: {str(e)}"
            )
    
    async def generate_embeddings(
        self,
        texts: List[str],
        model: str = "text-embedding-3-small"
    ) -> List[List[float]]:
        """
        Generate embeddings for a list of texts.
        
        Args:
            texts: List of text strings to embed
            model: Embedding model to use
            
        Returns:
            List of embedding vectors
            
        Raises:
            HTTPException: If the API request fails
        """
        # Check API key
        if not self.api_key:
            raise HTTPException(
                status_code=500,
                detail="OpenAI API key is not configured"
            )
        
        # Prepare request payload
        payload = {
            "model": model,
            "input": texts
        }
        
        # Make API request
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.api_base}/embeddings",
                    headers=self.headers,
                    json=payload
                )
                
                # Check for errors
                if response.status_code != 200:
                    logger.error(
                        f"OpenAI API error: {response.status_code} - {response.text}"
                    )
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"OpenAI API error: {response.text}"
                    )
                
                data = response.json()
                
                # Extract embeddings
                try:
                    embeddings = [item["embedding"] for item in data["data"]]
                    return embeddings
                except (KeyError, IndexError) as e:
                    logger.error(f"Error parsing OpenAI embeddings response: {str(e)}")
                    raise HTTPException(
                        status_code=500,
                        detail=f"Error parsing OpenAI embeddings response: {str(e)}"
                    )
        
        except httpx.TimeoutException:
            logger.error("OpenAI API request timed out")
            raise HTTPException(
                status_code=504,
                detail="OpenAI API request timed out"
            )
        
        except Exception as e:
            logger.error(f"Error calling OpenAI API: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error calling OpenAI API: {str(e)}"
            )
    
    async def analyze_requirements(self, requirements_text: str) -> Dict[str, Any]:
        """
        Analyze requirements text to extract structured requirements.
        
        Args:
            requirements_text: Raw requirements text to analyze
            
        Returns:
            Dictionary with structured requirements information
            
        Raises:
            HTTPException: If the API request fails
        """
        prompt = f"""
        Analyze the following project requirements and extract structured information.
        Return your response as a valid JSON object with the following structure:
        
        {{
            "requirements": [
                {{
                    "id": "REQ-001",
                    "name": "Short requirement name",
                    "description": "Detailed requirement description",
                    "priority": "high|medium|low",
                    "category": "functional|non-functional|technical",
                    "dependencies": ["REQ-002", "REQ-003"] // IDs of requirements this depends on
                }}
            ],
            "categories": {{
                "functional": ["REQ-001", "REQ-002"],
                "non-functional": ["REQ-003"],
                "technical": ["REQ-004"]
            }},
            "summary": "Brief summary of the requirements",
            "recommendations": ["Recommendation 1", "Recommendation 2"]
        }}
        
        Requirements to analyze:
        
        {requirements_text}
        """
        
        try:
            response_text = await self.generate_text(
                prompt, 
                temperature=0.2,  # Lower temperature for more consistent results
                model="gpt-4-turbo"  # Using the most advanced model for analysis
            )
            
            # Parse JSON response
            try:
                return json.loads(response_text)
            except json.JSONDecodeError as e:
                logger.error(f"Error parsing requirements analysis JSON: {str(e)}")
                
                # Try to extract JSON from the response if it contains additional text
                import re
                json_match = re.search(r'```json\n([\s\S]*?)\n```', response_text)
                if json_match:
                    try:
                        return json.loads(json_match.group(1))
                    except json.JSONDecodeError:
                        pass
                
                # Fallback to returning raw text
                return {
                    "error": "Could not parse JSON response",
                    "raw_response": response_text
                }
        
        except HTTPException:
            # Re-raise the exception
            raise
        
        except Exception as e:
            logger.error(f"Error analyzing requirements: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error analyzing requirements: {str(e)}"
            )
    
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
            language: Programming language for generated code
            comments: Whether to include comments in the generated code
            
        Returns:
            Generated code as a string
            
        Raises:
            HTTPException: If the API request fails
        """
        system_prompt = f"""
        You are an expert {language} developer. Generate well-structured, idiomatic code based on the user's requirements.
        
        {"Include detailed comments explaining the code." if comments else "Include minimal comments, focusing on code clarity."}
        
        Return ONLY the code with no additional explanation, formatting, or markdown. The code should be production-ready, following best practices for {language}.
        """
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ]
        
        try:
            response = await self.chat_completion(
                messages,
                temperature=0.3,  # Lower temperature for more deterministic code
                model="gpt-4-turbo"
            )
            
            return response["choices"][0]["message"]["content"]
        
        except Exception as e:
            logger.error(f"Error generating code: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error generating code: {str(e)}"
            )
    
    async def summarize_document(self, document_text: str, max_length: int = 500) -> str:
        """
        Summarize a document.
        
        Args:
            document_text: Text to summarize
            max_length: Maximum length of summary in characters
            
        Returns:
            Summarized text
            
        Raises:
            HTTPException: If the API request fails
        """
        prompt = f"""
        Summarize the following document in a concise manner. 
        The summary should be no more than {max_length} characters.
        Capture the main points and key information.
        
        Document:
        {document_text}
        """
        
        try:
            return await self.generate_text(prompt, temperature=0.5)
        except Exception as e:
            logger.error(f"Error summarizing document: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error summarizing document: {str(e)}"
            )
    
    async def calculate_roi(
        self, 
        project_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Calculate ROI and other financial metrics based on project data.
        
        Args:
            project_data: Dictionary with project financial data
            
        Returns:
            Dictionary with ROI analysis
            
        Raises:
            HTTPException: If the API request fails
        """
        # Ensure project_data has the required fields
        required_fields = ["initialCost", "ongoingCosts", "benefits", "timeframe"]
        missing_fields = [f for f in required_fields if f not in project_data]
        
        if missing_fields:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required fields for ROI calculation: {', '.join(missing_fields)}"
            )
        
        prompt = f"""
        Calculate the Return on Investment (ROI) and other financial metrics based on the following project data.
        Provide a detailed analysis with calculations and explanations.
        
        Return your response as a valid JSON object with the following structure:
        
        {{
            "summary": {{
                "roi": 120, // percentage
                "paybackPeriod": 18, // months
                "npv": 250000, // Net Present Value
                "irr": 22 // Internal Rate of Return (percentage)
            }},
            "calculations": {{
                "totalCosts": 200000,
                "totalBenefits": 450000,
                "netBenefit": 250000,
                "discountedCashFlow": [
                    // monthly or yearly cash flow analysis
                ]
            }},
            "recommendations": [
                "Recommendation 1",
                "Recommendation 2"
            ],
            "risks": [
                {{
                    "description": "Risk description",
                    "impact": "high|medium|low",
                    "mitigationStrategy": "Strategy to mitigate the risk"
                }}
            ]
        }}
        
        Project data:
        {json.dumps(project_data, indent=2)}
        """
        
        try:
            response_text = await self.generate_text(
                prompt,
                temperature=0.3,
                model="gpt-4-turbo"
            )
            
            # Parse JSON response
            try:
                return json.loads(response_text)
            except json.JSONDecodeError as e:
                logger.error(f"Error parsing ROI analysis JSON: {str(e)}")
                
                # Try to extract JSON from the response if it contains additional text
                import re
                json_match = re.search(r'```json\n([\s\S]*?)\n```', response_text)
                if json_match:
                    try:
                        return json.loads(json_match.group(1))
                    except json.JSONDecodeError:
                        pass
                
                # Fallback to returning raw text
                return {
                    "error": "Could not parse JSON response",
                    "raw_response": response_text
                }
        
        except Exception as e:
            logger.error(f"Error calculating ROI: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error calculating ROI: {str(e)}"
            )
