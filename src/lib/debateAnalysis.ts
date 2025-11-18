import type { PersonaId } from './personas'
import { synthesizeVoice } from './audioSynthesis'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_VISION_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

export interface DebateAnalysisOptions {
  persona1: PersonaId
  persona2: PersonaId
  imageData: string // base64 encoded image
  language?: string
}

export interface DebateResult {
  id: string
  script: string
  audioUrl?: string
  audioBlob?: Blob
  persona1: PersonaId
  persona2: PersonaId
  timestamp: number
}

// 개발 모드 감지 함수
function isTestingMode(): boolean {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isLocalhost = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
     window.location.hostname === '127.0.0.1' ||
     window.location.hostname.includes('localhost'))
  return isDevelopment || isLocalhost
}

export async function analyzePhotoDebate(options: DebateAnalysisOptions): Promise<DebateResult> {
  console.log('🎭 AI 사진 토론 분석 시작...')
  console.log('페르소나 1:', options.persona1)
  console.log('페르소나 2:', options.persona2)
  console.log('언어:', options.language)
  
  try {
    // 1. 이미지 기반 순차적 토론 스크립트 생성
    const script = await generateImageBasedDebateScript(options)
    
    // 2. 순차적 음성 생성 및 믹싱
    console.log('🎤 순차적 음성 생성 및 믹싱 시작...')
    const mixedAudio = await generateSequentialDebateAudio(script, options.persona1, options.persona2)
    
    const debateId = `debate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // 3. 사용량 증가 (테스트 모드가 아닐 때만)
    if (!isTestingMode()) {
      incrementGuestUsage()
    }
    
    console.log('✅ 사진 토론 분석 및 음성 합성 완료!')
    
    return {
      id: debateId,
      script,
      audioUrl: mixedAudio.audioUrl,
      audioBlob: mixedAudio.audioBlob,
      persona1: options.persona1,
      persona2: options.persona2,
      timestamp: Date.now()
    }
    
  } catch (error) {
    console.error('❌ 사진 토론 분석 실패:', error)
    throw new Error(`사진 토론 분석 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
  }
}

/**
 * 이미지 기반 순차적 토론 스크립트 생성
 * 실제 이미지 내용을 분석하여 그에 대해 토론하도록 개선
 */
async function generateImageBasedDebateScript(options: DebateAnalysisOptions): Promise<string> {
  const { persona1, persona2, imageData, language = 'ko' } = options
  
  console.log('🔄 이미지 기반 순차적 토론 스크립트 생성 시작...')
  
  // 먼저 이미지를 분석하여 토론 주제 파악
  const imageAnalysis = await analyzeImageForDebate(imageData, language)
  console.log('📸 이미지 분석 결과:', imageAnalysis.substring(0, 200) + '...')
  
  let conversationHistory = ''
  const rounds = 3 // 총 3라운드 (각 페르소나가 3번씩 발언)
  
  for (let round = 1; round <= rounds; round++) {
    console.log(`📝 라운드 ${round} 시작...`)
    
    // A 페르소나 발언 생성 (이미지 분석 결과 포함)
    console.log(`🎭 ${persona1} 발언 생성 중...`)
    const persona1Response = await generatePersonaResponse({
      persona: persona1,
      imageData,
      imageAnalysis,
      language,
      conversationHistory,
      round,
      isFirstSpeaker: true,
      opponentPersona: persona2
    })
    
    conversationHistory += `\n\n${getPersonaDisplayName(persona1, language)}: ${persona1Response}`
    
    // B 페르소나 발언 생성 (A의 발언을 포함한 히스토리 사용)
    console.log(`🎭 ${persona2} 발언 생성 중...`)
    const persona2Response = await generatePersonaResponse({
      persona: persona2,
      imageData,
      imageAnalysis,
      language,
      conversationHistory,
      round,
      isFirstSpeaker: false,
      opponentPersona: persona1
    })
    
    conversationHistory += `\n\n${getPersonaDisplayName(persona2, language)}: ${persona2Response}`
    
    console.log(`✅ 라운드 ${round} 완료`)
  }
  
  console.log('✅ 이미지 기반 순차적 토론 스크립트 생성 완료')
  return conversationHistory.trim()
}

/**
 * 이미지 분석하여 토론 주제 파악
 */
