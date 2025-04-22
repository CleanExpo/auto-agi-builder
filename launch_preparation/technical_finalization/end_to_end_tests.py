"""
End-to-End Testing for Auto AGI Builder
--------------------------------------
Comprehensive test suite for validating the complete user journey through the platform

This script provides:
1. Automated browser-based testing of critical user flows
2. Verification of all major platform features
3. Realistic simulation of user interactions
4. Detailed reporting of test results
"""

import os
import sys
import json
import time
import pytest
import logging
import datetime
import random
import string
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple, Generator

# Import Playwright for browser automation
from playwright.sync_api import sync_playwright, Page, Browser, BrowserContext, expect
from playwright.sync_api import TimeoutError as PlaywrightTimeoutError

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("e2e_tests.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("e2e_tests")

# Test configuration
class TestConfig:
    """Configuration for end-to-end tests"""
    
    # Base URLs
    BASE_URL = "http://localhost:3000"  # Frontend URL
    API_URL = "http://localhost:8000/api/v1"  # API URL
    
    # Timeouts
    DEFAULT_TIMEOUT = 30000  # 30 seconds
    EXTENDED_TIMEOUT = 120000  # 2 minutes for long operations
    
    # Test user credentials
    TEST_USER_EMAIL = f"test_{random.randint(1000, 9999)}@example.com"
    TEST_USER_PASSWORD = "TestPassword123!"
    TEST_USER_NAME = "Test User"
    
    # Test data
    TEST_MEETING_NOTES = """
    Meeting Notes - Mobile App Project
    Date: April 15, 2025
    Attendees: John (CEO), Sarah (Product Manager), Michael (Developer)
    
    Agenda:
    1. Define requirements for the new customer feedback app
    2. Assign responsibilities
    3. Set timeline
    
    Key Points:
    - Need a mobile app for customers to submit product feedback
    - Must support iOS and Android platforms
    - Users should be able to upload photos along with their feedback
    - Categories needed: Bug Reports, Feature Requests, General Feedback
    - Admin dashboard required to manage and respond to feedback
    - Authentication using email or Google account
    - Integration with CRM system (Salesforce) is essential
    - Analytics required to track user engagement
    - Must comply with GDPR requirements
    
    Timeline:
    - Design phase: 2 weeks
    - Development: 6 weeks
    - Testing: 2 weeks
    - Launch: June 2025
    
    Budget constraints: Maximum $50,000
    
    Action Items:
    - Sarah to create detailed requirements document
    - Michael to research technology options
    - John to finalize budget approval
    
    Next meeting scheduled for April 22, 2025
    """
    
    # Sample document file path (create dynamically during test)
    TEST_DOCUMENT_PATH = Path("test_meeting_notes.txt")
    
    @classmethod
    def create_test_document(cls):
        """Create a test document file"""
        with open(cls.TEST_DOCUMENT_PATH, "w") as f:
            f.write(cls.TEST_MEETING_NOTES)
        return cls.TEST_DOCUMENT_PATH


# Test fixtures
@pytest.fixture(scope="session")
def browser():
    """Launch browser once for all tests"""
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=False)  # Set to True for headless mode
        yield browser
        browser.close()


@pytest.fixture
def context(browser):
    """Create a new browser context for each test"""
    context = browser.new_context(
        viewport={"width": 1920, "height": 1080},
        record_video_dir="test_videos"
    )
    yield context
    context.close()


@pytest.fixture
def page(context):
    """Create a new page for each test"""
    page = context.new_page()
    page.set_default_timeout(TestConfig.DEFAULT_TIMEOUT)
    yield page
    page.close()


