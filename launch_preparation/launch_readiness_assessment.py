"""
Launch Readiness Assessment for Auto AGI Builder
-----------------------------------------------
Comprehensive assessment to validate all launch preparation components

This script provides:
1. Component verification for both technical and business readiness
2. Execution of critical pre-launch validations
3. Assessment of key metrics and thresholds
4. Go/No-Go determination with detailed reporting
5. Risk assessment and mitigation recommendations
"""

import os
import sys
import json
import yaml
import time
import shutil
import logging
import argparse
import datetime
import subprocess
from enum import Enum
from pathlib import Path
from typing import Dict, List, Any, Optional, Union, Tuple

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("launch_assessment.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("launch_assessment")


class Status(Enum):
    """Status enum for assessment results"""
    PASS = "PASS"
    WARN = "WARN"
    FAIL = "FAIL"
    SKIP = "SKIP"


class AssessmentCategory:
    """Base class for assessment categories"""
    
    def __init__(self, name: str, weight: float = 1.0):
        """
        Initialize assessment category
        
        Args:
            name: Category name
            weight: Category weight in overall assessment (0.0-1.0)
        """
        self.name = name
        self.weight = weight
        self.assessments = []
        self.status = Status.SKIP
        self.message = ""
        self.details = {}
    
    def add_assessment(self, name: str, status: Status, message: str, details: Dict[str, Any] = None):
        """
        Add an assessment result
        
        Args:
            name: Assessment name
            status: Assessment status
            message: Assessment message
            details: Assessment details
        """
        self.assessments.append({
            "name": name,
            "status": status,
            "message": message,
            "details": details or {}
        })
    
    def summarize(self) -> Tuple[Status, str]:
        """
        Summarize the category results
        
        Returns:
            Tuple of (status, message)
        """
        if not self.assessments:
            self.status = Status.SKIP
            self.message = f"No assessments run for {self.name}"
            return self.status, self.message
        
        # Count statuses
        status_counts = {
            Status.PASS: 0,
            Status.WARN: 0,
            Status.FAIL: 0,
            Status.SKIP: 0
        }
        
        for assessment in self.assessments:
            status_counts[assessment["status"]] += 1
        
        # Determine overall status
        if status_counts[Status.FAIL] > 0:
            self.status = Status.FAIL
            self.message = f"Failed {status_counts[Status.FAIL]} of {len(self.assessments)} assessments in {self.name}"
        elif status_counts[Status.WARN] > 0:
            self.status = Status.WARN
            self.message = f"Warnings in {status_counts[Status.WARN]} of {len(self.assessments)} assessments in {self.name}"
        elif status_counts[Status.PASS] > 0:
            self.status = Status.PASS
            self.message = f"Passed all {status_counts[Status.PASS]} assessments in {self.name}"
        else:
            self.status = Status.SKIP
            self.message = f"Skipped all assessments in {self.name}"
        
        return self.status, self.message
    
    def get_results(self) -> Dict[str, Any]:
        """
        Get assessment results
        
        Returns:
            Assessment results as a dictionary
        """
        self.summarize()
        
        return {
            "name": self.name,
            "status": self.status.value,
            "message": self.message,
            "weight": self.weight,
            "assessments": self.assessments,
            "details": self.details
        }


class ComponentVerification(AssessmentCategory):
    """Verify that all required components are available"""
    
    def __init__(self):
        """Initialize component verification"""
        super().__init__("Component Verification", weight=0.2)
        self.base_path = Path(os.path.dirname(os.path.abspath(__file__)))
    
    def run(self):
        """Run component verification"""
        logger.info("Running component verification")
        
        # Verify technical components
        self._verify_component(
            "Pre-Launch Checklist",
            self.base_path / "technical_finalization" / "pre_launch_checklist.py"
        )
        
        self._verify_component(
            "End-to-End Tests",
            self.base_path / "technical_finalization" / "end_to_end_tests.py"
        )
        
        self._verify_component(
            "Load Testing",
            self.base_path / "technical_finalization" / "load_testing.py"
        )
        
        self._verify_component(
            "Monitoring Configuration",
            self.base_path / "technical_finalization" / "monitoring_config.py"
        )
        
        # Verify business components
        self._verify_component(
            "Legal Documents Generator",
            self.base_path / "business_readiness" / "legal_documents_generator.py"
        )
        
        # Additional verification: check for legal document outputs
        legal_output_path = self.base_path / "business_readiness" / "legal" / "generated"
        if legal_output_path.exists():
            doc_count = len(list(legal_output_path.glob("*.md")))
            if doc_count >= 4:
                self.add_assessment(
                    "Legal Documents",
                    Status.PASS,
                    f"Found {doc_count} generated legal documents",
                    {
                        "doc_count": doc_count,
                        "path": str(legal_output_path)
                    }
                )
            elif doc_count > 0:
                self.add_assessment(
                    "Legal Documents",
                    Status.WARN,
                    f"Found only {doc_count} generated legal documents, expected at least 4",
                    {
                        "doc_count": doc_count,
                        "path": str(legal_output_path)
                    }
                )
            else:
                self.add_assessment(
                    "Legal Documents",
                    Status.FAIL,
                    "No generated legal documents found",
                    {
                        "path": str(legal_output_path)
                    }
                )
        else:
            # Check if we can generate the documents now
            try:
                legal_gen_path = self.base_path / "business_readiness" / "legal_documents_generator.py"
                if legal_gen_path.exists():
                    logger.info("Attempting to generate legal documents")
                    result = subprocess.run(
                        [sys.executable, str(legal_gen_path)],
                        capture_output=True,
                        text=True,
                        timeout=60
                    )
                    
                    if result.returncode == 0:
                        # Check if documents were generated
                        if legal_output_path.exists():
                            doc_count = len(list(legal_output_path.glob("*.md")))
                            if doc_count > 0:
                                self.add_assessment(
                                    "Legal Documents Generation",
                                    Status.PASS,
                                    f"Successfully generated {doc_count} legal documents",
                                    {
                                        "doc_count": doc_count,
                                        "path": str(legal_output_path)
                                    }
                                )
                            else:
                                self.add_assessment(
                                    "Legal Documents Generation",
                                    Status.WARN,
                                    "Legal documents generator ran successfully but no documents found",
                                    {
                                        "stdout": result.stdout,
                                        "stderr": result.stderr,
                                        "path": str(legal_output_path)
                                    }
                                )
                        else:
                            self.add_assessment(
                                "Legal Documents Generation",
                                Status.WARN,
                                "Legal documents generator ran successfully but output directory not found",
                                {
                                    "stdout": result.stdout,
                                    "stderr": result.stderr
                                }
                            )
                    else:
                        self.add_assessment(
                            "Legal Documents Generation",
                            Status.FAIL,
                            "Failed to generate legal documents",
                            {
                                "stdout": result.stdout,
                                "stderr": result.stderr,
                                "return_code": result.returncode
                            }
                        )
                else:
                    self.add_assessment(
                        "Legal Documents",
                        Status.FAIL,
                        "Legal documents generator and generated documents not found",
                        {
                            "path": str(legal_output_path)
                        }
                    )
            except Exception as e:
                self.add_assessment(
                    "Legal Documents Generation",
                    Status.FAIL,
                    f"Error attempting to generate legal documents: {str(e)}",
                    {
                        "error": str(e)
                    }
                )
        
        logger.info("Component verification completed")
        return self.get_results()
    
    def _verify_component(self, name: str, path: Path):
        """
        Verify that a component is available
        
        Args:
            name: Component name
            path: Component path
        """
        if path.exists():
            # Check if file is executable (has proper permissions)
            if os.access(path, os.X_OK) or path.suffix in [".py", ".sh", ".bat"]:
                self.add_assessment(
                    name,
                    Status.PASS,
                    f"{name} component is available",
                    {
                        "path": str(path),
                        "size": path.stat().st_size,
                        "modified": datetime.datetime.fromtimestamp(path.stat().st_mtime).isoformat()
                    }
                )
            else:
                self.add_assessment(
                    name,
                    Status.WARN,
                    f"{name} component exists but may not be executable",
                    {
                        "path": str(path),
                        "size": path.stat().st_size,
                        "modified": datetime.datetime.fromtimestamp(path.stat().st_mtime).isoformat()
                    }
                )
        else:
            self.add_assessment(
                name,
                Status.FAIL,
                f"{name} component not found at {path}",
                {
                    "path": str(path)
                }
            )


class PreLaunchValidation(AssessmentCategory):
    """Validate technical readiness using pre-launch checklist"""
    
    def __init__(self):
        """Initialize pre-launch validation"""
        super().__init__("Pre-Launch Validation", weight=0.3)
        self.base_path = Path(os.path.dirname(os.path.abspath(__file__)))
        self.checklist_path = self.base_path / "technical_finalization" / "pre_launch_checklist.py"
    
    def run(self):
        """Run pre-launch validation"""
        logger.info("Running pre-launch validation")
        
        if not self.checklist_path.exists():
            self.add_assessment(
                "Pre-Launch Checklist",
                Status.FAIL,
                f"Pre-launch checklist not found at {self.checklist_path}",
                {
                    "path": str(self.checklist_path)
                }
            )
            return self.get_results()
        
        try:
            # Run pre-launch checklist
            logger.info("Running pre-launch checklist")
            result = subprocess.run(
                [sys.executable, str(self.checklist_path)],
                capture_output=True,
                text=True,
                timeout=300  # 5 minutes timeout
            )
            
            # Process results
            if result.returncode == 0:
                # Check for json results file
                results_file = Path("technical_checklist_results.json")
                if results_file.exists():
                    try:
                        with open(results_file, "r") as f:
                            checklist_results = json.load(f)
                        
                        # Process results
                        self._process_checklist_results(checklist_results)
                    except Exception as e:
                        self.add_assessment(
                            "Pre-Launch Checklist Results",
                            Status.FAIL,
                            f"Failed to parse pre-launch checklist results: {str(e)}",
                            {
                                "error": str(e),
                                "stdout": result.stdout,
                                "stderr": result.stderr
                            }
                        )
                else:
                    # Try to parse results from stdout
                    self.add_assessment(
                        "Pre-Launch Checklist Results",
                        Status.WARN,
                        "Pre-launch checklist ran successfully but results file not found, using stdout",
                        {
                            "stdout": result.stdout,
                            "stderr": result.stderr
                        }
                    )
                    
                    # Look for pass rate in stdout
                    pass_rate_match = None
                    for line in result.stdout.splitlines():
                        if "Pass rate:" in line:
                            pass_rate_match = line
                            break
                    
                    if pass_rate_match:
                        try:
                            pass_rate = float(pass_rate_match.split(":")[1].strip().rstrip("%"))
                            if pass_rate >= 95:
                                self.add_assessment(
                                    "Overall Pass Rate",
                                    Status.PASS,
                                    f"Pre-launch checklist pass rate: {pass_rate}%",
                                    {
                                        "pass_rate": pass_rate
                                    }
                                )
                            elif pass_rate >= 80:
                                self.add_assessment(
                                    "Overall Pass Rate",
                                    Status.WARN,
                                    f"Pre-launch checklist pass rate below 95%: {pass_rate}%",
                                    {
                                        "pass_rate": pass_rate
                                    }
                                )
                            else:
                                self.add_assessment(
                                    "Overall Pass Rate",
                                    Status.FAIL,
                                    f"Pre-launch checklist pass rate below 80%: {pass_rate}%",
                                    {
                                        "pass_rate": pass_rate
                                    }
                                )
                        except Exception:
                            self.add_assessment(
                                "Overall Pass Rate",
                                Status.WARN,
                                f"Could not parse pass rate from: {pass_rate_match}",
                                {
                                    "line": pass_rate_match
                                }
                            )
                    else:
                        self.add_assessment(
                            "Overall Pass Rate",
                            Status.WARN,
                            "Could not find pass rate in checklist output",
                            {
                                "stdout": result.stdout
                            }
                        )
            else:
                self.add_assessment(
                    "Pre-Launch Checklist Execution",
                    Status.FAIL,
                    f"Pre-launch checklist failed with return code {result.returncode}",
                    {
                        "stdout": result.stdout,
                        "stderr": result.stderr,
                        "return_code": result.returncode
                    }
                )
        except subprocess.TimeoutExpired:
            self.add_assessment(
                "Pre-Launch Checklist Execution",
                Status.FAIL,
                "Pre-launch checklist timed out after 5 minutes",
                {
                    "timeout": 300
                }
            )
        except Exception as e:
            self.add_assessment(
                "Pre-Launch Checklist Execution",
                Status.FAIL,
                f"Error running pre-launch checklist: {str(e)}",
                {
                    "error": str(e)
                }
            )
        
        logger.info("Pre-launch validation completed")
        return self.get_results()
    
    def _process_checklist_results(self, results):
        """
        Process checklist results
        
        Args:
            results: Checklist results
        """
        # Store full results in details
        self.details["checklist_results"] = results
        
        # Process summary
        summary = results.get("summary", {})
        total = summary.get("total", 0)
        passed = summary.get("passed", 0)
        failed = summary.get("failed", 0)
        skipped = summary.get("skipped", 0)
        critical_failures = summary.get("critical_failures", 0)
        pass_rate = summary.get("pass_rate", 0)
        
        if total == 0:
            self.add_assessment(
                "Pre-Launch Checklist Summary",
                Status.FAIL,
                "No checks ran in pre-launch checklist",
                {
                    "summary": summary
                }
            )
            return
        
        # Add overall assessment
        if critical_failures > 0:
            self.add_assessment(
                "Critical Requirements",
                Status.FAIL,
                f"Failed {critical_failures} critical requirements in pre-launch checklist",
                {
                    "critical_failures": critical_failures,
                    "total": total
                }
            )
        else:
            self.add_assessment(
                "Critical Requirements",
                Status.PASS,
                "Passed all critical requirements in pre-launch checklist",
                {
                    "critical_failures": 0,
                    "total": total
                }
            )
        
        # Add pass rate assessment
        if pass_rate >= 95:
            self.add_assessment(
                "Overall Pass Rate",
                Status.PASS,
                f"Pre-launch checklist pass rate: {pass_rate:.1f}%",
                {
                    "pass_rate": pass_rate,
                    "passed": passed,
                    "total": total
                }
            )
        elif pass_rate >= 80:
            self.add_assessment(
                "Overall Pass Rate",
                Status.WARN,
                f"Pre-launch checklist pass rate below 95%: {pass_rate:.1f}%",
                {
                    "pass_rate": pass_rate,
                    "passed": passed,
                    "total": total
                }
            )
        else:
            self.add_assessment(
                "Overall Pass Rate",
                Status.FAIL,
                f"Pre-launch checklist pass rate below 80%: {pass_rate:.1f}%",
                {
                    "pass_rate": pass_rate,
                    "passed": passed,
                    "total": total
                }
            )
        
        # Process by category
        categories = {}
        for item in results.get("results", []):
            category = item.get("category", "unknown")
            if category not in categories:
                categories[category] = {
                    "total": 0,
                    "passed": 0,
                    "failed": 0,
                    "items": []
                }
            
            categories[category]["total"] += 1
            if item.get("result", {}).get("passed", False):
                categories[category]["passed"] += 1
            else:
                categories[category]["failed"] += 1
            
            categories[category]["items"].append(item)
        
        # Add assessments for each category
        for category, data in categories.items():
            category_pass_rate = (data["passed"] / data["total"]) * 100 if data["total"] > 0 else 0
            
            if category_pass_rate == 100:
                self.add_assessment(
                    f"{category.title()} Checks",
                    Status.PASS,
                    f"Passed all {data['total']} {category} checks",
                    {
                        "category": category,
                        "passed": data["passed"],
                        "total": data["total"],
                        "pass_rate": category_pass_rate
                    }
                )
            elif category_pass_rate >= 80:
                self.add_assessment(
                    f"{category.title()} Checks",
                    Status.WARN,
                    f"Passed {data['passed']} of {data['total']} {category} checks ({category_pass_rate:.1f}%)",
                    {
                        "category": category,
                        "passed": data["passed"],
                        "total": data["total"],
                        "pass_rate": category_pass_rate,
                        "failed_items": [
                            {"id": item["id"], "name": item["name"], "message": item["result"]["message"]}
                            for item in data["items"] if not item.get("result", {}).get("passed", False)
                        ]
                    }
                )
            else:
                self.add_assessment(
                    f"{category.title()} Checks",
                    Status.FAIL,
                    f"Failed {data['failed']} of {data['total']} {category} checks (only {category_pass_rate:.1f}% passed)",
                    {
                        "category": category,
                        "passed": data["passed"],
                        "total": data["total"],
                        "pass_rate": category_pass_rate,
                        "failed_items": [
                            {"id": item["id"], "name": item["name"], "message": item["result"]["message"]}
                            for item in data["items"] if not item.get("result", {}).get("passed", False)
                        ]
                    }
                )


class EndToEndFunctionality(AssessmentCategory):
    """Verify core functionality using end-to-end tests"""
    
    def __init__(self):
        """Initialize end-to-end functionality verification"""
        super().__init__("End-to-End Functionality", weight=0.2)
        self.base_path = Path(os.path.dirname(os.path.abspath(__file__)))
        self.tests_path = self.base_path / "technical_finalization" / "end_to_end_tests.py"
    
    def run(self):
        """Run end-to-end functionality verification"""
        logger.info("Running end-to-end functionality verification")
        
        if not self.tests_path.exists():
            self.add_assessment(
                "End-to-End Tests",
                Status.FAIL,
                f"End-to-end tests not found at {self.tests_path}",
                {
                    "path": str(self.tests_path)
                }
            )
            return self.get_results()
        
        try:
            # Check if local servers are running (needed for tests)
            api_running = self._check_service_running("8000")
            frontend_running = self._check_service_running("3000")
            
            if not api_running:
                self.add_assessment(
                    "API Service",
                    Status.WARN,
                    "API service does not appear to be running on port 8000",
                    {
                        "port": 8000,
                        "required_for": "end-to-end tests"
                    }
                )
            
            if not frontend_running:
                self.add_assessment(
                    "Frontend Service",
                    Status.WARN,
                    "Frontend service does not appear to be running on port 3000",
                    {
                        "port": 3000,
                        "required_for": "end-to-end tests"
                    }
                )
            
            if not api_running or not frontend_running:
                self.add_assessment(
                    "End-to-End Tests Skipped",
                    Status.SKIP,
                    "Skipping end-to-end tests because required services are not running",
                    {
                        "api_running": api_running,
                        "frontend_running": frontend_running
                    }
                )
                return self.get_results()
            
            # Run a subset of end-to-end tests with limited scope
            logger.info("Running basic end-to-end tests")
            
            # Create a temporary pytest configuration to run only core tests
            test_config = """
[pytest]
python_files = end_to_end_tests.py
python_classes = TestUserJourney
python_functions = test_project_creation test_prototype_generation
"""
            
            with open("pytest.ini", "w") as f:
                f.write(test_config)
            
            # Run the tests
            result = subprocess.run(
                [sys.executable, "-m", "pytest", "-v", str(self.tests_path)],
                capture_output=True,
                text=True,
                timeout=300  # 5 minutes timeout
            )
            
            # Process results
            if result.returncode == 0:
                self.add_assessment(
                    "Core Functionality Tests",
                    Status.PASS,
                    "All core functionality tests passed",
                    {
                        "stdout": result.stdout,
                        "test_count": result.stdout.count("PASSED")
                    }
                )
            elif "collected 0 items" in result.stdout:
                self.add_assessment(
                    "Core Functionality Tests",
                    Status.WARN,
                    "No tests were collected/executed",
                    {
                        "stdout": result.stdout,
                        "stderr": result.stderr,
                        "return_code": result.returncode
                    }
                )
            else:
                # Count passed and failed tests
                passed = result.stdout.count("PASSED")
                failed = result.stdout.count("FAILED")
                skipped = result.stdout.count("SKIPPED")
                total = passed + failed + skipped
                
                if passed > 0 and failed > 0:
                    self.add_assessment(
                        "Core Functionality Tests",
                        Status.WARN,
                        f"{passed} of {total} tests passed, {failed} failed",
                        {
                            "passed": passed,
                            "failed": failed,
                            "skipped": skipped,
                            "total": total,
                            "stdout": result.stdout,
                            "stderr": result.stderr
                        }
                    )
                elif passed == 0:
                    self.add_assessment(
                        "Core Functionality Tests",
                        Status.FAIL,
                        f"All {failed} tests failed",
                        {
                            "passed": passed,
                            "failed": failed,
                            "skipped": skipped,
                            "total": total,
                            "stdout": result.stdout,
                            "stderr": result.stderr
                        }
                    )
                else:
                    self.add_assessment(
                        "Core Functionality Tests",
                        Status.WARN,
                        f"Tests completed with return code {result.returncode}",
                        {
                            "stdout": result.stdout,
                            "stderr": result.stderr,
                            "return_code": result.returncode
                        }
                    )
            
            # Clean up
            if os.path.exists("pytest.ini"):
                os.remove("pytest.ini")
            
        except subprocess.TimeoutExpired:
            self.add_assessment(
                "Core Functionality Tests",
                Status.FAIL,
                "End-to-end tests timed out after 5 minutes",
                {
                    "timeout": 300
                }
            )
        except Exception as e:
            self.add_assessment(
                "Core Functionality Tests",
                Status.FAIL,
                f"Error running end-to-end tests: {str(e)}",
                {
                    "error": str(e)
                }
            )
        
        logger.info("End-to-end functionality verification completed")
        return self.get_results()
    
    def _check_service_running(self, port: str) -> bool:
        """
        Check if a service is running on a port
        
        Args:
            port: Port to check
            
        Returns:
            True if service is running, False otherwise
        """
        try:
            if sys.platform == 'win32':
                # Windows
                result = subprocess.run(
                    f"netstat -ano | findstr :{port}",
                    shell=True,
                    capture_output=True,
                    text=True
                )
                return "LISTENING" in result.stdout
            else:
                # Linux/Mac
                result = subprocess.run(
                    f"lsof -i :{port} | grep LISTEN",
                    shell=True,
                    capture_output=True,
                    text=True
                )
                return len(result.stdout.strip()) > 0
        except Exception:
            return False


class PerformanceAssessment(AssessmentCategory):
    """Assess system performance under load"""
    
    def __init__(self):
        """Initialize performance assessment"""
        super().__init__("Performance Assessment", weight=0.15)
        self.base_path = Path(os.path.dirname(os.path.abspath(__file__)))
        self.load_testing_path = self.base_path / "technical_finalization" / "load_testing.py"
    
    def run(self):
        """Run performance assessment"""
        logger.info("Running performance assessment")
        
        if not self.load_testing_path.exists():
            self.add_assessment(
                "Load Testing",
                Status.FAIL,
                f"Load testing script not found at {self.load_testing_path}",
                {
                    "path": str(self.load_testing_path)
                }
            )
            return self.get_results()
        
        # Check if local API is running
        api_running = self._check_service_running("8000")
        
        if not api_running:
            self.add_assessment(
                "API Service",
                Status.WARN,
                "API service does not appear to be running on port 8000",
                {
                    "port": 8000,
                    "required_for": "performance testing"
                }
            )
            
            self.add_assessment(
                "Performance Testing Skipped",
                Status.SKIP,
                "Skipping performance testing because API service is not running",
                {
                    "api_running": api_running
                }
            )
            return self.get_results()
        
        try:
            # Run load testing with reduced load for launch assessment
            logger.info("Running lightweight load test")
            result = subprocess.run(
                [
                    sys.executable, 
                    str(self.load_testing_path),
                    "--concurrent-
