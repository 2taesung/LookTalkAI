import React from 'react'
import { Play, Heart, Bookmark } from 'lucide-react'
import { Card, CardContent } from './ui/Card'
import { Button } from './ui/Button'
import { characters } from '../lib/characters'

interface FeedCardProps {
  id: string
  character: string
  textInput: string
  createdAt: string
  isPublic: boolean
  onPlay?: () => void
  onLike?: () => void
  onBookmark?: () => void
}

export function FeedCard({
  id,
  character,
  textInput,
  createdAt,
  onPlay,
  onLike,
  onBookmark
}: FeedCardProps) {
  const characterData = characters.find(c => c.id === character)
  const timeAgo = new Date(createdAt).toLocaleDateString()

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {/* Character Avatar */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-teal-100 rounded-full flex items-center justify-center text-xl">
              {characterData?.avatar || '🎭'}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-gray-900">
                  {characterData?.name || 'Unknown Character'}
                </h3>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">{timeAgo}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                {textInput}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <Button
                onClick={onPlay}
                variant="outline"
                size="sm"
                className="flex-1 mr-2"
              >
                <Play className="w-4 h-4 mr-2" />
                Listen
              </Button>

              <div className="flex items-center space-x-2">
                <Button
                  onClick={onLike}
                  variant="ghost"
                  size="sm"
                  className="p-2"
                >
                  <Heart className="w-4 h-4" />
                </Button>
                <Button
                  onClick={onBookmark}
                  variant="ghost"
                  size="sm"
                  className="p-2"
                >
                  <Bookmark className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}