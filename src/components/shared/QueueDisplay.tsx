'use client'

import React from 'react'
import { Button } from '@/components/ui/Button'
import { Play, Trash2, Music, ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { QueueDisplayProps } from '@/types'

export function QueueDisplay({
  queue,
  currentSongId,
  onRemove,
  onPlay,
  onReorder,
  showControls = true
}: QueueDisplayProps) {
  if (queue.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
          <Music className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">Không có bài hát trong hàng đợi</h3>
        <p className="text-muted-foreground">
          Thêm một số bài hát để bắt đầu bữa tiệc karaoke!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Hàng đợi ({queue.length} bài)
        </h3>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {queue.map((item, index) => {
          const isCurrentSong = item.song.id === currentSongId

          return (
            <div
              key={item.id}
              className={cn(
                'flex items-center gap-3 p-3 bg-card rounded-lg border transition-all',
                isCurrentSong && 'ring-2 ring-primary bg-primary/5'
              )}
            >
              {/* Position indicator */}
              <div className="flex-shrink-0 w-8 text-center">
                {isCurrentSong ? (
                  <Play className="h-4 w-4 text-primary mx-auto" />
                ) : (
                  <span className="text-sm text-muted-foreground font-mono">
                    {item.position + 1}
                  </span>
                )}
              </div>

              {/* Song thumbnail */}
              {item.song.thumbnail && (
                <div className="flex-shrink-0">
                  <img
                    src={item.song.thumbnail}
                    alt={item.song.title}
                    className="w-12 h-12 rounded object-cover"
                  />
                </div>
              )}

              {/* Song info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground truncate">
                  {item.song.title}
                </h4>
                <p className="text-sm text-muted-foreground truncate">
                  {item.song.artist}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.song.duration}
                </p>
              </div>

              {/* Controls */}
              {showControls && (
                <div className="flex-shrink-0 flex items-center gap-1">
                  {/* Reorder buttons - only show for non-current songs and when onReorder is provided */}
                  {!isCurrentSong && onReorder && (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onReorder(item.id, 'up')}
                        disabled={index <= (currentSongId ? 1 : 0)} // Can't move above current song or first position
                        className="h-8 w-8"
                        title="Di chuyển lên"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onReorder(item.id, 'down')}
                        disabled={index >= queue.length - 1} // Can't move below last position
                        className="h-8 w-8"
                        title="Di chuyển xuống"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </>
                  )}

                  {!isCurrentSong && onPlay && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onPlay(item.id)}
                      className="h-8 w-8"
                      title="Phát ngay"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}

                  {onRemove && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onRemove(item.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      title="Xóa khỏi hàng đợi"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
