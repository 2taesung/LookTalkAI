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