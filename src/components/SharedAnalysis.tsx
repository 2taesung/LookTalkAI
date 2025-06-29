import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Download,
  Share2,
  ArrowLeft,
  ExternalLink,
  Loader2,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  Volume2,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { AudioPlayer } from './AudioPlayer';
import { personas, getLocalizedPersonaInfo } from '../lib/personas';
import { supabase } from '../lib/supabaseClient';

// SharedAnalysisData 타입을 여기서 직접 정의
interface SharedAnalysisData {
  id: string;
  imageUrl: string;
  imageData: string;
  script: string;
  audioUrl?: string;
  persona: string;
  timestamp: number;
  title: string;
  language: string;
}

interface SharedAnalysisProps {
  selectedLanguage: string;
}

export function SharedAnalysis({ selectedLanguage }: SharedAnalysisProps) {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const [sharedData, setSharedData] = useState<SharedAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullScript, setShowFullScript] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const getText = (ko: string, en: string, zh: string) => {
    switch (selectedLanguage) {
      case 'ko':
        return ko;
      case 'zh':
        return zh;
      default:
        return en;
    }
  };

  // 테스트용 샘플 데이터 생성 함수
  const createTestSharedData = () => {
    console.log('🧪 테스트용 공유 데이터 생성 중...');
    const testData: SharedAnalysisData = {
      id: shareId || 'test-share-id',
      imageUrl: '/image.png', // public 폴더의 이미지 사용
      imageData:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      script: getText(
        '안녕하세요! 이것은 테스트용 AI 사진 분석 결과입니다. LookTalkAI에서 AI가 실제로 여러분의 사진을 분석하고 음성으로 해석한 내용이 이런 식으로 표시됩니다. 로맨틱한 관점에서 보면, 이 사진은 따뜻한 감정과 아름다운 순간을 담고 있는 것 같네요. 조명이 정말 완벽하고, 구도도 훌륭합니다. 이런 사진은 보는 이로 하여금 마음이 따뜻해지게 만드는 특별한 힘이 있어요.',
        'Hello! This is a test AI photo analysis result. In LookTalkAI, AI actually analyzes your photos and provides voice interpretations like this. From a romantic perspective, this photo seems to capture warm emotions and beautiful moments. The lighting is absolutely perfect, and the composition is excellent. Photos like this have a special power to warm the hearts of viewers.',
        '您好！这是测试用的AI照片分析结果。在LookTalkAI中，AI实际分析您的照片并提供这样的语音解读。从浪漫的角度来看，这张照片似乎捕捉了温暖的情感和美好的瞬间。光线绝对完美，构图也很出色。这样的照片有一种特殊的力量，能够温暖观者的心。'
      ),
      audioUrl: '', // 실제 오디오는 나중에 생성
      persona: 'witty-entertainer',
      timestamp: Date.now(),
      title: getText(
        '샘플 AI 사진 분석',
        'Sample AI Photo Analysis',
        '示例AI照片分析'
      ),
      language: selectedLanguage,
    };
    return testData;
  };

  useEffect(() => {
    const loadSharedDataFromSupabase = async () => {
      console.log('🔍 Supabase에서 공유 데이터 로드 시작, ID:', shareId);
      setLoading(true);

      if (!shareId) {
        setError(
          getText(
            '유효하지 않은 공유 링크입니다',
            'Invalid share link',
            '无效的分享链接'
          )
        );
        setLoading(false);
        return;
      }

      try {
        // Supabase 'contents' 테이블에서 shareId와 일치하는 데이터를 조회합니다.
        const { data: contentData, error: dbError } = await supabase
          .from('contents') // Supabase에 생성한 테이블 이름
          .select('*')
          .eq('id', shareId) // URL의 shareId를 사용
          .single(); // 단일 레코드를 가져옵니다.

        if (dbError) {
          // RLS 정책 위반 등으로 데이터를 못 찾으면 여기서 에러가 발생합니다.
          throw new Error(
            getText(
              '공유된 분석을 찾을 수 없습니다. 링크가 만료되었거나 존재하지 않을 수 있습니다.',
              'Could not find the shared analysis. The link may be expired or invalid.',
              '找不到共享的分析。链接可能已过期或无效。'
            )
          );
        }

        if (contentData) {
          console.log('✅ Supabase 데이터 로드 성공:', contentData);
          // DB에서 가져온 데이터를 컴포넌트의 SharedAnalysisData 타입에 맞게 변환합니다.
          const formattedData: SharedAnalysisData = {
            id: contentData.id.toString(),
            imageUrl: contentData.image_url,
            script: contentData.script,
            audioUrl: contentData.audio_url,
            persona: contentData.persona,
            timestamp: new Date(contentData.created_at).getTime(), // DB의 created_at을 사용
            title: `${contentData.persona}'s AI Photo Analysis`, // DB 데이터 기반으로 제목 생성
            language: selectedLanguage, // prop으로 받은 언어 사용
            // imageData는 더 이상 필요하지 않을 수 있습니다.
            imageData: '',
          };
          setSharedData(formattedData);
        } else {
          throw new Error(
            getText(
              '데이터가 존재하지 않습니다.',
              'No data found.',
              '未找到数据。'
            )
          );
        }
      } catch (err: any) {
        console.error('❌ 공유 데이터 로드 실패:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSharedDataFromSupabase();
  }, [shareId, selectedLanguage]);

  const handleShare = async () => {
    if (sharedData) {
      const shareUrl = window.location.href;

      try {
        if (navigator.share) {
          await navigator.share({
            title: sharedData.title,
            text: sharedData.script,
            url: shareUrl,
          });
        } else {
          await navigator.clipboard?.writeText(shareUrl);
          alert(
            getText('링크가 복사되었습니다!', 'Link copied!', '链接已复制！')
          );
        }
      } catch (error) {
        console.error('❌ 공유 실패:', error);
      }
    }
  };

  const handleDownload = () => {
    console.log('오디오 다운로드 시작됨');
  };

  const goBack = () => {
    navigate('/');
  };

  const goToLookTalkAI = () => {
    navigate('/');
  };

  // 스크립트 미리보기 (모바일에서 3줄, 데스크톱에서 4줄)
  const getPreviewScript = (script: string) => {
    const words = script.split(' ');
    const isMobile = window.innerWidth < 768;
    const maxWords = isMobile ? 25 : 35; // 모바일에서 더 짧게
    
    if (words.length <= maxWords) return script;
    return words.slice(0, maxWords).join(' ') + '...';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50">
        <div className="max-w-2xl mx-auto px-3 sm:px-6 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="animate-spin w-8 h-8 text-purple-600 mx-auto mb-4" />
              <p className="text-gray-600">
                {getText(
                  '공유된 분석을 불러오는 중...',
                  'Loading shared analysis...',
                  '正在加载共享分析...'
                )}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !sharedData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50">
        <div className="max-w-2xl mx-auto px-3 sm:px-6 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">😔</div>
              <h3 className="font-medium text-gray-900 mb-2 text-lg">
                {getText(
                  '공유 링크를 찾을 수 없습니다',
                  'Share Link Not Found',
                  '找不到分享链接'
                )}
              </h3>
              <p className="text-gray-600 mb-6">
                {error ||
                  getText(
                    '이 링크는 만료되었거나 존재하지 않습니다',
                    'This link has expired or does not exist',
                    '此链接已过期或不存在'
                  )}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={goBack} variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {getText('돌아가기', 'Go Back', '返回')}
                </Button>
                <Button onClick={goToLookTalkAI}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {getText('LookTalkAI 시작하기', 'Try LookTalkAI', '尝试LookTalkAI')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const personaData = personas.find((p) => p.id === sharedData.persona);
  const localizedPersonaInfo = personaData
    ? getLocalizedPersonaInfo(personaData, sharedData.language)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50">
      <div className="max-w-2xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
        {/* 모바일 최적화된 메인 카드 - 이미지와 오디오를 한 화면에 */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {/* 이미지 섹션 - 모바일 최적화 */}
            <div className="relative">
              <div className="w-full max-h-[60vh] overflow-hidden bg-gray-100">
                <img
                  src={sharedData.imageUrl}
                  alt="Shared analysis"
                  className={`w-full h-auto object-contain max-h-[60vh] transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    display: 'block'
                  }}
                  onLoad={() => setImageLoaded(true)}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/image.png';
                    setImageLoaded(true);
                  }}
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                  </div>
                )}
              </div>
              
              {/* 페르소나 정보 오버레이 */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <div className="flex items-center space-x-3 text-white">
                  <div className="text-2xl">{personaData?.avatar}</div>
                  <div>
                    <h2 className="font-semibold text-sm sm:text-base">
                      {localizedPersonaInfo?.name}
                    </h2>
                    <p className="text-xs opacity-90">
                      {getText('AI 사진 분석', 'AI Photo Analysis', 'AI照片分析')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 오디오 플레이어 섹션 */}
            <div className="p-4 sm:p-6">
              <AudioPlayer
                audioUrl={sharedData.audioUrl}
                title={sharedData.script}
                character={localizedPersonaInfo?.name || ''}
                onShare={handleShare}
                onDownload={handleDownload}
                autoPlay={false}
                language={selectedLanguage}
                analysisData={{
                  imageUrl: sharedData.imageUrl,
                  script: sharedData.script,
                  persona: sharedData.persona,
                  timestamp: sharedData.timestamp,
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* 스크립트 섹션 - 접을 수 있는 형태 */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <button
              onClick={() => setShowFullScript(!showFullScript)}
              className="w-full flex items-center justify-between text-left group"
            >
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                  {getText('AI 해석 스크립트', 'AI Interpretation Script', 'AI解读脚本')}
                </h3>
              </div>
              <div className="flex items-center space-x-2 text-gray-500 group-hover:text-gray-700">
                <span className="text-xs">
                  {showFullScript 
                    ? getText('접기', 'Collapse', '收起') 
                    : getText('펼치기', 'Expand', '展开')
                  }
                </span>
                {showFullScript ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            </button>
            
            <div className="mt-4">
              <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  {showFullScript ? sharedData.script : getPreviewScript(sharedData.script)}
                </p>
                
                {!showFullScript && sharedData.script.split(' ').length > (window.innerWidth < 768 ? 25 : 35) && (
                  <button
                    onClick={() => setShowFullScript(true)}
                    className="mt-2 text-xs text-purple-600 hover:text-purple-700 font-medium"
                  >
                    {getText('더 보기', 'Read more', '阅读更多')}
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 액션 버튼들 */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleShare} variant="outline" className="w-full">
                <Share2 className="w-4 h-4 mr-2" />
                {getText('다시 공유', 'Share Again', '再次分享')}
              </Button>
              <Button onClick={handleDownload} variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                {getText('다운로드', 'Download', '下载')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* CTA 섹션 */}
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="p-6 text-center">
            <div className="text-3xl sm:text-4xl mb-3">🎭</div>
            <h3 className="font-semibold text-gray-900 mb-2 text-base sm:text-lg">
              {getText(
                '당신의 사진도 분석해보세요!',
                'Analyze Your Photo Too!',
                '也来分析您的照片吧！'
              )}
            </h3>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              {getText(
                'AI가 11가지 페르소나로 당신의 사진을 창의적으로 해석합니다',
                'AI creatively interprets your photos with 11 different personas',
                'AI用11种不同角色创造性地解释您的照片'
              )}
            </p>
            <Button onClick={goToLookTalkAI} size="lg" className="w-full sm:w-auto">
              <ExternalLink className="w-4 h-4 mr-2" />
              {getText('LookTalkAI 시작하기', 'Try LookTalkAI', '尝试LookTalkAI')}
            </Button>
          </CardContent>
        </Card>

        {/* 푸터 정보 */}
        <div className="text-center text-xs text-gray-500 px-2 py-4">
          <p>
            {getText(
              'LookTalkAI에서 생성된 AI 사진 분석입니다',
              'AI photo analysis generated by LookTalkAI',
              '由LookTalkAI生成的AI照片分析'
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
    </div>
  );
}