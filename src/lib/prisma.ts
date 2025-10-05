import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create a new Prisma client with prepared statements completely disabled
function createPrismaClient() {
  // Modify DATABASE_URL to disable prepared statements and connection pooling issues
  let databaseUrl = process.env.DATABASE_URL || ''

  // Add multiple parameters to prevent prepared statement conflicts
  const params = [
    'prepared_statements=false',
    'statement_cache_size=0',
    'connection_limit=1',
    'pool_timeout=0'
  ]

  // Add parameters if not already present
  params.forEach(param => {
    const [key] = param.split('=')
    if (!databaseUrl.includes(key)) {
      const separator = databaseUrl.includes('?') ? '&' : '?'
      databaseUrl = `${databaseUrl}${separator}${param}`
    }
  })

  console.log('🔧 Creating Prisma client with prepared statements disabled')

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  })
}

// In development, we want to prevent multiple instances
// In production, we want a single instance
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Enhanced cleanup for development hot reloading
if (process.env.NODE_ENV === 'development') {
  // Handle process termination
  const cleanup = async () => {
    try {
      await prisma.$disconnect()
      console.log('Prisma client disconnected')
    } catch (error) {
      console.error('Error disconnecting Prisma client:', error)
    }
  }

  process.on('beforeExit', cleanup)
  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)

  // Handle hot module replacement (if available)
  const moduleWithHot = module as unknown as { hot?: { dispose: (fn: () => void) => void } }
  if (typeof module !== 'undefined' && moduleWithHot.hot) {
    moduleWithHot.hot.dispose(cleanup)
  }
}
