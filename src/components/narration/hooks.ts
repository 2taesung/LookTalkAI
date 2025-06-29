// /components/narration/hooks.ts

import { useMemo } from 'react';
import { locales } from './constants';

type LocaleSet = typeof locales;
type Language = keyof LocaleSet;

// Helper to access nested keys
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

export const useLocalization = (language: Language) => {
  const t = useMemo(() => {
    // 유효한 언어가 아니면 영어로 대체
    const currentLang = (locales as LocaleSet)[language] ? language : 'en';
    const langPack = (locales as LocaleSet)[currentLang];
    const fallbackLangPack = (locales as LocaleSet)['en'];

    // t 함수: 키와 선택적 인자를 받음
    return (key: string, args?: any): string => {
      let value = getNestedValue(langPack, key);

      // 현재 언어 팩에 키가 없으면, 영어 팩에서 찾음
      if (value === undefined) {
        value = getNestedValue(fallbackLangPack, key);
      }
      
      if (typeof value === 'function') {
        return value(args);
      }
      
      // 그래도 값이 없으면 키 자체를 반환
      return value || key;
    };
  }, [language]);

  return t;
};