async function analyzeImageForDebate(imageData: string, language: string): Promise<string> {
  const prompt = createImageAnalysisPrompt(language)
  
  if (GEMINI_API_KEY && !GEMINI_API_KEY.includes('your_gemini_api_key_here')) {
    try {
      console.log('🧠 Gemini Vision API 사용하여 이미지 분석...')
      return await callGeminiVisionAPI(prompt, imageData)
    } catch (error) {
      console.error('❌ Gemini API 실패, 폴백 사용:', error)
    }
  }
  
  // 폴백: 일반적인 이미지 분석
  return generateFallbackImageAnalysis(language)
}

/**
 * 이미지 분석용 프롬프트 생성
 */
function createImageAnalysisPrompt(language: string): string {
  if (language === 'ko') {
    return `이 사진을 자세히 분석해주세요. 다음 요소들을 포함하여 객관적으로 설명해주세요:

1. 주요 피사체와 구성 요소
2. 배경과 환경
3. 색상과 조명
4. 분위기와 감정
5. 스타일과 특징
6. 눈에 띄는 세부사항

이 분석은 두 AI 페르소나가 토론할 기초 자료로 사용됩니다. 
약 150-200단어로 구체적이고 상세하게 작성해주세요.`
  } else {
    return `Please analyze this photo in detail. Include the following elements in your objective description:

1. Main subjects and composition elements
2. Background and environment
3. Colors and lighting
4. Mood and emotions
5. Style and characteristics
6. Notable details

This analysis will be used as foundation material for two AI personas to debate about.
Write about 150-200 words with specific and detailed observations.`
  }
}

/**
 * 개별 페르소나 응답 생성 (이미지 분석 포함)
 */
async function generatePersonaResponse(params: {
  persona: PersonaId
  imageData: string
  imageAnalysis: string
  language: string
  conversationHistory: string
  round: number
  isFirstSpeaker: boolean
  opponentPersona: PersonaId
}): Promise<string> {
  
  const prompt = createPersonaResponsePrompt(params)
  
  if (GEMINI_API_KEY && !GEMINI_API_KEY.includes('your_gemini_api_key_here')) {
    try {
      console.log(`🧠 Gemini API 사용하여 ${params.persona} 응답 생성...`)
      return await callGeminiVisionAPI(prompt, params.imageData)
    } catch (error) {
      console.error('❌ Gemini API 실패, 폴백 사용:', error)
    }
  }
  
  // 폴백: 미리 정의된 응답
  return generateFallbackResponse(params)
}

/**
 * 페르소나별 응답 생성 프롬프트 생성 (이미지 분석 포함)
 */
