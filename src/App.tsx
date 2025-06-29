import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Header } from './components/Header'
import { PhotoAnalyzer } from './components/PhotoAnalyzer'
import { DebateAnalyzer } from './components/DebateAnalyzer'
import { SharedAnalysis } from './components/SharedAnalysis'
import { PersonaRequestBoard } from './components/PersonaRequestBoard'
import AuthCallback from './components/AuthCallback'
import { ToastProvider } from './components/ToastProvider'
import { BoltBadge } from './components/BoltBadge'

// 브라우저 언어 감지 함수
function detectBrowserLanguage(): string {
  // 지원하는 언어 목록
  const supportedLanguages = ['en', 'ko', 'zh']
  
  // 브라우저의 언어 설정 가져오기
  const browserLanguages = navigator.languages || [navigator.language]
  
  // 첫 번째로 매칭되는 지원 언어 찾기
  for (const browserLang of browserLanguages) {
    const langCode = browserLang.split('-')[0].toLowerCase() // 'en-US' -> 'en'
    if (supportedLanguages.includes(langCode)) {
      return langCode
    }
  }
  
  // 매칭되는 언어가 없으면 영어를 기본값으로
  return 'en'
}

function App() {
  // 브라우저 언어를 감지해서 초기값으로 설정
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    // 로컬 스토리지에 저장된 언어가 있으면 그것을 우선 사용
    const savedLanguage = localStorage.getItem('preferred-language')
    if (savedLanguage && ['en', 'ko', 'zh'].includes(savedLanguage)) {
      return savedLanguage
    }
    // 없으면 브라우저 언어 감지
    return detectBrowserLanguage()
  })

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language)
    // 사용자가 선택한 언어를 로컬 스토리지에 저장
    localStorage.setItem('preferred-language', language)
    console.log('언어 변경됨:', language)
  }

  // 컴포넌트 마운트 시 브라우저 언어 감지 로그
  useEffect(() => {
    console.log('브라우저 언어:', navigator.language)
    console.log('브라우저 언어 목록:', navigator.languages)
    console.log('감지된 언어:', detectBrowserLanguage())
    console.log('최종 선택된 언어:', selectedLanguage)
  }, [])

  return (
    <Router>
      <ToastProvider>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50">
          <Routes>
            {/* 이메일 인증 콜백 페이지 (헤더 없음) */}
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* 일반 페이지들 (헤더 포함) */}
            <Route path="/*" element={
              <>
                <Header
                  selectedLanguage={selectedLanguage}
                  onLanguageChange={handleLanguageChange}
                />
                
                <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
                  <Routes>
                    <Route path="/" element={<PhotoAnalyzer selectedLanguage={selectedLanguage} />} />
                    <Route path="/debate" element={<DebateAnalyzer selectedLanguage={selectedLanguage} />} />
                    <Route path="/persona-requests" element={<PersonaRequestBoard selectedLanguage={selectedLanguage} />} />
                    <Route path="/shared/:shareId" element={<SharedAnalysis selectedLanguage={selectedLanguage} />} />
                    <Route path="/analyzer" element={<Navigate to="/" replace />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>

                {/* Footer */}
                <footer className="border-t border-gray-200 bg-white/50 backdrop-blur-sm">
                  <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
                    <div className="text-center space-y-3 sm:space-y-4">
                      <p className="text-xs sm:text-sm text-gray-600 px-4">
                        {selectedLanguage === 'ko' ? 'AI가 당신의 사진을 창의적으로 해석합니다.' :
                         selectedLanguage === 'en' ? 'AI creatively interprets your photos.' :
                         selectedLanguage === 'zh' ? 'AI创造性地解释您的照片。' :
                         'AI creatively interprets your photos.'}
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-500">
                        <a href="#privacy" className="hover:text-gray-700 transition-colors">
                          {selectedLanguage === 'ko' ? '개인정보' : selectedLanguage === 'en' ? 'Privacy' : selectedLanguage === 'zh' ? '隐私' : 'Privacy'}
                        </a>
                        <a href="#terms" className="hover:text-gray-700 transition-colors">
                          {selectedLanguage === 'ko' ? '이용약관' : selectedLanguage === 'en' ? 'Terms' : selectedLanguage === 'zh' ? '条款' : 'Terms'}
                        </a>
                        <a href="#contact" className="hover:text-gray-700 transition-colors">
                          {selectedLanguage === 'ko' ? '문의' : selectedLanguage === 'en' ? 'Contact' : selectedLanguage === 'zh' ? '联系' : 'Contact'}
                        </a>
                      </div>
                      
                      {/* Built with Bolt.new Badge */}
                      <div className="flex justify-center pt-2">
                        <BoltBadge />
                      </div>
                    </div>
                  </div>
                </footer>
              </>
            } />
          </Routes>
        </div>
      </ToastProvider>
    </Router>
  )
}

export default App