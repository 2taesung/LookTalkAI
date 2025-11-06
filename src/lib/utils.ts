// src/lib/utils.ts

/**
 * Gemini가 생성한 전체 스크립트에서 캐릭터 반응 라인만 파싱하는 헬퍼 함수
 * @param script - generateEnhancedScript의 결과물 문자열
 * @returns 반응 텍스트들의 배열
 */
export function parseReactionsFromScript(script: string): string[] {
  const reactionSection = script.split('--- Character Reactions ---')[1];
  if (!reactionSection) {
    return [];
  }

  // "Trump: " 와 같은 캐릭터 이름과 따옴표를 제거하고, 공백을 정리합니다.
  return reactionSection
    .trim()
    .split('\n')
    .map(line => line.replace(/.*?: "/, '').replace(/"$/, '').trim())
    .filter(line => line.length > 0);
}

/**
 * Promise에 타임아웃을 추가하는 헬퍼 함수
 * @param promise - 실행할 Promise
 * @param timeoutMs - 타임아웃 시간 (밀리초)
 * @param errorMessage - 타임아웃 시 표시할 에러 메시지
 * @returns 타임아웃이 적용된 Promise
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = 'Request timeout'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    )
  ]);
}