import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
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

  // 메타데이터 생성
  const generateMetadata = () => {
    if (!sharedData) {
      return {
        title: getText(
          'LookTalkAI - AI 사진 분석',
          'LookTalkAI - AI Photo Analysis',
          'LookTalkAI - AI照片分析'
        ),
        description: getText(
          'AI가 다양한 페르소나의 관점으로 사진을 창의적으로 해석합니다',
          'AI creatively interprets photos from various persona perspectives',
          'AI从不同角色的角度创造性地解释照片'
        ),
        image: `${window.location.origin}/logo.png`
      };
    }

    const personaData = personas.find((p) => p.id === sharedData.persona);
    const localizedPersonaInfo = personaData
      ? getLocalizedPersonaInfo(personaData, selectedLanguage)
      : null;

    const title = getText(
      `${localizedPersonaInfo?.name || ''}의 AI 사진 분석 - LookTalkAI`,
      `${localizedPersonaInfo?.name || ''}'s AI Photo Analysis - LookTalkAI`,
      `${localizedPersonaInfo?.name || ''}的AI照片分析 - LookTalkAI`
    );

    const description = getText(
      `${localizedPersonaInfo?.name || 'AI'}가 이 사진을 분석했습니다: "${sharedData.script.substring(0, 120)}..." 🎭 음성으로 들어보세요!`,
      `${localizedPersonaInfo?.name || 'AI'} analyzed this photo: "${sharedData.script.substring(0, 120)}..." 🎭 Listen with voice!`,
      `${localizedPersonaInfo?.name || 'AI'}分析了这张照片："${sharedData.script.substring(0, 120)}..." 🎭 用语音收听！`
    );

    return {
      title,
      description,
      image: sharedData.imageUrl || `${window.location.origin}/logo.png`
    };
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
          console.log('✅ Supabase 데이터 로드 성공');
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

  const metadata = generateMetadata();
  const personaData = sharedData ? personas.find((p) => p.id === sharedData.persona) : null;
  const localizedPersonaInfo = personaData
    ? getLocalizedPersonaInfo(personaData, selectedLanguage)
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50">
        <Helmet>
          <title>{metadata.title}</title>
          <meta name="description" content={metadata.description} />
          <meta property="og:title" content={metadata.title} />
          <meta property="og:description" content={metadata.description} />
          <meta property="og:image" content={metadata.image} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={window.location.href} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={metadata.title} />
          <meta name="twitter:description" content={metadata.description} />
          <meta name="twitter:image" content={metadata.image} />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href={window.location.href} />
        </Helmet>
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
        <Helmet>
          <title>{metadata.title}</title>
          <meta name="description" content={metadata.description} />
          <meta property="og:title" content={metadata.title} />
          <meta property="og:description" content={metadata.description} />
          <meta property="og:image" content={metadata.image} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={window.location.href} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={metadata.title} />
          <meta name="twitter:description" content={metadata.description} />
          <meta name="twitter:image" content={metadata.image} />
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50">
      <Helmet>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        
        {/* Open Graph 메타데이터 */}
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:image" content={metadata.image} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:site_name" content="LookTalkAI" />
        <meta property="og:locale" content={selectedLanguage === 'ko' ? 'ko_KR' : selectedLanguage === 'zh' ? 'zh_CN' : 'en_US'} />
        
        {/* Twitter Card 메타데이터 */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:image" content={metadata.image} />
        <meta name="twitter:site" content="@LookTalkAI" />
        <meta name="twitter:creator" content="@LookTalkAI" />
        
        {/* 추가 SEO 메타데이터 */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="LookTalkAI" />
        <meta name="keywords" content={getText(
          'AI 사진 분석, 인공지능, 사진 해석, 음성 메시지, 페르소나',
          'AI photo analysis, artificial intelligence, photo interpretation, voice message, persona',
          'AI照片分析, 人工智能, 照片解读, 语音消息, 角色'
        )} />
        <link rel="canonical" href={window.location.href} />
        
        {/* 모바일 최적화 */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#8B5CF6" />
        
        {/* 추가 소셜 미디어 메타데이터 */}
        <meta property="article:author" content="LookTalkAI" />
        <meta property="article:published_time" content={new Date(sharedData.timestamp).toISOString()} />
        <meta property="article:tag" content={getText('AI분석', 'AI Analysis', 'AI分析')} />
        <meta property="article:tag" content={getText('사진해석', 'Photo Interpretation', '照片解读')} />
        <meta property="article:tag" content={localizedPersonaInfo?.name || ''} />
      </Helmet>
      
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