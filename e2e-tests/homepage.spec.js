const { test, expect } = require('@playwright/test');

/**
 * Homepage end-to-end tests
 * Tests the landing page and its functionality
 */
test.describe('Homepage', () => {
  test('should have the correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Auto AGI Builder/);
  });

  test('should display the main heading', async ({ page }) => {
    await page.goto('/');
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Auto AGI Builder');
  });

  test('should have navigation links', async ({ page }) => {
    await page.goto('/');
    const navLinks = page.locator('nav a');
    await expect(navLinks).toHaveCount(3);
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Login');
    await expect(page).toHaveURL(/.*login/);
  });

  test('should navigate to dashboard if logged in', async ({ page }) => {
    // Simulate logged in state by setting token in localStorage
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'test-token');
    });
    
    // Click on dashboard link
    await page.click('text=Dashboard');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should have a responsive design', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    let mobileMenu = page.locator('[data-testid="mobile-menu"]');
    await expect(mobileMenu).toBeHidden();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    mobileMenu = page.locator('[data-testid="mobile-menu"]');
    await expect(mobileMenu).toBeVisible();
  });
});
