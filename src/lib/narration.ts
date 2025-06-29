import type { CharacterId } from './characters'
import { generateEnhancedScript } from './gemini'
import { speakWithElevenLabs } from './audio'
import { parseReactionsFromScript } from './utils'

// --- 수정된 부분: 환경 변수에서 3개의 Voice ID를 가져옵니다 ---
const NARRATOR_MALE_VOICE_ID = import.meta.env.VITE_NARRATOR_MALE_VOICE_ID as string;
const NARRATOR_FEMALE_VOICE_ID = import.meta.env.VITE_NARRATOR_FEMALE_VOICE_ID as string;
const CHARACTER_VOICE_ID = import.meta.env.VITE_CHARACTER_TRUMP_VOICE_ID as string;


// --- 수정된 부분: `narratorGender` 옵션 추가 ---
export interface NarrationSettings {
  character: CharacterId
  mode: 'reaction'
  reactionFrequency: 'low' | 'medium' | 'high'
  voiceSpeed: number
  showFacialAnimation: boolean
  language: string
  narratorGender: 'male' | 'female' // 나레이터 성별 선택
}

// --- 수정된 부분: `narratorGender` 기본값 설정 ---
export const defaultSettings: NarrationSettings = {
  character: 'trump',
  mode: 'reaction',
  reactionFrequency: 'medium',
  voiceSpeed: 1.0,
  showFacialAnimation: true,
  language: 'en-US',
  narratorGender: 'female' // 기본값은 여성 나레이터
}

function isTestingMode(): boolean {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isLocalhost = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
     window.location.hostname === '127.0.0.1' ||
     window.location.hostname.includes('localhost'))
  return isDevelopment || isLocalhost
}

export async function generateNarration(
  textInput: string,
  settings: NarrationSettings,
  userId?: string
): Promise<{ id: string; scriptOutput: string; audioUrl?: string }> {
  console.log('🎙️ 🔥 CRITICAL: Full AI Voice 내레이션 생성 시작...')

  try {
    const scriptOutput = await generateEnhancedScript({
      character: settings.character,
      text: textInput,
      mode: settings.mode,
      frequency: settings.reactionFrequency
    })
    
    const reactions = parseReactionsFromScript(scriptOutput);

    // 오디오 시퀀스 재생 함수에 `settings` 객체를 전달합니다.
    playFullNarrationSequence(textInput, reactions, settings);

    const narrationId = `reaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    if (!isTestingMode()) {
      incrementGuestUsage()
    }

    console.log('🎉 Full AI Voice 내레이션 생성 성공!')
    
    // 🔥 CRITICAL: 실제 오디오 URL을 반환하여 AudioPlayer가 표시되도록 함
    const audioUrl = `reaction-voice-playing:${settings.character}:${Date.now()}`
    
    return {
      id: narrationId,
      scriptOutput,
      audioUrl // 🔥 이제 실제 audioUrl을 반환
    }

  } catch (error) {
    console.error('❌ 생성 실패:', error)
    throw new Error(`Full AI Voice 내레이션 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
  }
}

/**
 * 원본 텍스트(나레이터 목소리)와 반응(캐릭터 목소리)을 순차적으로 재생하는 함수.
 * @param originalText - 사용자가 입력한 원본 텍스트
 * @param reactions - 재생할 캐릭터 반응 텍스트들의 배열
 * @param settings - 나레이터 성별 등 설정을 담은 객체
 */
async function playFullNarrationSequence(originalText: string, reactions: string[], settings: NarrationSettings) {
  
  // --- 수정된 부분: 나레이터 성별에 따라 Voice ID를 동적으로 선택 ---
  const narratorVoiceId = settings.narratorGender === 'male' 
    ? NARRATOR_MALE_VOICE_ID 
    : NARRATOR_FEMALE_VOICE_ID;
  
  if (!narratorVoiceId || !CHARACTER_VOICE_ID) {
      console.error("Voice ID가 환경 변수에 설정되지 않았습니다. .env.local 파일을 확인하세요.");
      return;
  }
    
  try {
    // 1. 원본 텍스트를 선택된 '나레이터' 목소리로 재생
    console.log(`🎙️ ${settings.narratorGender} 나레이터가 원본 텍스트를 읽습니다...`);
    await speakWithElevenLabs(originalText, narratorVoiceId);

    if (reactions.length > 0) {
      // 2. 나레이션과 리액션 사이의 자연스러운 멈춤
      await new Promise(resolve => setTimeout(resolve, 500)); 

      // 3. 캐릭터 반응들을 '캐릭터' 목소리로 순차 재생
      console.log('🎙️ 캐릭터가 리액션을 시작합니다...');
      for (const reaction of reactions) {
        await speakWithElevenLabs(reaction, CHARACTER_VOICE_ID);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    console.log('✅ 모든 오디오 시퀀스 재생 완료');
  } catch (error) {
    console.error('오디오 시퀀스 재생 중 에러가 발생했습니다:', error);
  }
}

// --- 아래 함수들은 변경사항 없습니다 ---

export async function getPublicNarrations(limit = 20, offset = 0) {
  console.log('⚠️ Supabase 연결 없음 - 빈 피드 반환')
  return []
}

export function getGuestUsage(): { count: number; resetDate: string } {
  if (isTestingMode()) return { count: 0, resetDate: new Date().toISOString() }
  try {
    const stored = localStorage.getItem('reactteller-guest-usage')
    if (!stored) {
      const resetDate = new Date(); resetDate.setDate(resetDate.getDate() + 1);
      return { count: 0, resetDate: resetDate.toISOString() }
    }
    const usage = JSON.parse(stored); const now = new Date(); const reset = new Date(usage.resetDate);
    if (now > reset) {
      const newResetDate = new Date(); newResetDate.setDate(newResetDate.getDate() + 1);
      return { count: 0, resetDate: newResetDate.toISOString() }
    }
    return usage
  } catch (error) {
    return { count: 0, resetDate: new Date().toISOString() }
  }
}

export function incrementGuestUsage(): void {
  if (isTestingMode()) return
  try {
    const usage = getGuestUsage(); usage.count += 1;
    localStorage.setItem('reactteller-guest-usage', JSON.stringify(usage))
  } catch (error) {
    console.error('게스트 사용량 증가 오류:', error)
  }
}

export function canGenerateAsGuest(): boolean {
  if (isTestingMode()) return true
  try {
    return getGuestUsage().count < 10
  } catch (error) {
    return true
  }
}

export { isTestingMode }