@pytest.fixture
def authenticated_page(context):
    """Create a page with an authenticated user session"""
    page = context.new_page()
    page.set_default_timeout(TestConfig.DEFAULT_TIMEOUT)
    
    # Navigate to login page
    page.goto(f"{TestConfig.BASE_URL}/login")
    
    # Check if we need to register first
    try:
        # Try logging in
        page.fill('input[type="email"]', TestConfig.TEST_USER_EMAIL)
        page.fill('input[type="password"]', TestConfig.TEST_USER_PASSWORD)
        page.click('button[type="submit"]')
        
        # Wait for navigation to complete
        page.wait_for_url(f"{TestConfig.BASE_URL}/**")
        
    except PlaywrightTimeoutError:
        logger.info("Login failed, attempting registration")
        
        # Go to registration page
        page.goto(f"{TestConfig.BASE_URL}/register")
        
        # Fill registration form
        page.fill('input[name="email"]', TestConfig.TEST_USER_EMAIL)
        page.fill('input[name="password"]', TestConfig.TEST_USER_PASSWORD)
        page.fill('input[name="fullName"]', TestConfig.TEST_USER_NAME)
        page.click('button[type="submit"]')
        
        # Wait for registration to complete and redirect
        page.wait_for_url(f"{TestConfig.BASE_URL}/**")
        
        # Should be logged in now
    
    # Verify we're authenticated
    try:
        page.wait_for_selector('text=Dashboard', timeout=5000)
        logger.info("Authentication successful")
    except PlaywrightTimeoutError:
        logger.error("Failed to authenticate user")
        raise
    
    yield page
    page.close()


# Test helper functions
def take_screenshot(page, name):
    """Take a screenshot for debugging/reporting"""
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"screenshot_{name}_{timestamp}.png"
    page.screenshot(path=filename)
    logger.info(f"Screenshot saved: {filename}")
    return filename


def wait_for_network_idle(page):
    """Wait for network activity to settle"""
    page.wait_for_load_state("networkidle")


def generate_random_string(length=8):
    """Generate a random string for unique test data"""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))


