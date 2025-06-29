import { supabase } from './supabaseClient'
import { getCurrentUser } from './auth'

export interface PersonaRequest {
  id: string
  title: string
  description: string
  author: string
  likes_count: number
  created_at: string
  status: 'pending' | 'in-review' | 'approved' | 'implemented'
  category: 'character' | 'profession' | 'personality' | 'other'
  user_id?: string
  isLiked?: boolean
}

export interface CreatePersonaRequestData {
  title: string
  description: string
  author: string
  category: 'character' | 'profession' | 'personality' | 'other'
}

// 브라우저 지문 생성 (간단한 버전)
function generateUserFingerprint(): string {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  ctx?.fillText('fingerprint', 10, 10)
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|')
  
  // 간단한 해시 생성
  let hash = 0
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 32bit 정수로 변환
  }
  
  return Math.abs(hash).toString(36)
}

// 모든 페르소나 요청 가져오기
export async function getPersonaRequests(): Promise<PersonaRequest[]> {
  try {
    const { data, error } = await supabase
      .from('persona_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    // 현재 사용자의 좋아요 상태 확인
    const userFingerprint = generateUserFingerprint()
    const { data: likesData } = await supabase
      .from('persona_request_likes')
      .select('request_id')
      .eq('user_fingerprint', userFingerprint)

    const likedRequestIds = new Set(likesData?.map(like => like.request_id) || [])

    return data.map(request => ({
      ...request,
      author: request.display_name, // display_name을 author로 매핑
      isLiked: likedRequestIds.has(request.id)
    }))
  } catch (error) {
    console.error('페르소나 요청 로드 실패:', error)
    return []
  }
}

// 새 페르소나 요청 생성 (로그인 필요)
export async function createPersonaRequest(requestData: CreatePersonaRequestData): Promise<boolean> {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      throw new Error('로그인이 필요합니다')
    }

    const { error } = await supabase
      .from('persona_requests')
      .insert([{
        title: requestData.title,
        description: requestData.description,
        display_name: requestData.author,
        category: requestData.category,
        user_id: currentUser.id
      }])

    if (error) throw error
    return true
  } catch (error) {
    console.error('페르소나 요청 생성 실패:', error)
    return false
  }
}

// 좋아요 토글 (중복 방지)
export async function togglePersonaRequestLike(requestId: string): Promise<{ success: boolean; isLiked: boolean }> {
  try {
    const userFingerprint = generateUserFingerprint()

    // 기존 좋아요 확인
    const { data: existingLike } = await supabase
      .from('persona_request_likes')
      .select('id')
      .eq('request_id', requestId)
      .eq('user_fingerprint', userFingerprint)
      .maybeSingle()

    if (existingLike) {
      // 좋아요 취소
      const { error } = await supabase
        .from('persona_request_likes')
        .delete()
        .eq('id', existingLike.id)

      if (error) throw error
      return { success: true, isLiked: false }
    } else {
      // 좋아요 추가
      const { error } = await supabase
        .from('persona_request_likes')
        .insert([{
          request_id: requestId,
          user_fingerprint: userFingerprint
        }])

      if (error) throw error
      return { success: true, isLiked: true }
    }
  } catch (error) {
    console.error('좋아요 토글 실패:', error)
    return { success: false, isLiked: false }
  }
}

// 요청 상태 업데이트 (관리자용)
export async function updatePersonaRequestStatus(
  requestId: string, 
  status: PersonaRequest['status']
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('persona_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', requestId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('요청 상태 업데이트 실패:', error)
    return false
  }
}