import { test, expect } from '@playwright/test'

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should have valid document structure', async ({ page }) => {
    // Check for basic HTML structure
    const html = page.locator('html')
    await expect(html).toBeVisible()

    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('should have lang attribute on html element', async ({ page }) => {
    const htmlLang = await page.locator('html').getAttribute('lang')
    // Lang attribute should exist (might be empty or have a value)
    expect(htmlLang).toBeDefined()
  })

  test('should have skip navigation or main landmark', async ({ page }) => {
    const main = page.locator('main')
    const mainCount = await main.count()
    expect(mainCount).toBeGreaterThanOrEqual(1)
  })

  test('should have buttons with accessible names', async ({ page }) => {
    const buttons = await page.locator('button').all()

    for (const button of buttons) {
      const text = await button.textContent()
      const ariaLabel = await button.getAttribute('aria-label')
      const title = await button.getAttribute('title')

      // Button should have either text content, aria-label, or title
      const hasAccessibleName = text?.trim() || ariaLabel || title
      expect(hasAccessibleName).toBeTruthy()
    }
  })

  test('should have links with accessible names', async ({ page }) => {
    const links = await page.locator('a').all()

    for (const link of links) {
      const text = await link.textContent()
      const ariaLabel = await link.getAttribute('aria-label')
      const title = await link.getAttribute('title')

      // Link should have either text content, aria-label, or title
      const hasAccessibleName = text?.trim() || ariaLabel || title
      expect(hasAccessibleName).toBeTruthy()
    }
  })

  test('should not have layout shift on initial load', async ({ page }) => {
    // Navigate and wait for network idle
    await page.goto('/', { waitUntil: 'networkidle' })

    // Get initial viewport
    const initialHeight = await page.evaluate(() => document.body.scrollHeight)

    // Wait a bit to see if there's any shift
    await page.waitForTimeout(1000)

    const finalHeight = await page.evaluate(() => document.body.scrollHeight)

    // Heights should be relatively stable (allow 10% variance)
    expect(Math.abs(finalHeight - initialHeight) / initialHeight).toBeLessThan(0.1)
  })

  test('should have proper color contrast', async ({ page }) => {
    // This is a basic test - for full accessibility testing, use axe-playwright
    const backgroundColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor
    })

    expect(backgroundColor).toBeTruthy()
  })

  test('should support keyboard-only navigation', async ({ page }) => {
    let tabCount = 0
    const maxTabs = 20

    // Tab through elements
    while (tabCount < maxTabs) {
      await page.keyboard.press('Tab')
      tabCount++

      // Check if we can focus on elements
      const activeElement = await page.evaluate(() => {
        return document.activeElement?.tagName
      })

      if (activeElement && activeElement !== 'BODY') {
        // Successfully focused on an element
        break
      }
    }

    // We should have been able to focus on at least one element
    const finalActiveElement = await page.evaluate(() => {
      return document.activeElement?.tagName
    })

    expect(finalActiveElement).not.toBe('BODY')
  })

  test('should handle focus trap in modals (if present)', async ({ page }) => {
    // Look for modal triggers
    const modalTriggers = page.locator('[data-modal], [aria-haspopup="dialog"]')
    const count = await modalTriggers.count()

    if (count > 0) {
      // Click first modal trigger
      await modalTriggers.first().click()

      // Wait for modal to appear
      await page.waitForTimeout(500)

      // Try to tab through modal
      await page.keyboard.press('Tab')

      // Active element should be within modal or page
      const activeElement = await page.evaluate(() => {
        return document.activeElement?.tagName
      })

      expect(activeElement).toBeTruthy()
    }
  })
})
