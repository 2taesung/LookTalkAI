import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronUp, Sparkles, Search, Filter, Shuffle, Grid, List, Star, Zap } from 'lucide-react'
import { personas, type PersonaId, getLocalizedPersonaInfo } from '../lib/personas'

interface PersonaSelectorProps {
  selectedPersona: PersonaId
  onSelect: (persona: PersonaId) => void
  disabled?: boolean
  language?: string
  isDebateMode?: boolean // 토론 모드 여부를 나타내는 prop 추가
}

type ViewMode = 'carousel' | 'grid' | 'wheel' | 'cards'
type FilterType = 'all' | 'popular' | 'character' | 'profession'

export function PersonaSelector({ 
  selectedPersona, 
  onSelect, 
  disabled, 
  language = 'en',
  isDebateMode = false // 기본값은 false (단일 분석 모드)
}: PersonaSelectorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('carousel')
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [isExpanded, setIsExpanded] = useState(false)
  const [hoveredPersona, setHoveredPersona] = useState<PersonaId | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  const getText = (ko: string, en: string, zh: string) => {
    switch (language) {
      case 'ko': return ko
      case 'zh': return zh
      default: return en
    }
  }

  // 필터링된 페르소나 목록
  const filteredPersonas = personas.filter(persona => {
    const localizedInfo = getLocalizedPersonaInfo(persona, language)
    const matchesSearch = searchTerm === '' || 
      localizedInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      localizedInfo.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filter === 'all' || 
      (filter === 'popular' && persona.popular) ||
      (filter === 'character' && ['witty-entertainer', 'gruff-sea-captain', 'zombie', 'cute-affectionate-girl'].includes(persona.id)) ||
      (filter === 'profession' && ['art-critic', 'warm-psychologist', 'noir-detective', 'energetic-streamer'].includes(persona.id))
    
    return matchesSearch && matchesFilter
  })

  const selectedPersonaData = personas.find(p => p.id === selectedPersona)
  const selectedLocalizedInfo = selectedPersonaData ? getLocalizedPersonaInfo(selectedPersonaData, language) : null

  const randomizeSelection = () => {
    const availablePersonas = filteredPersonas.filter(p => p.id !== selectedPersona)
    if (availablePersonas.length > 0) {
      const randomPersona = availablePersonas[Math.floor(Math.random() * availablePersonas.length)]
      onSelect(randomPersona.id)
    }
  }

  // 캐러셀 스크롤 함수 개선
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const container = carouselRef.current
      const scrollAmount = container.clientWidth * 0.8 // 컨테이너 너비의 80%만큼 스크롤
      const newScrollLeft = direction === 'left' 
        ? container.scrollLeft - scrollAmount 
        : container.scrollLeft + scrollAmount
      
      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
    }
  }

  // 선택된 페르소나로 스크롤
  useEffect(() => {
    if (carouselRef.current && viewMode === 'carousel') {
      const selectedIndex = filteredPersonas.findIndex(p => p.id === selectedPersona)
      if (selectedIndex !== -1) {
        const container = carouselRef.current
        const cardWidth = isDebateMode ? 160 : 280 // 토론 모드에서는 카드 너비 축소
        const scrollPosition = selectedIndex * cardWidth - (container.clientWidth / 2) + (cardWidth / 2)
        
        container.scrollTo({
          left: Math.max(0, scrollPosition),
          behavior: 'smooth'
        })
      }
    }
  }, [selectedPersona, filteredPersonas, viewMode, isDebateMode])

  // 토론 모드에서는 항상 컴팩트 모드로 표시
  if (isDebateMode) {
    return (
      <div className="space-y-3 overflow-hidden">
        {/* 토론 모드용 간소화된 그리드 뷰 */}
        <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[300px] p-1">
          {filteredPersonas.map((persona) => {
            const localizedInfo = getLocalizedPersonaInfo(persona, language)
            const isSelected = persona.id === selectedPersona
            
            return (
              <div
                key={persona.id}
                className={`p-2 rounded-lg border-2 cursor-pointer transition-all duration-200 transform-gpu ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50'
                }`}
                onClick={() => onSelect(persona.id)}
              >
                <div className="flex items-center space-x-2">
                  <div className="text-xl flex-shrink-0">{persona.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-xs truncate">
                      {localizedInfo.name}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">
                      {localizedInfo.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        {/* 검색 및 필터 */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
            <input
              type="text"
              placeholder={getText('검색...', 'Search...', '搜索...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 pr-2 py-1 text-xs border border-gray-300 rounded-md"
            />
          </div>
          <button
            onClick={randomizeSelection}
            className="p-1 bg-purple-100 text-purple-600 rounded-md hover:bg-purple-200"
            title={getText('랜덤', 'Random', '随机')}
          >
            <Shuffle className="w-3 h-3" />
          </button>
        </div>
      </div>
    )
  }

  // 컴팩트 모드 (기본 상태) - 오버플로우 처리 개선
  if (!isExpanded) {
    return (
      <div className="space-y-4 overflow-hidden">
        {/* 선택된 페르소나 미리보기 */}
        <div className="relative p-6 rounded-2xl border-2 border-purple-500 bg-gradient-to-br from-purple-50 via-white to-blue-50 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-blue-200/30 rounded-full -translate-y-16 translate-x-16"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl sm:text-5xl animate-bounce">{selectedPersonaData?.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-bold text-purple-900 text-xl sm:text-2xl">
                    {selectedLocalizedInfo?.name}
                  </h4>
                  {selectedPersonaData?.popular && (
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  )}
                </div>
                <p className="text-base sm:text-lg text-purple-800 font-medium">
                  {selectedLocalizedInfo?.description}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <button
                onClick={randomizeSelection}
                disabled={disabled}
                className="p-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-full hover:from-teal-600 hover:to-blue-600 transition-all duration-300 hover:scale-105 shadow-lg"
                title={getText('랜덤 선택', 'Random Selection', '随机选择')}
              >
                <Shuffle className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsExpanded(true)}
                disabled={disabled}
                className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 shadow-lg"
                title={getText('더 많은 페르소나 보기', 'View More Personas', '查看更多角色')}
              >
                <Grid className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* 빠른 선택 캐러셀 - 스크롤 개선 */}
        <div className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-sm font-medium text-gray-700">
              {getText('빠른 선택', 'Quick Select', '快速选择')}
            </h5>
            <div className="flex space-x-1">
              <button
                onClick={() => scrollCarousel('left')}
                className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                disabled={disabled}
              >
                <ChevronDown className="w-4 h-4 rotate-90" />
              </button>
              <button
                onClick={() => scrollCarousel('right')}
                className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                disabled={disabled}
              >
                <ChevronDown className="w-4 h-4 -rotate-90" />
              </button>
            </div>
          </div>
          
          <div 
            ref={carouselRef}
            className="flex space-x-3 overflow-x-auto scrollbar-hide pb-2 px-1 scroll-smooth"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              scrollSnapType: 'x mandatory'
            }}
          >
            {personas.slice(0, 8).map((persona) => {
              const localizedInfo = getLocalizedPersonaInfo(persona, language)
              const isSelected = persona.id === selectedPersona
              
              return (
                <button
                  key={persona.id}
                  onClick={() => onSelect(persona.id)}
                  disabled={disabled}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl border-2 transition-all duration-300 transform-gpu ${
                    isSelected
                      ? 'border-purple-500 bg-purple-100 shadow-lg scale-105'
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md hover:scale-105'
                  }`}
                  style={{
                    margin: '4px',
                    scrollSnapAlign: 'start'
                  }}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="text-2xl mb-1">{persona.avatar}</div>
                    <div className="text-xs font-medium text-gray-700 truncate px-1">
                      {localizedInfo.name.split(' ')[0]}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => setIsExpanded(true)}
            disabled={disabled}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center space-x-1 mx-auto"
          >
            <span>{getText('모든 페르소나 보기', 'View All Personas', '查看所有角色')} ({personas.length})</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  // 확장 모드 - 레이아웃 개선
  return (
    <div className="space-y-6 overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <span>{getText('페르소나 선택', 'Choose Persona', '选择角色')}</span>
        </h3>
        <button
          onClick={() => setIsExpanded(false)}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      </div>

      {/* 컨트롤 바 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {/* 검색 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={getText('페르소나 검색...', 'Search personas...', '搜索角色...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
          </div>

          {/* 필터 */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          >
            <option value="all">{getText('전체', 'All', '全部')}</option>
            <option value="popular">{getText('인기', 'Popular', '热门')}</option>
            <option value="character">{getText('캐릭터', 'Characters', '角色')}</option>
            <option value="profession">{getText('직업', 'Professions', '职业')}</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          {/* 뷰 모드 선택 */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { mode: 'carousel' as ViewMode, icon: List, label: getText('캐러셀', 'Carousel', '轮播') },
              { mode: 'grid' as ViewMode, icon: Grid, label: getText('그리드', 'Grid', '网格') },
              { mode: 'wheel' as ViewMode, icon: Zap, label: getText('휠', 'Wheel', '轮盘') }
            ].map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === mode
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                title={label}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          {/* 랜덤 버튼 */}
          <button
            onClick={randomizeSelection}
            disabled={disabled}
            className="p-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:from-teal-600 hover:to-blue-600 transition-all duration-300 hover:scale-105"
            title={getText('랜덤 선택', 'Random Selection', '随机选择')}
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 캐러셀 뷰 - 스크롤 개선 */}
      {viewMode === 'carousel' && (
        <div className="relative overflow-hidden">
          <div 
            ref={carouselRef}
            className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide px-2 scroll-smooth"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              scrollSnapType: 'x mandatory'
            }}
          >
            {filteredPersonas.map((persona) => {
              const localizedInfo = getLocalizedPersonaInfo(persona, language)
              const isSelected = persona.id === selectedPersona
              
              return (
                <div
                  key={persona.id}
                  className={`flex-shrink-0 w-64 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 transform-gpu ${
                    isSelected
                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 shadow-lg scale-105'
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md hover:scale-105'
                  }`}
                  onClick={() => onSelect(persona.id)}
                  onMouseEnter={() => setHoveredPersona(persona.id)}
                  onMouseLeave={() => setHoveredPersona(null)}
                  style={{
                    margin: '8px 4px',
                    scrollSnapAlign: 'start'
                  }}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="text-3xl animate-bounce">{persona.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {localizedInfo.name}
                        </h4>
                        {persona.popular && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {localizedInfo.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      {persona.voiceStyle}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      {persona.analysisStyle}
                    </span>
                  </div>
                  
                  {hoveredPersona === persona.id && (
                    <div className="mt-3 text-xs text-purple-600 font-medium animate-pulse">
                      {getText('클릭하여 선택', 'Click to select', '点击选择')}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          
          {/* 스크롤 인디케이터 */}
          <div className="flex justify-center space-x-1 mt-4">
            {Array.from({ length: Math.ceil(filteredPersonas.length / 3) }).map((_, index) => (
              <div
                key={index}
                className="w-2 h-2 rounded-full bg-gray-300"
              />
            ))}
          </div>
        </div>
      )}

      {/* 그리드 뷰 - 레이아웃 개선 */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-2 overflow-hidden">
          {filteredPersonas.map((persona) => {
            const localizedInfo = getLocalizedPersonaInfo(persona, language)
            const isSelected = persona.id === selectedPersona
            
            return (
              <div
                key={persona.id}
                className={`p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 transform-gpu ${
                  isSelected
                    ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 shadow-lg scale-105'
                    : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md hover:scale-105'
                }`}
                onClick={() => onSelect(persona.id)}
                style={{
                  margin: '4px'
                }}
              >
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl mb-2 animate-bounce">{persona.avatar}</div>
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <h4 className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
                      {localizedInfo.name}
                    </h4>
                    {persona.popular && (
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2 leading-tight">
                    {localizedInfo.description}
                  </p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      {persona.voiceStyle}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 휠 뷰 - 오버플로우 처리 개선 */}
      {viewMode === 'wheel' && (
        <div className="relative overflow-hidden p-8">
          <div className="w-80 h-80 mx-auto relative">
            {filteredPersonas.map((persona, index) => {
              const localizedInfo = getLocalizedPersonaInfo(persona, language)
              const isSelected = persona.id === selectedPersona
              const angle = (index * 360) / filteredPersonas.length
              const radius = 120
              const x = Math.cos((angle - 90) * Math.PI / 180) * radius
              const y = Math.sin((angle - 90) * Math.PI / 180) * radius
              
              return (
                <div
                  key={persona.id}
                  className={`absolute w-16 h-16 rounded-full border-2 cursor-pointer transition-all duration-300 transform-gpu flex items-center justify-center ${
                    isSelected
                      ? 'border-purple-500 bg-purple-100 shadow-lg z-10 scale-125'
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md hover:scale-125'
                  }`}
                  style={{
                    left: `calc(50% + ${x}px - 32px)`,
                    top: `calc(50% + ${y}px - 32px)`,
                  }}
                  onClick={() => onSelect(persona.id)}
                  title={localizedInfo.name}
                >
                  <div className="text-2xl">{persona.avatar}</div>
                  {persona.popular && (
                    <Star className="absolute -top-1 -right-1 w-3 h-3 text-yellow-500 fill-current" />
                  )}
                </div>
              )
            })}
            
            {/* 중앙 선택된 페르소나 */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-4 border-purple-500 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center shadow-xl">
              <div className="text-center">
                <div className="text-3xl mb-1">{selectedPersonaData?.avatar}</div>
                <div className="text-xs font-bold text-purple-700">
                  {getText('선택됨', 'Selected', '已选择')}
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-6">
            <h4 className="font-semibold text-lg text-gray-900 mb-1">
              {selectedLocalizedInfo?.name}
            </h4>
            <p className="text-sm text-gray-600">
              {selectedLocalizedInfo?.description}
            </p>
          </div>
        </div>
      )}

      {/* 결과 카운터 */}
      <div className="text-center text-sm text-gray-500">
        {getText(
          `${filteredPersonas.length}개의 페르소나가 있습니다`,
          `${filteredPersonas.length} personas available`,
          `${filteredPersonas.length}个角色可用`
        )}
      </div>
    </div>
  )
}