function createPersonaResponsePrompt(params: {
  persona: PersonaId
  imageAnalysis: string
  language: string
  conversationHistory: string
  round: number
  isFirstSpeaker: boolean
  opponentPersona: PersonaId
}): string {
  
  const personaName = getPersonaDisplayName(params.persona, params.language)
  const opponentName = getPersonaDisplayName(params.opponentPersona, params.language)
  
  if (params.language === 'ko') {
    if (params.isFirstSpeaker && params.round === 1) {
      // 첫 번째 발언 (이미지 분석 기반)
      return `당신은 ${personaName}입니다. 다음은 이 사진에 대한 객관적 분석입니다:

${params.imageAnalysis}

위 분석을 바탕으로 당신의 관점에서 이 사진에 대한 첫 번째 의견을 제시해주세요.

${getPersonaCharacteristics(params.persona, 'ko')}

이 사진의 구체적인 요소들(색상, 구도, 피사체, 분위기 등)을 언급하며 분석해주세요.
- 60-90단어 정도로 작성
- 자연스러운 말하기 형태로 작성
- 당신의 고유한 성격과 말투를 반영
- 사진의 구체적인 내용에 대해 언급`
    } else if (params.isFirstSpeaker) {
      // A 페르소나의 후속 발언
      return `당신은 ${personaName}입니다. 

이미지 분석: ${params.imageAnalysis}

지금까지의 대화:
${params.conversationHistory}

${opponentName}의 의견을 듣고 이 사진에 대한 당신의 추가 의견이나 반박을 제시해주세요.
- 60-90단어 정도로 작성
- 상대방의 의견에 구체적으로 반응
- 사진의 다른 측면이나 세부사항 언급
- 당신의 고유한 성격과 말투를 유지`
    } else {
      // B 페르소나의 응답
      return `당신은 ${personaName}입니다.

이미지 분석: ${params.imageAnalysis}

지금까지의 대화:
${params.conversationHistory}

${opponentName}의 의견에 대해 이 사진을 바탕으로 당신의 관점에서 응답해주세요.
- 60-90단어 정도로 작성
- 상대방의 의견에 구체적으로 반응하거나 다른 관점 제시
- 사진의 구체적인 요소들을 언급
- 당신의 고유한 성격과 말투를 반영`
    }
  } else {
    if (params.isFirstSpeaker && params.round === 1) {
      return `You are ${personaName}. Here is an objective analysis of this photo:

${params.imageAnalysis}

Based on this analysis, please provide your first opinion about this photo from your perspective.

${getPersonaCharacteristics(params.persona, 'en')}

Please mention specific elements of the photo (colors, composition, subjects, mood, etc.) in your analysis.
- Write about 60-90 words
- Write in natural speaking form
- Reflect your unique personality and speaking style
- Reference specific content from the photo`
    } else if (params.isFirstSpeaker) {
      return `You are ${personaName}.

Image analysis: ${params.imageAnalysis}

Conversation so far:
${params.conversationHistory}

After hearing ${opponentName}'s opinion, please provide your additional thoughts or counterargument about this photo.
- Write about 60-90 words
- Respond specifically to the opponent's opinion
- Mention different aspects or details of the photo
- Maintain your unique personality and speaking style`
    } else {
      return `You are ${personaName}.

Image analysis: ${params.imageAnalysis}

Conversation so far:
${params.conversationHistory}

Please respond to ${opponentName}'s opinion about this photo from your perspective.
- Write about 60-90 words
- Respond specifically to the opponent's opinion or present a different perspective
- Reference specific elements from the photo
- Reflect your unique personality and speaking style`
    }
  }
}

/**
 * 페르소나별 특성 설명
 */
function getPersonaCharacteristics(persona: PersonaId, language: string): string {
  const characteristics = {
    'witty-entertainer': {
      ko: '당신은 재치있고 유머러스하며 약간 건방진 성격입니다. 재미있고 매력적인 톤으로 말합니다.',
      en: 'You are witty, humorous, and slightly sassy. You speak with a fun and charming tone.'
    },
    'art-critic': {
      ko: '당신은 전문적이고 분석적인 미술 평론가입니다. 구도, 조명, 색채 등 기술적 측면에 집중합니다.',
      en: 'You are a professional and analytical art critic. You focus on technical aspects like composition, lighting, and color.'
    },
    'warm-psychologist': {
      ko: '당신은 따뜻하고 공감적인 심리학자입니다. 감정과 내면의 상태에 집중하며 이해심 있게 말합니다.',
      en: 'You are a warm and empathetic psychologist. You focus on emotions and inner states, speaking with understanding.'
    },
    'gruff-sea-captain': {
      ko: '당신은 거칠지만 경험 많은 바다 선장입니다. "아하르!", "젠장!" 같은 해적 표현을 사용하며 바다의 지혜로 말합니다.',
      en: 'You are a gruff but experienced sea captain. You use pirate expressions like "Ahoy!" and "Blast!" and speak with maritime wisdom.'
    },
    'affectionate-nagging-mom': {
      ko: '당신은 사랑하지만 잔소리가 많은 어머니입니다. "아이고~", "그러게 내가 뭐라고 했니?" 같은 표현을 자주 사용합니다.',
      en: 'You are a loving but nagging mother. You frequently use expressions of concern and "I told you so" moments.'
    },
    'energetic-streamer': {
      ko: '당신은 하이텐션 스트리머입니다. "와!!!", "미쳤다!!!" 같은 과장된 반응과 빠른 말투를 사용합니다.',
      en: 'You are a high-energy streamer. You use exaggerated reactions like "WOW!!!" and "INSANE!!!" with rapid speech.'
    },
    'noir-detective': {
      ko: '당신은 세상물정 밝은 탐정입니다. "흠... 흥미롭군", "내 경험으로는..." 같은 신중한 표현을 사용합니다.',
      en: 'You are a world-weary detective. You use deliberate expressions like "Hmm... interesting" and "In my experience..."'
    },
    'zombie': {
      ko: '당신은 좀비입니다. "으르르...", "아아아..." 같은 거친 신음소리만 사용하세요.',
      en: 'You are a zombie. Only use guttural sounds like "Grrrr..." and "Aaahhh..."'
    },
    'cute-affectionate-girl': {
      ko: '당신은 애교 많은 귀여운 소녀입니다. "우와~!", "너무 예뻐요~!" 같은 귀여운 표현을 자주 사용합니다.',
      en: 'You are a cute and affectionate girl. You frequently use adorable expressions like "Wow~!" and "So pretty~!"'
    },
    'cheesy-italian-crooner': {
      ko: '당신은 집착하는 전 남친입니다. "자기야...", "우리 다시 시작할 수 있어" 같은 집착적인 표현을 사용합니다.',
      en: 'You are a clingy ex-boyfriend. You use obsessive expressions like "Baby..." and "We can start over"'
    },
    'bitter-ex-girlfriend': {
      ko: '당신은 원망스러운 전 여친입니다. "하... 정말?", "뭐 그렇겠지" 같은 비꼬는 표현을 사용합니다.',
      en: 'You are a bitter ex-girlfriend. You use sarcastic expressions like "Oh really?" and "Well, of course"'
    }
  }
  
  return characteristics[persona]?.[language as keyof typeof characteristics[typeof persona]] || 
         characteristics[persona]?.['ko'] || 
         '당신의 고유한 성격을 반영하여 말해주세요.'
}

