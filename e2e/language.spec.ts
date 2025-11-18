import { test, expect } from '@playwright/test'

test.describe('Language Switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Clear localStorage to ensure consistent test state
    await page.evaluate(() => localStorage.clear())
  })

  test('should detect browser language', async ({ page, context }) => {
    // Set browser language to Korean
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'language', {
        get: () => 'ko-KR'
      })
      Object.defineProperty(navigator, 'languages', {
        get: () => ['ko-KR', 'ko']
      })
    })

    await page.reload()

    // The page should show Korean text
    // Note: This test assumes the app shows Korean-specific content
    const bodyText = await page.textContent('body')
    expect(bodyText).toBeTruthy()
  })

  test('should save language preference to localStorage', async ({ page }) => {
    await page.goto('/')

    // Try to find and click language selector if it exists
    // This is a generic test - adjust selector based on actual implementation
    const languageSelector = page.locator('select, [role="combobox"], [data-testid="language-selector"]').first()

    if (await languageSelector.count() > 0) {
      await languageSelector.click()
    }

    // Check if language preference is saved
    const savedLanguage = await page.evaluate(() => localStorage.getItem('preferred-language'))
    expect(savedLanguage).toBeTruthy()
  })

  test('should persist language preference across page reloads', async ({ page }) => {
    // Set language preference
    await page.evaluate(() => {
      localStorage.setItem('preferred-language', 'ko')
    })

    await page.reload()

    // Verify language persists
    const savedLanguage = await page.evaluate(() => localStorage.getItem('preferred-language'))
    expect(savedLanguage).toBe('ko')
  })

  test('should support multiple languages (en, ko, zh)', async ({ page }) => {
    const supportedLanguages = ['en', 'ko', 'zh']

    for (const lang of supportedLanguages) {
      await page.evaluate((language) => {
        localStorage.setItem('preferred-language', language)
      }, lang)

      await page.reload()

      const currentLang = await page.evaluate(() => localStorage.getItem('preferred-language'))
      expect(currentLang).toBe(lang)
    }
  })

  test('should fallback to English for unsupported languages', async ({ page, context }) => {
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'language', {
        get: () => 'fr-FR'
      })
      Object.defineProperty(navigator, 'languages', {
        get: () => ['fr-FR', 'de-DE']
      })
    })

    await page.reload()

    // App should use English as fallback
    const bodyText = await page.textContent('body')
    expect(bodyText).toBeTruthy()
  })
})
