import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Globe, ChevronDown, Menu, X, LogIn, User, LogOut } from 'lucide-react'
import AuthModal from './AuthModal'
import { getCurrentUser, signOut, onAuthStateChange } from '../lib/auth'
import type { AuthUser } from '../lib/auth'

interface HeaderProps {
  selectedLanguage?: string
  onLanguageChange?: (language: string) => void
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' }
]

export function Header({ selectedLanguage = 'en', onLanguageChange }: HeaderProps) {
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  
  const currentLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage) || SUPPORTED_LANGUAGES[0]

  // 인증 상태 감지
  useEffect(() => {
    // 초기 사용자 정보 로드
    getCurrentUser().then(setCurrentUser)
    
    // 인증 상태 변화 감지
    const { data: { subscription } } = onAuthStateChange(setCurrentUser)
    
    return () => subscription.unsubscribe()
  }, [])

  const handleLanguageSelect = (langCode: string) => {
    onLanguageChange?.(langCode)
    setShowLanguageMenu(false)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setCurrentUser(null)
      setShowUserMenu(false)
    } catch (error) {
      console.error('로그아웃 실패:', error)
    }
  }

  const getText = (ko: string, en: string, zh: string) => {
    switch (selectedLanguage) {
      case 'ko': return ko
      case 'zh': return zh
      default: return en
    }
  }

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  const navigationItems = [
    {
      path: '/',
      label: getText('단일 분석', 'Single Analysis', '单一分析'),
    },
    {
      path: '/debate',
      label: getText('토론 모드', 'Debate Mode', '辩论模式'),
    },
    {
      path: '/persona-requests',
      label: getText('✨ 페르소나 요청', '✨ Persona Requests', '✨ 角色请求'),
    }
  ]

  const handleNavigation = (path: string) => {
    navigate(path)
    setShowMobileMenu(false)
  }

  return (
    <>
      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Left - Logo and LookTalkAI */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <img 
                src="/logo copy copy copy.png" 
                alt="LookTalkAI Logo" 
                className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain"
              />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">
                LookTalkAI
              </h1>
            </div>

            {/* Right - Auth + Language + Mobile Menu */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Authentication Section - Desktop */}
              <div className="hidden sm:flex items-center space-x-2">
                {currentUser ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700 max-w-24 truncate">
                        {currentUser.displayName}
                      </span>
                      <ChevronDown className="w-3 h-3 text-gray-500" />
                    </button>

                    {/* User Dropdown */}
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{currentUser.displayName}</p>
                          <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                        </div>
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{getText('로그아웃', 'Sign Out', '登出')}</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-teal-600 text-white hover:from-purple-700 hover:to-teal-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {getText('로그인', 'Sign In', '登录')}
                    </span>
                  </button>
                )}
              </div>

              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                >
                  <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700">
                    {currentLanguage.flag}
                  </span>
                  <ChevronDown className="w-2 h-2 sm:w-3 sm:h-3 text-gray-500" />
                </button>

                {/* Language Dropdown */}
                {showLanguageMenu && (
                  <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    {SUPPORTED_LANGUAGES.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => handleLanguageSelect(language.code)}
                        className={`w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-purple-50 transition-colors flex items-center space-x-2 sm:space-x-3 ${
                          selectedLanguage === language.code ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                        }`}
                      >
                        <span className="text-sm sm:text-lg">{language.flag}</span>
                        <span className="font-medium">{language.name}</span>
                        {selectedLanguage === language.code && (
                          <span className="ml-auto text-purple-600">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
              >
                {showMobileMenu ? (
                  <X className="w-5 h-5 text-gray-600" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Click outside to close menus */}
        {(showLanguageMenu || showUserMenu) && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => {
              setShowLanguageMenu(false)
              setShowUserMenu(false)
            }}
          />
        )}
      </header>

      {/* Mobile Navigation Overlay */}
      {showMobileMenu && (
        <>
          {/* 배경 오버레이 */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden"
            onClick={() => setShowMobileMenu(false)}
          />
          
          {/* 메뉴 패널 - 우측에서 슬라이드 */}
          <div className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 md:hidden transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* 헤더 */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {getText('메뉴', 'Menu', '菜单')}
                </h2>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              
              {/* 인증 섹션 - 모바일 */}
              <div className="p-4 border-b border-gray-200">
                {currentUser ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                      <User className="w-8 h-8 text-purple-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{currentUser.displayName}</p>
                        <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{getText('로그아웃', 'Sign Out', '登出')}</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setShowAuthModal(true)
                      setShowMobileMenu(false)
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-teal-600 text-white rounded-lg hover:from-purple-700 hover:to-teal-700 transition-all duration-200 shadow-md"
                  >
                    <LogIn className="w-5 h-5" />
                    <span className="font-medium">
                      {getText('로그인 / 회원가입', 'Sign In / Sign Up', '登录 / 注册')}
                    </span>
                  </button>
                )}
              </div>
              
              {/* 네비게이션 아이템들 */}
              <div className="flex-1 p-4">
                <nav className="space-y-2">
                  {navigationItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        isActive(item.path)
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <span className="font-medium">{item.label}</span>
                      {isActive(item.path) && (
                        <span className="ml-auto text-purple-600">✓</span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>
              
              {/* 푸터 */}
              <div className="p-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  LookTalkAI v1.0
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Navigation Tabs - 웹에서만 표시 (md 이상) */}
      <div className="hidden md:block sticky top-16 sm:top-20 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
          <nav className="flex justify-between">
            {/* Left side - 단일분석, 토론 모드 */}
            <div className="flex space-x-8">
              {navigationItems.slice(0, 2).map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive(item.path) 
                      ? 'border-purple-500 text-purple-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            
            {/* Right side - 페르소나 요청 */}
            <div className="flex">
              <button
                onClick={() => handleNavigation(navigationItems[2].path)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive(navigationItems[2].path) 
                    ? 'border-purple-500 text-purple-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {navigationItems[2].label}
              </button>
            </div>
          </nav>
        </div>
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
    </>
  )
}