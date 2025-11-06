// Enhanced client-side Gemini integration with dynamic reactions based on input text
import type { CharacterId } from './characters'
import { detectLanguage } from './languageDetection'
import { withTimeout } from './utils'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent'

export interface GeminiOptions {
  character: CharacterId
  text: string
  mode: 'reaction'
  frequency: 'low' | 'medium' | 'high'
}

// Trump 캐릭터 기본 설정 (동적 반응 생성용)
const CHARACTER_BASE_PROMPTS = {
  trump: {
    english: {
      personality: "You are Donald Trump. Speak with confidence, use superlatives like 'tremendous', 'incredible', 'the best', mention winning, and occasionally reference deals or business. Be bold and enthusiastic.",
      style: "confident, bold, uses superlatives, mentions winning and deals",
      displayName: "Trump"
    },
    korean: {
      personality: "당신은 도널드 트럼프입니다. 자신감 있게 말하고, '엄청난', '믿을 수 없는', '최고의'와 같은 극찬을 사용하며, 승리와 거래에 대해 언급하세요. 대담하고 열정적으로 표현하세요.",
      style: "자신감 있고, 대담하며, 극찬을 사용하고, 승리와 거래를 언급",
      displayName: "트럼프"
    }
  }
}

export async function generateEnhancedScript(options: GeminiOptions): Promise<string> {
  console.log('🧠 Gemini API를 사용한 동적 반응 생성 시작...')
  console.log('입력 길이:', options.text.length)
  console.log('캐릭터:', options.character)
  console.log('빈도:', options.frequency)
  
  // 🔇 CRITICAL: 기존 음성 합성 중단
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel()
    console.log('🔇 스크립트 생성 전 음성 합성 중단됨')
  }
  
  // 🧹 CRITICAL: 입력 텍스트 완전 정리
  const superCleanText = superSanitizeInputText(options.text)
  console.log('🧹 슈퍼 정리된 입력 텍스트:', superCleanText.substring(0, 100) + '...')
  
  // 자동 언어 감지 (정리된 텍스트로)
  const detectedLanguage = detectLanguage(superCleanText)
  console.log('🔍 감지된 언어:', detectedLanguage.language)
  
  // Gemini API 사용 시도
  if (GEMINI_API_KEY && !GEMINI_API_KEY.includes('your_gemini_api_key_here')) {
    try {
      console.log('🧠 Gemini API 사용하여 동적 반응 생성...')
      const enhancedScript = await generateWithGeminiAPI(options, detectedLanguage.language, superCleanText)
      console.log('✅ Gemini API 동적 반응 생성 완료')
      return enhancedScript
    } catch (error) {
      console.error('❌ Gemini API 실패, 폴백 사용:', error)
    }
  } else {
    console.log('⚠️ Gemini API 키가 설정되지 않음, 폴백 사용')
  }
  
  // 폴백: 로컬 생성
  const enhancedScript = generateGuaranteedEnhancedScript({
    ...options,
    text: superCleanText
  }, detectedLanguage.language)
  
  console.log('✅ 폴백 스크립트 생성 완료 (길이:', enhancedScript.length, ')')
  return enhancedScript
}

