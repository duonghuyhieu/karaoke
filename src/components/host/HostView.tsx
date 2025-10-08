'use client'

import React, { useEffect, useState } from 'react'
import { HostYouTubePlayer } from '@/components/host/HostYouTubePlayer'
import { QueueDisplay } from '@/components/shared/QueueDisplay'
import { Wifi, WifiOff, Users, Music } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Room } from '@/types'

interface HostViewProps {
  room: Room
  connected: boolean
  loading: boolean
  error: string | null
  onReorderQueue?: (queueItemId: string, direction: 'up' | 'down') => Promise<boolean>
}

export function HostView({ room, connected, onReorderQueue }: HostViewProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Check if queue is empty and no current song
  const isQueueEmpty = !room.currentSong && (!room.queue || room.queue.length === 0)

  // Show black screen with message when queue is empty
  if (isQueueEmpty) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
        <div className="text-center px-4">
          <div className="mb-8">
            <Music className="w-24 h-24 mx-auto text-white/20 mb-6" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Hãy chọn thêm bài hát
          </h1>
          <p className="text-lg md:text-xl text-white/60 mb-8">
            Sử dụng điều khiển từ xa để thêm bài hát vào danh sách phát
          </p>
          <div className="flex items-center justify-center gap-3 px-6 py-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
            <Users className="w-6 h-6 text-white/80" />
            <span className="text-xl text-white/80">Mã phòng:</span>
            <span className="text-3xl font-mono font-bold text-white">
              {room.roomId}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <Music className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">🎤 Karaoke Host</h1>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
              <span className="text-xs sm:text-sm font-medium text-primary">
                Phòng: {room.roomId}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Connection status */}
            <div className={cn(
              "flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm",
              connected
                ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
            )}>
              {connected ? (
                <>
                  <Wifi className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Đã kết nối</span>
                  <span className="sm:hidden">●</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Mất kết nối</span>
                  <span className="sm:hidden">○</span>
                </>
              )}
            </div>

            {/* Current time */}
            <div className="text-xs sm:text-sm text-muted-foreground font-mono">
              {currentTime.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Video player - takes up 2/3 of the width on large screens */}
          <div className="xl:col-span-2">
            <div className="bg-card border rounded-lg lg:rounded-xl overflow-hidden">
              <HostYouTubePlayer
                currentSong={room.currentSong || null}
                roomId={room.roomId}
              />

              {/* Current song info - passive display only */}
              <div className="p-4 sm:p-6 lg:p-8 border-t">
                <div className="text-center">
                  {room.currentSong ? (
                    <div>
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground mb-2">
                        {room.currentSong.title}
                      </h2>
                      <p className="text-sm sm:text-base text-muted-foreground mb-4">
                        {room.currentSong.artist} • {room.currentSong.duration}
                      </p>
                      <div className="text-xs sm:text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                        📱 Sử dụng điều khiển từ xa di động để điều khiển phát nhạc
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <Music className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg sm:text-xl font-medium mb-2">Chưa chọn bài hát</p>
                      <p className="text-sm sm:text-base">Thêm bài hát bằng điều khiển từ xa di động để bắt đầu</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Queue sidebar - takes up 1/3 of the width on large screens */}
          <div className="xl:col-span-1">
            <div className="bg-card border rounded-lg lg:rounded-xl p-4 sm:p-6">
              <QueueDisplay
                queue={room.queue}
                currentSongId={room.currentSongId}
                onReorder={onReorderQueue}
                showControls={true}
              />
            </div>



            {/* Instructions */}
            <div className="mt-6 bg-muted/50 rounded-lg lg:rounded-xl p-4 sm:p-6">
              <h3 className="font-semibold text-foreground mb-3 text-base sm:text-lg">
                🎤 Điều khiển từ xa di động
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-3">
                Tham gia phiên karaoke này với mã phòng:
              </p>
              <div className="bg-background border rounded-lg px-4 py-3 text-center mb-4">
                <span className="text-2xl sm:text-3xl lg:text-4xl font-mono font-bold text-primary">
                  {room.roomId}
                </span>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground space-y-2">
                <p className="flex items-center gap-2">
                  <span className="text-green-500">•</span>
                  Tìm kiếm và thêm bài hát ngay lập tức
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-blue-500">•</span>
                  Điều khiển phát nhạc từ điện thoại của bạn
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-purple-500">•</span>
                  Hàng đợi cập nhật theo thời gian thực
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