# Test cases
class TestUserJourney:
    """Test the complete user journey through the Auto AGI Builder platform"""
    
    def test_registration_and_onboarding(self, page):
        """Test user registration and onboarding flow"""
        logger.info("Testing user registration and onboarding")
        
        # Generate a unique email for this test
        test_email = f"test_{generate_random_string()}@example.com"
        
        # Navigate to registration page
        page.goto(f"{TestConfig.BASE_URL}/register")
        
        # Fill registration form
        page.fill('input[name="email"]', test_email)
        page.fill('input[name="password"]', TestConfig.TEST_USER_PASSWORD)
        page.fill('input[name="fullName"]', TestConfig.TEST_USER_NAME)
        
        # Take screenshot before submission
        take_screenshot(page, "registration_form")
        
        # Submit registration form
        page.click('button[type="submit"]')
        
        # Wait for onboarding to start
        page.wait_for_url(f"{TestConfig.BASE_URL}/onboarding/**")
        
        # Verify we're on the onboarding flow
        assert "onboarding" in page.url, "Failed to reach onboarding flow after registration"
        
        # Complete onboarding steps
        # Step 1: Email verification (simulated for testing)
        if page.is_visible('text="Verify your email"'):
            page.click('button:has-text("Skip for now")')  # Skip for testing
        
        # Step 2: Company information
        if page.is_visible('text="Company Information"'):
            page.fill('input[name="companyName"]', "Test Company")
            page.click('button:has-text("Continue")')
        
        # Step 3: Sample data
        if page.is_visible('text="Sample Data"'):
            page.click('button:has-text("Generate Sample Data")')
            # Wait for data generation to complete
            page.wait_for_selector('text="Sample data created successfully"', 
                                 timeout=TestConfig.EXTENDED_TIMEOUT)
            page.click('button:has-text("Continue")')
        
        # Step 4: Welcome tour
        if page.is_visible('text="Welcome Tour"'):
            # Click through tour steps
            while page.is_visible('button:has-text("Next")'):
                page.click('button:has-text("Next")')
                time.sleep(0.5)
            
            # Complete tour
            if page.is_visible('button:has-text("Complete Tour")'):
                page.click('button:has-text("Complete Tour")')
        
        # Wait for dashboard to load
        page.wait_for_url(f"{TestConfig.BASE_URL}/dashboard")
        
        # Verify we reached the dashboard
        assert "dashboard" in page.url, "Failed to complete onboarding and reach dashboard"
        
        # Take screenshot of dashboard
        take_screenshot(page, "dashboard_after_onboarding")
        
        logger.info("Registration and onboarding test passed")
    
    def test_project_creation(self, authenticated_page):
        """Test creating a new project"""
        logger.info("Testing project creation")
        page = authenticated_page
        
        # Navigate to projects page
        page.goto(f"{TestConfig.BASE_URL}/projects")
        
        # Click on "Create New Project" button
        page.click('button:has-text("Create New Project")')
        
        # Fill project creation form
        project_name = f"Test Project {generate_random_string()}"
        page.fill('input[name="projectName"]', project_name)
        page.fill('textarea[name="projectDescription"]', "This is a test project for end-to-end testing")
        
        # Select project type if available
        if page.is_visible('select[name="projectType"]'):
            page.select_option('select[name="projectType"]', "mobile_app")
        
        # Take screenshot of form
        take_screenshot(page, "create_project_form")
        
        # Submit the form
        page.click('button[type="submit"]')
        
        # Wait for project creation to complete
        page.wait_for_url(f"{TestConfig.BASE_URL}/projects/**")
        
        # Verify the project was created successfully
        assert project_name in page.content(), f"Project name '{project_name}' not found after creation"
        
        # Take screenshot of new project
        take_screenshot(page, "new_project_view")
        
        # Store project ID for later tests (extract from URL)
        project_url = page.url
        project_id = project_url.split("/")[-1]
        
        logger.info(f"Project creation test passed. Project ID: {project_id}")
        return project_id
    
    def test_document_upload(self, authenticated_page):
        """Test uploading a document for analysis"""
        logger.info("Testing document upload")
        page = authenticated_page
        
        # Navigate to documents page
        page.goto(f"{TestConfig.BASE_URL}/documents")
        
        # Create test document
        test_file_path = TestConfig.create_test_document()
        
        # Click upload button
        page.click('text="Import Document"')
        
        # Upload file
        page.set_input_files('input[type="file"]', str(test_file_path))
        
        # Wait for upload to complete
        page.wait_for_selector('text="Document content preview"')
        
        # Take screenshot of uploaded document
        take_screenshot(page, "document_uploaded")
        
        # Extract requirements
        page.click('button:has-text("Extract Requirements")')
        
        # Wait for extraction to complete
        page.wait_for_selector('text="Extracted Requirements"', 
                             timeout=TestConfig.EXTENDED_TIMEOUT)
        
        # Take screenshot of extracted requirements
        take_screenshot(page, "extracted_requirements")
        
        # Verify some requirements were extracted (basic check)
        assert "requirements" in page.content().lower(), "No requirements found after extraction"
        
        logger.info("Document upload and analysis test passed")
    
    def test_prototype_generation(self, authenticated_page):
        """Test generating a prototype from meeting notes"""
        logger.info("Testing prototype generation")
        page = authenticated_page
        
        # Navigate to home page for the prototype generator
        page.goto(TestConfig.BASE_URL)
        
        # Enter meeting notes
        page.fill('textarea[id="meetingNotes"]', TestConfig.TEST_MEETING_NOTES)
        
        # Take screenshot of form with notes
        take_screenshot(page, "prototype_generation_form")
        
        # Submit for generation
        page.click('button:has-text("Generate Prototype Analysis")')
        
        # Wait for generation to complete
        page.wait_for_selector('text="Prototype Analysis Results"', 
                             timeout=TestConfig.EXTENDED_TIMEOUT)
        
        # Take screenshot of results
        take_screenshot(page, "prototype_generation_results")
        
        # Verify results contain expected sections
        results_text = page.content().lower()
        assert "requirements" in results_text, "Requirements section missing from results"
        assert "prototype details" in results_text, "Prototype details missing from results"
        assert "pricing" in results_text, "Pricing section missing from results"
        
        logger.info("Prototype generation test passed")
    
    def test_roi_calculation(self, authenticated_page):
        """Test ROI calculator functionality"""
        logger.info("Testing ROI calculator")
        page = authenticated_page
        
        # Navigate to ROI calculator
        page.goto(f"{TestConfig.BASE_URL}/roi")
        
        # Fill business metrics form
        page.fill('input[name="initialCost"]', "50000")
        page.fill('input[name="monthlyRevenue"]', "10000")
        page.fill('input[name="monthlyExpenses"]', "2000")
        page.fill('input[name="timeframe"]', "24")  # 24 months
        
        # Take screenshot of form
        take_screenshot(page, "roi_calculator_form")
        
        # Calculate ROI
        page.click('button:has-text("Calculate ROI")')
        
        # Wait for calculation to complete
        page.wait_for_selector('text="ROI Results"')
        
        # Take screenshot of ROI results
        take_screenshot(page, "roi_results")
        
        # Verify results contain key metrics
        results_text = page.content().lower()
        assert "roi" in results_text, "ROI percentage missing from results"
        assert "break-even" in results_text, "Break-even point missing from results"
        
        logger.info("ROI calculator test passed")
    
    def test_account_settings(self, authenticated_page):
        """Test account settings management"""
        logger.info("Testing account settings")
        page = authenticated_page
        
        # Navigate to account settings
        page.goto(f"{TestConfig.BASE_URL}/settings")
        
        # Verify account info is displayed
        page.wait_for_selector(f'text="{TestConfig.TEST_USER_EMAIL}"')
        
        # Update profile information
        page.fill('input[name="fullName"]', f"{TestConfig.TEST_USER_NAME} Updated")
        
        # Take screenshot of updated form
        take_screenshot(page, "account_settings_form")
        
        # Save changes
        page.click('button:has-text("Save Changes")')
        
        # Wait for save confirmation
        page.wait_for_selector('text="Profile updated successfully"')
        
        # Refresh page to verify changes persisted
        page.reload()
        
        # Check that updated name is displayed
        assert "Updated" in page.content(), "Profile name update not persisted"
        
        logger.info("Account settings test passed")
    
    def test_end_to_end_flow(self, page):
        """Test the complete end-to-end user journey"""
        logger.info("Testing complete end-to-end user journey")
        
        # Step 1: Register and onboard
        self.test_registration_and_onboarding(page)
        
        # Step 2: Create a project
        project_id = self.test_project_creation(page)
        
        # Step 3: Upload a document
        self.test_document_upload(page)
        
        # Step 4: Generate a prototype
        self.test_prototype_generation(page)
        
        # Step 5: Calculate ROI
        self.test_roi_calculation(page)
        
        # Step 6: Manage account settings
        self.test_account_settings(page)
        
        # Step 7: Logout
        page.click('text="Logout"')
        
        # Verify logout successful
        page.wait_for_url(f"{TestConfig.BASE_URL}/login")
        
        # Take final screenshot
        take_screenshot(page, "end_to_end_complete")
        
        logger.info("End-to-end user journey test passed")


