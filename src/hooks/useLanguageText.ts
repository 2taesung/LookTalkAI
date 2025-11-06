// Custom hook for language-based text selection
// Replaces the duplicated getText() function across 15+ components

export type Language = 'ko' | 'en' | 'zh';

/**
 * Hook that provides a function to get text in the selected language
 * @param language - Current language selection ('ko', 'en', 'zh')
 * @returns Function that takes Korean, English, and Chinese text and returns the appropriate one
 *
 * @example
 * const getText = useLanguageText('ko');
 * const message = getText('안녕하세요', 'Hello', '你好'); // Returns '안녕하세요'
 */
export function useLanguageText(language: string) {
  return (ko: string, en: string, zh: string): string => {
    switch (language) {
      case 'ko':
        return ko;
      case 'zh':
        return zh;
      default:
        return en;
    }
  };
}

/**
 * Utility function (non-hook version) for use in non-component contexts
 * @param language - Current language selection
 * @param ko - Korean text
 * @param en - English text
 * @param zh - Chinese text
 * @returns Text in the selected language
 */
export function getLanguageText(
  language: string,
  ko: string,
  en: string,
  zh: string
): string {
  switch (language) {
    case 'ko':
      return ko;
    case 'zh':
      return zh;
    default:
      return en;
  }
}
