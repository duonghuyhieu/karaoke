import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { broadcastQueueUpdate, QueueUpdatedPayload } from '@/lib/supabase'

// POST /api/rooms/[roomId]/queue/reorder - Reorder queue items
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params
    const body = await request.json()
    const { queueItemId, direction } = body

    if (!queueItemId || !direction || !['up', 'down'].includes(direction)) {
      return NextResponse.json(
        { error: 'Queue item ID and direction (up/down) are required' },
        { status: 400 }
      )
    }

    // Find the room
    const room = await prisma.room.findUnique({
      where: { roomId },
      include: {
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

    // Find the queue item to move
    const queueItem = room.queue.find(item => item.id === queueItemId)
    if (!queueItem) {
      return NextResponse.json(
        { error: 'Queue item not found' },
        { status: 404 }
      )
    }

    // Don't allow reordering the currently playing song (position 0)
    if (queueItem.position === 0 && room.currentSongId === queueItem.songId) {
      return NextResponse.json(
        { error: 'Cannot reorder the currently playing song' },
        { status: 400 }
      )
    }

    const currentPosition = queueItem.position
    let newPosition: number

    if (direction === 'up') {
      // Move up (decrease position)
      if (currentPosition <= 0) {
        return NextResponse.json(
          { error: 'Cannot move item further up' },
          { status: 400 }
        )
      }
      // If there's a currently playing song at position 0, don't allow moving to position 0
      if (currentPosition === 1 && room.currentSongId) {
        return NextResponse.json(
          { error: 'Cannot move above the currently playing song' },
          { status: 400 }
        )
      }
      newPosition = currentPosition - 1
    } else {
      // Move down (increase position)
      if (currentPosition >= room.queue.length - 1) {
        return NextResponse.json(
          { error: 'Cannot move item further down' },
          { status: 400 }
        )
      }
      newPosition = currentPosition + 1
    }

    // Find the item that will be displaced
    const displacedItem = room.queue.find(item => item.position === newPosition)
    if (!displacedItem) {
      return NextResponse.json(
        { error: 'Invalid position' },
        { status: 400 }
      )
    }

    // Swap positions using temporary positions to avoid unique constraint violations
    // Use negative positions as temporary values to avoid conflicts
    const tempPosition1 = -1000 - Math.floor(Math.random() * 1000)
    const tempPosition2 = -2000 - Math.floor(Math.random() * 1000)

    await prisma.$transaction([
      // Step 1: Move both items to temporary positions
      prisma.queueItem.update({
        where: { id: queueItem.id },
        data: { position: tempPosition1 },
      }),
      prisma.queueItem.update({
        where: { id: displacedItem.id },
        data: { position: tempPosition2 },
      }),
      // Step 2: Move items to their final positions
      prisma.queueItem.update({
        where: { id: queueItem.id },
        data: { position: newPosition },
      }),
      prisma.queueItem.update({
        where: { id: displacedItem.id },
        data: { position: currentPosition },
      }),
    ])

    // Get updated queue
    const updatedQueue = await prisma.queueItem.findMany({
      where: { roomId: room.id },
      include: { song: true },
      orderBy: { position: 'asc' },
    })

    // Broadcast queue update
    const payload: QueueUpdatedPayload = {
      roomId,
      queue: updatedQueue.map(item => ({
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

    await broadcastQueueUpdate(roomId, payload)

    console.log(`Queue reordered for room ${roomId}: moved item ${queueItemId} ${direction}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering queue:', error)
    return NextResponse.json(
      { error: 'Failed to reorder queue' },
      { status: 500 }
    )
  }
}