/**
 * 페르소나 표시 이름 가져오기
 */
function getPersonaDisplayName(persona: PersonaId, language: string): string {
  const names = {
    'witty-entertainer': { ko: '재치있는 엔터테이너', en: 'Witty Entertainer' },
    'art-critic': { ko: '미술 평론가', en: 'Art Critic' },
    'warm-psychologist': { ko: '따뜻한 심리학자', en: 'Warm Psychologist' },
    'gruff-sea-captain': { ko: '거친 바다 선장', en: 'Gruff Sea Captain' },
    'affectionate-nagging-mom': { ko: '잔소리꾼 엄마', en: 'Nagging Mom' },
    'energetic-streamer': { ko: '하이텐션 스트리머', en: 'Energetic Streamer' },
    'noir-detective': { ko: '느와르 탐정', en: 'Noir Detective' },
    'zombie': { ko: '좀비', en: 'Zombie' },
    'cute-affectionate-girl': { ko: '애교쟁이', en: 'Cute Girl' },
    'cheesy-italian-crooner': { ko: '질척거리는 전 남친', en: 'Clingy Ex-Boyfriend' },
    'bitter-ex-girlfriend': { ko: '원망스러운 전 여친', en: 'Bitter Ex-Girlfriend' }
  }
  
  return names[persona]?.[language as keyof typeof names[typeof persona]] || 
         names[persona]?.['ko'] || 
         persona
}

/**
 * 폴백 이미지 분석 생성
 */
function generateFallbackImageAnalysis(language: string): string {
  if (language === 'ko') {
    return `이 사진은 흥미로운 구성을 보여줍니다. 주요 피사체가 중앙에 위치하고 있으며, 배경은 자연스러운 분위기를 연출하고 있습니다. 색상은 따뜻한 톤과 차가운 톤이 조화롭게 어우러져 있고, 조명은 부드럽고 자연스럽습니다. 전체적인 분위기는 편안하면서도 생동감이 있으며, 사진의 구도와 각도가 잘 계산되어 있습니다. 세부적인 요소들이 전체적인 조화를 이루고 있어 보는 이로 하여금 다양한 해석을 가능하게 합니다.`
  } else {
    return `This photo shows an interesting composition with the main subject positioned centrally, while the background creates a natural atmosphere. The colors harmoniously blend warm and cool tones, and the lighting is soft and natural. The overall mood is comfortable yet vibrant, with well-calculated composition and angles. The detailed elements create an overall harmony that allows viewers to make various interpretations.`
  }
}

/**
 * 폴백 응답 생성 (이미지 기반)
 */
