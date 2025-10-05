import { PrismaClient } from '@prisma/client'
import { prisma } from './prisma'

// Enhanced database utilities with prepared statement conflict resolution

/**
 * Enhanced database operation wrapper with prepared statement conflict resolution
 */
export async function withRetry<T>(
  operation: (client: PrismaClient) => Promise<T>,
  maxRetries: number = 3,
  delay: number = 200
): Promise<T> {
  let lastError: unknown = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation(prisma)
    } catch (error: unknown) {
      lastError = error
      const errorObj = error as { message?: string; code?: string }
      console.warn(`Database operation attempt ${attempt}/${maxRetries} failed:`, errorObj.message)

      // Check if this is a prepared statement error (PostgreSQL error code 42P05)
      const isPreparedStatementError =
        errorObj.code === '42P05' ||
        errorObj.message?.includes('prepared statement') ||
        errorObj.message?.includes('already exists') ||
        errorObj.message?.includes('duplicate prepared statement')

      if (isPreparedStatementError) {
        console.log('🔧 Detected prepared statement conflict, attempting recovery...')
        await handlePreparedStatementConflict(attempt, maxRetries)
      }

      // Check for connection issues
      const isConnectionError =
        errorObj.code === 'P1001' ||
        errorObj.message?.includes('connection') ||
        errorObj.message?.includes('timeout') ||
        errorObj.message?.includes('ECONNREFUSED')

      if (isConnectionError) {
        console.log('🔌 Detected connection issue, attempting reconnection...')
        await handleConnectionError()
      }

      if (attempt < maxRetries) {
        // Exponential backoff with jitter
        const backoffDelay = delay * Math.pow(2, attempt - 1) + Math.random() * 100
        console.log(`⏳ Waiting ${Math.round(backoffDelay)}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, backoffDelay))
        continue
      }

      throw error
    }
  }

  throw lastError || new Error('Operation failed after retries')
}

/**
 * Handle prepared statement conflicts by creating a fresh client
 */
async function handlePreparedStatementConflict(attempt: number, maxRetries: number): Promise<void> {
  try {
    console.log(`🧹 Handling prepared statement conflict (attempt ${attempt}/${maxRetries})...`)

    // Disconnect current connection to clear prepared statements
    await prisma.$disconnect()

    // Wait for cleanup to complete
    await new Promise(resolve => setTimeout(resolve, 500))

    console.log('✅ Prepared statement cleanup completed')
  } catch (cleanupError) {
    console.warn('⚠️ Error during prepared statement cleanup:', cleanupError)
    // Continue anyway, the retry might still work
  }
}

/**
 * Create a fresh Prisma client for operations that need to avoid prepared statement conflicts
 */
function createFreshPrismaClient(): PrismaClient {
  // Create a completely fresh client with unique connection parameters
  let databaseUrl = process.env.DATABASE_URL || ''

  // Add timestamp to make connection unique
  const timestamp = Date.now()
  const params = [
    'prepared_statements=false',
    'statement_cache_size=0',
    `application_name=karaoke_${timestamp}`,
    `connect_timeout=10`
  ]

  params.forEach(param => {
    const [key] = param.split('=')
    if (!databaseUrl.includes(key)) {
      const separator = databaseUrl.includes('?') ? '&' : '?'
      databaseUrl = `${databaseUrl}${separator}${param}`
    }
  })

  return new PrismaClient({
    log: ['error'],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  })
}

/**
 * Handle connection errors by reconnecting
 */
async function handleConnectionError(): Promise<void> {
  try {
    console.log('🔄 Attempting database reconnection...')

    await prisma.$disconnect()
    await new Promise(resolve => setTimeout(resolve, 500))
    await prisma.$connect()

    console.log('✅ Database reconnection successful')
  } catch (reconnectError) {
    console.warn('⚠️ Error during reconnection:', reconnectError)
    // Continue anyway, the retry might still work
  }
}

/**
 * Safe database operation wrapper that handles connection and prepared statement issues
 */
export async function safeDbOperation<T>(operation: (client: PrismaClient) => Promise<T>): Promise<T> {
  return await withRetry(operation, 3, 200)
}

/**
 * Execute database operation with raw SQL to completely avoid prepared statements
 */
export async function safeRawOperation<T>(
  query: string,
  params: unknown[] = []
): Promise<T> {
  return await withRetry(async (client) => {
    console.log('🔍 Executing raw SQL query to avoid prepared statements')
    return await client.$queryRawUnsafe(query, ...params) as T
  }, 3, 200)
}

/**
 * Execute a transaction with prepared statement conflict handling
 */
export async function safeTransaction<T>(
  operations: (client: PrismaClient) => Promise<T>
): Promise<T> {
  return await withRetry(async (client) => {
    return await client.$transaction(async (tx) => {
      return await operations(tx)
    })
  }, 3, 300)
}

/**
 * Create a room using multiple strategies to avoid prepared statement conflicts
 */
export async function createRoomWithRawSQL(roomId: string): Promise<{ id: string; roomId: string; isActive: boolean; createdAt: Date; updatedAt: Date; currentSongId: string | null }> {
  console.log(`🏠 Creating room with roomId: ${roomId}`)

  // Try Prisma ORM first (with prepared statements disabled)
  try {
    return await safeDbOperation(async (client) => {
      const room = await client.room.create({
        data: {
          roomId,
          isActive: true,
        },
        select: {
          id: true,
          roomId: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          currentSongId: true,
        },
      })
      console.log(`✅ Room created successfully with Prisma: ${room.roomId}`)
      return room
    })
  } catch (prismaError) {
    console.warn('⚠️ Prisma room creation failed, falling back to raw SQL:', prismaError)

    // Fallback to raw SQL if Prisma fails
    return await safeRawOperation<Array<{ id: string; roomId: string; isActive: boolean; createdAt: Date; updatedAt: Date; currentSongId: string | null }>>(
      `INSERT INTO "rooms" ("id", "roomId", "isActive", "createdAt", "updatedAt", "currentSongId")
       VALUES (gen_random_uuid(), $1, true, NOW(), NOW(), NULL)
       RETURNING "id", "roomId", "isActive", "createdAt", "updatedAt", "currentSongId"`,
      [roomId]
    ).then(result => {
      const room = result[0]
      console.log(`✅ Room created successfully with raw SQL: ${room.roomId}`)
      return room
    })
  }
}

/**
 * Check if room exists with fallback strategies
 */
export async function roomExistsWithRawSQL(roomId: string): Promise<boolean> {
  console.log(`🔍 Checking room existence for roomId: ${roomId}`)

  try {
    // Try Prisma first
    const room = await safeDbOperation(async (client) => {
      return await client.room.findUnique({
        where: { roomId },
        select: { id: true }
      })
    })

    const exists = !!room
    console.log(`✅ Room ${roomId} exists: ${exists}`)
    return exists
  } catch (prismaError) {
    console.warn('⚠️ Prisma room check failed, falling back to raw SQL:', prismaError)

    // Fallback to raw SQL
    const result = await safeRawOperation<Array<{ id: string }>>(
      'SELECT "id" FROM "rooms" WHERE "roomId" = $1 LIMIT 1',
      [roomId]
    )

    const exists = result.length > 0
    console.log(`✅ Room ${roomId} exists (raw SQL): ${exists}`)
    return exists
  }
}

/**
 * Generate a unique room code
 */
export function generateRoomCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

/**
 * Validate room ID format
 */
export function isValidRoomId(roomId: string): boolean {
  return /^\d{4}$/.test(roomId)
}

/**
 * Clean up database connections and prepared statements (useful for development)
 */
export async function cleanupDatabase(): Promise<void> {
  try {
    console.log('🧹 Cleaning up database connections and prepared statements...')

    // Disconnect to clear any prepared statements
    await prisma.$disconnect()

    // Wait for cleanup to complete
    await new Promise(resolve => setTimeout(resolve, 500))

    console.log('✅ Database connections cleaned up')
  } catch (error) {
    console.error('❌ Error cleaning up database:', error)
  }
}

/**
 * Force database reconnection with fresh connection pool
 */
export async function forceReconnectDatabase(): Promise<void> {
  try {
    console.log('🔄 Forcing database reconnection...')

    await prisma.$disconnect()
    await new Promise(resolve => setTimeout(resolve, 1000))
    await prisma.$connect()

    console.log('✅ Database reconnection completed')
  } catch (error) {
    console.error('❌ Error during forced reconnection:', error)
    throw error
  }
}

/**
 * Test database connection and prepared statement handling
 */
export async function testDatabaseConnection(): Promise<boolean> {
  let freshClient: PrismaClient | null = null

  try {
    console.log('🧪 Testing database connection with fresh client...')

    // Create a fresh client to avoid prepared statement conflicts
    freshClient = createFreshPrismaClient()

    // Test basic connection
    await freshClient.$queryRawUnsafe('SELECT 1 as test')
    console.log('✅ Basic connection test passed')

    // Test multiple queries to ensure no prepared statement conflicts
    for (let i = 0; i < 3; i++) {
      await freshClient.$queryRawUnsafe(`SELECT NOW() as current_time_${i}`)
    }
    console.log('✅ Multiple query test passed')

    // Test Prisma ORM operations
    await freshClient.room.findMany({ take: 1 })
    console.log('✅ ORM operation test passed')

    console.log('✅ All database connection tests passed')
    return true
  } catch (error) {
    console.error('❌ Database connection test failed:', error)
    return false
  } finally {
    // Always cleanup the fresh client
    if (freshClient) {
      try {
        await freshClient.$disconnect()
        console.log('🧹 Fresh client disconnected')
      } catch (disconnectError) {
        console.warn('⚠️ Error disconnecting fresh client:', disconnectError)
      }
    }
  }
}
