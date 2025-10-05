'use client'

import React, { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/Button'
import { Play, Trash2, Music, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { QueueDisplayProps } from '@/types'

interface DraggableQueueItemProps {
  item: QueueDisplayProps['queue'][0]
  isCurrentSong: boolean
  isDraggable: boolean
  onRemove?: (queueItemId: string) => void
  onPlay?: (queueItemId: string) => void
  showControls: boolean
}

function DraggableQueueItem({
  item,
  isCurrentSong,
  isDraggable,
  onRemove,
  onPlay,
  showControls
}: DraggableQueueItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: !isDraggable })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 p-3 bg-card rounded-lg border transition-all',
        isCurrentSong && 'ring-2 ring-primary bg-primary/5',
        isDragging && 'opacity-50 shadow-lg',
        isDraggable && 'cursor-grab active:cursor-grabbing'
      )}
    >
      {/* Drag handle - only show for draggable items */}
      {isDraggable && (
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 p-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </div>
      )}

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
        <div className="flex items-center gap-1 flex-shrink-0">
          {onPlay && !isCurrentSong && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPlay(item.id)}
              className="h-8 w-8 p-0"
            >
              <Play className="h-3 w-3" />
            </Button>
          )}
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(item.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

interface DraggableQueueDisplayProps extends QueueDisplayProps {
  onBulkReorder?: (queueItems: Array<{ id: string; position: number }>) => Promise<void>
}

export function DraggableQueueDisplay({
  queue,
  currentSongId,
  onRemove,
  onPlay,
  onReorder,
  onBulkReorder,
  showControls = true
}: DraggableQueueDisplayProps) {
  const [items, setItems] = useState(queue)
  const [isReordering, setIsReordering] = useState(false)

  // Update items when queue prop changes
  React.useEffect(() => {
    setItems(queue)
  }, [queue])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id)
      const newIndex = items.findIndex(item => item.id === over.id)

      // Don't allow moving items to position 0 if there's a currently playing song
      const currentlyPlayingItem = items.find(item => 
        item.position === 0 && item.song.id === currentSongId
      )
      
      if (currentlyPlayingItem && newIndex === 0) {
        return // Prevent the move
      }

      const newItems = arrayMove(items, oldIndex, newIndex)
      
      // Update positions based on new order, but keep currently playing song at position 0
      const updatedItems = newItems.map((item, index) => {
        if (item.song.id === currentSongId) {
          return { ...item, position: 0 }
        }
        // Adjust position for non-current songs
        const adjustedPosition = currentlyPlayingItem && index >= 0 ? index : index
        return { ...item, position: adjustedPosition }
      })

      setItems(updatedItems)

      // Send bulk reorder request
      if (onBulkReorder) {
        setIsReordering(true)
        try {
          const reorderData = updatedItems.map(item => ({
            id: item.id,
            position: item.position
          }))
          await onBulkReorder(reorderData)
        } catch (error) {
          console.error('Failed to reorder queue:', error)
          // Revert to original order on error
          setItems(queue)
        } finally {
          setIsReordering(false)
        }
      }
    }
  }

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

  // Get draggable items (exclude currently playing song at position 0)
  const draggableItems = items.filter(item => !(item.position === 0 && item.song.id === currentSongId))
  const currentlyPlayingItem = items.find(item => item.position === 0 && item.song.id === currentSongId)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Hàng đợi ({queue.length} bài)
        </h3>
        {isReordering && (
          <div className="text-sm text-muted-foreground">Đang sắp xếp lại...</div>
        )}
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {/* Currently playing song (non-draggable) */}
        {currentlyPlayingItem && (
          <DraggableQueueItem
            item={currentlyPlayingItem}
            isCurrentSong={true}
            isDraggable={false}
            onRemove={onRemove}
            onPlay={onPlay}
            showControls={showControls}
          />
        )}

        {/* Draggable queue items */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={draggableItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
            {draggableItems.map((item) => {
              const isCurrentSong = item.song.id === currentSongId
              return (
                <DraggableQueueItem
                  key={item.id}
                  item={item}
                  isCurrentSong={isCurrentSong}
                  isDraggable={!isCurrentSong}
                  onRemove={onRemove}
                  onPlay={onPlay}
                  showControls={showControls}
                />
              )
            })}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  )
}