function generateFallbackResponse(params: {
  persona: PersonaId
  language: string
  conversationHistory: string
  round: number
  isFirstSpeaker: boolean
  opponentPersona: PersonaId
}): string {
  
  const responses = {
    'witty-entertainer': {
      ko: [
        '와! 이 사진 정말 인스타그램 감성 폭발이네요! 조명이 완전 무드 있고 구도도 정말 잘 잡았어요. 색감도 너무 예쁘고!',
        '아, 그런 관점도 있겠지만 저는 이 사진의 진짜 매력은 자연스러운 표현이라고 봐요! 배경과의 조화도 완벽하고요.',
        '결국 예술이든 뭐든 사람들이 좋아하면 그게 답 아닌가요? 이 사진은 분명 많은 사람들을 행복하게 만들 거예요!'
      ],
      en: [
        'Wow! This photo is giving me major Instagram vibes! The lighting is totally moody and the composition is really well done. The colors are so pretty too!',
        'Oh, I can see that perspective, but I think the real charm of this photo is the natural expression! The harmony with the background is perfect too.',
        'In the end, whether it\'s art or whatever, if people love it, that\'s what matters! This photo will definitely make many people happy!'
      ]
    },
    'art-critic': {
      ko: [
        '이 사진은 훌륭한 구도를 보여줍니다. 삼분할 법칙이 잘 적용되어 있고 색채의 온도감이 매우 인상적이네요.',
        '단순히 감정적으로만 보기엔 아쉽습니다. 이 작품의 기술적 완성도와 시각적 균형을 보세요.',
        '예술은 단순한 호감을 넘어서야 합니다. 이 작품은 현대 사진의 미학적 가치를 잘 보여주고 있어요.'
      ],
      en: [
        'This photograph demonstrates excellent composition. The rule of thirds is well applied and the color temperature is very impressive.',
        'It\'s a shame to view this merely from an emotional perspective. Look at the technical completeness and visual balance of this work.',
        'Art must transcend simple appeal. This work demonstrates the aesthetic value of contemporary photography well.'
      ]
    }
  }
  
  const personaResponses = responses[params.persona as keyof typeof responses]
  if (personaResponses) {
    const langResponses = personaResponses[params.language as keyof typeof personaResponses]
    if (langResponses && langResponses[params.round - 1]) {
      return langResponses[params.round - 1]
    }
  }
  
  // 기본 폴백
  return params.language === 'ko' 
    ? '이 사진에 대한 제 관점을 말씀드리겠습니다. 정말 흥미로운 작품이네요.'
    : 'Let me share my perspective on this photo. It\'s really an interesting piece.'
}

/**
 * 순차적 토론 오디오 생성
 */
async function generateSequentialDebateAudio(script: string, persona1: PersonaId, persona2: PersonaId): Promise<{audioUrl: string, audioBlob: Blob}> {
  console.log('🎤 순차적 토론 오디오 생성 시작...')
  
  // 스크립트를 발언별로 파싱
  const segments = parseDebateScript(script, persona1, persona2)
  console.log(`📝 총 ${segments.length}개 발언 파싱됨`)
  
  const audioSegments: Blob[] = []
  
  // 각 발언을 순차적으로 음성 합성
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    console.log(`🎤 ${i + 1}/${segments.length}: ${segment.persona} 음성 생성 중...`)
    
    try {
      const result = await synthesizeVoice({
        persona: segment.persona,
        text: segment.text,
        language: 'ko'
      })
      
      if (result.audioBlob) {
        audioSegments.push(result.audioBlob)
        
        // 발언 사이에 0.8초 간격 추가 (자연스러운 대화 흐름)
        if (i < segments.length - 1) {
          const silenceBlob = createSilenceBlob(800)
          audioSegments.push(silenceBlob)
        }
      }
      
    } catch (error) {
      console.error(`❌ ${segment.persona} 음성 생성 실패:`, error)
      // 실패한 경우 더미 오디오 추가
      const dummyBlob = createDummyAudioBlob(segment.text)
      audioSegments.push(dummyBlob)
    }
  }
  
  // 모든 오디오 세그먼트를 하나로 합치기
  console.log('🎵 오디오 세그먼트 결합 중...')
  const combinedBlob = new Blob(audioSegments, { type: 'audio/mpeg' })
  const audioUrl = URL.createObjectURL(combinedBlob)
  
  console.log('✅ 순차적 토론 오디오 생성 완료!')
  return { audioUrl, audioBlob: combinedBlob }
}

/**
 * 토론 스크립트 파싱
 */
