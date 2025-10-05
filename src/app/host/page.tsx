'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { HostView } from '@/components/host/HostView'
import { RoomSetup } from '@/components/host/RoomSetup'
import { useRoom } from '@/hooks/useRoom'
import { Monitor } from 'lucide-react'

function HostPageContent() {
  const searchParams = useSearchParams()
  const [roomId, setRoomId] = useState<string | null>(null)
  const { room, loading, error, createRoom, connected } = useRoom(roomId)

  // Check for room ID in URL params
  useEffect(() => {
    const urlRoomId = searchParams.get('room')
    if (urlRoomId) {
      setRoomId(urlRoomId)
    }
  }, [searchParams])

  const handleCreateRoom = async () => {
    const newRoom = await createRoom()
    if (newRoom) {
      setRoomId(newRoom.roomId)
      // Update URL without page reload
      window.history.pushState({}, '', `/host?room=${newRoom.roomId}`)
    }
  }

  const handleJoinRoom = (id: string) => {
    setRoomId(id)
    // Update URL without page reload
    window.history.pushState({}, '', `/host?room=${id}`)
  }

  if (!roomId || !room) {
    return (
      <RoomSetup
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        loading={loading}
        error={error}
      />
    )
  }

  return (
    <HostView
      room={room}
      connected={connected}
      loading={loading}
      error={error}
    />
  )
}

export default function HostPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Monitor className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    }>
      <HostPageContent />
    </Suspense>
  )
}
