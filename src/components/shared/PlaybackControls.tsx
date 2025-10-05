'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Play, Pause, Square, SkipForward, SkipBack } from 'lucide-react'
import type { PlaybackControlsProps } from '@/types'

interface ExtendedPlaybackControlsProps extends PlaybackControlsProps {
  roomId?: string
  hidePrevious?: boolean
}

export function PlaybackControls({
  onPlay,
  onPause,
  onStop,
  onNext,
  onPrevious,
  disabled = false,
  roomId,
  hidePrevious = false
}: ExtendedPlaybackControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlayPause = () => {
    if (isPlaying) {
      onPause()
      setIsPlaying(false)
    } else {
      onPlay()
      setIsPlaying(true)
    }
  }



  return (
    <div className="space-y-6">
      {/* Main Playback Controls */}
      <div className="flex items-center justify-center gap-3">
        {!hidePrevious && (
          <Button
            size="icon"
            variant="outline"
            onClick={onPrevious}
            disabled={disabled}
            className="h-12 w-12 hover:bg-primary/10"
            title="Bài trước"
          >
            <SkipBack className="h-5 w-5" />
          </Button>
        )}

        <Button
          size="icon"
          variant="outline"
          onClick={handlePlayPause}
          disabled={disabled}
          className="h-16 w-16 hover:bg-primary/10"
          title={isPlaying ? "Dừng" : "Tiếp tục"}
        >
          {isPlaying ? (
            <Pause className="h-7 w-7" />
          ) : (
            <Play className="h-7 w-7" />
          )}
        </Button>

        <Button
          size="icon"
          variant="outline"
          onClick={onStop}
          disabled={disabled}
          className="h-12 w-12 hover:bg-primary/10"
          title="Dừng hẳn"
        >
          <Square className="h-5 w-5" />
        </Button>

        <Button
          size="icon"
          variant="outline"
          onClick={onNext}
          disabled={disabled}
          className="h-12 w-12 hover:bg-primary/10"
          title="Chuyển tiếp bài hát"
        >
          <SkipForward className="h-5 w-5" />
        </Button>
      </div>

      {/* Control Labels */}
      <div className="bg-muted/20 rounded-lg p-3 text-center text-sm text-muted-foreground">
        <div className="font-medium text-foreground mb-1">Điều khiển phát nhạc</div>
        <div>Phát, dừng, chuyển bài hát trong danh sách</div>
      </div>
    </div>
  )
}
