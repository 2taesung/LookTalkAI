import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  Share2,
  Volume2,
  Sparkles,
  Speaker,
  CheckCircle,
  MessageCircle,
  Loader2,
  Facebook,
  Twitter,
  Copy,
  Link as LinkIcon,
} from 'lucide-react';
import { Button } from './ui/Button';
import { createShareableContent } from '../lib/supabaseActions';
import { useToast } from './ToastProvider';
import { useLanguageText } from '../hooks/useLanguageText';
import { detectAudioType, getAudioDuration, getAudioTypeStyles } from '../lib/audioTypes';
import { AUDIO_DURATIONS } from '../constants/audioConfig';
import { getErrorMessage } from '../lib/errorHandler';

interface AudioPlayerProps {
  audioUrl?: string;
  title: string;
  character: string;
  onShare?: () => void;
  onDownload?: () => void;
  isConversation?: boolean;
  autoPlay?: boolean;
  language?: string;
  // 공유할 분석 데이터
  analysisData?: {
    imageUrl?: string;
    script?: string;
    timestamp?: number;
    persona?: string;
    audioBlob?: Blob; // audioBlob 추가
  };
}

export function AudioPlayer({
  audioUrl,
  title,
  character,
  onShare,
  onDownload,
  isConversation = false,
  autoPlay = false,
  language = 'en',
  analysisData,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackComplete, setPlaybackComplete] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isCreatingLink, setIsCreatingLink] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const { showToast } = useToast();

  // Use shared utilities for audio type detection and language text
  const audioTypeInfo = detectAudioType(audioUrl);
  const {
    isReactionVoice,
    isSpeechPlaying,
    isDemoAudio,
    isPhotoAnalysisAudio,
    isDebateAudio,
    isRecordedAudio,
    isRealAudio,
    type: audioType,
  } = audioTypeInfo;

  const getText = useLanguageText(language);

  useEffect(() => {
    if (
      !audioUrl ||
      isReactionVoice ||
      isSpeechPlaying ||
      isDemoAudio ||
      isPhotoAnalysisAudio ||
      isDebateAudio
    )
      return;

    const audio = audioRef.current;
    if (!audio) return;

    // 상태 리셋
    setIsLoading(true);
    setAudioError(null);

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const updateDuration = () => {
      setDuration(audio.duration);
      setIsLoading(false);
      console.log('✅ 오디오 로드 성공, 길이:', audio.duration);

      // 자동 재생 로직
      if (autoPlay && !hasAutoPlayed && audio.duration > 0) {
        console.log('🎵 자동 재생 시작...');
        setHasAutoPlayed(true);
        setTimeout(() => {
          handleAutoPlay();
        }, 500);
      }
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      console.log('🔄 오디오 로딩 시작...');
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      console.log('✅ 오디오 재생 가능');

      if (autoPlay && !hasAutoPlayed) {
        console.log('🎵 canplay에서 자동 재생 시도...');
        setHasAutoPlayed(true);
        setTimeout(() => {
          handleAutoPlay();
        }, 300);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setPlaybackComplete(true);
      console.log('✅ 오디오 재생 완료');
    };

    const handleError = (e: Event) => {
      const error = (e.target as HTMLAudioElement)?.error;
      console.error('❌ 오디오 오류:', error);
      setIsLoading(false);
      setAudioError(error?.message || '오디오 재생 실패');
    };

    const handleLoadedData = () => {
      console.log('📊 오디오 데이터 로드됨');
      setIsLoading(false);
    };

    // 모든 이벤트 리스너 추가
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // 오디오 강제 로드
    console.log('🎵 오디오 로딩:', audioUrl);
    audio.load();

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [
    audioUrl,
    isReactionVoice,
    isSpeechPlaying,
    isDemoAudio,
    isPhotoAnalysisAudio,
    isDebateAudio,
    autoPlay,
  ]);

  // 자동 재생 함수
  const handleAutoPlay = async () => {
    console.log('🎵 자동 재생 함수 실행...');

    // Handle simulated audio types (non-real audio)
    if (!isRealAudio && audioType !== 'none') {
      const duration = getAudioDuration(audioType);

      if (duration > 0) {
        const typeLabels = {
          'reaction-voice': '🎙️ Reaction Voice',
          'speech': '🎤 음성 합성',
          'photo-analysis': '📸 사진 분석 오디오',
          'debate': '🎭 토론 오디오',
          'demo': '🎭 데모 오디오',
        };

        console.log(`${typeLabels[audioType as keyof typeof typeLabels] || audioType} 자동 재생 시작`);
        setIsPlaying(true);

        setTimeout(() => {
          setIsPlaying(false);
          setPlaybackComplete(true);
        }, duration);
        return;
      }
    }

    // Handle real audio playback
    const audio = audioRef.current;
    if (!audio || isLoading || audioError) {
      console.log('❌ 자동 재생 불가:', {
        audio: !!audio,
        isLoading,
        audioError,
      });
      return;
    }

    try {
      console.log('▶️ 실제 오디오 자동 재생 시작');

      if (audio.readyState < 2) {
        console.log('🔄 오디오 준비 대기 중...');
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('자동 재생을 위한 오디오 로딩 타임아웃'));
          }, 5000);

          const onCanPlay = () => {
            clearTimeout(timeout);
            audio.removeEventListener('canplay', onCanPlay);
            audio.removeEventListener('error', onError);
            resolve(void 0);
          };

          const onError = () => {
            clearTimeout(timeout);
            audio.removeEventListener('canplay', onCanPlay);
            audio.removeEventListener('error', onError);
            reject(new Error('자동 재생을 위한 오디오 로딩 실패'));
          };

          audio.addEventListener('canplay', onCanPlay, { once: true });
          audio.addEventListener('error', onError, { once: true });
        });
      }

      await audio.play();
      setIsPlaying(true);
      setPlaybackComplete(false);
      console.log('✅ 자동 재생 성공!');
    } catch (error) {
      console.error('❌ 자동 재생 실패:', error);
    }
  };

  // autoPlay prop이 변경될 때 자동 재생 시도
  useEffect(() => {
    if (
      autoPlay &&
      !hasAutoPlayed &&
      isRealAudio &&
      !isLoading &&
      !audioError
    ) {
      console.log('🎵 autoPlay prop 변경으로 자동 재생 시도...');
      setHasAutoPlayed(true);
      setTimeout(() => {
        handleAutoPlay();
      }, 1000);
    }
  }, [autoPlay, hasAutoPlayed, isRealAudio, isLoading, audioError]);

  // 특수 오디오 타입의 경우 즉시 자동 재생
  useEffect(() => {
    if (
      autoPlay &&
      !hasAutoPlayed &&
      (isReactionVoice ||
        isSpeechPlaying ||
        isDemoAudio ||
        isPhotoAnalysisAudio ||
        isDebateAudio)
    ) {
      console.log('🎵 특수 오디오 타입 자동 재생...');
      setHasAutoPlayed(true);
      setTimeout(() => {
        handleAutoPlay();
      }, 500);
    }
  }, [
    autoPlay,
    hasAutoPlayed,
    isReactionVoice,
    isSpeechPlaying,
    isDemoAudio,
    isPhotoAnalysisAudio,
    isDebateAudio,
  ]);

  const handlePlayPause = async () => {
    // Handle simulated audio types (non-real audio)
    if (!isRealAudio && audioType !== 'none') {
      const duration = getAudioDuration(audioType);

      if (duration > 0) {
        const typeLabels = {
          'reaction-voice': `🎙️ Reaction Voice 재생: ${character}`,
          'speech': `🎤 음성 합성이 이미 ${character}로 재생 중`,
          'photo-analysis': `📸 ${character} 사진 분석 오디오 재생`,
          'debate': `🎭 ${character} 토론 오디오 재생`,
          'demo': `🎭 ${character} 데모 오디오 재생`,
        };

        console.log(typeLabels[audioType as keyof typeof typeLabels] || audioType);
        setIsPlaying(!isPlaying);

        if (!isPlaying) {
          setTimeout(() => {
            setIsPlaying(false);
            setPlaybackComplete(true);
          }, duration);
        }
        return;
      }
    }

    // Handle real audio playback
    const audio = audioRef.current;
    if (!audio || isLoading) return;

    try {
      if (isPlaying) {
        console.log('⏸️ 오디오 일시정지');
        audio.pause();
        setIsPlaying(false);
      } else {
        console.log('▶️ 오디오 재생');

        setAudioError(null);

        if (audio.readyState < 2) {
          console.log('🔄 오디오 준비되지 않음, 로딩...');
          setIsLoading(true);
          audio.load();

          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('오디오 로딩 타임아웃'));
            }, 10000);

            const onCanPlay = () => {
              clearTimeout(timeout);
              audio.removeEventListener('canplay', onCanPlay);
              audio.removeEventListener('error', onError);
              resolve(void 0);
            };

            const onError = () => {
              clearTimeout(timeout);
              audio.removeEventListener('canplay', onCanPlay);
              audio.removeEventListener('error', onError);
              reject(new Error('오디오 로딩 실패'));
            };

            audio.addEventListener('canplay', onCanPlay, { once: true });
            audio.addEventListener('error', onError, { once: true });
          });
        }

        await audio.play();
        setIsPlaying(true);
        setPlaybackComplete(false);
        setIsLoading(false);
        console.log('✅ 오디오 재생 성공');
      }
    } catch (error) {
      console.error('❌ 오디오 재생 오류:', error);
      setIsPlaying(false);
      setIsLoading(false);
      setAudioError(getErrorMessage(error));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (
      isDemoAudio ||
      isSpeechPlaying ||
      isReactionVoice ||
      isPhotoAnalysisAudio ||
      isDebateAudio
    )
      return;

    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleDownload = () => {
    if (audioUrl && onDownload && isRealAudio) {
      const link = document.createElement('a');
      link.href = audioUrl;
      const filename = `LookTalkAI_${character}_${Date.now()}.mp3`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // 실제 오디오가 없는 경우 시뮬레이션
      console.log('🎵 오디오 다운로드 시뮬레이션');
      const blob = new Blob(['Audio MP3 content'], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `LookTalkAI_${character}_${Date.now()}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // 공유 링크 생성 함수
  const generateShareLink = async (): Promise<string> => {
    console.log('🔗 generateShareLink 시작, analysisData:', analysisData);
    
    if (analysisData) {
      // 로딩 상태 시작
      setIsCreatingLink(true);
      try {
        console.log('✅ analysisData 존재함, 공유 링크 생성 시작');
        let finalAudioUrl = audioUrl || '';
        
        // analysisData에 audioBlob이 있으면 이를 우선 사용, 없으면 blob URL에서 가져오기
        let audioBlob = analysisData.audioBlob;
        
        if (!audioBlob && finalAudioUrl && finalAudioUrl.startsWith('blob:')) {
          console.log('🔄 Blob URL에서 오디오 데이터 추출 중...');
          try {
            const response = await fetch(finalAudioUrl);
            audioBlob = await response.blob();
          } catch (error) {
            console.error('❌ Blob URL에서 데이터 추출 실패:', error);
            throw new Error('오디오 데이터를 가져올 수 없습니다.');
          }
        }
        
        // audioBlob이 있으면 Supabase Storage에 업로드
        if (audioBlob) {
          console.log('🔄 오디오 파일을 Supabase Storage에 업로드 중...');
          
          console.log('🎵 오디오 Blob 정보:', {
            size: audioBlob.size,
            type: audioBlob.type,
            sizeInKB: Math.round(audioBlob.size / 1024)
          });
          
          // 파일 크기 검증
          if (audioBlob.size < 1024) {
            throw new Error('오디오 파일이 너무 작습니다. 올바른 오디오 데이터가 없을 수 있습니다.');
          }
          
          // Supabase Storage에 업로드
          const { supabase } = await import('../lib/supabaseClient');
          const audioFilePath = `public/shared-audio-${Date.now()}.mp3`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('media')
            .upload(audioFilePath, audioBlob, { 
              contentType: 'audio/mpeg',
              cacheControl: '3600',
              upsert: false
            });
          
          if (uploadError) {
            console.error('❌ 오디오 업로드 실패:', uploadError);
            throw new Error(`오디오 업로드 실패: ${uploadError.message}`);
          }
          
          // 업로드된 파일의 public URL 생성
          const { data: { publicUrl } } = supabase.storage
            .from('media')
            .getPublicUrl(audioFilePath);
          
          finalAudioUrl = publicUrl;
          console.log('✅ 오디오 업로드 완료, Public URL:', finalAudioUrl);
        } else {
          console.warn('⚠️ 업로드할 오디오 데이터가 없습니다.');
        }

        // Supabase에 저장할 데이터 객체 생성
        const contentData = {
          image_url: analysisData.imageUrl || '',
          audio_url: finalAudioUrl,
          script: title, // title을 스크립트로 사용
          persona: analysisData.persona || '', // persona 추가
        };

        console.log('📝 DB에 저장할 데이터:', contentData);

        // lib/supabaseActions.ts의 함수를 호출하여 DB에 저장하고 ID를 받음
        console.log('💾 createShareableContent 호출 중...');
        const shareId = await createShareableContent(contentData);
        console.log('✅ DB 저장 완료, shareId:', shareId);

        // 공유 URL 생성 (실제 배포된 도메인으로 변경해야 합니다)
        const baseUrl = window.location.origin;
        const shareUrl = `${baseUrl}/shared/${shareId}`;
        console.log('🎉 공유 링크 생성 완료:', shareUrl);

        return shareUrl;
      } catch (error) {
        console.error('❌ 공유 링크 생성 실패:', error);
        showToast({
          message: getText(
            '공유 링크 생성에 실패했습니다.',
            'Failed to create share link.',
            '创建分享链接失败。'
          ),
          type: 'error',
          duration: 3000
        });
        return '';
      } finally {
        // 로딩 상태 종료
        setIsCreatingLink(false);
      }
    }

    // 분석 데이터가 없는 경우
    console.warn('❌ 분석 데이터가 없어 공유 링크를 생성할 수 없습니다.');
    console.log('현재 analysisData:', analysisData);
    console.log('현재 audioUrl:', audioUrl);
    showToast({
      message: getText(
        '공유할 데이터가 없습니다. 먼저 사진을 분석해주세요.',
        'No data to share. Please analyze a photo first.',
        '没有要分享的数据。请先分析照片。'
      ),
      type: 'error',
      duration: 3000
    });
    return '';
  };

  const handleShare = () => {
    setShowShareMenu(!showShareMenu);
  };

  const shareToFacebook = async () => {
    const shareUrl = await generateShareLink();
    if (shareUrl === window.location.href && !analysisData) return;

    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      shareUrl
    )}`;
    window.open(url, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  const shareToTwitter = async () => {
    const shareUrl = await generateShareLink();
    if (shareUrl === window.location.href && !analysisData) return;
    const text = analysisData
      ? `LookTalkAI - ${character}의 AI 사진 분석 결과를 확인해보세요!`
      : `LookTalkAI - AI Photo Analysis: ${title}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  const copyLink = async () => {
    const shareUrl = await generateShareLink();
    if (shareUrl === window.location.href && !analysisData) return;

    try {
      await navigator.clipboard?.writeText(shareUrl);
      
      // 토스트 알림 표시
      showToast({
        message: getText(
          '분석 결과 링크가 복사되었습니다!',
          'Analysis result link copied!',
          '分析结果链接已复制！'
        ),
        type: 'success',
        duration: 3000
      });
      
      setShowShareMenu(false);
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
      showToast({
        message: getText(
          '링크 복사에 실패했습니다.',
          'Failed to copy link.',
          '复制链接失败。'
        ),
        type: 'error',
        duration: 3000
      });
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!audioUrl) {
    return (
      <div className="p-4 sm:p-6 text-center text-gray-500">
        <Volume2 className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 opacity-50" />
        <p className="text-sm sm:text-base">
          {getText(
            '오디오가 생성되면 여기에 나타납니다',
            'Audio will appear here when generated',
            '生成音频后将在此处显示'
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {isRealAudio && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
          crossOrigin="anonymous"
        />
      )}

      {/* 오디오 상태 */}
      <div
        className={`p-2 sm:p-3 rounded-lg border ${
          audioError
            ? 'bg-red-50 border-red-200'
            : playbackComplete
            ? 'bg-green-50 border-green-200'
            : isReactionVoice
            ? 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200'
            : isSpeechPlaying
            ? 'bg-blue-50 border-blue-200'
            : isPhotoAnalysisAudio
            ? 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200'
            : isDebateAudio
            ? 'bg-gradient-to-r from-red-50 to-purple-50 border-red-200'
            : 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200'
        }`}
      >
        <div className="flex items-center space-x-2">
          {audioError ? (
            <div className="w-3 h-3 sm:w-4 sm:h-4 text-red-600">⚠️</div>
          ) : playbackComplete ? (
            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
          ) : isReactionVoice ? (
            <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
          ) : isSpeechPlaying ? (
            <div className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600">🎤</div>
          ) : isPhotoAnalysisAudio ? (
            <div className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600">📸</div>
          ) : isDebateAudio ? (
            <div className="w-3 h-3 sm:w-4 sm:h-4 text-red-600">🎭</div>
          ) : (
            <Speaker className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
          )}
          <span className="text-xs sm:text-sm font-medium text-gray-700">
            {audioError
              ? getText(
                  `Audio error: ${audioError}`,
                  `Audio error: ${audioError}`,
                  `音频错误: ${audioError}`
                )
              : isReactionVoice
              ? getText(
                  `🎭 Reaction Voice: 내레이터 + ${character} (하나의 MP3)`,
                  `🎭 Reaction Voice: Narrator + ${character} (One MP3)`,
                  `🎭 Reaction Voice: 旁白 + ${character} (一个MP3)`
                )
              : isSpeechPlaying
              ? getText(
                  `${character} voice playing (Browser TTS)`,
                  `${character} voice playing (Browser TTS)`,
                  `${character} 语音播放中 (浏览器TTS)`
                )
              : isPhotoAnalysisAudio
              ? getText(
                  `📸 Photo Analysis: ${character} Voice Narration`,
                  `📸 Photo Analysis: ${character} Voice Narration`,
                  `📸 照片分析: ${character} 语音旁白`
                )
              : isDebateAudio
              ? getText(
                  `🎭 Debate Audio: ${character} Mixed Voices`,
                  `🎭 Debate Audio: ${character} Mixed Voices`,
                  `🎭 辩论音频: ${character} 混合语音`
                )
              : isDemoAudio
              ? getText(
                  `${character} Voice Demo`,
                  `${character} Voice Demo`,
                  `${character} 语音演示`
                )
              : getText(
                  `Enhanced ${character} Voice`,
                  `Enhanced ${character} Voice`,
                  `增强的 ${character} 语音`
                )}
          </span>
          {playbackComplete && !audioError && (
            <span className="text-xs text-green-600 bg-green-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
              ✓ {getText('재생됨', 'Played', '已播放')}
            </span>
          )}
        </div>
        <p className="text-xs mt-1 text-gray-600">
          {audioError
            ? getText(
                'Please refresh the page or regenerate',
                'Please refresh the page or regenerate',
                '请刷新页面或重新生成'
              )
            : isReactionVoice
            ? getText(
                '🎭 Reaction Voice: Record narrator voice and character reactions, mix into one MP3',
                '🎭 Reaction Voice: Record narrator voice and character reactions, mix into one MP3',
                '🎭 Reaction Voice: 录制旁白语音和角色反应，混合成一个MP3'
              )
            : isSpeechPlaying
            ? getText(
                `🎤 ${character} voice plays directly through browser`,
                `🎤 ${character} voice plays directly through browser`,
                `🎤 ${character} 语音通过浏览器直接播放`
              )
            : isPhotoAnalysisAudio
            ? getText(
                `${character} analyzes and describes the photo with voice narration`,
                `${character} analyzes and describes the photo with voice narration`,
                `${character} 分析并用语音旁白描述照片`
              )
            : isDebateAudio
            ? getText(
                `🎭 ${character} debate with mixed persona voices in one audio file`,
                `🎭 ${character} debate with mixed persona voices in one audio file`,
                `🎭 ${character} 辩论，多个角色语音混合在一个音频文件中`
              )
            : isDemoAudio
            ? getText(
                'Voice synthesis complete - click play to hear character voice',
                'Voice synthesis complete - click play to hear character voice',
                '语音合成完成 - 点击播放听取角色语音'
              )
            : isRecordedAudio
            ? getText(
                'Actually recorded character voice with enhanced script',
                'Actually recorded character voice with enhanced script',
                '使用增强脚本实际录制的角色语音'
              )
            : getText(
                'High-quality character voice with enhanced script',
                'High-quality character voice with enhanced script',
                '使用增强脚本的高质量角色语音'
              )}
        </p>
      </div>

      {/* 파형 시각화 */}
      <div className="h-12 sm:h-16 bg-gradient-to-r from-purple-100 to-teal-100 rounded-lg flex items-center justify-center relative overflow-hidden">
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin w-4 h-4 sm:w-5 sm:h-5 border-2 border-purple-600 border-t-transparent rounded-full" />
            <span className="text-xs sm:text-sm text-purple-600">
              {getText(
                isConversation
                  ? 'Generating Reaction Voice...'
                  : isPhotoAnalysisAudio
                  ? 'Generating photo analysis audio...'
                  : isDebateAudio
                  ? 'Generating debate audio...'
                  : `Loading ${character} voice...`,
                isConversation
                  ? 'Generating Reaction Voice...'
                  : isPhotoAnalysisAudio
                  ? 'Generating photo analysis audio...'
                  : isDebateAudio
                  ? 'Generating debate audio...'
                  : `Loading ${character} voice...`,
                isConversation
                  ? '正在生成Reaction Voice...'
                  : isPhotoAnalysisAudio
                  ? '正在生成照片分析音频...'
                  : isDebateAudio
                  ? '正在生成辩论音频...'
                  : `正在加载 ${character} 语音...`
              )}
            </span>
          </div>
        ) : audioError ? (
          <div className="flex items-center space-x-2 text-red-600">
            <span className="text-xs sm:text-sm">
              ⚠️ {getText('Audio Error', 'Audio Error', '音频错误')}
            </span>
          </div>
        ) : (
          <div className="flex items-end space-x-0.5 sm:space-x-1">
            {Array.from({ length: 30 }, (_, i) => (
              <div
                key={i}
                className={`w-0.5 sm:w-1 rounded-full transition-all duration-300 ${
                  isConversation
                    ? 'bg-gradient-to-t from-blue-400 via-purple-400 to-teal-400' // Reaction Voice용 그라데이션
                    : isReactionVoice
                    ? 'bg-gradient-to-t from-purple-400 via-blue-400 to-teal-400'
                    : isPhotoAnalysisAudio
                    ? 'bg-gradient-to-t from-orange-400 via-yellow-400 to-red-400'
                    : isDebateAudio
                    ? 'bg-gradient-to-t from-red-400 via-purple-400 to-blue-400'
                    : 'bg-gradient-to-t from-purple-400 to-teal-400'
                } ${
                  isDemoAudio ||
                  isSpeechPlaying ||
                  isReactionVoice ||
                  isPhotoAnalysisAudio ||
                  isDebateAudio
                    ? isPlaying
                      ? 'opacity-100 scale-110'
                      : 'opacity-30'
                    : isRealAudio && duration > 0
                    ? (currentTime / duration) * 30 > i
                      ? 'opacity-100 scale-110'
                      : 'opacity-30'
                    : 'opacity-30'
                } ${isPlaying ? 'animate-pulse' : ''}`}
                style={{
                  height: `${Math.random() * 30 + 6}px`,
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* 컨트롤 */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <Button
          onClick={handlePlayPause}
          disabled={isLoading || !!audioError}
          className="rounded-full w-12 h-12 sm:w-10 sm:h-10 p-0 relative flex items-center justify-center min-w-[48px] min-h-[48px] sm:min-w-[40px] sm:min-h-[40px]"
        >
          {isLoading ? (
            <div
              className="animate-spin rounded-full"
              style={{
                width: '20px',
                height: '20px',
                border: '2px solid #ffffff',
                borderTop: '2px solid transparent',
              }}
            />
          ) : isPlaying ? (
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              style={{
                fill: '#ffffff',
                minWidth: '20px',
                minHeight: '20px',
                filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))',
              }}
            >
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path>
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              style={{
                fill: '#ffffff',
                marginLeft: '2px',
                minWidth: '20px',
                minHeight: '20px',
                filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))',
              }}
            >
              <path d="M8 5v14l11-7z"></path>
            </svg>
          )}
        </Button>

        <div className="flex-1 space-y-1 sm:space-y-2">
          {isRealAudio && !audioError && (
            <>
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                disabled={isLoading || !!audioError}
                className="w-full h-1.5 sm:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50"
                style={{
                  background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${
                    duration > 0 ? (currentTime / duration) * 100 : 0
                  }%, #e5e7eb ${
                    duration > 0 ? (currentTime / duration) * 100 : 0
                  }%, #e5e7eb 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </>
          )}
          {(isDemoAudio ||
            isSpeechPlaying ||
            isReactionVoice ||
            isPhotoAnalysisAudio ||
            isDebateAudio ||
            audioError) && (
            <div className="text-center">
              <div className="text-xs sm:text-sm text-gray-600">
                {audioError
                  ? getText(
                      '❌ Audio playback failed',
                      '❌ Audio playback failed',
                      '❌ 音频播放失败'
                    )
                  : isReactionVoice
                  ? getText(
                      isPlaying
                        ? '🎭 Reaction Voice MP3 playing...'
                        : '🎭 Reaction Voice ready to play',
                      isPlaying
                        ? '🎭 Reaction Voice MP3 playing...'
                        : '🎭 Reaction Voice ready to play',
                      isPlaying
                        ? '🎭 Reaction Voice MP3 播放中...'
                        : '🎭 Reaction Voice 准备播放'
                    )
                  : isSpeechPlaying
                  ? getText(
                      isPlaying
                        ? '🎤 Playing through browser speakers...'
                        : '🎤 Ready to play through speakers',
                      isPlaying
                        ? '🎤 Playing through browser speakers...'
                        : '🎤 Ready to play through speakers',
                      isPlaying
                        ? '🎤 通过浏览器扬声器播放中...'
                        : '🎤 准备通过扬声器播放'
                    )
                  : isPhotoAnalysisAudio
                  ? getText(
                      isPlaying
                        ? '📸 Photo analysis audio playing...'
                        : '📸 Photo analysis audio ready',
                      isPlaying
                        ? '📸 Photo analysis audio playing...'
                        : '📸 Photo analysis audio ready',
                      isPlaying
                        ? '📸 照片分析音频播放中...'
                        : '📸 照片分析音频准备就绪'
                    )
                  : isDebateAudio
                  ? getText(
                      isPlaying
                        ? '🎭 Debate audio playing...'
                        : '🎭 Debate audio ready',
                      isPlaying
                        ? '🎭 Debate audio playing...'
                        : '🎭 Debate audio ready',
                      isPlaying
                        ? '🎭 辩论音频播放中...'
                        : '🎭 辩论音频准备就绪'
                    )
                  : getText(
                      isPlaying
                        ? '🎤 Character voice playing...'
                        : '🎭 Ready to play',
                      isPlaying
                        ? '🎤 Character voice playing...'
                        : '🎭 Ready to play',
                      isPlaying ? '🎤 角色语音播放中...' : '🎭 准备播放'
                    )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {audioError
                  ? getText(
                      'Please refresh the page or regenerate',
                      'Please refresh the page or regenerate',
                      '请刷新页面或重新生成'
                    )
                  : isReactionVoice
                  ? getText(
                      `Reaction Voice: Record narrator voice + ${character} reactions and mix into one MP3`,
                      `Reaction Voice: Record narrator voice + ${character} reactions and mix into one MP3`,
                      `Reaction Voice: 录制旁白语音 + ${character} 反应并混合成一个MP3`
                    )
                  : isSpeechPlaying
                  ? getText(
                      `${character} voice plays directly through browser`,
                      `${character} voice plays directly through browser`,
                      `${character} 语音通过浏览器直接播放`
                    )
                  : isPhotoAnalysisAudio
                  ? getText(
                      `${character} analyzes and describes the photo with voice narration`,
                      `${character} analyzes and describes the photo with voice narration`,
                      `${character} 分析并用语音旁白描述照片`
                    )
                  : isDebateAudio
                  ? getText(
                      `${character} debate with multiple persona voices mixed into one audio`,
                      `${character} debate with multiple persona voices mixed into one audio`,
                      `${character} 辩论，多个角色语音混合成一个音频`
                    )
                  : getText(
                      `Enhanced script reading with ${character} voice characteristics`,
                      `Enhanced script reading with ${character} voice characteristics`,
                      `使用 ${character} 语音特性的增强脚本阅读`
                    )}
              </div>
            </div>
          )}
        </div>

        {isRealAudio && !audioError && (
          <div className="hidden sm:flex items-center space-x-2">
            <Volume2 className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={volume}
              onChange={handleVolumeChange}
              className="w-12 sm:w-16 h-1.5 sm:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${
                  volume * 100
                }%, #e5e7eb ${volume * 100}%, #e5e7eb 100%)`,
              }}
            />
          </div>
        )}
      </div>

      {/* 액션 */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="w-full text-xs sm:text-sm"
            disabled={isCreatingLink}
          >
            {isCreatingLink ? (
              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
            ) : (
              <Share2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            )}
            {isCreatingLink
              ? getText('생성 중...', 'Creating...', '创建中...')
              : getText('공유', 'Share', '分享')}
          </Button>

          {/* 공유 메뉴 */}
          {showShareMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <button
                onClick={shareToFacebook}
                disabled={isCreatingLink}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 disabled:opacity-50"
              >
                <Facebook className="w-4 h-4 text-blue-600" />
                <span>Facebook</span>
              </button>
              <button
                onClick={shareToTwitter}
                disabled={isCreatingLink}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 disabled:opacity-50"
              >
                <Twitter className="w-4 h-4 text-blue-400" />
                <span>Twitter</span>
              </button>
              <button
                onClick={copyLink}
                disabled={isCreatingLink}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 disabled:opacity-50"
              >
                <Copy className="w-4 h-4 text-gray-600" />
                <span>{getText('링크 복사', 'Copy Link', '复制链接')}</span>
              </button>
            </div>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="flex-1 text-xs sm:text-sm"
        >
          <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
          <span className="hidden sm:inline">
            {getText(
              isConversation
                ? 'Reaction Voice 다운로드'
                : isPhotoAnalysisAudio
                ? '사진 분석 오디오 다운로드'
                : isDebateAudio
                ? '토론 오디오 다운로드'
                : '다운로드',
              isConversation
                ? 'Download Reaction Voice'
                : isPhotoAnalysisAudio
                ? 'Download Photo Analysis Audio'
                : isDebateAudio
                ? 'Download Debate Audio'
                : 'Download',
              isConversation
                ? '下载Reaction Voice'
                : isPhotoAnalysisAudio
                ? '下载照片分析音频'
                : isDebateAudio
                ? '下载辩论音频'
                : '下载'
            )}
          </span>
          <span className="sm:hidden">
            {getText('다운로드', 'Download', '下载')}
          </span>
        </Button>
      </div>

      {/* 트랙 정보 */}
      <div className="text-center space-y-1">
        <h3 className="font-medium text-gray-900 truncate text-sm sm:text-base">
          {title.length > 40 ? title.substring(0, 40) + '...' : title}
        </h3>
        <div className="flex items-center justify-center space-x-2">
          <p className="text-xs sm:text-sm text-gray-500">
            {getText(
              isConversation
                ? `내레이터 + ${character} 반응`
                : isPhotoAnalysisAudio
                ? `${character}가 사진 분석`
                : isDebateAudio
                ? `${character} 토론`
                : `${character}가 내레이션`,
              isConversation
                ? `Narrator + ${character} reactions`
                : isPhotoAnalysisAudio
                ? `${character} analyzes photo`
                : isDebateAudio
                ? `${character} debate`
                : `${character} narrates`,
              isConversation
                ? `旁白 + ${character} 反应`
                : isPhotoAnalysisAudio
                ? `${character} 分析照片`
                : isDebateAudio
                ? `${character} 辩论`
                : `${character} 旁白`
            )}
          </p>
          <Sparkles className="w-2 h-2 sm:w-3 sm:h-3 text-purple-500" />
          <span className="text-xs font-medium text-purple-600">
            {audioError
              ? getText('Audio Error', 'Audio Error', '音频错误')
              : isReactionVoice
              ? 'Reaction Voice MP3'
              : isSpeechPlaying
              ? getText(
                  'Live Browser Voice',
                  'Live Browser Voice',
                  '实时浏览器语音'
                )
              : isPhotoAnalysisAudio
              ? getText(
                  'Photo Analysis Audio',
                  'Photo Analysis Audio',
                  '照片分析音频'
                )
              : isDebateAudio
              ? getText(
                  'Mixed Debate Audio',
                  'Mixed Debate Audio',
                  '混合辩论音频'
                )
              : getText(
                  'Enhanced Character Voice',
                  'Enhanced Character Voice',
                  '增强角色语音'
                )}
          </span>
        </div>
      </div>

      {/* 공유 메뉴 외부 클릭 시 닫기 */}
      {showShareMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowShareMenu(false)}
        />
      )}
    </div>
  );
}