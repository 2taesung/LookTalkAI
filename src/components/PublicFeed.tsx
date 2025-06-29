import React, { useState, useEffect } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { FeedCard } from './FeedCard'

interface PublicFeedProps {
  selectedLanguage: string
}

export function PublicFeed({ selectedLanguage }: PublicFeedProps) {
  const [loading, setLoading] = useState(false)

  const getLocalizedText = (ko: string, en: string, ja?: string, zh?: string) => {
    if (selectedLanguage === 'ko') return ko
    if (selectedLanguage === 'ja') return ja || en
    if (selectedLanguage === 'zh') return zh || en
    return en
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            {getLocalizedText('둘러보기', 'Discover', '発見', '发现')}
          </h2>
        </div>
        <p className="text-gray-600">
          {getLocalizedText('커뮤니티의 놀라운 내레이션들', 'Amazing narrations from our community', 'コミュニティからの素晴らしいナレーション', '来自我们社区的精彩旁白')}
        </p>
      </div>

      {/* No Database Message */}
      <div className="text-center py-12">
        <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {getLocalizedText('데이터베이스 연결 없음', 'No Database Connection', 'データベース接続なし', '无数据库连接')}
        </h3>
        <p className="text-gray-600">
          {getLocalizedText(
            '현재 Supabase 데이터베이스에 연결되어 있지 않습니다. 생성된 내레이션은 로컬에서만 재생됩니다.',
            'Currently not connected to Supabase database. Generated narrations are played locally only.',
            '現在Supabaseデータベースに接続されていません。生成されたナレーションはローカルでのみ再生されます。',
            '当前未连接到Supabase数据库。生成的旁白仅在本地播放。'
          )}
        </p>
      </div>
    </div>
  )
}