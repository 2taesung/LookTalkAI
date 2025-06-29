import React from 'react'
import { characters, type CharacterId } from '../lib/characters'
import { detectLanguage, getLocalizedCharacterInfo } from '../lib/languageDetection'

interface CharacterSelectorProps {
  selectedCharacter: CharacterId
  onSelect: (character: CharacterId) => void
  inputText?: string // 언어 감지를 위한 입력 텍스트
  uiLanguage?: string // UI 언어
}

export function CharacterSelector({ selectedCharacter, onSelect, inputText = '', uiLanguage = 'en' }: CharacterSelectorProps) {
  // 입력 텍스트가 있으면 언어 감지 (스크립트 생성용)
  const detectedTextLanguage = inputText ? detectLanguage(inputText).language : 'en-US'
  
  const getLocalizedText = (ko: string, en: string, ja?: string, zh?: string) => {
    if (uiLanguage === 'ko') return ko
    if (uiLanguage === 'ja') return ja || en
    if (uiLanguage === 'zh') return zh || en
    return en
  }
  
  return (
    <div className="space-y-3">
      {/* 언어 감지 표시기만 (제목 제거) */}
      {inputText && (
        <div className="flex justify-end">
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            🔍 {getLocalizedText('텍스트', 'Text', 'テキスト', '文本')}: {
              detectedTextLanguage.startsWith('ko') ? '한국어' : 
              detectedTextLanguage.startsWith('ja') ? '日本語' :
              detectedTextLanguage.startsWith('zh') ? '中文' : 'English'
            } {getLocalizedText('감지됨', 'detected', '検出', '检测到')}
          </div>
        </div>
      )}
      
      {/* 캐릭터 그리드 - Trump만 표시 */}
      <div className="grid grid-cols-1 gap-3">
        {characters.map((character) => {
          const localizedInfo = getLocalizedCharacterInfo(character, uiLanguage)
          
          return (
            <button
              key={character.id}
              onClick={() => onSelect(character.id)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 text-left hover:shadow-md ${
                selectedCharacter === character.id
                  ? 'border-purple-500 bg-purple-50 shadow-md'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{character.avatar}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {localizedInfo.name}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {localizedInfo.description}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
      
      {/* 언어별 안내 메시지 */}
      <div className="text-xs text-gray-500 text-center">
        {getLocalizedText(
          '💡 입력한 텍스트 언어에 맞춰 자동으로 음성이 조정됩니다',
          '💡 Voice will be automatically adjusted based on your input language',
          '💡 入力したテキストの言語に合わせて自動的に音声が調整されます',
          '💡 语音将根据您输入的文本语言自动调整'
        )}
      </div>
    </div>
  )
}