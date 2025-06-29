// ElevenLabs 음성 합성 라이브러리 (단일 페르소나용)
import type { PersonaId } from './personas'

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY as string

// 페르소나별 Voice ID 매핑 (환경변수에서 가져옴)
const PERSONA_VOICE_IDS = {
  'witty-entertainer': import.meta.env.VITE_WITTY_ENTERTAINER_VOICE_ID as string,
  'art-critic': import.meta.env.VITE_ART_CRITIC_VOICE_ID as string,
  'warm-psychologist': import.meta.env.VITE_PSYCHOLOGIST_VOICE_ID as string,
  'gruff-sea-captain': import.meta.env.VITE_PIRATE_MAN_VOICE_ID as string,
  'affectionate-nagging-mom': import.meta.env.VITE_AFFECTIONATE_NAG_VOICE_ID as string,
  'energetic-streamer': import.meta.env.VITE_ENERGETIC_STREAMER_VOICE_ID as string,
  'noir-detective': import.meta.env.VITE_NOIR_DETECTIVE_VOICE_ID as string,
  'zombie': import.meta.env.VITE_ZOMBIE_VOICE_ID as string,
  'cute-affectionate-girl': import.meta.env.VITE_SWEETLY_EXPRESSIVE_VOICE_ID as string,
  'cheesy-italian-crooner': import.meta.env.VITE_CHEESY_CROONER_VOICE_ID as string,
  'bitter-ex-girlfriend': import.meta.env.VITE_SEXY_VOICE_ID as string,
} as const

export interface TTSOptions {
  persona: PersonaId
  text: string
  language?: string
}

export interface TTSResult {
  audioUrl: string
  audioBlob: Blob
}

export async function synthesizeVoice(options: TTSOptions): Promise<TTSResult> {
  console.log('🎤 ElevenLabs 음성 합성 시작...')
  console.log('페르소나:', options.persona)
  console.log('언어:', options.language)
  console.log('텍스트 길이:', options.text.length)

  // 🔇 기존 음성 합성 중단
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel()
    console.log('🔇 기존 음성 합성 중단됨')
  }

  const voiceId = PERSONA_VOICE_IDS[options.persona]
  
  if (!voiceId) {
    console.error(`❌ ${options.persona}에 대한 Voice ID가 설정되지 않음`)
    throw new Error(`Voice ID not configured for persona: ${options.persona}`)
  }

  if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY.includes('your_elevenlabs_api_key_here')) {
    console.log('⚠️ ElevenLabs API 키가 설정되지 않음, 브라우저 TTS 사용')
    return synthesizeWithBrowserTTS(options)
  }

  try {
    console.log(`🎤 ElevenLabs API 사용 (Voice ID: ${voiceId})`)
    return await synthesizeWithElevenLabs(options.text, voiceId)
  } catch (error) {
    console.error('❌ ElevenLabs API 실패, 브라우저 TTS로 폴백:', error)
    return synthesizeWithBrowserTTS(options)
  }
}

