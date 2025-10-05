'use client'

import React from 'react'
import { Button } from '@/components/ui/Button'
import { RoomCodeInput } from '@/components/shared/RoomCodeInput'
import { Tv, Plus, Users } from 'lucide-react'

interface RoomSetupProps {
  onCreateRoom: () => void
  onJoinRoom: (roomId: string) => void
  loading: boolean
  error: string | null
}

export function RoomSetup({ onCreateRoom, onJoinRoom, loading, error }: RoomSetupProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
            <Tv className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            🎤 Máy chủ Karaoke
          </h1>
          <p className="text-xl text-muted-foreground">
            Thiết lập màn hình hiển thị karaoke cho TV hoặc máy tính
          </p>
        </div>

        {/* Options */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Create New Room */}
          <div className="bg-card border rounded-lg p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Tạo phòng mới
              </h2>
              <p className="text-muted-foreground">
                Bắt đầu phiên karaoke mới và nhận mã phòng để chia sẻ
              </p>
            </div>

            <Button
              onClick={onCreateRoom}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Đang tạo phòng...' : 'Tạo phòng'}
            </Button>
          </div>

          {/* Join Existing Room */}
          <div className="bg-card border rounded-lg p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Tham gia phòng có sẵn
              </h2>
              <p className="text-muted-foreground">
                Kết nối với phiên karaoke hiện có
              </p>
            </div>

            <RoomCodeInput
              onJoin={onJoinRoom}
              loading={loading}
              error={error}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 text-center">
          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              How it works
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div>
                <div className="font-medium text-foreground mb-1">1. Create or Join</div>
                <div>Set up your host display screen</div>
              </div>
              <div>
                <div className="font-medium text-foreground mb-1">2. Share Code</div>
                <div>Give the room code to participants</div>
              </div>
              <div>
                <div className="font-medium text-foreground mb-1">3. Start Singing</div>
                <div>Control playback and enjoy karaoke!</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
