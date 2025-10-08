import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { broadcastPlaybackControl, broadcastSongChanged, broadcastQueueUpdate, PlaybackControlPayload, SongChangedPayload, QueueUpdatedPayload } from '@/lib/supabase'

// POST /api/rooms/[roomId]/playback - Control playback
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params
    const body = await request.json()
    const { action, volume } = body

    if (!action || !['play', 'pause', 'stop', 'next', 'previous', 'auto-next', 'volume', 'mute', 'unmute'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be one of: play, pause, stop, next, previous, auto-next, volume, mute, unmute' },
        { status: 400 }
      )
    }

    // Find the room
    const room = await prisma.room.findUnique({
      where: { roomId },
      include: {
        currentSong: true,
        queue: {
          include: { song: true },
          orderBy: { position: 'asc' },
        },
      },
    })

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    let updatedRoom = room

    // Handle next/previous/auto-next actions
    if (action === 'next' || action === 'auto-next') {
      // Find current song in queue (should always be at position 0)
      const currentQueueItem = room.queue.find((item: any) => item.song.id === room.currentSongId)

      if (currentQueueItem) {
        // Add the completed/skipped song to history
        try {
          await prisma.historyItem.create({
            data: {
              roomId: room.id,
              songId: currentQueueItem.song.id,
              playedAt: new Date(),
              // For auto-next, we could potentially track duration played
              duration: action === 'auto-next' ? null : null,
            },
          })
          console.log(`Added song to history: ${currentQueueItem.song.title}`)
        } catch (historyError) {
          console.error('Failed to add song to history:', historyError)
          // Don't fail the entire operation if history fails
        }

        // Remove the current song from queue (for both next and auto-next)
        await prisma.queueItem.delete({
          where: { id: currentQueueItem.id },
        })

        // Reposition all remaining queue items so they start from position 0
        const remainingItems = await prisma.queueItem.findMany({
          where: { roomId: room.id },
          orderBy: { position: 'asc' },
        })

        for (let i = 0; i < remainingItems.length; i++) {
          await prisma.queueItem.update({
            where: { id: remainingItems[i].id },
            data: { position: i },
          })
        }

        // Get the updated queue after repositioning
        const updatedQueueItems = await prisma.queueItem.findMany({
          where: { roomId: room.id },
          include: { song: true },
          orderBy: { position: 'asc' },
        })

        // Set the song at position 0 as the new current song (if any)
        const newCurrentSong = updatedQueueItems.find((item: { position: number }) => item.position === 0)

        updatedRoom = await prisma.room.update({
          where: { id: room.id },
          data: { currentSongId: newCurrentSong?.songId || null },
          include: {
            currentSong: true,
            queue: {
              include: { song: true },
              orderBy: { position: 'asc' },
            },
          },
        })

        // Broadcast song change
        const songPayload: SongChangedPayload = {
          roomId,
          currentSongId: updatedRoom.currentSongId,
          song: updatedRoom.currentSong ? {
            id: updatedRoom.currentSong.id,
            title: updatedRoom.currentSong.title,
            artist: updatedRoom.currentSong.artist,
            youtubeId: updatedRoom.currentSong.youtubeId,
            duration: updatedRoom.currentSong.duration,
            thumbnail: updatedRoom.currentSong.thumbnail,
          } : undefined,
        }

        await broadcastSongChanged(roomId, songPayload)

        // Broadcast updated queue
        const queuePayload: QueueUpdatedPayload = {
          roomId,
          queue: updatedQueueItems.map((item: any) => ({
            id: item.id,
            position: item.position,
            song: {
              id: item.song.id,
              title: item.song.title,
              artist: item.song.artist,
              youtubeId: item.song.youtubeId,
              duration: item.song.duration,
              thumbnail: item.song.thumbnail,
            },
          })),
        }

        await broadcastQueueUpdate(roomId, queuePayload)

        console.log(`${action === 'auto-next' ? 'Auto-advanced' : 'Manually advanced'} to next song. Queue repositioned.`)
      } else if (room.queue.length > 0) {
        // No current song, start with first in queue (position 0)
        const firstQueueItem = room.queue.find((item: any) => item.position === 0)
        if (firstQueueItem) {
          updatedRoom = await prisma.room.update({
            where: { id: room.id },
            data: { currentSongId: firstQueueItem.songId },
            include: {
              currentSong: true,
              queue: {
                include: { song: true },
                orderBy: { position: 'asc' },
              },
            },
          })

          // Broadcast song change
          const songPayload: SongChangedPayload = {
            roomId,
            currentSongId: updatedRoom.currentSongId,
            song: updatedRoom.currentSong ? {
              id: updatedRoom.currentSong.id,
              title: updatedRoom.currentSong.title,
              artist: updatedRoom.currentSong.artist,
              youtubeId: updatedRoom.currentSong.youtubeId,
              duration: updatedRoom.currentSong.duration,
              thumbnail: updatedRoom.currentSong.thumbnail,
            } : undefined,
          }

          await broadcastSongChanged(roomId, songPayload)
        }
      }
    } else if (action === 'previous') {
      // Find current song in queue and move to previous
      const currentQueueItem = room.queue.find((item: any) => item.song.id === room.currentSongId)
      if (currentQueueItem && currentQueueItem.position > 0) {
        const prevQueueItem = room.queue.find((item: any) => item.position === currentQueueItem.position - 1)
        if (prevQueueItem) {
          updatedRoom = await prisma.room.update({
            where: { id: room.id },
            data: { currentSongId: prevQueueItem.songId },
            include: {
              currentSong: true,
              queue: {
                include: { song: true },
                orderBy: { position: 'asc' },
              },
            },
          })

          // Broadcast song change
          const songPayload: SongChangedPayload = {
            roomId,
            currentSongId: updatedRoom.currentSongId,
            song: updatedRoom.currentSong ? {
              id: updatedRoom.currentSong.id,
              title: updatedRoom.currentSong.title,
              artist: updatedRoom.currentSong.artist,
              youtubeId: updatedRoom.currentSong.youtubeId,
              duration: updatedRoom.currentSong.duration,
              thumbnail: updatedRoom.currentSong.thumbnail,
            } : undefined,
          }

          await broadcastSongChanged(roomId, songPayload)
        }
      }
    }

    // Broadcast playback control
    const playbackPayload: PlaybackControlPayload = {
      roomId,
      action,
      timestamp: Date.now(),
      ...(volume !== undefined && { volume }),
    }

    await broadcastPlaybackControl(roomId, playbackPayload)

    return NextResponse.json({
      success: true,
      room: updatedRoom,
    })
  } catch (error) {
    console.error('Error controlling playback:', error)
    return NextResponse.json(
      { error: 'Failed to control playback' },
      { status: 500 }
    )
  }
}
