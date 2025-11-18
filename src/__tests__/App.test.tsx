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

  it('should handle language change', async () => {
    const { getByText, rerender } = render(<App />)

    // Initially English
    expect(screen.getByTestId('header')).toHaveTextContent('Language: en')

    // Click button to change language to Korean
    const button = getByText('Change to Korean')
    button.click()

    // Wait for state update
    await new Promise(resolve => setTimeout(resolve, 0))

    // localStorage should be updated
    expect(localStorage.getItem('preferred-language')).toBe('ko')
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

  it('should handle undefined navigator.languages', () => {
    Object.defineProperty(window.navigator, 'languages', {
      writable: true,
      value: undefined
    })
    Object.defineProperty(window.navigator, 'language', {
      writable: true,
      value: 'ko-KR'
    })

    render(<App />)
    expect(screen.getByTestId('header')).toHaveTextContent('Language: ko')
  })

  it('should render Chinese footer text', () => {
    Object.defineProperty(window.navigator, 'languages', {
      writable: true,
      value: ['zh-CN']
    })

    render(<App />)
    expect(screen.getByText('AI创造性地解释您的照片。')).toBeInTheDocument()
    expect(screen.getByText('隐私')).toBeInTheDocument()
    expect(screen.getByText('条款')).toBeInTheDocument()
    expect(screen.getByText('联系')).toBeInTheDocument()
  })

  it('should render Korean footer text', () => {
    Object.defineProperty(window.navigator, 'languages', {
      writable: true,
      value: ['ko-KR']
    })

    render(<App />)
    expect(screen.getByText('AI가 당신의 사진을 창의적으로 해석합니다.')).toBeInTheDocument()
    expect(screen.getByText('개인정보')).toBeInTheDocument()
    expect(screen.getByText('이용약관')).toBeInTheDocument()
    expect(screen.getByText('문의')).toBeInTheDocument()
  })

  it('should render fallback text for unsupported language', () => {
    // Set an unsupported language that doesn't match ko, en, or zh
    // And make sure navigator.languages is also set to unsupported language
    Object.defineProperty(window.navigator, 'languages', {
      writable: true,
      value: ['ja-JP']
    })

    localStorage.setItem('preferred-language', 'ja')

    render(<App />)
    // Should render English fallback because 'ja' is not in supported languages
    // and browser language detection will fallback to English
    expect(screen.getByText('AI creatively interprets your photos.')).toBeInTheDocument()
    expect(screen.getByText('Privacy')).toBeInTheDocument()
    expect(screen.getByText('Terms')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })
})
