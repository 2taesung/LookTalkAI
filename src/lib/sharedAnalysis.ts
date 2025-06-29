// 공유 분석 데이터 관리 시스템
export interface SharedAnalysisData {
  id: string
  imageUrl: string
  imageData: string // base64 encoded image
  script: string
  audioUrl?: string
  persona: string
  timestamp: number
  title: string
  language: string
}

// 로컬 스토리지를 사용한 공유 데이터 저장 (실제 구현에서는 서버 사용)
const STORAGE_KEY = 'LookTalkAI-shared-analyses'

export function saveSharedAnalysis(data: Omit<SharedAnalysisData, 'id' | 'timestamp'>): string {
  const shareId = `share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  const sharedData: SharedAnalysisData = {
    ...data,
    id: shareId,
    timestamp: Date.now()
  }
  
  try {
    const existingData = getStoredSharedAnalyses()
    existingData[shareId] = sharedData
    
    // 최대 100개까지만 저장 (오래된 것부터 삭제)
    const entries = Object.entries(existingData)
    if (entries.length > 100) {
      const sortedEntries = entries.sort(([,a], [,b]) => b.timestamp - a.timestamp)
      const limitedEntries = sortedEntries.slice(0, 100)
      const limitedData = Object.fromEntries(limitedEntries)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedData))
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingData))
    }
    
    console.log('✅ 공유 분석 데이터 저장됨:', shareId)
    console.log('📊 저장된 데이터:', {
      imageDataLength: data.imageData?.length || 0,
      scriptLength: data.script?.length || 0,
      audioUrl: data.audioUrl,
      persona: data.persona
    })
    return shareId
  } catch (error) {
    console.error('❌ 공유 데이터 저장 실패:', error)
    throw new Error('공유 링크 생성에 실패했습니다')
  }
}

export function getSharedAnalysis(shareId: string): SharedAnalysisData | null {
  try {
    console.log('🔍 공유 데이터 조회 시도:', shareId)
    const storedData = getStoredSharedAnalyses()
    const result = storedData[shareId] || null
    
    if (result) {
      console.log('✅ 공유 데이터 찾음:', {
        id: result.id,
        imageDataLength: result.imageData?.length || 0,
        scriptLength: result.script?.length || 0,
        audioUrl: result.audioUrl,
        persona: result.persona,
        timestamp: new Date(result.timestamp).toLocaleString()
      })
    } else {
      console.log('❌ 공유 데이터 없음:', shareId)
      console.log('📋 저장된 모든 공유 ID:', Object.keys(storedData))
    }
    
    return result
  } catch (error) {
    console.error('❌ 공유 데이터 로드 실패:', error)
    return null
  }
}

function getStoredSharedAnalyses(): Record<string, SharedAnalysisData> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const result = stored ? JSON.parse(stored) : {}
    console.log('📋 로컬 스토리지에서 로드된 공유 데이터 개수:', Object.keys(result).length)
    return result
  } catch (error) {
    console.error('❌ 저장된 공유 데이터 파싱 실패:', error)
    return {}
  }
}

export function generateShareUrl(shareId: string): string {
  return `${window.location.origin}/shared/${shareId}`
}

// 공유 데이터 정리 (30일 이상 된 데이터 삭제)
export function cleanupOldSharedData(): void {
  try {
    const storedData = getStoredSharedAnalyses()
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
    
    const filteredData = Object.fromEntries(
      Object.entries(storedData).filter(([, data]) => data.timestamp > thirtyDaysAgo)
    )
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredData))
    console.log('🧹 오래된 공유 데이터 정리 완료')
  } catch (error) {
    console.error('❌ 공유 데이터 정리 실패:', error)
  }
}