import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { broadcastQueueUpdate, QueueUpdatedPayload } from '@/lib/supabase'

// POST /api/rooms/[roomId]/queue/bulk-reorder - Reorder multiple queue items
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params
    const body = await request.json()
    const { queueItems } = body

    if (!queueItems || !Array.isArray(queueItems)) {
      return NextResponse.json(
        { error: 'Queue items array is required' },
        { status: 400 }
      )
    }

    // Validate that all items have id and position
    for (const item of queueItems) {
      if (!item.id || typeof item.position !== 'number') {
        return NextResponse.json(
          { error: 'Each queue item must have id and position' },
          { status: 400 }
        )
      }
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

    // Validate that all provided queue items exist in the room
    const existingItemIds = new Set(room.queue.map((item: any) => item.id))
    for (const item of queueItems) {
      if (!existingItemIds.has(item.id)) {
        return NextResponse.json(
          { error: `Queue item ${item.id} not found in room` },
          { status: 400 }
        )
      }
    }

    // Don't allow reordering the currently playing song (position 0)
    const currentlyPlayingItem = room.queue.find((item: any) =>
      item.position === 0 && room.currentSongId === item.songId
    )
    
    if (currentlyPlayingItem) {
      const reorderingCurrentSong = queueItems.find(item => 
        item.id === currentlyPlayingItem.id && item.position !== 0
      )
      
      if (reorderingCurrentSong) {
        return NextResponse.json(
          { error: 'Cannot reorder the currently playing song' },
          { status: 400 }
        )
      }
    }

    // Update positions using a transaction with temporary positions to avoid unique constraint violations
    await prisma.$transaction(async (tx: any) => {
      // Step 1: Move all items to temporary negative positions
      for (let i = 0; i < queueItems.length; i++) {
        const item = queueItems[i]
        const tempPosition = -1000 - i
        
        await tx.queueItem.update({
          where: { id: item.id },
          data: { position: tempPosition },
        })
      }

      // Step 2: Move items to their final positions
      for (const item of queueItems) {
        await tx.queueItem.update({
          where: { id: item.id },
          data: { position: item.position },
        })
      }
    })

    // Get updated queue
    const updatedQueue = await prisma.queueItem.findMany({
      where: { roomId: room.id },
      include: { song: true },
      orderBy: { position: 'asc' },
    })

    // Broadcast queue update
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

    await broadcastQueueUpdate(roomId, payload)

    console.log(`Queue bulk reordered for room ${roomId}: ${queueItems.length} items`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error bulk reordering queue:', error)
    return NextResponse.json(
      { error: 'Failed to reorder queue' },
      { status: 500 }
    )
  }
}
