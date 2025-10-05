import { NextResponse } from 'next/server'
import { testDatabaseConnection } from '@/lib/db-utils'

// GET /api/health/database - Test database connection and prepared statement handling
export async function GET() {
  try {
    console.log('🏥 Database health check requested')
    
    const startTime = Date.now()
    const isHealthy = await testDatabaseConnection()
    const duration = Date.now() - startTime
    
    if (isHealthy) {
      console.log(`✅ Database health check passed in ${duration}ms`)
      return NextResponse.json({
        status: 'healthy',
        message: 'Database connection is working properly',
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
        preparedStatements: 'disabled',
        connectionPool: 'active'
      })
    } else {
      console.log(`❌ Database health check failed in ${duration}ms`)
      return NextResponse.json({
        status: 'unhealthy',
        message: 'Database connection test failed',
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
        preparedStatements: 'disabled',
        connectionPool: 'error'
      }, { status: 503 })
    }
  } catch (error) {
    console.error('❌ Database health check error:', error)
    
    const errorObj = error as { message?: string; code?: string }
    return NextResponse.json({
      status: 'error',
      message: 'Database health check failed with error',
      error: errorObj.message || 'Unknown error',
      code: errorObj.code || 'UNKNOWN',
      timestamp: new Date().toISOString(),
      preparedStatements: 'disabled',
      connectionPool: 'error'
    }, { status: 500 })
  }
}
