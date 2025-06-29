// 🎙️ Reaction Voice TTS 시스템
import type { CharacterId } from './characters'
import { detectLanguage } from './languageDetection'

export interface TTSOptions {
  character: CharacterId
  text: string
  voiceSpeed?: number
}

export async function generateSpeech(options: TTSOptions): Promise<string> {
  console.log('🎙️ 🔥 CRITICAL: Reaction Voice TTS 시작!')
  console.log('캐릭터:', options.character)
  console.log('텍스트 길이:', options.text.length)

  // 🔇 기존 음성 합성 중단
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel()
    console.log('🔇 기존 음성 합성 중단됨')
  }

  // 자동 언어 감지
  const detectedLanguage = detectLanguage(options.text)
  console.log('🔍 감지된 언어:', detectedLanguage.language)

  // 🎙️ Reaction Voice 생성
  return generateReactionVoice(options, detectedLanguage.language)
}

// 🎙️ Reaction Voice 생성
async function generateReactionVoice(options: TTSOptions, detectedLanguage: string): Promise<string> {
  console.log('🎙️ 🔥 CRITICAL: Reaction Voice 생성 시작...')
  
  try {
    // 브라우저 TTS로 시뮬레이션
    return new Promise((resolve, reject) => {
      speechSynthesis.cancel()
      
      setTimeout(() => {
        const voices = speechSynthesis.getVoices()
        const selectedVoice = selectBestVoice(voices, options.character, detectedLanguage)
        
        const utterance = new SpeechSynthesisUtterance(options.text)
        if (selectedVoice) {
          utterance.voice = selectedVoice
        }
        
        // 캐릭터별 음성 설정
        const settings = getCharacterSettings(options.character)
        utterance.pitch = settings.pitch
        utterance.rate = settings.rate * (options.voiceSpeed || 1.0)
        utterance.volume = settings.volume
        
        utterance.onstart = () => {
          resolve(`reaction-voice-playing:${options.character}:${Date.now()}`)
        }
        
        utterance.onerror = () => {
          reject(new Error('음성 합성 오류'))
        }
        
        speechSynthesis.speak(utterance)
      }, 100)
    })

  } catch (error) {
    console.error('❌ Reaction Voice 생성 실패:', error)
    throw error
  }
}

// 🎤 최적 음성 선택
function selectBestVoice(voices: SpeechSynthesisVoice[], character: CharacterId, language: string): SpeechSynthesisVoice | null {
  const characterPreferences: Record<CharacterId, string[]> = {
    trump: ['male', 'david', 'mark', 'alex']
  }

  const preferences = characterPreferences[character] || characterPreferences.trump
  
  let bestVoice = null
  let bestScore = -1

  for (const voice of voices) {
    let score = 0
    const name = voice.name.toLowerCase()
    const lang = voice.lang.toLowerCase()
    
    // 언어 매칭
    if (lang.startsWith(language.substring(0, 2))) {
      score += 10
    }
    
    // 캐릭터 선호도
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

// 🎭 캐릭터별 음성 설정
function getCharacterSettings(character: CharacterId) {
  const settings = {
    trump: { pitch: 0.7, rate: 1.1, volume: 1.0 }
  }

  return settings[character] || settings.trump
}

// 🧹 정리 함수
export function cleanupTTS() {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel()
    console.log('🔇 모든 음성 합성 중단됨')
  }
}