import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  console.log('Testing database connection...')
  
  try {
    // Test 1: Basic connection
    const startTime = Date.now()
    const result = await prisma.$queryRaw`SELECT 1 as test`
    const connectionTime = Date.now() - startTime
    console.log(`✅ Basic connection test passed in ${connectionTime}ms`)

    // Test 2: Check if rooms table exists
    const tablesStart = Date.now()
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'rooms'
    ` as any[]
    const tablesTime = Date.now() - tablesStart
    console.log(`✅ Table check passed in ${tablesTime}ms, found: ${tables.length > 0 ? 'rooms table exists' : 'rooms table NOT found'}`)

    // Test 3: Try to count rooms
    const countStart = Date.now()
    const roomCount = await prisma.room.count()
    const countTime = Date.now() - countStart
    console.log(`✅ Room count test passed in ${countTime}ms, found ${roomCount} rooms`)

    // Test 4: Database URL info (masked)
    const dbUrl = process.env.DATABASE_URL || ''
    const urlInfo = {
      hasPooler: dbUrl.includes('pooler.supabase.com:6543'),
      hasDirect: dbUrl.includes('supabase.com:5432'),
      hasParams: dbUrl.includes('?'),
    }

    return NextResponse.json({
      success: true,
      tests: {
        basicConnection: { passed: true, timeMs: connectionTime },
        tableCheck: { passed: tables.length > 0, timeMs: tablesTime },
        roomCount: { passed: true, count: roomCount, timeMs: countTime },
      },
      urlInfo,
      totalTimeMs: Date.now() - startTime,
    })
  } catch (error: any) {
    console.error('❌ Database connection test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      hint: error.code === 'P2010' ? 'Database schema might not be migrated' : 
            error.code === 'P1001' ? 'Cannot connect to database' : 
            'Unknown database error',
    }, { status: 500 })
  }
}