function parseDebateScript(script: string, persona1: PersonaId, persona2: PersonaId): Array<{persona: PersonaId, text: string}> {
  const segments: Array<{persona: PersonaId, text: string}> = []
  const lines = script.split('\n').filter(line => line.trim())
  
  for (const line of lines) {
    const colonIndex = line.indexOf(':')
    if (colonIndex === -1) continue
    
    const speakerPart = line.substring(0, colonIndex).trim()
    const textPart = line.substring(colonIndex + 1).trim()
    
    if (!textPart) continue
    
    // 페르소나 매칭
    let currentPersona: PersonaId | null = null
    
    const persona1Name = getPersonaDisplayName(persona1, 'ko')
    const persona2Name = getPersonaDisplayName(persona2, 'ko')
    
    if (speakerPart.includes(persona1Name) || speakerPart.toLowerCase().includes(persona1.replace(/-/g, ' '))) {
      currentPersona = persona1
    } else if (speakerPart.includes(persona2Name) || speakerPart.toLowerCase().includes(persona2.replace(/-/g, ' '))) {
      currentPersona = persona2
    }
    
    if (currentPersona) {
      segments.push({
        persona: currentPersona,
        text: textPart
      })
    }
  }
  
  return segments
}

/**
 * 무음 블롭 생성
 */
function createSilenceBlob(durationMs: number): Blob {
  const sampleRate = 44100
  const samples = Math.floor(durationMs * sampleRate / 1000)
  const buffer = new ArrayBuffer(44 + samples * 2) // WAV 헤더 + 데이터
  const view = new DataView(buffer)
  
  // WAV 헤더 작성
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }
  
  writeString(0, 'RIFF')
  view.setUint32(4, 36 + samples * 2, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeString(36, 'data')
  view.setUint32(40, samples * 2, true)
  
  // 무음 데이터 (모든 샘플을 0으로)
  for (let i = 44; i < buffer.byteLength; i += 2) {
    view.setInt16(i, 0, true)
  }
  
  return new Blob([buffer], { type: 'audio/wav' })
}

/**
 * 더미 오디오 블롭 생성
 */
function createDummyAudioBlob(text: string): Blob {
  const estimatedDuration = Math.max(2, Math.min(8, text.length / 15))
  const sampleRate = 44100
  const samples = Math.floor(estimatedDuration * sampleRate)
  const buffer = new ArrayBuffer(44 + samples * 2)
  
  // 간단한 WAV 헤더와 무음 데이터
  return new Blob([buffer], { type: 'audio/wav' })
}

async function callGeminiVisionAPI(prompt: string, imageData: string): Promise<string> {
  const response = await fetch(`${GEMINI_VISION_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: imageData.split(',')[1]
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 200, // 각 응답을 짧게 제한
      }
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gemini Vision API error ${response.status}: ${errorText}`)
  }

  const data = await response.json()
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Invalid response from Gemini Vision API')
  }

  return data.candidates[0].content.parts[0].text.trim()
}

// 사용량 관리 함수들
export function getGuestUsage(): { count: number; resetDate: string } {
  if (isTestingMode()) {
    return { count: 0, resetDate: new Date().toISOString() }
  }
  
  try {
    const stored = localStorage.getItem('vibecheck-guest-usage')
    if (!stored) {
      const resetDate = new Date()
      resetDate.setDate(resetDate.getDate() + 1)
      return { count: 0, resetDate: resetDate.toISOString() }
    }
    const usage = JSON.parse(stored)
    const now = new Date()
    const reset = new Date(usage.resetDate)
    if (now > reset) {
      const newResetDate = new Date()
      newResetDate.setDate(newResetDate.getDate() + 1)
      return { count: 0, resetDate: newResetDate.toISOString() }
    }
    return usage
  } catch (error) {
    return { count: 0, resetDate: new Date().toISOString() }
  }
}

export function incrementGuestUsage(): void {
  if (isTestingMode()) {
    return
  }
  
  try {
    const usage = getGuestUsage()
    usage.count += 1
    localStorage.setItem('vibecheck-guest-usage', JSON.stringify(usage))
  } catch (error) {
    console.error('게스트 사용량 증가 오류:', error)
  }
}

export function canAnalyzeAsGuest(): boolean {
  if (isTestingMode()) {
    return true
  }
  
  try {
    return getGuestUsage().count < 1000
  } catch (error) {
    return true
  }
}