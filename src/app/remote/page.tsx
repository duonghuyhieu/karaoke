'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { RemoteView } from '@/components/remote/RemoteView'
import { RoomCodeInput } from '@/components/shared/RoomCodeInput'
import { useRoom } from '@/hooks/useRoom'
import { Smartphone } from 'lucide-react'

function RemotePageContent() {
  const searchParams = useSearchParams()
  const [roomId, setRoomId] = useState<string | null>(null)
  const { room, loading, error, connected, fetchRoom } = useRoom(roomId)

  // Check for room ID in URL params
  useEffect(() => {
    const urlRoomId = searchParams.get('room')
    if (urlRoomId) {
      setRoomId(urlRoomId)
    }
  }, [searchParams])

  const handleJoinRoom = (id: string) => {
    setRoomId(id)
    // Update URL without page reload
    window.history.pushState({}, '', `/remote?room=${id}`)
  }

  const handleRefreshRoom = async () => {
    if (roomId) {
      console.log('🔄 Parent component refreshing room data...')
      await fetchRoom(roomId)
    }
  }

  if (!roomId || !room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-3 sm:p-4 lg:p-6">
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-primary/10 rounded-full mb-4 lg:mb-6">
              <Smartphone className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
              🎤 Điều khiển Karaoke
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Điều khiển phiên karaoke từ thiết bị di động của bạn
            </p>
          </div>

          <RoomCodeInput
            onJoin={handleJoinRoom}
            loading={loading}
            error={error}
          />

          {/* Instructions */}
          <div className="mt-6 sm:mt-8 bg-muted/50 rounded-lg lg:rounded-xl p-4 sm:p-6">
            <h3 className="font-semibold text-foreground mb-3 text-base sm:text-lg">
              📱 How to use
            </h3>
            <ul className="text-sm sm:text-base text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Enter the 4-digit room code from the host screen</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">•</span>
                <span>Search for karaoke songs and tap to add instantly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>Control playback with play, pause, skip buttons</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500">•</span>
                <span>View the current queue and upcoming songs</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <RemoteView
      room={room}
      connected={connected}
      loading={loading}
      error={error}
      onRefreshRoom={handleRefreshRoom}
    />
  )
}

export default function RemotePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Smartphone className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    }>
      <RemotePageContent />
    </Suspense>
  )
}
