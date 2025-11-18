import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

// Mock child components
vi.mock('../components/Header', () => ({
  Header: ({ selectedLanguage, onLanguageChange }: any) => (
    <div data-testid="header">
      Header - Language: {selectedLanguage}
      <button onClick={() => onLanguageChange('ko')}>Change to Korean</button>
    </div>
  )
}))

vi.mock('../components/PhotoAnalyzer', () => ({
  PhotoAnalyzer: ({ selectedLanguage }: any) => (
    <div data-testid="photo-analyzer">PhotoAnalyzer - {selectedLanguage}</div>
  )
}))

vi.mock('../components/DebateAnalyzer', () => ({
  DebateAnalyzer: ({ selectedLanguage }: any) => (
    <div data-testid="debate-analyzer">DebateAnalyzer - {selectedLanguage}</div>
  )
}))

vi.mock('../components/SharedAnalysis', () => ({
  SharedAnalysis: ({ selectedLanguage }: any) => (
    <div data-testid="shared-analysis">SharedAnalysis - {selectedLanguage}</div>
  )
}))

vi.mock('../components/PersonaRequestBoard', () => ({
  PersonaRequestBoard: ({ selectedLanguage }: any) => (
    <div data-testid="persona-request-board">PersonaRequestBoard - {selectedLanguage}</div>
  )
}))

vi.mock('../components/AuthCallback', () => ({
  default: () => <div data-testid="auth-callback">AuthCallback</div>
}))

vi.mock('../components/ToastProvider', () => ({
  ToastProvider: ({ children }: any) => <div>{children}</div>
}))

vi.mock('../components/BoltBadge', () => ({
  BoltBadge: () => <div data-testid="bolt-badge">BoltBadge</div>
}))

describe('App', () => {
  beforeEach(() => {
    // Mock localStorage
    const localStorageMock = {
      data: {} as Record<string, string>,
      getItem(key: string) {
        return this.data[key] || null
      },
      setItem(key: string, value: string) {
        this.data[key] = value
      },
      removeItem(key: string) {
        delete this.data[key]
      },
      clear() {
        this.data = {}
      }
    }

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    })

    // Clear localStorage before each test
    localStorage.clear()

    // Mock navigator.language and navigator.languages
    Object.defineProperty(window.navigator, 'language', {
      writable: true,
      value: 'en-US'
    })
    Object.defineProperty(window.navigator, 'languages', {
      writable: true,
      value: ['en-US', 'en']
    })
  })

  it('should render the app', () => {
    render(<App />)
    expect(screen.getByTestId('header')).toBeInTheDocument()
  })

  it('should detect browser language as English by default', () => {
    render(<App />)
    expect(screen.getByTestId('header')).toHaveTextContent('Language: en')
  })

  it('should detect Korean browser language', () => {
    Object.defineProperty(window.navigator, 'languages', {
      writable: true,
      value: ['ko-KR', 'ko', 'en-US']
    })

    render(<App />)
    expect(screen.getByTestId('header')).toHaveTextContent('Language: ko')
  })

  it('should use saved language preference from localStorage', () => {
    localStorage.setItem('preferred-language', 'zh')

    render(<App />)
    expect(screen.getByTestId('header')).toHaveTextContent('Language: zh')
  })

  it('should render footer with language-specific text', () => {
    render(<App />)
    expect(screen.getByText('AI creatively interprets your photos.')).toBeInTheDocument()
  })

  it('should render footer links', () => {
    render(<App />)
    expect(screen.getByText('Privacy')).toBeInTheDocument()
    expect(screen.getByText('Terms')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })

  it('should render BoltBadge in footer', () => {
    render(<App />)
    expect(screen.getByTestId('bolt-badge')).toBeInTheDocument()
  })

  it('should render PhotoAnalyzer on home route', () => {
    window.history.pushState({}, 'Home', '/')
    render(<App />)
    expect(screen.getByTestId('photo-analyzer')).toBeInTheDocument()
  })
})

describe('detectBrowserLanguage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should detect Korean from navigator.languages', () => {
    Object.defineProperty(window.navigator, 'languages', {
      writable: true,
      value: ['ko-KR', 'en-US']
    })

    render(<App />)
    expect(screen.getByTestId('header')).toHaveTextContent('Language: ko')
  })

  it('should detect Chinese from navigator.languages', () => {
    Object.defineProperty(window.navigator, 'languages', {
      writable: true,
      value: ['zh-CN', 'en-US']
    })

    render(<App />)
    expect(screen.getByTestId('header')).toHaveTextContent('Language: zh')
  })

  it('should fallback to English for unsupported languages', () => {
    Object.defineProperty(window.navigator, 'languages', {
      writable: true,
      value: ['fr-FR', 'de-DE']
    })

    render(<App />)
    expect(screen.getByTestId('header')).toHaveTextContent('Language: en')
  })

  it('should handle empty navigator.languages', () => {
    Object.defineProperty(window.navigator, 'languages', {
      writable: true,
      value: []
    })
    Object.defineProperty(window.navigator, 'language', {
      writable: true,
      value: 'en-US'
    })

    render(<App />)
    expect(screen.getByTestId('header')).toHaveTextContent('Language: en')
  })
})
