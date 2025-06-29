// 자동 언어 감지 유틸리티
export interface LanguageDetectionResult {
  language: string
  confidence: number
  script: 'latin' | 'korean' | 'japanese' | 'chinese' | 'mixed'
}

// 언어별 특성 패턴
const LANGUAGE_PATTERNS = {
  korean: {
    // 한글 유니코드 범위
    regex: /[\u3131-\u3163\uac00-\ud7a3]/g,
    commonWords: ['이', '그', '저', '의', '를', '을', '가', '는', '은', '에', '와', '과', '로', '으로', '입니다', '습니다', '있다', '없다', '하다', '되다'],
    particles: ['이', '가', '을', '를', '의', '에', '와', '과', '로', '으로', '는', '은', '도', '만', '부터', '까지']
  },
  japanese: {
    regex: /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g,
    commonWords: ['です', 'である', 'します', 'ます', 'だった', 'でした', 'という', 'として', 'について', 'による'],
    particles: ['は', 'が', 'を', 'に', 'で', 'と', 'から', 'まで', 'より', 'へ', 'の', 'も', 'だけ', 'しか']
  },
  chinese: {
    regex: /[\u4e00-\u9fff]/g,
    commonWords: ['的', '了', '在', '是', '我', '有', '他', '这', '个', '们', '中', '来', '上', '大', '为', '和', '国', '地', '以', '人'],
    particles: ['的', '了', '在', '是', '和', '与', '或', '但', '而', '所以', '因为', '如果', '虽然', '然而']
  },
  english: {
    regex: /[a-zA-Z]/g,
    commonWords: ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at'],
    particles: ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']
  }
}

export function detectLanguage(text: string): LanguageDetectionResult {
  console.log('🔍 언어 감지 시작:', text.substring(0, 100) + '...')
  
  if (!text || text.trim().length === 0) {
    return { language: 'en-US', confidence: 0, script: 'latin' }
  }

  const cleanText = text.toLowerCase().trim()
  const scores: Record<string, number> = {}
  
  // 1. 문자 기반 스코어링
  for (const [lang, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
    const matches = cleanText.match(pattern.regex)
    const charScore = matches ? matches.length / cleanText.length : 0
    scores[lang] = charScore * 0.6 // 문자 패턴 가중치 60%
    
    console.log(`📊 ${lang} 문자 스코어:`, charScore.toFixed(3))
  }

  // 2. 일반적인 단어 기반 스코어링
  for (const [lang, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
    let wordScore = 0
    const words = cleanText.split(/\s+/)
    
    for (const word of pattern.commonWords) {
      if (cleanText.includes(word)) {
        wordScore += 1
      }
    }
    
    wordScore = wordScore / Math.max(words.length, 1)
    scores[lang] += wordScore * 0.4 // 단어 패턴 가중치 40%
    
    console.log(`📝 ${lang} 단어 스코어:`, wordScore.toFixed(3))
  }

  // 3. 최고 점수 언어 찾기
  const sortedScores = Object.entries(scores)
    .sort(([,a], [,b]) => b - a)
    .map(([lang, score]) => ({ lang, score }))

  console.log('🏆 언어 감지 결과:', sortedScores)

  const topLanguage = sortedScores[0]
  const confidence = topLanguage.score

  // 4. 언어 코드 및 스크립트 매핑
  const languageMapping: Record<string, { code: string; script: LanguageDetectionResult['script'] }> = {
    korean: { code: 'ko-KR', script: 'korean' },
    japanese: { code: 'ja-JP', script: 'japanese' },
    chinese: { code: 'zh-CN', script: 'chinese' },
    english: { code: 'en-US', script: 'latin' }
  }

  const detected = languageMapping[topLanguage.lang] || { code: 'en-US', script: 'latin' }
  
  // 5. 신뢰도가 낮으면 영어로 기본 설정
  const finalLanguage = confidence > 0.1 ? detected.code : 'en-US'
  const finalScript = confidence > 0.1 ? detected.script : 'latin'

  console.log('✅ 최종 언어 감지:', {
    language: finalLanguage,
    confidence: confidence.toFixed(3),
    script: finalScript
  })

  return {
    language: finalLanguage,
    confidence,
    script: finalScript
  }
}

// 언어별 음성 설정
export function getLanguageVoiceSettings(language: string) {
  const settings = {
    'ko-KR': {
      preferredVoices: ['yuna', 'korean', 'ko-kr', 'heami'],
      fallbackLang: 'ko-KR',
      rate: 0.9,
      pitch: 1.0
    },
    'ja-JP': {
      preferredVoices: ['kyoko', 'japanese', 'ja-jp', 'otoya'],
      fallbackLang: 'ja-JP',
      rate: 1.0,
      pitch: 1.1
    },
    'zh-CN': {
      preferredVoices: ['ting-ting', 'chinese', 'zh-cn', 'yaoyao'],
      fallbackLang: 'zh-CN',
      rate: 0.95,
      pitch: 1.0
    },
    'en-US': {
      preferredVoices: ['samantha', 'alex', 'david', 'zira'],
      fallbackLang: 'en-US',
      rate: 1.0,
      pitch: 1.0
    }
  }

  return settings[language as keyof typeof settings] || settings['en-US']
}

// UI 언어별 캐릭터 이름 및 설명 가져오기
export function getLocalizedCharacterInfo(character: any, uiLanguage: string) {
  if (uiLanguage === 'ko') {
    return {
      name: character.koreanName || character.name,
      description: character.koreanDescription || character.description
    }
  }
  
  // 일본어, 중국어는 추후 추가 가능
  return {
    name: character.name,
    description: character.description
  }
}