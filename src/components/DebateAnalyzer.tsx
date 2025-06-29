import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Crown, Zap, Share2, Loader2, Users, ArrowRightLeft, Plus, X, Shuffle, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { PhotoUploader } from './PhotoUploader';
import { PersonaSelector } from './PersonaSelector';
import { AudioPlayer } from './AudioPlayer';
import { personas, getLocalizedPersonaInfo } from '../lib/personas';
import { analyzePhotoDebate, canAnalyzeAsGuest, getGuestUsage } from '../lib/debateAnalysis';
import type { PersonaId } from '../lib/personas';
import type { DebateResult } from '../lib/debateAnalysis';

// Supabase 연동을 위한 import
import { supabase } from '../lib/supabaseClient';
import { createShareableContent } from '../lib/supabaseActions';

// Base64 문자열을 Blob 객체로 변환하는 헬퍼 함수
function base64ToBlob(base64: string, contentType = 'image/png'): Blob {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
}

interface DebateAnalyzerProps {
  selectedLanguage: string;
}

export function DebateAnalyzer({ selectedLanguage }: DebateAnalyzerProps) {
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedPersona1, setSelectedPersona1] = useState<PersonaId>('witty-entertainer');
  const [selectedPersona2, setSelectedPersona2] = useState<PersonaId>('art-critic');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [debateResult, setDebateResult] = useState<DebateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showPersona1Selector, setShowPersona1Selector] = useState(false);
  const [showPersona2Selector, setShowPersona2Selector] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');

  // 분석 버튼 참조를 위한 ref
  const analyzeButtonRef = useRef<HTMLDivElement>(null);
  // 분석 상태 표시 영역 참조
  const analysisStatusRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const guestUsage = getGuestUsage();
  const canAnalyze = canAnalyzeAsGuest();
  const persona1Data = personas.find(p => p.id === selectedPersona1);
  const persona2Data = personas.find(p => p.id === selectedPersona2);
  const localizedPersona1Info = persona1Data ? getLocalizedPersonaInfo(persona1Data, selectedLanguage) : null;
  const localizedPersona2Info = persona2Data ? getLocalizedPersonaInfo(persona2Data, selectedLanguage) : null;

  const getText = (ko: string, en: string, zh: string) => {
    switch (selectedLanguage) {
      case 'ko': return ko;
      case 'zh': return zh;
      default: return en;
    }
  };

  // 이미지가 선택되었을 때 페르소나 선택 섹션으로 스크롤
  useEffect(() => {
    if (selectedImage && analyzeButtonRef.current) {
      setTimeout(() => {
        const element = analyzeButtonRef.current;
        if (element) {
          const elementRect = element.getBoundingClientRect();
          const absoluteElementTop = elementRect.top + window.pageYOffset;
          const middle = absoluteElementTop - (window.innerHeight / 3);
          
          window.scrollTo({
            top: middle,
            behavior: 'smooth'
          });
        }
      }, 300);
    }
  }, [selectedImage]);

  // 분석 시작 시 분석 상태 영역으로 스크롤
  useEffect(() => {
    if (isAnalyzing && analysisStatusRef.current) {
      analysisStatusRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [isAnalyzing]);

  const handleAnalyze = async () => {
    if (!selectedImage || !canAnalyze) return;

    setIsAnalyzing(true);
    setError(null);
    setShouldAutoPlay(false);
    setDebateResult(null);
    setCurrentStep('');

    try {
      console.log('🎭 이미지 기반 순차적 토론 분석 시작...');
      
      // 진행 상황 시뮬레이션
      const steps = [
        getText('이미지 분석 중...', 'Analyzing image...', '正在分析图像...'),
        getText('이미지 내용 파악 중...', 'Understanding image content...', '正在理解图像内容...'),
        getText(`${localizedPersona1Info?.name}의 이미지 기반 첫 번째 의견 생성 중...`, `Generating ${localizedPersona1Info?.name}'s first image-based opinion...`, `正在生成${localizedPersona1Info?.name}基于图像的第一个观点...`),
        getText(`${localizedPersona2Info?.name}의 이미지 기반 응답 생성 중...`, `Generating ${localizedPersona2Info?.name}'s image-based response...`, `正在生成${localizedPersona2Info?.name}基于图像的回应...`),
        getText(`${localizedPersona1Info?.name}의 이미지 세부사항 반박 생성 중...`, `Generating ${localizedPersona1Info?.name}'s image detail counterargument...`, `正在生成${localizedPersona1Info?.name}的图像细节反驳...`),
        getText(`${localizedPersona2Info?.name}의 이미지 최종 분석 생성 중...`, `Generating ${localizedPersona2Info?.name}'s final image analysis...`, `正在生成${localizedPersona2Info?.name}的最终图像分析...`),
        getText('음성 합성 및 믹싱 중...', 'Synthesizing and mixing voices...', '正在合成和混合语音...')
      ];

      let stepIndex = 0;
      const stepInterval = setInterval(() => {
        if (stepIndex < steps.length) {
          setCurrentStep(steps[stepIndex]);
          stepIndex++;
        }
      }, 2000);

      const result = await analyzePhotoDebate({
        persona1: selectedPersona1,
        persona2: selectedPersona2,
        imageData: selectedImage,
        language: selectedLanguage,
      });

      clearInterval(stepInterval);
      setCurrentStep(getText('완료!', 'Complete!', '完成！'));
      
      setDebateResult(result);
      setShouldAutoPlay(true);
      console.log('✅ 이미지 기반 순차적 토론 분석 완료!');
    } catch (err) {
      console.error('❌ 토론 분석 실패:', err);
      setError(err instanceof Error ? err.message : getText('토론 분석에 실패했습니다', 'Debate analysis failed', '辩论分析失败'));
    } finally {
      setIsAnalyzing(false);
      setCurrentStep('');
    }
  };

  const handleCancelAnalysis = () => {
    console.log('🛑 토론 분석 취소됨');
    setIsAnalyzing(false);
    setCurrentStep('');
  };

  const handleShare = async () => {
    if (!debateResult || !selectedImage || isSharing) return;

    setIsSharing(true);
    try {
      console.log('🔗 Supabase에 토론 데이터 저장 시작...');

      // 1. 이미지를 Storage에 업로드
      const imageBlob = base64ToBlob(selectedImage);
      const imageFilePath = `public/debate-image-${Date.now()}.png`;
      const { data: imageUploadData, error: imageError } = await supabase.storage
        .from('media')
        .upload(imageFilePath, imageBlob, { contentType: 'image/png' });

      if (imageError) throw new Error(`이미지 업로드 실패: ${imageError.message}`);

      const { data: { publicUrl: imagePublicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(imageFilePath);

      // 2. 오디오 파일을 Storage에 업로드
      let audioFile = debateResult.audioBlob;
      
      if (!audioFile && debateResult.audioUrl && debateResult.audioUrl.startsWith('blob:')) {
        try {
          const response = await fetch(debateResult.audioUrl);
          audioFile = await response.blob();
        } catch (error) {
          console.error('❌ Blob URL에서 데이터 추출 실패:', error);
        }
      }
      
      if (!audioFile) {
        throw new Error('오디오 Blob이 생성되지 않았습니다.');
      }
      
      const audioFilePath = `public/debate-audio-${Date.now()}.mp3`;
      const { data: audioUploadData, error: audioError } = await supabase.storage
        .from('media')
        .upload(audioFilePath, audioFile, { 
          contentType: 'audio/mpeg',
          cacheControl: '3600',
          upsert: false
        });

      if (audioError) {
        throw new Error(`오디오 업로드 실패: ${audioError.message}`);
      }

      const { data: { publicUrl: audioPublicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(audioFilePath);

      // 3. DB에 저장할 데이터 정리
      const contentToSave = {
        image_url: imagePublicUrl,
        audio_url: audioPublicUrl,
        script: debateResult.script,
        persona: `${selectedPersona1}-vs-${selectedPersona2}`, // 토론 페르소나 조합
      };

      // 4. DB에 저장하고 ID 받기
      const newShareId = await createShareableContent(contentToSave);

      if (!newShareId) {
        throw new Error("DB 저장 후 ID를 받지 못했습니다.");
      }

      console.log(`✅ 토론 공유 링크 생성 완료! ID: ${newShareId}`);

      // 5. 공유 페이지로 이동
      navigate(`/shared/${newShareId}`);

    } catch (error) {
      console.error('❌ 토론 공유 실패:', error);
      const errorMessage = error instanceof Error ? error.message : getText('공유에 실패했습니다', 'Failed to share', '分享失败');
      alert(errorMessage);
    } finally {
      setIsSharing(false);
    }
  };
  
  const handleDownload = () => {
    if (debateResult?.audioBlob) {
        const url = URL.createObjectURL(debateResult.audioBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `LookTalkAI_debate_${Date.now()}.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
  };

  const handleClearImage = () => {
    setSelectedImage('');
    setDebateResult(null);
    setError(null);
  };

  const handleImageSelect = (imageData: string) => {
    setSelectedImage(imageData);
    setError(null);
    setDebateResult(null);
  };

  const swapPersonas = () => {
    const temp = selectedPersona1;
    setSelectedPersona1(selectedPersona2);
    setSelectedPersona2(temp);
  };

  const randomizePersonas = () => {
    const availablePersonas = personas.filter(p => p.id !== selectedPersona1 && p.id !== selectedPersona2);
    if (availablePersonas.length >= 2) {
      const shuffled = [...availablePersonas].sort(() => Math.random() - 0.5);
      setSelectedPersona1(shuffled[0].id);
      setSelectedPersona2(shuffled[1].id);
    }
  };

  // 토론 모드용 간소화된 PersonaCard 컴포넌트
  const PersonaCard = ({ 
    persona, 
    isSelected, 
    onClick, 
    position 
  }: { 
    persona: PersonaId; 
    isSelected: boolean; 
    onClick: () => void;
    position: 'left' | 'right';
  }) => {
    const personaData = personas.find(p => p.id === persona);
    const localizedInfo = personaData ? getLocalizedPersonaInfo(personaData, selectedLanguage) : null;
    
    return (
      <div 
        className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 transform-gpu ${
          isSelected 
            ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 shadow-lg' 
            : 'border-gray-200 hover:border-purple-300 bg-white hover:shadow-md hover:scale-105'
        }`}
        onClick={onClick}
      >
        <div className="flex items-center space-x-2">
          <div className="text-2xl">{personaData?.avatar}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
              {localizedInfo?.name}
            </h3>
            <p className="text-xs text-gray-600 truncate">
              {localizedInfo?.description}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-3 sm:px-0">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Users className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">
            {getText('토론 모드', 'Debate Mode', '辩论模式')}
          </h2>
        </div>
        <p className="text-base sm:text-lg text-gray-600 px-2">
          {getText(
            '두 AI 페르소나가 업로드된 사진에 대해 순차적으로 토론합니다',
            'Two AI personas debate about the uploaded photo sequentially',
            '两个AI角色对上传的照片进行顺序辩论'
          )}
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700">
            <ImageIcon className="w-3 h-3" />
            <span>{getText('이미지 기반 토론', 'Image-based Debate', '基于图像的辩论')}</span>
          </div>
          <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-green-100 text-green-700">
            <MessageSquare className="w-3 h-3" />
            <span>{getText('순차적 대화', 'Sequential Conversation', '顺序对话')}</span>
          </div>
          <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-purple-100 text-purple-700">
            <span>🎵</span>
            <span>{getText('믹싱된 음성', 'Mixed Audio', '混合音频')}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <span className="text-red-600">⚠️</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-red-900 text-sm sm:text-base">
                {getText('토론 분석 오류', 'Debate Analysis Error', '辩论分析错误')}
              </h3>
              <p className="text-xs sm:text-sm text-red-700 mt-1">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 text-xs"
                onClick={() => setError(null)}
              >
                {getText('다시 시도', 'Try Again', '重试')}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-lg sm:text-xl font-semibold flex items-center space-x-2">
            <span>📸</span>
            <span>{getText('사진 업로드', 'Photo Upload', '照片上传')}</span>
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            {getText(
              '업로드된 사진의 내용을 바탕으로 두 페르소나가 토론합니다',
              'Two personas will debate based on the content of the uploaded photo',
              '两个角色将基于上传照片的内容进行辩论'
            )}
          </p>
        </CardHeader>
        <CardContent>
          <PhotoUploader
            onImageSelect={handleImageSelect}
            selectedImage={selectedImage}
            onClearImage={handleClearImage}
            disabled={isAnalyzing || isSharing}
            language={selectedLanguage}
          />
        </CardContent>
      </Card>

      {selectedImage && (
        <Card ref={analyzeButtonRef}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold flex items-center space-x-2">
                <span>🎭</span>
                <span>{getText('토론 페르소나 선택', 'Choose Debate Personas', '选择辩论角色')}</span>
              </h2>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={randomizePersonas}
                  className="flex items-center space-x-1"
                  disabled={isAnalyzing || isSharing}
                >
                  <Shuffle className="w-4 h-4" />
                  <span className="hidden sm:inline">{getText('랜덤', 'Random', '随机')}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={swapPersonas}
                  className="flex items-center space-x-1"
                  disabled={isAnalyzing || isSharing}
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">{getText('순서 바꾸기', 'Swap', '交换')}</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 페르소나 선택 카드들 - 토론 모드에 최적화된 레이아웃 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-blue-700">
                    {getText('첫 번째 페르소나', 'First Persona', '第一个角色')}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPersona1Selector(!showPersona1Selector)}
                    className="text-xs"
                    disabled={isAnalyzing || isSharing}
                  >
                    {showPersona1Selector ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    <span className="ml-1">{getText('변경', 'Change', '更改')}</span>
                  </Button>
                </div>
                
                <PersonaCard
                  persona={selectedPersona1}
                  isSelected={true}
                  onClick={() => setShowPersona1Selector(!showPersona1Selector)}
                  position="left"
                />
                
                {showPersona1Selector && (
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-lg">
                      <PersonaSelector
                        selectedPersona={selectedPersona1}
                        onSelect={(persona) => {
                          setSelectedPersona1(persona);
                          setShowPersona1Selector(false);
                        }}
                        disabled={isAnalyzing || isSharing}
                        language={selectedLanguage}
                        isDebateMode={true}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-red-700">
                    {getText('두 번째 페르소나', 'Second Persona', '第二个角色')}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPersona2Selector(!showPersona2Selector)}
                    className="text-xs"
                    disabled={isAnalyzing || isSharing}
                  >
                    {showPersona2Selector ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    <span className="ml-1">{getText('변경', 'Change', '更改')}</span>
                  </Button>
                </div>
                
                <PersonaCard
                  persona={selectedPersona2}
                  isSelected={true}
                  onClick={() => setShowPersona2Selector(!showPersona2Selector)}
                  position="right"
                />
                
                {showPersona2Selector && (
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-lg">
                      <PersonaSelector
                        selectedPersona={selectedPersona2}
                        onSelect={(persona) => {
                          setSelectedPersona2(persona);
                          setShowPersona2Selector(false);
                        }}
                        disabled={isAnalyzing || isSharing}
                        language={selectedLanguage}
                        isDebateMode={true}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* VS 표시 */}
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-4 bg-gradient-to-r from-purple-100 to-blue-100 px-6 py-3 rounded-full border-2 border-purple-200">
                <div className="w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  VS
                </span>
                <div className="w-8 h-0.5 bg-gradient-to-r from-purple-500 to-red-500"></div>
              </div>
            </div>

            {/* 이미지 기반 토론 설명 */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center space-x-2">
                <ImageIcon className="w-4 h-4" />
                <span>{getText('이미지 기반 토론 방식', 'Image-based Debate Process', '基于图像的辩论过程')}</span>
              </h4>
              <div className="text-xs text-blue-700 space-y-1">
                <p>1. {getText('AI가 업로드된 사진의 내용을 상세히 분석', 'AI analyzes the uploaded photo content in detail', 'AI详细分析上传照片的内容')}</p>
                <p>2. {getText(`${localizedPersona1Info?.name}가 사진에 대한 첫 번째 의견 제시`, `${localizedPersona1Info?.name} presents first opinion about the photo`, `${localizedPersona1Info?.name}对照片提出第一个观点`)}</p>
                <p>3. {getText(`${localizedPersona2Info?.name}가 사진 내용을 바탕으로 응답 및 반박`, `${localizedPersona2Info?.name} responds and counters based on photo content`, `${localizedPersona2Info?.name}基于照片内容回应和反驳`)}</p>
                <p>4. {getText('사진의 구체적인 요소들(색상, 구도, 피사체 등)을 언급하며 토론', 'Debate mentioning specific photo elements (colors, composition, subjects, etc.)', '提及照片的具体元素（颜色、构图、主体等）进行辩论')}</p>
                <p>5. {getText('각 발언이 개별 음성으로 합성되어 하나의 오디오로 믹싱', 'Each statement is synthesized individually and mixed into one audio', '每个发言单独合成语音并混合成一个音频')}</p>
              </div>
            </div>

            {/* 토론 시작 버튼 */}
            <div className="space-y-4">
              <Button
                onClick={handleAnalyze}
                disabled={!selectedImage || !canAnalyze || isAnalyzing || isSharing || selectedPersona1 === selectedPersona2}
                size="lg"
                className="w-full text-sm sm:text-base bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {selectedPersona1 === selectedPersona2 
                  ? getText('다른 페르소나를 선택해주세요', 'Please select different personas', '请选择不同的角色')
                  : getText(
                      `🎭 사진 기반 ${localizedPersona1Info?.name} vs ${localizedPersona2Info?.name} 토론 시작!`,
                      `🎭 Start Photo-based ${localizedPersona1Info?.name} vs ${localizedPersona2Info?.name} Debate!`,
                      `🎭 开始基于照片的${localizedPersona1Info?.name} vs ${localizedPersona2Info?.name}辩论！`
                    )
                }
              </Button>
              
              {!canAnalyze && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Crown className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-orange-900 text-sm sm:text-base">
                        {getText('일일 한도 도달', 'Daily Limit Reached', '已达每日限制')}
                      </h3>
                      <p className="text-xs sm:text-sm text-orange-700 mt-1">
                        {getText(
                          '오늘 20회 무료 분석을 모두 사용했습니다. 내일 다시 오세요!',
                          'You have used all 20 free analyses today. Come back tomorrow!',
                          '您今天已用完20次免费分析。明天再来吧！'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {isAnalyzing && (
        <div ref={analysisStatusRef}>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <div className="animate-spin w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                  <span>{getText('이미지 기반 AI 토론 생성 중', 'Generating Image-based AI Debate', '正在生成基于图像的AI辩论')}</span>
                </h3>
                <button 
                  onClick={handleCancelAnalysis}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  title={getText('취소', 'Cancel', '取消')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="text-3xl animate-bounce">{persona1Data?.avatar}</div>
                    <span className="text-xs font-medium text-blue-600">{localizedPersona1Info?.name}</span>
                  </div>
                  <div className="text-2xl animate-pulse">📸💬</div>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="text-3xl animate-bounce" style={{ animationDelay: '0.5s' }}>{persona2Data?.avatar}</div>
                    <span className="text-xs font-medium text-red-600">{localizedPersona2Info?.name}</span>
                  </div>
                </div>
                
                {currentStep && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-800">{currentStep}</p>
                  </div>
                )}
                
                <p className="text-gray-600 font-medium mb-4">
                  {getText(
                    '각 페르소나가 업로드된 사진을 분석하며 순차적으로 토론하고 있습니다...',
                    'Each persona is analyzing the uploaded photo and debating sequentially...',
                    '每个角色正在分析上传的照片并顺序辩论...'
                  )}
                </p>
                
                <div className="grid grid-cols-1 gap-2 text-xs text-gray-400 max-w-md mx-auto">
                  <p>• {getText('업로드된 사진의 구체적 내용 분석', 'Analyzing specific content of uploaded photo', '分析上传照片的具体内容')}</p>
                  <p>• {getText('사진 요소 기반 첫 번째 의견 생성', 'Generating first opinion based on photo elements', '基于照片元素生成第一个观点')}</p>
                  <p>• {getText('이미지 세부사항을 포함한 응답 생성', 'Generating responses including image details', '生成包含图像细节的回应')}</p>
                  <p>• {getText('페르소나별 개별 음성 합성', 'Individual voice synthesis per persona', '每个角色的单独语音合成')}</p>
                  <p>• {getText('순차적 오디오 믹싱', 'Sequential audio mixing', '顺序音频混合')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {debateResult && !isAnalyzing && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <span>{persona1Data?.avatar}</span>
                <span className="text-purple-600">📸💬</span>
                <span>{persona2Data?.avatar}</span>
                <span>
                  {getText(
                    '이미지 기반 토론 결과',
                    'Image-based Debate Result',
                    '基于图像的辩论结果'
                  )}
                </span>
              </h3>
            </div>
          </CardHeader>
          <CardContent>
            <AudioPlayer
              audioUrl={debateResult.audioUrl}
              title={debateResult.script}
              character={`${localizedPersona1Info?.name} vs ${localizedPersona2Info?.name}`}
              onDownload={handleDownload}
              autoPlay={shouldAutoPlay}
              language={selectedLanguage}
              analysisData={{
                imageUrl: selectedImage || '',
                script: debateResult.script,
                persona: `${selectedPersona1}-vs-${selectedPersona2}`,
                timestamp: Date.now(),
                audioBlob: debateResult.audioBlob
              }}
            />
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-900 mb-2 flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>{getText('이미지 기반 토론 스크립트', 'Image-based Debate Script', '基于图像的辩论脚本')}</span>
              </h4>
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {debateResult.script}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-center text-xs sm:text-sm text-gray-500 px-2">
        <p>
          {getText(
            `무료 사용: 오늘 ${guestUsage.count}/20 분석`,
            `Free usage: ${guestUsage.count}/20 analyses today`,
            `免费使用：今天 ${guestUsage.count}/20 次分析`
          )}
        </p>
        <p className="mt-1">
          {getText(
            'AI 이미지 기반 토론 • 페르소나 대화 • 음성 믹싱 • 완전 무료',
            'AI Image-based Debate • Persona Conversation • Voice Mixing • Completely Free',
            'AI基于图像的辩论 • 角色对话 • 语音混合 • 完全免费'
          )}
        </p>
      </div>
    </div>
  );
}