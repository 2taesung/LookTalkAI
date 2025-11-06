# Testing Guide for LookTalkAI

This document provides comprehensive information about testing in the LookTalkAI project.

## Testing Stack

- **Vitest**: Fast unit test framework with native ESM support
- **React Testing Library**: Component testing with user-centric approach
- **Playwright**: End-to-end testing for real browser scenarios
- **jsdom**: Browser environment simulation for unit tests

## Test Structure

```
LookTalkAI/
├── src/
│   ├── components/
│   │   └── ui/
│   │       └── Button.test.tsx          # Component tests
│   ├── lib/
│   │   ├── utils.test.ts                # Utility function tests
│   │   └── supabaseActions.test.ts      # Service layer tests
│   └── test/
│       └── setup.ts                      # Test setup and configuration
├── e2e/
│   └── app.spec.ts                       # E2E tests with Playwright
├── vitest.config.ts                      # Vitest configuration
└── playwright.config.ts                  # Playwright configuration
```

## Running Tests

### Unit & Integration Tests (Vitest)

```bash
# Run all tests once
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### End-to-End Tests (Playwright)

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI mode (interactive)
npm run test:e2e:ui

# Debug E2E tests
npm run test:e2e:debug
```

## Test Coverage

Current test coverage includes:

### 1. Utility Functions (`src/lib/utils.test.ts`)
- ✅ `parseReactionsFromScript` - Parsing character reactions from scripts
- ✅ `withTimeout` - Timeout wrapper for promises

### 2. Service Functions (`src/lib/supabaseActions.test.ts`)
- ✅ `createShareableContent` - Creating shareable content in database
  - Success cases
  - Error handling
  - Validation

### 3. UI Components (`src/components/ui/Button.test.tsx`)
- ✅ Button component
  - Rendering
  - Click handlers
  - Variants (primary, secondary, outline, ghost)
  - Sizes (sm, md, lg)
  - States (disabled, loading)
  - Accessibility

### 4. E2E Tests (`e2e/app.spec.ts`)
- ✅ Homepage rendering
- ✅ Language selector
- ✅ Navigation between modes
- ✅ Photo upload functionality
- ✅ Persona selection
- ✅ Usage counter
- ✅ Responsive design
- ✅ Accessibility features

## Writing New Tests

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './myModule';

describe('myFunction', () => {
  it('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });
});
```

### Component Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render and respond to clicks', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('should navigate to page', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});
```

## Best Practices

### Unit Tests
1. Test one thing at a time
2. Use descriptive test names
3. Mock external dependencies
4. Test edge cases and error scenarios
5. Keep tests isolated and independent

### Component Tests
1. Test user interactions, not implementation details
2. Query by role, label, or text (avoid test IDs when possible)
3. Test accessibility
4. Mock complex dependencies (APIs, external libraries)
5. Use `userEvent` for realistic user interactions

### E2E Tests
1. Test critical user flows
2. Keep tests stable and reliable
3. Use data-testid for complex selectors
4. Test across different viewports
5. Mock external APIs when necessary

## Continuous Integration

Tests should be run in CI/CD pipeline before merging:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: |
    npm run test -- --run
    npm run test:e2e
```

## Debugging Tests

### Vitest
```bash
# Run specific test file
npm run test src/lib/utils.test.ts

# Run tests matching pattern
npm run test -- --grep "withTimeout"

# Debug with Node inspector
node --inspect-brk ./node_modules/vitest/vitest.mjs
```

### Playwright
```bash
# Run with headed browser
npm run test:e2e -- --headed

# Debug specific test
npm run test:e2e:debug -- app.spec.ts

# Generate test report
npx playwright show-report
```

## Coverage Reports

After running `npm run test:coverage`, view the HTML report:

```bash
open coverage/index.html
```

Coverage thresholds can be configured in `vite.config.ts`.

## Troubleshooting

### Common Issues

**Issue**: Tests timeout
- **Solution**: Increase timeout in test configuration or check for async issues

**Issue**: Component tests fail with "not wrapped in act()"
- **Solution**: Use `waitFor` or `findBy` queries for async operations

**Issue**: E2E tests are flaky
- **Solution**: Add proper waits, increase stability with `waitForLoadState`

**Issue**: Mock not working
- **Solution**: Ensure mocks are set up before importing the module under test

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
