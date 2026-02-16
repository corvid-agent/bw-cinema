import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/BW Cinema/);
    await expect(page.locator('h1')).toContainText('Classic Black');
  });

  test('should navigate to browse page', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/browse"]');
    await expect(page.locator('h1')).toContainText('Browse Films');
  });

  test('should navigate to collection page', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/collection"]');
    await expect(page.locator('h1')).toContainText('My Collection');
  });

  test('should navigate to about page', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/about"]');
    await expect(page.locator('h1')).toContainText('About');
  });

  test('should have skip-to-content link', async ({ page }) => {
    await page.goto('/');
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  test('should have main landmark', async ({ page }) => {
    await page.goto('/');
    const main = page.locator('main#main-content');
    await expect(main).toBeVisible();
  });
});