// 🔥 NEW: Gemini API를 사용한 동적 반응 생성
async function generateWithGeminiAPI(options: GeminiOptions, detectedLanguage: string, cleanText: string): Promise<string> {
  const { character, frequency } = options
  
  // 언어에 따른 캐릭터 데이터 선택
  const languageKey = detectedLanguage.startsWith('ko') ? 'korean' : 'english'
  const characterData = CHARACTER_BASE_PROMPTS[character]?.[languageKey]
  
  if (!characterData) {
    throw new Error(`Unknown character: ${character}`)
  }

  // 빈도에 따른 지시사항
  const frequencyInstructions = {
    low: languageKey === 'korean' ? '1-2개의 짧은 반응' : '1-2 short reactions',
    medium: languageKey === 'korean' ? '3-4개의 적절한 반응' : '3-4 appropriate reactions',
    high: languageKey === 'korean' ? '5-6개의 활발한 반응' : '5-6 lively reactions'
  }

  // 🔥 NEW: 입력 텍스트 내용에 기반한 동적 반응 생성 프롬프트
  const prompt = languageKey === 'korean' 
    ? `당신은 ${characterData.displayName}입니다. ${characterData.personality}

과제: 다음 텍스트를 읽고, 텍스트의 내용과 맥락에 맞는 ${frequencyInstructions[frequency]}를 생성하세요.

중요한 규칙:
1. 원본 텍스트를 그대로 유지하세요
2. 텍스트의 내용, 감정, 주제에 맞는 반응을 생성하세요
3. ${characterData.style} 스타일을 유지하세요
4. 텍스트가 슬프면 공감하는 반응을, 기쁘면 축하하는 반응을, 놀라운 내용이면 감탄하는 반응을 하세요
5. 텍스트의 핵심 키워드나 주제에 대해 구체적으로 언급하세요
6. 반응은 짧고 강렬하게 만드세요 (각각 3-8단어)

원본 텍스트:
"${cleanText}"

다음 형식으로 응답하세요:
[원본 텍스트]

--- Character Reactions ---

${characterData.displayName}: "[텍스트 내용에 맞는 첫 번째 반응]"
${characterData.displayName}: "[텍스트 내용에 맞는 두 번째 반응]"
(필요한 만큼 반복)`
    : `You are ${characterData.displayName}. ${characterData.personality}

Task: Read the following text and generate ${frequencyInstructions[frequency]} that are specifically relevant to the content and context of the text.

Important rules:
1. Keep the original text intact
2. Generate reactions that match the content, emotion, and theme of the text
3. Maintain your ${characterData.style} style
4. If the text is sad, show empathy; if happy, celebrate; if surprising, show amazement
5. Reference specific keywords or themes from the text in your reactions
6. Keep reactions short and punchy (3-8 words each)

Original text:
"${cleanText}"

Respond in this format:
[Original text]

--- Character Reactions ---

${characterData.displayName}: "[First reaction relevant to text content]"
${characterData.displayName}: "[Second reaction relevant to text content]"
(repeat as needed)`

  console.log('🎯 동적 반응 생성 프롬프트:', prompt.substring(0, 200) + '...')

  const response = await withTimeout(
    fetch(`${GEMINI_BASE_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8, // 약간 낮춰서 더 일관된 반응 생성
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    }),
    30000, // 30초 타임아웃
    'Gemini API request timeout (30s)'
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gemini API error ${response.status}: ${errorText}`)
  }

  const data = await response.json()
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Invalid response from Gemini API')
  }

  const generatedScript = data.candidates[0].content.parts[0].text.trim()
  console.log('🎯 Gemini가 생성한 동적 반응:', generatedScript.substring(0, 200) + '...')
  
  return generatedScript
}

