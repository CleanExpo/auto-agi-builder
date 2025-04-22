"""
Load Testing for Auto AGI Builder
--------------------------------
Realistic load simulation framework to validate performance under various usage patterns

This script provides:
1. Configurable load scenarios simulating real user behavior
2. Scalable concurrent user simulation
3. Performance metrics collection and analysis
4. Threshold-based pass/fail criteria
5. Detailed reporting with performance graphs
"""

import os
import sys
import json
import time
import logging
import datetime
import random
import string
import argparse
import threading
import queue
import statistics
import concurrent.futures
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import requests
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple, Union, Callable
from dataclasses import dataclass

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("load_testing.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("load_testing")

# ===================================================================================
# Configuration
# ===================================================================================

@dataclass
class LoadTestConfig:
    """Configuration parameters for load testing"""
    
    # Endpoint configuration
    base_url: str = "http://localhost:8000/api/v1"
    health_endpoint: str = "/health"
    prototype_endpoint: str = "/prototype/generate"
    requirements_endpoint: str = "/requirements"
    
    # Test parameters
    concurrent_users: int = 50  # Number of simulated concurrent users
    ramp_up_time: int = 60  # Time in seconds to ramp up to full load
    test_duration: int = 300  # Total test duration in seconds
    
    # User simulation
    think_time_min: float = 2.0  # Minimum time in seconds between requests
    think_time_max: float = 10.0  # Maximum time in seconds between requests
    
    # Request distribution (percentage of each request type)
    request_distribution: Dict[str, float] = None
    
    # Performance thresholds
    avg_response_time_threshold: float = 2.0  # Average response time threshold in seconds
    p95_response_time_threshold: float = 5.0  # 95th percentile response time threshold in seconds
    error_rate_threshold: float = 0.01  # Error rate threshold (1%)
    
    # Authentication
    auth_token: Optional[str] = None
    
    def __post_init__(self):
        """Initialize default values that require computation"""
        if self.request_distribution is None:
            self.request_distribution = {
                "prototype_generation": 0.3,  # 30% of requests
                "requirements_extraction": 0.3,  # 30% of requests
                "document_analysis": 0.2,  # 20% of requests
                "health_check": 0.2  # 20% of requests
            }


class TestData:
    """Test data for load testing"""
    
    # Sample meeting notes for prototype generation
    MEETING_NOTES = [
        """
        Meeting Notes - Mobile App Project
        Date: April 15, 2025
        Attendees: John (CEO), Sarah (Product Manager), Michael (Developer)
        
        Key Points:
        - Need a mobile app for customers to submit product feedback
        - Must support iOS and Android platforms
        - Users should be able to upload photos along with their feedback
        - Categories needed: Bug Reports, Feature Requests, General Feedback
        - Admin dashboard required to manage and respond to feedback
        - Authentication using email or Google account
        - Integration with CRM system (Salesforce) is essential
        
        Timeline:
        - Design phase: 2 weeks
        - Development: 6 weeks
        - Testing: 2 weeks
        - Launch: June 2025
        
        Budget constraints: Maximum $50,000
        """,
        
        """
        Meeting Notes - E-commerce Website Redesign
        Date: April 18, 2025
        Attendees: Emma (CEO), David (UX Designer), Lisa (Developer)
        
        Key Points:
        - Current website is outdated and sales are declining
        - Need a modern, responsive design
        - Improve product search functionality
        - Implement personalized recommendations
        - Streamline checkout process to reduce cart abandonment
        - Integrate with multiple payment providers
        - Improve product page layout and image gallery
        
        Timeline:
        - Research and Analysis: 2 weeks
        - Design: 3 weeks
        - Development: 8 weeks
        - Testing: 3 weeks
        
        Budget: $75,000
        """,
        
        """
        Meeting Notes - Healthcare Patient Portal
        Date: April 20, 2025
        Attendees: Dr. Rodriguez (Medical Director), James (IT Manager), Sophia (UX Researcher)
        
        Key Points:
        - Patients need easy access to their medical records
        - Must be HIPAA compliant
        - Appointment scheduling and reminders
        - Secure messaging with healthcare providers
        - Prescription refill requests
        - Integration with existing EHR system
        - Mobile responsive design required
        
        Timeline:
        - Requirements gathering: 3 weeks
        - Design: 4 weeks
        - Development: 12 weeks
        - Compliance review: 3 weeks
        - Testing: 4 weeks
        
        Budget: $200,000
        """
    ]
    
    # Sample requirements for analysis
    REQUIREMENTS = [
        {
            "pain_points": [
                "Current process is manual and error-prone",
                "Data is not synchronized across departments",
                "Reporting is time-consuming and often delayed"
            ],
            "features": [
                "Automated data collection from multiple sources",
                "Real-time synchronization between departments",
                "Dashboard with configurable reports",
                "Export functionality to PDF and Excel",
                "Role-based access control"
            ],
            "constraints": [
                "Must integrate with existing SQL database",
                "Budget limited to $100,000",
                "Must be completed within 6 months"
            ]
        },
        {
            "pain_points": [
                "Customer onboarding takes too long",
                "High drop-off rate during registration",
                "Difficult to track customer progress through the funnel"
            ],
            "features": [
                "Streamlined onboarding with minimal required fields",
                "Social login options (Google, Facebook, Apple)",
                "Progress indicator for multi-step processes",
                "Save and resume functionality",
                "Automated email reminders for incomplete registrations"
            ],
            "constraints": [
                "Must comply with GDPR and CCPA",
                "Must work on mobile devices",
                "Authentication system cannot be changed"
            ]
        }
    ]
    
    # Sample document data
    DOCUMENT_DATA = {
        "document_id": "test_doc_001",
        "content_type": "text/plain",
        "content": "\n".join(MEETING_NOTES)
    }
    
    @classmethod
    def get_random_meeting_notes(cls):
        """Get a random set of meeting notes"""
        return random.choice(cls.MEETING_NOTES)
    
    @classmethod
    def get_random_requirements(cls):
        """Get a random set of requirements"""
        return random.choice(cls.REQUIREMENTS)
    
    @classmethod
    def get_document_data(cls):
        """Get document data for analysis"""
        return cls.DOCUMENT_DATA

# ===================================================================================
# Request Handlers
# ===================================================================================

class RequestHandler:
    """Base class for handling API requests"""
    
    def __init__(self, config: LoadTestConfig):
        """Initialize the request handler"""
        self.config = config
        
        # Set up common headers
        self.headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        # Add authorization if token is available
        if self.config.auth_token:
            self.headers["Authorization"] = f"Bearer {self.config.auth_token}"
    
    def execute(self) -> Tuple[bool, float, str]:
        """
        Execute the request
        
        Returns:
            Tuple of (success, response_time, error_message)
        """
        raise NotImplementedError("Subclasses must implement execute()")


class HealthCheckRequestHandler(RequestHandler):
    """Handler for health check requests"""
    
    def execute(self) -> Tuple[bool, float, str]:
        """
        Execute a health check request
        
        Returns:
            Tuple of (success, response_time, error_message)
        """
        url = f"{self.config.base_url}{self.config.health_endpoint}"
        
        try:
            start_time = time.time()
            response = requests.get(url, headers=self.headers, timeout=30)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                return True, response_time, ""
            else:
                return False, response_time, f"Health check failed with status code {response.status_code}"
        
        except Exception as e:
            return False, 0, f"Health check failed with exception: {str(e)}"


class PrototypeGenerationRequestHandler(RequestHandler):
    """Handler for prototype generation requests"""
    
    def execute(self) -> Tuple[bool, float, str]:
        """
        Execute a prototype generation request
        
        Returns:
            Tuple of (success, response_time, error_message)
        """
        url = f"{self.config.base_url}{self.config.prototype_endpoint}"
        
        # Prepare request data
        data = {
            "notes": TestData.get_random_meeting_notes()
        }
        
        try:
            start_time = time.time()
            response = requests.post(url, headers=self.headers, json=data, timeout=120)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                # Validate response structure
                response_data = response.json()
                if "requirements" in response_data and "prototype_details" in response_data:
                    return True, response_time, ""
                else:
                    return False, response_time, "Invalid response structure"
            else:
                return False, response_time, f"Prototype generation failed with status code {response.status_code}"
        
        except Exception as e:
            return False, 0, f"Prototype generation failed with exception: {str(e)}"


class RequirementsExtractionRequestHandler(RequestHandler):
    """Handler for requirements extraction requests"""
    
    def execute(self) -> Tuple[bool, float, str]:
        """
        Execute a requirements extraction request
        
        Returns:
            Tuple of (success, response_time, error_message)
        """
        url = f"{self.config.base_url}{self.config.requirements_endpoint}"
        
        # Prepare request data
        data = TestData.get_random_requirements()
        
        try:
            start_time = time.time()
            response = requests.post(url, headers=self.headers, json=data, timeout=60)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                return True, response_time, ""
            else:
                return False, response_time, f"Requirements extraction failed with status code {response.status_code}"
        
        except Exception as e:
            return False, 0, f"Requirements extraction failed with exception: {str(e)}"


class DocumentAnalysisRequestHandler(RequestHandler):
    """Handler for document analysis requests"""
    
    def execute(self) -> Tuple[bool, float, str]:
        """
        Execute a document analysis request
        
        Returns:
            Tuple of (success, response_time, error_message)
        """
        url = f"{self.config.base_url}/document/analyze"
        
        # Prepare request data
        data = TestData.get_document_data()
        
        try:
            start_time = time.time()
            response = requests.post(url, headers=self.headers, json=data, timeout=90)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                return True, response_time, ""
            else:
                return False, response_time, f"Document analysis failed with status code {response.status_code}"
        
        except Exception as e:
            return False, 0, f"Document analysis failed with exception: {str(e)}"


class RequestHandlerFactory:
    """Factory for creating request handlers"""
    
    @staticmethod
    def create_handler(request_type: str, config: LoadTestConfig) -> RequestHandler:
        """
        Create a request handler for the specified request type
        
        Args:
            request_type: Type of request to handle
            config: Load test configuration
            
        Returns:
            RequestHandler instance
            
        Raises:
            ValueError: If request_type is invalid
        """
        if request_type == "health_check":
            return HealthCheckRequestHandler(config)
        elif request_type == "prototype_generation":
            return PrototypeGenerationRequestHandler(config)
        elif request_type == "requirements_extraction":
            return RequirementsExtractionRequestHandler(config)
        elif request_type == "document_analysis":
            return DocumentAnalysisRequestHandler(config)
        else:
            raise ValueError(f"Invalid request type: {request_type}")

# ===================================================================================
# User Simulation
# ===================================================================================

class VirtualUser:
    """Simulates a user interacting with the system"""
    
    def __init__(self, user_id: int, config: LoadTestConfig, results_queue: queue.Queue):
        """
        Initialize a virtual user
        
        Args:
            user_id: Unique identifier for this user
            config: Load test configuration
            results_queue: Queue for reporting test results
        """
        self.user_id = user_id
        self.config = config
        self.results_queue = results_queue
        
        # Initialize user session
        self.session = requests.Session()
        
        # Copy request distribution for weighted selection
        self.request_distribution = list(config.request_distribution.items())
    
    def run(self, start_time: float, end_time: float):
        """
        Run the virtual user simulation
        
        Args:
            start_time: Time when this user should start (for ramp up)
            end_time: Time when the test should end
        """
        # Wait until start time
        current_time = time.time()
        if current_time < start_time:
            time.sleep(start_time - current_time)
        
        logger.info(f"User {self.user_id} starting")
        
        # Run until test end time
        while time.time() < end_time:
            # Select request type based on distribution
            request_type, _ = random.choices(
                population=self.request_distribution,
                weights=[weight for _, weight in self.request_distribution],
                k=1
            )[0]
            
            # Create and execute request
            handler = RequestHandlerFactory.create_handler(request_type, self.config)
            success, response_time, error_message = handler.execute()
            
            # Report result
            self.results_queue.put({
                "user_id": self.user_id,
                "request_type": request_type,
                "timestamp": time.time(),
                "success": success,
                "response_time": response_time,
                "error_message": error_message
            })
            
            # Simulate think time
            think_time = random.uniform(self.config.think_time_min, self.config.think_time_max)
            time.sleep(think_time)
        
        logger.info(f"User {self.user_id} finished")

# ===================================================================================
# Load Test Execution
# ===================================================================================

class LoadTest:
    """Executes a load test scenario"""
    
    def __init__(self, config: LoadTestConfig):
        """
        Initialize the load test
        
        Args:
            config: Load test configuration
        """
        self.config = config
        self.results_queue = queue.Queue()
        self.results = []
        self.start_time = None
        self.end_time = None
    
    def run(self):
        """
        Run the load test
        
        Returns:
            Test results
        """
        logger.info(f"Starting load test with {self.config.concurrent_users} concurrent users")
        
        # Calculate test timing
        self.start_time = time.time()
        self.end_time = self.start_time + self.config.test_duration
        
        # Calculate user start times (for ramp up)
        user_start_times = []
        if self.config.ramp_up_time > 0:
            for i in range(self.config.concurrent_users):
                user_start_time = self.start_time + (i / self.config.concurrent_users) * self.config.ramp_up_time
                user_start_times.append(user_start_time)
        else:
            # No ramp up, all users start immediately
            user_start_times = [self.start_time] * self.config.concurrent_users
        
        # Create and start user threads
        with concurrent.futures.ThreadPoolExecutor(max_workers=self.config.concurrent_users) as executor:
            # Submit user tasks
            futures = []
            for i in range(self.config.concurrent_users):
                user = VirtualUser(i, self.config, self.results_queue)
                future = executor.submit(user.run, user_start_times[i], self.end_time)
                futures.append(future)
            
            # Start results collector thread
            collector_thread = threading.Thread(target=self._collect_results)
            collector_thread.daemon = True
            collector_thread.start()
            
            # Wait for all users to complete
            for future in concurrent.futures.as_completed(futures):
                try:
                    future.result()
                except Exception as e:
                    logger.error(f"User thread failed: {str(e)}")
            
            # Signal results collector to stop
            self.results_queue.put(None)
            collector_thread.join()
        
        # Process and return results
        return self._process_results()
    
    def _collect_results(self):
        """Collect results from the queue"""
        while True:
            result = self.results_queue.get()
            if result is None:
                break
            self.results.append(result)
    
    def _process_results(self) -> Dict[str, Any]:
        """
        Process test results
        
        Returns:
            Dictionary of test results
        """
        if not self.results:
            return {
                "status": "failed",
                "message": "No test results collected",
                "error_rate": 1.0,
                "avg_response_time": 0,
                "p95_response_time": 0,
                "request_count": 0,
                "duration": self.config.test_duration
            }
        
        # Convert results to DataFrame
        df = pd.DataFrame(self.results)
        
        # Calculate overall metrics
        total_requests = len(df)
        successful_requests = df["success"].sum()
        error_rate = 1.0 - (successful_requests / total_requests) if total_requests > 0 else 1.0
        
        # Filter out failed requests for response time calculations
        successful_df = df[df["success"]]
        
        if len(successful_df) > 0:
            avg_response_time = successful_df["response_time"].mean()
            p95_response_time = successful_df["response_time"].quantile(0.95)
        else:
            avg_response_time = 0
            p95_response_time = 0
        
        # Calculate metrics by request type
        metrics_by_type = {}
        for request_type in self.config.request_distribution.keys():
            type_df = df[df["request_type"] == request_type]
            
            if len(type_df) > 0:
                type_success_rate = type_df["success"].mean()
                type_successful_df = type_df[type_df["success"]]
                
                if len(type_successful_df) > 0:
                    type_avg_response_time = type_successful_df["response_time"].mean()
                    type_p95_response_time = type_successful_df["response_time"].quantile(0.95)
                else:
                    type_avg_response_time = 0
                    type_p95_response_time = 0
                
                metrics_by_type[request_type] = {
                    "request_count": len(type_df),
                    "success_rate": type_success_rate,
                    "avg_response_time": type_avg_response_time,
                    "p95_response_time": type_p95_response_time
                }
        
        # Determine test status
        status = "passed"
        message = "All performance criteria met"
        
        if error_rate > self.config.error_rate_threshold:
            status = "failed"
            message = f"Error rate {error_rate:.2%} exceeds threshold {self.config.error_rate_threshold:.2%}"
        elif avg_response_time > self.config.avg_response_time_threshold:
            status = "failed"
            message = f"Average response time {avg_response_time:.2f}s exceeds threshold {self.config.avg_response_time_threshold:.2f}s"
        elif p95_response_time > self.config.p95_response_time_threshold:
            status = "failed"
            message = f"95th percentile response time {p95_response_time:.2f}s exceeds threshold {self.config.p95_response_time_threshold:.2f}s"
        
        # Return results
        return {
            "status": status,
            "message": message,
            "error_rate": error_rate,
            "avg_response_time": avg_response_time,
            "p95_response_time": p95_response_time,
            "request_count": total_requests,
            "duration": self.config.test_duration,
            "metrics_by_type": metrics_by_type,
            "raw_results": df.to_dict(orient="records") if len(df) > 0 else []
        }

# ===================================================================================
# Reporting
# ===================================================================================

class LoadTestReporter:
    """Generates reports for load test results"""
    
    @staticmethod
    def generate_report(results: Dict[str, Any], config: LoadTestConfig, output_dir: str = "load_test_results"):
        """
        Generate a report for load test results
        
        Args:
            results: Load test results
            config: Load test configuration
            output_dir: Directory for output files
        """
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)
        
        # Generate timestamp
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Save results as JSON
        results_file = os.path.join(output_dir, f"load_test_results_{timestamp}.json")
        with open(results_file, "w") as f:
            json.dump(results, f, indent=2)
        
        # Generate summary report
        summary_file = os.path.join(output_dir, f"load_test_summary_{timestamp}.txt")
        with open(summary_file, "w") as f:
            f.write("============================================\n")
            f.write("Auto AGI Builder - Load Test Results\n")
            f.write("============================================\n\n")
            
            f.write(f"Date: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Duration: {config.test_duration} seconds\n")
            f.write(f"Concurrent Users: {config.concurrent_users}\n")
            f.write(f"Status: {results['status'].upper()}\n")
            f.write(f"Message: {results['message']}\n\n")
            
            f.write("Overall Metrics:\n")
            f.write(f"  Total Requests: {results['request_count']}\n")
            f.write(f"  Error Rate: {results['error_rate']:.2%}\n")
            f.write(f"  Average Response Time: {results['avg_response_time']:.2f} seconds\n")
            f.write(f"  95th Percentile Response Time: {results['p95_response_time']:.2f} seconds\n\n")
            
            f.write("Metrics by Request Type:\n")
            for request_type, metrics in results.get("metrics_by_type", {}).items():
                f.write(f"  {request_type}:\n")
                f.write(f"    Request Count: {metrics['request_count']}\n")
                f.write(f"    Success Rate: {metrics['success_rate']:.2%}\n")
                f.write(f"    Average Response Time: {metrics['avg_response_time']:.2f} seconds\n")
                f.write(f"    95th Percentile Response Time: {metrics['p95_response_time']:.2f} seconds\n\n")
            
            f.write("Thresholds:\n")
            f.write(f"  Error Rate Threshold: {config.error_rate_threshold:.2%}\n")
            f.write(f"  Average Response Time Threshold: {config.avg_response_time_threshold:.2f} seconds\n")
            f.write(f"  95th Percentile Response Time Threshold: {config.p95_response_time_threshold:.2f} seconds\n")
        
        # Generate graphs if matplotlib is available
        try:
            LoadTestReporter.generate_graphs(results, config, output_dir, timestamp)
        except Exception as e:
            logger.error(f"Failed to generate graphs: {str(e)}")
        
        logger.info(f"Report generated at {output_dir}")
        logger.info(f"Summary: {summary_file}")
        logger.info(f"Detailed results: {results_file}")
    
    @staticmethod
    def generate_graphs(results: Dict[str, Any], config: LoadTestConfig, output_dir: str, timestamp: str):
        """
        Generate graphs for load test results
        
        Args:
            results: Load test results
            config: Load test configuration
            output_dir: Directory for output files
            timestamp: Timestamp for filenames
        """
        if "raw_results" not in results or not results["raw_results"]:
            logger.warning("No raw results available for graph generation")
            return
        
        # Convert raw results to DataFrame
        df = pd.DataFrame(results["raw_results"])
        
        # Add relative timestamp
        df["relative_time"] = df["timestamp"] - df["timestamp"].min()
        
        # Create graphs
        plt.figure(figsize=(12, 8))
        
        # Response time over time
        plt.subplot(2, 1, 1)
        for request_type in config.request_distribution.keys():
            type_df = df[(df["request_type"] == request_type) & (df["success"])]
            if len(type_df) > 0:
                plt.scatter(type_df["relative_time"], type_df["response_time"], label=request_type, alpha=0.5)
        
        plt.axhline(y=config.avg_response_time_threshold, color='r', linestyle='-', label="Avg Threshold")
        plt.axhline(y=config.p95_response_time_threshold, color='r', linestyle='--', label="P95 Threshold")
        
        plt.xlabel("Time (seconds)")
        plt.ylabel("Response Time (seconds)")
        plt.title("Response Time Over Time")
        plt.legend()
        plt.grid(True)
        
        # Rolling error rate
        plt.subplot(2, 1, 2)
        
        # Create time bins
        bin_size = max(5, config.test_duration // 20)  # Aim for about 20 bins, but at least 5 seconds
        bins = np.arange(0, df["relative_time"].max() + bin_size, bin_size)
        
        # Calculate error rate for each bin
        error_rates = []
        bin_centers = []
        
        for i in range(len(bins) - 1):
            bin_start = bins[i]
            bin_end = bins[i + 1]
            bin_df = df[(df["relative_time"] >= bin_start) & (df["relative_time"] < bin_end)]
            
            if len(bin_df) > 0:
                error_rate = 1.0 - bin_df["success"].mean()
                error_rates.append(error_rate)
                bin_centers.append((bin_start + bin_end) / 2)
        
        if error_rates:
            plt.plot(bin_centers, error_rates, 'o-', label="Error Rate")
            plt.axhline(y=config.error_rate_threshold, color='r', linestyle='-', label="Threshold")
            
            plt.xlabel("Time (seconds)")
            plt.ylabel("Error Rate")
            plt.title("Rolling Error Rate")
            plt.legend()
            plt.grid(True)
        
        # Save and close
        plt.tight_layout()
        graph_file = os.path.join(output_dir, f"load_test_graphs_{timestamp}.png")
        plt.savefig(graph_file)
        plt.close()
        
        logger.info(f"Graphs saved to {graph_file}")

# ===================================================================================
# Main Execution
# ===================================================================================

def authenticate(base_url: str, username: str, password: str) -> Optional[str]:
    """
    Authenticate and get a token
    
    Args:
        base_url: Base API URL
        username: Username for authentication
        password: Password for authentication
        
    Returns:
        Auth token or None if authentication failed
    """
    try:
        auth_url = f"{base_url}/auth/login"
        response = requests.post(auth_url, json={
            "username": username,
            "password": password
        })
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            logger.info("Authentication successful")
            return token
        else:
            logger.error(f"Authentication failed: {response.status_code}")
            return None
    
    except Exception as e:
        logger.error(f"Authentication failed: {str(e)}")
        return None


def main():
    """Main execution function"""
    parser = argparse.ArgumentParser(description="Auto AGI Builder Load Testing")
    parser.add_argument("--base-url", default="http://localhost:8000/api/v1", help="Base API URL")
    parser.add_argument("--concurrent-users", type=int, default=50, help="Number of concurrent users")
    parser.add_argument("--duration", type=int, default=300, help="Test duration in seconds")
    parser.add_argument("--ramp-up", type=int, default=60, help="Ramp-up time in seconds")
    parser.add_argument("--username", help="Username for authentication")
    parser.add_argument("--password", help="Password for authentication")
    parser.add_argument("--output-dir", default="load_test_results", help="Output directory for results")
    
    args = parser.parse_args()
    
    # Create configuration
    config = LoadTestConfig(
        base_url=args.base_url,
        concurrent_users=args.concurrent_users,
        test_duration=args.duration,
        ramp_up_time=args.ramp_up
    )
    
    # Authenticate if credentials provided
    if args.username and args.password:
        token = authenticate(args.base_url, args.username, args.password)
        if token:
            config.auth_token = token
    
    # Run the load test
    logger.info("Starting load test...")
    load_test = LoadTest(config)
    results = load_test.run()
    
    # Generate report
    LoadTestReporter.generate_report(results, config, args.output_dir)
    
    # Print summary
    print("\n============================================")
    print(f"Load Test Status: {results['status'].upper()}")
    print(f"Message: {results['message']}")
    print(f"Total Requests: {results['request_count']}")
    print(f"Error Rate: {results['error_rate']:.2%}")
    print(f"Average Response Time: {results['avg_response_time']:.2f} seconds")
    print(f"95th Percentile Response Time: {results['p95_response_time']:.2f} seconds")
    print("============================================\n")
    
    # Exit with appropriate status code
    if results['status'] == "passed":
        sys.exit(0)
    else:
        sys.exit(1)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logger.info("Load test interrupted by user")
        sys.exit(130)
    except Exception as e:
        logger.error(f"Load test failed: {str(e)}")
        sys.exit(1)
