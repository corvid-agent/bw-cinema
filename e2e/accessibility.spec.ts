import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('should have proper focus indicators', async ({ page }) => {
    await page.goto('/');
    // Tab to first focusable element
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test('should open keyboard shortcuts with ?', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('?');
    await expect(page.locator('[role="dialog"][aria-label="Keyboard shortcuts"]')).toBeVisible();
  });

  test('should close overlay with Escape', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('?');
    await expect(page.locator('.shortcuts-overlay')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.shortcuts-overlay')).not.toBeVisible();
  });

  test('should toggle accessibility panel', async ({ page }) => {
    await page.goto('/');
    await page.click('[aria-label="Accessibility settings"]');
    await expect(page.locator('[role="dialog"][aria-label="Accessibility settings"]')).toBeVisible();
  });

  test('should toggle theme', async ({ page }) => {
    await page.goto('/');
    const themeBtn = page.locator('[aria-label*="Switch to"]');
    await themeBtn.click();
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'sepia');
  });

  test('all images should have alt text', async ({ page }) => {
    await page.goto('/');
    const images = page.locator('img');
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('buttons should have accessible names', async ({ page }) => {
    await page.goto('/');
    const buttons = page.locator('button');
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      const btn = buttons.nth(i);
      const text = (await btn.textContent())?.trim();
      const ariaLabel = await btn.getAttribute('aria-label');
      expect(text || ariaLabel).toBeTruthy();
    }
  });
});
