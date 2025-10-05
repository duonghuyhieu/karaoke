'use client'

import React from 'react'
import { Clock, Music, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { HistoryItem } from '@/types'

interface HistoryDisplayProps {
  history: HistoryItem[]
  onReAddSong?: (song: HistoryItem['song']) => void
  className?: string
}

export function HistoryDisplay({ history, onReAddSong, className }: HistoryDisplayProps) {
  if (history.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <div className="inline-flex items-center justify-center w-12 h-12 bg-muted rounded-full mb-3">
          <Clock className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-base font-medium text-foreground mb-1">Chưa có lịch sử</h3>
        <p className="text-sm text-muted-foreground">
          Các bài hát đã phát sẽ xuất hiện ở đây
        </p>
      </div>
    )
  }

  const formatPlayedAt = (playedAt: string) => {
    const date = new Date(playedAt)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) {
      return 'Vừa xong'
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours} giờ trước`
    } else {
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Lịch sử ({history.length} bài)
        </h3>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {history.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-muted"
          >
            {/* Song thumbnail */}
            {item.song.thumbnail && (
              <div className="flex-shrink-0">
                <img
                  src={item.song.thumbnail}
                  alt={item.song.title}
                  className="w-10 h-10 rounded object-cover opacity-75"
                />
              </div>
            )}

            {/* Song info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground truncate text-sm">
                {item.song.title}
              </h4>
              <p className="text-xs text-muted-foreground truncate">
                {item.song.artist}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatPlayedAt(item.playedAt)}
              </p>
            </div>

            {/* Duration and Re-add button */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                {item.song.duration}
              </span>
              {onReAddSong && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onReAddSong(item.song)}
                  className="h-7 w-7 p-0"
                  title="Thêm lại vào hàng đợi"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
