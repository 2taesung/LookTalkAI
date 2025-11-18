import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Crown, Zap, Share2, Loader2, X } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { PhotoUploader } from './PhotoUploader';
import { PersonaSelector } from './PersonaSelector';
import { AudioPlayer } from './AudioPlayer';
import { personas, getLocalizedPersonaInfo } from '../lib/personas';
import { analyzePhoto, canAnalyzeAsGuest, getGuestUsage } from '../lib/photoAnalysis';
import { useImage } from '../contexts/ImageContext';
import type { PersonaId } from '../lib/personas';
import type { AnalysisResult } from '../lib/photoAnalysis';

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

interface PhotoAnalyzerProps {
  selectedLanguage: string;
}

export function PhotoAnalyzer({ selectedLanguage }: PhotoAnalyzerProps) {
  const { uploadedImage, setUploadedImage } = useImage();
  const [selectedPersona, setSelectedPersona] = useState<PersonaId>('witty-entertainer');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
  const [isSharing, setIsSharing] = useState(false); // 공유 로딩 상태

  // 분석 버튼 참조를 위한 ref
  const analyzeButtonRef = useRef<HTMLDivElement>(null);
  // 분석 상태 표시 영역 참조
  const analysisStatusRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const guestUsage = getGuestUsage();
  const canAnalyze = canAnalyzeAsGuest();
  const selectedPersonaData = personas.find(p => p.id === selectedPersona);
  const localizedPersonaInfo = selectedPersonaData ? getLocalizedPersonaInfo(selectedPersonaData, selectedLanguage) : null;

  const getText = (ko: string, en: string, zh: string) => {
    switch (selectedLanguage) {
      case 'ko': return ko;
      case 'zh': return zh;
      default: return en;
    }
  };

  // 이미지가 선택되었을 때 분석 버튼으로 스크롤 (화면 하단에서 1/5 지점에 위치)
  useEffect(() => {
    if (uploadedImage && analyzeButtonRef.current) {
      // 약간의 지연을 두어 UI 업데이트가 완료된 후 스크롤
      setTimeout(() => {
        const element = analyzeButtonRef.current;
        if (element) {
          const elementRect = element.getBoundingClientRect();
          const absoluteElementTop = elementRect.top + window.pageYOffset;
          const middle = absoluteElementTop - (window.innerHeight / 5); // 화면 하단에서 1/5 지점에 위치
          
          window.scrollTo({
            top: middle,
            behavior: 'smooth'
          });
        }
      }, 300);
    }
  }, [uploadedImage]);

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
    if (!uploadedImage || !canAnalyze) return;

    setIsAnalyzing(true);
    setError(null);
    setShouldAutoPlay(false);
    setAnalysisResult(null);

    try {
      const result = await analyzePhoto({
        persona: selectedPersona,
        imageData: uploadedImage,
        language: selectedLanguage,
      });
      setAnalysisResult(result);
      setShouldAutoPlay(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : getText('분석에 실패했습니다', 'Analysis failed', '分析失败'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCancelAnalysis = () => {
    setIsAnalyzing(false);
  };

  const handleShare = async () => {
    if (!analysisResult || !uploadedImage || isSharing) return;

    setIsSharing(true);
    try {
      // 1. 이미지(base64)를 파일로 변환하여 Storage에 업로드
      const imageBlob = base64ToBlob(uploadedImage);
      const imageFilePath = `public/image-${Date.now()}.png`;
      const { data: imageUploadData, error: imageError } = await supabase.storage
        .from('media')
        .upload(imageFilePath, imageBlob, { contentType: 'image/png' });

      if (imageError) throw new Error(`이미지 업로드 실패: ${imageError.message}`);

      const { data: { publicUrl: imagePublicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(imageFilePath);

      // 2. 오디오 파일(Blob)을 Storage에 업로드
      let audioFile = analysisResult.audioBlob;
      
      // audioBlob이 없지만 audioUrl이 blob URL인 경우, blob에서 데이터 추출
      if (!audioFile && analysisResult.audioUrl && analysisResult.audioUrl.startsWith('blob:')) {
        try {
          const response = await fetch(analysisResult.audioUrl);
          audioFile = await response.blob();
        } catch (error) {
          console.error('❌ Blob URL에서 데이터 추출 실패:', error);
        }
      }
      
      // 오디오 파일 유효성 검사
      if (!audioFile) {
        throw new Error('오디오 Blob이 생성되지 않았습니다.');
      }
      
      // 오디오 파일이 너무 작으면 (1KB 미만) 에러 처리
      if (audioFile.size < 1024) {
        throw new Error('오디오 파일이 올바르게 생성되지 않았습니다.');
      }
      
      const audioFilePath = `public/audio-${Date.now()}.mp3`;
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

      // 3. DB에 저장할 최종 데이터 정리 (user_id는 createShareableContent에서 자동 처리)
      const contentToSave = {
        image_url: imagePublicUrl,
        audio_url: audioPublicUrl,
        script: analysisResult.script,
        persona: selectedPersona, // persona 추가
      };

      // 4. 정리된 데이터를 'contents' 테이블에 저장하고 새 ID 받기
      const newShareId = await createShareableContent(contentToSave);

      if (!newShareId) {
        throw new Error("DB 저장 후 ID를 받지 못했습니다.");
      }

      // 5. 생성된 ID를 이용해 공유 페이지로 이동
      navigate(`/shared/${newShareId}`);

    } catch (error) {
      console.error('❌ 공유 실패:', error);
      const errorMessage = error instanceof Error ? error.message : getText('공유에 실패했습니다', 'Failed to share', '分享失败');
      alert(errorMessage);
    } finally {
      setIsSharing(false);
    }
  };
  
  const handleDownload = () => {
    if (analysisResult?.audioBlob) {
        const url = URL.createObjectURL(analysisResult.audioBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `LookTalkAI_audio_${Date.now()}.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
  };

  const handleClearImage = () => {
    setUploadedImage(null);
    setAnalysisResult(null);
    setError(null);
  };

  const handleImageSelect = (imageData: string) => {
    setUploadedImage(imageData);
    // 이미지 선택 시 에러와 이전 결과 초기화
    setError(null);
    setAnalysisResult(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-3 sm:px-0">
      <div className="text-center space-y-4">
        <p className="text-base sm:text-lg text-gray-600 px-2">
          {getText(
            'AI가 다양한 페르소나의 관점으로 당신의 사진을 창의적으로 해석합니다',
            'AI creatively interprets your photos from various persona perspectives',
            'AI从不同角色的角度创造性地解释您的照片'
          )}
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700">
            <Sparkles className="w-3 h-3" />
            <span>{getText('AI 비전 분석', 'AI Vision Analysis', 'AI视觉分析')}</span>
          </div>
          <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-green-100 text-green-700">
            <span>🎭</span>
            <span>{getText('11가지 페르소나', '11 Personas', '11个角色')}</span>
          </div>
          <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-purple-100 text-purple-700">
            <span>🎵</span>
            <span>{getText('음성 해석', 'Voice Interpretation', '语音解读')}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <span className="text-red-600">⚠️</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-red-900 text-sm sm:text-base">
                {getText('분석 오류', 'Analysis Error', '分析错误')}
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
        </CardHeader>
        <CardContent>
          <PhotoUploader
            onImageSelect={handleImageSelect}
            selectedImage={uploadedImage || ''}
            onClearImage={handleClearImage}
            disabled={isAnalyzing || isSharing}
            language={selectedLanguage}
          />
        </CardContent>
      </Card>

      {uploadedImage && (
        <Card>
          <CardHeader>
            <h2 className="text-lg sm:text-xl font-semibold flex items-center space-x-2">
              <span>🎭</span>
              <span>{getText('페르소나 선택', 'Choose Persona', '选择角色')}</span>
            </h2>
          </CardHeader>
          <CardContent>
            <PersonaSelector
              selectedPersona={selectedPersona}
              onSelect={setSelectedPersona}
              disabled={isAnalyzing || isSharing}
              language={selectedLanguage}
            />
          </CardContent>
        </Card>
      )}

      {uploadedImage && (
        <div ref={analyzeButtonRef} className="space-y-4">
          <Button
            onClick={handleAnalyze}
            disabled={!uploadedImage || !canAnalyze || isAnalyzing || isSharing}
            size="lg"
            className="w-full text-sm sm:text-base"
          >
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            {getText(
              `${localizedPersonaInfo?.name}로 분석하기`,
              `Analyze with ${localizedPersonaInfo?.name}`,
              `用${localizedPersonaInfo?.name}分析`
            )}
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
                      '오늘 1000회 무료 분석을 모두 사용했습니다. 내일 다시 오세요!',
                      'You have used all 1000 free analyses today. Come back tomorrow!',
                      '您今天已用完1000次免费分析！'
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {isAnalyzing && (
        <div ref={analysisStatusRef}>
          <Card>
            <CardHeader className="pb-3 sm:pb-4 relative">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {getText('AI 분석 중', 'AI Analyzing', 'AI分析中')}
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
                <div className="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-600 font-medium">
                  {getText(
                    `${localizedPersonaInfo?.name}가 사진을 분석하고 있습니다...`,
                    `${localizedPersonaInfo?.name} is analyzing your photo...`,
                    `${localizedPersonaInfo?.name}正在分析您的照片...`
                  )}
                </p>
                <div className="mt-4 text-xs text-gray-400 space-y-1">
                  <p>• {getText('이미지 비전 분석', 'Image vision analysis', '图像视觉分析')}</p>
                  <p>• {getText('페르소나 관점 적용', 'Applying persona perspective', '应用角色视角')}</p>
                  <p>• {getText('창의적 해석 생성', 'Generating creative interpretation', '生成创意解读')}</p>
                  <p>• {getText('음성 메시지 준비', 'Preparing voice message', '准备语音消息')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {analysisResult && !isAnalyzing && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <span>{selectedPersonaData?.avatar}</span>
                <span>
                  {getText(
                    `${localizedPersonaInfo?.name}의 해석`,
                    `${localizedPersonaInfo?.name}'s Interpretation`,
                    `${localizedPersonaInfo?.name}的解读`
                  )}
                </span>
              </h3>
            </div>
          </CardHeader>
          <CardContent>
            <AudioPlayer
              audioUrl={analysisResult.audioUrl}
              title={analysisResult.script}
              character={localizedPersonaInfo?.name || ''}
              onDownload={handleDownload}
              autoPlay={shouldAutoPlay}
              language={selectedLanguage}
              analysisData={{
                imageUrl: uploadedImage || '',
                script: analysisResult.script,
                persona: selectedPersona || '',
                timestamp: Date.now(),
                audioBlob: analysisResult.audioBlob // 실제 audioBlob 데이터 전달
              }}
            />
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-900 mb-2 flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>{getText('AI 해석 스크립트', 'AI Interpretation Script', 'AI解读脚本')}</span>
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {analysisResult.script}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-center text-xs sm:text-sm text-gray-500 px-2">
        <p>
          {getText(
            `무료 사용: 오늘 ${guestUsage.count}/1000 분석`,
            `Free usage: ${guestUsage.count}/1000 analyses today`,
            `免费使用：今天 ${guestUsage.count}/1000 次分析`
          )}
        </p>
        <p className="mt-1">
          {getText(
            'AI 비전 분석 • 페르소나 해석 • 음성 메시지 • 완전 무료',
            'AI Vision Analysis • Persona Interpretation • Voice Messages • Completely Free',
            'AI视觉分析 • 角色解读 • 语音消息 • 完全免费'
          )}
        </p>
      </div>
    </div>
  );
}