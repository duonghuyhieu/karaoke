'use client';

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Play, Music, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useQueueStore, Song } from '@/store/useQueueStore';
// import { usePlayerStore } from '@/store/usePlayerStore';
import { cn } from '@/lib/utils';

interface SortableItemProps {
  song: Song;
  index: number;
  isCurrentSong: boolean;
  onRemove: (index: number) => void;
  onPlay: (index: number) => void;
}

function SortableItem({ song, index, isCurrentSong, onRemove, onPlay }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: song.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 p-3 bg-card rounded-lg border transition-all',
        isCurrentSong && 'ring-2 ring-primary bg-primary/5',
        isDragging && 'opacity-50 shadow-lg z-10'
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Queue Position */}
      <div className="flex-shrink-0 w-6 text-center">
        {isCurrentSong ? (
          <Play className="h-4 w-4 text-primary" />
        ) : (
          <span className="text-xs text-muted-foreground font-mono">
            {index + 1}
          </span>
        )}
      </div>

      {/* Thumbnail */}
      <div className="flex-shrink-0">
        <img
          src={song.thumbnail}
          alt={song.title}
          className="w-12 h-9 object-cover rounded"
          loading="lazy"
        />
      </div>

      {/* Song Info */}
      <div className="flex-1 min-w-0">
        <h3 className={cn(
          'font-medium text-sm line-clamp-1 mb-1',
          isCurrentSong && 'text-primary'
        )}>
          {song.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="truncate">{song.channelTitle}</span>
          <span>•</span>
          <span>{song.duration}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {!isCurrentSong && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onPlay(index)}
            className="h-8 w-8 p-0"
          >
            <Play className="h-3 w-3" />
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onRemove(index)}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

export function SongQueue() {
  const { queue, currentIndex, removeFromQueue, clearQueue, reorderQueue, setCurrentIndex } = useQueueStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = queue.findIndex(song => song.id === active.id);
      const newIndex = queue.findIndex(song => song.id === over.id);

      reorderQueue(oldIndex, newIndex);
    }
  };

  const handleRemove = (index: number) => {
    removeFromQueue(index);
  };

  const handlePlay = (index: number) => {
    setCurrentIndex(index);
  };

  const totalDuration = queue.reduce((total, song) => {
    const [minutes, seconds] = song.duration.split(':').map(Number);
    return total + (minutes * 60) + (seconds || 0);
  }, 0);

  const formatTotalDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (queue.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Music className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Your queue is empty</p>
        <p className="text-xs mt-1">Search and add songs to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Queue Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">{queue.length}</span> songs
          {totalDuration > 0 && (
            <>
              <span className="mx-1">•</span>
              <span>{formatTotalDuration(totalDuration)}</span>
            </>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={clearQueue}
          className="text-xs"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Clear All
        </Button>
      </div>

      {/* Queue List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={queue.map(song => song.id)} strategy={verticalListSortingStrategy}>
            {queue.map((song, index) => (
              <SortableItem
                key={song.id}
                song={song}
                index={index}
                isCurrentSong={index === currentIndex}
                onRemove={handleRemove}
                onPlay={handlePlay}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
