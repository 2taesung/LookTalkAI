# Testing Guide

This project includes comprehensive unit tests and end-to-end (E2E) tests to ensure code quality and functionality.

## Test Structure

```
LookTalkAI/
├── src/
│   ├── __tests__/              # Component tests
│   │   └── App.test.tsx
│   ├── components/
│   │   └── ui/
│   │       └── __tests__/       # UI component tests
│   │           └── Button.test.tsx
│   ├── lib/
│   │   └── __tests__/           # Unit tests for utilities
│   │       ├── characters.test.ts
│   │       ├── languageDetection.test.ts
│   │       └── utils.test.ts
│   └── test/
│       └── setup.ts             # Test setup and configuration
├── e2e/                         # Playwright E2E tests
│   ├── accessibility.spec.ts
│   ├── home.spec.ts
│   ├── language.spec.ts
│   ├── navigation.spec.ts
│   └── ui-interactions.spec.ts
├── vitest.config.ts             # Vitest configuration
└── playwright.config.ts         # Playwright configuration
```

## Technologies Used

- **Unit Testing**: [Vitest](https://vitest.dev/) - Fast unit test framework powered by Vite
- **Component Testing**: [@testing-library/react](https://testing-library.com/react) - Testing utilities for React components
- **E2E Testing**: [Playwright](https://playwright.dev/) - Reliable end-to-end testing for modern web apps

## Running Tests

### Unit Tests

Run all unit tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm test
```

Run tests once (CI mode):
```bash
npm run test:run
```

Run tests with UI:
```bash
npm run test:ui
```

Run tests with coverage:
```bash
npm run test:coverage
```

### E2E Tests

First, install Playwright browsers (one-time setup):
```bash
npm run playwright:install
```

Run all E2E tests:
```bash
npm run test:e2e
```

Run E2E tests with UI mode:
```bash
npm run test:e2e:ui
```

Run E2E tests in headed mode (see browser):
```bash
npm run test:e2e:headed
```

Debug E2E tests:
```bash
npm run test:e2e:debug
```

### Run All Tests

Run both unit and E2E tests:
```bash
npm run test:all
```

## Test Coverage

### Unit Tests

The unit tests cover:

1. **Utility Functions** (`src/lib/__tests__/`)
   - `utils.test.ts`: Tests for `parseReactionsFromScript` function
   - `languageDetection.test.ts`: Tests for language detection, voice settings, and localization
   - `characters.test.ts`: Tests for character data validation

2. **UI Components** (`src/components/ui/__tests__/`)
   - `Button.test.tsx`: Tests for Button component variants, sizes, states, and interactions

3. **App Component** (`src/__tests__/`)
   - `App.test.tsx`: Tests for browser language detection, routing, and main app functionality

### E2E Tests

The E2E tests cover:

1. **Home Page** (`e2e/home.spec.ts`)
   - Page loading and rendering
   - Header and footer display
   - Responsive layout

2. **Navigation** (`e2e/navigation.spec.ts`)
   - Route navigation
   - URL redirects
   - Page transitions

3. **Language Switching** (`e2e/language.spec.ts`)
   - Browser language detection
   - Language preference persistence
   - Multi-language support

4. **UI Interactions** (`e2e/ui-interactions.spec.ts`)
   - Button clicks
   - Responsive design
   - Keyboard navigation

5. **Accessibility** (`e2e/accessibility.spec.ts`)
   - Document structure
   - ARIA attributes
   - Keyboard navigation
   - Focus management

## Writing New Tests

### Unit Tests

Create test files next to the source code with the naming convention `*.test.ts` or `*.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest'

describe('MyFunction', () => {
  it('should do something', () => {
    expect(myFunction()).toBe(expectedResult)
  })
})
```

### Component Tests

Use React Testing Library for component tests:

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('should render', () => {
    render(<MyComponent />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should handle clicks', async () => {
    const user = userEvent.setup()
    render(<MyComponent />)
    await user.click(screen.getByRole('button'))
    // Assert expected behavior
  })
})
```

### E2E Tests

Create Playwright tests in the `e2e/` directory:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
  })
})
```

## Continuous Integration

In CI environments:
- Unit tests run with `npm run test:run`
- E2E tests run with `npm run test:e2e`
- All tests can be run with `npm run test:all`

## Debugging Tests

### Unit Tests

Use the Vitest UI for interactive debugging:
```bash
npm run test:ui
```

Or add `console.log()` statements and run:
```bash
npm run test:run
```

### E2E Tests

Use Playwright's debug mode:
```bash
npm run test:e2e:debug
```

This opens the Playwright Inspector where you can step through tests.

## Best Practices

1. **Keep tests focused**: Each test should verify one specific behavior
2. **Use descriptive names**: Test names should clearly describe what they test
3. **Avoid test interdependence**: Tests should be able to run independently
4. **Mock external dependencies**: Use mocks for APIs, databases, etc.
5. **Test user behavior**: Focus on testing what users see and do
6. **Maintain tests**: Update tests when code changes

## Troubleshooting

### Common Issues

**Issue**: Tests fail with "Cannot find module" errors
- **Solution**: Ensure all dependencies are installed with `npm install`

**Issue**: Playwright tests fail to start
- **Solution**: Install browsers with `npm run playwright:install`

**Issue**: Tests timeout
- **Solution**: Increase timeout in test configuration or use `test.setTimeout()`

**Issue**: Flaky E2E tests
- **Solution**: Add proper wait conditions using `waitFor` or `expect` with retry logic

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
