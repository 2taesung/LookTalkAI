import React from 'react';
import { Globe } from 'lucide-react';
import { statusBadges } from '../constants';

interface GeneratorHeaderProps {
  t: (key: string, args?: any) => string;
  detectedTextLanguage: { language: string } | null;
  text: string;
  testingModeActive: boolean;
}

export function GeneratorHeader({ t, detectedTextLanguage, text, testingModeActive }: GeneratorHeaderProps) {
  const getLanguageName = (langCode: string) => {
    if (langCode.startsWith('ko')) return '한국어';
    if (langCode.startsWith('ja')) return '日本語';
    if (langCode.startsWith('zh')) return '中文';
    return 'English';
  };

  return (
    <div className="text-center space-y-2">
      {/* Removed the large title since it's now in the navigation */}
      <p className="text-sm sm:text-base text-gray-600 px-2">
        {t('subtitle')}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
        {statusBadges.map(badge => (
          <div key={badge.id} className={`flex items-center space-x-1 px-2 py-1 rounded-full bg-${badge.color}-100 text-${badge.color}-700`}>
            <badge.icon className="w-3 h-3" />
            <span className={`hidden sm:inline`}>{t(badge.textKey)}</span>
            {badge.mobileTextKey && <span className="sm:hidden">{t(badge.mobileTextKey)}</span>}
          </div>
        ))}
        
        {detectedTextLanguage && text.trim() && (
          <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-orange-100 text-orange-700">
            <Globe className="w-3 h-3" />
            <span className="text-xs">
              📝 {t('status.detectedText')}: {getLanguageName(detectedTextLanguage.language)}
            </span>
          </div>
        )}

        {testingModeActive && (
          <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
            <span className="text-xs">🧪</span>
            <span>{t('status.testingMode')}</span>
          </div>
        )}
      </div>
    </div>
  );
}