async function synthesizeWithElevenLabs(text: string, voiceId: string): Promise<TTSResult> {
  const ttsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`

  const response = await fetch(ttsUrl, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY,
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.1,
        use_speaker_boost: true
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`ElevenLabs API 에러 ${response.status}: ${errorText}`)
  }

  const audioBlob = await response.blob()
  const audioUrl = URL.createObjectURL(audioBlob)
  
  console.log('✅ ElevenLabs 음성 합성 완료')
  return {
    audioUrl,
    audioBlob
  }
}

async function synthesizeWithBrowserTTS(options: TTSOptions): Promise<TTSResult> {
  console.log('🎤 브라우저 TTS 사용 (폴백)')
  
  // 브라우저 TTS의 경우 실제 오디오 blob을 생성하지 않고 더미 데이터 반환
  const dummyBlob = new Blob(['dummy audio data'], { type: 'audio/mpeg' })
  const audioUrl = `speech-playing:${options.persona}:${options.text.substring(0, 50)}`
  
  return {
    audioUrl,
    audioBlob: dummyBlob
  }
}

function getLanguageCode(language: string): string {
  const languageCodes = {
    'ko': 'ko-KR',
    'en': 'en-US',
    'zh': 'zh-CN'
  }
  return languageCodes[language as keyof typeof languageCodes] || 'ko-KR'
}

function selectBestVoice(voices: SpeechSynthesisVoice[], persona: PersonaId, language: string): SpeechSynthesisVoice | null {
  const personaPreferences: Record<PersonaId, string[]> = {
    'witty-entertainer': ['female', 'yuna', 'korean', 'samantha', 'zira'],
    'art-critic': ['male', 'david', 'mark', 'alex', 'korean'],
    'warm-psychologist': ['female', 'yuna', 'korean', 'samantha', 'zira'],
    'gruff-sea-captain': ['male', 'david', 'mark', 'alex', 'daniel', 'fred'],
    'affectionate-nagging-mom': ['female', 'yuna', 'korean', 'samantha', 'zira', 'heami'],
    'energetic-streamer': ['female', 'young', 'energetic', 'yuna', 'korean', 'samantha'],
    'noir-detective': ['male', 'deep', 'gravelly', 'david', 'mark', 'alex', 'daniel'],
    'zombie': ['male', 'deep', 'gravelly', 'monster', 'dark', 'low'],
    'cute-affectionate-girl': ['female', 'young', 'cute', 'sweet', 'yuna', 'korean', 'samantha', 'zira'],
    'cheesy-italian-crooner': ['male', 'smooth', 'deep', 'clingy', 'desperate', 'david', 'mark', 'alex', 'daniel'],
    'bitter-ex-girlfriend': ['female', 'mature', 'sultry', 'bitter', 'sarcastic', 'yuna', 'korean', 'samantha', 'zira'],
  }

  const preferences = personaPreferences[persona] || personaPreferences['witty-entertainer']
  
  let bestVoice = null
  let bestScore = -1

  for (const voice of voices) {
    let score = 0
    const name = voice.name.toLowerCase()
    const lang = voice.lang.toLowerCase()
    
    // 언어 매칭
    if (language === 'ko' && lang.includes('ko')) {
      score += 10
    } else if (language === 'en' && lang.includes('en')) {
      score += 10
    } else if (language === 'zh' && lang.includes('zh')) {
      score += 10
    } else if (lang.includes('en')) {
      score += 5 // 영어를 기본 폴백으로
    }
    
    // 페르소나 선호도
    for (const pref of preferences) {
      if (name.includes(pref) || lang.includes(pref)) {
        score += 1
      }
    }
    
    if (voice.localService) score += 0.5
    
    if (score > bestScore) {
      bestScore = score
      bestVoice = voice
    }
  }

  return bestVoice || voices[0]
}

function getPersonaVoiceSettings(persona: PersonaId) {
  const settings = {
    'witty-entertainer': { pitch: 1.2, rate: 1.1, volume: 1.0 }, // 밝고 활기찬
    'art-critic': { pitch: 0.8, rate: 0.9, volume: 1.0 }, // 낮고 차분한
    'warm-psychologist': { pitch: 1.0, rate: 0.85, volume: 1.0 }, // 부드럽고 따뜻한
    'gruff-sea-captain': { pitch: 0.6, rate: 0.8, volume: 1.0 }, // 낮고 거친
    'affectionate-nagging-mom': { pitch: 1.3, rate: 1.2, volume: 1.0 }, // 높고 빠른 잔소리 톤
    'energetic-streamer': { pitch: 1.4, rate: 1.3, volume: 1.0 }, // 매우 높고 빠른 하이텐션
    'noir-detective': { pitch: 0.5, rate: 0.7, volume: 1.0 }, // 매우 낮고 느린 거친 목소리
    'zombie': { pitch: 0.3, rate: 0.5, volume: 1.0 }, // 극도로 낮고 느린 좀비 목소리
    'cute-affectionate-girl': { pitch: 1.5, rate: 1.0, volume: 1.0 }, // 매우 높고 귀여운 애교 목소리
    'cheesy-italian-crooner': { pitch: 0.8, rate: 0.7, volume: 1.0 }, // 낮고 느린 질척거리는 집착 목소리
    'bitter-ex-girlfriend': { pitch: 1.1, rate: 0.9, volume: 1.0 }, // 약간 높고 느린 원망스러운 목소리
  }

  return settings[persona] || settings['witty-entertainer']
}

// 정리 함수
export function cleanupAudio() {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel()
    console.log('🔇 모든 음성 합성 중단됨')
  }
}