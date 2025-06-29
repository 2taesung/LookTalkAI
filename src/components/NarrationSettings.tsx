import React from 'react'
import type { NarrationSettings } from '../lib/narration'

interface NarrationSettingsProps {
  settings: NarrationSettings
  onSettingsChange: (settings: Partial<NarrationSettings>) => void
  detectedLanguage?: string
  uiLanguage?: string
}

export function NarrationSettings({ settings, onSettingsChange, detectedLanguage, uiLanguage = 'en' }: NarrationSettingsProps) {
  const getLocalizedText = (ko: string, en: string, ja?: string, zh?: string) => {
    if (uiLanguage === 'ko') return ko
    if (uiLanguage === 'ja') return ja || en
    if (uiLanguage === 'zh') return zh || en
    return en
  }
  
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 나레이터 성별 선택 */}
      <div className="space-y-2 sm:space-y-3">
        <h3 className="text-xs sm:text-sm font-medium text-gray-700">
          {getLocalizedText('나레이터 성별', 'Narrator Gender', 'ナレーター性別', '旁白性别')}
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          {(['female', 'male'] as const).map((gender) => (
            <label key={gender} className="cursor-pointer">
              <input
                type="radio"
                name="narratorGender"
                value={gender}
                checked={settings.narratorGender === gender}
                onChange={(e) => onSettingsChange({ narratorGender: e.target.value as 'male' | 'female' })}
                className="sr-only"
              />
              <div className={`p-3 sm:p-4 rounded-lg border-2 text-center transition-all duration-200 ${
                settings.narratorGender === gender
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 text-gray-600 hover:border-purple-300'
              }`}>
                <div className="text-lg sm:text-xl mb-1">
                  {gender === 'female' ? '👩' : '👨'}
                </div>
                <div className="font-medium text-xs sm:text-sm">
                  {getLocalizedText(
                    gender === 'female' ? '여성' : '남성',
                    gender === 'female' ? 'Female' : 'Male',
                    gender === 'female' ? '女性' : '男性',
                    gender === 'female' ? '女性' : '男性'
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {getLocalizedText(
                    gender === 'female' ? '부드러운 목소리' : '깊은 목소리',
                    gender === 'female' ? 'Soft voice' : 'Deep voice',
                    gender === 'female' ? '柔らかい声' : '深い声',
                    gender === 'female' ? '柔和声音' : '深沉声音'
                  )}
                </div>
              </div>
            </label>
          ))}
        </div>
        <div className="text-xs text-gray-500">
          {getLocalizedText(
            '원본 텍스트를 읽는 나레이터의 성별을 선택하세요',
            'Choose the gender of the narrator who reads the original text',
            '元のテキストを読むナレーターの性別を選択してください',
            '选择朗读原文的旁白性别'
          )}
        </div>
      </div>

      {/* 반응 빈도 */}
      <div className="space-y-2 sm:space-y-3">
        <h3 className="text-xs sm:text-sm font-medium text-gray-700">
          {getLocalizedText('캐릭터 반응 빈도', 'Character Reaction Frequency', 'キャラクターリアクション頻度', '角色反应频率')}
        </h3>
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {(['low', 'medium', 'high'] as const).map((frequency) => (
            <label key={frequency} className="cursor-pointer">
              <input
                type="radio"
                name="frequency"
                value={frequency}
                checked={settings.reactionFrequency === frequency}
                onChange={(e) => onSettingsChange({ reactionFrequency: e.target.value as 'low' | 'medium' | 'high' })}
                className="sr-only"
              />
              <div className={`p-2 sm:p-3 rounded-lg border-2 text-center transition-all duration-200 ${
                settings.reactionFrequency === frequency
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 text-gray-600 hover:border-purple-300'
              }`}>
                <div className="font-medium capitalize text-xs sm:text-sm">
                  {getLocalizedText(
                    frequency === 'low' ? '낮음' : frequency === 'medium' ? '보통' : '높음',
                    frequency,
                    frequency === 'low' ? '低' : frequency === 'medium' ? '中' : '高',
                    frequency === 'low' ? '低' : frequency === 'medium' ? '中' : '高'
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {frequency === 'low' && getLocalizedText('1-2개 반응', '1-2 reactions', '1-2個のリアクション', '1-2个反应')}
                  {frequency === 'medium' && getLocalizedText('3-4개 반응', '3-4 reactions', '3-4個のリアクション', '3-4个反应')}
                  {frequency === 'high' && getLocalizedText('5-6개 반응', '5-6 reactions', '5-6個のリアクション', '5-6个反应')}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* 음성 속도 */}
      <div className="space-y-2 sm:space-y-3">
        <h3 className="text-xs sm:text-sm font-medium text-gray-700">
          {getLocalizedText('Reaction Voice 속도', 'Reaction Voice Speed', 'リアクションボイス速度', '反应语音速度')}
        </h3>
        <select
          value={settings.voiceSpeed}
          onChange={(e) => onSettingsChange({ voiceSpeed: parseFloat(e.target.value) })}
          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs sm:text-sm"
        >
          <option value={0.75}>
            0.75x ({getLocalizedText('느리게', 'Slower', 'ゆっくり', '较慢')})
          </option>
          <option value={1.0}>
            1.0x ({getLocalizedText('보통', 'Normal', '普通', '正常')})
          </option>
          <option value={1.25}>
            1.25x ({getLocalizedText('빠르게', 'Faster', '速く', '较快')})
          </option>
        </select>
        <div className="text-xs text-gray-500">
          {getLocalizedText(
            '내레이터와 캐릭터 음성 모두에 적용됩니다',
            'Applied to both narrator and character voices',
            'ナレーターとキャラクター音声の両方に適用されます',
            '应用于旁白和角色语音'
          )}
        </div>
      </div>

      {/* 얼굴 애니메이션 */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-2 sm:pr-3">
          <div className="font-medium text-gray-900 text-xs sm:text-sm">
            {getLocalizedText('캐릭터 애니메이션 표시', 'Show Character Animation', 'キャラクターアニメーション表示', '显示角色动画')}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {getLocalizedText('Reaction Voice 재생 중 시각적 반응', 'Visual reactions during Reaction Voice playback', 'リアクションボイス再生中の視覚的リアクション', '反应语音播放期间的视觉反应')}
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.showFacialAnimation}
            onChange={(e) => onSettingsChange({ showFacialAnimation: e.target.checked })}
            className="sr-only"
          />
          <div className={`w-9 h-5 sm:w-11 sm:h-6 rounded-full transition-colors duration-200 ${
            settings.showFacialAnimation ? 'bg-purple-600' : 'bg-gray-300'
          }`}>
            <div className={`w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
              settings.showFacialAnimation ? 'translate-x-4 sm:translate-x-5' : 'translate-x-0'
            } mt-0.5 ml-0.5`} />
          </div>
        </label>
      </div>
    </div>
  )
}