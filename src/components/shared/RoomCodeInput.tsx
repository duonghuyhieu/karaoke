'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Loader2, Users } from 'lucide-react'
import { isValidRoomId } from '@/types'
import type { RoomCodeInputProps } from '@/types'

export function RoomCodeInput({ onJoin, loading = false, error }: RoomCodeInputProps) {
  const [roomCode, setRoomCode] = useState('')
  const [inputError, setInputError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!roomCode.trim()) {
      setInputError('Vui lòng nhập mã phòng')
      return
    }

    if (!isValidRoomId(roomCode.trim())) {
      setInputError('Mã phòng phải có 4 chữ số')
      return
    }

    setInputError(null)
    onJoin(roomCode.trim())
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4) // Only digits, max 4
    setRoomCode(value)
    if (inputError) setInputError(null)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Tham gia phòng Karaoke</h2>
        <p className="text-muted-foreground">
          Nhập mã phòng 4 chữ số để tham gia phiên karaoke
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="text"
            placeholder="Nhập mã phòng (ví dụ: 1234)"
            value={roomCode}
            onChange={handleInputChange}
            className="text-center text-2xl font-mono tracking-widest"
            maxLength={4}
            disabled={loading}
            autoFocus
          />
          {(inputError || error) && (
            <p className="text-sm text-destructive mt-2 text-center">
              {inputError || error}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading || !roomCode.trim() || !isValidRoomId(roomCode.trim())}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang tham gia phòng...
            </>
          ) : (
            'Tham gia phòng'
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Không có mã phòng? Yêu cầu người chủ tạo phòng và chia sẻ mã với bạn.
        </p>
      </div>
    </div>
  )
}
