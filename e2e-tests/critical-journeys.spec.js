// @ts-check
const { test, expect } = require('@playwright/test');

// Critical user journey tests for Auto AGI Builder
test.describe('Critical User Journeys', () => {
  // Test suite for authentication flows
  test.describe('Authentication', () => {
    test('should allow user to login successfully', async ({ page }) => {
      await page.goto('/auth/login');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'Password123!');
      await page.click('[data-testid="login-button"]');
      
      // Verify successful login
      await expect(page).toHaveURL('/dashboard');
      await expect(page.locator('[data-testid="user-greeting"]')).toBeVisible();
    });

    test('should display error on invalid login', async ({ page }) => {
      await page.goto('/auth/login');
      await page.fill('[data-testid="email-input"]', 'invalid@example.com');
      await page.fill('[data-testid="password-input"]', 'wrongpassword');
      await page.click('[data-testid="login-button"]');
      
      // Verify error message
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');
    });

    test('should allow user to register a new account', async ({ page }) => {
      await page.goto('/auth/register');
      await page.fill('[data-testid="name-input"]', 'Test User');
      await page.fill('[data-testid="email-input"]', `test${Date.now()}@example.com`);
      await page.fill('[data-testid="password-input"]', 'Password123!');
      await page.fill('[data-testid="confirm-password-input"]', 'Password123!');
      await page.click('[data-testid="register-button"]');
      
      // Verify successful registration
      await expect(page).toHaveURL('/auth/verification-sent');
      await expect(page.locator('text=verification email has been sent')).toBeVisible();
    });

    test('should allow password reset flow', async ({ page }) => {
      await page.goto('/auth/forgot-password');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.click('[data-testid="reset-button"]');
      
      // Verify reset email sent confirmation
      await expect(page.locator('text=reset instructions')).toBeVisible();
    });
  });

  // Test suite for project management
  test.describe('Project Management', () => {
    test.beforeEach(async ({ page }) => {
      // Login before each test
      await page.goto('/auth/login');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'Password123!');
      await page.click('[data-testid="login-button"]');
      await expect(page).toHaveURL('/dashboard');
    });

    test('should create a new project', async ({ page }) => {
      await page.click('[data-testid="new-project-button"]');
      await page.fill('[data-testid="project-name-input"]', `Test Project ${Date.now()}`);
      await page.fill('[data-testid="project-description-input"]', 'This is a test project description');
      await page.click('[data-testid="create-project-button"]');
      
      // Verify project created
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="project-list"]')).toContainText('Test Project');
    });

    test('should edit an existing project', async ({ page }) => {
      await page.click('[data-testid="project-card"]:first-child');
      await page.click('[data-testid="edit-project-button"]');
      await page.fill('[data-testid="project-name-input"]', 'Updated Project Name');
      await page.click('[data-testid="save-project-button"]');
      
      // Verify project updated
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="project-title"]')).toContainText('Updated Project Name');
    });
  });

  // Test suite for requirements management
  test.describe('Requirements Management', () => {
    test.beforeEach(async ({ page }) => {
      // Login and navigate to requirements page
      await page.goto('/auth/login');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'Password123!');
      await page.click('[data-testid="login-button"]');
      await page.goto('/requirements');
    });

    test('should add a new requirement', async ({ page }) => {
      await page.click('[data-testid="add-requirement-button"]');
      await page.fill('[data-testid="requirement-title-input"]', 'New Test Requirement');
      await page.fill('[data-testid="requirement-description-input"]', 'This is a test requirement description');
      await page.selectOption('[data-testid="requirement-priority-select"]', 'High');
      await page.click('[data-testid="save-requirement-button"]');
      
      // Verify requirement added
      await expect(page.locator('[data-testid="requirements-list"]')).toContainText('New Test Requirement');
    });

    test('should prioritize requirements', async ({ page }) => {
      await page.click('[data-testid="prioritize-mode-button"]');
      
      // Drag and drop to prioritize
      await page.dragAndDrop(
        '[data-testid="requirement-item"]:nth-child(2)', 
        '[data-testid="requirement-item"]:nth-child(1)'
      );
      
      await page.click('[data-testid="save-priorities-button"]');
      
      // Verify success message
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    });
  });

  // Test suite for document processing
  test.describe('Document Processing', () => {
    test.beforeEach(async ({ page }) => {
      // Login and navigate to documents page
      await page.goto('/auth/login');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'Password123!');
      await page.click('[data-testid="login-button"]');
      await page.goto('/documents');
    });

    test('should upload and analyze a document', async ({ page }) => {
      // Set up file input handling
      const fileChooserPromise = page.waitForEvent('filechooser');
      await page.click('[data-testid="upload-document-button"]');
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles({
        name: 'test-document.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('Test document content')
      });
      
      // Wait for upload and analysis to complete
      await expect(page.locator('[data-testid="document-processing-status"]')).toHaveText('Complete');
      await expect(page.locator('[data-testid="document-analysis-results"]')).toBeVisible();
    });
  });

  // Test suite for ROI calculations
  test.describe('ROI Calculations', () => {
    test.beforeEach(async ({ page }) => {
      // Login and navigate to ROI page
      await page.goto('/auth/login');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'Password123!');
      await page.click('[data-testid="login-button"]');
      await page.goto('/roi');
    });

    test('should calculate ROI based on input parameters', async ({ page }) => {
      // Fill business metrics form
      await page.fill('[data-testid="annual-revenue-input"]', '1000000');
      await page.fill('[data-testid="employees-count-input"]', '50');
      await page.fill('[data-testid="average-salary-input"]', '75000');
      await page.click('[data-testid="calculate-roi-button"]');
      
      // Check results visibility
      await expect(page.locator('[data-testid="roi-results"]')).toBeVisible();
      await expect(page.locator('[data-testid="roi-percentage"]')).not.toHaveText('0%');
    });
  });

  // Test suite for device preview functionality
  test.describe('Device Preview', () => {
    test.beforeEach(async ({ page }) => {
      // Login and navigate to device preview page
      await page.goto('/auth/login');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'Password123!');
      await page.click('[data-testid="login-button"]');
      await page.goto('/device-preview');
    });

    test('should switch between device types', async ({ page }) => {
      // Test mobile view
      await page.click('[data-testid="mobile-device-button"]');
      await expect(page.locator('[data-testid="device-frame"]')).toHaveClass(/mobile/);
      
      // Test tablet view
      await page.click('[data-testid="tablet-device-button"]');
      await expect(page.locator('[data-testid="device-frame"]')).toHaveClass(/tablet/);
      
      // Test desktop view
      await page.click('[data-testid="desktop-device-button"]');
      await expect(page.locator('[data-testid="device-frame"]')).toHaveClass(/desktop/);
    });
  });

  // Test suite for roadmap visualization
  test.describe('Roadmap Visualization', () => {
    test.beforeEach(async ({ page }) => {
      // Login and navigate to roadmap page
      await page.goto('/auth/login');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'Password123!');
      await page.click('[data-testid="login-button"]');
      await page.goto('/roadmap');
    });

    test('should display project roadmap timeline', async ({ page }) => {
      // Select a project
      await page.selectOption('[data-testid="project-selector"]', { index: 0 });
      
      // Verify roadmap elements
      await expect(page.locator('[data-testid="roadmap-visualizer"]')).toBeVisible();
      await expect(page.locator('[data-testid="timeline-milestone"]')).toHaveCount.greaterThan(0);
    });

    test('should adjust timeline scale', async ({ page }) => {
      // Select a project
      await page.selectOption('[data-testid="project-selector"]', { index: 0 });
      
      // Test timeline controls
      await page.click('[data-testid="zoom-in-button"]');
      await page.click('[data-testid="zoom-out-button"]');
      await page.click('[data-testid="fit-all-button"]');
      
      // Verify timeline is still visible
      await expect(page.locator('[data-testid="roadmap-visualizer"]')).toBeVisible();
    });
  });

  // Test suite for Australia-specific localization
  test.describe('Australia Localization', () => {
    test.beforeEach(async ({ page }) => {
      // Login and navigate to localization settings
      await page.goto('/auth/login');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'Password123!');
      await page.click('[data-testid="login-button"]');
      await page.goto('/settings/localization');
    });

    test('should set Australian locale settings', async ({ page }) => {
      // Select Australia region
      await page.selectOption('[data-testid="region-selector"]', 'Australia');
      
      // Select Sydney timezone
      await page.selectOption('[data-testid="timezone-selector"]', 'Australia/Sydney');
      
      await page.click('[data-testid="save-localization-button"]');
      
      // Verify success message
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      
      // Verify formatting preview shows Australian formats
      await expect(page.locator('[data-testid="date-format-preview"]')).toContainText('DD/MM/YYYY');
      await expect(page.locator('[data-testid="currency-format-preview"]')).toContainText('AUD');
    });
  });

  // Test for responsive design across different viewports
  test.describe('Responsive Design', () => {
    test('should display correctly on mobile viewport', async ({ page }) => {
      // Set viewport to mobile size
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/');
      
      // Verify mobile menu button is visible
      await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
      
      // Open mobile menu
      await page.click('[data-testid="mobile-menu-button"]');
      
      // Verify navigation is accessible
      await expect(page.locator('[data-testid="mobile-navigation"]')).toBeVisible();
    });
    
    test('should display correctly on tablet viewport', async ({ page }) => {
      // Set viewport to tablet size
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await page.goto('/');
      
      // Verify tablet-specific layout elements
      await expect(page.locator('[data-testid="tablet-layout"]')).toBeVisible();
    });
    
    test('should display correctly on desktop viewport', async ({ page }) => {
      // Set viewport to desktop size
      await page.setViewportSize({ width: 1440, height: 900 });
      
      await page.goto('/');
      
      // Verify desktop navigation is visible
      await expect(page.locator('[data-testid="desktop-navigation"]')).toBeVisible();
    });
  });
});
