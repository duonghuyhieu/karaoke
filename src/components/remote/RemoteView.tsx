'use client'

import React, { useState } from 'react'
import { RemoteSongSearch } from '@/components/remote/RemoteSongSearch'
import { DraggableQueueDisplay } from '@/components/shared/DraggableQueueDisplay'
import { HistoryDisplay } from '@/components/shared/HistoryDisplay'
import { PlaybackControls } from '@/components/shared/PlaybackControls'
import { Smartphone, Wifi, WifiOff, Search, List, Settings, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRoom } from '@/hooks/useRoom'
import type { Room, SearchResult, Song } from '@/types'

interface RemoteViewProps {
  room: Room
  connected: boolean
  loading: boolean
  error: string | null
  onRefreshRoom?: () => Promise<void>
}

type TabType = 'search' | 'queue' | 'history' | 'controls'

export function RemoteView({ room: roomProp, connected: connectedProp, loading, onRefreshRoom }: RemoteViewProps) {
  const { room: roomFromHook, connected: connectedFromHook, addToQueue, removeFromQueue, controlPlayback, reorderQueueItem, bulkReorderQueue, fetchRoom } = useRoom(roomProp.roomId)
  const [activeTab, setActiveTab] = useState<TabType>('search')
  const [lastAddedSong, setLastAddedSong] = useState<string | null>(null)
  const [tabLoading, setTabLoading] = useState<{ [key in TabType]?: boolean }>({})
  const [refreshKey, setRefreshKey] = useState(0)

  // Use the room from the hook if available (after refresh), otherwise use the prop
  const room = roomFromHook || roomProp
  // Use the connection status from the hook (real-time), fallback to prop
  const connected = connectedFromHook !== undefined ? connectedFromHook : connectedProp

  // Force re-render when room data changes
  React.useEffect(() => {
    setRefreshKey(prev => prev + 1)
  }, [room?.queue?.length, room?.history?.length, room?.currentSong?.id])

  const handleAddToQueue = async (song: SearchResult, addPosition: 'next' | 'end' = 'end') => {
    const success = await addToQueue({
      title: song.title,
      artist: song.channelTitle || 'Unknown Artist',
      youtubeId: song.videoId,
      duration: song.duration,
      thumbnail: song.thumbnail,
      channelTitle: song.channelTitle,
      addPosition,
    })

    if (success) {
      // Store the last added song for feedback
      setLastAddedSong(song.title)

      // Keep user on current tab instead of switching to queue
      // This allows continued searching and song selection

      // Clear the feedback after 3 seconds
      setTimeout(() => {
        setLastAddedSong(null)
      }, 3000)
    }
  }

  const handleRemoveFromQueue = async (queueItemId: string) => {
    await removeFromQueue(queueItemId)
  }

  const handleReAddFromHistory = async (song: Song) => {
    const success = await addToQueue({
      title: song.title,
      artist: song.artist,
      youtubeId: song.youtubeId,
      duration: song.duration,
      thumbnail: song.thumbnail,
      channelTitle: song.artist, // Use artist as channel title for history songs
      addPosition: 'end',
    })

    if (success) {
      // Store the last added song for feedback
      setLastAddedSong(song.title)

      // Keep user on current tab (history) instead of switching to queue
      // This allows continued browsing of history

      // Clear the feedback after 3 seconds
      setTimeout(() => {
        setLastAddedSong(null)
      }, 3000)
    }
  }

  const handleReorderQueue = async (queueItemId: string, direction: 'up' | 'down') => {
    await reorderQueueItem(queueItemId, direction)
  }

  const handleBulkReorderQueue = async (queueItems: Array<{ id: string; position: number }>) => {
    await bulkReorderQueue(queueItems)
  }

  const handleTabClick = async (tab: TabType) => {
    // Set active tab first for immediate UI feedback
    setActiveTab(tab)

    // If clicking on queue or history tab, fetch fresh data
    if (tab === 'queue' || tab === 'history') {
      setTabLoading(prev => ({ ...prev, [tab]: true }))
      try {
        console.log(`🔄 Refreshing ${tab} data...`)

        // Try to refresh from parent first, then fallback to local refresh
        if (onRefreshRoom) {
          await onRefreshRoom()
        } else {
          await fetchRoom(room.roomId)
        }

        console.log(`✅ ${tab} data refreshed successfully`)

        // Force a re-render to ensure UI updates
        setRefreshKey(prev => prev + 1)
      } catch (error) {
        console.error(`❌ Failed to refresh ${tab} data:`, error)
      } finally {
        setTabLoading(prev => ({ ...prev, [tab]: false }))
      }
    }
  }

  const handlePlaybackControl = async (action: 'play' | 'pause' | 'stop' | 'next' | 'previous') => {
    await controlPlayback(action)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b px-3 sm:px-4 lg:px-6 py-3 sm:py-4 sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <div>
              <h1 className="text-base sm:text-lg lg:text-xl font-bold text-foreground">📱 Điều khiển từ xa</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Phòng: {room.roomId}</p>
            </div>
          </div>

          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-xs",
            connected
              ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
          )}>
            {connected ? (
              <>
                <Wifi className="w-3 h-3" />
                <span className="hidden sm:inline">Trực tiếp</span>
                <span className="sm:hidden">●</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" />
                <span className="hidden sm:inline">Ngoại tuyến</span>
                <span className="sm:hidden">○</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Current Song Display */}
      {room.currentSong && (
        <div className="bg-primary/5 border-b px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            {room.currentSong.thumbnail && (
              <img
                src={room.currentSong.thumbnail}
                alt={room.currentSong.title}
                className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-foreground truncate mb-1">
                🎵 Đang phát
              </p>
              <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-foreground truncate">
                {room.currentSong.title}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {room.currentSong.artist}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {lastAddedSong && (
        <div className="bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800 px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>
            <p className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-400 truncate">
              🎵 &quot;{lastAddedSong}&quot; đã được thêm vào hàng đợi!
            </p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-card border-b">
        <div className="flex">
          <button
            onClick={() => handleTabClick('search')}
            className={cn(
              'flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors',
              activeTab === 'search'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Search className="w-4 h-4" />
            <span className="text-xs sm:text-sm">Tìm kiếm</span>
          </button>
          <button
            onClick={() => handleTabClick('queue')}
            className={cn(
              'flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors relative',
              activeTab === 'queue'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground',
              tabLoading.queue && 'opacity-50'
            )}
            disabled={tabLoading.queue}
          >
            <List className="w-4 h-4" />
            <span className="text-xs sm:text-sm">Hàng đợi</span>
            {tabLoading.queue && (
              <div className="absolute -top-1 -right-1 w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin"></div>
            )}
          </button>
          <button
            onClick={() => handleTabClick('history')}
            className={cn(
              'flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors relative',
              activeTab === 'history'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground',
              tabLoading.history && 'opacity-50'
            )}
            disabled={tabLoading.history}
          >
            <Clock className="w-4 h-4" />
            <span className="text-xs sm:text-sm">Lịch sử</span>
            {tabLoading.history && (
              <div className="absolute -top-1 -right-1 w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin"></div>
            )}
          </button>
          <button
            onClick={() => handleTabClick('controls')}
            className={cn(
              'flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors',
              activeTab === 'controls'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Settings className="w-4 h-4" />
            <span className="text-xs sm:text-sm">Điều khiển</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {activeTab === 'search' && (
            <div className="p-3 sm:p-4 lg:p-6">
              <RemoteSongSearch
                onAddToQueue={handleAddToQueue}
                disabled={loading}
              />
            </div>
          )}

          {activeTab === 'queue' && (
            <div className="p-3 sm:p-4 lg:p-6" key={`queue-${refreshKey}`}>
              <DraggableQueueDisplay
                queue={room.queue}
                currentSongId={room.currentSongId}
                onRemove={handleRemoveFromQueue}
                onReorder={handleReorderQueue}
                onBulkReorder={handleBulkReorderQueue}
                showControls={true}
              />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="p-3 sm:p-4 lg:p-6" key={`history-${refreshKey}`}>
              <HistoryDisplay
                history={room.history || []}
                onReAddSong={handleReAddFromHistory}
              />
            </div>
          )}

          {activeTab === 'controls' && (
            <div className="p-3 sm:p-4 lg:p-6 space-y-6">
              {/* Currently Playing Song */}
              {room.currentSong && (
                <div className="bg-primary/5 border rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    🎵 Đang phát
                  </h3>
                  <div className="flex items-center gap-3">
                    {room.currentSong.thumbnail && (
                      <img
                        src={room.currentSong.thumbnail}
                        alt={room.currentSong.title}
                        className="w-16 h-16 rounded object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground truncate text-base">
                        {room.currentSong.title}
                      </h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {room.currentSong.artist}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {room.currentSong.duration}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Playback Controls */}
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4 lg:mb-6">
                  🎮 Điều khiển phát nhạc
                </h3>
                <PlaybackControls
                  onPlay={() => handlePlaybackControl('play')}
                  onPause={() => handlePlaybackControl('pause')}
                  onStop={() => handlePlaybackControl('stop')}
                  onNext={() => handlePlaybackControl('next')}
                  onPrevious={() => handlePlaybackControl('previous')}
                  disabled={loading}
                  roomId={room.roomId}
                  hidePrevious={true}
                />
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">Thông tin phòng</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mã phòng:</span>
                    <span className="font-mono font-bold">{room.roomId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bài hát trong hàng đợi:</span>
                    <span>{room.queue.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trạng thái phát:</span>
                    <span className={room.currentSong ? 'text-green-600' : 'text-orange-600'}>
                      {room.currentSong ? 'Đang phát' : 'Tạm dừng'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kết nối:</span>
                    <span className={connected ? 'text-green-600' : 'text-red-600'}>
                      {connected ? 'Trực tiếp' : 'Ngoại tuyến'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
