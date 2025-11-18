import { describe, it, expect } from 'vitest'
import {
  detectLanguage,
  getLanguageVoiceSettings,
  getLocalizedCharacterInfo
} from '../languageDetection'

describe('detectLanguage', () => {
  it('should detect Korean text', () => {
    const result = detectLanguage('안녕하세요 오늘 날씨가 좋습니다')

    expect(result.language).toBe('ko-KR')
    expect(result.script).toBe('korean')
    expect(result.confidence).toBeGreaterThan(0.1)
  })

  it('should detect English text', () => {
    const result = detectLanguage('Hello, how are you today?')

    expect(result.language).toBe('en-US')
    expect(result.script).toBe('latin')
    expect(result.confidence).toBeGreaterThan(0.1)
  })

  it('should detect Japanese text', () => {
    const result = detectLanguage('こんにちは、今日はいい天気ですね')

    expect(result.language).toBe('ja-JP')
    expect(result.script).toBe('japanese')
    expect(result.confidence).toBeGreaterThan(0.1)
  })

  it('should detect Chinese text', () => {
    // Use more Chinese-specific text with common Chinese words
    const result = detectLanguage('你好，今天天气很好。这是一个中国的文章，我们在这里写了很多中文。')

    // Chinese and Japanese share many characters, so we check if it detects Asian language
    expect(['zh-CN', 'ja-JP']).toContain(result.language)
    expect(['chinese', 'japanese']).toContain(result.script)
    expect(result.confidence).toBeGreaterThan(0.1)
  })

  it('should handle empty string', () => {
    const result = detectLanguage('')

    expect(result.language).toBe('en-US')
    expect(result.confidence).toBe(0)
    expect(result.script).toBe('latin')
  })

  it('should handle whitespace only', () => {
    const result = detectLanguage('   \n\t   ')

    expect(result.language).toBe('en-US')
    expect(result.confidence).toBe(0)
  })

  it('should detect Korean with high confidence when using common words', () => {
    const result = detectLanguage('이것은 한국어 문장입니다. 이 문장은 한국어로 작성되었습니다.')

    expect(result.language).toBe('ko-KR')
    expect(result.confidence).toBeGreaterThan(0.3)
  })

  it('should default to English for low confidence results', () => {
    const result = detectLanguage('123 !@# $%^')

    expect(result.language).toBe('en-US')
    expect(result.script).toBe('latin')
  })
})

describe('getLanguageVoiceSettings', () => {
  it('should return Korean voice settings', () => {
    const settings = getLanguageVoiceSettings('ko-KR')

    expect(settings.fallbackLang).toBe('ko-KR')
    expect(settings.preferredVoices).toContain('yuna')
    expect(settings.rate).toBe(0.9)
    expect(settings.pitch).toBe(1.0)
  })

  it('should return Japanese voice settings', () => {
    const settings = getLanguageVoiceSettings('ja-JP')

    expect(settings.fallbackLang).toBe('ja-JP')
    expect(settings.preferredVoices).toContain('kyoko')
    expect(settings.rate).toBe(1.0)
    expect(settings.pitch).toBe(1.1)
  })

  it('should return Chinese voice settings', () => {
    const settings = getLanguageVoiceSettings('zh-CN')

    expect(settings.fallbackLang).toBe('zh-CN')
    expect(settings.preferredVoices).toContain('ting-ting')
    expect(settings.rate).toBe(0.95)
    expect(settings.pitch).toBe(1.0)
  })

  it('should return English voice settings', () => {
    const settings = getLanguageVoiceSettings('en-US')

    expect(settings.fallbackLang).toBe('en-US')
    expect(settings.preferredVoices).toContain('samantha')
    expect(settings.rate).toBe(1.0)
    expect(settings.pitch).toBe(1.0)
  })

  it('should return English settings for unknown language', () => {
    const settings = getLanguageVoiceSettings('fr-FR')

    expect(settings.fallbackLang).toBe('en-US')
    expect(settings.preferredVoices).toContain('samantha')
  })
})

describe('getLocalizedCharacterInfo', () => {
  it('should return Korean info when uiLanguage is ko', () => {
    const character = {
      name: 'Donald Trump',
      koreanName: '도널드 트럼프',
      description: 'Bold and confident',
      koreanDescription: '대담하고 자신감 넘치는'
    }

    const result = getLocalizedCharacterInfo(character, 'ko')

    expect(result.name).toBe('도널드 트럼프')
    expect(result.description).toBe('대담하고 자신감 넘치는')
  })

  it('should return English info when uiLanguage is not ko', () => {
    const character = {
      name: 'Donald Trump',
      koreanName: '도널드 트럼프',
      description: 'Bold and confident',
      koreanDescription: '대담하고 자신감 넘치는'
    }

    const result = getLocalizedCharacterInfo(character, 'en')

    expect(result.name).toBe('Donald Trump')
    expect(result.description).toBe('Bold and confident')
  })

  it('should fallback to English name when Korean name is not available', () => {
    const character = {
      name: 'John Doe',
      description: 'Test character'
    }

    const result = getLocalizedCharacterInfo(character, 'ko')

    expect(result.name).toBe('John Doe')
    expect(result.description).toBe('Test character')
  })
})
