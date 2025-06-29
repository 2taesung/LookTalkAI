import React, { useState } from 'react';
import { Sparkles, Volume2, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { AudioPlayer } from '../../AudioPlayer'; 
import type { Character } from '../../../lib/characters';

interface GeneratedResultProps {
  t: (key: string, args?: any) => string;
  audio: {
    id: string;
    script: string;
    audioUrl?: string;
    title: string;
  };
  character: Character | undefined;
  shouldAutoPlay: boolean;
  onShare: () => void;
  onDownload: () => void;
  narratorGender?: string;
  analysisData?: {
    imageUrl?: string;
    script?: string;
    persona?: string;
    timestamp?: number;
  };
}

export function GeneratedResult({ t, audio, character, shouldAutoPlay, onShare, onDownload, narratorGender, analysisData }: GeneratedResultProps) {
  const [showScript, setShowScript] = useState(false);
  
  // UI 언어에 따라 적절한 캐릭터 이름을 선택
  const characterName = (character as any)?.koreanName || character?.name || '';

  return (
    <>
      {/* Audio Player Card - 첫 번째로 배치 */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <h3 className="text-base sm:text-lg font-semibold">
            {t('result.playerTitle')}
          </h3>
        </CardHeader>
        <CardContent>
          <AudioPlayer
            audioUrl={audio.audioUrl}
            title={audio.script}
            character={character?.name || ''}
            onShare={onShare}
            onDownload={onDownload}
            isConversation={false}
            autoPlay={shouldAutoPlay}
            analysisData={analysisData || {
              script: audio.script,
              persona: character?.name || '',
              timestamp: Date.now()
            }}
          />
        </CardContent>
      </Card>

      {/* Enhanced Script Card - 접을 수 있는 형태로 변경 */}
      <Card>
        <CardHeader className="pb-2 sm:pb-3">
          <button
            onClick={() => setShowScript(!showScript)}
            className="w-full flex items-center justify-between text-left hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              <h3 className="text-base sm:text-lg font-semibold">
                {t('result.scriptTitle', characterName)}
              </h3>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                🎭 {t('result.scriptPill')}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 hidden sm:inline">
                {showScript ? '스크립트 숨기기' : '스크립트 보기'}
              </span>
              {showScript ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </div>
          </button>
        </CardHeader>
        
        {showScript && (
          <CardContent className="pt-0">
            <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {audio.script}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center space-x-1">
              <Volume2 className="w-3 h-3" />
              <span>{t('result.scriptFlow', characterName, narratorGender || 'Female')}</span>
            </p>
          </CardContent>
        )}
      </Card>
    </>
  );
}