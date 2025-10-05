'use client'

import React from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Plus, ArrowUp, Music } from 'lucide-react'
import type { SearchResult } from '@/types'

interface SongAddModalProps {
  isOpen: boolean
  onClose: () => void
  song: SearchResult | null
  onAddAsNext: (song: SearchResult) => void
  onAddToEnd: (song: SearchResult) => void
  isLoading?: boolean
}

export function SongAddModal({ 
  isOpen, 
  onClose, 
  song, 
  onAddAsNext, 
  onAddToEnd, 
  isLoading = false 
}: SongAddModalProps) {
  if (!song) return null

  const handleAddAsNext = () => {
    onAddAsNext(song)
    onClose()
  }

  const handleAddToEnd = () => {
    onAddToEnd(song)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm bài hát"
      className="max-w-sm"
    >
      <div className="space-y-4">
        {/* Song Info */}
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
          <img
            src={song.thumbnail}
            alt={song.title}
            className="w-12 h-12 rounded object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground truncate text-sm">
              {song.title}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {song.channelTitle}
            </p>
            <p className="text-xs text-muted-foreground">
              {song.duration}
            </p>
          </div>
        </div>

        {/* Add Options */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground text-center">
            Chọn cách thêm bài hát vào danh sách:
          </p>

          {/* Add as Next Song */}
          <Button
            onClick={handleAddAsNext}
            disabled={isLoading}
            className="w-full h-auto p-4 flex items-center gap-3 bg-primary hover:bg-primary/90"
          >
            <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full">
              <ArrowUp className="w-4 h-4" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium">Bài tiếp theo</div>
              <div className="text-xs opacity-90">Phát ngay sau bài hiện tại</div>
            </div>
          </Button>

          {/* Add to End of Queue */}
          <Button
            onClick={handleAddToEnd}
            disabled={isLoading}
            variant="outline"
            className="w-full h-auto p-4 flex items-center gap-3 hover:bg-muted"
          >
            <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full">
              <Plus className="w-4 h-4" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium">Thêm vào danh sách</div>
              <div className="text-xs text-muted-foreground">Thêm vào cuối hàng đợi</div>
            </div>
          </Button>
        </div>

        {/* Cancel Button */}
        <Button
          onClick={onClose}
          variant="ghost"
          className="w-full"
          disabled={isLoading}
        >
          Hủy
        </Button>
      </div>
    </Modal>
  )
}
