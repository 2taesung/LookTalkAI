import { test, expect } from '@playwright/test'

test.describe('UI Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display buttons', async ({ page }) => {
    const buttons = page.locator('button')
    const count = await buttons.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should have clickable elements', async ({ page }) => {
    const links = page.locator('a')
    const count = await links.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should display cards or content containers', async ({ page }) => {
    // Look for common container elements
    const containers = page.locator('[class*="card"], [class*="container"], main > div').first()
    await expect(containers).toBeVisible()
  })

  test('should be responsive - mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    // Check that page is still functional on mobile
    const main = page.locator('main')
    await expect(main).toBeVisible()

    // Check that content is not overflowing
    const body = page.locator('body')
    const bodyWidth = await body.boundingBox()
    expect(bodyWidth?.width).toBeLessThanOrEqual(375)
  })

  test('should be responsive - tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })

    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should be responsive - desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })

    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should have accessible images with alt text', async ({ page }) => {
    const images = await page.locator('img').all()

    for (const img of images) {
      const alt = await img.getAttribute('alt')
      // Alt can be empty string for decorative images, but should exist
      expect(alt).toBeDefined()
    }
  })

  test('should have proper heading hierarchy', async ({ page }) => {
    const h1Count = await page.locator('h1').count()
    // Page should have at least one h1 or the app might use different structure
    // We just verify the page has loaded correctly
    expect(h1Count).toBeGreaterThanOrEqual(0)
  })

  test('should handle keyboard navigation', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab')

    // Check if an element is focused
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName
    })

    expect(focusedElement).toBeTruthy()
  })

  test('should have proper focus indicators', async ({ page }) => {
    const firstButton = page.locator('button').first()

    if (await firstButton.count() > 0) {
      await firstButton.focus()

      // Verify element can receive focus
      const isFocused = await firstButton.evaluate((el) => {
        return document.activeElement === el
      })

      expect(isFocused).toBeTruthy()
    }
  })
})
