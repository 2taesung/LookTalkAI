import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should navigate to home page', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/')
  })

  test('should navigate to debate analyzer page', async ({ page }) => {
    await page.goto('/debate')
    await expect(page).toHaveURL('/debate')
  })

  test('should navigate to persona requests page', async ({ page }) => {
    await page.goto('/persona-requests')
    await expect(page).toHaveURL('/persona-requests')
  })

  test('should redirect /analyzer to home', async ({ page }) => {
    await page.goto('/analyzer')
    await expect(page).toHaveURL('/')
  })

  test('should redirect unknown routes to home', async ({ page }) => {
    await page.goto('/unknown-route-12345')
    await expect(page).toHaveURL('/')
  })

  test('should handle navigation between pages', async ({ page }) => {
    // Start at home
    await page.goto('/')
    await expect(page).toHaveURL('/')

    // Navigate to debate
    await page.goto('/debate')
    await expect(page).toHaveURL('/debate')

    // Navigate to persona requests
    await page.goto('/persona-requests')
    await expect(page).toHaveURL('/persona-requests')

    // Navigate back to home
    await page.goto('/')
    await expect(page).toHaveURL('/')
  })
})