# Load testing class - simulates multiple concurrent users
class TestLoadScenarios:
    """Load testing scenarios for Auto AGI Builder"""
    
    @pytest.mark.skip(reason="Load testing should be run separately in a controlled environment")
    def test_concurrent_prototype_generation(self, context):
        """Test multiple concurrent prototype generation requests"""
        logger.info("Testing concurrent prototype generation")
        
        # Number of concurrent users to simulate
        concurrent_users = 5
        pages = []
        
        try:
            # Create multiple pages (browser tabs)
            for i in range(concurrent_users):
                page = context.new_page()
                pages.append(page)
                
                # Navigate to home
                page.goto(TestConfig.BASE_URL)
                
                # Login if needed (or use test account)
                # This would be implementation-specific
                
                # Navigate to prototype generation
                page.goto(TestConfig.BASE_URL)
                
                # Enter slightly different meeting notes for each user
                page.fill('textarea[id="meetingNotes"]', 
                        f"{TestConfig.TEST_MEETING_NOTES}\nUser-specific note {i}")
            
            # Submit all forms simultaneously
            for i, page in enumerate(pages):
                logger.info(f"Submitting form for concurrent user {i+1}")
                page.click('button:has-text("Generate Prototype Analysis")')
            
            # Wait for all to complete and verify results
            for i, page in enumerate(pages):
                try:
                    page.wait_for_selector('text="Prototype Analysis Results"', 
                                         timeout=TestConfig.EXTENDED_TIMEOUT)
                    logger.info(f"User {i+1} generation completed successfully")
                    take_screenshot(page, f"concurrent_user_{i+1}_results")
                except PlaywrightTimeoutError:
                    logger.error(f"Prototype generation timed out for user {i+1}")
                    take_screenshot(page, f"concurrent_user_{i+1}_timeout")
                    raise
        
        finally:
            # Close all pages
            for page in pages:
                try:
                    page.close()
                except:
                    pass
        
        logger.info("Concurrent prototype generation test completed")


# Run tests with pytest
if __name__ == "__main__":
    # Create results directory if it doesn't exist
    results_dir = Path("test_results")
    results_dir.mkdir(exist_ok=True)
    
    # Run tests and generate report
    pytest.main([
        "-v",
        "--html=test_results/report.html",
        "--self-contained-html",
        __file__
    ])
