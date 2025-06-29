import React, { useState, useEffect } from 'react'
import { MessageSquare, Plus, Heart, Clock, User, Send, Lightbulb, Star, TrendingUp, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader } from './ui/Card'
import { Button } from './ui/Button'
import AuthModal from './AuthModal'
import { 
  getPersonaRequests, 
  createPersonaRequest, 
  togglePersonaRequestLike,
  type PersonaRequest,
  type CreatePersonaRequestData 
} from '../lib/personaRequests'
import { getCurrentUser, onAuthStateChange, signOut } from '../lib/auth'
import type { AuthUser } from '../lib/auth'

interface PersonaRequestBoardProps {
  selectedLanguage: string
}

export function PersonaRequestBoard({ selectedLanguage }: PersonaRequestBoardProps) {
  const [requests, setRequests] = useState<PersonaRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewRequestForm, setShowNewRequestForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [newRequest, setNewRequest] = useState<CreatePersonaRequestData>({
    title: '',
    description: '',
    author: '',
    category: 'character'
  })
  const [filter, setFilter] = useState<'all' | 'pending' | 'popular'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'trending'>('newest')

  const getText = (ko: string, en: string, zh: string) => {
    switch (selectedLanguage) {
      case 'ko': return ko
      case 'zh': return zh
      default: return en
    }
  }

  // 인증 상태 감지
  useEffect(() => {
    // 초기 사용자 정보 로드
    getCurrentUser().then(setCurrentUser)
    
    // 인증 상태 변화 감지
    const { data: { subscription } } = onAuthStateChange(setCurrentUser)
    
    return () => subscription.unsubscribe()
  }, [])

  // 데이터 로드
  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    setLoading(true)
    try {
      console.log('페르소나 요청 데이터 로드 시작...')
      const data = await getPersonaRequests()
      console.log('로드된 페르소나 요청:', data)
      setRequests(data)
    } catch (error) {
      console.error('요청 로드 실패:', error)
      // 에러 발생 시 빈 배열로 설정
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitRequest = async () => {
    if (!currentUser) {
      setShowAuthModal(true)
      return
    }

    if (!newRequest.title.trim() || !newRequest.description.trim()) {
      alert(getText('제목과 설명을 입력해주세요.', 'Please fill in title and description.', '请填写标题和描述。'))
      return
    }

    setSubmitting(true)
    try {
      console.log('페르소나 요청 제출 시작:', {
        ...newRequest,
        author: currentUser.displayName
      })
      
      const success = await createPersonaRequest({
        ...newRequest,
        author: currentUser.displayName
      })
      
      if (success) {
        console.log('페르소나 요청 제출 성공')
        setNewRequest({ title: '', description: '', author: '', category: 'character' })
        setShowNewRequestForm(false)
        await loadRequests() // 데이터 새로고침
        
        alert(getText(
          '페르소나 요청이 성공적으로 제출되었습니다!',
          'Persona request submitted successfully!',
          '角色请求提交成功！'
        ))
      } else {
        throw new Error('제출 실패')
      }
    } catch (error) {
      console.error('요청 제출 실패:', error)
      alert(getText(
        '요청 제출에 실패했습니다. 다시 시도해주세요.',
        'Failed to submit request. Please try again.',
        '提交请求失败。请重试。'
      ))
    } finally {
      setSubmitting(false)
    }
  }

  const handleLike = async (requestId: string) => {
    try {
      console.log('좋아요 토글 시작:', requestId)
      const result = await togglePersonaRequestLike(requestId)
      console.log('좋아요 토글 결과:', result)
      
      if (result.success) {
        setRequests(requests.map(request => 
          request.id === requestId 
            ? { 
                ...request, 
                likes_count: result.isLiked ? request.likes_count + 1 : request.likes_count - 1,
                isLiked: result.isLiked 
              }
            : request
        ))
      }
    } catch (error) {
      console.error('좋아요 실패:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setCurrentUser(null)
    } catch (error) {
      console.error('로그아웃 실패:', error)
    }
  }

  const getStatusColor = (status: PersonaRequest['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'in-review': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'implemented': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: PersonaRequest['status']) => {
    switch (status) {
      case 'pending': return getText('검토 대기', 'Pending', '待审核')
      case 'in-review': return getText('검토 중', 'In Review', '审核中')
      case 'approved': return getText('승인됨', 'Approved', '已批准')
      case 'implemented': return getText('구현됨', 'Implemented', '已实现')
      default: return status
    }
  }

  const getCategoryText = (category: PersonaRequest['category']) => {
    switch (category) {
      case 'character': return getText('캐릭터', 'Character', '角色')
      case 'profession': return getText('직업', 'Profession', '职业')
      case 'personality': return getText('성격', 'Personality', '性格')
      case 'other': return getText('기타', 'Other', '其他')
      default: return category
    }
  }

  const filteredAndSortedRequests = requests
    .filter(request => {
      if (filter === 'pending') return request.status === 'pending'
      if (filter === 'popular') return request.likes_count >= 20
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'popular') return b.likes_count - a.likes_count
      if (sortBy === 'trending') return b.likes_count - a.likes_count
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-0">
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="animate-spin w-8 h-8 text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">
              {getText('페르소나 요청을 불러오는 중...', 'Loading persona requests...', '正在加载角色请求...')}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-3 sm:px-0">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <span className="text-2xl">✨</span>
          <MessageSquare className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">
            ✨ {getText('페르소나 요청 게시판', 'Persona Request Board', '角色请求板')}
          </h2>
        </div>
        <p className="text-base sm:text-lg text-gray-600 px-2">
          {getText(
            '새로운 AI 페르소나를 제안하고 다른 사용자들과 아이디어를 공유하세요',
            'Suggest new AI personas and share ideas with other users',
            '建议新的AI角色并与其他用户分享想法'
          )}
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700">
            <Lightbulb className="w-3 h-3" />
            <span>{getText('실시간 데이터', 'Real-time Data', '实时数据')}</span>
          </div>
          <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-green-100 text-green-700">
            <Heart className="w-3 h-3" />
            <span>{getText('중복 방지 좋아요', 'Duplicate-proof Likes', '防重复点赞')}</span>
          </div>
          <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-purple-100 text-purple-700">
            <Star className="w-3 h-3" />
            <span>{getText('개발 반영', 'Development Integration', '开发整合')}</span>
          </div>
        </div>
      </div>

      {/* 필터 및 정렬, 새 요청 버튼 */}
      <div className="flex justify-between items-center">
        <div className="flex flex-wrap gap-2">
          {/* Filter Buttons */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {[
              { key: 'all', label: getText('전체', 'All', '全部'), icon: MessageSquare },
              { key: 'pending', label: getText('대기중', 'Pending', '待审核'), icon: Clock },
              { key: 'popular', label: getText('인기', 'Popular', '热门'), icon: TrendingUp }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filter === key
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="newest">{getText('최신순', 'Newest', '最新')}</option>
            <option value="popular">{getText('인기순', 'Most Popular', '最受欢迎')}</option>
            <option value="trending">{getText('트렌딩', 'Trending', '趋势')}</option>
          </select>
        </div>

        {/* 새 요청 버튼과 사용자 정보 */}
        <div className="flex items-center space-x-3">
          {/* 새 페르소나 요청 버튼 */}
          <Button
            onClick={() => {
              if (!currentUser) {
                setShowAuthModal(true)
                return
              }
              setShowNewRequestForm(true)
            }}
            className="flex items-center space-x-2"
            disabled={submitting}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">✨ {getText('새 페르소나 요청', 'New Persona Request', '新角色请求')}</span>
            <span className="sm:hidden">✨ {getText('새 요청', 'New', '新建')}</span>
          </Button>

          {/* 사용자 정보 (로그인된 경우에만 표시) */}
          {currentUser && (
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{currentUser.displayName}</p>
                <p className="text-xs text-gray-500">{currentUser.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded border border-gray-200 hover:border-gray-300"
              >
                {getText('로그아웃', 'Sign Out', '登出')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 로그인 안내 (비로그인 시) */}
      {!currentUser && (
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold text-gray-900 mb-2 text-base sm:text-lg">
              {getText(
                '페르소나 요청을 작성하려면 로그인하세요!',
                'Sign in to create persona requests!',
                '登录后创建角色请求！'
              )}
            </h3>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              {getText(
                '회원가입하시면 새로운 AI 페르소나를 제안할 수 있습니다',
                'Sign up to suggest new AI personas',
                '注册后可以建议新的AI角色'
              )}
            </p>
            <Button onClick={() => setShowAuthModal(true)}>
              {getText('로그인 / 회원가입', 'Sign In / Sign Up', '登录 / 注册')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* New Request Form */}
      {showNewRequestForm && currentUser && (
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Plus className="w-5 h-5 text-purple-600" />
              <span>✨ {getText('새 페르소나 요청', 'New Persona Request', '新角色请求')}</span>
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getText('제목', 'Title', '标题')} *
                </label>
                <input
                  type="text"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                  placeholder={getText('페르소나 이름을 입력하세요', 'Enter persona name', '输入角色名称')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getText('카테고리', 'Category', '类别')}
                </label>
                <select
                  value={newRequest.category}
                  onChange={(e) => setNewRequest({ ...newRequest, category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={submitting}
                >
                  <option value="character">{getText('캐릭터', 'Character', '角色')}</option>
                  <option value="profession">{getText('직업', 'Profession', '职业')}</option>
                  <option value="personality">{getText('성격', 'Personality', '性格')}</option>
                  <option value="other">{getText('기타', 'Other', '其他')}</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {getText('설명', 'Description', '描述')} *
              </label>
              <textarea
                value={newRequest.description}
                onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                placeholder={getText(
                  '어떤 페르소나를 원하시나요? 성격, 말투, 분석 스타일 등을 자세히 설명해주세요...',
                  'What kind of persona do you want? Please describe personality, speech style, analysis style, etc. in detail...',
                  '您想要什么样的角色？请详细描述性格、说话风格、分析风格等...'
                )}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                disabled={submitting}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleSubmitRequest} 
                className="flex-1"
                disabled={submitting}
                loading={submitting}
              >
                <Send className="w-4 h-4 mr-2" />
                ✨ {getText('요청 제출', 'Submit Request', '提交请求')}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowNewRequestForm(false)}
                className="flex-1"
                disabled={submitting}
              >
                {getText('취소', 'Cancel', '取消')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Request List */}
      <div className="space-y-4">
        {filteredAndSortedRequests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {loading 
                  ? getText('데이터를 불러오는 중...', 'Loading data...', '正在加载数据...')
                  : getText('요청이 없습니다', 'No Requests', '没有请求')
                }
              </h3>
              <p className="text-gray-600">
                {loading 
                  ? getText('잠시만 기다려주세요', 'Please wait a moment', '请稍等')
                  : getText(
                      '첫 번째 페르소나 요청을 작성해보세요!',
                      'Be the first to write a persona request!',
                      '成为第一个写角色请求的人！'
                    )
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAndSortedRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">✨</span>
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {request.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{request.display_name || request.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(request.created_at).toLocaleDateString()}</span>
                      </div>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        {getCategoryText(request.category)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {request.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleLike(request.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      request.isLiked
                        ? 'bg-red-100 text-red-600 border border-red-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 border border-gray-200'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${request.isLiked ? 'fill-current' : ''}`} />
                    <span className="font-medium">{request.likes_count}</span>
                  </button>
                  
                  {request.status === 'implemented' && (
                    <div className="flex items-center space-x-1 text-purple-600 bg-purple-100 px-3 py-2 rounded-lg border border-purple-200">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">
                        ✨ {getText('구현 완료!', 'Implemented!', '已实现！')}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="text-center text-xs sm:text-sm text-gray-500 px-2">
        <p>
          ✨ {getText(
            '인기 있는 요청은 우선적으로 개발에 반영됩니다',
            'Popular requests will be prioritized for development',
            '热门请求将优先考虑开发'
          )}
        </p>
        <p className="mt-1">
          {getText(
            '실시간 데이터 • 중복 방지 좋아요 • 개발 반영 • 완전 무료',
            'Real-time Data • Duplicate-proof Likes • Development Integration • Completely Free',
            '实时数据 • 防重复点赞 • 开发整合 • 完全免费'
          )}
        </p>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          // 사용자 정보 새로고침
          getCurrentUser().then(setCurrentUser)
        }}
        selectedLanguage={selectedLanguage}
      />
    </div>
  )
}