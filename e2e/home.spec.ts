import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load the home page', async ({ page }) => {
    await expect(page).toHaveTitle(/LookTalkAI/i)
  })

  test('should display header', async ({ page }) => {
    const header = page.locator('header, nav').first()
    await expect(header).toBeVisible()
  })

  test('should display footer', async ({ page }) => {
    await expect(page.getByText(/AI creatively interprets your photos/i).or(
      page.getByText(/AI가 당신의 사진을 창의적으로 해석합니다/i)
    )).toBeVisible()
  })

  test('should display footer links', async ({ page }) => {
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()

    // Check for Privacy, Terms, Contact links (in any language)
    const links = await footer.locator('a').all()
    expect(links.length).toBeGreaterThanOrEqual(3)
  })

  test('should display main content area', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should have responsive layout on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    const main = page.locator('main')
    await expect(main).toBeVisible()
  })
})