// 🧹 CRITICAL: 슈퍼 강력한 입력 텍스트 정리 함수
function superSanitizeInputText(text: string): string {
  console.log('🧹 슈퍼 강력한 입력 텍스트 완전 정리 시작...')
  
  let cleanText = text

  // 1. 모든 원하지 않는 구문 완전 제거
  const unwantedPhrases = [
    'character reaction come up',
    'exclamation point',
    'question mark',
    'asterisk',
    'dash dash dash',
    'dot dot',
    'period period',
    'comma comma',
    '느낌표',
    '물음표',
    '별표',
    'error',
    'undefined',
    'null'
  ]
  
  for (const phrase of unwantedPhrases) {
    const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    cleanText = cleanText.replace(regex, ' ')
  }

  // 2. 마크다운 및 특수 구문 제거
  cleanText = cleanText
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/\*\*\*([^*]+)\*\*\*/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/#{1,6}\s*/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')

  // 3. 특수문자를 자연스러운 텍스트로 변환
  cleanText = cleanText
    .replace(/[!?]/g, '.')
    .replace(/[;:]/g, '.')
    .replace(/[{}[\]()]/g, ' ')
    .replace(/["""'''`]/g, ' ')
    .replace(/[|\\\/]/g, ' ')
    .replace(/[@#$%^&*+=<>]/g, ' ')
    .replace(/[~]/g, ' ')
    .replace(/[-_]/g, ' ')

  // 4. 연속된 특수문자 및 공백 정리
  cleanText = cleanText
    .replace(/\.{2,}/g, '.')
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, ' ')
    .replace(/\r+/g, ' ')
    .replace(/\t+/g, ' ')

  // 5. 최종 정리
  cleanText = cleanText
    .replace(/^[.\s]+/, '')
    .replace(/[.\s]+$/, '.')
    .trim()

  if (!cleanText || cleanText.length < 3) {
    cleanText = '안녕하세요. 텍스트를 입력해주세요.'
  }

  console.log('🧹 슈퍼 강력한 입력 텍스트 정리 완료!')
  return cleanText
}

// 🔥 NEW: 폴백용 동적 반응 생성 (Gemini API 없을 때)
function generateGuaranteedEnhancedScript(options: GeminiOptions, detectedLanguage: string): string {
  console.log('🎭 폴백: 동적 반응 생성 시작...')
  
  const { text, character, frequency } = options
  
  // 언어 결정
  const languageKey = detectedLanguage.startsWith('ko') ? 'korean' : 'english'
  
  const characterData = CHARACTER_BASE_PROMPTS[character]?.[languageKey]
  if (!characterData) {
    console.warn(`알 수 없는 캐릭터: ${character}, 트럼프로 대체`)
    return generateGuaranteedEnhancedScript({ ...options, character: 'trump' }, detectedLanguage)
  }

  const displayName = characterData.displayName
  
  // 🔥 NEW: 텍스트 내용 분석하여 동적 반응 생성
  const dynamicReactions = generateContextualReactions(text, character, languageKey, frequency)
  
  // 빈도에 따른 보장된 반응 수 계산
  const reactionCounts = {
    low: Math.max(1, Math.min(2, dynamicReactions.length)),
    medium: Math.max(2, Math.min(4, dynamicReactions.length)),
    high: Math.max(2, Math.min(6, dynamicReactions.length))
  }
  
  const targetReactions = reactionCounts[frequency]
  
  // 원본 텍스트 유지하고 동적 반응 추가
  let result = text
  
  // 선택된 동적 반응들
  const selectedReactions = dynamicReactions.slice(0, targetReactions)
  
  // 반응을 아름다운 형식으로 추가
  if (selectedReactions.length > 0) {
    result += '\n\n--- Character Reactions ---\n'
    selectedReactions.forEach((reaction) => {
      result += `\n${displayName}: "${reaction}"`
    })
  }
  
  console.log(`🎉 폴백 동적 반응 생성 완료! 추가된 반응: ${selectedReactions.length}/${targetReactions}`)
  
  return result
}

// 🔥 NEW: 텍스트 내용에 기반한 맥락적 반응 생성
function generateContextualReactions(text: string, character: CharacterId, languageKey: string, frequency: string): string[] {
  console.log('🎯 텍스트 내용 분석하여 맥락적 반응 생성...')
  
  const lowerText = text.toLowerCase()
  const isKorean = languageKey === 'korean'
  
  // 텍스트 감정/주제 분석
  const emotions = analyzeTextEmotion(lowerText, isKorean)
  const topics = analyzeTextTopics(lowerText, isKorean)
  
  console.log('🔍 감지된 감정:', emotions)
  console.log('🔍 감지된 주제:', topics)
  
  // Trump 캐릭터의 맥락적 반응 생성
  const reactions: string[] = []
  
  // 감정 기반 반응
  if (emotions.includes('positive')) {
    reactions.push(isKorean ? '정말 환상적이야!' : 'Absolutely fantastic!')
    reactions.push(isKorean ? '이건 대단해!' : 'This is tremendous!')
  }
  
  if (emotions.includes('exciting')) {
    reactions.push(isKorean ? '믿을 수 없어!' : 'Unbelievable!')
    reactions.push(isKorean ? '완전 최고야!' : 'Totally the best!')
  }
  
  if (emotions.includes('surprising')) {
    reactions.push(isKorean ? '와우, 놀라워!' : 'Wow, incredible!')
    reactions.push(isKorean ? '정말 대박이네!' : 'Really amazing!')
  }
  
  if (emotions.includes('negative')) {
    reactions.push(isKorean ? '이건 안 좋아' : 'This is not good')
    reactions.push(isKorean ? '더 잘할 수 있어' : 'We can do better')
  }
  
  // 주제 기반 반응
  if (topics.includes('technology')) {
    reactions.push(isKorean ? '기술이 최고야!' : 'Technology is the best!')
    reactions.push(isKorean ? '혁신적이네!' : 'So innovative!')
  }
  
  if (topics.includes('business')) {
    reactions.push(isKorean ? '좋은 거래야!' : 'Great deal!')
    reactions.push(isKorean ? '비즈니스 천재!' : 'Business genius!')
  }
  
  if (topics.includes('success')) {
    reactions.push(isKorean ? '우리가 이기고 있어!' : 'We are winning!')
    reactions.push(isKorean ? '성공이야!' : 'Success!')
  }
  
  if (topics.includes('people')) {
    reactions.push(isKorean ? '사람들이 좋아해!' : 'People love it!')
    reactions.push(isKorean ? '모두가 인정해!' : 'Everyone agrees!')
  }
  
  // 기본 반응 (감정/주제가 명확하지 않을 때)
  if (reactions.length === 0) {
    const defaultReactions = isKorean 
      ? ['정말 좋네!', '흥미로워!', '멋져!', '훌륭해!', '완벽해!']
      : ['Really good!', 'Interesting!', 'Great!', 'Excellent!', 'Perfect!']
    reactions.push(...defaultReactions.slice(0, 3))
  }
  
  // 중복 제거 및 셔플
  const uniqueReactions = [...new Set(reactions)]
  return shuffleArray(uniqueReactions)
}

// 텍스트 감정 분석
function analyzeTextEmotion(text: string, isKorean: boolean): string[] {
  const emotions: string[] = []
  
  const positiveWords = isKorean 
    ? ['좋', '훌륭', '멋진', '완벽', '최고', '대단', '환상', '놀라운', '기쁜', '행복']
    : ['good', 'great', 'awesome', 'perfect', 'best', 'amazing', 'fantastic', 'wonderful', 'happy', 'excellent']
  
  const excitingWords = isKorean
    ? ['신나는', '흥미진진', '재미있는', '즐거운', '활기찬', '역동적']
    : ['exciting', 'thrilling', 'fun', 'enjoyable', 'energetic', 'dynamic']
  
  const surprisingWords = isKorean
    ? ['놀라운', '믿을 수 없는', '충격적인', '예상외의', '깜짝']
    : ['surprising', 'unbelievable', 'shocking', 'unexpected', 'wow']
  
  const negativeWords = isKorean
    ? ['나쁜', '안 좋은', '실망', '문제', '어려운', '힘든']
    : ['bad', 'terrible', 'disappointing', 'problem', 'difficult', 'hard']
  
  if (positiveWords.some(word => text.includes(word))) emotions.push('positive')
  if (excitingWords.some(word => text.includes(word))) emotions.push('exciting')
  if (surprisingWords.some(word => text.includes(word))) emotions.push('surprising')
  if (negativeWords.some(word => text.includes(word))) emotions.push('negative')
  
  return emotions
}

// 텍스트 주제 분석
function analyzeTextTopics(text: string, isKorean: boolean): string[] {
  const topics: string[] = []
  
  const techWords = isKorean
    ? ['기술', '컴퓨터', '인공지능', 'ai', '소프트웨어', '앱', '디지털', '혁신']
    : ['technology', 'computer', 'ai', 'artificial', 'software', 'app', 'digital', 'innovation']
  
  const businessWords = isKorean
    ? ['비즈니스', '사업', '회사', '거래', '투자', '수익', '성장', '시장']
    : ['business', 'company', 'deal', 'investment', 'profit', 'growth', 'market', 'trade']
  
  const successWords = isKorean
    ? ['성공', '승리', '이기', '달성', '목표', '성취', '우승']
    : ['success', 'win', 'victory', 'achieve', 'goal', 'accomplish', 'triumph']
  
  const peopleWords = isKorean
    ? ['사람', '사람들', '팀', '친구', '가족', '동료', '커뮤니티']
    : ['people', 'team', 'friends', 'family', 'colleagues', 'community', 'folks']
  
  if (techWords.some(word => text.includes(word))) topics.push('technology')
  if (businessWords.some(word => text.includes(word))) topics.push('business')
  if (successWords.some(word => text.includes(word))) topics.push('success')
  if (peopleWords.some(word => text.includes(word))) topics.push('people')
  
  return topics
}

// 배열 셔플 유틸리티
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}