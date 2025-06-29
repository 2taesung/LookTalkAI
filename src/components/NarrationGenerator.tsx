import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Mic, Zap, Crown, Settings, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { CharacterSelector } from './CharacterSelector';
import { NarrationSettings } from './NarrationSettings';
import { characters } from '../lib/characters';
import { defaultSettings, generateNarration, canGenerateAsGuest, getGuestUsage, isTestingMode } from '../lib/narration';
import { detectLanguage } from '../lib/languageDetection';
import type { NarrationSettings as NarrationSettingsType } from '../lib/narration';
import type { Character } from '../lib/characters';

// 새로 만든 하위 컴포넌트들
import { useLocalization } from './narration/hooks';
import { MAX_CHARS } from './narration/constants';
import { GeneratorHeader } from './narration/components/GeneratorHeader';
import { DemoCard } from './narration/components/DemoCard';
import { ErrorDisplay } from './narration/components/ErrorDisplay';
import { GeneratedResult } from './narration/components/GeneratedResult';
import { GenerationStatus } from './narration/components/GenerationStatus';

interface NarrationGeneratorProps {
  selectedLanguage: 'en' | 'ko' | 'ja' | 'zh';
}

export function NarrationGenerator({ selectedLanguage }: NarrationGeneratorProps) {
  // --- State Management ---
  const [text, setText] = useState('');
  const [settings, setSettings] = useState<NarrationSettingsType>(defaultSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<{ id: string; script: string; audioUrl?: string; title: string; } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
  
  // --- Refs for scrolling ---
  const generationStatusRef = useRef<HTMLDivElement>(null);
  
  // --- Derived State & Hooks ---
  const t = useLocalization(selectedLanguage);
  const selectedCharacter = characters.find(c => c.id === settings.character);
  const guestUsage = getGuestUsage();
  const canGenerate = canGenerateAsGuest();
  const testingModeActive = isTestingMode();
  const detectedTextLanguage = text ? detectLanguage(text) : null;

  const getCharacterNameForLocale = (char: Character | undefined) => {
    if (!char) return '';
    if (selectedLanguage === 'ko') return char.koreanName || char.name;
    return char.name;
  };
  const characterName = getCharacterNameForLocale(selectedCharacter);

  const getNarratorGenderText = (gender: 'male' | 'female') => {
    if (selectedLanguage === 'ko') return gender === 'female' ? '여성' : '남성';
    if (selectedLanguage === 'ja') return gender === 'female' ? '女性' : '男性';
    if (selectedLanguage === 'zh') return gender === 'female' ? '女性' : '男性';
    return gender === 'female' ? 'Female' : 'Male';
  };
  const narratorGenderText = getNarratorGenderText(settings.narratorGender);

  // Scroll to generation status when generation starts
  useEffect(() => {
    if (isGenerating && generationStatusRef.current) {
      generationStatusRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [isGenerating]);

  // --- Handlers ---
  const handleGenerate = useCallback(async () => {
    if (!text.trim() || (!canGenerate && !testingModeActive)) return;

    setIsGenerating(true);
    setError(null);
    setShouldAutoPlay(false);
    setGeneratedAudio(null);
    
    try {
      console.log('🎙️ 🔥 CRITICAL: Reaction Voice 생성 시작...');
      setGenerationStep(t('steps.initializing'));
      await new Promise(r => setTimeout(r, 200));
      setGenerationStep(t('steps.creatingScript'));
      await new Promise(r => setTimeout(r, 1000));
      setGenerationStep(t('steps.addingPersonality'));
      await new Promise(r => setTimeout(r, 500));
      setGenerationStep(t('steps.generatingVoice', characterName, narratorGenderText));

      const result = await generateNarration(text, settings);
      
      console.log('🎉 보장된 생성 결과:', result);
      setGenerationStep(t('steps.mixingAudio'));
      await new Promise(r => setTimeout(r, 2000));

      setGeneratedAudio({
        id: result.id,
        script: result.scriptOutput,
        audioUrl: result.audioUrl,
        title: result.scriptOutput,
      });

      console.log('🎉 보장된 내레이션 생성 성공! 자동 재생 활성화...');
      setShouldAutoPlay(true);
      
    } catch (err) {
      console.error('❌ 생성 실패:', err);
      setError(err instanceof Error ? err.message : t('error.generic'));
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  }, [text, settings, canGenerate, testingModeActive, characterName, narratorGenderText, t]);
  
  const handleCancelGeneration = () => {
    console.log('🛑 오디오 생성 취소됨');
    setIsGenerating(false);
    setGenerationStep('');
  };
  
  const handleShare = () => {
    if (generatedAudio) {
      navigator.share?.({
        title: t('title'),
        text: generatedAudio.script,
        url: window.location.href,
      });
    }
  };

  const handleDownload = () => {
    console.log('AudioPlayer에서 다운로드 시작됨');
  };

  // --- Rendering ---
  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6 px-3 sm:px-0">
      {/* Removed the large title since it's now in the navigation */}
      
      <DemoCard t={t} setText={setText} />

      {error && <ErrorDisplay error={error} setError={setError} t={t} />}

      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              <h2 className="text-base sm:text-lg font-semibold">{t('generator.cardTitle')}</h2>
            </div>
          </div>
          {!showSettings && (
            <div className="mt-3 p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                        <span className="text-gray-600">{t('generator.settingsPreview.narrator')}: <span className="font-medium text-gray-900">{narratorGenderText}</span></span>
                        <span className="text-gray-600">{t('generator.settingsPreview.speed')}: <span className="font-medium text-gray-900">{settings.voiceSpeed}x</span></span>
                        <span className="text-gray-600">{t('generator.settingsPreview.reactions')}: <span className="font-medium text-gray-900 capitalize">{settings.reactionFrequency}</span></span>
                        <span className="text-gray-600">{t('generator.settingsPreview.mode')}: <span className="font-medium text-blue-700">🎭 {t('generator.settingsPreview.modeType')}</span></span>
                    </div>
                    <button onClick={() => setShowSettings(true)} className="text-purple-600 hover:text-purple-700 font-medium flex items-center space-x-1 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-colors text-xs sm:text-sm">
                        <Settings className="w-3 h-3" />
                        <span>{t('generator.settingsPreview.settingsButton')}</span>
                        <ChevronDown className="w-3 h-3" />
                    </button>
                </div>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4 sm:space-y-6">
          {showSettings && (
             <div className="animate-in slide-in-from-top-2 duration-300">
                <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                        <Settings className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                        <h3 className="font-medium text-purple-900 text-sm sm:text-base">{t('generator.settingsPanel.title')}</h3>
                        <div className="flex-1" />
                        <button onClick={() => setShowSettings(false)} className="text-purple-600 hover:text-purple-700 p-1 rounded-full hover:bg-purple-100 transition-colors">
                            <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                    </div>
                    <NarrationSettings
                        settings={settings}
                        onSettingsChange={(updates) => setSettings({ ...settings, ...updates })}
                        detectedLanguage={detectedTextLanguage?.language}
                        uiLanguage={selectedLanguage}
                    />
                </div>
             </div>
          )}

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">{t('generator.character.label')}</label>
            <CharacterSelector
                selectedCharacter={settings.character}
                onSelect={(character) => setSettings({ ...settings, character })}
                inputText={text}
                uiLanguage={selectedLanguage}
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{t('generator.textArea.label')}</label>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
                placeholder={t('generator.textArea.placeholder')}
                className="w-full h-24 sm:h-32 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
            />
            <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-500">{text.length}/{MAX_CHARS} {t('generator.charCount')}</span>
                {!canGenerate && !testingModeActive && (<span className="text-orange-600 font-medium">{t('generator.limit.dailyReached', guestUsage.count)}</span>)}
                {testingModeActive && (<span className="text-yellow-600 font-medium">🧪 {t('generator.limit.testingMode')}</span>)}
            </div>
          </div>

          <div className="space-y-3">
            <Button onClick={handleGenerate} disabled={!text.trim() || (!canGenerate && !testingModeActive) || isGenerating} loading={isGenerating} size="lg" className="w-full text-sm sm:text-base">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {isGenerating ? t('generator.generating') : t('generator.generateButton', characterName, narratorGenderText)}
            </Button>
            {!canGenerate && !testingModeActive && (
                <div className="p-3 sm:p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-start space-x-2 sm:space-x-3">
                        <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-orange-900 text-sm sm:text-base">{t('generator.limit.limitCardTitle')}</h3>
                            <p className="text-xs sm:text-sm text-orange-700 mt-1">{t('generator.limit.limitCardMessage')}</p>
                        </div>
                    </div>
                </div>
            )}
          </div>
        </CardContent>
      </Card>

      {isGenerating && (
        <div ref={generationStatusRef}>
          <Card>
            <CardHeader className="pb-3 sm:pb-4 relative">
              <div className="flex justify-between items-center">
                <h3 className="text-base sm:text-lg font-semibold">
                  {t('result.playerTitle')}
                </h3>
                <button 
                  onClick={handleCancelGeneration}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  title={getText('취소', 'Cancel', '取消')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 sm:py-8">
                <div className="animate-spin w-6 h-6 sm:w-8 sm:h-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-3 sm:mb-4" />
                <p className="text-gray-600 font-medium text-sm sm:text-base">{generationStep}</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  {t('generatingStatus.title', characterName, narratorGenderText)}
                </p>
                <div className="mt-3 sm:mt-4 text-xs text-gray-400 space-y-1">
                  {(t('generatingStatus.steps', null) as unknown as string[]).map((step: string, index: number) => (
                      <p key={index}>• {step}</p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {generatedAudio && !isGenerating && (
        <GeneratedResult
          t={t}
          audio={generatedAudio}
          character={selectedCharacter}
          shouldAutoPlay={shouldAutoPlay}
          onShare={handleShare}
          onDownload={handleDownload}
          narratorGender={narratorGenderText}
        />
      )}
      
      <div className="text-center text-xs sm:text-sm text-gray-500 px-2">
        {testingModeActive ? (
          <p>🧪 {t('footer.testingMode')}</p>
        ) : (
          <>
            <p>{t('footer.usage', guestUsage.count)}</p>
            <p className="mt-1">{t('footer.features')}</p>
          </>
        )}
      </div>
    </div>
  );
  
  function getText(ko: string, en: string, zh: string) {
    switch (selectedLanguage) {
      case 'ko': return ko;
      case 'zh': return zh;
      default: return en;
    }
  }
}