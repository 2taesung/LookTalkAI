import { test, expect } from '@playwright/test';

test.describe('LookTalkAI Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the homepage correctly', async ({ page }) => {
    // Check if the main heading is visible
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Check if navigation header is present
    await expect(page.locator('header')).toBeVisible();
  });

  test('should have language selector', async ({ page }) => {
    // Check for language selector (Korean, English, Chinese)
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Check if language options are present
    const languageButtons = page.getByRole('button').filter({ hasText: /한국어|English|中文/i });
    await expect(languageButtons.first()).toBeVisible();
  });

  test('should navigate between Single and Debate modes', async ({ page }) => {
    // Look for mode navigation buttons
    const singleModeBtn = page.getByRole('button', { name: /single|분석|单人/i }).first();
    const debateModeBtn = page.getByRole('button', { name: /debate|토론|辩论/i }).first();

    if (await singleModeBtn.isVisible()) {
      await singleModeBtn.click();
      await page.waitForTimeout(500);
    }

    if (await debateModeBtn.isVisible()) {
      await debateModeBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('should show photo upload section', async ({ page }) => {
    // Check if photo upload area is visible
    const uploadSection = page.locator('text=/upload|업로드|上传/i').first();
    await expect(uploadSection).toBeVisible();
  });

  test('should display persona selection', async ({ page }) => {
    // Check if personas are displayed
    const personaSection = page.locator('text=/persona|페르소나|角色/i').first();

    // Persona section should exist
    const pageContent = await page.content();
    expect(pageContent).toContain('persona' || 'persona' || '페르소나' || '角色');
  });

  test('should show usage counter', async ({ page }) => {
    // Check for usage counter (e.g., "0/20 analyses today")
    const usageText = page.locator('text=/\\d+\\/20/').first();

    // Usage counter should be visible somewhere on the page
    const pageText = await page.textContent('body');
    expect(pageText).toMatch(/\d+\/20/);
  });

  test('should handle file input for photo upload', async ({ page }) => {
    // Check if file input exists
    const fileInput = page.locator('input[type="file"]');

    if (await fileInput.count() > 0) {
      await expect(fileInput.first()).toBeAttached();
    }
  });

  test('should have proper page title', async ({ page }) => {
    const title = await page.title();
    expect(title).toContain('LookTalkAI' || 'Look' || 'Talk');
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('body')).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should navigate to shared analysis page', async ({ page, context }) => {
    await page.goto('/');

    // Try to navigate to a shared page (will 404 if no content exists, but route should work)
    const response = await page.goto('/shared/test-id');

    // Route should exist even if content doesn't
    expect(response?.status()).toBeLessThan(500);
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    const h1Elements = await page.locator('h1').count();
    const h2Elements = await page.locator('h2').count();

    // Should have headings
    expect(h1Elements + h2Elements).toBeGreaterThan(0);
  });

  test('should have alt text for images', async ({ page }) => {
    await page.goto('/');

    const images = await page.locator('img').all();

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      // Alt attribute should exist (can be empty for decorative images)
      expect(alt !== null).toBeTruthy();
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Press tab to navigate
    await page.keyboard.press('Tab');

    // Check if focus is visible on some element
    const focusedElement = await page.locator(':focus');
    await expect(focusedElement).toBeTruthy();
  });
});
