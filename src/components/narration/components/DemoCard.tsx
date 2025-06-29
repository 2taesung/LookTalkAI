import React, { useState } from 'react';
import { Button } from '../../ui/Button';
import { Info, X } from 'lucide-react';

interface DemoCardProps {
  t: (key: string) => string;
  setText: (text: string) => void;
}

export function DemoCard({ t, setText }: DemoCardProps) {
  const [showModal, setShowModal] = useState(false);
  const demoText = t('demo.exampleText');

  return (
    <>
      {/* 컴팩트한 데모 카드 */}
      <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="text-lg sm:text-xl">🎙️</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-blue-900 text-sm sm:text-base">
                {t('demo.title')}
              </h3>
              <p className="text-xs text-blue-600 mt-0.5">
                내레이터 + 캐릭터 반응을 하나의 MP3로 믹싱
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs px-2 sm:px-3 py-1 sm:py-1.5"
              onClick={() => setText(demoText)}
            >
              {t('demo.tryButton')}
            </Button>
            <button
              onClick={() => setShowModal(true)}
              className="p-1.5 sm:p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <Info className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 배경 오버레이 */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          
          {/* 모달 컨텐츠 */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            {/* 헤더 */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🎙️</div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {t('demo.title')}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 컨텐츠 */}
            <div className="p-4 sm:p-6 space-y-4">
              {/* 예시 텍스트 */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">예시 입력:</h3>
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-gray-700">
                    {demoText}
                  </p>
                </div>
              </div>

              {/* 결과 예시 */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">{t('demo.resultLabel')}</h3>
                <div className="space-y-2">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800 font-medium mb-1">🎤 내레이터:</p>
                    <p className="text-xs text-blue-700">
                      원본 텍스트를 중립적인 목소리로 읽습니다
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-800 font-medium mb-1">🎭 Trump:</p>
                    <p className="text-xs text-purple-700">
                      "와우, 환상적이네!" (캐릭터 특유의 목소리로)
                    </p>
                  </div>
                </div>
              </div>

              {/* 프로세스 설명 */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Reaction Voice 프로세스:</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">1</span>
                    <span>내레이터가 원본 텍스트 읽기</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-medium">2</span>
                    <span>캐릭터가 다른 목소리로 반응</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-medium">3</span>
                    <span>두 음성을 하나의 MP3로 믹싱</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-medium">4</span>
                    <span>🎉 자동 재생 및 다운로드 가능</span>
                  </div>
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="pt-4 border-t border-gray-200">
                <Button
                  onClick={() => {
                    setText(demoText);
                    setShowModal(false);
                  }}
                  className="w-full"
                  size="lg"
                >
                  🎙️ {t('demo.tryButton')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}