import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { broadcastQueueUpdate, broadcastSongChanged, QueueUpdatedPayload, SongChangedPayload } from '@/lib/supabase'
import { validateRoomId, validateSong } from '@/lib/validation'

// POST /api/rooms/[roomId]/queue - Add song to queue
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params
    const body = await request.json()
    const { youtubeId, title, artist, duration, thumbnail, channelTitle, addPosition } = body

    // Validate room ID
    const roomValidation = validateRoomId(roomId)
    if (!roomValidation.isValid) {
      return NextResponse.json(
        { error: roomValidation.error },
        { status: 400 }
      )
    }

    // Validate song data
    const songValidation = validateSong({ youtubeId, title, artist, duration })
    if (!songValidation.isValid) {
      return NextResponse.json(
        { error: songValidation.error },
        { status: 400 }
      )
    }

    // Find the room
    const room = await prisma.room.findUnique({
      where: { roomId },
    })

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    // Create or find the song
    let song = await prisma.song.findUnique({
      where: { youtubeId },
    })

    if (!song) {
      song = await prisma.song.create({
        data: {
          title,
          artist,
          youtubeId,
          duration,
          thumbnail,
          channelTitle,
        },
      })
    }

    // Determine position based on addPosition parameter
    let targetPosition: number

    if (addPosition === 'next') {
      // Add as next song (position 1 if there's a current song, position 0 if not)
      // The currently playing song should always stay at position 0
      if (room.currentSongId) {
        targetPosition = 1
        // Shift all queue items at position 1 and above down by 1
        await prisma.queueItem.updateMany({
          where: {
            roomId: room.id,
            position: { gte: 1 }
          },
          data: {
            position: {
              increment: 1
            }
          }
        })
      } else {
        targetPosition = 0
        // Shift all existing queue items down by 1
        await prisma.queueItem.updateMany({
          where: { roomId: room.id },
          data: {
            position: {
              increment: 1
            }
          }
        })
      }
    } else {
      // Add to end of queue (default behavior)
      const lastQueueItem = await prisma.queueItem.findFirst({
        where: { roomId: room.id },
        orderBy: { position: 'desc' },
      })
      targetPosition = (lastQueueItem?.position ?? -1) + 1
    }

    // Add to queue
    const queueItem = await prisma.queueItem.create({
      data: {
        roomId: room.id,
        songId: song.id,
        position: targetPosition,
      },
      include: {
        song: true,
      },
    })

    // If there's no current song and this is the first song in the queue, set it as current song
    if (!room.currentSongId && targetPosition === 0) {
      await prisma.room.update({
        where: { id: room.id },
        data: { currentSongId: song.id },
      })

      console.log(`Set first song as current: ${song.title} by ${song.artist}`)

      // Broadcast song change
      const songChangePayload: SongChangedPayload = {
        roomId,
        currentSongId: song.id,
        song: {
          id: song.id,
          title: song.title,
          artist: song.artist,
          youtubeId: song.youtubeId,
          duration: song.duration,
          thumbnail: song.thumbnail,
        },
      }

      await broadcastSongChanged(roomId, songChangePayload)
    }

    // Get updated queue
    const updatedQueue = await prisma.queueItem.findMany({
      where: { roomId: room.id },
      include: { song: true },
      orderBy: { position: 'asc' },
    })

    // Broadcast queue update (as fallback for immediate updates)
    const payload: QueueUpdatedPayload = {
      roomId,
      queue: updatedQueue.map((item: any) => ({
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

    // Send broadcast update (immediate)
    await broadcastQueueUpdate(roomId, payload)

    console.log(`Queue updated for room ${roomId}, broadcasting to clients`)

    return NextResponse.json(queueItem)
  } catch (error) {
    console.error('Error adding song to queue:', error)
    return NextResponse.json(
      { error: 'Failed to add song to queue' },
      { status: 500 }
    )
  }
}

// DELETE /api/rooms/[roomId]/queue?queueItemId=123 - Remove song from queue
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params
    const { searchParams } = new URL(request.url)
    const queueItemId = searchParams.get('queueItemId')

    if (!queueItemId) {
      return NextResponse.json(
        { error: 'Queue item ID is required' },
        { status: 400 }
      )
    }

    // Find the room
    const room = await prisma.room.findUnique({
      where: { roomId },
    })

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    // Remove the queue item
    await prisma.queueItem.delete({
      where: { id: queueItemId },
    })

    // Get updated queue and reorder positions
    const queueItems = await prisma.queueItem.findMany({
      where: { roomId: room.id },
      include: { song: true },
      orderBy: { position: 'asc' },
    })

    // Update positions to be sequential
    for (let i = 0; i < queueItems.length; i++) {
      await prisma.queueItem.update({
        where: { id: queueItems[i].id },
        data: { position: i },
      })
    }

    // Get final updated queue
    const updatedQueue = await prisma.queueItem.findMany({
      where: { roomId: room.id },
      include: { song: true },
      orderBy: { position: 'asc' },
    })

    // Broadcast queue update (as fallback for immediate updates)
    const payload: QueueUpdatedPayload = {
      roomId,
      queue: updatedQueue.map((item: any) => ({
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

    // Send broadcast update (immediate)
    await broadcastQueueUpdate(roomId, payload)

    console.log(`Queue updated for room ${roomId} after deletion, broadcasting to clients`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing song from queue:', error)
    return NextResponse.json(
      { error: 'Failed to remove song from queue' },
      { status: 500 }
    )
  }
}
