import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { safeDbOperation, generateRoomCode, isValidRoomId, createRoomWithRawSQL, roomExistsWithRawSQL } from '@/lib/db-utils'

// POST /api/rooms - Create a new room
export async function POST(request: NextRequest) {
  try {
    console.log('Creating new room...')

    // Generate unique room code and create room directly
    // Use try-catch with unique constraint violation to handle duplicates
    let room = null
    let attempts = 0
    const maxAttempts = 10

    while (!room && attempts < maxAttempts) {
      const roomId = generateRoomCode()
      attempts++

      try {
        console.log(`Creating room attempt ${attempts}/${maxAttempts} with ID: ${roomId}`)

        // Try to create room directly - let database handle uniqueness
        room = await createRoomWithRawSQL(roomId)

        console.log(`Room created successfully: ${roomId}`)
        break

      } catch (error: unknown) {
        // If it's a unique constraint violation, try again with new room code
        const errorObj = error as { code?: string; message?: string }
        if (errorObj?.code === '23505' || errorObj?.message?.includes('unique constraint')) {
          console.log(`Room code ${roomId} already exists, trying again...`)
          continue
        }

        // If it's a prepared statement error, retry with same room code
        if (errorObj?.code === '42P05' || errorObj?.message?.includes('prepared statement')) {
          console.log(`Prepared statement error for room ${roomId}, retrying...`)
          continue
        }

        // For other errors, throw immediately
        throw error
      }
    }

    if (!room) {
      throw new Error('Unable to create room after maximum attempts')
    }

    // Fetch the complete room data with relations
    const completeRoom = await safeDbOperation(async (client) => {
      return await client.room.findUnique({
        where: { id: room.id },
        include: {
          currentSong: true,
          queue: {
            include: {
              song: true,
            },
            orderBy: {
              position: 'asc',
            },
          },
          // history: {
          //   include: {
          //     song: true,
          //   },
          //   orderBy: {
          //     playedAt: 'desc',
          //   },
          // },
        },
      })
    })

    console.log(`Room created successfully: ${room.roomId}`)
    return NextResponse.json(completeRoom)

  } catch (error: unknown) {
    console.error('Error creating room:', error)

    // Provide more specific error messages
    let errorMessage = 'Failed to create room'
    const errorObj = error as { message?: string }
    if (errorObj?.message?.includes('unique room code')) {
      errorMessage = 'Unable to generate unique room code. Please try again.'
    }

    return NextResponse.json(
      { error: errorMessage, details: process.env.NODE_ENV === 'development' ? errorObj.message : undefined },
      { status: 500 }
    )
  }
}

// GET /api/rooms?roomId=1234 - Get room by roomId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')

    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      )
    }

    if (!isValidRoomId(roomId)) {
      return NextResponse.json(
        { error: 'Invalid room ID format' },
        { status: 400 }
      )
    }

    const room = await safeDbOperation(async (client) => {
      return await client.room.findUnique({
        where: { roomId },
        include: {
          currentSong: true,
          queue: {
            include: {
              song: true,
            },
            orderBy: {
              position: 'asc',
            },
          },
          history: {
            include: {
              song: true,
            },
            orderBy: {
              playedAt: 'desc',
            },
            take: 50, // Limit to last 50 played songs
          },
        },
      })
    })

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(room)
  } catch (error: unknown) {
    console.error('Error fetching room:', error)

    let errorMessage = 'Failed to fetch room'
    const errorObj = error as { code?: string; message?: string }
    if (errorObj?.code === '42P05') {
      errorMessage = 'Database connection issue. Please try again.'
    }

    return NextResponse.json(
      { error: errorMessage, details: process.env.NODE_ENV === 'development' ? errorObj.message : undefined },
      { status: 500 }
    )
  }
}
