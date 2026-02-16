import { test, expect } from '@playwright/test';

test.describe('Browse page', () => {
  test('should display filter sidebar', async ({ page }) => {
    await page.goto('/browse');
    await expect(page.locator('.filters')).toBeVisible();
  });

  test('should display search bar', async ({ page }) => {
    await page.goto('/browse');
    const search = page.locator('#search-input');
    await expect(search).toBeVisible();
    await expect(search).toHaveAttribute('aria-label', 'Search films');
  });

  test('should display sort dropdown', async ({ page }) => {
    await page.goto('/browse');
    await expect(page.locator('#sort-select')).toBeVisible();
  });

  test('should show film count', async ({ page }) => {
    await page.goto('/browse');
    const subtitle = page.locator('.browse__subtitle');
    await expect(subtitle).toContainText('films found');
  });

  test('should toggle view mode', async ({ page }) => {
    await page.goto('/browse');
    const listRadio = page.locator('input[value="list"]');
    if (await listRadio.isVisible()) {
      await listRadio.click();
      await expect(page.locator('app-movie-list')).toBeVisible();
    }
  });
});
